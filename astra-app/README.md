# ASTRA - Blockchain Data Marketplace

A decentralized data marketplace built on Flow EVM Testnet that allows users to monetize their data while maintaining privacy, and companies to access high-quality audience data through fair, pay-per-use smart contracts.

## 🚀 Features

### For Users (Data Sellers)
- **Secure Data Vaults**: Create personal data vaults on the blockchain
- **Tag-Based Profiles**: Define yourself with up to 10 behavioral/interest tags
- **Privacy-Preserving**: Your data never leaves your device, only tags are stored
- **Automatic Earnings**: Earn FLOW tokens when companies query your data
- **Vault Management**: Edit, update, and manage your data profile
- **Real-time Rewards**: View and claim pending earnings instantly

### For Companies (Data Buyers)
- **Audience Targeting**: Search for users based on behavioral tags
- **Pay-Per-Use Model**: Pay only for the data you access (0.001 FLOW per user)
- **Smart Contract Payments**: Automated, transparent payment distribution
- **Quality Data**: Access verified, on-chain user profiles
- **Real-time Results**: Get instant access to matching user addresses

## 🏗️ Architecture

### Smart Contracts

#### 1. VaultRegistry (`VaultRegistry.sol`)
- **Purpose**: Central registry for all user vaults
- **Key Functions**:
  - `registerVault(user, vaultAddress)`: Register new vaults
  - `getAllVaults()`: Get all registered vault addresses
  - `getVaultForUser(user)`: Get vault address for a user
  - `getUserForVault(vaultAddress)`: Get user address for a vault
  - `hasVault(user)`: Check if user has a registered vault

#### 2. AstraVault (`AstraVault.sol`)
- **Purpose**: Individual user data vaults
- **Key Functions**:
  - `createVault(tags[])`: Create vault with initial tags
  - `addTag(tag)`: Add new tag to existing vault
  - `removeTag(tag)`: Remove tag from vault
  - `clearVault()`: Clear all tags (vault remains)
  - `getMyTags()`: Get user's own tags
  - `getUserTags(user)`: Get any user's public tags
  - `getUsersByTags(searchTags[])`: Search users by tags

#### 3. CompanyPayout (`CompanyAccessPayout.sol`)
- **Purpose**: Handle payments and rewards
- **Key Functions**:
  - `buyAccess(tag, users[], value)`: Purchase access to user data
  - `claimRewards()`: Claim pending FLOW rewards
  - `pendingRewards(address)`: Check pending rewards for user

### Frontend Architecture

#### Blockchain Integration (`lib/hooks.ts`)
- **useWalletConnection()**: MetaMask wallet connection
- **useVaultRegistry()**: Vault registry interactions
- **useAstraVault()**: Individual vault management
- **useCompanyPayout()**: Payment and reward handling
- **useSearchUsers()**: User search functionality
- **useBlockchainData()**: Blockchain data fetching utilities

#### API Routes (`app/api/blockchain/`)
- **getUserTags**: Get user tags from blockchain
- **getUserForVault**: Get user address for vault
- **getUsersByTags**: Search users by tags

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Blockchain**: Flow EVM Testnet, Wagmi, Viem
- **Smart Contracts**: Solidity 0.8.24
- **State Management**: React Query (TanStack Query)
- **Wallet Integration**: MetaMask, WalletConnect

## 📋 Prerequisites

