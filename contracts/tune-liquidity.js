const { createPublicClient, http, parseEther, createWalletClient } = require('../app/node_modules/viem');
const { privateKeyToAccount } = require('../app/node_modules/viem/accounts');
const { defineChain } = require('../app/node_modules/viem');
const fs = require('fs');
const path = require('path');

const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] }
  }
});

const appEnv = fs.readFileSync(path.join(__dirname, '..', 'app', '.env'), 'utf8');
const stockAmmAddress = appEnv.match(/NEXT_PUBLIC_STOCK_AMM_ADDRESS=(0x[a-fA-F0-9]{40})/)[1];

const priceSetterEnv = fs.readFileSync(path.join(__dirname, '..', 'price-setter', '.env'), 'utf8');
let privateKey = priceSetterEnv.match(/PRIVATE_KEY=(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64})/)[1];
if (!privateKey.startsWith('0x')) privateKey = '0x' + privateKey;

const stockAmmAbi = [
  { inputs: [], name: "shareLiquidity", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getStockCount", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ name: "stockId", type: "uint256" }],
    name: "getStock",
    outputs: [
      { name: "ticker", type: "string" }, { name: "name", type: "string" },
      { name: "cashReserve", type: "uint256" }, { name: "shareReserve", type: "uint256" },
      { name: "basePrice", type: "uint256" }, { name: "lastReset", type: "uint256" },
      { name: "currentPrice", type: "uint256" }
    ],
    stateMutability: "view", type: "function"
  },
  { inputs: [{ name: "_shareLiquidity", type: "uint256" }], name: "setShareLiquidity", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "stockId", type: "uint256" }, { name: "realPrice", type: "uint256" }], name: "setDailyBasePrice", outputs: [], stateMutability: "nonpayable", type: "function" },
];

// sleep helper to avoid RPC rate limits
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const client = createPublicClient({ chain: monadTestnet, transport: http() });
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({ account, chain: monadTestnet, transport: http() });

  // Set shareLiquidity to 5 for EXTREME sensitivity
  const TARGET_LIQUIDITY = 5;
  console.log(`🔧 Setting shareLiquidity to ${TARGET_LIQUIDITY} for extreme price sensitivity...`);
  const setLiqHash = await walletClient.writeContract({
    address: stockAmmAddress,
    abi: stockAmmAbi,
    functionName: 'setShareLiquidity',
    args: [parseEther(TARGET_LIQUIDITY.toString())]
  });
  await client.waitForTransactionReceipt({ hash: setLiqHash });
  console.log(`✅ shareLiquidity set to ${TARGET_LIQUIDITY}`);

  // Reset all pools with new liquidity
  const basePrices = [225, 210, 125, 165, 415, 175, 510, 200];
  const tickers = ['AAPL', 'TSLA', 'NVDA', 'GOOGL', 'MSFT', 'AMZN', 'META', 'COIN'];
  
  for (let i = 0; i < basePrices.length; i++) {
    await sleep(200); // avoid rate limits
    const hash = await walletClient.writeContract({
      address: stockAmmAddress,
      abi: stockAmmAbi,
      functionName: 'setDailyBasePrice',
      args: [BigInt(i), parseEther(basePrices[i].toString())]
    });
    await client.waitForTransactionReceipt({ hash });
    console.log(`✅ [${tickers[i]}] reset with basePrice=$${basePrices[i]} and ${TARGET_LIQUIDITY} share liquidity`);
  }

  // Verify with simulated trades
  console.log(`\n📊 Sensitivity check (shareLiquidity=${TARGET_LIQUIDITY}):`);
  for (let i = 0; i < basePrices.length; i++) {
    await sleep(100);
    const stock = await client.readContract({ address: stockAmmAddress, abi: stockAmmAbi, functionName: 'getStock', args: [BigInt(i)] });
    const cashRes = Number(stock[2]) / 1e18;
    const shareRes = Number(stock[3]) / 1e18;
    const spotPrice = Number(stock[6]) / 1e18;
    
    // Simulate 0.5 MON buy
    const buyAmount = 0.5;
    const sharesOut = (shareRes * buyAmount) / (cashRes + buyAmount);
    const newSpot = (cashRes + buyAmount) / (shareRes - sharesOut);
    const pctImpact = ((newSpot - spotPrice) / spotPrice) * 100;
    console.log(`  [${tickers[i]}] spot=$${spotPrice.toFixed(2)} | 0.5 MON → $${newSpot.toFixed(2)} (${pctImpact >= 0 ? '+' : ''}${pctImpact.toFixed(2)}%)`);
  }

  console.log('\n🎉 Done! Price sensitivity is now significantly higher.');
}

main().catch(console.error);
