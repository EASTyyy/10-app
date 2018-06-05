'use strict';
angular.module('10Style.provider.loading')

  .run(['$templateCache', function ($templateCache) {
    var loadingTemplate =
        '<div ng-class="fullScreen">'+
            '<div ng-if=\"isShow(\'pointer\')\"\' class="loading-animation-wrapper" ng-class="loadingClass">' +
                '<div class="loading-animation"><i></i><i></i></div>' +
            '</div>' +
            '<div ng-class="loadingClass" ng-if=\"isShow(\'circle\')\"\'>' +
                '<div class="loading">' +
                    '<ion-spinner icon="android" class="spinner loading-spinner">' +
                    '</ion-spinner>' +
                '</div>' +
            '</div>'+
            '<div class="loading-animation-wrapper" ng-class="loadingClass" ng-if=\"isShow(\'heart\')\"\'>' +
                    '<div class="heart-buling">' +
                    '</div>' +
            '</div>'+
        '</div>';

    $templateCache.put('/templates/loading.html', loadingTemplate);
  }]);


