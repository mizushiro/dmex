(() => {

    'use strict';

    const global = 'UI';

    if (!window[global]) {
        window[global] = {};
    } 
    const Global = window[global];

    const UA = navigator.userAgent.toLowerCase();
    const deviceInfo = ['android', 'iphone', 'ipod', 'ipad', 'blackberry', 'windows ce', 'windows','samsung', 'lg', 'mot', 'sonyericsson', 'nokia', 'opeara mini', 'opera mobi', 'webos', 'iemobile', 'kfapwi', 'rim', 'bb10'];

    Global.page = {};
    Global.data = {};
    Global.exe = {};
    Global.callback = {};
    Global.state = {
        isSystemModal: false,
        device: {
            info: (() => {
                for (let i = 0, len = deviceInfo.length; i < len; i++) {
                    if (UA.match(deviceInfo[i]) !== null) {
                        return deviceInfo[i];
                    }
                }
            })(),
            width: window.innerWidth,
            height: window.innerHeight,
            ios: (/ip(ad|hone|od)/i).test(UA),
            android: (/android/i).test(UA),
            app: UA.indexOf('appname') > -1 ? true : false,
            touch: null,
            mobile: null,
            os: (navigator.appVersion).match(/(mac|win|linux)/i)
        },
        browser: {
            ie: UA.match(/(?:msie ([0-9]+)|rv:([0-9\.]+)\) like gecko)/i),
            local: (/^http:\/\//).test(location.href),
            firefox: (/firefox/i).test(UA),
            webkit: (/applewebkit/i).test(UA),
            chrome: (/chrome/i).test(UA),
            opera: (/opera/i).test(UA),
            safari: (/applewebkit/i).test(UA) && !(/chrome/i).test(UA),	
            size: null
        },
        keys: { 
            tab: 9, 
            enter: 13, 
            alt: 18, 
            esc: 27, 
            space: 32, 
            pageup: 33, 
            pagedown: 34, 
            end: 35, 
            home: 36, 
            left: 37, 
            up: 38, 
            right: 39, 
            down: 40
        },
        scroll: {
            y: 0,
            direction: 'down'
        },		
        breakPoint: [600, 905],
    };
    Global.parts = {
        scroll(){
            const el_html = document.querySelector('html');
            let last_know_scroll_position = 0;
            let ticking = false;

            const doSomething = (scroll_pos) => {
                Global.state.scroll.direction = 
                    Global.state.scroll.y > scroll_pos ? 'up' : Global.state.scroll.y < scroll_pos ? 'down' : ''; 
                Global.state.scroll.y = scroll_pos;
                el_html.dataset.direction = Global.state.scroll.direction;
            }
            window.addEventListener('scroll', (e) => {
                last_know_scroll_position = window.scrollY;

                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        doSomething(last_know_scroll_position);
                        ticking = false;
                    });

                    ticking = true;
                }
            });
        },
        resizeState() {
            const act = () => {
                const el_html = document.querySelector('html');
                const browser = Global.state.browser;
                const device = Global.state.device;

                device.width = window.innerWidth;
                device.height = window.innerHeight;

                device.touch = device.ios || device.android || (document.ontouchstart !== undefined && document.ontouchstart !== null);
                device.mobile = device.touch && (device.ios || device.android);
                device.os = device.os ? device.os[0] : '';
                device.os = device.os.toLowerCase();

                device.breakpoint = device.width >= Global.state.breakPoint[0] ? true : false;
                device.col = device.width >= Global.state.breakPoint[1] ? '12' : device.width > Global.state.breakPoint[0] ? '8' : '4';

                if (browser.ie) {
                    browser.ie = browser.ie = parseInt( browser.ie[1] || browser.ie[2] );
                    ( 11 > browser.ie ) ? support.pointerevents = false : '';
                    ( 9 > browser.ie ) ? support.svgimage = false : '';
                } else {
                    browser.ie = false;
                }

                el_html.dataset.col = device.col;
                el_html.dataset.browser = browser.chrome ? 'chrome' : browser.firefox ? 'firefox' : browser.opera ? 'opera' : browser.safari ? 'safari' : browser.ie ? 'ie' + browser.ie : 'other';
                el_html.dataset.platform = device.ios ? "ios" : device.android ? "android" : 'window';
                el_html.dataset.device = device.mobile ? device.app ? 'app' : 'mobile' : 'desktop';
            }
            window.addEventListener('resize', act);
            act();
        },
        comma(n) {
            let parts = n.toString().split(".");

            return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
        },
        add0(x) {
            return Number(x) < 10 ? '0' + x : x;
        },
        paraGet(paraname) {
            const _tempUrl = window.location.href;
            let _tempArray = _tempUrl.split(paraname + '=');

            if (_tempArray.length > 1) {
                _tempArray = _tempArray[1];
                _tempArray = _tempArray.split('&');
                _tempArray = _tempArray[0];
                _tempArray = _tempArray.split('#');
                _tempArray = _tempArray[0];

                console.log(_tempArray);
            }

            return _tempArray;
        },
        paraSet(key, value) {
            const _tempUrl = window.location.href;
            let _tempArray = _tempUrl.split(key + '=');

            if (_tempArray.length > 1) {
                _tempArray = _tempArray[0] + key + '=' + value;
            } else {
                _tempArray = _tempUrl + '?' + key + '=' + value;
            }

            history.pushState(null, null, _tempArray);
        },
        RAF(start, end, startTime, duration){
            const _start = start;
            const _end = end;
            const _duration = duration ? duration : 300;
            const unit = (_end - _start) / _duration;
            const endTime = startTime + _duration;

            let now = new Date().getTime();
            let passed = now - startTime;

            if (now <= endTime) {
                Global.parts.RAF.time = _start + (unit * passed);
                requestAnimationFrame(scrollTo);
            } else {
                !!callback && callback();
            }
        },
        getIndex(ele) {
			let _i = 0;
			
			while((ele = ele.previousSibling) != null) {
               (ele.nodeType === 1) && _i++;				
			}

			return _i;
		},
        /**
         * include
         * @param {string} opt.id 
         * @param {string} opt.src 
         * @param {string} opt.type : 'html' | 'json'
         * @param {boolean} opt.insert : true[insertAdjacentHTML] | false[innerHTML]
         * @param {function} opt.callback
         * 
         */
        include(opt) {
            console.log(opt);
            const selector = document.querySelector('[data-id="'+ opt.dataId +'"]');
            const src = opt.src;
            const type = !opt.type ? 'HTML' : opt.type;
            const insert = !!opt.insert ? opt.insert : false;
            const callback = !!opt.callback ? opt.callback : false;

            if (!!selector && !!src) {
                switch (type) {
                    case 'HTML' :
                        fetch(src)
                        .then(response => response.text())
                        .then(result => {
                            if (insert) {
                                selector.insertAdjacentHTML('afterbegin', result);
                            } else {
                                selector.innerHTML = result;
                            }
                        }).then(() => {
                            !!callback && callback();
                        });
                        break;
                }   
            }  
        },
        resizObserver(opt) {
            let timer = null;
            let w = null;
            let h = null;
            const observer = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const {width, height} = entry.contentRect;
                    w === null ? w = width : '';
                    h === null ? h = height : '';
                    
                    !!timer && clearTimeout(timer);
                    // timer = setTimeout(() => {
                    //     console.log(width, height);
                        opt.callback({
                            width: width,
                            height: height,
                            resize: [w === width ? false : true, h === height ? false : true] 
                        });
                    // }, 50);
                }
            });

            observer.observe(opt.el);
        }	
    };

    Global.loading = {
		timerShow : {}, 
		timerHide : {},
		options : {
			selector: null,
			message : null,
			styleClass : 'orbit' //time
		},
		show(option){
			const opt = Object.assign({}, this.options, option);
			const selector = opt.selector; 
			const styleClass = opt.styleClass; 
			const message = opt.message;
			const el = (selector !== null) ? selector : document.querySelector('body');
			const el_loadingHides = document.querySelectorAll('.mdl-loading:not(.visible)');

			for (let i = 0, len = el_loadingHides.length; i < len; i++) {
				const that = el_loadingHides[i];

				that.remove();
			}

			let htmlLoading = '';

			(selector === null) ?
				htmlLoading += '<div class="mdl-loading '+ styleClass +'">':
				htmlLoading += '<div class="mdl-loading type-area '+ styleClass +'">';

			htmlLoading += '<div class="mdl-loading-wrap">';

			(message !== null) ?
				htmlLoading += '<strong class="mdl-loading-message"><span>'+ message +'</span></strong>':
				htmlLoading += '';

			htmlLoading += '</div>';
			htmlLoading += '</div>';

			const showLoading = () => {
				const el_child = el.childNodes;
				let is_loading = false;

				for (let i = 0; i < el_child.length; i++) {
					if (el_child[i].nodeName === 'DIV' && el_child[i].classList.contains('mdl-loading')) {
						is_loading = true;
					}
				}

				!is_loading && el.insertAdjacentHTML('beforeend', htmlLoading);
				htmlLoading = null;		
				
				const el_loadings = document.querySelectorAll('.mdl-loading');

				for (let i = 0, len = el_loadings.length; i < len; i++) {
					const that = el_loadings[i];

					that.classList.add('visible');
					that.classList.remove('close');
				}
			}
			clearTimeout(this.timerShow);
			clearTimeout(this.timerHide);
			this.timerShow = setTimeout(showLoading, 300);
		},
		hide(){
			clearTimeout(this.timerShow);
			this.timerHide = setTimeout(() => {
				const el_loadings = document.querySelectorAll('.mdl-loading');

				for (let i = 0, len = el_loadings.length; i < len; i++) {
					const that = el_loadings[i];

					that.classList.add('close');
					setTimeout(() => {
						that.classList.remove('visible')
						that.remove();
					},300);
				}
			},300);
		}
	}

    Global.scroll = {
		option: {
			selector: null,
			area: null
		},

		init(option) {
			const opt = Object.assign({}, this.option, option);
			const el_area = (opt.area === undefined || opt.area === null) ? window : opt.area;
			const el_parallax = (opt.selector === undefined || opt.selector === null) ? document.querySelector('.ui-scrollevent') : opt.selector;
			const el_items = el_parallax.querySelectorAll('.ui-scrollevent-item');
			let prev_st = el_parallax.scrollTop;
			let ps;

			const act = () => {
                console.log(1111111);

				const isWin = el_area === window;
				const areaH = isWin ? window.innerHeight : el_area.offsetHeight;
				let areaT = 0;

				for (let i = 0, len = el_items.length; i < len; i++) {
					const that = el_items[i];
					const callbackname = that.dataset.act;
					const h = Math.floor(that.offsetHeight);
					!isWin ? areaT = el_area.getBoundingClientRect().top : '';
					const _start = Math.floor(that.getBoundingClientRect().top) - (areaT + el_area.scrollTop); 
					let start = Math.floor(that.getBoundingClientRect().top) - areaH;
					let _n = 0;
					let _per_s = 0;
					let _per_e = 0;
	
					if (start < 0) {
						_n = Math.abs(start);
						_per_s = Math.round(_n / areaH * 100);
						_per_s = _per_s >= 100 ? 100 : _per_s;
					} else {
						_n = 0;
						_per_s = 0;
					}
	
					if (start + areaH < 0) {
						_n = Math.abs(start + areaH);
						_per_e = Math.round(_n / h * 100);
						_per_e = _per_e >= 100 ? 100 : _per_e;
					} else {
						_n = 0;
						_per_e = 0;
					}

					that.setAttribute('data-scrollevent-s', _per_s);
					that.setAttribute('data-scrollevent-e', _per_e);


					if (prev_st < el_parallax.scrollTop) {
						ps = 'down';
					} else if (prev_st > el_parallax.scrollTop) {
						ps ='up';
					}

					prev_st = el_parallax.scrollTop;

					if (!!Global.callback[callbackname]) {
						Global.callback[callbackname]({
							el: that,
							name: callbackname,
							px: _n,
							start: _per_s,
							end: _per_e,
							ps: ps
						});
					}
				}
			}
	
			act();
			el_area.addEventListener('scroll', act);
		}
	}
   
    //common exe
    Global.parts.resizeState();
    Global.parts.scroll();

    //common callback
    Global.callback.toggle_nav = (result) => {
        console.log('toggle_nav', result);
        const btn = document.querySelector('[data-toggle-object="'+ result.name +'"]');

        if (result.state === 'true') {
            btn.dataset.meterial = 'arrow_forward';
        } else {
            btn.dataset.meterial = 'arrow_back';
        }
    }
   
})();

