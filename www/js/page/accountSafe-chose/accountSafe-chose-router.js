(function () {
	angular.module('10style.accountSafeChose')
		.config(function ($stateProvider, $urlRouterProvider) {
			$stateProvider
				.state('accountSafeChose', {
					url: '/accountSafeChose/:history&:stateParams',
					templateUrl: 'js/page/accountSafe-chose/accountSafe-chose-tpl.html',
					controller: 'accountSafeChoseCtrl',
					resolve: {
						initVirtualUrl: ["$stateParams", function ($stateParams) {
							$stateParams.vUrl = '/#/accountSafeChose';
						}]
					}
				});
		});
} ());