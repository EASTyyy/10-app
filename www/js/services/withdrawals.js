(function () {
    'use strict';

    angular.module('starter.services')
        .factory('Withdrawals', Withdrawals);

    Withdrawals.$inject = ["$http", "$cacheFactory", "$q", "Config"];

    function Withdrawals($http, $cacheFactory, $q, Config) {

        return {
            creatBankInfo: creatBankInfo,
            resetBankInfo: resetBankInfo,
            getBankInfo: getBankInfo,
            getAlipayInfo: getAlipayInfo,
            withdrawPreview: withdrawPreview,
            getWithdrawlimit: getWithdrawlimit,
            createWithdraw: createWithdraw,
            getWithdrawInfo: getWithdrawInfo,
            getChannelInfo: getChannelInfo,
            creatAlipayInfo: creatAlipayInfo,
            resetAlipayInfo: resetAlipayInfo
        };


        /**
         * 创建支付宝账户信息
         * param alipay_account: str 支付宝账号 必填
         * param alipay_name: str 支付宝真实姓名  必填
         */
        function creatAlipayInfo(alipay_account, alipay_name) {

            var params = {
                alipay_account: alipay_account,
                alipay_name: alipay_name
            };

            return $http.post(
                Config.URL_PREFIX + "user/alipay_infos/", params);
        }

        /**
         * 修改支付宝账户信息
         * param id: id 必填
         * param alipay_account: str 支付宝账号 必填
         * param alipay_name: str 支付宝真实姓名  必填
         */
        function resetAlipayInfo(id, alipay_account, alipay_name) {

            var params = {
                alipay_account: alipay_account,
                alipay_name: alipay_name
            };

            return $http.put(
                Config.URL_PREFIX + "user/alipay_info/" + id, params);
        }

        /**
         * 创建银行卡信息
         * param bank_account: str 银行账号 必填
         * param bank_holder: str 持卡人  必填
         * param bank_branch: str 银行分行  必填
         * param bank_type: int  银行类型 必填
         */
        function creatBankInfo(bank_account, bank_holder, bank_branch, bank_type, bank_address) {

            var params = {
                bank_account: bank_account,
                bank_holder: bank_holder,
                bank_branch: bank_branch,
                bank_type: bank_type,
                bank_address: bank_address
            };

            return $http.post(
                Config.URL_PREFIX + "user/bank_infos/", params);
        }



        /**
         * 修改银行卡信息
         * param id: id 必填
         * param bank_account: str 银行账号 选填
         * param bank_holder: str 持卡人  选填
         * param bank_branch: str 银行分行  选填
         * param bank_type: int  银行类型 选填
         */
        function resetBankInfo(id, bank_account, bank_holder, bank_branch, bank_type, bank_address) {

            var params = {
                bank_account: bank_account,
                bank_holder: bank_holder,
                bank_branch: bank_branch,
                bank_type: bank_type,
                bank_address: bank_address
            };

            return $http.put(
                Config.URL_PREFIX + "user/bank_info/" + id, params);
        }




        /**
         * 获取银行卡信息
         */
        function getBankInfo() {

            return $http.get(
                Config.URL_PREFIX + "user/bank_infos/"
            );
        }

        /**
         * 获取支付宝账户信息
         */
        function getAlipayInfo() {

            return $http.get(
                Config.URL_PREFIX + "user/alipay_infos/"
            );
        }

        /**
         * 查询提现权限
         */
        function withdrawPreview(amount,channel,bank_id) {

            var data = {
                amount: amount,
                channel: channel,
                bank_id: bank_id
            };

            return $http.post(
                Config.URL_PREFIX + "user/withdraw_infos/preview/", data);

        }

        /**
         * 获取可提现余额
         */
        function getWithdrawlimit() {

            return $http.get(
                Config.URL_PREFIX + "user/withdraw_info/limit/");

        }


        /**
         * 创建提现
         * param amount: int 提现金额 (单位分) 必填
         * param channel: int   提现通道  选填  (默认 1-银行卡方式提现    2-支付宝提现方式)  必填
         * param bank_id: int  提现通道相关的记录id  必填
         * param security_code: 短信验证码
         */
        function createWithdraw(amount, channel, bank_id, security_code) {

            var data = {
                amount: amount,
                channel: channel,
                bank_id: bank_id,
                security_code: security_code
            };

            return $http.post(
                Config.URL_PREFIX + "user/withdraw_infos/", data);

        }


        /**
         * 获取提现记录
         * param id: 必填 提现id
         */
        function getWithdrawInfo(id) {

            return $http.get(
                Config.URL_PREFIX + "user/withdraw_info/"+id);

        }

        /**
         * 获取提现通道信息
         */
        function getChannelInfo(){
            return $http.get(
                Config.URL_PREFIX + "user/withdraw_info/channel/");
        }


    }


} ());


