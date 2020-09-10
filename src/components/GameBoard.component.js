import {Component} from '../../lib/vues6.js'

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
<div class="game-board-component" v-if="ready">
    <div class="grid-container">
        <div class="grid-row" v-for="(row,i) of rows">
        <br> <span class="label">{{ i + 1 }}</span>
            <app-game-cell
                v-for="(cell,j) of row"
                v-bind:render="cell.render"
                @click="on_cell_click(i,j)"
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
    static get props() { return ['rows'] }

    /**
     * If true, the grid is ready to be rendered. If false,
     * the grid will be hidden.
     * @type {boolean}
     */
    ready = false

    /**
     * Array of grid rows. Each element in this array is itself
     * an array of grid cell values.
     * @type {Array<Array<*>>}
     */
    // rows = []
    column_labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]

    async vue_on_create() {
        this.ready = true
    }

    on_cell_click(row_i, cell_i) {
        alert(`${row_i} : ${cell_i}`)
    }
}
