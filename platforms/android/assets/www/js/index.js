var radar = {};

var util = (function () {
    
    var exports = {};

    /**
     * 事件观察者
     * 
     * @constructor
     */
    function Observable() {
        this.events = {};
    }

    Observable.prototype = {
        constructor: Observable,
        on: function ( type, listener ) {
            if ( !(this.events[ type ] instanceof Array ) ) {
                this.events[ type ] = [];
            }

            this.events[ type ].push( listener );
        },

        un: function ( type, listener ) {
            var events = this.events[ type ];
            var len = events instanceof Array && events.length;

            while ( len-- ) {
                if ( events[ len ] === listener ) {
                    events.splice( len, 1 );
                }
            }
        },

        fire: function ( type, evt ) {
            var events = this.events[ type ];
            var me = this;
            if ( events instanceof Array ) {
                for ( var i = 0, len = events.length; i < len; i++) {
                    listener = events[i];
                    if ( typeof listener == 'function' ) {
                        listener.call( me, evt );
                    }
                }
            }
        }
    };

    exports.Observable = Observable;

    var MAPAPI = 'http://miao215.duapp.com/map/index.php';

    var CONFIG = {
        'mapapi': MAPAPI,
        'sumapi': MAPAPI + '?type=sum',
        'detailapi': MAPAPI + '?type=placedetail',

        'typeMap': {
            'scene'     : '景点',
            'shopping'  : '购物',
            'market'    : '超市',
            'food'      : '餐饮',
            'enjoy'     : '娱乐',
            'hotel'     : '酒店',
            'life'      : '生活',
            'groupon'   : '团购'
            
        },

        'typeConfig': {
            'scene': 'place',
            'shopping': 'place',
            'market': 'place',
            'food': 'place',
            'enjoy': 'place',
            'hotel': 'place',
            'life' : 'place',
            'groupon': 'tuangou'
        },

        'initialType': []
    };

    // key value 反置
    var tmpJson = {};

    for ( var i in CONFIG.typeMap ) {
        tmpJson[CONFIG.typeMap[i]] = i;
    }

    CONFIG.typeMapReverse = tmpJson;

    exports.getConfig = function (key) {
        return CONFIG[key] || '';
    };

    exports.request = function(url, query, callback) {
        url += (url.indexOf('?') > -1 ? '&' : '?') + 'jsoncallback=?';
        query.format = 'json';
        // query.cache = true;

        $.getJSON( url, query, {
            cache: true
        }).done(function(res) {
            if (!res.status) {

                callback(res.results || res.result);
            }
        });
    }

    var baiduStringFormat = function (source, opts) {
        source = String(source);
        var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
        if(data.length){
            data = data.length == 1 ? 
                /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
                (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
                : data;
            return source.replace(/#\{(.+?)\}/g, function (match, key){
                var replacer = data[key];
                // chrome 下 typeof /a/ == 'function'
                if('[object Function]' == toString.call(replacer)){
                    replacer = replacer(key);
                }
                return ('undefined' == typeof replacer ? '' : replacer);
            });
        }
        return source;
    };

    exports.format = baiduStringFormat;

    return exports;
   
})();

/**
 * 启动程序
 * 
 * @type {[type]}
 */
var app = (function() {
    var exports = new util.Observable();

    var events = [
        'deviceready',
        'online',
        'offline',
        'pause',
        'resume',
        'backbutton',
        'menubutton'
    ];

    exports.initialize = function() {
        bindEvents();
    };

    function bindEvents() {

        $.each(events, function (index, evName) {
            document.addEventListener(evName, bindDocumentEvent(evName), false);
        });

        $(document).bind('pagechange', function (event, data) {
            console.log(data);
            var url = $.mobile.path.parseUrl(data.absUrl);
            app.fire('pagechange', url);
        });
    }

    function bindDocumentEvent(id) {

        return function (e) {
            app.fire(id, e);
        };
        
    }

    return exports;
})();



