// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/PlayMoney.sol";
import "../contracts/StockAMM.sol";

contract StockAMMTest is Test {
    PlayMoney public simUsd;
    StockAMM public amm;
    uint256 constant SHARE_LIQUIDITY = 2_000 * 10 ** 18; // sensitive bonding curve

    function setUp() external {
        simUsd = new PlayMoney();
        amm = new StockAMM(address(simUsd), SHARE_LIQUIDITY);

        // Add test stock
        amm.addStock("AAPL", "Apple Inc.", 220 * 10 ** 18);
        amm.addStock("TSLA", "Tesla Inc.", 200 * 10 ** 18);

        // Mint liquidity to AMM contract
        simUsd.mint(address(amm), 1_000_000 * 10 ** 18);
    }

    function testClaimingFunds() external {
        simUsd.claimStarterFunds();
        uint256 balance = simUsd.balanceOf(address(this));
        assertEq(balance, 100_000 * 10 ** 18);
    }

    function testGetStockCount() external view {
        assertEq(amm.getStockCount(), 2);
    }

    function testGetPriceReturnsRealBasePriceInitially() external view {
        uint256 price = amm.getPrice(0);
        assertEq(price, 220 * 10 ** 18);
    }

    function testBuyingMovesPriceUpSensitively() external {
        simUsd.claimStarterFunds();
        uint256 priceBefore = amm.getPrice(0);

        simUsd.approve(address(amm), type(uint256).max);
        amm.buy(0, 1_000 * 10 ** 18);

        uint256 priceAfter = amm.getPrice(0);
        assertGt(priceAfter, priceBefore);
    }

    function testSellingMovesPriceDown() external {
        simUsd.claimStarterFunds();
        simUsd.approve(address(amm), type(uint256).max);

        amm.buy(0, 1_000 * 10 ** 18);
        uint256 priceBefore = amm.getPrice(0);

        amm.sell(0, 2 * 10 ** 18);

        uint256 priceAfter = amm.getPrice(0);
        assertLt(priceAfter, priceBefore);
    }

    function testSetDailyBasePriceResetsPrice() external {
        simUsd.claimStarterFunds();
        simUsd.approve(address(amm), type(uint256).max);

        // Price moves up due to buy
        amm.buy(0, 10_000 * 10 ** 18);
        assertGt(amm.getPrice(0), 220 * 10 ** 18);

        // Owner resets price to new real close (e.g. 230 SUSD)
        amm.setDailyBasePrice(0, 230 * 10 ** 18);

        assertEq(amm.getPrice(0), 230 * 10 ** 18);
    }

    function testAddStocksBatch() external {
        string[] memory tickers = new string[](2);
        string[] memory names = new string[](2);
        uint256[] memory basePrices = new uint256[](2);

        tickers[0] = "NVDA"; names[0] = "NVIDIA"; basePrices[0] = 125 * 10 ** 18;
        tickers[1] = "MSFT"; names[1] = "Microsoft"; basePrices[1] = 400 * 10 ** 18;

        amm.addStocksBatch(tickers, names, basePrices);
        assertEq(amm.getStockCount(), 4);
    }
}