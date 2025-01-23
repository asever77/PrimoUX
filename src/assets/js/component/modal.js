export default class Modal {
  constructor(opt) {
		const defaults = {
			type: 'modal', 
			classname: '',
			ps: 'center', // 'center', 'top', 'bottom', 'left', 'right'
			area: document.querySelector('.area-modal'),
			dim: true,
			focus_back: null,
		};

		this.option = { ...defaults, ...opt };
		this.modal = null;
		this.modal_item = null;
		this.btn_hide = null;
		this.btn_last = null;
		this.btn_first = null;
		this.area = this.option.area;
		this.init();
	}

	init() {
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
    this.modal_item.insertAdjacentHTML('beforeend', '<button type="button" class="btn-hidden" data-modal-last data-modal-hide aria-label="마지막 지점입니다. 창닫기"></button>');
    this.btn_hide = this.modal.querySelectorAll('[data-modal-hide]');
    this.btn_last = this.modal.querySelector('[data-modal-last]');

    //dim
    this.option.dim ? this.modal.insertAdjacentHTML('beforeend', '<div class="dim"></div>') : '';

    //first tag
    const tags = this.modal.querySelectorAll('*');
    const tagLen = tags.length;
    for (let i = 0; i < tagLen; i++) {
      const _tag = tags[i];
      const tag_name = _tag.tagName;
      if (tag_name === 'BUTTON' || tag_name === 'A' || tag_name === 'INPUT' || tag_name === 'TEXTAREA') {
        this.btn_first = _tag;
        break;
      }
    }
    
    //load callback & hide event
    this.option.loadCallback && this.option.loadCallback();
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
    console.log(zIndex, thisZindex)
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
    if(currentModal) currentModal.dataset.current = 'true';
	}

	keyStart = (e) => {
		console.log(e.key)
		if (e.shiftKey && e.key === 'Tab') {
			e.preventDefault();
			this.btn_last.focus();
		}
	}
	keyEnd = (e) => {
		if (!e.shiftKey && e.key === 'Tab') {
			e.preventDefault();
			this.btn_first.focus();
		}
	}
}