const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const privateKeys = [
                    "0f2b78e19bc8f13e28b81af396a786c5c747300fd8fe69503e33877a2a54dcc4",
                  ];


describe('Signature using web3.js',function() {
    it('signature return karega',async function() {
        const provider = () => new HDWalletProvider(privateKeys,`wss://polygon-mumbai.infura.io/ws/v3/af2e33b48f9e469ca131d90ba0fdde05`,0,3)
        const web3 = new Web3(provider());

        const arrayToSign =  [
            153, 132, 165, 222,  23, 208,   7,  98,
            122,  25, 185, 118, 239,  85,  15,  76,
            220,  51,  10, 159,  79,  91, 234, 104,
            188, 131,   6,  46, 105,  54, 178, 143
        ];
        const serializedObjectOfArray = JSON.stringify(arrayToSign);

        const arrayifiedHashSignature = web3.eth.accounts.sign(serializedObjectOfArray, privateKeys[0]);
        console.log("arrayifiedHashSignature :",arrayifiedHashSignature.signature);

        // signing an object using web3js

        const account = web3.eth.accounts.privateKeyToAccount(privateKeys[0]);
        const objectToSign = { foo: 'bar', baz: 123 }; // Replace with your object
        const serializedObject = JSON.stringify(objectToSign);
        console.log("serializedObject :",serializedObject);
        const signature = web3.eth.accounts.sign(serializedObject, account.privateKey);
        const recoveredAddress = web3.eth.accounts.recover(signature);
        console.log("signature :",signature);
        console.log("recovered address :",recoveredAddress);
        // 0xf6b23936cd6c81d6d0a4397def0e430de208c0d2524c4c38297ce994e9bed6c733aef579aeed9d2d86c46bcfce30216da60b1ddeea365d42cd4253d8b4dc67c81c
    });
})

// normal hash ko sign karna hai , ethers library se
// ya account_sign
        // userOpHash : 0xca355ea4b72dad52c822aa4a21fffde13695e6d13b7f049671db166bbd50cff7
        // arraified Hash : Uint8Array(32) [
        // 202,  53,  94, 164, 183,  45, 173,  82,
        // 200,  34, 170,  74,  33, 255, 253, 225,
        // 54, 149, 230, 209,  59, 127,   4, 150,
        // 113, 219,  22, 107, 189,  80, 207, 247
        // ]