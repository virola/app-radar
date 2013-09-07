

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

    var location = {};

    var onSuccess = function(position) {
        showLocation(position);
    };

    function showLocation(position) {
        debugMsg('Latitude: '   + position.lat        + '<br>'
            + 'Longitude: '     + position.lng        + '<br>'
            + 'Accuracy: '      + position.accuracy   + '<br>'
        );

        location.lat = position.lat;
        location.lng = position.lng;

        requestAllData(location);

        bindFrameEvents();
    }

    function onError(error) {

        debugMsg('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    exports.init = function (mode) {
        debugMsg('正在定位中...');

        if ( mode != 'browser' && window.Location ) {
            window.Location(onSuccess, onError);
        }
        else {
            if ( navigator.geolocation ) {
                navigator.geolocation.getCurrentPosition(function (loc) {
                    onSuccess({
                        lat: loc.coords.latitude,
                        lng: loc.coords.longitude,
                        accuracy: loc.coords.accuracy
                    });
                }, onError);
            }
            else {
                debugMsg('没有定位功能呢。。。');
            }
        }
        
        
    };

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

    function requestAllData(loc, page) {
        var url = util.getConfig('sumapi');
        var data = {
            location: loc.lat + ',' + loc.lng,
            page: page || 0
        };
        

        util.request(url, data, function (res) {
            var group = res.tuangou;
            var place = res.place;
            var list = res.list;
            console.log(list);

            indexList.refresh(list);
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




app.on('deviceready', function () {
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


app.initialize();


// test in browser
GeoLocation.init('browser'); 


/**
 * 首页列表
 * 
 * @type {Object}
 */
var indexList = (function () {
    var exports = {};

    var TPL_ITEM = ''
        + '<li class="#{type}" data-id="#{uid}">'
        +     '<a href="#detail">'
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

    exports.loadPage = function (page) {



        $('#rec-list').after('<ul class="rec-list" data-page="' + page + '"></ul>');
    };


    var TPL_LOADING = '<li class="no-data-block ui-loading">正在加载数据...</li>';

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

