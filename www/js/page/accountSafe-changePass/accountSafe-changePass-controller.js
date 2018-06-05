(function(){
    angular.module('10style.accountSafeChangePass')
           .controller('ChangePassCtrl', ChangePassCtrl);

           ChangePassCtrl.$inject = ['$scope', '$timeout', '$ionicPopup', 'toast', 'AccountSafeChangePassServ', 'MyRouter', 'authentication', 'Config'];

           function ChangePassCtrl($scope, $timeout, $ionicPopup, toast, AccountSafeChangePassServ, MyRouter, authentication, Config) {

              
           		//点击切换查看旧密码
           		$scope.toggleShowOldPwd = toggleShowOldPwd;

           		//点击切换查看新密码
           		$scope.toggleShowNewPwd = toggleShowNewPwd;

           		//点击切换查看确认密码
           		$scope.toggleShowSurePwd = toggleShowSurePwd;

           		//旧密码输入框光标焦点切换事件
           		$scope.focusOldPwd = focusOldPwd;

           		//新密码输入框光标焦点切换事件
           		$scope.focusNewPwd = focusNewPwd;
           		$scope.blurNewPwd = blurNewPwd;

           		//确认密码输入框光标焦点切换事件
           		$scope.focusSurePwd = focusSurePwd;
           		$scope.blurSurePwd = blurSurePwd;

              //实时监听新密码是否符合验证
              $scope.checkNewPwd = checkNewPwd;

           		//发送数据到后台
           		$scope.sendChangePwd = sendChangePwd;

           		//初始数据
           		$scope.isShowPwd = {
                  isShowOldPwd: true,
                  isShowNewPwd: false,
                  isShowSurePwd: false
              };

              //初始输入框数据
              $scope.data = {};


           		//////////////////////////////////////////////
           		
           		/*
           		 *初始化。。。
           		 */
           		_init();

           		function _init() {

           			  $scope.$on('$ionicView.beforeEnter', _resetForm);
           		}

              /*
               *初始化表单的一些操作
               */
               function _resetForm() {

                  //隐藏旧密码切换按钮
                  $scope.isOldPwdShow = false;

                  //隐藏新密码切换按钮
                  $scope.isNewPwdShow = false;

                  //隐藏确认密码切换按钮
                  $scope.isSurePwdShow = false;

                  //确认新密码输入框不可输入
                  $scope.isSurePwdDisabled = true;
               }

           		/*
           		 * 旧密码点击切换
           		 */
           		function toggleShowOldPwd(evevt) {
                  var obj = document.getElementById('oldPwd');
                  set_text_value_position('oldPwd', -1); 
                  if(_toggleInputType(event, obj)) {
                      $scope.isShowPwd.isShowOldPwd = !$scope.isShowPwd.isShowOldPwd; 
                  }
           		}

           		/* 
           		 * 新密码点击切换
           		 */
           		function toggleShowNewPwd(event) {
                  var obj = document.getElementById('newPwd');
                  set_text_value_position('newPwd', -1);
                  if(_toggleInputType(event, obj)) {
                     $scope.isShowPwd.isShowNewPwd = !$scope.isShowPwd.isShowNewPwd;
                  }
              }

           		/*
           		 * 确认密码点击切换
           		 */
           		function toggleShowSurePwd(event) {
                  var obj = document.getElementById('surePwd');
                  set_text_value_position('surePwd', -1);
                  if(_toggleInputType(event, obj)) {
                      $scope.isShowPwd.isShowSurePwd = !$scope.isShowPwd.isShowSurePwd;
                  }
              } 

              /**
             * 输入框点击的时候聚焦的响应函数
             * @param event 点击事件
             * @param eventObj 点击事件对象
             */
              function _toggleInputType(event, eventObj) {

                  //点击位置距离input输入框最左边的距离
                  var eventOffsetX = event.offsetX; 

                  //input输入框的宽度
                  var objWidth = eventObj.offsetWidth 

                  //点击不切换的区域
                  var banToggleAreaWidth = objWidth - 60; 

                  return eventOffsetX >= banToggleAreaWidth && eventOffsetX <= objWidth;
              }

              //控制光标位置函数
              function set_text_value_position(obj, spos) {
                  var tobj = document.getElementById(obj);
                  if(spos < 0)
                          spos = tobj.value.length;
                  if(tobj.setSelectionRange){ //兼容火狐,谷歌
                          setTimeout(function(){
                              tobj.setSelectionRange(spos, spos);
                              tobj.focus();}
                              ,100);
                  }else if(tobj.createTextRange){ //兼容IE
                          var rng = tobj.createTextRange();
                          rng.move('character', spos);
                          rng.select();
                  }else {
                    setTimeout(function() {
                              tobj.setSelectionRange(spos, spos);
                              tobj.focus();
                            }, 100);                  }
              }     

           		/*
           		 * 光标聚焦旧密码事件
           		 */
           		function focusOldPwd() {
           		    $scope.isOldPwdShow = true;
                  $scope.isNewPwdShow = false;
                  $scope.isSurePwdShow = false;
           		}

           		/*
           		 * 光标聚焦新密码事件
           		 */
           		function focusNewPwd() {
           			  $scope.isOldPwdShow = false;
                  $scope.isNewPwdShow = true;
                  $scope.isSurePwdShow = false;
           		}

              /*
               * 光标聚焦确认密码事件
               */
              function focusSurePwd() {
                  $scope.isOldPwdShow = false;
                  $scope.isNewPwdShow = false;
                  $scope.isSurePwdShow = true;
              }

           		/*
           		 *光标失焦新密码验证密码长度
           		 */
           		function blurNewPwd() {
                  if(!Config.PASSWORD_FORMAT_REGEX.test($scope.data.newPwd) && $scope.data.newPwd != undefined && $scope.data.newPwd != '') {
                        toast.show({
                            isShakeAnimate: true,
                            title: "密码长度为6-16位字母和数字"
                        });
                  }
              }

           		/*
           		 * 光标失焦确认密码验证两次输入是否相同
           		 */
           		function blurSurePwd() {
                 
              }

              /*
               * 监听新密码是否符合规则
               */
              function checkNewPwd() {
                  $scope.isSurePwdDisabled = !Config.PASSWORD_FORMAT_REGEX.test($scope.data.newPwd);
              }
              
           		/*
           		 *发送数据到后台
           		 */
           		function sendChangePwd() {
                
                  if($scope.data.oldPwd == undefined || $scope.data.oldPwd == '') {
                       toast.show({
                            isShakeAnimate: true,
                            title: "请输入旧密码"
                        });
                      return;
                  }

                  if($scope.data.newPwd == undefined || $scope.data.newPwd == '') {
                       toast.show({
                            isShakeAnimate: true,
                            title: "请输入新密码"
                        });
                      return;
                  }

                  if(!Config.PASSWORD_FORMAT_REGEX.test($scope.data.newPwd) && $scope.data.newPwd != undefined && $scope.data.newPwd != '') {
                        toast.show({
                            isShakeAnimate: true,
                            title: "密码长度为6-16位字母和数字"
                        });
                      return;
                  }

                  if($scope.data.surePwd == undefined || $scope.data.surePwd == '') {
                       toast.show({
                            isShakeAnimate: true,
                            title: "请输入确认新密码"
                        });
                      return;
                  }

                  if($scope.data.surePwd != $scope.data.newPwd) {
                         toast.show({
                            isShakeAnimate: true,
                            title: "新密码和确认密码不一致"
                        });
                        return;
                  }
                      AccountSafeChangePassServ.changePwd($scope.data.oldPwd, $scope.data.newPwd)
                                               .then(function(resp) {
                                                        //移除token
                                                        authentication.removeToken();

                                                        toast.show({
                                                            'title': '密码修改成功！'
                                                        });

                                                        //跳入登录页面重新登录
                                                        MyRouter.gotoStateDirectly("login");

                                                        //初始化表单
                                                        $scope.data = {};
                                                                                                    
                                               }, function(resp) {
                                                    if(resp.status == '403') {
                                                        toast.show({
                                                            isShakeAnimate: true,
                                                            title: "输入旧密码有误"
                                                        });
                                                        return;
                                                    }
                                                    toast.show({
                                                          isShakeAnimate: true,
                                                          title: "密码修改失败"
                                                      });
                                                    
                                               });
                  

           		}
          

           }
}());