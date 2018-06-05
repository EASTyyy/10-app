(function () {
    'use strict';

    angular.module('starter.services').factory(
        'Address', ["$http", "$cacheFactory", "Config", function ($http, $cacheFactory, Config) {

            return {
                create: _create,
                list: _list,
                update: _update,
                delete: _delete,
                get: _get,
                default: _default,
                formatAddress: _formatOuterAddress,
                formatDetailAddress: _formatDetailAddress
            };

            function _formatPost(data) {
                var district = data.area.split('-')[2];
                var post = {
                    'name': data.name,
                    'phone': data.phone,
                    'country': "中国",
                    'province': data.area.split('-')[0],
                    'city': data.area.split('-')[1],
                    'district': district ? district : '',
                    'addr': data.addr,
                    'flag': data.flag == true ? 1 : 0
                };
                return post;
            }

            function　_formatAddress(response) {
                var address = response.data.rows.map(function(item){
                    return {
                        name: item.address[0],
                        phone: item.address[1],
                        area: item.address[3] + '-' + item.address[4] + (item.address[5] ? '-' : '') + item.address[5],
                        addr: item.address[7],
                        id: item.id,
                        account_id: item.account_id,
                        flag: item.flag,
                        address: item.address
                    }
                });
                return {
                    data: {rows: address, total: response.data.total || 0},
                    status: response.status,
                    config: response.config,
                    headers: response.headers
                };
            }

            /**
             * 获取缓存数据cache对象
             * @returns {Object}
             */
            function _getAddressData(){
                var cache = $cacheFactory.get("address-data");
                if (!cache) {
                    cache = $cacheFactory("address-data");
                }
                return cache;
            }

            /**
             * 删除地址缓存
             */
            function _removeAddressCache(){
                var cache = $cacheFactory.get("address-data");
                if (cache) {
                    cache.removeAll();
                }
            }

            function _create(data){
                var postData = _formatPost(data);
                console.log(postData);
                //清楚缓存
                _removeAddressCache();
                return $http({
                    method: 'POST',
                    url: Config.URL_PREFIX + 'addresses',
                    data: postData
                });
            }

            function _list(){
                return $http({
                    method: 'GET',
                    url: Config.URL_PREFIX + 'addresses',
                }, {cache: _getAddressData()}).then(_formatAddress);
            }

            function _update(id, data){
                var postData = _formatPost(data);
                console.log(postData);
                //清楚缓存
                _removeAddressCache();
                return $http({
                    method: 'PUT',
                    url: Config.URL_PREFIX + 'addresses/' + id,
                    data: postData
                })
            }

            function _delete(id){
                //清楚缓存
                _removeAddressCache();
                return $http({
                    method: 'DELETE',
                    url: Config.URL_PREFIX + 'addresses/' + id
                })
            }

            function _get(id){
                return $http({
                    method: 'GET',
                    url: Config.URL_PREFIX + 'addresses/' + id
                });
            }

            function _default(){
                return $http({
                    method: 'GET',
                    url: Config.URL_PREFIX + 'addresses/default'
                });
            }

            function _formatOuterAddress(item){
                var a = item.address;
                var address = {
                    name: a[0],
                    phone: a[1],
                    area: a[3] + '-' + a[4] + (a[5] ? '-' : '') + a[5],
                    addr: a[7],
                    id: item.id,
                    account_id: item.account_id,
                    flag: item.flag === 1
                };
                return address;
            }
            /*订单详情页详细地址格式*/
            function _formatDetailAddress(item){
                var a = item.express_address;
                var address = {
                    addr: a.slice(3, 7).join(" ") + " " + a[7]
                };
                return address.addr;
            }
        }]
    );

} ());

