import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

// Local storage for vault registry (in production, this would be a database)
const VAULT_REGISTRY_FILE = join(process.cwd(), 'data', 'vault-registry.json')

export interface VaultInfo {
  userAddress: string
  vaultAddress: string
  tags: string[]
  createdAt: number
  lastUpdated: number
  isActive: boolean
}

export interface VaultRegistry {
  vaults: VaultInfo[]
  lastUpdated: number
}

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data')
  if (!existsSync(dataDir)) {
    const fs = require('fs')
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load vault registry from local file
function loadVaultRegistry(): VaultRegistry {
  ensureDataDir()
  if (!existsSync(VAULT_REGISTRY_FILE)) {
    return {
      vaults: [],
      lastUpdated: Date.now()
    }
  }
  try {
    const data = readFileSync(VAULT_REGISTRY_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading vault registry:', error)
    return {
      vaults: [],
      lastUpdated: Date.now()
    }
  }
}

// Save vault registry to local file
function saveVaultRegistry(registry: VaultRegistry) {
  ensureDataDir()
  try {
    writeFileSync(VAULT_REGISTRY_FILE, JSON.stringify(registry, null, 2))
  } catch (error) {
    console.error('Error saving vault registry:', error)
  }
}

// Register a new vault
export function registerVault(userAddress: string, vaultAddress: string, tags: string[]): VaultInfo {
  const registry = loadVaultRegistry()
  
  // Check if user already has a vault
  const existingVaultIndex = registry.vaults.findIndex(
    vault => vault.userAddress.toLowerCase() === userAddress.toLowerCase()
  )
  
  const vaultInfo: VaultInfo = {
    userAddress: userAddress.toLowerCase(),
    vaultAddress: vaultAddress.toLowerCase(),
    tags,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    isActive: true
  }
  
  if (existingVaultIndex >= 0) {
    // Update existing vault
    registry.vaults[existingVaultIndex] = vaultInfo
  } else {
    // Add new vault
    registry.vaults.push(vaultInfo)
  }
  
  registry.lastUpdated = Date.now()
  saveVaultRegistry(registry)
  
  return vaultInfo
}

// Get vault by user address
export function getVaultByUser(userAddress: string): VaultInfo | null {
  const registry = loadVaultRegistry()
  return registry.vaults.find(
    vault => vault.userAddress.toLowerCase() === userAddress.toLowerCase() && vault.isActive
  ) || null
}

// Get vault by vault address
export function getVaultByAddress(vaultAddress: string): VaultInfo | null {
  const registry = loadVaultRegistry()
  return registry.vaults.find(
    vault => vault.vaultAddress.toLowerCase() === vaultAddress.toLowerCase() && vault.isActive
  ) || null
}

// Update vault tags
export function updateVaultTags(userAddress: string, tags: string[]): VaultInfo | null {
  const registry = loadVaultRegistry()
  const vaultIndex = registry.vaults.findIndex(
    vault => vault.userAddress.toLowerCase() === userAddress.toLowerCase() && vault.isActive
  )
  
  if (vaultIndex === -1) return null
  
  registry.vaults[vaultIndex].tags = tags
  registry.vaults[vaultIndex].lastUpdated = Date.now()
  registry.lastUpdated = Date.now()
  
  saveVaultRegistry(registry)
  return registry.vaults[vaultIndex]
}

// Get all active vaults
export function getAllActiveVaults(): VaultInfo[] {
  const registry = loadVaultRegistry()
  return registry.vaults.filter(vault => vault.isActive)
}

// Search vaults by tags
export function searchVaultsByTags(searchTags: string[]): VaultInfo[] {
  const registry = loadVaultRegistry()
  const activeVaults = registry.vaults.filter(vault => vault.isActive)
  
  return activeVaults.filter(vault => {
    const matchingTags = vault.tags.filter(tag => searchTags.includes(tag))
    return matchingTags.length > 0
  })
}

// Deactivate vault (soft delete)
export function deactivateVault(userAddress: string): boolean {
  const registry = loadVaultRegistry()
  const vaultIndex = registry.vaults.findIndex(
    vault => vault.userAddress.toLowerCase() === userAddress.toLowerCase() && vault.isActive
  )
  
  if (vaultIndex === -1) return false
  
  registry.vaults[vaultIndex].isActive = false
  registry.vaults[vaultIndex].lastUpdated = Date.now()
  registry.lastUpdated = Date.now()
  
  saveVaultRegistry(registry)
  return true
}

// Get vault statistics
export function getVaultStats() {
  const registry = loadVaultRegistry()
  const activeVaults = registry.vaults.filter(vault => vault.isActive)
  
  return {
    totalVaults: registry.vaults.length,
    activeVaults: activeVaults.length,
    inactiveVaults: registry.vaults.length - activeVaults.length,
    lastUpdated: registry.lastUpdated
  }
}
