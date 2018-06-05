(function(){
    angular.module('10style.accountSafeChose')
           .controller('accountSafeChoseCtrl', ChoseCtrl);

            //accountSafeChoseCtrl.$inject = ['$scope', 'localStorage'];           

           function ChoseCtrl($scope) {
           		
           		//初始化
           		_init();

           		function _init() {

                $scope.$on('$ionicView.beforeEnter', _getUserPhone);

           		}

           		/*
           		 *获取用户当前的手机号码并且隐藏中间四位
           		 */
           		function _getUserPhone() {
           			var phone = JSON.parse(sessionStorage.getItem('account_info')).phone;
           			$scope.userPhone = phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
           		}
           }
}());