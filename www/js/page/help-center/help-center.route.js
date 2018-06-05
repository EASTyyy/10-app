angular
    .module('10Style.help-center')
    .config(function ($stateProvider) {
        $stateProvider
            .state('help-center', {
                url: 'my/help-center/:history&:stateParams',
                templateUrl: 'js/page/help-center/help-center.template.html',
                resolve: {
                    initVirtualUrl: ["$stateParams", function ($stateParams) {
                        $stateParams.vUrl = '/#/my/help-center';
                    }]
                }
            })
    });

