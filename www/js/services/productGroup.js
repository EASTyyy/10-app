(function () {
    'use strict';

    angular.module('starter.services').factory('ProductGroup', ProductGroup);

    ProductGroup.$inject = ['$http', 'Config'];

    function ProductGroup($http, Config) {
        var PRODUCT_GROUP_API_URL = Config.URL_PREFIX + 'products/group_quotes/';

        var parameters = {
            offset: 0,
            limit: Config.PRODUCT_PAGE_SIZE,
            is_detail: true
        }

        var services = {
            get: get
        };

        return services;


        function get(params, headers) {
            angular.extend(parameters, params);

            return $http.get(PRODUCT_GROUP_API_URL, { params: parameters, headers: headers }).then(formatProductGroup);
        }

        function formatProductGroup(response) {

            var rows;

            if (!response.data || !response.data.rows || !Array.isArray(response.data.rows)) {
                rows = [];
            } else {
                rows = response.data.rows.map(function (item) {
                    return {
                        id: item.pid,
                        name: item.name,
                        price: item.selling_price / 100 * item.discount_rate,
                        imageUrl: formatImageUrl(item),
                        flag: item.flag,
                        stock: _getStock(item.sku_infos)
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

        function formatImageUrl(item) {
            if (!item.pictures || !item.pictures[0] || !item.pictures[0].file_url)
                return '';

            return item.pictures[0].file_url;
        }

        function _getStock(sku) {
            if (sku && sku.length > 0) {
                return sku.map(function (s) {
                    var saleInfo = s.sale_infos;
                    if (saleInfo && saleInfo.length > 0) {
                        return saleInfo.reduce(function (a, b) {
                            return a + b.amount;
                        }, 0);
                    } else {
                        return 0;
                    }
                }).reduce(function (x, y) {
                    return x + y;
                }, 0);

            }
            return 0;
        }
    }

} ());

