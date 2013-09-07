
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


var url = 'http://cq01-rdqa-dev005.cq01.baidu.com:8888/hackathon/map/index.php';

var query = {
    type: 'place',
    query: '餐馆',
    location: '',
    radius: '1000'
};

function debugMsg(msg) {
    $('#debug').append(msg + '<br>');
}

var GeoLocation = (function () {
    var exports = {};

    var location = {};

    var onSuccess = function(position) {
        showLocation(position);
    };

    function showLocation(position) {
        debugMsg('Latitude: '   + position.lat        + '\n'
            + 'Longitude: '     + position.lng        + '\n'
            + 'Speed: '         + position.speed      + '\n'
            + 'Addr:'           + position.addr
        );

        location.lat = position.lat;
        location.lng = position.lng;

        requestData(location);
    }

    function onError(error) {

        debugMsg('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    exports.init = function () {
        debugMsg('正在定位中...');

        if ( window.Location ) {
            debugMsg('BaiduLoction...');
            window.Location(onSuccess, onError);
        }
        else {
            if ( navigator.geolocation ) {
                navigator.geolocation.getCurrentPosition(onSuccess, onError, { 
                    maximumAge: 3000, 
                    timeout: 5000, 
                    enableHighAccuracy: true 
                });
            }
            else {
                debugMsg('没有这个功能。。。');
            }
        }
        
        
    };

    var list;

    function requestData() {
        var data = $.extend(query, {
            location: location.lat + ',' + location.lng
        });
        $.getJSON(url, data, function (res) {
            // todo
            if (!res.status) {
                list = res.results;

                alert(res.results.length);
            }
        });

        console.log(query);
    }

    return exports;

})();


app.on('deviceready', function () {
    GeoLocation.init();    
});

app.on('online', function () {
    alert('you are online!');    
});

app.initialize();
