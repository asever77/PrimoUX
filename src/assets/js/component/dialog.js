export default class Dialog {
  constructor(opt) {
		const defaults = {
			type: 'modal', //'modal', 'system'
			ps: 'center', // 'center', 'top', 'bottom', 'left', 'right'
      src: null,
      classname: '',
			area: document.querySelector('.area-dialog'),

      move: true,
			dim: true,
      extend: false,
      loadCallback: null,
			focus_back: null,
      title: null,
      message: '',
      confirmText: '',
      cancelText: '',
      confirmCallback: null,
      cancelCallback: null, 
		};

		this.option = { ...defaults, ...opt };
		this.dialog = null;
    this.extend = this.option.extend;
		this.area = this.option.area;
		this.move = this.option.ps !== 'center' ? false : this.option.move;
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    this.initialize();
	}

  initialize() {
    //dialog type : modal, system
    switch(this.option.type) {
      case 'modal': 
        this.initDialog(); 
        break;
      case 'system': 
        this.initSystem(); 
        break;
      default:
        console.warn('Unknown modal type:', this.option.type);
    }
  }

  initSystem() {
    let htmlSystem = `
    <div class="ui-dialog" 
    data-dialog="${this.option.id}" 
    aria-labelledby="${this.option.id}-label"
    role="alertdialog" 
    aria-live="polite">
      <div class="ui-dialog--wrap" role="document" tabindex="-1" data-dialog-item="wrap">
        ${this.option.title ? '<div class="ui-dialog--header"><h2 id="' + this.option.id + '-label">' + this.option.title + '</h2></div>' : ''}
        <div class="ui-dialog--main" data-dialog-item="main">
          ${this.option.message}
        </div>
        <div class="ui-dialog--footer">
          ${this.option.cancelText ? '<button type="button" data-dialog-button="cancel">'+ this.option.cancelText +'</button>' : ''}
          ${this.option.confirmText ? '<button type="button" data-dialog-button="confirm">'+ this.option.confirmText +'</button>' : ''}
        </div>
      </div>
    </div>`;

    this.area.insertAdjacentHTML('beforeend', htmlSystem);
    this.buildDialog();
  }

	initDialog() {
		if (this.option.src && !this.dialog) {
			PrimoUX.utils.loadContent({
				area: this.area,
				src: this.option.src,
				insert: true,
				callback: () => {
          console.log('callback');
        },
			})
			.then(() => this.buildDialog())
			.catch(err => console.error('Error loading modal content:', err));
		} else {
      this.buildDialog();
    }
	}

  buildDialog() {
    console.log('buildDialog:', this.option.id);
    this.dialog = document.querySelector(`[data-dialog="${this.option.id}"]`);
    if (!this.dialog) {
      console.error('Modal element not found');
      return;
    }
    
    this.dialog.dataset.ps = this.option.ps;
    this.dialog.dataset.drag = this.option.drag;
    this.dialogWrap = this.dialog.querySelector('[data-dialog-item="wrap"]');
    this.dialogMain = this.dialog.querySelector('[data-dialog-item="main"]');

    //dim
    (this.option.dim) && this.dialog.insertAdjacentHTML('beforeend', '<div class="dim"></div>');
    //extend
    (this.extend) && this.dialogWrap.insertAdjacentHTML('afterbegin', '<div data-dialog-item="extend"></div>');

    this.setFocusableElements();
    this.addEventListeners();
    // (this.option.drag) && this.dragEvent();

    //load callback
    this.option.loadCallback && this.option.loadCallback();
  }

  setFocusableElements() {
    //first last tag
    const focusableSelectors = 'button, a, input, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = this.dialog.querySelectorAll(focusableSelectors);
    this.btn_first = focusableElements[0];
    this.btn_last = focusableElements[focusableElements.length - 1];
  }

  dragEvent() {
    console.log('drag')
    const isTouch = true;
    let isDragState = false;
    const dragStart = (e) => {
      const el_this = e.currentTarget;
      const y = isTouch ? e.targetTouches[0].clientY : e.clientY;
      const x = isTouch ? e.targetTouches[0].clientX : e.clientX;
      const rect = this.dialogWrap.getBoundingClientRect();
      const h = rect.height;
      let isMove = false;
      let y_m;
      let x_m;
      const dragMove = (e) => {
          y_m = isTouch ? e.targetTouches[0].clientY : e.clientY;
          x_m = isTouch ? e.targetTouches[0].clientX : e.clientX;
        if (isDragState) {
          if (Math.abs(y - y_m) > 10 && Math.abs(x - x_m) < Math.abs(y - y_m) && (y - y_m) < 0) {
            this.dialogWrap.setAttribute(
              'style',
              `max-height: ${(h + (y - y_m)) / 10}rem !important; height: ${(h + (y - y_m)) / 10}rem !important;`
            );
            isMove = true;
          } else {
            isMove = false;
          }
        } else {
          if (Math.abs(y - y_m) > 10 && Math.abs(x - x_m) < Math.abs(y - y_m) && (y - y_m) > 0) {
            this.dialogWrap.setAttribute(
              'style',
              `max-height: ${(h + (y - y_m)) / 10}rem !important; height: ${(h + (y - y_m)) / 10}rem !important;`
            );
            isMove = true;
          } else {
            this.dialogWrap.setAttribute(
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
          const _t = this.dialogMain.scrollTop;
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
              this.dialogWrap.removeEventListener('touchstart', reDrag);
              this.dialogWrap.addEventListener('touchstart', dragStart);
            } else {
              this.dialogWrap.addEventListener('touchstart', reDrag);
            }
          }
          document.addEventListener('touchmove', reDragMove, { passive: false });
          document.addEventListener('touchend', reDragEnd);
        }
        const restoration = () => {
          this.dialog.dataset.state = '';
          this.dialogWrap.setAttribute(
            'style',
            `max-height: 32rem !important; overflow-y: hidden !important;`
          );
          this.dialogWrap.addEventListener('touchstart', dragStart);
          isDragState = false;
        }
        const reDragClose = (e) => {
          restoration();
          this.dialogWrap.removeEventListener('touchstart', reDrag);
        }
        //성공 확장
        if (y - 30 > y_m && isMove) {
          this.dialog.dataset.state = 'drag-full';
          this.dialogWrap.classList.add('motion');
          const dragCloseBtn = this.dialog.querySelector('[data-dialog-drag="close"]');
          isDragState = true;
          dragCloseBtn && dragCloseBtn.addEventListener('click', reDragClose);
          this.dialogWrap.setAttribute(
            'style', 'max-height:100dvh !important; overflow-y: hidden !important; height: 100dvh !important;'
          );
          this.dialogWrap.addEventListener('transitionend', () => {
            this.dialogWrap.classList.remove('motion');
            let _list = this.dialogMain.querySelector('.search-result-list');
            !_list ? _list = this.dialog.querySelector('[data-dialog-scroll]') : '';

            const hasScroll = _list.scrollHeight > _list.clientHeight;

            if (hasScroll) {
              this.dialogWrap.removeEventListener('touchstart', dragStart);
              this.dialogWrap.addEventListener('touchstart', reDrag);
            }
          });
        } 
        //성공 원복
        else if(y_m - y > 30) {
          if (this.dialog.dataset.state === 'drag-full') {
            if (y_m - y < (h / 3) * 2) {
              restoration();
            } else {
              this.dialogWrap.removeEventListener('touchstart', dragStart);
              this.option.hide();
            }
          } else {
            this.dialogWrap.removeEventListener('touchstart', dragStart);
            this.option.hide();
          }
        } 
        //취소 풀원복
        else if (isDragState) {
          this.dialogWrap.setAttribute(
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
    console.log('dragEvent?')
    this.dialogWrap.removeEventListener('touchstart', dragStart);
    this.dialogWrap.addEventListener('touchstart', dragStart);
  }

  addEventListeners() {
    //event 
    this.dialog_btns = this.dialog.querySelectorAll('[data-dialog-button]');
    if (this.dialog_btns) {
      this.dialog_btns.forEach(btn => {
        btn.addEventListener('click', this.handleModalButtonClick);
      });
    }
  }

  handleModalButtonClick = (e) => {
    const action = e.target.dataset.dialogButton;
    console.log(action)
    switch(action) {
      case 'close': 
        this.hide(); 
        break;
      case 'confirm': 
        this.option.confirmCallback && this.option.confirmCallback(); 
        break;
      case 'cancel': 
        this.option.cancelCallback && this.option.cancelCallback();
        break;
    }
  }

  zIndexUp() {
    //최상위로 올리기
    const openModals = document.querySelectorAll('[data-dialog][aria-hidden="false"]');
    const zIndex = openModals.length;
    const thisZindex = Number(this.dialog.dataset.zindex);

    for (let i = thisZindex; i < zIndex; i++) {
      const item = document.querySelector(`[data-dialog][aria-hidden="false"][data-zindex="${i + 1}"]`);
      if (item) {
        item.dataset.zindex = i;
        item.dataset.current = 'false';
      }
    }

    this.dialog.dataset.zindex = zIndex;
    this.dialog.dataset.current = 'true';
    this.dialog.focus();
  }

  moveStart(e) {
		const el_this = e.currentTarget;
    const isTouchEvent = e.type.startsWith('touch');
    const eventMove = isTouchEvent ? 'touchmove' : 'mousemove';
    const eventEnd = isTouchEvent ? 'touchend' : 'mouseup';
    const y = isTouchEvent ? e.targetTouches[0].clientY : e.clientY;
    const x = isTouchEvent ? e.targetTouches[0].clientX : e.clientX;
    let y_m;
    let x_m;
    let style = el_this.style.margin;
    style = style ? style : '0 0 0 0';

    const marginValues = style.split(" ");
    let marginTop = parseFloat(marginValues[0]);
    let marginLeft = parseFloat(marginValues[3]);

    const dragMove = (e) => {
      y_m = isTouchEvent ? e.targetTouches[0].clientY : e.clientY;
      x_m = isTouchEvent ? e.targetTouches[0].clientX : e.clientX;
      el_this.style.margin = `${marginTop + ((y - y_m) / 5 * -1)}rem 0 0 ${marginLeft + ((x - x_m) / 5 * -1)}rem`;
    }
    const dragEnd = () => {
      document.removeEventListener(eventMove, dragMove);
      document.removeEventListener(eventEnd, dragEnd);
    }
   
    document.addEventListener(eventMove, dragMove, { passive: false });
    document.addEventListener(eventEnd, dragEnd);
	}
	show() {
		this.option.focus_back = document.activeElement;
		this.dialog.setAttribute('aria-hidden', 'false');
    // this.dialogWrap.removeAttribute('style');
		this.dialogWrap.focus();
		this.dialog.dataset.state = "show";

    const openModals = document.querySelectorAll('[data-dialog][aria-hidden="false"]');
    const zIndex = openModals.length;
    const currentModal = document.querySelector('[data-dialog][aria-hidden="false"][data-current="true"]');
    if (currentModal) currentModal.dataset.current = "false";
    this.dialog.dataset.zindex = zIndex;
    this.dialog.dataset.current = 'true';
    // (this.option.drag) && this.dragEvent();
    
    //loop focus
		this.btn_first.addEventListener('keydown', this.keyStart.bind(this));	
		this.btn_last.addEventListener('keydown', this.keyEnd.bind(this));
    if (this.move) {
      this.dialogWrap.removeEventListener('touchstart', this.moveStart, {passive:true});
      this.dialogWrap.removeEventListener('mousedown', this.moveStart);
      this.dialogWrap.addEventListener('touchstart', this.moveStart);
      this.dialogWrap.addEventListener('mousedown', this.moveStart);
    }
	}
	hide(opt) {
    //loop focus 중복방지 이벤트 취소
		this.btn_first.removeEventListener('keydown', this.keyStart);	
		this.btn_last.removeEventListener('keydown', this.keyEnd);	

    const n = Number(this.dialog.dataset.zindex);
    //닫히는 현재 모달 초기화
		if (opt && opt.focus_target) this.option.focus_back = opt.focus_target;
		this.dialog.dataset.state = "hide";
    this.dialog.dataset.current = "false";
    this.dialog.dataset.zindex = "";
		this.option.focus_back.focus();
		this.dialog.setAttribute('aria-hidden', 'true');

    //열린 모달 재설정
    const openModals = document.querySelectorAll('[data-dialog][aria-hidden="false"]');
    const zIndex = openModals.length;

    for (let i = n; i <= zIndex; i++) {
      const item = document.querySelector(`[data-dialog][aria-hidden="false"][data-zindex="${i + 1}"]`);
      if (item) {
        item.dataset.zindex = i;
        item.dataset.current = 'false';
      }
    }
    //다음선택 모달 설정
    const currentModal = document.querySelector(`[data-dialog][aria-hidden="false"][data-zindex="${zIndex}"]`);
    if(currentModal) { 
      currentModal.dataset.current = 'true';
      currentModal.focus();     
    }
	}

	keyStart = (e) => {
    console.log('keystart');
		if (e.shiftKey && e.key === 'Tab') {
			e.preventDefault();
			this.btn_last.focus();
		}
	}
	keyEnd = (e) => {
    console.log('keyEnd');
		if (!e.shiftKey && e.key === 'Tab') {
			e.preventDefault();
			this.btn_first.focus();
		}
	}
}