// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in app.js
"use strict";

var app = angular.module('10Style')
    .run(['$ionicPopup', '$rootScope', 'JPushService', 'ChcpService', 'authentication', '$timeout', '$location',
        '$ionicPlatform', 'MyRouter', 'Config', '$state', 'LocalService', 'myPopup', 'myPopup2',
        function ($ionicPopup, $rootScope, JPushService, ChcpService, authentication, $timeout, $location,
            $ionicPlatform, MyRouter, Config, $state, LocalService, myPopup, myPopup2) {
            var timer = null;
            /**
             * 判断是否点击通知
             * @type {boolean}
             */
            $rootScope.isNotificationClick = false;

            $rootScope.isResume = false;
            /**
             * 支付订单id
             */
            $rootScope.paymentId = 0;
            /**
             * 初始化热更插件
             * @private
             */
            function _chcpInit() {
                if (window.chcp) {
                    ChcpService.bindEvent();
                    ChcpService.checkHotUpdate();
                }
            }

            /**
             * 初始化极光推送插件的信息
             * @private
             */
            function _jPushInit() {
                JPushService.init();
                JPushService.receiveNotification();
                JPushService.backgroundNotification();
                JPushService.openNotification();
                JPushService.receiveMessage();
                JPushService.setAliasListener();
                JPushService.initBadge();
            }


            /**
             * 注册返回按钮的事件
             * @private
             */
            function _initBackButtonAction() {
                //主页面显示退出提示框
                $ionicPlatform.registerBackButtonAction(function (e) {
                    if($rootScope.isResume){
                        return false;
                    }
                    var currentPath = $location.path();

                    function showConfirm() {
                        var confirmPopup = $ionicPopup.confirm({
                            title: '<strong>退出应用?</strong>',
                            template: '确认要退出该应用程序?',
                            okText: '确认',
                            cancelText: '取消'
                        });

                        confirmPopup.then(function (res) {
                            if (res) {
                                ionic.Platform.exitApp();
                            } else {
                                // Don't close
                            }
                        });
                    }

                    function showProductConfirm() {
                        $ionicPopup.confirm({
                            title: '提示',
                            template: "返回后需要重新选商品，确认返回？",
                            cancelText: '取消',
                            okText: '确认'
                        }).then(function (res) {
                            if (res) {
                                MyRouter.goBackState();
                            }
                        });
                    }

                    /**
                     * 判断是否为tab页,如果是其中一个则返回true，否则返回false
                     * @param path
                     * @returns {boolean}
                     */
                    function isTabState(path) {
                        var urls = ['/home', '/discovery/&', '/cart/&', '/my/home/&'];
                        for (var i = 0, len = urls.length; i < len; i++) {
                            if (path.indexOf(urls[i]) > -1) {
                                return true;
                            }
                        }
                        return false;
                    }

                    /**
                     * 处理支付页面返回时弹窗问题
                     */
                    if (currentPath.indexOf('/payment') > -1) {
                        var myPopupNode = document.querySelector('body .my-popup.show');
                        if (myPopupNode) {
                            myPopup.hide();
                            _goToOrderDetail($rootScope.paymentId);
                        } else {
                            myPopup.show({
                                imgSrc: 'img/payment-goback.png',
                                message: '十五分钟内未支付，订单将会被取消',
                                cancleText: '忍痛割弃',
                                confirmText: '继续支付',
                                cancleCallback: function () {
                                    _goToOrderDetail($rootScope.paymentId);
                                },
                                confirmCallback: function () {
                                    // console.log("确定")
                                }

                            });
                        }
                        return false;
                    }

                    /**
                     * 处理myPopup2弹窗已弹出时 Android物理键返回
                     * 目前应用该弹窗的页面为填写提现信息页面 withdrawals-info-update
                     */
                    if(currentPath.indexOf('/withdrawals-info-update') > -1){
                        var myPopup2Node = document.querySelector('body .my-popup2.show');
                        if(myPopup2Node){
                            myPopup2.hide();
                        }
                        return false;
                    }

                    /**
                     * 跳转到订单详情页的方法--处理支付页面返回时弹窗问题使用
                     * @param orderId
                     */
                    function _goToOrderDetail(orderId) {
                        if (!orderId) { return };
                        var history = MyRouter.getCurrentStateHistory();
                        if (history.back == "orders-detail") {
                            MyRouter.goBackState();
                        } else {
                            MyRouter.gotoStateDirectly("orders-detail", {
                                id: orderId
                            }, { direction: "back" }, history);
                        }
                    }

                    if (currentPath.indexOf('/confirmation') > -1 && $rootScope.isScheduled) {
                        showProductConfirm();
                        return false;
                    }



                    // 如果已经显示了下载新版本信息，那么不响应回退键点击事件
                    var node = document.querySelector("body .version-dialog");
                    if (node) {
                        return false;
                    }
                    // Is there a page to go back to?
                    var flag = isTabState(currentPath);
                    if (flag || currentPath.indexOf('/login') > -1) {
                        showConfirm();
                    } else if (!flag && $rootScope.historyBack == ".") {
                        MyRouter.gotoStateDirectly("tab.home", {}, { clearHistory: true, direction: "back" });
                    } else if ($rootScope.historyBack != ".") {
                        if (window.cordova && window.cordova.plugins.Keyboard && window.cordova.plugins.Keyboard.isVisible) {
                            window.cordova.plugins.Keyboard.closeKeyboard();
                        } else {
                            MyRouter.goBackState();
                        }
                    }

                    e.preventDefault();
                    return false;
                }, 101);
            }

            ionic.Platform.ready(function () {
                _chcpInit();

                _initBackButtonAction();
                var token = LocalService.getToken();

                if (!token) {
                    $state.go("login");
                }

                if (window.navigator.splashscreen) {
                    var nowTime = new Date().getTime();
                    var appStartTime = LocalService.getAppStartTime();

                    appStartTime = appStartTime ? appStartTime : 0;
                    var delta = nowTime - appStartTime;
                    var duration = Config.SPLASH_SCREEN_DURATION - delta;
                    duration = duration > 0 ? duration : 0;
                    $timeout(function () {
                        window.navigator.splashscreen.hide();
                        _jPushInit();
                    }, duration);
                }

            });

            $ionicPlatform.on("pause", function (event) {
                console.log('pause: ', event);
                // user put the app in the background
                // 每次进入后台后将是否点击通知的标志位设为false,为了下次判断是否点击通知启动app
                $rootScope.isNotificationClick = false;
            });

            $ionicPlatform.on("resume", function (event) {
                $rootScope.isResume = true;
                if(timer){
                    $timeout.cancel(timer);
                }
                timer = $timeout(function () {
                    $rootScope.isResume = false;
                }, 300);
                $rootScope.$broadcast('APP_RESUME');

                var timestamp = new Date().getTime();
                var oldTimestamp = authentication.getCheckUpdateTime();
                if (oldTimestamp) {
                    var delta = timestamp - oldTimestamp;
                    console.log('delta: ', delta);
                    // 从后台唤起，检测是否更新
                    if (delta > Config.CHECK_UPDATE_TIME) {
                        authentication.setCheckUpdateTime(timestamp);
                        if (window.chcp) {
                            ChcpService.checkHotUpdate();
                        }
                    }
                } else {
                    authentication.setCheckUpdateTime(timestamp);
                }

                // user opened the app from the background
                if (!$rootScope.isNotificationClick) {
                    JPushService.initBadge();
                } else {
                    $rootScope.isNotificationClick = false;
                }
            });
        }])
    .run(
    [
        "$rootScope", "$state", "base64", "IMAGE_MODE", "$location", "$ionicLoading", "$templateCache", "authentication", "Cart", "Config", "Statistics", "Loading", "$ionicPopup", "ACCOUNT_TOKEN_CODE", "VersionDialog", "LocalService",
        function ($rootScope, $state, base64, IMAGE_MODE, $location, $ionicLoading, $templateCache, authentication, Cart, Config, Statistics, Loading, $ionicPopup, ACCOUNT_TOKEN_CODE, VersionDialog, LocalService) {
            $rootScope.historyBack = ".";
            $rootScope.historyBackParams = "";
            $rootScope.historyIonicBack = 0;

            $rootScope.services_href = Config.SERVICE_URL;

            $rootScope.IMAGE_MODE = IMAGE_MODE;

            $rootScope.hasNotifyUserLogin = false;

            /**
             * 记录购物车的位置
             * @type {number}
             */
            $rootScope.cartPosition = 0;

            $rootScope.JUMP = function (path) {
                $location.path(path);
            };

            /**
             * 一个辅助函数，用于将字符串转换为bool值
             * @param value
             * @returns {boolean}
             */
            $rootScope.$bool = function (value) {
                if ((value === null) || (value === "") || (value === false) || (value === "0") || (value === 0) || (value === -0) || (value === undefined) || (value === NaN)) return false;
                if (value === true) return true;
                return (value.toLowerCase() !== "false");
            }


            $rootScope.cartHasGood = function () {
                return $rootScope.cartCount && $rootScope.cartCount !== 0;
            }

            /**
             * 清空购物车位置信息
             */
            $rootScope.clearCartPosition = function () {
                $rootScope.cartPosition = 0;
            };

            $rootScope.onDownloadVersionClick = function () {
                VersionDialog.hide();
                var device = ionic.Platform.device();
                if (device.platform == "Android") {
                    console.log('android');
                    window.location.href = Config.ANDROID_UPDATE_URL;
                } else {
                    console.log('ios');
                    window.location.href = Config.IOS_UPDATE_URL;
                }
            };

            /**
             * 购物车、确认订单、订单详情、订单列表页面获取当前sku图片url
             * @param item: 当前商品sku信息
             * @returns {*}
             */
            $rootScope.getCurrentPicUrl = function (item) {
                if (!item || !item.product_info || !item.product_info.pictures || item.product_info.pictures.length === 0)
                    return;

                var LEADING_ATTRIBUTE_CONSTANT = 8;

                if (item.product_sku_info && item.product_sku_info.attribute && angular.isArray(item.product_sku_info.attribute)) {
                    var colorItem = item.product_sku_info.attribute.filter(function (skuItem) {
                        return Cart.isLeadingAttribute(item.product_info, skuItem.attr);
                    });
                }

                if (!colorItem || !colorItem[0]) return;

                if (item.product_info.sku_infos && angular.isArray(item.product_info.sku_infos)) {
                    var hasSkuPicItem = item.product_info.sku_infos.filter(function (productSkuItem) {
                        if (productSkuItem.attribute && angular.isArray(productSkuItem.attribute)) {
                            var allColorItem = productSkuItem.attribute.filter(function (attrItem) {
                                return Cart.isLeadingAttribute(item.product_info, attrItem.attr);
                            });
                        }
                        if (allColorItem) {
                            for (var i = 0; i < allColorItem.length; ++i) {
                                var attr = allColorItem[i];
                                if (attr.id == colorItem[0].id) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }).filter(function (cItem) {
                        if (!cItem || !cItem.pictures) {
                            return;
                        }

                        return cItem.pictures.length !== 0;
                    });
                }

                if (!hasSkuPicItem || !item.product_info.pictures[0]) return;

                return hasSkuPicItem.length !== 0 ? hasSkuPicItem[0].pictures[0].file_url : item.product_info.pictures[0].file_url;
            };


            $rootScope.loadingSpinnerHTML = function () {
                return  '<div class="fullScreenLoading">'+
							'<div class="tab-container">'+
								'<div class="loading">'+
									'<div class="loading-animation-wrapper show">' +
										'<div class="heart-buling">' +
										'<//div>' +
									'</div>'+
								'</div>'+
							'</div>'+
						'</div>'
            }

            function _init() {

                $rootScope.$on("ACCOUNT_TOKEN_CODE", function (event, code) {
                    if (!$rootScope.hasNotifyUserLogin) {
                        // 移除缓存中的账号信息
                        authentication.removeToken();

                        $rootScope.hasNotifyUserLogin = true;
                        var href = location.href.split('#')[0] + '#/login';
                        if (code == ACCOUNT_TOKEN_CODE.ACCOUNT_LOGIN_OCCUPIED_TOKEN) {
                            $ionicPopup.alert({
                                title: '提示',
                                template: "该账号在其他设备登录过，请重新登录使用",
                                okText: '确认'
                            }).then(function (res) {
                                if (res) {
                                    window.location.href = href;
                                }
                            })
                        } else {
                            window.location.href = href;
                        }
                    }
                });

                $rootScope.$on('cart-state-change', function () {
                    Cart.count().success(function (data) {
                        $rootScope.cartCount = data.count;
                        $rootScope.isCountingHuge = data.count > 99;
                    });
                });

                /**
                 * 监听购物车数据变化事件
                 */
                $rootScope.$on("cart-cache-remove", function () {
                    // 清空记录的购物车位置信息
                    $rootScope.clearCartPosition();
                });

                $rootScope.$on(
                    '$stateChangeStart',
                    function (event, toState, toParams, fromState, fromParams) {

                        var token = LocalService.getToken();

                        if (token && toState.name == "login") {
                            event.preventDefault();
                            authentication.refreshSignInStatus(function () {
                                $state.go("tab.home");
                            });
                        }


                        Loading.hide();

                        if (toParams) {
                            if (toParams.stateParams) {
                                toParams.stateParams = JSON.parse(base64.urldecode(toParams.stateParams));
                                angular.forEach(toParams.stateParams, function (value, key) {
                                    toParams[key] = value;
                                });
                                //delete toParams.stateParams;
                            }

                            if (toParams.history) {
                                var history;

                                try {
                                    history = JSON.parse(base64.urldecode(toParams.history));
                                }
                                catch (err) {
                                    try {
                                        history = JSON.parse(toParams.history);
                                    } catch (err) {
                                        console.log(err);
                                    }
                                }

                                if (toParams.useIonic) {
                                    if (!history) history = {};
                                    history.useIonic = toParams.useIonic;
                                }

                                if (!history) return;

                                if (history.back) // 历史回退路由状态
                                {
                                    $rootScope.historyBack = history.back ? history.back : ".";
                                }

                                if (history.backParams) // 历史回退的路由参数
                                {
                                    $rootScope.historyBackParams = history.backParams;
                                }

                                if (history.useIonic) // 使用Ionic的历史回退功能
                                {
                                    if (history.useIonic === true) {
                                        $rootScope.historyIonicBack = 1;
                                    }
                                    else {
                                        var step = parseInt(history.useIonic);
                                        if (!isNaN(step))
                                            $rootScope.historyIonicBack = step;
                                        else
                                            $rootScope.historyIonicBack = 0;
                                    }
                                }
                                else {
                                    $rootScope.historyIonicBack = 0;
                                }

                                $rootScope.lastUIState = fromState;
                            } else {
                                $rootScope.historyBack = ".";
                                $rootScope.historyBackParams = "";
                            }
                        }
                    }
                );

                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    Statistics.view(toParams.vUrl);
                    if (toState.name === 'product') {
                        Statistics.productView(toParams.id, fromParams.vUrl)
                    }
                });

                $rootScope.loadingSpinner = {
                    content: $rootScope.loadingSpinnerHTML("")
                };

                $templateCache.put("loading_spinner", $rootScope.loadingSpinner.content);
            }

            _init();

        }
    ]
    )
    .config(["$httpProvider", function ($httpProvider) {
        $httpProvider.interceptors.push('authenticationProvider');
    }])
    .config(
    [
        "$ionicConfigProvider",
        function ($ionicConfigProvider) {
            $ionicConfigProvider.transitions.views.ios = function (enteringEle, leavingEle, direction, shouldAnimate) {

                function setStyles(ele, opacity, x, boxShadowOpacity) {
                    var css = {};
                    css[ionic.CSS.TRANSITION_DURATION] = d.shouldAnimate ? '' : 0;
                    css.opacity = opacity;
                    if (boxShadowOpacity > -1) {
                        css.boxShadow = '0 0 10px rgba(0,0,0,' + (d.shouldAnimate ? boxShadowOpacity * 0.45 : 0.3) + ')';
                    }
                    css[ionic.CSS.TRANSFORM] = 'translate3d(' + x + '%,0,0)';
                    ionic.DomUtil.cachedStyles(ele, css);
                }

                var d = {
                    run: function (step) {
                        if ((direction == 'forward') || (direction == 'exit')) {
                            setStyles(enteringEle, 1, (1 - step) * 99, 1 - step); // starting at 98% prevents a flicker
                            setStyles(leavingEle, (1 - 0.1 * step), step * -33, -1);

                        } else if ((direction == 'back') || (direction == 'enter')) {
                            setStyles(enteringEle, (1 - 0.1 * (1 - step)), (1 - step) * -33, -1);
                            setStyles(leavingEle, 1, step * 100, 1 - step);

                        } else {
                            // swap, enter, exit
                            setStyles(enteringEle, 1, 0, -1);
                            setStyles(leavingEle, 0, 0, -1);
                        }
                    },
                    shouldAnimate: shouldAnimate && (direction == 'forward' || direction == 'back' || direction == 'exit' || direction == 'enter')
                };

                return d;
            };

            $ionicConfigProvider.transitions.views.android = function (enteringEle, leavingEle, direction, shouldAnimate) {
                shouldAnimate = shouldAnimate && (direction == 'forward' || direction == 'back' || direction == 'exit' || direction == 'enter');

                function setStyles(ele, x) {
                    var css = {};
                    css[ionic.CSS.TRANSITION_DURATION] = d.shouldAnimate ? '' : 0;
                    css[ionic.CSS.TRANSFORM] = 'translate3d(' + x + '%,0,0)';
                    ionic.DomUtil.cachedStyles(ele, css);
                }

                var d = {
                    run: function (step) {
                        if (direction == 'forward' || direction == 'exit') {
                            setStyles(enteringEle, (1 - step) * 99); // starting at 98% prevents a flicker
                            setStyles(leavingEle, step * -100);

                        } else if (direction == 'back' || direction == 'enter') {
                            setStyles(enteringEle, (1 - step) * -100);
                            setStyles(leavingEle, step * 100);

                        } else {
                            // swap, enter, exit
                            setStyles(enteringEle, 0);
                            setStyles(leavingEle, 0);
                        }
                    },
                    shouldAnimate: shouldAnimate
                };

                return d;
            };

            $ionicConfigProvider.views.transition('android');
        }
    ]
    )
    .config(['$provide', function ($provide) {
        $provide.decorator('$locale', ['$delegate', function ($delegate) {
            if ($delegate.id === 'en-us') {
                $delegate.NUMBER_FORMATS.PATTERNS[1].negPre = '-\u00A4';
                $delegate.NUMBER_FORMATS.PATTERNS[1].negSuf = '';
            }
            return $delegate;
        }]);
    }])
    .config(["$stateProvider", "$urlRouterProvider", "$ionicConfigProvider", function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        //Config template
        $ionicConfigProvider.backButton.previousTitleText(false).text('');
        $ionicConfigProvider.backButton.icon('ion-ios-arrow-back');
        $ionicConfigProvider.backButton.text('');
        $ionicConfigProvider.navBar.alignTitle('center');
        $ionicConfigProvider.tabs.position('bottom');

        $ionicConfigProvider.views.swipeBackEnabled(false);



        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        //$stateProvider

        // console.log(authentication.isSignedIn());
        $urlRouterProvider.otherwise(function ($injector, $location) {
            var $state = $injector.get("$state");
            $state.go("login");
        });

    }])
    .config(["CacheFactoryProvider", "HTTP_CACHE_PARAMS", function (CacheFactoryProvider, HTTP_CACHE_PARAMS) {
        angular.extend(CacheFactoryProvider.defaults, {
            maxAge: HTTP_CACHE_PARAMS.MAX_AGE,
            deleteOnExpire: HTTP_CACHE_PARAMS.DELETE_ON_EXPIRE
        });
    }]);
