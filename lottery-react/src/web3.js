// other files can call this to have preconfigured web3
import Web3 from 'web3';

const web3 = new Web3(window.web3.currentProvider);

export default web3;
