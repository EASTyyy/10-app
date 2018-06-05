(function () {
    'use strict';

    angular.module('starter.services')
        .factory('weixinShare', weixinShare);

    weixinShare.$inject = ["$http", "Config"];

    function weixinShare($http, Config) {

        return {
            share:share
        };

        function share(url) {
            
            var param = {
                url:url
            };

            return $http.get(
                Config.URL_PREFIX + "weixin/jsapi/signature/",param);
        }
        
    }

} ());