class ScrollPage {
    constructor(opt) {
        this.el_wrap = document.querySelector('.mdl-scroll');
        this.el_items = this.el_wrap.querySelectorAll('[data-scroll-callback]');
        this.sctop = this.el_wrap.scrollTop;
        this.wraph = this.el_wrap.offsetHeight;
        this.ary_top_s = [];
        this.ary_top_e = [];
        this.init();
    }
    init() {
        for (let item of this.el_items) {
            const rect = item.getBoundingClientRect();
            this.ary_top_s.push(rect.top + this.sctop - this.wraph)
            this.ary_top_e.push(rect.top + this.sctop);
        }

        console.log(this.ary_top_s, this.ary_top_e);

        const act = (e) => {
            const n = this.el_wrap.scrollTop;
            for (let i = 0, len = this.ary_top_s.length; i < len; i++) {
                const n_s = Number(this.ary_top_s[i]);
                const n_e = Number(this.ary_top_e[i]);
                if (n_s < n && n_e > n) {
                    const _n = n_e - n_s;
                    const __n = n - n_s;
                    let per = (__n / _n * 100) * 1.2;

                    per > 100 ? per = 100 : '';
                    console.log(i, Math.floor(per))
                }
            }
        }
       
        window.addEventListener('scroll', act);
    }
}

