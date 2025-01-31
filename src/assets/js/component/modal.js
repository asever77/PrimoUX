export default class Modal {
  constructor(opt) {
		const defaults = {
			type: 'modal', //'modal', 'system'
			classname: '',
			ps: 'center', // 'center', 'top', 'bottom', 'left', 'right'
			area: document.querySelector('.area-modal'),
			dim: true,
			focus_back: null,
      drag: false,
      message: '',
      confirmText: '',
      cancelText: '',
      confirmCallback: null,
      cancelCallback: null, 
		};

		this.option = { ...defaults, ...opt };
		this.modal = null;
		this.area = this.option.area;

    this.initialize();
	}

  initialize() {
    switch(this.option.type) {
      case 'modal': 
        this.initModal(); 
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
    <div class="project-modal" data-modal="${this.option.id}" role="alertdialog" aria-modal="true" aria-live="polite" tabindex="0">
      <div class="project-modal--item">
        <div class="project-modal--body">
          ${this.option.message}
        </div>
        <div class="project-modal--footer">
          ${this.option.cancelText ? '<button type="button" data-modal-btn="cancel">'+ this.option.cancelText +'</button>' : ''}
          ${this.option.confirmText ? '<button type="button" data-modal-btn="confirm">'+ this.option.confirmText +'</button>' : ''}
        </div>
      </div>
    </div>`;

    this.area.insertAdjacentHTML('beforeend', htmlSystem);
    this.buildModal();
  }

	initModal() {
		if (this.option.src && !this.modal) {
			PrimoUX.utils.loadContent({
				area: this.area,
				src: this.option.src,
				insert: true,
				callback: () => {},
			})
			.then(() => this.buildModal())
			.catch(err => console.error('Error loading modal content:', err));
		} else {
      this.buildModal();
    }
	}

  buildModal() {
    this.modal = document.querySelector(`[data-modal="${this.option.id}"]`);
    if (!this.modal) {
      console.error('Modal element not found');
      return;
    }
    
    this.modal.setAttribute('tabindex', '0');
    this.modal.dataset.ps = this.option.ps;
    this.modal.dataset.drag = this.option.drag;
    this.modalItem = this.modal.querySelector('[data-modal-item]');
    this.modalBody = this.modal.querySelector('[data-modal-scroll]');

    //dim
    (this.option.dim) && this.modal.insertAdjacentHTML('beforeend', '<div class="dim"></div>');

    this.setFocusableElements();
    this.addEventListeners();
    // (this.option.drag) && this.dragEvent();

    //load callback
    this.option.loadCallback && this.option.loadCallback();
  }

  setFocusableElements() {
    //first last tag
    const focusableSelectors = 'button, a, input, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = this.modal.querySelectorAll(focusableSelectors);
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
      const rect = this.modalItem.getBoundingClientRect();
      const h = rect.height;
      let isMove = false;
      let y_m;
      let x_m;
      const dragMove = (e) => {
          y_m = isTouch ? e.targetTouches[0].clientY : e.clientY;
          x_m = isTouch ? e.targetTouches[0].clientX : e.clientX;
        if (isDragState) {
          if (Math.abs(y - y_m) > 10 && Math.abs(x - x_m) < Math.abs(y - y_m) && (y - y_m) < 0) {
            this.modalItem.setAttribute(
              'style',
              `max-height: ${(h + (y - y_m)) / 10}rem !important; height: ${(h + (y - y_m)) / 10}rem !important;`
            );
            isMove = true;
          } else {
            isMove = false;
          }
        } else {
          if (Math.abs(y - y_m) > 10 && Math.abs(x - x_m) < Math.abs(y - y_m) && (y - y_m) > 0) {
            this.modalItem.setAttribute(
              'style',
              `max-height: ${(h + (y - y_m)) / 10}rem !important; height: ${(h + (y - y_m)) / 10}rem !important;`
            );
            isMove = true;
          } else {
            this.modalItem.setAttribute(
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
          const _t = this.modalBody.scrollTop;
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
              this.modalItem.removeEventListener('touchstart', reDrag);
              this.modalItem.addEventListener('touchstart', dragStart);
            } else {
              this.modalItem.addEventListener('touchstart', reDrag);
            }
          }
          document.addEventListener('touchmove', reDragMove, { passive: false });
          document.addEventListener('touchend', reDragEnd);
        }
        const restoration = () => {
          this.modal.dataset.state = '';
          this.modalItem.setAttribute(
            'style',
            `max-height: 32rem !important; overflow-y: hidden !important;`
          );
          this.modalItem.addEventListener('touchstart', dragStart);
          isDragState = false;
        }
        const reDragClose = (e) => {
          restoration();
          this.modalItem.removeEventListener('touchstart', reDrag);
        }
        //성공 확장
        if (y - 30 > y_m && isMove) {
          this.modal.dataset.state = 'drag-full';
          this.modalItem.classList.add('motion');
          const dragCloseBtn = this.modal.querySelector('[data-modal-drag="close"]');
          isDragState = true;
          dragCloseBtn && dragCloseBtn.addEventListener('click', reDragClose);
          this.modalItem.setAttribute(
            'style', 'max-height:100dvh !important; overflow-y: hidden !important; height: 100dvh !important;'
          );
          this.modalItem.addEventListener('transitionend', () => {
            this.modalItem.classList.remove('motion');
            let _list = this.modalBody.querySelector('.search-result-list');
            !_list ? _list = this.modal.querySelector('[data-modal-scroll]') : '';

            const hasScroll = _list.scrollHeight > _list.clientHeight;

            if (hasScroll) {
              this.modalItem.removeEventListener('touchstart', dragStart);
              this.modalItem.addEventListener('touchstart', reDrag);
            }
          });
        } 
        //성공 원복
        else if(y_m - y > 30) {
          if (this.modal.dataset.state === 'drag-full') {
            if (y_m - y < (h / 3) * 2) {
              restoration();
            } else {
              this.modalItem.removeEventListener('touchstart', dragStart);
              this.option.hide();
            }
          } else {
            this.modalItem.removeEventListener('touchstart', dragStart);
            this.option.hide();
          }
        } 
        //취소 풀원복
        else if (isDragState) {
          this.modalItem.setAttribute(
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
    this.modalItem.removeEventListener('touchstart', dragStart);
    this.modalItem.addEventListener('touchstart', dragStart);
  }

  addEventListeners() {
    //event 
    this.modal_btns = this.modal.querySelectorAll('[data-modal-btn]');
    if (this.modal_btns) {
      this.modal_btns.forEach(btn => {
        btn.addEventListener('click', this.handleModalButtonClick);
      });
    }
  }

  handleModalButtonClick = (e) => {
    const action = e.target.dataset.modalBtn;

    switch(action) {
      case 'hide': 
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
    const openModals = document.querySelectorAll('[data-modal][aria-hidden="false"]');
    const zIndex = openModals.length;
    const thisZindex = Number(this.modal.dataset.zindex);

    for (let i = thisZindex; i < zIndex; i++) {
      const item = document.querySelector(`[data-modal][aria-hidden="false"][data-zindex="${i + 1}"]`);
      if (item) {
        item.dataset.zindex = i;
        item.dataset.current = 'false';
      }
    }

    this.modal.dataset.zindex = zIndex;
    this.modal.dataset.current = 'true';
    this.modal.focus();
  }

	show() {
		this.option.focus_back = document.activeElement;
		this.modal.setAttribute('aria-hidden', 'false');
		this.modal.focus();
		this.modal.dataset.state = "show";
    
    const openModals = document.querySelectorAll('[data-modal][aria-hidden="false"]');
    const zIndex = openModals.length;
    const currentModal = document.querySelector('[data-modal][aria-hidden="false"][data-current="true"]');
    if (currentModal) currentModal.dataset.current = "false";
    this.modal.dataset.zindex = zIndex;
    this.modal.dataset.current = 'true';

    (this.option.drag) && this.dragEvent();
    
    //loop focus
		this.btn_first.addEventListener('keydown', this.keyStart.bind(this));	
		this.btn_last.addEventListener('keydown', this.keyEnd.bind(this));
	}
	hide(opt) {
    //loop focus 중복방지 이벤트 취소
		this.btn_first.removeEventListener('keydown', this.keyStart);	
		this.btn_last.removeEventListener('keydown', this.keyEnd);	

    const n = Number(this.modal.dataset.zindex);
    //닫히는 현재 모달 초기화
		if (opt && opt.focus_target) this.option.focus_back = opt.focus_target;
		this.modal.dataset.state = "hide";
    this.modal.dataset.current = "false";
    this.modal.dataset.zindex = "";
		this.option.focus_back.focus();
		this.modal.setAttribute('aria-hidden', 'true');

    //열린 모달 재설정
    const openModals = document.querySelectorAll('[data-modal][aria-hidden="false"]');
    const zIndex = openModals.length;
    for (let i = n; i <= zIndex; i++) {
      const item = document.querySelector(`[data-modal][aria-hidden="false"][data-zindex="${i + 1}"]`);
      if (item) {
        item.dataset.zindex = i;
        item.dataset.current = 'false';
      }
    }
    //다음선택 모달 설정
    const currentModal = document.querySelector(`[data-modal][aria-hidden="false"][data-zindex="${zIndex}"]`);
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