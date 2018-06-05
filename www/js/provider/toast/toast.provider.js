(function () {
    'use strict';

    angular.module('10Style.provider.toast')

        .provider('toast', function () {

            var config = {
                duration: 1500
            };

            this.$get = ['$compile', '$document', '$rootScope', '$q', '$templateCache', '$timeout',
                function ($compile, $document, $rootScope, $q, $templateCache, $timeout) {

                    var self = {};

                    var timer;
                    var defaultOptions = {
                    	isShow : false,
                    	isCompleteAnimate: false,
                        isShakeAnimate: false,
                        backdropVisible: '',
                        title: '',
                        message: '',              
                        callback: angular.noop
                    }

                    var $scope = $rootScope.$new(true);
                    $scope.options =angular.copy(defaultOptions);

                    $q.when(
                        $templateCache.get('/templates/toast.html')
                    ).then(function (template) {
                        if (template) {
                            template = $compile(template)($scope);
                            $document.find('body').append(template);
                        }
                    });

                    self.show = function (opts) {
                        if (!opts) return;
                        angular.extend($scope.options, defaultOptions, { isShow: true, backdropVisible: 'visible' }, opts);
                        if (timer) $timeout.cancel(timer);

                        if($scope.options.isShakeAnimate) {
                            config.duration = 1200;
                        };
                        timer = $timeout(function () {
                            $scope.options.isShow = false;
                            $scope.options.backdropVisible = "";

                            if (opts.callback) opts.callback();

                        }, opts.duration || config.duration);
                    }

                    return self;

                }
            ];
        });
} ());
