

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


