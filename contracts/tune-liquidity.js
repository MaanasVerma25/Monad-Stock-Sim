const fs = require('fs');
const path = require('path');
const { createWalletClient, createPublicClient, http, parseEther } = require('../app/node_modules/viem');
const { privateKeyToAccount } = require('../app/node_modules/viem/accounts');
const { defineChain } = require('../app/node_modules/viem');

const priceSetterEnv = fs.readFileSync(path.join(__dirname, '..', 'price-setter', '.env'), 'utf8');
const privateKeyMatch = priceSetterEnv.match(/PRIVATE_KEY=(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64})/);
const stockAmmMatch = priceSetterEnv.match(/STOCK_AMM_ADDRESS=(0x[a-fA-F0-9]{40})/);

if (!privateKeyMatch || !stockAmmMatch) {
  console.error('Missing key or address in .env');
  process.exit(1);
}

const privateKey = privateKeyMatch[1];
const stockAmmAddress = stockAmmMatch[1];

const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] }
  }
});

const stockAmmAbi = [
  {
    inputs: [{ name: "_shareLiquidity", type: "uint256" }],
    name: "setShareLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
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
];

async function main() {
  const account = privateKeyToAccount(privateKey);
  console.log('Updating shareLiquidity to 200 shares per pool for high sensitivity...');

  const publicClient = createPublicClient({ chain: monadTestnet, transport: http() });
  const walletClient = createWalletClient({ account, chain: monadTestnet, transport: http() });

  // Set share liquidity to 200 * 1e18
  const sensitiveLiquidity = parseEther('200');
  const tx1 = await walletClient.writeContract({
    address: stockAmmAddress,
    abi: stockAmmAbi,
    functionName: 'setShareLiquidity',
    args: [sensitiveLiquidity]
  });
  console.log(`Liquidity tx: ${tx1}`);
  await publicClient.waitForTransactionReceipt({ hash: tx1 });

  // Recalibrate pool reserves
  const stockIds = [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n];
  const basePrices = [
    parseEther('225'), parseEther('210'), parseEther('125'), parseEther('165'),
    parseEther('415'), parseEther('175'), parseEther('510'), parseEther('200')
  ];

  const tx2 = await walletClient.writeContract({
    address: stockAmmAddress,
    abi: stockAmmAbi,
    functionName: 'setDailyBasePricesBatch',
    args: [stockIds, basePrices]
  });
  console.log(`Recalibrate tx: ${tx2}`);
  await publicClient.waitForTransactionReceipt({ hash: tx2 });

  console.log('✅ Pool liquidity updated to sensitive 200 shares! Trades will now visibly shift the bonding curve price.');
}

main().catch(console.error);
