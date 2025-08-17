'use client'

import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ASTRA_VAULT_ABI, COMPANY_PAYOUT_ABI, CONTRACT_ADDRESSES, VALID_TAGS, ValidTag } from './blockchain'

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

// Astra Vault contract interactions
export function useAstraVault() {
  const { address } = useAccount()
  const queryClient = useQueryClient()

  // Check if user has a vault
  const { data: hasVault, isLoading: hasVaultLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.ASTRA_VAULT,
    abi: ASTRA_VAULT_ABI,
    functionName: 'hasVault',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Get user's tags
  const { data: userTags, isLoading: userTagsLoading, refetch: refetchUserTags } = useQuery({
    queryKey: ['userTags', address],
    queryFn: async () => {
      if (!address) return []
      const result = await fetch(`/api/users?action=get&address=${address}`)
      const data = await result.json()
      return data.user?.tags || []
    },
    enabled: !!address,
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

      // Store user data in backend
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, tags: validTags }),
      })

      if (!response.ok) {
        throw new Error('Failed to store user data')
      }

      return validTags
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTags', address] })
    },
  })

  // Add tag mutation
  const { writeContract: addTag, isPending: isAddingTag } = useWriteContract()

  const addTagMutation = useMutation({
    mutationFn: async (tag: string) => {
      if (!address) throw new Error('Wallet not connected')
      if (!VALID_TAGS.includes(tag as ValidTag)) throw new Error('Invalid tag')

      // Add tag on blockchain
      await addTag({
        address: CONTRACT_ADDRESSES.ASTRA_VAULT,
        abi: ASTRA_VAULT_ABI,
        functionName: 'addTag',
        args: [tag],
      })

      // Update user data in backend
      const currentTags = userTags || []
      const newTags = [...currentTags, tag]
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, tags: newTags }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user data')
      }

      return newTags
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTags', address] })
    },
  })

  return {
    hasVault: hasVault as boolean,
    hasVaultLoading,
    userTags: userTags as ValidTag[],
    userTagsLoading,
    refetchUserTags,
    createVault: createVaultMutation.mutate,
    isCreatingVault: isCreatingVault || createVaultMutation.isPending,
    addTag: addTagMutation.mutate,
    isAddingTag: isAddingTag || addTagMutation.isPending,
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

// Search users hook
export function useSearchUsers() {
  const searchUsersMutation = useMutation({
    mutationFn: async (tags: ValidTag[]) => {
      const response = await fetch(`/api/users?action=search&tags=${tags.join(',')}`)
      if (!response.ok) {
        throw new Error('Failed to search users')
      }
      const data = await response.json()
      return data.results
    },
  })

  return {
    searchUsers: searchUsersMutation.mutate,
    searchResults: searchUsersMutation.data,
    isSearching: searchUsersMutation.isPending,
    error: searchUsersMutation.error,
  }
}
