
var indexScroll = (function () {
    var exports = new util.Observable();

    var uiScroll;

    var pullDownEl = document.getElementById('pull-down');
    var pullUpEl = document.getElementById('pull-up');

    var downLabel = pullDownEl.querySelector('.pull-down-label');
    var upLabel = pullUpEl.querySelector('.pull-up-label');

    exports.init = function () {
        document.addEventListener('touchmove', function (e) { 
            e.preventDefault(); 
        }, false);

        if ( !uiScroll ) {
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

        var downText = '上拉刷新列表。。。';
        var downTextEdge = '释放刷新列表。。。';

        var upText = '下拉加载更多。。。';

        var loadingText = '加载请稍后。。。';
        
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
                } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
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
                    pullDownAction();   // Execute custom function (ajax call?)
                } else if (pullUpEl.className.match('flip')) {
                    pullUpEl.className = 'loading';
                    upLabel.innerHTML = loadingText;                
                    pullUpAction(); // Execute custom function (ajax call?)
                }
            }
        });
        
        // setTimeout(function () { 
        //     document.getElementById('wrapper').style.left = '0'; 
        // }, 800);
    }


    var generatedCount = 0;

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


    return exports;
})();

