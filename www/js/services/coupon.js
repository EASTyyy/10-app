(function(){
    'use strict';

    angular.module('starter.services')
        .factory('Coupon', Coupon);

    Coupon.$inject = ["$http", 'Config', 'COUPON_CONSTANT'];

    function Coupon( $http, Config, COUPON_CONSTANT ){
        var COUPON_INFO_URL = Config.URL_PREFIX + 'coupons';
        var COUPON_COUNT_URL = Config.URL_PREFIX + 'coupons/count';
        var ORDER_PREVIEW_URL = Config.URL_PREFIX + 'orders/preview';

        var service = {
            get: get,
            list: list,
            orderPreview: orderPreview
        };

        function get(){
            return $http.get(COUPON_COUNT_URL);
        }

        function list(offset, state, type, limit){
            limit = limit || ( state === COUPON_CONSTANT.STATUS.UNUSED ? Config.COUPON_UNUSED_LIMIT :
                    state === COUPON_CONSTANT.STATUS.USED ? Config.COUPON_USED_LIMIT :
                        Config.COUPON_EXPIRED_LIMIT );
            var create_during_time = (state === COUPON_CONSTANT.STATUS.EXPIRED) ? Config.COUPON_UNUSED_SAVE_TIME : null;
            var update_during_time = (state === COUPON_CONSTANT.STATUS.USED) ? Config.COUPON_USED_SAVE_TIME : null;
            var params = {
                offset: offset,
                limit: limit,
                type: type,
                state: state,
                create_during_time: create_during_time,
                update_during_time: update_during_time
            };
            return $http.get(COUPON_INFO_URL, {
                params: params
            }).then(formatCouponList);
        }

        function orderPreview(params){
            var data = {sids: JSON.stringify(params)};
            return $http.post(ORDER_PREVIEW_URL, data).then(formatOrderData);
        }

        function formatCouponList(response){
            var rows = [];
            if( !response.data || !response.data.rows || !Array.isArray(response.data.rows) || response.data.rows.length === 0 ){
                rows = [];
            } else {
                rows = response.data.rows.map(function(item){
                    return {
                        state: item.state,
                        start_time: item.coupon_info ? item.coupon_info.useable_start_time : item.useable_start_time,
                        end_time: item.coupon_info ? item.coupon_info.useable_end_time : item.useable_end_time,
                        receive_time: item.create_time,
                        update_time: item.update_time,
                        name: item.coupon_info.name,
                        discount: filterDiscount(item),
                        discount_rate: filterDiscountRate(item),
                        order_amount: item.coupon_info ? item.coupon_info.order_amount/100 : 0,
                        type: COUPON_CONSTANT.TYPE_DISPLAY[item.coupon_info.type]
                    }
                });
            }

            return {
                data: {rows: rows, total: response.data.total || 0},
                status: response.status,
                config: response.config,
                headers: response.headers
            }
        }

        function formatOrderData(response){
            var rows = [];
            if( !response.data || !response.data.coupon_infos || !Array.isArray(response.data.coupon_infos) || response.data.coupon_infos.length === 0 ){
                rows = [];
            } else {
                rows = response.data.coupon_infos.map(function(item){
                    return {
                        name: item.coupon_info.name,
                        amount: filterDiscount(item),
                        id: item.id,
                        order_amount: item.coupon_info ? item.coupon_info.order_amount : 0,
                        discount_rate: filterDiscountRate(item)
                    }
                });
            }

            return {
                data: {rows: rows, total: response.data.total || 0},
                status: response.status,
                config: response.config,
                headers: response.headers
            }
        }

        function filterDiscount(item){
            if(!item.coupon_info) return item.discount_amount/100;

            return item.coupon_info.flag === COUPON_CONSTANT.FLAG.RANDOM || (item.coupon_info.flag & COUPON_CONSTANT.FLAG.RANDOM) !==0 ?
            item.discount_amount/100 : item.coupon_info.discount_amount/100;
        }

        function filterDiscountRate(item){
            if(!item.coupon_info) return item.discount_rate;

            return item.coupon_info.flag === COUPON_CONSTANT.FLAG.RANDOM || (item.coupon_info.flag & COUPON_CONSTANT.FLAG.RANDOM) !==0 ?
                item.discount_rate : item.coupon_info.discount_rate;
        }

        return service;
    }
}());
