angular
    .module('10Style.return-goods-application')
    .config(function ($stateProvider) {
        $stateProvider
            .state('return-goods-application', {
                url: '/returnGoodsApplication/:orderId/:afterSaleId/:history&:stateParams',
                templateUrl: 'js/page/return-goods-application/return-goods-application.template.html',
                controller: 'ReturnGoodsAppCtrl',
                cache: false,
                resolve: {
                    initVirtualUrl: ["$stateParams", function ($stateParams) {
                        $stateParams.vUrl = '/#/after-service/' + $stateParams.orderId + '/' + $stateParams.afterSaleId;
                    }]
                }
            })
    });


//.state('return-goods-application', {
//              url: '/returnGoodsApplication/:orderId/:afterSaleId/:history&:stateParams',
//              templateUrl: 'templates/my/refund-goods-application.html',
//              controller: 'RefundGoodsAppCtrl',
//              cache:false
//          })