- Node.js 18+ 
- MetaMask browser extension
- Flow EVM Testnet FLOW tokens for gas fees

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd astra-app
npm install
```

### 2. Deploy Smart Contracts

#### Deploy VaultRegistry
```bash
# Deploy VaultRegistry first
npx hardhat deploy --contract VaultRegistry
```

#### Deploy AstraVault
```bash
# Deploy AstraVault with VaultRegistry address
npx hardhat deploy --contract AstraVault --args <VAULT_REGISTRY_ADDRESS>
```

#### Deploy CompanyPayout
```bash
# Deploy CompanyPayout
npx hardhat deploy --contract CompanyPayout
```

### 3. Update Contract Addresses
Update the contract addresses in `lib/blockchain.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  VAULT_REGISTRY: '0x...', // Your deployed VaultRegistry address
  ASTRA_VAULT: '0x...', // Your deployed AstraVault address
  COMPANY_PAYOUT: '0x...', // Your deployed CompanyPayout address
} as const
```

### 4. Configure WalletConnect (Optional)
Update the WalletConnect project ID in `lib/blockchain.ts`:
```typescript
walletConnect({ projectId: 'your-project-id' })
```

### 5. Start Development Server
```bash
npm run dev
```

## 📖 Usage Guide

### For Users (Sell Data)

1. **Connect Wallet**
   - Visit `/sell-data`
   - Connect MetaMask wallet
   - Ensure you have FLOW tokens for gas fees

2. **Create Data Vault**
   - Select up to 10 tags that describe you
   - Sign transaction to create vault on blockchain
   - Vault is automatically registered in VaultRegistry

3. **Manage Profile**
   - View existing tags
   - Edit tags to improve your profile
   - Update vault with new tags

4. **Earn Rewards**
   - View pending FLOW earnings
   - Claim rewards when companies access your data
   - Monitor your earnings dashboard

### For Companies (Buy Data)

1. **Connect Wallet**
   - Visit `/buy-data`
   - Connect MetaMask wallet
   - Ensure you have FLOW tokens for payments

2. **Define Target Audience**
   - Select behavioral/interest tags
   - Define your ideal customer profile
   - Preview search cost (0.001 FLOW per matching user)

3. **Execute Query**
   - Search for users matching your criteria
   - Review matching users and their tags
   - Confirm payment amount

4. **Purchase Access**
   - Pay FLOW tokens to access user data
   - FLOW is automatically distributed to users
   - Receive list of matching user addresses

## 🔧 Configuration

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_FLOW_TESTNET_RPC=https://testnet.flow.evm.flow.com
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id
```

### Network Configuration
The app is configured for Flow EVM Testnet by default. To change networks, update `lib/blockchain.ts`.

## 📊 Data Flow

### User Data Flow
1. User connects wallet
2. User selects tags and creates vault
3. Vault is registered in VaultRegistry
4. User can edit tags and manage profile
5. User earns FLOW when companies query their data

### Company Data Flow
1. Company connects wallet
2. Company selects target tags
3. System searches blockchain for matching users
4. Company pays FLOW for access
5. FLOW is distributed to matching users
6. Company receives user addresses

## 🔒 Security Features

- **Privacy-Preserving**: Only tags are stored on-chain, not personal data
- **User Control**: Users own their vaults and can modify tags anytime
- **Transparent Payments**: All payments handled by smart contracts
- **No Data Leakage**: User addresses only shared after payment
- **Immutable Records**: All transactions recorded on blockchain

## 🧪 Testing

### Smart Contract Testing
```bash
npx hardhat test
```

### Frontend Testing
```bash
npm run test
```

### E2E Testing
```bash
npm run test:e2e
```

## 📈 Valid Tags

The system supports the following predefined tags:
- crypto enthusiast, defi user, nft collector, gaming
- travel lover, fashion conscious, tech savvy
- fitness focused, foodie, music lover
- book reader, creative, entrepreneur
- student, professional, early adopter
- content creator, community builder, learner, explorer

## 💰 Pricing Model

- **Cost per User**: 0.001 FLOW
- **Payment Distribution**: 100% to users whose data is accessed
- **Gas Fees**: User pays for vault creation/updates
- **Company Fees**: Company pays for data access

## 🚧 Development Notes

### Contract Deployment Order
1. Deploy VaultRegistry
2. Deploy AstraVault (with VaultRegistry address)
3. Deploy CompanyPayout
4. Update frontend contract addresses

### Important Considerations
- VaultRegistry is the central authority for vault management
- Each user can only have one vault
- Tags are limited to 10 per user
- All blockchain data is fetched in real-time
- No local caching of sensitive user data

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create GitHub issue
- Check documentation
- Review smart contract code
- Test with Flow EVM Testnet first

---

**Note**: This is a testnet implementation. For production use, deploy to Flow mainnet and implement additional security measures.
