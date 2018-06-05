(function () {
    'use strict';

    /**
     * 支付一个订单的接口
     * @param payment_channel 支付类型
     * @param order_id 订单ID
     * @param callback 操作完成后的回调，签名为<code>function (result, data)</code>,成功result参数>0，且data有数据，失败result参数<0
     */
    angular.module('starter.services')
        .factory('weixinPayment', weixinPayment);

    weixinPayment.$inject = ['$http', 'LocalService'];

    function weixinPayment($http, LocalService) {
        var ALIPAY_URL = "/api/site/alipay/payment/";

        var WEIXIN_PAY_URL = "/api/site/weixin/payment/";
        var WEIXIN_RECHARGE_URL = "/api/site/weixin/recharge/";

        var WEIXIN_TOKEN = 'weixin-token';

        return {
            pay: pay,
            recharge: recharge
        };


        function pay(orderId, callback) {
            var tokenValue = LocalService.getItem(WEIXIN_TOKEN);
            $http.post(ALIPAY_URL+orderId, {}, {
                headers: {
                    weixin: tokenValue
                }
            }).then(function(value){
                console.log('payment: ', value);
                ionic.Platform.ready(function (device) {
                    var ref = window.cordova.InAppBrowser.open(value.payment_url, '_blank', 'location=yes');
                     ref.addEventListener('loadstart', function(event) {
                         if(event.url.indexOf("/alipay/payment/return")>-1){
                             ref.close();
                             $scope.refresh();
                         }
                     });
                })
            })
        }


        function recharge(amount, successFunction, failFunction, finalFunction){

            var tokenValue = LocalService.getItem(WEIXIN_TOKEN);

            if(!tokenValue){
                if(failFunction) failFunction('暂不支持在浏览器使用微信充值，请关注微信公众号：10时尚，然后进入商城完成充值。');
                if(finalFunction) finalFunction();
                return;
            }

            $http.post(WEIXIN_RECHARGE_URL + amount, {}, {
                headers: {
                    weixin: tokenValue
                }
            }).then(function(response){
                var recharge_info = response.data.recharge_info;

                WeixinJSBridge.invoke(
                    'getBrandWCPayRequest',
                    recharge_info,
                    function(res){
                        if (res.err_msg == "get_brand_wcpay_request:ok") {
                            if (successFunction) successFunction('充值成功');
                        }
                        else {
                            if (failFunction) failFunction('充值失败，请稍后再试');
                        }
                    }
                )
            }, function (response) {
                if (failFunction) failFunction(response.data.error);
            }).finally(function(){
                if(finalFunction) finalFunction();
            });
        }

    }


} ());
