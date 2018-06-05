(function () {
    'use strict';

    app.constant('ORDER_TYPE', {
        Normal: 0x00000000,
        Presale: 0x00000001
    });

    app.constant('SKU_STATE', {
        normal: 0x00000000, // 正常sku
        offsale: 0x00000001 // 下架sku
    });

    app.constant('SALE_STATE', {
        normal: 0x00000000, // 正常sale
        offsale: 0x00000001 // 下架sale
    });

    app.constant('RETURN_STATE_KEY', {
        CheckPending: 0x00000000,
        WaitGoods: 0x00000001,
    });

    app.constant('RETURN_STATE', {
        0x00000000: "待审核",
        0x00000001: "已同意退货",
        0x00000002: "已退款",
        0x00000003: "已关闭"
    });

    app.constant('ORDER_STATUS', {
        toBePaid: [0x00000000, 0x00000010],             //待支付
        toSendTheGoods: [0x00000020, 0x00000040, 0x00000400],       //待发货
        express: [0x00000080],                          //待收货
        completed: [0x00000100],                        //已完成
        canceled: [0x00000200],                         //已取消
        waitingForRefund: [0x00001000],                 //待退款
        refunded: [0x00002000]                          //已退款
    });

    app.constant('ORDER_STATUS_DISPLAY', {
        0x00000000: '待支付',
        0x00000010: '待支付',
        0x00000020: '待发货',
        0x00000040: '待发货',
        0x00000400: '待发货',
        0x00000080: '待收货',
        0x00000100: '已完成',
        0x00000200: '已取消',
        0x00001000: '待退款',
        0x00002000: '已退款'
    });

    app.constant('ORDER_PAY_TYPE', {
        0x00000000: '现金支付',
        0x00000001: '微信支付',
        0x00000002: '支付宝'
    });

    app.constant('PRODUCT_FLAG', {
        Normal: 0x00000000,
        Presale: 0x00000001
    });

    app.constant('RUNNING_ACCOUNT_TYPE', {
        0x00000000: '全部明细',
        0x00000001: '充值',
        0x00000002: '提现',
        0x00000004: '支付',
        0x00000008: '退款',
        0x00000010: '退款',
        0x00000020: '提现失败'
    });

    app.constant('IMAGE_PARAMS', '@70q.jpg');

    app.constant('IMAGE_SIZE', {
        LIST: {
            width: 370,
            height: 460
        },
        ORDER: {
            width: 200,
            height: 249
        },
        ORDER_MD: {
            width: 150,
            height: 150
        },
        ORDER_SM: {
            width: 80,
            height: 80
        },
        PRODUCT_DETAIL: {
            width: 750,
            height: 950
        }
    });

    app.constant('IMAGE_MODE', (function (params) {
        var provider = 'ali';

        return {
            LIST: getImageParams(provider, 1, 370, 460),
            ORDER: getImageParams(provider, 1, 200, 249),
            ORDER_MD: getImageParams(provider, 1, 150, 150),
            ORDER_SM: getImageParams(provider, 1, 80, 80),
            PRODUCT_DETAIL: getImageParams(provider, 0, 750, 950),
        }
    })()
    );

    function getImageParams(provider, mode, width, height) {

        if (provider === 'qiniu') {
            return '?imageView2/' + mode + '/w/' + width + '/h/' + height;
        }

        if (provider === 'ali') {
            //   return '@' + width + 'w_' + height + 'h_70Q.jpg';
            return '@70Q.jpg';
        }
    }

    app.constant('ADDRESS_STATUS', {
        NORMAL_ADDRESS: 0x00000000,
        DEFAULT_ADDRESS: 0x00000001
    })

    app.constant('COUPON_CONSTANT', {
        KEY: {
            USED: 'USED',
            UNUSED: 'UNUSED'
        },
        STATUS: {
            UNUSED: 0x00000000,
            USED: 0x00000001,
            EXPIRED: 0x00000002
        },
        STATUS_DISPLAY: {
            0x00000000: '未使用',
            0x00000001: '已使用',
            0x00000002: '已过期'
        },
        TYPE: {
            ALL: 0x00000000
        },
        TYPE_DISPLAY: {
            0x00000000: '全品类'
        },
        FLAG: {
            NORMAL: 0x00000000,
            LOGIN: 0x00000001,
            RANDOM: 0x00000002
        }
    });

    app.constant('MESSAGE_TYPE', {
        NOTIFY: 1000,
        NOTIFY_USERAUTHENTICATION_FAIL: 1001,
        NOTIFY_USERAUTHENTICATION_SUCCESS: 1002,
        REMIND: 2000,
        REMIND_LASTFIVEMINUTE_TOPAY: 2001,
        REMIND_FAVORITEPRODUCT_RESTOCKED: 2002,
        REMIND_FAVORITEPRODUCT_CANPREORDER: 2003

    });

    app.constant('USERAUTHENTICATION_FLAG', {
        NORMAL: 0x00000000,
        EXAMINE: 0x00000001,
        WARNING: 0x00000002,
        LOCKING: 0x00000004,
        SELLER: 0x00000010,
        WORKER: 0x00000020,
        MANAGER: 0x00000100
    });

    app.constant('RECEIVE_MESSAGE', {
        KEY: {
            NewMessage: 'NewMessage',
            AuthenticationStateChanged: 'AuthenticationStateChanged'
        },
        VALUE: {
            NewMessage: true,
            AuthenticationStateChanged: 'True'
        }
    });

    app.constant('FILE_STATE', {
        TEMPERARY: 0x00000000,
        PERMANENT: 0X00000001
    });

    app.constant('ACCOUNT_TOKEN_CODE', {
        ACCOUNT_INVALIDATE_TOKEN: -10101,    //令牌无效
        ACCOUNT_OVERDUE_TOKEN: -10102,    //令牌已过期
        ACCOUNT_LOGIN_OCCUPIED_TOKEN: -10103    //令牌被抢占登入
    });

    app.constant('USER_DEFAULT_INFO', {
        AVATOR: 'img/my_10.jpg'
    });

    app.constant('HTTP_CACHE_PARAMS', {
        MAX_AGE: 60 * 1000,
        DELETE_ON_EXPIRE: 'aggressive',
    });

    app.constant('BANK_TYPE', {
        1: "中国银行",
        2: "中国工商银行",
        3: "中国农业银行",
        4: "中国建设银行",
        5: "招商银行",
        6: "交通银行",
        7: "中信银行",
        8: "上海浦东发展银行",
        9: "中国民生银行",
        10: "平安银行",
        11: "中国光大银行",
        12: "华夏银行"
    });

    app.constant('STATISTICS_FLAG_NAME', {
        VIDEO_FLAG: 'video_flag',
        SEARCH_FLAG: 'search_flag'
    });


    app.constant('STATISTICS_EVENT_NAME', {
        LOGIN: '登录',
        ADD_TO_CART: '加入购物车',
        ADD_TO_CART_FROM_VIDEO: '视频页加入购物车',
        ADD_TO_CART_FROM_SEARCH: '搜索加入购物车',
        REMOVE_ITEM: '删除购物车',
        COLLECTION: '收藏',
        CANCEL_COLLECTION: '取消收藏',
        CREATE_ORDER: '下订单',
        CREATE_ORDER_FROM_VIDEO: '视频页创建订单',
        CREATE_ORDER_FROM_SEARCH: '视频页创建订单',
        ORDER_CANCEL: '取消订单',
        VIDEO_CLICK_NUM: '视频点击',
        SEARCH: '搜索'
    });
} ());
