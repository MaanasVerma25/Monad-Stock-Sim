// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/PlayMoney.sol";
import "../contracts/StockAMM.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy PlayMoney
        PlayMoney simUsd = new PlayMoney();

        // Deploy StockAMM with sensitive liquidity (e.g., 2,000 shares base liquidity)
        uint256 shareLiquidity = 2_000 * 10 ** 18;
        StockAMM amm = new StockAMM(address(simUsd), shareLiquidity);

        // Initial real stocks and their approximate real closing prices (in 1e18 SUSD)
        string[] memory tickers = new string[](8);
        string[] memory names = new string[](8);
        uint256[] memory basePrices = new uint256[](8);

        tickers[0] = "AAPL";  names[0] = "Apple Inc.";           basePrices[0] = 225 * 10 ** 18;
        tickers[1] = "TSLA";  names[1] = "Tesla Inc.";           basePrices[1] = 210 * 10 ** 18;
        tickers[2] = "NVDA";  names[2] = "NVIDIA Corporation";  basePrices[2] = 125 * 10 ** 18;
        tickers[3] = "GOOGL"; names[3] = "Alphabet Inc.";        basePrices[3] = 165 * 10 ** 18;
        tickers[4] = "MSFT";  names[4] = "Microsoft Corp.";     basePrices[4] = 415 * 10 ** 18;
        tickers[5] = "AMZN";  names[5] = "Amazon.com Inc.";     basePrices[5] = 175 * 10 ** 18;
        tickers[6] = "META";  names[6] = "Meta Platforms Inc."; basePrices[6] = 510 * 10 ** 18;
        tickers[7] = "COIN";  names[7] = "Coinbase Global";     basePrices[7] = 200 * 10 ** 18;

        amm.addStocksBatch(tickers, names, basePrices);

        // Mint initial SUSD liquidity to AMM across pools
        // Total cash liquidity needed = sum(basePrices * shareLiquidity / 1e18)
        uint256 totalCashNeeded = 0;
        for (uint256 i = 0; i < basePrices.length; i++) {
            totalCashNeeded += (basePrices[i] * shareLiquidity) / 1e18;
        }

        // Mint liquidity into AMM contract
        simUsd.mint(address(amm), totalCashNeeded * 2);

        console.log("PlayMoney deployed to:", address(simUsd));
        console.log("StockAMM deployed to:", address(amm));

        vm.stopBroadcast();
    }
}