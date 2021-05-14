const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode})
        .send({from: accounts[0], gas: '1000000'});
});

describe('Lottery Contract', () => {
   it('deploys a contract', () => {
       assert.ok(lottery.options.address); // check address contract was deployed to
   });
   
   // someone can enter the lottery
   it('allows one account to enter', async () => {
       await lottery.methods.enter().send({
           from: accounts[0],
           value: web3.utils.toWei('0.02', 'ether') // converts from ether to wei
           });
       
       const players = await lottery.methods.getPlayers().call({
           from: accounts[0]
        });
       
       assert.equal(accounts[0], players[0]); // check 0 account is 0 account
       assert.equal(1, players.length); // check exactly 1 player is entered
    });
   
   // multiple people can enter the lottery
   it('allows multiple accounts to enter', async () => {
       await lottery.methods.enter().send({
           from: accounts[0],
           value: web3.utils.toWei('0.02', 'ether') // converts from ether to wei
           });
        await lottery.methods.enter().send({
           from: accounts[1],
           value: web3.utils.toWei('0.02', 'ether')
           });
        await lottery.methods.enter().send({
           from: accounts[2],
           value: web3.utils.toWei('0.02', 'ether')
           });
       
       const players = await lottery.methods.getPlayers().call({
           from: accounts[0]
        });
       
       assert.equal(accounts[0], players[0]); // check 0 account is 0 account
       assert.equal(accounts[1], players[1]);
       assert.equal(accounts[2], players[2]);
       assert.equal(3, players.length); // check exactly 3 players are entered
    });
    
    // player has to submit min eth to enter
    it('requires a minimum amount of ether to enter', async () => { 
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            });
            assert(false);
        } catch (err) {
            assert(err); // no .ok() because checking truth not existence
        }
    });
    
    it('only manager can call pickWinner()', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false); // if we get to this line of code, fail the test
        } catch (err) {
            assert(err);
        }
    });
    
    // end to end test
    // does not test random nature very well
    // but makes figuring out if pickWinner() worked easier
    // to do: multiple players
    it('sends money to the winner and resets the players array', async () => {
        // enter 1 player into the contract
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });
        
        const initialBalance = await web3.eth.getBalance(accounts[0]); // check balance before winning lottery
        const lotteryInitialBalance = await web3.eth.getBalance(lottery.options.address) // get balance of lottery before payout
        
        await lottery.methods.pickWinner().send({ from: accounts[0] }); // pick the winner of the 1 player lottery
        
        const finalbalance = await web3.eth.getBalance(accounts[0]); // check balance after winning the lottery
        const difference = finalbalance - initialBalance; // find the difference
        assert(difference > web3.utils.toWei('1.8', 'ether')); // check that balance went up (~entry - gas) after winning the lottry
        
        const lotteryFinalBalance = await web3.eth.getBalance(lottery.options.address) // get balance of lottery after payout
        const lotteryDifference = lotteryInitialBalance - lotteryFinalBalance;
        assert.equal(web3.utils.toWei('2', 'ether'), lotteryDifference) // check for pot (2 ether) ether difference
        
        assert.equal(0, lotteryFinalBalance) // check balance of lottry after payout is 0
        
        const players = await lottery.methods.getPlayers().call({from: accounts[0]});
        assert.equal(0, players.length); // check lottry has reset (players reset)
    });
});
