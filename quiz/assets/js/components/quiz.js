
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

// quiz
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
      const maxMating = this.data.length/2; // 최대 그룹 개수 (필요에 따라 조정)
      let n = 1;

      while (n <= maxMating) {
          const isMating = this.game.querySelectorAll(`.game-mating--item[data-n="${n}"]`);
          if (isMating.length !== 2) {
              _this.dataset.n = n;
              break;
          }
          n++;
      }

      _this.dataset.selected = true;
		}
		else {
			const isMating = this.game.querySelectorAll(`.game-mating--item[data-n="${_this.dataset.n}"]`);
			isMating.forEach(item => {
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
					QuizGame.exe.quizPage.missionCheck(false);
					break;
				}
			}

			if (this.data.length/2 === n ) {
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

export class DrawDrop {
  constructor(opt) {
    this.id = opt.id;
    this.wrap = document.querySelector(`[data-drag-id="${this.id}"]`);
    this.doc = this.wrap;
    this.type = this.wrap.dataset.type;
    this.a11y = opt.a11y === 'true';
    this.isRotate = opt.isRotate;
    this.answer_len = +opt.answerLen; // 숫자 변환 최적화
    this.answer_last = opt.lastAnswer || [];
    this.answer_state = false;
    this.callback = opt.callback;
    this.isTouch = navigator.maxTouchPoints || 'ontouchstart' in document.documentElement;
    this.timer = 0;

    this.el_scroll = document.body;
    this.drag_objects = this.wrap.querySelectorAll('[data-drag-object]');
    this.drag_targets = this.wrap.querySelectorAll('[data-drag-target]');
    this.drag_items = this.wrap.querySelectorAll('[data-drag-item="object"]');
    this.array_target = [];
    this.array_items = [];
    this.reset_data = [];
    
    // this.el_scroll = document.querySelector('.innerContsScroll');

    this.wrap_rect = this.wrap.getBoundingClientRect();
    this.wrap_t = this.wrap_rect.top;
    this.wrap_l = this.wrap_rect.left;

    this.group_target = this.wrap.querySelector('[data-drag-group="target"]');
    if (this.group_target) {
      this.group_target_rect = this.group_target.getBoundingClientRect();
      this.group_target_t = this.group_target_rect.top;
      this.group_target_l = this.group_target_rect.left;
    }

    this.group_object = this.wrap.querySelector('[data-drag-group="object"]');
    if (this.group_object) {
      this.group_object_rect = this.group_object.getBoundingClientRect();
      this.group_object_t = this.group_object_rect.top;
      this.group_object_l = this.group_object_rect.left;
    }
   
    this.win_y = this.el_scroll ? this.el_scroll.scrollTop : window.scrollY;
    this.win_x = this.el_scroll ? this.el_scroll.scrollLeft : window.scrollX;
  }

  init() {
    const set = () => {
      this.wrap.dataset.exe = 'true';
      this.wrap_rect = this.wrap.getBoundingClientRect();
      this.wrap_t = this.wrap_rect.top;
      this.wrap_l = this.wrap_rect.left;

      this.array_target = [];
      this.drag_targets = this.wrap.querySelectorAll('[data-drag-target]');

      if (this.drag_targets) {
        for (let item of this.drag_targets) {
          const rect = item.getBoundingClientRect();

          this.array_target.push({
            name: item.dataset.dragTarget,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            x: rect.x,
            y: rect.y,
            rangeX: [rect.left, rect.left + rect.width],
            rangeY: [rect.top, rect.top + rect.height],
          });
        }
      }

      this.array_items = [];
      this.drag_items = this.wrap.querySelectorAll('[data-drag-item]');
      if (this.drag_items) {
        for (let item of this.drag_items) {
          const rect = item.getBoundingClientRect();
          this.array_items.push({
            name: item.dataset.value,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            x: rect.x,
            y: rect.y,
            rangeX: [rect.left, rect.left + rect.width],
            rangeY: [rect.top, rect.top + rect.height],
          });
          this.reset_data.push(
            item.querySelector('[data-drag-object]').dataset.dragObject
          );
        }
      }

      if (this.answer_last?.length) {
        this.drawLastAnswer();
      } else {
        this.answer_last = [];
      }

      //event
      for (let item of this.drag_objects) {
        if (this.isTouch) {
          item.addEventListener('touchstart', this.actStart, { passive: false });
        } else {
          item.addEventListener('mousedown', this.actStart);
          if (this.a11y) item.addEventListener('keydown', this.actKey);
        }
      }

      if (this.answer_last?.length) {
        let objs = this.wrap.querySelectorAll(
          '[data-drag-target] [data-drag-object]'
        );
        const isOrder = objs.length < 1 ? true : false;
        if (isOrder) {
          objs = this.wrap.querySelectorAll(
            '[data-drag-item] [data-drag-object]'
          );
        }
        for (let obj of objs) {
          if (this.isTouch) {
            if (isOrder) {
              obj.addEventListener('touchstart', this.actStart, { passive: false });
            } else {
              obj.addEventListener('touchstart', this.actStartClone, {
                passive: false,
              });
            }
          } else {
            if (isOrder) {
              obj.addEventListener('mousedown', this.actStart);
            } else {
              obj.addEventListener('mousedown', this.actStartClone);
            }
            if (this.a11y) obj.addEventListener('keydown', this.actKey);
          }
        }
      }
    };
    set(); 
    const set2 = () => {
      console.log('reset');
      this.wrap_rect = this.wrap.getBoundingClientRect();
      this.wrap_t = this.wrap_rect.top;
      this.wrap_l = this.wrap_rect.left;

      this.array_target = [];
      this.drag_targets = this.wrap.querySelectorAll('[data-drag-target]');

      if (this.drag_targets) {
        for (let item of this.drag_targets) {
          const rect = item.getBoundingClientRect();

          this.array_target.push({
            name: item.dataset.dragTarget,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            x: rect.x,
            y: rect.y,
            rangeX: [rect.left, rect.left + rect.width],
            rangeY: [rect.top, rect.top + rect.height],
          });
        }
      }

      this.array_items = [];
      this.drag_items = this.wrap.querySelectorAll('[data-drag-item]');
      if (this.drag_items) {
        for (let item of this.drag_items) {
          const rect = item.getBoundingClientRect();
          this.array_items.push({
            name: item.dataset.value,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            x: rect.x,
            y: rect.y,
            rangeX: [rect.left, rect.left + rect.width],
            rangeY: [rect.top, rect.top + rect.height],
          });
          this.reset_data.push(
            item.querySelector('[data-drag-object').dataset.dragObject
          );

					if (this.isRotate) {
						item.querySelector('[data-drag-object').dataset.rotate = 0;
						item.querySelector('[data-drag-object').insertAdjacentHTML('beforeend', `
							<span class="rotate" data-drag-rotate="right"><span class="a11y-hidden">우 회전</span></span>`);
					}

					console.log(item.querySelector('[data-drag-object]'));
        }
      }
 
    };
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.timer);
      // this.reset();
      this.timer = setTimeout(() => {
        set2();
      }, 0);
    });
    resizeObserver.observe(this.wrap);

  }
  //key
  actKey = e => {
    const el_this = e.currentTarget;
    const el_this_area = el_this.closest('[data-drag-target]');
    const el_wrap = el_this.closest('[data-drag-group]');
    const el_item = el_this.parentNode;
    const data_copy = el_this.dataset.dragCopy
      ? el_this.dataset.dragCopy
      : false;
    const data_name = el_this.dataset.dragObject;
    const isTarget =
      this.wrap.querySelectorAll('[data-drag-target]').length > 0
        ? true
        : false;
    const _targets = isTarget
      ? this.wrap.querySelectorAll('[data-drag-target]')
      : this.wrap.querySelectorAll('[data-drag-item]');

    const isClone = el_this.dataset.dragType;

    //space key
    if (e.keyCode === 32) {
      //셀렉트생성
      let make_menu = `<div role="menu">`;
      let n = 1;
      let m = 1;
      if (isClone) {
        make_menu += `<button type="button" tabindex="-1" role="menuitem" value="base" data-n="${m}">원위치</button>`;
        m = m + 1;
      }

      for (const item of _targets) {
        const _a = isTarget ? item.dataset.dragTarget : item.dataset.value;
        const _b = isTarget ? item.getAttribute('aria-label') : n;
        make_menu += `<button type="button" tabindex="-1" role="menuitem" value="${_a}" data-n="${m}">${_b}</button>`;
        n = n + 1;
        m = m + 1;
      }
      make_menu += `</div>`;
      el_item.insertAdjacentHTML('beforeend', make_menu);

      //이벤트
      const _menu = el_item.querySelector('[role="menu"]');
      const _menuItem = _menu.querySelectorAll('[role="menuitem"]');
      const len = _menuItem.length;

      //선택시
      
      const actSelect = e => {
        // _menu.removeEventListener('change', actSelect);
        const menuItem = e.currentTarget;
        const wrap = menuItem.parentNode;
        const el_clone = isClone ? el_this : el_this.cloneNode(true);
        const sel_val = menuItem.value;
        let objFocus;
        
        switch (e.key) {
          case 'Tab':
            if (_menu) _menu.remove();
            break;

          case 'ArrowDown':
          case 'ArrowRight':
            objFocus = menuItem.nextSibling;
            if (!objFocus) {
              objFocus = wrap.querySelector('[role="menuitem"]:nth-child(1)');
            }
            objFocus.focus();
            break;

          case 'ArrowUp':
          case 'ArrowLeft':
            objFocus = menuItem.previousSibling;
            if (!objFocus) {
              objFocus = wrap.querySelector(
                '[role="menuitem"]:nth-child(' + len + ')'
              );
            }
            objFocus.focus();
            break;

          case 'Enter':
            if (sel_val === 'base') {
              el_this.remove();
              el_this_area.dataset.empty = el_this_area.querySelectorAll('[data-drag-object]').length ? false : true;
              const obj = this.wrap.querySelector(
                `[data-drag-group="object"] [data-drag-object="${data_name}"]`
              );

              obj.classList.remove('disabled');
              obj.disabled = false;
              obj.focus();
              if (_menu) _menu.remove();
            } else {
              el_this_area.dataset.empty = true;
              let current_area;
              if (isTarget) {
                current_area = this.wrap.querySelector(
                  '[data-drag-target="' + sel_val + '"]'
                );
              } else {
                current_area = this.wrap.querySelector(
                  `[data-drag-item="object"][data-value="${sel_val}"]`
                );
              }

              //object를 복사타입으로 계속 사용안하는 경우 원본 disabled로 접근방지
              if (
                data_copy === false ||
                !data_copy ||
                !data_copy === 'false'
              ) {
                el_this.classList.add('disabled');
                el_this.disabled = true;
              }
              el_clone.dataset.dragType = 'clone';

              const limit = Number(current_area.dataset.limit);
              const current_area_drops =
                current_area.querySelectorAll('[data-drag-object]');
              const n = current_area_drops.length;

              //정답인 경우 복제된 아이템을 영역안으로 이동
              const act = () => {
                const _this = el_clone;
                // let is_answer = false;
console.log(current_area)
                //_this 영역안에 이동
                _this.dataset.dragState = 'complete';
                current_area.insertAdjacentElement('beforeend', _this);
                current_area.dataset.empty = false;
                _this.classList.remove('disabled');
                _this.removeAttribute('style');
                _this.disabled = false;
                _this.focus();

                //정답이 복수인 경우
                let is_name_array = data_name.split(',');
                for (let key in is_name_array) {
                  if (data_name === is_name_array[key]) {
                    // is_answer = true;
                    break;
                  }
                }

                // this.answer_last 설정
                this.answerLastSet();
              };

              /**
               * (limit === n) 제한된 답안 수와 같다면,
               * 제한이 1인경우는 이전 답과 교체, 2이상인 경우는 현재 선택한 값을 취소
               */

              if (isTarget) {
                if (limit === n) {
                  if (limit === 1) {
                    if (isClone) {
                      const _el_clone =
                        current_area.querySelector('[data-drag-object]');
                      el_this_area.insertAdjacentElement(
                        'beforeend',
                        _el_clone
                      );
                      act();
                    } else {
                      const __name =
                        current_area.querySelector('[data-drag-object]')
                          .dataset.dragObject;
                      current_area
                        .querySelector('[data-drag-object]')
                        .remove();
                      const __drop = el_wrap.querySelector(
                        '[data-drag-object="' + __name + '"]'
                      );

                      __drop.classList.remove('disabled');
                      __drop.disabled = false;
                      act();
                    }
                  } else {
                    el_this.classList.remove('disabled');
                    el_this.disabled = false;
                  }
                } else {
                  act();
                }
              } else {
                const native_item = this.wrap.querySelector(
                  '[data-drag-item="object"][data-value="' + sel_val + '"]'
                );
                const native_obj =
                  native_item.querySelector('[data-drag-object]');
                el_this.classList.remove('disabled');
                el_this.disabled = false;
                el_this.removeAttribute('data-acitve');
                el_this.removeAttribute('data-complete');
                el_item.insertAdjacentElement('beforeend', native_obj);
                native_item.insertAdjacentElement('beforeend', el_this);
              }

              /**
               * 복제된 object에 이벤트 재설정
               */
              if (isTarget) {
                const area_drops =
                  current_area.querySelectorAll('[data-drag-object]');
                for (let item of area_drops) {
                  if (this.isTouch) {
                    item.addEventListener('touchstart', this.actStartClone, {
                      passive: false,
                    });
                  } else {
                    item.addEventListener('mousedown', this.actStartClone);
                    if (this.a11y) item.addEventListener('keydown', this.actKey);
                  }
                }
              }

              if (data_name) {
                const _current_area = this.wrap.querySelector(
                  '[data-drag-target="' + data_name + '"]'
                );
                if (_current_area) {
                  const n_clone =
                    _current_area.querySelectorAll(
                      '[data-drag-object]'
                    ).length;
                  _current_area.dataset.empty = n_clone > 0 ? false : true;
                }
              }
              el_this.dataset.active = '';
              el_this.dataset.complete = true;
              el_this.focus();
              if (_menu) _menu.remove();
            }
            break;

          default:
            console.log('default');
            break;
        }
      };

      _menu.querySelector('[role="menuitem"]:nth-child(1)').focus();

      for (const item of _menuItem) {
        item.addEventListener('keydown', actSelect);
      }

      // _menu.addEventListener('focusout', actKeyout);
    }
  };

	actRotateStart = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = e.clientX ?? e.targetTouches[0].clientX;
    const y = e.clientY ?? e.targetTouches[0].clientY;

    let startAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
    startAngle = Math.round(startAngle); // 정수 변환
    let currentRotate = 0;

    const target = e.currentTarget;
    const rotateItem = target.querySelector('[data-drag-rotate="item"]');

    // 기존 회전값 가져오기
    const transform = rotateItem.style.transform.match(/rotate\((-?\d+)deg\)/);
    if (transform) {
        currentRotate = parseInt(transform[1], 10);
    }

    const actRotateMove = e => {
        const _x = e.clientX ?? e.targetTouches[0].clientX;
        const _y = e.clientY ?? e.targetTouches[0].clientY;

        // 현재 마우스 위치의 각도 계산
        let newAngle = Math.atan2(_y - centerY, _x - centerX) * (180 / Math.PI);
        newAngle = Math.round(newAngle); // 정수 변환

        // 각도 차이 계산
        let angleDiff = newAngle - startAngle;

        // 각도 차이 보정 (180도 이상 차이 나면 반대 방향으로 보정)
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;

        let newRotate = currentRotate + angleDiff;

        // 0~359도 범위 유지
        newRotate = (newRotate + 360) % 360;

        rotateItem.style.transform = `rotate(${newRotate}deg)`;
        currentRotate = newRotate;
        startAngle = newAngle;
				target.dataset.rotate = newRotate;
    };

    const actRotateEnd = () => {
			document.removeEventListener('mousemove', actRotateMove);
			document.removeEventListener('mouseup', actRotateEnd);
			document.removeEventListener('touchmove', actRotateMove);
			document.removeEventListener('touchend', actRotateEnd);
    };

    if (this.isTouch) {
			document.addEventListener('touchmove', actRotateMove, { passive: false });
			document.addEventListener('touchend', actRotateEnd);
    } else {
			document.addEventListener('mousemove', actRotateMove);
			document.addEventListener('mouseup', actRotateEnd);
    }	
	}

	actRotateR = e => {
		const _this = e.currentTarget;
		let n = Number(_this.dataset.rotate) + 1;
		n > 359 ? n = 0 : '';
		_this.dataset.rotate = n;
		_this.querySelector('[data-drag-rotate="item"]').style.transform = `rotate(${n}deg)`;

	}
	actRotateL = e => {
		const _this = e.currentTarget;
		let n = Number(_this.dataset.rotate) - 1;
		n < 0 ? n = 359 : '';
		_this.dataset.rotate = n;
		_this.querySelector('[data-drag-rotate="item"]').style.transform = `rotate(${n}deg)`;
	}

  //clone drag
  actStartClone = e => {
    e.preventDefault();
		const el_this = e.currentTarget;
		const el_rotate = e.target;

		if (el_rotate.dataset.dragRotate === 'right') {
			this.actRotateR(e);
			this.actRotateStart(e);
			return false;
		}
		if (el_rotate.dataset.dragRotate === 'left') {
			this.actRotateL(e);
			this.actRotateStart(e);
			return false;
		}
   
    const el_this_area = el_this.closest('[data-drag-target]');
    const el_wrap = el_this.closest('[data-drag-id]');
    const data_name = el_this.dataset.dragObject;
    const area_name = el_this_area.dataset.dragTarget;
    el_this.style.width = el_this.offsetWidth + 'px';
    //x,y 위치값
    const rect_this = el_this.getBoundingClientRect();
    const rect_area = el_this_area.getBoundingClientRect();
    this.win_y = this.el_scroll ? this.el_scroll.scrollTop : window.scrollY;
    this.win_x = this.el_scroll ? this.el_scroll.scrollLeft : window.scrollX;
    this.wrap_rect = this.wrap.getBoundingClientRect();
    this.wrap_t = this.wrap_rect.top + this.win_y;
    this.wrap_l = this.wrap_rect.left + this.win_x;
    let _x = !!e.clientX ? e.clientX : e.targetTouches[0].clientX;
    let _y = !!e.clientY ? e.clientY : e.targetTouches[0].clientY;
    let m_y = _y - rect_area.top - rect_this.height / 2;
    let m_x = _x - rect_area.left - rect_this.width / 2;

    //아이템설정
    el_this.removeAttribute('data-drag-state');
    el_this.classList.add('active');
    el_this.style.transform = 'translate(' + m_x + 'px, ' + m_y + 'px)';

    const actEnd = () => {
			console.log('endddddd');
      //최종위치
      const e_x = _x;
      const e_y = _y;

      let is_range;
      let is_name;

      el_this.classList.remove('active');
      // el_this.style.width = 'auto';
      /**
       * data-drag-target 정답 영역 안에 들어가는지 체크
       * is_range: true | false
       * is_name : data-drag-target
       * m_x,m_y
       */
      for (let i = 0, len = this.array_target.length; i < len; i++) {
        const is_x =
          this.array_target[i].rangeX[0] - this.win_x < e_x &&
          this.array_target[i].rangeX[1] - this.win_x > e_x;
        const is_y =
          this.array_target[i].rangeY[0] - this.win_y < e_y &&
          this.array_target[i].rangeY[1] - this.win_y > e_y;

        if (is_x && is_y) {
          is_range = true;
          is_name = this.array_target[i].name;
          break;
        } else {
          is_range = false;
        }
      }

      //정답인 경우
      if (is_range) {
        const current_area = el_wrap.querySelector(
          '[data-drag-target="' + is_name + '"]'
        );
        const limit = Number(current_area.dataset.limit);
        const current_area_drops =
          current_area.querySelectorAll('[data-drag-object]');
        const n = current_area_drops.length;

        //정답인 경우 복제된 아이템을 영역안으로 이동
        const act = () => {
          const _this = el_this;
          // let is_answer = false;

          //_this 영역안에 이동
          _this.dataset.dragState = 'complete';
          current_area.insertAdjacentElement('beforeend', _this);

          //정답이 복수인 경우
          let is_name_array = is_name.split(',');
          for (let key in is_name_array) {
            if (data_name === is_name_array[key]) {
              // is_answer = true;
              break;
            }
          }

          // this.answer_last 설정
          this.answerLastSet();
        };

        //영역이동 여부
        const areaStay = area_name === is_name;
        if (areaStay) {
          el_this.dataset.dragState = 'complete';
        } else {
          el_this.remove();
        }

        /**
         * (limit === n) 제한된 답안 수와 같다면,
         * 제한이 1인경우는 이전 답과 교체, 2이상인 경우는 현재 선택한 값을 취소
         */
        if (limit === n) {
          if (!areaStay) {
            if (limit === 1) {
              const _el_clone =
                current_area.querySelector('[data-drag-object]');
              el_this_area.insertAdjacentElement('beforeend', _el_clone);
              act();
            } else {
              el_wrap.querySelector(
                '.disabled[data-drag-object="' + data_name + '"]'
              ).disabled = false;
              el_wrap
                .querySelector(
                  '.disabled[data-drag-object="' + data_name + '"]'
                )
                .classList.remove('disabled');
            }
          }
        } else {
          act();
        }
        const nn_clone =
          current_area.querySelectorAll('[data-drag-object]').length;
        current_area.dataset.empty = nn_clone > 0 ? false : true;
      }
      //오답인 경우
      else {
        const _disabled_drop = el_wrap.querySelector(
          '.disabled[data-drag-object="' + el_this.dataset.dragObject + '"]'
        );

        //초기화
        el_this.remove();
        if (_disabled_drop) {
          _disabled_drop.disabled = false;
          _disabled_drop.classList.remove('disabled');
        }

        this.answerLastSet();
      }

      //영역안이 비어있는지 여부
      const n_clone =
        el_this_area.querySelectorAll('[data-drag-object]').length;
      el_this_area.dataset.empty = n_clone > 0 ? false : true;

      //이벤트 취소
      this.doc.removeEventListener('mousemove', actMove);
      this.doc.removeEventListener('mouseup', actEnd);
      this.doc.removeEventListener('touchmove', actMove);
      this.doc.removeEventListener('touchend', actEnd);
    };

    const actMove = e => {
      e.preventDefault();

      //move x,y
      _x = !!e.clientX ? e.clientX : e.targetTouches[0].clientX;
      _y = !!e.clientY ? e.clientY : e.targetTouches[0].clientY;
      m_x = _x - rect_area.left - rect_this.width / 2;
      m_y = _y - rect_area.top - rect_this.height / 2;

      const scope_s_y =
        rect_area.top + rect_this.height / 2 + m_y > this.wrap_rect.top;
      const scope_s_x =
        rect_area.left + rect_this.width / 2 + m_x > this.wrap_rect.left;
      const scope_e_y =
        rect_area.top + rect_this.height / 2 + m_y <
        this.wrap_rect.top + this.wrap_rect.height;
      const scope_e_x =
        rect_area.left + rect_this.width / 2 + m_x <
        this.wrap_rect.left + this.wrap_rect.width;

      if (scope_s_y && scope_s_x && scope_e_y && scope_e_x) {
        el_this.style.transform = 'translate(' + m_x + 'px, ' + m_y + 'px)';
      }
      // el_this.style.transform = 'translate(' + m_x + 'px, ' + m_y + 'px)';
    };

    //event
    if (this.isTouch) {
      this.doc.addEventListener('touchmove', actMove, { passive: false });
      this.doc.addEventListener('touchend', actEnd);
    } else {
      this.doc.addEventListener('mousemove', actMove);
      this.doc.addEventListener('mouseup', actEnd);
    }
  };

  actStart = e => {
    e.preventDefault();
		
		const el_rotate = e.target;
		console.log(el_rotate.dataset.dragRotate);

		if (el_rotate.dataset.dragRotate === 'true') {
			return false;
		}

    const el_this = e.currentTarget;
    const el_item = el_this.parentNode;
    const el_wrap = el_this.closest('[data-drag-group]');
    const data_name = el_this.dataset.dragObject;

    //x,y 위치값
    const rect_this = el_this.getBoundingClientRect();
    const rect_item = el_item.getBoundingClientRect();
    this.win_y = this.el_scroll ? this.el_scroll.scrollTop : window.scrollY;
    this.win_x = this.el_scroll ? this.el_scroll.scrollLeft : window.scrollX;
    this.wrap_rect = this.wrap.getBoundingClientRect();
    this.wrap_t = this.wrap_rect.top + this.win_y;
    this.wrap_l = this.wrap_rect.left + this.win_x;
    let _x = this.isTouch ? e.targetTouches[0].clientX : e.clientX;
    let _y = this.isTouch ? e.targetTouches[0].clientY : e.clientY;
    let m_y =
      _y + this.win_y - (rect_item.top + this.win_y) - rect_this.height / 2;
    let m_x =
      _x + this.win_x - (rect_item.left + this.win_x) - rect_this.width / 2;

    //복제설정
    const el_clone = el_this.cloneNode(true);
    el_clone.dataset.dragType = 'clone';
    el_clone.classList.add('active');
    el_clone.classList.remove('disabled');
    el_clone.disabled = false;
    el_item.insertAdjacentElement('beforeend', el_clone);
    el_clone.style.transform = `translate(${m_x}px, ${m_y}px)`;
    // el_clone.style.width = el_item.offsetWidth + 'px';
    // el_clone.style.marginLeft = el_item.offsetWidth / 2 - (el_clone.offsetWidth / 2) + 'px'
    //object를 복사타입으로 계속 사용 안하는 경우 원본 disabled로 접근방지
    const data_copy = el_this.dataset.dragCopy
      ? el_this.dataset.dragCopy
      : false;
    if (data_copy === false || !data_copy || !data_copy === 'false') {
      el_this.classList.add('disabled');
      el_this.disabled = true;
    }

    const actEnd = () => {
      //최종위치
      const e_x = m_x + rect_item.left + this.win_x + rect_this.width / 2;
      const e_y = m_y + rect_item.top + this.win_y + rect_this.height / 2;

      let is_range;
      let is_range_obj;
      let is_name;

      el_clone.classList.remove('active');
      // el_clone.style.width = 'auto';
      /**
       * data-drag-target 정답 영역 안에 들어가는지 체크
       * is_range: true | false
       * is_name : data-drag-target
       */
      const innerScroll = document.querySelector('.innerContsScroll');
      const st = innerScroll ? innerScroll.scrollTop : document.querySelector('html').scrollTop;

      for (let i = 0, len = this.array_target.length; i < len; i++) {
        const is_x =
          this.array_target[i].rangeX[0] < e_x &&
          this.array_target[i].rangeX[1] > e_x;
        const is_y =
          this.array_target[i].rangeY[0] < e_y + st &&
          this.array_target[i].rangeY[1] > e_y + st;

        if (is_x && is_y) {
          is_range = true;
          is_name = this.array_target[i].name;
          break;
        } else {
          is_range = false;
        }
      }

      //정답인 경우
      if (is_range) {
        const current_area = this.wrap.querySelector(
          '[data-drag-target="' + is_name + '"]'
        );
        const limit = Number(current_area.dataset.limit);
        const current_area_drops =
          current_area.querySelectorAll('[data-drag-object]');
        const n = current_area_drops.length;

        //정답인 경우 복제된 아이템을 영역안으로 이동
        const act = () => {
          const _this = el_clone;
          // let is_answer = false;

          //_this 영역안에 이동
          _this.dataset.dragState = 'complete';
          current_area.insertAdjacentElement('beforeend', _this);

          //정답이 복수인 경우
          let is_name_array = is_name.split(',');
          for (let key in is_name_array) {
            if (data_name === is_name_array[key]) {
              // is_answer = true;
              break;
            }
          }

          //영역안에 들어온 위치값. free모드일때 필요
          const translate_left =
            e_x -
            current_area.getBoundingClientRect().left -
            this.win_x -
            _this.getBoundingClientRect().width / 2;
          const translate_top =
            e_y -
            current_area.getBoundingClientRect().top -
            this.win_y -
            _this.getBoundingClientRect().height / 2;
          _this.style.transform = `translate(${translate_left}px, ${translate_top}px)`;

          // this.answer_last 설정
          this.answerLastSet();
        };

        /**
         * (limit === n) 제한된 답안 수와 같다면,
         * 제한이 1인경우는 이전 답과 교체, 2이상인 경우는 현재 선택한 값을 취소
         */
        if (limit === n) {
          if (limit === 1) {
            const __name =
              current_area.querySelector('[data-drag-object]').dataset
                .dragObject;
            current_area.querySelector('[data-drag-object]').remove();
            const __drop = el_wrap.querySelector(
              '[data-drag-object="' + __name + '"]'
            );
            __drop.classList.remove('disabled');
            __drop.disabled = false;
            act();
          } else {
            el_clone.remove();
            el_this.classList.remove('disabled');
            el_this.disabled = false;
          }
        } else {
          act();
        }

        /**
         * 복제된 object에 이벤트 재설정
         */
        const area_drops =
          current_area.querySelectorAll('[data-drag-object]');
        for (let item of area_drops) {
          if (this.isTouch) {
            item.addEventListener('touchstart', this.actStartClone, {
              passive: false,
            });
          } else {
            item.addEventListener('mousedown', this.actStartClone);
            if (this.a11y) item.addEventListener('keydown', this.actKey);
          }
        }
      }
      //오답인 경우
      else {
        //무한복사가 아닌 경우
        if (el_this.dataset.copy !== 'true') {
          /**
           * data-drag-item 영역 안에 들어가는지 체크
           * is_range_obj: true | false
           * is_name : data-drag-target
           */
          for (let i = 0, len = this.array_items.length; i < len; i++) {
            const is_x =
              this.array_items[i].rangeX[0] < e_x &&
              this.array_items[i].rangeX[1] > e_x;
            const is_y =
              this.array_items[i].rangeY[0] < e_y &&
              this.array_items[i].rangeY[1] > e_y;

            if (is_x && is_y) {
              is_range_obj = true;
              is_name = this.array_items[i].name;
              break;
            } else {
              is_range_obj = false;
            }
          }

          //data-drag-item 위치 교환
          if (is_range_obj) {
            const native_item = this.wrap.querySelector(
              '[data-drag-item="object"][data-value="' + is_name + '"]'
            );
            const native_obj =
              native_item.querySelector('[data-drag-object]');
            el_item.insertAdjacentElement('beforeend', native_obj);
            native_item.insertAdjacentElement('beforeend', el_this);
          }
        }

        //초기화
        el_clone.remove();
        el_this.classList.remove('disabled');
        el_this.disabled = false;

        this.answerLastSet();
      }

      //영역안이 비어있는지 여부
      if (is_name) {
        const _current_area = this.wrap.querySelector(
          '[data-drag-target="' + is_name + '"]'
        );
        if (_current_area) {
          const n_clone =
            _current_area.querySelectorAll('[data-drag-object]').length;
          _current_area.dataset.empty = n_clone > 0 ? false : true;
        }
      }

      //이벤트 취소
      this.doc.removeEventListener('mousemove', actMove);
      this.doc.removeEventListener('mouseup', actEnd);
      this.doc.removeEventListener('touchmove', actMove);
      this.doc.removeEventListener('touchend', actEnd);
    };

    const actMove = e => {
      e.preventDefault();
      //move x,y
      _x = !!e.clientX ? e.clientX : e.targetTouches[0].clientX;
      _y = !!e.clientY ? e.clientY : e.targetTouches[0].clientY;
      m_y =
        _y + this.win_y - (rect_item.top + this.win_y) - rect_this.height / 2;
      m_x =
        _x + this.win_x - (rect_item.left + this.win_x) - rect_this.width / 2;
      const scope_s_y =
        rect_this.top + rect_this.height / 2 + m_y > this.wrap_rect.top;
      const scope_s_x =
        rect_this.left + rect_this.width / 2 + m_x > this.wrap_rect.left;
      const scope_e_y =
        rect_this.top + rect_this.height / 2 + m_y <
        this.wrap_rect.top + this.wrap_rect.height;
      const scope_e_x =
        rect_this.left + rect_this.width / 2 + m_x <
        this.wrap_rect.left + this.wrap_rect.width;

      if (scope_s_y && scope_s_x && scope_e_y && scope_e_x) {
        el_clone.style.transform = 'translate(' + m_x + 'px, ' + m_y + 'px)';
      }
    };

    //event
    if (this.isTouch) {
      this.doc.addEventListener('touchmove', actMove, { passive: false });
      this.doc.addEventListener('touchend', actEnd);
    } else {
      this.doc.addEventListener('mousemove', actMove);
      this.doc.addEventListener('mouseup', actEnd);
    }
  }

  //콜백: 정답체크 및 기록
  answerLastSet() {
    this.answer_last = [];
    let n = 0;
    const isTarget = this.drag_targets.length;
    const area = isTarget
      ? this.drag_targets
      : this.wrap.querySelectorAll('[data-drag-item="object"]');

    const completeItems = this.wrap.querySelectorAll(
      '[data-drag-state="complete"]'
    );
    const completeLength = completeItems.length;

    for (let i = 0; i < area.length; i++) {
      const trg_n = isTarget
        ? area[i].dataset.dragTarget
        : area[i].dataset.value;
      const items = area[i].querySelectorAll('[data-drag-object]');

      let is_name_array = trg_n.split(',');

      if (items) {
        // let nn = 0;
        for (const item of items) {
          // let isAnswer = false;
          for (let key in is_name_array) {
            if (item.dataset.dragObject === is_name_array[key]) {
              // isAnswer = true;
              n = n + 1;
              break;
            }
          }
          this.answer_last.push({
            target: trg_n,
            object: item.dataset.dragObject,
          });

          // n = isAnswer ? n + 1 : n;
        }
      }
    }
    this.answer_state =
      this.answer_len === n && completeLength === this.answer_len
        ? true
        : false;

    //완료콜백
    if (this.callback) {
      this.callback({
        answer_last: this.answer_last,
        answer_state: this.answer_state,
      });
    }
  }

  //문제초기화
  reset() {
    const clones = this.wrap.querySelectorAll('[data-drag-type="clone"]');

    if (clones) {
      for (let item of clones) {
        item.remove();
      }
    }

    for (let item of this.drag_targets) {
      item.innerHTML = '';
      item.removeAttribute('data-state');
      item.dataset.empty = 'true';
    }

    for (let item of this.drag_objects) {
      const wrap = this.wrap.querySelector(
        '[data-drag-item="object"][data-base="' + item.dataset.dragObject + '"]'
      );
      wrap.insertAdjacentElement('beforeend', item);
      item.classList.remove('disabled');
      item.disabled = false;
    }
    this.wrap.removeAttribute('data-state');
    this.answerLastSet();
  }
  check() {
    let answer_n = 0;
    let answer_total = 0;

    if (this.drag_targets.length > 0) {
      for (let i = 0; i < this.drag_targets.length; i++) {
        const answer = this.drag_targets[i].dataset.dragTarget;
        const objs =
          this.drag_targets[i].querySelectorAll('[data-drag-object]');
        let objs_array = [];

        for (let item of objs) {
          objs_array.push(item.dataset.dragObject);
        }

        let answer_array = answer.split(',');

        for (let key in answer_array) {
          if (objs_array[key] === answer_array[key]) {
            answer_n = answer_n + 1;
          }
          answer_total = answer_total + 1;
        }
      }
    } else {
      for (let i = 0; i < this.drag_items.length; i++) {
        const value = this.drag_items[i].dataset.value;
        const _object = this.drag_items[i].querySelector('[data-drag-object]');
        if (value === _object.dataset.dragObject) {
          answer_n = answer_n + 1;
        }
        answer_total = answer_total + 1;
      }
    }
    if (this.callbackComplete) {
      this.callbackComplete({
        answer_total: answer_total,
        answer_n: answer_n,
        state: answer_n === answer_total ? true : false,
        percent: (answer_n / answer_total) * 100,
      });
    }
  }

  //정답확인
  complete() {
    this.reset();

    if (this.drag_targets.length > 0) {
      for (let item of this.drag_targets) {
        const name = item.dataset.dragTarget;
        let el_object;

        let is_name_array = name.split(',');
        for (let key in is_name_array) {
          el_object = this.wrap.querySelector(
            '[data-drag-object="' + is_name_array[key] + '"]'
          );

          const el_clone = el_object.cloneNode(true);

          el_object.classList.add('disabled');
          el_object.disabled = true;

          this.wrap.dataset.state = 'complete';
          el_clone.dataset.dragState = 'complete';
          item.insertAdjacentElement('beforeend', el_clone);
          item.dataset.empty = false;
        }
      }
    } else {
      for (let item of this.drag_items) {
        const name = item.dataset.value;
        const _object = this.wrap.querySelector(
          '[data-drag-object="' + name + '"'
        );
        item.insertAdjacentElement('beforeend', _object);
        _object.dataset.dragState = 'complete';
      }
      this.wrap.dataset.state = 'complete';
    }
  }
  drawLastAnswer = () => {
    for (let i = 0; i < this.answer_last.length; i++) {
      const last = this.answer_last[i];

      console.log('last', last)

      let target = this.wrap.querySelector(
        `[data-drag-target="${last.target}"]`
      );

      const object = this.wrap.querySelector(
        `[data-drag-object="${last.object}"]`
      );
      const el_clone = object.cloneNode(true);
      if (!target) {
        
        target = this.wrap.querySelector(
          `[data-drag-item="object"][data-value="${last.target}"]`
        );
        object.disabled = false;
        target.dataset.empty = false;
        target.insertAdjacentElement('beforeend', object);
      } else {
        el_clone.dataset.dragType = 'clone';
        el_clone.dataset.dragState = 'complete';
        el_clone.disabled = false;
        target.dataset.empty = false;
        object.classList.add('disabled');
        object.disabled = true;
        target.insertAdjacentElement('beforeend', el_clone);
        target.innerHtml = el_clone;
      }
    }
  };
}

