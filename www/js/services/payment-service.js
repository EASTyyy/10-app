/**
 * Created by lujin on 2016/7/28.
 */

(function(){
    'use strict';

    angular.module('starter.services')
        .factory('PaymentService', PaymentService);

    PaymentService.$inject = ['$http', 'Loading', 'Config'];

    function PaymentService($http, Loading, Config){
        var ALI_PAY_URL = Config.URL_PREFIX+'alipay/payment/';
        var ALI_PAY_RECHARGE_URL = Config.URL_PREFIX+'alipay/recharge/';
        var WEIXIN_PAY_URL = Config.URL_PREFIX+"weixin/payment/";
        var WEIXIN_RECHARGE_URL = Config.URL_PREFIX+"weixin/recharge/";
        var WEIXIN_QUERY_URL = Config.URL_PREFIX+"weixin/query/";

        return {
            alipay: _alipay,
            alipayRecharge: _alipayRecharge,
            wechatPay: _wechatPay,
            wechatRecharge: _wechatRecharge,
            queryWechatPayResult: _queryWechatPayResult
        };

        /**
         * 支付宝支付
         * @param orderId
         * @returns {*}
         * @private
         */
        function _alipay(orderId){
            Loading.show();
            return $http.post(ALI_PAY_URL + orderId)
                .then(function(result){
                    return result.data?result.data.payment_url: "";
                })
                .finally(function(){
                    Loading.hide();
                })
        }

        function _alipayRecharge(amount){
            return $http.post(ALI_PAY_RECHARGE_URL + amount);
        }

        function _wechatRecharge(amount){
            return $http.post(WEIXIN_RECHARGE_URL + amount);
        }

        function _wechatPay(order_id){
            return $http.post(WEIXIN_PAY_URL + order_id);
        }

        function _queryWechatPayResult(prepay_id){
            return $http.post(WEIXIN_QUERY_URL + prepay_id);
        }
    }
})();
