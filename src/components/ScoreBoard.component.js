import {Component} from '../../lib/vues6.js'
import game_service from '../services/GameState.service.js'
import {Player} from '../module/util.js'

const template = `
<div class="app-scoreboard-component">
    Scoreboard Goes Here {{ player_one_score }}
</div>
`
export default class ScoreBoardComponent extends Component {
    static get selector() { return 'app-scoreboard' }
    static get template() { return template }
    static get props() { return [] }

    player_one_score = 0
    player_two_score = 0
    player_one_progress = 0
    player_two_progress = 0

    async vue_on_create() {
        game_service.on_state_change(() => {
            this.update()
        })

        this.update()
    }

    update() {
        // here is where you should fetch the data from the game service and update variables on the class
        this.player_one_score = game_service.get_player_score(Player.One)
        this.player_two_score = game_service.get_player_score(Player.Two)
        this.player_one_progress = game_service.get_progress(Player.One)
        this.player_two_progress = game_service.get_progress(Player.Two)
    }
}
