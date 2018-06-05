(function () {
    'use strict';

    angular.module('10Style.category-detail')
        .controller('CategoryDetailCtrl', CategoryDetailCtrl);

    CategoryDetailCtrl.$inject = ["$scope", "$stateParams", "Loading", "$window", "$timeout", "$ionicHistory", "$ionicScrollDelegate", "$ionicPopup", "Category",
        "MyRouter", "Config", "showBottomSlogan", "IMAGE_PARAMS", "Product"];

    function CategoryDetailCtrl($scope, $stateParams, Loading, $window, $timeout, $ionicHistory, $ionicScrollDelegate, $ionicPopup, Category,
        MyRouter, Config, showBottomSlogan, IMAGE_PARAMS, Product) {


        var sortDict = [
            { key: 'new', order: 'desc', params: { sort: 'create_time', order: 'desc' }, active: true },
            { key: 'hot', order: 'desc', params: { sort: 'recent_sales', order: 'desc' }, active: false },
            { key: 'price', order: 'asc', params: { sort: 'selling_price', order: 'asc' }, active: false, show: false },
            { key: 'price', order: 'desc', params: { sort: 'selling_price', order: 'desc' }, active: false, show: false },
            { key: 'price', order: 'null', params: { sort: null, order: null }, active: false, show: true }];

        var contentHeight = 0;
        var totalHeight = 0;
        var scroll = null;


        var limit = Config.PRODUCT_PAGE_SIZE;										 //请求数据长度
        var type = $stateParams.id;												     //商品类型
        var sort = 'update_time';													 //初始排序字段
        var offset = 0;																 //偏移
        var order = 'desc';															 //排序方式
        var total = 0;											                     //商品列表总数


        $scope.keyword = '';
        $scope.products = [];
        $scope.hasMoreData = false;
        $scope.isSearchInputFocused = true;
        $scope.showLoading = false;
        /*是否显示loading动画*/
        $scope.showFooterAlert = false;
        /*是否显示footer提示*/
        $scope.initialized = false;
        /*数据是否初始化*/
        $scope.hasData = false;
        $scope.isShowEmpty = false;

        $scope.title = $stateParams.title;
        /*设置页面title*/

        $scope.IMAGE_PARAMS = IMAGE_PARAMS;


        $scope.sortBy = sortBy;                                   //点击排序
        $scope.hasStock = hasStock;                               //判断商品库存
        $scope.loadMore = loadMore;                               //加载查询结果
        $scope.isProductsEmpty = isProductsEmpty;                 //判断商品列表是否为空
        $scope.isSortKeyActived = isSortKeyActived;               //判断是否是当前排序状态
        $scope.isShowPriceState = isShowPriceState;               //显示价格状态
        $scope.onScrollHandle = onScrollHandle;                 //滚动显示页面底部提示
        $scope.isSoldOut = Product.isSoldOut;           //是否为正常售罄商品
        $scope.isPreProduct = Product.isPreProduct;     //是否为预售商品
        $scope.isProductsOdd = isProductsOdd;


        init();

        function init() {

            loadMore();

        }


        function setTotalHeight() {
            var wrappers = document.querySelectorAll('.search-view[nav-view="active"] .item-list-wrapper');

            if (wrappers && wrappers[0]) {
                totalHeight = wrappers[0].offsetHeight;
            }


        }

        //过滤数组中唯一的数据
        function filterUniqueItemInArray(items) {
            if (!Array.isArray(items))
                return [];

            return items.filter(function (item, index, self) {
                return self.indexOf(item) === index;
            });
        }


        function isSortKeyActived(key, order) {
            var activedSortKey = sortDict.filter(function (item) {
                return item.active && item.key === key && item.order === order;
            });

            return activedSortKey && activedSortKey.length > 0;
        }

        function isShowPriceState(key, order) {
            var showSortKey = sortDict.filter(function (item) {
                return item.show && item.key === key && item.order === order;
            });

            return showSortKey && showSortKey.length > 0;
        }


        function isProductsEmpty() {
            return $scope.products.length === 0;
        }

        function sortBy(key, order) {
            if (isSortKeyActived(key, order)) {
                return;
            }

            order = order;
            $scope.hasMoreData = true;

            //          $timeout(function () {
            //              $scope.hasMoreData = true;
            //          }, 10);

            sortDict.forEach(function (item) {
                if (item.key === key && item.order === order) {
                    item.active = true;
                    item.show = true;
                }
                else {
                    item.active = false;
                    item.show = false;
                }

                if (item.key === 'price' && item.order === 'null' && key !== 'price') {
                    item.show = true;
                }

            });

            search(key, order);
        }

        function search(key, _order) {
            $scope.products = [];
            $ionicScrollDelegate.scrollTop();

            if (key && _order) {
                order = _order;

                if (key == 'new') {
                    sort = 'update_time';
                }
                else if (key == 'hot') {
                    sort = 'history_sales';
                }
                else if (key == 'price') {
                    sort = 'selling_price';
                }

                //				loadMore();

            }

        }


        function loadMore() {
            $scope.initialized = false;

            if (!$scope.products.length) {
                Loading.show({ fullScreen: false });
            }
            else {
                $scope.showLoading = true;
            }

            var params = {
                type: type,
                sort: sort,
                order: order,
                offset: $scope.products.length
            }
            console.log('type :' + params.type + ' sort :' + params.sort + ' order :' + params.order + ' offset :' + params.offset)
            Category.getProductList(params)
                .then(onSearchSuccess)
                .catch(onSearchError)
                .finally(onSearchDone);
        }

        function onSearchSuccess(response) {
            var currentItem = getActiveItem();

            if (!currentItem || !currentItem[0] || !currentItem[0].params)
                return;

            if (!response.config || !response.config.params)
                return;
            var rows = response.data.rows.map(function (item) {
                return {
                    id: item.pid,
                    name: item.name,
                    price: item.selling_price / 100 * item.discount_rate,
                    stock: _formatProductStock(item),
                    imageUrl: _formatImageUrl(item),
                    flag: item.flag
                }
            }) || [];

            $scope.products = $scope.products.concat(rows); console.log($scope.products)
            if (!$scope.products.length) {
                $scope.isShowEmpty = true;
            }
            else {
                $scope.hasData = true;
            }

            $scope.hasMoreData = $scope.products.length < response.data.total;
            console.log($scope.hasMoreData)
            $timeout(function () {
                setTotalHeight();
                $scope.showFooterAlert = false;
            });

            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        function onSearchError() {
            $ionicPopup.alert({
                title: '提示',
                template: '获取数据失败啦',
                okText: '知道了'
            });

        }

        function onSearchDone() {
            Loading.hide();
            $scope.showLoading = false;
            $scope.initialized = true;
        }


        function hasStock(product) {
            if (product && product.sku_infos) {

                var sku_infos = product.sku_infos;

                var sku_stock = sku_infos.map(function (sku) {
                    if (!sku || !sku.sale_infos)
                        return 0;

                    var data = sku.sale_infos.map(function (sale) {
                        return sale.amount;
                    });

                    if (!data || data.length === 0)
                        return 0;

                    return data.reduce(function (a, b) {
                        return a + b;
                    });
                });

                if (!sku_stock || sku_stock.length === 0)
                    return true;

                return sku_stock.reduce(function (a, b) {
                    return a + b;
                }) === 0;
            }

            return true;
        }

        //获取active元素。
        function getActiveItem() {
            return sortDict.filter(function (item) {
                return item.active;
            });
        }

        function onScrollHandle() {
            $scope.$apply(function () {
                $scope.bottomSlogan = showBottomSlogan.get($scope.hasMoreData, 'category-detail-scroller', 'product-list-style-default');
            })
        }

        function _formatImageUrl(item) {
            if (!item.pictures || !item.pictures[0] || !item.pictures[0].file_url)
                return '';

            return item.pictures[0].file_url;
        }

        function _formatProductStock(item) {

            if (!item || !item.sku_infos || !angular.isArray(item.sku_infos) || item.sku_infos.length === 0)
                return 0;

            var skuStock = item.sku_infos.map(function (sku) {
                if (!sku || !sku.sale_infos)
                    return 0;

                var data = sku.sale_infos.map(function (sale) {
                    return sale.amount;
                });

                return _sum(data);
            });

            return _sum(skuStock);
        }

        function _sum(data) {
            if (!data || !angular.isArray(data) || data.length === 0)
                return 0;

            return data.reduce(function (a, b) {
                return a + b;
            });
        }

        function isProductsOdd(){
            if(!$scope.products) return false;

            return $scope.products.length % 2 == 1;
        }
    }

} ());
