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

        // Deploy StockAMM with 10,000 SUSD initial liquidity per stock
        uint256 initialLiquidity = 10_000 * 10 ** 18;
        StockAMM amm = new StockAMM(address(simUsd), initialLiquidity);

        // Transfer initial liquidity to AMM
        simUsd.mint(address(amm), initialLiquidity * 5);

        console.log("PlayMoney deployed to:", address(simUsd));
        console.log("StockAMM deployed to:", address(amm));

        vm.stopBroadcast();
    }
}