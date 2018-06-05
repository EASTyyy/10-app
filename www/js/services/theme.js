(function() {
  'use strict';

  angular.module('starter.services')
    .factory('Theme', Theme);

  Theme.$inject = ['$http', 'Config'];

  function Theme($http, Config) {

    var THEME_DETAIL_API_URL = Config.URL_PREFIX + 'products/group_quotes';
    var THEME_LIST_API_URL = Config.URL_PREFIX + 'products/group_types';

    var service = { get: get, list: list };

    return service;


    //获取主题详情数据
    function get(id, offset, limit) {
      offset = offset || 0;
      limit = limit || 100;

      return $http.get(THEME_DETAIL_API_URL, {
        params: {
          tid: id,
          offset: offset,
          limit: limit
        }
      }).then(formatThemeDetailResponse);
    }

    //获取主题列表数据
    function list() {
      return $http.get(THEME_LIST_API_URL).then(formatThemeListResponse);
    }

    //格式化主题详情数据
    function formatThemeDetailResponse(response) {

      console.log('theme-detail', response);

      var data;

      if (!response.data || !response.data.rows || !Array.isArray(response.data.rows)) {
        data = [];
      } else {
        data = response.data.rows.map(function(item) {
          return {
            productId: item.pid,
            name: item.name,
            imageUrl: (item.pictures && item.pictures[0]) ? item.pictures[0].file_url : ''
          }
        });
      }


      return {data: data, status: response.status, config: response.config, headers: response.headers};

    }


    //格式化主题列表数据
    function formatThemeListResponse(response) {

      console.log('theme-list', response);

      var data;

      if (!response.data || !response.data.rows || !Array.isArray(response.data.rows)) {
        data = [];
      } else {
        data = response.data.rows.map(function(item) {
          return {
            id: item.id,
            name: item.name,
            state: item.state,
            sort: item.sort,
            imageUrl: (item.pictures && item.pictures[0]) ? item.pictures[0].file_url : ''
          }
        });
      }

      return {data: data, status: response.status, config: response.config, headers: response.headers};

    }

  }

}());
