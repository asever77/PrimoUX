export default class Drag {
  constructor(opt) {
    const defaults = {
      rotate: true,
      angle: 1,
      unit: 1,
    }

    this.option = { ...defaults, ...opt };
    this.id =  this.option.id;

    this.drag = document.querySelector(`[data-drag="${this.id}"]`);
    this.areas = this.drag.querySelectorAll('[data-drag-target="area"]');
    this.items = this.drag.querySelectorAll('[data-drag-object="item"]');

    this.boundMoveStart = this.moveStart.bind(this);
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.init();
  }

  init() {
    console.log(this.items);

    this.items.forEach(item => {
      const _move = item.querySelector('[data-drag-contral="move"]');

      _move.addEventListener('mousedown', this.boundMoveStart);
    })

  }

  moveStart(e) {
    console.log(e);

    const el_this = e.currentTarget;
    const el_item = el_this.closest('[data-drag-object="item"]');
    const isTouchEvent = e.type.startsWith('touch');
    const eventMove = isTouchEvent ? 'touchmove' : 'mousemove';
    const eventEnd = isTouchEvent ? 'touchend' : 'mouseup';
    const y = isTouchEvent ? e.targetTouches[0].clientY : e.clientY;
    const x = isTouchEvent ? e.targetTouches[0].clientX : e.clientX;

    this.win_y = this.el_scroll ? this.el_scroll.scrollTop : window.scrollY;
    this.win_x = this.el_scroll ? this.el_scroll.scrollLeft : window.scrollX;
    this.wrap_rect = this.wrap.getBoundingClientRect();
    this.wrap_t = this.wrap_rect.top + this.win_y;
    this.wrap_l = this.wrap_rect.left + this.win_x;
    let _x = this.isTouch ? e.targetTouches[0].clientX : e.clientX;
    let _y = this.isTouch ? e.targetTouches[0].clientY : e.clientY;
    let m_y = _y + this.win_y - (rect_item.top + this.win_y) - rect_this.height / 2;
    let m_x = _x + this.win_x - (rect_item.left + this.win_x) - rect_this.width / 2;
  

    console.log(el_item, y,x)
    const actEnd = e => {

    }
    const actMove = e => {
      e.preventDefault();
      //move x,y
      const _x = !!e.clientX ? e.clientX : e.targetTouches[0].clientX;
      const _y = !!e.clientY ? e.clientY : e.targetTouches[0].clientY;
      m_y = _y + this.win_y - (rect_item.top + this.win_y) - rect_this.height / 2;
      m_x = _x + this.win_x - (rect_item.left + this.win_x) - rect_this.width / 2;
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
      document.addEventListener('touchmove', actMove, { passive: false });
      document.addEventListener('touchend', actEnd);
    } else {
      document.addEventListener('mousemove', actMove);
      document.addEventListener('mouseup', actEnd);
    }
  }
}