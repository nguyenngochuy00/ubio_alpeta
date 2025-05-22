/************************************************
 * LicenseInfo.js
 * Created at 2019. 3. 28. 오전 11:10:27.
 *
 * @author wonki
 ************************************************/

var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var cmbLicenseLevel = app.lookup("LMVEW_cmbLicenseLevel");
	cmbLicenseLevel.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseLITE"),LicenseLITE));
	cmbLicenseLevel.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseSTANDARD"),LicenseSTANDARD));
	cmbLicenseLevel.addItem(new cpr.controls.Item(dataManager.getString("Str_LicensePREMIUM"),LicensePREMIUM));
	cmbLicenseLevel.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseENTERPRISE"),LicenseENTERPRISE));
	
	var cmbLicenseStatus = app.lookup("LMVEW_cmbLicenceStatus");
	cmbLicenseStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseNormal"),0));
	cmbLicenseStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseExpired"),1));	
	cmbLicenseStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_LicenseInvalidMac"),2));
		
	var sms_getLicense = app.lookup("sms_getLicense");
	sms_getLicense.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getLicenseSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getLicense = e.control;
	console.log(app.lookup("LicenseInfo").getDatas());
	app.lookup("LMVEW_grpLicenseInfo").redraw();	
}


/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onLMVEW_btnFileSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var lMVEW_btnFileSearch = e.control;
	
	var fileInput = app.lookup("LMVEW_fiLicense");
	fileInput.openFileChooser();	
}


// 라이센스 등록 클릭
function onLMVEW_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button */
	var lMVEW_btnRegist = e.control;
	
	//var fileInput = app.lookup("LMVEW_fiLicense");
	var sms_postLicense = app.lookup("sms_postLicense");
	//sms_postLicense.addFileParameter("license", fileInput.file);
	
	comLib.showLoadMask("", dataManager.getString("Str_LicenseRegist"), "", 0);
	sms_postLicense.send();			
}


// 라이선스 등록 완료
function onSms_postLicenseSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission */
	var sms_postLicense = e.control;
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode"); 
	if( resultCode != 0 ){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
	app.lookup("LMVEW_grpLicenseInfo").redraw();
	comLib.hideLoadMask();	
}

// 라이선스 등록 에러
function onSms_postLicenseSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",-1)
}

// 라이선스 등록 타임아웃
function onSms_postLicenseSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",-2)
}

// 클라이언트 키 생성 클릭
function onLMVEW_btnCreateClick(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button */
	var lMVEW_btnCreate = e.control;	
	var sms_getClientKey = app.lookup("sms_getClientKey");		
	comLib.showLoadMask("", dataManager.getString("Str_ClientKeyRequest"), "", 0);
	sms_getClientKey.send();			
}

// 클라이언트 키 가져오기 완료
function onSms_getClientKeySubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	comLib.hideLoadMask();	
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode"); 
	app.lookup("LMVEW_ipbClientKey").redraw();
	if( resultCode == 0 ){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ClientKeyCreateSucceed"));
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ClientKeyCreateFailed"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 클라이언트 키 가져오기 에러
function onSms_getClientKeySubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 클라이언트 키 가져오기 타임아웃
function onSms_getClientKeySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}
