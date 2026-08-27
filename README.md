# ⚡ Monad Market Sim

> A fully on-chain stock market simulator built for the **Monad Blitz Hackathon** — demonstrating sub-second trade finality, live bonding-curve price discovery, and real-time charting with zero backend.

---

## 🧠 What Is It?

**Monad Market Sim** is a decentralized paper-trading platform where users can trade five synthetic stocks (`MNDX`, `CHAI`, `VIBE`, `GRIT`, `TECH`) using a simulated currency called **SimUSD (SUSD)**. Every price move is governed by a **constant-product bonding curve** (`x * y = k`) deployed on **Monad Testnet** — the same AMM math that powers Uniswap, but applied to a stock-market metaphor.

The entire state lives on-chain. There is no backend server, no database, and no oracle. The frontend subscribes directly to smart contract events for sub-second live chart updates.

---

## 🎯 Why It's Interesting

| Feature | Details |
|---|---|
| ⚡ Sub-second finality | Monad's parallel EVM confirms trades in < 1 second |
| 📈 Fully on-chain price discovery | Bonding curves replace order books — no matching engine needed |
| 🔴 Real-time charts with no WebSockets | `useWatchContractEvent` from wagmi drives live Recharts updates |
| 🆓 Zero-cost sandbox | Claim 100,000 SUSD for free and start trading immediately |
| 🏆 Competitive leaderboard | Rankings computed client-side from on-chain `Trade` events |
| 🚫 No backend | Fully deployable as a static/SSR site (Vercel) |

---

## 🏗 Architecture

```
monad-market-sim/
├── contracts/                  # Foundry (Solidity) project
│   ├── contracts/
│   │   ├── PlayMoney.sol       # ERC-20 SimUSD (SUSD) faucet token
│   │   └── StockAMM.sol        # Bonding-curve AMM for 5 stocks
│   ├── script/                 # Foundry deployment scripts
│   ├── test/
│   │   └── StockAMM.t.sol      # Foundry forge tests
│   └── foundry.toml            # Monad testnet + local Anvil config
│
└── app/                        # Next.js 14 (App Router) frontend
    ├── app/
    │   ├── page.tsx            # Landing / hero page
    │   ├── onboarding/         # Wallet connect + SUSD claim flow
    │   ├── dashboard/          # Live price charts for all 5 stocks
    │   ├── trade/              # Buy / sell panel with output estimates
    │   ├── portfolio/          # Cash balance + holdings value
    │   └── leaderboard/        # Top traders ranked by portfolio value
    ├── components/             # Reusable React components
    ├── lib/
    │   ├── wagmi/config.ts     # Wagmi + WalletConnect + Monad chain config
    │   └── contracts/          # ABI definitions and contract addresses
    └── .env.example            # Environment variable template
```

---

## 🔬 How It Works

### 1. SimUSD — The Play Currency (`PlayMoney.sol`)

`PlayMoney` is a standard **OpenZeppelin ERC-20** with one special twist: a one-time faucet.

```solidity
function claimStarterFunds() external {
    require(!hasClaimed[msg.sender], "Already claimed");
    _mint(msg.sender, 100_000 * 10**18); // 100,000 SUSD
    hasClaimed[msg.sender] = true;
}
```

- Token: **SimUSD (SUSD)**, 18 decimals
- Each wallet can claim **100,000 SUSD** exactly once
- No owner privileges needed after deployment

---

### 2. The AMM — Bonding Curve Price Engine (`StockAMM.sol`)

Each of the 5 stocks has two reserve pools — `cashReserve[i]` and `shareReserve[i]` — maintained at constant product `k = cashReserve × shareReserve`.

#### Buying shares

```
sharesOut = (shareReserve × cashIn) / (cashReserve + cashIn)
```

Sending SUSD into the pool raises `cashReserve`, shrinks `shareReserve`, and the spot price (`cashReserve / shareReserve`) **increases**.

#### Selling shares

```
cashOut = (cashReserve × sharesIn) / (shareReserve + sharesIn)
```

Sending shares into the pool raises `shareReserve`, shrinks `cashReserve`, and the spot price **decreases**.

#### Spot price

```solidity
function getPrice(uint8 stockId) external view returns (uint256) {
    return (cashReserve[stockId] * 1e18) / shareReserve[stockId];
}
```

Every trade emits a `Trade` event carrying `newPrice`, which the frontend uses to update charts instantly — no polling required.

```solidity
event Trade(
    address indexed user,
    uint8 indexed stockId,
    bool isBuy,
    uint256 amountIn,
    uint256 amountOut,
    uint256 newPrice
);
```

---

### 3. The Frontend — Next.js + wagmi + Recharts

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Web3 | wagmi v2 + viem |
| Wallet | MetaMask (WalletConnect ready) |
| Charts | Recharts (event-driven, no polling) |
| Notifications | Sonner toasts |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS |
| Deployment | Vercel (no server needed) |