export class CrosscolorPuzzle {
  constructor(opt) {
    this.wrap = document.querySelector(`.crosscolor-puzzle[data-id=${opt.id}]`);
    this.colorBtns = this.wrap.querySelectorAll(`.crosscolor-puzzle--color`);
    this.item = this.wrap.querySelector(`.crosscolor-puzzle--item`);
    this.answer = opt.answer;
    this.color = null;
    this.currentAnswer = [];
    this.init();
  }

  init() {
    let htmlPuzzle = ``;
    this.answer.forEach((item, index) => {
      const n = index + 1;
      const currentAnswerRow = [];
      htmlPuzzle += `<div class="crosscolor-puzzle--item-tr" data-row="${n}">`;
      
      for (let i = 0; i < item.length; i++) {
        let _value = item[i].split(',');
        htmlPuzzle += `<button type="button" class="crosscolor-puzzle--item-td" aria-label="${n}열 ${i + 1}행" data-col="${n}" data-row="${i + 1}" data-group="${_value[0]}">
          ${_value[1] ? _value[1] : ''}
        </button>`;
        currentAnswerRow.push('');
      }

      this.currentAnswer.push(currentAnswerRow);
      htmlPuzzle += `</div>`;
    });
    this.item.innerHTML = htmlPuzzle;
    this.tdBtns = this.wrap.querySelectorAll(`.crosscolor-puzzle--item-td`);
    this.event();
    console.log(this.currentAnswer);
  }
  event() {
    this.colorBtns.forEach(item => {
      item.addEventListener('click', this.actColorSelect.bind(this));
    });
    this.tdBtns.forEach(item => {
      item.addEventListener('click', this.actTdSelect.bind(this));
    });
  }
  actColorSelect (e) {
    const _this = e.currentTarget;
    const _thisSelected = this.wrap.querySelector(`.crosscolor-puzzle--color[data-selected="true"]`);

    if (_thisSelected) _thisSelected.dataset.selected = false;
    _this.dataset.selected = true;
    this.color = _this.dataset.color;
  }
  actTdSelect(e) {
    if (this.color === null) {
      alert('색상을 선택해주세요')
      return false;
    }

    const _this = e.currentTarget;
    _this.dataset.selected = _this.dataset.selected ? true : false;
    const a = Number(_this.dataset.row) - 1;

    if (_this.dataset.color === this.color) {
      _this.dataset.color = '';
      this.currentAnswer[Number(_this.dataset.col) - 1].splice(a, 1, '');
    } else {
      _this.dataset.color = this.color;
      this.currentAnswer[Number(_this.dataset.col) - 1].splice(a, 1, this.color);
    }
    console.log(this.currentAnswer);
  }
}

