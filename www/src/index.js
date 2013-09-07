

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

    var url = 'http://cq01-rdqa-dev005.cq01.baidu.com:8888/hackathon/map/index.php';

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

        requestData(location);
    }

    function onError(error) {

        debugMsg('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    exports.init = function () {
        debugMsg('正在定位中...');

        if ( window.Location ) {
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
                debugMsg('没有定位功能呢。。。');
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

        bindFrameEvents();
    }

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