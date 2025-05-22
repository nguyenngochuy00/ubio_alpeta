/************************************************
 * user_popup_auth.js
 * Created at 2018. 10. 4. 오후 3:15:18.
 *
 * @author donghee
 ************************************************/



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	var hostAppIns = app.getHostAppInstance();
	
	app.lookup("left_pinky").visible = false;
	app.lookup("left_ring").visible = false;
	app.lookup("left_middle").visible = false;
	app.lookup("left_index").visible = false;
	app.lookup("left_thumb").visible = false;
	app.lookup("right_thumb").visible = false;
	app.lookup("right_index").visible = false;
	app.lookup("right_middle").visible = false;
	app.lookup("right_ring").visible = false;
	app.lookup("right_pinky").visible = false;
	
	if(hostAppIns){
		var initValue = app.getHostProperty("initValue");
		if(initValue != null){
	
			app.lookup("FP").value = initValue["FP"];
			app.lookup("FACE").value = initValue["FACE"];
			var fingerPrint = initValue["FINGERPRINT"].toString();
			console.log(fingerPrint);

			reDrawFingerPrint(fingerPrint);
		}
	}

}

function reDrawFingerPrint(fingerPrint ){
	var FingerName = [
		"left_pinky", //
		"left_ring", 
		"left_middle",
		"left_index",
		"left_thumb",
		"right_thumb",
		"right_index",
		"right_middle",
		"right_ring",
		"right_pinky"
	];
	
	//등록된 지문 데이터는 00000000000 으로 10자리 숫자이다.
	//왼쪽부터 왼손 약지 -> 오른손 약지로 이루어진다.
	if(fingerPrint.length == 10 ) {
		// 사용자의 등록된 지문 데이터 중 등록된 지문 데이터가 있을경우 전체 문자 열 중 등록된 데이터를 찾는다.
		// 등록된 Log는 IndexOf의 데이터가 정상적으로 채크되었는지 확인.
		var fingerIndexCheck = fingerPrint.indexOf("1", 0);
		var captionIndexCheck = fingerPrint.indexOf("2", 0);
		console.log("일반 지문 위치 : "+fingerIndexCheck); 
		console.log("협박 지문 위치 : "+captionIndexCheck); 
		if(fingerIndexCheck > 0 || captionIndexCheck > 0 ) {
			var FingerArray = fingerPrint.split("");
			// String 데이터를 모두 배열로 저장하여 하나하나식 데이터를 확인한다.
			for(var finger = 0 ; finger<= FingerArray.length ; finger++ ){
				//0이 아닐경우 Visible 해지
				if(FingerArray[finger]!=0){
					/** @type cpr.controls.Image */
					app.lookup(FingerName[finger]).visible = true;
					
					// 0도 아니고 1도 아닐경우 scr 변경 caption 협박지문.
					if(FingerArray[finger]!=1){
						/** @type cpr.controls.Image */
						app.lookup(FingerName[finger]).src = "../../../../theme/image/caption.png";
						app.lookup(FingerName[finger]).redraw();
					}
				}
			}
		}
	}
}
