(function(){
    angular.module('10style.accountSafeChangePhone')
           .controller('ChangePhoneCtrl', ChangePhoneCtrl);

           ChangePhoneCtrl.$inject = ['$scope', '$timeout', '$interval', '$ionicPopup', 'toast', 'ChangePhoneServ', 'MyRouter', 'authentication', 'Config'];

        	function ChangePhoneCtrl($scope, $timeout, $interval, $ionicPopup, toast, ChangePhoneServ, MyRouter, authentication, Config) {
           		
				//获取验证码
           		$scope.getCheckedNum = getCheckedNum;

           		//确认修改手机号码
           		$scope.sendChangePhone = sendChangePhone;

           		//初始化数据
           		$scope.data = {};

                $scope.timePromise = '';

           		//初始化。。。
           		
           		_init();

           		function _init() {

           			//监听输入的手机号码
           			$scope.$watch('data.phone', _checkPhone);

           			//用户当前的手机号码
           			$scope.$on('$ionicView.beforeEnter', _resetForm);
           		}

           		/*
           		 *初始化表单的一些数据
           		 */
           		function _resetForm() {

           			//默认禁止获取验证码按钮
	           		$scope.isGetCheckedNumBtnDisabled = true;

	           		//默认输入框可输入
	           		$scope.isPhoneInputDisabled = false;

	           		//用户当前的手机号码
	           		$scope.userPhone = JSON.parse(sessionStorage.getItem('account_info')).phone;
           		}

				/*
				 * 验证输入的手机号码
				 * @param newValue 新输入的手机号码
				 * @param oldValue 原来输入的手机号码
				 * @param 
				 * @returns  
				 */
				function _checkPhone(newValue, oldValue, scope) {
					$scope.isGetCheckedNumBtnDisabled = !Config.MOBILE_PHONE_FORMAT_REGEX.test(newValue)
				}

                function _resetTime(obj) {
                    $scope.isGetCheckedNumBtnDisabled = false;
                    $scope.isPhoneInputDisabled = false;
                    obj.innerHTML = '';
                    $interval.cancel($scope.timePromise);  
                }

				/*
				 *获取验证码
				 */
				function getCheckedNum() {
					ChangePhoneServ.getVerification($scope.data.phone)
  					  				.then(function(resp) {
      					  			        var second = 60;
                                            var obj = document.getElementById('restTime');
      					  			        $scope.isGetCheckedNumBtnDisabled = true;
    										$scope.isPhoneInputDisabled = true;

    										$scope.timePromise = $interval(function() {
                                                obj.innerHTML = second + 'S';    
                                                if(second < 0) {  
                                                    _resetTime(obj);
                                                }   
                                                second--;								              
  					  					}, 1000);

  					  				}, function(resp) {
    										if(resp.data.code == '-105') {
                                                toast.show({
                                                    isShakeAnimate: true,
                                                    title: '验证码发送频繁，请稍后重试！验证码5分钟内有效'
                                                });
                                                return;
    										}
  										    toast.show({
                                                isShakeAnimate: true,
                                                title: '获取验证码失败'
                                            });
  					  				});
				}

				/*
				 *确认修改手机号码
				 */
				function sendChangePhone() {

					if(!Config.MOBILE_PHONE_FORMAT_REGEX.test($scope.data.phone)) {
                        toast.show({
                            isShakeAnimate: true,
                            title: "请输入正确的手机号码"
                        });
                        return;
					}

                    if($scope.data.checkNum == undefined || $scope.data.checkNum.toString().length != 6) {
                        toast.show({
                            isShakeAnimate: true,
                            title: "请输入6位数的验证码"
                        });
                        return;
					}
                    
					ChangePhoneServ.sendChanged($scope.data.phone, $scope.data.checkNum)
									   .then(function(resp) {
                                                console.log(resp);
									   			toast.show({
                                                    'title': '手机号码更换成功！'
                                                });
                                                //清除计时器
                                                 var obj = document.getElementById('restTime');
                                                _resetTime(obj);
									   			//去除token
									   			authentication.removeToken();

									   			//表单初始化
									   			$scope.data = {};

									   			//页面跳到重新登录页面
									   			MyRouter.gotoStateDirectly("login");		
									   }, function(resp) {
                                           //清除计时器
                                           var obj = document.getElementById('restTime');
                                           _resetTime(obj);

									   		if(resp.data.code == '-101') { 
                                                toast.show({
                                                    isShakeAnimate: true,
                                                    title: "短信验证码错误"
                                                });
                                                return;
									   		}
                                            if(resp.data.code == '-10300') {
                                                toast.show({
                                                    isShakeAnimate: true,
                                                    title: "该手机号码已经被占用"
                                                });
                                                return;
									   		}
                                            if(resp.data.code == '-12502') {
                                                toast.show({
                                                    isShakeAnimate: true,
                                                    title: "只有普通用户才能修改用户名"
                                                });
                                                return;
                                            }
                                            toast.show({
                                                isShakeAnimate: true,
                                                title: "修改或重置手机失败"
                                            });
                                            
									   });
					
				}
           	}
}());