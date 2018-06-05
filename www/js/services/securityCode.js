(function () {
    'use strict';

    angular.module("starter.services")
        .service("securityCode", securityCode);

    securityCode.$inject = ['$http', 'Config'];

    function securityCode($http, Config) {

        var width = 50;
        var height = 50;
        /*发送验证码请求*/
        this.send = function (mobile,authcode) {
            return $http.post(Config.URL_PREFIX + 'util/security_code', {
                mobile: mobile,
                authcode: authcode
            });
        };
    };

} ());

