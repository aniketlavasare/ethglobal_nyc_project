import { NextRequest, NextResponse } from 'next/server'
import { upsertUser, searchUsersByTags, getAllUsers, getUserByAddress } from '@/lib/backend'
import { VALID_TAGS, ValidTag } from '@/lib/blockchain'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const address = searchParams.get('address')
  const tags = searchParams.get('tags')

  try {
    switch (action) {
      case 'search':
        if (!tags) {
          return NextResponse.json({ error: 'Tags parameter is required for search' }, { status: 400 })
        }
        const searchTags = tags.split(',').filter(tag => VALID_TAGS.includes(tag as ValidTag)) as ValidTag[]
        const results = searchUsersByTags(searchTags)
        return NextResponse.json({ results })

      case 'get':
        if (!address) {
          return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 })
        }
        const user = getUserByAddress(address)
        return NextResponse.json({ user })

      case 'list':
        const users = getAllUsers()
        return NextResponse.json({ users })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, tags } = body

    if (!address || !tags || !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Address and tags array are required' }, { status: 400 })
    }

    const validTags = upsertUser(address, tags)
    return NextResponse.json({ success: true, tags: validTags })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
