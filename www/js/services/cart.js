(function () {
    'use strict';

    angular.module('starter.services')
        .factory('Cart', Cart);

    Cart.$inject = ["$rootScope", "$http", "Config", "Statistics", "$cacheFactory", "Loading"];


    function Cart($rootScope, $http, Config, Statistics, $cacheFactory, Loading) {

        var CART_API_URL = Config.URL_PREFIX + 'shopping_carts/';

        return {
            count: count,
            removeCache: removeCache,

            addProductToCart: _addProductToCart,
            removeProductBatch: _removeProductBatch,
            removeProductById: _removeProductById,
            getCartProduct: _getCartProduct,
            updateCartProduct: _updateCartProduct,
            isLeadingAttribute: _isLeadingAttribute,
            getAttribute: _getAttribute
        };

        /**
         * 添加商品到购物车
         * @param data
         * @returns {*}
         * @private
         */
        function _addProductToCart(data) {
            // 清除缓存
            removeCache();

            Statistics.addToCart(data);

            Loading.show({
                style: "circle"
            });
            return $http.post(CART_API_URL, {
                    sids: JSON.stringify(data)
                })
                .then(formatUpdateCartData)
                .finally(function () {
                    Loading.hide();
                })
        }


        /**
         * 批量从购物车移除商品
         * @param data: skuId的列表
         * @returns {*}
         * @private
         */
        function _removeProductBatch(data){
            // 清除缓存
            removeCache();
            Loading.show({
                style: "circle"
            });
            Statistics.removeItemsCart(data);

            return $http.delete(CART_API_URL + data.join(','))
                .then(function (response) {
                    broadcast();
                }).finally(function () {
                    Loading.hide();
                })
        }

        /**
         * 根据skuId删除购物车中的一个商品
         * @param id
         * @returns {*}
         * @private
         */
        function _removeProductById(id){
            // 清除缓存
            removeCache();
            Loading.show({
                style: "circle"
            });
            Statistics.removeItemCart(id);
            return $http.delete(CART_API_URL + id)
                .then(function (response) {
                    broadcast();
                }).finally(function () {
                    Loading.hide();
                })
        }

        /**
         * 获取购物车数据
         * @returns {*}
         * @private
         */
        function _getCartProduct(){
            Loading.show({style: "circle"});
            return $http.get(CART_API_URL, {cache: getCartCache()})
                .then(formatLoadCartData)
                .finally(function () {
                    Loading.hide();
                })
        }

        /**
         * 更新购物车商品
         * @param data
         * @returns {postData}
         * @private
         */
        function _updateCartProduct(data) {

            var postData = data.map(function (item) {
                return {
                    sid: item.skuId,
                    amount: item.step,
                    flag: item.isSelected ? 1 : 0
                }
            });

            return _addProductToCart(postData);
        }

        function _isLeadingAttribute(product, attrid){
            var LEADING_ATTRIBUTE_CONSTANT = 8;
            var hasLeadingAttribute = false;
            if ( product && product.attribute) {
                product.attribute.forEach(
                    function(attr){
                        if( ( (attr.id == attrid) && ((attr.flag & LEADING_ATTRIBUTE_CONSTANT) != 0) )
                            || (attrid == 1) ){// TODO 硬编码写死id为1的属性为导航属性是为了兼容旧数据，在适当的版本需要移除掉这个代码
                            hasLeadingAttribute = true;
                        }
                    });
                return hasLeadingAttribute;
            }

            return false;
        }

        function _getAttribute(product) {
            if (product &&
                product.product_info &&
                product.product_sku_info &&
                product.product_sku_info.attribute &&
                angular.isArray(product.product_sku_info.attribute)) {

                var attribute = product.product_sku_info.attribute;

                attribute.forEach(function(item){

                    item.weight = 0;

                    if(item.attr && _isLeadingAttribute(product.product_info, item.attr)){
                        item.weight += 1;
                    }
                });

                attribute.sort(function (a, b) {
                    return b.weight - a.weight;
                });

                return attribute.map(function (item) {
                    return item.name
                }).join(' ');
            }
        }

        function count() {
            return $http.get(Config.URL_PREFIX + 'shopping_carts/count');
        }


        function formatLoadCartData(response) {
            var data;

            if (!response.data || !response.data.rows || !Array.isArray(response.data.rows)) {
                data = [];
            } else {
                data = [];
                for(var ctr in response.data.rows){
                    var row_info = response.data.rows[ctr];
                    if(!row_info || !row_info.sku_infos || !Array.isArray(row_info.sku_infos)){
                        continue;
                    }
                    var sub_data = row_info.sku_infos.map(function (item) {
                        if (!item || !item.product_info || !item.product_sku_info)
                            return null;
                        var productStock = getProductStock(item.product_info);
                        return {
                            productId: item.product_info.pid,
                            state: item.product_info.state,
                            skuState: item.product_sku_info.state,
                            name: item.product_info.name,
                            skuId: item.sid,
                            price: item.product_sku_info.selling_price / 100 * item.product_sku_info.discount_rate,
                            quantity: item.amount,
                            displayQuantity: item.amount,
                            skuStock: getSkuStock(item.product_sku_info),
                            productStock: productStock,
                            attribute: _getAttribute(item),
                            isSelected: item.flag === 1,
                            isScheduled: (item.product_info.flag & 1) && productStock <= 0,
                            skuPicUrl: $rootScope.getCurrentPicUrl(item)
                        }
                    }).filter(Boolean);

                    data = data.concat(sub_data);
                }
            }

            return { data: data, status: response.status, config: response.config, headers: response.headers };
        }

        function getSkuStock(sku) {

            if (!sku || !sku.sale_infos || sku.sale_infos.length === 0)
                return 0;

            return sku.sale_infos.map(function (item) {
                return item.amount;
            }).reduce(function (a, b) {
                return a + b;
            });
        }

        function getProductStock(product) {
            if (!product || !product.sku_infos || product.sku_infos.length === 0)
                return 0;

            var result = 0;

            product.sku_infos.forEach(function (item) {
                var res = getSkuStock(item);
                if(res>0) {
                    result += res;
                }
            });

            return result;
        }
       

        function formatUpdateCartData(response) {

            broadcast();

            var data;

            if (!response.data || !response.data.rows || !Array.isArray(response.data.rows)) {
                data = [];
            } else {
                data = response.data.rows.map(function (item) {

                    return {
                        skuId: item.sid,
                        quantity: item.amount,
                        isSelected: item.flag === 1
                    }
                });
            }

            return { data: data, status: response.status, config: response.config, headers: response.headers };

        }

        /**
         * 广播事件
         */
        function broadcast(){
            // 广播一个购物车状态变化消息
            $rootScope.$broadcast("cart-state-change");
            // 广播一个购物车位置清除消息
            $rootScope.$broadcast("cart-cache-remove");
        }

        /**
         * 获取供基础数据使用的cache对象
         */
        function getCartCache() {
            var cache = $cacheFactory.get("cart-data");
            if (!cache) {
                cache = $cacheFactory("cart-data");
            }
            return cache;
        }

        /**
         * 删除缓存
         */
        function removeCache(){
            var cache = $cacheFactory.get("cart-data");
            if (cache) {
                cache.removeAll();
            }
        }

    }


} ());
