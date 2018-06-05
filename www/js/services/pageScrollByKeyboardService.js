(function () {
    'use strict';

    angular.module('starter.services')
        .factory('scrollByKeyboard', scrollByKeyboard);

        function scrollByKeyboard() {

            var service = {
                upPage: upPage,
                downPage: downPage
            };

            return service;

            /*
             *@byHideclassName 被键盘覆盖的元素的class
             *@occupyFocusClassName 占位用的元素的class 写在页面最后面
             */
            function upPage(byHideclassName, occupyFocusClassName) {
                if(byHideclassName !== '' && ionic.Platform.isAndroid() && occupyFocusClassName !== '') {
                    var height = parseInt(window.screen.height) - parseInt(document.getElementsByClassName(byHideclassName)[0].offsetTop);
                    document.getElementsByClassName(occupyFocusClassName)[0].style.height = height + 'px';
                }
            }

            function downPage(occupyFocusClassName) {
                if(occupyFocusClassName !== '' && ionic.Platform.isAndroid()) {
                    document.getElementsByClassName(occupyFocusClassName)[0].style.height = '0px';
                }
            }
        }

} ());
