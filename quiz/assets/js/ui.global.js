(() => {
	'use strict';

	const global = 'QuizGame';
	window[global] = {};
	const Global = window[global];

	Global.exe = {};
	Global.modal = {};
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

	Global.page = { 
		init() {
			const mathMission = document.querySelector('.math-mission');
			const items = mathMission.querySelectorAll('[data-mission-page]');
			const pageNextBtns = document.querySelectorAll('[data-mission-btn]');

			const actMove = (v) => {
				console.log(v.dataset.page);
				mathMission.dataset.page = v.dataset.page;


				const items = mathMission.querySelectorAll(`.math-mission--item`);
				items.forEach(item => {
					item.dataset.state = "start";
				});
				
				Global.page.timer && Global.page.timer.resetTimer();//타이머리셋
			}
			const actStart = () => {
				const item = mathMission.querySelector(`.math-mission--item[data-mission-page="${mathMission.dataset.page}"]`);
				item.dataset.state = "play";

				//타이머시작
				Global.page.timer = new QuizTimer({
					item: item,
				});
				Global.page.timer.init();
			}
			//미션시작 카운트 3.2.1.. > actStart 실행
			const actCount = () => {
				const item = mathMission.querySelector(`.math-mission--item[data-mission-page="${mathMission.dataset.page}"]`);
				item.querySelector('.math-mission--count-number').textContent = 3;
				item.dataset.state = "ready";

				let timeLeft = 3;
				const timer = setInterval(() => {
					if (timeLeft > 0) {
						timeLeft--;
						if (timeLeft === 0) {
							clearInterval(timer);
							actStart();
						}
						item.querySelector('.math-mission--count-number').textContent = timeLeft;
					}
				}, 1000);
			}
			//이벤트
			const actEvent = (e) => {
				const _this = e.currentTarget;

				switch (_this.dataset.missionBtn) {
					case 'next':
					case 'again':
					case 'reset':
					case 'complete': 
						actMove(_this);
						break;
					case 'start':
						actCount();
						break;
					case 'out':
						Global.page.timer && Global.page.timer.resetTimer();//타이머리셋	
						console.log('나가기');
						break;
				}
			}

			items.forEach((item, index) => {
				item.dataset.missionPage = index;
				if (item.querySelector('[data-mission-btn="next"]')) {
					item.querySelector('[data-mission-btn="next"]').dataset.page = index + 1;
				}
				if (item.querySelector('[data-mission-btn="complete"]')) {
					item.querySelector('[data-mission-btn="complete"]').dataset.page = index + 1;
				}
				if (item.querySelector('[data-mission-btn="again"]')) {
					item.querySelector('[data-mission-btn="again"]').dataset.page = index;
				}
			});
			pageNextBtns.forEach((item, index) => {
				item.addEventListener('click', actEvent);
			});
		},
	}

})();

class QuizPage {
	constructor() {
		this.mathMission = document.querySelector('.math-mission');
		this.pages = this.mathMission.querySelectorAll('[data-mission-page]');
		this.items = this.mathMission.querySelectorAll('.math-mission--item');
		this.pageNextBtns = document.querySelectorAll('[data-mission-btn]');
		this.timer;
	}
	actMove(v) {
		this.mathMission.dataset.page = v.dataset.page;
		this.items.forEach(item => {
			item.dataset.state = "start";
		});
		
		this.timer && this.timer.resetTimer();//타이머리셋
	}
	actStart() {
		const item = this.mathMission.querySelector(`[data-mission-page="${this.mathMission.dataset.page}"]`);
		item.dataset.state = "play";

		//타이머시작
		this.timer = new QuizTimer({
			item: item,
		});
		this.timer.init();
	}
	//미션시작 카운트 3.2.1.. > actStart 실행
	actCount() {
		const item = this.mathMission.querySelector(`[data-mission-page="${this.mathMission.dataset.page}"]`);
		item.querySelector('.math-mission--count-number').textContent = 3;
		item.dataset.state = "ready";

		let timeLeft = 3;
		const timer = setInterval(() => {
			if (timeLeft > 0) {
				timeLeft--;
				if (timeLeft === 0) {
					clearInterval(timer);
					this.actStart();
				}
				item.querySelector('.math-mission--count-number').textContent = timeLeft;
			}
		}, 1000);
	}
	actEvent(e) {
		const _this = e.currentTarget;
		switch (_this.dataset.missionBtn) {
			case 'next':
			case 'again':
			case 'reset':
			case 'complete': 
				this.actMove(_this);
				break;
			case 'step': 
				this.actStep();
				break;
			case 'start':
				this.actCount();
				break;
			case 'out':
				this.timer && this.timer.resetTimer();//타이머리셋	
				console.log('나가기');
				break;
		}
	}
	init() {
		//이벤트
		this.pages.forEach((page, index) => {

			console.log(page);

			page.dataset.missionPage = index;
			if (page.querySelector('[data-mission-btn="next"]')) {
				page.querySelector('[data-mission-btn="next"]').dataset.page = index + 1;
			}
			if (page.querySelector('[data-mission-btn="complete"]')) {
				page.querySelector('[data-mission-btn="complete"]').dataset.page = index + 1;
			}
			if (page.querySelector('[data-mission-btn="again"]')) {
				page.querySelector('[data-mission-btn="again"]').dataset.page = index;
			}
		});
		this.pageNextBtns.forEach((btn, index) => {
			btn.addEventListener('click', this.actEvent.bind(this));
		});
	}
	actStep() {
		console.log('step'); 
		const item = this.mathMission.querySelector(`[data-mission-page="${this.mathMission.dataset.page}"]`);
		const game = item.querySelector('.math-mission--game');
		const games = item.querySelectorAll('.math-mission--game-item');
		const gameLen = games.length;

		game.dataset.step = Number(game.dataset.step) + 1;

		console.log(Number(game.dataset.step) + 1);

		this.timer.resetTimer();
		item.dataset.state = "play";
		this.timer.init();
	}

