import {Component} from '../../lib/vues6.js'
import {GridCellState} from '../module/util.js'

const template = `
<div
    class="game-board-cell-component"
    @click="on_click"
    @mouseover="on_hover($event)"
    @mouseleave="on_mouse_leave"
    v-bind:class="{ disabled: render === GridCellState.Disabled, available: render === GridCellState.Available,
    ship: render == GridCellState.Ship, damaged: render == GridCellState.Damaged, sunk: render == GridCellState.Sunk,
    missed: render == GridCellState.Missed, ghost: has_ghost_ship }"
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
            'has_ghost_ship',
        ]
    }

    /** Make the "GridCellState" enum available in the template. */
    GridCellState = GridCellState

    on_click() {
        this.$emit('click')
    }

    on_hover($event) {
        this.$emit('hover', $event)
    }

    on_mouse_leave() {
        this.$emit('hoverchange')
    }
}
