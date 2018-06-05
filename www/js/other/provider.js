(function () {
    'use strict';

    angular.module('starter.providers')
        .factory('authenticationProvider',
            ["$q", "$window", "ACCOUNT_TOKEN_CODE", "$rootScope", function ($q, $window, ACCOUNT_TOKEN_CODE, $rootScope) {
        return {
            //request: function(config) {
            //  config.headers = config.headers || {};
            //  if ($window.localStorage.token) {
            //    config.headers.Token = $window.localStorage.token;
            //  }
            //  return config;
            //},

            response: function (response) {
                return response || $q.when(response);
            },

            responseError: function (response) {
                if (response.status == 401 && !$rootScope.hasNotifyUserLogin) {
                    var data = response.data ? response.data : null;
                    var code = (data && data.code) ? data.code : -1;
                    $rootScope.$broadcast("ACCOUNT_TOKEN_CODE", code);
                }

                return $q.reject(response);
            }
        };
    }]);

}());

