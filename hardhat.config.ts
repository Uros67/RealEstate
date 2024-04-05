import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@nomicfoundation/hardhat-ethers';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import "hardhat-gas-reporter";
import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";


const COINMARKETCAP_API_KEY = "9d88fd3a-8de4 - 42e3 - aa67 - 82d73924e2b9";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.19"
      },
      {
        version: "0.8.20"
      },
    ],
  },
  mocha: {
    timeout: 100000000,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    noColors: true,
  },

  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
};

export default config;
