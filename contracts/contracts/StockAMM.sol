// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract StockAMM is Ownable {
    struct StockInfo {
        string ticker;
        string name;
        uint256 cashReserve;
        uint256 shareReserve;
        uint256 basePrice;  // Yesterday's real price (1e18 scaled)
        uint256 lastReset;  // Timestamp of last reset
    }

    StockInfo[] public stocks;
    mapping(address => mapping(uint256 => uint256)) public userShares;

    // Base share liquidity per pool (lower value = more sensitive price bonding curve)
    uint256 public shareLiquidity;

    event StockAdded(uint256 indexed stockId, string ticker, string name, uint256 basePrice);
    event DailyPriceSet(uint256 indexed stockId, uint256 newBasePrice, uint256 timestamp);
    event Trade(
        address indexed user,
        uint256 indexed stockId,
        bool isBuy,
        uint256 amountIn,
        uint256 amountOut,
        uint256 newPrice
    );

    constructor(uint256 _shareLiquidity) Ownable(msg.sender) {
        require(_shareLiquidity > 0, "Invalid liquidity");
        shareLiquidity = _shareLiquidity;
    }

    receive() external payable {}

    function depositNativeLiquidity() external payable {}

    function addStock(string calldata ticker, string calldata name, uint256 basePrice) external onlyOwner returns (uint256) {
        require(bytes(ticker).length > 0, "Empty ticker");
        require(basePrice > 0, "Zero base price");

        uint256 stockId = stocks.length;
        uint256 cashRes = (basePrice * shareLiquidity) / 1e18;

        stocks.push(StockInfo({
            ticker: ticker,
            name: name,
            cashReserve: cashRes,
            shareReserve: shareLiquidity,
            basePrice: basePrice,
            lastReset: block.timestamp
        }));

        emit StockAdded(stockId, ticker, name, basePrice);
        return stockId;
    }

    function addStocksBatch(
        string[] calldata tickers,
        string[] calldata names,
        uint256[] calldata basePrices
    ) external onlyOwner {
        require(tickers.length == names.length && names.length == basePrices.length, "Length mismatch");
        for (uint256 i = 0; i < tickers.length; i++) {
            uint256 stockId = stocks.length;
            uint256 cashRes = (basePrices[i] * shareLiquidity) / 1e18;

            stocks.push(StockInfo({
                ticker: tickers[i],
                name: names[i],
                cashReserve: cashRes,
                shareReserve: shareLiquidity,
                basePrice: basePrices[i],
                lastReset: block.timestamp
            }));

            emit StockAdded(stockId, tickers[i], names[i], basePrices[i]);
        }
    }

    function setDailyBasePrice(uint256 stockId, uint256 realPrice) public onlyOwner {
        require(stockId < stocks.length, "Invalid stock");
        require(realPrice > 0, "Zero price");

        StockInfo storage stock = stocks[stockId];
        stock.cashReserve = (realPrice * shareLiquidity) / 1e18;
        stock.shareReserve = shareLiquidity;
        stock.basePrice = realPrice;
        stock.lastReset = block.timestamp;

        emit DailyPriceSet(stockId, realPrice, block.timestamp);
    }

    function setDailyBasePricesBatch(uint256[] calldata stockIds, uint256[] calldata realPrices) external onlyOwner {
        require(stockIds.length == realPrices.length, "Length mismatch");
        for (uint256 i = 0; i < stockIds.length; i++) {
            setDailyBasePrice(stockIds[i], realPrices[i]);
        }
    }

    function setShareLiquidity(uint256 _shareLiquidity) external onlyOwner {
        require(_shareLiquidity > 0, "Invalid liquidity");
        shareLiquidity = _shareLiquidity;
    }

    function buy(uint256 stockId) external payable {
        uint256 cashAmount = msg.value;
        require(cashAmount > 0, "Zero MON sent");
        require(stockId < stocks.length, "Invalid stock");

        StockInfo storage stock = stocks[stockId];

        uint256 sharesOut = (stock.shareReserve * cashAmount) / (stock.cashReserve + cashAmount);
        require(sharesOut > 0, "No shares received");
        require(sharesOut <= stock.shareReserve, "Insufficient liquidity");

        stock.cashReserve += cashAmount;
        stock.shareReserve -= sharesOut;
        userShares[msg.sender][stockId] += sharesOut;

        uint256 newPrice = getPrice(stockId);

        emit Trade(msg.sender, stockId, true, cashAmount, sharesOut, newPrice);
    }

    function sell(uint256 stockId, uint256 shareAmount) external {
        require(shareAmount > 0, "Zero amount");
        require(stockId < stocks.length, "Invalid stock");
        require(userShares[msg.sender][stockId] >= shareAmount, "Insufficient share balance");

        StockInfo storage stock = stocks[stockId];
        require(shareAmount <= stock.shareReserve, "Insufficient shares in reserve");

        uint256 cashOut = (stock.cashReserve * shareAmount) / (stock.shareReserve + shareAmount);
        require(cashOut > 0, "No cash received");
        require(cashOut <= stock.cashReserve, "Insufficient cash reserve");
        require(cashOut <= address(this).balance, "Insufficient native MON in contract");

        userShares[msg.sender][stockId] -= shareAmount;
        stock.shareReserve += shareAmount;
        stock.cashReserve -= cashOut;

        (bool sent, ) = payable(msg.sender).call{value: cashOut}("");
        require(sent, "Native MON transfer failed");

        uint256 newPrice = getPrice(stockId);

        emit Trade(msg.sender, stockId, false, shareAmount, cashOut, newPrice);
    }

    function getUserShares(address user, uint256 stockId) external view returns (uint256) {
        require(stockId < stocks.length, "Invalid stock");
        return userShares[user][stockId];
    }

    function getPrice(uint256 stockId) public view returns (uint256) {
        require(stockId < stocks.length, "Invalid stock");
        if (stocks[stockId].shareReserve == 0) return 0;
        return (stocks[stockId].cashReserve * 1e18) / stocks[stockId].shareReserve;
    }

    function getTicker(uint256 stockId) external view returns (string memory) {
        require(stockId < stocks.length, "Invalid stock");
        return stocks[stockId].ticker;
    }

    function getStockCount() external view returns (uint256) {
        return stocks.length;
    }

    function getStock(uint256 stockId) external view returns (
        string memory ticker,
        string memory name,
        uint256 cashReserve,
        uint256 shareReserve,
        uint256 basePrice,
        uint256 lastReset,
        uint256 currentPrice
    ) {
        require(stockId < stocks.length, "Invalid stock");
        StockInfo storage stock = stocks[stockId];
        return (
            stock.ticker,
            stock.name,
            stock.cashReserve,
            stock.shareReserve,
            stock.basePrice,
            stock.lastReset,
            getPrice(stockId)
        );
    }
}