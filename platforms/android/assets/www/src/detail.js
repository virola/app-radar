
var detail = (function () {
    var exports = {};

    var url = util.getConfig('detailapi');

    exports.get = function (uid) {

        util.request(url, {
            uid: uid
        }, function (res) {
            console.log(res);
        });
    };

    return exports;
})();