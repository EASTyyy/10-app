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

                    element.on('load', function () {
                        if (timer) {
                            clearTimeout(timer);
                        }

                        element.removeClass('spinner-hide');
                        element.addClass('spinner-show');

                        var loadingNode = element.parent()[0].querySelector('.image-loading-wrapper');

                        if (loadingNode && loadingNode.parentNode) {
                            loadingNode.parentNode.removeChild(loadingNode);
                        }

                    });

                    element.on('error', function () {
                        if(element.attr('data-error-src')){
                            element.prop('src', element.attr('data-error-src'));
                        }else{
                            element.prop('src', "./img/load/img-load-err-big.png");
                        }
                    });

                    scope.$watch('watchSrc', function () {
                        timer = setTimeout(function () {

                            element.addClass('spinner-hide');
                            var size = scope.size || '';
                            var width = element[0].clientWidth;
                            var height = element[0].clientHeight;

                            element.parent().append(
                                '<div class="image-loading-wrapper" style="width:'+ width +'px; height:'+ height +'px">' +
                                    '<span class="background-image-container ' + size + ' "></span>' +
                                '</div>'
                            );

                            clearTimeout(timer);
                        }, 200);
                    });
                }
            }
        });

} ());
