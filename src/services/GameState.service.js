import { Player, GridCellState, GameState, clone, ShipType, isShipType, isShipCell } from '../module/util.js'
import { InvalidShipPlacementError, InvalidAdvanceStateError } from '../module/errors.js'

/**
 * Singleton service for managing the state of the game.
 */
export class GameStateService {
    /**
     * A mapping of player => game board state.
     * @private
     * @type {object}
     */
    player_x_game_board = {}

    /**
     * A mapping of player => ship definitions.
     * @private
     * @type {object}
     */
    player_x_ships = {}

    /**
     * An array of all players. This is mostly for internal purposes.
     * @private
     * @type {(string)[]}
     */
    players = [Player.One, Player.Two]

    /**
     * Number of rows in the grid.
     * @private
     * @type {number}
     */
    n_rows = 9

    /**
     * Number of cols in the grid.
     * @private
     * @type {number}
     */
    n_cols = 9

    /**
     * Number boats placed on the board.
     * @private
     * @type {number}
     */
    n_boats = 1

    /**
     * gets the number of boats placed on the board
     * @private
     * @return {number}
     */
    get_n_boats(){
        return (this.n_boats);
    }

    /**
     * sets the number of boats to a valid number 
     * @private
     * @return none 
     */
    set_n_boats(number){
        if(number >= 1 && number <= 5 )
        {
            this.n_boats = number; 
        }
    }

    /**
     * The current state of the game.
     * @private
     * @type {string}
     */
    current_state = GameState.ChoosingNumberOfShips

    /**
     * The current player.
     * @private
     * @type {string}
     */
    current_player = Player.One

    /**
     * The current opponent.
     * @private
     * @type {string}
     */
    current_opponent = Player.Two

    /**
     * Construct a new game service. Initialize any internal states.
     */
    constructor() {
        // Generate empty boards for each player
        for ( const player of this.players ) {
            this.player_x_game_board[player] = this._build_empty_board()
            this.player_x_ships[player] = []
        }
    }

    /**
     * Get the dimensions of the board as [rows, cols].
     * @example const [n_rows, n_cols] = game_service.get_dimensions()
     * @return {[number, number]}
     */
    get_dimensions() {
        return [this.n_rows, this.n_cols]
    }

    /**
     * Get the player who is the focus of the current game state.
     * @return {string}
     */
    get_current_player() {
        return this.current_player
    }

    /**
     * Get the player who is NOT the focus of the current game state.
     * @return {string}
     */
    get_current_opponent() {
        return this.current_opponent
    }

    /**
     * Get the state of the current player's board, as it should appear to them.
     * @return {object[][]}
     */
    get_current_player_state() {
        // The player can see everything about their own board, so just return it.
        // Return a deep-copy, so internal state can't be modified.
        return clone(this.player_x_game_board[this.current_player])
    }

    /**
     * Get the state of the current opponent's board, as it should appear to the
     * current player. Note that the current player cannot see "ship" spaces, only
     * available, damaged, missed, or sunk.
     * @return {object[][]}
     */
    get_current_opponent_state() {
        // Return a deep-copy, so internal state can't be modified.
        const state = clone(this.player_x_game_board[this.current_opponent])
        const hidden_states = [
            GridCellState.Disabled,
            GridCellState.Ship,
        ]

        return state.map(row => {
            return row.map(cell => {
                if ( hidden_states.includes(cell.render) ) {
                    // This is a hidden state, so hide it
                    cell.render = GridCellState.Available
                }

                return cell
            })
        })
    }

    /**
     * get the "score" (the number of hits) that the 
     * current player has (counting sunk ships)
     * @return {number}
     * @private 
     */
    get_player_score () {
        let i = 1;
        let j = 1;
        let score = 0;
        for(i; i<=9; i++)
        {
            for(j; j<=9; j++)
            {
                let cell = this.player_x_game_board[this.current_opponent][i][j];
                if(cell.render === GridCellState.Damaged || cell.render === GridCellState.Sunk )
                {
                    score++;
                }
            }
        }
        return(score);
    }

