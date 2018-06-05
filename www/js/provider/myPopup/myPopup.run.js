'use strict';
angular.module('10Style.provider.myPopup')

  .run(['$templateCache', function ($templateCache) {
    var myPopupTemplate = '<div class="my-popup" ng-class="{show:options.isShow}">' +
                          '<div class="my-popup-bg"></div>' +
                            '<div class="my-popup-container">' +
                                '<img ng-src="{{options.imgSrc}}">' +
                                '<p class="my-popup-message">{{options.message}}</p>' +
                                '<button type="button" class="button button-radius cancle" ng-click="cancleClick();">{{options.cancleText}}</button>' +
                                '<button type="button" class="button button-radius confirm" ng-click="confirmClick();">{{options.confirmText}}</button>' +
                            '</div>' +
                          '</div>';

    $templateCache.put('/templates/myPopup.html', myPopupTemplate);
  }]);


