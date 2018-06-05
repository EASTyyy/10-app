(function () {
    'use strict';
    angular.module('starter.services').factory(
        'Favorite', Favorite);

    Favorite.$inject = ["$http", "Config", "Statistics", "$q", "Loading"];

    function Favorite($http, Config, Statistics, $q, Loading) {

        var FAVORITE_API_URL = Config.URL_PREFIX + 'favorites/';

        return {
            create: create,
            get: get,
            getFavoriteState: _getFavoriteState,
            createFavorite: _createFavorite,
            deleteFavorite: _deleteFavorite,
            list: list,
            delete: remove
        };

        function get(id) {
            return $http({
                method: 'GET',
                url: FAVORITE_API_URL + id
            });
        }

        /**
         * 获取商品的收藏状态
         * @param id: 收藏记录ID
         * @returns {*}
         * @private
         */
        function _getFavoriteState(id){
            return $http.get(FAVORITE_API_URL + id)
                .then(function(){
                    return $q.resolve(1);
                }, function(){
                    return $q.reject(-1);
                })

        }

        /**
         * 添加收藏
         * @param id: 收藏记录ID
         * @returns {*}
         * @private
         */
        function _createFavorite(id){
            if(!angular.isArray(id)){
                id = [id];
            }
            Statistics.collect(id, 1);

            Loading.show({
                style: "circle"
            });
            return $http.post(FAVORITE_API_URL, {pids: id.join(',')})
                .then(function(){
                    return $q.resolve(1);
                }, function(){
                    return $q.reject(-1);
                }).finally(function(){
                    Loading.hide();
                })
        }

        /**
         * 删除收藏
         * @param id: 收藏记录ID
         * @returns {*}
         * @private
         */
        function _deleteFavorite(id){
            Statistics.collect(id, 0);

            Loading.show({
                style: "circle"
            });
            return $http.delete(FAVORITE_API_URL + id)
                .then(function(){
                    return $q.resolve(1);
                }, function(){
                    return $q.reject(-1);
                }).finally(function(){
                    Loading.hide();
                })
        }

        function list() {
            return $http({
                method: 'GET',
                url: FAVORITE_API_URL
            })
        }

        function create(productId) {

            Statistics.collect(productId, 1);

            return $http.post(FAVORITE_API_URL, {
                pids: productId
            });
        }

        function remove(productId) {
            Statistics.collect(productId, 0);

            return $http.delete(FAVORITE_API_URL + productId);
        }
    }

} ());
