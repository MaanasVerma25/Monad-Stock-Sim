export const PLAY_MONEY_ADDRESS = process.env.NEXT_PLAY_MONEY_ADDRESS || "0x0000000000000000000000000000000000000000";
export const STOCK_AMM_ADDRESS = process.env.NEXT_STOCK_AMM_ADDRESS || "0x0000000000000000000000000000000000000000";

export const playMoneyAbi = [
  "function balanceOf(address) view returns (uint256)",
  "function claimStarterFunds() external",
] as const;

export const stockAmmAbi = [
  "function buy(uint8, uint256) external",
  "function sell(uint8, uint256) external",
  "function getPrice(uint8) view returns (uint256)",
  "function getTicker(uint8) view returns (string)",
  "event Trade(address indexed user, uint8 indexed stockId, bool isBuy, uint256 amountIn, uint256 amountOut, uint256 newPrice)",
] as const;

export const STOCKS = [
  { id: 0, ticker: "MNDX" },
  { id: 1, ticker: "CHAI" },
  { id: 2, ticker: "VIBE" },
  { id: 3, ticker: "GRIT" },
  { id: 4, ticker: "TECH" },
] as const;