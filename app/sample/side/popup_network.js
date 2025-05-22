/************************************************
 * popup_network.js
 * Created at 2018. 10. 16. 오후 6:05:47.
 *
 * @author wonji
 ************************************************/


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	console.log("networkonononononBody")
}




/*
 * 마스크 에디터에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onMse1Keydown(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.MaskEditor
	 */
	var mse1 = e.control;
	console.log("mse1.accessKey:: "+e.DOM_KEY_LOCATION_NUMPAD+ "::: ");
	if(e.char == ".") {
		console.log("e.char::: "+e.char)
	}
	if(mse1.focused) {
		console.log("focused::: ")
	} else {
	}
//	mse1.value = mse1.displayText
//	mse1.mask = mse1.displayText;
//	mse1.putValue(mse1.value);
}
