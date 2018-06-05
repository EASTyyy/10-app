(function () {
    'use strict';

    angular.module('10Style.provider.wechatShare')

        .provider('wechatShare', function () {

            this.$get = ['$compile', '$document', '$rootScope', '$q', '$templateCache',
                function ($compile, $document, $rootScope, $q, $templateCache) {

                    var options = {
                        title: "10时尚",
                        desc: "来自10时尚的精选好货",
                        shareUrl: "https://m.yilinstyle.com",
                        imgUrl: "https://m.yilinstyle.com/img/10_logo.png"
                    }

                    var self = {};

                    var defaultShareParams = null;

                    var shareParams = null;

                    var $scope = $rootScope.$new(true);

                    $scope.options = angular.copy(options);

                    $q.when(
                        $templateCache.get('/templates/wechatShare.html')
                    ).then(function (template) {
                        if (template) {
                            template = $compile(template)($scope);
                            $document.find('body').append(template);
                        }
                    });

                    self.show = function (opts) {
                        if (!opts) { return };

                        angular.extend($scope.options, { isShow: true }, opts);

                        if (opts.shareUrl) {
                            defaultShareParams = {
                                message: {
                                    title: $scope.options.title,
                                    description: $scope.options.desc,
                                    thumb: $scope.options.imgUrl,
                                    // mediaTagName: "测试mediaTagName",
                                    // messageExt: "测试messageExt",
                                    messageAction: "<action></action>",
                                    media: {
                                        type: Wechat.Type.WEBPAGE,
                                        webpageUrl: $scope.options.shareUrl
                                    }
                                }
                            };
                        }

                    }

                    $scope.wechatShareAppMessage = function () {
                        shareParams = {
                            scene: Wechat.Scene.SESSION
                        };

                        angular.extend(defaultShareParams, shareParams);
                        _goShare(defaultShareParams);
                    }

                    $scope.wechatShareTimeline = function () {
                        shareParams = {
                            scene: Wechat.Scene.TIMELINE
                        };

                        angular.extend(defaultShareParams, shareParams);
                        _goShare(defaultShareParams);

                    }

                    $scope.bgClick = function () {
                        $scope.options.isShow = false;
                    }

                    function _goShare(ShareParams) {
                        Wechat.isInstalled(function (installed) {
                            Wechat.share(ShareParams, function () {
                                _alert("分享成功");
                            }, function (reason) {
                                _alert("分享失败: " + reason);
                            });

                        }, function (reason) {
                            _alert("微信唤起失败: " + reason);
                        });

                    }

                    function _alert(message, callback) {
                        $ionicPopup.alert({
                            title: '提示',
                            template: message,
                            okText: '知道了'
                        }).then(callback || angular.noop);
                    }

                    return self;

                }
            ];
        });
} ());
