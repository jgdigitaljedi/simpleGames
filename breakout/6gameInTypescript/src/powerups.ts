
import { IState } from '../models/state.model';
import { IDefaults } from '../models/defaults.model';

export class Powerups {
  constructor() { }

  getPowerUps(state: IState, defaults: IDefaults) {
    return [
      {
        symbol: "\u25bc", // slow down
        color: "#D50000",
        activePower: () => {
          state.dy = 1;
          state.dx = 1;
        },
        endPower: () => {
          state.dy =
            state.dy < 0 ? -defaults.dy : defaults.dy;
          state.dx =
            state.dx < 0 ? -defaults.dx : defaults.dx;
        }
      },
      {
        symbol: "\u25b2", // speed up
        color: "#00C853",
        activePower: () => {
          state.dy = 5;
          state.dx = 5;
        },
        endPower: () => {
          state.dy =
            state.dy < 0 ? -defaults.dy : defaults.dy;
          state.dx =
            state.dx < 0 ? -defaults.dx : defaults.dx;
        }
      },
      {
        symbol: "\u2b0c", // large paddle
        color: "#FF6F00",
        activePower: () => {
          state.paddleWidth = defaults.paddleWidth * 1.25;
        },
        endPower: () => {
          state.paddleWidth = defaults.paddleWidth;
        }
      },
      {
        symbol: "S", // small paddle
        color: "#C51162",
        activePower: () => {
          state.paddleWidth = defaults.paddleWidth * 0.75;
        },
        endPower: () => {
          state.paddleWidth = defaults.paddleWidth;
        }
      }
    ];
  }
}