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
		this.modal_item = null;
		this.btn_hide = null;
		this.btn_last = null;
		this.btn_first = null;
    this.system_btn = null;
		this.area = this.option.area;

    switch(this.option.type) {
      case 'modal': this.initModal(); break;
      case 'system': this.initSystem(); break;
    }
	}
  initSystem() {
    console.log(this.area)
    let htmlSystem = `<div class="project-modal" data-modal="${this.option.id}" role="alertdialog" aria-modal="true" aria-live="polite">
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
    htmlSystem = '';

    this.buildModal();
  }
	initModal() {
		if (this.option.src && !this.modal) {
			PrimoUX.utils.loadContent({
				area: this.area,
				src: this.option.src,
				insert: true,
				callback: () => {
					this.buildModal();
				}
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
    this.modal_item = this.modal.querySelector('[data-modal-item]');

    //dim
    this.option.dim ? this.modal.insertAdjacentHTML('beforeend', '<div class="dim"></div>') : '';

    if (this.option.type === 'modal') {
      this.modal_item.insertAdjacentHTML('beforeend', '<button type="button" class="btn-hidden" data-modal-last data-modal-hide aria-label="마지막 지점입니다. 창닫기"></button>');
      this.btn_last = this.modal.querySelector('[data-modal-last]');
    } else {
      this.system_btn = this.modal
    }
    

    //first tag
    const focusableSelectors = 'button, a, input, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = this.modal.querySelectorAll(focusableSelectors);
    this.btn_first = focusableElements[0];
    this.btn_last = focusableElements[focusableElements.length - 1];

    //load callback
    this.option.loadCallback && this.option.loadCallback();
    
    //hide event
    this.btn_hide = this.modal.querySelectorAll('[data-modal-hide]');
    this.btn_hide.forEach(item => {
      item.addEventListener('click', this.hide);
    });
  }

  zIndexUp() {
    //최상위로 올리기
    const openModals = document.querySelectorAll('[data-modal][aria-hidden="false"]');
    const zIndex = openModals.length;
    const thisZindex = Number(this.modal.dataset.zindex);

    for (let i = thisZindex; i < zIndex; i++) {
      console.log(i + 1);
      const item = document.querySelector(`[data-modal][aria-hidden="false"][data-zindex="${i + 1}"]`);
      item.dataset.zindex = i;
      item.dataset.current = 'false';
    }
    this.modal.dataset.zindex = zIndex;
    this.modal.dataset.current = 'true';
    this.modal.focus();
    console.log(zIndex, thisZindex, this.modal)
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
    console.log(this.btn_first);
		this.btn_first.addEventListener('keydown', this.keyStart);	
		this.btn_last.addEventListener('keydown', this.keyEnd);
	}
	hide = (opt) => {
    //loop focus 중복방지 이벤트 취소
    const n = Number(this.modal.dataset.zindex);
    const isCurrent = this.modal.dataset.current;

		this.btn_first.removeEventListener('keydown', this.keyStart);	
		this.btn_last.removeEventListener('keydown', this.keyEnd);	

		if (opt.focus_target) this.option.focus_back = opt.focus_target;
		this.modal.dataset.state = "hide";
    this.modal.dataset.current = "false";
    this.modal.dataset.zindex = "";
		this.option.focus_back.focus();
		this.modal.setAttribute('aria-hidden', 'true');

    const openModals = document.querySelectorAll('[data-modal][aria-hidden="false"]');
    const zIndex = openModals.length;

    for (let i = n; i <= zIndex; i++) {
      console.log(i,zIndex);
      const item = document.querySelector(`[data-modal][aria-hidden="false"][data-zindex="${i + 1}"]`);
      item.dataset.zindex = i;
      item.dataset.current = 'false';
    }

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