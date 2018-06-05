angular
    .module('10Style.activity')
    .config(function ($stateProvider) {
        $stateProvider
            .state('activity', {
                url: '/activity/:id/:template/:history&:stateParams',
                templateUrl: function ($stateParams) {
                    return 'js/page/activity/' + $stateParams.template + '/activity.template.html';
                },
                controllerProvider: function ($stateParams) {
                    return 'ActivityTemplate' + $stateParams.template + "Ctrl";
                },
                resolve: {
                    initVirtualUrl: ["$stateParams", function ($stateParams) {
                        $stateParams.vUrl = '/#/activity/' + $stateParams.id;
                    }]
                }
            });
    });
