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


describe('UserOperation Create',function() {
    // async function loadContract(address, abi) {
    //     const provider = new ethers.providers.JsonRpcProvider("https://api.stackup.sh/v1/node/093e60e352135a8b93ba198c8e62138868eb9bfca0147ff9e00da75b267e2b0c"); // Connect to the Matic mainnet (replace with your desired network)
    //     console.log("provider using stackup's node url :",provider);
    //     const wallet = new ethers.Wallet('cba3a1a17a185895d84cf4cf3aef26ba7c3e2f786b92087cbc40c5710f8b6558', provider);
    //     const signer = wallet.provider.getSigner(wallet.address);
    //     const contract = new ethers.Contract(address, abi, signer);
    //     return contract;
    // }

    // it("get predicted smart account address",async function() {
    //   const res = await loadContract(factoryAddress,SimpleAccountFactoryABI.abi);
    //   console.log("loaded simpleAccountFactory Contract :",res)

    //   const result = await res.getAddress('0x05a1D51E80c4e9F1008AFc4956F8eD0A7dd43b88','1');
    //   console.log("result :",result);
    //   // 0x1e87a1Eca600313aE1388D04e71ea473AD468CAE // if I interact with getAddress of the global wallet factory , I get this address
    //   // 0x0Dc570f9aD08D370dCa4D097A9f1b1E477Cb79A2 // res.getAddress('0x05a1D51E80c4e9F1008AFc4956F8eD0A7dd43b88','1') and calling getAddress method
    // })

    // it("createAccount Call to create a smart account using SimpleAccountFactory",async function() {
    //   const provider = new ethers.providers.JsonRpcProvider("https://api.stackup.sh/v1/node/093e60e352135a8b93ba198c8e62138868eb9bfca0147ff9e00da75b267e2b0c"); // Connect to the Matic mainnet (replace with your desired network)
    //   const signer = new ethers.Wallet('cba3a1a17a185895d84cf4cf3aef26ba7c3e2f786b92087cbc40c5710f8b6558',provider);
    //   const new_contract = new ethers.Contract(factoryAddress,factoryABI,signer);
    //   const tx = await new_contract.createAccount('0x05a1D51E80c4e9F1008AFc4956F8eD0A7dd43b88','1');
    //   await tx.wait();
    //   console.log("tx :",tx);
    // })
  
    it("creating a user operation from scratch and then send it to bundler", async function () {
         const sender = "0x0Dc570f9aD08D370dCa4D097A9f1b1E477Cb79A2"; // smart account address
         const nonce = '0'; // used salt's value as 1 at the time of account creation . therefore keeping the nonce same .
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
        //  0xcd11aba8b720ebb64a7d7359fd6af0d9b7977095b921a094b8a745ce520f6888

        const arraifiedHash =  ethers.utils.arrayify(userOpHash);
        // console.log("arraified Hash :",arraifiedHash);
        const provider = new ethers.providers.JsonRpcProvider("https://api.stackup.sh/v1/node/093e60e352135a8b93ba198c8e62138868eb9bfca0147ff9e00da75b267e2b0c"); // Connect to the Matic mainnet (replace with your desired network)
        const signer = new ethers.Wallet('cba3a1a17a185895d84cf4cf3aef26ba7c3e2f786b92087cbc40c5710f8b6558',provider);
        const signature = await signer.signMessage(arraifiedHash);
        // console.log("signature :",signature);
        // 0x39770a3658efac589f5b3fcbf0292061bddae46d88d6c4e3ff1412d1a037b0a633cfda59a27ad7a48d39a8af7d5a5ee8bf6904e294fa354b1c42f7f71727839f1c
        // const options = {
        //   method: "POST",
        //   url: "https://api.stackup.sh/v1/node/093e60e352135a8b93ba198c8e62138868eb9bfca0147ff9e00da75b267e2b0c",
        //   headers: {
        //     accept: "application/json",
        //     "content-type": "application/json",
        //   },
        //   data: {
        //     jsonrpc: "2.0",
        //     id: 1,
        //     method: "eth_sendUserOperation",
        //     params: [
        //       {
        //         sender: "0x0Dc570f9aD08D370dCa4D097A9f1b1E477Cb79A2",
        //         nonce: "0x0",
        //         initCode: '0x',
        //         callData: "0xb61d27f600000000000000000000000053c242cc21d129155acc5fac321abdfe83c35af700000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        //         callGasLimit: "500000",
        //         verificationGasLimit: "200000",
        //         preVerificationGas: "50000",
        //         maxFeePerGas: "1000000000",
        //         maxPriorityFeePerGas: "100000000",
        //         paymasterAndData: "0x",
        //         signature:signature
        //       },
        //       "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        //     ],
        //   },
        // }; 
        // await axios
        //   .request(options)
        //   .then(function (response) {
        //     console.log(response.data);
        //   })
        //   .catch(function (error) {
        //     console.error(error);
        //   });
    });


})

// response data :
// {
//     id: 1,
//     jsonrpc: '2.0',
//     result: '0xde008421d8b663af8e1e13767569241e620f5be13b2ed696dc9d9c8297e3f58d'
//   }