# ⚡ Monad Market Sim — Hybrid Equity AMM

> A fully on-chain hybrid stock market simulator built for **Monad** — combining **24-hour real equity price anchors** (AAPL, TSLA, NVDA, GOOGL, MSFT, etc.) with **sensitive intraday bonding curves** (`x * y = k`).

---

## 🧠 The Hybrid Model

Unlike pure AMMs or oracle-only platforms, **Monad Market Sim** uses a hybrid price engine:

1. **Daily Real-World Anchoring**: Once every 24 hours, an automated price setter updates the base prices on-chain using yesterday's real closing prices from NYSE/NASDAQ.
2. **Sensitive Bonding Curve Price Discovery**: Intraday price movements are driven entirely by user trades using a constant product bonding curve (`x * y = k`). With 2,000 SUSD share liquidity per pool, every trade visibly shifts the price relative to the daily anchor.
3. **Sub-second Event-Driven UI**: Built on Monad's high-throughput parallel EVM, contract events instantly push price updates to Next.js charts without requiring WebSockets.

---

## 🎯 Key Features & Benefits

| Feature | Details |
|---|---|
| 📈 **Real Equity Tickers** | AAPL, TSLA, NVDA, GOOGL, MSFT, AMZN, META, COIN, and extensible to hundreds more |
| ⚓ **24-Hour Base Anchor** | Daily re-anchoring to real closing prices prevents unrealistic drift |
| ⚡ **Sensitive Price Shifts** | Trades dynamically push the price up (buys) or down (sells) instantly |
| 🌐 **Dynamic Multi-Stock Registry** | Smart contract supports adding unlimited stocks dynamically via `addStock()` |
| 🤖 **Automated Oracle Script** | Included `price-setter` script updates daily prices on Monad automatically |
| 🆓 **Zero-Cost Sandbox** | Claim 100,000 SimUSD (SUSD) from the faucet and start trading |

---

## 🏗 Architecture

```
monad-market-sim/
├── contracts/                  # Foundry (Solidity) project
│   ├── contracts/
│   │   ├── PlayMoney.sol       # ERC-20 SimUSD (SUSD) faucet token
│   │   └── StockAMM.sol        # Dynamic multi-stock hybrid AMM contract
│   ├── script/
│   │   └── Deploy.s.sol        # Deploys contract with initial equity prices
│   └── test/
│       └── StockAMM.t.sol      # Foundry unit tests for dynamic pricing & resets
│
├── price-setter/               # Daily Oracle Price Setter Script
│   ├── index.ts                # Fetches real closing prices & submits batch tx
│   └── package.json
│
└── app/                        # Next.js 14 (App Router) frontend
    ├── app/
    │   ├── dashboard/          # Real-time stock cards with 24h anchors & charts
    │   ├── trade/              # Buy/Sell trading panel with estimated outputs
    │   ├── portfolio/          # Real-time cash balance and market prices
    │   └── leaderboard/        # Rank traders by portfolio value
    ├── components/             # Reusable React & wagmi components
    └── lib/contracts/          # Wagmi ABI definitions & stock metadata
```

---

## 🔬 Smart Contract Details (`StockAMM.sol`)

### Pool Struct
```solidity
struct StockInfo {
    string ticker;
    string name;
    uint256 cashReserve;
    uint256 shareReserve;
    uint256 basePrice;  // Yesterday's real close (1e18 scaled)
    uint256 lastReset;  // Timestamp of last 24h reset
}
```

### Daily Price Re-Anchoring
```solidity
function setDailyBasePrice(uint256 stockId, uint256 realPrice) public onlyOwner {
    StockInfo storage stock = stocks[stockId];
    stock.cashReserve = (realPrice * shareLiquidity) / 1e18;
    stock.shareReserve = shareLiquidity;
    stock.basePrice = realPrice;
    stock.lastReset = block.timestamp;
    emit DailyPriceSet(stockId, realPrice, block.timestamp);
}
```

---

## 🤖 Daily Price Setter Oracle (`price-setter/`)

To run the daily price setter script:

```bash
cd price-setter
npm install
cp .env.example .env
# Set PRIVATE_KEY and STOCK_AMM_ADDRESS in .env
npm run update-prices
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Frontend
cd app
npm install
```

### 2. Configure Environment

```bash
cd app
cp .env.example .env.local
```

### 3. Run Dev Server

```bash
cd app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🎮 Demo Flow

1. Connect MetaMask to **Monad Testnet** (Chain ID: `10143`)
2. Claim 100,000 SUSD starter funds
3. View Dashboard to see live prices anchored to AAPL ($225), TSLA ($210), NVDA ($125), etc.
4. Trade any stock — see immediate price impact due to high bonding curve sensitivity
5. Run `price-setter` script to simulate the daily 24h re-anchoring to new closing prices

---

## 📄 License

MIT — Built for **Monad Blitz Hackathon**.