const fs = require('fs');
const path = require('path');
const { createWalletClient, createPublicClient, http, parseEther } = require('../app/node_modules/viem');
const { privateKeyToAccount } = require('../app/node_modules/viem/accounts');
const { defineChain } = require('../app/node_modules/viem');

const priceSetterEnv = fs.readFileSync(path.join(__dirname, '..', 'price-setter', '.env'), 'utf8');
const privateKeyMatch = priceSetterEnv.match(/PRIVATE_KEY=(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64})/);

if (!privateKeyMatch) {
  console.error('\n❌ ERROR: Private Key missing in price-setter/.env\n');
  process.exit(1);
}

let privateKey = privateKeyMatch[1];
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
  console.log('🚀 Deploying Native MON StockAMM to Monad Testnet...');

  const account = privateKeyToAccount(privateKey);
  console.log(`📍 Deployer account: ${account.address}`);

  const publicClient = createPublicClient({ chain: monadTestnet, transport: http() });
  const walletClient = createWalletClient({ account, chain: monadTestnet, transport: http() });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`💰 Deployer MON Balance: ${(Number(balance) / 1e18).toFixed(4)} MON`);

  if (balance === 0n) {
    console.error('\n❌ Deployer account has 0 MON! Please request testnet funds at https://faucet.monad.xyz first.\n');
    process.exit(1);
  }

  const compiled = JSON.parse(fs.readFileSync(path.join(__dirname, 'compiled.json'), 'utf8'));

  // 1. Deploy StockAMM with 200 share liquidity
  console.log('\n1️⃣ Deploying Native MON StockAMM contract...');
  const shareLiquidity = parseEther('200'); // 200 shares pool liquidity for sensitive price shifts
  const stockAmmHash = await walletClient.deployContract({
    abi: compiled.StockAMM.abi,
    bytecode: '0x' + compiled.StockAMM.bytecode,
    args: [shareLiquidity]
  });
  console.log(`   Transaction submitted! Hash: ${stockAmmHash}`);
  console.log('   Waiting for transaction receipt...');
  const stockAmmReceipt = await publicClient.waitForTransactionReceipt({ hash: stockAmmHash });
  const stockAmmAddress = stockAmmReceipt.contractAddress;
  console.log(`   ✅ Native MON StockAMM deployed at: ${stockAmmAddress}`);

  // 2. Add initial stocks
  console.log('\n2️⃣ Initializing 8 stock AMM pools (AAPL, TSLA, NVDA, GOOGL, MSFT, AMZN, META, COIN)...');
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

  // 3. Send 1 MON native liquidity to StockAMM contract for sell redemptions
  console.log('\n3️⃣ Seeding native MON liquidity into StockAMM contract...');
  const depositTx = await walletClient.sendTransaction({
    to: stockAmmAddress,
    value: parseEther('1.0')
  });
  console.log(`   Native MON deposit tx: ${depositTx}`);
  await publicClient.waitForTransactionReceipt({ hash: depositTx });
  console.log('   ✅ Native MON liquidity deposited!');

  // 4. Update app/.env and price-setter/.env
  console.log('\n4️⃣ Updating environment files with new StockAMM address...');
  const appEnvPath = path.join(__dirname, '..', 'app', '.env');
  let appEnvContent = fs.readFileSync(appEnvPath, 'utf8');
  appEnvContent = appEnvContent.replace(/NEXT_PUBLIC_STOCK_AMM_ADDRESS=.*/, `NEXT_PUBLIC_STOCK_AMM_ADDRESS=${stockAmmAddress}`);
  fs.writeFileSync(appEnvPath, appEnvContent);

  const priceSetterEnvPath = path.join(__dirname, '..', 'price-setter', '.env');
  let priceSetterEnvContent = fs.readFileSync(priceSetterEnvPath, 'utf8');
  priceSetterEnvContent = priceSetterEnvContent.replace(/STOCK_AMM_ADDRESS=.*/, `STOCK_AMM_ADDRESS=${stockAmmAddress}`);
  fs.writeFileSync(priceSetterEnvPath, priceSetterEnvContent);

  console.log('\n🎉 NATIVE MON AMM DEPLOYED SUCCESSFULLY!');
  console.log(`   StockAMM: ${stockAmmAddress}\n`);
}

main().catch(err => {
  console.error('\n❌ Fatal deployment error:', err);
  process.exit(1);
});
