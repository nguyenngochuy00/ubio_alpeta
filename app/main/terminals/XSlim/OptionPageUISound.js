/************************************************
 * OptionPageUISound.js
 * Created at 2018. 12. 5. 오후 1:24:16.
 *
 * @author wonki
 ************************************************/



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	
	var srcData = hostAppIns.callAppMethod("getUIOptionData");
	var uiOption = app.lookup("UIOption");
	srcData.copyToDataMap(uiOption);
	
//	uiOption.setValue("LcdBrightness", 3);
	console.log("LcdBrightness = " + uiOption.getString("LcdBrightness"));
//	console.log("UseUserNameDisplay = " + uiOption.getString("UseUserNameDisplay"));
	
	
	app.lookup("TMUTN_grpUI").redraw();
}


/*
 * Body에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
function onBodyUnload(/* cpr.events.CEvent */ e){
//	var dmUIOption = app.lookup("UIOption");
//	var hostAppIns = app.getHostAppInstance();
//	hostAppIns.callAppMethod("setUIOptionData", dmUIOption);
 	if (app.hasAppMethod("requestSetData")) {
 		app.callAppMethod("requestSetData");
 	}
}

exports.requestSetData = function(){
	var dmUIOption = app.lookup("UIOption");
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns && hostAppIns.hasAppMethod("setUIOptionData")) {
		hostAppIns.callAppMethod("setUIOptionData", dmUIOption);	
	}
}
