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

		app.lookup("displaytab").redraw();
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
