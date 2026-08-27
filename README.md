# Monad Market Sim

Stock market simulator for Monad Blitz hackathon. Built with Foundry (Solidity) + Next.js (React) + wagmi/viem.

## Architecture

```
monad-market-sim/
├── /contracts     # Foundry Solidity project
│   ├── contracts/
│   │   ├── PlayMoney.sol     # ERC20 SimUSD (SUSD)
│   │   └── StockAMM.sol      # Bonding curve AMM for 5 stocks
│   ├── test/
│   │   └── StockAMM.t.sol    # Foundry tests
│   ├── script/               # Deployment scripts
│   └── foundry.toml          # Monad testnet config
└── /app           # Next.js frontend
    ├── app/       # App Router pages
    ├── components/# React components
    ├── lib/       # wagmi config, contracts, utils
    └── public/
```

## Smart Contracts

### PlayMoney.sol
- ERC20 token: "SimUSD" (SUSD), 18 decimals
- `claimStarterFunds()`: Mints 100,000 SUSD to caller (once per address)
- `hasClaimed` mapping tracks claims

### StockAMM.sol
- 5 hardcoded stocks: MNDX, CHAI, VIBE, GRIT, TECH
- Constant-product bonding curve per stock: `cashReserve × shareReserve = k`
- `buy(stockId, cashAmount)`: Spend SUSD, receive shares, price increases
- `sell(stockId, shareAmount)`: Spend shares, receive SUSD, price decreases
- `getPrice(stockId)`: Returns spot price (SUSD per share, scaled 1e18)
- `Trade` event emitted on every trade for live chart updates

## Frontend Features

- **Wallet Connection**: MetaMask via wagmi
- **Onboarding**: Claim 100k SUSD starter funds
- **Dashboard**: Live price charts (Recharts) for all 5 stocks
- **Trade Panel**: Buy/sell with estimated output, pending/confirmed toasts
- **Portfolio**: Cash balance + holdings (share balance × current price)
- **Leaderboard**: Top traders by portfolio value (client-side from Trade events)

## Quick Start

### 1. Install Dependencies

```bash
# Contracts
cd contracts
forge install

# Frontend
cd ../app
npm install
```

### 2. Configure Environment

```bash
cd app
cp .env.example .env.local
# Edit .env.local with your Thirdweb API key and Wagmi project ID
```

### 3. Deploy Contracts (Local Anvil)

```bash
cd contracts
anvil  # In separate terminal
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
```

### 4. Update Contract Addresses

Copy deployed addresses to `app/.env.local`:
```env
NEXT_PUBLIC_PLAY_MONEY_ADDRESS=0x...
NEXT_PUBLIC_STOCK_AMM_ADDRESS=0x...
```

### 5. Run Frontend

```bash
cd app
npm run dev
```

Open http://localhost:3000

## Monad Testnet Deployment

1. Add Monad testnet to Foundry:
```toml
# contracts/foundry.toml
[rpc_endpoints]
monad_testnet = "https://10143.rpc.thirdweb.com/${THIRDWEB_API_KEY}"

[profile.default]
chain-id = 10143
```

2. Deploy:
```bash
forge script script/Deploy.s.sol --rpc-url monad_testnet --broadcast --private-key $PRIVATE_KEY
```

3. Update frontend `.env.local` with testnet addresses

4. Deploy to Vercel:
```bash
vercel --prod
```

## Key Tech Stack

- **Smart Contracts**: Solidity ^0.8.20, Foundry (forge/cast/anvil)
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Web3**: wagmi v2 + viem (NOT ethers.js)
- **Wallet**: MetaMask connector
- **Charts**: Recharts (live updates via `useWatchContractEvent`)
- **UI**: shadcn/ui components, Sonner toasts
- **No Backend**: All state on-chain, deployable to Vercel as static/SSR

## Demo Flow

1. Connect MetaMask → Switch to Monad Testnet (Chain ID: 10143)
2. Click "Claim Starter Funds" → 100,000 SUSD minted
3. View Dashboard → 5 live charts at initial price (1 SUSD = 1 share)
4. Go to Trade → Buy MNDX with 100 SUSD
5. Watch chart update INSTANTLY on Monad's sub-second finality
6. Check Portfolio → See updated holdings
7. Check Leaderboard → See your rank

## Contract Math (Bonding Curve)

For each stock, constant product: `cashReserve × shareReserve = k`

**Buy**: User sends `cashAmount` SUSD
```
sharesOut = (shareReserve × cashAmount) / (cashReserve + cashAmount)
cashReserve += cashAmount
shareReserve -= sharesOut
newPrice = cashReserve / shareReserve
```

**Sell**: User sends `shareAmount` shares
```
cashOut = (cashReserve × shareAmount) / (shareReserve + shareAmount)
shareReserve += shareAmount
cashReserve -= cashOut
newPrice = cashReserve / shareReserve
```

## Testing

```bash
cd contracts
forge test -vvv
```

## License

MIT