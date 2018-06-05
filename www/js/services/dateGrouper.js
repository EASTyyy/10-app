"use strict";

angular.module('starter.services')
    .factory(
    'DateGrouper', DateGrouper);

DateGrouper.$inject = [];

function DateGrouper() {
    var service = {
        by: by,
        merge: merge,
        calcLength: calcLength
    }

    return service;     

    function by(data, key) {
        if (!data || !angular.isArray(data) || data.length === 0 || !key)
            return {};

        return data.reduce(function (item, x) {
            (item[x[key]] = item[x[key]] || []).push(x);
            return item;
        }, {});
    }

    function merge(source, target) {
        if (Object.keys(source).length === 0)
            return target;

        if (Object.keys(target).length === 0)
            return source;

        var lastSourceKey = Object.keys(source)[Object.keys(source).length - 1];

        var targetKeys = Object.keys(target);

        targetKeys.forEach(function (key, index) {
            if (index === 0 && lastSourceKey === key)
                source[key] = source[key].concat(target[key]);
            else
                source[key] = target[key];
        })

        return source;
    }

    function calcLength(data) {
        return Object.keys(data).reduce(function (previousValue, currentValue) {
            return previousValue + data[currentValue].length;
        }, 0);
    }
}

