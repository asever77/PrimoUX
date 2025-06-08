import { loadContent } from '../utils/loadContent.js';

export default class Tab {
  constructor(opt) {
		const defaults = {
      /**
       * renderMode: 'static' | 'dynamic'
       * loadMode: 'eager' | 'lazy'
       * tablist: null | opt.tablist
       */
			renderMode: 'static', 
			tablist: null,
		};

		this.option = { ...defaults, ...opt };
    this.renderMode = this.option.renderMode;
    this.tablist = this.option.tablist;
    this.id = this.option.id;

    this.el_tab = document.querySelector(`[data-tab-id="${this.id}"]`);
    this.el_panel = document.querySelector(`[data-tab-panel="${this.id}"]`);
    this.el_wrap = document.querySelector(`[data-tab-wrap="${this.id}"]`);

    this.init();
  }
  init() {
    let tablist_html = ``;
    let tabpanel_html = ``;
    let panel_data = [];
    this.tablist.forEach((item, index) => {
      tablist_html += `<li role="tab" aria-selected="${item.selected}" aria-controls="${this.id}-panel-${index}" tabindex="${item.selected ? 0 : '-1'}" id="${this.id}-id-${index}">${item.tab}</li>`;
      if (item.selected) {
        panel_data.push(`${this.id}-panel-${index}`, `${this.id}-id-${index}`, item.src)
      }

      console.log(item, index)
    });

    console.log(this.renderMode, this.el_panel)
    //탭 선택 시마다 동적으로 로딩
    this.el_tab.innerHTML = tablist_html;
    

    loadContent({
      area: this.el_wrap,
      src: panel_data[2],
      insert: true,
      callback: () => {
        console.log('callback');
      },
    })
    .then(() => {
      console.log(this.el_wrap, this.el_panel)
      this.el_panel.setAttribute('aria-expanded', true);
      this.el_panel.setAttribute('aria-labelledby', panel_data[1]);
      this.el_panel.setAttribute('id', panel_data[0]);
    })
    .catch(err => console.error('Error loading tab content:', err));
    
    if (this.renderMode === 'dynamic') {
      
    } else {
      //모든 탭 콘텐츠를 미리 렌더
      this.tablist.forEach((item, index) => {
        tabpanel_html += `<div role="tabpanel" aria-selected="${item.selected}" aria-controls="${this.id}-panel-${index}" tabindex="${item.selected ? 0 : '-1'}" id="${this.id}-id-${index}">${item.tab}</li>`;
        if (item.selected) {
          panel_data.push(`${this.id}-panel-${index}`, `${this.id}-id-${index}`, item.src)
        }
      });
    }
    
  }
}