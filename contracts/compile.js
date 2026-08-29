const fs = require('fs');
const path = require('path');
const solc = require('../app/node_modules/solc');

function findImports(importPath) {
  let fullPath = importPath;
  if (importPath.startsWith('@openzeppelin/contracts/')) {
    fullPath = path.join(__dirname, 'lib', 'openzeppelin-contracts', 'contracts', importPath.replace('@openzeppelin/contracts/', ''));
  } else if (!path.isAbsolute(importPath)) {
    fullPath = path.join(__dirname, 'contracts', importPath);
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    return { contents: content };
  } catch (e) {
    return { error: 'File not found: ' + fullPath };
  }
}

console.log('Compiling PlayMoney.sol and StockAMM.sol...');

const playMoneySource = fs.readFileSync(path.join(__dirname, 'contracts', 'PlayMoney.sol'), 'utf8');
const stockAmmSource = fs.readFileSync(path.join(__dirname, 'contracts', 'StockAMM.sol'), 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'PlayMoney.sol': { content: playMoneySource },
    'StockAMM.sol': { content: stockAmmSource }
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object']
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
  let hasErrors = false;
  output.errors.forEach(err => {
    if (err.severity === 'error') {
      console.error(err.formattedMessage);
      hasErrors = true;
    }
  });
  if (hasErrors) process.exit(1);
}

const playMoneyAbi = output.contracts['PlayMoney.sol']['PlayMoney'].abi;
const playMoneyBytecode = output.contracts['PlayMoney.sol']['PlayMoney'].evm.bytecode.object;

const stockAmmAbi = output.contracts['StockAMM.sol']['StockAMM'].abi;
const stockAmmBytecode = output.contracts['StockAMM.sol']['StockAMM'].evm.bytecode.object;

console.log('PlayMoney Compiled! Bytecode length:', playMoneyBytecode.length);
console.log('StockAMM Compiled! Bytecode length:', stockAmmBytecode.length);

fs.writeFileSync(path.join(__dirname, 'compiled.json'), JSON.stringify({
  PlayMoney: { abi: playMoneyAbi, bytecode: playMoneyBytecode },
  StockAMM: { abi: stockAmmAbi, bytecode: stockAmmBytecode }
}, null, 2));

console.log('Compiled artifacts saved to contracts/compiled.json');
