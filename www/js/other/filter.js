(function () {
  'use strict';

  angular.module('starter.filters')
    .filter('calculatePrice', function () {
      return function (input, discount, quantity) {
        return input / 100 * (discount || 1) * (quantity || 1);
      }
    })
    .filter('runningAccountTypeFilter', [
        'RUNNING_ACCOUNT_TYPE',
        function(RUNNING_ACCOUNT_TYPE){
            return function(typeValue){
                return RUNNING_ACCOUNT_TYPE[typeValue];
            }
        }
    ])
    .filter('runningAccountAmountFilter', function(){
        return function(amount){
            if(parseFloat(amount) >= 0){
                return '+' + amount;
            }else{
                return amount;
            }
        }
    })
    .filter('transPrice', function(){
      return function(price){
          console.log('price: ', price)
          return price?price/100:0;
      }
    })
    .filter('couponRate', function(){
      return function(rate){
          return (rate*10).toFixed(1);
      }
    });
} ());


