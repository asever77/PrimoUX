(() => {
	'use strict';

	const global = 'QuizGame';
	window[global] = {};
	const Global = window[global];

	const UA = navigator.userAgent.toLowerCase();
	const deviceInfo = ['android', 'iphone', 'ipod', 'ipad', 'blackberry', 'windows ce', 'windows', 'samsung', 'lg', 'mot', 'sonyericsson', 'nokia', 'opeara mini', 'opera mobi', 'webos', 'iemobile', 'kfapwi', 'rim', 'bb10'];

	Global.exe = {};
	Global.callback = {};
	Global.page = {};
	Global.data = {};

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
		shuffleArray(array) {
			for (let i = array.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1)); // 0부터 i까지의 랜덤한 인덱스 선택
					[array[i], array[j]] = [array[j], array[i]]; // 요소 교환
			}
			return array;
		},
	}
	Global.state = {
		isSystemModal: false,
		device: {
			info: (() => {
				for (let i = 0, len = deviceInfo.length; i < len; i++) {
					if (UA.match(deviceInfo[i]) !== null) {
						return deviceInfo[i];
					}
				}
			})(),
			width: window.innerWidth,
			height: window.innerHeight,
			ios: (/ip(ad|hone|od)/i).test(UA),
			android: (/android/i).test(UA),
			app: UA.indexOf('appname') > -1 ? true : false,
			touch: null,
			mobile: null,
			os: (navigator.appVersion).match(/(mac|win|linux)/i)
		},
		browser: {
			ie: UA.match(/(?:msie ([0-9]+)|rv:([0-9\.]+)\) like gecko)/i),
			local: (/^http:\/\//).test(location.href),
			firefox: (/firefox/i).test(UA),
			webkit: (/applewebkit/i).test(UA),
			chrome: (/chrome/i).test(UA),
			opera: (/opera/i).test(UA),
			safari: (/applewebkit/i).test(UA) && !(/chrome/i).test(UA),
			size: null
		},
		keys: {
			tab: 9,
			enter: 13,
			alt: 18,
			esc: 27,
			space: 32,
			pageup: 33,
			pagedown: 34,
			end: 35,
			home: 36,
			left: 37,
			up: 38,
			right: 39,
			down: 40
		},
		scroll: {
			y: 0,
			direction: 'down',
		},
		breakPoint: [700, 1280],
		col: 12,
		effect: { //http://cubic-bezier.com - css easing effect
			linear: '0.250, 0.250, 0.750, 0.750',
			ease: '0.250, 0.100, 0.250, 1.000',
			easeIn: '0.420, 0.000, 1.000, 1.000',
			easeOut: '0.000, 0.000, 0.580, 1.000',
			easeInOut: '0.420, 0.000, 0.580, 1.000',
			easeInQuad: '0.550, 0.085, 0.680, 0.530',
			easeInCubic: '0.550, 0.055, 0.675, 0.190',
			easeInQuart: '0.895, 0.030, 0.685, 0.220',
			easeInQuint: '0.755, 0.050, 0.855, 0.060',
			easeInSine: '0.470, 0.000, 0.745, 0.715',
			easeInExpo: '0.950, 0.050, 0.795, 0.035',
			easeInCirc: '0.600, 0.040, 0.980, 0.335',
			easeInBack: '0.600, -0.280, 0.735, 0.045',
			easeOutQuad: '0.250, 0.460, 0.450, 0.940',
			easeOutCubic: '0.215, 0.610, 0.355, 1.000',
			easeOutQuart: '0.165, 0.840, 0.440, 1.000',
			easeOutQuint: '0.230, 1.000, 0.320, 1.000',
			easeOutSine: '0.390, 0.575, 0.565, 1.000',
			easeOutExpo: '0.190, 1.000, 0.220, 1.000',
			easeOutCirc: '0.075, 0.820, 0.165, 1.000',
			easeOutBack: '0.175, 0.885, 0.320, 1.275',
			easeInOutQuad: '0.455, 0.030, 0.515, 0.955',
			easeInOutCubic: '0.645, 0.045, 0.355, 1.000',
			easeInOutQuart: '0.770, 0.000, 0.175, 1.000',
			easeInOutQuint: '0.860, 0.000, 0.070, 1.000',
			easeInOutSine: '0.445, 0.050, 0.550, 0.950',
			easeInOutExpo: '1.000, 0.000, 0.000, 1.000',
			easeInOutCirc: '0.785, 0.135, 0.150, 0.860',
			easeInOutBack: '0.680, -0.550, 0.265, 1.550'
		}
	};
	Global.parts = {
		makeID(v) {
			let idLength = v;
			let idText = "";
			let word_list = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*";
			for (let i = 0; i < idLength; i++) {
				idText += word_list.charAt(Math.floor(Math.random() * word_list.length));
			};
			return idText;
		},
		scroll() {
			const el_html = document.querySelector('html');
			let last_know_scroll_position = 0;
			let ticking = false;

			const doSomething = (scroll_pos) => {
				Global.state.scroll.direction =
					Global.state.scroll.y > scroll_pos ? 'up' : Global.state.scroll.y < scroll_pos ? 'down' : '';
				Global.state.scroll.y = scroll_pos;
				el_html.dataset.direction = Global.state.scroll.direction;
				el_html.dataset.top = scroll_pos < 10 ? true : false;
			}
			window.addEventListener('scroll', (e) => {
				last_know_scroll_position = window.scrollY;

				if (!ticking) {
					window.requestAnimationFrame(() => {
						doSomething(last_know_scroll_position);
						ticking = false;
					});

					ticking = true;
				}
			});
		},
		resizeState() {
			const act = () => {
				const el_html = document.querySelector('html');
				const browser = Global.state.browser;
				const device = Global.state.device;

				device.width = window.innerWidth;
				device.height = window.innerHeight;

				device.touch = device.ios || device.android || (document.ontouchstart !== undefined && document.ontouchstart !== null);
				device.mobile = device.touch && (device.ios || device.android);
				device.os = device.os ? device.os[0] : '';
				device.os = device.os.toLowerCase();

				device.breakpoint = device.width >= Global.state.breakPoint[0] ? true : false;
				device.col = device.width >= Global.state.breakPoint[1] ? '12' : device.width > Global.state.breakPoint[0] ? '8' : '4';
				Global.state.col = device.col;

				if (browser.ie) {
					browser.ie = browser.ie = parseInt(browser.ie[1] || browser.ie[2]);
					(11 > browser.ie) ? support.pointerevents = false : '';
					(9 > browser.ie) ? support.svgimage = false : '';
				} else {
					browser.ie = false;
				}

				el_html.dataset.col = device.col;
				el_html.dataset.browser = browser.chrome ? 'chrome' : browser.firefox ? 'firefox' : browser.opera ? 'opera' : browser.safari ? 'safari' : browser.ie ? 'ie' + browser.ie : 'other';
				el_html.dataset.platform = device.ios ? "ios" : device.android ? "android" : 'window';
				el_html.dataset.device = device.mobile ? device.app ? 'app' : 'mobile' : 'desktop';
			}
			window.addEventListener('resize', act);
			act();
		},
		comma(n) {
			let parts = n.toString().split(".");

			return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
		},
		add0(x) {
			return Number(x) < 10 ? '0' + x : x;
		},
		paraGet(paraname) {
			const _tempUrl = window.location.href;
			let _tempArray = _tempUrl.split(paraname + '=');

			if (_tempArray.length > 1) {
				_tempArray = _tempArray[1];
				_tempArray = _tempArray.split('&');
				_tempArray = _tempArray[0];
				_tempArray = _tempArray.split('#');
				_tempArray = _tempArray[0];

			} else {
				_tempArray = null
			}
			return _tempArray;
		},
		paraSet(key, value) {
			const _tempUrl = window.location.href;
			let _tempArray = _tempUrl.split(key + '=');

			if (_tempArray.length > 1) {
				_tempArray = _tempArray[0] + key + '=' + value;
			} else {
				_tempArray = _tempUrl + '?' + key + '=' + value;
			}

			history.pushState(null, null, _tempArray);
		},
		RAF(start, end, startTime, duration) {
			const _start = start;
			const _end = end;
			const _duration = duration ? duration : 300;
			const unit = (_end - _start) / _duration;
			const endTime = startTime + _duration;

			let now = new Date().getTime();
			let passed = now - startTime;

			if (now <= endTime) {
				Global.parts.RAF.time = _start + (unit * passed);
				requestAnimationFrame(scrollTo);
			} else {
				!!callback && callback();
			}
		},
		getIndex(ele) {
			let _i = 0;

			while ((ele = ele.previousSibling) != null) {
				(ele.nodeType === 1) && _i++;
			}

			return _i;
		},
		/**
		 * include
		 * @param {string} opt.id 
		 * @param {string} opt.src 
		 * @param {string} opt.type : 'html' | 'json'
		 * @param {boolean} opt.insert : true[insertAdjacentHTML] | false[innerHTML]
		 * @param {function} opt.callback
		 * 
		 */
		include(opt) {
			let selector = document.querySelector('[data-id="' + opt.dataId + '"]');
			const src = opt.src;
			const type = !opt.type ? 'HTML' : opt.type;
			const insert = !!opt.insert ? opt.insert : false;
			const callback = !!opt.callback ? opt.callback : false;

			!selector ? selector = document.querySelector('body') : '';

			if (!!selector && !!src) {
				switch (type) {
					case 'HTML':
						fetch(src)
							.then(response => response.text())
							.then(result => {
								if (insert) {
									selector.insertAdjacentHTML('afterbegin', result);
								} else {
									selector.innerHTML = result;
								}
							}).then(() => {
								!!callback && callback(selector);
							});
						break;
				}
			}
		},
		resizObserver(opt) {
			let timer = null;
			let w = null;
			let h = null;
			const observer = new ResizeObserver(entries => {
				for (let entry of entries) {
					const { width, height } = entry.contentRect;
					w === null ? w = width : '';
					h === null ? h = height : '';

					!!timer && clearTimeout(timer);
					opt.callback({
						width: width,
						height: height,
						resize: [w === width ? false : true, h === height ? false : true]
					});
				}
			});

			observer.observe(opt.el);
		}
	};
	Global.scroll = {
		options: {
			selector: document.querySelector('html, body'),
			focus: false,
			top: 0,
			left: 0,
			add: 0,
			align: 'default',
			effect: 'smooth', //'auto'
			callback: false,
		},
		init() {
			const el_areas = document.querySelectorAll('.ui-scrollmove-btn[data-area]');

			for (let i = 0, len = el_areas.length; i < len; i++) {
				const that = el_areas[i];

				that.removeEventListener('click', this.act);
				that.addEventListener('click', this.act);
			}
		},
		act(e) {
			const el = e.currentTarget;
			const area = el.dataset.area;
			const name = el.dataset.name;
			const add = el.dataset.add === undefined ? 0 : el.dataset.add;
			const align = el.dataset.align === undefined ? 'default' : el.dataset.align;
			const callback = el.dataset.callback === undefined ? false : el.dataset.callback;




			let el_area = document.querySelector('.ui-scrollmove[data-area="' + area + '"]');

			const el_item = el_area.querySelector('.ui-scrollmove-item[data-name="' + name + '"]');

			let top = (el_area.getBoundingClientRect().top - el_item.getBoundingClientRect().top) - el_area.scrollTop;
			let left = (el_area.getBoundingClientRect().left - el_item.getBoundingClientRect().left) - el_area.scrollLeft;

			if (align === 'center') {
				top = top - (el_item.offsetHeight / 2);
				left = left - (el_item.offsetWidth / 2);
			}

			Global.scroll.move({
				top: top,
				left: left,
				add: add,
				selector: el_area,
				align: align,
				focus: el_item,
				callback: callback
			});
		},
		move(option) {
			const opt = Object.assign({}, this.options, option);
			//const opt = {...this.options, ...option};
			const top = opt.top;
			const left = opt.left;
			const callback = opt.callback;
			const align = opt.align;
			const add = opt.add;
			const focus = opt.focus;
			const effect = opt.effect;
			let selector = opt.selector;

			switch (align) {
				case 'center':

					selector.scrollTo({
						top: Math.abs(top) - (selector.offsetHeight / 2) + add,
						left: Math.abs(left) - (selector.offsetWidth / 2) + add,
						behavior: effect
					});
					break;

				case 'default':
				default:
					selector.scrollTo({
						top: Math.abs(top) + add,
						left: Math.abs(left) + add,
						behavior: effect
					});
			}
			this.checkEnd({
				selector: selector,
				nowTop: selector.scrollTop,
				nowLeft: selector.scrollLeft,
				align: align,
				callback: callback,
				focus: focus
			});
		},
		checkEndTimer: {},
		checkEnd(opt) {
			const el_selector = opt.selector;
			const align = opt.align
			const focus = opt.focus
			const callback = opt.callback

			let nowTop = opt.nowTop;
			let nowLeft = opt.nowLeft;

			Global.scroll.checkEndTimer = setTimeout(() => {
				//스크롤 현재 진행 여부 판단
				if (nowTop === el_selector.scrollTop && nowLeft === el_selector.scrollLeft) {
					clearTimeout(Global.scroll.checkEndTimer);
					//포커스가 위치할 엘리먼트를 지정하였다면 실행
					if (!!focus) {
						focus.setAttribute('tabindex', 0);
						focus.focus();
					}
					//스크롤 이동후 콜백함수 실행
					if (!!callback) {
						if (typeof callback === 'string') {
							Global.callback[callback]();
						} else {
							callback();
						}
					}
				} else {
					nowTop = el_selector.scrollTop;
					nowLeft = el_selector.scrollLeft;

					Global.scroll.checkEnd({
						selector: el_selector,
						nowTop: nowTop,
						nowLeft: nowLeft,
						align: align,
						callback: callback,
						focus: focus
					});
				}
			}, 100);
		}
	}
	/**
	 * FOCUS : 특정 영역 탭 이동 시 무한루프 포커스
	 * @param {object} selector 무한루프 포커스 영역 설정
	 */
	Global.focus = {
		loop(opt) {
			const el = opt.selector;

			if (opt === undefined) {
				return false;
			}

			const tags = el.querySelectorAll('*');
			const tagLen = tags.length;

			for (let i = 0; i < tagLen; i++) {
				const _tag = tags[i];
				const tag_name = _tag.tagName;
				if (tag_name === 'BUTTON' || tag_name === 'A' || tag_name === 'INPUT' || tag_name === 'TEXTAREA') {
					_tag.classList.add('ui-focusloop-start');
					break;
				}
			}

			if (!!el.querySelector('.ui-modal-wrap') && !el.querySelector('.ui-modal-wrap .ui-modal-last') && !el.getAttribute('aria-live')) {
				const modal_wrap = el.querySelector('.ui-modal-wrap');
				const last = '<button type="button" class="ui-modal-last ui-focusloop-end ui-modal-close" aria-label="' + (el.querySelector('.ui-modal-tit') && el.querySelector('.ui-modal-tit').textContent) + ' 레이어 문서 마지막 지점입니다. 모달 창 닫기"></button>'
				modal_wrap.insertAdjacentHTML('beforeend', last);
			} else if (!el.querySelector('.ui-focusloop-end')) {
				for (let i = tagLen - 1; i >= 0; i--) {
					const _tag = tags[i];
					const tag_name = _tag.tagName;
					if (tag_name === 'BUTTON' || tag_name === 'A' || tag_name === 'INPUT' || tag_name === 'TEXTAREA') {
						_tag.classList.add('ui-focusloop-end');
						break;
					}
				}
			}

			const el_start = el.querySelector('.ui-focusloop-start');
			const el_end = el.querySelector('.ui-focusloop-end');

			const keyStart = (e) => {
				if (e.shiftKey && e.keyCode == 9) {
					e.preventDefault();
					el_end.focus();
				}
			}
			const keyEnd = (e) => {
				if (!e.shiftKey && e.keyCode == 9) {
					e.preventDefault();
					el_start.focus();
				}
			}

			el_start.focus();
			// (!el.getAttribute('aria-live')) ? el.focus() : el_start.focus();
			el_start.addEventListener('keydown', keyStart);
			el_end.addEventListener('keydown', keyEnd);
		}
	}
	Global.form = {
		init() {
			const _this = this;
			const input_dels = document.querySelectorAll('.form-with-del');
			const input_units = document.querySelectorAll('.form-with-unit');
			const money_term = document.querySelector('.form-money-terms');
			const input_num = document.querySelectorAll('[data-value="number"]');
			const dateInputs = document.querySelectorAll('.form-input-date');

			if (dateInputs) {
				dateInputs.forEach(input => {
					input.addEventListener('click', function () {
						input.showPicker(); // 브라우저 기본 달력 팝업 열기
					});
				});
			}

			if (input_num) {
				input_num.forEach((item) => {
					item.addEventListener('input', _this.isNumber);
				});
			}

			if (input_dels) {
				input_dels.forEach((item) => {
					const deleteButton = item.nextElementSibling;  // 삭제 버튼은 input 요소의 다음 형제 요소

					// 입력 필드 내용이 변경될 때마다 삭제 버튼을 토글
					item.addEventListener('input', function () {
						if (item.value.trim() !== '') {
							deleteButton.style.display = 'flex';  // 입력이 있으면 삭제 버튼 표시
						} else {
							deleteButton.style.display = 'none';  // 입력이 없으면 삭제 버튼 숨김
						}
					});

					// 삭제 버튼 클릭 시 입력 필드의 값을 지우고, 버튼 숨기기
					if (deleteButton) {
						deleteButton.addEventListener('click', function () {
							item.value = '';  // 입력 필드 값 비우기
							deleteButton.style.display = 'none';  // 삭제 버튼 숨기기
							item.focus();  // 입력 필드에 포커스
						});
					}

					// 페이지 로드 시 입력 필드가 이미 값이 있으면 삭제 버튼을 보이게 함
					if (item.value.trim() !== '') {
						deleteButton.style.display = 'inline-block';
					}
				});
			}

			if (input_units) {
				// 입력 필드에 포커스가 가거나 값이 있을 때 "만원"을 보여줍니다.
				input_units.forEach((item) => {
					item.addEventListener('focus', _this.unitFocus);
					item.addEventListener('blur', _this.unitBlur);
					item.addEventListener('input', _this.unitState);

					// 초기 값이 있을 때 "만원" 표시
					if (item.value.trim() !== '') {
						const item_parent = item.parentNode;
						const item_money = item_parent.querySelector('.form-money-terms');
						item_money.style.display = 'block';
					}
				});
			}
		},
		isNumber(e) {
			const item = e.target;
			item.value = item.value.replace(/[^0-9]/g, '');
		},
		unitBlur(e) {
			const item = e.target;
			const item_parent = item.parentNode;
			const item_money = item_parent.querySelector('.form-money-terms');

			if (item.value.trim() === '') {
				item_money.style.display = 'none';  // 값이 없으면 "만원" 숨기기
			}
		},
		unitFocus(e) {
			const item = e.target;
			const item_parent = item.parentNode;
			const item_money = item_parent.querySelector('.form-money-terms');

			item_money.style.display = 'block';
		},
		unitState(e) {
			const item = e.target;
			const item_parent = item.parentNode;
			const item_money = item_parent.querySelector('.form-money-terms');

			item_money.style.display = (item.value.trim() !== '') ? 'block' : 'none';
		}
	}
	Global.ajax = {
		options: {
			page: true,
			add: false,
			prepend: false,
			effect: false,
			loading: false,
			callback: false,
			errorCallback: false,
			type: 'GET',
			cache: false,
			async: true,
			contType: 'application/x-www-form-urlencoded',
			dataType: 'html'
		},
		init(option) {
			if (option === undefined) {
				return false;
			}

			const opt = Object.assign({}, this.options, option);
			//const opt = {...this.options, ...option};
			const xhr = new XMLHttpRequest();
			const area = opt.area;
			const loading = opt.loading;
			const effect = opt.effect;
			const type = opt.type;
			const url = opt.url;
			const page = opt.page;
			const add = opt.add;
			const prepend = opt.prepend;
			const mimeType = opt.mimeType;
			const contType = opt.contType;
			const callback = opt.callback || false;
			const errorCallback = opt.errorCallback === undefined ? false : opt.errorCallback;

			loading && Global.loading.show();

			if (!!effect && !!document.querySelector(effect)) {
				area.classList.remove(effect + ' action');
				area.classList.add(effect);
			}

			xhr.open(type, url);
			xhr.setRequestHeader(mimeType, contType);
			xhr.send();
			xhr.onreadystatechange = () => {
				if (xhr.readyState !== XMLHttpRequest.DONE) {
					return;
				}

				if (xhr.status === 200) {
					loading && Global.loading.hide();

					if (page) {
						if (add) {
							prepend ?
								area.insertAdjacentHTML('afterbegin', xhr.responseText) :
								area.insertAdjacentHTML('beforeend', xhr.responseText);
						} else {
							area.innerHTML = xhr.responseText;
						}

						callback && callback();
						effect && area.classList.add('action');
					} else {
						callback && callback(xhr.responseText);
					}

				} else {
					loading && Global.loading.hide();
					errorCallback && errorCallback();
				}
			};
		}
	}
	Global.loading = {
		timerShow: {},
		timerHide: {},
		options: {
			selector: null,
			message: null,
			styleClass: 'orbit' //time
		},
		show(option) {
			const opt = Object.assign({}, this.options, option);
			const selector = opt.selector;
			const styleClass = opt.styleClass;
			const message = opt.message;
			const el = (selector !== null) ? selector : document.querySelector('body');
			const el_loadingHides = document.querySelectorAll('.mdl-loading:not(.visible)');

			for (let i = 0, len = el_loadingHides.length; i < len; i++) {
				const that = el_loadingHides[i];

				that.remove();
			}

			let htmlLoading = '';

			(selector === null) ?
				htmlLoading += '<div class="mdl-loading ' + styleClass + '">' :
				htmlLoading += '<div class="mdl-loading type-area ' + styleClass + '">';

			htmlLoading += '<div class="mdl-loading-wrap">';

			(message !== null) ?
				htmlLoading += '<strong class="mdl-loading-message"><span>' + message + '</span></strong>' :
				htmlLoading += '';

			htmlLoading += '</div>';
			htmlLoading += '</div>';

			const showLoading = () => {
				const el_child = el.childNodes;
				let is_loading = false;

				for (let i = 0; i < el_child.length; i++) {
					if (el_child[i].nodeName === 'DIV' && el_child[i].classList.contains('mdl-loading')) {
						is_loading = true;
					}
				}

				!is_loading && el.insertAdjacentHTML('beforeend', htmlLoading);
				htmlLoading = null;

				const el_loadings = document.querySelectorAll('.mdl-loading');

				for (let i = 0, len = el_loadings.length; i < len; i++) {
					const that = el_loadings[i];

					that.classList.add('visible');
					that.classList.remove('close');
				}
			}
			clearTimeout(this.timerShow);
			clearTimeout(this.timerHide);
			this.timerShow = setTimeout(showLoading, 300);
		},
		hide() {
			clearTimeout(this.timerShow);
			this.timerHide = setTimeout(() => {
				const el_loadings = document.querySelectorAll('.mdl-loading');

				for (let i = 0, len = el_loadings.length; i < len; i++) {
					const that = el_loadings[i];

					that.classList.add('close');
					setTimeout(() => {
						that.classList.remove('visible')
						that.remove();
					}, 300);
				}
			}, 300);
		}
	}

	//common exe
	Global.parts.resizeState();
	Global.parts.scroll();

	//common callback
	Global.callback.toggle_nav = (result) => {
		const btn = document.querySelector('[data-toggle-object="' + result.name + '"]');

		if (result.state === 'true') {
			btn.dataset.meterial = 'arrow_forward';
		} else {
			btn.dataset.meterial = 'arrow_back';
		}
	}

	/**
	 * ACCORDION
	 * in use: Global.state, Global.para
	 */
	Global.accordion = {
		data: {},
		options: {
			current: null,
			autoclose: false,
			callback: false,
			effect: Global.state.effect.easeInOut,
			effTime: '.2'
		},
		init(option) {
			const opt = Object.assign({}, Global.accordion.options, option);
			const accoId = opt.id;
			const callback = opt.callback;
			let current = opt.current;
			let autoclose = opt.autoclose;
			const el_acco = document.querySelector('.ui-acco[data-id="' + accoId + '"]');
			const el_wrap = document.querySelectorAll('.ui-acco[data-id="' + accoId + '"] > .ui-acco--item');
			const len = el_wrap.length;
			const para = Global.parts.paraGet('acco');

			let paras;
			let paraname;

			//set up : parameter > current
			if (!!para) {
				if (para.split('+').length > 1) {
					//2 or more : acco=exeAcco1*2+exeAcco2*3
					paras = para.split('+');

					for (let j = 0; j < paras.length; j++) {
						paraname = paras[j].split('*');
						accoId === paraname[0] ? current = [Number(paraname[1])] : '';
					}
				} else {
					//only one : tab=1
					if (para.split('*').length > 1) {
						paraname = para.split('*');
						accoId === paraname[0] ? current = [Number(paraname[1])] : '';
					} else {
						current = [Number(para)];
					}
				}
			}

			el_acco.dataset.n = len;

			//panel의 aria, 높이값, 이벤트 등 기본 설정 & 전체열림일 경우 panel 설정
			for (let i = 0; i < len; i++) {
				const that = el_wrap[i];
				const el_tit = that.querySelector('.ui-acco--tit');
				const el_pnl = that.querySelector('.ui-acco--pnl');
				const el_btn = el_tit.querySelector('.ui-acco--btn');
				const el_btn_txt = el_btn.querySelector('.ui-acco--btn-txt');
				const el_pnl_wrap = that.querySelector('.ui-acco--pnl-wrap');

				that.dataset.n = i;
				(el_tit.tagName !== 'DT') && el_tit.setAttribute('role', 'heading');

				el_btn.id = accoId + 'Btn' + i;
				el_btn.dataset.selected = false;
				el_btn.setAttribute('aria-expanded', false);
				el_btn.setAttribute('aria-label', el_btn_txt.textContent + ' 열기');
				el_btn.removeAttribute('data-order');
				el_btn.dataset.n = i;

				//패널이 있다면
				if (!!el_pnl) {
					el_pnl.id = accoId + 'Pnl' + i;
					el_btn.setAttribute('aria-controls', el_pnl.id);
					el_pnl.setAttribute('aria-labelledby', el_btn.id);

					if (accoId === el_pnl_wrap.closest('.ui-acco').dataset.id) {
						el_pnl.dataset.height = el_pnl_wrap.offsetHeight;
					}

					el_pnl.classList.add('off');
					el_pnl.setAttribute('aria-hidden', true);
					el_pnl.dataset.n = i;
					el_pnl.style.height = '0rem';

					//전체 열림이 설정이라면
					if (current === 'all') {
						el_pnl.classList.remove('off');
						// el_pnl.style.height = 'auto';
						el_btn.dataset.selected = true;
						el_btn.setAttribute('aria-expanded', true);
						el_btn.setAttribute('aria-label', el_btn_txt.textContent + ' 닫기');
						el_pnl.setAttribute('aria-hidden', false);
					}
				}

				if (i === 0) { el_btn.dataset.order = 'first'; }
				if (i === len - 1) { el_btn.dataset.order = 'last'; }

				el_btn.removeEventListener('click', Global.accordion.evtClick);
				el_btn.removeEventListener('keydown', Global.accordion.evtKeys);
				el_btn.addEventListener('click', Global.accordion.evtClick);
				el_btn.addEventListener('keydown', Global.accordion.evtKeys);
			}

			//열려있는 panel 설정
			//current값은 array형식으로 하나이상의 구성
			const currentLen = current === null ? 0 : current === 'all' ? len : current.length;

			for (let i = 0; i < currentLen; i++) {
				const n = (current === 'all') ? i : current[i];
				const this_wrap = el_acco.querySelector('.ui-acco--item[data-n="' + n + '"]');
				const _tit = this_wrap.querySelector('.ui-acco--tit');
				const _btn = _tit.querySelector('.ui-acco--btn');
				const _btn_txt = _btn.querySelector('.ui-acco--btn-txt');
				const _pnl = this_wrap.querySelector('.ui-acco--pnl');

				//direct children 
				if (accoId === this_wrap.closest('.ui-acco').dataset.id && !!_pnl) {
					_btn.dataset.selected = true;
					_btn.setAttribute('aria-expanded', true);
					_btn.setAttribute('aria-label', _btn_txt.textContent + ' 닫기');
					_pnl.classList.remove('off');
					_pnl.style.height = 'auto';
					_pnl.setAttribute('aria-hidden', false);
					_btn.dataset.selected = true;
					_pnl.style.height = Number(_pnl.offsetHeight) / 10 + 'rem';
				}
			}

			//콜백실행
			!!callback && callback();
			//개별 아코딩언마다 네임스페이스 생성하여 정보 저장
			Global.accordion[accoId] = {
				callback: callback,
				autoclose: autoclose,
				current: current
			};
		},
		evtClick(event) {
			const that = event.currentTarget;
			const btnId = that.id;
			const n = that.dataset.n;
			const wrap = that.closest('.ui-acco--pnl');
			let accoId = btnId.split('Btn');
			accoId = accoId[0];

			if (!!btnId) {
				event.preventDefault();
				if (!!wrap) wrap.style.height = 'auto';

				Global.accordion.toggle({
					id: accoId,
					current: [n]
				});
			}
		},
		evtKeys(event) {
			const that = event.currentTarget;
			const btnId = that.id;
			const n = Number(that.dataset.n);
			const keys = Global.state.keys;

			let accoId = btnId.split('Btn');
			accoId = accoId[0];

			const acco = document.querySelector('.ui-acco[data-id="' + accoId + '"]');
			const len = Number(acco.dataset.n);

			const upLeftKey = (event) => {
				event.preventDefault();
				that.dataset.order !== 'first' ?
					acco.querySelector('#' + accoId + 'Btn' + (n - 1)).focus() :
					acco.querySelector('#' + accoId + 'Btn' + (len - 1)).focus();
			}
			const downRightKey = (event) => {
				event.preventDefault();
				that.dataset.order !== 'last' ?
					acco.querySelector('#' + accoId + 'Btn' + (n + 1)).focus() :
					acco.querySelector('#' + accoId + 'Btn0').focus();
			}
			const endKey = (event) => {
				event.preventDefault();
				acco.querySelector('#' + accoId + 'Btn' + (len - 1)).focus();
			}
			const homeKey = (event) => {
				event.preventDefault();
				acco.querySelector('#' + accoId + 'Btn0').focus();
			}

			switch (event.keyCode) {
				case keys.up:
				case keys.left: upLeftKey(event);
					break;

				case keys.down:
				case keys.right: downRightKey(event);
					break;

				case keys.end: endKey(event);
					break;

				case keys.home: homeKey(event);
					break;
			}
		},
		timer: null,
		toggle(opt) {
			const accoId = opt.id;
			const el_acco = document.querySelector('.ui-acco[data-id="' + accoId + '"]');
			const current = opt.current === undefined ? null : opt.current;
			const callback = opt.callback === undefined ? opt.callback : Global.accordion[accoId].callback;
			const state = opt.state === undefined ? 'toggle' : opt.state;
			const autoclose = opt.autoclose === undefined ? Global.accordion[accoId].autoclose : opt.autoclose;
			let el_wraps = el_acco.querySelectorAll('.ui-acco--item');
			let el_pnl;
			let el_tit;
			let el_btn;
			let len = el_wraps.length;

			const act = (v) => {
				const isHide = !(v === 'hide'); //true | false
				const toggleSlide = (opt) => {
					let isShow = false;
					const el = opt.el;
					const btnID = el.getAttribute('aria-labelledby');
					const el_btn = document.querySelector('#' + btnID);
					const el_btn_txt = el_btn.querySelector('.ui-acco--btn-txt');
					const state = opt.state;

					//accordion inner
					const el_child = el.querySelector('.ui-acco--pnl-wrap');
					const acco = el.closest('.ui-acco');
					const acco_parent = acco.closest('.ui-acco--pnl');

					el_btn.dataset.selected = isHide;
					el_btn.setAttribute('aria-expanded', isHide);
					isHide ?
						el_btn.setAttribute('aria-label', el_btn_txt.textContent + ' 닫기') :
						el_btn.setAttribute('aria-label', el_btn_txt.textContent + ' 열기');

					//show 동작
					const show = () => {
						isShow = true;
						el_btn.setAttribute('aria-expanded', true);
						el_btn.dataset.selected = true;
						el.setAttribute('aria-hidden', false);
						el.classList.remove('off');
						el.style.height = Number(el_child.offsetHeight) / 10 + 'rem';
						el_btn.setAttribute('aria-label', el_btn_txt.textContent + ' 닫기');
					}

					//hide 동작
					const hide = () => {
						isShow = false;
						el_btn.setAttribute('aria-expanded', false);
						el_btn.dataset.selected = false;
						el_btn.setAttribute('aria-label', el_btn_txt.textContent + ' 열기');
						el.style.height = 0;
					}
					//end 동작
					const end = () => {
						if (el.style.height === '0px') {
							el.classList.add('off');
							el.setAttribute('aria-hidden', true);
						}
						if (!!acco_parent) {
							acco_parent.style.height = Number(acco_parent.querySelector('.ui-acco--pnl-wrap').offsetHeight) / 10 + 'rem';
						}
						el.removeEventListener('transitionend', end);
					}
					el.addEventListener('transitionend', end);

					(state === 'toggle') ?
						(el_btn.dataset.selected === 'true') ? show() : hide() :
						(state === 'show') ? show() : hide();
				}

				//set up close
				if (!!autoclose || current === 'all') {
					for (let i = 0, len = el_wraps.length; i < len; i++) {
						const that = el_wraps[i];
						const _tit = that.querySelector('.ui-acco--tit');
						const _btn = _tit.querySelector('.ui-acco--btn');
						const _btn_txt = _btn.querySelector('.ui-acco--btn-txt');
						const _pnl = that.querySelector('.ui-acco--pnl');

						//direct children 
						if (accoId === that.closest('.ui-acco').dataset.id) {
							if (!!_pnl) {
								//자동닫히기
								if (!!autoclose && Number(current[0]) !== Number(i)) {
									_btn.dataset.selected = false;
									_btn.setAttribute('aria-expanded', false);
									_btn.setAttribute('aria-label', _btn_txt.textContent + ' 열기');
									_pnl.setAttribute('aria-hidden', true);

									toggleSlide({
										el: _pnl,
										state: 'hide'
									});
								}
								//전체 열고 닫기
								if (current === 'all') {
									_btn.dataset.selected = isHide;
									_btn.setAttribute('aria-expanded', isHide);
									_pnl.setAttribute('aria-hidden', !isHide);
									isHide ?
										_btn.setAttribute('aria-label', _btn_txt.textContent + ' 닫기') :
										_btn.setAttribute('aria-label', _btn_txt.textContent + ' 열기');

									toggleSlide({
										el: _pnl,
										state: !isHide ? 'show' : 'hide'
									});
								}
							}
						}
					}
				}

				//기본
				if (current !== 'all') {
					if (!!el_pnl) {
						// el_pnl.setAttribute('aria-hidden', isHide);
						toggleSlide({
							el: el_pnl,
							state: 'toggle'
						});
					}
				}
			}

			//선택값이 없다면 0 , 있다면 선택값 전체갯수
			const currentLen = current === null ? 0 : current.length;
			if (current !== 'all') {
				//전체선택이 아닌 일반적인 경우
				for (let i = 0; i < currentLen; i++) {
					const this_wrap = el_acco.querySelector('.ui-acco--item[data-n="' + current[i] + '"]');
					el_tit = this_wrap.querySelector('.ui-acco--tit');
					el_pnl = this_wrap.querySelector('.ui-acco--pnl');
					el_btn = el_tit.querySelector('.ui-acco--btn');

					//direct children 
					if (accoId === this_wrap.closest('.ui-acco').dataset.id && !!el_pnl) {
						switch (state) {
							case 'toggle':
								(el_btn.dataset.selected === 'true') ? act('hide') : act('show');
								break;
							case 'open':
								act('show');
								break;
							case 'close':
								act('hide');
								break;
						}
					}
				}

				!!callback && callback({
					id: accoId,
					current: current
				});
			} else if (current === 'all') {
				//state option 
				if (state === 'open') {
					check = 0;
					el_acco.dataset.allopen = false;
				} else if (state === 'close') {
					check = len;
					el_acco.dataset.allopen = true;
				}

				//all check action
				if (el_acco.dataset.allopen !== 'true') {
					el_acco.dataset.allopen = true;
					act('hide');
				} else {
					el_acco.dataset.allopen = false;
					act('show');
				}
			}
		}
	}

	/**
	 * TAB
	 * in use: Global.state.keys, Global.parts.paraGet, Global.scroll, Global.ajax
	 */
	Global.tab = {
		data: {},
		options: {
			current: 0,
			dynamic: false,
			callback: false,
			align: 'center' // ' || 'center'
		},
		init(option) {
			const opt = Object.assign({}, this.options, option);
			const id = opt.id;
			const dynamic = opt.dynamic;
			const callback = opt.callback;
			const align = opt.align;
			const el_tab = document.querySelector('.ui-tab[data-id="' + id + '"]');

			let current = isNaN(opt.current) ? 0 : opt.current;

			const el_btnwrap = el_tab.querySelector('.ui-tab--btns');
			const el_btnwrap_group = el_btnwrap.querySelector('.ui-tab--btns-group');
			const el_btns = el_btnwrap.querySelectorAll('.ui-tab--btn');
			const el_pnlwrap = el_tab.querySelector('.ui-tab--pnls');
			const el_pnls = el_pnlwrap.querySelectorAll('.ui-tab--pnl');
			const para = Global.parts.paraGet('tab');

			let paras;
			let paraname;

			//set up
			if (!!para) {
				if (para.split('+').length > 1) {
					//2 or more : tab=exeAcco1*2+exeAcco2*3
					paras = para.split('+');

					for (let j = 0; j < paras.length; j++) {
						paraname = paras[j].split('*');
						opt.id === paraname[0] ? current = Number(paraname[1]) : '';
					}
				} else {
					//only one : tab=1
					if (para.split('*').length > 1) {
						paraname = para.split('*');
						opt.id === paraname[0] ? current = Number(paraname[1]) : '';
					} else {
						current = Number(para);
					}
				}
			}

			//setting
			el_btnwrap.setAttribute('role', 'tablist');
			Global.tab.data[id] = {
				id: id,
				current: 0,
				dynamic: dynamic,
				callback: callback,
				align: align
			};

			for (let i = 0, len = el_btns.length; i < len; i++) {
				const el_btn = el_btns[i];

				el_btn.setAttribute('role', 'tab');
				el_btn.setAttribute('aria-selected', 'false');

				if (!el_btn.dataset.tab) {
					el_btn.dataset.tab = i;
				}

				el_btn.dataset.len = len;

				const n = Number(el_btn.dataset.tab);
				const isCurrent = Number(current) === n;
				const cls = isCurrent ? 'add' : 'remove';

				if (!el_btn.id) {
					el_btn.id = id + '_btn_' + n;
				}

				const el_pnl = el_pnlwrap.querySelector('.ui-tab--pnl[data-tab="' + n + '"]');

				if (!dynamic) {
					el_pnl.setAttribute('role', 'tabpanel');
					// el_pnl.setAttribute('tabindex','0');

					if (!el_pnl.dataset.tab) {
						el_pnl.dataset.tab = i;
					}
					if (!el_pnl.id) {
						el_pnl.id = id + '_pnl_' + n;
					}
				} else {
					el_pnls[0].setAttribute('role', 'tabpanel');
					// el_pnls[0].setAttribute('tabindex','0');
					el_pnls[0].dataset.tab = current;
					el_pnls[0].id = id + '_pnl';
				}

				const btnId = el_btn.id;
				const pnlId = !dynamic ? el_pnl.id : el_pnls[0].id;

				el_btn.setAttribute('aria-controls', pnlId);
				el_btn.classList[cls]('selected');
				el_btn.setAttribute('aria-selected', !!isCurrent ? true : false);

				if (!dynamic) {
					el_pnl.setAttribute('aria-labelledby', btnId);

					if ((Number(current) === Number(el_pnl.dataset.tab))) {
						el_pnl.setAttribute('aria-hidden', false);
						el_pnl.classList.add('selected');
					} else {
						el_pnl.setAttribute('aria-hidden', true);
						el_pnl.classList.remove('selected');
					}
				} else {
					el_pnls[0].setAttribute('aria-labelledby', btnId);
					el_pnls[0].setAttribute('aria-hidden', false);
					el_pnls[0].classList[cls]('selected');
				}

				i === 0 && el_btn.setAttribute('tab-first', true);
				i === len - 1 && el_btn.setAttribute('tab-last', true);

				const btnCallbak = el_btn.dataset.callback;

				Global.tab.data[id][btnId] = {
					callback: btnCallbak,
				}

				if (isCurrent) {
					Global.scroll.move({
						selector: el_btnwrap_group,
						left: el_btn.getBoundingClientRect().left + el_btnwrap_group.scrollLeft,
						add: 0,
						align: align
					});

					!!Global.tab.data[id][btnId].callback && Global.callback[Global.tab.data[id][btnId].callback]({
						id: id,
						btnId: btnId,
						pnlId: pnlId,
					});
				}

				el_btn.removeEventListener('click', Global.tab.evtClick);
				el_btn.removeEventListener('keydown', Global.tab.evtKeys);
				el_btn.addEventListener('click', Global.tab.evtClick);
				el_btn.addEventListener('keydown', Global.tab.evtKeys);
			}

			callback && callback(opt);
		},
		evtClick(e) {
			const that = e.currentTarget;
			const id = that.closest('.ui-tab').dataset.id;

			Global.tab.toggle({
				id: Global.tab.data[id].id,
				current: Number(e.currentTarget.dataset.tab),
				align: Global.tab.data[id].align,
				dynamic: Global.tab.data[id].dynamic,
				callback: Global.tab.data[id].callback
			});
		},
		evtKeys(e) {
			const that = e.currentTarget;
			const id = that.closest('.ui-tab').dataset.id;
			const n = Number(that.dataset.tab);
			const m = Number(that.dataset.len);
			const keyEvent = (v) => {
				Global.tab.toggle({
					id: Global.tab.data[id].id,
					current: v,
					align: Global.tab.data[id].align,
					dynamic: Global.tab.data[id].dynamic,
					callback: Global.tab.data[id].callback
				});
			}
			const upLeftKey = (e) => {
				e.preventDefault();
				keyEvent(!that.getAttribute('tab-first') ? n - 1 : m - 1);
			}
			const downRightKey = (e) => {
				e.preventDefault();
				keyEvent(!that.getAttribute('tab-last') ? n + 1 : 0);
			}
			const endKey = (e) => {
				e.preventDefault();
				keyEvent(m - 1);
			}
			const homeKey = (e) => {
				e.preventDefault();
				keyEvent(0);
			}

			switch (e.keyCode) {
				case Global.state.keys.up:
				case Global.state.keys.left: upLeftKey(e);
					break;

				case Global.state.keys.down:
				case Global.state.keys.right: downRightKey(e);
					break;

				case Global.state.keys.end: endKey(e);
					break;

				case Global.state.keys.home: homeKey(e);
					break;
			}
		},
		toggle(option) {
			const opt = Object.assign({}, this.options, option);
			const id = opt.id;
			const callback = opt.callback;
			const el_tab = document.querySelector('.ui-tab[data-id="' + id + '"]');
			const el_btnwrap = el_tab.querySelector('.ui-tab--btns');
			const el_btnwrap_group = el_btnwrap.querySelector('.ui-tab--btns-group');
			const el_btn = el_btnwrap.querySelectorAll('.ui-tab--btn');
			const el_pnlwrap = el_tab.querySelector('.ui-tab--pnls');
			const el_pnls = el_pnlwrap.querySelectorAll('.ui-tab--pnl');
			const current = isNaN(opt.current) ? 0 : opt.current;
			const dynamic = opt.dynamic;
			const align = opt.align;
			const el_current = el_btnwrap.querySelector('.ui-tab--btn[data-tab="' + current + '"]');
			const el_pnlcurrent = el_pnlwrap.querySelector('.ui-tab--pnl[data-tab="' + current + '"]');
			const btnId = el_current.id;
			const pnlId = !!el_pnlcurrent ? el_pnlcurrent.id : id + '_pnl';

			for (let i = 0, len = el_btn.length; i < len; i++) {
				const that = el_btn[i];
				that.classList.remove('selected');
				that.setAttribute('aria-selected', false);
			}

			el_current.setAttribute('aria-selected', true);
			el_current.classList.add('selected')
			el_current.focus();

			Global.scroll.move({
				selector: el_btnwrap_group,
				left: el_current.getBoundingClientRect().left + el_btnwrap_group.scrollLeft,
				add: 0,
				align: align
			});

			if (!dynamic) {
				for (let i = 0, len = el_pnls.length; i < len; i++) {
					const that = el_pnls[i];
					that.setAttribute('aria-hidden', true);
					that.classList.remove('selected');
				}

				el_pnlcurrent.classList.add('selected');
				el_pnlcurrent.setAttribute('aria-hidden', false);
			} else {
				el_pnls[0].setAttribute('aria-hidden', false);
				el_pnls[0].setAttribute('aria-labelledby', btnId);
			}

			const btncallback = Global.tab.data[id][btnId].callback;

			!!btncallback && Global.callback[btncallback]({
				id: id,
				btnId: btnId,
				pnlId: pnlId,
			});

			callback && callback(opt);
		}
	}

	/**
	 * SELECT COMBO BOX
	 * in use: Global.state, (Global.scrollBar), Global.parts
	 */
	Global.select = {
		data: {},
		options: {
			id: false,
			current: null,
			callback: false,
			inner: true
		},
		init(option) {
			const opt = Object.assign({}, this.options, option);
			const current = opt.current;
			const el_uiSelects = document.querySelectorAll('.ui-select');
			const isMobile = Global.state.device.mobile;

			let el_select;
			let selectID;
			let listID;
			let optionSelectedID;
			let selectN;
			let selectTitle;
			let selectDisabled;
			let btnTxt = '';
			let hiddenClass = '';
			let htmlOption = '';
			let htmlButton = '';
			let el_btn;
			let el_wrap;
			let el_dim;
			let setOption;

			//reset
			let idN = JSON.parse(sessionStorage.getItem('scrollbarID'));

			//event action
			const labelClick = (e) => {
				const that = e.currentTarget;
				const idname = that.getAttribute('for');
				const inp = document.querySelector('#' + idname);

				inp.focus();
			}
			const selectLeave = () => {
				const body = document.querySelector('body');

				body.dataset.selectopen = true;
			}
			const optBlur = (e) => {
				//if (document.querySelector('body').dataset.selectopen) { .. }); dim
				//optClose();
			}
			const openScrollMove = (el_uiselect) => {
				const el_html = document.querySelector('html, body');
				const dT = Math.floor(document.documentElement.scrollTop);
				const wH = window.innerHeight;
				const el_btn = el_uiselect.querySelector('.ui-select--btn');
				const elT = el_btn.getBoundingClientRect().top;
				const elH = el_btn.offsetHeight;
				const a = Math.floor(elT - dT);
				const b = wH - 240;

				el_uiselect.dataset.orgtop = dT;

				if (a > b) {
					el_html.scrollTo({
						top: a - b + elH + 10 + dT,
						behavior: 'smooth'
					});
				}
			}
			const optOpen = (btn) => {
				const id = btn.id;
				const el_body = document.querySelector('body');
				const el_uiselect = btn.closest('.ui-select');
				const el_wrap = document.querySelector('.ui-select--wrap[data-id="' + id + '"]');
				let el_optwrap = el_wrap.querySelector('.ui-select--opts');
				let el_opts = el_optwrap.querySelectorAll('.ui-select--opt');
				const el_select = el_uiselect.querySelector('select');
				const el_option = el_select.querySelectorAll('option');
				const offtop = el_uiselect.getBoundingClientRect().top;
				const offleft = el_uiselect.getBoundingClientRect().left;
				const scrtop = document.documentElement.scrollTop;
				const scrleft = document.documentElement.scrollLeft;
				let wraph = el_wrap.offsetHeight;
				const btn_h = btn.offsetHeight;
				const win_h = window.innerHeight;
				const n = el_select.selectedIndex;
				const state = !!el_uiselect.dataset.state ? el_uiselect.dataset.state : '';

				el_body.classList.add('dim-select');
				btn.dataset.expanded = true;
				btn.setAttribute('aria-expanded', true);
				el_uiselect.classList.add('on');
				el_wrap.classList.add('on');
				el_wrap.setAttribute('aria-hidden', false);
				el_opts[n].classList.add('selected');

				setTimeout(() => {
					el_optwrap = el_wrap.querySelector('.ui-select--opts');
					el_opts = el_optwrap.querySelectorAll('.ui-select--opt');
					wraph = el_wrap.offsetHeight;
					const opt_h = el_opts[0].offsetHeight;
					const opt_w = el_opts[0].offsetWidth;

					el_wrap.querySelector('.ui-select--cancel').focus();

					Global.scroll.move({
						top: Number(opt_h * n),
						selector: el_wrap,
						effect: 'auto',
						align: 'default'
					});

					for (let i = 0, len = el_opts.length; i < len; i++) {
						const that = el_opts[i];

						that.addEventListener('click', Global.select.optClick);
						that.addEventListener('mouseover', Global.select.selectOver);
					}

					el_wrap.addEventListener('mouseleave', selectLeave);
					el_wrap.addEventListener('blur', optBlur);

					if (!isMobile) {
						const rec_wrap = el_wrap.getBoundingClientRect();
						const rec_select = el_uiselect.getBoundingClientRect();
						const sct = document.querySelector('html').scrollTop;


						if ((win_h - wraph) + scrtop > offtop + scrtop + btn_h) {
							el_uiselect.dataset.ps = 'bottom';
							el_wrap.dataset.ps = 'bottom';
							el_wrap.dataset.state = state;

							// if (isInner) {
							el_wrap.style.bottom = 'auto';
							el_wrap.style.top = (sct + rec_select.top + (btn_h - 1)) / 10 + 'rem';
							el_wrap.style.left = rec_select.left / 10 + 'rem';
							// } else {
							// 	el_wrap.style.top = (sct + rec_select.top + offtop + scrtop + (btn_h - 1)) / 10 + 'rem';
							// 	el_wrap.style.left = offleft + scrleft + 'px';
							// }
						} else {
							el_uiselect.dataset.ps = 'top';
							el_wrap.dataset.ps = 'top';
							el_wrap.dataset.state = state;

							// if (isInner) {
							el_wrap.style.top = (sct + rec_select.top - rec_wrap.height - rec_select.height + (btn_h + 1)) / 10 + 'rem';
							// el_wrap.style.bottom = btn_h - 1 + 'px';
							el_wrap.style.left = rec_select.left / 10 + 'rem';
							// } else {
							// 	el_wrap.style.top = offtop + scrtop - wraph + 1 + 'px';
							// 	el_wrap.style.left = offleft + scrleft + 'px';
							// }
						}

						el_wrap.style.minWidth = el_uiselect.offsetWidth / 10 + 'rem';
						el_wrap.style.maxWidth = el_uiselect.offsetWidth / 10 + 'rem';
						el_optwrap.style.minWidth = el_uiselect.offsetWidth / 10 + 'rem';
					}

				}, 0);

				openScrollMove(el_uiselect);

				// el_wrap.removeEventListener('touchstart', Global.select.wrapTouch);
				// el_wrap.addEventListener('touchstart', Global.select.wrapTouch);
			}
			const optExpanded = (btn) => {
				if (Global.state.device.mobile) {
					optOpen(btn);
				} else {
					if (btn.getAttribute('aria-expanded') === 'false') {
						Global.select.hide();
						optOpen(btn);
					} else {
						Global.select.hide();
					}
				}
			}
			const selectClick = (e) => {

				let that = e.currentTarget;
				// if (e.target.tagName === 'SELECT') {
				// 	e.preventDefault();
				// 	e.target.style.appearance = 'none';
				// 	e.target.style.zIndex = '-1';
				// 	that = e.target.closest('.ui-select').querySelector('.ui-select--btn');
				// }

				const el_uiselect = that.closest('.ui-select');
				const el_select = el_uiselect.querySelector('select');
				const opts = el_uiselect.querySelectorAll('option');
				const n = el_select.selectedIndex;
				selectID = el_select.id;

				that.dataset.sct = document.documentElement.scrollTop;

				document.removeEventListener('click', Global.select.back);
				setTimeout(() => {
					document.addEventListener('click', Global.select.back);
				}, 0);

				setOption(that, n);
				optExpanded(that, n);
			}
			const optConfirm = (e) => {
				const el_confirm = e.currentTarget;
				const el_wrap = el_confirm.closest('.ui-select--wrap');
				const id_inp = el_wrap.dataset.id;
				const id = id_inp.split('_')[0];
				const el_select = document.querySelector('#' + id);
				const el_uiSelect = el_select.closest('.ui-select');
				const el_body = document.querySelector('body');
				const el_btn = el_uiSelect.querySelector('.ui-select--btn');
				const callback = Global.select.data[id].callback;
				const orgTop = el_uiSelect.dataset.orgtop;

				Global.select.act({
					id: el_btn.dataset.id,
					current: el_select.selectedIndex
				});

				el_body.classList.remove('dim-select');
				el_btn.dataset.expanded = false;
				el_btn.setAttribute('aria-expanded', false)
				el_btn.focus();
				el_wrap.classList.add('off');

				const aniend = () => {
					el_uiSelect.classList.remove('on');
					el_wrap.classList.remove('off');
					el_wrap.classList.remove('on');
					el_wrap.classList.remove('top');
					el_wrap.classList.remove('bottom');
					el_wrap.setAttribute('aria-hidden', true);
					el_wrap.removeEventListener('animationend', aniend);
				}
				el_wrap.addEventListener('animationend', aniend);
				!!callback && Global.callback[callback]({
					id: el_btn.dataset.id,
					current: el_select.selectedIndex
				});
			}


			const eventFn = () => {
				const el_dims = document.querySelectorAll('.dim-select');
				const el_confirms = document.querySelectorAll('.ui-select--confirm');
				const el_cancels = document.querySelectorAll('.ui-select--cancel');
				const el_btns = document.querySelectorAll('.ui-select--btn');
				const el_labels = document.querySelectorAll('.ui-select--label');
				const el_selects = document.querySelectorAll('.ui-select select');

				// for (let that of el_dims) {
				// 	that.addEventListener('click', selectClick);
				// }
				for (let that of el_confirms) {
					that.addEventListener('click', optConfirm);
				}
				for (let that of el_cancels) {
					that.addEventListener('click', Global.select.hide);
				}
				for (let that of el_btns) {
					that.addEventListener('click', selectClick);
				}
				for (let that of el_labels) {
					that.addEventListener('click', labelClick);
				}
				for (let that of el_selects) {
					that.addEventListener('change', Global.select.selectChange);
				}
			}
			//option set
			setOption = (uiSelect, v) => {
				let _select = (uiSelect !== undefined) ? uiSelect.closest('.ui-select') : uiSelect;

				if (uiSelect !== undefined) {
					_select = _select.querySelector('select');
				}

				const _options = _select.querySelectorAll('option');
				const _optionID = _select.id + '_opt';
				const _optLen = _options.length;

				let _current = current;
				let _selected = false;
				let _disabled = false;
				let _hidden = false;
				let _hiddenCls;
				let _optionIdName;

				if (v !== undefined) {
					_current = v;
				}

				if (!!_optLen) {
					_select.disabled = false;
					for (let i = 0; i < _optLen; i++) {
						const that = _options[i];

						_hidden = that.hidden;

						if (_current !== null) {
							if (_current === i) {
								_selected = true;
								that.selected = true;
							} else {
								_selected = false;
								that.selected = false;
							}
						} else {
							_selected = that.selected;
						}

						_disabled = that.disabled;
						_hiddenCls = _hidden ? 'hidden' : '';

						if (_selected) {
							btnTxt = `<span class="disabled">${that.textContent}</span>`;
							optionSelectedID = _optionID + '_' + i;
							selectN = i;
						}

						_selected && _hidden ? hiddenClass = 'opt-hidden' : '';
						_optionIdName = _optionID + '_' + i;

						if (Global.state.device.mobile) {
							_disabled ?
								_selected ?
									htmlOption += '<button type="button" role="option" id="' + _optionIdName + '" class="ui-select--opt disabled selected ' + _hiddenCls + '" value="' + that.value + '" disabled>' :
									htmlOption += '<button type="button" role="option" id="' + _optionIdName + '" class="ui-select--opt disabled ' + _hiddenCls + '" value="' + that.value + '" disabled>' :
								_selected ?
									htmlOption += '<button type="button" role="option" id="' + _optionIdName + '" class="ui-select--opt selected ' + _hiddenCls + '" value="' + that.value + '">' :
									htmlOption += '<button type="button" role="option" id="' + _optionIdName + '" class="ui-select--opt ' + _hiddenCls + '" value="' + that.value + '">';
						} else {
							_disabled ?
								_selected ?
									htmlOption += '<button type="button" role="option" id="' + _optionIdName + '" class="ui-select--opt disabled selected ' + _hiddenCls + '" value="' + that.value + '" disabled>' :
									htmlOption += '<button type="button" role="option" id="' + _optionIdName + '" class="ui-select--opt disabled ' + _hiddenCls + '" value="' + that.value + '" disabled>' :
								_selected ?
									htmlOption += '<button type="button" role="option" id="' + _optionIdName + '" class="ui-select--opt selected ' + _hiddenCls + '" value="' + that.value + '">' :
									htmlOption += '<button type="button" role="option" id="' + _optionIdName + '" class="ui-select--opt ' + _hiddenCls + '" value="' + that.value + '">';
						}

						htmlOption += '<span class="ui-select--opt-txt">' + that.textContent + '</span>';
						htmlOption += '</button>';
					}
				} else {
					btnTxt = '';
					_select.disabled = true;
				}
				return htmlOption;
			}

			//select set
			const set = (el_uiSelect, el_select, selectID) => {
				(selectID === undefined) ? el_select.id = 'uiSelect_' + idN : '';
				listID = selectID + '_list';
				selectTitle = el_select.title;
				hiddenClass = '';

				const isStyle = el_uiSelect.dataset.style ? el_uiSelect.dataset.style : '';

				//callback 나중에 작업필요
				//(!el_select.data('callback') || !!callback) && el_select.data('callback', callback);

				htmlOption += '<section class="ui-select--wrap" style="min-width:' + (el_uiSelect.offsetWidth / 10) + 'rem" data-id="' + selectID + '_inp" data-style="' + isStyle + '">';
				htmlOption += '<div class="ui-select--header">';
				htmlOption += '<h2 class="ui-select--title">' + el_uiSelect.dataset.title + '</h2>';
				htmlOption += '<button type="button" class="ui-select--cancel" aria-label="' + selectTitle + ' 닫기"></button>';
				htmlOption += '</div>';
				htmlOption += '<div class="ui-select--opts-group">';
				htmlOption += '<div class="ui-select--opts" role="listbox" id="' + listID + '" aria-hidden="false">';

				setOption(el_uiSelect, el_select.selectedIndex);

				htmlOption += '</div>';
				htmlOption += '</div>';

				// htmlOption += '<button type="button" class="ui-select--cancel"><span>취소</span></strong>';
				// htmlOption += '<button type="button" class="ui-select--confirm"><span>확인</span></strong>';
				htmlOption += '</section>';
				htmlOption += '<div class="ui-select--dim"></div>';

				htmlButton = '<button type="button" class="ui-select--btn ' + hiddenClass + '" id="' + selectID + '_inp" role="combobox" aria-autocomplete="list" aria-owns="' + listID + '" aria-haspopup="true" aria-expanded="false" aria-activedescendant="' + optionSelectedID + '" data-n="' + selectN + '" data-id="' + selectID + '" tabindex="-1"><span class="ui-select--btn-txt">' + btnTxt + '</span></button>';

				selectDisabled = el_select.disabled;
				el_uiSelect.insertAdjacentHTML('beforeend', htmlButton);
				el_select.classList.add('off');
				el_select.setAttribute('aria-hidden', true)
				// el_uiSelect.insertAdjacentHTML('beforeend', htmlOption);
				const el_body = document.querySelector('body');
				// isInner ? el_uiSelect.insertAdjacentHTML('beforeend', htmlOption) : el_body.insertAdjacentHTML('beforeend', htmlOption);

				!document.querySelector('.area-select') && el_body.insertAdjacentHTML('beforeend', `<div class="area-select"></div>`);
				const el_area_select = document.querySelector('.area-select');
				el_area_select.insertAdjacentHTML('beforeend', htmlOption);

				if (selectDisabled) {
					const _btn = el_uiSelect.querySelector('.ui-select--btn');

					_btn.disabled = true;
					_btn.classList.add('disabled')
				}

				eventFn();
				htmlOption = '';
				htmlButton = '';
			}

			//select set
			for (let i = 0, len = el_uiSelects.length; i < len; i++) {
				const that = el_uiSelects[i];

				el_btn = that.querySelector('.ui-select--btn');
				el_dim = that.querySelector('.dim');
				el_select = that.querySelector('select');
				selectID = el_select.id;
				el_wrap = document.querySelector('.ui-select--wrap[data-id="' + selectID + '_inp"]');

				!!el_btn && el_btn.remove();
				!!el_wrap && el_wrap.remove();
				!!el_dim && el_dim.remove();

				Global.select.data[selectID] = {
					callback: !!el_select.dataset.callback ? el_select.dataset.callback : false,
				}

				set(that, el_select, selectID);
			}

			//event
			eventFn();
		},
		back(e) {
			e.preventDefault();

			let isTure = '';
			const path = e.composedPath();

			for (let i = 0, len = path.length; i < len; i++) {
				const that = path[i];
				isTure = isTure + that.classList;
			}

			if (isTure.indexOf('ui-select--wrap') < 0) {
				Global.select.hide();
				document.removeEventListener('click', Global.select.back);
			}
		},
		scrollSelect(v, el) {
			const id_inp = el.dataset.id;
			const id = id_inp.split('_')[0];
			const _opts = el.querySelectorAll('.ui-select--opt');
			const el_select = document.querySelector('#' + id);
			const el_uiSelect = el_select.closest('.ui-select');
			const el_btn = el_uiSelect.querySelector('.ui-select--btn');
			const opt_h = _opts[0].offsetHeight;

			el.scrollTo({
				top: opt_h * v,
				behavior: 'smooth'
			});

			for (let i = 0, len = _opts.length; i < len; i++) {
				_opts[i].classList.remove('selected');

				if (v === i) {
					_opts[i].classList.add('selected');
					el_uiSelect.dataset.current = i;
				}
			}
		},
		wrapTouch(e) {
			const that = e.currentTarget;
			const wrap = that.querySelector('.ui-select--opts');
			const opts = wrap.querySelectorAll('.ui-select--opt');

			let timerScroll = null;
			let touchMoving = false;
			const wrapT = that.getBoundingClientRect().top;
			let getScrollTop = Math.abs(wrap.getBoundingClientRect().top - wrapT);
			let currentN = 0;
			let opt_h = opts[0].offsetHeight;

			clearTimeout(timerScroll);

			let actEnd;
			const actMove = () => {
				touchMoving = true;
				getScrollTop = Math.abs(wrap.getBoundingClientRect().top - wrapT);

				that.addEventListener('touchcancel', actEnd);
				that.addEventListener('touchend', actEnd);
			}
			actEnd = () => {
				const that = this;
				const scrollCompare = () => {
					timerScroll = setTimeout(() => {
						if (getScrollTop !== Math.abs(wrap.getBoundingClientRect().top - wrapT)) {
							getScrollTop = Math.abs(wrap.getBoundingClientRect().top - wrapT);
							scrollCompare();
						} else {
							currentN = Math.floor((Math.floor(getScrollTop) + (opt_h / 2)) / opt_h);
							Global.select.scrollSelect(currentN, that);
						}
					}, 100);
				}
				touchMoving && scrollCompare();
				that.removeEventListener('touchmove', actMove);
			}

			that.addEventListener('touchmove', actMove);
		},
		optClick(e) {
			const that = e.currentTarget;
			const _wrap = that.closest('.ui-select--wrap');
			const id_inp = _wrap.dataset.id;
			const id = id_inp.split('_')[0];
			const el_select = document.querySelector('#' + id);
			const _uiSelect = el_select.closest('.ui-select');
			const _btn = _uiSelect.querySelector('.ui-select--btn');
			const idx = Global.parts.getIndex(that);
			const isMobile = Global.state.device.mobile;
			const callback = Global.select.data[id].callback;

			// if (!isMobile) {
			Global.select.act({
				id: _btn.dataset.id,
				current: idx
			});
			_btn.focus();
			Global.select.hide();

			!!el_select.getAttribute('onchange') && el_select.onchange();
			// } else {
			// 	Global.select.scrollSelect(idx, _wrap);
			// }

			!!callback && Global.callback[callback]({
				id: _btn.dataset.id,
				current: idx
			});
		},
		selectOver() {
			document.querySelector('body').dataset.selectopen = false;
		},
		selectChange(e) {
			const that = e.target;
			const id = that.id;
			const uiSelect = that.closest('.ui-select');
			const callback = Global.select.data[id].callback;

			uiSelect.dataset.fn;

			Global.select.act({
				id: id,
				current: that.options.selectedIndex,
				original: true
			});
			!!callback && Global.callback[callback]({
				id: id,
				current: that.options.selectedIndex
			});
		},
		hide() {
			const el_btn = document.querySelector('.ui-select--btn[aria-expanded="true"]');

			if (!el_btn) return false;

			let el_select;
			let el_wrap = document.querySelector('.ui-select--wrap[data-id="' + el_btn.id + '"]');
			let orgTop;
			const act = () => {
				el_select = el_btn.closest('.ui-select');
				orgTop = el_select.dataset.orgtop;

				el_btn.dataset.expanded = false;
				el_btn.setAttribute('aria-expanded', false);
				el_btn.focus();
				el_select.classList.remove('on');
				el_wrap.classList.remove('on');
				el_wrap.classList.remove('off');
				el_wrap.classList.remove('top');
				el_wrap.classList.remove('bottom');
				el_wrap.setAttribute('aria-hidden', true);

				document.querySelector('html, body').scrollTo({
					top: orgTop,
					behavior: 'smooth'
				});
				el_wrap.removeEventListener('animationend', act)
				document.removeEventListener('click', Global.select.back);
			}
			if (Global.state.device.mobile) {
				el_wrap.classList.add('off');
				el_wrap.addEventListener('animationend', act);
			} else {
				el_wrap.classList.add('off');
				act();
			}
			// el_body.classList.remove('dim-select');
		},
		act(opt) {
			const id = opt.id;
			const el_select = document.querySelector('#' + id);
			const el_opts = el_select.querySelectorAll('option');
			const el_uiSelect = el_select.closest('.ui-select');
			const el_btn = el_uiSelect.querySelector('.ui-select--btn');
			const el_text = el_btn.querySelector('span');
			const el_selectWrap = document.querySelector('.ui-select--wrap[data-id="' + id + '_inp"]');
			const el_btnopts = el_selectWrap.querySelectorAll('.ui-select--opt');
			const org = opt.original === undefined ? false : opt.original;

			let current = opt.current;

			if (el_uiSelect.dataset.current !== undefined) {
				current = el_uiSelect.dataset.current;
				el_select.selectedIndex = el_uiSelect.dataset.current;
			}

			if (!org) {
				el_opts[current].selected = true;
			}

			const optCurrent = el_opts[current];

			(optCurrent.hidden === true) ?
				el_btn.classList.remove('opt-hidden') :
				el_btn.classList.add('opt-hidden');

			el_text.textContent = optCurrent.textContent;

			for (let that of el_btnopts) {
				that.classList.remove('selected');
			}

			el_btnopts[current].classList.add('selected');
			Global.state.device.mobile && el_btnopts[current].focus();
		}
	}

	Global.inputTime = {
		init() {
			document.querySelectorAll('.input-time-box').forEach(this.setupTimeBox);
		},

		setupTimeBox(timeBox) {
				const input = timeBox.querySelector('input[type="time"]');
				if (!input) return;

				const viewElement = document.createElement('span');
				viewElement.className = 'input-time-view disabled';
				viewElement.setAttribute('tabindex', '-1');
				viewElement.setAttribute('aria-label', 'hidden');
				timeBox.appendChild(viewElement);
				timeBox.dataset.ui = true;
				Global.inputTime.updateView(input, viewElement, false);
				input.addEventListener('input', () => Global.inputTime.updateView(input, viewElement, true));
		},

		updateView(input, viewElement, disabled) {
				const [h, m] = input.value.split(':');
				const ampm = Number(h) >= 12 ? '오후' : '오전';
				disabled && viewElement.classList.remove('disabled');
				viewElement.textContent = `${ampm} ${input.value}`;
		}
	}

	/**
	 * MODAL POPUP
	 * in use: Global.state, Global.ajax, Global.focus, Global.scroll, (Global.scrollBar)
	 */
	Global.modal = {
		/**
		 * options
		 * type: normal | system
		 * ps: center | top | bottom
		 * full: false | true | mobile | desktop
		 * remove: false | true
		 * scroll: inner | outer
		 */
		options: {
			type: 'normal',
			ps: 'center',
			whole: false,
			src: false,
			remove: false,
			width: false,
			height: false,
			callback: false,
			closeCallback: false,
			endfocus: false,
			drag: false,
			gap: 20,
			scroll: 'inner',
			dim: true,
			sMessage: '',
			sBtnConfirmTxt: null,
			sBtnCancelTxt: null,
			sClass: 'type-system',
			sZindex: false,
			sConfirmCallback: false,
			sCancelCallback: false
		},
		optionsClose: {
			remove: false,
			callback: false,
			endfocus: false
		},
		show(option) {
			const opt = Object.assign({}, Global.modal.options, option);
			const el_body = document.querySelector('body');
			const type = opt.type;
			const src = opt.src;
			const whole = opt.whole;
			const ps = opt.ps;
			const dim = opt.dim;
			const drag = opt.drag;
			const width = Number(opt.width);
			let height = Number(opt.height);
			const callback = opt.callback;
			const callbackClose = opt.callbackClose;
			const _scroll = opt.scroll;
			let gap = opt.gap;
			let id = opt.id;
			let remove = opt.remove;
			let endfocus = opt.endfocus === false ? document.activeElement : opt.endfocus;
			const scr_t = document.documentElement.scrollTop;
			let timer;
			//system
			const sMessage = opt.sMessage;
			const sBtnConfirmTxt = opt.sBtnConfirmTxt;
			const sBtnCancelTxt = opt.sBtnCancelTxt;
			const sZindex = opt.sZindex;
			const sClass = opt.sClass;
			const sConfirmCallback = opt.sConfirmCallback;
			const sCancelCallback = opt.sCancelCallback;
			const focusID = id + Math.random().toString(36).substr(2, 16);
			const isTouch = (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement)
			!document.querySelector('.area-modal') && el_body.insertAdjacentHTML('beforeend', `<div class="area-modal"></div>`);
			const el_area_modal = document.querySelector('.area-modal');
			const act = () => {
				const elModal = document.querySelector('#' + id);
				const elModals = document.querySelectorAll('.ui-modal');
				if (!elModal) return false;
				for (let i = 0, len = elModals.length; i < len; i++) {
					const that = elModals[i];
					that.classList.remove('current');
					if (window.innerWidth !== document.documentElement.clientWidth) {
						el_body.classList.add('scroll-no');
					}
				}
				if (dim) {
					(!elModal.querySelector('.ui-modal-dim')) && elModal.insertAdjacentHTML('beforeend', '<div class="ui-modal-dim"></div>');
				}
				const elModalWrap = elModal.querySelector('.ui-modal-wrap');
				const elModalBody = elModalWrap.querySelector('.ui-modal-body');
				const elModalHeader = elModalWrap.querySelector('.ui-modal-header');
				const elModalFooter = elModalWrap.querySelector('.ui-modal-footer');
				const elModalTit = elModal.querySelector('.ui-modal-tit');
				const elModalDim = elModal.querySelector('.ui-modal-dim');
				const elModalCancel = elModal.querySelector('.ui-modal-cancel');
				const elModalConfirm = elModal.querySelector('.ui-modal-confirm');
				const elModalClose = elModal.querySelector('.ui-modal-close');
				const elModalOpen = document.querySelectorAll('.ui-modal.open');
				const openLen = !!elModalOpen ? elModalOpen.length : 0;
				document.querySelector('html').classList.add('is-modal');
				elModal.classList.remove('close');
				elModal.classList.remove('type-whole');
				elModal.classList.remove('ps-center');
				elModal.classList.remove('ps-top');
				elModal.classList.remove('ps-bottom');
				elModal.classList.remove('type-whole');
				elModal.classList.remove('type-whole-mobile');
				elModal.classList.remove('type-whole-desktop');
				setTimeout(() => {
					elModal.classList.add('n' + openLen);
					elModal.classList.add('current');
					elModal.classList.add('ready');
				}, 0)
				elModal.dataset.remove = remove;
				elModal.dataset.n = openLen;
				elModal.dataset.scrolltop = scr_t;
				elModal.setAttribute('aria-labelledby', id + '_label');
				elModal.setAttribute('aria-describedby', id + '_desc');
				elModal.setAttribute('role', 'dialog');
				elModal.dataset.drag = drag ? true : false;
				(!!elModalTit) ? elModalTit.id = id + '_label' : '';
				elModalBody.style.overflowY = 'auto';
				elModalBody.id = id + '_desc';
				elModal.dataset.focusid = focusID;
				//[set] position
				switch (ps) {
					case 'center':
						elModal.classList.add('ps-center');
						elModal.dataset.ps = 'center';
						break;
					case 'top':
						elModal.classList.add('ps-top');
						elModal.dataset.ps = 'top';
						break;
					case 'right':
						elModal.classList.add('ps-right');
						elModal.dataset.ps = 'right';
						break;
					case 'left':
						elModal.classList.add('ps-left');
						elModal.dataset.ps = 'left';
						break;
					case 'bottom':
						elModal.classList.add('ps-bottom');
						elModal.dataset.ps = 'bottom';
						break;
					default:
						elModal.classList.add('ps-center');
						elModal.dataset.ps = 'center';
						break;
				}
				//[set] whole type / width & height
				switch (whole) {
					case true:
						elModal.classList.add('type-whole');
						gap = 0;
						break;
					case 'mobile':
						elModal.classList.add('type-whole-mobile');
						gap = !!Global.state.device.mobile ? 0 : gap;
						break;
					case 'desktop':
						elModal.classList.add('type-whole-desktop');
						break;
				}
				(!!width) ? elModalWrap.style.width = width / 10 + 'rem' : '';
				elModal.setAttribute('data-scroll', (_scroll === 'inner') ? 'inner' : 'outer');
				clearTimeout(timer);
				timer = setTimeout(() => {
					elModal.setAttribute('tabindex', 0);
					Global.focus.loop({ selector: elModal });
					elModal.classList.add('open');
					(!!sZindex) ? elModal.style.zIndex = sZindex : '';
					(window.innerHeight < elModalWrap.offsetHeight) ?
						elModal.classList.add('is-over') :
						elModal.classList.remove('is-over');
				},0);
				//dim event
				// elModalDim && elModalDim.addEventListener('click', Global.modal.dimAct);
				
				//drag event
				let isDragState = false;
				const dragStart = (e) => {
					const el_this = e.currentTarget;
					const y = isTouch ? e.targetTouches[0].clientY : e.clientY;
					const x = isTouch ? e.targetTouches[0].clientX : e.clientX;
					const rect = elModalWrap.getBoundingClientRect();
					const h = rect.height;
					let isMove = false;
					let y_m;
					let x_m;
					const dragMove = (e) => {
    					y_m = isTouch ? e.targetTouches[0].clientY : e.clientY;
    					x_m = isTouch ? e.targetTouches[0].clientX : e.clientX;
						if (isDragState) {
							if (Math.abs(y - y_m) > 10 && Math.abs(x - x_m) < Math.abs(y - y_m) && (y - y_m) < 0) {
								elModalWrap.setAttribute(
									'style',
									`max-height: ${(h + (y - y_m)) / 10}rem !important; height: ${(h + (y - y_m)) / 10}rem !important;`
								);
								isMove = true;
							} else {
								
								isMove = false;
							}
						} else {
							if (Math.abs(y - y_m) > 10 && Math.abs(x - x_m) < Math.abs(y - y_m) && (y - y_m) > 0) {
								elModalWrap.setAttribute(
									'style',
									`max-height: ${(h + (y - y_m)) / 10}rem !important; height: ${(h + (y - y_m)) / 10}rem !important;`
								);
								isMove = true;
							} else {
								elModalWrap.setAttribute(
									'style',
									`max-height: ${(h + (y - y_m)) / 10}rem !important; height: ${(h + (y - y_m)) / 10}rem !important;`
								);
								isMove = false;
							}
						}
					}
					const dragEnd = () => {
						document.removeEventListener('touchmove', dragMove);
						document.removeEventListener('touchend', dragEnd);
						//확장에서 축소를 위한 드래그체크
						const reDrag = (e) => {
    					const _y = isTouch ? e.targetTouches[0].clientY : e.clientY;
							const _x = isTouch ? e.targetTouches[0].clientX : e.clientX;
							const _t = elModalBody.scrollTop;
							let _y_m;
							let _x_m;
							const reDragMove = (e) => {
								_y_m = isTouch ? e.targetTouches[0].clientY : e.clientY;
								_x_m = isTouch ? e.targetTouches[0].clientX : e.clientX;
							}
							const reDragEnd = () => {
								document.removeEventListener('touchmove', reDragMove);
								document.removeEventListener('touchend', reDragEnd);

								if (_t < 1 && (_y - _y_m) < 0 && Math.abs(_x - _x_m) < Math.abs(_y - _y_m)) {
									elModalWrap.removeEventListener('touchstart', reDrag);
									elModalWrap.addEventListener('touchstart', dragStart);
								} else {
									elModalWrap.addEventListener('touchstart', reDrag);
								}
							}
							document.addEventListener('touchmove', reDragMove, { passive: false });
							document.addEventListener('touchend', reDragEnd);
						}
						const restoration = () => {
							elModal.dataset.state = '';
							elModalWrap.setAttribute(
								'style',
								`max-height: 32rem !important; overflow-y: hidden !important;`
							);
							elModalWrap.addEventListener('touchstart', dragStart);
							isDragState = false;
						}
						const reDragClose = (e) => {
							restoration();
							elModalWrap.removeEventListener('touchstart', reDrag);
						}
						//성공 확장
						if (y - 30 > y_m && isMove) {
							elModal.dataset.state = 'drag-full';
							elModalWrap.classList.add('motion');
							const dragCloseBtn = elModal.querySelector('[data-modal-drag="close"]');
							isDragState = true;
							dragCloseBtn && dragCloseBtn.addEventListener('click', reDragClose);
							elModalWrap.setAttribute(
								'style', 'max-height:100dvh !important; overflow-y: hidden !important; height: 100dvh !important;'
							);
							elModalWrap.addEventListener('transitionend', () => {
								elModalWrap.classList.remove('motion');
								let _list = elModalBody.querySelector('.search-result-list');
								!_list ? _list = elModal.querySelector('[data-modal-scroll]') : '';

								const hasScroll = _list.scrollHeight > _list.clientHeight;

								if (hasScroll) {
									elModalWrap.removeEventListener('touchstart', dragStart);
									elModalWrap.addEventListener('touchstart', reDrag);
								}
							});
						} 
						//성공 원복
						else if(y_m - y > 30) {
							if (elModal.dataset.state === 'drag-full') {
								if (y_m - y < (h / 3) * 2) {
									restoration();
								} else {
									elModalWrap.removeEventListener('touchstart', dragStart);
									Global.modal.hide({
										id: id,
										callbackClose: callbackClose
									});
								}
							} else {
								elModalWrap.removeEventListener('touchstart', dragStart);
								Global.modal.hide({
									id: id,
									callbackClose: callbackClose
								});
							}
						} 
						//취소 풀원복
						else if (isDragState) {
							elModalWrap.setAttribute(
								'style', 'max-height:100dvh !important; overflow-y: hidden !important; height: 100dvh !important;'
							);
						} 
						//취소 원복
						else {
							restoration();
						}
					}
					document.addEventListener('touchmove', dragMove, { passive: false });
					document.addEventListener('touchend', dragEnd);
				}
				if (drag) {
					elModalWrap.removeEventListener('touchstart', dragStart);
					elModalWrap.addEventListener('touchstart', dragStart);
				}
				//close button event
				const closeAct = (e) => {
					const elThis = e.currentTarget;
					const elThisModal = elThis.closest('.ui-modal');
					!!elModalClose && elModalClose.removeEventListener('click', closeAct);
					Global.modal.hide({
						id: elThisModal.id,
						remove: remove,
						callbackClose: callbackClose
					});
				}

				const lastClose = elModal.querySelector('.ui-modal-last');
				if (!!elModalClose) {
					elModalClose.addEventListener('click', closeAct);
				}
				if (!!lastClose) {
					lastClose.addEventListener('click', closeAct);
				}

				//systyem modal confirm & cancel callback
				elModalConfirm && elModalConfirm.addEventListener('click', sConfirmCallback);
				elModalCancel && elModalCancel.addEventListener('click', sCancelCallback);

				//transition end event
				// const modalTrEnd = () => {
				// 	if (!!whole) {
				// 		elModal.classList.add('fix-header');
				// 		elModalBody.style.paddingTop = (headerH + 10) / 10 + 'rem';
				// 	}
				// }
				// elModalWrap.addEventListener('transitionend', modalTrEnd);

				//resize event
				let timerResize;
				const winResize = () => {
					clearTimeout(timerResize);
					timerResize = setTimeout(() => {
						Global.modal.reset();
					}, 200);
				}
				window.addEventListener('resize', winResize);

				setTimeout(() => {
					!!callback && callback(id);
				}, 100);
			}

			//system modal 
			const makeSystemModal = () => {
				let htmlSystem = '';
				htmlSystem += '<div class="ui-modal type-system ' + sClass + '" id="' + id + '" role="alertdialog" aria-modal="true" aria-live="polite">';
				htmlSystem += '<div class="ui-modal-wrap">';
				htmlSystem += '<div class="ui-modal-body">';
				htmlSystem += sMessage;
				htmlSystem += '</div>';
				htmlSystem += '<div class="ui-modal-footer">';
				htmlSystem += '<div class="modal-footer-btn-group">';

				if (sBtnCancelTxt) {
					htmlSystem += '<button type="button" class="btn-base ui-modal-cancel" data-color="tertiary" data-size="48"><span class="btn-text">' + sBtnCancelTxt + '</span></button>';
				}
				if (sBtnConfirmTxt) {
					htmlSystem += '<button type="button" class="btn-base ui-modal-confirm" data-color="secondary" data-size="48"><span class="btn-text">' + sBtnConfirmTxt + '</span></button>';
				}

				htmlSystem += '</div>';
				htmlSystem += '</div>';
				htmlSystem += '</div>';
				htmlSystem += '</div>';

				el_area_modal.insertAdjacentHTML('beforeend', htmlSystem);

				htmlSystem = '';
				act();
			}

			//setting
			if (type === 'normal') {
				//modal
				if (!!src && !document.querySelector('#' + opt.id)) {
					Global.ajax.init({
						area: el_area_modal,
						url: src,
						add: true,
						callback: () => {
							act();
						}
					});
				} else {
					act();
				}

				endfocus.dataset.focus = focusID;

			} else {
				//system modal
				endfocus = null;
				remove = true;
				id = id;
				makeSystemModal();
				Global.state.isSystemModal = true;
			}
		},
		dimAct() {
			const elOpens = document.querySelectorAll('.ui-modal.open');
			let openN = [];

			for (let i = 0, len = elOpens.length; i < len; i++) {
				const that = elOpens[i];
				that.dataset.n && openN.push(that.dataset.n);
			}

			const elCurrent = document.querySelector('.ui-modal.open[data-n="' + Math.max.apply(null, openN) + '"]');
			const currentID = elCurrent.id;

			//system modal 제외
			if (currentID !== 'uiSystemModal') {
				Global.modal.hide({
					id: currentID,
					remove: elCurrent.dataset.remove
				});
			}
		},
		reset() {
			const elModals = document.querySelectorAll('.ui-modal.open.ps-center');

			for (let i = 0, len = elModals.length; i < len; i++) {
				const that = elModals[i];
				const elModalHead = that.querySelector('.ui-modal-header');
				const elModalBody = that.querySelector('.ui-modal-body');
				const elModalFoot = that.querySelector('.ui-modal-footer');
				const h_win = window.innerHeight;
				const h_head = !!elModalHead ? elModalHead.outerHeight : 0;
				const h_foot = !!elModalFoot ? elModalFoot.outerHeight : 0;
				const h = h_win - (h_head + h_foot);

				if (Global.state.browser.size !== 'desktop') {
					elModalBody.style.minHeight = h / 10 + 'rem';
					elModalBody.style.maxHeight = h / 10 + 'rem';
				} else {
					elModalBody.style.minHeight = '';
					elModalBody.style.maxHeight = '';
				}
			}
		},
		hide(option) {
			const opt = Object.assign({}, Global.modal.optionsClose, option);
			const id = opt.id;
			const type = opt.type;
			const remove = opt.remove;
			const callback = opt.callback;
			const elModal = document.querySelector('#' + id);
			const el_body = document.querySelector('body');
			const elHtml = document.querySelector('html');
			const elModals = document.querySelectorAll('.ui-modal');

			elModal.classList.add('close');
			elModal.classList.remove('open')
			elModal.classList.remove('fix-header');

			const elOpen = document.querySelectorAll('.ui-modal.open');
			const len = (elOpen.length > 0) ? elOpen.length : false;

			let timer;
			let endfocus = opt.endfocus;
			let elModalPrev = false;
			const focusID = elModal.dataset.focusid;


			for (let i = 0, len = elModals.length; i < len; i++) {
				const that = elModals[i];
				that.classList.remove('current');
			}

			if (!!len) {
				elModalPrev = document.querySelector('.ui-modal.open.n' + (len - 1));
				!!elModalPrev && elModalPrev.classList.add('current');
			}

			//시스템팝업이 아닌 경우
			if (type !== 'system') {
				endfocus = endfocus === false ?
					document.querySelector('[data-focus="' + focusID + '"]') :
					opt.endfocus;
			}

			//단일
			if (!len) {
				elHtml.classList.remove('is-modal');
			}

			Global.scroll.move({
				top: Number(elModal.dataset.scrolltop)
			});

			const closeEnd = () => {
				const elWrap = elModal.querySelector('.ui-modal-wrap');
				const elOpen = document.querySelectorAll('.ui-modal.open');
				const len = !!elOpen ? elOpen.length : false;

				elWrap.removeAttribute('style');
				el_body.removeAttribute('style');
				elModal.dataset.n = null;

				if (!len) {
					elHtml.classList.remove('scroll-no');
					el_body.classList.remove('scroll-no');
				}

				(remove === 'true') ? elModal.remove() : elModal.classList.remove('ready');
				!!callback && callback(id);
				!!endfocus && endfocus.focus();

				elModal.removeEventListener('animationend', closeEnd);
			}

			elModal.addEventListener('animationend', closeEnd);

			// callbackClose && callbackClose();

			// clearTimeout(timer);
			// timer = setTimeout(function(){
			// 	const elWrap = elModal.querySelector('.ui-modal-wrap');
			// 	const elOpen = document.querySelectorAll('.ui-modal.open');
			// 	const len = !!elOpen ? elOpen.length : false;

			// 	elWrap.removeAttribute('style');
			// 	el_body.removeAttribute('style');
			// 	elModal.dataset.n = null;

			// 	if (!len) {
			// 		elHtml.classList.remove('scroll-no');
			// 		el_body.classList.remove('scroll-no');
			// 	}

			// 	(remove === 'true') ? elModal.remove() : elModal.classList.remove('ready');
			// 	!!callback && callback(id);
			// 	!!endfocus && endfocus.focus();

			// 	const sid = elModal.querySelector('.ui-modal-body').dataset.scrollId;
			// 	!!sid && Global.scrollBar.destroy(sid);
			// },210);
		},
		hideSystem(opt) {
			Global.state.isSystemModal = false;
			Global.modal.hide({
				id: opt.id,
				type: 'system',
				remove: 'true'
			});
		}
	}

	Global.toast = {
		timer: null,
		/**
		 * options 
		 * delay: short[2s] | long[3.5s]
		 * status: assertive[중요도 높은 경우] | polite[중요도가 낮은 경우] | off[default]
		 */
		options: {
			delay: 'short',
			classname: '',
			conts: '',
			status: 'off',
			auto: true,
			ps: 'bottom',
			callback: false,
		},
		show(option) {
			const opt = Object.assign({}, this.options, option);
			const delay = opt.delay;
			const classname = opt.classname;
			const callback = opt.callback;
			const conts = opt.conts;
			const ps = opt.ps;
			const status = opt.status;
			const el_body = document.querySelector('body');
			const dataId = Global.parts.makeID(5);
			const elFoot = document.querySelector('footer[data-id="footer"]');

			!document.querySelector('.area-toast') && el_body.insertAdjacentHTML('beforeend', `<div class="area-toast"></div>`);
			const baseToast = document.querySelector('.area-toast');
			let tagToast = `<div class="ui-toast mdl-toast ${classname}" aria-live="${status}" data-id="toast_${dataId}" data-ps="${ps}">
				${conts}`;
			if (!opt.auto) tagToast += `<button type="button" class="mdl-toast-close" data-icon="close-w"></button>`;
			tagToast += `</div>`;
			baseToast.insertAdjacentHTML('beforeend', tagToast);
			tagToast = null;

			const elToast = document.querySelector(`.ui-toast[data-id="toast_${dataId}"]`);
			const elBaseToast = document.querySelector('.area-toast');
			const isModal = document.querySelector('.is-modal');

			if (ps === 'center') {
				elBaseToast.dataset.ps = ps;
				elBaseToast.removeAttribute('style');
			} else {
				elBaseToast.dataset.ps = ps;
				if (isModal) {
					elBaseToast.style.bottom = ' calc(8rem + env(safe-area-inset-bottom))';
				} else {
					console.log(elFoot)
					if (elFoot) {
						elBaseToast.style.bottom = (elFoot.offsetHeight / 10) + 'rem';
					} else {
						elBaseToast.style.bottom = 'calc(8rem + env(safe-area-inset-bottom))';
					}
				}
			}
			
			let time = (delay === 'short') ? 2000 : 3500;

			const clear = e => {
				const _this = e.currentTarget;
				_this.removeEventListener('animationend', clear);
				_this.remove();
				elToast.removeAttribute('aria-hidden');
				!!callback && callback();
			}
			const hide = t => {
				setTimeout(() => {
					elToast.setAttribute('aria-hidden', 'true');
					elToast.addEventListener('animationend', clear);
				}, t);
			}
			const act = e => {
				const _this = e.currentTarget;
				_this.removeEventListener('animationend', act);
				hide(time);
			}
			elToast.setAttribute('aria-hidden', 'false');
			elToast.addEventListener('animationend', act);

			if (!opt.auto) {
				elToast.querySelector('.mdl-toast-close').addEventListener('click', hide);
			}
		}
	}

	Global.radioButton = {
		init(option) {
			const opt = option;
			const wrap = document.querySelector(`[data-radio-button="${opt.id}"]`);
			const selected = wrap.querySelector('button[data-state="select"]');
			const btns = wrap.querySelectorAll('button');

			wrap.setAttribute('role', 'listbox');
			if (selected) selected.dataset.state = "";
			if (opt.index !== null) btns[opt.index].dataset.state = "select";

			const act = (e) => {
				const _this = e.currentTarget;
				const _wrap = _this.closest('[data-radio-button]');
				const _selected = _wrap.querySelector('button[data-state="select"]');
				if (_selected) _selected.dataset.state = "";

				_this.dataset.state = "select";
				opt.callback && opt.callback({
					target: _this,
					id: opt.id,
					index: Number(_this.dataset.radioIdx)
				});
			}
			btns.forEach((item, index) => {
				item.dataset.radioIdx = index;
				item.addEventListener('click', act);
			})
		}
	}

	Global.allCheck = {
		actCheck(e) {
			const _this = e.target;
			const _main = document.querySelector(`input[data-allcheck-main][name="${_this.name}"]`);
			const _subs_r = document.querySelectorAll(`input[data-allcheck-sub][name="${_this.name}"][required]`);
			const _subs = document.querySelectorAll(`input[data-allcheck-sub][name="${_this.name}"]`);
			const _btn = document.querySelector(`[data-allcheck-btn="${_this.dataset.allcheckSub}"]`);
			const len_r = _subs_r.length;
			const len = _subs.length;
			let n = 0;
			let nn = 0;

			_subs_r.forEach((item) => {
				item.checked === true ? n = n + 1 : '';
			});
			_subs.forEach((item) => {
				item.checked === true ? nn = nn + 1 : '';
			});

			if (len_r === 0) {
				if (_btn) _btn.disabled = (nn > 0) ? false : true;
				if (_main) _main.checked = (len === nn) ? true : false;
			} else {
				if (_btn) _btn.disabled = (len_r === n) ? false : true;
				if (_main) _main.checked = (len === nn) ? true : false;
			}
		},
		actCheckAll(e) {
			const _this = e.target;
			const _subs = document.querySelectorAll(`input[data-allcheck-sub][name="${_this.name}"]`);
			const _btn = document.querySelector(`[data-allcheck-btn="${_this.dataset.allcheckMain}"]`);
			_subs.forEach((item) => {
				item.checked = _this.checked ? true : false;
				if (_btn) _btn.disabled = _this.checked ? false : true;
			});
		},
		init() {
			const _this = this;
			const check_mains = document.querySelectorAll('[data-allcheck-main]');
			const check_subs = document.querySelectorAll('[data-allcheck-sub]');

			check_mains.forEach((item) => {
				item.removeEventListener('change', _this.actCheckAll);
				item.addEventListener('change', _this.actCheckAll);
			});
			check_subs.forEach((item) => {
				item.removeEventListener('change', _this.actCheck);
				item.addEventListener('change', _this.actCheck);
			});
		}
	}
})();
 