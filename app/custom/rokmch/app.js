/************************************************
 * app.js
 * Created at 2018. 11. 13. 오전 9:51:52.
 *
 * @author fois
 ************************************************/
// 20200416 정래훈 - 토마토시스템에서 알려준 캐시 미사용 설정 소스
var envConfig = cpr.core.AppConfig.INSTANCE.getEnvConfig();
envConfig.setValue("appcache", false);

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
comLib = createComUtil(app);
var messageLib = null;


function onBodyInit(/* cpr.events.CEvent */ e){
	
}
// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	dataManager = getDataManager();
	
	var language = localStorage.getItem("language");
	language = "ko";
	if( language ){
		dataManager.setLocale(language);
	}else {
		language = dataManager.initLanguage();
		localStorage.setItem("language",language);
	}
	comLib.language(language);
	
	
	app.lookup("sms_chkLogin").send(); // 로그인 여부 체크
	app.lookup("LOGIN_ipbUserID").inputFilter = /^[0-9]*$/;
	//app.lookup("LOGIN_cbxMaster_Button").style.css("opacity","0"); // 오른쪽 하단에 투명한 버튼 생성. 클릭하면 관리자 로그인 활성
	
	var agent = navigator.userAgent.toLowerCase();
	
	// 공지사항 가져오기
	sendNoticeListReq();
}

// 로그인 체크 결과
function onSms_chkLoginSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	document.title = dataManager.getString("Str_ProgramName");
	
	var SystemInfo = app.lookup("SystemInfo");
	var fullversion = SystemInfo.getValue("Version");
	var verArr = fullversion.split('.');
	dataManager.setOemVersion(verArr[3]);

	messageLib = createMessageDialogUtil(app);
	messageLib.usint_versionUpdate(fullversion);
	
	// 크롬
	var BrowserWarning = app.lookup("BrowserWarning");
	var chromeLink = app.lookup("chromeLink");
	var BrowserWarning2 = app.lookup("BrowserWarning2");
	var chromeLink32 = app.lookup("chromeLink32");
	BrowserWarning.value = "";
	chromeLink.value = "";
	BrowserWarning2.value = "";
	chromeLink32.value = "";
		
	app.lookup("OPT_AppName").unbind("value");
	app.lookup("OPT_AppName").value = "출입통제 체계";
	app.lookup("OPT_AppName").style.css({
		"font-size" : "40px",
		"font-weight" : "700",
		"font-family" : "굴림"
	});
	app.lookup("LOGIN_cbxUniqueID").unbind("text");
	app.lookup("LOGIN_cbxUniqueID").text = "군번 로그인";
	app.lookup("LOGIN_cbxUniqueID").value = true;
	//app.lookup("LOGIN_imglog").dispose();
	
	var agent = navigator.userAgent.toLowerCase();
	if ( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) {
		chromeLink.removeAllEventListeners();
		chromeLink32.removeAllEventListeners();
		//chromeLink.bind("value").toLanguage("Str_ExplorerWarning");
		//chromeLink32.bind("value").toLanguage("Str_OtherBrowser");
		chromeLink.value = dataManager.getString("Str_ExplorerWarning");
		chromeLink32.value = dataManager.getString("Str_OtherBrowser");
		chromeLink.style.css({"color" : "#ff0000"});
		chromeLink32.style.css({"color" : "#ff0000"});
	}
	
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){ // 로그인 상태
		var account = app.lookup("AccountInfo");
		var result = app.lookup("Result");
		var systeminfo = app.lookup("SystemInfo");
		//console.log(systeminfo.getDatas());
		
		dataManager = getDataManager();
		dataManager.setAccountInfo(account);			
		dataManager.setSystemInfo(systeminfo);
		
		var usint_version;
//		var isMobile = false;
	
//		var filter = "win16|win32|win64|windows|mac|macintel|linux|freebsd|openbsd|sunos";			 
//		if ( navigator.platform ) { // 플랫폼 체크
//			if ( filter.indexOf( navigator.platform.toLowerCase() ) < 0 ) { //mobile 
//				isMobile = true;	
//			} 				
//		}
		
		if (dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH) { // 육본 제외
//			isMobile = false;
			usint_version = dataManager.getSystemVersion();
			var appId = "app/main/osmain" + "?" + usint_version;		
			cpr.core.App.load(appId, function(newapp) {
					app.close();
					newapp.createNewInstance().run();				
			});		
		}
			
	} else {
		app.lookup("sms_getInitOption").send(); // 브랜드 타입 요청. 사용자 아이디 자리수 제한을 위해
	}
}

