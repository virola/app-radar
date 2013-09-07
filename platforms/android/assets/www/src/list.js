
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
