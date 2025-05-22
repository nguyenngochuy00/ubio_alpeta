
var slider = null;
var isAutimating = false;

/*
 * Triggered when init event is fired from Shell.
 */
function onShl1Init2(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	if(slider){
		e.preventDefault();
	}
}


/*
 * Triggered when load event is fired from Shell.
 */
function onShl1Load2(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl1 = e.control;
	if(slider){
		return;
	}
	var oShell = e.content;
	if(!oShell){ return; }
	$('.swiper-container').append(`<div class="swiper-wrapper"> 
		<image class="swiper-slide" src="../theme/images/mobile/tutorial_img_01_nocard.png"></image>           
    	<image class="swiper-slide" src="../theme/images/mobile/tutorial_img_03.png"></image>             
    	<image class="swiper-slide" src="../theme/images/mobile/tutorial_img_04.png"></image>           
    	<image class="swiper-slide" src="../theme/images/mobile/tutorial_img_05.png"></image>
    </div>`);
    $('.swiper-container').append(`<div class="swiper-pagination"></div>`)
    
    slider = new Swiper('.swiper-container', {
    	speed: 400,
    	spaceBetween: 100,
    	pagination: {
    		el: '.swiper-pagination',
    		renderBullet: function (index, className) {
          		return '<span class="' + className + '">' + '</span>';
        	},   		
  		},
    });
}


/*
 * Triggered when click event is fired from Button "Skip".
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	if (isAutimating) {
		e.preventDefault();
		return;
	}
	isAutimating = true;
	localStorage.setItem("FirstLoginFlag.tutorial", "1")
	cpr.core.App.load("app/mobile/login/Login", function(newapp) {
		app.close();
		newapp.createNewInstance().run(null, function() {
			isAutimating = false;
		});			
	});
}


/*
 * Triggered when click event is fired from Button.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	if (!slider) {
		e.preventDefault();
		return;
	}
	slider.slideNext();
}


/*
 * Triggered when click event is fired from Button.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	if (!slider) {
		e.preventDefault();
		return;
	}
	slider.slidePrev();
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	window.addEventListener("BackBtnClicked", closeApp, true);
}


/*
 * Triggered when before-unload event is fired from Body.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	window.removeEventListener("BackBtnClicked", closeApp, true);
}