// 로그인 체크 에러
function onSms_chkLoginSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 로그인 체크 타임아웃
function onSms_chkLoginSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 브랜드 타입 가져오기 완료
function onSms_getInitOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_getBrandType = e.control;
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dmBrandType = app.lookup("brandType");		
		var dmInitOption = app.lookup("initOption");
		var userIDLength = dmInitOption.getValue("userIDLength");
		//console.log("userIDLength ", userIDLength);
		var brandType = dmBrandType.getValue("Type");
		if( brandType == BRAND_NITGEN ){
			if( userIDLength < 4 || userIDLength > 19 ){
				userIDLength = 19;
			}			
		}else {
			if( userIDLength < 2 || userIDLength > 8 ){
				userIDLength = 18;
			}			
		}
		app.lookup("LOGIN_ipbUserID").maxLength = userIDLength;
		dataManager.setUserIDLength(userIDLength);
		
		//var SystemInfo = app.lookup("SystemInfo");
		var oemVersion = dataManager.getOemVersion();
		if(oemVersion == OEM_JAWOONDAE){
	//		app.lookup("LOGIN_cbxMaster_Button").enabled = true;
			app.lookup("LOGIN_cbxMaster").visible = false;
			app.lookup("LOGIN_cbxUniqueID").trueValue = true;
			app.lookup("LOGIN_cbxUniqueID").checked = true;
			changeIDInputType();
		}
		
	} else {
		console.log("else",app);
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorBrandTypeLoadingFailed"));
	}
	
	//
	app.lookup("LOGIN_ipbUserID").inputFilter = "";// /^[a-zA-Z0-9]*$/;
	app.lookup("LOGIN_ipbUserID").maxLength = 20;		
		
}

