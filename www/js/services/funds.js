"use strict";

angular.module('starter.services')
    .factory(
        'Funds',
        [
            "$http",
            "$window",
            "$rootScope",
            "Config",
            function ($http, $window, $rootScope, Config)
            {
                var obj = {
                    getAccountFundsLogs: getAccountFundsLogs,
                    getFunds: getFunds
                };

                return obj;

                function getAccountFundsLogs(offset, limit, type){
                    var queryString = '?offset=' + offset + '&limit=' + limit + (type ? '&type='+type: '')
                    return $http.get(Config.URL_PREFIX + 'user/funds/logs/' + queryString);
                };

                function getFunds(){
                    return $http.get(Config.URL_PREFIX + 'user/funds/');
                }
            }
        ]
    );
