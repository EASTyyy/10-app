'use strict';
angular.module('10Style.provider.toast')

  .run(['$templateCache', function ($templateCache) {
    var toastTemplate =
        '<div class="backdrop transparent" ng-class="options.backdropVisible"></div>' +
        '<div class="toast-wrapper" ng-class="{show:options.isShow,hide:!options.isShow,animate:options.isCompleteAnimate,shakes:options.isShakeAnimate}">' +
        		'<svg ng-if="options.isCompleteAnimate" class="svg-circle" x="0px" y="0px">' +
        				'<path class="circle-path" d="M 70.846 137.703 c -36.933 0 -66.873 -29.941 -66.873 -66.875 s 29.94 -66.876 66.873 -66.876 s 66.873 29.941 66.873 66.876 s -29.94 66.875 -66.873 66.875 z" />' +
        		'</svg>' +
        		
        		'<svg ng-if="options.isCompleteAnimate" class="svg-check" x="0px" y="0px">' +
        				'<path class="check-path" d="m 112.323 50.973 c 0 0 -44.661 44.086 -45.497 44.086 c -0.836 0 -32.621 -31.267 -32.621 -31.267" />' +
        		'</svg>' +
        		
         '<span class="title" ng-bind-html="options.title"></span>' +
         '<span class="message" ng-bind-html="options.message"></span>' +
        '</div>';

    $templateCache.put('/templates/toast.html', toastTemplate);
  }]);


