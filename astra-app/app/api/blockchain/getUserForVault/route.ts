import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { flowTestnet } from '@/lib/blockchain'
import { VAULT_REGISTRY_ABI, CONTRACT_ADDRESSES } from '@/lib/blockchain'

const client = createPublicClient({
  chain: flowTestnet,
  transport: http(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vaultAddress = searchParams.get('vaultAddress')

    if (!vaultAddress) {
      return NextResponse.json({ error: 'Vault address is required' }, { status: 400 })
    }

    // Get the user address for the vault
    const userAddress = await client.readContract({
      address: CONTRACT_ADDRESSES.VAULT_REGISTRY as `0x${string}`,
      abi: VAULT_REGISTRY_ABI,
      functionName: 'getUserForVault',
      args: [vaultAddress as `0x${string}`],
    })

    return NextResponse.json({ userAddress: userAddress || null })
  } catch (error) {
    console.error('Error getting user for vault:', error)
    return NextResponse.json({ error: 'Failed to get user for vault' }, { status: 500 })
  }
}