    /**
     * gets the number of the boats (sunken, damaged or not) that the opponent has
     * used to help keep get progress method looking clean
     * @return {number}
     * @private 
     */
    get_boat_count(){
        let i = 1;
        let j = 1;
        let boat_count = 0;
        for(i; i<=9; i++)
        {
            for(j; j<=9; j++)
            {
                let cell = this.player_x_game_board[this.current_opponent][i][j];
                if(cell.render === GridCellState.Damaged || cell.render === GridCellState.Sunk || cell.render === GridCellState.Ship )
                {
                    boat_count++;
                }
            }
        }
        return(boat_count);
    }

    /**
     * gets the progress (hits/total boats) that the player has
     * @return {number}
     * @private 
     */
    get_progress(){
        return(this.get_player_score() / this.get_progress() )
    }


    /**
     * responsible for advancing the game state 
     * will be consisting of 
     * @return 
     * @private 
     */
    advance_game_state() {
        /** functions to be made that validate:
         * 1) number of ships
         * 2) player one placement
         * 3) player two placement
         * 4) player one turn
         * 5) advance to player 2
         * 6) player 2 turn
         * 7) advance to player one
         * 8) player win
         *
         */
        //1
        if (this.current_state === GameState.ChoosingNumberOfShips) {
            if (this.n_boats >= 1 && this.n_boats <= 5) {
                this.current_state = GameState.PlayerSetup;
                this.current_player = Player.One;
                this.current_opponent = Player.Two;
            } else {
                throw new InvalidAdvanceStateError("Invalid Number of Boats");
            }

        }
        if (this.current_state === GameState.PlayerSetup) {
            if (this.current_player === Player.One) {
                //wait
                // because the place_ship handles all the validation
                // all you need to do is make sure they have placed all the appropriate ships
                // e.g. if ( this.get_ship_entities(this.current_player).length === this.n_boats ) { ... }
            }
            if (this.current_player === Player.Two) {
                //wait for now
            }
        }
    }

    /**
     * Attempt to place a ship of the given type at the given coordinates.
     * Throws an InvalidShipPlacementError if the coordinates are invalid.
     * Coordinates should be [row_index, column_index] of either end of the ship.
     *
     * @example
     * If I am placing a 1x3 ship and I want it to be in row 3 column 2 horizontal
     * to row 3 column 4, then I would call:
     * game_service.place_ship(ShipType.x3, [3,2], [3,4])
     *
     * @param {ShipType} ship_type
     * @param {[number, number]} coords_one
     * @param {[number, number]} coords_two
     */
    place_ship(ship_type, coords_one, coords_two) {
        // make sure the coordinates are valid for the given ship type
        this.validate_coordinates(ship_type, coords_one, coords_two)

        // get the ships for the current player
        const player_ships = this.get_ship_entities(this.current_player)

        // make sure they don't already have this ship type
        const have_ship_type = player_ships.some(ship => ship.ship_type === ship_type)
        if ( have_ship_type )
            throw new InvalidShipPlacementError('A ship with this type has already been placed.')

        // make sure they don't already have too many
        if ( player_ships.length >= this.n_boats )
            throw new InvalidShipPlacementError('This player cannot place any more ships.')

        // place the ship
        this.player_x_ships[this.current_player].push({ ship_type, coords_one, coords_two })

        // mark the cells as having a ship in them
        this.get_covered_cells(coords_one, coords_two).some(([row_i, col_i]) => {
            this._set_cell_state(this.current_player, row_i, col_i, GridCellState.Ship)
        })
    }

    /**
     * Get an array of cell coordinates that are covered by a ship that spans
     * the given coordinates.
     *
     * @example
     * If a ship goes from row 1 column 1 to row 4 column 1, then I can get
     * the coordinates of all cells covered by that ship using:
     * game_service.get_covered_cells([1,1], [4,1])
     * Which would return [[1,1], [2,1], [3,1], [4,1]].
     *
     * @param {[number, number]} coords_one
     * @param {[number, number]} coords_two
     * @return {[number, number][]}
     */
    get_covered_cells(coords_one, coords_two) {
        const [row_one, col_one] = coords_one
        const [row_two, col_two] = coords_two
        const [left_col, right_col] = [Math.min(col_one, col_two), Math.max(col_one, col_two)]
        const [top_row, bottom_row] = [Math.min(row_one, row_two), Math.max(row_one, row_two)]
        const is_horizontal = top_row === bottom_row

        if ( is_horizontal ) {
            return Array((right_col - left_col) + 1).fill('').map((_, i) => {
                return [top_row, i + left_col]
            })
        } else {
            return Array((bottom_row - top_row) + 1).fill('').map((_, i) => {
                return [i + top_row, left_col]
            })
        }
    }

