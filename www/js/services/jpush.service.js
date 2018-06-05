/**
 * Created by lujin on 2016/8/2.
 */

(function () {
    "use strict";

    angular.module('starter.services')
        .factory('JPushService', JPushService);
    JPushService.$inject = ["$ionicPopup", "$rootScope", "RECEIVE_MESSAGE", "ChcpService"];
    function JPushService($ionicPopup, $rootScope, RECEIVE_MESSAGE, ChcpService) {

        return {
            init: _init,
            checkNotificationSetting: _checkNotificationSetting,
            checkPushStopped: _checkPushStopped,
            receiveNotification: _receiveNotification,
            backgroundNotification: _backgroundNotification,
            openNotification: _openNotification,
            receiveMessage: _receiveMessage,
            setAliasListener: _setAliasListener,

            setAlias: _setAlias,

            setApplicationIconBadgeNumber: _setApplicationIconBadgeNumber,
            resetBadge: _resetBadge,
            initBadge: _initBadge
        };

        function _init(){
            window.plugins.jPushPlugin.init();
        }

        function _checkNotificationSetting(callback) {
            window.plugins.jPushPlugin.getUserNotificationSettings(function (result) {
                console.log('result->: ', result);
                /*if(result == 0) {
                    // 系统设置中已关闭应用推送。
                    $ionicPopup.alert({
                        title: '提示',
                        template: '系统设置中已关闭应用推送',
                        okText: '知道了'
                    });
                } else if(result > 0) {
                    // 系统设置中打开了应用推送。
                    callback();
                }*/
            })
        }

        function _checkPushStopped(callback) {
            window.plugins.jPushPlugin.isPushStopped(function (result) {
                if (result != 0) {
                    if (callback && isFunction(callback)) {
                        callback();
                    } else {
                        // 如果推送服务关闭，直接重启服务
                        window.plugins.jPushPlugin.resumePush()
                    }
                }
            })
        }

        /**
         * 接收到前台的通知
         * @private
         */
        function _receiveNotification() {
            document.addEventListener("jpush.receiveNotification", _onReceiveNotification, false);
        }

        /**
         * 接收到前台通知的回调
         * @private
         */
        function _onReceiveNotification(){
            _onDealNotification();
        }

        /**
         * 接收到后台通知
         * @private
         */
        function _backgroundNotification(){
            document.addEventListener("jpush.backgroundNotification", _onBackgroundNotification, false);
        }

        /**
         * 接收到通知的处理函数
         * @private
         */
        function _onBackgroundNotification(){
            _onDealNotification();
        }

        /**
         * 处理通知的函数，不管前台还是后台
         * @private
         */
        function _onDealNotification(){
            var receiveNotification = window.plugins.jPushPlugin.receiveNotification;
            var device = ionic.Platform.device();
            var update = "";
            if (device.platform == 'Android') {
                update = receiveNotification.extras ? receiveNotification.extras.update : "";
            } else {
                update = receiveNotification.url ? receiveNotification.update : "";
            }
            if (update ) {
                console.log('update...');
                // 检查更新
                ChcpService.checkHotUpdate();
            }
        }

        /**
         * 打开通知事件
         * @private
         */
        function _openNotification() {
            var onOpenNotification = function (event) {
                // 打开通知后重新计算角标的数量
                _getApplicationIconBadgeNumber(function(data){
                    _setApplicationIconBadgeNumber(data-1);
                    _setBadge(data-1);
                });
                $rootScope.isNotificationClick = true;
                var params = window.location.href.split('#');
                var openNotification = window.plugins.jPushPlugin.openNotification;
                var destUrl = "";
                var update = "";
                var device = ionic.Platform.device();
                if (device.platform == 'Android') {
                    destUrl = openNotification.extras ? openNotification.extras.url : "/home";
                    update = openNotification.extras ? openNotification.extras.update : "";
                } else {
                    destUrl = event.url?event.url: "/home";
                    update = event.update?event.update: "";
                }

                if (update){
                    console.log(' notify update...');
                    // 检查更新
                    ChcpService.checkHotUpdate();
                }
                else if (destUrl) {
                    var url = params[0] + '#' + destUrl;
                    $rootScope.historyBack = ".";
                    window.location.href = url;
                }
            };
            document.addEventListener("jpush.openNotification", onOpenNotification, false);
        }

        function _receiveMessage(){
            // todo 接收到的自定义消息具体要怎么处理？
            var onReceiveMessage = function (event) {
                var device = ionic.Platform.device();
                try {
                    var message;
                    if (device.platform == "Android") {
                        message = event.message;
                    } else {
                        message = event.content;
                    }

                    if(event.extras){
                        var msg = event.extras[RECEIVE_MESSAGE.KEY.NewMessage];
                        var type = typeof(msg);
                        $rootScope.messageAlert = !!((type === 'boolean' && msg === RECEIVE_MESSAGE.VALUE.NewMessage) ||
                        (type === 'string' && msg === 'true'));
                        //else if(event.extras[RECEIVE_MESSAGE.KEY.AuthenticationStateChanged] === RECEIVE_MESSAGE.VALUE.AuthenticationStateChanged){
                        //    authentication.queryAccountInfo();
                        //}
                    }
                    console.log("receive message: ", message);
                } catch (exception) {
                    console.log("JPushPlugin:onReceiveMessage-->" + exception);
                }
            };
            document.addEventListener("jpush.receiveMessage", onReceiveMessage, false);
        }

        /**
         * 设置别名监听事件
         * @param callback
         * @private
         */
        function _setAliasListener(callback){
            var onSetAlias;
            if(callback && isFunction(callback)){
                onSetAlias = callback;
            }else {
                onSetAlias = function (event) {
                    console.log('set tag event: ', event);
                }
            }
            document.addEventListener("jpush.setAlias", onSetAlias, false);
        }

        function _setAlias(alias){
            ionic.Platform.ready(function () {
                window.plugins.jPushPlugin.setAlias(alias);
            })
        }

        /**
         * 设置角标
         * @param value
         * @private
         */
        function _setApplicationIconBadgeNumber(value) {
            if(window.plugins.jPushPlugin.isPlatformIOS()) {
                window.plugins.jPushPlugin.setApplicationIconBadgeNumber(value);
            }
        }

        /**
         * 获取角标
         * @param callback
         * @private
         */
        function _getApplicationIconBadgeNumber(callback){
            if(window.plugins.jPushPlugin.isPlatformIOS()) {
                if(window.plugins && window.plugins.jPushPlugin) {
                    window.plugins.jPushPlugin.getApplicationIconBadgeNumber(callback);
                }else{
                    console.log('ionic not already...');
                }
            }
        }

        function _setBadge(value){
            if(window.plugins.jPushPlugin.isPlatformIOS()) {
                window.plugins.jPushPlugin.setBadge(value);
            }
        }

        function _resetBadge(){
            if(window.plugins.jPushPlugin.isPlatformIOS()) {
                window.plugins.jPushPlugin.resetBadge();
            }
        }

        function _initBadge(){
            _setApplicationIconBadgeNumber(0);
            _setBadge(0);
        }

    }
})();
