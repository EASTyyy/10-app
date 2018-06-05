(function() {
    "use strict";

    angular.module("starter.services")
        .factory("VersionDialog", VersionDialog);

    VersionDialog.$inject = ["$rootScope", "$document", "$compile"];

    function VersionDialog($rootScope, $document, $compile) {
        var template = '<div class="version-dialog">' +
            '<div class="bg"></div>' +
            '<div class="wrapper">' +
            '<div><img src="img/new_version.png"></div>' +
            '<button type="button" class="button button-radius confirm" ng-click="onDownloadVersionClick();">确认</button>' +
            '</div>' +
            '</div>';

        return {
            show: _show,
            hide: _hide
        };


        function _show(scope) {
            scope = scope || $rootScope;
            $document.find('body').append($compile(template)(scope));
        }

        function _hide(){
            var node = document.querySelector("body .version-dialog");
            document.querySelector("body").removeChild(node);
        }

    }
}());
