angular
    .module('10Style.register')
    .config(function ($stateProvider) {
        $stateProvider
            .state('register', {
                url: '/register/:history&:stateParams',
                templateUrl: 'js/page/register/register.template.html',
                controller: 'RegisterCtrl',
                resolve: {
                    initVirtualUrl: ["$stateParams", function ($stateParams) {
                        $stateParams.vUrl = '/#/register';
                    }]
                }
            })
    });
