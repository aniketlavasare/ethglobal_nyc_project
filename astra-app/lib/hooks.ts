'use client'

import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ASTRA_VAULT_ABI, 
  COMPANY_PAYOUT_ABI, 
  VAULT_REGISTRY_ABI,
  CONTRACT_ADDRESSES, 
  VALID_TAGS, 
  ValidTag 
} from './blockchain'

// Wallet connection hook
export function useWalletConnection() {
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
}

// Vault Registry interactions
export function useVaultRegistry() {
  const { address } = useAccount()
  const queryClient = useQueryClient()

  // Check if user has a vault in registry
  const { data: hasVault, isLoading: hasVaultLoading, refetch: refetchHasVault } = useReadContract({
    address: CONTRACT_ADDRESSES.VAULT_REGISTRY,
    abi: VAULT_REGISTRY_ABI,
    functionName: 'hasVault',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Get user's vault address
  const { data: userVaultAddress, isLoading: userVaultAddressLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.VAULT_REGISTRY,
    abi: VAULT_REGISTRY_ABI,
    functionName: 'getVaultForUser',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && hasVault,
    },
  })

  // Get all vaults count
  const { data: vaultCount, isLoading: vaultCountLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.VAULT_REGISTRY,
    abi: VAULT_REGISTRY_ABI,
    functionName: 'getVaultCount',
    query: {
      enabled: true,
    },
  })

  // Get all vault addresses
  const { data: allVaults, isLoading: allVaultsLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.VAULT_REGISTRY,
    abi: VAULT_REGISTRY_ABI,
    functionName: 'getAllVaults',
    query: {
      enabled: true,
    },
  })

  return {
    hasVault: hasVault as boolean,
    hasVaultLoading,
    refetchHasVault,
    userVaultAddress: userVaultAddress as string,
    userVaultAddressLoading,
    vaultCount: vaultCount as bigint,
    vaultCountLoading,
    allVaults: allVaults as `0x${string}`[],
    allVaultsLoading,
  }
}

