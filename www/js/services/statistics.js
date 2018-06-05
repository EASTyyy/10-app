(function () {
    'use strict';

    angular.module("starter.services")
        .factory('Statistics', Statistics);

    Statistics.$inject = ['$http', 'authentication', 'STATISTICS_EVENT_NAME', 'STATISTICS_FLAG_NAME', 'Config', 'Helper'];

    function Statistics($http, authentication, STATISTICS_EVENT_NAME, STATISTICS_FLAG_NAME, Config, Helper) {

        var reportUrl = Config.REPORT_URL + "/report/infos";

        var services = {
            view: view,
            productView: productView,
            login: login,
            collect: collect,

            addToCart: addToCart,
            removeItemCart: removeItemCart,
            removeItemsCart: removeItemsCart,

            createOrder: createOrder,
            cancelOrder: cancelOrder,

            search: search,

            setFlag: setFlag
        };

        return services;


        function view(stateName) {
            if (dplus && dplus.define) {
                dplus.define('page', function (page) {
                    page.view();
                });
            }
        }

        function productView(productId, url) {
            var data = getBaseData();

            data.infos = [{
                type_1: 18,
                type_2: productId,
                text_1: url
            }]

            $http.post(reportUrl, data);
        }


        /**
         * (记录用户增加更新商品)
         *
         * @param data ()
         */
        function addToCart(data) {
            _addToCartToDplus(data);

            var videoFlagData = _filterVideoFlagData(data);

            if (videoFlagData && videoFlagData.length > 0) {
                _addToCartIfFlagEqualVideoToOwn(videoFlagData);
                _addToCartToDplus(videoFlagData, STATISTICS_EVENT_NAME.ADD_TO_CART_FROM_VIDEO);
            }

            var searchFlagData = _filterSearchFlagData(data);

            if (searchFlagData && searchFlagData.length > 0) {
                _addToCartIfFlagEqualSearchToOwn(searchFlagData);
                _addToCartToDplus(searchFlagData, STATISTICS_EVENT_NAME.ADD_TO_CART_FROM_SEARCH);
            }
        }

        function _addToCartToDplus(data, eventName) {
            if (data && angular.isArray(data) && dplus && dplus.track) {
                var username = getUserName();

                data.forEach(function (item) {
                    dplus.track(eventName, {
                        productId: item.productId,
                        skuId: item.sid,
                        quantity: item.amount,
                        userName: username
                    });
                })
            }
        }

        function _addToCartIfFlagEqualVideoToOwn(infos) {
            if (!infos || !angular.isArray(infos) || infos.length === 0)
                return;

            var data = getBaseData();

            data.infos = infos.map(function (item) {
                var result = [];
                var videoList = Helper.SessionStorage.getObjectData(STATISTICS_FLAG_NAME.VIDEO_FLAG + '_' + item.productId);

                if (!videoList)
                    return result;

                videoList.forEach(function (videoId) {
                    result.push(
                        {
                            type_1: 5,
                            type_2: item.productId,
                            type_3: item.sid,
                            type_4: videoId,
                            number_1: item.amount
                        }
                    )
                })

                return result;
            }).reduce(function (a, b) {
                return a.concat(b);
            });

            $http.post(reportUrl, data);
        }

        function _addToCartIfFlagEqualSearchToOwn(infos) {
            if (!infos || !angular.isArray(infos) || infos.length === 0)
                return;

            var data = getBaseData();

            data.infos = infos.map(function (item) {
                var result = [];
                var keywordList = Helper.SessionStorage.getObjectData(STATISTICS_FLAG_NAME.SEARCH_FLAG + '_' + item.productId);

                if (!keywordList)
                    return result;

                keywordList.forEach(function (keyword) {
                    result.push(
                        {
                            type_1: 13,
                            type_2: item.productId,
                            type_3: item.sid,
                            number_1: item.amount,
                            text_1: keyword
                        }
                    )
                })

                return result;
            }).reduce(function (a, b) {
                return a.concat(b);
            });

            $http.post(reportUrl, data);
        }

        //过滤从视频页购物的商品
        function _filterVideoFlagData(data) {
            if (!data || !angular.isArray(data) || data.length === 0)
                return [];

            return data.filter(function (item) {
                return item.productId && Helper.SessionStorage.hasKey(STATISTICS_FLAG_NAME.VIDEO_FLAG + '_' + item.productId)
            });
        }

        //过滤从搜索购物的商品
        function _filterSearchFlagData(data) {
            if (!data || !angular.isArray(data) || data.length === 0)
                return [];

            return data.filter(function (item) {
                return item.productId && Helper.SessionStorage.hasKey(STATISTICS_FLAG_NAME.SEARCH_FLAG + '_' + item.productId)
            });
        }



        /**
         * (记录用户删除一个商品)
         *
         * @param skuId (商品SKUID)
         */
        function removeItemCart(skuId) {
            var params = { skuId: skuId.toString(), userName: getUserName() };

            dplus.track('删除购物车', params);
        }

        /**
         * (记录用户删除一个商品)
         *
         * @param skuIdArr (商品SKUID数组)
         */
        function removeItemsCart(skuIdArr) {
            var params = { data: skuIdArr, userName: getUserName() };

            angular.forEach(skuIdArr, function (value, key) {
                dplus.track('删除购物车', { skuId: value.toString(), userName: params.userName });
            });
        }


        /**
         * (记录用户创建订单)
         *
         * @param data (订单信息)
         */
        function createOrder(data, orderId) {
            createOrderToDplus(data, STATISTICS_EVENT_NAME.CREATE_ORDER);

            var videoFlagData = _filterVideoFlagData(data);

            if (videoFlagData && videoFlagData.length > 0) {
                createOrderIfFlagEqualVideoToOwn(videoFlagData, orderId);
                createOrderToDplus(videoFlagData, STATISTICS_EVENT_NAME.CREATE_ORDER_FROM_VIDEO);
            }

            var searchFlagData = _filterSearchFlagData(data);

            if (searchFlagData && searchFlagData.length > 0) {
                createOrderIfFlagEqualSearchToOwn(searchFlagData, orderId);
                createOrderToDplus(searchFlagData, STATISTICS_EVENT_NAME.CREATE_ORDER_FROM_SEARCH);
            }
        }

        function createOrderToDplus(data, eventName) {
            if (data && angular.isArray(data) && dplus && dplus.track) {
                var username = getUserName();
                data.map(function (item) {
                    dplus.track(eventName, {
                        productId: item.productId,
                        skuId: item.sid,
                        quantity: item.amount,
                        userName: username
                    });
                });
            }
        }

        function createOrderIfFlagEqualVideoToOwn(infos, orderId) {
            if (!infos || !angular.isArray(infos) || infos.length === 0 || !orderId)
                return;

            var data = getBaseData();

            console.log(infos);

            data.infos = infos.map(function (item) {
                var result = [];
                var videoList = Helper.SessionStorage.getObjectData(STATISTICS_FLAG_NAME.VIDEO_FLAG + '_' + item.productId);

                if (!videoList)
                    return result;

                videoList.forEach(function (videoId) {
                    result.push(
                        {
                            type_1: 8,
                            type_2: item.productId,
                            type_3: item.sid,
                            type_4: videoId,
                            type_5: orderId,
                        },
                        {
                            type_1: 9,
                            type_2: orderId,
                            type_3: videoId
                        }
                    )
                })

                return result;
            }).reduce(function (a, b) {
                return a.concat(b);
            });

            $http.post(reportUrl, data);
        }

        function createOrderIfFlagEqualSearchToOwn(infos, orderId) {
            if (!infos || !angular.isArray(infos) || infos.length === 0 || !orderId)
                return;

            var data = getBaseData();

            console.log(infos);

            data.infos = infos.map(function (item) {
                var result = [];
                var keywordList = Helper.SessionStorage.getObjectData(STATISTICS_FLAG_NAME.SEARCH_FLAG + '_' + item.productId);

                if (!keywordList)
                    return result;


                keywordList.forEach(function (keyword) {
                    result.push(
                        {
                            type_1: 14,
                            type_2: item.productId,
                            type_3: item.sid,
                            type_4: orderId,
                            text_1: keyword
                        },
                        {
                            type_1: 23,
                            type_2: orderId,
                            text_1: keyword
                        }
                    )
                })

                return result;
            }).reduce(function (a, b) {
                return a.concat(b);
            });

            $http.post(reportUrl, data);
        }

        /**
         * (记录用户取消订单)
         *
         * @param data (description)
         */
        function cancelOrder(data) {
            if (data && data.product_infos && angular.isArray(data.product_infos)) {
                var postData = data.product_infos.map(function (item) {
                    return {
                        skuId: item.sid,
                        quantity: item.amount
                    }
                })

                var params = { data: postData, userName: getUserName() };


                angular.forEach(postData, function (value, key) {
                    dplus.track('取消订单', { skuId: value.skuId.toString(), quantity: value.quantity, userName: params.userName });
                });

                console.log(params);
            }
        }

        function pay() {
            var params = { data: postData, userName: getUserName() };

            console.log(params);
        }

        function search(keyword) {
            dplus.track(STATISTICS_EVENT_NAME.SEARCH, { keyword: keyword });

            var data = getBaseData();

            data.infos = [{
                type_1: 12,
                text_1: keyword
            }]

            $http.post(reportUrl, data);
        }


        /**
         * (记录用户收藏或者取消收藏操作)
         * 0
         * @param productId (产品Id)
         * @param state (收藏或者取消：0: 取消，1: 收藏)
         */
        function collect(productId, state) {
            //todo 批量
            return;
            var params = { productId: productId.toString(), userName: getUserName() };

            if (state === 1) {
                dplus.track('收藏', params);
            }
            else {
                dplus.track('取消收藏', params);
            }
        }

        function login() {
            var params = { userName: userName };
        }

        function getUserId() {
            var userData = Helper.SessionStorage.getObjectData('account_info');

            return userData ? userData.id : undefined;
        }

        function getUserName() {
            var user = authentication.getAccountInfo();

            return user ? user.username.toString() : '';
        }

        function getBaseData() {
            return {
                user: getUserId(),
                platform: 1
            }
        }


        //设置标记，用于记录视频页、搜索页过来的流量。
        function setFlag(flag, value) {
            if (!flag || !value)
                return;

            Helper.SessionStorage.addValue(flag, value);
        }
    }

} ());
