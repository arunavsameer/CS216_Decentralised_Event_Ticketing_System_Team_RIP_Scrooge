# 🎟️ NFTickets — Decentralized Event Ticketing System

NFTickets is a cutting-edge decentralized ticketing platform built on Ethereum. Using NFTs and smart contracts, it ensures a secure, transparent, and tamper-proof ticketing experience — eliminating fraud and third-party intermediaries.

## 👨‍💻 Project Team

Team Name: RIP_Scrooge

| Name | Roll Number |
|------|------------|
| Arunav Sameer | 230001010 |
| Anmol Joshi | 230001007 |
| Arihant Jain | 230001009 |
| Tanishq Godha | 230001074 |

## 🚀 Features

### 🧾 Event Creation & Management
- Create Events with name, date, ticket price, max supply, and IPFS-hosted metadata
- Organizer Dashboard to manage all created events
- On-chain event contract deployment using smart contracts
![Screenshot 2025-04-30 004517](https://github.com/user-attachments/assets/d4d85276-95f3-4fcc-a67e-7409bda92ddf)

### 🎫 Ticketing System
- Buy NFT Tickets from event organizers
- Transfer Tickets between wallet addresses
- Marketplace Integration:
  - List owned tickets with custom prices and expiration dates
  - Cancel listings any time
  - Buy tickets from other users directly
 ![Screenshot 2025-04-30 004253](https://github.com/user-attachments/assets/512d639a-a8a0-4752-addc-f69e76a1ed59)
![Screenshot 2025-04-30 004314](https://github.com/user-attachments/assets/8774abfa-597f-4667-b8e5-f627d929b9c9)


### 👤 User Dashboard
- My Tickets: View and manage all owned tickets
- My Organized Events: Manage all your events
- Marketplace: Browse all active resale listings
![Screenshot 2025-04-30 004158](https://github.com/user-attachments/assets/0eb84021-15ee-4685-89d5-fbe777cb057b)


### 🔍 Browsing & Search
- Search Bar to find events by name or category
- Filter by Category or upcoming/past events

## 🌐 Tech Highlights
- MetaMask wallet integration
- IPFS for storing metadata and images
- Responsive, OpenSea-inspired UI built with React
- Real-time smart contract interaction via ethers.js

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, JavaScript, ethers.js |
| Blockchain | Solidity, Hardhat, OpenZeppelin |
| Metadata | IPFS for event info and banners |
| Wallet Support | MetaMask |
| Deployment | Hardhat, Sepolia (testnet) |

## 🛠️ Getting Started

### ✅ Prerequisites
- Node.js v16.x or later
- npm v8.x or later
- MetaMask extension
- Git

### 🔧 Project Setup
```bash
git clone https://github.com/arunavsameer/CS216_Decentralised_Event_Ticketing_System_Team_RIP_Scrooge.git
cd CS216_Decentralised_Event_Ticketing_System_Team_RIP_Scrooge
```

### Install Dependencies
```bash
# Install smart contract tools and frontend dependencies
npm install
cd frontend
npm install
```

### 📄 Environment Configuration
Create two .env files:

#### Root .env
```ini
SEPOLIA_RPC_URL="your_sepolia_rpc_url"
DEPLOYER_PRIVATE_KEY="your_private_key"
REACT_APP_FACTORY_ADDRESS=your_deployed_factory_address
REACT_APP_IPFS_PROJECT_ID=<YourInfuraProjectId>
REACT_APP_IPFS_PROJECT_SECRET=<YourInfuraProjectSecret>
```

#### Frontend .env
```ini
REACT_APP_FACTORY_ADDRESS=your_deployed_factory_address
REACT_APP_PINATA_KEY=your_pinata_key
REACT_APP_PINATA_SECRET=your_pinata_secret
```
Add SEPOLIA_RPC_URL only if you want to deploy on Sepolia Testnet

## 🔗 Blockchain Development Workflow

### 🧪 Run Tests
```bash
npx hardhat test
```

### 🚀 Deploy Contracts

#### Local Blockchain (for development)
```bash
npx hardhat node
npx hardhat run scripts/prev_script.js --network localhost
```


#### Deploy to Sepolia Testnet
```bash
npx hardhat run scripts/prev_script.js --network sepolia
```

-This will give you your REACT_APP_FACTORY_ADDRESS

After deployment, copy the contract address and paste it into your frontend .env.

### 🖥️ Running the Frontend
```bash
cd frontend
npm start
```

Visit the app at http://localhost:3000

## 🧠 Smart Contract Architecture

### EventFactory.sol
- `createEvent(name, date, price, supply, uri)`: Deploy a new Event contract
- `getAllEvents()`: Get all deployed events
- `getMyEvents()`: Get events created by current user

### Event.sol (ERC-721 Ticket Contract)
- `buyTicket()`: Mint an NFT ticket
- `transferTicket()`: Transfer ticket ownership
- `listTicket(tokenId, price, expiry)`: List ticket on the marketplace
- `cancelListing(tokenId)`: Remove listing
- `buyListedTicket(tokenId)`: Buy a listed ticket
- `getMyTickets()`: List tickets owned by user
- `withdraw()`: Organizer withdraws event proceeds


## 🔮 Future Enhancements
- Ticket verification via QR code
- WalletConnect & Coinbase Wallet support
- Native mobile app
- Fiat onramps for ticket purchase
- Real-time analytics dashboard
- Email & calendar integration
- On-chain ticket history viewer
