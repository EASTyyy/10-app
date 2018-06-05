'use strict';
angular.module('10Style.provider.myPopup2')

  .run(['$templateCache', function ($templateCache) {
    var myPopupTemplate2 = '<div class="my-popup2" ng-class="{show:options.isShow}">' +
                           	'<div class="my-popup2-bg"></div>' +
                            '<div class="my-popup2-container">' +
								'<div class="my-popup2-close" ng-click="closeClick()" ><i class="iconfont icon-delete"></i></div>' +
                                '<img ng-src="{{options.titleImgSrc}}">' +
                                '<div class="my-popup2-choose">'+
									'<div class="my-popup2-left" ng-click="leftClick();">'+
										'<div class="img-wrap">' +
											'<img class="choose-img" ng-src="{{options.leftImgSrc}}">' +
										'</div>'+
										'<span class="my-popup2-text">{{options.leftText}}</span>'+
									'</div>' +
									'<div class="my-popup2-right" ng-click="rightClick();">'+
										'<div class="img-wrap">' +
											'<img class="choose-img" ng-src="{{options.rightImgSrc}}">' +
										'</div>'+
										'<span class="my-popup2-text">{{options.rightText}}</span>'+
									'</div>' +
								'</div>'+
                            '</div>' +
                          '</div>';

    $templateCache.put('/templates/myPopup2.html', myPopupTemplate2);
  }]);


