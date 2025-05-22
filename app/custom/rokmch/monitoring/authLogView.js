/************************************************
 * AuthLogView.js
 * Created at 2019. 1. 9. 오후 4:31:28.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
var oem_version;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	
	initControl();
		
	var initValue = app.getHost().initValue;
	var indexKey = initValue["ID"];
			
	var dmAuthLogDetail = app.lookup("AuthLogDetail");
	dmAuthLogDetail.setValue("IndexKey",indexKey);
	
	var smsGetAuthLogListDetail = app.lookup("sms_getAuthLogListDetail");		
	sendAuthLogDetailRequest(0);	
}

function initControl(){
	
	var cmbAuthType = app.lookup("ALVEW_cmbAuthType");
	if (cmbAuthType) {
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPVerify"), 1));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPIdentify"), 2));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Password"), 3));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Card"), 4));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceVerify"), 5));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceIdentify"), 6));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_MobileCard"), 7));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeIrisIdentify"), 8));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeIrisVerify"), 9));
		
		
		if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
			cmbAuthType.addItem(new cpr.controls.Item("PDA", 9998));
			cmbAuthType.addItem(new cpr.controls.Item("LPR", 9999));
		}
	}

	var cmbAuthResult = app.lookup("ALVEW_cmbAuthResult");
	if (cmbAuthResult) {
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_Success"), AuthLogResultSuccess));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFail"), AuthLogResultFail));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAccessDenied"), AuthLogResultAccessDenied));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeout"), AuthLogResultTimeout));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutCapture"), AuthLogResultTimeoutCapture));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutIdentify"), AuthLogResultTimeoutIdentify));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAntiPassback"), AuthLogResultAntiPassback));	
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuress"), AuthLogResultDuress));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultBlackList"), AuthLogResultBlackList));
		
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultUnregistUser"), AuthLogResultInvalidUser));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFPCaptureFailed"), AuthLogResultCapture));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuplicatedAuth"), AuthLogResultDuplicatedAuthentication));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultNetworkError"), AuthLogResultNetwork));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultServerBusy"), AuthLogResultServerBusy));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFaceDetectionFailed"), AuthLogResultFaceDetection));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealPay"), AuthLogResultFailMealPay));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealTime"), AuthLogResultFailMealTime));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailNotExistsMealCode"), AuthLogResultFailNotExistsMealCode));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailPeriod"), AuthLogResultFailPeriod));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealLimit"), AuthLogResultFailMealLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailDayLimit"), AuthLogResultFailDayLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMonthLimit"), AuthLogResultFailMonthLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultSoftpassback"), AuthLogResultSoftpassback));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultNoMask"), AuthLogResultNoMask));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFeverDetection"), AuthLogResultFeverDetection));
	}

	
}

function sendAuthLogDetailRequest( offset ){
		
	var dmAuthLogDetail = app.lookup("AuthLogDetail");
	var indexKey = dmAuthLogDetail.getValue("IndexKey");
	dmAuthLogDetail.clear();
	dmAuthLogDetail.setValue("IndexKey",indexKey);
	
	var smsGetAuthLogListDetail = app.lookup("sms_getAuthLogListDetail");
	
	smsGetAuthLogListDetail.action = "/v1/authLogs/" + indexKey;	
	smsGetAuthLogListDetail.setParameters("offset", offset);	
		
	smsGetAuthLogListDetail.send();	
}

// 인증로그 상세정보 가져오기 완료
function onSms_getAuthLogListDetailSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){ // 로그인 상태		
		displayAuthLogDetail();
		
	} else if( resultCode == 4){
		dialogAlertAMHQ(app, dataManager.getString("Str_Info") , dataManager.getString("Str_LastData"));
	} else {
		//dialogAlertAMHQ(app, dataManager.getString("Str_Failed") , dataManager.getString("Str_NoSearchResult"));
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed") , dataManager.getString(getErrorString(resultCode)));
		//app.close();
	}
}

// 인증로그 상세정보 가져오기 에러
function onSms_getAuthLogListDetailSubmitError(/* cpr.events.CSubmissionEvent */ e){	
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 인증로그 상세정보 가져오기 타임아웃
function onSms_getAuthLogListDetailSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}


// "< 이전 로그" 버튼에서 click 이벤트 발생 시 호출. 
function onALVEW_btnPrevAuthLogClick(/* cpr.events.CMouseEvent */ e){
	sendAuthLogDetailRequest(-1);
}

// "다음 로그 >" 버튼에서 click 이벤트 발생 시 호출.
function onALVEW_btnNextAuthLogClick(/* cpr.events.CMouseEvent */ e){
	sendAuthLogDetailRequest(1);
}

function displayAuthLogDetail() {
	var dmAuthLogDetail = app.lookup("AuthLogDetail");
	app.lookup("user_id").value = dmAuthLogDetail.getValue("UserID");	// 사용자 ID
	app.lookup("user_name").value = dmAuthLogDetail.getValue("UserName"); // 사용자 이름
	app.lookup("event_time").value = dmAuthLogDetail.getValue("EventTime");	// 이벤트 발생 시간
	
	app.lookup("card_no").value = dmAuthLogDetail.getValue("Card");	// 카드번호
	
	var userType = dmAuthLogDetail.getValue("UserType");
	if( userType > 9999 ){
		app.lookup("optCardNum").text = "차량번호";
	}else{
		app.lookup("optCardNum").text = "카드번호";
	}
	
	//app.lookup("func_type").value = dmAuthLogDetail.getValue("FuncType");	// 기능 타입 
	
	// 사용자 사진
	var userImage = dmAuthLogDetail.getValue("UserImage");
	if( userImage.length > 0){
		app.lookup("user_image").src = "data:image/png;base64," + dmAuthLogDetail.getValue("UserImage");
	}else{
		app.lookup("user_image").src = "../../../theme/images/noImg.gif";		
	}
	
	// 인증로그 사진
	var logImage = dmAuthLogDetail.getValue("LogImage");
	if( logImage.length > 0){
		app.lookup("log_image").src = "data:image/png;base64," + dmAuthLogDetail.getValue("LogImage");
	}else{
		app.lookup("log_image").src = "../../../theme/images/noImg.gif";		
	}

	var grpAuthLogDetailView = app.lookup("ALVEW_grpAuthLogDetailView");	
	grpAuthLogDetailView.redraw(); 
}


// 도움말
function onALVEW_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

