angular
    .module('10Style.search-result')
    .config(function ($stateProvider) {
        $stateProvider
            .state('search-result', {
                url: '^/search/:keyword/:history&:stateParams',
                templateUrl: 'js/page/search-result/search-result.template.html',
                controller: 'SearchResultCtrl',
                resolve: {
                    initVirtualUrl: ["$stateParams", function ($stateParams) {
                        $stateParams.vUrl = '/#/search/' + $stateParams.keyword;
                    }]
                }
            });
    });
