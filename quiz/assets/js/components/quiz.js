
export class QuizPage {
	constructor(opt) {
		this.mathMission = document.querySelector('.math-mission');
		this.pages = this.mathMission.querySelectorAll('[data-mission-page]');
		this.items = this.mathMission.querySelectorAll('.math-mission--item');
		this.pageNextBtns = document.querySelectorAll('[data-mission-btn]');
		this.content = this.mathMission.querySelector('.math-mission--content');
		this.timer;
		this.data = opt.data;
		this.gameTime = 3;
	}
	init() {
		this.pageNextBtns.forEach((btn, index) => {
			btn.addEventListener('click', this.actEvent.bind(this));
		});
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
	actGameTime(m,s) {
		for (let i = 0, len = this.data.length; i < len; i++) {
			if (this.data[i].id === this.mathMission.querySelector(`.math-mission--item[data-mission-page="${m}"] .math-mission--game-item[data-step="${s}"]`).dataset.id) {
				console.log(this.data[i])
				this.gameTime = this.data[i].time;
				break;
			}
		}
	}

	actMove(v) {
		this.mathMission.dataset.page = v.dataset.page;
		this.items.forEach(item => {
			item.dataset.state = "start";
		});
	}
	actStep() {
		const item = this.mathMission.querySelector(`.math-mission--item[data-mission-page="${this.content.dataset.missionPage}"]`);
		const game = item.querySelector('.math-mission--game');

		game.dataset.step = Number(game.dataset.step) + 1;
		this.actGameTime(this.content.dataset.missionPage, game.dataset.step);
		this.timer.resetTimer({
			time: this.gameTime,
		});
		item.dataset.state = "play";
		this.timer.init();
	}
	actStart() {
		const item = this.mathMission.querySelector(`.math-mission--item[data-mission-page="${this.content.dataset.missionPage}"]`);
		const game = item.querySelector('.math-mission--game');

		item.dataset.state = "play";
		this.actQuizGameInit(item);
		this.actGameTime(this.content.dataset.missionPage, game.dataset.step);
		this.timer = new QuizTimer({
			item: item,
			time: this.gameTime,
		});
		this.timer.init();
	}
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
			case 'again':
				_this.closest('.math-mission--item')
				const item = _this.closest('.math-mission--item');
				item.querySelector('.math-mission--game').dataset.step = 0;
				item.dataset.state = "start";
				break;

			case 'mission-next':
				this.actMissionNext(_this);
				break;

			case 'reset':
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

export class QuizTimer {
	constructor(opt){
		this.opt = opt;
		this.timer = 0;
		this.item = opt.item;
		this.itemTimer = this.item.querySelector('.math-mission--timer');
		this.itemTimerBar = this.itemTimer.querySelector('.math-mission--timer-bar');
		this.limitTime = this.opt.time;
		this.timeLeft = this.limitTime;

		if (!this.itemTimerBar) {
			this.itemTimer.innerHTML = `<b class="math-mission--timer-bar motion" style="height: 0%;">
				<span class="a11y-hidden">남은 시간: ${this.limitTime}초</span>
			</b>`;
			this.itemTimerBar = this.itemTimer.querySelector('.math-mission--timer-bar');
		}
		this.itemTimerText = this.itemTimerBar.querySelector('.a11y-hidden');
	}
	init() {
		
console.log('init', this.limitTime)
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
	resetTimer(opt) {

		console.log('resetTimer', opt);

		this.limitTime = opt.time;
		this.timeLeft = this.limitTime;

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

export class QuizMating {
	constructor(opt) {
		this.id = opt.id;
    this.example = opt.example;
		this.data = opt.data;
		this.game = document.querySelector(`[data-id="${this.id}"]`);
	}
	init() {
		const quizData = QuizGame.utils.shuffleArray(this.data);
		let game_html = `<div class="game-mating">`;
    if (this.example) {
      game_html += `<div class="game-mating--ex">${this.example}</div>`;
    }
		game_html += `<div class="game-mating--wrap">`;
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
			</div>
		</div>`;
    this.game.querySelector('.game-mating') && this.game.querySelector('.game-mating').remove();
		this.game.insertAdjacentHTML('beforeend', game_html);

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
}

export class QuizOX {
	constructor(opt){
		this.id = opt.id;
    this.example = opt.example;
		this.data = opt.data;
		this.game = document.querySelector(`[data-id="${this.id}"]`);
	}
	init() {
		const quizData = QuizGame.utils.shuffleArray(this.data);
		let game_html = `<div class="game-ox">`;
    if (this.example) {
      game_html += `<div class="game-ox--ex">${this.example}</div>`;
    }
		game_html += `<div class="game-ox--wrap">`;
		quizData.forEach((item, index) => {
			game_html += `<div class="game-ox--item" data-answer="${item.answer}">
				<div class="game-ox--item-title">
					${item.content}
				</div>
				<div class="game-ox--item-group">
					<div class="game-ox--item-input">
						<input type="radio" id=${this.id + '_' + index + '_' + 'o'} name="${this.id + '_' + index}" class="a11y-hidden" value="O">
						<label for="${this.id + '_' + index + '_' + 'o'}" class="game-ox--item-o"><span class="a11y-hidden">맞다</span></label>
					</div>
					<div class="game-ox--item-input">
						<input type="radio" id=${this.id + '_' + index + '_' + 'x'} name="${this.id + '_' + index}" class="a11y-hidden" value="X">
						<label for="${this.id + '_' + index + '_' + 'x'}" class="game-ox--item-x"><span class="a11y-hidden">틀리다</span></label>
					</div>
				</div>
			</div>`;
		});
		game_html += `</div>
			<div class="math-mission--game-timeover">
				<strong>TIME</strong><strong>OVER</strong>
			</div>
			<div class="math-mission--game-O">
				<span class="a11y-hidden">정답</span>
			</div>
			<div class="math-mission--game-X">
				<span class="a11y-hidden">오답</span>
			</div>
		</div>`;

		this.game.innerHTML = game_html;
		this.oxInput = this.game.querySelectorAll('.game-ox--item-input input');
		this.oxInput.forEach(item => {
			item.addEventListener('change', this.act.bind(this))
		});
	}
	act(e) {
		const _this = e.currentTarget;
		this.complete(_this.value);
	}
	complete(v) {
		console.log(v,this.data[0].answer);
		QuizGame.exe.quizPage.missionCheck(v === this.data[0].answer);
		// QuizGame.exe.quizPage.missionCheck(false);
	}
}

export class QuizSelect {
	constructor(opt) {
		this.id = opt.id;
    this.example = opt.example;
		this.data = opt.data;
		this.game = document.querySelector(`[data-id="${this.id}"]`);
	}
	init() {
		const quizData = QuizGame.utils.shuffleArray(this.data);
		let game_html = `<div class="game-select">`;
    if (this.example) {
      game_html += `<div class="game-ox--ex">${this.example}</div>`;
    }
		game_html += `<div class="game-select--wrap">`;
		quizData.forEach((item, index) => {
			game_html += `<div class="game-select--item">
				
				<div class="game-select--card">
					<div class="game-select--front"></div>
					<div class="game-select--back">
						<div class="game-select--input">
							<input type="checkbox" id=${this.id + '_' + index} class="a11y-hidden" value="${item.answer}">
							<label for="${this.id + '_' + index}" class="game-select--label">
								${item.content}
							</label>
						</div>
					</div>
				</div>
			</div>`;
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
			</div>
		</div>`;

		this.game.innerHTML = game_html;
		this.btnComplete = this.game.querySelector('.math-mission--game-btn');
		this.btnComplete.addEventListener('click', this.complete.bind(this));
		this.selectInput = this.game.querySelectorAll('.game-select--input input');
		this.selectInput.forEach(item => {
			item.addEventListener('change', this.act.bind(this))
		});
	}
	act() {
		//완료버튼
		const checkedInputs = this.game.querySelectorAll(`.game-select--input input:checked`);

		if (checkedInputs.length) {
			this.btnComplete.disabled = false;
		} else {
			this.btnComplete.disabled = true;
		}
	}
	complete() {
		const checkedInputs = this.game.querySelectorAll(`.game-select--input input`);
		let valueLen = 0;
		let checkLen = 0;
		let answerLen = 0;
		checkedInputs.forEach(item => {
			if (item.value === 'O') {
				valueLen = valueLen + 1;
			}
			if (item.value === 'O' && item.checked) {
				answerLen = answerLen + 1;
			}
			if (item.checked) {
				checkLen = checkLen + 1;
			}
		});
		
		if (valueLen === answerLen && checkLen === answerLen) {
			QuizGame.exe.quizPage.missionCheck(true);
		} else {
			QuizGame.exe.quizPage.missionCheck(false);
		}
	}
}