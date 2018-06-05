(function () {
    "use strict";

    angular.module('starter.services')
        .factory(
        'authentication',
        [
            "$http",
            "$window",
            "$rootScope",
            "Config",
            "LocalService",
            "SessionService",
            function ($http, $window, $rootScope, Config, LocalService, SessionService) {
                var ACCOUNT_LOGIN = 'account_login';
                var CHECK_UPDATE_TIME = 'check_update_time';

                var obj = {};

                /**
                 * 刷新本地的登录状态
                 * @param callback 刷新完成后的回调函数
                 */
                obj.refreshSignInStatus = function (callback) {
                    if (obj.isSignedIn()) {
                        if (callback) callback(1);
                        return;
                    }

                    var token = LocalService.getToken();

                    if (!token) {
                        // NOTE 如果本地没有token的话则暂时不做任何处理
                        if (callback) callback(0);
                        return;
                    }

                    $http.get(
                        Config.URL_PREFIX + 'login',
                        {
                            headers: { token: token }
                        }
                    ).then(
                        function (response) {
                            var flag = false;
                            var newToken = (response && response.headers()) ? response.headers().token : null;
                            if (token) {
                                try {
                                    obj.setAccountInfo(response.data.account_info);
                                    obj.saveToken(newToken);
                                    flag = true;
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                            if (callback) {
                                if (flag) {
                                    callback(1);
                                } else {
                                    callback(-6, '刷新token失败，请重新登录。');
                                }
                            }
                        },
                        function (response) {
                            if (callback) {
                                if (response.status == 0)
                                    callback(-2, '连接失败，请检查你的网络设置。');
                                else if (response.status == 404)
                                    callback(-3, '连接失败，请稍候再试。');
                                else
                                    callback(-1, response.data.error);
                            }
                        }
                        );
                };

                /**
                 * 当前是否已经登录
                 * @returns {boolean}
                 */
                obj.isSignedIn = function () {
                    var yes = SessionService.getAccountInfo() ? true : false;

                    if (yes && !$http.defaults.headers.common.token)
                        $http.defaults.headers.common.token = LocalService.getToken();

                    return yes;
                };

                obj.setRequestHeaderToken = function (token) {
                    $http.defaults.headers.common.token = token;
                };

                /**
                 * 登陆
                 * @param username 注册的用户名
                 * @param password 密码
                 * @param callback 操作完成后的回调，签名为<code>function (result, data)</code>,成功result参数>0，且data有数据，失败result参数<0
                 */
                obj.signIn = function (username, password, callback) {
                    ionic.Platform.ready(function () {
                        $http.post(
                            Config.URL_PREFIX + 'login',
                            {
                                username: username,
                                password: password,
                                device_code: ionic.Platform.device().uuid || undefined
                            }
                        ).then(
                            function (response) {
                                var flag = false;
                                var account_info;
                                var token = (response && response.headers()) ? response.headers().token : null;
                                if (token) {
                                    try {
                                        account_info = response.data.account_info;

                                        obj.setLoginAccount(account_info.username);

                                        obj.saveToken(token);
                                        obj.setAccountInfo(account_info);
                                        flag = true;
                                    } catch (e) {
                                        console.log(e);
                                    }
                                }
                                if (callback) {
                                    if (flag) {
                                        callback(1, { account_info: account_info, token: token });
                                    } else {
                                        callback(-5, '登录失败，请重新登录.');
                                    }
                                }
                            },
                            function (response) {

                                if (callback) {
                                    if (response.status == 0)
                                        callback(-2, '连接失败，请检查你的网络设置。');
                                    else if (response.status == 404)
                                        callback(-3, '连接失败，请稍候再试。');
                                    else if (response.data.code === -10901)
                                        callback(-4, '手机号码或密码错误');
                                     else if (response.data.code === -109)
                                        callback(-5, '该账号已被绑定在其他设备上，请联系客服人员处理。');
                                    else if (response.data.code === -103 && response.data.extend === 'device_code')
                                        callback(-6, '未知的设备号，请联系客服人员处理。');
                                    else
                                        callback(-1, response && response.data && response.data.error ? response.data.error : "连接失败");
                                }
                            });
                    });
                };

                /**
                 * 登出
                 * @param callback
                 */
                obj.signOut = function (callback) {
                    $http.delete(Config.URL_PREFIX + 'login')
                        .then(
                        function (data) {
                            delete $http.defaults.headers.common.token;

                            SessionService.removeAccountInfo();

                            obj.removeToken();
                            // 删除登录的用户名
                            obj.removeLoginAccount();

                            if (callback) callback(1, "");
                        }
                        )
                        .catch(
                        function (data) {
                            if (callback) callback(-1, data.error);
                        }
                        );
                };

                /**
                 * 保存token信息
                 * @param token 理论上是从服务器端获取到的令牌信息
                 */
                obj.saveToken = function (token) {
                    try {
                        LocalService.setToken(token);
                        obj.setRequestHeaderToken(token);

                    }
                    catch (error) {
                        // TODO 这里应该能够向用户展示错误信息
                        console.log(error);
                    }
                };

                /**
                 * 获取token信息
                 */
                obj.getToken = function () {
                    return LocalService.getToken();
                };

                /**
                 * 移除token信息，当登出之类的操作发生时就需要移除token
                 */
                obj.removeToken = function () {
                    LocalService.removeToken();
                };

                /**
                 * 设置已登录的账号信息
                 * @returns {null}
                 */
                obj.setAccountInfo = function (account_info) {
                    if (account_info) {
                        SessionService.setAccountInfo(JSON.stringify(account_info));
                    }
                };

                /**
                 * 获取已登录的账号信息
                 * @returns {null}
                 */
                obj.getAccountInfo = function () {
                    var info = SessionService.getAccountInfo();
                    return info ? JSON.parse(info) : null;
                };

                obj.setLoginAccount = function (account) {
                    if (account) {
                        LocalService.setItem(ACCOUNT_LOGIN, account);
                    }
                };

                obj.getLoginAccount = function () {
                    return LocalService.getItem(ACCOUNT_LOGIN)
                };

                obj.removeLoginAccount = function () {
                    LocalService.removeItem(ACCOUNT_LOGIN);
                };

                /**
                 * 重置密码
                 * @param username
                 * @param password
                 * @param security_code
                 */
                obj.resetPassword = function (username, password, security_code) {
                    return $http.put(Config.URL_PREFIX + 'login', {
                        username: username,
                        password: password,
                        security_code: security_code
                    }
                    );
                };

                /**
                 * 更新用户信息
                 * @param data
                 * @returns {HttpPromise}
                 */
                obj.updateUserInfo = function (data) {
                    var USER_UPDATE_API = Config.URL_PREFIX + "user/info";

                    return $http.put(USER_UPDATE_API, data);
                };

                /**
                 * 注册前验证用户是否已注册
                 * @param username
                 */
                obj.verification = function (username) {
                    return $http.get(Config.URL_PREFIX + 'register?username=' + username);
                };

                /**
                 * 用户注册
                 * @param username
                 * @param password
                 * @param security_code
                 */
                obj.register = function (username, password, security_code) {
                    return $http.post(Config.URL_PREFIX + 'register', {
                        username: username,
                        password: password,
                        security_code: security_code
                    });
                };

                obj.queryAccountInfo = function () {
                    var promise = $http.get(Config.URL_PREFIX + 'user/info');
                    promise = promise.success(function (response) {
                        obj.setAccountInfo(response.account_info);
                    });
                    return promise;
                };

                /**
                 * 获取账户余额
                 * @returns {number}
                 */
                obj.getFunds = function () {
                    var accountInfo = obj.getAccountInfo();
                    if (accountInfo) {
                        return accountInfo.funds ? accountInfo.funds : 0;
                    } else {
                        return 0;
                    }
                };

                /**
                 * 设置账户余额
                 * @param funds
                 */
                obj.setFunds = function (funds) {
                    var accountInfo = obj.getAccountInfo();
                    if (accountInfo) {
                        accountInfo.funds = funds;
                        obj.setAccountInfo(accountInfo);
                    }
                };

                obj.setCheckUpdateTime = function (t) {
                    SessionService.setItem(CHECK_UPDATE_TIME, t);
                };

                obj.getCheckUpdateTime = function () {
                    return SessionService.getItem(CHECK_UPDATE_TIME);
                };


                return obj;
            }
        ]
        );
} ());
