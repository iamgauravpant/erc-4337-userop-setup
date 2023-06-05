const { BigNumberish } = require("ethers");
const axios = require('axios');
const {ethers} = require('ethers');
const fs = require("fs");
const hre = require('hardhat');
const { hexConcat } = require('ethers/lib/utils');

const EntryPoint_Addr = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const contractJSON = fs.readFileSync('./artifacts/contracts/core/EntryPoint.sol/EntryPoint.json');

const contractData = JSON.parse(contractJSON);
const contractABI = contractData.abi;
// console.log("contractABI :",contractABI)

const SimpleAccount_Owner = "0x53C242Cc21d129155aCC5FAc321abDfe83C35Af7"; // simple account owner

const salt = 1;

const StackUp_Bundler_URL = "https://api.stackup.sh/v1/node/093e60e352135a8b93ba198c8e62138868eb9bfca0147ff9e00da75b267e2b0c";

const RECEIVER_ADDR = "0x53C242Cc21d129155aCC5FAc321abDfe83C35Af7"; // sending ether to this address

const SimpleAccountFactoryABI = JSON.parse(
  fs.readFileSync("./artifacts/contracts/samples/SimpleAccountFactory.sol/SimpleAccountFactory.json", "utf8")
);
const SimpleAccountFactory_ADDR = "0x8cB0E6E6C8fF4637Ca0aDDd7F304F73e7e931814"; // my factory
const factoryAddress = '0x9406Cc6185a346906296840746125a0E44976454'; // constant // deployed globally


const accountJSON = fs.readFileSync('./artifacts/contracts/samples/SimpleAccount.sol/SimpleAccount.json');
const accountData = JSON.parse(accountJSON);
const accountABI = accountData.abi;


const factoryJSON = fs.readFileSync('./artifacts/contracts/samples/SimpleAccountFactory.sol/SimpleAccountFactory.json');
const factoryData = JSON.parse(factoryJSON);
const factoryABI = factoryData.abi;