window.Location = function(success,fail,act) {
	if (act) {
		var action = act;
	}
	else {
		var action = 'get';
	}

	if (cordova) {
		cordova.exec(function(pos){
			var errcode = pos.LocType;
			if(errcode == 61 || errcode == 65 || errcode == 161){
				success({
					lat: pos.Latitude,
					lng: pos.Longitude,
					locType: pos.LocType,
					accuracy: pos.Radius
				});
			}else{
				fail(errcode);
			}
		}, fail, "BaiduLocPlugin", action, []);
	}
	else {
		fail && fail('no cordova');
	}

    
};


var indexScroll = (function () {
    var exports = new util.Observable();

    var uiScroll;

    var pullDownEl = document.getElementById('pull-down');
    var pullUpEl = document.getElementById('pull-up');

    var downLabel = pullDownEl.querySelector('.pull-down-label');
    var upLabel = pullUpEl.querySelector('.pull-up-label');

    var mainDom = $('#main');

    exports.init = function () {
        document.addEventListener('touchmove', function (e) { 
            e.preventDefault(); 
        }, false);

        if ( !uiScroll ) {
            mainDom.css({
                left: 0,
                top: $('#index-header').outerHeight()
            });

            initScroll();
        }
    };

    exports.beforeReady = function () {
        $(pullDownEl).hide();
        $(pullUpEl).hide();
    };

    exports.ready = function () {
        $(pullDownEl).show();
        $(pullUpEl).show();
    }

    function initScroll() {
        var pullDownOffset = pullDownEl.offsetHeight;
        var pullUpOffset = pullUpEl.offsetHeight;

        var downText = '上拉刷新列表...^_^';
        var downTextEdge = '释放即可刷新...^_~';

        var upText = '下拉加载更多...^_~';

        var loadingText = '正在加载请稍后...O_O';
        
        uiScroll = new iScroll('main', {
            useTransition: true,
            topOffset: pullDownOffset,
            onRefresh: function () {
                if (pullDownEl.className.match('loading')) {
                    pullDownEl.className = '';
                    downLabel.innerHTML = downText;
                } else if (pullUpEl.className.match('loading')) {
                    pullUpEl.className = '';
                    upLabel.innerHTML = upText;
                }
            },
            onScrollMove: function () {
                if (this.y > 5 && !pullDownEl.className.match('flip')) {
                    pullDownEl.className = 'flip';
                    downLabel.innerHTML = downTextEdge;
                    this.minScrollY = 0;
                } else if (this.y < 5 && pullDownEl.className.match('flip')) {
                    pullDownEl.className = '';
                    downLabel.innerHTML = downText;
                    this.minScrollY = -pullDownOffset;
                } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
                    pullUpEl.className = 'flip';
                    upLabel.innerHTML = downTextEdge;
                    this.maxScrollY = this.maxScrollY;
                } else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
                    pullUpEl.className = '';
                    upLabel.innerHTML = upText;
                    this.maxScrollY = pullUpOffset;
                }
            },
            onScrollEnd: function () {

                if (pullDownEl.className.match('flip')) {
                    pullDownEl.className = 'loading';
                    downLabel.innerHTML = loadingText;                
                    pullDownAction();   
                } else if (pullUpEl.className.match('flip')) {
                    pullUpEl.className = 'loading';
                    upLabel.innerHTML = loadingText;                
                    pullUpAction(); 
                }
            }
        });
    }

    function pullDownAction() {
        exports.fire('pullDown', {
            ui: uiScroll
        });

    }

    function pullUpAction () {
        exports.fire('pullUp', {
            ui: uiScroll
        });

    }

    exports.refresh = function () {
        uiScroll.refresh();
    };


    return exports;
})();



/**
 * 首页列表
 * 
 * @type {Object}
 */
