const fs = require('fs');
const path = require('path');
const { createWalletClient, createPublicClient, http, parseEther } = require('../app/node_modules/viem');
const { privateKeyToAccount } = require('../app/node_modules/viem/accounts');
const { defineChain } = require('../app/node_modules/viem');

// Load environment variables if available
let privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '..', 'price-setter', '.env'), 'utf8');
    const match = envFile.match(/PRIVATE_KEY=(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64})/);
    if (match) {
      privateKey = match[1];
    }
  } catch (e) {}
}

if (!privateKey || privateKey === '0x...' || privateKey.length < 64) {
  console.error('\n❌ ERROR: Private Key not provided or invalid!');
  console.error('Please set your deployer private key in price-setter/.env or run with:');
  console.error('  $env:PRIVATE_KEY="0xYourPrivateKey" ; node contracts/deploy-monad.js\n');
  process.exit(1);
}

if (!privateKey.startsWith('0x')) {
  privateKey = '0x' + privateKey;
}

const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] }
  }
});

async function main() {
  console.log('🚀 Starting deployment on Monad Testnet (Chain ID 10143)...');

  const account = privateKeyToAccount(privateKey);
  console.log(`📍 Deployer account: ${account.address}`);

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http()
  });

  const walletClient = createWalletClient({
    account,
    chain: monadTestnet,
    transport: http()
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`💰 Deployer MON Balance: ${(Number(balance) / 1e18).toFixed(4)} MON`);

  if (balance === 0n) {
    console.error('\n❌ Deployer account has 0 MON! Please request testnet funds at https://faucet.monad.xyz first.\n');
    process.exit(1);
  }

  const compiled = JSON.parse(fs.readFileSync(path.join(__dirname, 'compiled.json'), 'utf8'));

  // 1. Deploy PlayMoney
  console.log('\n1️⃣ Deploying PlayMoney contract...');
  const playMoneyHash = await walletClient.deployContract({
    abi: compiled.PlayMoney.abi,
    bytecode: '0x' + compiled.PlayMoney.bytecode,
    args: []
  });
  console.log(`   Transaction submitted! Hash: ${playMoneyHash}`);
  console.log('   Waiting for transaction receipt...');
  const playMoneyReceipt = await publicClient.waitForTransactionReceipt({ hash: playMoneyHash });
  const playMoneyAddress = playMoneyReceipt.contractAddress;
  console.log(`   ✅ PlayMoney deployed at: ${playMoneyAddress}`);

  // 2. Deploy StockAMM
  console.log('\n2️⃣ Deploying StockAMM contract...');
  const shareLiquidity = parseEther('2000'); // 2,000 shares base liquidity
  const stockAmmHash = await walletClient.deployContract({
    abi: compiled.StockAMM.abi,
    bytecode: '0x' + compiled.StockAMM.bytecode,
    args: [playMoneyAddress, shareLiquidity]
  });
  console.log(`   Transaction submitted! Hash: ${stockAmmHash}`);
  console.log('   Waiting for transaction receipt...');
  const stockAmmReceipt = await publicClient.waitForTransactionReceipt({ hash: stockAmmHash });
  const stockAmmAddress = stockAmmReceipt.contractAddress;
  console.log(`   ✅ StockAMM deployed at: ${stockAmmAddress}`);

  // 3. Add initial stocks
  console.log('\n3️⃣ Initializing 8 stock AMM pools (AAPL, TSLA, NVDA, GOOGL, MSFT, AMZN, META, COIN)...');
  const tickers = ["AAPL", "TSLA", "NVDA", "GOOGL", "MSFT", "AMZN", "META", "COIN"];
  const names = [
    "Apple Inc.", "Tesla Inc.", "NVIDIA Corporation", "Alphabet Inc.",
    "Microsoft Corp.", "Amazon.com Inc.", "Meta Platforms Inc.", "Coinbase Global"
  ];
  const basePrices = [
    parseEther('225'), parseEther('210'), parseEther('125'), parseEther('165'),
    parseEther('415'), parseEther('175'), parseEther('510'), parseEther('200')
  ];

  const addBatchHash = await walletClient.writeContract({
    address: stockAmmAddress,
    abi: compiled.StockAMM.abi,
    functionName: 'addStocksBatch',
    args: [tickers, names, basePrices]
  });
  console.log(`   Transaction submitted! Hash: ${addBatchHash}`);
  await publicClient.waitForTransactionReceipt({ hash: addBatchHash });
  console.log('   ✅ Stock pools created!');

  // 4. Mint SUSD liquidity into StockAMM
  console.log('\n4️⃣ Minting initial PlayMoney cash liquidity into StockAMM contract...');
  let totalCashNeeded = 0n;
  for (const price of basePrices) {
    totalCashNeeded += (price * shareLiquidity) / parseEther('1');
  }
  const mintLiquidityHash = await walletClient.writeContract({
    address: playMoneyAddress,
    abi: compiled.PlayMoney.abi,
    functionName: 'mint',
    args: [stockAmmAddress, totalCashNeeded * 2n]
  });
  console.log(`   Transaction submitted! Hash: ${mintLiquidityHash}`);
  await publicClient.waitForTransactionReceipt({ hash: mintLiquidityHash });
  console.log('   ✅ Initial liquidity minted!');

  // 5. Write to app/.env and price-setter/.env
  console.log('\n5️⃣ Updating environment files with newly deployed addresses...');
  
  const appEnvPath = path.join(__dirname, '..', 'app', '.env');
  let appEnvContent = fs.readFileSync(appEnvPath, 'utf8');
  appEnvContent = appEnvContent.replace(/NEXT_PUBLIC_PLAY_MONEY_ADDRESS=.*/, `NEXT_PUBLIC_PLAY_MONEY_ADDRESS=${playMoneyAddress}`);
  appEnvContent = appEnvContent.replace(/NEXT_PUBLIC_STOCK_AMM_ADDRESS=.*/, `NEXT_PUBLIC_STOCK_AMM_ADDRESS=${stockAmmAddress}`);
  fs.writeFileSync(appEnvPath, appEnvContent);
  console.log('   ✅ Updated app/.env');

  const priceSetterEnvPath = path.join(__dirname, '..', 'price-setter', '.env');
  let priceSetterEnvContent = fs.readFileSync(priceSetterEnvPath, 'utf8');
  priceSetterEnvContent = priceSetterEnvContent.replace(/STOCK_AMM_ADDRESS=.*/, `STOCK_AMM_ADDRESS=${stockAmmAddress}`);
  fs.writeFileSync(priceSetterEnvPath, priceSetterEnvContent);
  console.log('   ✅ Updated price-setter/.env');

  console.log('\n🎉 ALL DEPLOYMENT STEPS COMPLETED SUCCESSFULLY!');
  console.log(`   PlayMoney: ${playMoneyAddress}`);
  console.log(`   StockAMM:  ${stockAmmAddress}\n`);
}

main().catch(err => {
  console.error('\n❌ Fatal deployment error:', err);
  process.exit(1);
});
