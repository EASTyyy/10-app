(function () {
  'use strict';

  angular.module('starter.services')
		.service('Category', Category);
		Category.$inject = ['$http', '$cacheFactory', 'Config'];
		
		function Category($http, $cacheFactory, Config){
			var CATEGORY_API_URL = Config.URL_PREFIX + 'products/';
			
			var _default_params = {
//	        offset: 0,
	        limit: Config.PRODUCT_PAGE_SIZE,
	        is_detail: true
	    };
			
			
			//获取分类列表数据
      this.list = function () {
        return $http.get(CATEGORY_API_URL + 'available_types/',
	        {
	        	cache: getCache()
	        }
        );
      };
      
      
      /**
       * 获取分类详情数据
       * @param limit	请求数量
       * @param type 类别
       * @param sort 排序字段
       * @param order	排序方式
       */
      this.getDetailList = function(offset,limit,type,sort,order){
      	return $http.get(CATEGORY_API_URL,{
					params:{
						offset:offset,
						limit:limit,
						type:type,
						sort:sort,
						order:order
					}
				});
      }
      
      this.getProductList = function(params) {
	        angular.extend(params, _default_params);
	
	        return $http.get(CATEGORY_API_URL, {
	            params: params
	        });
	    }
      
        /**
         * 获取供基础数据使用的cache对象
         */
        function getCache() {
            var cache = $cacheFactory.get("category-data");
            if (!cache) {
                cache = $cacheFactory("category-data");
            }
            return cache;
        }

        /**
         * 删除缓存
         */
        function removeCache(){
            var cache = $cacheFactory.get("category-data");
            if (cache) {
                cache.removeAll();
            }
        }
      
		}
		
} ());

