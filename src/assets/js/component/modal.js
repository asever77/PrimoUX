export default class Modal {
  constructor(opt) {
		const defaults = {
			type: 'modal', //'modal', 'system'
			classname: '',
			ps: 'center', // 'center', 'top', 'bottom', 'left', 'right'
			area: document.querySelector('.area-modal'),
			dim: true,
			focus_back: null,
      message: '',
      confirmText: '',
      cancelText: '',
      confirmCallback: null,
      cancelCallback: null, 
		};

		this.option = { ...defaults, ...opt };
		this.modal = null;
		this.area = this.option.area;

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
				callback: () => this.buildModal(),
			})
			.then(() => console.log('Content loaded'))
			.catch(err => console.error('Error loading modal content:', err));
		} else {
      this.buildModal();
    }
	}

  buildModal() {
    this.modal = document.querySelector(`[data-modal="${this.option.id}"]`);
    this.modal.setAttribute('tabindex', '0');
    this.modal.dataset.ps = this.option.ps;

    //dim
    if (this.option.dim) {
      this.modal.insertAdjacentHTML('beforeend', '<div class="dim"></div>');
    }

    this.setFocusableElements();
    this.addEventListeners();

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
      item.dataset.zindex = i;
      item.dataset.current = 'false';
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
    
    //loop focus
		this.btn_first.addEventListener('keydown', this.keyStart);	
		this.btn_last.addEventListener('keydown', this.keyEnd);
	}
	hide = (opt) => {
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
      item.dataset.zindex = i;
      item.dataset.current = 'false';
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