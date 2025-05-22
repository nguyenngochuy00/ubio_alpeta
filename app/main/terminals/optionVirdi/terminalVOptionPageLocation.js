/************************************************
 * terminalVOptionPageLocation.js
 * Created at 2024. 3. 18. 오전 9:28:01.
 *
 * @author sep
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	// Master & 관리자만
	var userPrivilege = dataManager.getAccountInfo().getValue("Privilege");
	var userID = dataManager.getAccountInfo().getValue("UserID");
	if (userID != 1000000000000000000 && userPrivilege != 1){
		app.lookup("location_group").readOnly = true;
	}
	
	var cmbGroup = app.lookup("TMIL_cmbDepartment");
	var groupList = dataManager.getGroup();
	cmbGroup.setItemSet(groupList, {
		label: "Name",
		value: "GroupID"
	});
	
	var cmbPartner = app.lookup("TMIL_cmbPatner");
	var partnerList = dataManager.getPartnerListHDHI();
	cmbPartner.setItemSet(partnerList, {
		label: "PartnerName",
		value: "PartnerID"
	});
	
	var hostAppIns = app.getHostAppInstance();	
	if (hostAppIns.hasAppMethod("getTerminalID")) {
		var tID = hostAppIns.callAppMethod("getTerminalID");
		console.log(tID);
		var requestData = app.lookup("sms_getTerminalCustomHI");
		requestData.action =  "/v1/hdhi/terminals/location/" + tID;
		hostAppIns.callAppMethod("parentShowLoadMask", "Str_DefaultOption");
		requestData.send();
	}
}

function onSms_getTerminalCustomHISubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	
	hostAppIns.callAppMethod("parentHideLoadMask", "");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if (resultCode == COMERROR_NONE) {
		var bOptStatus = hostAppIns.callAppMethod("initTerminalOptStatus", "LocationOpt");
		var locationInfo = app.lookup("TerminalCustomHDHI");
		var res = hostAppIns.callAppMethod("setTerminalLocationHDHI", locationInfo);
		app.lookup("location_group").redraw();
	} else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_TerminalBasicInfoGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalBasicInfoGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));			
	}
}

function onSms_getTerminalCustomHISubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getTerminalCustomHISubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onValueChange(e) {
	var selectedCtrl = e.control;
	var bOptResult;
	var hostAppIns = app.getHostAppInstance();
	switch (selectedCtrl.id) {
		case "TMIL_cmbDepartment":
			bOptResult = hostAppIns.callAppMethod("modifyTerminalLocationHDHI", ["GroupID", selectedCtrl.value]);
			break;
		case "TMIL_cmbPatner":
			bOptResult = hostAppIns.callAppMethod("modifyTerminalLocationHDHI", ["PartnerID", selectedCtrl.value]);
			break;
		case "TMIL_ipbBuildingName":
			bOptResult = hostAppIns.callAppMethod("modifyTerminalLocationHDHI", ["BuildingName", selectedCtrl.value]);
			break;
		case "TMIL_ipbBuildingNumber":
			bOptResult = hostAppIns.callAppMethod("modifyTerminalLocationHDHI", ["BuildingNumber", selectedCtrl.value]);
			break;
		case "TMIL_ipbPart1":
			bOptResult = hostAppIns.callAppMethod("modifyTerminalLocationHDHI", ["Part1", selectedCtrl.value]);
			break;
		case "TMIL_ipbPart2":
			bOptResult = hostAppIns.callAppMethod("modifyTerminalLocationHDHI", ["Part2", selectedCtrl.value]);
			break;
		case "TMIL_ipbPart3":
			bOptResult = hostAppIns.callAppMethod("modifyTerminalLocationHDHI", ["Part3", selectedCtrl.value]); 
			break;
		case "TMIL_ipbRemark":
			bOptResult = hostAppIns.callAppMethod("modifyTerminalLocationHDHI", ["Remark", selectedCtrl.value]);
			break;
	}

	if (bOptResult == -1) {
		console.log("equal data select");
	}
}


