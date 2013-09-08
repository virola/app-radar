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
            'groupon'   : '团购',
            'life'      : '生活'
        },

        'typeConfig': {
            'scene': 'place',
            'shopping': 'place',
            'market': 'place',
            'food': 'place',
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

                callback(res.results);
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

    exports.init = function () {
        document.addEventListener('touchmove', function (e) { 
            e.preventDefault(); 
        }, false);

        if ( !uiScroll ) {
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

        var downText = '上拉刷新列表。。。';
        var downTextEdge = '释放刷新列表。。。';

        var upText = '下拉加载更多。。。';

        var loadingText = '加载请稍后。。。';
        
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
                    pullDownAction();   // Execute custom function (ajax call?)
                } else if (pullUpEl.className.match('flip')) {
                    pullUpEl.className = 'loading';
                    upLabel.innerHTML = loadingText;                
                    pullUpAction(); // Execute custom function (ajax call?)
                }
            }
        });
        
        // setTimeout(function () { 
        //     document.getElementById('wrapper').style.left = '0'; 
        // }, 800);
    }


    var generatedCount = 0;

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


    return exports;
})();



/**
 * 首页列表
 * 
 * @type {Object}
 */
var indexList = (function () {
    var exports = {};

    var TPL_ITEM = ''
        + '<li class="#{type}" data-id="#{uid}">'
        +     '<a href="#detail" data-rel="detail">'
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
                type: key || '',
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

    function loadPage(page, callback) {

        GeoLocation.requestAll(page, function (res) {
            var list = res.list;

            var ul = $('<ul class="rec-list" data-page="' + page + '"></ul>');
            listContainer.append(ul);

            indexList.append(list, ul);

            callback(res);
        });

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



app.on('deviceready', function () {
    document.querySelector('.listening').style.display = 'none';

    $.mobile.navigate('#index');
});


function debugMsg(msg) {
    $('#debug').html(msg);
}


// list page
var GeoLocation = (function () {
    var exports = {};

    var QUERY_MAP = util.getConfig('typeMap');

    var query = {
        type: 'place',
        query: '餐馆',
        location: '',
        radius: '1000'
    };

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
        MODE = mode;

        $('#rec-list').html(TPL_LOADING);
        exports.refreshPos(function (res) {
            indexScroll.ready();

            indexScroll.init();
        });
    };


    function showLocation(position, callback) {
        callback = callback || new Function();

        location.lat = position.lat;
        location.lng = position.lng;

        requestAllData(0, function (res) {
            var list = res.list;
            console.log(list);

            indexList.refresh(list);

            callback(res);
            
        });

        bindFrameEvents();
    }

    /**
     * 取某个分类下的数据
     * 
     * @param {[type]} type [type description]
     * @return {[type]} [return description]
     */
    function requestType(type) {
        type = type || 'market';
        var url = util.getConfig('mapapi');

        var mapType = util.getConfig('typeConfig');

        var data = {
            type: mapType[type],
            location: location.lat + ',' + location.lng
        };

        util.request(url, data, function (res) {
            console.log(res);
        });
    }

    exports.requestType = requestType;

    function requestAllData(page, callback) {
        callback = callback || new Function();

        var url = util.getConfig('sumapi');
        var data = {
            location: location.lat + ',' + location.lng,
            page: page || 0
        };
        

        util.request(url, data, function (res) {
            callback(res);
        });
    }

    exports.requestAll = requestAllData;

    function bindFrameEvents() {

        if (window.location.hash == '#index') {
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


            // 翻页请求
            
        }
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

    $.mobile.loadPage('detail.html', true);

    $( window ).on( "navigate", function( event, data ) {
        console.log(data);
    });

    indexScroll.beforeReady();

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

// test in browser
GeoLocation.init('browser'); 


