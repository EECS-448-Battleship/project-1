import { GameState } from './util.js'

/**
 * Enum of all possible instructions.
 * @type {object}
 */
const instructions = {
  [GameState.ChoosingNumberOfShips]: 'Select the number of ships ',
  [GameState.PlayerSetup]: 'Place your ships on the grid',
  [GameState.PromptPlayerChange]: "It is your opponent's turn",
  [GameState.PlayerTurn]: 'Select a cell to fire a missile',
  [GameState.PlayerVictory]: 'You won!'
  // and so on
}

export { instructions }