/**
 * Created by lujin on 2016/6/20.
 */

(function () {
    'use strict';
    angular.module('10Style.after-sales-application').service('AfterSaleService', AfterSaleService);
    AfterSaleService.$inject = ['$http', 'Config', '$q', 'RETURN_STATE_KEY'];

    function AfterSaleService($http, Config, $q, RETURN_STATE_KEY) {

        /**
         * 快递单号和快递公司提交
         * @param orderId：订单ID
         * @param afterSaleId：售后申请记录ID
         * @param expressCom：快递公司ID
         * @param expressNum：快递单号
         * @param expressComName：快递公司名称
         * @returns {*}
         */
        this.putExpressInfo = function (orderId, afterSaleId, expressCom, expressNum, expressComName) {

            var args = {
                method: 'PUT',
                url: Config.URL_PREFIX + 'orders/' + orderId + '/services/' + afterSaleId,
                data: {
                    express_company: expressCom,
                    express_number: expressNum,
                    state: 1,
                    state_change_reason: expressComName + " 单号：" + expressNum
                }
            };
            console.log('args: ', args);
            return getPromise(args, [201]);
        };

        /**
         * 售后申请
         * @param orderId: 订单ID
         * @param type: int 类型, 必填 , 0表示换货(暂不支持)，1表示退货
         * @param orderProductId: int 订单产品ID, 必填
         * @param refundNum: int 退货数量, 必填
         * @param refundCash: int 退款金额, 必填
         * @param refundReason: int 退货理由, 必填, 1表示一手货十天无理由退换, 2表示包装／商品破损 , 3表示质量问题, 4表示发错货了, 5表示少件／漏发 , 6表示其他
         * @param refundComment: str 退货说明, 选填, 默认为空
         * @returns {*}
         */
        this.postAfterSale = function (orderId, type, orderProductId, refundNum, refundCash, refundReason, refundComment, refundProofImage) {
            var args = {
                method: 'POST',
                url: Config.URL_PREFIX + 'orders/' + orderId + '/services/',
                data: {
                    type: type,
                    order_product_id: orderProductId,
                    refund_num: refundNum,
                    refund_cash: refundCash,
                    refund_reason: refundReason,
                    refund_comment: refundComment,
                    refund_proof_image: refundProofImage
                }
            };
            return getPromise(args, [201], function (resp, deferred) {
                var afterSaleId = resp.data.customer_service_info;
                if (afterSaleId) {
                    deferred.resolve({
                        afterSaleId: afterSaleId
                    })
                } else {
                    deferred.reject(resp);
                }
            })
        };

        /**
         * 获取申请售后
         * @param orderId
         * @param afterSaleId
         * @returns {*}
         */
        this.getAfterSale = function (orderId, afterSaleId) {
            var args = {
                method: 'GET',
                url: Config.URL_PREFIX + 'orders/' + orderId + '/services/' + afterSaleId
            };
            return getPromise(args, [200], function (resp, deferred) {
                var rows = resp.data.rows;

                if (rows && rows.length > 0) {
                    var stateInfos = rows[0].state_infos ? parseStateInfos(rows[0].state_infos) : [];

                    var refundProofImages = rows[0].refund_proof_image;

                    refundProofImages = refundProofImages.filter(function (image) {
                        return image;
                    });

                    deferred.resolve({
                        //resp:resp,
                        //rows:rows,
                        //returnGoodAmount:returnGoodAmount,
                        //paymentPrice:paymentPrice,
                        stateInfos: stateInfos,
                        refundProofImages: refundProofImages,
                        state: rows[0].state,
                        reason: rows[0].refund_reason,
                        hasExpressInfo: (rows[0].flag & 1) === 1 // 判断flag最后一位是否为1
                    })

                } else {
                    deferred.reject(resp);
                }
            })

        };

        function parseStateInfos(state_infos) {
            var result = {
                dialogs: []
            }
            var temp = {}
            state_infos.forEach(function (info) {
                if (temp[info.state] === undefined) {
                    temp[info.state] = [info];
                } else {
                    temp[info.state].push(info);
                }
            })
            for (var key in temp) {
                if (isNaN(key))
                    return;
                var state_info_length = temp[key].length;
                key = parseInt(key);
                labelShowDetail(key, temp[key]);
                if (state_info_length === 1) {
                    result.dialogs.push(temp[key][0]);
                } else if (state_info_length === 2) {
                    result.dialogs.push(temp[key][0]);
                    var next_state = key + 1;
                    var last_item = temp[key][state_info_length - 1];
                    if ((!last_item.state_change_role) || (temp[next_state] && temp[next_state].length > 0)) {
                        result.dialogs.push(last_item);
                    }
                } else if (state_info_length >= 3) {
                    result.dialogs.push(temp[key][0]);
                    var central_part = temp[key].slice(1, state_info_length - 1);
                    central_part.forEach(function (info) {
                        if (!info.state_change_role) {
                            result.dialogs.push(info);
                        }
                    })
                    var hasNext = hasNextState(key, temp);
                    var last_item = temp[key][state_info_length - 1];
                    if ((!last_item.state_change_role) || hasNext) {
                        result.dialogs.push(last_item);
                    }
                }
            }

            return result.dialogs;

            function hasNextState(current_state, state_hash) {
                for (var key in state_hash) {
                    if (parseInt(key) > current_state && state_hash[key] && state_hash[key].length > 0) {
                        return true;
                    }
                }
                return false;
            }

            function labelShowDetail(state, infos) {
                if (state === RETURN_STATE_KEY.CheckPending) {
                    infos.forEach(function (info) {
                        info.showDetail = true;
                    })
                } else if (state === RETURN_STATE_KEY.WaitGoods) {
                    infos.forEach(function (info, index) {
                        if (index !== 0 && info.state_change_role) {
                            info.showDetail = true;
                        }
                    })
                }
            }
        }

        /**
         * 获取一个$http的promise对象，
         * @param args：$http的请求参数
         * @param code: 正确的状态码,数组，默认200， eg: [200]
         * @param success: 成功同步回调函数，可选，用于处理请求成功的时候的数据
         * @param error：失败同步回调函数，可选，用于处理请求失败的时候的数据
         * @returns {*}：如果没有写自定义的success和error方法，那么就是返回原始的数据，否则返回自定义方法返回的数据，返回的同样还是一个promise
         */
        function getPromise(args, code, success, error) {
            var deferred = $q.defer();

            // 默认为200
            if (code === null) {
                code = [200];
            }

            $http(args).then(function (resp) {
                // 如果状态码不正确则直接reject
                if (code.indexOf(resp.status) === -1) {
                    deferred.reject(resp);
                } else {
                    if (angular.isFunction(success)) {
                        resp = success(resp, deferred);
                    }
                    deferred.resolve(resp);
                }
            }, function (resp) {
                if (angular.isFunction(error)) {
                    resp = error(resp, deferred);
                }
                deferred.reject(resp);
            });

            return deferred.promise;
        }
    }

})();
