angular
    .module('10Style.login')
    .config(function ($stateProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'js/page/login/login.template.html',
                controller: 'LoginController',
                cache: false,
                resolve: {
                    initVirtualUrl: ["$stateParams", function ($stateParams) {
                        $stateParams.vUrl = '/#/login';
                    }]
                }
            })
    });
