import { createWalletClient, createPublicClient, http, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { defineChain } from 'viem'
import * as dotenv from 'dotenv'

dotenv.config()

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
  defaultOpenPrice: number
}

const STOCKS: StockTarget[] = [
  { id: 0, ticker: 'AAPL', defaultOpenPrice: 224.80 },
  { id: 1, ticker: 'TSLA', defaultOpenPrice: 208.50 },
  { id: 2, ticker: 'NVDA', defaultOpenPrice: 124.90 },
  { id: 3, ticker: 'GOOGL', defaultOpenPrice: 165.40 },
  { id: 4, ticker: 'MSFT', defaultOpenPrice: 412.10 },
  { id: 5, ticker: 'AMZN', defaultOpenPrice: 174.20 },
  { id: 6, ticker: 'META', defaultOpenPrice: 508.40 },
  { id: 7, ticker: 'COIN', defaultOpenPrice: 198.30 },
]

async function fetchRealMarketOpenPrice(ticker: string, fallbackPrice: number): Promise<number> {
  try {
    const url = `http://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${ticker}&limit=1`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      const item = data?.data?.[0]
      const openPrice = item?.open || item?.close
      if (typeof openPrice === 'number' && openPrice > 0) {
        console.log(`Fetched Marketstack open price for ${ticker}: $${openPrice.toFixed(2)}`)
        return openPrice
      }
    }
  } catch (err) {
    console.warn(`Could not fetch Marketstack open price for ${ticker}, using default open: $${fallbackPrice}`)
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
  console.log(`Executing daily market-open price anchor update via Marketstack from: ${account.address}`)

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
    const openPriceUSD = await fetchRealMarketOpenPrice(stock.ticker, stock.defaultOpenPrice)
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
