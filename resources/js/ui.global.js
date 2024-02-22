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

    Global.scrollEvent = {
		options : {
			selector: document.querySelector('html, body'),
			focus: false,
			top: 0,
			left:0,
			add: 0,
			align: 'default',
			effect:'smooth', //'auto'
			callback: false,	
		},
		init() {
			const el_areas = document.querySelectorAll('.ui-scrollmove-btn[data-area]');

			for (let i = 0, len = el_areas.length; i < len; i++) {
				const that = el_areas[i];

				that.removeEventListener('click', this.act);
				that.addEventListener('click', this.act);
			}
			// for (let that of el_areas) {
			// 	that.removeEventListener('click', this.act);
			// 	that.addEventListener('click', this.act);
			// }
		},
		act(e) {
			const el = e.currentTarget;
			const area = el.dataset.area;
			const name = el.dataset.name;
			const add = el.dataset.add === undefined ? 0 : el.dataset.add;
			const align = el.dataset.align === undefined ? 'default' : el.dataset.align;
			const callback = el.dataset.callback === undefined ? false : el.dataset.callback;
			let el_area = document.querySelector('.ui-scrollmove[data-area="'+ area +'"]');
			const item = el_area.querySelector('.ui-scrollbar-item');
			
			if (!!item) {
				el_area = el_area.querySelector('.ui-scrollbar-item');
			}

			const el_item = el_area.querySelector('.ui-scrollmove-item[data-name="'+ name +'"]');
			
			let top = (el_area.getBoundingClientRect().top - el_item.getBoundingClientRect().top) - el_area.scrollTop;
			let left = (el_area.getBoundingClientRect().left - el_item.getBoundingClientRect().left) - el_area.scrollLeft;

			if (align === 'center') {
				top = top - (el_item.offsetHeight / 2);
				left = left - (el_item.offsetWidth / 2);
			}

			Global.scroll.move({
				top: top,
				left: left,
				add: add,
				selector: el_area,
				align: align,
				focus: el_item,
				callback: callback
			});
		},
		move(option) {
			const opt = Object.assign({}, this.options, option);
			//const opt = {...this.options, ...option};
			const top = opt.top;
			const left = opt.left;
			const callback = opt.callback;
			const align = opt.align;
			const add = opt.add;
			const focus = opt.focus;
			const effect = opt.effect;
			let selector = opt.selector;
			const item = selector.querySelector('.ui-scrollbar-item');
			const isCustomScroll = selector.classList.contains('ui-scrollbar');

			if (!!item && !!isCustomScroll) {
				selector = selector.querySelector('.ui-scrollbar-item');
			}

			switch (align) {
				case 'center':
					selector.scrollTo({
						top: Math.abs(top) - (selector.offsetHeight / 2) + add,
						left: Math.abs(left) - (selector.offsetWidth / 2) + add,
						behavior: effect
					});
					break;
				
				case 'default':
				default :
					selector.scrollTo({
						top: Math.abs(top) + add,
						left: Math.abs(left) + add,
						behavior: effect
					});
			}
			this.checkEnd({
				selector : selector,
				nowTop : selector.scrollTop, 
				nowLeft : selector.scrollLeft,
				align : align,
				callback : callback,
				focus : focus
			});
		},
		checkEndTimer : {},
		checkEnd(opt) {
			const el_selector = opt.selector;
			const align = opt.align
			const focus = opt.focus
			const callback = opt.callback
			
			let nowTop = opt.nowTop;
			let nowLeft = opt.nowLeft;

			Global.scrollEvent.checkEndTimer = setTimeout(() => {
				//스크롤 현재 진행 여부 판단
				if (nowTop === el_selector.scrollTop && nowLeft === el_selector.scrollLeft) {
					clearTimeout(Global.scrollEvent.checkEndTimer);
					//포커스가 위치할 엘리먼트를 지정하였다면 실행
 					if (!!focus ) {
						focus.setAttribute('tabindex', 0);
						focus.focus();
					}
					//스크롤 이동후 콜백함수 실행
					if (!!callback) {
						if (typeof callback === 'string') {
							Global.callback[callback]();
						} else {
							callback();
						}
					}
				} else {
					nowTop = el_selector.scrollTop;
					nowLeft = el_selector.scrollLeft;

					Global.scrollEvent.checkEnd({
						selector: el_selector,
						nowTop: nowTop,
						nowLeft: nowLeft,
						align: align,
						callback: callback,
						focus: focus
					});
				}
			},100);
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