var indexList = (function () {
    var exports = {};

    exports.init = function () {
        $('#content').click(function (e) {
            var item = e.target;
            if (item.tagName == 'A') {
                item = item.parentNode;
                var uid = item.getAttribute('data-id');

                detail.render(uid);
            }
        });
    };

    var TPL_ITEM = ''
        + '<li class="#{type}" data-id="#{uid}">'
        +     '<a href="detail.html?uid=#{uid}" data-rel="page">'
        +         '<h3>#{name}</h3>'
        +         '<span class="#{level}">#{tag}</span>'
        +         '<span class="#{tel}"></span>'
        +         '<span class="#{rate}"></span>'
        +         '<span class="#{coupon}"></span>'
        +         '<span class="distance">#{distance}</span>'
        +     '</a>'
        + '</li>';

    function getHtmlByData(data) {
        var html = [];

        $.each(data, function (index, item) {
            var key = util.getConfig('typeMapReverse')[item.type];

            var place = {
                uid: item.uid,
                name: item.name,
                distance: unitFormat(item.distance),
                type: key || curType,
                tel: item.telephone ? 'tel' : '',
                coupon: (item.events && item.events.length) ? 'coupon' : ''
            };

            html[index] = util.format(TPL_ITEM, place);
        });

        return html.join('');
    }

    exports.refresh = function (data) {

        var result = getHtmlByData(data);

        if (!result) {
            result = '<li class="no-data-block">真遗憾，附近都没有可以推荐的地方耶~</li>'
        }

        $('#rec-list').html(result);
    };

    var listContainer = $('#content');

    var currentPage = 0;

    var curType = '';

    exports.setType = function (type) {
        if ( curType !== type ) {
            currentPage = 0;
            curType = type;
        }
    };

    function loadPage(page, callback) {

        if ( curType ) {
            GeoLocation.requestType({
                type : curType,
                page: page
            }, function (res) {
                console.log(res);

                // exports.refresh(res.list);
            });
        }
        else {
            GeoLocation.requestAll(page, function (res) {
                var list = res.list;

                var ul = $('<ul class="rec-list" data-page="' + page + '"></ul>');
                listContainer.append(ul);

                indexList.append(list, ul);

                callback(res);
            });
        }

        

    };

    exports.loadNextPage = function (callback) {
        currentPage++;

        loadPage(currentPage, callback);
    };

    exports.append = function (data, container) {
        var result = getHtmlByData(data);

        if (!result) {
            result = '<li class="data-end-block">-------END-------</li>'
        }

        $(container).html(result);
    };

    function unitFormat(value) {
        if ( value > 1000 ) {
            return Math.round( value / 100 ) / 10 + 'km';
        }
        else {
            return Math.round( value ) + 'm';
        }
    }

    return exports;
})();

/**
 * 详情页模块
 * 
 * @type {Object}
 */
var detail = (function () {
    var exports = {};

    var url = util.getConfig('detailapi');

    var container;

    exports.init = function () {
        container = $('#detail-content');

        if (container && cacheData) {
            repaint(cacheData);
        }
    };

    var curUid = '';

    function requestDetail() {

        util.request(url, { uid: curUid }, function (res) {
            repaint(res);
        });
    }

    exports.render = function (uid) {
        curUid = uid;
        requestDetail();
    };

    var PAGE_TPL = ''
        + '<ul class="place-detail">'
        +     '<li class="detail-name">#{name}</li>'
        +     '<li>'
        +         '<label>电话：</label>'
        +         '<span><a href="tel:#{telephone}">#{telephone}</a></span>'
        +     '</li>'
        +     '<li><label>地址：</label><span>#{address}</span></li>'
        + '</ul>';

    var cacheData;

    function repaint(data) {
        // todo
        var html = util.format(PAGE_TPL, data);

        if (container) {
            container.html(html);
            cacheData = null;
        }
        else {
            cacheData = data;
        }
    }

    exports.clear = function () {
        container = null;
        cacheData = null;
    };

    return exports;
})();

app.on('pagechange', function (params) {

    if (params.filename == 'detail.html') {
        detail.init();
    }
    else {
        detail.clear();
    }
});

