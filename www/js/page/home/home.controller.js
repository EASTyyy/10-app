(function () {
    'use strict';

    angular.module('10Style.home')
        .controller('HomeCtrl', HomeCtrl);

    HomeCtrl.$inject = ["$rootScope", "$scope", "$timeout", "$window", "$state", "$stateParams", '$ionicSlideBoxDelegate', "$ionicScrollDelegate", '$ionicPopup',
        'MyRouter', 'Product', 'Activity', "ProductGroup", "ComponentParser", "USERAUTHENTICATION_FLAG",
        "Config", "showBottomSlogan", "IMAGE_PARAMS", "authentication", "SessionStorage", "Helper", "Loading", "Refresh"];

    function HomeCtrl($rootScope, $scope, $timeout, $window, $state, $stateParams, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicPopup,
        MyRouter, Product, Activity, ProductGroup, ComponentParser, USERAUTHENTICATION_FLAG,
        Config, showBottomSlogan, IMAGE_PARAMS, authentication, SessionStorage, Helper, Loading, Refresh) {

        var timer;

        var throttled;

        var isRefreshing = false;

        var requestFreshData = false;

        var loadTime = {
            start: 0,
            done: 0
        };

        var shortestRefreshTime = 2000;

        var loadDone = {
            bannerData: false,
            productData: false
        };

        $scope.IMAGE_PARAMS = IMAGE_PARAMS;
        $scope.isScrolling = false;
        $scope.products = [];
        $scope.showLoading = false;
        $scope.initialized = false;
        $scope.hasMoreData = false;

        $scope.loadRecommendedProducts = loadRecommendedProducts;
        $scope.gotoStateIfAllowed = gotoStateIfAllowed;
        $scope.onScrollHandle = onScrollHandle;
        $scope.refreshData = refreshData;
        $scope.onPullDown = onPullDown;
        $scope.isSoldOut = Product.isSoldOut;                             //是否为正常售罄商品
        $scope.isPreProduct = Product.isPreProduct;                       //是否为预售商品
        $scope.isProductsOdd = isProductsOdd;

        init();

        function init() {
            $scope.$on('$ionicView.beforeEnter', _onViewBeforeEnterHandle);
            $scope.$on('scroll.refreshComplete', Refresh.onRefreshComplete);

            throttled = Helper.Throttle.bind(function () {
                _settingScrollState();
                _settingBottomSlogan();
            }, 200, 200);
        }

        function loadData() {

            if (!$stateParams || !$stateParams.id) return;
            loadTime.start = new Date().getTime();
            Activity.get($stateParams.id)
                .then(loadDataSuccess)
                .catch(loadDataFail)
                .finally(loadDataAlways);
        }

        function refreshData() {
            isRefreshing = true;
            requestFreshData = true;
            loadDone.bannerData = false;
            loadDone.productData = false;
            $scope.products = [];
            SessionStorage.setItem('template_json', '');
            loadData();
            loadRecommendedProducts();
        }

        function onPullDown() {
            Refresh.onPullDown('.home-content-container');
        }

        function loadDataSuccess(response) {
            if (!response || !response.data || !response.data.rows || !response.data.rows[0] || !response.data.rows[0].data) return;
            var json_data = JSON.parse(response.data.rows[0].data);
            var json_string = response.data.rows[0].data;
            var template_json_cache = SessionStorage.getItem('template_json') ? JSON.parse(SessionStorage.getItem('template_json')) : {};
            if (json_string === template_json_cache[$stateParams.id]) {
                if ($scope.view) return;
            }
            template_json_cache[$stateParams.id] = json_string;
            SessionStorage.setItem('template_json', JSON.stringify(template_json_cache));
            var config = json_data.config;
            var contents = json_data.contents;

            if (!contents) return;

            $scope.view = {
                title: config ? config.title : "",
                css: config ? config.class : ""
            };

            $scope.banner = ComponentParser.execute(contents[0]);

            $ionicSlideBoxDelegate.update();

            $scope.topTitle = ComponentParser.execute(contents[1]);

            $scope.topContent = ComponentParser.execute(contents[2]);
            $scope.vogueTitle = ComponentParser.execute(contents[3]);
            $scope.vogueContent = ComponentParser.execute(contents[4]);

            $scope.slideContent = ComponentParser.execute(contents[5]);
            loadSlideProductsData();


            $scope.listTitle = ComponentParser.execute(contents[6]);

            // initProducts(ComponentParser.execute(contents[7]));

            $scope.list = ComponentParser.execute(contents[7]);

        }

        function loadDataFail() {

        }

        function loadDataAlways() {
            var dely = 0;
            loadDone.bannerData = true;
            if (isRefreshing && loadDone.productData) {
                isRefreshing = false;
                loadTime.done = new Date().getTime();
                dely = refreshTimeDely(loadTime);
                if (!angular.isNumber(dely)) dely = 0;

                $timeout(function () {
                    $scope.$broadcast('scroll.refreshComplete');
                }, dely);
            }
            if(!isRefreshing && loadDone.productData) $scope.initialized = true;
        }

        function loadRecommendedProducts() {

            var product_length = $scope.products.length;

            var dataType = null;

            if(requestFreshData) dataType = 'freshData';

            if (product_length > 0) {
                _checkAuthentication(_doTask, onRecommendedProductsDeclined);
            } else {
                _doTask();
            }

            function _doTask() {
                $scope.showLoading = true;
                Product.getRecommendedProducts(product_length, Config.HOME_PAGE_PRODUCT_PAGE_SIZE, dataType)
                    .then(loadRecommendedProductsSuccess)
                    .catch(loadRecommendedProductsFail)
                    .finally(loadRecommendedProductsAlways);
            }

            function onRecommendedProductsDeclined() {
                $timeout(function () {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, 800)
            }
        }

        function loadRecommendedProductsSuccess(response) {

            if (!response || !response.data) return;

            var products = response.data.rows;

            $scope.products = $scope.products.concat(products);

            $scope.hasMoreData = $scope.products.length < response.data.total;
        }

        function loadRecommendedProductsFail() {

        }

        function loadRecommendedProductsAlways() {
            var dely = 0;
            loadDone.productData = true;
            if (isRefreshing && loadDone.bannerData) {
                isRefreshing = false;
                loadTime.done = new Date().getTime();
                dely = refreshTimeDely(loadTime);
                if (!angular.isNumber(dely)) dely = 0;

                $timeout(function () {
                    $scope.$broadcast('scroll.refreshComplete');
                }, dely);
            }

            if(!isRefreshing && loadDone.bannerData) $scope.initialized = true;

            $scope.showLoading = false;

            $scope.$broadcast('scroll.infiniteScrollComplete');
        }


        //加载水平滚动商品信息
        function loadSlideProductsData() {
            if (!$scope.slideContent || !$scope.slideContent.data || !angular.isArray($scope.slideContent.data)) return;

            var productIdString = $scope.slideContent.data.map(function (item) {
                return item.pid
            }).join(',');

            Product.getProductByIdString(productIdString)
                .then(loadSlideProductsDataSuccess)
                .catch(loadSlideProductsDataFail)
                .finally(loadSlideProductsDataAlways);
        }

        function loadSlideProductsDataSuccess(response) {

            if (!response || !response.data) return;

            $scope.slideContent.products = response.data.rows;
        }

        function loadSlideProductsDataFail() {
        }

        function loadSlideProductsDataAlways() {
        }

        function refreshTimeDely(time) {
            if (!time) return 0;

            var difference = time.done - time.start;

            return difference < shortestRefreshTime ? (shortestRefreshTime - difference) : 0;
        }

        function gotoStateIfAllowed(state, params) {

            if ($scope.isScrolling)
                return;

            if (["product", "activity", "search", "category"].indexOf(state) > -1) {
                _checkAuthentication(function () {
                    MyRouter.gotoStateDirectly(state, params);
                });
            } else {
                MyRouter.gotoStateDirectly(state, params);
            }
        }

        function _checkAuthentication(callback, finalFunc) {

            var account_info = SessionStorage.getItem('account_info') ? JSON.parse(SessionStorage.getItem('account_info')) : {};
            if (!account_info.extend_info || account_info.extend_info.flag == USERAUTHENTICATION_FLAG.EXAMINE || account_info.extend_info.flag == USERAUTHENTICATION_FLAG.WARNING) {
                authentication.queryAccountInfo().then(
                    function () {
                        account_info = SessionStorage.getItem('account_info') ? JSON.parse(SessionStorage.getItem('account_info')) : {};
                        if (!account_info.extend_info) {
                            $ionicPopup.confirm({
                                title: '提示',
                                template: '您没有权限查看该内容，请认证后查看。',
                                okText: '前往认证',
                                okType: 'button-default',
                                cancelText: '再看看',
                                cancelType: 'button-default'
                            }).then(
                                function (result) {
                                    if (!result) {
                                        typeof (finalFunc) == 'function' && finalFunc();
                                        return;
                                    }
                                    $scope.$broadcast('scroll.infiniteScrollComplete');
                                    $rootScope.destinationAfterPassingUserAuthentication = { ref: { state: $state.current.name, paramExpr: JSON.stringify($stateParams) }, params: $stateParams, options: {} };
                                    $rootScope.disablePass = true;
                                    MyRouter.gotoStateDirectly("user-authentication");
                                }
                                );
                        } else if (account_info.extend_info.flag == USERAUTHENTICATION_FLAG.EXAMINE) {
                            $ionicPopup.alert({
                                title: '提示',
                                template: '您暂无权限查看该部分内容，请耐心等待认证审核通过！',
                                okText: '确定',
                                okType: 'button-default'
                            }).then(
                                function () {
                                    typeof (finalFunc) == 'function' && finalFunc();
                                }
                                );
                        } else if (account_info.extend_info.flag == USERAUTHENTICATION_FLAG.WARNING) {
                            $ionicPopup.confirm({
                                title: '提示',
                                template: '认证审核不通过，请重新前往认证。',
                                okText: '前往认证',
                                okType: 'button-default',
                                cancelText: '再看看',
                                cancelType: 'button-default'
                            }).then(
                                function (result) {
                                    if (!result) {
                                        typeof (finalFunc) == 'function' && finalFunc();
                                        return;
                                    }
                                    $scope.$broadcast('scroll.infiniteScrollComplete');
                                    $rootScope.destinationAfterPassingUserAuthentication = { ref: { state: $state.current.name, paramExpr: JSON.stringify($stateParams) }, params: $stateParams, options: {} };
                                    $rootScope.disablePass = true;
                                    MyRouter.gotoStateDirectly("user-authentication");
                                }
                                );
                        } else {
                            // $scope.ionInfiniteScrollHeight = '60px';
                            // $scope.ionInfiniteScrollDistance = '1%';

                            $scope.isUnauthorized = false;

                            typeof (callback) == 'function' && callback();
                        }
                    },
                    function () {
                        Loading.hide();
                    }
                )
            } else {
                typeof (callback) == 'function' && callback();
            }
        }

        function _onViewBeforeEnterHandle(event, data) {

            if (!data.fromCache || $scope.products.length === 0) {
                loadData();
                $scope.products = [];
                loadRecommendedProducts();
            }

            if (data.fromCache && data.direction === "forward") {

                requestFreshData = false;

                var scroller = $ionicScrollDelegate.$getByHandle('home-scroller');

                if (scroller)
                    scroller.scrollTop();
            }

            var account_info = SessionStorage.getItem('account_info') ? JSON.parse(SessionStorage.getItem('account_info')) : {};
            if (!account_info.extend_info || account_info.extend_info.flag == USERAUTHENTICATION_FLAG.EXAMINE || account_info.extend_info.flag == USERAUTHENTICATION_FLAG.WARNING) {
                // $scope.ionInfiniteScrollHeight = '1px';
                // $scope.ionInfiniteScrollDistance = '-10';
                $scope.isUnauthorized = true;
            }

        }

        function _settingScrollState() {

            $scope.isScrolling = true;

            if (timer !== null) {
                clearTimeout(timer);
            }

            timer = setTimeout(function () {
                $scope.isScrolling = false;
            }, 100);
        }

        function _settingBottomSlogan() {

            if (!$scope.list || !$scope.list.css) {
                return;
            }

            $scope.$apply(function () {
                $scope.bottomSlogan = showBottomSlogan.get($scope.hasMoreData, 'home-scroller', $scope.list.css);
            });
        }

        function onScrollHandle() {
            throttled();
            Refresh.onScrollTop();
        }

        function isProductsOdd(){
            if(!$scope.products) return false;

            return $scope.products.length % 2 == 1;
        }
    }
} ());
