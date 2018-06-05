(function () {
    'use strict';

    angular.module('10Style.login')
        .controller('LoginController', LoginController);
    LoginController.$inject = ["$scope", "$rootScope", "$state", "$ionicPopup", "$ionicPlatform", "authentication", "Config", "Product", "Loading"];

    function LoginController($scope, $rootScope, $state, $ionicPopup, $ionicPlatform, authentication, Config, Product, Loading) {
        /**
         * 登录成功之后要跳转的目标路由状态
         */
        $scope.destination = $rootScope.signInDestination ? $rootScope.signInDestination : {
            ref: {state: "tab.home"},
            params: {type: "new"},
            options: {}
        };

        $scope.user = {
            name: 15555550021,
            password: 123456
        };

        /*输入密码是否正确*/
        $scope.rightPwd = false;

        /*手机号是否正确*/
        $scope.rightPhone = false;

        /*手机号，密码格式，验证码未输入错误信息*/
        $scope.wrongMessage = null;

        $scope.isNumberPromptShow = !!$scope.user.name;

        /*是否显示密码*/
        $scope.isShowPwd = {password: false, reinputPassword: false};

        /*用户登录*/
        $scope.login = login;


        /*监听电话号码变化 函数*/
        $scope.numberChange = numberChange;

        /*监听密码变化 函数*/
        $scope.passwordChange = passwordChange;

        $scope.onItemFocusClick = onItemFocusClick;


        init();

        function init() {

            var account = authentication.getLoginAccount();
            if(account){
                $scope.user.name = account;
            }
            $scope.isNumberPromptShow = !!$scope.user.name;
            $scope.isPasswordPromptShow = !!$scope.user.password;

            $scope.$on("$ionicView.beforeLeave",_beforeLeave);

            // var svgMorpheus = new SVGMorpheus('#my_svg');
            // svgMorpheus.to('account_box');
        }

        ///////////////////////////////////////////////////////////////////

        function onItemFocusClick() {
			$ionicPlatform.ready(function() {
				if(window.cordova && window.cordova.plugins.Keyboard) {
					cordova.plugins.Keyboard.disableScroll(true);
				}
			});
        }
        /**
         * 路由状态变化响应函数
         */
        function _beforeLeave() {

                $ionicPlatform.ready(function () {
                    if (window.cordova && window.cordova.plugins.Keyboard) {
                        console.log('onStateChangeStart ready...');
                        cordova.plugins.Keyboard.disableScroll(false);
                    }
                });

        }


        /**
         * 输入框光标切换
         */
        function numberChange() {
            $scope.isNumberPromptShow = !!$scope.user.name;
        }

        function passwordChange() {
            $scope.isPasswordPromptShow = !!$scope.user.password;
        }


        /*用户登录*/
        function login(username, password) {
            var errMessage = !username ? '请输入手机号' :
                !Config.MOBILE_PHONE_FORMAT_REGEX.test(username) ? '手机号格式错误' :
                    !password ? '请输入密码' :
                        !Config.PASSWORD_FORMAT_REGEX.test(password) ? '密码为6-16位数字和字母' : null;
            if (errMessage !== null) {
                $ionicPopup.alert(
                    {
                        title: '提示',
                        template: errMessage,
                        okText: '确认'
                    }
                );
            } else {
                Loading.show({
                    style: "circle"
                });
                authentication.signIn(
                    username,
                    password,
                    function (result, data) {
                        Loading.hide();
                        if (result >= 0) {
                            var dest = $scope.destination;
                            if (dest) {
                                ionic.Platform.ready(function () {
                                    if (window.plugins) {
                                        window.plugins.jPushPlugin.setAlias(username);
                                    }
                                });
                                $rootScope.hasNotifyUserLogin = false;
                                Product.removePopularCache();
                                $state.go(dest.ref.state, dest.params, dest.options);
                                delete $rootScope.signInDestination; // 使用完之后要清理
                            } else {
                                $ionicPopup.alert({title: '提示', template: "没有有效的目标地址，登陆后不知道该前往何方:P", okText: '确认'});
                            }
                        }
                        else {
                            $ionicPopup.alert(
                                {
                                    title: '提示',
                                    template: data,
                                    okText: '确认'
                                }
                            );
                        }
                    }
                );
            }
        }


    }

}());

