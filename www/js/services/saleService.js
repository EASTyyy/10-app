(function () {
    'use strict';

    angular.module("starter.services")
        .service("SaleService", SaleService);

    SaleService.$inject = ['$http', 'Config'];

    function SaleService($http, Config) {
        /*发送申请售后请求*/
        this.send = function (service_type, order_id, seller_id, contact, comment) {
            return $http.post(Config.URL_PREFIX + 'customer_services', {
                type: service_type,
                order_id: order_id,
                seller_id: seller_id,
                contact: contact,
                user_comment: comment
            });
        };
        /*获取商品售后信息*/
        this.get = function (id) {
            return $http.get(Config.URL_PREFIX + 'customer_services/' + id);
        }
    };

} ());

