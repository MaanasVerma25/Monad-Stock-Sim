// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlayMoney is ERC20, Ownable {
    mapping(address => bool) public hasClaimed;
    uint256 public constant STARTER_FUNDS = 100_000 * 10 ** 18;

    constructor() ERC20("SimUSD", "SUSD") Ownable(msg.sender) {}

    function claimStarterFunds() external {
        require(!hasClaimed[msg.sender], "Already claimed");
        _mint(msg.sender, STARTER_FUNDS);
        hasClaimed[msg.sender] = true;
    }
}