import { IDefaults } from "../models/defaults.model";
import { IState } from "../models/state.model";

export class Powerups {
  constructor() {}

  slowDown(state: IState, defaults: IDefaults) {
    return {
      symbol: "\u25bc", // slow down
      color: "#D50000",
      activePower: function() {
        state.dy = 1;
        state.dx = 1;
      },
      endPower: function() {
        state.dy = state.dy < 0 ? -defaults.dy : defaults.dy;
        state.dx = state.dx < 0 ? -defaults.dx : defaults.dx;
      }
    };
  }

  speedUp(state: IState, defaults: IDefaults) {
    return {
      symbol: "\u25b2", // speed up
      color: "#00C853",
      activePower: function() {
        state.dy = 5;
        state.dx = 5;
      },
      endPower: function() {
        state.dy = state.dy < 0 ? -defaults.dy : defaults.dy;
        state.dx = state.dx < 0 ? -defaults.dx : defaults.dx;
      }
    };
  }

  largePaddle(state: IState, defaults: IDefaults) {
    return {
      symbol: "\u2b0c", // large paddle
      color: "#FF6F00",
      activePower: function() {
        state.paddleWidth = defaults.paddleWidth * 1.25;
      },
      endPower: function() {
        state.paddleWidth = defaults.paddleWidth;
      }
    };
  }

  smallPaddle(state: IState, defaults: IDefaults) {
    return {
      symbol: "S", // small paddle
      color: "#C51162",
      activePower: function() {
        state.paddleWidth = this.defaults.paddleWidth * 0.75;
      },
      endPower: function() {
        state.paddleWidth = defaults.paddleWidth;
      }
    };
  }
}
