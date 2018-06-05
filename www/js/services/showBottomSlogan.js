(function () {
    'use strict'; .0
        .toExponential0

    angular.module("starter.services")
        .factory("showBottomSlogan", showBottomSlogan);

    showBottomSlogan.$inject = ['$ionicScrollDelegate'];

    function showBottomSlogan($ionicScrollDelegate) {

        var HAS_TAB_CLASS_NAME = "has-tabs";
        var TAB_HEIGHT = 49;

        var services = {
            get: get
        };

        return services;

        function get(hasMoreData, scrollName, className, distance) {

            if (hasMoreData) return { state: false };


            distance = distance || 20;

            var content = 'ion-view[nav-view="active"] ion-content[delegate-handle="' + scrollName + '"]';

            var content = document.querySelector(content);

            if (!content)
                return { state: false };

            var element = content.querySelector('.' + className);

            if (!element || element.children.length < 3) return { state: false }; //如果子元素小于3个不显示，防止数据加载过程中显示

            return {
                state: content.getBoundingClientRect().bottom > element.getBoundingClientRect().bottom + distance
            }
        }
    };
} ());