export class CrosswordPuzzle {
  constructor(opt) {
    this.wrap = document.querySelector(`.crossword-puzzle[data-id=${opt.id}]`);
    this.item = this.wrap.querySelector(`.crossword-puzzle--item`);
    this.size = opt.size;
    this.answer = opt.answer;

    this.init()
  }
  init() {
    let htmlPuzzle = ``;

    // 퍼즐판 만들기
    for (let i = 0; i < this.size[0]; i++) {
      const n = i + 1;
      htmlPuzzle += `<div class="crossword-puzzle--item-tr" data-row="${n}">`;

      for (let j = 0; j < this.size[1]; j++) {
        htmlPuzzle += `<div class="crossword-puzzle--item-td" data-col="${n}" data-row="${j + 1}"><div class="text"></div></div>`;
      }

      htmlPuzzle += `</div>`;
    }
    this.item.innerHTML = htmlPuzzle;
    this.tds = this.wrap.querySelectorAll('.crossword-puzzle--item-td');

    // 입력모달 및 퍼즐버튼 및 단어칸
    let modalHtml = ``;
    let inputWord = ``;
    this.answer.forEach(item => {
      const _this = document.querySelector(`.crossword-puzzle--item-td[data-col="${item.ps[0]}"][data-row="${item.ps[1]}"]`);

      let html = `<button type="button" class="crossword-puzzle--btn" data-n="${item.number}"><em>${item.number}</em></button>`;

      _this.dataset.on = 'true';
      _this.insertAdjacentHTML('beforeend',html);

      modalHtml += `<section class="ui-modal word" id="modal_${item.number}">
        <div class="ui-modal-wrap">
          <div class="ui-modal-header">
            <button type="button" class="ui-modal-close" aria-label="close"><span class="for-a11y">close</span></button>
          </div>
          <div class="ui-modal-body">`;

        item.quiz.forEach((qz) => {
          modalHtml += `<div class="word-quiz">`;

          if (qz.type === 'row') {
            modalHtml += `<h2>(가로) ${qz.question}</h2>
            <div class="word-quiz-wrap">`;
            
            for (let i = 0; i < qz.word.length; i++) {
              document.querySelector(`.crossword-puzzle--item-td[data-col="${item.ps[0]}"][data-row="${Number(item.ps[1]) + i}"]`).dataset.on = 'true';
    
              modalHtml += `<input type="text" maxlength="1" data-col="${item.ps[0]}" data-row="${Number(item.ps[1]) + i}">`;   
            }
          } else {
            modalHtml += `<h2>(세로) ${qz.question}</h2>
             <div class="word-quiz-wrap">`;

            for (let i = 0; i < qz.word.length; i++) {
              document.querySelector(`.crossword-puzzle--item-td[data-col="${Number(item.ps[0]) + i}"][data-row="${item.ps[1]}"]`).dataset.on = 'true';
    
              modalHtml += `<input type="text" maxlength="1" data-col="${Number(item.ps[0]) + i}" data-row="${item.ps[1]}">`;   
            }
          }
          modalHtml += `</div>
          </div>`;
        });
        
      modalHtml += `</div>
          <div class="ui-modal-footer">
            <button type="button" class="btn-base" data-color="primary" data-crossword="input">
              <span>확인</span>
            </button>
          </div>
        </div>
      </section>`;
      inputWord = '';
    });
    document.querySelector('.area-modal').innerHTML = modalHtml;

    // 낱말입력
    const crosswordInput = document.querySelectorAll('[data-crossword="input"]');
    const actWordInput = e => {
      const _this = e.currentTarget; 
      const modal = _this.closest('.ui-modal');
      const inputs = modal.querySelectorAll('.ui-modal-body input');

     


      inputs.forEach(item => {
        const inp = modal.querySelectorAll(`input[data-col="${item.dataset.col}"][data-row="${item.dataset.row}"]`);

        if (inp.length === 2) {
          inp[0].value ? inp[1].value = inp[0].value : '';
        }

        document.querySelector(`.crossword-puzzle--item-td[data-col="${item.dataset.col}"][data-row="${item.dataset.row}"] .text`).innerHTML = item.value;
      });

      QuizGame.modal.hide({
        id: modal.id
      });
    }
    crosswordInput.forEach(item => {
      item.addEventListener('click', actWordInput)
    });

    const btns = document.querySelectorAll('.crossword-puzzle--btn');
    const act = e => {
      const _this = e.currentTarget;
      QuizGame.modal.show({ 
        id: 'modal_' + _this.dataset.n, 
        ps: 'center', 
        callback: (v) => { 
          const inps = document.querySelectorAll(`.ui-modal#${v} .word-quiz-wrap input`);
          inps.forEach(item => {
            const text = document.querySelector(`.crossword-puzzle--item-td[data-col="${item.dataset.col}"][data-row="${ item.dataset.row}"] .text`).textContent;
            item.value = text;
          });
        }
      });
    }

    btns.forEach(item => {
      item.addEventListener('click', act)
    });

    
  }

}