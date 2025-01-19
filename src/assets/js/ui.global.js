(() => {
	'use strict';

	const global = 'PrimoUX';
	window[global] = {};
	const Global = window[global];

	Global.utils = {
		loadContent({ area, src, insert = false, callback = null }) {
			return new Promise((resolve, reject) => {
				if (!(area instanceof Element)) {
					console.error('Invalid selector provided');
					return;
				}
				if (!src) {
					reject(new Error('Source (src) is required'));
					return;
				}
				fetch(src)
					.then(response => {
						if (!response.ok) throw new Error(`Failed to fetch ${src}`);
						return response.text();
					})
					.then(result => {
						if (insert) {
							area.insertAdjacentHTML('afterbegin', result);
						} else {
							area.innerHTML = result;
						}
						if (callback) callback();
						resolve(result);
					})
					.catch(error => reject(error));
			});
		},
	}
})();

class Modal {
	constructor(opt) {
		const defaults = {
			type: 'modal', 
			classname: '',
			ps: 'center',
			area: document.querySelector('.area-modal'),
			dim: true,
		};

		this.option = { ...defaults, ...opt };
		this.modal = document.querySelector(`[data-modal="${this.option.id}"]`);
		this.area = this.option.area;
		this.init();
	}

	init() {
		if (this.option.src && !this.modal) {
			PrimoUX.utils.loadContent({
				area: this.area,
				src: this.option.src,
				insert: true,
				callback: () => {
					console.log('callback');
				}
			})
			.then(() => console.log('Content loaded'))
			.catch(err => console.error('Error loading modal content:', err));
		}
	}

	show() {
		
	}
}