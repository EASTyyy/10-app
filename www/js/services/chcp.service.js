/**
 * Created by lujin on 2016/8/8.
 */

(function () {
    "use strict";
    angular.module('starter.services')
        .factory('ChcpService', ChcpService);
    ChcpService.$inject = ["$ionicPopup", "$interval", "Loading", "Config"];

    function ChcpService($ionicPopup, $interval, Loading, Config) {
        return {
            checkHotUpdate: _checkHotUpdate,
            bindEvent: _bindEvent
        };

        function _checkHotUpdate() {
            var timer;
            chcp.fetchUpdate(function (error, data) {
                console.log('fetchUpdate: ', error);
                if (error) {
                    if (error.code === chcp.error.ASSETS_FOLDER_IN_NOT_YET_INSTALLED) {
                        timer = $interval(function () {
                            console.log('check update...');
                            $interval.cancel(timer);
                            _checkHotUpdate();
                        }, 2000);
                    }else if(error.code !== chcp.error.NOTHING_TO_UPDATE){
                        console.log("update error: ", error.code);
                    }
                } else {
                    var confirmUpdate;
                    var device = ionic.Platform.device();
                    if (device.platform == "Android") {
                        confirmUpdate = $ionicPopup.confirm({
                            title: '提示',
                            template: '发现新版本，是否立即更新？',
                            cancelText: '退出',
                            okText: '更新'
                        });
                    } else {
                        confirmUpdate = $ionicPopup.alert({
                            title: '提示',
                            template: '发现新版本，是否立即更新？',
                            okText: '更新'
                        });
                    }
                    confirmUpdate.then(function (res) {
                        if (res) {
                            _installUpdate();
                        } else {
                            ionic.Platform.exitApp();
                        }
                    })

                }
            });
        }

        function _installUpdate() {
            Loading.show();
            chcp.installUpdate(function (err) {
                if (err) {
                    Loading.hide();
                    $ionicPopup.alert({
                        title: '提示',
                        template: '更新失败，退出应用',
                        okText: '退出'
                    }).then(function () {
                        ionic.Platform.exitApp();
                    });
                }
            })
        }

        function _bindEvent() {
            document.addEventListener(chcp.event.UPDATE_LOAD_FAILED, _updateLoadFailedCallback, false);

            document.addEventListener(chcp.event.UPDATE_INSTALLED, _updateInstalled, false);

            document.addEventListener(chcp.event.UPDATE_INSTALLATION_FAILED, _updateInstallFailed, false);

            document.addEventListener(chcp.event.ASSETS_INSTALLATION_FAILED, _assetsInstallationError, false);

            document.addEventListener(chcp.event.ASSETS_INSTALLED, _assetsInstalledOnExternalStorage, false);
        }

        function _updateLoadFailedCallback(event) {
            console.log('chcp_updateLoadFailed: ', event);
            var error = (event && event.detail)?event.detail.error: null;
            if (error && error.code == chcp.error.APPLICATION_BUILD_VERSION_TOO_LOW) {
                VersionDialog.show();
            }
        }

        function _updateInstalled(event) {
            console.log('chcp_updateInstalled: ', event);
        }

        function _updateInstallFailed(event) {
            console.log('chcp_updateInstallFailed: ', event);
        }

        function _assetsInstallationError(event) {
            console.log('chcp_assetsInstallationError: ', event);
        }

        function _assetsInstalledOnExternalStorage(event) {
            console.log('chcp_assetsInstalledOnExternalStorage: ', event);
        }
    }

})();