	missionCheck(v) {
		const isAnswer = v;
		const item = this.mathMission.querySelector(`[data-mission-page="${this.mathMission.dataset.page}"]`);
		const game = item.querySelector('.math-mission--game');
		const games = item.querySelectorAll('.math-mission--game-item');
		const gameLen = games.length;

		console.log('missionCheck', gameLen, Number(game.dataset.step))
		this.timer.stopTimer();
		if (isAnswer) {
			//정답
			if ((gameLen - 1) === Number(game.dataset.step)) {
				item.dataset.state = 'check';
			} else {
				item.dataset.state = 'check-O';
			}
		} else {
			//오답
			item.dataset.state = 'check-X';
		}
		
		
	}
}

class QuizTimer {
	constructor(opt){
		this.timer = 0;
		this.limitTime = 15;
		this.timeLeft = this.limitTime;
		this.item = opt.item;
		this.itemTimer = this.item.querySelector('.math-mission--timer');
		this.itemTimerBar = this.itemTimer.querySelector('.math-mission--timer-bar');

		if (!this.itemTimerBar) {
			this.itemTimer.innerHTML = `<b class="math-mission--timer-bar motion" style="height: 0%;">
				<span class="a11y-hidden">남은 시간: ${this.limitTime}초</span>
			</b>`;
			this.itemTimerBar = this.itemTimer.querySelector('.math-mission--timer-bar');
		}
		this.itemTimerText = this.itemTimerBar.querySelector('.a11y-hidden');
	}
	init() {
		this.limitTime = 5;
		this.timeLeft = this.limitTime;

		this.itemTimer.innerHTML = `<b class="math-mission--timer-bar motion" style="height: 0%;">
			<span class="a11y-hidden">남은 시간: ${this.limitTime}초</span>
		</b>`;
		this.itemTimerBar = this.itemTimer.querySelector('.math-mission--timer-bar');
		this.itemTimerText = this.itemTimerBar.querySelector('.a11y-hidden');

		this.actTimer();
	}
	actTimer() {
		this.timer = setTimeout(() => {
			if (this.timeLeft > 1) {
				this.timeLeft--;
				this.itemTimerBar.style.height = (this.limitTime - this.timeLeft) / (this.limitTime - 1) * 100 + '%';
				this.updateTimer();
				this.actTimer();
			} else {
				this.timeLeft--;
				this.updateTimer();
			}
		}, 1000);
	}
	updateTimer() {
		this.itemTimerText.textContent = `남은 시간: ${this.timeLeft}초`;
		
		if (this.timeLeft < 3) {
			this.itemTimer.dataset.state = "warning";
		}
		if (this.timeLeft === 0) {
			//타임오버
			this.item.dataset.state = 'game-over';
			clearTimeout(this.timer);
		}
	}
	resetTimer() {
		this.itemTimerBar.remove();
		clearTimeout(this.timer);
		this.itemTimer.dataset.state = "";
		this.itemTimerText.textContent = `남은 시간: ${this.limitTime}초`;

		setTimeout(() => {
			this.itemTimerBar.style.height = 0 + '%';
			this.itemTimerBar.style.maxHeight = '100%';
			this.itemTimerBar.style.minHeight = '0%';
		},30);
		console.log('리셋');
	}
	stopTimer() {
		const h = this.itemTimerBar.offsetHeight;
		this.itemTimerBar.style.maxHeight = h / 10 + 'rem';
		this.itemTimerBar.style.minHeight = h / 10 + 'rem';
		console.log('정지', h);
		this.itemTimerBar.classList.remove('motion');
		clearTimeout(this.timer);
		
		
	}
}