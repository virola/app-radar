
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


