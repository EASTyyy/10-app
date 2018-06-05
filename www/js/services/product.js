(function () {
    'use strict';

    angular.module('starter.services')
        .factory('Product', Product);

    Product.$inject = ["$http", "$cacheFactory", "$q", "Config", "CacheFactory", "Statistics", "Helper"];

    function Product($http, $cacheFactory, $q, Config, CacheFactory, Statistics, Helper) {

        var SORT_FIELD = 'on_shelf_time';

        var _default_params = {
            offset: 0,
            limit: Config.PRODUCT_PAGE_SIZE,
            is_detail: true
        };

        if (!CacheFactory.get('ProductCache')) {
            CacheFactory.createCache('ProductCache');
        }

        return {
            getProductById: getProductById,
            getProductByIdString: getProductByIdString,
            getRecommendedProducts: getRecommendedProducts,
            getProductUpdate: _getProductUpdate,
            getProductByTime: getProductByTime,
            search: search,
            popular: popular,
            removePopularCache: _removePopularCache,
            isPreProduct: isPreProduct,
            isSoldOut: isSoldOut,

            formatProductStock: _formatProductStock,
            formatItems: _formatItems,


        };


        function _getProductUpdate(productId, hash) {
            return $http.get(Config.URL_PREFIX + 'products/' + productId + '/' + hash)
                .then(function (resp) {
                    console.log('resp update: ', resp);
                    var data = resp.data;
                    if (data.result) {
                        console.log(data.message);
                        return $q.resolve({ update: false })
                    } else {
                        if (resp.data && resp.data.rows) {
                            var product = _formatProducts(resp.data.rows);
                            if (product && product.length > 0) {
                                return $q.resolve({ update: true, product: product[0] })
                            } else {
                                return $q.reject(-1);
                            }
                        }
                    }
                })
        }

        function getProductById(id) {
            return $http.get(Config.URL_PREFIX + 'products/' + id)
                .then(function (resp) {
                    console.log(resp);
                    var product = _formatProducts(resp.data.rows);
                    if (product && product.length > 0) {
                        return $q.resolve(product[0]);
                    } else {
                        return $q.reject(-1);
                    };
                }, function (resp) {
                    console.log('error resp: ', resp);
                    return $q.reject(-1);
                })
        }

        /**
         * 格式化请求商品的结果数据
         * @param products
         * @returns {*|{annotation}|Array}
         * @private
         */
        function _formatProducts(products) {
            return products.map(function (item) {
                return {
                    attribute: item.attribute,
                    productId: item.pid,
                    name: item.name,
                    pictures: item.pictures,
                    detailPictures: item.pictures_detail,
                    price: item.selling_price / 100 * item.discount_rate,
                    stock: _formatProductStock(item),
                    state: item.state,
                    flag: item.flag,
                    related_product: _formatItems(item.multi_items),
                    suit_items: _formatItems(item.suit_items),
                    skuInfo: item.sku_infos ? item.sku_infos : [],
                    hash: item.hash,
                    video: _formatVideo(item.video),
                    video_poster: _formatVideoPoster(item.video_sketch)
                };
            });
        }

        function getProductByIdString(idString) {
            return $http.get(Config.URL_PREFIX + 'products/' + idString).then(_formatProductList);
        }

        function search(params) {
            angular.extend(_default_params, params);

            Statistics.search(params.keyword);

            return $http.get(Config.URL_PREFIX + 'products/search/', {
                params: _default_params
            }).then(_formatProductList);
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

        function _formatProductList(response) {

            var rows;

            if (!response.data || !response.data.rows || !Array.isArray(response.data.rows)) {
                rows = [];
            } else {
                rows = response.data.rows.map(function (item) {
                    return {
                        id: item.pid,
                        name: item.name,
                        price: item.selling_price / 100 * item.discount_rate,
                        stock: _formatProductStock(item),
                        imageUrl: _formatImageUrl(item),
                        flag: item.flag
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

        function _formatImageUrl(item) {
            if (!item.pictures || !item.pictures[0] || !item.pictures[0].file_url)
                return '';

            return item.pictures[0].file_url;
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
                return item > 0;
            }).reduce(function (a, b) {
                return a + b;
            }, 0);
        }

        function _formatVideo(data) {
            if (!data || !angular.isArray(data) || data.length === 0)
                return undefined;

            return data[0].file_url;
        }

        function _formatVideoPoster(data) {
            if (!data || !angular.isArray(data) || data.length === 0)
                return undefined;

            return data[0].file_url;
        }

        function popular() {
            return $http.get(Config.URL_PREFIX + 'products/search/popular', { cache: _getPopularData() });
        }

        /**
         * 获取热词缓存数据cache对象
         * @returns {Object}
         */
        function _getPopularData() {
            var cache = $cacheFactory.get("popular-data");
            if (!cache) {
                cache = $cacheFactory("popular-data");
            }
            return cache;
        }

        /**
         * 删除热词缓存
         */
        function _removePopularCache() {
            var cache = $cacheFactory.get("popular-data");
            if (cache) {
                cache.removeAll();
            }
        }


        /**
         * 获取专属推荐产品列表
         * 使用CacheFactory缓存
         */
        function getRecommendedProducts(offset, limit, dataType) {

            console.log(offset, limit, dataType);

            var params = {
                offset: offset || 0,
                limit: limit || Config.PRODUCT_PAGE_SIZE,
                sort: SORT_FIELD,
                order: 'desc',
                is_detail: true
            };

            return $http.get(Config.URL_PREFIX + 'products/', {
                params: params,
                cache: (dataType && dataType == 'freshData') ? false : CacheFactory.get('ProductCache')
            }).then(_formatProductList);
        }

        function getProductByTime(params, headers) {
            return $http.get(Config.URL_PREFIX + 'products/group_by_time', {
                params: {
                    offset: params.offset || 0,
                    limit: params.limit || Config.PRODUCT_PAGE_SIZE,
                    zone: params.zone || 0,
                    group_start_time: Helper.Time.beginDayTimestamp(params.time),
                    group_end_time: Helper.Time.endDayTimestamp(params.time)
                },
                headers: headers
            }).then(_formatProductList);
        }

        /**
         * 提供预售商品判断方法
         */
        function isPreProduct(item){
            return (item.flag & 1) && item.stock <= 0;
        }

        /**
         * 提供判断售罄商品方法
         */
        function isSoldOut(item){
            return ((item.flag & 1) == 0) && item.stock <= 0;
        }
    }


} ());


