(function () {
    'use strict';
    angular.module('starter.services')
           .factory('matchProServe', matchProServe);

    matchProServe.$inject = ['$http', 'Config', 'Helper'];

    function matchProServe($http, Config, Helper) {

        var MATCH_LIST_API_URL = Config.URL_PREFIX + 'products/group_types/list';
        var MATCH_GROUP_DETAIL_API_URL = Config.URL_PREFIX + 'products/group_types/';

        var MATCH_PRODUCT_DETAIL_API_URL = Config.URL_PREFIX + 'products/group_quotes/';
        
        var services = {
            loadGroupList: loadGroupList,
            loadGroup: loadGroup,
            getMatchById: getMatchById
        };
        return services;

        function loadGroupList() {
            var params = {
                type: 2
            }

            return $http.get(MATCH_LIST_API_URL, { params: params })
        }

        function loadGroup(tag) {
            var params = {
                type: 2,
                group_tag: tag
            };

            var headers = {
                payload: tag
            }
            return $http.get(MATCH_GROUP_DETAIL_API_URL, { params: params, headers: headers }).then(_formatMatchProList);
        }

        /*
         *获取搭配购商品列表
         */
        function getMatchById(id) {
            var params = {
                limit: 100,
                offset: 0,
                is_detail: 1,
                tid: id
            }

            return $http.get(MATCH_PRODUCT_DETAIL_API_URL, { params: params })
        }

        /*
        *格式化数组的函数
        */
        function _formatMatchProList(response) {
            var rows;

            if (!response.data || !response.data.rows || !Array.isArray(response.data.rows)) {
                rows = [];
            } else {
                rows = response.data.rows.map(function (item) {
                    return {
                        id: item.id,
                        title: item.name,
                        comment: item.comment,
                        imageUrl: item.pictures.length ? item.pictures : '',
                        date: (function (time) {
                            if (!time) return '';

                            var date = new Date(time * 1000);

                            return (date.getMonth() + 1) + '月' + date.getDate() + '日'
                        })(item.group_time)
                    }
                });
            }

            return {
                data: { rows: rows, total: response.data.total || 0 },
                status: response.status,
                config: response.config,
                headers: response.headers
            };
        }

    }
}());
