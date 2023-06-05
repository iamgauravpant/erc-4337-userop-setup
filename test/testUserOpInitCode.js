const axios = require('axios');
const {ethers} = require('ethers');
const fs = require("fs");

const EntryPoint_Addr = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const contractJSON = fs.readFileSync('./artifacts/contracts/core/EntryPoint.sol/EntryPoint.json');

const contractData = JSON.parse(contractJSON);
const contractABI = contractData.abi;

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

// this test file contains the code for directly creating a smart account with the help of 
// User Operation , error 
describe('UserOperation Create',function() {

    async function loadContract(address, abi) {
        const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/1b50862ccbe34a7f90bba5f38a4d08d0"); // Connect to the Matic mainnet (replace with your desired network)
        const wallet = new ethers.Wallet('ba4a8190735e865430839024f7c7e8fbc68fb3ce7837372e3015d01735def721', provider);
        const signer = wallet.provider.getSigner(wallet.address);
        const contract = new ethers.Contract(address, abi, signer);
        return contract;
    }

    it("get predicted smart account address by calling getAddress method of factory",async function() {
      const res = await loadContract(factoryAddress,SimpleAccountFactoryABI.abi);
      console.log("loaded simpleAccountFactory Contract :",res)
      const result = await res.getAddress('0x2A0Ef00c892Fc00eCB699048860C3526558c1Fc3','0');
      console.log("result :",result);
      // 0x6d77185684Ec60d9Ff158b00e8787FB5A857eE74 ('0x2A0Ef00c892Fc00eCB699048860C3526558c1Fc3','0') // skipping creating part for this
    });

    // it("createAccount Call to create a smart account using SimpleAccountFactory to eliminate the need of initCode",async function() {
    //   const provider = new ethers.providers.JsonRpcProvider("https://api.stackup.sh/v1/node/093e60e352135a8b93ba198c8e62138868eb9bfca0147ff9e00da75b267e2b0c"); // Connect to the Matic mainnet (replace with your desired network)
    //   const signer = new ethers.Wallet('f75282482b0d8891a566611145216832d4ad935b69ef290a6e1fef0f86c4e630',provider);
    //   const new_contract = new ethers.Contract(factoryAddress,factoryABI,signer);
    //   const tx = await new_contract.createAccount('0xf74174761bd8d163eAF5604083C1A40CE569Ea67','1');
    //   await tx.wait();
    //   console.log("tx :",tx);
    // })
  
    it("creating a user operation from scratch and then send it to bundler", async function () {
         const sender = "0x6d77185684Ec60d9Ff158b00e8787FB5A857eE74"; // smart account address
         const nonce = '0'; // used salt's value as 1 at the time of account creation . therefore keeping the nonce same .
         const callGasLimit = '500000';
         const verificationGasLimit = '500000';
         const preVerificationGas = '500000';
         const maxFeePerGas = '1000000000'; 
         const maxPriorityFeePerGas = '100000000';

         //  calldata contains data about what action we want our smart account to take 
         const account = new ethers.utils.Interface(accountABI); // ethers code
         const amount = '100000000000000000'; // amount to send to RECEIVER_ADDR
         const calldata = account.encodeFunctionData('execute',[RECEIVER_ADDR, amount, "0x"]);
         console.log("calldata :", calldata);
        
        // what if the smart account is not deployed yet ? 
        // we need initCode in that case , created initCode but it is failing // Reference : StackUp
        const factory = new ethers.utils.Interface(factoryABI);
        const initCode = ethers.utils.hexConcat([
            factoryAddress,
            factory.encodeFunctionData('createAccount',['0x2A0Ef00c892Fc00eCB699048860C3526558c1Fc3','0'])
        ]);
        console.log("initCode :",initCode);
   
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
                ethers.utils.keccak256(initCode),
                ethers.utils.keccak256(calldata),
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
              [ethers.utils.keccak256(packed), EntryPoint_Addr, '80001']
            );
        
            return ethers.utils.keccak256(enc);
        }

        const userOpHash = getUserOpHash();
        console.log("userOpHash :",userOpHash);

        const arraifiedHash =  ethers.utils.arrayify(userOpHash);
        console.log("arraified Hash :",arraifiedHash);

        const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/1b50862ccbe34a7f90bba5f38a4d08d0"); // Connect to the Matic mainnet (replace with your desired network)
        const signer = new ethers.Wallet('ba4a8190735e865430839024f7c7e8fbc68fb3ce7837372e3015d01735def721',provider);
        const signature = await signer.signMessage(arraifiedHash);
        console.log("signature :",signature);

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
                sender: sender,
                nonce: nonce,
                initCode: initCode,
                callData: calldata,
                callGasLimit: callGasLimit,
                verificationGasLimit: verificationGasLimit,
                preVerificationGas: preVerificationGas,
                maxFeePerGas: maxFeePerGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                paymasterAndData: "0x",
                signature:signature
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

});


// if smart account is not deployed before sending the user operation , I get an error 

// {
//     error: {
//       code: -32500,
//       data: 'AA13 initCode failed or OOG',
//       message: 'AA13 initCode failed or OOG'
//     },
//     id: 1,
//     jsonrpc: '2.0'
// }



// corrected , initcode error , problem was with gas fields , learn more about gas
// {
//     id: 1,
//     jsonrpc: '2.0',
//     result: '0x2cd484491638a54bce73c57f98b8527cbad029e0ca01755f3eb7c5745a458013'
//   }