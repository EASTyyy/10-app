(function () {
    'use strict';

    angular.module('10Style.provider.loading')

        .provider('Loading', function () {

            this.$get = ['$compile', '$document', '$rootScope', '$q', '$templateCache', '$timeout',
                function ($compile, $document, $rootScope, $q, $templateCache, $timeout) {

                    var self = {};

                    var options = {};

                    var $scope = $rootScope.$new(true);

                    $scope.loadingClass = 'hide';

                    $q.when(
                        $templateCache.get('/templates/loading.html')
                    ).then(function (template) {
                        if (template) {
                            template = $compile(template)($scope);
                            $document.find('body').append(template);
                        }
                    });

                    $scope.isShow = isShow;

                    function isShow(style) {
                        return options.style ? options.style === style : false;
                    }

                    self.show = function (params) {

                        angular.extend(options, { style: 'heart', fullScreen: true }, params);

                        if (options) {
                            $scope.loadingClass = 'show';
                            $scope.fullScreen = options.fullScreen ? 'fullScreenLoading' : '';
                        }
                    }

                    self.hide = function () {
                        $scope.loadingClass = "hide";
                        $scope.fullScreen = '';
                    }

                    self.state = function () {
                        return $scope.loadingClass === "show";
                    }

                    return self;
                }
            ];
        });
} ());
