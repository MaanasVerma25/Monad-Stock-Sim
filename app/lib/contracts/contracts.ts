const RAW_ADDRESS = process.env.NEXT_PUBLIC_STOCK_AMM_ADDRESS || "0x9c26b5e73f61a6a1daea9addab5875422ff6bada";

// Ensure transactions route to active Native MON contract (0x9c26...) even if Vercel environment has old address (0xb4ca...)
export const STOCK_AMM_ADDRESS = (
  RAW_ADDRESS.toLowerCase() === "0xb4ca0e7c014c249f7403f5dad24b00dfc221368b".toLowerCase()
    ? "0x9c26b5e73f61a6a1daea9addab5875422ff6bada"
    : RAW_ADDRESS
) as `0x${string}`;

export const stockAmmAbi = [
  {
    inputs: [
      { name: "stockId", type: "uint256" }
    ],
    name: "buy",
    outputs: [],
    stateMutability: "payable",
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
    inputs: [
      { name: "user", type: "address" },
      { name: "stockId", type: "uint256" }
    ],
    name: "getUserShares",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "stockId", type: "uint256" }],
    name: "getTicker",
    outputs: [{ name: "", type: "string" }],
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