angular
    .module('10Style.address')
    .config(function ($stateProvider) {
        $stateProvider.state('address', {
            url: '^/my/address/:history&:stateParams',
            templateUrl: 'js/page/address/address.template.html',
            controller: 'AddressCtrl',
            cache: false,
            resolve: {
                initVirtualUrl: ["$stateParams", function ($stateParams) {
                    $stateParams.vUrl = '/#/my/address';
                }]
            }
        })
    });
