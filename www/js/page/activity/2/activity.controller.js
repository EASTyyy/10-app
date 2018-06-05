(function () {
    'use strict';

    angular.module('10Style.activity')
        .controller('ActivityTemplate2Ctrl', ActivityTemplate2Ctrl);

    ActivityTemplate2Ctrl.$inject = ["$scope", "$stateParams", "$ionicScrollDelegate", '$timeout',
        'Activity', "Product", "ComponentParser", "Loading",
        "showBottomSlogan", "IMAGE_PARAMS", "SessionStorage"
    ];

    function ActivityTemplate2Ctrl($scope, $stateParams, $ionicScrollDelegate, $timeout,
        Activity, Product, ComponentParser, Loading,
        showBottomSlogan, IMAGE_PARAMS, SessionStorage) {

        var SCROLLER_NODE_NAME = 'activity-2-scroller';
        var DATE_SWITCH_NODE_NAME = 'ion-view:not([nav-view="cached"]) #date-switch-container';

        var PRODUCT_LIST_NODE_NAME = "product-list-style-default";

        var scroller;
        var dateSwitchNode;

        var requestId;

        $scope.IMAGE_PARAMS = IMAGE_PARAMS;

        $scope.loadProductData = loadProductData;

        $scope.isHideDateSwitchNode = true;

        $scope.onDateSwitchItemClick = onDateSwitchItemClick;

        $scope.onScrollHandle = onScrollHandle;
        $scope.onNormalScrollHandle = onNormalScrollHandle;
        $scope.onFixedTopScrollHandle = onFixedTopScrollHandle;
        $scope.isSoldOut = Product.isSoldOut;                             //是否为正常售罄商品
        $scope.isPreProduct = Product.isPreProduct;                       //是否为预售商品
        $scope.isProductsOdd = isProductsOdd;

        init();

        function init() {
            _initNode();

            $scope.$on('$ionicView.beforeEnter', _onViewBeforeEnterHandle);
        }

        function _onViewBeforeEnterHandle(events, data) {
            if (!$stateParams || !$stateParams.id) return;

            if (data.direction === 'forward') {
                Loading.show({
                    style: 'pointer',
                    fullScreen: false
                });

                _initState();
                loadData();
            }

        }

        function _initState() {
            if (!!scroller) scroller.scrollTop();

            $scope.initialize = false;
            $scope.selectedIndex = 0;
            $scope.products = [];

            $scope.hasProducts = hasProducts;
            $scope.showLoading = false;
            $scope.hasMoreData = false;
            $scope.isHideDateSwitchNode = true;
        }

        function _initNode() {
            dateSwitchNode = document.querySelector(DATE_SWITCH_NODE_NAME);
            scroller = $ionicScrollDelegate.$getByHandle(SCROLLER_NODE_NAME);
        }

        function onDateSwitchItemClick(index) {
            if ($scope.selectedIndex === index) return;

            if (!$scope.dateSwitch || !$scope.dateSwitch.data || !$scope.dateSwitch.data[index]) return;

            if (!$scope.isHideDateSwitchNode) {
                _scrollToPosition();
            }

            $scope.selectedIndex = index;

            $scope.products = [];
            loadProductData();
        }

        function hasProducts() {
            return $scope.products.length !== 0;
        }

        function loadData() {

            Activity.get($stateParams.id)
                .then(loadDataSuccess)
                .catch(loadDataFail)
                .finally(loadDataAlways);
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

            $scope.view = {
                title: config ? config.title : "",
                css: config ? config.class : ""
            }

            $scope.banner = ComponentParser.execute(contents[0]);
            $scope.dateSwitch = ComponentParser.execute(contents[1]);
        }

        function loadDataFail() { }

        function loadDataAlways() {
            loadProductData();
            $scope.initialize = true;
        }

        function loadProductData() {

            if (!$scope.dateSwitch || !$scope.dateSwitch.data || !$scope.dateSwitch.data[$scope.selectedIndex]) return;

            var time = $scope.dateSwitch.data[$scope.selectedIndex].time;

            var zone = $scope.dateSwitch.zone;

            if (!time || !zone) return;

            if ($scope.initialize) {
                $scope.showLoading = true;
            }

            requestId = (new Date).getTime();

            var params = {
                time: time,
                zone: zone,
                offset: $scope.products.length
            };

            var headers = {
                payload: requestId
            };

            Product.getProductByTime(params, headers)
                .then(loadProductDataSuccess)
                .catch(loadProductDataFail)
                .finally(loadProductDataAlways);
        }

        function loadProductDataSuccess(response) {

            if (!response || !response.data || !response.headers() || !response.headers().payload) return;

            if (requestId != response.headers().payload) return;

            $scope.showLoading = false;

            var products = response.data.rows;

            $scope.products = $scope.products.concat(products);

            $scope.hasMoreData = $scope.products.length < response.data.total;
        }

        function loadProductDataFail() {
            $scope.showLoading = false;
        }

        function loadProductDataAlways() {
            Loading.hide();

            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        function onScrollHandle() {
            setDateSwitchState();

            if (!$scope.initialize || $scope.showLoading) return;

            $scope.$apply(function () {
                $scope.bottomSlogan = showBottomSlogan.get($scope.hasMoreData, SCROLLER_NODE_NAME, PRODUCT_LIST_NODE_NAME);
            })

            // if (!showBottomSlogan.get($scope.hasMoreData, SCROLLER_NODE_NAME, PRODUCT_LIST_NODE_NAME, 60).state) return;


            // if (!$scope.dateSwitch || !$scope.dateSwitch.data || !$scope.dateSwitch.data[$scope.selectedIndex + 1]) {

            //     return;
            // }

            // onDateSwitchItemClick($scope.selectedIndex + 1);

            // _scrollToPosition();
        }

        function setDateSwitchState() {
            $timeout(function () {
                $scope.isHideDateSwitchNode = _isDateSwitchNodeOverTop();
            }, 0);
        }

        function _scrollToPosition() {

            if (!dateSwitchNode) return;

            var top = dateSwitchNode.offsetTop;

            scroller.scrollTo(0, top);
        }

        function _isDateSwitchNodeOverTop() {

            var position = scroller.getScrollPosition();

            if (!position || !dateSwitchNode || dateSwitchNode.offsetTop === 0) return true;

            return position.top < dateSwitchNode.offsetTop;
        }

        function onNormalScrollHandle() {
            if (!$scope.isHideDateSwitchNode) return;

            var normalHandle = $ionicScrollDelegate.$getByHandle('normal-Scroller');
            var fixedTopHandle = $ionicScrollDelegate.$getByHandle('fixed-Top-Scroller');

            var normalHandlePostition = normalHandle.getScrollPosition();

            if (!normalHandlePostition) return;

            fixedTopHandle.scrollTo(normalHandlePostition.left, 0);
        }

        function onFixedTopScrollHandle(type) {
            if ($scope.isHideDateSwitchNode) return;

            var normalHandle = $ionicScrollDelegate.$getByHandle('normal-Scroller');
            var fixedTopHandle = $ionicScrollDelegate.$getByHandle('fixed-Top-Scroller');

            var fixedTopHandlePostition = fixedTopHandle.getScrollPosition();

            if (!fixedTopHandlePostition) return;

            normalHandle.scrollTo(fixedTopHandlePostition.left, 0);

        }

        function isProductsOdd() {
            if (!$scope.products) return false;

            return $scope.products.length % 2 == 1;
        }

    }

} ());
