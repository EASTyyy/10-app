(function(){
    "use strict";
    angular
        .module('starter.services')
        .factory('UserAuthentication', UserAuthentication);

    UserAuthentication.$inject = ["$http", "Config"];

    function UserAuthentication($http, Config){

        var obj = {
            addUserAuthenticationData: addUserAuthenticationData,
            setUserAuthenticationData: setUserAuthenticationData
        };

        return obj;

        function addUserAuthenticationData(data){
            return $http.post(Config.URL_PREFIX+'user/extend',{
                shop_name: data.shop_name,
                country: '中国',
                province: data.area.split('-')[0],
                city: data.area.split('-')[1],
                district: data.area.split('-')[2],
                town: ' ',
                addr: data.addr,
                license_image: data.license_image,
                shop_image: data.shop_image,
                stock_image: data.stock_image,
            })
        };

        function setUserAuthenticationData(data){
            return $http.put(Config.URL_PREFIX+'user/extend',{
                shop_name: data.shop_name,
                country: '中国',
                province: data.area.split('-')[0],
                city: data.area.split('-')[1],
                district: data.area.split('-')[2],
                town: ' ',
                addr: data.addr,
                license_image: data.license_image,
                shop_image: data.shop_image,
                stock_image: data.stock_image,
            })
        };
    }

}());
