(function () {
    'use strict';

    angular.module('starter.services')

        .factory(("ionPlatform"), ["$q", function ($q) {
            var ready = $q.defer();

            ionic.Platform.ready(function (device) {
                ready.resolve(device);
            });

            return {
                ready: ready.promise
            }
        }]);

} ());
