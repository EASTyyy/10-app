angular
    .module('10Style.about-us')
    .config(function ($stateProvider) {
        $stateProvider
            .state('about-us', {
                url: '/my/about-us/:history&:stateParams',
                templateUrl: 'js/page/about-us/about-us.template.html',
                resolve: {
                    initVirtualUrl: ["$stateParams",  function($stateParams) {
                        $stateParams.vUrl = '/#/my/about-us';
                    }]
                }
            })
    });