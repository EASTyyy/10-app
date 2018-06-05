"use strict";
var app = angular.module('ionic-citypicker', ['ionic']);
app.directive('ionicCityPicker', ['$ionicPopup', '$timeout', 'CityPickerService', '$ionicScrollDelegate', '$ionicModal', function ($ionicPopup, $timeout, CityPickerService, $ionicScrollDelegate, $ionicModal) {
    return {
        restrict: 'AE',
        template: '<input type="text"  placeholder={{vm.placeholder}} ng-model="citydata"  class={{vm.cssClass}} readonly>',
        scope: {
            citydata: '=',
            backdrop: '@',
            backdropClickToClose: '@',
            hideCountry: '@',
            buttonClicked: '&'
        },
        link: function (scope, element, attrs) {
            var vm = scope.vm = {}, citypickerModel = null;
            var scrollEnd = false;
            var touchEnd = false;
            var scrollAnimate = false;
            var touchIndex;
            var touchHandle;
            //根据城市数据来 设置Handle。
            vm.provinceHandle = "provinceHandle" + attrs.citydata;
            vm.cityHandle = "cityHandle" + attrs.citydata;
            vm.countryHandle = "countryHandle" + attrs.citydata;
            vm.placeholder = attrs.placeholder || "请选择城市";
            vm.okText = attrs.okText || "确定";
            vm.cssClass = attrs.cssClass;
            vm.barCssClass = attrs.barCssClass || "bar-dark";
            vm.hideCountry = scope.$eval(scope.hideCountry) || false;
            vm.backdrop = scope.$eval(scope.backdrop) || false;
            vm.backdropClickToClose = scope.$eval(scope.backdropClickToClose) || false;
            vm.cityData = CityPickerService.cityList;
            vm.tag = attrs.tag || "-";
            vm.returnOk = function () {
                citypickerModel && citypickerModel.hide();
                scope.buttonClicked && scope.buttonClicked();
            };
            vm.clickToClose = function () {
                vm.backdropClickToClose && citypickerModel && citypickerModel.hide();
            };
            vm.getData = function (name) {
                //$timeout.cancel(vm.scrolling);//取消之前的scrollTo.让位置一次性过渡到最新
                $timeout.cancel(vm.dataing);//取消之前的数据绑定.让数据一次性过渡到最新
                switch (name) {
                    case 'province':
                        if (!vm.cityData) return false;
                        var province = true, length = vm.cityData.length, Handle = vm.provinceHandle, HandleChild = vm.cityHandle;
                        $timeout.cancel(vm.provinceScrolling);
                        break;
                    case 'city':
                        if (!vm.province || !vm.province.sub) return false;
                        var city = true, length = vm.province.sub.length, Handle = vm.cityHandle, HandleChild = vm.countryHandle;
                        $timeout.cancel(vm.cityScrolling);
                        break;
                    case 'country':
                        if (!vm.city || !vm.city.sub) return false;
                        var country = true, Handle = vm.countryHandle, length = vm.city.sub.length;
                        $timeout.cancel(vm.countryScrolling);
                        break;
                }
                var top = $ionicScrollDelegate.$getByHandle(Handle).getScrollPosition().top;//当前滚动位置
                var indexs = Math.round(top / 45);
                if (indexs < 0) indexs = 0;//iOS bouncing超出头
                if (indexs > length - 1) indexs = length - 1;//iOS bouncing超出尾
                scrollEnd = false;
                touchHandle = Handle;
                touchIndex = indexs;
                //数据同步
                province && hideColor('province', indexs, HandleChild);
                city && hideColor('city', indexs, HandleChild);
                country && hideColor('country', indexs, HandleChild);
                if( !vm.city.sub || vm.city.sub && vm.city.sub.length === 0 ) scope.citydata = vm.province.name + vm.tag + vm.city.name;
                if (top === indexs * 45) {
                    vm.dataing = $timeout(function () {
                        scrollEnd = true;
                        province && ( vm.province = vm.cityData[indexs], vm.city = vm.province.sub[0], vm.country = {}, (vm.city && vm.city.sub && ( vm.country = vm.city.sub[0])));//处理省市乡联动数据
                        city && ( vm.city = vm.province.sub[indexs], vm.country = {}, (vm.city && vm.city.sub && ( vm.country = vm.city.sub[0])));//处理市乡联动数据
                        country && ( vm.country = vm.city.sub[indexs]);//处理乡数据
                        if(!scope.hideCountry){
                            scope.citydata = (vm.city.sub && vm.city.sub.length > 0) ? ( vm.province.name + vm.tag + vm.city.name + vm.tag + vm.country.name ) : ( vm.province.name + vm.tag + vm.city.name);
                        }else{
                            scope.citydata = vm.province.name + vm.tag + vm.city.name;
                        }
                    }, 100);
                } else {
                    switch (name){
                        case 'province':
                            //scrollTo(vm.provinceScrolling, indexs, Handle);
                            vm.provinceScrolling = $timeout(function () {
                                scrollEnd = true;
                                if( touchEnd ) $ionicScrollDelegate.$getByHandle(Handle).scrollTo(0, indexs * 45, scrollAnimate);
                            }, 100);
                            break;
                        case 'city':
                            //scrollTo(vm.cityScrolling, indexs, Handle);
                            vm.cityScrolling = $timeout(function () {
                                scrollEnd = true;
                                if( touchEnd ) $ionicScrollDelegate.$getByHandle(Handle).scrollTo(0, indexs * 45, scrollAnimate);
                            }, 100);
                            break;
                        case 'country':
                            //scrollTo(vm.countryScrolling, indexs, Handle);
                            vm.countryScrolling = $timeout(function () {
                                scrollEnd = true;
                                if( touchEnd ) $ionicScrollDelegate.$getByHandle(Handle).scrollTo(0, indexs * 45, scrollAnimate);
                            }, 100);
                            break;
                    }
                }
            };

            function touch(ev){
                var event = ev || window.event;
                switch (event.type){
                    case 'touchstart':
                        touchEnd = false;
                        break;
                    case 'touchend':
                        touchEnd = true;
                        if( scrollEnd ) $timeout(function(){$ionicScrollDelegate.$getByHandle(touchHandle).scrollTo(0, touchIndex * 45, scrollAnimate);}, 100);
                        break;
                }
            }

            function hideColor(item, indexs, HandleChild) {
                switch (item) {
                    case 'province':
                        vm.province = vm.cityData[indexs];
                        vm.city     = vm.province.sub[0];
                        vm.country  = {};
                        vm.city && vm.city.sub && ( vm.country = vm.city.sub[0]);
                        scope.$apply(function () {
                            vm.cityData.forEach(function (item, index) {
                                item.currentProvince = index == indexs;
                                if (vm.cityData[index - 2]) vm.cityData[index - 2].topSmallFont = item.currentProvince;
                            });
                            if (vm.province.sub && vm.province.sub.length !== 0) vm.province.sub[0].currentCity = true;
                            if (vm.city.sub && vm.city.sub.length !== 0) vm.city.sub[0].currentCountry = true;
                        });
                        break;
                    case 'city':
                        vm.city    = vm.province.sub[indexs];
                        vm.country = {};
                        vm.city && vm.city.sub && ( vm.country = vm.city.sub[0]);
                        scope.$apply(function () {
                            vm.province.sub.forEach(function (item, index) {
                                item.currentCity = index == indexs;
                                if (vm.province.sub[index - 2]) vm.province.sub[index - 2].topSmallFont = item.currentCity;
                            });
                            if (vm.city.sub && vm.city.sub.length !== 0) vm.city.sub[0].currentCountry = true;
                        });
                        break;
                    case 'country':
                        vm.country = vm.city.sub[indexs];
                        scope.$apply(function () {
                            vm.city.sub.forEach(function (item, index) {
                                item.currentCountry = index == indexs;
                                if (vm.city.sub[index - 2]) vm.city.sub[index - 2].topSmallFont = item.currentCountry;
                            });
                        });
                        break;
                }

                if((!scope.hideCountry && item !== 'country') || (scope.hideCountry && item === 'province')) HandleChild && $timeout(function(){$ionicScrollDelegate.$getByHandle(HandleChild).scrollTop();});//初始化子scroll top位});
                if(ionic && ionic.Platform && ionic.Platform.isAndroid() && (!scope.hideCountry && item == 'province') && vm){
                    if(parseInt($ionicScrollDelegate.$getByHandle(vm.countryHandle).getScrollPosition().top) != 0){
                        $timeout(function(){$ionicScrollDelegate.$getByHandle(vm.countryHandle).scrollTop();});
                    }
                }
            }

            if(ionic && ionic.Platform && ionic.Platform.isIOS()){
                scrollAnimate = true;
            }

            element.on("click", function () {
                //零时处理 点击过之后直接显示不再创建
                if (!attrs.checked) {
                    citypickerModel && citypickerModel.remove();
                } else {
                    citypickerModel && citypickerModel.show();
                    return
                }
                attrs.checked = true;
                $ionicModal.fromTemplateUrl('lib/ionic-citypicker/city-picker-modal.html', {
                    scope: scope,
                    animation: 'slide-in-up',
                    backdropClickToClose: vm.backdropClickToClose
                }).then(function (modal) {
                    citypickerModel = modal;
                    //初始化 先获取数据后展示
                    $timeout(function () {
                        vm.getData('province');
                        citypickerModel.show();
                        var modal = document.querySelector('.city-picker-bg');
                        if(modal){
                            modal.addEventListener('touchend', touch, false);
                            modal.addEventListener('touchstart', touch, false);
                        }
                    }, 100)
                })
            });
            //销毁模型
            scope.$on('$destroy', function () {
                var modal = document.querySelector('.city-picker-bg');
               if(modal){
                   modal.removeEventListener('touchend', touch, false);
                   modal.removeEventListener('touchstart', touch, false);
               }
                citypickerModel && citypickerModel.remove();
            });
        }
    }
}]);
