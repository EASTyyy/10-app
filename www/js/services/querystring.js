(function () {
    'use strict';

    angular.module('starter.services')
        .factory('queryString', queryString);

    function queryString() {

        var params = {};

        return {
            parse: parse
        }

        function parse() {
            if (window.location.search.length > 1) {
                for (var aItKey, nKeyId = 0, aCouples = window.location.search.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
                    aItKey = aCouples[nKeyId].split("=");
                    params[unescape(aItKey[0])] = aItKey.length > 1 ? buildValue(unescape(aItKey[1])) : null;
                }
            }

            return params;
        }

        function buildValue(sValue) {
            if (/^\s*$/.test(sValue)) { return null; }
            if (/^(true|false)$/i.test(sValue)) { return sValue.toLowerCase() === "true"; }
            if (isFinite(sValue)) { return parseFloat(sValue); }
            if (isFinite(Date.parse(sValue))) { return new Date(sValue); } // this conditional is unreliable in non-SpiderMonkey browsers
            return sValue;
        }

    }
} ());