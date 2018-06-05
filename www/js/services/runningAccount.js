"use strict";

angular.module('starter.services')
    .factory(
        'runningAccount',
        [
            "$http",
            "$window",
            "$rootScope",
            "Config",
            'authentication',
            function ($http, $window, $rootScope, Config, authentication)
            {
                var obj = {};

                obj.getAccountFundsLogs = function(offset, limit, type){
                    var queryString = '?offset=' + offset + '&limit=' + limit + (type ? '&type='+type: '')
                    return $http.get(Config.URL_PREFIX + 'user/funds/logs/' + queryString);
                };

                return obj;
            }
        ]
    );
