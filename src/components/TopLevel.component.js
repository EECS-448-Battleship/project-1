import {Component} from '../../lib/vues6.js'
import {GameState, ShipType} from '../module/util.js'
import game_service from '../services/GameState.service.js'

const template = `
<div class="top-level-container">
    <div class="top-level-component">
        <div v-if="current_state === GameState.ChoosingNumberOfShips" class="game-choose-ships-container">
            Choose number of ships:
            <div style="margin-top: 30px;">
                <button @click="ship(1)" class="shipBtn">1 ship</button>
                <button @click="ship(2)" class="shipBtn">2 ships</button>
                <button @click="ship(3)" class="shipBtn">3 ships</button>
                <button @click="ship(4)" class="shipBtn">4 ships</button>
                <button @click="ship(5)" class="shipBtn">5 ships</button>
            </div>
        </div>
        <div v-if="current_state === GameState.PromptPlayerChange" class="game-player-change-container">
            It is now {{ current_player_display }}'s turn!
            <button @click="confirm_player_change" class="playerBtn">Continue</button>
        </div>
        <div
            v-if="current_state !== GameState.ChoosingNumberOfShips && current_state !== GameState.PromptPlayerChange"
            class="game-boards-container"
        >
            <!-- Opponent's board -->
            <div class="game-board">
                <app-game-board v-bind:rows="opponent_rows"></app-game-board>
                <div class="fleet-label">Opposing fleet</div>
            </div>
    
            <!-- Player's board -->
            <div class="game-board">
                <app-game-board
                    v-bind:rows="player_rows"
                    v-bind:is_placement_mode="player_is_placing_ships"
                    v-bind:ships_to_place="ships_to_place"
                    @shipplaced="on_ship_placed"
                ></app-game-board>
                <div class="fleet-label">Your fleet</div>
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

    current_player_display = ''
    current_opponent_display = ''

    async vue_on_create() {
        console.log('game service', game_service)
        this.current_state = game_service.get_game_state()

        // Called every time the game state is updated
        game_service.on_state_change((next_state, was_refresh) => {
            this.current_state = next_state
            this.opponent_rows = game_service.get_current_opponent_state()
            this.player_rows = game_service.get_current_player_state()
            this.current_player_display = game_service.get_player_display(game_service.get_current_player())
            this.current_opponent_display = game_service.get_player_display(game_service.get_current_opponent())

            this.player_is_placing_ships = next_state === GameState.PlayerSetup
            if ( !was_refresh && this.player_is_placing_ships ) {
                this.ships_to_place = game_service.get_possible_boats()
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

    confirm_player_change() {
        game_service.advance_game_state()
    }
}
