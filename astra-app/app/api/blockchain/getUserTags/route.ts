import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { flowTestnet } from '@/lib/blockchain'
import { ASTRA_VAULT_ABI, VAULT_REGISTRY_ABI, CONTRACT_ADDRESSES } from '@/lib/blockchain'

const client = createPublicClient({
  chain: flowTestnet,
  transport: http(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')

    if (!userAddress) {
      return NextResponse.json({ error: 'User address is required' }, { status: 400 })
    }

    // First, check if user has a vault in the registry
    const hasVault = await client.readContract({
      address: CONTRACT_ADDRESSES.VAULT_REGISTRY as `0x${string}`,
      abi: VAULT_REGISTRY_ABI,
      functionName: 'hasVault',
      args: [userAddress as `0x${string}`],
    })

    if (!hasVault) {
      return NextResponse.json({ tags: [] })
    }

    // Get the user's vault address
    const vaultAddress = await client.readContract({
      address: CONTRACT_ADDRESSES.VAULT_REGISTRY as `0x${string}`,
      abi: VAULT_REGISTRY_ABI,
      functionName: 'getVaultForUser',
      args: [userAddress as `0x${string}`],
    })

    if (!vaultAddress || vaultAddress === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json({ tags: [] })
    }

    // Get tags from the user's vault
    const tags = await client.readContract({
      address: vaultAddress as `0x${string}`,
      abi: ASTRA_VAULT_ABI,
      functionName: 'getUserTags',
      args: [userAddress as `0x${string}`],
    })

    return NextResponse.json({ tags: tags || [] })
  } catch (error) {
    console.error('Error getting user tags:', error)
    return NextResponse.json({ error: 'Failed to get user tags' }, { status: 500 })
  }
}
