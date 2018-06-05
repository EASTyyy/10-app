/**
 * Created by lujin on 2016/5/5.
 */

(function(){
    "use strict";
    angular.module('starter.services').service('ExpressService', ExpressService);
    ExpressService.$inject = ['$http', 'Config', '$q'];

    function ExpressService($http, Config, $q){
        /**
         * 查询路由增量信息
         * @param orderId
         * @param callback
         */
        this.geOrderRouteInc = function(orderId, callback){
            var url = Config.URL_PREFIX + 'sf/route_inc';
            var args = {
                orderId: orderId
            };

            $http.get(url, {params: args}).then(
                function(resp){
                    var data = resp.data;
                    if (resp.status === 200 && data){
                        callback(0, data.rows);
                    }else{
                        callback(-1, null, resp.statusText);
                    }
                },
                function(resp){
                    callback(-1, null, resp.statusText);
                });
        };

        /**
         * 查询订单路由信息
         * @param companyId
         * @param expressNumber
         */
        this.getOrderRoute = function(companyId, expressNumber){
            var url = Config.URL_PREFIX + 'express/query/'+companyId+'/order/'+expressNumber;
            var deferred = $q.defer();
            $http.get(url).then(function(resp){
                var data = resp.data;
                if(data && resp.status === 200){
                    var rows = data.rows;
                    if(rows && rows.length > 0){
                        var row = rows[0];
                        var expressCompany = row ? row.express_company:null;
                        var res = {};
                        if(expressCompany){
                            res.expressCompany = expressCompany;
                        }else{
                            deferred.reject(-1);
                        }

                        var expressRouteInfo = row?row.express_route_info:null;
                        if(expressRouteInfo){
                            res.state = expressRouteInfo.state*1;
                            res.comCode = expressRouteInfo.com;
                            res.num = expressRouteInfo.nu;

                            var routeInfo = expressRouteInfo.data;
                            if(routeInfo && Array.isArray(routeInfo)) {
                                var pattern = /派件人\s*[:|：](.+)[,|，]\s*电话\s*[:|：]\s*(\d+)/;
                                routeInfo.forEach(function (e) {
                                    var context = e.context;
                                    var m = context.match(pattern);
                                    if (m && m.length >= 3) {
                                        res.sender = m[1];
                                        res.phone = m[2];
                                        return false;
                                    }
                                });
                            }
                            res.rows = routeInfo;
                        }
                        deferred.resolve(res);
                    }
                }
                deferred.reject(-1);
            }, function(data){
                deferred.reject(-1);
            });

            return deferred.promise;
        };

        /**
         * 快递公司名称映射
         * @param cmCode
         * @returns {*}
         */
        this.mappingExpressCompany = function(cmCode){
            var source = {
                shunfeng: '顺丰快递'
            };
            return source[cmCode];
        };
    }
}());
