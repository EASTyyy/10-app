(function () {
    'use strict';

    angular.module('starter.services').factory('Activity', Activity);

    Activity.$inject = ['$http',"Config"];

    function Activity($http,Config) {

        var services = {
            get: get
        };

        return services;

        function get(id) {
            var url = Config.URL_PREFIX + 'template/' + id + '.json';
            return  $http({
                method: 'get',
                url: url,
                cache: false
            });
        }
    }
} ());

