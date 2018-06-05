(function() {
    'use strict';

    angular.module('10Style.directives.back-button', [])

        .directive('yourenBackButton',
        [
            "$parse",
            "$ionicViewSwitcher", "$ionicNativeTransitions",
            function ($parse, $ionicViewSwitcher, $ionicNativeTransitions) {
                return {
                    restrict: 'E',
                    replace: true,
                    template:
                    '<i class="icon iconfont icon-leftarrow" ng-if="myIf()" ng-show="myShow()" ng-click="onClickBack($event);"></i>',
                    controller: [
                        '$scope', '$rootScope', '$state', '$ionicHistory',
                        function ($scope, $rootScope, $state, $ionicHistory) {
                            /**
                             * 辅助函数用于判断是否要增加后退按钮
                             * @returns {*}
                             */
                            $scope.myIf = function () {
                                if ($scope.$backableCallback$)
                                    return $scope.$backableCallback$($scope);

                                return true;
                            }

                            /**
                             * 辅助函数用于判断是否要显示后退按钮
                             * @returns {*}
                             */
                            $scope.myShow = function () {
                                if ($scope.$visibleCallback$)
                                    return $scope.$visibleCallback$($scope);

                                return true;
                            }

                            /**
                             * 当点击后退按钮的时候的事件响应
                             * @param $event 事件对象
                             */
                            $scope.onClickBack = function ($event) {
                                if($rootScope.historyBack == '.'){
                                    $ionicViewSwitcher.nextDirection("back");
                                    if ($ionicNativeTransitions) {
                                        $ionicNativeTransitions.stateGo("tab.home", {}, {},
                                            {
                                                "type": "slide",
                                                "direction": "right",
                                                "duration": 300,
                                            }
                                        );
                                    }
                                    else {
                                        $state.go("tab.home");
                                    }
                                }else{
                                    var ionic_back = $rootScope.historyIonicBack;

                                    if (ionic_back != 0) {
                                        $ionicHistory.goBack((ionic_back > 0) ? -ionic_back : ionic_back);
                                        $rootScope.historyIonicBack = 0;
                                    }
                                    else {
                                        $ionicViewSwitcher.nextDirection("back");
                                        if ($ionicNativeTransitions) {
                                            $ionicNativeTransitions.stateGo($rootScope.historyBack, { stateParams: $rootScope.historyBackParams }, {},
                                                {
                                                    "type": "slide",
                                                    "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                                                    "duration": 300, // in milliseconds (ms), default 400
                                                }
                                            );
                                        }
                                        else {
                                            $state.go($rootScope.historyBack, { stateParams: $rootScope.historyBackParams });
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    link: function ($scope, element, attrs) {
                        var callbackIf = attrs.myIf;
                        if (callbackIf)
                            $scope.$backableCallback$ = $parse(callbackIf);
                        var callbackVisible = attrs.myShow;
                        if (callbackVisible)
                            $scope.$visibleCallback$ = $parse(callbackVisible);
                    }
                };
            }
        ]
        )
}());
