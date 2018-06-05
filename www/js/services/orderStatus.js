(function () {
  'use strict';

  angular.module('starter.services')
    .factory('OrderStatus', OrderStatus);

  OrderStatus.$inject = ['ORDER_STATUS', 'ORDER_STATUS_DISPLAY'];

  function OrderStatus(ORDER_STATUS, ORDER_STATUS_DISPLAY) {

    // var stateDict = {
    //   all: getAllStateId(),
    //   toBePaid: getToBePaidStateId(),
    //   toSendTheGoods: getToSendTheGoodsStateId(),
    //   express: getExpressStateId()
    // }

    var group = {
      all: { key: 'all', name: '全部订单', stateCodes: ORDER_STATUS['all'], stateCodesData: ORDER_STATUS['all'] },
      toBePaid: { key: 'toBePaid', name: '待支付', stateCodes: ORDER_STATUS['toBePaid'].join(','), stateCodesData: ORDER_STATUS['toBePaid'] },
      toSendTheGoods: { key: 'toSendTheGoods', name: '待发货', stateCodes: ORDER_STATUS['toSendTheGoods'].join(','), stateCodesData: ORDER_STATUS['toSendTheGoods'] },
      express: { key: 'express', name: '待收货', stateCodes: ORDER_STATUS['express'].join(','), stateCodesData: ORDER_STATUS['express'] }
    };

    var service = {
      canceledStateCode: ORDER_STATUS.canceled[0],
      completedStateCode: ORDER_STATUS.completed[0],
      group: group,
      displayDict: ORDER_STATUS_DISPLAY,
      isCanceledState: isCanceledState,
      isCompletedState: isCompletedState,
      isExpressState: isExpressState,
      isToBePaidState: isToBePaidState,
      isToSendTheGoodsState: isToSendTheGoodsState,
      hasExpress: hasExpress,
      isStateInStateGroup: isStateInStateGroup
    };

    return service;


    function isCompletedState(stateCode) {
      return ORDER_STATUS.completed.indexOf(stateCode) !== -1;
    }

    function isExpressState(stateCode) {
      return ORDER_STATUS.express.indexOf(stateCode) !== -1;
    }

    function isToBePaidState(stateCode) {
      return ORDER_STATUS.toBePaid.indexOf(stateCode) !== -1;
    }

    function isToSendTheGoodsState(stateCode) {
      return ORDER_STATUS.toSendTheGoods.indexOf(stateCode) !== -1;
    }

    function isCanceledState(stateCode) {
      return ORDER_STATUS.canceled.indexOf(stateCode) !== -1;
    }

    function hasExpress(stateCode) {
      // 已完成和待收货状态有物流信息
      return isCompletedState(stateCode) || isExpressState(stateCode);
    }

    //判断订单状态是否在订单状态组内
    function isStateInStateGroup(stateCode, stateGroup) {

      if (!group[stateGroup])
        return false;

      if (stateGroup === 'all') {
        return true;
      }

      return group[stateGroup].stateCodesData.indexOf(stateCode) !== -1;
    }


    //判断
    function getStateGroupKey(stateId, stateName) {

      var result = false;

      switch (stateId) {
        case stateDict.all:
          result = stateName === 'all';
          break;
        case stateDict.toBePaid:
          result = stateName === 'toBePaid';
          break;
        case stateDict.toSendTheGoods:
          result = stateName === 'toSendTheGoods';
          break;
        case stateDict.express:
          result = stateName === 'express';
          break;
      }

      return stateGroup[key];
    }

    // function getAllStateId() {
    //   return null;
    // }
    //
    // function getToBePaidStateId() {
    //   console.log(ORDER_STATUS.toBePaid.toString());
    //   return ORDER_STATUS.toBePaid.join(',');
    // }
    //
    // function getToSendTheGoodsStateId() {
    //   return ORDER_STATUS.toSendTheGoods.join(',');
    // }
    //
    // function getExpressStateId() {
    //   return ORDER_STATUS.express.join(',');
    // }
    //

  }
} ());