// 브랜드 타입 가져오기 에러 
function onSms_getInitOptionSubmitError(/* cpr.events.CSubmissionEvent */ e){	
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 브랜드 타입 가져오기 타임아웃
function onSms_getInitOptionSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// "SIGN IN" 버튼에서 click 이벤트 발생 시 호출.
function onLOGIN_btnSignInClick(e){
	 	
	//var SystemInfo = app.lookup("SystemInfo");
	var oemVersion = dataManager.getOemVersion();
	if(oemVersion == OEM_JAWOONDAE){
		var agent = navigator.userAgent.toLowerCase();	
		if ( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) {
			dialogAlertAMHQ(app, "경고", "인터넷 익스플로러는 지원하지 않습니다. \n상단의 크롬 설치 파일로 크롬 브라우져를 설치하신 후 크롬브라우져로 접속하시기 바랍니다");
	  		return;
		}
		else {
  			//alert("인터넷 익스플로러 브라우저가 아닙니다.");
		}
	}
	
	var requestData = app.lookup("dmLoginReq");
	var userID = app.lookup("LOGIN_ipbUserID").value;

	if( userID == null ){
		dialogAlertAMHQ(app, dataManager.getString("Str_InputDataError"), dataManager.getString("Str_UserIDInputAlert"));
		return;
	}
	
	var SystemInfo = app.lookup("SystemInfo");
	requestData.setValue( "userId", userID);
	var userType = 0;
	if(app.lookup("LOGIN_cbxMaster").value == "true" ){	
		userType = 2;
	} else if(app.lookup("LOGIN_cbxUniqueID").value == "true" ){
		userType = 1;
	} else if(app.lookup("LOGIN_ipbUserID").text == "Master"){ //자운대 버전으로 접속 후 오른쪽 하단의 투명한 버튼을 클릭했을시 관리자 로그인이 가능하도록 하기 위해 추가
		userType = 2;
	}
	requestData.setValue( "userType", userType);
	
	var userPW = app.lookup("LOGIN_ipbUserPW").value;
	if( userPW  == null || userPW.length < 4 ){
		//dialogAlertAMHQ(app, "입력정보 오류", "비밀번호는 최소 4자리입니다.");
		dialogAlertAMHQ(app, dataManager.getString("Str_InputDataError"), dataManager.getString("Str_PasswordLengthError"));
		return;
	}
	requestData.setValue( "password", userPW);
	
	app.lookup("sms_login").send();
}

// 로그인 결과 수신
function onSms_loginSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var account = app.lookup("AccountInfo");
	var result = app.lookup("Result");
	var systeminfo = app.lookup("SystemInfo");
	//console.log(systeminfo.getDatas());
	var resultCode = result.getValue("ResultCode")
	if( resultCode == 0 || resultCode == 1 || resultCode == ERROR_USER_LOGINPASSWORD_EXPIRATION ){	
		if(result.getValue("ResultCode") ==  ERROR_USER_LOGINPASSWORD_EXPIRATION ) { // 만기일자의 경우 비밀번호 변경하게 처리
			account.setValue("FirstLoginFlag", 1);
		}
		
		dataManager = getDataManager();
		dataManager.setAccountInfo(account);			
		dataManager.setSystemInfo(systeminfo);
	
		var usint_version;
		usint_version = dataManager.getSystemVersion();
		var appId = "app/main/osmain" + "?" + usint_version;			
		cpr.core.App.load(appId, function(newapp) {
			app.close();
			newapp.createNewInstance().run();				
		});
			
	}else{		
		var ResultCode = result.getValue("ResultCode");
		if (ResultCode == ERROR_USER_LOGIN_FAIL_COUNT) {
			var remindCount = app.lookup("LoginFailInfo").getValue("RemindCount");
			if (remindCount <= 0) { //0 회인경우 로그인 실패 시간으로 오류 표시
				//dialogAlertAMHQ(app, dataManager.getString("Str_ErrorLoginFail"), "더이상 로그인 할 수 없습니다. 관리자에게 문의하세요");
				if(dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
					// 여기에서 현역/군무원-> 일반사용자 // 관리자 구분
					var privilege = app.lookup("AccountInfo").getValue("Privilege");
					dataManager = getDataManager();
					dataManager.setAccountInfo(account);			
					dataManager.setSystemInfo(systeminfo);
					SetInitPasswordAMHQ(privilege);
				} else {
					dialogAlertAMHQ(app, dataManager.getString("Str_ErrorLoginFail"), dataManager.getString("Str_ErrorLoginFailTime"));		
				}
				
			} else {
				dialogAlertAMHQ(app, dataManager.getString("Str_ErrorLoginFail"), dataManager.getString("Str_ErrorLoginsRemainingCount")+" : "+ app.lookup("LoginFailInfo").getValue("RemindCount"));
			}			
		} else if (ResultCode == ERROR_LOGIN_FAIL_TIME) {
			dialogAlertAMHQ(app, dataManager.getString("Str_ErrorLoginFail"), dataManager.getString("Str_ErrorLoginFailTime"));	
		} else if (ResultCode == ErrorTempPasswordSendSuccess || ResultCode == ErrorBeforesendNextTimeMail) {	// 임시 비번 메일 전송 성공 or 이미 전송 완료
			if(dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
				// 여기에서 현역/군무원-> 일반사용자 // 관리자 구분
				var privilege = app.lookup("AccountInfo").getValue("Privilege");
				var remindCount = app.lookup("LoginFailInfo").getValue("RemindCount");	// 0 은 loginFailCount 초과 , -1 은 90일 이후 만료 사용자
				dataManager = getDataManager();
				dataManager.setAccountInfo(account);
				dataManager.setSystemInfo(systeminfo);
				CheckTempPasswordAMHQ(privilege, remindCount);
			}
		} else if ( ResultCode == ErrorTempPasswordMailSendFail ) {
			dialogAlertAMHQ(app, "임시 비밀번호 메일 전송 실패", "임시 비밀번호 전송에 실패하였습니다. \n관리자에게 문의 바랍니다.");
		} else if ( ResultCode == ErrorUserNoEmailAddress ) {
			dialogAlertAMHQ(app, "임시 비밀번호 메일 전송 실패", "해당 사용자 이메일이 등록되지 않았습니다. \n관리자에게 문의 바랍니다.");
		} else {
			var msg = dataManager.getString(getErrorString(resultCode));
			if( msg == undefined || msg == ""){msg = dataManager.getString("Str_ErrorLoginFailed") }
			
			dialogAlertAMHQ(app, dataManager.getString("Str_ErrorLoginFail"), msg);
			//dialogAlertAMHQ(app, dataManager.getString("Str_ErrorLoginFail"), dataManager.getString("Str_ErrorLoginFailed"));			
		}
	
	}
	
}
// 서브미션에서 submit-success 이벤트 발생 시 호출. 
function onSms_loginSubmitSuccess(e){	
}

// 서브미션에서 submit-error 이벤트 발생 시 호출.
function onSms_loginSubmitError(/* cpr.events.CSubmissionEvent */ e){		
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);			
}

// 서브미션에서 submit-timeout 이벤트 발생 시 호출.
function onSms_loginSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 유니크 아이디 로그인 체크박스 클릭
function onLOGIN_cbxUniqueIDValueChange(/* cpr.events.CValueChangeEvent */ e){	
	changeIDInputType();
}

