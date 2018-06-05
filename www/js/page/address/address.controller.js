(function () {
    'use strict';

    angular.module('10Style.address')
        /**
         * 地址列表页面控制器
         */
        .controller('AddressCtrl', AddressCtrl);

    AddressCtrl.$inject = ["$scope", "$rootScope", "$sce", "$state", "$stateParams", "$ionicPopup", "Loading", "Address", "Config", 'ADDRESS_STATUS', "MyRouter", "authentication"];

    function AddressCtrl($scope, $rootScope, $sce, $state, $stateParams, $ionicPopup, Loading, Address, Config, ADDRESS_STATUS, MyRouter, authentication) {
        /**
         * 数据是否已经初始化
         * @type {boolean}
         */
        $scope.initialized = false;
        /*输入手机号是否正确*/
        $scope.rightNumber = false;
        $scope.showLoading = false;
        $scope.loadingComplete = false;

        $scope.addresses = [];
        $scope.address = {};

        /**
         * @type {hasAddress}
         */
        $scope.hasAddress = hasAddress;

        /**
         * @type {deleteAddress}
         */
        $scope.delete = deleteAddress;

        $scope.isDefaultAddress = isDefaultAddress;

        $scope.go = go;

        $scope.goTo = goTo;

        _init();

        ////////////////////////////////////////////////

        function _onViewBeforeLeaveHandle(){
            if(!$scope.loadingComplete) Loading.hide();
        }

        /**
         * 当前是否有地址项
         * @returns {boolean}
         */
        function hasAddress() {
            if ($scope.addresses) {
                return $scope.addresses.length !== 0;
            }

            return false;
        }


        /**
         * 删除指定的地址
         * @param item
         */
        function deleteAddress(item) {
            Loading.show();
            Address.delete(item.id).success(function () {
                    Loading.hide();
                    var index = $scope.addresses.indexOf(item);
                    if (index > -1) {
                        $scope.addresses.splice(index, 1);
                        $rootScope.addressCount = $scope.addresses.length;
                    }
                })
                .error(function (data) {
                    console.log(data);
                    Loading.hide();
                });
        }

        /**
         * 格式化从服务端传过来的地址信息到本地识别的地址信息
         * @param item
         * @returns {{name: *, phone: *, area: string, addr: *, id: *, account_id: (*|Document.account_id|string), flag: *}}
         */

        function isDefaultAddress(item) {
            return item.flag === ADDRESS_STATUS.DEFAULT_ADDRESS;
        }

        function go(state) {
            if ($scope.addresses) {
                MyRouter.gotoStateDirectly(state, {
                    total: $scope.addresses.length
                });
            }
        }

        function goTo(params) {
            if (params) {
                MyRouter.gotoStateDirectly(params.state);
                $rootScope.updateAddressId = params.id;
            }
        }

        /**
         * 初始化操作
         */
        function _init() {
            Loading.show({style: 'circle', fullScreen: false});
            authentication.refreshSignInStatus(
                function (result) {
                    if (result == 0) // 未登陆而且token不存在
                    {
                        Loading.hide();
                        $scope.loadingComplete = true;
                        $rootScope.signInDestination = {
                            ref: {
                                state: $state.current.name,
                                paramExpr: JSON.stringify($stateParams)
                            }, params: $stateParams, options: {}
                        };
                        $state.go("login", {back: $state.current.name});
                        return;
                    }

                    Address.list().then(function (response) {
                        Loading.hide();
                        $scope.loadingComplete = true;
                        $scope.initialized = true;
                        console.log();
                        for (var i in response.data.rows) {
                            if(response.data.rows && response.data.rows.length !== 0){
                                $rootScope.addressCount = response.data.total;
                                response.data.rows[i].addr = $sce.trustAsHtml( response.data.rows[i].addr.split('\\n').join(' '));
                            }
                            $scope.addresses.push(response.data.rows[i]);
                        }

                    }).catch(function (data) {
                        Loading.hide();
                        $scope.loadingComplete = true;
                        $scope.initialized = true;

                    });
                }
            );
        }

        $scope.$on('$ionicView.beforeLeave', _onViewBeforeLeaveHandle);

        ////////////////////////////////////////////////
    }

}());
