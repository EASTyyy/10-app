(function () {
    'use strict';

    angular.module('starter.directives')
        .directive('spinnerOnLoad', function () {
            return {
                restrict: 'A',
                scope: {
                    size: '@',
                    watchSrc: '='
                },
                link: function (scope, element) {
                    var timer;
                    var realSrc;
                    scope.$watch('watchSrc', function () {
                        realSrc = element[0].src;
                        if (scope.size && scope.size == 'big') {
                            element.prop("src", "./img/load/img-loading-big.png");
                        } else {
                            element.prop("src", "./img/load/img-loading.png");
                        }
                    });

                    timer = setTimeout(function () {
                        if (realSrc) {
                            var img = new Image();
                            img.onload = function () {
                                element.prop("src", realSrc);
                            }
                            img.onerror = function () {
                                if (element.attr('data-error-src')) {
                                    element.prop('src', element.attr('data-error-src'));
                                } else {
                                    element.prop('src', "./img/load/img-load-err-big.png");
                                }
                            }
                            img.src = realSrc;
                            clearTimeout(timer);
                        }
                    });
                }
            }
        });

}());
