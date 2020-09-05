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
 */
const template  = `
<div>
    <p>The game board will go here. {{ greeting }}</p>
</div>
`
export default class GameBoardComponent extends Component {
    static get selector() { return 'app-game-board' }
    static get template() { return template }
    static get props() { return [] }

    greeting = 'Hello, world.'

    async vue_on_create() {
        console.log('The game board has been created!')
    }
}
