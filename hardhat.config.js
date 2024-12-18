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
      accounts: [`${process.env.PRIVATE_KEY}`, `${process.env.PRIVATE_KEY_2}`, `${process.env.PRIVATE_KEY_3}`, `${process.env.PRIVATE_KEY_4}`, `${process.env.PRIVATE_KEY_5}`],
      gas: 5000000,
      gasPrice: 20000000000,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      chainId: 11155111,
      accounts: [`${process.env.PRIVATE_KEY}`],
    } 
  },
  etherscan: {
    apiKey: "ABCD",
    customChains: [
      {
        network: "cc3",
        chainId: 102031,
        urls: {
          apiURL: "https://creditcoin-testnet.blockscout.com/api",
          browserURL: "https://creditcoin-testnet.blockscout.com/",
        },
      }
    ]
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }
};
