angular
    .module('10Style.category')
    .config(function ($stateProvider) {
        $stateProvider
            .state('category', {
                url: '/category/:history&:stateParams',
                templateUrl: 'js/page/category/category.template.html',
                controller: 'CategoryCtrl',
                cache: false,
                resolve: {
                    initVirtualUrl: ["$stateParams", function ($stateParams) {
                        $stateParams.vUrl = '/#/category';
                    }]
                }
            })
    });
