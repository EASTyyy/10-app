(function() {
	'use strict';
	angular.module('starter.services')
		   .factory('ChangePhoneServ', ChangePhoneServ);

		   ChangePhoneServ.$inject = ['$http', 'Config'];

		   function ChangePhoneServ($http, Config) {
		   		var service = {
		   			getVerification: _getVerification,
		   			sendChanged: _sendChanged
		   		};
		   		return service;

		   	////////////////////私有方法
		   	
		   		/*
		   		 *获取验证码
		   		 */
		   		function _getVerification(mobile, authcode) {
		   				return $http({
							method: 'post',
							url: Config.URL_PREFIX + 'util/security_code',
							params: {
								mobile: mobile,
                				authcode: authcode
							}
						});
		   		}

		   		/*
		   		 *确认修改手机号码
		   		 */
		   		function _sendChanged(username, security_code) {
		   			return $http({
							method: 'put',
							url: Config.URL_PREFIX + 'user/info/username',
							params: {
								username: username,
                				security_code: security_code
							}
						});
		   		}
		   }
}());