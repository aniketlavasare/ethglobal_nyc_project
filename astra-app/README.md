# ASTRA - Web3 Data Marketplace

Transform your digital footprint into profit with ASTRA, a Web3 platform where data ownership meets financial opportunity.

## Features

- **True Data Ownership**: Your data profile lives in your crypto wallet, controlled only by you
- **Granular Control**: Decide exactly what data goes into your vault with local analysis
- **Direct Monetization**: Earn FLOW tokens when companies access your pseudonymous data
- **Fair Pay-per-Use**: Companies pay only for the data they use with transparent smart contracts

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Blockchain**: Wagmi, Viem, Flow EVM Testnet
- **Smart Contracts**: Solidity (AstraVault, CompanyPayout)
- **Backend**: Next.js API Routes with local file storage

## Smart Contracts

### AstraVault.sol
- Allows users to create and manage their data vault
- Stores user tags on-chain with privacy controls
- Only the vault owner can modify their data

### CompanyAccessPayout.sol
- Handles payments from companies to users
- Distributes FLOW tokens to users whose data is accessed
- Transparent, automated payout system

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Deploy Smart Contracts

1. Deploy `AstraVault.sol` to Flow EVM Testnet
2. Deploy `CompanyAccessPayout.sol` to Flow EVM Testnet
3. Update contract addresses in `lib/blockchain.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  ASTRA_VAULT: '0x...', // Your deployed AstraVault address
  COMPANY_PAYOUT: '0x...', // Your deployed CompanyPayout address
} as const
```

### 3. Configure WalletConnect (Optional)

If you want to use WalletConnect, update the project ID in `lib/blockchain.ts`:

```typescript
walletConnect({ projectId: 'your-project-id' })
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### For Users (Sell Data)

1. **Connect Wallet**: Connect your MetaMask wallet to the platform
2. **Select Tags**: Choose behavioral tags that describe your interests
3. **Create Vault**: Sign a transaction to create your data vault on-chain
4. **Start Earning**: Earn FLOW tokens when companies query your data

### For Companies (Buy Data)

1. **Connect Wallet**: Connect your MetaMask wallet to access the marketplace
2. **Build Audience**: Select tags to define your target audience
3. **Execute Query**: Search for users matching your criteria
4. **Purchase Access**: Pay FLOW tokens to access user data
5. **Reward Users**: FLOW is automatically distributed to matching users

## API Endpoints

### `/api/users`

- `GET ?action=search&tags=tag1,tag2` - Search users by tags
- `GET ?action=get&address=0x...` - Get user data by address
- `GET ?action=list` - List all users (admin)
- `POST` - Create or update user data

## Data Storage

User data is stored locally in `data/users.json` for simplicity. In production, this should be replaced with a proper database.

## Valid Tags

The following tags are supported for user profiles:

- crypto enthusiast, defi user, nft collector, gaming, travel lover
- fashion conscious, tech savvy, fitness focused, foodie, music lover
- book reader, creative, entrepreneur, student, professional
- early adopter, content creator, community builder, learner, explorer

## Pricing

- **Cost per User**: 0.001 FLOW per user whose data is accessed
- **Payment**: FLOW tokens distributed directly to users
- **No Hidden Fees**: Transparent, pay-per-use model

## Development

### Project Structure

```
astra-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── buy-data/          # Company data purchase flow
│   └── sell-data/         # User data selling flow
├── components/            # React components
├── contracts/            # Smart contracts
├── lib/                  # Utilities and configuration
│   ├── blockchain.ts     # Blockchain configuration
│   ├── backend.ts        # Backend services
│   ├── hooks.ts          # Custom React hooks
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

### Key Files

- `lib/blockchain.ts` - Wagmi configuration and contract ABIs
- `lib/hooks.ts` - Custom hooks for blockchain interactions
- `lib/backend.ts` - Backend services for user data management
- `app/api/users/route.ts` - API endpoints for user operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue on GitHub.
