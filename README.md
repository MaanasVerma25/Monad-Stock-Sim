# PulseStock — On-Chain Synthetic Equity Trading on Monad

PulseStock is a fully on-chain stock market simulator deployed on **Monad Testnet**. It lets users trade synthetic versions of real US equities (AAPL, TSLA, NVDA, GOOGL, MSFT, AMZN, META, COIN) using MON play money, powered by constant-product bonding curve AMMs that anchor to real-world daily closing prices.

Every trade executes on-chain via smart contracts — no order books, no centralized matching engines. Monad's 400ms block times and 800ms finality make the experience feel instant.

> **⚠️ This is a testnet simulation.** All tokens (MON play money, stock shares) are testnet assets with zero real-world financial value. No actual equities are bought, sold, or held.

---

## Live Deployment

| Property | Details |
|----------|---------|
| **Live App** | [https://pulse-stock-nu.vercel.app](https://pulse-stock-nu.vercel.app/) |
| **Network** | Monad Testnet |
| **Chain ID** | `10143` |
| **RPC URL** | `https://testnet-rpc.monad.xyz` |
| **Block Explorer** | [testnet.monadscan.com](https://testnet.monadscan.com) |
| **GitHub** | [PratyushGupta21/PulseStock](https://github.com/PratyushGupta21/PulseStock) |

---

## How It Works

### The Core Loop

1. **Real prices come in** — The price-setter service fetches daily closing prices from [Alpha Vantage](https://www.alphavantage.co/) for each stock and writes them on-chain as "base prices" (anchors).

2. **Users trade against bonding curves** — Each stock has its own constant-product AMM pool (`cashReserve × shareReserve = k`). When you buy shares, you push MON into the cash reserve and pull shares out, which moves the spot price up. Selling does the reverse.

3. **Prices drift intraday, reset daily** — During the day, trading activity moves the spot price away from the anchor. Every 24 hours, the price-setter recalibrates each pool's reserves to match the latest real closing price, snapping the synthetic price back to reality.

4. **Everything is on-chain** — Trades, balances, price feeds, and portfolio positions all live on Monad Testnet smart contracts. The frontend reads state directly via wagmi/viem.

### Bonding Curve Math

```
spotPrice = cashReserve / shareReserve

Buy N shares:  cost = (cashReserve × N) / (shareReserve − N)
Sell N shares: payout = (cashReserve × N) / (shareReserve + N)
```

The pools use high-sensitivity liquidity parameters (`shareLiquidity = 1000 × 10¹⁸`) to amplify price impact per trade, creating volatile intraday price action that mirrors real equity market microstructure.

### Why Monad?

PulseStock is built on Monad because of:

- **400ms block times & 800ms finality** — Trades confirm almost instantly
- **10,000 TPS capacity** — No congestion even with many simultaneous traders
- **Parallel EVM execution** — Same Solidity contracts as Ethereum, dramatically faster
- **EIP-1559 compatible gas** — Standard tooling (wagmi, viem, MetaMask) works out of the box
- **Gas charged on gas_limit** — PulseStock sets tight explicit gas limits on every transaction to minimize costs

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │Dashboard │ │TradeModal│ │Portfolio │ │ Leaderboard   │  │
│  │StockCards│ │TradePanel│ │ Holdings │ │   Rankings    │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬───────┘  │
│       │             │            │               │          │
│       └─────────────┴────────────┴───────────────┘          │
│                          │ wagmi / viem                      │
└──────────────────────────┼──────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              │    Monad Testnet EVM    │
              │  ┌──────────────────┐   │
              │  │   StockAMM.sol   │   │
              │  │  (Bonding Curve  │   │
              │  │   AMM Engine)    │   │
              │  └────────┬─────────┘   │
              │  ┌────────┴─────────┐   │
              │  │  PlayMoney.sol   │   │
              │  │  (MON ERC-20     │   │
              │  │   Faucet Token)  │   │
              │  └──────────────────┘   │
              └────────────┬────────────┘
                           │
              ┌────────────┼────────────┐
              │   Price Setter Service  │
              │  (Alpha Vantage API →   │
              │   on-chain base price   │
              │   updates every 24h)    │
              └─────────────────────────┘
```

---

## Smart Contracts

### PlayMoney.sol

An ERC-20 faucet token. Every new user can call `claimStarterFunds()` once to receive **100,000 MON** (play money). This MON is used as collateral for all trades.

### StockAMM.sol

The core trading engine. Each stock is a struct containing:
- `ticker` / `name` — Stock identifier (e.g., "AAPL", "Apple Inc.")
- `cashReserve` / `shareReserve` — The two sides of the constant-product pool
- `basePrice` — Daily anchor from real market closing prices
- `lastReset` — Timestamp of the last price recalibration

**Key functions:**
| Function | Description |
|----------|-------------|
| `buy(stockId, cashAmount)` | Deposit MON, receive synthetic shares |
| `sell(stockId, shareAmount)` | Return shares, receive MON back |
| `getPrice(stockId)` | Current spot price (`cashReserve / shareReserve`) |
| `getStock(stockId)` | Full stock metadata and reserve state |
| `getUserShares(user, stockId)` | User's share balance for a stock |
| `setDailyBasePricesBatch(...)` | Owner-only: recalibrate pools to real prices |

**Events emitted:**
- `Trade(user, stockId, isBuy, amountIn, amountOut, newPrice)` — Every trade
- `DailyPriceSet(stockId, newBasePrice, timestamp)` — Every price recalibration

---

## Supported Stocks

| ID | Ticker | Company |
|----|--------|---------|
| 0 | AAPL | Apple Inc. |
| 1 | TSLA | Tesla Inc. |
| 2 | NVDA | NVIDIA Corp. |
| 3 | GOOGL | Alphabet Inc. |
| 4 | MSFT | Microsoft Corp. |
| 5 | AMZN | Amazon.com Inc. |
| 6 | META | Meta Platforms |
| 7 | COIN | Coinbase Global |

---

## Project Structure

```
PulseStock/
├── app/                            # Next.js 14 frontend application
│   ├── app/                        # App Router pages
│   │   ├── page.tsx                # Landing page (hero, feature cards)
│   │   ├── layout.tsx              # Root layout with providers
│   │   ├── dashboard/              # Live stock cards grid
│   │   ├── trade/                  # Dedicated trade page
│   │   ├── portfolio/              # User holdings & P&L
│   │   ├── leaderboard/            # Top trader rankings
│   │   ├── onboarding/             # Wallet setup + MON faucet claim
│   │   ├── docs/                   # Technical documentation
│   │   ├── faqs/                   # Frequently asked questions
│   │   ├── wallet-guide/           # Wallet configuration guide
│   │   └── api/stock-history/      # API route for Alpha Vantage data
│   ├── components/                 # React components
│   │   ├── dashboard/StockCard.tsx  # Live price card with mini chart
│   │   ├── trade/TradeModal.tsx     # Full trade interface with dual chart
│   │   ├── trade/TradePanel.tsx     # Compact trade panel
│   │   ├── wallet/ConnectButton.tsx # Wallet connect + balance display
│   │   ├── portfolio/Portfolio.tsx  # Holdings table
│   │   ├── leaderboard/            # Leaderboard rankings
│   │   └── onboarding/             # Faucet claim button
│   ├── lib/
│   │   ├── contracts/contracts.ts  # ABI definitions & stock list
│   │   └── wagmi/config.ts         # Monad Testnet chain configuration
│   ├── .env.example                # Environment variable template
│   └── package.json
│
├── contracts/                      # Foundry smart contract suite
│   ├── contracts/
│   │   ├── StockAMM.sol            # Core bonding curve AMM engine
│   │   └── PlayMoney.sol           # ERC-20 faucet token
│   ├── script/                     # Deployment scripts
│   ├── test/                       # Contract unit tests
│   ├── lib/                        # OpenZeppelin dependencies
│   └── foundry.toml                # Foundry configuration
│
├── price-setter/                   # Off-chain oracle service
│   ├── index.ts                    # Fetches Alpha Vantage prices → on-chain
│   ├── package.json
│   └── .env.example
│
├── .agents/skills/                 # MONSKILLS development skills
├── .monskills                      # MONSKILLS build metadata
├── vercel.json                     # Vercel deployment config
└── README.md
```

---

## Running Locally

### Prerequisites

- **Node.js** v18 or higher
- **npm** (comes with Node.js)
- **A Web3 wallet** (MetaMask, Rabby, or any EVM-compatible browser wallet)
- **Monad Testnet MON** for gas fees (get from the [Monad Testnet Faucet](https://faucet.monad.xyz))

### Step 1: Clone the Repository

```bash
git clone https://github.com/PratyushGupta21/PulseStock.git
cd PulseStock
```

### Step 2: Install Frontend Dependencies

```bash
cd app
npm install
```

### Step 3: Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `app/.env`:

```env
# Alpha Vantage API Key (free tier: https://www.alphavantage.co/support/#api-key)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key

# Contract Addresses (update after deployment, or use existing testnet addresses)
NEXT_PUBLIC_PLAY_MONEY_ADDRESS=0xYourPlayMoneyAddress
NEXT_PUBLIC_STOCK_AMM_ADDRESS=0xYourStockAMMAddress

# Optional
NEXT_PUBLIC_WAGMI_PROJECT_ID=your_walletconnect_project_id
```

### Step 4: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Configure Your Wallet

Add Monad Testnet to your wallet:

| Setting | Value |
|---------|-------|
| Network Name | Monad Testnet |
| RPC URL | `https://testnet-rpc.monad.xyz` |
| Chain ID | `10143` |
| Currency Symbol | `MON` |
| Block Explorer | `https://testnet.monadscan.com` |

### Step 6: Start Trading

1. Connect your wallet on the app
2. Navigate to **Onboarding** and click **"Claim 100,000 MON"**
3. Go to the **Dashboard** to see live stock cards
4. Click any stock to open the trade modal
5. Enter an amount and execute a buy or sell order
6. Check your **Portfolio** to see your positions

---

## Running the Price Setter Service (Optional)

The price-setter is an off-chain service that fetches real stock closing prices from Alpha Vantage and writes them to the StockAMM contract as daily base prices.

```bash
cd price-setter
npm install
```

Create `price-setter/.env`:

```env
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://testnet-rpc.monad.xyz
STOCK_AMM_ADDRESS=0xYourStockAMMAddress
```

Run the price update:

```bash
npm run update-prices
```

> **Note:** The private key must belong to the contract owner (the account that deployed StockAMM) since `setDailyBasePricesBatch` is an `onlyOwner` function.

---

## Deploying Smart Contracts

If you want to deploy your own instance of the contracts:

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Monad Testnet MON for deployment gas

### Build & Test

```bash
cd contracts
forge install
forge build
forge test
```

### Deploy

```bash
forge script script/Deploy.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --broadcast
```

After deployment, copy the deployed contract addresses into your `app/.env` and `price-setter/.env` files.

### Verify Contracts

Use the Monad verification API to verify on all explorers at once:

```bash
# Get standard JSON input
forge verify-contract <CONTRACT_ADDRESS> <ContractName> \
  --chain 10143 \
  --show-standard-json-input > standard-input.json

# Get Foundry metadata
cat out/<Contract>.sol/<Contract>.json | jq '.metadata' > metadata.json

# Call verification API
curl -X POST https://agents.devnads.com/v1/verify \
  -H "Content-Type: application/json" \
  -d '{
    "chainId": 10143,
    "contractAddress": "<CONTRACT_ADDRESS>",
    "contractName": "contracts/<Contract>.sol:<Contract>",
    "compilerVersion": "v0.8.20+commit.a1b79de6",
    "standardJsonInput": <contents of standard-input.json>,
    "foundryMetadata": <contents of metadata.json>
  }'
```

---

## Monad-Specific Implementation Details

PulseStock is built following [MONSKILLS](https://skills.devnads.com) best practices for Monad development:

### Gas Optimization

Monad charges gas based on `gas_limit`, not actual gas used. All `writeContract` calls in PulseStock set explicit, tight gas limits:

| Operation | Gas Limit |
|-----------|-----------|
| ERC-20 Approve | `60,000` |
| Buy / Sell Trade | `150,000` |
| Claim Starter Funds | `100,000` |

### Reserve Balance Awareness

Monad enforces a 10 MON native balance floor per EOA. The wallet UI displays a warning badge when native MON drops below 10, since low-balance accounts are throttled to 1 transaction per ~1.2 seconds.

### Async Execution

Monad's consensus runs with a 3-block delayed state view (D=3). After claiming faucet funds, the UI shows a confirmation indicator explaining that the balance becomes usable after ~1.2 seconds.

### MonadScan Integration

Successful trades display a direct "View on MonadScan" link pointing to `https://testnet.monadscan.com/tx/{hash}`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS, Glassmorphism UI, Lucide Icons |
| **Web3** | wagmi v2, viem, EIP-1559 transactions |
| **Charts** | Recharts (real-time line charts) |
| **Smart Contracts** | Solidity 0.8.20, OpenZeppelin, Foundry |
| **Price Oracle** | Alpha Vantage API (daily OHLCV data) |
| **Blockchain** | Monad Testnet (Chain ID 10143) |
| **Deployment** | Vercel (frontend), Foundry (contracts) |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## Contact

- **Mobile:** 8765316576
- **Email:** [vermamaanas5@gmail.com](mailto:vermamaanas5@gmail.com)

---

## License

MIT

