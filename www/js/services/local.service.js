/**
 * Created by lujin on 2016/11/28.
 */

(function(){
    "use strict";

    angular.module('starter.services')
        .factory('LocalService', LocalService);

    LocalService.$inject = ['$window'];

    function LocalService($window){
        return {
            getItem: _getItem,
            setItem: _setItem,
            removeItem: _removeItem,
            clear: _clear,

            // token
            getToken: getToken,
            setToken: setToken,
            removeToken: removeToken,

            // appStartTime
            getAppStartTime: getAppStartTime,
            setAppStartTime: setAppStartTime,
            removeAppStartTime: removeAppStartTime,
        };

        function _getItem(key){
            return $window.localStorage.getItem(key)
        }

        function _setItem(key, value){
            $window.localStorage.setItem(key, value)
        }

        function _removeItem(key){
            $window.localStorage.removeItem(key)
        }

        function _clear(){
            $window.localStorage.clear()
        }

        function getToken(){
            return _getItem('token')
        }

        function setToken(token){
            _setItem('token', token)
        }

        function removeToken(){
            _removeItem('token')
        }

        function getAppStartTime(){
            return _getItem('appStartTime')
        }

        function setAppStartTime(appStartTime){
            _setItem('appStartTime', appStartTime)
        }

        function removeAppStartTime(){
            return _removeItem('appStartTime')
        }
    }

})();
