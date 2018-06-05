/**
 * Created by lujin on 2016/6/17.
 */


(function () {
    'use strict';
    angular.module('10Style.return-goods-application')
        .controller('ReturnGoodsAppCtrl', ReturnGoodsAppCtrl);

    ReturnGoodsAppCtrl.$inject = ['$scope', '$stateParams', 'AfterSaleService', 'RETURN_STATE', 'authentication', 'MyRouter', 'Loading', '$ionicPopup', "USER_DEFAULT_INFO"];

    function ReturnGoodsAppCtrl($scope, $stateParams, AfterSaleService, RETURN_STATE, authentication, MyRouter, Loading, $ionicPopup, USER_DEFAULT_INFO) {


        var REASON = [
            '活动商品7天无理由退换',
            '包装/商品破损',
            '质量问题',
            '发错货了',
            '少件/漏发',
            '其他'
        ];


        var _orderId = $stateParams.orderId;
        var _afterSaleId = $stateParams.afterSaleId;

        /**
         * 头像
         * @type {null}
         */
        $scope.portrait = null;

        /**
         * 订单号填写点击事件
         * @type {onExpressNumClick}
         */
        $scope.onExpressNumClick = onExpressNumClick;

        /**
         * 初始化
         */
        init();


        function init() {
            $scope.portrait = getHeadImg();
            Loading.show({
                fullScreen: true,
                style: 'circle'
            });

            AfterSaleService.getAfterSale(_orderId, _afterSaleId)
                .then(function (resp) {

                    if (!resp || !resp.stateInfos || !angular.isArray(resp.stateInfos)) return;

                    resp.stateInfos.forEach(function (item) {

                        if (item.showDetail) {
                            item.refund_number_text = '退货数量：' + item.refund_num + '件';
                            item.refund_cash_text = '退货金额：' + (item.refund_cash / 100) + '元';
                            item.refund_reason_text = '退货理由：' + REASON[resp.reason-1];
                            item.state_change_reason = (item.state_change_role === 0 ? '退货说明：' : '修改说明：') + item.state_change_reason;
                        }

                        item.state_change_reason = item.state_change_reason.split('\\n').join('<br/>').split(' ').join('&nbsp;');
                    });

                    $scope.afterSaleInfos = resp;

                    $scope.stateText = RETURN_STATE[$scope.afterSaleInfos.state];
                })
                .catch(function (resp) {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '获取售后详情失败',
                        okText: '知道了'
                    }).then(function () {
                        MyRouter.gotoStateDirectly('orders-detail', { orderId: _orderId });
                    });
                })
                .finally(function (resp) {
                    Loading.hide();
                })
        }

        /**
         * 获取头像
         * @returns {*}
         */
        function getHeadImg() {
            var accountInfo = authentication.getAccountInfo();
            return (accountInfo && accountInfo.portrait) ? accountInfo.portrait : USER_DEFAULT_INFO.AVATOR;
        }

        /**
         * 订单号填写点击事件响应函数
         */
        function onExpressNumClick() {
            MyRouter.gotoStateDirectly('express-fill', { orderId: _orderId, afterSaleId: _afterSaleId });

        }
    }



})();
