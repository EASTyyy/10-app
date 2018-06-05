'use strict';
angular.module('10Style.provider.wechatShare')

	.run(['$templateCache', function ($templateCache) {

	  var wechatShareTemplate ='<div class="wechat-share" ng-class="{show:options.isShow}">'+
	  								'<div class="wechat-share-bg" ng-click="bgClick()"></div>' +
									'<div class="wechat-share-modal">'+
										'<h3 class="share-modal-title one-px-border">分享至</h3>'+
										'<div class="share-modal-content">'+
											'<div class="weixin friend" ng-click="wechatShareAppMessage()" >'+
												'<img src="img/weixin-share.png" />'+
												'<p>微信好友</p>'+
											'</div>'+
											'<div class="weixin friend-circle" ng-click="wechatShareTimeline()" >'+
												'<img src="img/weixin-circle.png" />'+
												'<p>朋友圈</p>'+
											'</div>'+
										'</div>'+
									'</div>'+
								'</div>';

		$templateCache.put('/templates/wechatShare.html', wechatShareTemplate);
	}]);


