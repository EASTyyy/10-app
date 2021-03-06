(function () {
    'use strict';

    window.GlobalConfig = {
        DPLUS_SITE_TOKEN: 'db160481aa494ce5f72b'
    };

    app.constant('Config',
        {
            /**
             * activity template url
             */
            TEMPLATE_URL_PREFIX: 'https://yilinstyle.img-cn-hangzhou.aliyuncs.com/client/template/',

            /**
             * service url
             */
            SERVICE_URL: "https://yilinstyle.udesk.cn/im_client/",

            /**
             * Loading效果的延迟出现时间
             */
            LOADING_DELAY: 200,

            /**
             * 地址格式的正则表达式
             */
            MOBILE_PHONE_FORMAT_REGEX: /^(0|86|17951)?(13[0-9]|15[0-9]|17[0-9]|18[0-9]|14[57])[0-9]{8}$/,

            /**
             * 用户密码的正则表达式
             */
            PASSWORD_FORMAT_REGEX: /^[a-zA-Z0-9]{6,16}$/,

            /**
             * API访问地址
             */
            URL_PREFIX: 'https://app.yilinstyle.com/api/app/',

            // 数据埋点服务器
            REPORT_URL: "http://report.yilinstyle.com",

            /**
             * 上新页面默认显示商品数
             */
            PRODUCT_PAGE_SIZE: 20,

            /**
             * 首页预加载的商品数
             */
            HOME_PAGE_PRODUCT_PAGE_SIZE: 10,

            /**
             * 爆款页面未认证通过时显示商品数
             */
            HOT_PRODUCT_PAGE_SIZE_NO_AUTH: 6,

            /**
             * 小b审核功能开关
             */
            APPLY_USER_AUTHENTICATION: true,

            /**
             * 用户头像尺寸
             */
            IMAGE_SIZE_USER_AVATOR: [325, 325],

            /**
             * 图片文件上传最大尺寸限制
             */
            MAX_UPLOAD_FILE_SIZE: 2097152,

            /**
             * 图片验证码功能开关
             */
            APPLY_CAPTCHA: true,

            /**
             * 钱包充值上限
             */
            WALLET_MAX_RECHARGE_AMOUNT: 50000,

            /**
             * 充值的时候默认支付方式, wechat或alipay
             */
            DEFAULT_RECHARGE_PAYMENT_TYPE: 'wechat',

            /**
             * 优惠券未使用单页数量限制
             */
            COUPON_UNUSED_LIMIT: 10,

            /**
             * 过期优惠券展示数量限制
             */
            COUPON_EXPIRED_LIMIT: 5,

            /**
             * 使用过的优惠券展示数量限制
             */
            COUPON_USED_LIMIT: 20,

            /**
             * 未使用过期优惠券保留时间
             */
            COUPON_UNUSED_SAVE_TIME: 3600 * 24 * 30,

            /**
             * 使用过的优惠券保留时间
             */
            COUPON_USED_SAVE_TIME: 3600 * 24 * 30 * 3,

            /**
             * 预售订单可以可以取消的时间
             */
            SCHEDULE_ORDER_CAN_CANCEL_TIME: 7 * 24 * 60 * 60,

            /**
             * 后台唤起检测更新的时间间隔，目前是 1h
             */
            CHECK_UPDATE_TIME: 60 * 60 * 1000,

            /**
             * 启动页的图片展示最短时间，目前是3s
             */
            SPLASH_SCREEN_DURATION: 3 * 1000,

            /**
             * android apk更新地址
             */
            ANDROID_UPDATE_URL: "https://www.yilinstyle.com/download",

            /**
             * ios ipa更新地址
             */
            IOS_UPDATE_URL: "https://www.yilinstyle.com/download",

            /**
             * 默认用户名
             */
            USER_DEFAULT_NAME: '10时尚',

            /**
             * 版本信息的文件地址（相对于www目录）
             */
            VERSION_FILE: "scm_info.json",

            /**
             * 是否显示商品活动属性
             */
            SHOW_PRODUCT_ATTRIBUTE: true,

            /**
	         * 分享域名
             */
            SHARE_HOSTNAME: "http://app.yilinstyle.com/share"
        }
    );


} ());
