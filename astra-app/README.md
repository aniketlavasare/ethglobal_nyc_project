# Astra - Decentralized Data Marketplace

A privacy-preserving, decentralized data marketplace built on Flow EVM Testnet that enables users to monetize their data while maintaining control over their privacy. Companies can purchase access to high-quality, verified audience data through transparent smart contracts.

## 🚀 Overview

Astra is a Web3 data marketplace where users create personal data vaults on the blockchain, tag themselves with behavioral categories, and earn FLOW tokens when companies purchase access to their data. The system ensures privacy by only revealing user addresses after payment is completed.

## 🏗️ Smart Contracts (Flow EVM Testnet)

**All contracts are deployed and verified on Flow EVM Testnet as proof of blockchain integration for the track.**

### Core Contracts:
- **AstraVaultUserOwned**: `0x5d319471c96346ca246cA1fd811B343C1b210b5E`
  - Individual user data vaults
  - Users create personal vaults with tags
  - Only vault owners can modify their data

- **CompanyPayoutMVP**: `0x9EF74276b83555fDddEc27e587f4d80303C0eAb0`
  - Handle data purchases and reward distribution
  - Automatically distributes FLOW tokens to users
  - Manages reward tracking and claiming

**Note**: Every user vault is an individual smart contract instance. Multiple contracts work together to create a complete data marketplace ecosystem.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Blockchain**: Wagmi, Viem, Flow EVM Testnet
- **Smart Contracts**: Solidity
- **Backend**: Next.js API Routes with local file storage

## 🎯 Features

### For Users (Data Sellers)
- Create personal vaults on the blockchain
- Add/remove behavioral and interest tags
- Earn FLOW tokens for data access
- Full control over their data

### For Companies (Data Buyers)
- Search users by behavioral tags
- Privacy-first: addresses hidden until payment
- Fair pricing: 0.001 FLOW per user
- Instant access after payment

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Configure MetaMask for Flow EVM Testnet**
   - Network Name: Flow EVM Testnet
   - RPC URL: `https://testnet.flow.evm.flow.com`
   - Chain ID: `123`
   - Currency Symbol: `FLOW`

## 📊 Data Structure

### Valid Tags (20 total)
- `crypto enthusiast`, `defi user`, `nft collector`, `gaming`, `travel lover`
- `fashion conscious`, `tech savvy`, `fitness focused`, `foodie`, `music lover`
- `book reader`, `creative`, `entrepreneur`, `student`, `professional`
- `early adopter`, `content creator`, `community builder`, `learner`, `explorer`

## 🔧 API Endpoints

- `GET /api/users?action=search&tags=tag1,tag2` - Search users by tags
- `GET /api/users?action=get&address=0x...` - Get user data
- `POST /api/users` - Create/update user data

## 💰 Pricing

- **Cost per User**: 0.001 FLOW
- **Payment**: FLOW tokens via smart contract
- **Distribution**: 100% goes to users whose data is accessed

## 🔗 Contract Addresses (Flow EVM Testnet)

```solidity
ASTRA_VAULT: 0x5d319471c96346ca246cA1fd811B343C1b210b5E
COMPANY_PAYOUT: 0x9EF74276b83555fDddEc27e587f4d80303C0eAb0
```

All contracts are verified on [Flowscan Testnet](https://testnet.flowscan.org).

## 🧪 Testing

The application includes mock mode for testing without deployed contracts:
```typescript
// In lib/blockchain.ts
export const MOCK_MODE = true // Set to false for production
```

## 🏆 Track Proof

This project demonstrates:
- ✅ Smart contract deployment on Flow EVM Testnet
- ✅ Multiple contract architecture
- ✅ User-owned data vaults (each vault is a contract)
- ✅ Decentralized data marketplace
- ✅ Privacy-preserving data access
- ✅ Token-based reward system
- ✅ Full-stack Web3 application

**All contracts are deployed, verified, and functional on Flow EVM Testnet.**
