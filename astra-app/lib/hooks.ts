'use client'

import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ASTRA_VAULT_ABI, COMPANY_PAYOUT_ABI, DEFAULT_CONTRACT_ADDRESSES, VALID_TAGS, ValidTag, getContractAddress, getUserVaultAddress } from './blockchain'
import { VaultInfo } from './vault-registry'

// Wallet connection hook
export function useWalletConnection() {
  try {
    const { address, isConnected } = useAccount()
    const { connect, connectors, isPending } = useConnect()
    const { disconnect } = useDisconnect()

    return {
      address,
      isConnected,
      connect,
      connectors,
      isPending,
      disconnect
    }
  } catch (error) {
    console.error('Error in useWalletConnection:', error)
    return {
      address: undefined,
      isConnected: false,
      connect: () => {},
      connectors: [],
      isPending: false,
      disconnect: () => {}
    }
  }
}

// Astra Vault contract interactions with dynamic contract addresses
export function useAstraVault() {
  try {
    const { address } = useAccount()
    const queryClient = useQueryClient()

    // Get user's vault info from registry
    const { data: vaultInfo, isLoading: vaultInfoLoading, refetch: refetchVaultInfo } = useQuery({
      queryKey: ['vaultInfo', address],
      queryFn: async () => {
        if (!address) return null
        const response = await fetch(`/api/vaults?action=get&userAddress=${address}`)
        if (response.ok) {
          const data = await response.json()
          return data.vault as VaultInfo | null
        }
        return null
      },
      enabled: !!address,
    })

    // Check if user has a vault on blockchain
    const { data: hasVaultOnChain, isLoading: hasVaultOnChainLoading } = useReadContract({
      address: vaultInfo?.vaultAddress || DEFAULT_CONTRACT_ADDRESSES.ASTRA_VAULT,
      abi: ASTRA_VAULT_ABI,
      functionName: 'hasVault',
      args: address ? [address] : undefined,
      query: {
        enabled: !!address && !!vaultInfo?.vaultAddress,
      },
    })

    // Get user's tags from blockchain
    const { data: userTagsFromChain, isLoading: userTagsFromChainLoading, refetch: refetchUserTagsFromChain } = useReadContract({
      address: vaultInfo?.vaultAddress || DEFAULT_CONTRACT_ADDRESSES.ASTRA_VAULT,
      abi: ASTRA_VAULT_ABI,
      functionName: 'getMyTags',
      query: {
        enabled: !!address && !!vaultInfo?.vaultAddress,
      },
    })

    // Create vault mutation
    const { writeContract: createVaultContract, isPending: isCreatingVaultContract } = useWriteContract()

    const createVaultMutation = useMutation({
      mutationFn: async (tags: ValidTag[]) => {
        if (!address) throw new Error('Wallet not connected')
        
        // Validate tags
        if (tags.length === 0) throw new Error('No tags provided')
        if (tags.length > 10) throw new Error('Too many tags (max 10)')

        // For now, we'll use the default contract address
        // In a real implementation, you might deploy a new contract per user or use a factory
        const contractAddress = await getContractAddress('ASTRA_VAULT')
        
        // Create vault on blockchain
        await createVaultContract({
          address: contractAddress,
          abi: ASTRA_VAULT_ABI,
          functionName: 'createVault',
          args: [tags],
        })

        // Register vault in our registry
        const response = await fetch('/api/vaults', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'register',
            userAddress: address,
            vaultAddress: contractAddress, // For now, using the same contract
            tags 
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to register vault')
        }

        return tags
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['vaultInfo', address] })
        refetchVaultInfo()
      },
    })

    // Add tag mutation
    const { writeContract: addTagContract, isPending: isAddingTagContract } = useWriteContract()

    const addTagMutation = useMutation({
      mutationFn: async (tag: ValidTag) => {
        if (!address || !vaultInfo?.vaultAddress) throw new Error('Wallet not connected or no vault')
        if (!VALID_TAGS.includes(tag)) throw new Error('Invalid tag')

        // Add tag on blockchain
        await addTagContract({
          address: vaultInfo.vaultAddress,
          abi: ASTRA_VAULT_ABI,
          functionName: 'addTag',
          args: [tag],
        })

        // Update vault info in registry
        const currentTags = userTagsFromChain || []
        const newTags = [...currentTags, tag]
        
        const response = await fetch('/api/vaults', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'update',
            userAddress: address,
            tags: newTags 
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update vault info')
        }

        return newTags
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['vaultInfo', address] })
        refetchUserTagsFromChain()
      },
    })

    // Remove tag mutation
    const { writeContract: removeTagContract, isPending: isRemovingTagContract } = useWriteContract()

    const removeTagMutation = useMutation({
      mutationFn: async (tag: ValidTag) => {
        if (!address || !vaultInfo?.vaultAddress) throw new Error('Wallet not connected or no vault')

        // Remove tag on blockchain
        await removeTagContract({
          address: vaultInfo.vaultAddress,
          abi: ASTRA_VAULT_ABI,
          functionName: 'removeTag',
          args: [tag],
        })

        // Update vault info in registry
        const currentTags = userTagsFromChain || []
        const newTags = currentTags.filter(t => t !== tag)
        
        const response = await fetch('/api/vaults', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'update',
            userAddress: address,
            tags: newTags 
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update vault info')
        }

        return newTags
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['vaultInfo', address] })
        refetchUserTagsFromChain()
      },
    })

    return {
      // Vault info from registry
      vaultInfo,
      vaultInfoLoading,
      refetchVaultInfo,
      
      // Blockchain state
      hasVault: hasVaultOnChain as boolean,
      hasVaultLoading: hasVaultOnChainLoading,
      userTags: userTagsFromChain as string[],
      userTagsLoading: userTagsFromChainLoading,
      refetchUserTagsFromChain,
      
      // Mutations
      createVault: createVaultMutation.mutate,
      isCreatingVault: isCreatingVaultContract || createVaultMutation.isPending,
      addTag: addTagMutation.mutate,
      isAddingTag: isAddingTagContract || addTagMutation.isPending,
      removeTag: removeTagMutation.mutate,
      isRemovingTag: isRemovingTagContract || removeTagMutation.isPending,
    }
  } catch (error) {
    console.error('Error in useAstraVault:', error)
    return {
      vaultInfo: null,
      vaultInfoLoading: false,
      refetchVaultInfo: () => {},
      hasVault: false,
      hasVaultLoading: false,
      userTags: [],
      userTagsLoading: false,
      refetchUserTagsFromChain: () => {},
      createVault: () => {},
      isCreatingVault: false,
      addTag: () => {},
      isAddingTag: false,
      removeTag: () => {},
      isRemovingTag: false,
    }
  }
}

