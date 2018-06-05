/**
 * Created by lujin on 2016/11/28.
 */

(function(){
    "use strict";
    angular.module('starter.services')
        .factory('SessionService', SessionService);

    SessionService.$inject = ['$window'];

    function SessionService($window){
        return {
            getItem: _getItem,
            setItem: _setItem,
            removeItem: _removeItem,
            clear: _clear,

            getAccountInfo: getAccountInfo,
            setAccountInfo: setAccountInfo,
            removeAccountInfo: removeAccountInfo
        };

        function _getItem(key) {
            return $window.sessionStorage.getItem(key);
        }

        function _setItem(key, value){
            $window.sessionStorage.setItem(key, value);
        }

        function _removeItem(key){
            $window.sessionStorage.removeItem(key);
        }

        function _clear(){
            $window.sessionStorage.clear();
        }

        function getAccountInfo(){
            return _getItem('account_info');
        }

        function setAccountInfo(accountInfo){
            _setItem('account_info', accountInfo);
        }

        function removeAccountInfo(){
            _removeItem('account_info');
        }

    }
})();
