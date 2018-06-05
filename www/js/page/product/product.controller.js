/**
 * Created by lujin on 2016/7/5.
 */
(function () {
    'use strict';

    angular.module('10Style.product')
        .controller('ProductCtrl', ProductCtrl);
    ProductCtrl.$inject = ["$scope", "$rootScope", "$stateParams", "$ionicSlideBoxDelegate",
        "$ionicScrollDelegate", "Product", "Favorite", "MyRouter", "SKU_STATE", "$timeout",
        "toast", "Loading", "Helper", "ModalService", "Config", "$ionicHistory"
    ];

    function ProductCtrl($scope, $rootScope, $stateParams, $ionicSlideBoxDelegate,
        $ionicScrollDelegate, Product, Favorite, MyRouter, SKU_STATE, $timeout,
        toast, Loading, Helper, ModalService, Config, $ionicHistory) {

        var TOP_SCROLL_HEIGHT = 200;
        var TOP_OPACITY = 0.95;

		/**
		 * 轮播图模块
		 */
        var modal = null;
        var top = 0;

		/**
		 * 轮播图缩放和滑动的变量
		 */
        var position = null;
        var left = 0;
        var zoom = 1;
        var width = 0;
        var isAbleLeftSlide = false;
        var isAbleRightSlide = false;
        var prevClientX = 0;
        var nowClientX = 0;
        var isToLeft = false;
        var isToRight = false;
        var isAbleScrollY = null;
        var durationTime = 0;


        var throttled = null;                       //延迟变量

        $scope.slideIndex = 0;

        $scope.collectGoods = false;                //商品是否已经收藏

        $scope.opacity = {};

        $scope.favorite = null;

        $scope.isModalShow = false;

        $scope.isShelved = false;                       //商品是否已下架

        $scope.isOrder = null;                      //是否预定

        $scope.isMoreDetailShow = false;            //是否显示更多按钮内容

        $scope.isProductMove = false;               //商品是否移动到购物车

        $scope.showProductAttribute = Config.SHOW_PRODUCT_ATTRIBUTE;  //是否显示商品活动属性

        $scope.productId = 0;

        $scope.selectProductCount = 0;

        $scope.onShowModalBtnClick = onShowModalBtnClick;

        $scope.onToggleMoreDetailShowClick = onToggleMoreDetailShowClick;

        $scope.back = back;

        $scope.onContentScrolling = onContentScrolling;

        $scope.goHome = goHome;

        $scope.isShowRecommend = isShowRecommend;

        $scope.showImageModal = showImageModal;

        $scope.hideImageModal = hideImageModal;

        $scope.onProductCollectBtnClick = onProductCollectBtnClick;

        $scope.slideHasChanged = slideHasChanged;

        $scope.onCartBtnClick = onCartBtnClick;

        $scope.onGotoHomeBtnClick = onGotoHomeBtnClick;                             //回到首页按钮

        $scope.onGotoMessageBtnClick = onGotoMessageBtnClick;

        $scope.onScrollTopBtnClick = onScrollTopBtnClick;                           //滚动到顶部按钮

        $scope.onGotoProductBtnClick = onGotoProductBtnClick;

        $scope.buyProductsImmediately = buyProductsImmediately;

        $scope.isProductAttribute = isProductAttribute;

        // 播放器相关代码
        var _player;
        var _timeoutId;
        var _videoWasPlaying = false;

        $scope.player = {
            durationTime: 0,
            remainingTime: 0,
            currentTime: 0,
            play: play,
            pause: pause,
            isPlaying: isPlaying,
            displayVideoTime: function () {
                return Helper.Time.format(this.durationTime);
            },
            displayPlayingTime: function () {
                return Helper.Time.format(this.currentTime);
            },
            caclProgress: function () {
                return (1 - (this.remainingTime / this.durationTime)) * 100;
            },

            onProgressBarTouchStartHandle: _onProgressBarTouchStartHandle,
            onProgressBarTouchMoveHandle: _onProgressBarTouchMoveHandle,
            onProgressBarTouchEndHandle: _onProgressBarTouchEndHandle,
            onVideoContainerClickHandle: _onVideoContainerClickHandle
        };



        _init();

        ///////////////////私有方法//////////////////////

		/**
		 * 初始化方法
		 */
        function _init() {

            width = document.body.offsetWidth;
            $scope.productId = $stateParams.id;

            var timeout = $timeout(function () {
                modal = document.querySelector('ion-view[nav-view="active"] #product-modal-' + $scope.productId);
                $timeout.cancel(timeout);
            }, 500);


            throttled = Helper.Throttle.bind(_setSlideEnableState, 100, 100);

            $scope.$on('$ionicView.beforeEnter', _onViewBeforeEnterHandle);

            $scope.$on('$ionicView.enter', _onViewEnterHandle);

            $scope.$on('$ionicView.beforeLeave', _onViewBeforeLeaveHandle);

        }

        function _initVideo() {
            if (!$scope.productId || !$scope.product.video) return;

            var selector = 'ion-view:not([nav-view="cached"]) #video-container-product-' + $scope.productId;

            var node = document.querySelector(selector);

            if (!node) return;

            var videoHtml = '<video id="video" class="video-js" preload="metadata" playsinline webkit-playsinline '
                + 'poster="' + $scope.product.video_poster + '">'
                + '<source src="' + $scope.product.video + '" type="video/mp4" />'
                + '</video>';

            node.insertAdjacentHTML('afterbegin', videoHtml);

            $scope.poster = $scope.product.video_poster;

            $scope.$evalAsync(function () {
                $scope.player.isProgressBarHide = false;
                $scope.player.isNotPlayed = true;
                $scope.player.isEnd = false;
            });

            _player = videojs(node.firstElementChild);

            _bindVideoEvent();
        }

        function play() {
            if (!_player || !_player.play) return;

            $scope.player.isNotPlayed = false;
            $scope.player.isEnd = false;
            $scope.player.isProgressBarHide = false;

            _player.play();
        }

        function pause() {
            if (!_player || !_player.pause) return;

            _player.pause();
        }

        function isPlaying() {
            if (!_player) return false;

            return !_player.paused();
        }

        function _onVideoPlayEndEventHandle() {
            $scope.player.isEnd = true;
            $scope.player.isProgressBarHide = false;
        }


        function _onVideoContainerClickHandle() {
            isPlaying() ? pause() : play();

            _clearTimeoutTask();

            $scope.player.isProgressBarHide = false;
        }

        function _onProgressBarTouchStartHandle(event) {
            if (!_player) return;

            if (event.currentTarget.className === "progress-bar") {
                _clearTimeoutTask();

                _player.scrubbing(true);

                _videoWasPlaying = !_player.paused();
                _player.pause();

                event.stopPropagation();
            }
        }

        function _onProgressBarTouchMoveHandle(event) {
            if (!_player) return;

            if (event.currentTarget.className === "progress-bar") {
                var rect = event.currentTarget.getBoundingClientRect();
                var offsetX = event.targetTouches[0].pageX - rect.left;

                var newTime = _player.duration() * offsetX / event.currentTarget.offsetWidth;

                $scope.player.isEnd = false;

                if (newTime >= _player.duration()) {
                    newTime = _player.duration() - 0.1;
                }

                _player.currentTime(newTime);

                event.stopPropagation();
            }
        }

        function _onProgressBarTouchEndHandle(event) {
            if (!_player) return;

            if (event.currentTarget.className === "progress-bar") {
                _player.scrubbing(false);
                if (_videoWasPlaying) {
                    _player.play();
                }

                event.stopPropagation();
            }
        }

        function _bindVideoEvent() {
            _player.one('loadedmetadata', function () {
                _updateDurationTime(this.duration());
                _updateRemainingTime(this.duration());

                if (_player)
                    _player.currentTime($scope.player.currentTime);

            });

            _player.one('durationchange', function () {
                _updateRemainingTime(this.remainingTime());
            });

            _player.on('ended', function () {
                _onVideoPlayEndEventHandle()
            });

            _player.on('timeupdate', function () {
                _updateRemainingTime(this.remainingTime());
                _updateCurrentTime(this.currentTime());

                _hideProgressBar();
            });
        }


        function _updateDurationTime(seconds) {
            $scope.$evalAsync(function () {
                $scope.player.durationTime = seconds;
            });
        }

        function _updateRemainingTime(seconds) {
            $scope.$evalAsync(function () {
                $scope.player.remainingTime = seconds;
            });
        }

        function _updateCurrentTime(seconds) {
            $scope.$evalAsync(function () {
                $scope.player.currentTime = seconds;
            });
        }


        function _hideProgressBar() {
            if (_timeoutId || $scope.player.isProgressBarHide || !isPlaying()) return;

            _timeoutId = setTimeout(function () {
                $scope.player.isProgressBarHide = true;
                _clearTimeoutTask();
            }, 3000);
        }

        function _clearTimeoutTask() {
            if (_timeoutId) {
                clearTimeout(_timeoutId);
                _timeoutId = undefined;
            }
        }

        /**
         * 页面进入的事件处理
         * @param event
         * @param data
         * @private
         */
        function _onViewBeforeEnterHandle(event, data) {
            if(!data){
                return;
            }

            $scope.isCurrentPageActived = true;
            var backView = $ionicHistory.backView();
            var isBackFromOrderDetail = false;

            if(data.direction === 'back' && backView && backView.url && backView.url.indexOf('orders')>-1){
                isBackFromOrderDetail = true;
            }
            if (data.direction === "forward" || data.direction === "none" || isBackFromOrderDetail) {
                onScrollTopBtnClick();

                // 请求服务器判断商品是否有更新
                // 如果缓存的数据存在，那么就需要去请求一次
                if ($scope.product) {
                    var productId = $scope.product.productId;
                    var hash = $scope.product.hash;
                    Product.getProductUpdate(productId, hash)
                        .then(function (resp) {
                            if (resp.update) {
                                $scope.product = resp.product;
                                calculatePrice(resp.product.price);
                                _initProductScope();
                            }
                        })
                        .catch(function (res) {
                            console.log('检查更新失败...');
                        });

                    _resetSelectProduct();
                }
                $scope.player.currentTime = 0;
            }
        }

        function _onViewEnterHandle(event, data) {
            _loadProduct(data.fromCache);
        }

        function _onViewBeforeLeaveHandle() {
            $scope.isCurrentPageActived = false;

            if (!_player) return;

            _player.dispose();

            _player = undefined;
        }

		/**
		 * 初始化产品信息
		 * @private
		 */
        function _loadProduct(isFromCache) {
            if (isFromCache) {
                _initVideo();
                return;
            }

            Loading.show({ fullScreen: false });
            Product.getProductById($scope.productId)
                .then(function (product) {
                    $scope.product = product;
                    calculatePrice(product.price);
                    _initVideo();

                    // 初始化商品的scope中的信息
                    _initProductScope();

                    // 初始化商品的收藏状态
                    _initFavoriteState();
                })
                .catch(function (code) {
                    console.log(code)
                })
                .finally(function () {
                    Loading.hide();
                });
        }

		/**
		 * 初始化商品的$scope中的一些属性
		 * @private
		 */
        function _initProductScope() {
            $scope.isOrder = ($scope.product.flag & 1) && $scope.product.stock <= 0;
            $scope.isShelved = $scope.product.state !== SKU_STATE.normal;
            $ionicSlideBoxDelegate.update();
        }

		/**
		 * 初始化收藏状态
		 * @private
		 */
        function _initFavoriteState() {
            Favorite.getFavoriteState($stateParams.id)
                .then(function (code) {
                    $scope.collectGoods = true;
                })
                .catch(function (code) {
                    $scope.collectGoods = false;
                })
        }

		/**
		 * 重置选中的商品数量为0
		 * @private
		 */
        function _resetSelectProduct() {
            $scope.selectProductCount = 0;
            if ($scope.skuAttributes) {
                $scope.skuAttributes.map(function (item) {
                    item.quantity = 0;
                    item.displayQuantity = 0;
                });
            }
        }

        ///////////////////////对外暴露的方法///////////////////////////

        function onShowModalBtnClick() {
            ModalService.initProductChooseModal($scope.product, $scope.productId, 'modal', $scope)
                .then(function () {
                    ModalService.modalShow();
                });
        }

		/**
		 * 开关更多按钮界面
		 */
        function onToggleMoreDetailShowClick() {
            $scope.isMoreDetailShow = !$scope.isMoreDetailShow;
        }

		/**
		 * 是否显示推荐(猜你喜欢)
		 * @returns {boolean}
		 */
        function isShowRecommend() {
            if (!$scope.product || !$scope.product.related_product)
                return false;

            return $scope.product.related_product.length !== 0;
        }


        /**
         * 跳转到首页
         */
        function goHome() {
            MyRouter.gotoStateDirectly("tab.home");
        }

        function back() {
            if ($rootScope.historyBack == ".") {
                MyRouter.gotoStateDirectly("tab.home", {}, {
                    clearHistory: true,
                    direction: "back"
                });
            } else {
                MyRouter.goBackState();
            }
        }

        function onContentScrolling() {
            $scope.isMoreDetailShow = false;

            var scrollPosition = $ionicScrollDelegate.getScrollPosition();
            $scope.isScrolled = scrollPosition.top > 200;

            var top = scrollPosition.top > TOP_SCROLL_HEIGHT ? TOP_SCROLL_HEIGHT : scrollPosition.top;
            var opacity = TOP_OPACITY / TOP_SCROLL_HEIGHT * top;
            $scope.opacity = {
                "opacity": opacity
            };

            $scope.$evalAsync();
        }

        function showImageModal() {
            $ionicSlideBoxDelegate.$getByHandle('modal-slide-box').enableSlide(false);
            document.addEventListener('touchstart', _touchstart, false);
            document.addEventListener('touchmove', _touchmove, false);
            $scope.isModalShow = true;
            top = $ionicScrollDelegate.$getByHandle('product-Detail-Scroll').getScrollPosition().top;

            durationTime = top + 200;
            if (modal) {
                modal.style.transform = 'translate3d(0,-' + top + 'px,0)';
                var timeout = $timeout(function () {
                    modal.className = 'to-center';
                    modal.style.transitionDuration = "0." + durationTime + "s";
                    modal.style.transform = 'translate3d(0,0,0)';
                    $timeout.cancel(timeout);
                }, 0);
            }


        }

        function hideImageModal() {
            document.removeEventListener('touchstart', _touchstart, false);
            document.removeEventListener('touchmove', _touchmove, false);
            if (modal) {
                var timeout = $timeout(function () {
                    modal.style.transitionDuration = "0";
                    $scope.isModalShow = false;
                    $timeout.cancel(timeout);
                }, durationTime);

                _resetImgScale();
                modal.className = 'product-modal-wrapper';
                modal.style.transform = 'translate3d(0,-' + top + 'px,0)';
            }


        }

        function _touchstart() {
            prevClientX = 0;
            nowClientX = 0;

            isAbleScrollY = $ionicScrollDelegate.$getByHandle('ion-scroll-' + $scope.slideIndex).getScrollView().options;

            if (zoom <= 1) {
                isAbleScrollY.scrollingY = false;
            } else {
                isAbleScrollY.scrollingY = true;
                $ionicSlideBoxDelegate.$getByHandle('modal-slide-box').enableSlide(false);
            }

        }

        function _touchmove(ev) {

            throttled();

            prevClientX = nowClientX;
            nowClientX = ev.touches[0].clientX;

        }

        function _setSlideEnableState() {

            position = $ionicScrollDelegate.$getByHandle('ion-scroll-' + $scope.slideIndex).getScrollPosition();
            left = position.left;
            zoom = position.zoom;
            isAbleLeftSlide = width * zoom - width <= left;
            isAbleRightSlide = left <= 0;

            if (prevClientX != 0 && nowClientX != 0 && prevClientX != nowClientX) {
                isToLeft = nowClientX < prevClientX;
                isToRight = nowClientX > prevClientX;

                if ((isAbleLeftSlide && isToLeft) || (isAbleRightSlide && isToRight)) {
                    $ionicSlideBoxDelegate.$getByHandle('modal-slide-box').enableSlide(true);
                }
                else {
                    $ionicSlideBoxDelegate.$getByHandle('modal-slide-box').enableSlide(false);
                }
            }
        }

		/**
		 * 商品收藏按钮的点击事件响应函数
		 */
        function onProductCollectBtnClick() {
            if ($scope.collectGoods == true) {
                Favorite.deleteFavorite($stateParams.id)
                    .then(function () {
                        $scope.collectGoods = false;
                        $scope.favorite = false;
                        toast.show({
                            isShakeAnimate: true,
                            title: '已取消收藏'
                        });
                        $rootScope.$broadcast("favorite-state-change");
                    })
                    .catch(function () {
                        toast.show({
                            isShakeAnimate: true,
                            title: '取消收藏失败'
                        });
                    })
            } else {
                Favorite.createFavorite($stateParams.id)
                    .then(function () {
                        $scope.collectGoods = true;
                        $scope.favorite = true;
                        toast.show({
                            isShakeAnimate: true,
                            title: '收藏成功'
                        });
                        $rootScope.$broadcast("favorite-state-change");
                    })
                    .catch(function () {
                        toast.show({
                            isShakeAnimate: true,
                            title: '收藏失败'
                        });
                    })
            }
        }

		/**
		 * 跳转到首页
		 */
        function onGotoHomeBtnClick() {
            $scope.isMoreDetailShow = false;
            MyRouter.gotoStateDirectly("tab.home", {
                type: "new"
            });
        }

		/**
		 * 跳转到消息页面
		 */
        function onGotoMessageBtnClick() {
            // 由于缓存的原因,需要再跳转到消息页面前将它隐藏
            $scope.isMoreDetailShow = false;
            MyRouter.gotoStateDirectly("message");
        }

        function slideHasChanged(index) {
            $scope.slideIndex = index;
            _resetImgScale();
        }

		/**
		 * 点击购物车按钮后的路由跳转
		 */
        function onCartBtnClick() {
            $rootScope.clearCartPosition();
            MyRouter.gotoStateDirectly("tab.cart");
        }

		/**
		 * 滚动到顶部的按钮点击响应事件
		 */
        function onScrollTopBtnClick(flag) {

            var instances = $ionicScrollDelegate._instances;
            angular.forEach(
                instances,
                function (obj) {
                    if (obj.$element[0].id == ("product-" + $scope.productId)) {
                        if (flag) {
                            obj.scrollTop({
                                shouldAnimate: true
                            });
                        } else {
                            obj.scrollTop();
                        }
                    }
                }
            )
        }

        ////////////////////////filter used function//////////////////////////////

		/**
		 * 跳转到商品详情页面
		 * @param id
		 */
        function onGotoProductBtnClick(id) {
            var url = window.location.href;
            if (url.indexOf('product-alias') > -1) {
                MyRouter.gotoStateDirectly("product", {
                    id: id
                });
            } else {
                MyRouter.gotoStateDirectly("product-alias", {
                    id: id
                });
            }
        }

		/**
		 * 重置可缩放图片的缩放比
		 */
        function _resetImgScale() {
            $ionicScrollDelegate.$getByHandle('ion-scroll-' + $scope.slideIndex).zoomTo(1);
        }

	    /**
         * 立即购买
         */
        function buyProductsImmediately() {
            var params = {
                type: 'immediate'
            };
            ModalService.initProductChooseModal($scope.product, $scope.productId, 'modal', $scope, null, params)
                .then(function () {
                    ModalService.modalShow();
                });
        }

	    /**
         * 是否为商品活动属性
         * @param flag
         * @returns {number|boolean}
         */
        function isProductAttribute(flag) {
            return (flag & 2) && !$scope.isOrder;
        }

        function calculatePrice(price) {
            if(price){
                var prices = price.toString().split('.');
                $scope.firstPrice = (prices[0]||0).toString();
                if(prices[1]){
                    $scope.lastPrice = prices[1];
                }else{
                    $scope.lastPrice = '00';
                }
            }else{
                $scope.firstPrice = '00';
                $scope.lastPrice = '00';
            }
        }
    }

} ());
