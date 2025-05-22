/************************************************
 * terminalVOptionPageNetwork.js
 * Created at 2018. 12. 5. 오전 9:22:57.
 *
 * @author joymrk
 ************************************************/
var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");
var oem_version;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	oem_version = dataManager.getOemVersion();
	var terminalType = app.getHost().initValue;
	
	if (dataManager.getOemVersion() == OEM_UMS_QRCODE) {
		app.lookup('grp_gps').visible = true
	} else {
		app.lookup('grp_gps').visible = false
	}
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var nOptStatus = hostAppIns.callAppMethod("getTerminalOptStatus", "NetworkOpt");
		if(nOptStatus == 0) {
			if (hostAppIns.callAppMethod("getTerminalID")) {
				var tID = hostAppIns.callAppMethod("getTerminalID");
				var requestData = app.lookup("sms_get_terminal_option_network");
				requestData.action = requestData.action + tID + "/option/network";
				hostAppIns.callAppMethod("parentShowLoadMask", "Str_Network");
				requestData.send();
			}
		} else {
			var getNopt = hostAppIns.callAppMethod("getNetworkOption");
			var nOptinfo = app.lookup("NetWorkOptionInfo");
			getNopt.copyToDataMap(nOptinfo);
			app.lookup("networkgrd").redraw();
		}		
	}
	if (terminalType == 41 || terminalType == 46 || terminalType == 47){		//Pro2, FacePremium, FacePro
		app.lookup("AuthMode_cmb").deleteItemByValue(0);
		app.lookup("AuthMode_cmb").deleteItemByValue(2);
	}
	if (oem_version == OEM_GS_BASIC){
		app.lookup('grp_func').getLayout().setRowVisible(3, false);
	}
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function oncmbSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var selectedCtrl = e.control;
	var nOptResult;
	var hostAppIns = app.getHostAppInstance();
	switch (selectedCtrl.id) {
	case "AuthMode_cmb":
		nOptResult = hostAppIns.callAppMethod("modifyNetWorkOption", ["AuthMode", selectedCtrl.value]);
		break;
	case "OperationMode_cmb":
		nOptResult = hostAppIns.callAppMethod("modifyNetWorkOption", ["OperationMode", selectedCtrl.value]);
		break;
	}
	
	if (oem_version == OEM_VICTORYARCH){
		app.getHostAppInstance().callAppMethod("setModifiedList", 1);
	}
	
	if(nOptResult == -1) {
		console.log("equal data select");
	}
}

function onSms_get_terminal_option_networkSubmitDone(/* cpr.events.CSubmissionEvent */ e){
				 
	var hostAppIns = app.getHostAppInstance();
	hostAppIns.callAppMethod("parentHideLoadMask","");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if(resultCode == COMERROR_NONE) {
		var nOptStatus = hostAppIns.callAppMethod("initTerminalOptStatus", "NetworkOpt"); 
		var NetworkInfo = app.lookup("NetWorkOptionInfo");
		console.log("submitDone" + JSON.stringify(NetworkInfo.getDatas()));
		var res = hostAppIns.callAppMethod("setNetWorkOption", NetworkInfo); 
		app.lookup("networkgrd").redraw();
	} else {
		if(dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNetworkInfoGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));						
		} else{
			//dialogAlert(app, "Waning", dataManager.getString("Str_TerminalNetworkInfoGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNetworkInfoGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));			
		}
	}
}

function onSms_get_terminal_option_networkSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_get_terminal_option_networkSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onMeal_Print_ipbValueChange(/* cpr.events.CValueChangeEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	hostAppIns.callAppMethod("modifyNetWorkOption", ["MealPrintText", app.lookup("Meal_Print_ipb").text]);
	
	if (oem_version == OEM_VICTORYARCH){
		app.getHostAppInstance().callAppMethod("setModifiedList", 1);
	}
}

/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onStartLati_ipbValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var startLati_ipb = e.control;
	var hostAppIns = app.getHostAppInstance();
	hostAppIns.callAppMethod("modifyNetWorkOption", ["StartLati", app.lookup("StartLati_ipb").text]);
}

/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onEndLati_ipbValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var endLati_ipb = e.control;
	var hostAppIns = app.getHostAppInstance();
	hostAppIns.callAppMethod("modifyNetWorkOption", ["EndLati", app.lookup("EndLati_ipb").text]);
}

/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onStartLogit_ipbValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var startLogit_ipb = e.control;
	var hostAppIns = app.getHostAppInstance();
	hostAppIns.callAppMethod("modifyNetWorkOption", ["StartLogit", app.lookup("StartLogit_ipb").text]);
}


/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onEndLogit_ipbValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var endLogit_ipb = e.control;
	var hostAppIns = app.getHostAppInstance();
	hostAppIns.callAppMethod("modifyNetWorkOption", ["EndLogit", app.lookup("EndLogit_ipb").text]);
}
