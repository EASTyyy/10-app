/**
 * Created by lujin on 2016/7/5.
 */

angular
    .module('10Style.product')
    .config(function ($stateProvider) {
        $stateProvider
            .state('product', {
                url: '/product/:id&:previewMode&:history&:stateParams',
                templateUrl: 'js/page/product/product.template.html',
                controller: 'ProductCtrl',
                cache: true,
                resolve: {
                    initVirtualUrl: ["$stateParams", function ($stateParams) {
                        $stateParams.vUrl = '/#/product/' + $stateParams.id;
                    }]
                }
            })
            .state('product-alias', {
                url: '/product-alias/:id&:previewMode&:history&:stateParams',
                templateUrl: 'js/page/product/product.template.html',
                controller: 'ProductCtrl',
                cache: true,
                resolve: {
                    initVirtualUrl: ["$stateParams", function ($stateParams) {
                        $stateParams.vUrl = '/#/product/' + $stateParams.id;
                    }]
                }
            })
    });
