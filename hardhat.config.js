require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");

const bscURL = 'https://bsc-dataseed.binance.org' //`https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_RINKEBY}`
const mainnetURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_MAINNET}`
const maticURL = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_MATIC}`
const baseURL = 'https://mainnet.base.org';
const optimismURL = 'https://optimism.llamarpc.com';

module.exports = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      //gasPrice: "auto",
      
      chainId: 137,
      forking: {
        url: maticURL
      }
    },
    bsc: {
      url: bscURL,
      chainId: 56,
      //gasPrice: "auto",
      accounts: [
        process.env.private_key,
        process.env.private_key_auxiliary,
        process.env.private_key_releasemanager,
        process.env.private_key_voting
      ],
      saveDeployments: true
    },
    polygon: {
      url: maticURL,
      chainId: 137,
      //gasPrice: "auto",
      accounts: [
        process.env.private_key,
        process.env.private_key_auxiliary,
        process.env.private_key_releasemanager,
        process.env.private_key_voting
      ],
      saveDeployments: true
    },
    mainnet: {
      url: mainnetURL,
      chainId: 1,
      //gasPrice: 20000000000,
      accounts: [
        process.env.private_key,
        process.env.private_key_auxiliary,
        process.env.private_key_releasemanager,
        process.env.private_key_voting
      ],
      saveDeployments: true
    },
    base: {
      url: baseURL,
      chainId: 8453,
      accounts: [
        process.env.private_key,
        process.env.private_key_auxiliary,
        process.env.private_key_releasemanager,
        process.env.private_key_voting
      ],
      saveDeployments: true
    },
    optimisticEthereum: {
      url: optimismURL,
      chainId: 10,
      accounts: [
        process.env.private_key,
        process.env.private_key_auxiliary,
        process.env.private_key_releasemanager,
        process.env.private_key_voting
      ],
      saveDeployments: true
    }
  },
  etherscan: {
    apiKey: {
      polygon: process.env.MATIC_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY,
      mainnet: process.env.ETHERSCAN_API_KEY,
      optimisticEthereum: process.env.OPTIMISM_API_KEY,
      base: process.env.BASE_API_KEY
    }
  },
  solidity: {
    compilers: [
        {
          version: "0.8.11",
          settings: {
            optimizer: {
              enabled: true,
              runs: 200,
            },
            metadata: {
              // do not include the metadata hash, since this is machine dependent
              // and we want all generated code to be deterministic
              // https://docs.soliditylang.org/en/v0.7.6/metadata.html
              bytecodeHash: "none",
            },
          },
        },
        {
          version: "0.6.7",
          settings: {},
          settings: {
            optimizer: {
              enabled: false,
              runs: 200,
            },
            metadata: {
              // do not include the metadata hash, since this is machine dependent
              // and we want all generated code to be deterministic
              // https://docs.soliditylang.org/en/v0.7.6/metadata.html
              bytecodeHash: "none",
            },
          },
        },
      ],
  
    
  },

  namedAccounts: {
    deployer: 0,
    },

  paths: {
    sources: "contracts",
  },
  gasReporter: {
    currency: 'USD',
    enabled: (process.env.REPORT_GAS === "true") ? true : false
  },
  mocha: {
    timeout: 200000
  }
 
}
