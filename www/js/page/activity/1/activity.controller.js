(function () {
    'use strict';

    angular.module('10Style.activity')
        .controller('ActivityTemplate1Ctrl', ActivityTemplate1Ctrl);

    ActivityTemplate1Ctrl.$inject = ["$scope", "$stateParams", "$ionicScrollDelegate", '$ionicPopup', '$ionicModal', 'Activity', "ProductGroup", "ComponentParser",
    "Loading", "showBottomSlogan", "IMAGE_PARAMS", "SessionStorage", "Product", "Config", "wechatShare"];

    function ActivityTemplate1Ctrl($scope, $stateParams, $ionicScrollDelegate, $ionicPopup, $ionicModal, Activity, ProductGroup, ComponentParser,
    Loading, showBottomSlogan, IMAGE_PARAMS, SessionStorage, Product, Config, wechatShare) {

        var SCROLLER_NAME = 'activity-1-scroller';
        var _isAbleShare = false;

        $scope.IMAGE_PARAMS = IMAGE_PARAMS;


        $scope.loadGroupData = loadGroupData;
        $scope.onScrollHandle = onScrollHandle;
        $scope.isSoldOut = Product.isSoldOut;
        $scope.isPreProduct = Product.isPreProduct;

        $scope.isProductsOdd = isProductsOdd;
        $scope.share = share;

        init();

        function init() {
            $scope.$on('$ionicView.beforeEnter', _onViewBeforeEnterHandle);
        }

        function share(){
            if(!_isAbleShare){return};
            var url = Config.SHARE_HOSTNAME + '/#/activity/' + $stateParams.id + '/' + $stateParams.template + '/&';
            wechatShare.show({
                title: $scope.view &&  $scope.view.title ? $scope.view.title : "10时尚",
                desc: $scope.note ? $scope.note : "10时尚平台",
                shareUrl: url,
                imgUrl: "http://m.yilinstyle.com/img/10_logo.png"
            });
        }

        function _onViewBeforeEnterHandle(events, data) {
            if (!$stateParams || !$stateParams.id) return;

            if (data.direction === 'forward') {
                Loading.show({ style: 'pointer', fullScreen: false });

                _initState();
                loadData();
            }

        }

        function _initState() {
            $ionicScrollDelegate.$getByHandle(SCROLLER_NAME).scrollTop();

            $scope.initialize = false;
            $scope.showLoading = false;
            $scope.hasMoreData = false;
            $scope.note = null;
            
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
            $scope.note = response.data.rows[0].note;

            $scope.header = ComponentParser.execute(contents[0]);
            $scope.title = ComponentParser.execute(contents[1]);

            $scope.list = ComponentParser.execute(contents[2]);
            _isAbleShare = true;
        }

        function loadDataFail() {
            Loading.hide();
        }

        function loadDataAlways() {
            $scope.list.products = [];
            loadGroupData();
        }

        function loadGroupData() {

            if (!$scope.list || !$scope.list.groupId) return;

            var groupId = $scope.list.groupId;

            if ($scope.initialize) {
                $scope.showLoading = true;
            }

            ProductGroup.get({ tid: groupId, offset: $scope.list.products.length })
                .then(loadGroupDataSuccess)
                .catch(loadGroupDataFail)
                .finally(loadGroupDataAlways);
        }

        function loadGroupDataSuccess(response) {

            if (!response || !response.data) return;

            var products = response.data.rows;

            $scope.list.products = $scope.list.products.concat(products);

            $scope.hasMoreData = $scope.list.products.length < response.data.total;
        }

        function loadGroupDataFail() {

        }

        function loadGroupDataAlways() {
            Loading.hide();
            $scope.showLoading = false;
            $scope.initialize = true;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        function onScrollHandle() {

            if (!$scope.list || !$scope.list.css) {
                return;
            }

            $scope.$apply(function () {
                $scope.bottomSlogan = showBottomSlogan.get($scope.hasMoreData, SCROLLER_NAME, $scope.list.css);
            })
        }

        function isProductsOdd() {
            if (!$scope.list || !$scope.list.products) return false;

            return $scope.list.products.length % 2 == 1;
        }

    }

} ());
