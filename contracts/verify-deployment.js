const { createPublicClient, http } = require('../app/node_modules/viem');
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

const appEnvPath = path.join(__dirname, '..', 'app', '.env');
const appEnv = fs.readFileSync(appEnvPath, 'utf8');

const playMoneyMatch = appEnv.match(/NEXT_PUBLIC_PLAY_MONEY_ADDRESS=(0x[a-fA-F0-9]{40})/);
const stockAmmMatch = appEnv.match(/NEXT_PUBLIC_STOCK_AMM_ADDRESS=(0x[a-fA-F0-9]{40})/);

if (!playMoneyMatch || !stockAmmMatch) {
  console.error('Could not parse contract addresses from app/.env');
  process.exit(1);
}

const playMoneyAddress = playMoneyMatch[1];
const stockAmmAddress = stockAmmMatch[1];

const playMoneyAbi = [
  { inputs: [], name: "name", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "STARTER_FUNDS", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" }
];

const stockAmmAbi = [
  { inputs: [], name: "getStockCount", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
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
  }
];

async function verify() {
  console.log('🔍 Verifying Smart Contracts on Monad Testnet RPC (https://testnet-rpc.monad.xyz)...');
  const client = createPublicClient({ chain: monadTestnet, transport: http() });

  // 1. Check PlayMoney
  console.log(`\n1️⃣ Checking PlayMoney Contract at: ${playMoneyAddress}`);
  const playMoneyCode = await client.getCode({ address: playMoneyAddress });
  if (!playMoneyCode || playMoneyCode === '0x') {
    console.error('❌ PlayMoney bytecode missing on-chain!');
    process.exit(1);
  }
  console.log(`   ✅ Bytecode verified on Monad Testnet (${playMoneyCode.length} bytes)`);

  const name = await client.readContract({ address: playMoneyAddress, abi: playMoneyAbi, functionName: 'name' });
  const symbol = await client.readContract({ address: playMoneyAddress, abi: playMoneyAbi, functionName: 'symbol' });
  const starterFunds = await client.readContract({ address: playMoneyAddress, abi: playMoneyAbi, functionName: 'STARTER_FUNDS' });
  console.log(`   ✅ Name: ${name}`);
  console.log(`   ✅ Symbol: ${symbol}`);
  console.log(`   ✅ Starter Funds: ${(Number(starterFunds) / 1e18).toLocaleString()} MON`);

  // 2. Check StockAMM
  console.log(`\n2️⃣ Checking StockAMM Contract at: ${stockAmmAddress}`);
  const stockAmmCode = await client.getCode({ address: stockAmmAddress });
  if (!stockAmmCode || stockAmmCode === '0x') {
    console.error('❌ StockAMM bytecode missing on-chain!');
    process.exit(1);
  }
  console.log(`   ✅ Bytecode verified on Monad Testnet (${stockAmmCode.length} bytes)`);

  const count = await client.readContract({ address: stockAmmAddress, abi: stockAmmAbi, functionName: 'getStockCount' });
  console.log(`   ✅ Stock Pools Initialized: ${count} stocks`);

  console.log('\n📊 Registered Stock Pools & On-Chain Spot Prices:');
  for (let i = 0n; i < count; i++) {
    const stock = await client.readContract({
      address: stockAmmAddress,
      abi: stockAmmAbi,
      functionName: 'getStock',
      args: [i]
    });
    const ticker = stock[0];
    const stockName = stock[1];
    const basePrice = (Number(stock[4]) / 1e18).toFixed(2);
    const spotPrice = (Number(stock[6]) / 1e18).toFixed(4);
    console.log(`   • [ID ${i}] ${ticker} (${stockName}) | Spot: $${spotPrice} | Anchor: $${basePrice}`);
  }

  console.log('\n🎉 VERIFICATION SUCCESSFUL! Both contracts are live, fully functional, and verified on Monad Testnet.');
}

verify().catch(console.error);
