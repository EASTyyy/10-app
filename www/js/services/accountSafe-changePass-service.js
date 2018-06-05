(function() {
	'use strict';
	angular.module('starter.services')
	  	   .factory('AccountSafeChangePassServ', AccountSafeChangePassServ);

	  	   AccountSafeChangePassServ.$inject = ['$http', 'Config'];

	  	   function AccountSafeChangePassServ ($http, Config) {
	  	   		var service = {
	  	   			changePwd: _changePwd
	  	   		};
	  	   		return service;

	  	 ///////////////////////////////////////////////////私有方法
	  	   		
	  	   		/*
				 * 把修改后的数据发送给后台
				 * @params oldPwd 旧密码
				 * @params newPwd 新密码
				 * @returns 请求的返回结果
				 */
	  	   		function _changePwd(oldPwd, newPwd) {
	  	   			return $http({
							method: 'put',
							url: Config.URL_PREFIX + 'user/info/password',
							params: {
								old_password: oldPwd,
								new_password: newPwd
							}
						});
	  	   		}
	  	   }

}());