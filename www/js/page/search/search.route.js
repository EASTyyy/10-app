angular
    .module('10Style.search')
    .config(function ($stateProvider) {
        $stateProvider
            .state('search', {
                url: '^/search/:history&:stateParams',
                templateUrl: 'js/page/search/search.template.html',
                controller: 'SearchCtrl',
                params: {
                    keyword: ''
                },
                cache: false,
                resolve: {
                    initVirtualUrl: ["$stateParams", function ($stateParams) {
                        $stateParams.vUrl = '/#/search';
                    }]
                }
            });
    });
