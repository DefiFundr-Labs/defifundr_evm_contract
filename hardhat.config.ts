import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";
import "dotenv/config";

// Ensure private keys are available
const PRIVATE_KEY_LOCAL = process.env.PRIVATE_KEY_LOCAL || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const PRIVATE_KEY_TESTNET = process.env.PRIVATE_KEY_TESTNET || PRIVATE_KEY_LOCAL;
const PRIVATE_KEY_MAINNET = process.env.PRIVATE_KEY_MAINNET || PRIVATE_KEY_LOCAL;

const config: HardhatUserConfig = {
  // Solidity compiler configuration
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200, // Optimize for deployment cost
          },
          viaIR: true, // Enable intermediate representation for better optimization
        },
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
    settings: {
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },

  // Network configurations
  networks: {
    // Local development network
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [PRIVATE_KEY_LOCAL],
      chainId: 31337,
      gas: "auto",
      gasPrice: "auto",
    },

    // Hardhat network for testing
    hardhat: {
      chainId: 31337,
      gas: "auto",
      gasPrice: "auto",
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 20,
        accountsBalance: "10000000000000000000000", // 10,000 ETH
      },
      forking: process.env.MAINNET_RPC_URL ? {
        url: process.env.MAINNET_RPC_URL,
        enabled: false, // Enable when needed for mainnet forking
      } : undefined,
    },

    // Ethereum Mainnet
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: PRIVATE_KEY_MAINNET ? [PRIVATE_KEY_MAINNET] : [],
      chainId: 1,
      gas: "auto",
      gasPrice: "auto",
      timeout: 60000,
    },

    // Ethereum Sepolia Testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/",
      accounts: PRIVATE_KEY_TESTNET ? [PRIVATE_KEY_TESTNET] : [],
      chainId: 11155111,
      gas: "auto",
      gasPrice: "auto",
      timeout: 60000,
    },

    // Polygon Mainnet
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: PRIVATE_KEY_MAINNET ? [PRIVATE_KEY_MAINNET] : [],
      chainId: 137,
      gas: "auto",
      gasPrice: "auto",
      timeout: 60000,
    },

    // Polygon Mumbai Testnet (Note: Mumbai is deprecated, use Amoy)
    polygonAmoy: {
      url: "https://rpc-amoy.polygon.technology/",
      accounts: PRIVATE_KEY_TESTNET ? [PRIVATE_KEY_TESTNET] : [],
      chainId: 80002,
      gas: "auto",
      gasPrice: "auto",
      timeout: 60000,
    },

    // BSC Mainnet
    bsc: {
      url: process.env.BSC_RPC_URL || "https://bsc-dataseed1.binance.org",
      accounts: PRIVATE_KEY_MAINNET ? [PRIVATE_KEY_MAINNET] : [],
      chainId: 56,
      gas: "auto",
      gasPrice: "auto",
      timeout: 60000,
    },

    // BSC Testnet
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: PRIVATE_KEY_TESTNET ? [PRIVATE_KEY_TESTNET] : [],
      chainId: 97,
      gas: "auto",
      gasPrice: "auto",
      timeout: 60000,
    },
  },

  // Etherscan verification configuration
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      }
    ]
  },

  // Gas reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 20, // gwei
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    outputFile: "gasReporterOutput.json",
    noColors: false,
    reportFormat: "markdown",
    onlyCalledMethods: true,
    excludeContracts: ["contracts/mocks/", "contracts/test/"],
    proxyResolver: "EIP1967",
  },

  // Path configurations
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: "./deploy",
    deployments: "./deployments",
  },

  // Mocha testing configuration
  mocha: {
    timeout: 40000,
    reporter: "spec",
    slow: 300,
    bail: false,
  },

  // TypeChain configuration
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["externalArtifacts/*.json"],
    dontOverrideCompile: false,
  },
};

export default config;