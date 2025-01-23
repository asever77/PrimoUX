(() => {
	'use strict';

	const global = 'PrimoUX';
	window[global] = {};
	const Global = window[global];

	Global.exe = {};
	Global.modal = {};
	Global.callback = {};
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