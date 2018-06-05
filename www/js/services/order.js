(function () {
  'use strict';

  angular.module('starter.services')
    .factory('Order', Order);

  Order.$inject = ["$http", '$rootScope', 'OrderStatus', 'Config', 'Statistics', 'Cart'];

  function Order($http, $rootScope, OrderStatus, Config, Statistics, Cart) {

    var ORDER_API_URL = Config.URL_PREFIX + 'orders/';

    var service = {
      get: get,
      create: create,
      remove: remove,
      confirm: confirm,
      getOrderCount: getOrderCount,
      list: list,
      getOrderStatus: getOrderStatus
    };

    return service;


    function get(id) {
      return $http.get(ORDER_API_URL + id);
    }

    function create(data, statisticData) {

      var promise = $http.post(ORDER_API_URL, data);

      promise.then(function (resp) {
        if (statisticData && angular.isArray(statisticData) && resp && resp.data && resp.data.order_info && resp.data.order_info.id) {
          Statistics.createOrder(statisticData, resp.data.order_info.id);
        }
      });

      return promise;
    }

    function remove(id) {
      return $http.put(ORDER_API_URL + id, {
        state: OrderStatus.canceledStateCode
      });
    }

    function confirm(id) {
      return $http.put(ORDER_API_URL + id, {
        state: OrderStatus.completedStateCode
      });
    }

    function getOrderCount(key) {
      return list(key, 0, 0);
    }

    function list(key, offset, limit) {
      limit = limit || 10;

      var params = {
        state: OrderStatus.group[key].stateCodes,
        offset: offset,
        limit: limit,
        is_detail: true
      };

      return $http.get(ORDER_API_URL, {
        params: params
      }).then(formatOrderList);
    }

    function formatOrderList(response) {
      console.log('order-list', response);

      var rows;

      if (!response.data || !response.data.rows || !Array.isArray(response.data.rows)) {
        rows = [];
      } else {
        rows = response.data.rows.map(function (item) {
          return {
            id: item.id,
            orderNum: item.order_num,
            price: item.actual_price ? item.actual_price / 100 : 0,
            stateCode: item.state,
            products: formatProducts(item.product_infos),
            serviceId: item.customer_service_id,
            type: item.type,
            flag: item.flag,
            paymentExpiresTime: item.payment_expires_time,
            amount: (function () {
              var sum = 0;
              item.product_infos.forEach(function (item) {
                if (item.amount)
                  sum += item.amount;
              });
              return sum;
            } ())
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

    function formatProducts(products) {
      if (!products || !Array.isArray(products))
        return [];

      return products.map(function (item) {
        if (item.product_info && item.product_sku_info) {
          var pictures = item.product_info.pictures;
          //var attributes = item.product_sku_info.attribute.sort(function(a, b){
          //    return a.attr-b.attr;
          //});
          var attr = item.product_sku_info.attribute;
          if (!attr) return;

          attr.forEach(function (option) {
            option.weight = 0;
            if (Cart.isLeadingAttribute(item.product_info, option.attr)) {
              option.weight += 1;
            }
          });
          attr.sort(function (a, b) {
            return b.weight - a.weight;
          });

          return {
            productId: item.pid,
            amount: item.amount,
            name: item.product_info.name,
            size: attr[1].name,
            color: attr[0].name,
            skuId: item.sid,
            //imageUrl: (pictures && pictures[0]) ? pictures[0].file_url : ''
            imageUrl: $rootScope.getCurrentPicUrl(item)
          }
        }
      });
    }

    function getOrderStatus(callback) {
      var url = Config.URL_PREFIX + 'orders/status';
      $http.get(url).then(function (resp) {
        if (resp.status === 200) {
          var data = resp.data;
          if (!data) {
            callback(-1, null, resp.statusText);
            return;
          }
          data = data.rows;
          var result = {
            waitPay: 0, // 待付款订单数量
            waitShipped: 0, // 待发货订单数量
            waitReceived: 0 // 待收货订单数量
          };
          data.forEach(function (e) {
            switch (e.state) {
              case 0x00000000:
              case 0x00000010:
                result.waitPay += e.total;
                break;
              case 0x00000020:
              case 0x00000040:
              case 0x00000400:
                result.waitShipped += e.total;
                break;
              case 0x00000080:
                result.waitReceived += e.total;
                break;
              default:
                break;
            }
          });
          callback(0, result);
        } else {
          callback(-1, null, resp.statusText);
        }
      }, function (resp) {
        callback(-1, null, resp.statusText)
      })
    }
  }
} ());
