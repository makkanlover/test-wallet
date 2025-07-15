import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";
import * as dotenv from "dotenv";
dotenv.config();

// Default dummy private key for CI environments (never use in production)
const DEFAULT_PRIVATE_KEY = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    sepolia: {
      url: process.env.ETHEREUM_RPC_URL || "https://sepolia.infura.io/v3/dummy",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY.replace(/^0x/, '')}`] : [`0x${DEFAULT_PRIVATE_KEY}`],
      chainId: 11155111
    },
    amoy: {
      url: process.env.POLYGON_RPC_URL || "https://amoy.infura.io/v3/dummy",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY.replace(/^0x/, '')}`] : [`0x${DEFAULT_PRIVATE_KEY}`],
      chainId: 80002
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "dummy",
      amoy: process.env.POLYGONSCAN_API_KEY || "dummy"
    },
    customChains: [
      {
        network: "amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      }
    ]
  }
};

export default config;