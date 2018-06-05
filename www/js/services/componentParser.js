(function () {
    'use strict';

    angular.module('starter.services').factory('ComponentParser', ComponentParser);

    ComponentParser.$inject = [];

    function ComponentParser() {

        var parser = {
            'image': imageParser,                       //图片解析
            'image_list': imagesParser,                 //多图片解析
            'picture_switch': bannerSlideParser,        //banner滑动解析
            'picture_with_products': slideParser,       //slide滑动解析
            'product_list_group_type': listParser,      //专区列表解析
            'date_switch': dateSwitchParser,            //上新组件解析
            'product_list_all': allProductParser        //全部商品
        };

        var services = {
            execute: execute
        };

        return services;


        function execute(item) {

            if (!item.type || !item.params || !parser[item.type]) return null;

            return parser[item.type](item.params);
        }


        function imageParser(params) {
            if (!params) return null;

            return {

                css: params.class,
                items: [
                    {
                        link: params.link,
                        imageUrl: params.image ? params.image.src : '',
                        attr: formatAttr(params.image)
                    }
                ]
            }

            
        }

        function imagesParser(params) {
            if (!params || !params.images || !angular.isArray(params.images)) return null;

            return {
                css: params.class,
                items: params.images.map(function (item) {
                    return {
                        link: item.link,
                        imageUrl: item.image ? item.image.src : '',
                        attr: formatAttr(item.image)
                    }
                })
            }
        }

        function bannerSlideParser(params) {
            if (!params || !params.images || !angular.isArray(params.images)) return null;

            return {
                css: params.class,
                items: params.images.map(function (item) {
                    return {
                        link: item.link,
                        imageUrl: item.image ? item.image.src : '',
                        attr: formatAttr(item.image)
                    }
                })
            }
        }

        function slideParser(params) {
            if (!params) return null;

            return {
                css: params.class,
                link: params.link,
                imageUrl: params.image ? params.image.src : '',
                data: params.pid_list,
                attr: formatAttr(params.image)
            }
        }

        function listParser(params) {
            if (!params) return null;

            return {
                groupId: params.product_group_type_id,
                css: params.class
            }
        }

        function dateSwitchParser(params) {
            if (!params || !params.dates || !angular.isArray(params.dates)) return null;
            return {
                css: params.class,
                title: {
                    css: params.header_image_class,
                    imageUrl: params.image ? params.image.src : '',
                    attr: formatAttr(params.image)
                },
                data: params.dates.map(function (item, index) {
                    return {
                        time: item.time,
                        text: item.text,
                        date: (function (time) {
                            if (!time) return '';

                            var date = new Date(time * 1000);
                            return {
                                'month': date.getMonth() + 1,
                                'day': date.getDate()
                            }
                        })(item.time)
                    }
                }),
                zone: params.product_type,
                listCSS: params.dates_class
            }
        }

        function allProductParser(params) {
            if (!params) return null;
            return {
                css: params.class
            }
        }

        function formatAttr(url) {
            if (!url || !url.size || !url.size.width || !url.size.height)
                return { className: '', style: '' };

            var w = url.size.width;
            var h = url.size.height;

            if (!angular.isNumber(w) || !angular.isNumber(h) || w === 0 || h === 0)
                return { className: '', style: '' };

            return { className: 'img-fill-space', style: 'padding-top:' + (100 * h / w) + '%;' };
        }


    }

} ());

