import {Component} from '../../lib/vues6.js'
import {GameState, ShipType} from '../module/util.js'
import game_service from '../services/GameState.service.js'

const template = `
<<<<<<< Updated upstream
<div class="top-level-container">
    <div class="top-level-component">
        <div v-if="current_state === GameState.ChoosingNumberOfShips">
            Choose number of ships:
            <button @click="ship(1)" class="shipBtn">1 ship</button>
            <button @click="ship(2)" class="shipBtn">2 ships</button>
            <button @click="ship(3)" class="shipBtn">3 ships</button>
            <button @click="ship(4)" class="shipBtn">4 ships</button>
            <button @click="ship(5)" class="shipBtn">5 ships</button>
=======
<div class="top-level-component">
    <div v-if="current_state === GameState.ChoosingNumberOfShips">
        Choose number of ships:
        <button @click="ship1" class="shipBtn">1 ship</button>
        <button @click="ship2" class="shipBtn">2 ships</button>
        <button @click="ship3" class="shipBtn">3 ships</button>
        <button @click="ship4" class="shipBtn">4 ships</button>
        <button @click="ship5" class="shipBtn">5 ships</button>
    </div>
<<<<<<< HEAD
=======
>>>>>>> 19aa3733d0604f37e6875b825eb51ccd4092d4c4
    <div v-if="current_state !== GameState.ChoosingNumberOfShips" class="game-boards-container">
        <!-- Opponent's board -->
        <div class="game-board">
            <app-game-board v-bind:rows="opponent_rows"></app-game-board>
>>>>>>> Stashed changes
        </div>
        <div v-if="current_state !== GameState.ChoosingNumberOfShips" class="game-boards-container">
            <!-- Opponent's board -->
            <div class="game-board">
                <app-game-board v-bind:rows="opponent_rows"></app-game-board>
            </div>
    
            <!-- Player's board -->
            <div class="game-board">
                <app-game-board
                    v-bind:rows="player_rows"
                    v-bind:is_placement_mode="player_is_placing_ships"
                    v-bind:ships_to_place="ships_to_place"
                    @shipplaced="on_ship_placed"
                ></app-game-board>
            </div>
        </div>
    </div>
    <div class="scoreboard-container">
        <app-scoreboard></app-scoreboard>
    </div>
</div>
`
export default class TopLevelComponent extends Component {
    static get selector() { return 'app-top-level' }
    static get template() { return template }
    static get props() { return [] }

    /**
     * Make the game state accessible w/in the template.
     * @type {object}
     */
    GameState = GameState

    /**
     * The current game state.
     * @type {GameState|undefined}
     */
    current_state = undefined

    /**
     * The opponent's grid data.
     * @type {object[][]}
     */
    opponent_rows = []

    /**
     * The player's grid data.
     * @type {object[][]}
     */
    player_rows = []

    /**
     * The current instructions to be shown to the user.
     * @type {string}
     */
    instructions = ''

    /**
     * True if the player should be able to place their ships.
     * @type {boolean}
     */
    player_is_placing_ships = false

    /**
     * If in placement mode, the ships that are yet to be placed.
     * @type {ShipType[]}
     */
    ships_to_place = []

    async vue_on_create() {
        console.log('game service', game_service)
        this.current_state = game_service.get_game_state()

        // Called every time the game state is updated
        game_service.on_state_change((next_state, was_refresh) => {
            this.current_state = next_state
            this.opponent_rows = game_service.get_current_opponent_state()
            this.player_rows = game_service.get_current_player_state()

            this.player_is_placing_ships = next_state === GameState.PlayerSetup
            if ( !was_refresh && this.player_is_placing_ships ) {
                // TODO replace with call to game state service
                this.ships_to_place = [ShipType.x1, ShipType.x2, ShipType.x3]
            }

            // TODO add code for instructions
        })
    }

    /**
     * Set the number of boats.
     * @param {number} n
     */
    ship(n) {
        game_service.set_n_boats(n)
        game_service.advance_game_state()
    }

    /**
     * Called when the current user has placed a ship.
     */
    on_ship_placed() {
        this.ships_to_place.shift()
        if ( this.ships_to_place.length < 1 ) {
            // We've placed all the ships. Let's move on.
            game_service.advance_game_state()
        }
    }
}
