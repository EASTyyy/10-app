(function () {
    'use strict';

    angular.module('10Style.provider.myPopup')

        .provider('myPopup', function () {

            this.$get = ['$compile', '$document', '$rootScope', '$q', '$templateCache',
                function ($compile, $document, $rootScope, $q, $templateCache) {

                    var self = {};

                    var defaultOptions = {
                        imgSrc: 'img/10_logo.png',
                        message: '10时尚',
                        cancleText: '取消按钮',
                        confirmText: '确定按钮',
                        cancleCallback: angular.noop,
                        confirmCallback: angular.noop
                    }

                    var $scope = $rootScope.$new(true);

                    $scope.options = angular.copy(defaultOptions);

                    $q.when(
                        $templateCache.get('/templates/myPopup.html')
                    ).then(function (template) {
                        if (template) {
                            template = $compile(template)($scope);
                            $document.find('body').append(template);
                        }
                    });

                    self.show = function (opts) {
                        if (!opts) {return};
                        _safeApply.call($scope,function () {
                            angular.extend($scope.options, defaultOptions, { isShow: true }, opts);
                        })
                        
                        if(opts.cancleCallback){
                            $scope.options.cancleCallback = opts.cancleCallback;
                        }

                        if(opts.confirmCallback){
                            $scope.options.confirmCallback = opts.confirmCallback;
                        }

                    }

                    self.hide = function(){
                        $scope.options.isShow = false;
                    }

                    $scope.cancleClick = function(){
                        $scope.options.cancleCallback();
                        $scope.options.isShow = false;
                    }

                    $scope.confirmClick = function(){
                        $scope.options.confirmCallback();
                        $scope.options.isShow = false;
                    }

                    function _safeApply(fn) {
                        var phase = this.$root.$$phase;
                        if (phase == '$apply' || phase == '$digest'){
                            this.$eval(fn);
                        }
                        else{
                            this.$apply(fn);
                        }
                            
                    }
                    
                    return self;

                }
            ];
        });
} ());
