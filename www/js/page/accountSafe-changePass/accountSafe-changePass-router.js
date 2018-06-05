(function () {
	angular.module('10style.accountSafeChangePass')
		.config(function ($stateProvider, $urlRouterProvider) {
			$stateProvider
				.state('accountChangePass', {
					url: '/accountSafeChose/accountChangePass/:history&:stateParams',
					templateUrl: 'js/page/accountSafe-changePass/accountSafe-changePass-tpl.html',
					controller: 'ChangePassCtrl',
					resolve: {
						initVirtualUrl: ["$stateParams", function ($stateParams) {
							$stateParams.vUrl = '/#/accountSafeChose/accountChangePass';
						}]
					}
				});
		});
} ());