// list page
var GeoLocation = (function () {
    var exports = {};

    var QUERY_MAP = util.getConfig('typeMap');

    var TPL_LOADING = '<li class="no-data-block ui-loading">雷达正在探测中...</li>';

    var location = {};

    var MODE = '';

    exports.refreshPos = function (callback) {
        callback = callback || new Function();

        if ( MODE != 'browser' && window.Location ) {
            window.Location(function (pos) {
                showLocation(pos, callback);
            }, onError);
        }
        else {
            if ( navigator.geolocation ) {
                navigator.geolocation.getCurrentPosition(function (pos) {
                    showLocation({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                            accuracy: pos.coords.accuracy
                        }, callback);

                    
                }, onError);
            }
            else {
                alert('没有定位功能呢。。。');
            }
        }
    };

    function onError(error) {

        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    exports.init = function (mode) {
        MODE = mode || '';

        $('#rec-list').html(TPL_LOADING);
        exports.refreshPos(function (res) {
            indexScroll.init();

            $('#begin-loading').hide();
        });
    };


    function showLocation(position, callback) {
        callback = callback || new Function();

        location.lat = Math.round(position.lat * 100) / 100;
        location.lng = Math.round(position.lng * 100) / 100;

        requestAllData(0, function (res) {
            var list = res.list;
            indexList.refresh(list);

            callback(res);
            
        });

        bindFrameEvents();
    }

    /**
     * 取某个分类下的数据
     */
    function requestType(params, callback) {
        callback = callback || new Function();

        var type = params.type || '';
        var page = params.page || 0;
        var url = util.getConfig('mapapi');
        var mapType = util.getConfig('typeConfig');
        var queryMap = util.getConfig('typeMap');

        if (!type) {
            return;
        }

        var data = {
            type: mapType[type],
            query: queryMap[type],
            location: location.lat + ',' + location.lng,
            page_num: page || 0
        };

        util.request(url, data, function (res) {
            callback(res);
        });
    }

    exports.requestType = requestType;


    function requestAllData(page, callback) {
        callback = callback || new Function();

        var url = util.getConfig('sumapi');
        var data = {
            location: location.lat + ',' + location.lng,
            page_num: page || 0
        };
        

        util.request(url, data, function (res) {
            callback(res);
        });
    }

    exports.requestAll = requestAllData;

    function bindFrameEvents() {
        var exitTime = 0;
        var timer;

        app.on('backbutton', function () {
            exitTime++;

            timer = setTimout( function () {
                if (exitTime > 1) {
                    clearTimeout(timer);
                    navigator.app.exitApp();
                }
            }, 1000 );
            
        });

        app.on('menubutton', function () {
            $( "#left-panel" ).panel( "toggle" );
        });


        bindPanels();
    }

    function bindPanels() {
        $('#left-panel ul li a').click(function (e) {
            var me = $(this);
            var type = me.attr('data-type');

            if (type && me.attr('data-rel') == 'index') {
                console.log(type);

                indexList.setType(type);
                requestType({
                    type : type,
                    page : 0
                }, function (res) {
                    indexList.refresh(res);
                    indexScroll.refresh();

                    // 收起来左侧栏
                    $('#left-panel').panel('close');
                });
            }
            else {
                // nothing
            }
        });
    }

    return exports;

})();


/**
 * 页面初始化的所有参数
 */

app.on('deviceready', function () {
    navigator.splashscreen.hide();

    GeoLocation.init();    
});

app.on('online', function () {
    // alert('you are online!');    
});

app.on('offline', function () {
    // stop lbs
    window.Location(function(result) {
        alert('you are offline!');
    }, function () {}, 'stop');
});


$(function () {
    app.initialize();

    // $.mobile.loadPage('detail.html', true);
    
    $.mobile.defaultTransition = 'none';

    indexList.init();

    indexScroll.on('pullDown', function (obj) {
        var uiScroll = obj.ui;

        GeoLocation.refreshPos(function (res) {
            var list = res.list;

            indexList.refresh(list);
            uiScroll.refresh();
        });
    });

    indexScroll.on('pullUp', function (obj) {
        var uiScroll = obj.ui;
        indexList.loadNextPage(function () {
            uiScroll.refresh();
        });
    });

});

// // test in browser
GeoLocation.init('browser'); 