class ToggleUI {
    constructor(opt) {
        this.scope = !!opt ? opt.scope : false;
        this.objects = this.scope ? this.scope.querySelectorAll('[data-toggle-object]') : document.querySelectorAll('[data-toggle-object]');
        this.init();
    }
    init() {
        for (let item of this.objects) {
            item.removeEventListener('click', this.actClick);
            item.addEventListener('click', this.actClick);
            // item.addEventListener('mouseover', this.act);
            // item.addEventListener('mouseleave', this.act);
        }
    }
    actClick = (e) => {
        const type = e.type;
        const el_object = e.currentTarget;
        const callbackName = el_object.dataset.callback;
        const is_name = el_object.dataset.toggleObject;
        const el_objects = document.querySelectorAll('[data-toggle-object="'+ is_name +'"]');
        const el_target = document.querySelector('[data-toggle-target="'+ is_name +'"]');

        let data_state = el_object.dataset.toggleState;
        let is_state = data_state !== 'true' ? 'true' : 'false';

        for(let item of el_objects) {
            item.dataset.toggleState = is_state;
        }
       
        // el_object.dataset.toggleState = is_state;
        !!el_target ? el_target.dataset.toggleState = is_state : '';
              
        !!callbackName && UI.callback[callbackName]({
            state: is_state,
            event: type,
            name: is_name
        });
    }
    actHover = (e) => {
        console.log(e);
        const el_object = e.currentTarget;
        const callbackName = el_object.dataset.callback;
        const is_name = el_object.dataset.toggleObject;
        const el_target = document.querySelector('[data-toggle-target="'+ is_name +'"]');

        el_object.dataset.toggleEvent = 'hover';

        !!callbackName && UI.callback[callbackName]({
            state: if_state,
            event: 'hover',
            name: is_name
        });
    }
}
class Tab {
    constructor(opt) {
        this.current = opt.current ? opt.current : false;
        this.id = opt.id;
        this.callback = opt.callback;
        this.tab = document.querySelector('.mdl-tab[data-tab-id="'+ this.id +'"]');
        this.tab_btns = this.tab.querySelectorAll('.mdl-tab-btn');
        this.pnl = document.querySelector('.mdl-tab-pnl[data-tab-id="'+ this.id +'"]');
        this.items = this.pnl.querySelectorAll('.mdl-tab-item');

        this.init();
    }
    init() {
        for (let item of this.tab_btns) {
            item.addEventListener('click', this.act);
        }

        !!sessionStorage.getItem(this.id) ? 
        this.selected(sessionStorage.getItem(this.id)) : (this.current === false) ? 
        this.selected(his.tab_btns[0].dataset.tab) : this.selected(this.current);
    }
    act = (e) => {
        const _this = e.currentTarget;
        const tab = _this.dataset.tab;
        this.selected(tab);
    }
    selected(tab) {
        const btn = this.tab.querySelector('.mdl-tab-btn[data-tab="'+ tab +'"]');
        const _selected = this.tab.querySelector('.mdl-tab-btn[data-selected="true"]');
        const item = this.pnl.querySelector('.mdl-tab-item[data-tab="'+ tab +'"]');
        const _selected_pnl = this.pnl.querySelector('.mdl-tab-item[data-selected="true"]');

        sessionStorage.setItem(this.id, tab);

        _selected ? _selected.dataset.selected = false : '';
        _selected_pnl ? _selected_pnl.dataset.selected = false : '';
        this.callback && this.callback({
            id: this.id,
            current: tab
        });

        btn.dataset.selected = true;
        item.dataset.selected = true;
    }
}