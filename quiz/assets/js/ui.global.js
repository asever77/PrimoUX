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
})();

class QuizPage {
	constructor(opt) {
		this.mathMission = document.querySelector('.math-mission');
		this.pages = this.mathMission.querySelectorAll('[data-mission-page]');
		this.items = this.mathMission.querySelectorAll('.math-mission--item');
		this.pageNextBtns = document.querySelectorAll('[data-mission-btn]');
		this.content = this.mathMission.querySelector('.math-mission--content');
		this.timer;

		this.data = opt.data;
	}
	actQuizGameInit(v) {
		const missionItems = v.querySelectorAll(`.math-mission--game-item`);
		if (missionItems) {
			missionItems.forEach(item => {
				const missionItem_id = item.dataset.id;
				QuizGame.exe[missionItem_id].init();
			});
		}
	}
	actMove(v) {
		this.mathMission.dataset.page = v.dataset.page;
		this.items.forEach(item => {
			item.dataset.state = "start";
		});
	
		// this.timer && this.timer.resetTimer();//타이머리셋
	}
	actStep() {
		console.log('actStep'); 
		const item = this.mathMission.querySelector(`.math-mission--item[data-mission-page="${this.content.dataset.missionPage}"]`);
		const game = item.querySelector('.math-mission--game');

		game.dataset.step = Number(game.dataset.step) + 1;

		this.timer.resetTimer();
		item.dataset.state = "play";
		this.timer.init();
	}

