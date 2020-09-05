export default class VuES6Loader {
	constructor(component_list) {
		this.components = component_list
	}

	load() {
		for ( const ComponentClass of Object.values(this.components) ) {
			const method_properties = Object.getOwnPropertyNames(ComponentClass.prototype)

			const watch = {}
			method_properties.filter(x => x.startsWith('watch_')).some(method_name => {
				const field_name = method_name.substr(6)
				const handler = function(...args) {
					return ComponentClass.prototype[method_name].bind(this)(...args)
				}
				watch[field_name] = handler
			})

			const methods = {}
			method_properties.filter(x => !x.startsWith('watch_')).some(method_name => {
				const handler = function(...args) {
					return ComponentClass.prototype[method_name].bind(this)(...args)
				}
				methods[method_name] = handler
			})

			Vue.component(ComponentClass.selector, {
				props: ComponentClass.props,
				data: () => {
					return new ComponentClass()
				},
				watch,
				methods,
				template: ComponentClass.template,
				created: function() {
					if ( typeof this.vue_on_create === 'function' ) this.vue_on_create()
				},
				updated: function() {
					if ( typeof this.vue_on_update === 'function' ) this.vue_on_update()
				},
				mounted: function() {
					if ( typeof this.vue_on_mount === 'function' ) this.vue_on_mount()
				},
				destroyed: function() {
					if ( typeof this.vue_on_destroy === 'function' ) this.vue_on_destroy()
				},
			})
		}
	}
}

export class Component {
	static get selector() { return '' }
	static get template() { return '' }
	static get props() { return [] }

	vue_on_create() {}
	vue_on_update() {}
	vue_on_mount() {}
	vue_on_destroy() {}
}


