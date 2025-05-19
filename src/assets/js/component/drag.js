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

    this.drag = document.querySelector(`[data-drag="${this.id}"]`);
    this.areas = this.drag.querySelectorAll('[data-drag-target="item"]');
    this.items = this.drag.querySelectorAll('[data-drag-object="item"]');
    this.areaPsData = [];
    this.boundMoveStart = this.moveStart.bind(this);
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    this.timerControl = null;
    this.init();
  }

  init() {
    const eventStart = this.isTouchDevice ? 'touchstart' : 'mousedown';

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
      const _move = item.querySelector('[data-drag-contral="move"]');

      _move.addEventListener(eventStart, this.boundMoveStart);
    });
  }

  moveStart(e) {
    console.log(e);
    const el_this = e.currentTarget;
    const el_item = el_this.closest('[data-drag-object="item"]');
    const el_wrap = el_this.closest('[data-drag-object="wrap"]');
    const isClone = el_item.dataset.clone && el_item.dataset.this === 'original' ? Number(el_item.dataset.clone) : false;
    const clone_item = el_item.cloneNode(true);

    let this_item = el_item;
    let this_move = el_item.querySelector('[data-drag-contral="move"]');
    let rect_item = el_item.getBoundingClientRect();

    // this.timerControl && clearTimeout(this.timerControl);
 
    if (!!isClone) {
      clone_item.dataset.this = 'clone';
      el_wrap.insertAdjacentElement('beforeend', clone_item);

      this_item = clone_item;
      this_move = clone_item.querySelector('[data-drag-contral="move"]');
      rect_item = clone_item.getBoundingClientRect();
    }
    this_item.dataset.controlView = 'on';
    console.log('el', isClone, this_item, this_move, rect_item);

    const btnDel = this_item.querySelector('[data-drag-contral="delete"]');
    const btnRotate = this_item.querySelector('[data-drag-contral="roration"]');
    const btnRever = this_item.querySelector('[data-drag-contral="reversal"]');
    const btnReverV = this_item.querySelector('[data-drag-contral="reversal-v"]');
    
    //position
    const isTouchEvent = e.type.startsWith('touch');
    const eventMove = isTouchEvent ? 'touchmove' : 'mousemove';
    const eventEnd = isTouchEvent ? 'touchend' : 'mouseup';
    const y = isTouchEvent ? e.targetTouches[0].clientY : e.clientY;
    const x = isTouchEvent ? e.targetTouches[0].clientX : e.clientX;

    const actEnd = e => {
      e.preventDefault();
      const eventStart = isTouchEvent ? 'touchstart' : 'mousedown';
      const end_rect = this_item.getBoundingClientRect();
      const end_ps =  {
        x: [end_rect.left, end_rect.left + end_rect.width],
        y: [end_rect.top, end_rect.top + end_rect.height]
      }
                    
      let inSuccess = false;
      this.areaPsData.forEach(area => {
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
          this_move.addEventListener(eventStart, this.boundMoveStart);
          this_item.dataset.controlView = 'off';
          // this.timerControl = setInterval(() => {
          //   this_item.classList.remove('on');
          //   this_move.focus();
          // },1000)
        }
      });

      document.removeEventListener(eventMove, actMove);
      document.removeEventListener(eventEnd, actEnd);
    }
    const actMove = e => {
      e.preventDefault();
      const y_m = isTouchEvent ? e.targetTouches[0].clientY : e.clientY;
      const x_m = isTouchEvent ? e.targetTouches[0].clientX : e.clientX;

      console.log('move', isClone)

      if (isClone) {
        //original
        const m_x = x_m - x;
        const m_y = y_m - y;

        this_item.style.transform = 'translate(' + m_x / 10 + 'rem, ' + m_y / 10 + 'rem)';
      } else {
        //clone
        const target_rect = this_item.closest('[data-drag-target="item"]').getBoundingClientRect();
        const m_x = x_m - target_rect.left - (rect_item.width / 2);
        const m_y = y_m - target_rect.top - (rect_item.height / 2);

        console.log(x_m, rect_item)

        this_item.style.transform = 'translate(' + m_x / 10 + 'rem, ' + m_y / 10 + 'rem)';
      }
    };
    const actDel = () => {
      this_item.remove();
      el_this.focus();
    }
    //event
    document.addEventListener(eventMove, actMove, { passive: false });
    document.addEventListener(eventEnd, actEnd);
    btnDel.addEventListener('click', actDel);
  }
}