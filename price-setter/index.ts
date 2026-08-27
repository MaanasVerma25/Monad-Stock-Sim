import { createWalletClient, createPublicClient, http, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { defineChain } from 'viem'
import * as dotenv from 'dotenv'

dotenv.config()

const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.RPC_URL || 'https://testnet-rpc.monad.xyz'] },
    public: { http: [process.env.RPC_URL || 'https://testnet-rpc.monad.xyz'] }
  }
})

const stockAmmAbi = [
  {
    inputs: [
      { name: "stockIds", type: "uint256[]" },
      { name: "realPrices", type: "uint256[]" }
    ],
    name: "setDailyBasePricesBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const

interface StockTarget {
  id: number
  ticker: string
  defaultPrice: number
}

const STOCKS: StockTarget[] = [
  { id: 0, ticker: 'AAPL', defaultPrice: 225.50 },
  { id: 1, ticker: 'TSLA', defaultPrice: 212.30 },
  { id: 2, ticker: 'NVDA', defaultPrice: 126.80 },
  { id: 3, ticker: 'GOOGL', defaultPrice: 167.20 },
  { id: 4, ticker: 'MSFT', defaultPrice: 414.90 },
  { id: 5, ticker: 'AMZN', defaultPrice: 176.40 },
  { id: 6, ticker: 'META', defaultPrice: 512.10 },
  { id: 7, ticker: 'COIN', defaultPrice: 204.60 },
]

async function fetchRealClosingPrice(ticker: string, fallbackPrice: number): Promise<number> {
  try {
    // Attempting query to public query API (e.g. Yahoo Finance v8 endpoint)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (res.ok) {
      const data = await res.json()
      const close = data?.chart?.result?.[0]?.meta?.regularMarketPrice
      if (typeof close === 'number' && close > 0) {
        console.log(`Fetched live closing price for ${ticker}: $${close}`)
        return close
      }
    }
  } catch (err) {
    console.warn(`Could not fetch live price for ${ticker}, using benchmark price: $${fallbackPrice}`)
  }
  return fallbackPrice
}

async function main() {
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`
  const contractAddress = process.env.STOCK_AMM_ADDRESS as `0x${string}`

  if (!privateKey || !contractAddress) {
    console.error('Error: Please specify PRIVATE_KEY and STOCK_AMM_ADDRESS in .env')
    process.exit(1)
  }

  const account = privateKeyToAccount(privateKey)
  console.log(`Executing daily price update from account: ${account.address}`)

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http()
  })

  const walletClient = createWalletClient({
    account,
    chain: monadTestnet,
    transport: http()
  })

  const stockIds: bigint[] = []
  const realPrices: bigint[] = []

  for (const stock of STOCKS) {
    const priceUSD = await fetchRealClosingPrice(stock.ticker, stock.defaultPrice)
    const priceWei = parseUnits(priceUSD.toFixed(4), 18)
    stockIds.push(BigInt(stock.id))
    realPrices.push(priceWei)
  }

  console.log(`Submitting batch daily reset transaction for ${stockIds.length} stocks...`)

  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: stockAmmAbi,
    functionName: 'setDailyBasePricesBatch',
    args: [stockIds, realPrices]
  })

  console.log(`Tx submitted! Hash: ${hash}`)
  console.log('Waiting for confirmation on Monad...')

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log(`Daily prices updated successfully in block ${receipt.blockNumber}!`)
}

main().catch((error) => {
  console.error('Fatal error during price update:', error)
  process.exit(1)
})
