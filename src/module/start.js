import components from '../components.js'
import VuES6Loader from '../../lib/vues6.js'

/*
 * This is a little script to load the components into Vue in a nice way.
 */
const loader = new VuES6Loader(components)
loader.load()

/*
 * This is the Vue app itself.
 */
const app = new Vue({
    el: '#wrapper',
    data: {},
})

/*
 * In case either needs to be accessed, they can with:
 * import { app, loader } from './start.js'
 */
export { app, loader }
