import logo from "./logo.svg";
import "./App.css";
import React from "react";
import web3 from './web3'; // importing from our file
import lottery from './lottery';
 
class App extends React.Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: ''
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({manager, players, balance});

  }

  onSubmit = async (event) => {
    event.preventDefault();

    // write the transaction
    const accounts = await web3.eth.requestAccounts();

    this.setState({ message: 'Waiting on transaction success...' });

    // this line takes 15-30 seconds
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    this.setState({message: 'You have been entered!'});
  };

  // called any time someone clicks on pick winner button
  onClick = async () => {
    // get a list of accounts
    const accounts = await web3.eth.requestAccounts();

    // set some message to let the user know we're about to do something
    this .setState({ message: 'Waiting on transaction success...'});

    // send a transaction to the network
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    // tell the user a winner has been picked
    this.setState({ message: 'A winner has been picked!' }); // to do: say who won
  };

  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>This contract is managed by {this.state.manager}.
           There are currently {this.state.players.length} people entered
           competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>

        <hr/>

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input 
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>

        <hr/>

        <h4>Ready to pick a winner?</h4>
        <buton onClick={this.onClick}>Pick a winner!</buton>

        <hr/>

        <h1>{this.state.message}</h1>

      </div>
    );
  }
}
export default App;
