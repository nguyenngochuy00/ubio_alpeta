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
		
		// 옵션 설정 범위 
		if(hostAppIns.hasAppMethod("getTerminalOptionRange")) {
			var range = hostAppIns.callAppMethod("getTerminalOptionRange");
			var Opt_BLErssi_Range = app.lookup("Opt_BLErssi_Range");
			var Opt_BLEtxpower_Range = app.lookup("Opt_BLEtxpower_Range");
			var Input_M0_Range = app.lookup("Input_M0_Range");
			var Input_M1_Range = app.lookup("Input_M1_Range");
			var Input_M2_Range = app.lookup("Input_M2_Range");
			var Input_IO_Range = app.lookup("Input_IO_Range");
			var Lock_L1Opt_Range = app.lookup("Lock_L1Opt_Range");
			var Lock_L2Opt_Range = app.lookup("Lock_L2Opt_Range");
			var ExtDev_RS232_Range = app.lookup("ExtDev_RS232_Range");
			var ExtDev_RS485_Range = app.lookup("ExtDev_RS485_Range");
			var ExtDev_SlaveReader_Range = app.lookup("ExtDev_SlaveReader_Range");
			var Thermal_Temperature_Range = app.lookup("Thermal_Temperature_Range");
			
			range.Opt_BLErssi_Range.copyToDataSet(Opt_BLErssi_Range);
			range.Opt_BLEtxpower_Range.copyToDataSet(Opt_BLEtxpower_Range);
			range.Input_M0_Range.copyToDataSet(Input_M0_Range);
			range.Input_M1_Range.copyToDataSet(Input_M1_Range);
			range.Input_M2_Range.copyToDataSet(Input_M2_Range);
			range.Input_IO_Range.copyToDataSet(Input_IO_Range);
			range.Lock_L1Opt_Range.copyToDataSet(Lock_L1Opt_Range);
			range.Lock_L2Opt_Range.copyToDataSet(Lock_L2Opt_Range);
			range.ExtDev_RS232_Range.copyToDataSet(ExtDev_RS232_Range);
			range.ExtDev_RS485_Range.copyToDataSet(ExtDev_RS485_Range);
			range.ExtDev_SlaveReader_Range.copyToDataSet(ExtDev_SlaveReader_Range);
			range.Thermal_Temperature_Range.copyToDataSet(Thermal_Temperature_Range);
		}
		onRTOPT_TOD_chkValueChange();
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



/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onRTOPT_TOD_chkValueChange(){
	var rTOPT_TOD_chk = app.lookup("RTOPT_Thermal_Use");
	
	var guide = app.lookup("RTOPT_GR_Guide"); 
	var preiview = app.lookup("RTOPT_GR_Preview");
	if(rTOPT_TOD_chk.checked) {
		guide.enabled = true;
		preiview.enabled = true;
	} else {
		guide.enabled = false;
		preiview.enabled = false;
	}
}

