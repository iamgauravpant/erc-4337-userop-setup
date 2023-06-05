const {ethers} = require('ethers');
const fs = require("fs");
const axios = require('axios');

const EntryPoint_Addr = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

const AddSubtractADDR = '0xf148643c7a83605FB512B0889863B23dbD98Af97';
const addSubtractJSON = fs.readFileSync('./artifacts/contracts/samples/AddSubtract.sol/AddSubtract.json');
const addSubtractData = JSON.parse(addSubtractJSON);
const addSubtractABI = addSubtractData.abi;

const SmartAccountAddr = '0x6d77185684Ec60d9Ff158b00e8787FB5A857eE74';

const accountJSON = fs.readFileSync('./artifacts/contracts/samples/SimpleAccount.sol/SimpleAccount.json');
const accountData = JSON.parse(accountJSON);
const accountABI = accountData.abi;

describe('Smart Account Interaction with AddSubtract contract',function() {
    async function loadContract(address, abi) {
        const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/1b50862ccbe34a7f90bba5f38a4d08d0"); // Connect to the Matic mainnet (replace with your desired network)
        const wallet = new ethers.Wallet('ba4a8190735e865430839024f7c7e8fbc68fb3ce7837372e3015d01735def721', provider);
        const signer = wallet.provider.getSigner(wallet.address);
        const contract = new ethers.Contract(address, abi, signer);
        return contract;
    }
    it("get current initial value",async function() {
        const res = await loadContract(AddSubtractADDR,addSubtractABI);
        const result = await res.current();
        const resultDecimal = ethers.BigNumber.from(result).toNumber();
        console.log("current value :",resultDecimal);
    });
    
    // it("create a userOperation to call addBy10()",async function() {
    //     const provider = new ethers.providers.JsonRpcProvider("https://api.stackup.sh/v1/node/093e60e352135a8b93ba198c8e62138868eb9bfca0147ff9e00da75b267e2b0c"); // Connect to the Matic mainnet (replace with your desired network)
    //     const signer = new ethers.Wallet('ba4a8190735e865430839024f7c7e8fbc68fb3ce7837372e3015d01735def721',provider);

    //     const sender = "0x6d77185684Ec60d9Ff158b00e8787FB5A857eE74"; // smart account address
    //     const nonce = '3'; // used salt's value as 1 at the time of account creation . therefore keeping the nonce same .
    //     const callGasLimit = '500000';
    //     const verificationGasLimit = '500000';
    //     const preVerificationGas = '500000';
    //     const maxFeePerGas = '1000000000'; 
    //     const maxPriorityFeePerGas = '100000000';

    //     const addSubtract = new ethers.utils.Interface(addSubtractABI); // ethers code
    //     const addBy10Data = addSubtract.encodeFunctionData("addBy10");
    //     console.log("data :",addBy10Data);

    //     //  calldata contains data about what action we want our smart account to take 
    //     const account = new ethers.utils.Interface(accountABI); // ethers code
    //     const amount = '0'; // amount to send to RECEIVER_ADDR
    //       // Encode the function data of the addBy10 method
    //     const calldata = account.encodeFunctionData('execute',[AddSubtractADDR, amount, addBy10Data]);
    //      // simpleAccountContract.interface.encodeFunctionData("addBy10")
    //     const getUserOpHash = () => {
    //         const packed = ethers.utils.defaultAbiCoder.encode(
    //             [
    //             "address",
    //             "uint256",
    //             "bytes32",
    //             "bytes32",
    //             "uint256",
    //             "uint256",
    //             "uint256",
    //             "uint256",
    //             "uint256",
    //             "bytes32",
    //             ],
    //             [
    //             sender,
    //             nonce,
    //             ethers.utils.keccak256('0x'),
    //             ethers.utils.keccak256(calldata),
    //             callGasLimit,
    //             verificationGasLimit,
    //             preVerificationGas,
    //             maxFeePerGas,
    //             maxPriorityFeePerGas,
    //             ethers.utils.keccak256('0x'),
    //             ]
    //         );
        
    //         const enc = ethers.utils.defaultAbiCoder.encode(
    //             ["bytes32", "address", "uint256"],
    //             [ethers.utils.keccak256(packed), EntryPoint_Addr, '80001']
    //         );
        
    //         return ethers.utils.keccak256(enc);
    //     }

    //    const userOpHash = getUserOpHash();

    //    const arraifiedHash =  ethers.utils.arrayify(userOpHash);

    //    const signature = await signer.signMessage(arraifiedHash);
    //    console.log("signature :",signature);

    //    const options = {
    //      method: "POST",
    //      url: "https://api.stackup.sh/v1/node/093e60e352135a8b93ba198c8e62138868eb9bfca0147ff9e00da75b267e2b0c",
    //      headers: {
    //        accept: "application/json",
    //        "content-type": "application/json",
    //      },
    //      data: {
    //        jsonrpc: "2.0",
    //        id: 1,
    //        method: "eth_sendUserOperation",
    //        params: [
    //          {
    //            sender: sender,
    //            nonce: nonce,
    //            initCode: '0x',
    //            callData: calldata,
    //            callGasLimit: callGasLimit,
    //            verificationGasLimit: verificationGasLimit,
    //            preVerificationGas: preVerificationGas,
    //            maxFeePerGas: maxFeePerGas,
    //            maxPriorityFeePerGas: maxPriorityFeePerGas,
    //            paymasterAndData: "0x",
    //            signature:signature
    //          },
    //          "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    //        ],
    //      },
    //    }; 
    //    await axios
    //      .request(options)
    //      .then(function (response) {
    //        console.log(response.data);
    //      })
    //      .catch(function (error) {
    //        console.error(error);
    //      });
    // });

    it("create a userOperation to call subtractBy1()",async function() {
        const provider = new ethers.providers.JsonRpcProvider("https://api.stackup.sh/v1/node/093e60e352135a8b93ba198c8e62138868eb9bfca0147ff9e00da75b267e2b0c"); // Connect to the Matic mainnet (replace with your desired network)
        const signer = new ethers.Wallet('ba4a8190735e865430839024f7c7e8fbc68fb3ce7837372e3015d01735def721',provider);

        const sender = "0x6d77185684Ec60d9Ff158b00e8787FB5A857eE74"; // smart account address
        const nonce = '4'; // used salt's value as 1 at the time of account creation . therefore keeping the nonce same .
        const callGasLimit = '500000';
        const verificationGasLimit = '500000';
        const preVerificationGas = '500000';
        const maxFeePerGas = '1000000000'; 
        const maxPriorityFeePerGas = '100000000';

        const addSubtract = new ethers.utils.Interface(addSubtractABI); // ethers code
        const subtractBy1Data = addSubtract.encodeFunctionData("subtractBy1");
        console.log("data :",subtractBy1Data);

        //  calldata contains data about what action we want our smart account to take 
        const account = new ethers.utils.Interface(accountABI); // ethers code
        const amount = '0'; // amount to send to RECEIVER_ADDR
        const calldata = account.encodeFunctionData('execute',[AddSubtractADDR, amount, subtractBy1Data]);
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

       const arraifiedHash =  ethers.utils.arrayify(userOpHash);

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
               initCode: '0x',
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
})


// {
//   id: 1,
//   jsonrpc: '2.0',
//   result: '0x6461b6f6dad509b226956134e2b2c1293263a97104e6770de92eb1850154aec4'
// }