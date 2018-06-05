(function(){
    "use strict";
    angular
        .module('starter.services')
        .factory('Message', Message);

    Message.$inject = ["$http", "Config"];

    function Message($http, Config){

        var MESSAGE_API_URL = Config.URL_PREFIX + 'messages/';

        var obj = {
            getMessageInfos: getMessageInfos,
        };

        return obj;

        function getMessageInfos(offset, limits){
            var limit = limits || 10;

            return $http.get(MESSAGE_API_URL + '?offset=' + offset + '&limit=' + limit + '&is_detail=true');
        }
    }
}());