describe('UserOperation Create',function() {
    async function loadContract(address, abi) {
        const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/1b50862ccbe34a7f90bba5f38a4d08d0"); // Connect to the Matic mainnet (replace with your desired network)
        const wallet = new ethers.Wallet('0f2b78e19bc8f13e28b81af396a786c5c747300fd8fe69503e33877a2a54dcc4', provider);
        const signer = wallet.provider.getSigner(wallet.address);
        const contract = new ethers.Contract(address, abi, signer);
        return contract;
    }

    // it("get predicted smart account address",async function() {
    //   const res = await loadContract(factoryAddress,SimpleAccountFactoryABI.abi);
    //   console.log("loaded simpleAccountFactory Contract :",res)

    //   const result = await res.getAddress('0x53C242Cc21d129155aCC5FAc321abDfe83C35Af7','1');
    //   console.log("result :",result);
    //   // 0x1e87a1Eca600313aE1388D04e71ea473AD468CAE // if I interact with getAddress of the global wallet factory , I get this address
    // })

    // it("createAccount Call to create a smart account using SimpleAccountFactory",async function() {
    //   const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/1b50862ccbe34a7f90bba5f38a4d08d0"); // Connect to the Matic mainnet (replace with your desired network)
    //   const signer = new ethers.Wallet('0f2b78e19bc8f13e28b81af396a786c5c747300fd8fe69503e33877a2a54dcc4',provider);
    //   const new_contract = new ethers.Contract(factoryAddress,factoryABI,signer);
    //   const tx = await new_contract.createAccount('0x53C242Cc21d129155aCC5FAc321abDfe83C35Af7','1');
    //   await tx.wait();
    //   console.log("tx :",tx);
    // })
  
    it("creating a user operation from scratch and then send it to bundler", async function () {
         const sender = "0x1e87a1Eca600313aE1388D04e71ea473AD468CAE"; // smart account address
         const nonce = '1'; // used salt's value as 1 at the time of account creation . therefore keeping the nonce same .
         const callGasLimit = '500000';
         const verificationGasLimit = '200000';
         const preVerificationGas = '50000';
         const maxFeePerGas = '1000000000'; // adjust the value according to your needs
         const maxPriorityFeePerGas = '100000000'; // adjust the value according to your needs
    
         const account = new ethers.utils.Interface(accountABI); // ethers code
         const amount = '1000000000000000'; // amount to send to RECEIVER_ADDR

         const calldata = account.encodeFunctionData('execute',[RECEIVER_ADDR, amount, "0x"]);
         console.log("calldata :", calldata);
         // 0xb61d27f600000000000000000000000053c242cc21d129155acc5fac321abdfe83c35af700000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
    
         const getUserOpHash = () => {
            const packed = ethers.utils.defaultAbiCoder.encode(
              [
                "address",
                "uint256",
                "bytes32",
                "bytes32",
                "uint256",
                "uint256",
                "uint256",
                "uint256",
                "uint256",
                "bytes32",
              ],
              [
                sender,
                nonce,
                ethers.utils.keccak256('0x'),
                ethers.utils.keccak256('0xb61d27f600000000000000000000000053c242cc21d129155acc5fac321abdfe83c35af700000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000'),
                callGasLimit,
                verificationGasLimit,
                preVerificationGas,
                maxFeePerGas,
                maxPriorityFeePerGas,
                ethers.utils.keccak256('0x'),
              ]
            );
        
            const enc = ethers.utils.defaultAbiCoder.encode(
              ["bytes32", "address", "uint256"],
              [ethers.utils.keccak256(packed), EntryPoint_Addr, 80001]
            );
        
            return ethers.utils.keccak256(enc);
         }

         const userOpHash = getUserOpHash();
         console.log("userOpHash :",userOpHash);
        //  0x1a23a91638f4a6c594c64b1b17bb930f9505c244b7a9cbc7065213bfccc71ba9

        const arraifiedHash =  ethers.utils.arrayify(userOpHash);
        console.log("arraified Hash :",arraifiedHash);

        const signature = '0xf6b23936cd6c81d6d0a4397def0e430de208c0d2524c4c38297ce994e9bed6c733aef579aeed9d2d86c46bcfce30216da60b1ddeea365d42cd4253d8b4dc67c81c'; // signature of UserOpHash
        const arraifiedHashSigWeb3Js = '0xf87966d2d994e106c9cc2f64158f0d5e6e74f24181e22784863c60043bd6052241c92dee50810a297d8f53c70c524322fa93d7309fcbaea5c555f97764cf5de91c';
        const newArraifiedHashSig = '0x1dccd54065c2d91cf6d6320cb8efb6715dec1b1d5471980a3ffb4d0c4be32e720ea5d056142dacdf8b84acd2e0220b7081b9218d9bd5f444a422da1c4069ff461b';
        const options = {
          method: "POST",
          url: "https://api.stackup.sh/v1/node/093e60e352135a8b93ba198c8e62138868eb9bfca0147ff9e00da75b267e2b0c",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          data: {
            jsonrpc: "2.0",
            id: 1,
            method: "eth_sendUserOperation",
            params: [
              {
                sender: "0x1e87a1Eca600313aE1388D04e71ea473AD468CAE",
                nonce: "0x0",
                initCode: '0x',
                callData: "0xb61d27f600000000000000000000000053c242cc21d129155acc5fac321abdfe83c35af700000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
                callGasLimit: "500000",
                verificationGasLimit: "200000",
                preVerificationGas: "50000",
                maxFeePerGas: "1000000000",
                maxPriorityFeePerGas: "100000000",
                paymasterAndData: "0x",
                signature:newArraifiedHashSig
              },
              "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
            ],
          },
        }; 
        await axios
          .request(options)
          .then(function (response) {
            console.log(response.data);
          })
          .catch(function (error) {
            console.error(error);
          });
      });

      // it("signature creation ",async function() {
      //   // const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/1b50862ccbe34a7f90bba5f38a4d08d0"); // Connect to the Matic mainnet (replace with your desired network)
      //   // // https://polygon-mumbai.g.alchemy.com/v2/f9Sxv5TpakC1vzP6cOJzdkkm7vKiPYbF // alchemy url
      //   // const wallet = new ethers.Wallet('0f2b78e19bc8f13e28b81af396a786c5c747300fd8fe69503e33877a2a54dcc4', provider);
      //   // const signer = wallet.provider.getSigner(wallet.address);
      //   // console.log("signer :",signer)
      //   // const signature =  await signer.signMessage([
      //   //   202,  53,  94, 164, 183,  45, 173,  82,
      //   //   200,  34, 170,  74,  33, 255, 253, 225,
      //   //    54, 149, 230, 209,  59, 127,   4, 150,
      //   //   113, 219,  22, 107, 189,  80, 207, 247
      //   // ]);
      //   // console.log("signature :",signature);

      //   // const options = {
      //   //   method: "POST",
      //   //   url: "https://polygon-mumbai.infura.io/v3/1b50862ccbe34a7f90bba5f38a4d08d0",
      //   //   headers: {
      //   //     accept: "application/json",
      //   //     "content-type": "application/json",
      //   //   },
      //   //   data: {
      //   //     jsonrpc: "2.0",
      //   //     id: 3,
      //   //     method: "account_signData",
      //   //     params: ["data/plain",'0x53C242Cc21d129155aCC5FAc321abDfe83C35Af7', '0x1a23a91638f4a6c594c64b1b17bb930f9505c244b7a9cbc7065213bfccc71ba9']
      //   //   },
      //   // }; 
      //   // await axios
      //   //   .request(options)
      //   //   .then(function (response) {
      //   //     console.log(response.data);
      //   //   })
      //   //   .catch(function (error) {
      //   //     console.error(error);
      //   //   });

      // })

})


// after smart account is deployed 
// {
//   error: {
//     code: -32602,
//     data: 'sender: already deployed, initCode must be empty',
//     message: 'sender: already deployed, initCode must be empty'
//   },
//   id: 1,
//   jsonrpc: '2.0'
// }

// smart account created , transaction hash below 
// https://mumbai.polygonscan.com/tx/0x7fcd4fb876639338078ec680791ccfc55c58a11574eeda36682279197b0069f5