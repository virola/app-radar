
/**
 * 首页列表
 * 
 * @type {Object}
 */
var indexList = (function () {
    var exports = {};

    var TPL_ITEM = ''
        + '<li class="#{type}" data-id="#{uid}">'
        +     '<a href="#detail" data-rel="detail">'
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

    var listContainer = $('#content');

    var currentPage = 0;

    function loadPage(page, callback) {

        GeoLocation.requestAll(page, function (res) {
            var list = res.list;

            var ul = $('<ul class="rec-list" data-page="' + page + '"></ul>');
            listContainer.append(ul);

            indexList.append(list, ul);

            callback(res);
        });

    };

    exports.loadNextPage = function (callback) {
        currentPage++;

        loadPage(currentPage, callback);
    };

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
