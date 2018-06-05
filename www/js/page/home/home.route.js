angular
    .module('10Style.home')
    .config(function ($stateProvider) {
        $stateProvider
            .state('tab.home', {
                url: '^/home',              //注意：修改匹配路径之后要修改loading.html文件。
                views: {
                    'tab-home': {
                        templateUrl: 'js/page/home/home.template.html',
                        controller: 'HomeCtrl',
                    }
                },
                params: {
                    id: 1
                },
                nativeTransitions: {
                    type: "fade"
                },
                resolve: {
                    initVirtualUrl: ["$stateParams", function ($stateParams) {
                        $stateParams.vUrl = '/#/home';
                    }]
                }
            })
    });


