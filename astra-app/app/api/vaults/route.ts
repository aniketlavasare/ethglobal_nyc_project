import { NextRequest, NextResponse } from 'next/server'
import { 
  registerVault, 
  getVaultByUser, 
  getVaultByAddress, 
  updateVaultTags, 
  getAllActiveVaults, 
  searchVaultsByTags,
  deactivateVault,
  getVaultStats
} from '@/lib/vault-registry'
import { VALID_TAGS, ValidTag } from '@/lib/blockchain'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const userAddress = searchParams.get('userAddress')
  const vaultAddress = searchParams.get('vaultAddress')
  const tags = searchParams.get('tags')

  try {
    switch (action) {
      case 'get':
        if (userAddress) {
          const vault = getVaultByUser(userAddress)
          return NextResponse.json({ vault })
        } else if (vaultAddress) {
          const vault = getVaultByAddress(vaultAddress)
          return NextResponse.json({ vault })
        } else {
          return NextResponse.json({ error: 'Missing userAddress or vaultAddress' }, { status: 400 })
        }

      case 'search':
        if (!tags) {
          return NextResponse.json({ error: 'Missing tags parameter' }, { status: 400 })
        }
        const searchTags = tags.split(',').filter(tag => VALID_TAGS.includes(tag as ValidTag)) as ValidTag[]
        const results = searchVaultsByTags(searchTags)
        return NextResponse.json({ results })

      case 'all':
        const allVaults = getAllActiveVaults()
        return NextResponse.json({ vaults: allVaults })

      case 'stats':
        const stats = getVaultStats()
        return NextResponse.json({ stats })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Vault API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userAddress, vaultAddress, tags } = body

    switch (action) {
      case 'register':
        if (!userAddress || !vaultAddress || !tags) {
          return NextResponse.json({ 
            error: 'Missing required fields: userAddress, vaultAddress, tags' 
          }, { status: 400 })
        }

        // Validate tags
        const validTags = tags.filter((tag: string) => VALID_TAGS.includes(tag as ValidTag)) as ValidTag[]
        if (validTags.length === 0) {
          return NextResponse.json({ error: 'No valid tags provided' }, { status: 400 })
        }

        const vaultInfo = registerVault(userAddress, vaultAddress, validTags)
        return NextResponse.json({ vault: vaultInfo })

      case 'update':
        if (!userAddress || !tags) {
          return NextResponse.json({ 
            error: 'Missing required fields: userAddress, tags' 
          }, { status: 400 })
        }

        // Validate tags
        const updateValidTags = tags.filter((tag: string) => VALID_TAGS.includes(tag as ValidTag)) as ValidTag[]
        if (updateValidTags.length === 0) {
          return NextResponse.json({ error: 'No valid tags provided' }, { status: 400 })
        }

        const updatedVault = updateVaultTags(userAddress, updateValidTags)
        if (!updatedVault) {
          return NextResponse.json({ error: 'Vault not found' }, { status: 404 })
        }

        return NextResponse.json({ vault: updatedVault })

      case 'deactivate':
        if (!userAddress) {
          return NextResponse.json({ error: 'Missing userAddress' }, { status: 400 })
        }

        const success = deactivateVault(userAddress)
        if (!success) {
          return NextResponse.json({ error: 'Vault not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Vault API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
