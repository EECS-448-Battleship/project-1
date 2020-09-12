import { Player, GridCellState, GameState, clone, ShipType, isShipType, isShipCell, isValidTargetCell } from '../module/util.js'
import { InvalidShipPlacementError, InvalidAdvanceStateError, InvalidMissileFireAttemptError } from '../module/errors.js'

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
     * Given the number of boats set by the player (n_boats), return an array
     * of possible ShipTypes.
     * @return {ShipType[]}
     */
    get_possible_boats(){
        if (this.get_n_boats() === 1) {
            return [ShipType.x1]
        }
        else if (this.get_n_boats() === 2) {
            return [ShipType.x1, ShipType.x2]
        }
        else if (this.get_n_boats() === 3) {
            return [ShipType.x1, ShipType.x2, ShipType.x3]
        }
        else if (this.get_n_boats() === 4) {
            return [ShipType.x1, ShipType.x2, ShipType.x3, ShipType.x4]
        }
        else if (this.get_n_boats() === 5) {
            return [ShipType.x1, ShipType.x2, ShipType.x3, ShipType.x4, ShipType.x5]
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
     * If the current state is the PromptPlayerChange, then this is
     * the state that we should move to next.
     * @type {undefined|GameState}
     */
    post_player_change_state = undefined

    /**
     * True if, during the current turn, the user has tried to fire a missile.
     * @type {boolean}
     */
    current_turn_had_missile_attempt = false

    /**
     * Array of functions that are called when the game state changes.
     * @type {function[]}
     */
    game_state_change_listeners = []

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
    get_player_score(player) {
        let i = 1;
        let j = 1;
        let score = 0;
        for(i; i<=8; i++)
        {
            for(j; j<=8; j++)
            {
                let cell = this.player_x_game_board[this.get_other_player(player)][i][j];
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
    get_boat_count(player){
        let i = 1;
        let j = 1;
        let boat_count = 0;
        for(i; i<=8; i++)
        {
            for(j; j<=8; j++)
            {
                let cell = this.player_x_game_board[this.get_other_player(player)][i][j];
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
    get_progress(player){
        return(this.get_player_score(player) / this.get_boat_count(player))
    }

    /**
     * Get the current game state.
     * @return {GameState}
     */
    get_game_state() {
        return clone(this.current_state)
    }

    /**
     * responsible for advancing the game state
     * will be consisting of
     * @return
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
         */
        if (this.current_state === GameState.ChoosingNumberOfShips) {
            if (this.n_boats >= 1 && this.n_boats <= 5) {
                this.current_state = GameState.PromptPlayerChange;
                this.post_player_change_state = GameState.PlayerSetup;
                this.current_player = Player.One;
                this.current_opponent = Player.Two;
            } else {
                throw new InvalidAdvanceStateError("Invalid Number of Boats");
            }
        }
        else if (this.current_state === GameState.PlayerSetup) {
            if (this.current_player === Player.One) {
                // because the place_ship handles all the validation
                // all you need to do is make sure they have placed all the appropriate ships
                if ( this.get_ship_entities(this.current_player).length === this.n_boats ) {
                    this.current_state = GameState.PromptPlayerChange;
                    this.post_player_change_state = GameState.PlayerSetup;
                    this.current_player = Player.Two;
                    this.current_opponent = Player.One;
                }
                else{
                    throw new InvalidAdvanceStateError("Player One has a problem with the number of boats selected");
                }
            }
            else if (this.current_player === Player.Two) {
                if ( this.get_ship_entities(this.current_player).length === this.n_boats ) {
                    this.current_state = GameState.PromptPlayerChange;
                    this.post_player_change_state = GameState.PlayerTurn;
                    this.current_player = Player.One;
                    this.current_opponent = Player.Two;
                }
                else{
                    throw new InvalidAdvanceStateError("Player Two has a problem with the number of boats selected");
                }
            }
        }
        else if (this.current_state === GameState.PlayerTurn && this.current_player === Player.One) {
            if (this.current_turn_had_missile_attempt === true) {
                this.current_state = GameState.PromptPlayerChange;
                this.post_player_change_state = GameState.PlayerTurn;
                this.current_player = Player.Two;
                this.current_opponent = Player.One;
            }
            else {
                throw new InvalidAdvanceStateError("the player has not fired a missle");
            }
        }
        else if (this.current_state === GameState.PlayerTurn && this.current_player === Player.Two) {
            if (this.current_turn_had_missile_attempt === true) {
                this.current_state = GameState.PromptPlayerChange;
                this.post_player_change_state = GameState.PlayerTurn;
                this.current_player = Player.One;
                this.current_opponent = Player.Two;
            }
            else {
                throw new InvalidAdvanceStateError("the player has not fired a missle");
            }
        }
        else if ( this.current_state === GameState.PromptPlayerChange ) {
            if ( !this.post_player_change_state ) {
                throw new InvalidAdvanceStateError('No state to advance to after player change!')
            }

            this.current_state = this.post_player_change_state
            this.post_player_change_state = undefined
        }

        let winner = this.get_winner();
        if(winner) {
            this.current_state = GameState.PlayerVictory;
            this.current_player = winner;
        }

        this.current_turn_had_missile_attempt = false
        this.game_state_change_listeners.forEach(fn => fn(this.current_state, false))
    }

    /**
     * Register a handler to be called when the game state changes.
     * @param {function} handler
     */
    on_state_change(handler) {
        this.game_state_change_listeners.push(handler)
    }

    /**
     * Attempt to fire a missile at the current opponent at the given coordinates.
     * The coordinates should be an array of [row_index, column_index] where the missile should fire.
     * Returns true if the missile hit an undamaged cell of a ship.
     *
     * @example
     * If I want to fire a missile at row 5 column 7, then:
     * game_service.attempt_missile_fire([5, 7])
     *
     * @param {[number, number]} coords
     * @return {boolean}
     */
    attempt_missile_fire([target_row_i, target_col_i]) {
        if ( this.current_turn_had_missile_attempt ) {
            throw new InvalidMissileFireAttemptError('Cannot fire more than once per turn.')
        } else {
            this.current_turn_had_missile_attempt = true
        }

        const target_cell = this._get_cell_state(this.current_opponent, target_row_i, target_col_i)
        if ( !isValidTargetCell(target_cell.render) )
            throw new InvalidMissileFireAttemptError('Cannot fire on cell with state: ' + target_cell.render)

        if ( target_cell.render === GridCellState.Ship ) {
            // We hit an un-hit ship cell!
            this._set_cell_state(this.current_opponent, target_row_i, target_col_i, GridCellState.Damaged)

            // set ships to sunk where appropriate
            this._sink_damaged_ships(this.current_opponent)
            this._trigger_view_update()
            return true
        } else if ( target_cell.render === GridCellState.Available ) {
            // We missed...
            this._set_cell_state(this.current_opponent, target_row_i, target_col_i, GridCellState.Missed)
        }

        this._trigger_view_update()
        return false
    }

    /**
     * Checks the player's ships. If any are fully damaged, it flags that ship's cells
     * as "sunk" rather than damaged.
     * @param {Player} player
     * @private
     */
    _sink_damaged_ships(player) {
        this.get_ship_entities(player).some(ship => {
            const covered_cells = this.get_covered_cells(ship.coords_one, ship.coords_two)
            const all_damaged = covered_cells.every(([cell_row, cell_col]) => {
                return this._get_cell_state(player, cell_row, cell_col).render === GridCellState.Damaged
            })

            if ( all_damaged ) {
                // The entire boat was damaged, so sink it
                covered_cells.some(([cell_row, cell_col]) => {
                    this._set_cell_state(player, cell_row, cell_col, GridCellState.Sunk)
                })
            }
        })
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

        // refresh the view
        this._trigger_view_update()
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
     * If there is a winner, this will return the Player that won.
     * If no winner has been decided yet, will return undefined.
     * @return {Player|undefined}
     */
    get_winner() {
        const [player_1, player_2] = this.players

        // Make sure to sink any fully-damaged ships
        this._sink_damaged_ships(player_1)
        const player_1_ship_cells = this.get_ship_cells(player_1)
        const player_1_loses = (
            (player_1_ship_cells.length > 0)
            && player_1_ship_cells.every(cell => this._get_cell_state(player_1, cell[0], cell[1]).render === GridCellState.Sunk)
        )
        if ( player_1_loses ) return player_2

        // Make sure to sink any fully-damaged ships
        this._sink_damaged_ships(player_2)
        const player_2_ship_cells = this.get_ship_cells(player_2)
        const player_2_loses = (
            (player_2_ship_cells.length > 0)
            && player_2_ship_cells.every(cell => this._get_cell_state(player_2, cell[0], cell[1]).render === GridCellState.Sunk)
        )
        if ( player_2_loses ) return player_2
    }

    /**
     * Returns the other player.
     * @param {Player} player
     * @return {Player}
     */
    get_other_player(player) {
        if ( player === Player.One ) return Player.Two
        else if ( player === Player.Two ) return Player.One
    }

    /**
     * Given a Player type, return the display value of that player.
     * @param {Player} player
     * @return {string}
     */
    get_player_display(player) {
        if ( player === Player.One ) return 'Player 1'
        else if ( player === Player.Two ) return 'Player 2'
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

    /**
     * Get the state of the cell at the given coordinates on the player's board.
     * @param {Player} player
     * @param {number} row_i
     * @param {number} col_i
     * @return {object}
     * @private
     */
    _get_cell_state(player, row_i, col_i) {
        return this.player_x_game_board[player][row_i][col_i]
    }

    /**
     * Force a view update without changing the current state.
     * @private
     */
    _trigger_view_update() {
        this.game_state_change_listeners.forEach(fn => fn(this.current_state, true))
    }
}

// Export a single instance, so it can be shared by all files
// To use the game state service, you should do:
// import game_service from './services/GameState.service.js'
const game_service = new GameStateService()
export default game_service
