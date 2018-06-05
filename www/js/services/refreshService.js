(function () {
    'use strict';

    angular.module("starter.services")
        .factory("Refresh", Refresh);

    Refresh.$inject = ['$http', '$timeout'];

    function Refresh($http, $timeout) {

        var currentContent;

        var timer;

        var onPulling = false;

        var refreshStart = false;

        var services = {
            onPullDown: _onPullDown,
            onScrollTop: _onScrollTop,
            onRefreshComplete: _onRefreshComplete
        };

        var refreshAnimation = {
            startCover: false,
            startAnimation: false,
            stopAnimation: false,
            rotate: false,
            toPoint: false
        };

        var animation = {
          toPoint: 'animate',
          rotate: 'infinite-animation'
        };

        return services;

        /**
         * 下拉刷新操作
         * @param content 当前content选择器
         * @private
         */
        function _onPullDown(content) {
            var numBox;
            onPulling = true;
            currentContent = document.querySelector(content);
            if(!currentContent)
                return;

            numBox = currentContent.querySelector('.refresh-num-box');
            refreshAnimation.startCover = true;
            if(numBox && !numBox.classList.contains(animation.rotate)){
                currentContent.addEventListener('touchmove', _onTouchMove, false);
                currentContent.addEventListener('touchend', _onTouchEnd, false);
            }
        }

        /**
         * touch结束触发事件
         * @private
         */
        function _onTouchEnd() {
            var scroll = currentContent.querySelector('div.scroll');
            if(!scroll)
                return;

            var coverPanel = scroll.querySelector('.refresh-box .cover-panel');
            var refreshTextBox = scroll.querySelector('.refresh-text-box');
            var numBox = scroll.querySelector('.refresh-num-box');
            if(refreshTextBox && coverPanel){
                var refreshTextBoxWidth = parseInt(getComputedStyle(refreshTextBox).width);
                var panelWidth = parseInt(getComputedStyle(coverPanel).width);
            }
            refreshAnimation.startAnimation = true;
            if(!refreshAnimation.stopAnimation && numBox && !refreshAnimation.rotate){
                if(panelWidth <= refreshTextBoxWidth && coverPanel){

                    coverPanel.style.width = refreshTextBoxWidth + 'px';

                    $timeout(function(){
                        if(!refreshStart){
                            numBox.classList.add(animation.toPoint);
                            refreshAnimation.toPoint = true;
                        }
                    }, 300);
                    $timeout(function(){
                        if(refreshAnimation.toPoint){
                            numBox.classList.remove(animation.toPoint);
                            numBox.classList.add(animation.rotate);
                            refreshAnimation.rotate = true;
                        }
                    }, 690);
                }
            }
            currentContent.removeEventListener('touchmove', _onTouchMove, false);
            currentContent.removeEventListener('touchend', _onTouchEnd, false);
        }

        /**
         * 下拉过程中触发事件
         * @private
         */
        function _onTouchMove(){
            var scroll = currentContent.querySelector('div.scroll');
            if(!scroll)
                return;

            var coverPanel = scroll.querySelector('.refresh-box .cover-panel');
            var refreshBox = scroll.querySelector('div.refresh-box');
            if(refreshBox){
                var refreshTextBoxWidth;
                var refreshTextBox = refreshBox.querySelector('.refresh-text-box');
                if(refreshTextBox) refreshTextBoxWidth = parseInt(getComputedStyle(refreshTextBox).width);
                var boxHeight = parseInt(getComputedStyle(refreshBox).height);
                var distanceY = getComputedStyle(scroll).transform;
            }
            if(coverPanel && refreshTextBoxWidth !== null && distanceY !== null && boxHeight !== null){
                var mat = distanceY.match(/^matrix\((.+)\)$/);
                var distance = mat ? parseFloat(mat[1].split(', ')[5]) : 0;
                if (refreshAnimation.startCover && !refreshAnimation.rotate && !refreshAnimation.startAnimation){
                    var width = (distance - boxHeight);
                    coverPanel.style.width = width > refreshTextBoxWidth ? (refreshTextBoxWidth + 'px') : width + 'px';
                }
                refreshAnimation.stopAnimation = distance < 45;
            }
        }

        /**
         * 下拉操作结束后滚动事件
         * @private
         */
        function _onScrollTop(){
            var scroll;
            if(currentContent){
                scroll = currentContent.querySelector('div.scroll');
                if(scroll){
                    var distanceY = getComputedStyle(scroll).transform;
                    var mat = distanceY.match(/^matrix\((.+)\)$/);
                    var distance = mat ? parseFloat(mat[1].split(', ')[5]) : 0;
                    if(distance == 0){
                        _recoveryStatus();
                    }
                }
            }
        }

        /**
         * 恢复下拉刷新图标最初状态
         * @private
         */
        function _recoveryStatus(){
            if(currentContent){
                var scroll = currentContent.querySelector('div.scroll');
                if(scroll){
                    var numBox = scroll.querySelector('.refresh-num-box');
                    var coverPanel = scroll.querySelector('.refresh-box .cover-panel');
                    if(numBox && coverPanel){
                        numBox.classList.remove(animation.toPoint);
                        numBox.classList.remove(animation.rotate);
                        coverPanel.style.width = 0;
                        refreshStart = true;
                        for(var i in refreshAnimation){
                            if(refreshAnimation.hasOwnProperty(i)){
                                refreshAnimation[i] = false;
                            }
                        }
                        $timeout(function(){
                            refreshStart = false;
                        }, 300);
                    }
                }
            }
        }

        /**
         * 刷新完成事件
         * @private
         */
        function _onRefreshComplete(){
            if(timer !== null) $timeout.cancel(timer);

            timer= $timeout(function(){
                _onScrollTop();
            }, 1000);
        }
    }

} ());

