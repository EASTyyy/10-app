angular.module(
    '10Style',
    [
        'ionic',
        '10Style.home',
        '10Style.activity',
        '10Style.search',
        '10Style.search-result',
        '10Style.category',
        '10Style.category-detail',
        '10Style.discovery',
        '10Style.message',
        '10Style.wallet',
        '10Style.recharge',
        '10Style.running-account',
        '10Style.user-authentication',
        '10Style.recharge-faq',
        '10Style.cart',
        '10Style.confirm',
        '10Style.order-detail',
        '10Style.express-detail',
        '10Style.product',
        '10Style.login',
        '10Style.register',
        '10Style.password',
        '10Style.user-info',
        '10Style.userInfo-updateName',
        '10Style.help-center',
        '10Style.after-sales-application',
        '10Style.payment',
        '10Style.express-application',
        '10Style.return-goods-application',
        '10Style.my',
        '10Style.address',
        '10Style.address-create',
        '10Style.order-list',
        '10Style.favorite',
        '10Style.address-update',
        '10Style.address-choose',
        '10Style.coupon',
        '10Style.coupon-manual',
        '10Style.tab',
        '10Style.customer-service',
        '10Style.helper',
        '10Style.about-us',
        '10Style.set-up',
        '10style.accountSafeChose',
        '10style.accountSafeChangePass',
        '10style.accountSafeChangePhone',
        '10Style.match-pruducts',


        '10Style.withdraw-cash',
        '10Style.withdrawals-info-update',
        '10Style.withdrawals-phone-verification',
        '10Style.withdrawals-manual',
        '10Style.withdrawals-detail',
        '10Style.live-detail',
        'starter.controllers', 'starter.services', 'starter.directives', 'starter.filters', 'starter.providers',

        '10Style.provider.toast',
        '10Style.provider.loading',
        '10Style.provider.myPopup',
        '10Style.provider.myPopup2',
        '10Style.provider.wechatShare',
        '10Style.directives',
        '3rd-party'
    ]
)

//第三方依赖
angular.module('3rd-party', [
    'ab-base64',
    'ionic-citydata',
    'ionic-citypicker',
    'jrCrop',
    'ionic-native-transitions',
    'ngCordova',
    'ngFileUpload',
    'angular-cache',
    'ngTouch'
]);


//遗留的模块，重构完成之后删除。
angular.module('starter.controllers', []);
angular.module('starter.services', []);
angular.module('starter.filters', []);
angular.module('starter.providers', []);
angular.module('starter.directives', []);
