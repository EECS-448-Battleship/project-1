import {Component} from '../../lib/vues6.js'
import {ShipType, isShipCell} from '../module/util.js'
import game_service from '../services/GameState.service.js'

/*
 * This is the HTML/JavaScript for the game board component.
 * The "template" variable at the top defines the HTML for this component. It can contain references
 * to methods and properties on the "GameBoardComponent" class shown below.
 *
 * For example, the "greeting" property is referenced in the template as "{{ greeting }}". When
 * the page loads, this will be replaced by the value of the "greeting" property.
 *
 * The class below manages the logic referenced by the template. Then, we can use the component
 * in the application by creating an HTML tag with the value of the "selector()" getter.
 *
 * In this case, that's the <app-game-board></app-game-board> tag in index.html.
 *
 * We can also use components w/in components, to keep code clean. For example, we could have
 * a battleship component that we reference inside this game board component.
 *
 * Battleship grid is 14x14.
 */
const template  = `
<div class="game-board-component" v-if="ready" @mouseleave="on_mouse_leave">
    <div class="grid-container">
        <div class="grid-row" v-for="(row,i) of rows">
        <br> <span class="label">{{ i + 1 }}</span>
            <app-game-cell
                v-for="(cell,j) of row"
                v-bind:render="cell.render"
                @click="on_cell_click(i,j)"
                @hover="on_cell_hover(i,j)"
                v-bind:has_ghost_ship="is_ghost_cell(i,j)"
            ></app-game-cell>
        </div>
         <div class="column_labels">
             <div class="label" v-for="(label,i) of column_labels">{{ label }}</div>
         </div>
    </div>
</div>
`
export default class GameBoardComponent extends Component {
    static get selector() { return 'app-game-board' }
    static get template() { return template }
    static get props() { return ['rows', 'is_placement_mode'] }

    /**
     * If true, the grid is ready to be rendered. If false,
     * the grid will be hidden.
     * @type {boolean}
     */
    ready = false

    /**
     * The various column labels to display.
     * @type {string[]}
     */
    column_labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]

    /**
     * Array of coordinates as [row_index, column_index] of cells which should
     * show a ghost ship overlay.
     * @type {[number, number][]}
     */
    ship_ghost_cells = []

    /**
     * The ship currently being placed.
     * @type {string}
     */
    current_placement = ShipType.x3

    /**
     * Set to true when the shift key is pressed.
     * @type {boolean}
     */
    shift_pressed = false

    /**
     * Array of functions bound to event listeners. Used to
     * remove event listeners on destroy.
     * @type {function[]}
     */
    bound_fns = []

    async vue_on_create() {
        this.ready = true

        // We need to listen for keyup/keydown so we can tell when the user has
        // pressed/released the shift key.
        const keyup_fn = this.on_keyup.bind(this)
        const keydown_fn = this.on_keydown.bind(this)
        this.bound_fns.push(keyup_fn, keydown_fn)

        window.addEventListener('keyup', keyup_fn)
        window.addEventListener('keydown', keydown_fn)
    }

    async vue_on_destroy() {
        // Remove the event listeners for the shift key
        const [keyup_fn, keydown_fn] = this.bound_fns
        window.removeEventListener('keyup', keyup_fn)
        window.removeEventListener('keydown', keydown_fn)
    }

    on_cell_click(row_i, cell_i) {

    }

    /**
     * Called when the user hovers over a cell.
     * When in placement mode, this updates the cells that show the ghost ship.
     * @param {number} row_i
     * @param {number} cell_i
     */
    on_cell_hover(row_i, cell_i) {
        if ( this.is_placement_mode ) {
            const ghost_cells = [[row_i, cell_i]]
            const is_horizontal = this.shift_pressed
            let is_valid_hover = true

            if ( !is_horizontal ) {
                const num_cells = game_service.get_ship_length(this.current_placement)
                for ( let i = row_i + 1; i < row_i + num_cells; i += 1 ) {
                    ghost_cells.push([i, cell_i])
                    if ( i > 8 ) is_valid_hover = false
                }
            } else {
                const num_cells = game_service.get_ship_length(this.current_placement)
                for ( let i = cell_i + 1; i < cell_i + num_cells; i += 1 ) {
                    ghost_cells.push([row_i, i])
                    if ( i > 8 ) is_valid_hover = false
                }
            }

            // Don't allow placing on existing ships
            is_valid_hover = !ghost_cells.some(([row_i, col_i]) => this.is_ship_cell(row_i, col_i))

            if ( is_valid_hover ) {
                this.ship_ghost_cells = ghost_cells
            } else {
                this.ship_ghost_cells = []
            }
        } else {
            this.ship_ghost_cells = []
        }
    }

    /**
     * Returns true if the cell at [row_index, column_index] is a ship.
     * @param {number} row_i
     * @param {number} col_i
     * @return {boolean}
     */
    is_ship_cell(row_i, col_i) {
        return isShipCell(this.rows[row_i][col_i].render)
    }

    /**
     * Hide the ghost ship when the mouse leaves the grid.
     */
    on_mouse_leave() {
        this.ship_ghost_cells = []
    }

    /**
     * Returns a truthy value if the given cell is a ghost ship.
     * @param {number} row_i
     * @param {number} col_i
     * @return {boolean}
     */
    is_ghost_cell(row_i, col_i) {
        return !!this.ship_ghost_cells.find(([cell_row_i, cell_col_i]) => cell_row_i === row_i && cell_col_i === col_i)
    }

    /**
     * When keydown, check if shift was pressed. If so, update the placement.
     * @param event
     */
    on_keydown(event) {
        if ( event.key === 'Shift' ) {
            this.shift_pressed = true
            if ( this.ship_ghost_cells.length > 0 ) {
                this.on_cell_hover(this.ship_ghost_cells[0][0], this.ship_ghost_cells[0][1])
            }
        }
    }

    /**
     * When keyup, check if shift was released. If so, update the placement.
     * @param event
     */
    on_keyup(event) {
        if ( event.key === 'Shift' ) {
            this.shift_pressed = false
            if ( this.ship_ghost_cells.length > 0 ) {
                this.on_cell_hover(this.ship_ghost_cells[0][0], this.ship_ghost_cells[0][1])
            }
        }
    }
}