	actStart() {
		const item = this.mathMission.querySelector(`.math-mission--item[data-mission-page="${this.content.dataset.missionPage}"]`);
		item.dataset.state = "play";

		console.log('actStart', item);
		this.actQuizGameInit(item);

		//타이머시작
		this.timer = new QuizTimer({
			item: item,
		});
		this.timer.init();
	}
	//미션시작 카운트 3.2.1.. > actStart 실행
	actCount() {
		const item = this.mathMission.querySelector(`.math-mission--item[data-mission-page="${this.content.dataset.missionPage}"]`);
		const countNumber = 3;
		item.querySelector('.math-mission--count-number').textContent = countNumber;
		item.dataset.state = "ready";

		let timeLeft = countNumber;
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
	actMissionNext(v) {
		this.content.dataset.missionPage = v.dataset.missionPage;
	}
	actEvent(e) {
		const _this = e.currentTarget;
		switch (_this.dataset.missionBtn) {
			case 'reset':
				this.actMove(_this);
				break;

			case 'again':
				_this.closest('.math-mission--item')
				const item = _this.closest('.math-mission--item');
				item.querySelector('.math-mission--game').dataset.step = 0;
				item.dataset.state = "start";
				break;

			case 'mission-next':
				this.actMissionNext(_this);
				break;

			case 'next':
				this.actMove(_this);
				break;

			case 'step': 
				this.actStep(_this);
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
		// this.data.forEach((item, index) => {
		// 	console.log(item)
		// 	const gameItem = document.querySelector(`.math-mission--game-item[data-id="${item.id}"]`);

		// 	QuizGame.exe[item.id].init();
		// });

		//이벤트
		this.pages.forEach((page, index) => {
			// page.dataset.missionPage = index;
			// if (page.querySelector('[data-mission-btn="next"]')) {
			// 	page.querySelector('[data-mission-btn="next"]').dataset.page = index + 1;
			// }
			// if (page.querySelector('[data-mission-btn="complete"]')) {
			// 	page.querySelector('[data-mission-btn="complete"]').dataset.page = index + 1;
			// }
			// if (page.querySelector('[data-mission-btn="again"]')) {
			// 	page.querySelector('[data-mission-btn="again"]').dataset.page = index;
			// 	page.querySelector('.math-mission--game').dataset.step = 0;
			// }
		});
		this.pageNextBtns.forEach((btn, index) => {
			btn.addEventListener('click', this.actEvent.bind(this));
		});
	}

	missionCheck(v) {
		const isAnswer = v;
		const item = this.mathMission.querySelector(`.math-mission--item[data-mission-page="${this.content.dataset.missionPage}"]`);
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
		this.limitTime = 15;
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
		console.log('height', h);
		this.itemTimerBar.style.maxHeight = h + 'px';
		this.itemTimerBar.style.height = '100%';
		console.log('정지', h);
		this.itemTimerBar.classList.remove('motion');
		clearTimeout(this.timer);
		
		
	}
}

class QuizMating {
	constructor(opt) {
		this.id = opt.id;
		this.data = opt.data;
		this.game = document.querySelector(`[data-id="${this.id}"] .game-mating`);
		this.answer = [];

		this.cancel = null;
		this.n = 1;
		this.comparison = null;
	}
	init() {
		this.n = 1;
		const quizData = this.shuffleArray(this.data);
		let game_html = `<div class="game-mating--wrap">`;
		quizData.forEach(item => {
			game_html += `<button type="button" class="game-mating--item" data-answer="${item.answer}">
				<span class="game-mating--card">
					<span class="game-mating--front"></span>
					<span class="game-mating--back">${item.content}</span>
				</span>
			</button>`;
		});
		game_html += `</div>
		<div class="math-mission--game-footer">
			<button type="button" class="math-mission--game-btn" disabled>완료</button>
		</div>
		<div class="math-mission--game-timeover">
			<strong>TIME</strong><strong>OVER</strong>
		</div>
		<div class="math-mission--game-O">
			<span class="a11y-hidden">정답</span>
		</div>
		<div class="math-mission--game-X">
			<span class="a11y-hidden">오답</span>
		</div>`;

		this.game.innerHTML = game_html;

		this.btnComplete = this.game.querySelector('.math-mission--game-btn');
		this.btnComplete.addEventListener('click', this.complete.bind(this));

		this.matingBtns = this.game.querySelectorAll('.game-mating--item');
		this.matingBtns.forEach(item => {
			item.addEventListener('click', this.act.bind(this))
		});
	}
	act(e) {
		const _this = e.currentTarget;
		if (_this.dataset.selected !== 'true') {
			const isMating_1 = this.game.querySelectorAll(`.game-mating--item[data-n="1"]`);
			const isMating_2 = this.game.querySelectorAll(`.game-mating--item[data-n="2"]`);
			const isMating_3 = this.game.querySelectorAll(`.game-mating--item[data-n="3"]`);

			if (isMating_1.length !== 2) {
				_this.dataset.n = 1;
			} else if (isMating_1.length === 2) {
				if (isMating_2.length !== 2) {
					_this.dataset.n = 2;
				} else if (isMating_2.length === 2) {
					if (isMating_3.length !== 2) {
						_this.dataset.n = 3;
					}
				}
			}
			_this.dataset.selected = true;
		}
		else {
			console.log('선택취소',_this.dataset.n)
			const dd = this.game.querySelectorAll(`.game-mating--item[data-n="${_this.dataset.n}"]`);
			dd.forEach(item => {
				item.dataset.n = '';
				item.dataset.selected = false;
			});
		}

		//완료버튼
		const isSelected = this.game.querySelectorAll(`.game-mating--item[data-selected="true"]`);
		if (isSelected.length === this.data.length) {
			this.btnComplete.disabled = false;
		} else {
			this.btnComplete.disabled = true;
		}
	}
	complete() {
		const selectedBtns = this.game.querySelectorAll('.game-mating--item[data-selected="true"]');

		if (this.data.length === selectedBtns.length) {
			let n = 0;
			
			for (let i = 1, len = selectedBtns.length/2; i <= len; i++) {
				const items = this.game.querySelectorAll(`.game-mating--item[data-n="${i}"]`);

				if (items[0].dataset.answer === items[1].dataset.answer) {
					n = n + 1;
				} else {
					console.log('오답')
					QuizGame.exe.quizPage.missionCheck(false);
					break;
				}
			}

			if (this.data.length/2 === n ) {
				console.log('정답')
				QuizGame.exe.quizPage.missionCheck(true);
			}

		} else {
			QuizGame.exe.quizPage.missionCheck(false);
		}
	}
	shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // 0부터 i까지의 랜덤한 인덱스 선택
        [array[i], array[j]] = [array[j], array[i]]; // 요소 교환
    }
    return array;
	}

}