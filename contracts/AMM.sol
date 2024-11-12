// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

// [] Manage Pool
// [] Manage Deposits
// [] Manage Withdrawals
// [] Facilitate Swaps
contract AMM {
    Token public token1;
    Token public token2;

    uint public token1Balance;
    uint public token2Balance;
    uint public K;

    uint public totalShares;
    mapping(address => uint) public shares;
    uint constant PRECISION = 10 ** 18;

    constructor(Token _token1, Token _token2) {
        token1 = _token1;
        token2 = _token2;
    }

    function addLiquidity(uint _token1Amount, uint _token2Amount) external {
        require(
            token1.transferFrom(msg.sender, address(this), _token1Amount),
            "Failed to transfer token1 from sender"
        );
        require(
            token2.transferFrom(msg.sender, address(this), _token2Amount), 
            "Failed to transfer token2 from sender"
        );

        // Issue shares
        uint share;
        // If no shares, issue 100% of the pool
        if (totalShares == 0) {
            share = 100 * PRECISION;
        } else {
            uint share1 = (totalShares * _token1Amount) / token1Balance; // get share of token1
            uint share2 = (totalShares * _token2Amount) / token2Balance; // get share of token2
            require((share1 / 10**3) == (share2 / 10**3), "Shares must be equal");
            share = share1;
        }

        // Manage Pool
        token1Balance += _token1Amount;
        token2Balance += _token2Amount;
        K = token1Balance * token2Balance; // x * y = k (formula for constant product AMM)

        // Update shares
        totalShares += share;
        shares[msg.sender] += share;
    }

    // Determine how many token2 tokens must be deposited to get a certain amount of token1 tokens
    function calculateToken2Deposit(uint _token1Amount) public view returns (uint token2Amount) {
        token2Amount = (token2Balance * _token1Amount) / token1Balance;
    }

    // Determine how many token1 tokens must be deposited to get a certain amount of token2 tokens
    function calculateToken1Deposit(uint _token2Amount) public view returns (uint token1Amount) {
        token1Amount = (token1Balance * _token2Amount) / token2Balance;
    }

    function calculateToken1Swap(uint _token1Amount) public view returns (uint token2Amount) {
        // Calculate token 2 amount
        uint token1After = token1Balance + _token1Amount;
        uint token2After = K / token1After;
        token2Amount = token2Balance - token2After;

        if (token2Amount == token2Balance) {
            token2Amount--;
        }

        require(token2Amount < token2Balance, "Swap cannot exceed token2 balance");
    }

    function swapExactInput(uint _token1Amount) external returns (uint token2Amount) {
        // Calculate token 2 amount
        token2Amount = calculateToken1Swap(_token1Amount);

        // Do swap

        // Emit event

    }

    function swapExactOutput(uint _token2Amount) external returns (uint token1Amount) {

    }
}
