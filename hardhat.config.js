require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.12",
  networks: {
    matic: {
      url : `https://polygon-mumbai.infura.io/v3/1b50862ccbe34a7f90bba5f38a4d08d0`,
      chainId: 80001,
      // confirmations: 2,
      // networkCheckTimeout: 10000,
      // timeoutBlocks: 200,
      // skipDryRun:true,
      accounts: [
        'e0731df9ffe36b7e358cda9113bf7668c0d4e455fa4d0c65c2cad5d27d7191de' // account 2
      ]
    },
  }

};