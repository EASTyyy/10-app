(function () {
	angular.module('10style.accountSafeChangePhone')
		.config(function ($stateProvider, $urlRouterProvider) {
			$stateProvider
				.state('accountChangePhone', {
					url: '/accountSafeChose/accountChangePhone/:history&:stateParams',
					templateUrl: 'js/page/accountSafe-changePhone/accountSafe-changePhone-tpl.html',
					controller: 'ChangePhoneCtrl',
					resolve: {
						initVirtualUrl: ["$stateParams", function ($stateParams) {
							$stateParams.vUrl = '/#/accountSafeChose/accountChangePhone';
						}]
					}
				});
		});
} ());