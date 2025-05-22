/************************************************
 * OptionPageFingerprint.js
 * Created at 2018. 12. 5. 오후 3:57:00.
 *
 * @author wonki
 ************************************************/



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	
	var srcFPData = hostAppIns.callAppMethod("getFPOptionData");
	var fpOption = app.lookup("FPOption");
	srcFPData.copyToDataMap(fpOption);
	console.log("Brightness = " + fpOption.getString("Brightness"));	
	
	app.lookup("TMUTN_grpFP").redraw();
}


/*
 * Body에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
function onBodyUnload(/* cpr.events.CEvent */ e){
 	if (app.hasAppMethod("requestSetData")) {
 		app.callAppMethod("requestSetData");
 	}
}

exports.requestSetData = function(){
	var dmFPOption = app.lookup("FPOption");
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns && hostAppIns.hasAppMethod("setFPOptionData")) {
		hostAppIns.callAppMethod("setFPOptionData", dmFPOption);	
	}
}
