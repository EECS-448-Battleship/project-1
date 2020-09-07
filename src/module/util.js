/**
 * Enum of all possible states of a grid cell.
 * @type {object}
 */
export const GridCellState = {
    // Empty cell, default state
    Available: 'available',

    // Disabled. Ship cannot be placed here.
    Disabled: 'disabled',

    // There is a ship in this cell.
    Ship: 'ship',

    // This cell contains part of a ship which was damaged but not sunk
    Damaged: 'damaged',

    // This cell contains part of a ship which was sunk
    Sunk: 'sunk',

    // This cell was targeted, but nothing was hit
    Missed: 'missed',
}

/**
 * Enum of all possible players.
 * @type {object}
 */
export const Player = {
    One: 'player_one',
    Two: 'player_two',
}

/**
 * Enum of all possible game states. These are player-agnostic.
 * @type {object}
 */
export const GameState = {
    // Both players are choosing the number of ships to play with (1-5)
    ChoosingNumberOfShips: 'choosing_number_of_ships',

    // A player is placing their ships
    PlayerSetup: 'player_setup',

    // We are prompting to change to the other player
    PromptPlayerChange: 'prompt_player_change',

    // It is the player's turn to fire a missle at their opponent
    PlayerTurn: 'player_turn',

    // A player has won
    PlayerVictory: 'player_victory',
}

/**
 * Makes a deep copy of the value passed in.
 * @param {*} obj
 * @return {*}
 */
export function clone(obj) {
    // If it's just a value, return it.
    if ( typeof obj !== 'object' || obj === null ) return obj

    // If it's an array, copy its values.
    if ( Array.isArray(obj) ) return obj.map(x => clone(x))

    // If it's an object, copy its properties.
    const copy = {}
    for ( const prop in obj ) {
        copy[prop] = clone(obj[prop])
    }
    return copy
}
