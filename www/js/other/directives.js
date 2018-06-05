(function () {
    'use strict';

    angular.module('starter.directives')


        // TODO 注意依赖注入的写法
        .directive('backToTop', function () {
            return {
                restrict: 'E',
                replace: true,
                template: '<div class="back-to-top"><i class="fa fa-chevron-up"></i></div>',
                link: function ($scope, element, attrs) {

                    window.onscroll = function () {

                        if (window.scrollTop <= 0) {
                            document.querySelector(element).style.display = 'none';
                        } else {
                            document.querySelector(element).style.display = "block";
                        }

                    };

                    document.querySelector(element).onclick = function () {
                        //$('html, body').animate({
                        //  scrollTop: 0
                        //}, 'fast');
                    };

                }
            }
        })
        .directive('mySref', $StateRefDirective2);


    $StateRefDirective2.$inject = ['$state', '$stateParams', '$timeout', '$parse', 'base64', 'MyRouter', '$ionicViewSwitcher', '$ionicNativeTransitions', '$rootScope'];
    function $StateRefDirective2($state, $stateParams, $timeout, $parse, base64, MyRouter, $ionicViewSwitcher, $ionicNativeTransitions, $rootScope) {
        var allowedOptions = ['location', 'inherit', 'reload', 'absolute'];

        return {
            restrict: 'A',
            require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
            link: function (scope, element, attrs, uiSrefActive) {
                var ref = parseStateRef(attrs.mySref, $state.current.name);
                var params = null, url = null, base = stateContext(element) || $state.$current;
                // SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
                var hrefKind = Object.prototype.toString.call(element.prop('href')) === '[object SVGAnimatedString]' ?
                    'xlink:href' : 'href';
                var newHref = null, isAnchor = element.prop("tagName").toUpperCase() === "A";
                var isForm = element[0].nodeName === "FORM";
                var attr = isForm ? "action" : hrefKind, nav = true;

                var options = { relative: base, inherit: true };
                var optionsOverride = scope.$eval(attrs.mySrefOpts) || {};

                var myStartCallback = attrs.myStartCallback ? $parse(attrs.myStartCallback) : null;

                var myEndCallback = attrs.myEndCallback ? $parse(attrs.myEndCallback) : null;
                if (myEndCallback) {
                    scope.$on(
                        "$destroy",
                        function (event) {
                            myEndCallback(scope, { ref: ref, params: params, options: options });
                        }
                    );
                }

                var myHistory = null;
                try {
                    myHistory = attrs.myHistory ? JSON.parse(attrs.myHistory) : null;
                } catch (err) {
                    console.log(err);
                }

                var myClearHistory = attrs.myClearHistory ? ((attrs.myClearHistory === "true") || (attrs.myClearHistory === true)) : false;

                angular.forEach(allowedOptions, function (option) {
                    if (option in optionsOverride) {
                        options[option] = optionsOverride[option];
                    }
                });

                var update = function (newVal) {
                    if (newVal) params = angular.copy(newVal);
                    if (!nav) return;

                    newHref = $state.href(ref.state, params, options);

                    var activeDirective = uiSrefActive[1] || uiSrefActive[0];
                    if (activeDirective) {
                        activeDirective.$$addStateInfo(ref.state, params);
                    }
                    if (newHref === null) {
                        nav = false;
                        return false;
                    }
                    attrs.$set(attr, newHref);
                };

                if (ref.paramExpr) {
                    scope.$watch(ref.paramExpr, function (newVal, oldVal) {
                        if (newVal !== params) update(newVal);
                    }, true);
                    params = angular.copy(scope.$eval(ref.paramExpr));
                }
                update();

                if (isForm) return;

                element.bind("click", function (e) {
                    var button = e.which || e.button;
                    if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || element.attr('target'))) {
                        if (myStartCallback)
                            myStartCallback(scope, { ref: ref, params: params, options: options });
                        // HACK: This is to allow ng-clicks to be processed before the transition is initiated:
                        var transition = $timeout(function () {
                            if (!myClearHistory) {
                                params = MyRouter.formatStateParams(params, myHistory);
                            } else {
                                $rootScope.historyBack = ".";
                                $rootScope.historyBackParams = "";
                            }
                            ////////////////////////////////////////
                            $ionicViewSwitcher.nextDirection("forward");
                            if ($ionicNativeTransitions)
                            {
                                $ionicNativeTransitions.stateGo(ref.state, params, options,
                                    {
                                        "type": "slide",
                                        "direction": "left", // 'left|right|up|down', default 'left' (which is like 'next')
                                        "duration": 300, // in milliseconds (ms), default 400
                                    }
                                );
                            }
                            else
                            {
                                $state.go(ref.state, params, options);
                            }
                        });
                        e.preventDefault();

                        // if the state has no URL, ignore one preventDefault from the <a> directive.
                        var ignorePreventDefaultCount = isAnchor && !newHref ? 1 : 0;
                        e.preventDefault = function () {
                            if (ignorePreventDefaultCount-- <= 0)
                                $timeout.cancel(transition);
                        };
                    }
                });
            }
        };
    }


    function parseStateRef(ref, current) {
        var preparsed = ref.match(/^\s*({[^}]*})\s*$/), parsed;
        if (preparsed) ref = current + '(' + preparsed[1] + ')';
        parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);
        if (!parsed || parsed.length !== 4) throw new Error("Invalid state ref '" + ref + "'");
        return { state: parsed[1], paramExpr: parsed[3] || null };
    }

    function stateContext(el) {
        var stateData = el.parent().inheritedData('$uiView');

        if (stateData && stateData.state && stateData.state.name) {
            return stateData.state;
        }
    }
} ());





