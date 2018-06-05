(function () {
    'use strict';

    angular.module('10Style.search-result')
        .controller('SearchResultCtrl', SearchResultCtrl);

    SearchResultCtrl.$inject = ["$scope", "$stateParams", "$ionicScrollDelegate", '$ionicHistory', "Product", "MyRouter",
        "showBottomSlogan", "IMAGE_PARAMS", "Loading", "SessionService", "Statistics", "STATISTICS_FLAG_NAME"];

    function SearchResultCtrl($scope, $stateParams, $ionicScrollDelegate, $ionicHistory, Product, MyRouter,
                              showBottomSlogan, IMAGE_PARAMS, Loading, SessionService, Statistics, STATISTICS_FLAG_NAME) {

        $scope.IMAGE_PARAMS = IMAGE_PARAMS;

        var LOCAL_STORAGE_NAME = 'records';

        var sortDict = [
            { key: '-new', params: { sort: '-create_time' }, active: true },
            { key: '-hot', params: { sort: '-recent_sales' }, active: false },
            { key: '+price', params: { sort: '+selling_price' }, active: false, show: false },
            { key: '-price', params: { sort: '-selling_price' }, active: false, show: false },
            { key: 'default', params: {}, active: false, show: true }];

        var contentHeight = 0;
        var totalHeight = 0;
        var scroll = null;

        init();


        $scope.back = back;                                       //取消按钮
        $scope.sortBy = sortBy;                                   //点击排序
        $scope.loadMore = loadMore;                               //加载查询结果
        // $scope.gotoProduct = gotoProduct;                         //点击进入产品详情页面
        $scope.isProductsEmpty = isProductsEmpty;                 //判断商品列表是否为空
        // $scope.isShowNoMoreData = isShowNoMoreData;               //判断是否显示无数据图片
        $scope.isSortKeyActived = isSortKeyActived;               //判断是否是当前排序状态
        $scope.isShowPriceState = isShowPriceState;               //显示价格状态
        $scope.onScrollHandle = onScrollHandle;                 //滚动显示页面底部提示
        $scope.jumpToSearch = jumpToSearch;
        $scope.isSoldOut = Product.isSoldOut;                             //是否为正常售罄商品
        $scope.isPreProduct = Product.isPreProduct;                       //是否为预售商品

        $scope.isProductsOdd = isProductsOdd;
        $scope.gotoProduct = gotoProduct;

        function init() {
            $scope.products = [];
            $scope.hasMoreData = false;
            $scope.showLoading = false;                              /*是否显示loading动画*/
            $scope.showFooterAlert = false;                          /*是否显示footer提示*/
            $scope.initialized = false;
            $scope.hasData = false;
            $scope.isShowEmpty = false;

            bindKeyWord();

            loadMore();

            $scope.$on('$ionicView.beforeEnter', onViewBeforeEnterHandle);
        }

        function onViewBeforeEnterHandle(event, data) {
            if (!data.fromCache) {
                $ionicHistory.clearCache();
            }
        }

        function bindKeyWord() {
            if (!$stateParams || !$stateParams.keyword) return;

            $scope.keyword = $stateParams.keyword;
        }

        function loadMore() {
            if (!$stateParams || !$stateParams.keyword) return;

            var dict = getCurrentSortDict();

            if (!dict || !dict[0] || !dict[0].params) return;

            var params = {
                keyword: $stateParams.keyword,
                offset: $scope.products ? $scope.products.length : 0
            }

            if ($scope.products.length === 0) {
                Loading.show({ fullScreen: false });
            }
            else {
                $scope.showLoading = true;
            }

            $scope.initialized = false;

            angular.extend(params, dict[0].params);

            Product.search(params)
                .then(loadSearchResultSuccess)
                .catch(loadSearchResultFail)
                .finally(loadSearchResultAlways);
        }

        function loadSearchResultSuccess(response) {
            if (!response || !response.data || !response.data.rows) return;

            $scope.products = $scope.products.concat(response.data.rows);

            $scope.hasMoreData = $scope.products.length < response.data.total;

            if (!$scope.products.length) {
                $scope.isShowEmpty = true;
            }
            else {
                $scope.hasData = true;
            }

        }

        function loadSearchResultFail() {

        }

        function loadSearchResultAlways() {

            Loading.hide();
            $scope.showLoading = false;
            $scope.initialized = true;

            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        function getCurrentSortDict() {
            return sortDict.filter(function (item) {
                return item.active;
            });
        }

        function back() {
            var stateName = SessionService.getItem('search-back-state-name');
            if (!stateName)
                MyRouter.gotoStateDirectly("tab.home", {}, { clearHistory: true, direction: "back" });
            else {
                MyRouter.gotoStateDirectly(stateName, {}, { clearHistory: true, direction: "back" });
            }
        }

        function isSortKeyActived(key) {
            var activedSortKey = sortDict.filter(function (item) {
                return item.active && item.key === key;
            });

            return activedSortKey && activedSortKey.length > 0;
        }

        function isShowPriceState(key) {
            var showSortKey = sortDict.filter(function (item) {
                return item.show && item.key === key;
            });

            return showSortKey && showSortKey.length > 0;
        }

        function isProductsEmpty() {
            return $scope.products.length === 0;
        }

        function sortBy(key) {
            if (isSortKeyActived(key)) return;

            sortDict.forEach(function (item) {
                item.active = item.key === key;

                if (key === '+price' || key === '-price' || key === 'default') {
                    item.show = item.key === key;
                }
                else {
                    item.show = item.key === 'default';
                }

            });

            search();
        }

        function search() {
            $scope.products = [];
            $ionicScrollDelegate.scrollTop();
            loadMore();
        }


        // function gotoProduct(productId) {
        //     console.log(productId);
        //     MyRouter.gotoStateDirectly("product", { id: productId }, null, { "useIonic": true });
        // }

        function jumpToSearch() {
            MyRouter.gotoStateDirectly("search", { keyword: $stateParams.keyword });
        }

        function onScrollHandle() {
            $scope.$apply(function () {
                $scope.bottomSlogan = showBottomSlogan.get($scope.hasMoreData, 'search-scroller', 'product-list-style-default');
            })
        }

        function isProductsOdd(){
            if(!$scope.products) return false;

            return $scope.products.length % 2 == 1;
        }
        function gotoProduct(id) {
            // 保存点击过的product_id到sessionStorage中
            Statistics.setFlag(STATISTICS_FLAG_NAME.SEARCH_FLAG + '_' + id, $scope.keyword);
            MyRouter.gotoStateDirectly("product", { id: id });
        }
    }

} ());