// Astra Vault contract interactions
export function useAstraVault() {
  const { address } = useAccount()
  const { userVaultAddress, hasVault } = useVaultRegistry()
  const queryClient = useQueryClient()

  // Get user's tags from their vault
  const { data: userTags, isLoading: userTagsLoading, refetch: refetchUserTags } = useReadContract({
    address: userVaultAddress as `0x${string}`,
    abi: ASTRA_VAULT_ABI,
    functionName: 'getMyTags',
    args: [],
    query: {
      enabled: !!userVaultAddress && hasVault,
    },
  })

  // Create vault mutation
  const { writeContract: createVault, isPending: isCreatingVault } = useWriteContract()

  const createVaultMutation = useMutation({
    mutationFn: async (tags: string[]) => {
      if (!address) throw new Error('Wallet not connected')
      
      // Validate tags
      const validTags = tags.filter(tag => VALID_TAGS.includes(tag as ValidTag))
      if (validTags.length === 0) throw new Error('No valid tags provided')

      // Create vault on blockchain
      await createVault({
        address: CONTRACT_ADDRESSES.ASTRA_VAULT,
        abi: ASTRA_VAULT_ABI,
        functionName: 'createVault',
        args: [validTags],
      })

      return validTags
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultRegistry', address] })
      queryClient.invalidateQueries({ queryKey: ['userTags', address] })
    },
  })

  // Add tag mutation
  const { writeContract: addTag, isPending: isAddingTag } = useWriteContract()

  const addTagMutation = useMutation({
    mutationFn: async (tag: string) => {
      if (!address || !userVaultAddress) throw new Error('Wallet not connected or no vault')
      if (!VALID_TAGS.includes(tag as ValidTag)) throw new Error('Invalid tag')

      // Add tag on blockchain
      await addTag({
        address: userVaultAddress as `0x${string}`,
        abi: ASTRA_VAULT_ABI,
        functionName: 'addTag',
        args: [tag],
      })

      return tag
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTags', address] })
    },
  })

  // Remove tag mutation
  const { writeContract: removeTag, isPending: isRemovingTag } = useWriteContract()

  const removeTagMutation = useMutation({
    mutationFn: async (tag: string) => {
      if (!address || !userVaultAddress) throw new Error('Wallet not connected or no vault')

      // Remove tag on blockchain
      await removeTag({
        address: userVaultAddress as `0x${string}`,
        abi: ASTRA_VAULT_ABI,
        functionName: 'removeTag',
        args: [tag],
      })

      return tag
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTags', address] })
    },
  })

  // Clear vault mutation
  const { writeContract: clearVault, isPending: isClearingVault } = useWriteContract()

  const clearVaultMutation = useMutation({
    mutationFn: async () => {
      if (!address || !userVaultAddress) throw new Error('Wallet not connected or no vault')

      // Clear vault on blockchain
      await clearVault({
        address: userVaultAddress as `0x${string}`,
        abi: ASTRA_VAULT_ABI,
        functionName: 'clearVault',
        args: [],
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTags', address] })
    },
  })

  return {
    hasVault: hasVault as boolean,
    userVaultAddress: userVaultAddress as string,
    userTags: userTags as string[],
    userTagsLoading,
    refetchUserTags,
    createVault: createVaultMutation.mutate,
    isCreatingVault: isCreatingVault || createVaultMutation.isPending,
    addTag: addTagMutation.mutate,
    isAddingTag: isAddingTag || addTagMutation.isPending,
    removeTag: removeTagMutation.mutate,
    isRemovingTag: isRemovingTag || removeTagMutation.isPending,
    clearVault: clearVaultMutation.mutate,
    isClearingVault: isClearingVault || clearVaultMutation.isPending,
  }
}

// Company payout contract interactions
export function useCompanyPayout() {
  const { address } = useAccount()

  // Get pending rewards
  const { data: pendingRewards, isLoading: pendingRewardsLoading, refetch: refetchPendingRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.COMPANY_PAYOUT,
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
        address: CONTRACT_ADDRESSES.COMPANY_PAYOUT,
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
        address: CONTRACT_ADDRESSES.COMPANY_PAYOUT,
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
}

// Search users hook - now using blockchain data
export function useSearchUsers() {
  const { allVaults, allVaultsLoading } = useVaultRegistry()
  const queryClient = useQueryClient()

  // Get all users with vaults
  const { data: allUsers, isLoading: allUsersLoading } = useQuery({
    queryKey: ['allUsersWithVaults'],
    queryFn: async () => {
      if (!allVaults || allVaults.length === 0) return []
      
      // Get user addresses for all vaults
      const userPromises = allVaults.map(async (vaultAddress: `0x${string}`) => {
        const result = await fetch(`/api/blockchain/getUserForVault?vaultAddress=${vaultAddress}`)
        const data = await result.json()
        return data.userAddress
      })
      
      return Promise.all(userPromises)
    },
    enabled: !!allVaults && allVaults.length > 0,
  })

  // Search users by tags
  const searchUsersMutation = useMutation({
    mutationFn: async (tags: ValidTag[]) => {
      if (!allUsers || allUsers.length === 0) return []

      // Get tags for all users
      const userDataPromises = allUsers.map(async (userAddress: string) => {
        const result = await fetch(`/api/blockchain/getUserTags?userAddress=${userAddress}`)
        const data = await result.json()
        return {
          address: userAddress,
          tags: data.tags || []
        }
      })

      const userData = await Promise.all(userDataPromises)

      // Filter users by tags
      const matchingUsers = userData.filter((user) => {
        return tags.some(searchTag => user.tags.includes(searchTag))
      })

      // Calculate match scores
      const results = matchingUsers.map((user) => {
        const matchingTags = user.tags.filter((tag: string) => tags.includes(tag as ValidTag))
        const matchScore = matchingTags.length / tags.length
        return {
          address: user.address,
          tags: user.tags,
          matchScore
        }
      })

      // Sort by match score
      results.sort((a, b) => b.matchScore - a.matchScore)

      return results
    },
  })

  return {
    allUsers: allUsers as string[],
    allUsersLoading,
    searchUsers: searchUsersMutation.mutate,
    searchResults: searchUsersMutation.data,
    isSearching: searchUsersMutation.isPending,
    error: searchUsersMutation.error,
  }
}

// Blockchain data fetching utilities
export function useBlockchainData() {
  // Get user tags from blockchain
  const getUserTags = async (userAddress: string) => {
    const result = await fetch(`/api/blockchain/getUserTags?userAddress=${userAddress}`)
    const data = await result.json()
    return data.tags || []
  }

  // Get user for vault from blockchain
  const getUserForVault = async (vaultAddress: string) => {
    const result = await fetch(`/api/blockchain/getUserForVault?vaultAddress=${vaultAddress}`)
    const data = await result.json()
    return data.userAddress
  }

  // Get users by tags from blockchain
  const getUsersByTags = async (tags: string[]) => {
    const result = await fetch(`/api/blockchain/getUsersByTags?tags=${tags.join(',')}`)
    const data = await result.json()
    return data.users || []
  }

  return {
    getUserTags,
    getUserForVault,
    getUsersByTags,
  }
}
