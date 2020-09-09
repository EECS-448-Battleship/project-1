import {Component} from '../../lib/vues6.js'
import {GameState} from '../module/util.js'
import game_service from '../services/GameState.service.js'

const template = `
<div class="top-level-component">
    <div v-if="current_state === GameState.ChoosingNumberOfShips">
        Choose number of ships <button @click="bypass">Bypass for now</button>
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

    async vue_on_create() {
        console.log('game service', game_service)
        this.current_state = game_service.get_game_state()
        game_service.on_state_change((next_state) => {
            this.current_state = next_state
            this.opponent_rows = game_service.get_current_opponent_state()
            this.player_rows = game_service.get_current_player_state()
        })
    }

    bypass() {
        game_service.advance_game_state()
    }
}
