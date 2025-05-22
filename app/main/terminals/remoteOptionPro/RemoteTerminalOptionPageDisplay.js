/************************************************
 * RemoteTerminalOptionPageDisplay.js
 * Created at 2023. 11. 24. 오전 10:15:07.
 *
 * @author zxc
 ************************************************/

var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");
var pagePrefix = "RTOPD";

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var terminalType = app.getHost().initValue;
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var termianlAllOpt = hostAppIns.callAppMethod("getTerminalAllOption");
		var dOptinfo = app.lookup("DisplayOptionInfo");
		termianlAllOpt.copyToDataMap(dOptinfo);
		
		// 미지원 옵션 비활성화
		setEmbAppInnerControlEnable(app, dOptinfo, pagePrefix);
		
		// 사진 저장 옵션 -> 0:미사용 , 1:성공시 저장, 2:실패시 저장, 3:성공,실패 시 모두 저장
		switch(dOptinfo.getValue("Camera_SavePhoto")) {
			case 0:
				app.lookup("RTOPD_Camera_SavePhoto_Success").checked = 0;
				app.lookup("RTOPD_Camera_SavePhoto_Fail").checked = 0;
				break;
			case 1:
				app.lookup("RTOPD_Camera_SavePhoto_Success").checked = 1;
				app.lookup("RTOPD_Camera_SavePhoto_Fail").checked = 0;
				break;
			case 2:
				app.lookup("RTOPD_Camera_SavePhoto_Success").checked = 0;
				app.lookup("RTOPD_Camera_SavePhoto_Fail").checked = 1;
				break;
			case 3:
				app.lookup("RTOPD_Camera_SavePhoto_Success").checked = 1;
				app.lookup("RTOPD_Camera_SavePhoto_Fail").checked = 1;
				break;
			default:
				break;
		}
		app.lookup("displaytab").redraw();
		
		// 옵션 설정 범위 
		if(hostAppIns.hasAppMethod("getDisplayRange")) {
			var range = hostAppIns.callAppMethod("getDisplayRange");
			var Lang_Lang_Range = app.lookup("Lang_Lang_Range");
			
			range.Lang_Lang_Range.copyToDataSet(Lang_Lang_Range);
		}

	}
}

//<-------------------------------------------------------------------------------

exports.getTerminalPartOption = function() {
	var TerminalPartOption = app.lookup("DisplayOptionInfo");
	return TerminalPartOption;
}

exports.getPageInfo = function() {
	return "Display";
}

//-------------------------------------------------------------------------------->


function ChkCamera_SaveFaceFail() {
	var success = app.lookup("RTOPD_Camera_SavePhoto_Success").checked;
	var fail = app.lookup("RTOPD_Camera_SavePhoto_Fail").checked;
	
	if(success && fail) {
		app.lookup("DisplayOptionInfo").setValue("Camera_SavePhoto", 3);
	} else if (success) {
		app.lookup("DisplayOptionInfo").setValue("Camera_SavePhoto", 1);
	} else if (fail) {
		app.lookup("DisplayOptionInfo").setValue("Camera_SavePhoto", 2);
	} else {
		app.lookup("DisplayOptionInfo").setValue("Camera_SavePhoto", 0);
	}
}
