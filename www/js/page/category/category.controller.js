(function () {
    "use strict"

    angular.module('10Style.category')
        .controller('CategoryCtrl', CategoryCtrl);

    CategoryCtrl.$inject = ["$scope", "$ionicPopup", "MyRouter", "Category", "Config", "Loading"];

    function CategoryCtrl($scope, $ionicPopup, MyRouter, Category, Config, Loading) {

        $scope.backToHome = backToHome;

        $scope.categories = [];

        $scope.onSearchInputFocused = onSearchInputFocused;

        var _rows = [];

        //////////////////////////////////

        init();

        ////////////////////////

        function init() {
            _getList();
        }

        function onSearchInputFocused() {
            MyRouter.gotoStateDirectly('search');
        }

        //获取分类列表
        function _getList() {
            Loading.show({ fullScreen: false });

            Category.list()
                .then(function (resp) {

                    _iterateCategories(resp.data.rows);
                    //						console.log(resp)
                })
                .catch(function (resp) {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '获取分类列表失败',
                        okText: '知道了'
                    });
                })
                .finally(function (resp) {
                    Loading.hide();
                });
        }

        function _iterateCategories(categories) {
            if (!categories) {
                return
            }
            angular.forEach(categories, function (category, index, array) {

                if (category && category.flag == 0) {

                    if (category.children && category.children.length > 0) {

                        _iterateCategories(category.children);

                    }
                    else {
                        _rows = _rows.concat(category);
                    }

                    $scope.categories = _rows;

                    //					console.log($scope.categories)

                }
            })

        }

        function backToHome() {
            MyRouter.gotoStateDirectly("tab.home", {}, { clearHistory: true, direction: "back" });
        }


    }
} ());
