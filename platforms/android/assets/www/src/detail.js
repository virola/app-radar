/**
 * 详情页模块
 * 
 * @type {Object}
 */
var detail = (function () {
    var exports = {};

    var url = util.getConfig('detailapi');

    var container;

    exports.init = function () {
        container = $('#detail-content');

        if (container && cacheData) {
            repaint(cacheData);
        }
    };

    var curUid = '';

    function requestDetail() {

        util.request(url, { uid: curUid }, function (res) {
            repaint(res);
        });
    }

    exports.render = function (uid) {
        curUid = uid;
        requestDetail();
    };

    var PAGE_TPL = ''
        + '<ul class="place-detail">'
        +     '<li class="detail-name">#{name}</li>'
        +     '<li>'
        +         '<label>电话：</label>'
        +         '<span><a href="tel:#{telephone}">#{telephone}</a></span>'
        +     '</li>'
        +     '<li><label>地址：</label><span>#{address}</span></li>'
        + '</ul>';

    var cacheData;

    function repaint(data) {
        // todo
        var html = util.format(PAGE_TPL, data);

        if (container) {
            container.html(html);
            cacheData = null;
        }
        else {
            cacheData = data;
        }
    }

    exports.clear = function () {
        container = null;
        cacheData = null;
    };

    return exports;
})();

app.on('pagechange', function (params) {

    if (params.filename == 'detail.html') {
        detail.init();
    }
    else {
        detail.clear();
    }
});