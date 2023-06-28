import { HardhatUserConfig, task } from "hardhat/config";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-toolbox";

import "./tasks/hello";
// import "./tasks/balance";
// import "./tasks/accounts";
// import "./tasks/wtonApproveAndCall";


import dotenv from "dotenv" ;
dotenv.config();

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`
      },
      // mining: {
      //   auto: false,
      //   interval: 0
      // },
      allowUnlimitedContractSize: false,
    },
    // hardhat: {
    //   chainId: 31337,
    // },
    local: {
      chainId: 31337,
      url: `http://127.0.0.1:8545/`,
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_MAINNET}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
      gasPrice: 20000000000
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
    tokamakGoerli : {
      url: `https://goerli.optimism.tokamak.network`,
      accounts: [`${process.env.PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: "0.8.17",
};

export default config;
