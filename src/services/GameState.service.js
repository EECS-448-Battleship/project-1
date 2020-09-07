import { Player, GridCellState, GameState } from '../module/util.js'

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
     * The current state of the game.
     * @private
     * @type {string}
     */
    current_state = GameState.ChoosingNumberOfShips

    /**
     * The current player.
     * @type {string}
     */
    current_player = Player.One

    /**
     * Construct a new game service. Initialize any internal states.
     */
    constructor() {
        // Generate empty boards for each player
        for ( const player of this.players ) {
            this.player_x_game_board[player] = this._build_empty_board()
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
}

// Export a single instance, so it can be shared by all files
const game_state = new GameStateService()
export default game_state
