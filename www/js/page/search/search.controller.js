(function () {
    'use strict';

    angular.module('10Style.search')
        .controller('SearchCtrl', SearchCtrl);

    SearchCtrl.$inject = ["$scope", "$stateParams", "Product", "MyRouter", "$ionicHistory",
        "LocalService", "SessionService"];

    function SearchCtrl($scope, $stateParams, Product, MyRouter, $ionicHistory,
                        LocalService, SessionService) {

        var STATE_NAME_LIST = ['tab.home', 'tab.discovery', 'category'];

        var LOCAL_STORAGE_NAME = 'records';

        

        $scope.back = back;                                       //取消按钮
        $scope.clearRecords = clearRecords;                       //删除所有搜索纪录
        $scope.onItemClicked = onItemClicked;                     //点击搜索纪录时触发
        $scope.hasRecords = hasRecords;                             //无纪录时不显示清除搜索纪录
        $scope.hasPopular = hasPopular;                             //没有热门搜索词时不显示
        $scope.onSearchInputKeyPress = onSearchInputKeyPress;     //搜索框回车时触发
        $scope.search = {};
		init();
        function init() {
            bindKeyword();

            bindRecords();

            loadPopularData();

            setBackViewStateName();

            $scope.$on("$ionicView.afterLeave", function (event, data) {
                addRecord();
            });
        }

        function setBackViewStateName() {

            var view = $ionicHistory.backView();

            if (!view || !view.stateName) return;

            if (STATE_NAME_LIST.indexOf(view.stateName) === -1) return;

            SessionService.setItem('search-back-state-name', view.stateName);
        }

        function bindKeyword() {
            if (!$stateParams || !$stateParams.keyword) return;

            $scope.search.keyword = $stateParams.keyword;
        }

        function bindRecords() {
            $scope.records = JSON.parse(LocalService.getItem(LOCAL_STORAGE_NAME)|| '[]');
        }

        function loadPopularData() {
            Product.popular()
                .then(loadPopularDataSuccess)
                .catch(loadPopularDataFail)
                .finally(loadPopularDataAlways);
        }

        function loadPopularDataSuccess(response) {
            if (!response || !response.data || !response.data.rows) return;

            $scope.popular = response.data.rows;
            // $scope.popular = [];
        }

        function loadPopularDataFail() {

        }

        function loadPopularDataAlways() {

        }

        function hasPopular() {
            return $scope.popular ? $scope.popular.length !== 0 : false;
        }


        function hasRecords() {
            return $scope.records ? $scope.records.length !== 0 : false;
        }

        function clearRecords() {
            $scope.records = [];
            LocalService.removeItem(LOCAL_STORAGE_NAME);
        }

        function back() {
            MyRouter.goBackState();
        }

        function onItemClicked(item) {
            if (!item) return;

            $scope.search.keyword = item;

            search();
        }

        function onSearchInputKeyPress($event) {
            if ($event.keyCode !== 13) return;
            search();
        }


        function search() {
            if (!$scope.search.keyword || $scope.search.keyword.trim() === '') return;

            MyRouter.gotoStateDirectly('search-result', { keyword: $scope.search.keyword }, { clearPrevHistory: true });

            //MyRouter.gotoStateDirectly('search-result', { keyword: $scope.search.keyword }, null, MyRouter.getCurrentStateHistory());

        }

        //添加一个新纪录
        function addRecord() {
            if (!$scope.search.keyword || $scope.search.keyword.trim() === '') return;

            var items = [$scope.search.keyword].concat($scope.records);

            items = filterUniqueItemInArray(items);

            $scope.records = items.slice(0, 5);

            LocalService.setItem(LOCAL_STORAGE_NAME, JSON.stringify($scope.records));
        }

        //过滤数组中唯一的数据
        function filterUniqueItemInArray(items) {
            if (!Array.isArray(items))
                return [];

            return items.filter(function (item, index, self) {
                return self.indexOf(item) === index;
            });
        }


    }

} ());
