require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

const { PRIVATE_KEY, AMOY_RPC_URL, ETHERSCAN_API_KEY } = process.env;

module.exports = {
  solidity: "0.8.22",
  networks: {
    hardhat: {},
    ...(AMOY_RPC_URL
      ? {
          amoy: {
            url: AMOY_RPC_URL,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
            chainId: 80002,
          },
        }
      : {}),
  },
  etherscan: {
    apiKey: {
      polygonAmoy: ETHERSCAN_API_KEY || "",
    },
  },
};
