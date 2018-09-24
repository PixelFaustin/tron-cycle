import React, { Component } from 'react';
import GameMenu from './containers/GameMenu';
import './styles/App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <GameMenu />
      </div>
    );
  }
}

export default App;
