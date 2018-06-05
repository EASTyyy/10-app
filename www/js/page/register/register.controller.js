(function() {
	"use strict"

	angular.module('10Style.register')
		.controller('RegisterCtrl', RegisterCtrl);

	RegisterCtrl.$inject = ["$scope", "$rootScope", "$ionicPopup", "$timeout", "$window", "$location",
		"$ionicScrollDelegate", "$ionicPlatform", "MyRouter", "securityCode", "authentication", "Config", "Loading", "scrollByKeyboard"
	];

	function RegisterCtrl($scope, $rootScope, $ionicPopup, $timeout, $window, $location,
		$ionicScrollDelegate, $ionicPlatform, MyRouter, securityCode, authentication, Config, Loading, scrollByKeyboard) {

		$scope.registerInfo = {
			phone: '',
			security_code: '',
			password: '',
			reinputPassword: ''
		}; /*保存用户重置信息*/

		/*电话号码标签是否显示*/
		$scope.isNumberPromptShow = false;
		/*验证码标签是否显示*/
		$scope.isTestPromptShow = false;
		/*密码标签是否显示*/
		$scope.isPasswordPromptShow = false;
		/*重复密码标签是否显示*/
		$scope.isRepeatPromptShow = false;

		/*密码 类型切换按钮是否显示*/
		$scope.isPwdIconShow = false;
		/*确认密码 类型切换按钮是否显示*/
		$scope.isPwdRepeatIconShow = false;

		$scope.count = 0;
		$scope.rightPhone = false; /*手机号是否正确*/
		$scope.rightPwd = false; /*输入密码是否正确*/
		$scope.rightReinputPwd = false;
		$scope.rightPhoneNum = false; /*电话号码输入是否正确*/
		$scope.wrongMessage = null; /*手机号，密码格式，验证码未输入错误信息*/
		$scope.isFirstTimeSendSecurityCode = true;

		$scope.isShowPwd = {
			password: false,
			reinputPassword: false
		};

		/**
		 * 键盘的高度
		 * @type {number}
		 */
		$scope.keyboardHeight = 0;

		/**
		 * 键盘是否弹出
		 * @type {boolean}
		 */
		$scope.isKeyboardShow = false;

		$scope.sendSecurityCode = sendSecurityCode; /*发送验证码*/
		$scope.startCounting = startCounting; /*再次发送倒计时*/
		$scope.userRegister = userRegister; /*用户注册*/

		/*监听各个输入框值变化的函数*/
		$scope.numberChange = numberChange;
		$scope.testChange = testChange;
		$scope.passwordChange = passwordChange;
		$scope.repeatChange = repeatChange;

		/*密码框focus和blur事件*/
		$scope.passwordFocus = passwordFocus;
		$scope.passwordBlur = passwordBlur;
		$scope.passwordRepeatFocus = passwordRepeatFocus;
		$scope.passwordRepeatBlur = passwordRepeatBlur;

		/**
		 * 输入框点击事件
		 * @type {onItemFocusClick}
		 */
		$scope.onItemFocusClick = onItemFocusClick;

		init();

		function init() {

			$scope.$watch("registerInfo.phone", function() {
				$scope.rightPhoneNum = Config.MOBILE_PHONE_FORMAT_REGEX.test($scope.registerInfo.phone);
			});

			$scope.$on("$ionicView.beforeLeave", _beforeLeave);

			window.addEventListener('native.keyboardshow', _keyboardShowHandler);
			window.addEventListener('native.keyboardhide', _keyboardHideHandler);

		}

		/**
		 * 输入框点击的时候聚焦的响应函数
		 * @param event
		 */
		function onItemFocusClick(event) {
			$ionicPlatform.ready(function() {
				if(window.cordova && window.cordova.plugins.Keyboard) {
					cordova.plugins.Keyboard.disableScroll(true);
				}
			});
			var target = event.target.getAttribute('id');
			var offsetX = event.offsetX;
			var btnOffsetLeft = 0;
			var btnOffsetWidth = 0;
			var isIOS = ionic.Platform.isIOS();
			if(event.target.nextElementSibling) {
				btnOffsetLeft = event.target.nextElementSibling.offsetLeft;
				btnOffsetWidth = event.target.nextElementSibling.offsetWidth;
			}

			$ionicScrollDelegate.$getByHandle('registerScroll').scrollBottom({
				shouldAnimate: true
			});

			if(isIOS) {

				$timeout(function() {
					var elem = event.target;
					var ori = elem.value;
					elem.value = elem.value + "0";
					_setSelectionRange(elem);
					elem.value = ori;
					_setSelectionRange(elem);
				}, 500)

			}

			if(target && offsetX >= btnOffsetLeft && offsetX <= (btnOffsetLeft + btnOffsetWidth)) {

				if(target == "password") {
					$scope.isShowPwd['password'] = !$scope.isShowPwd['password'];
				} else if(target == "reinputPassword") {
					$scope.isShowPwd['reinputPassword'] = !$scope.isShowPwd['reinputPassword'];
				}

			}

		}

		/**
		 * 键盘显示事件处理函数
		 * @param e
		 * @private
		 */
		function _keyboardShowHandler(e) {
			$scope.isKeyboardShow = true;
			var scroller = document.body.querySelector('.register-content');
			$scope.keyboardHeight = e.keyboardHeight;
		}

		/**
		 * 键盘隐藏事件处理函数
		 * @param e
		 * @private
		 */
		function _keyboardHideHandler(e) {
			$scope.isKeyboardShow = false;
			var scroller = document.body.querySelector('.register-content');
			// scroller.style.bottom = "";
			$ionicScrollDelegate.resize();
		}

		/**
		 * 设置input的焦点的位置
		 * @param elem
		 * @private
		 */
		function _setSelectionRange(elem) {
			if(elem !== null) {
				var index = elem.value.length;
				if(elem.createTextRange) {
					var range = elem.createTextRange();
					range.move('character', index);
					range.select();
				} else {
					if(elem.setSelectionRange) {
						elem.focus();
						elem.setSelectionRange(index, index);
					} else
						elem.focus();
				}
			}
		}

		/**
		 * 路由状态变化响应函数
		 */
		function _beforeLeave() {

			window.removeEventListener('native.keyboardshow', _keyboardShowHandler);
			window.removeEventListener('native.keyboardhide', _keyboardHideHandler);

			$ionicPlatform.ready(function() {
				if(window.cordova && window.cordova.plugins.Keyboard) {
					cordova.plugins.Keyboard.disableScroll(false);
				}
			});

		}

		//密码框focus和blur事件 ↓
		function passwordFocus() {
			$scope.isPwdIconShow = true;
		}

		function passwordBlur() {
			$scope.isPwdIconShow = false;
		}

		function passwordRepeatFocus() {
			$scope.isPwdRepeatIconShow = true;

            scrollByKeyboard.upPage('button', 'occupyContainer');
		}

		function passwordRepeatBlur() {
			$scope.isPwdRepeatIconShow = false;

            scrollByKeyboard.downPage('occupyContainer');
		}
		//密码框focus和blur事件 ↑

		function sendSecurityCode() {

			securityCode.send($scope.registerInfo.phone).then(function(response) {
				if(response.data && response.data.send_time) {
					console.log('send success');
					$scope.isFirstTimeSendSecurityCode = false;
					$scope.count = 60;
					$scope.startCounting();
				} else if(reponse.data && response.data.error) {
					$ionicPopup.alert({
						title: '提示',
						template: reponse.data.error,
						okText: '知道了'
					});
				}
			}, function(response) {
				var errorMessage = '';
				if (response.data && response.data.error) {
                    if (response.data.code === -105) {
                        errorMessage = '验证码发送频繁，请稍后重试！验证码5分钟内有效';
                    }
                    else if(response.data.code === -104){
                        errorMessage = '手机号码有错误';
                    }
                    else {
                        errorMessage = '系统繁忙，请稍后重试';
                    }
                } else {
                    errorMessage = '验证码发送失败，请检查您的网络';
                }
				$ionicPopup.alert({
					title: '提示',
					template: errorMessage,
					okText: '知道了'
				});

			})
		}

		function startCounting() {
			$scope.count--;
			var promise = $timeout(function() {
				$scope.startCounting();
			}, 1000);
			if($scope.count == 0) {
				$timeout.cancel(promise);
			}
		}

		function userRegister() {

			var result = _userVerification();

			if(result) {
				console.log("register");
				Loading.show({
					style: "circle"
				});
				authentication.register($scope.registerInfo.phone, $scope.registerInfo.password, $scope.registerInfo.security_code).then(
					function(response) {
						authentication.signIn($scope.registerInfo.phone, $scope.registerInfo.password,
							function(result, data) {
								Loading.hide();
								if(result > 0) {
									if(Config.APPLY_USER_AUTHENTICATION) {
										delete $rootScope.destinationAfterPassingUserAuthentication;
										MyRouter.gotoStateDirectly("user-authentication", {}, {
											clearHistory: true
										});
									} else {
										MyRouter.gotoStateDirectly("tab.home");
									}
								} else {
									$ionicPopup.alert({
										title: '提示',
										template: data,
										okText: '知道了'
									});
								}
							}
						)
					},
					function(response) {
						Loading.hide();
						$ionicPopup.alert({
							title: '提示',
							template: response.data.error,
							okText: '知道了'
						});
					}
				)
			}
		}

		function _userVerification() {
			$scope.rightPhone = $scope.registerInfo.phone && Config.MOBILE_PHONE_FORMAT_REGEX.test($scope.registerInfo.phone);
			$scope.rightPwd = $scope.registerInfo.password && Config.PASSWORD_FORMAT_REGEX.test($scope.registerInfo.password);
			$scope.rightReinputPwd = $scope.registerInfo.password == $scope.registerInfo.reinputPassword;
			$scope.wrongMessage = !$scope.registerInfo.phone ? '请输入手机号' :
				!$scope.rightPhone ? '手机号格式错误' :
				!$scope.registerInfo.security_code ? '请输入验证码' :
				!$scope.registerInfo.password ? '请输入密码' :
				!$scope.rightPwd ? '密码为6-16位数字和字母' :
				!$scope.registerInfo.reinputPassword ? '请重复输入密码' :
				!$scope.rightReinputPwd ? '两次输入密码不一致' : null;

			if(!$scope.rightPhone || !$scope.registerInfo.security_code || !$scope.rightPwd || !$scope.rightReinputPwd) {
				$ionicPopup.alert({
					title: '提示',
					template: $scope.wrongMessage,
					okText: '知道了'
				});
				return false;
			} else {
				return true;
			}
		}

		/**
		 * 输入框光标切换
		 */
		//电话号
		function numberChange() {
			if($scope.registerInfo.phone) {
				$scope.isNumberPromptShow = true;
			} else {
				$scope.isNumberPromptShow = false;
			}

		};
		//验证码
		function testChange() {
			if($scope.registerInfo.security_code) {
				$scope.isTestPromptShow = true;
			} else {
				$scope.isTestPromptShow = false;
			}

		};
		//密码
		function passwordChange() {
			if($scope.registerInfo.password) {
				$scope.isPasswordPromptShow = true;
			} else {
				$scope.isPasswordPromptShow = false;
			}
		};

		//重复密码
		function repeatChange() {
			if($scope.registerInfo.reinputPassword) {
				$scope.isRepeatPromptShow = true;
			} else {
				$scope.isRepeatPromptShow = false;
			}
		};

	}
}());