function changeIDInputType(){
	var cbxUniqueID = app.lookup("LOGIN_cbxUniqueID");
	if(cbxUniqueID.value == "true" ){			
		app.lookup("LOGIN_ipbUserID").inputFilter = ""// /^[a-zA-Z0-9]*$/;
		app.lookup("LOGIN_ipbUserID").maxLength = 20;		
	} else {
		app.lookup("LOGIN_ipbUserID").inputFilter = /^[0-9]*$/;
		var dmBrandType = app.lookup("brandType");		
		var brandType = dmBrandType.getValue("Type");
		if( brandType == BRAND_NITGEN ){
			app.lookup("LOGIN_ipbUserID").maxLength = 19;			
		}else {
			app.lookup("LOGIN_ipbUserID").maxLength = 8;
		}
	}
}

// 마스터 관리자 체크
function onLOGIN_cbxMasterValueChange(/* cpr.events.CValueChangeEvent */ e){
	var lOGIN_cbxMaster = e.control;
	if(lOGIN_cbxMaster.checked == true ){		
		app.lookup("LOGIN_ipbUserID").inputFilter = /^[a-zA-Z0-9]*$/;
		app.lookup("LOGIN_ipbUserID").text = "Master";
		app.lookup("LOGIN_ipbUserID").readOnly = true;
		app.lookup("LOGIN_cbxUniqueID").checked = false;
		app.lookup("LOGIN_cbxUniqueID").enabled = false;
	} else {
		app.lookup("LOGIN_ipbUserID").text = "";
		app.lookup("LOGIN_ipbUserID").readOnly = false;
		app.lookup("LOGIN_cbxUniqueID").enabled = true;
		changeIDInputType();
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onLOGIN_ipbUserPWKeyup(/* cpr.events.CKeyboardEvent */ e){
	var lOGIN_ipbUserPW = e.control;
	if( e.keyCode == 13 ){ // 검색창에서 Enter 입력시..
 		onLOGIN_btnSignInClick();
 	}
}

function SetInitPasswordAMHQ(privilegeID) {
	var appld;
	var usint_version;
	var prop;
	usint_version = dataManager.getSystemVersion();
	if (privilegeID == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_ErrorLoginFail"), "관리자 권한이 비정상 상태입니다. \n상위관리자에게 문의 하세요");
		return;
	} else {
		if (privilegeID == UserPrivArmyOnDuty || privilegeID == UserPrivArmyMilitaryPersonnel 
			|| privilegeID == UserPrivArmyPublicService ) {
			// 이름 사번 생년월일 -> 초기화
			appld = "app/custom/rokmch/system/userInitPassword"  + "?" + usint_version;
			prop = {width : 460, height : 300};
		} else if (privilegeID == 1) {
			appld = "app/custom/rokmch/system/adminInitPassword"  + "?" + usint_version;
			prop = {width : 480, height : 330};
		} else {
			dialogAlertAMHQ(app, dataManager.getString("Str_ErrorLoginFail"), "초기화 진행 할수 없는 관리자 입니다. \n상위관리자에게 문의하세요");
			return;
		}
		 				 
		app.openDialog(appld, prop, function(dialog){
			dialog.ready(function(dialogApp){
				dialog.headerTitle = "패스워드 초기화 시스템";
				dialog.style.header.css("background-color", "#528443");
				dialog.modal = true;
				dialog.initValue = {"privilegeID": privilegeID};
			});
		}).then(function(returnValue){
			if (returnValue == true) {
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "패스워드 초기화가 완료 되었습니다. \n다시 로그인 시도 해주세요");	
			} else {
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "패스워드 초기화가 실패 되었습니다. \n관리자에게 문의하세요");
			}
		});
	}
	return;
}


function sendNoticeListReq() {
	
	var sms_getSystemNoticeList = app.lookup("sms_getSystemNoticeList");
	
	app.lookup("SystemNoticeList").clear();
	var offset = 0;
	var fNotice_pageRowCount = 3;
	sms_getSystemNoticeList.setParameters("limit", fNotice_pageRowCount);
	sms_getSystemNoticeList.setParameters("offset", offset);	
	sms_getSystemNoticeList.send();
}

