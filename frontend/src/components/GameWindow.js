import React, { Component } from 'react';

import GameView from './impl/GameView';

export default class GameWindow extends Component {
  constructor(props) {
    super(props);
    this.gameView = new GameView();
    this.mouseLocked = false;
  }

  lockChangeAlert = () => {
    if (document.pointerLockElement === this.gameView.canvas) {
      if (!this.mouseLocked) {
        window.addEventListener('mousemove', this.handleMouseMove, false);
      }
      this.mouseLocked = true;
    } else {
      if (this.mouseLocked) {
        window.removeEventListener('mousemove', this.handleMouseMove, false);
      }
      this.mouseLocked = false;
    }
  };

  refresh = () => {
    let now = performance.now() / 1000;
    let dt = now - this.startTime;
    this.startTime = now;
    this.gameView.update(dt);
    this.gameView.render();
    requestAnimationFrame(() => this.refresh());
  };

  handleMouseMove = event => {
    const dx = event.movementX;
    const dy = event.movementY;

    this.gameView.updateCursor(dx, dy);
  };

  handleClick = () => {
    this.gameView.lockMouse();
    this.gameView.handleClick();
  };

  componentDidMount() {
    if (this.canvas) {
      this.gameView.initialize(this.canvas);
    }

    this.startTime = performance.now() / 1000;
    window.addEventListener('click', this.handleClick);
    document.addEventListener('pointerlockchange', this.lockChangeAlert);

    this.refresh();
  }

  componentWillUnmount() {
    this.gameView.free();
    window.removeEventListener('click', this.handleClick);
    document.removeEventListener('pointerlockchange', this.lockChangeAlert);
  }

  render() {
    console.log(this);
    return (
      <canvas
        id="game-canvas"
        ref={canvas => {
          this.canvas = canvas;
        }}
      />
    );
  }
}
