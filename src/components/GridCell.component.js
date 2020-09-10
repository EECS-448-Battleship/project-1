import {Component} from '../../lib/vues6.js'
import {GridCellState} from '../module/util.js'

const template = `
<div
    class="game-board-cell-component"
    @click="on_click"
    v-bind:class="{ disabled: render === GridCellState.Disabled, available: render === GridCellState.Available,
    ship: render == GridCellState.Ship, damaged: render == GridCellState.Damaged, sunk: render == GridCellState.Sunk,
    missed: render == GridCellState.Missed }"
>

</div>
`
export default class GridCellComponent extends Component {
    static get selector() { return 'app-game-cell' }
    static get template() { return template }

    /** Properties that can be passed into this component. */
    static get props() {
        return [
            'render',
        ]
    }

    /** Make the "GridCellState" enum available in the template. */
    GridCellState = GridCellState

    on_click() {
        this.$emit('click')
    }
}
