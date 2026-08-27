export const PLAY_MONEY_ADDRESS = (process.env.NEXT_PUBLIC_PLAY_MONEY_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const STOCK_AMM_ADDRESS = (process.env.NEXT_PUBLIC_STOCK_AMM_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const playMoneyAbi = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "claimStarterFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "spender", type: "address" }, { name: "value", type: "uint256" }],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export const stockAmmAbi = [
  {
    inputs: [
      { name: "stockId", type: "uint256" },
      { name: "cashAmount", type: "uint256" }
    ],
    name: "buy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "stockId", type: "uint256" },
      { name: "shareAmount", type: "uint256" }
    ],
    name: "sell",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "stockId", type: "uint256" }],
    name: "getPrice",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getStockCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "stockId", type: "uint256" }],
    name: "getStock",
    outputs: [
      { name: "ticker", type: "string" },
      { name: "name", type: "string" },
      { name: "cashReserve", type: "uint256" },
      { name: "shareReserve", type: "uint256" },
      { name: "basePrice", type: "uint256" },
      { name: "lastReset", type: "uint256" },
      { name: "currentPrice", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "stockId", type: "uint256" },
      { indexed: false, name: "isBuy", type: "bool" },
      { indexed: false, name: "amountIn", type: "uint256" },
      { indexed: false, name: "amountOut", type: "uint256" },
      { indexed: false, name: "newPrice", type: "uint256" }
    ],
    name: "Trade",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "stockId", type: "uint256" },
      { indexed: false, name: "newBasePrice", type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" }
    ],
    name: "DailyPriceSet",
    type: "event"
  }
] as const;

export interface Stock {
  id: number;
  ticker: string;
  name: string;
}

export const STOCKS: Stock[] = [
  { id: 0, ticker: "AAPL", name: "Apple Inc." },
  { id: 1, ticker: "TSLA", name: "Tesla Inc." },
  { id: 2, ticker: "NVDA", name: "NVIDIA Corp." },
  { id: 3, ticker: "GOOGL", name: "Alphabet Inc." },
  { id: 4, ticker: "MSFT", name: "Microsoft Corp." },
  { id: 5, ticker: "AMZN", name: "Amazon.com Inc." },
  { id: 6, ticker: "META", name: "Meta Platforms" },
  { id: 7, ticker: "COIN", name: "Coinbase Global" },
];