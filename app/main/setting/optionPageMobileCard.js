/************************************************
 * optionPageMobileCard.js
 * Created at 2021. 7. 20. 오전 9:58:17.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var hostApp = app.getHostAppInstance();
	var dmMobileCard = app.lookup("OptionMobileCard");
	
	hostApp.callAppMethod("getMobileCardData").copyToDataMap(dmMobileCard);
	//console.log(dmMobileCard.getDatas());
	app.lookup("ConnectTest").setValue("ContractCode", dmMobileCard.getValue("ContractCode"));// 초기값
	app.lookup("ConnectTest").setValue("ContractNo", dmMobileCard.getValue("ContractNo"));
	app.lookup("SEMCS_grpInfo").redraw();
}
exports.requestSetData = function() {
	var dmMobileCard = app.lookup("OptionMobileCard");
	var dmConnectTest = app.lookup("ConnectTest");
	if (dmConnectTest.getValue("ContractCode") != dmMobileCard.getValue("ContractCode") ) {
		//에러
	}
	if (dmConnectTest.getValue("ContractNo") != dmMobileCard.getValue("ContractNo") ) {
		//에러
	}
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setMobileCardData", dmMobileCard);
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onSEMCS_btnConnectClick(/* cpr.events.CMouseEvent */ e){
	
	var sms_postMobileCardConnectionTest = new cpr.protocols.Submission("sms_postMobileCardConnectionTest");	 
	sms_postMobileCardConnectionTest.action = "/v1/mobileCards/masterKey";
	sms_postMobileCardConnectionTest.method = "post";
	sms_postMobileCardConnectionTest.mediaType = "application/x-www-form-urlencoded";
		
	sms_postMobileCardConnectionTest.addEventListenerOnce("submit-done", onSms_postMobileCardConnectionTestSubmitDone);
	sms_postMobileCardConnectionTest.addEventListenerOnce("submit-error", onSubmitError);
	sms_postMobileCardConnectionTest.addEventListenerOnce("submit-timeout", onSubmitTimeout);
		
	sms_postMobileCardConnectionTest.addRequestData(app.lookup("OptionMobileCard"));
	sms_postMobileCardConnectionTest.addResponseData(app.lookup("Result"), false, "Result");
	sms_postMobileCardConnectionTest.addResponseData(app.lookup("MasterKeyInfo"), false, "MasterKeyInfo");
		
	comLib.showLoadMask("",dataManager.getString("Str_UserListGet"),"",0);
	sms_postMobileCardConnectionTest.send();
}

function onSms_postMobileCardConnectionTestSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	comLib.hideLoadMask();

	var resultCode = app.lookup("Result").getValue("ResultCode")
	if( resultCode == COMERROR_NONE){		
		var masterKeyInfo = app.lookup("MasterKeyInfo");
		var masterKey = masterKeyInfo.getValue("MasterKey");
		app.lookup("OptionMobileCard").setValue("MasterKey",masterKey);
		app.lookup("OptionMobileCard").setValue("ModifiedFlag", 0);
		app.lookup("OptionMobileCard").setValue("ExpiredDate", masterKeyInfo.getValue("ExpiredDate"));
		app.lookup("SEMCS_opbMasterKey").redraw();
		//계약 정보 갱신
		app.lookup("ConnectTest").setValue("ContractCode", app.lookup("OptionMobileCard").getValue("ContractCode"));// 초기값
		app.lookup("ConnectTest").setValue("ContractNo", app.lookup("OptionMobileCard").getValue("ContractNo"));
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Success"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function valueChange(e){
	var control = e.control;
	var controlID = control.id;
	app.lookup("OptionMobileCard").setValue("ModifiedFlag", 1);
	if (controlID == "SEMCS_cbxMobileCardEnable") {
		if (control.value == "0") {
			app.lookup("OptionMobileCard").setValue("ModifiedFlag", 0);
		}
	}
}
