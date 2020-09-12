import {Component} from '../../lib/vues6.js'
import game_service from '../services/GameState.service.js'
import {Player, GameState} from '../module/util.js'

const template = `
<div class="app-scoreboard-component">
        <table class="scoreboard_table" style="width:50%">
        <tr class="scoreboard_rows">
            <th class="scoreboard_table_empty"></th>
            <th class="scoreboard_table_header" colspan="3">scoreboard</th>
        </tr>
        <tr class="scoreboard_header_scoreProgress">
            <th class="scoreboard_table_empty"></th>
            <td class="scoreboard_data">score</td>
            <td class="scoreboard_data">progress</td>
        </tr>
        <tr class="scoreboard_rows_score&progress">
            <td class="scoreboard_player">{{ current_player === Player.One ? '➜ ' : '' }}Player 1{{ winning_player === Player.One ? ' ★' : '' }}</td>
            <td class="scoreboard_data">{{player_one_score}}</td>
            <td class="scoreboard_data">{{player_one_progress * 100}}%</td>
        </tr>
        <tr class="scoreboard_lastRow">
            <td class="scoreboard_player">{{ current_player === Player.Two ? '➜ ' : '' }}Player 2{{ winning_player === Player.Two ? ' ★' : '' }}</td>
            <td class="scoreboard_data">{{player_two_score}}</td>
            <td class="scoreboard_data">{{player_two_progress * 100}}%</td>
        </tr>
    </table>
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
    current_player = undefined
    winning_player = undefined

    Player = Player

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

        if ( game_service.get_game_state() !== GameState.PlayerVictory )
            this.current_player = game_service.get_current_player()
        else {
            this.current_player = undefined
            this.winning_player = game_service.get_current_player()
        }
    }
}
