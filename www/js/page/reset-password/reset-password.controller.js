(function() {
	'use strict';

	angular.module('10Style.password')
		.controller('PasswordCtrl', PasswordCtrl);
	PasswordCtrl.$inject = ["$scope", "$rootScope", "$state", "$window", "$location", "$ionicPopup", "$http", "$timeout",
		"$ionicScrollDelegate", "$ionicPlatform", "authentication", "securityCode", "Config", "Loading"
	];

	function PasswordCtrl($scope, $rootScope, $state, $window, $location, $ionicPopup, $http, $timeout,
		$ionicScrollDelegate, $ionicPlatform, authentication, securityCode, Config, Loading) {
		/**
		 * 登录成功之后要跳转的目标路由状态
		 */
		$scope.destination = $rootScope.signInDestination ? $rootScope.signInDestination : {
			ref: {
				state: "tab.home"
			},
			params: {
				type: "new"
			},
			options: {}
		};

		$scope.user = {
			//                     name: '15549053312',
			//                     password: 'pwd159357',
			//confirmPassword: 'pwd159357'
		};

		/*电话号码标签是否显示*/
		$scope.isNumberPromptShow = false;
		/*验证码标签是否显示*/
		$scope.isTestPromptShow = false;
		/*密码标签是否显示*/
		$scope.isPasswordPromptShow = false;
		/*重复密码标签是否显示*/
		$scope.isRepeatPromptShow = false;

		/*监听各个输入框值变化的函数*/
		$scope.numberChange = numberChange;
		$scope.testChange = testChange;
		$scope.passwordChange = passwordChange;
		$scope.repeatChange = repeatChange;

		/*保存用户重置信息*/
		$scope.resetInfo = {};

		/*是否需要再次发送验证码*/
		$scope.sendCodeAgain = false;

		/*是否为倒计时状态*/
		$scope.isCountdown = false;

		/*输入密码是否正确*/
		$scope.rightPwd = false;

		/*重复输入密码是否正确*/
		$scope.rightReinputPwd = false;

		/*验证码是否正确*/
		$scope.isSecurityCode = false;

		/*手机号是否正确*/
		$scope.rightPhone = false;

		/*手机号，密码格式，验证码未输入错误信息*/
		$scope.wrongMessage = null;

		/*倒计时*/
		$scope.countdown = 0;

		/*是否正在倒计时，用于禁用发送按钮*/
		$scope.isCounting = false;

		/*是否显示密码*/
		$scope.isShowPwd = {
			password: false,
			reinputPassword: false
		};

		/*发送验证码*/
		$scope.sendSecurityCode = sendSecurityCode;

		/*验证码再次发送倒计时*/
		$scope.startCounting = startCounting;

		/*返回倒计时时间*/
		$scope.reSendCountdown = reSendCountdown;

		/*提交重置密码信息*/
		$scope.resetPassword = resetPassword;

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

		/**
		 * 初始化操作
		 */

		function init() {

			$scope.$watch("resetInfo.name", function() {
				$scope.rightPhoneNum = Config.MOBILE_PHONE_FORMAT_REGEX.test($scope.resetInfo.name);
			});

			$scope.$on("$ionicView.beforeLeave", _beforeLeave);

			window.addEventListener('native.keyboardshow', _keyboardShowHandler);
			window.addEventListener('native.keyboardhide', _keyboardHideHandler);

		}
		///////////////////////////////////////////////////////////////////

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
			var isIOS = ionic.Platform.isIOS();
			var target = event.target.getAttribute('id');
			var offsetX = event.offsetX;
			var btnOffsetLeft = null;
			var btnOffsetWidth = null;
			if(event.target.nextElementSibling) {
				btnOffsetLeft = event.target.nextElementSibling.offsetLeft;
				btnOffsetWidth = event.target.nextElementSibling.offsetWidth;
			}

			$ionicScrollDelegate.$getByHandle('passwordScroll').scrollBottom({
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
			var scroller = document.body.querySelector('.reset-pwd');
			$scope.keyboardHeight = e.keyboardHeight;
		}

		/**
		 * 键盘隐藏事件处理函数
		 * @param e
		 * @private
		 */
		function _keyboardHideHandler(e) {
			$scope.isKeyboardShow = false;
			var scroller = document.body.querySelector('.reset-pwd');
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

		//监听手机号码框变化
		function numberChange() {
			if($scope.resetInfo.name) {
				$scope.isNumberPromptShow = true;
			} else {
				$scope.isNumberPromptShow = false;
			}

		};
		//验证码框变化
		function testChange($event) {
			if($scope.resetInfo.security_code) {
				$scope.isTestPromptShow = true;
			} else {
				$scope.isTestPromptShow = false;
			}
		};

		//新密码框变化
		function passwordChange($event) {
			if($scope.resetInfo.password) {
				$scope.isPasswordPromptShow = true;
			} else {
				$scope.isPasswordPromptShow = false;
			}
		};

		//确认新密码框变化
		function repeatChange() {
			$scope.isRepeatPromptShow = true;

			if($scope.resetInfo.reinputPassword) {
				$scope.isRepeatPromptShow = true;
			} else {
				$scope.isRepeatPromptShow = false;
			}
		};

		//密码框和重复密码框focus和blur事件函数 ↓
		function passwordFocus() {
			$scope.isPwdIconShow = true;
		}

		function passwordBlur() {
			$scope.isPwdIconShow = false;
		}

		function passwordRepeatFocus() {
			$scope.isPwdRepeatIconShow = true;
		}

		function passwordRepeatBlur() {
			$scope.isPwdRepeatIconShow = false;
		}
		//密码框和重复密码框focus和blur事件函数 ↑

		/*发送验证码*/
		function sendSecurityCode() {
			securityCode.send($scope.resetInfo.name).success(function(data, state, header) {
				/*验证码发送成功开始倒计时*/
				console.log("发送成功");
				$scope.countdown = data.send_time - header().timestamp;
				$scope.sendCodeAgain = true;
				$scope.isCounting = true;
				$scope.startCounting();
			}).error(function(data, status, header, config) {
				var errorMessage = '';
				if(data && data.error) {
					if(data.code === -105) {
						errorMessage = '验证码发送频繁，请稍后重试！验证码5分钟内有效';
					} 
					else if(data.code === -104){
						errorMessage = '手机号码有错误';
					}
					else {
						errorMessage = '系统繁忙，请稍后重试';
					}
				} else{
					errorMessage = '验证码发送失败，请检查您的网络';
				}
				
				$scope.sendCodeAgain = false;
				$ionicPopup.alert({
					title: '提示',
					template: errorMessage,
					okText: '知道了'
				});
			});
		}

		/*验证码再次发送倒计时*/
		function startCounting() {
			$scope.countdown--;
			if($scope.countdown == 0) {
				$timeout.cancel(promise);
				$scope.isCounting = false;
				return;
			}
			var promise = $timeout(function() {
				$scope.startCounting();
			}, 1000);
		}

		/*返回倒计时时间*/
		function reSendCountdown() {
			if($scope.countdown == 0)
				return "";

			return $scope.countdown + 's';
		}

		/*提交重置密码信息*/
		function resetPassword() {
			$scope.rightPhone = Config.MOBILE_PHONE_FORMAT_REGEX.test($scope.resetInfo.name);
			$scope.rightPwd = Config.PASSWORD_FORMAT_REGEX.test($scope.resetInfo.password);
			$scope.rightReinputPwd = $scope.resetInfo.password === $scope.resetInfo.reinputPassword;
			$scope.wrongMessage = !$scope.resetInfo.name ? '请输入手机号' :
				!$scope.rightPhone ? '手机号格式错误' :
				!$scope.resetInfo.security_code ? '请输入验证码' :
				!$scope.resetInfo.password ? '请输入新密码' :
				!$scope.rightPwd ? '密码为6-16位数字和字母' :
				!$scope.resetInfo.reinputPassword ? '请重复输入新密码' :
				!$scope.rightReinputPwd ? '两次输入密码不一致' : null;
			if(!$scope.rightPhone || !$scope.resetInfo.security_code || !$scope.resetInfo.password || !$scope.rightPwd || !$scope.rightReinputPwd) {
				$ionicPopup.alert({
					title: '提示',
					template: $scope.wrongMessage,
					okText: '知道了'
				});
			} else {
				authentication.resetPassword($scope.resetInfo.name, $scope.resetInfo.password, $scope.resetInfo.security_code).success(function(data, status) {
						$ionicPopup.alert({
							title: '提示',
							template: '密码更改成功',
							okText: '知道了'
						}).then(function() {
							_login($scope.resetInfo.name, $scope.resetInfo.password);
						});
					})
					.error(function(data, status) {
						$ionicPopup.alert({
							title: '提示',
							template: data.error
						});
					});
			}
		}

		/*用户登录*/
		function _login(username, password) {

			var errMessage = !username ? '请输入手机号' :
				!Config.MOBILE_PHONE_FORMAT_REGEX.test(username) ? '手机号格式错误' :
				!password ? '请输入密码' :
				!Config.PASSWORD_FORMAT_REGEX.test(password) ? '密码为6-16位数字和字母' : null;
			if(errMessage !== null) {
				$ionicPopup.alert({
					title: '提示',
					template: errMessage
				});
			} else {
				Loading.show({
					style: "circle"
				});
				authentication.signIn(
					username,
					password,
					function(result, data) {
						Loading.hide();
						if(result >= 0) {
							var dest = $scope.destination;
							if(dest) {
								$state.go(dest.ref.state, dest.params, dest.options);
								delete $rootScope.signInDestination; // 使用完之后要清理
							} else {
								$ionicPopup.alert({
									title: '提示',
									template: "没有有效的目标地址，登陆后不知道该前往何方:P"
								});
							}
						} else {
							$ionicPopup.alert({
								title: '提示',
								template: data
							});
						}
					}
				);
			}
		}

	}
}());