/************************************************
 * RemoteTerminalOptionPageTerminal.js
 * Created at 2023. 11. 23. 오후 5:33:58.
 *
 * @author zxc
 ************************************************/

var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");
var pagePrefix = "RTOPT";

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var terminalType = app.getHost().initValue;
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var termianlAllOpt = hostAppIns.callAppMethod("getTerminalAllOption");
		var nOptinfo = app.lookup("terminalOptionInfo");
		var rebootOptionInfo = app.lookup("RebootOptionInfo");
		termianlAllOpt.copyToDataMap(nOptinfo);
		termianlAllOpt.copyToDataMap(rebootOptionInfo);
		
		// 미지원 옵션 비활성화
		setEmbAppInnerControlEnable(app, nOptinfo, pagePrefix);
		
		// 위겐드 In/Out 사용자 정의 옵션은  선택 불가
		var wiegOut = app.lookup("RTOPT_ExtDev_WiegOut");
		var item = wiegOut.getItemByValue(3)
		wiegOut.setItemEnable(item, false);
		
		var wiegIn = app.lookup("RTOPT_ExtDev_WiegIn");
		item = wiegIn.getItemByValue(3)
		wiegOut.setItemEnable(item, false);
		
		app.lookup("tertab").redraw();
	}
}

function onRTOPT_Input_M0SelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var rTOPT_Inputs = e.control;
	if (rTOPT_Inputs.value != 0) {	// 시용안함 아닐시
		var selectLabel = rTOPT_Inputs.getItemByValue(rTOPT_Inputs.value).label;
		if (invalidInputOption(rTOPT_Inputs.id, selectLabel.split(" ")[0]) == false) {	// 앞자리만 검사
			rTOPT_Inputs.value = rTOPT_Inputs.fallbackValue;
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_DuplicateAlert"));
			return;
		}
	}
}

function invalidInputOption(optID, Label) {
	if (optID != "RTOPT_Input_M0") {
		var m0 = app.lookup("RTOPT_Input_M0");
		var m0Label = m0.getItemByValue(m0.value).label.split(" ")[0];
		if (m0Label.indexOf(Label) > -1) {
			return false;
		}
	}
	if (optID != "RTOPT_Input_M1") {
		var m1 = app.lookup("RTOPT_Input_M1");
		var m1Label = m1.getItemByValue(m1.value).label.split(" ")[0];
		if (m1Label.indexOf(Label) > -1) {
			return false;
		}
	}
	if (optID != "RTOPT_Input_M2") {
		var m2 = app.lookup("RTOPT_Input_M2");
		var m2Label = m2.getItemByValue(m2.value).label.split(" ")[0];
		if (m2Label.indexOf(Label) > -1) {
			return false;
		}
	}
	if (optID != "RTOPT_Input_IO") {
		var io = app.lookup("RTOPT_Input_IO");
		var ioLabel = io.getItemByValue(io.value).label.split(" ")[0];
		if (ioLabel.indexOf(Label) > -1) {
			return false;
		}
	}
	return true;
}

//<-------------------------------------------------------------------------------

exports.getTerminalPartOption = function() {
	var TerminalPartOption = app.lookup("terminalOptionInfo");
	return TerminalPartOption;
}

exports.getPageInfo = function() {
	return "Terminal";
}

//-------------------------------------------------------------------------------->

function cautionAlert() {
	var rebootOptionInfo = app.lookup("RebootOptionInfo");
	var presentCardReader = rebootOptionInfo.getValue("Opt_CardReader");
	var presentRS232 = rebootOptionInfo.getValue("ExtDev_RS232");
	var presentRS485 = rebootOptionInfo.getValue("ExtDev_RS485");
	
	var cardReader = app.lookup("RTOPT_Opt_CardReader").value;
	var RS232 = app.lookup("RTOPT_ExtDev_RS232").value;
	var RS485 = app.lookup("RTOPT_ExtDev_RS485").value;
	
	if(presentCardReader != cardReader) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_RebootOption"));
		app.lookup("terminalOptionInfo").setValue("Reboot_Flag", 1);
		return;
	} 
	if(presentRS232 != RS232) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_RebootOption"));
		app.lookup("terminalOptionInfo").setValue("Reboot_Flag", 1);
		return;
	}
	if(presentRS485 != RS485) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_RebootOption"));
		app.lookup("terminalOptionInfo").setValue("Reboot_Flag", 1);
		return;
	}
	
	app.lookup("terminalOptionInfo").setValue("Reboot_Flag", 0);
	
}

