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

// Default contract addresses (fallback)
export const DEFAULT_CONTRACT_ADDRESSES = {
  ASTRA_VAULT: '0xa7915a1C2399e21ed240dce95914931b22889cd9',
  COMPANY_PAYOUT: '0x138298574c415fe487bb11548deC8bf416698d9F',
} as const

// Valid tags that can be used in the vault
export const VALID_TAGS = [
  "crypto enthusiast", "defi user", "nft collector", "gaming", "travel lover", 
  "fashion conscious", "tech savvy", "fitness focused", "foodie", "music lover",
  "book reader", "creative", "entrepreneur", "student", "professional",
  "early adopter", "content creator", "community builder", "learner", "explorer"
] as const

export type ValidTag = typeof VALID_TAGS[number]

// Singleton pattern to prevent multiple config creation
let wagmiConfig: ReturnType<typeof createConfig> | null = null
let isInitializing = false

// Create Wagmi configuration only once
export function getWagmiConfig() {
  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    console.warn('Wagmi config is already being initialized, returning existing config')
    return wagmiConfig!
  }

  if (!wagmiConfig) {
    isInitializing = true
    
    try {
      wagmiConfig = createConfig({
        chains: [flowTestnet],
        connectors: [
          injected(),
          metaMask(),
          walletConnect({ 
            projectId: 'your-project-id', // Replace with your WalletConnect project ID
            showQrModal: false, // Disable QR modal to prevent conflicts
            metadata: {
              name: 'Astra Data Marketplace',
              description: 'Privacy-preserving data marketplace',
              url: 'https://astra-data.com',
              icons: ['https://astra-data.com/icon.png']
            }
          }),
        ],
        transports: {
          [flowTestnet.id]: http(),
        },
      })

      // Log initialization in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Wagmi config initialized successfully')
      }
    } catch (error) {
      console.error('Error initializing Wagmi config:', error)
      throw error
    } finally {
      isInitializing = false
    }
  }
  
  return wagmiConfig
}

// Reset function for development (useful for testing)
export function resetWagmiConfig() {
  if (process.env.NODE_ENV === 'development') {
    wagmiConfig = null
    isInitializing = false
    console.log('Wagmi config reset')
  }
}

// Contract ABIs - Updated to match the actual smart contracts
export const ASTRA_VAULT_ABI = [
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
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "string[]", "name": "tags", "type": "string[]"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "VaultCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "tag", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "TagAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "tag", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "TagRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "VaultCleared",
    "type": "event"
  }
] as const

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
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "company", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "tag", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "perUser", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "count", "type": "uint256"}
    ],
    "name": "AccessPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "RewardsClaimed",
    "type": "event"
  }
] as const

// Function to get contract address dynamically
export async function getContractAddress(contractType: 'ASTRA_VAULT' | 'COMPANY_PAYOUT'): Promise<string> {
  try {
    // In a real implementation, you might fetch this from a registry contract or API
    // For now, we'll use the default addresses
    return DEFAULT_CONTRACT_ADDRESSES[contractType]
  } catch (error) {
    console.error(`Error getting contract address for ${contractType}:`, error)
    return DEFAULT_CONTRACT_ADDRESSES[contractType]
  }
}

// Function to get user's vault address
export async function getUserVaultAddress(userAddress: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/vaults?action=get&userAddress=${userAddress}`)
    if (response.ok) {
      const data = await response.json()
      return data.vault?.vaultAddress || null
    }
    return null
  } catch (error) {
    console.error('Error getting user vault address:', error)
    return null
  }
}
