"use strict";

angular.module('starter.services')
    .factory(
        'recharge',
        [
            "$http",
            "$window",
            "$rootScope",
            'authentication',
            'weixinPayment',
            function ($http, $window, $rootScope, authentication, weixinPayment)
            {
                var obj = {};

                //obj.postRechargeData = postRechargeData;
                //
                //function postRechargeData(){
                //    weixinPayment.recharge()
                //}

                return obj;
            }
        ]
    );
