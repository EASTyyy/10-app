(function () {
  'use strict';

  angular.module('10Style.user-info')
    .controller('UserInfoCtrl', UserInfoCtrl);

  UserInfoCtrl.$inject = ['$scope', "$rootScope", "$state", "$ionicModal", "$ionicPopup", "$ionicPlatform", "$jrCrop",  "MyRouter", "authentication", "Config", "Upload", "FILE_STATE", "Loading", "USER_DEFAULT_INFO", "myPopup2"];

  function UserInfoCtrl($scope, $rootScope, $state, $ionicModal, $ionicPopup, $ionicPlatform, $jrCrop, MyRouter, authentication, Config, Upload, FILE_STATE, Loading, USER_DEFAULT_INFO, myPopup2) {


    $scope.chooseSex = chooseSex;
    $scope.sexComplete = sexComplete; //新增性别选择完成按钮
    $scope.updateName = updateName;
    $scope.emptyUpdateName = emptyUpdateName;

    $scope.isCorrectName = isCorrectName;
    $scope.isUserSexEqual = isUserSexEqual;

    $scope.showUpdateSexModal = showUpdateSexModal;


    $scope.onImageloadStart = imageLoadStart;
    $scope.onImageLoadComplete = imageLoadComplete;

    $scope.chooseImgWay = chooseImgWay;
    $scope.updateImg = updateImg;
    $scope.cancelChoose = cancelChoose;
    $scope.isMarkShow = false;
    $scope.sex = 1;

    init();

    function init() {

      Loading.show({
          fullScreen: true,
          style: 'circle'
      });

      authentication.refreshSignInStatus(
        function (result) {
          Loading.hide();

          if (result == 0) // 未登陆而且token不存在
          {
            $rootScope.signInDestination = { ref: { state: $state.current.name, paramExpr: JSON.stringify($stateParams) }, params: $stateParams, options: {} };
            $state.go("login", { back: $state.current.name });
            return;
          }

          _getAccountInfoAndInit();

          $scope.$on('$destroy', function () {
            $scope.chooseModal.remove();
          });
        }
      );
    }

    function isCorrectName() {
      return ($scope.user.displayName === $scope.user.name) || $scope.user.displayName === '';
    }


    function chooseSex(sex) {
      $scope.sex = sex;
    }


    function sexComplete(sex) {

      var currentChoice = (sex && sex.toLowerCase() == 'male') ? 1 : 0;

      Loading.show({
          fullScreen: true,
          style: 'circle'
      });

      authentication.updateUserInfo({
        phone: $scope.user.phone,
        sex: currentChoice
      })
        .success(function (data) {
          if (data && data.account_info) {
            $scope.sex = currentChoice;
            store(data.account_info);
            refresh(data.account_info);
          }
          Loading.hide();
        })
        .error(function (data) {
          Loading.hide();
        });

      $scope.isMarkShow = false;
    }


    function updateName() {
      Loading.show({
          fullScreen: true,
          style: 'circle'
      });

      authentication.updateUserInfo({
        phone: $scope.user.phone,
        nickname: $scope.user.displayName
      })
        .success(function (data) {
          if (data && data.account_info) {
            store(data.account_info);
            refresh(data.account_info);
          }
          MyRouter.goBackState();
          Loading.hide();
        })
        .error(function (data) {
          Loading.hide();
        });
    }


    function emptyUpdateName() {
      $scope.user.displayName = '';
    }


    function store(user) {
      if (user) {
        authentication.setAccountInfo(user);
      }
    }


    function refresh(user) {
      if (user) {
        $scope.user = {
          phone: user.phone,
          name: user.nickname,
          displayName: user.nickname ? user.nickname : Config.USER_DEFAULT_NAME,
          sex: user.sex,
          displaySex: user.sex === 0 ? '女' : '男',
          avator: user.portrait ? user.portrait : USER_DEFAULT_INFO.AVATOR
        }
      }
    }


    function isUserSexEqual(sex) {
      return sex === $scope.sex;
    }


    function showUpdateSexModal() {
        myPopup2.show({
            titleImgSrc: 'img/user-sex-choose/title.png',
            leftImgSrc: 'img/user-sex-choose/male.png',
            rightImgSrc: 'img/user-sex-choose/female.png',
            leftText: '男',
            rightText: '女',
            leftChooseCallback:function(){
                if($scope.sex == 1) return;
                sexComplete('male');
            },
            rifgtChooseCallback:function(){
                if($scope.sex == 0) return;
                sexComplete('female');
            }
        });
    }


    function _getAccountInfoAndInit(info) {
      var user = info ? info : authentication.getAccountInfo();
      $scope.sex = user.sex;
      refresh(user);

      _intChooseWay();
    }

    function _intChooseWay(){

      $ionicModal.fromTemplateUrl('js/page/user-info/userInfo-choose-way.template.html', {
          scope: $scope,
          backdropClickToClose: false,
          animation: 'slide-in-up'
      }).then(function (modal) {
          $scope.chooseModal = modal;
      });

    }

    function chooseImgWay(){

        $scope.chooseModal.show();
        $scope.isMarkShow = true;

    }

    function cancelChoose(){
        $scope.chooseModal.hide();
        $scope.isMarkShow = false;
    }

    function updateImg(way){
        cancelChoose();
        $ionicPlatform.ready(function () {

            var cameraOptions = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: way == "camera" ? Camera.PictureSourceType.CAMERA : way == "photolibrary" ? Camera.PictureSourceType.PHOTOLIBRARY : null,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                correctOrientation:true
            };
            navigator.camera.getPicture(_cameraSuccess, _cameraError, cameraOptions);

            function _cameraSuccess(imageData){

                var url = "data:image/jpeg;base64," + imageData;
                _processPicture(url);

            }

            function _cameraError(){
                console.log("获取图片失败");
            }
        });

    }



    function _processPicture(url) {
      $jrCrop.crop({
        url: url,
        width: Config.IMAGE_SIZE_USER_AVATOR[0],
        height: Config.IMAGE_SIZE_USER_AVATOR[1],
        cancelText: '取消',
        chooseText: '确定'
      }).then(function (canvas) {
        // success!

        var blob = _dataURLtoBlob(canvas);

        blob['name'] = "image.png";

        if (blob.size >= Config.MAX_UPLOAD_FILE_SIZE/2) {
          $ionicPopup.alert({
            title: '提示',
            template: '图片过大，请重新选择其它图片',
            okText: '知道了'
          });
        } else {
          Loading.show({
            fullScreen: true,
            style: 'circle'
        });
          _uploadFile(blob).then(
            function (upload_response) {
              if (upload_response.data && upload_response.data.file_infos && upload_response.data.file_infos.length) {
                  var file_info = upload_response.data.file_infos[0];
              }
              authentication.updateUserInfo({portrait: file_info.file_path}).then(
                function(response){
                  Loading.hide();
                  var account_info = (response && response.data && response.data.account_info) ? response.data.account_info: null;
                  console.log(account_info)
                  if(!account_info) return;
                  authentication.setAccountInfo(account_info);
                  _getAccountInfoAndInit(account_info);
                },
                function(response){


                  Loading.hide();
                  $ionicPopup.alert({
                    title: '提示',
                    template: (response && response.data && response.data.error) ? response.data.error : '设置头像失败',
                    okText: '知道了'
                  });
                }
              )
            },
            function (response) {
              Loading.hide();
              $ionicPopup.alert({
                title: '提示',
                template: (response && response.data && response.data.error) ? response.data.error : '上传头像失败',
                okText: '知道了'
              });
            }
          )
        }
      }, function () {
        console.log('user canceled');
      });
    }

    function _dataURLtoBlob(dataurl) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }

    function imageLoadStart() {
      Loading.show({
          fullScreen: true,
          style: 'circle'
      });
    }

    function imageLoadComplete() {
      Loading.hide();
    }

    function _uploadFile(blob, extra) {
      return Upload.upload({
        url: Config.URL_PREFIX + 'upload/files',
        data: { upload_files: blob, extra: extra, state: FILE_STATE.TEMPORARY },
        headers: { token: authentication.getToken() }
      });
    }
  }

} ());