function validateDate( value ){
	if (value==undefined||value == "0001-01-01T00:00:00Z"){return "";}
	if (value.substring(0, 10)=="0001-01-01"){return;}
	return value.substring(0, 10);// +" " + value.substring(11, 19);	
}
function onSms_getSystemNoticeListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {	
		var systemNoticeList = app.lookup("SystemNoticeList");
		var count = systemNoticeList.getRowCount();
		for(var i=0; i<count; i++){
			var systemNotice = systemNoticeList.getRow(i);
			systemNotice.setValue("RegistAt", validateDate(systemNotice.getValue("RegistAt")));
		}
		systemNoticeList.commit();	
	} else {				
		//dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getSystemNoticeListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getSystemNoticeListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onGrd_system_noticeRowDblclick(/* cpr.events.CGridMouseEvent */ e){
	var grdSystemNotice = app.lookup("grd_system_notice");
	var idx = grdSystemNotice.getSelectedRowIndex();	
	var noticeInfo = grdSystemNotice.getRow(idx);
	var noticeIdx = noticeInfo.getValue("NoticeIndex");
	// 다이얼로그 호출
	//app.getHostAppInstance().callAppMethod("changeMenu","60502",{"Idx":noticeIdx});
	var today = new Date();  
	var appld = "app/custom/rokmch/notice/noticeView" + "?" + today.toDateString();	
	var prop = {width : 900, height : 530};
	app.openDialog(appld,prop, function(dialog){
		dialog.ready(function(dialogApp){
			//dialog.bind("headerTitle").toLanguage("시스템 공지사항");
			dialog.modal = true;
			dialog.initValue = {"Idx": noticeIdx};
			dialog.style.header.css("background-color", "#528443");
			dialog.headerTitle = ("시스템 공지사항");
		});
	}).then(function(returnValue){	
		console.log(returnValue);
	});
	grdSystemNotice.clearSelection();
}


/*
 * 버튼(LOGIN_btnHidden)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onLOGIN_btnHiddenClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var lOGIN_btnHidden = e.control;
	app.lookup("LOGIN_cbxMaster").visible = !app.lookup("LOGIN_cbxMaster").visible; 
}

// 임시 비밀번호 check
function CheckTempPasswordAMHQ(privilegeID, remindCountFlag) {
	var appld;
	var usint_version;
	var prop;
	usint_version = dataManager.getSystemVersion();
	
	if (privilegeID == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_ErrorLoginFail"), "관리자 권한이 비정상 상태입니다. \n상위관리자에게 문의 하세요");
		return;
	} else {
		if (privilegeID == UserPrivArmyOnDuty || privilegeID == UserPrivArmyMilitaryPersonnel 
			|| privilegeID == UserPrivArmyPublicService || privilegeID == 1) {
			// 임시 비밀번호 -> 인증 성공시 비밀번호 변경
			appld = "app/custom/rokmch/system/userTempPassword"  + "?" + usint_version;
			prop = {width : 610, height : 310};
		} else {
			dialogAlertAMHQ(app, dataManager.getString("Str_ErrorLoginFail"), "초기화 진행 할수 없는 관리자 입니다. \n상위관리자에게 문의하세요");
			return;
		}
		
		var dmLoginInfo = app.lookup("dmLoginReq");
		var userID = dmLoginInfo.getValue("userId");
		var userType = dmLoginInfo.getValue("userType");
		
		app.openDialog(appld, prop, function(dialog){
			dialog.ready(function(dialogApp){
				dialog.headerTitle = "임시 비밀번호 인증 시스템";
				dialog.modal = true;
				dialog.style.header.css("background-color", "#528443");
				dialog.initValue = {"privilegeID": privilegeID, "userID": userID, "userType": userType, "flag": remindCountFlag};
			});
		}).then(function(returnValue){
			var result = returnValue["result"]
			if (result == 0) {
				var temp = returnValue["temp"];
				SetUserPasswordByTempPassword(temp);
			} else {
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "패스워드 초기화가 실패 되었습니다. \n관리자에게 문의하세요");
			}
		});
	}
	return;
}

// 인증비밀번호 후 사용자 비밀번호 변경
function SetUserPasswordByTempPassword(val) {
	
	var appld;
	var usint_version;
	var prop;
	usint_version = dataManager.getSystemVersion();
	
	var dmLoginInfo = app.lookup("dmLoginReq");
	
	appld = "app/custom/rokmch/system/setUserPasswordAMHQ" + "?" + usint_version;
	app.openDialog(appld, {width : 610, height : 350}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.headerTitle = "비밀번호 변경";
			dialog.modal = true;
			dialog.style.header.css("background-color", "#528443");
			dialog.initValue = {"temp": val};
		});
	}).then(function(returnValue){
		if (returnValue == true) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "패스워드 초기화가 완료 되었습니다. \n다시 로그인 시도 해주세요");
		} else {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "패스워드 초기화가 실패 되었습니다. \n관리자에게 문의하세요");
		}
	});
		
	return;
}
