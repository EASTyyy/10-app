angular
    .module('10Style.user-info')
    .config(function ($stateProvider) {
        $stateProvider
            .state('userInfo', {
                url: '/userInfo/:history&:stateParams',
                templateUrl: 'js/page/user-info/user-info.template.html',
                controller: 'UserInfoCtrl',
                cache: false,
                resolve: {
                    initVirtualUrl: ["$stateParams", function ($stateParams) {
                        $stateParams.vUrl = '/#/userInfo';
                    }]
                }
            })
    });


//.state('userInfo', {
//  url: '/userInfo/:history&:stateParams',
//  templateUrl: 'templates/user/user-info.html',
//  controller: 'UserInfoCtrl',
//  cache: false
//})