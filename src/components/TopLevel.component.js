import {Component} from '../../lib/vues6.js'
import {GameState} from '../module/util.js'
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
                <app-game-board v-bind:rows="player_rows"></app-game-board>
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

    opponent_rows = []

    player_rows = []

    instructions = ''

    async vue_on_create() {
        console.log('game service', game_service)
        this.current_state = game_service.get_game_state()
        game_service.on_state_change((next_state) => {
            this.current_state = next_state
            this.opponent_rows = game_service.get_current_opponent_state()
            this.player_rows = game_service.get_current_player_state()

            // add code for instructions
        })
    }

    ship(n) {
        game_service.set_n_boats(n)
        game_service.advance_game_state()
    }
}
