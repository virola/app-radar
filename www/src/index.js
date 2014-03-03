
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
// GeoLocation.init('browser'); 


