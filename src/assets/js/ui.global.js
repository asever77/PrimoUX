(() => {
	'use strict';

	const global = 'PrimoUX';
	window[global] = {};
	const Global = window[global];

	Global.exe = {};
	Global.dialog = {};
	Global.callback = {};

	Global.utils = {
		/**
		 * Loads content from a specified source and inserts it into a DOM element.
		 * @param {Object} options - Options for the function.
		 * @param {Element} options.area - The DOM element where content will be inserted.
		 * @param {string} options.src - The source URL to fetch content from.
		 * @param {boolean} [options.insert=false] - Whether to insert content at the beginning or replace it.
		 * @param {Function|null} [options.callback=null] - A callback function to execute after loading content.
		 * @returns {Promise<string>} A promise that resolves with the fetched content.
		 */
		loadContent({ area, src, insert = false, callback = null }) {
			return new Promise((resolve, reject) => {
				if (!(area instanceof Element)) {
					console.error('Invalid selector provided. Expected a DOM element.');
					reject(new Error('Invalid DOM element.'));
					return;
				}
				if (!src) {
					reject(new Error('Source (src) is required'));
					return;
				}

				fetch(src)
					.then(response => {
						if (!response.ok) {
							throw new Error(`Failed to fetch content from ${src}. HTTP status: ${response.status}`);
						}
						return response.text();
					})
					.then(result => {
						if (insert) {
							area.insertAdjacentHTML('afterbegin', result);
						} else {
							area.innerHTML = result;
						}
						if (typeof callback === 'function') {
							callback();
						}
						resolve(result);
					})
					.catch(error => {
						console.error(`Error loading content from ${src}:`, error);
						reject(error);
					});
			});
		},
	}

})();