import { createWalletClient, createPublicClient, http, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { defineChain } from 'viem'
import * as dotenv from 'dotenv'

dotenv.config()

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'BGLBN0IDRDXYY3HJ'
const MARKETSTACK_API_KEY = process.env.MARKETSTACK_API_KEY || '6e489690b975928eea1036ba3b444d71'

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
}

const STOCKS: StockTarget[] = [
  { id: 0, ticker: 'AAPL' },
  { id: 1, ticker: 'TSLA' },
  { id: 2, ticker: 'NVDA' },
  { id: 3, ticker: 'GOOGL' },
  { id: 4, ticker: 'MSFT' },
  { id: 5, ticker: 'AMZN' },
  { id: 6, ticker: 'META' },
  { id: 7, ticker: 'COIN' },
]

async function fetchRealMarketOpenPrice(ticker: string): Promise<number> {
  // 1. Try Alpha Vantage API
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      const quote = data?.['Global Quote']
      const priceStr = quote?.['05. price'] || quote?.['02. open'] || quote?.['08. previous close']
      const openPrice = priceStr ? parseFloat(priceStr) : null
      if (typeof openPrice === 'number' && openPrice > 0) {
        console.log(`[Alpha Vantage API] Fetched live price for ${ticker}: $${openPrice.toFixed(2)}`)
        return openPrice
      }
    }
  } catch (err) {
    console.warn(`[Alpha Vantage API] Could not fetch for ${ticker}, trying fallback...`)
  }

  // 2. Try Marketstack API
  try {
    const url = `http://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${ticker}&limit=1`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      const item = data?.data?.[0]
      const openPrice = item?.open || item?.close
      if (typeof openPrice === 'number' && openPrice > 0) {
        console.log(`[Marketstack API] Fetched live open price for ${ticker}: $${openPrice.toFixed(2)}`)
        return openPrice
      }
    }
  } catch (err) {
    console.warn(`[Marketstack API] Could not fetch for ${ticker}, trying Yahoo Finance live API...`)
  }

  // 2. Secondary Real API Fallback: Yahoo Finance Live Chart API
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`
    const res = await fetch(yahooUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (res.ok) {
      const data = await res.json()
      const resultMeta = data?.chart?.result?.[0]?.meta
      const openPrices = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.open
      const openPrice = openPrices?.[0] || resultMeta?.regularMarketOpen || resultMeta?.regularMarketPrice
      if (typeof openPrice === 'number' && openPrice > 0) {
        console.log(`[Yahoo Finance API] Fetched live open price for ${ticker}: $${openPrice.toFixed(2)}`)
        return openPrice
      }
    }
  } catch (yErr) {
    console.error(`[Yahoo Finance API] Failed to fetch live price for ${ticker}:`, yErr)
  }

  throw new Error(`Unable to fetch live price for ${ticker} from any API endpoint`)
}

async function main() {
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`
  const contractAddress = process.env.STOCK_AMM_ADDRESS as `0x${string}`

  if (!privateKey || !contractAddress) {
    console.error('Error: Please specify PRIVATE_KEY and STOCK_AMM_ADDRESS in .env')
    process.exit(1)
  }

  const account = privateKeyToAccount(privateKey)
  console.log(`Executing daily market-open price anchor update via live stock APIs from: ${account.address}`)

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
    const openPriceUSD = await fetchRealMarketOpenPrice(stock.ticker)
    const priceWei = parseUnits(openPriceUSD.toFixed(4), 18)
    stockIds.push(BigInt(stock.id))
    realPrices.push(priceWei)
  }

  console.log(`Submitting batch market-open price reset transaction for ${stockIds.length} stocks...`)

  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: stockAmmAbi,
    functionName: 'setDailyBasePricesBatch',
    args: [stockIds, realPrices]
  })

  console.log(`Tx submitted! Hash: ${hash}`)
  console.log('Waiting for confirmation on Monad...')

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log(`Daily Market Open prices anchored successfully in block ${receipt.blockNumber}!`)
}

main().catch((error) => {
  console.error('Fatal error during price update:', error)
  process.exit(1)
})
