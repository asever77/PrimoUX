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

class Modal {
	constructor(opt) {
		const defaults = {
			type: 'modal', 
			classname: '',
			ps: 'center',
			area: document.querySelector('.area-modal'),
			dim: true,
			focus_back: null,
		};

		this.option = { ...defaults, ...opt };
		this.modal = null;
		this.modal_item = null;
		this.btn_hide = null;
		this.btn_last = null;
		this.btn_first = null;
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
					this.modal = document.querySelector(`[data-modal="${this.option.id}"]`);
					this.modal_item = this.modal.querySelector('[data-modal-item]');
					this.modal.setAttribute('tabindex', '0');
					this.modal_item.insertAdjacentHTML('beforeend', '<button type="button" class="btn-hidden" data-modal-last data-modal-hide aria-label="마지막 지점입니다. 창닫기"></button>')
					this.btn_hide = this.modal.querySelectorAll('[data-modal-hide]');
					this.btn_last = this.modal.querySelector('[data-modal-last]');

					const tags = this.modal.querySelectorAll('*');
					const tagLen = tags.length;
					for (let i = 0; i < tagLen; i++) {
						const _tag = tags[i];
						const tag_name = _tag.tagName;
						if (tag_name === 'BUTTON' || tag_name === 'A' || tag_name === 'INPUT' || tag_name === 'TEXTAREA') {
							this.btn_first = _tag;
							break;
						}
					}
					
					//load callback
					this.option.loadCallback && this.option.loadCallback();

					this.btn_hide.forEach(item => {
						item.addEventListener('click', this.hide);
					});
				}
			})
			.then(() => console.log('Content loaded'))
			.catch(err => console.error('Error loading modal content:', err));
		}
	}

	show() {
		this.option.focus_back = document.activeElement;
		this.modal.setAttribute('aria-hidden', 'false');
		this.modal.focus();
		this.modal.dataset.state = "show";
	
		this.btn_first.addEventListener('keydown', this.keyStart);	
		this.btn_last.addEventListener('keydown', this.keyEnd);	
	}
	keyStart = (e) => {
		if (e.shiftKey && e.key === 'Tab') {
			e.preventDefault();
			this.btn_last.focus();
		}
	}
	keyEnd = (e) => {
		if (!e.shiftKey && e.key === 'Tab') {
			e.preventDefault();
			this.btn_first.focus();
		}
	}
	hide = (opt) => {
		this.btn_first.removeEventListener('keydown', this.keyStart);	
		this.btn_last.removeEventListener('keydown', this.keyEnd);	

		if (opt.focus_target) this.option.focus_back = opt.focus_target;
		this.modal.dataset.state = "hide";
		this.option.focus_back.focus();
		this.modal.setAttribute('aria-hidden', 'true');
	}
}