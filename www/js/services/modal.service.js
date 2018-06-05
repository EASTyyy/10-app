/**
 * Created by lujin on 2016/9/26.
 */
(function(){
    "use strict";

    angular.module('starter.services')
        .factory('ModalService', ModalService);

    ModalService.$inject = ["$ionicModal", "SKU_STATE", "Cart", "$timeout", "toast", "MyRouter", "$rootScope"];

    function ModalService($ionicModal, SKU_STATE, Cart, $timeout, toast, MyRouter, $rootScope){
        var _local_scope;
        var _local_modal_name;
        var _local_product_id;
        var _local_hidden_event;
        var _params;

        return {
            initProductChooseModal: _initProductChooseModal,
            modalHide: hide,
            modalShow: show,
            getModal: _getModal,
            modalDestroy: _modalDestroy
        };

        function _getModal(){
            return _local_scope[_local_modal_name];
        }

        function _modalDestroy(){
            var modal = _getModal();
            if(modal) {
                modal.remove();
            }
        }

        function _initProductChooseModal(product, productId, modalName, scope, autoDestroy, params){
            if(!modalName){
                modalName = "modal";
            }
            if(autoDestroy!=false){
                autoDestroy = true;
            }
            _local_scope = scope;
            _local_modal_name = modalName;
            _local_product_id = productId;
            _params = params;
            _initProductScope(product, scope);
            _bindScopeFunction(scope);
            return $ionicModal.fromTemplateUrl('js/page/product-choose/product-choose.template.html', {
                scope: scope,
                backdropClickToClose: true,
                animation: 'slide-in-up'
            }).then(function (modal) {
                if(autoDestroy) {
                    // 当隐藏的模型时执行动作
                    _local_hidden_event = scope.$on('modal.hidden', function () {
                        _local_hidden_event();
                        // 执行动作
                        _modalDestroy();
                    });
                }
                scope[modalName] = modal;
            });


        }

        function _initProductScope(product, scope) {
            scope.product = product;

            var price = scope.product.price;
            if(price){
                var prices = price.toString().split('.');
                scope.firstPrice = (prices[0]||0).toString();
                scope.lastPrice = '00';
                if(prices.length>1){
                    scope.lastPrice = prices[1];
                }
            }

            // 获取轮播图的第一张图片作为sku默认的封面图
            if(product.pictures &&  product.pictures.length > 0) {
                scope.defaultPic = product.pictures[0].file_url;
            }

            scope.isBuyImmediately = _params && _params.type == 'immediate';

            //搭配购页面的按钮
            scope.isMatchProduct = _params && _params.isMatchProduct != null && _params.isMatchProduct;

            scope.skuAttributes = _initProductAttrs(scope, product);

            scope.isOrder = (product.flag & 1) && product.stock <= 0;
            //
            //// 根据是否为预购商品来判断是否过滤掉无库存sku
            //if(!scope.isOrder) {
            //    scope.skuAttributes = _filterSkuEmptyStock(scope.skuAttributes);
            //}
            // 颜色属性
            scope.colorAttributes = _correctColorAttributes(product, _filterColorAttr(scope.skuAttributes));

            // 初始化选择页面中的变量
            if(scope.colorAttributes) {
                var length = scope.colorAttributes.length;
                for(var i=0; i < length; i++){
                    if(scope.isOrder || scope.colorAttributes[i].hasSkuStock){
                        onColorBtnClick(scope.colorAttributes[i]);
                        break;
                    }
                }
            }

            // 计算选中的商品数量
            scope.selectProductCount = _getSelectProductCount(scope.skuAttributes);
        }

        /**
         * 调整颜色属性为正确顺序
         * @param product
         * @param colorAttributes
         * @returns {Array}
         * @private
         */
        function _correctColorAttributes(product, colorAttributes){
            if(!product || !product.attribute || !angular.isArray(colorAttributes) || colorAttributes.length == 0) return [];

            var colorOptions = [],
                leadingAttributes = [],
                CorrectSkuAttributes = [],
                LEADING_ATTRIBUTE_CONSTANT = 8;

            leadingAttributes = product.attribute.filter(function(item){
                return (item.id === 1) || ((item.flag & LEADING_ATTRIBUTE_CONSTANT) != 0);
            });

            if(leadingAttributes.length == 0 || !angular.isArray(leadingAttributes[0].options)) return [];

            CorrectSkuAttributes = leadingAttributes[0].options.map(function(option){
                return {
                    id: option.id,
                    name: option.name
                }
            });

            CorrectSkuAttributes.forEach(function(attr){
                colorAttributes.forEach(function(item){
                    if(item.id === attr.id){
                        colorOptions.push(item);
                    }
                })
            });
            return colorOptions;
        }

        function _bindScopeFunction(scope) {
            scope.onProductAddToCartBtnClick = onProductAddToCartBtnClick;
            scope.onOrderProductClick = onOrderProductClick;

            //搭配选择
            scope.onMatchProductClick = onMatchProductClick;

            scope.onHideModalBtnClick = onHideModalBtnClick;
            scope.onQuantityAddClick = onQuantityAddClick;
            scope.onQuantitySubClick = onQuantitySubClick;
            scope.onColorBtnClick = onColorBtnClick;
            scope.couldBeSelected = couldBeSelected;
            // filter
            scope.orderByOptionId = orderByOptionId;
            scope.hasNoMoreStock = hasNoMoreStock;
        }

        /**
         * 初始化商品颜色属性
         * @param scope
         * @param product
         * @returns {Array}
         * @private
         */
        function _initProductAttrs(scope, product) {
            var res = [];
            if(product.skuInfo && product.skuInfo.length > 0) {
                product.skuInfo.filter(function(sku) {
                        // 过滤掉下架商品和没有销售信息的商品
                        return sku.state === SKU_STATE.normal;
                    })
                    .forEach(function(sku) {

                        var alreadySelectedMatchProAmount = 0;
                        if(_params && _params.isMatchProduct != null && _params.isMatchProduct && _params.alreadySelectedPro != undefined) {
                            _params.alreadySelectedPro.forEach(function(item) {
                                if(sku.sid === item.sid) {
                                    alreadySelectedMatchProAmount = item.amount;
                                }
                            });
                        }

                        var attr = sku.attribute;
                        attr.forEach(function(item){
                            item.weight = 0;
                            if(Cart.isLeadingAttribute(product, item.attr)){
                                item.weight += 1;
                            }
                        });
                        attr.sort(function(a, b) {
                            return b.weight - a.weight;
                        });
                        var stock = _getStock(sku.sale_infos);
                        try {
                            var item = {
                                id: attr[0].id,
                                name: attr[0].name,
                                sizeId: attr[1].id,
                                sizeName: attr[1].name,
                                stock: stock,
                                hasStock: stock > 0,
                                hasSkuStock: _hasSkuStock(attr[0].id, product),
                                isActive: false,
                                state: sku.state,
                                price: sku.selling_price,
                                picUrl: _filterPicUrl(sku) ? {default: false, url: _filterPicUrl(sku)} : {default: true, url: scope.defaultPic},
                                quantity: alreadySelectedMatchProAmount,
                                displayQuantity: alreadySelectedMatchProAmount,
                                skuId: sku.sid
                            };
                            res.push(item);
                        } catch(e) {
                            console.log(e);
                        }
                    });
            }
            return res;
        }

        /**
         * 判断当前sku是否有库存
         * @param optionId
         * @param product
         * @returns {boolean}
         * @private
         */
        function _hasSkuStock(optionId, product) {

            if (!product || !product.skuInfo)
                return false;

            var filterSku = product.skuInfo.filter(function (sku) {

                var options = sku.attribute.map(function (option) {
                    return option.id;
                });

                return options.indexOf(optionId) !== -1;
            });

            if (!filterSku)
                return false;

            var hasStockSku = filterSku.filter(function (sku) {
                if (!sku.sale_infos)
                    return false;


                var stocks = sku.sale_infos.map(function (sale) {
                    return sale.amount;
                });

                if (stocks.length === 0)
                    return false;

                var sum = stocks.reduce(function (a, b) {
                    return a + b;
                });

                return sum > 0;
            });

            return hasStockSku.length > 0;
        }

        /**
         * 过滤没有库存的sku
         * @param specifications
         * @returns {*}
         * @private
         */
        function _filterSkuEmptyStock(specifications) {
            return specifications.filter(function(spe) {
                return spe.hasStock;
            })
        }

        /**
         * 过滤颜色属性
         * @param attr
         * @returns {Array}
         * @private
         */
        function _filterColorAttr(attr) {
            if(attr && attr.length > 0) {
                return _unique(attr).map(function(item) {
                    return {
                        id: item.id,
                        name: item.name,
                        isActive: item.isActive,
                        hasStock: item.hasStock,
                        hasSkuStock: item.hasSkuStock
                    }
                })
            } else {
                return [];
            }
        }

        /**
         * 合并数组skuAttributes中有相同id的项
         * @param arr
         * @returns {Array}
         * @private
         */
        function _unique(arr) {
            var result = [],
                hash = {};
            for(var i = 0, elem;
                (elem = arr[i]) != null; i++) {
                if(!hash[elem.id]) {
                    result.push(elem);
                    hash[elem.id] = true;
                }
            }
            return result;
        }

        /**
         * 获取选中的商品的数量
         * @param allAttrSpecs
         * @returns {*}
         * @private
         */
        function _getSelectProductCount(allAttrSpecs) {
            return allAttrSpecs.filter(function(item) {
                return item.quantity > 0;
            }).map(function(item) {
                return item.displayQuantity;
            }).reduce(function(a, b) {
                return a + b;
            }, 0)
        }

        /**
         * 根据颜色属性id过滤sku
         * @param specifications
         * @param attrId
         * @returns {*}
         * @private
         */
        function _filterSku(specifications, attrId) {
            if(specifications && specifications.length > 0) {
                return specifications.filter(function(item) {
                    return item.id === attrId;
                });
            } else {
                return [];
            }
        }

        /**
         * 计算sku库存(可以包括多个仓库的和)
         * @param saleInfo
         * @returns {*}
         * @private
         */
        function _getStock(saleInfo) {
            if(saleInfo && saleInfo.length > 0) {
                return saleInfo.map(function(sale) {
                    return sale.amount;
                }).reduce(function(a, b) {
                    return a + b;
                }, 0);
            } else {
                return 0;
            }
        }

        /**
         * 筛选当前sku首图URL
         * @param sku: 当前商品sku信息
         * @returns {*}
         * @private
         */
        function _filterPicUrl(sku) {
            if(!sku || !sku.pictures || sku.pictures.length === 0) {
                return '';
            } else {
                return _filterCurrentPic(sku.pictures)
            }
        }

        /**
         * 筛选当前颜色对应图片
         * @param pictures: 待筛选的图片数组
         * @returns {*}
         * @private
         */
        function _filterCurrentPic(pictures) {

            if(pictures && pictures.length > 0) {
                for(var i = 0, len = pictures.length; len > 0; i++) {
                    if(pictures[i].file_url) {
                        return pictures[i].file_url;
                    }
                }
            }
            return "";
        }

        /**
         * 获取选中的商品列表
         * @returns {Array.<T>}
         * @private
         */
        function _getSelectProduct(skuAttributes) {
            return skuAttributes.filter(function(item) {
                    return item.quantity > 0;
                })
                .map(function(specification) {
                    return {
                        productId: _local_product_id,
                        sid: specification.skuId,
                        amount: specification.quantity,
                        flag: 1
                    };
                });
        }

        /**
         * 获取预售的商品列表
         * @returns {Array.<T>}
         * @private
         */
        function _getSelectOrderProduct(skuAttributes) {
            return skuAttributes.filter(function(item) {
                    return item.quantity > 0;
                })
                .map(function(specification) {
                    return {
                        attrName: specification.name,
                        attrId: specification.id,
                        sid: specification.skuId,
                        amount: specification.quantity,
                        price: specification.price,
                        flag: 1,
                        size: specification.sizeName,
                        picUrl: specification.picUrl || ""
                    }
                })
        }

        /**
         * 添加商品到购物车
         * @param scope:
         * @param data: 需要添加的商品信息
         */
        function _addProductToCart(scope, data) {
            var count = data.reduce(function(a, b) {
                return a + b.amount;
            }, 0);

            Cart.addProductToCart(data)
                .then(function() {
                    hide().then(function(){
                        scope.isProductMove = true;
                        $timeout(function() {
                            scope.isProductMove = false;
                            scope.cartProductCount += count;
                            toast.show({
                                isShakeAnimate: true,
                                title: '已加入购物袋'
                            });
                            _resetSelectProduct(scope);
                        }, 500)
                    });
                })
                .catch(function() {
                    toast.show({
                        isShakeAnimate: true,
                        title: '加入购物袋失败'
                    });
                })
        }

        /**
         * 重置选中的商品数量为0
         * @private
         */
        function _resetSelectProduct(scope) {
            _local_scope.selectProductCount = 0;
            if(scope.skuAttributes) {
                scope.skuAttributes.map(function(item) {
                    item.quantity = 0;
                    item.displayQuantity = 0;
                });
            }
        }

        function hide(){
            var modal = _getModal();
            if(modal) {
                return modal.hide();
            }
        }

        function show(){
            var modal = _getModal();
            if(modal) {
                return modal.show();
            }
        }

        /**
         * 设置颜色
         * @param option: 当前颜色信息
         */
        function onColorBtnClick(option) {
            var scope = _local_scope;
            if(option.isActive || !(scope.isOrder || option.hasSkuStock))
                return;

            if(scope.colorAttributes) {
                scope.colorAttributes.forEach(function(attr) {
                    attr.isActive = false;
                });
            }

            option.isActive = true;
            scope.sizeAttributes = _filterSku(scope.skuAttributes, option.id);
            //todo 图片可能有问题,因为需要选择当前选中的颜色属性的第一个有图片的地
            var hasPicSkuItems = filterHasPicSku(scope.sizeAttributes);
            if(!angular.isArray(hasPicSkuItems) || (hasPicSkuItems[0] && !hasPicSkuItems[0].picUrl)) return;

            scope.pictureUrl = hasPicSkuItems.length > 0 ? hasPicSkuItems[0].picUrl.url : scope.defaultPic;
        }

        /**
         * 过滤含有图片的sku
         * @param attrs
         * @returns {*}
         */
        function filterHasPicSku(attrs){
            if(!attrs || !angular.isArray(attrs)) return;

            return attrs.filter(function(item){
                if(!item.picUrl) return false;

               return !item.picUrl.default;
            });
        }

        /**
         * 选中商品添加至购物车
         */
        function onProductAddToCartBtnClick() {
            if(_local_scope.selectProductCount <= 0) {
                toast.show({
                    isShakeAnimate: true,
                    title: '商品数量不可为空'
                });
                return
            }

            _addProductToCart(_local_scope, _getSelectProduct(_local_scope.skuAttributes));
        }

        /**
         * 预约购买的点击响应事件
         */
        function onOrderProductClick() {
            if(_local_scope.selectProductCount <= 0) {
                toast.show({
                    isShakeAnimate: true,
                    title: '商品数量不可为空'
                });
                return
            }
            var res = _getSelectOrderProduct(_local_scope.skuAttributes);

            var product = {
                productId: _local_product_id,
                productName: _local_scope.product.name,
                isBuyImmediately: _local_scope.isBuyImmediately,
                data: res
            };

            // 清除缓存中记录的选中的商品数量
            _local_scope.skuAttributes.map(function(sku) {
                sku.displayQuantity = 0;
                sku.quantity = 0;
            });
            _local_scope.selectProductCount = 0;
            // 关闭商品选择框
            hide()
                .then(function(){
                    MyRouter.gotoStateDirectly("confirmation", {
                        product: product
                    });
                });
        }

        /**
         * 选择搭配购买的点击响应事件
         */
        function onMatchProductClick() {
            var num = 0;
            if(_local_scope.selectProductCount <= 0) {
                toast.show({
                    isShakeAnimate: true,
                    title: '商品数量不可为空'
                });
                return
            }
            var data =  _local_scope.skuAttributes.filter(function(item) {
                            return item.quantity > 0;
                        }).map(function(specification) {
                            num += specification.quantity;
                            return {
                                attrName: specification.name,
                                attrId: specification.id,
                                sid: specification.skuId,
                                amount: specification.quantity,
                                price: specification.price,
                                flag: 1,
                                size: specification.sizeName,
                                picUrl: specification.picUrl || "",
                                totalNum: num,
                                pid: _local_product_id
                            }
                        })
            $rootScope.$broadcast("checkBackMatchProsData", {data: data});

            // 清除缓存中记录的选中的商品数量
            _local_scope.skuAttributes.map(function(sku) {
                sku.displayQuantity = 0;
                sku.quantity = 0;
            });
            _local_scope.selectProductCount = 0;
            // 关闭商品选择框
            hide()
        }

        /**
         * 添加商品数量
         * @param specification: 当前商品信息
         */
        function onQuantityAddClick(specification) {
            if(!couldBeSelected(specification) || hasNoMoreStock(specification))
                return;

            specification.displayQuantity = ++specification.quantity;
            _local_scope.selectProductCount++;
        }

        /**
         * 减少商品数量
         * @param specification: 当前商品信息
         */
        function onQuantitySubClick(specification) {
            if(specification.quantity === 0 || !couldBeSelected(specification))
                return;

            specification.displayQuantity = --specification.quantity;
            _local_scope.selectProductCount--;
        }


        /**
         * 将sku根据当前的attributeId排序
         * @param specification: 当前商品信息
         * @returns {*}
         */
        function orderByOptionId(specification) {

            if(specification && specification.attributeId && specification.attributeId[0])
                return specification.attributeId[0];

            return Math.pow(2, 53) - 1;
        }


        function onHideModalBtnClick(){
            hide();
        }

	    /**
         * 当前sku可以被选择
         * @param spec
         * @returns {*}
         */
        function couldBeSelected(spec){
            if(!spec) return false;

            return _local_scope.isOrder || spec.hasStock;
        }

	    /**
         * 正常商品选择数量大于等于库存的情况
         * @param spec
         * @returns {*}
         */
        function hasNoMoreStock(spec){
            if(!spec) return true;

            return !_local_scope.isOrder && (spec.hasStock && spec.quantity >= spec.stock)
        }
    }
}());