**Key wagmi hooks used:**
- `useWatchContractEvent` — subscribes to `Trade` events for live chart updates
- `useReadContract` — reads prices, balances, claim status
- `useWriteContract` — executes `buy`, `sell`, `claimStarterFunds`
- `useWaitForTransactionReceipt` — drives pending → confirmed toast lifecycle

---

## 🚀 Quick Start

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`, `cast`, `anvil`)
- Node.js >= 18
- MetaMask browser extension
- A [Thirdweb API key](https://thirdweb.com/dashboard) (for Monad testnet RPC)
- A [WalletConnect Project ID](https://cloud.walletconnect.com)

---

### Step 1 — Install Dependencies

```bash
# Smart contracts
cd contracts
forge install

# Frontend
cd ../app
npm install
```

### Step 2 — Configure Environment

```bash
cd app
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_THIRDWEB_API_KEY=your_thirdweb_api_key
NEXT_PUBLIC_WAGMI_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_PLAY_MONEY_ADDRESS=0x...   # filled after deployment
NEXT_PUBLIC_STOCK_AMM_ADDRESS=0x...   # filled after deployment
```

### Step 3 — Deploy Contracts Locally

```bash
# Terminal 1: start local chain
cd contracts
anvil

# Terminal 2: deploy
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
```

Copy the printed contract addresses into `.env.local`.

### Step 4 — Run the App

```bash
cd app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🌐 Monad Testnet Deployment

### Deploy Contracts

```bash
cd contracts
forge script script/Deploy.s.sol \
  --rpc-url monad_testnet \
  --broadcast \
  --private-key $PRIVATE_KEY
```

> **Note:** Add your Thirdweb API key as `THIRDWEB_API_KEY` in your shell environment. The RPC endpoint `https://10143.rpc.thirdweb.com/${THIRDWEB_API_KEY}` is pre-configured in `foundry.toml`.

### Deploy Frontend to Vercel

```bash
cd app
vercel --prod
```

Add your `.env.local` variables to the Vercel project settings before deploying.

---

## 🧪 Running Tests

```bash
cd contracts
forge test -vvv
```

Tests cover buy/sell invariants, zero-amount guards, liquidity limits, and price calculations.

---

## 🎮 Demo Flow

1. **Connect** MetaMask → switch to **Monad Testnet** (Chain ID: `10143`)
2. **Claim** 100,000 SUSD on the Onboarding page
3. **Dashboard** → see live charts for all 5 stocks at their initial price (1 SUSD = 1 share)
4. **Trade** → buy `MNDX` with 1,000 SUSD — watch the chart spike immediately
5. **Sell** `MNDX` shares — watch price drop back
6. **Portfolio** → see your current holdings valued at live market prices
7. **Leaderboard** → see your rank vs all other traders (computed from on-chain events, client-side)

---

## ⚙️ Contract Reference

### `PlayMoney.sol`

| Function | Visibility | Description |
|---|---|---|
| `claimStarterFunds()` | `external` | Mints 100,000 SUSD to caller (once per address) |
| `hasClaimed(address)` | `public view` | Returns whether an address has already claimed |
| `balanceOf(address)` | `public view` | Standard ERC-20 balance |

### `StockAMM.sol`

| Function | Visibility | Description |
|---|---|---|
| `buy(stockId, cashAmount)` | `external` | Spend SUSD, receive shares |
| `sell(stockId, shareAmount)` | `external` | Spend shares, receive SUSD |
| `getPrice(stockId)` | `external view` | Spot price in SUSD per share (1e18 scaled) |
| `getTicker(stockId)` | `external pure` | Returns ticker string for a stock ID |
| `cashReserve[5]` | `public` | SUSD liquidity in each pool |
| `shareReserve[5]` | `public` | Share liquidity in each pool |

### Stock IDs

| ID | Ticker |
|---|---|
| 0 | MNDX |
| 1 | CHAI |
| 2 | VIBE |
| 3 | GRIT |
| 4 | TECH |

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity ^0.8.20, OpenZeppelin 5.x |
| Contract Toolchain | Foundry (forge / cast / anvil) |
| Frontend Framework | Next.js 14 (App Router), TypeScript |
| Web3 Layer | wagmi v2 + viem (no ethers.js) |
| Wallet | MetaMask connector |
| Charts | Recharts 2.x |
| UI | shadcn/ui, Radix UI, Lucide icons |
| Styling | Tailwind CSS 3.x |
| Notifications | Sonner |
| Deployment | Vercel |
| Chain | Monad Testnet (Chain ID: 10143) |

---

## 📄 License

MIT — built for the **Monad Blitz Hackathon**.