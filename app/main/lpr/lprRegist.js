/************************************************
 * lprRegist.js
 * Created at 2020. 7. 2. 오전 11:13:01.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var LPRRG_reqType;
var comLib;
var LPRRG_version;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	LPRRG_version = dataManager.getSystemVersion();
	
	var initValue = app.getHost().initValue;
	var reqType = initValue["reqType"];
	
	if (reqType == 0) {// 추가
		LPRRG_reqType = reqType;	
		app.lookup("LPRRG_btnRegist").value = dataManager.getString("Str_Enrollment");
	} else { // 변경
		LPRRG_reqType = reqType;	
		app.lookup("LPRRG_btnRegist").value = dataManager.getString("Str_Update");
		var DeviceID = initValue["DeviceID"];
		console.log(DeviceID);
		comLib.showLoadMask("",dataManager.getString("Str_GetLprInfo"),"",0); //dataManager.getString("Str_UserPhotoSave")	
		var smsGetLpr = app.lookup("sms_getLprInfo");
		smsGetLpr.action = "/v1/lpr/" + DeviceID;
		smsGetLpr.send(); 
	}
	
}


/*
 * "등록" 버튼(JWDLR_btnRegist)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWDLR_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	if (LPRRG_reqType == 0) {
		var smsPostLpr = app.lookup("sms_postLprInfo");
		smsPostLpr.send();	
	} else {
		var dmLprInfo = app.lookup("LprInfo");
		var sms_putLprInfo = app.lookup("sms_putLprInfo");
		sms_putLprInfo.action = "/v1/lpr/" + dmLprInfo.getValue("DeviceID");
		sms_putLprInfo.send();
	}
	
	
}

function onSms_postLprInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		//dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_lprRegist"));
		app.close({"Result":0}); // 성공
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_postLprInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

function onSms_postLprInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onLPRRG_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	app.close({"Result":1}); // 
}

function onSms_getLprInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		console.log(app.lookup("LprInfo").getDatas());
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("LPRRG_grpMain").redraw();
}

function onSms_getLprInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

function onSms_getLprInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_putLprInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
	//	dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_lprUpdate"));
		app.close({"Result":0}); // 성공
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_putLprInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

function onSms_putLprInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
