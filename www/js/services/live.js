(function () {
    'use strict';

    angular.module('starter.services')
        .factory('Live', live);

    live.$inject = ["$http", "Config", "Helper"];

    function live($http, Config, Helper) {

        var LIVE_GROUP_LIST_API_URL = Config.URL_PREFIX + 'products/group_types/list';

        var LIVE_GROUP_DETAIL_API_URL = Config.URL_PREFIX + 'products/group_types/';

        var LIVE_DETAIL_URL = Config.URL_PREFIX + 'products/group_quotes/';

        var services = {
            loadGroupList: loadGroupList,
            loadGroup: loadGroup,
            getLiveById: getLiveById
        };

        return services;

        function loadGroupList() {
            var params = {
                type: 1
            }

            return $http.get(LIVE_GROUP_LIST_API_URL, { params: params })
        }

        function loadGroupListSuccess(response) {
            if (!response || !response.data || !response.data.rows || angular.isArray(response.data.rows))
                return;
            
            return response.data.rows;
        }

        function loadGroupListFail() {

        }

        function loadGroup(tag) {
            var params = {
                type: 1,
                group_tag: tag
            };

            var headers = {
                payload: tag
            }
            return $http.get(LIVE_GROUP_DETAIL_API_URL, { params: params, headers: headers }).then(_formatGroup);
        }

        function _formatGroup(response) {
            var rows;

            if (!response.data || !response.data.rows || !Array.isArray(response.data.rows)) {
                rows = [];
            } else {
                rows = response.data.rows.map(function (item) {
                    return {
                        id: item.id,
                        title: item.name,
                        comment: item.comment,
                        imageUrl: item.video_info ? item.video_info.sketch_path : '',
                        videoSource: item.video_info ? item.video_info.video_path : '',
                        visits: item.video_info ? item.video_info.visits : '',
                        videoTime: item.video_info ? Helper.Time.format(item.video_info.duration) : '',
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

        function getLiveById(id) {
            return $http.get(LIVE_DETAIL_URL, { params: { type: 1, tid: id, is_detail: true } }).then(_formatProducts);
        }

        function _formatProducts(response) {
            var rows;

            if (!response.data || !response.data.rows || !Array.isArray(response.data.rows)) {
                rows = [];
            } else {
                rows = response.data.rows.map(function (item) {
                    return {
                        attribute: item.attribute,
                        productId: item.pid,
                        name: item.name,
                        pictures: item.pictures,
                        imageUrl: _formatImageUrl(item),
                        detailPictures: item.pictures_detail,
                        price: item.selling_price / 100 * item.discount_rate,
                        stock: _formatProductStock(item),
                        state: item.state,
                        flag: item.flag,
                        related_product: _formatItems(item.multi_items),
                        suit_items: _formatItems(item.suit_items),
                        skuInfo: item.sku_infos ? item.sku_infos : [],
                        hash: item.hash
                    };
                });
            }

            return {
                data: { rows: rows, total: response.data.total || 0 },
                status: response.status,
                config: response.config,
                headers: response.headers
            };
        }

        function _formatImageUrl(item) {
            if (!item.pictures || !item.pictures[0] || !item.pictures[0].file_url)
                return '';

            return item.pictures[0].file_url;
        }

        function _formatItems(items) {
            if (!items || !angular.isArray(items) || items.length === 0)
                return [];

            return items.map(function (product) {
                return {
                    productId: product.pid,
                    name: product.name,
                    pictures: product.pictures,
                    price: product.selling_price / 100 * product.discount_rate
                }
            });
        }

        function _formatProductStock(item) {

            if (!item || !item.sku_infos || !angular.isArray(item.sku_infos) || item.sku_infos.length === 0)
                return 0;

            var skuStock = item.sku_infos.map(function (sku) {
                if (!sku || !sku.sale_infos)
                    return 0;

                var data = sku.sale_infos.map(function (sale) {
                    return sale.amount;
                });

                return _sum(data);
            });

            return _sum(skuStock);
        }

        function _sum(data) {
            if (!data || !angular.isArray(data) || data.length === 0)
                return 0;

            return data.filter(function (item) {
                return item > 0
            }).reduce(function (a, b) {
                return a + b;
            }, 0);
        }
    }
} ());
