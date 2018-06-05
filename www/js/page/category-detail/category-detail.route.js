angular
    .module('10Style.category-detail')
    .config(function ($stateProvider) {
        $stateProvider
            .state('category-detail', {
                url: '/category/:id/:history&:stateParams',
                templateUrl: 'js/page/category-detail/category-detail.template.html',
                controller: 'CategoryDetailCtrl',
                params: {
                    'title': null
                },
                resolve: {
                    initVirtualUrl: ["$stateParams", function ($stateParams) {
                        $stateParams.vUrl = '/#/category/' + $stateParams.id;
                    }]
                }
            });
    });
