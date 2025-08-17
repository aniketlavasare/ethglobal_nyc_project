import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { VALID_TAGS, ValidTag } from './blockchain'

// Local storage for user data (in production, this would be a database)
const DATA_FILE = join(process.cwd(), 'data', 'users.json')

interface UserData {
  address: string
  tags: ValidTag[]
  createdAt: number
  lastUpdated: number
}

interface SearchResult {
  address: string
  tags: ValidTag[]
  matchScore: number
}

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data')
  if (!existsSync(dataDir)) {
    const fs = require('fs')
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load users from local file
function loadUsers(): UserData[] {
  ensureDataDir()
  if (!existsSync(DATA_FILE)) {
    return []
  }
  try {
    const data = readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading users:', error)
    return []
  }
}

// Save users to local file
function saveUsers(users: UserData[]) {
  ensureDataDir()
  try {
    writeFileSync(DATA_FILE, JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error saving users:', error)
  }
}

// Add or update user data
export function upsertUser(address: string, tags: string[]) {
  const users = loadUsers()
  
  // Validate tags
  const validTags = tags.filter(tag => VALID_TAGS.includes(tag as ValidTag)) as ValidTag[]
  
  const existingUserIndex = users.findIndex(user => user.address.toLowerCase() === address.toLowerCase())
  
  if (existingUserIndex >= 0) {
    // Update existing user
    users[existingUserIndex] = {
      ...users[existingUserIndex],
      tags: validTags,
      lastUpdated: Date.now()
    }
  } else {
    // Add new user
    users.push({
      address: address.toLowerCase(),
      tags: validTags,
      createdAt: Date.now(),
      lastUpdated: Date.now()
    })
  }
  
  saveUsers(users)
  return validTags
}

// Search users by tags
export function searchUsersByTags(searchTags: ValidTag[]): SearchResult[] {
  const users = loadUsers()
  const results: SearchResult[] = []
  
  for (const user of users) {
    const matchingTags = user.tags.filter(tag => searchTags.includes(tag))
    if (matchingTags.length > 0) {
      const matchScore = matchingTags.length / searchTags.length
      results.push({
        address: user.address,
        tags: user.tags,
        matchScore
      })
    }
  }
  
  // Sort by match score (highest first)
  return results.sort((a, b) => b.matchScore - a.matchScore)
}

// Get all users (for admin purposes)
export function getAllUsers(): UserData[] {
  return loadUsers()
}

// Get user by address
export function getUserByAddress(address: string): UserData | null {
  const users = loadUsers()
  return users.find(user => user.address.toLowerCase() === address.toLowerCase()) || null
}

// Remove user (for testing purposes)
export function removeUser(address: string) {
  const users = loadUsers()
  const filteredUsers = users.filter(user => user.address.toLowerCase() !== address.toLowerCase())
  saveUsers(filteredUsers)
}
