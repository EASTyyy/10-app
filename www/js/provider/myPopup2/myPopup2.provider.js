(function () {
    'use strict';

    angular.module('10Style.provider.myPopup2')

        .provider('myPopup2', function () {

            this.$get = ['$compile', '$document', '$rootScope', '$q', '$templateCache',
                function ($compile, $document, $rootScope, $q, $templateCache) {

                    var self = {};

                    var defaultOptions = {
                        titleImgSrc: 'img/choose-pay.png',
                        leftImgSrc: 'img/alipay.png',
                        rightImgSrc: 'img/bank-pay.png',
                        leftText: '左侧文案',
                        rightText: '右侧文案',
                        leftChooseCallback: angular.noop,
                        rifgtChooseCallback: angular.noop,
                        closeCallback: angular.noop
                    }

                    var $scope = $rootScope.$new(true);

                    $scope.options = angular.copy(defaultOptions);

                    $q.when(
                        $templateCache.get('/templates/myPopup2.html')
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
                        
                        if(opts.leftChooseCallback){
                            $scope.options.leftClick = opts.leftChooseCallback;
                        }

                        if(opts.rifgtChooseCallback){
                            $scope.options.rightClick = opts.rifgtChooseCallback;
                        }

                        if(opts.closeCallback){
                            $scope.options.closeCallback = opts.closeCallback;
                        }

                    }

                    self.hide = function(){
                        $scope.options.isShow = false;
                    }

                    $scope.leftClick = function(){
                        $scope.options.leftChooseCallback();
                        $scope.options.isShow = false;
                    }

                    $scope.rightClick = function(){
                        $scope.options.rifgtChooseCallback();
                        $scope.options.isShow = false;
                    }

                    $scope.closeClick = function(){
                        $scope.options.closeCallback();
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
