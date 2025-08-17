import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { flowTestnet } from '@/lib/blockchain'
import { ASTRA_VAULT_ABI, CONTRACT_ADDRESSES } from '@/lib/blockchain'

const client = createPublicClient({
  chain: flowTestnet,
  transport: http(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tagsParam = searchParams.get('tags')

    if (!tagsParam) {
      return NextResponse.json({ error: 'Tags parameter is required' }, { status: 400 })
    }

    const tags = tagsParam.split(',').filter(tag => tag.trim() !== '')

    if (tags.length === 0) {
      return NextResponse.json({ users: [] })
    }

    // Get users by tags from the AstraVault contract
    const users = await client.readContract({
      address: CONTRACT_ADDRESSES.ASTRA_VAULT as `0x${string}`,
      abi: ASTRA_VAULT_ABI,
      functionName: 'getUsersByTags',
      args: [tags],
    })

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Error getting users by tags:', error)
    return NextResponse.json({ error: 'Failed to get users by tags' }, { status: 500 })
  }
}