// Company payout contract interactions
export function useCompanyPayout() {
  try {
    const { address } = useAccount()

    // Get pending rewards
    const { data: pendingRewards, isLoading: pendingRewardsLoading, refetch: refetchPendingRewards } = useReadContract({
      address: DEFAULT_CONTRACT_ADDRESSES.COMPANY_PAYOUT,
      abi: COMPANY_PAYOUT_ABI,
      functionName: 'pendingRewards',
      args: address ? [address] : undefined,
      query: {
        enabled: !!address,
      },
    })

    // Claim rewards mutation
    const { writeContract: claimRewards, isPending: isClaimingRewards } = useWriteContract()

    const claimRewardsMutation = useMutation({
      mutationFn: async () => {
        if (!address) throw new Error('Wallet not connected')
        
        await claimRewards({
          address: DEFAULT_CONTRACT_ADDRESSES.COMPANY_PAYOUT,
          abi: COMPANY_PAYOUT_ABI,
          functionName: 'claimRewards',
        })
      },
      onSuccess: () => {
        refetchPendingRewards()
      },
    })

    // Buy access mutation
    const { writeContract: buyAccess, isPending: isBuyingAccess } = useWriteContract()

    const buyAccessMutation = useMutation({
      mutationFn: async ({ tag, users, value }: { tag: string; users: string[]; value: bigint }) => {
        await buyAccess({
          address: DEFAULT_CONTRACT_ADDRESSES.COMPANY_PAYOUT,
          abi: COMPANY_PAYOUT_ABI,
          functionName: 'buyAccess',
          args: [tag, users],
          value,
        })
      },
    })

    return {
      pendingRewards: pendingRewards as bigint,
      pendingRewardsLoading,
      refetchPendingRewards,
      claimRewards: claimRewardsMutation.mutate,
      isClaimingRewards: isClaimingRewards || claimRewardsMutation.isPending,
      buyAccess: buyAccessMutation.mutate,
      isBuyingAccess: isBuyingAccess || buyAccessMutation.isPending,
    }
  } catch (error) {
    console.error('Error in useCompanyPayout:', error)
    return {
      pendingRewards: 0n,
      pendingRewardsLoading: false,
      refetchPendingRewards: () => {},
      claimRewards: () => {},
      isClaimingRewards: false,
      buyAccess: () => {},
      isBuyingAccess: false,
    }
  }
}

// Search users hook - now uses vault registry
export function useSearchUsers() {
  try {
    const searchUsersMutation = useMutation({
      mutationFn: async (tags: ValidTag[]) => {
        const response = await fetch(`/api/vaults?action=search&tags=${tags.join(',')}`)
        if (!response.ok) {
          throw new Error('Failed to search vaults')
        }
        const data = await response.json()
        return data.results as VaultInfo[]
      },
    })

    return {
      searchUsers: searchUsersMutation.mutate,
      searchResults: searchUsersMutation.data,
      isSearching: searchUsersMutation.isPending,
      error: searchUsersMutation.error,
    }
  } catch (error) {
    console.error('Error in useSearchUsers:', error)
    return {
      searchUsers: () => {},
      searchResults: [],
      isSearching: false,
      error: null,
    }
  }
}

// Vault registry hook for admin/overview purposes
export function useVaultRegistry() {
  try {
    const { data: allVaults, isLoading: allVaultsLoading, refetch: refetchAllVaults } = useQuery({
      queryKey: ['allVaults'],
      queryFn: async () => {
        const response = await fetch('/api/vaults?action=all')
        if (response.ok) {
          const data = await response.json()
          return data.vaults as VaultInfo[]
        }
        return []
      },
    })

    const { data: vaultStats, isLoading: vaultStatsLoading } = useQuery({
      queryKey: ['vaultStats'],
      queryFn: async () => {
        const response = await fetch('/api/vaults?action=stats')
        if (response.ok) {
          const data = await response.json()
          return data.stats
        }
        return null
      },
    })

    return {
      allVaults,
      allVaultsLoading,
      refetchAllVaults,
      vaultStats,
      vaultStatsLoading,
    }
  } catch (error) {
    console.error('Error in useVaultRegistry:', error)
    return {
      allVaults: [],
      allVaultsLoading: false,
      refetchAllVaults: () => {},
      vaultStats: null,
      vaultStatsLoading: false,
    }
  }
}