    /**
     * Validate the given coordinates for the given ship type.
     * Throws an InvalidShipPlacementError if the coordinates are invalid.
     * Coordinates should be [row_index, column_index] of either end of the ship.
     *
     * @example
     * If I am placing a 1x3 ship and I want it to be in row 3 column 2 horizontal
     * to row 3 column 4, then I would call:
     * game_service.validate_coordinates(ShipType.x3, [3,2], [3,4])
     *
     * @param {ShipType} ship_type
     * @param {[number, number]} coords_one
     * @param {[number, number]} coords_two
     */
    validate_coordinates(ship_type, coords_one, coords_two) {
        if ( !isShipType(ship_type) ) throw new InvalidShipPlacementError('Invalid ship type: '+ship_type)

        const ship_length = this.get_ship_length(ship_type)
        const [row_one, col_one] = coords_one
        const [row_two, col_two] = coords_two
        const [left_col, right_col] = [Math.min(col_one, col_two), Math.max(col_one, col_two)]
        const [top_row, bottom_row] = [Math.min(row_one, row_two), Math.max(row_one, row_two)]

        const is_horizontal = top_row === bottom_row
        const ship_cells = this.get_ship_cells(this.current_player)
        const placement_cells = []

        if ( is_horizontal ) {
            // Make sure the input length matches the given ship type
            if ( (right_col - left_col) !== (ship_length - 1) )
                throw new InvalidShipPlacementError('Invalid coordinates: ship length is invalid')

            Array(ship_length).fill('').map((_, i) => {
                placement_cells.push([top_row, i + left_col])
            })
        } else {
            // Make sure the input length matches the given ship type
            if ( (bottom_row - top_row) !== (ship_length - 1) )
                throw new InvalidShipPlacementError('Invalid coordinates: ship length is invalid')

            Array(ship_length).fill('').map((_, i) => {
                placement_cells.push([i + top_row, left_col])
            })
        }

        // Make sure none of the placement cells overlap with existing ships
        const has_overlap = ship_cells.some(([ship_row, ship_col]) => {
            return placement_cells.some(([placement_row, placement_col]) => {
                return ship_row === placement_row && ship_col === placement_col
            })
        })

        if ( has_overlap )
            throw new InvalidShipPlacementError('Invalid coordinates: ship overlaps with others')
    }

    /**
     * Get the number of cells the given ship type should occupy.
     * @param {ShipType} ship_type
     * @return {number}
     */
    get_ship_length(ship_type) {
        if ( ship_type === ShipType.x1 ) return 1
        if ( ship_type === ShipType.x2 ) return 2
        if ( ship_type === ShipType.x3 ) return 3
        if ( ship_type === ShipType.x4 ) return 4
        if ( ship_type === ShipType.x5 ) return 5
    }

    /**
     * Get the coordinates of all cells that have ships in them, for the given player.
     * @param {Player} player
     * @return {[number, number]}
     */
    get_ship_cells(player) {
        const cells = []
        this.player_x_game_board[player].some((row, row_i) => {
            row.some((col, col_i) => {
                if ( isShipCell(col.render) ) {
                    cells.push([row_i, col_i])
                }
            })
        })
        return cells
    }

    /**
     * Get an array of ship entities for the given player.
     * @param {Player} player
     * @return {object[]}
     */
    get_ship_entities(player) {
        return clone(this.player_x_ships[player])
    }

    /**
     * Build an empty structure of grid cells.
     * @return {object[][]}
     * @private
     */
    _build_empty_board() {
        return Array(this.n_rows).fill('').map(_ => {
            return Array(this.n_cols).fill('').map(_ => {
                return {
                    render: GridCellState.Available,
                }
            })
        })
    }

    /**
     * Set the state of the cell at the given coordinates on the player's board
     * to the specified state.
     * @param {Player} player
     * @param {number} row_i
     * @param {number} col_i
     * @param {GridCellState} state
     * @private
     */
    _set_cell_state(player, row_i, col_i, state) {
        this.player_x_game_board[player][row_i][col_i].render = state
    }
}

// Export a single instance, so it can be shared by all files
// To use the game state service, you should do:
// import game_service from './services/GameState.service.js'
const game_service = new GameStateService()
export default game_service
