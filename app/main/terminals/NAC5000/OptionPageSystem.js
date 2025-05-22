/************************************************
 * OptionPageSystem.js
 * Created at 2018. 12. 5. 오후 2:04:15.
 *
 * @author wonki
 ************************************************/



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	
	var srcOptionData = hostAppIns.callAppMethod("getSysOptionData");
	var sysOption = app.lookup("SysOption");
	srcOptionData.copyToDataMap(sysOption);
	//onsole.log("EncryptionType = " + sysOption.getString("EncryptionType"));
	
	var srcNetData = hostAppIns.callAppMethod("getNetOptionData");
	var netOption = app.lookup("NetOption");
	srcNetData.copyToDataMap(netOption);
	
	var srcDoorData = hostAppIns.callAppMethod("getDoorOptionData");
	var doorOption = app.lookup("DoorOption");
	srcDoorData.copyToDataMap(doorOption);
	
	console.log("DoorOption = " + JSON.stringify(doorOption.getDatas()));
	
	
	app.lookup("TMUTN_grpSystem").redraw();
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
	var dmSysOption = app.lookup("SysOption");
	var dmNetOption = app.lookup("NetOption");
	var dmDoorOption = app.lookup("DoorOption");
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		if (hostAppIns.hasAppMethod("setSysOptionData")) {
			hostAppIns.callAppMethod("setSysOptionData", dmSysOption);	
		}
		if (hostAppIns.hasAppMethod("setNetOption")) {
			hostAppIns.callAppMethod("setNetOptionData", dmNetOption)
		}
		if (hostAppIns.hasAppMethod("setDoorOptionData")) {
			hostAppIns.callAppMethod("setDoorOptionData", dmDoorOption);
		}
	}
}
