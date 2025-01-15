(() => {
	'use strict';

	const global = 'primoUX';
	window[global] = {};
	const Global = window[global];

})();

class Modal {
	constructor(opt) {
		console.log(opt);
		this.modal = document.querySelector(`[data-modal="${opt.id}"]`);

		console.log(this.modal);
	}
}