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

    var CONFIG = {
        'mapapi': 'http://cq01-rdqa-dev005.cq01.baidu.com:8888/hackathon/map/index.php',

        'sumapi': 'http://cq01-rdqa-dev005.cq01.baidu.com:8888/hackathon/map/index.php?type=sum',

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

        return function () {
            app.fire(id);
        };
        
    }

    return exports;
})();


