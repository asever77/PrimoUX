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
		this.timer;

		this.data = opt.data;
	}
	actMove(v) {
		this.mathMission.dataset.page = v.dataset.page;
		this.items.forEach(item => {
			item.dataset.state = "start";
		});
		
		const missionItem = document.querySelector(`.math-mission--item[data-mission-page="${v.dataset.page}"] .math-mission--game-item`);
		if (missionItem) {
			const missionItem_id = missionItem.dataset.id;
			QuizGame.exe[missionItem_id].init();
		}

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
		this.data.forEach((item, index) => {
			console.log(item)
			const gameItem = document.querySelector(`.math-mission--game-item[data-id="${item.id}"]`);

			QuizGame.exe[item.id].init();
		});


		//이벤트
		this.pages.forEach((page, index) => {
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

		this.n = 0;
		this.comparison = null;
	}
	init() {
		this.n = 0;
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
		const matingBtns = this.game.querySelectorAll('.game-mating--item');

		console.log(this.btnComplete);

		this.btnComplete.addEventListener('click', this.complete.bind(this))
		matingBtns.forEach(item => {
			item.addEventListener('click', this.act.bind(this))
		});
	}
	act(e) {
		const _this = e.currentTarget;

		if (_this.dataset.selected !== 'true') {
			this.n = this.n + 1;
			_this.dataset.n = this.n;
			_this.dataset.selected = true;
		}
		else {
			this.n = this.n - 1;
			_this.dataset.n = '';
			_this.dataset.selected = false;
		}

		if (this.data.length === this.n ) {
			this.btnComplete.disabled = false;
		}
		console.log(_this.dataset.answer);
	}
	complete() {
		const selectedBtns = this.game.querySelectorAll('.game-mating--item[data-selected="true"]');

		if (this.data.length === selectedBtns.length) {
			let n = 0;
			for (let i = 1, len = selectedBtns.length; i <= len; i = i + 2) {
				const a = this.game.querySelector(`.game-mating--item[data-n="${i}"]`);
				const b = this.game.querySelector(`.game-mating--item[data-n="${i + 1}"]`);

				if (a.dataset.answer === b.dataset.answer) {
					n = n + 1;
				} else {
					console.log('오답')
					QuizGame.exe.quizPage.missionCheck(false);
					break;
				}
			}

			if (this.data.length / 2 === n ) {
				console.log('정답')
				QuizGame.exe.quizPage.missionCheck(true);
			}

		} else {
			console.log('오답2222222')
			QuizGame.exe.quizPage.missionCheck(false);
		}
	}
	shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // 0부터 i까지의 랜덤한 인덱스 선택
        [array[i], array[j]] = [array[j], array[i]]; // 요소 교환
    }
		console.log(array);
    return array;
	}

}