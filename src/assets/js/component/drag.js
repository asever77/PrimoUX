export default class Drag {
  constructor(opt) {
    const defaults = {
      rotate: true,
      angle: 1,
      unit: 1,
    }

    this.option = { ...defaults, ...opt };
    this.id =  this.option.id;
    this.unit = this.option.unit;

    this.drag = document.querySelector(`[data-dragdrop="${this.id}"]`);
    this.areas = this.drag.querySelectorAll('[data-dragdrop-target="item"]');
    this.items = this.drag.querySelectorAll('[data-dragdrop-object="item"]');
    this.areaPsData = [];

    this.boundMoveStart = this.moveStart.bind(this);
    this.boundKeyStart = this.keyStart.bind(this);
    this.boundKeyMove = this.keyMove.bind(this);

    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.eventStart = this.isTouchDevice ? 'touchstart' : 'mousedown';
    this.timerControl = null;
    this.init();
  }

  init() {
    console.log(this.items);
    this.areas.forEach(item => {
      const area_rect = item.getBoundingClientRect();
      this.areaPsData.push({
        x: [area_rect.left, area_rect.left + area_rect.width],
        y: [area_rect.top, area_rect.top + area_rect.height],
        target: item,
        info: area_rect,
      })
    });
    this.items.forEach(item => {
      const evt = item.querySelector('[data-dragdrop-object="event"]');
      
      evt.addEventListener(this.eventStart, this.boundMoveStart);
      evt.addEventListener('keydown', this.boundKeyStart);
    });
  }
  contralTab(target) {
    const wrap = target;
    const tabs = wrap.querySelectorAll('button');
    const select_tab = wrap.querySelector('[aria-selected="true"]');

    const actTab = e => {
      console.log(111111)
      const _this = e.currentTarget;
      const mode = _this.dataset.dragdropContral;
      tabs.forEach(tab => {
        tab.setAttribute('aria-selected', 'false');
      });
      _this.closest('[data-dragdrop-object="item"]').dataset.mode = mode;
      _this.setAttribute('aria-selected', 'true');
    }
    tabs.forEach(tab => {
      tab.addEventListener('click', actTab);
    });
  }
  moveStart(e) {
    const el_this = e.currentTarget;
    const el_item = el_this.closest('[data-dragdrop-object="item"]');
    const el_wrap = el_this.closest('[data-dragdrop-object="wrap"]');
    const el_img = el_item.querySelector('[data-dragdrop-object="img"]');
    const isMode = el_item.dataset.mode;
    const isClone = el_item.dataset.clone && el_item.dataset.this === 'original' ? Number(el_item.dataset.clone) : false;
    const clone_item = el_item.cloneNode(true);

    let this_item = el_item;
    let this_event = el_item.querySelector('[data-dragdrop-object="event"]');
    let rect_item = el_item.getBoundingClientRect();
    if (!!isClone) {
      clone_item.dataset.this = 'clone';
      el_wrap.insertAdjacentElement('beforeend', clone_item);

      this_item = clone_item;
      this_event = clone_item.querySelector('[data-dragdrop-object="event"]');
      rect_item = clone_item.getBoundingClientRect();
      this_event.focus();
      this.contralTab(this_item);
    }
    this_item.dataset.controlView = 'on';
    
    const btnDel = this_item.querySelector('[data-dragdrop-contral="delete"]');
    const btnRotate = this_item.querySelector('[data-dragdrop-contral="roration"]');
    const btnRever = this_item.querySelector('[data-dragdrop-contral="reversal"]');
    const btnReverV = this_item.querySelector('[data-dragdrop-contral="reversal-v"]');
    
    //position
    const isTouchEvent = e.type.startsWith('touch');
    const eventMove = isTouchEvent ? 'touchmove' : 'mousemove';
    const eventEnd = isTouchEvent ? 'touchend' : 'mouseup';
    const y = isTouchEvent ? e.targetTouches[0].clientY : e.clientY;
    const x = isTouchEvent ? e.targetTouches[0].clientX : e.clientX;

    //rotate
     

    //move
    const actMoveEnd = e => {
      e.preventDefault();
      document.removeEventListener(eventMove, actMove);
      document.removeEventListener(eventEnd, actMoveEnd);

      const eventStart = isTouchEvent ? 'touchstart' : 'mousedown';
      const end_rect = this_item.getBoundingClientRect();
      const end_ps =  {
        x: [end_rect.left, end_rect.left + end_rect.width],
        y: [end_rect.top, end_rect.top + end_rect.height]
      }
                    
      let inSuccess = false;
      this.areaPsData.forEach(area => {
        area.target.dataset.answer = '';

        if (area.x[0] - this.unit <= end_ps.x[0] && area.x[1] + this.unit >= end_ps.x[1] && area.y[0] - this.unit <= end_ps.y[0] && area.y[1] + this.unit >= end_ps.y[1]) {          
          inSuccess = true;
          area.target.appendChild(this_item);
          const x = Math.round((end_rect.left - area.x[0]) / this.unit) * this.unit;
          const y = Math.round((end_rect.top - area.y[0]) / this.unit) * this.unit;
          this_item.style.transform = 'translate(' + x / 10 + 'rem, ' + y / 10 + 'rem)';
        } 

        if (!inSuccess) {
          this_item.remove();
        } else {
          this_event.addEventListener('keydown', this.boundKeyMove);
          this_event.addEventListener(eventStart, this.boundMoveStart);
          this_event.focus()
          this_item.dataset.controlView = 'off';
        }
      });

      if (this_item.closest('[data-dragdrop-target="item"]')) {
        if (this_item.dataset.value === this_item.closest('[data-dragdrop-target="item"]').dataset.value) {
          this_item.dataset.answer = 'O';
          this_item.closest('[data-dragdrop-target="item"]').dataset.answer = 'O';
        } else {
          this_item.dataset.answer = 'X';
          this_item.closest('[data-dragdrop-target="item"]').dataset.answer = 'X';
        }
      }
    };
    const actMove = e => {
      e.preventDefault();
      const y_m = isTouchEvent ? e.targetTouches[0].clientY : e.clientY;
      const x_m = isTouchEvent ? e.targetTouches[0].clientX : e.clientX;

      if (isClone) {
        //original
        const m_x = x_m - x;
        const m_y = y_m - y;

        this_item.style.transform = 'translate(' + m_x / 10 + 'rem, ' + m_y / 10 + 'rem)';
      } else {
        //clone
        const target_rect = this_item.closest('[data-dragdrop-target="item"]').getBoundingClientRect();
        const m_x = x_m - target_rect.left - (rect_item.width / 2);
        const m_y = y_m - target_rect.top - (rect_item.height / 2);

        this_item.style.transform = 'translate(' + m_x / 10 + 'rem, ' + m_y / 10 + 'rem)';
      }
    };

    //rotate
    const actRoateEnd = e => {
      
    };
    const actRoate = e => {
      e.preventDefault();
    };

    //delete
    const actDel = () => {
      this_item.remove();
      el_this.focus();
    };

    //event
    if (isMode === 'move') {
      document.addEventListener(eventMove, actMove, { passive: false });
      document.addEventListener(eventEnd, actMoveEnd);
    }
    if (isMode === 'rotate') {
      document.addEventListener(eventMove, actRoate, { passive: false });
      document.addEventListener(eventEnd, actRoateEnd);
    }
    
    btnDel.addEventListener('click', actDel);
    btnRotate.addEventListener('click', this.rotateStart);
  }

  keyStart(e) {
    console.log(e);
    e.preventDefault();
    switch(e.code) {
      case 'Space' :
      case 'Enter' :
        const el_this = e.currentTarget;
        const el_item = el_this.closest('[data-dragdrop-object="item"]');
        const isMode = el_item.dataset.mode;
        const isClone = el_item.dataset.clone && el_item.dataset.this === 'original' ? Number(el_item.dataset.clone) : false;
        const clone_item = el_item.cloneNode(true);

        let this_item = el_item;
        let this_event = el_item.querySelector('[data-dragdrop-object="event"]');
        let rect_item = el_item.getBoundingClientRect();

        if (!!isClone) {
          clone_item.dataset.this = 'clone';
          clone_item.style.transform = `translate(0rem, 0rem)`;
          let area_current = null;
          this.areas.forEach(item => {
            if (item.dataset.value === clone_item.dataset.value) {
              area_current = item;
            }
          })

          area_current.insertAdjacentElement('beforeend', clone_item);

          this_item = clone_item;
          this_event = clone_item.querySelector('[data-dragdrop-object="event"]');
          rect_item = clone_item.getBoundingClientRect();
          this_event.focus();
          this.contralTab(this_item);
        }
        this_item.dataset.controlView = 'on';
        
        // touch, mouse event
        this_event.addEventListener(this.eventStart, this.boundMoveStart);
        this_event.addEventListener('keydown', this.boundKeyMove);
        break;

      default:
        console.log('스페이스나 엔터로 복사하고 방향키로 이동해주세요')
    }
  }
  keyMove(e) {
    console.log(e);
    e.preventDefault();
    const el_this = e.currentTarget;
    const el_item = el_this.closest('[data-dragdrop-object="item"]');
    const el_wrap = el_this.closest('[data-dragdrop-target="item"]');
    const wrap_rect = el_wrap.getBoundingClientRect();
    const item_rect = el_item.getBoundingClientRect();
    const transform = el_item.style.transform;
    const match = transform.match(/translate\(\s*([^\s,]+),\s*([^\s,]+)\)/);
    let x = parseFloat(match[1]);
    let y = parseFloat(match[2]);
    const unitText = match[1].replace(/[0-9.\-]/g, '');
    let mx = null;
    let my = null;

    if (unitText === 'rem') {
      x = x * 10;
      y = y * 10;
    }

    switch(e.code) {
      case 'ArrowLeft' :
      mx = x - this.unit;
      mx < 0 ? mx = 0 : mx >= wrap_rect.width - item_rect.width ?  mx = wrap_rect.width - item_rect.width : '';
      el_item.style.transform = `translate(${mx / 10 + unitText}, ${y / 10 + unitText})`;
      break;

      case 'ArrowRight' :
      mx = x + this.unit;
      mx < 0 ? mx = 0 : mx >= wrap_rect.width - item_rect.width ? mx = wrap_rect.width - item_rect.width : '';
      el_item.style.transform = `translate(${mx / 10 + unitText}, ${y / 10 + unitText})`;
      break;
 
      case 'ArrowUp' :
      my = y - this.unit;
      my < 0 ? my = 0 : my >= wrap_rect.height - item_rect.height ? my = wrap_rect.height - item_rect.height : '';
      el_item.style.transform = `translate(${x / 10 + unitText}, ${my / 10 + unitText})`;
      break;

      case 'ArrowDown' :
      my = y + this.unit;
      my < 0 ? my = 0 : my >= wrap_rect.height - item_rect.height ? my = wrap_rect.height - item_rect.height : '';
      el_item.style.transform = `translate(${x / 10 + unitText}, ${my / 10 + unitText})`;
      break;
    }
  }
}