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
  ASTRA_VAULT: '0xa7915a1C2399e21ed240dce95914931b22889cd9', // Replace with actual deployed address
  COMPANY_PAYOUT: '0x138298574c415fe487bb11548deC8bf416698d9F', // Replace with actual deployed address
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

// Contract ABIs
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
  }
] as const
