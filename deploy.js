require('dotenv').config();

const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('Web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
    process.env.MNEMONIC,
    process.env.RPC_URL,
);
const web3 = new Web3(provider);

const deploy = async () => { // writing this function so can use async
    const accounts = await web3.eth.getAccounts();
    
    console.log('Attenmpting to deploy from account', accounts[0]);
    
    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode})
        .send({ gas: '1000000', from: accounts[0] });
        
    console.log(interface);
    console.log('Contract deployed to', result.options.address);
};
deploy();
