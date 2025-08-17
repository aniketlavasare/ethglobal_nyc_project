import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Flow EVM Testnet configuration
export const flowTestnet = {
  id: 123,
  name: 'Flow EVM Testnet',
  network: 'flow-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: { http: ['https://testnet.flow.evm.flow.com'] },
    public: { http: ['https://testnet.flow.evm.flow.com'] },
  },
  blockExplorers: {
    default: { name: 'Flowscan', url: 'https://testnet.flowscan.org' },
  },
} as const

// Contract addresses (you'll need to update these after deployment)
export const CONTRACT_ADDRESSES = {
  VAULT_REGISTRY: '0x...', // Replace with actual deployed VaultRegistry address
  ASTRA_VAULT: '0x...', // Replace with actual deployed AstraVault address
  COMPANY_PAYOUT: '0x...', // Replace with actual deployed CompanyPayout address
} as const

// Valid tags that can be used in the vault
export const VALID_TAGS = [
  "crypto enthusiast", "defi user", "nft collector", "gaming", "travel lover", 
  "fashion conscious", "tech savvy", "fitness focused", "foodie", "music lover",
  "book reader", "creative", "entrepreneur", "student", "professional",
  "early adopter", "content creator", "community builder", "learner", "explorer"
] as const

export type ValidTag = typeof VALID_TAGS[number]

// Wagmi configuration
export const config = createConfig({
  chains: [flowTestnet],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId: 'your-project-id' }), // Replace with your WalletConnect project ID
  ],
  transports: {
    [flowTestnet.id]: http(),
  },
})

// Vault Registry ABI
export const VAULT_REGISTRY_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_astraVault", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "getAllVaults",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getVaultForUser",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "vaultAddress", "type": "address"}],
    "name": "getUserForVault",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "hasVault",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVaultCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "startIndex", "type": "uint256"},
      {"internalType": "uint256", "name": "endIndex", "type": "uint256"}
    ],
    "name": "getVaultsByRange",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Astra Vault ABI (updated with new functions)
export const ASTRA_VAULT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_vaultRegistry", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "string[]", "name": "tags", "type": "string[]"}],
    "name": "createVault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "tag", "type": "string"}],
    "name": "addTag",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "tag", "type": "string"}],
    "name": "removeTag",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "clearVault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyTags",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserTags",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "hasVault",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllUsersWithVaults",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string[]", "name": "searchTags", "type": "string[]"}],
    "name": "getUsersByTags",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Company Payout ABI (unchanged)
export const COMPANY_PAYOUT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "tag", "type": "string"},
      {"internalType": "address[]", "name": "users", "type": "address[]"}
    ],
    "name": "buyAccess",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "pendingRewards",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const
