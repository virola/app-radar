
var indexScroll = (function () {
    var exports = new util.Observable();

    var uiScroll;

    var pullDownEl = document.getElementById('pull-down');
    var pullUpEl = document.getElementById('pull-up');

    var downLabel = pullDownEl.querySelector('.pull-down-label');
    var upLabel = pullUpEl.querySelector('.pull-up-label');

    var mainDom = $('#main');

    exports.init = function () {
        document.addEventListener('touchmove', function (e) { 
            e.preventDefault(); 
        }, false);

        if ( !uiScroll ) {
            mainDom.css({
                left: 0,
                top: $(mainDom).prev().outerHeight()
            });

            initScroll();
        }
    };

    exports.beforeReady = function () {
        $(pullDownEl).hide();
        $(pullUpEl).hide();
    };

    exports.ready = function () {
        $(pullDownEl).show();
        $(pullUpEl).show();
    }

    function initScroll() {
        var pullDownOffset = pullDownEl.offsetHeight;
        var pullUpOffset = pullUpEl.offsetHeight;

        var downText = '上拉刷新列表...^_^';
        var downTextEdge = '释放即可刷新...^_~';

        var upText = '下拉加载更多...^_~';

        var loadingText = '正在加载请稍后...O_O';
        
        uiScroll = new iScroll('main', {
            useTransition: true,
            topOffset: pullDownOffset,
            onRefresh: function () {
                if (pullDownEl.className.match('loading')) {
                    pullDownEl.className = '';
                    downLabel.innerHTML = downText;
                } else if (pullUpEl.className.match('loading')) {
                    pullUpEl.className = '';
                    upLabel.innerHTML = upText;
                }
            },
            onScrollMove: function () {
                if (this.y > 5 && !pullDownEl.className.match('flip')) {
                    pullDownEl.className = 'flip';
                    downLabel.innerHTML = downTextEdge;
                    this.minScrollY = 0;
                } else if (this.y < 5 && pullDownEl.className.match('flip')) {
                    pullDownEl.className = '';
                    downLabel.innerHTML = downText;
                    this.minScrollY = -pullDownOffset;
                } else if (this.y > 0 && this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
                    pullUpEl.className = 'flip';
                    upLabel.innerHTML = downTextEdge;
                    this.maxScrollY = this.maxScrollY;
                } else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
                    pullUpEl.className = '';
                    upLabel.innerHTML = upText;
                    this.maxScrollY = pullUpOffset;
                }
            },
            onScrollEnd: function () {

                if (pullDownEl.className.match('flip')) {
                    pullDownEl.className = 'loading';
                    downLabel.innerHTML = loadingText;                
                    pullDownAction();   
                } else if (pullUpEl.className.match('flip')) {
                    pullUpEl.className = 'loading';
                    upLabel.innerHTML = loadingText;                
                    pullUpAction(); 
                }
            }
        });
    }

    function pullDownAction() {
        exports.fire('pullDown', {
            ui: uiScroll
        });

    }

    function pullUpAction () {
        exports.fire('pullUp', {
            ui: uiScroll
        });

    }

    exports.refresh = function () {
        uiScroll.refresh();
    };


    return exports;
})();

