/**
 * Created by Administrator on 2016/5/11 0011.
 */
(function () {
    'use strict';

    angular.module('starter.services')
        .factory(
            "MyRouter",
            [
                "$state", "$stateParams",
                "$rootScope",
                "base64",
                "$ionicHistory",
                "$ionicViewSwitcher",
                "$ionicNativeTransitions",
                function ($state, $stateParams, $rootScope, base64, $ionicHistory, $ionicViewSwitcher, $ionicNativeTransitions)
                {
                    var obj = {};

                    /**
                     * 直接跳转到目标路由的辅助方法，但是会在目标路由的参数中附带上当前路由的状态和参数信息，以便回退
                     * @param state 目标路由状态名
                     * @param params 切换时提供给目标路由状态的参数
                     * @param options 切换时提供给目标路由状态的选项
                     * @param in_history 传给目标路由状态的历史回退参数，用于让目标路由状态返回到指定路由
                     */
                    obj.gotoStateDirectly = function (state, params, options, in_history)
                    {
                        var direction = options ? options.direction : "forward";
                        if (!direction) direction = "forward";

                        var clear_history = options ? (options.clearHistory && (options.clearHistory === true)) : false;
                        var clear_prev_history = options ? (options.clearPrevHistory && (options.clearPrevHistory === true)) : false;

                        if (!clear_history)
                        {
                            if (clear_prev_history)
                            {
                                if ($state.params.history)
                                    $state.params.history = "";
                            }

                            params = obj.formatStateParams(params, in_history);
                        }
                        else
                        {
                            $rootScope.historyBack = ".";
                            $rootScope.historyBackParams = "";
                        }

                        ////////////////////////////////////////
                        $ionicViewSwitcher.nextDirection(direction);

                        if ($ionicNativeTransitions)
                        {
                            var transition = { "type": "slide", "direction": "left", "duration": 300 };
                            if (direction == "back")
                                transition = { "type": "slide", "direction": "right", "duration": 300 };

                            $ionicNativeTransitions.stateGo(state, params, options, transition);
                        }
                        else
                        {
                            $state.go(state, params, options);
                        }
                    }

                    /**
                     * 回退到前一个路由状态，需要和 @type { gotoStateDirectly } 配合
                     * @param options 切换时提供给目标路由状态的选项
                     */
                    obj.goBackState = function (options)
                    {
                        var direction = options ? options.direction : "back";
                        if (!direction) direction = "back";

                        var steps = options? (!isNaN(options.steps)? options.steps : 1) : 1;

                        var ionic_back = $rootScope.historyIonicBack;

                        if (ionic_back != 0)
                        {
                            $ionicHistory.goBack((ionic_back > 0) ? -ionic_back : ionic_back);
                            $rootScope.historyIonicBack = 0;
                        }
                        else
                        {
                            var back = function (back, params, options)
                            {
                                $ionicViewSwitcher.nextDirection(direction);

                                if ($ionicNativeTransitions)
                                {
                                    var transition = { "type": "slide", "direction": "right", "duration": 300 };
                                    if (direction == "forward")
                                        transition = { "type": "slide", "direction": "left", "duration": 300 };

                                    $ionicNativeTransitions.stateGo(back, { stateParams: params }, options, transition);
                                }
                                else
                                {
                                    $state.go(back, { stateParams: params }, options);
                                }
                            }

                            if (steps <= 1)
                            {
                                back($rootScope.historyBack, $rootScope.historyBackParams, options);
                            }
                            else
                            {
                                var stepBack = function (params, steps)
                                {
                                    if (angular.isString(params))
                                    {
                                        params = JSON.parse(base64.urldecode(params));
                                    }

                                    console.log("state params= ", params);
                                    var history = params.history;
                                    console.log("history= ", history);
                                    try {
                                        history = JSON.parse(base64.urldecode(history));
                                    }
                                    catch (err) {
                                        try { history = JSON.parse(history); } catch (err) { console.log(err); }
                                    }
                                    console.log("history= ", history);

                                    if (--steps <= 0)
                                    {
                                        back(history.back, history.backParams, options);
                                    }
                                    else if (history.backParams)
                                    {
                                        stepBack(history.backParams, steps);
                                    }
                                }

                                stepBack($state.params, steps);
                            }
                        }
                    }

                    /**
                     * 获取当前路由状态的历史回退数据
                     * @returns { back: "", backParams: "" }
                     */
                    obj.getCurrentStateHistory = function ()
                    {
                        return { back: $rootScope.historyBack, backParams: $rootScope.historyBackParams };
                    }

                    /**
                     * 清空当前路由状态的历史回退数据
                     */
                    obj.clearCurrentStateHistory = function ()
                    {
                        $rootScope.historyBack = ".";
                        $rootScope.historyBackParams = "";
                    }

                    /**
                     * 格式化我们的路由状态参数，用于支持灵活的回退政策
                     * @param params 切换时提供给目标路由状态的参数
                     * @param in_history 传给目标路由状态的历史回退参数，用于让目标路由状态返回到指定路由
                     */
                    obj.formatStateParams = function (params, in_history)
                    {
                        // if (!params && !in_history) return params;

                        // stick the history back params
                        if (!params) params = {};
                        var history = angular.isString(params.history) ? JSON.parse(base64.urldecode(params.history)) : (angular.isObject(params.history) ? params.history : {});

                        var ext_history_back_params;

                        if (in_history)
                        {
                            angular.forEach(
                                in_history,
                                function (value, key)
                                {
                                    if ((key == 'back' || (key == 'backParams') || (key == 'useIonic')))
                                    {
                                        history[key] = value;
                                        return;
                                    }
                                    if (key.indexOf("$") == 0)
                                        key = key.substring(1);
                                    if (!ext_history_back_params) ext_history_back_params = {};
                                    ext_history_back_params[key] = value;
                                }
                            );
                        }

                        if (!history.back) history.back = $state.current.name;
                        if (!history.backParams) history.backParams = $state.params; // now the back params is just an object instead of an string

                        try
                        {
                            if (history.backParams && ext_history_back_params)
                            {
                                history.backParams = angular.isString(history.backParams) ? JSON.parse(base64.urldecode(history.backParams)) : (angular.isObject(history.backParams) ? history.backParams : {});;
                                angular.forEach(ext_history_back_params, function (value, key) { history.backParams[key] = value; });
                            }
                            // convert the back params to an url-encoded json-string if it is an object instead of an string
                            history.backParams = angular.isString(history.backParams) ? history.backParams : base64.urlencode(JSON.stringify(history.backParams));
                        }
                        catch (err)
                        {
                            history.backParams = "";
                        }

                        params.history = base64.urlencode(JSON.stringify(history));

                        return params;
                    }

                    return obj;
                }
            ]
        );
} ());
