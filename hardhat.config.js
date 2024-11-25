require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat:{
      allowUnlimitedContractSize: true,
    },   
    localhost:{
      url: "http://localhost:8545"
    },
    cc3: {
      url: 'https://rpc.cc3-testnet.creditcoin.network',
      chainId: 102031,
      accounts: [`${process.env.PRIVATE_KEY}`],
      gas: 5000000,
      gasPrice: 20000000000,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      chainId: 11155111,
      accounts: [`${process.env.PRIVATE_KEY}`],
    } 
  },
};
