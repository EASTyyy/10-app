angular
    .module('10Style.password')
    .config(function ($stateProvider) {
        $stateProvider
            .state('password', {
                url: '/password/:history&:stateParams',
                templateUrl: 'js/page/reset-password/reset-password.template.html',
                controller: 'PasswordCtrl',
                resolve: {
                    initVirtualUrl: ["$stateParams", function ($stateParams) {
                        $stateParams.vUrl = '/#/password';
                    }]
                }
            })
    });
