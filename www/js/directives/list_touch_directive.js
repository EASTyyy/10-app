(function(){
    'use strict';
    angular.module('starter.controllers')
        .directive('listTouch',function(){
        return {

            restrict : "AE",
            link : function(scope,element,attrs){
            	var Ul = element[0].lastElementChild;
                var Li = Ul.getElementsByTagName('li');
            	
                var disY = 0;
                var num = 0;
                var startY = 0;
                var selected = 0;
                var disTop2 = 0;
                
                var LiHeight = 44;
                var disTop = LiHeight;
                var Lilength = Li.length;
                var moveTimer = null;
                element.bind('touchstart',function(ev){
                    ev.preventDefault();
                    ev = ev.touches[0];
                    startY = ev.clientY;
                })

                element.bind('touchmove',function(ev){

                    ev = ev.touches[0];
                    disY = ev.clientY - startY;
                    Ul.style.top = disTop + disY + 'px';
                    disTop2 = parseFloat( Ul.style.top);
                    selected =  -Math.round( (disTop2)/LiHeight )+1;
                    selected = selected < 0 ? 0 : selected;
                    // console.log(selected)
                    for(var i= 0, len=Li.length;i<len;i++){
                        Li[i].className = '';
                        if(Li[selected]) {
                            Li[selected].className = 'select';
                            
                            if(Li[selected-1]){
                            	Li[selected-1].className = 'select-1';
                            }
                            if(Li[selected+1]){
                            	Li[selected+1].className = 'select1';
                            }
                            if(Li[selected-2]){
                            	Li[selected-2].className = 'select-2';
                            }
                            if(Li[selected+2]){
                            	Li[selected+2].className = 'select2';
                            }
                            
                        }else{
                            Li[len-1].className = 'select';
                        }
                    }

                })

                element.bind('touchend',function(ev){
                    disTop = parseFloat( Ul.style.top );
                    num = Math.round( (disTop)/LiHeight );
                    if(num > 1){
                        num = 1;
                    }
                    else if( num < -(Lilength-2) ){
                        num = -(Lilength-2);
                    }
                    move(num*LiHeight);
                    disTop = num*LiHeight;
                    

                })

                function move(end) {
                    var oUl = document.getElementsByClassName('chooseList')[0];

                    clearInterval(moveTimer);

                    moveTimer = setInterval(function () {
                        var speed = (end - oUl.offsetTop) / 5;
                        speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);

                        if (Math.abs(end - oUl.offsetTop) <= speed) {
                            clearInterval(moveTimer);
                            oUl.style.top = end + 'px';
                        }
                        else {
                            oUl.style.top = oUl.offsetTop + speed + 'px';
                        }
                    }, 10)
                }


            }

        }
    })
})();
