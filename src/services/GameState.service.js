import { Player, GridCellState, GameState, clone } from '../module/util.js'

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
    advance_game_state(){
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
        if(this.current_state === GameState.ChoosingNumberOfShips)
        {
            if(this.n_boats >= 1 && this.n_boats <= 5 )
            {
                this.current_state = GameState.PlayerSetup; 
                this.current_player = Player.One;
                this.current_opponent = Player.Two; 
            }
            else
            {
                throw new Error("Invalid Number of Boats");
            }
        
        }
        if(this.current_state === GameState.PlayerSetup)
        {
            if(this.current_player === Player.One)
            {
                //wait
            }
            if(this.current_player === Player.Two)
            {
                //wait for now
            }
        }

        
    }
}

// Export a single instance, so it can be shared by all files
// To use the game state service, you should do:
// import game_service from './services/GameState.service.js'
const game_service = new GameStateService()
export default game_service
