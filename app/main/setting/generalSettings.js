/************************************************
 * OptionFrame.js
 * Created at 2019. 4. 29. 오후 1:10:42.
 *
 * @author wonki
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dashboardSettingModule = cpr.core.Module.require("udc.dashboard.Setting");
var initSystem = "";
var initUser = "";
var initTerminal = "";
var initAuth = "";
var initLog = "";
var initMail = "";
var initTNA = "";
var initDDNS = "";
var initExDB = "";
var initInnodep = "";
var initElevator = "";
var usint_version;
var OEM_VERSION;

var ENABLE_INNODEP_VMS = 0;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	OEM_VERSION = dataManager.getOemVersion();
	ENABLE_INNODEP_VMS = dataManager.getENABLE_INNODEP_VMS();
	
	var treeCategory = app.lookup("OPSET_treCategory");
	var treeItemSet_General = new cpr.controls.TreeItem(dataManager.getString("Str_General"),"app/main/setting/OptionPageSystem",0);
	var treeItemSet_User = new cpr.controls.TreeItem(dataManager.getString("Str_User"),"app/main/setting/OptionPageUser", 0);
	var treeItemSet_Authentication = new cpr.controls.TreeItem(dataManager.getString("Str_Authentication"),"app/main/setting/OptionPageAuth", 0);
	var treeItemSet_Emergency = new cpr.controls.TreeItem(dataManager.getString("Str_Emergency"),"app/main/setting/OptionPageTerminal", 0);
	var treeItemSet_Log = new cpr.controls.TreeItem(dataManager.getString("Str_Log"),"app/main/setting/OptionPageLog", 0);
	var treeItemSet_eMail = new cpr.controls.TreeItem(dataManager.getString("Str_eMail"),"app/main/setting/OptionPageMail", 0);
	var treeItemSet_TNA = new cpr.controls.TreeItem(dataManager.getString("Str_TNA"),"app/main/setting/OptionPageTNA", 0);
	var treeItemSet_DDNS = new cpr.controls.TreeItem(dataManager.getString("Str_DDNS"),"app/main/setting/OptionPageDDNS", 0);
	var treeItemSet_ExDB = new cpr.controls.TreeItem(dataManager.getString("Str_ExDB"),"app/main/setting/OptionPageExDB", 0);
	var treeItemSet_Dashboard = new cpr.controls.TreeItem(dataManager.getString("Str_DashBoard"),"app/main/setting/OptionPageDashboard", 0);
	var treeItemSet_Innodep = new cpr.controls.TreeItem(dataManager.getString("Str_DDNS"),"app/main/setting/OptionPageInnodep", 0);
	var treeItemSet_Elevator = new cpr.controls.TreeItem(dataManager.getString("Str_Elevator"),"app/main/setting/OptionPageElevator", 0);
	var treeItemSet_Visitor = new cpr.controls.TreeItem(dataManager.getString("Str_Visitor"),"app/main/setting/optionPageVisitor", 0);
	var treeItemSet_MobileCard = new cpr.controls.TreeItem(dataManager.getString("Str_MobileCard"),"app/main/setting/optionPageMobileCard", 0);
	
	treeItemSet_General.bind("label").toLanguage("Str_General");
	treeItemSet_User.bind("label").toLanguage("Str_User");
	treeItemSet_Authentication.bind("label").toLanguage("Str_Authentication");
	treeItemSet_Emergency.bind("label").toLanguage("Str_Emergency");
	treeItemSet_Log.bind("label").toLanguage("Str_Log");
	treeItemSet_eMail.bind("label").toLanguage("Str_eMail");
	treeItemSet_TNA.bind("label").toLanguage("Str_TNA");
	treeItemSet_DDNS.bind("label").toLanguage("Str_DDNS");
	treeItemSet_ExDB.bind("label").toLanguage("Str_ExDB");
	treeItemSet_Dashboard.bind("label").toLanguage("Str_DashBoard");
	treeItemSet_Innodep.bind("label").toLanguage("Str_Innodep");
	treeItemSet_Elevator.bind("label").toLanguage("Str_Elevator");
	treeItemSet_Visitor.bind("label").toLanguage("Str_Visitor");
	treeItemSet_MobileCard.bind("label").toLanguage("Str_MobileCard");
	
	treeCategory.addItem(treeItemSet_General);	
	treeCategory.addItem(treeItemSet_User);
	treeCategory.addItem(treeItemSet_Authentication);
	treeCategory.addItem(treeItemSet_Emergency);
	treeCategory.addItem(treeItemSet_Log);
	treeCategory.addItem(treeItemSet_TNA);
	treeCategory.addItem(treeItemSet_ExDB);
		
	var LicenseLevel = dataManager.getSystemLicenseLevel()
	// 스탠다드
	if (LicenseLevel >= LicenseSTANDARD) { 
		treeCategory.addItem(treeItemSet_Visitor);
		treeCategory.addItem(treeItemSet_eMail);
		if (dataManager.getMobileCardVersion() == OEM_MOBILECARD_UBIOXKEY) {
			treeCategory.addItem(treeItemSet_MobileCard); // PREMIUM -> STANDARD 			
		}
	}
	
	if (LicenseLevel >= LicensePREMIUM) { 
		treeCategory.addItem(treeItemSet_DDNS);
		//treeCategory.addItem(treeItemSet_eMail);
		treeCategory.addItem(treeItemSet_Dashboard);
	}	
	
	if(LicenseLevel >= LicenseENTERPRISE){
		treeCategory.addItem(treeItemSet_Elevator);
		
		if(ENABLE_INNODEP_VMS == 1)
			treeCategory.addItem(treeItemSet_Innodep);
	}
	
	treeCategory.selectItem(0);
	
	var oemVersion = dataManager.getOemVersion();
	if(oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) {
		treeCategory.deleteItemByValue("app/main/setting/OptionPageTNA");
	} else if (dataManager.getOemVersion() == OEM_GS_BASIC){
		treeCategory.deleteItemByValue("app/main/setting/OptionPageTerminal");
		treeCategory.deleteItemByValue("app/main/setting/OptionPageExDB");
		treeCategory.deleteItemByValue("app/main/setting/optionPageVisitor");
		treeCategory.deleteItemByValue("app/main/setting/OptionPageMail");
		treeCategory.deleteItemByValue("app/main/setting/OptionPageDDNS");
		treeCategory.deleteItemByValue("app/main/setting/OptionPageDashboard");
		treeCategory.deleteItemByValue("app/main/setting/optionPageMobileCard");
		treeCategory.deleteItemByValue("app/main/setting/OptionPageElevator");
	}
	
	
	var smsGetOption = app.lookup("sms_getOption");
	smsGetOption.send();
	
	if (LicenseLevel >= LicensePREMIUM) { // 라이센스 버전 낮으면
		// 대시보드 설정 요청	
		var smsGetOption = app.lookup("sms_getDashboardOption");
		smsGetOption.send();	
	}
}

/* 트리에서 selection-change 이벤트 발생 시 호출. */
function onTre1SelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** @type cpr.controls.Tree	 */
	var tre1 = e.control;
	var val = e.newSelection[0].value + "?" + usint_version;
	var emb = app.lookup("OPSET_eaOptionPage");
	var embAppIns = emb.getEmbeddedAppInstance();
	
	cpr.core.App.load(val, function(loadedApp) {
		if (embAppIns && embAppIns.hasAppMethod("requestSetData")) { // 결과를 기다려야 하는 경우
			embAppIns.callAppMethod("requestSetData");
		}		
		emb.app = loadedApp;
	});
}

exports.getSystemData = function() {
	var dmSystem = app.lookup("OptionSystem");
	return dmSystem;
}
exports.setSystemData = function(/*cpr.data.DataMap*/data) {
	var dmSystem = app.lookup("OptionSystem");
	data.copyToDataMap(dmSystem);
}

exports.getUserData = function() {
	var dmUser = app.lookup("OptionUser");
	return dmUser;
}
exports.setUserData = function(/*cpr.data.DataMap*/data) {
	var dmUser = app.lookup("OptionUser");
	data.copyToDataMap(dmUser); 
}

exports.getTerminalData = function() {
	var dmTerminal = app.lookup("OptionTerminal");
	return dmTerminal;
}
exports.setTerminalData = function(/*cpr.data.DataMap*/data) {
	var dmTerminal = app.lookup("OptionTerminal");
	data.copyToDataMap(dmTerminal); 
}

exports.getAuthData = function() {
	var dmAuth = app.lookup("OptionAuth");
	return dmAuth;
}
exports.setAuthData = function(/*cpr.data.DataMap*/data) {
	var dmAuth = app.lookup("OptionAuth");
	data.copyToDataMap(dmAuth); 
}

exports.getVisitorData = function() {
	var dmOptionVisitor = app.lookup("OptionVisitor");
	//console.log("ge",app.lookup("OptionVisitor").getDatas());
	return dmOptionVisitor;
}
exports.setVisitorData = function(/*cpr.data.DataMap*/data) {
	var dmOptionVisitor = app.lookup("OptionVisitor");
	data.copyToDataMap(dmOptionVisitor); 
}


exports.getLogData = function() {
	var dmLog = app.lookup("OptionLog");
	return dmLog;
}
exports.setLogData = function(/*cpr.data.DataMap*/data) {
	var dmLog = app.lookup("OptionLog");
	data.copyToDataMap(dmLog); 
}

exports.getMailData = function() {
	var dmMail = app.lookup("OptionMail");
	return dmMail;
}
exports.setMailData = function(/*cpr.data.DataMap*/data) {
	var dmMail = app.lookup("OptionMail");
	data.copyToDataMap(dmMail); 
}

exports.getTNAData = function() {
	var dmTNA = app.lookup("OptionTNA");
	return dmTNA;
}
exports.setTNAData = function(/*cpr.data.DataMap*/data) {
	var dmTNA = app.lookup("OptionTNA");
	data.copyToDataMap(dmTNA); 
}

exports.getDDNSData = function() {
	var dmDDNS = app.lookup("OptionDDNS");
	return dmDDNS;
}
exports.setDDNSData = function(/*cpr.data.DataMap*/data) {
	var dmDDNS = app.lookup("OptionDDNS");
	data.copyToDataMap(dmDDNS); 
}


exports.getInnodepData = function() {
	var dm = app.lookup("OptionInnodep");
	return dm;
}
exports.setInnodepData = function(/*cpr.data.DataMap*/data) {
	var dm = app.lookup("OptionInnodep");
	data.copyToDataMap(dm);
}

exports.getElevatorData = function() {
	var dmElevator = app.lookup("OptionElevator");
	return dmElevator;
}

exports.getUserSyncCycleData = function() {
	var dm = app.lookup("OptionUserSyncCycle");
	return dm;
}

exports.setUserSyncCycleData = function(/*cpr.data.DataMap*/data) {
	var dm = app.lookup("OptionUserSyncCycle");
	data.copyToDataMap(dm); 
}


exports.setElevatorData = function(/*cpr.data.DataMap*/data) {
	var dmElevator = app.lookup("OptionElevator");
	data.copyToDataMap(dmElevator);
}

exports.getMobileCardData = function() {
	var dmMobileCard = app.lookup("OptionMobileCard");
	return dmMobileCard;
}
exports.setMobileCardData = function(/*cpr.data.DataMap*/data) {
	var dmMobileCard = app.lookup("OptionMobileCard");
	data.copyToDataMap(dmMobileCard);	
}

exports.setDashboardData = function() {
	// 대시보드 설정 정보 저장
	var dsOptionDashboard = app.lookup("OptionDashboard");
	dsOptionDashboard.clear();
	
	var dSettingSize = dashboardSettingModule.getSettingLength();
	if (dSettingSize != 0){
		for (var i=0 ; i < dSettingSize; i++) {
			var newRow = {"UserID": dashboardSettingModule.getSettingUserID(i) ,"WedgetID": dashboardSettingModule.getSettingWGID(i), "Layout": dashboardSettingModule.getSettingWGLayout(i),"Index": dashboardSettingModule.getSettingWGIndex(i)};
			dsOptionDashboard.addRowData(newRow);
		}
	}
}

// 초기 정보 설정
function setInitData() {
	var dmSystem = app.lookup("OptionSystem");
	var dmUser = app.lookup("OptionUser");
	var dmTerminal = app.lookup("OptionTerminal");
	var dmAuth = app.lookup("OptionAuth");
	var dmLog = app.lookup("OptionLog");
	var dmMail = app.lookup("OptionMail");
	var dmTNA = app.lookup("OptionTNA");
	var dmDDNS = app.lookup("OptionDDNS");
	var dmExDB = app.lookup("OptionExDB");
	var dmInnodep = app.lookup("OptionInnodep");
	var dmElevator = app.lookup("OptionElevator");
	
	initSystem = JSON.stringify(dmSystem.getDatas());
	initUser = JSON.stringify(dmUser.getDatas());
	initTerminal = JSON.stringify(dmTerminal.getDatas());
	initAuth = JSON.stringify(dmAuth.getDatas());
	initLog = JSON.stringify(dmLog.getDatas());
	initMail = JSON.stringify(dmMail.getDatas());
	initTNA = JSON.stringify(dmTNA.getDatas());
	initDDNS = JSON.stringify(dmDDNS.getDatas());
	initExDB = JSON.stringify(dmExDB.getDatas());
	initInnodep = JSON.stringify(dmInnodep.getDatas());
	initElevator = JSON.stringify(dmElevator.getDatas());
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") != COMERROR_NONE) {		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Error")+" : "+dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
		return;
	}
		
	setInitData();
	var dmSystem = app.lookup("OptionSystem");
	//console.log(dmSystem.getValue("ServerLanguage"));
	var treCategory = app.lookup("OPSET_treCategory");
	treCategory.selectItem(0);
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOPSET_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	
	var emb = app.lookup("OPSET_eaOptionPage");
	var embAppIns = emb.getEmbeddedAppInstance();
	if (embAppIns) {
		if (embAppIns.hasAppMethod("requestSetData")) {
			embAppIns.callAppMethod("requestSetData");		
		}	
	}
	// 로그 저장 일수 유효성 검사 
	var LogOptionPeriodAuth = app.lookup("OptionLog").getValue("SaveAuthlogPeriod");
	var LogOptionPeriodSys = app.lookup("OptionLog").getValue("SaveSyslogPeriod");
	var LogOptionPeriodTerminal = app.lookup("OptionLog").getValue("SaveTerminallogPeriod");
	if (LogOptionPeriodAuth < 0 || LogOptionPeriodAuth > 5000) {
		dialogAlert(app, dataManager.getString("Str_Fail"),dataManager.getString("Str_StoreAccessLog"));
		return
	} else if (LogOptionPeriodSys < 0 || LogOptionPeriodSys > 5000) {
		dialogAlert(app, dataManager.getString("Str_Fail"),dataManager.getString("Str_StoreEventLog"));
		return
	} else if (LogOptionPeriodTerminal < 0 || LogOptionPeriodTerminal > 5000) {
		dialogAlert(app, dataManager.getString("Str_Fail"),dataManager.getString("Str_StoreTerminalLog"));
		return
	} else {
	}
	
	var mobileCardOption = app.lookup("OptionMobileCard");
	if (dataManager.getMobileCardVersion() == OEM_MOBILECARD_ALPETA){
		mobileCardOption.setValue("EnableFlag", 0);
	}
	var enableFlag = mobileCardOption.getValue("EnableFlag");
	if( enableFlag == 1 ){
		var masterKey = mobileCardOption.getValue("MasterKey");
		if( masterKey.length == 0 ){
			dialogAlert(app, dataManager.getString("Str_Fail"),dataManager.getString("Str_MobileCardConTestRequired"));
			return
		}
		
		var modifiedFlag = mobileCardOption.getValue("ModifiedFlag");
		if (modifiedFlag == 0) {
			// pass
		} else {
			dialogAlert(app, dataManager.getString("Str_Fail"),dataManager.getString("Str_MobileCardConTestRequired"));
			return
		} 
	}
	
	var dmSystem = app.lookup("OptionSystem");
	//console.log(dmSystem.getDatas());

	// 현대엠시트 만료일 유효성 검사 - zzik
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		var visitAllowDay = app.lookup("OptionVisitor").getValue("Param1");
		if ( visitAllowDay == "0" ){
			dialogAlert(app, dataManager.getString("Str_Fail"),dataManager.getString("Str_Visitor_ExpirationDateNotValid"));
			return
		}
	} else if (OEM_VERSION == OEM_HYUNDAI_HI){ // 현대 중공업 마스터 비밀번호 유효성 체크
		var mPwd = dmSystem.getValue("MasterPW");
		if (mPwd != "****"){
			var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!?@#$%^&*_])[A-Za-z\d!?@#$%^&*_]{8,16}$/;
			//  최소 8 자 및 최대 16 자,  하나 이상의 대문자 + 하나의 소문자 + 하나의 숫자 + 하나의 특수 문자(!?@#$%^&*_) 정규식
			console.log(regex.test(mPwd));
			if (!regex.test(mPwd)){
				dialogAlert(app, dataManager.getString("Str_Fail"),dataManager.getString("Str_ErrorInvalidLoginPwd"));
				return
			}
		}
	}
	
	/* 메일 설정 필수 데이터, 이메일 형식 검증 ~  */
	var dmOptionMail = app.lookup('OptionMail');
	
	// 1. 메일 서비스 사용 시 필수 항목 체크 및 메일 형식 체크
	if (_.isEqual(dmOptionMail.getValue('Flag'), 1)) {
		// 이메일 정규식
		var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		
		// eMailrequiredmsg = 필수 항목 에러 : 메일 - 'Str_~'
		var eMailrequiredmsg = dataManager.getString("Str_ErrorCommonRequired") + " : " + dataManager.getString("Str_eMail") + " - " + "'";
		
		// msg = 이메일 형식 에러 : 메일 - 'Str_~' \n ex)union@gmail.com
		function eMailFormatErrorMsg(str) {
			var msg = dataManager.getString("Str_ErrorEmailFormat") + " : " + dataManager.getString("Str_eMail") + " - " + "'";
			msg = msg + dataManager.getString(str);
			msg = msg + "'\n" + 'ex)union@gmail.com';
			return msg
		}
		
		if (_.isEqual(dmOptionMail.getValue('Host'), '')) {
			eMailrequiredmsg = eMailrequiredmsg + dataManager.getString("Str_OptionMailserver") + "'";
			dialogAlert(app, dataManager.getString("Str_Fail"), eMailrequiredmsg);
			return
		}
		if (_.isEqual(dmOptionMail.getValue('Port'), '')) {
			eMailrequiredmsg = eMailrequiredmsg + dataManager.getString("Str_OptionMailPort") + "'";
			dialogAlert(app, dataManager.getString("Str_Fail"), eMailrequiredmsg);
			return
		}
		if (_.isEqual(dmOptionMail.getValue('User'), '')) {
			eMailrequiredmsg = eMailrequiredmsg + dataManager.getString("Str_OptionConnectID") + "'";
			dialogAlert(app, dataManager.getString("Str_Fail"), eMailrequiredmsg);
			return
		}
		if (!emailPattern.test(dmOptionMail.getValue('User'))) {
			dialogAlert(app, dataManager.getString("Str_Fail"), eMailFormatErrorMsg("Str_OptionConnectID"));
			return
		}
		if (_.isEqual(dmOptionMail.getValue('UserPassword'), '')) {
			eMailrequiredmsg = eMailrequiredmsg + dataManager.getString("Str_OptionPassword") + "'";
			dialogAlert(app, dataManager.getString("Str_Fail"), eMailrequiredmsg);
			return
		}
		if (_.isEqual(dmOptionMail.getValue('From'), '')) {
			eMailrequiredmsg = eMailrequiredmsg + dataManager.getString("Str_OptionSendUser") + "'";
			dialogAlert(app, dataManager.getString("Str_Fail"), eMailrequiredmsg);
			return
		}
		if (!emailPattern.test(dmOptionMail.getValue('From'))) {
			dialogAlert(app, dataManager.getString("Str_Fail"), eMailFormatErrorMsg("Str_OptionSendUser"));
			return
		}
		if (_.isEqual(dmOptionMail.getValue('To'), '')) {
			eMailrequiredmsg = eMailrequiredmsg + dataManager.getString("Str_OptionRecipient") + "'";
			dialogAlert(app, dataManager.getString("Str_Fail"), eMailrequiredmsg);
			return
		}
		if (!emailPattern.test(dmOptionMail.getValue('To'))) {
			dialogAlert(app, dataManager.getString("Str_Fail"), eMailFormatErrorMsg("Str_OptionRecipient"));
			return
		}
		
		/* 수신 참조 || 숨은 참조 사용할 경우 이메일 형식 검증 */
		if (!_.isEqual(dmOptionMail.getValue('Cc'), '') && !emailPattern.test(dmOptionMail.getValue('Cc'))) {
			dialogAlert(app, dataManager.getString("Str_Fail"), eMailFormatErrorMsg("Str_OptionReceiveReference"));
			return
		}
		
		if (!_.isEqual(dmOptionMail.getValue('Bcc'), '') && !emailPattern.test(dmOptionMail.getValue('Bcc'))) {
			dialogAlert(app, dataManager.getString("Str_Fail"), eMailFormatErrorMsg("Str_OptionBcc"));
			return
		}
	}
	/*  ~ 메일 설정 필수 데이터, 이메일 형식 검증 */
	
	
	var optionUser = app.lookup("OptionUser");
	var passwordPeriod = optionUser.getValue("PasswordPeriod");
	var authFailCount = optionUser.getValue("AuthFailCount");
	if ( passwordPeriod.toString().length == 0 ) {
		optionUser.setValue("PasswordPeriod", 0);
	}
	if ( authFailCount.toString().length == 0 ) {
		optionUser.setValue("AuthFailCount", 0);
	}
	
	// 현대중공업 자동근태 처리기간 검사 - zzik
	if (OEM_VERSION == OEM_HYUNDAI_HI) {
		var optionTNA = app.lookup('OptionTNA');
		var autoProcTime = optionTNA.getValue("AutoProcTime");
		var scType = autoProcTime % 100;
		if (scType != 1) {
			dialogAlert(app, dataManager.getString("Str_Fail"), "자동근태 처리시간 설정은 일 단위만 가능합니다.");
			return
		}
	}

	
	var OptionDDNS = app.lookup('OptionDDNS');
	var DDNSName = OptionDDNS.getValue("HostName");
	var FirstName = DDNSName.substring(0, 1);
	if (FirstName == '0'){
		dialogAlert(app, dataManager.getString("Str_Fail"),dataManager.getString("Str_DDNS_ExpirationDateNotValid"));
		return;
	}
	
	// 아이티원 인사동기화 주기 유효성 검사 - mjy
	if (OEM_VERSION == OEM_ITONE_TRDATA || OEM_VERSION == OEM_ITONE_POSCO_DX) {
		var userSyncCycle = app.lookup("OptionUserSyncCycle").getValue("SyncCycle");
		if(userSyncCycle<10 || userSyncCycle > 600) {
			dialogAlert(app, dataManager.getString("Str_Fail"),dataManager.getString("Str_OnlyTenSecToTenMin"));
			return
		}
	}
	
	var VerifyResult = OptionDataVerification();
	if(VerifyResult){
		var jsonInitAuth = JSON.parse(initAuth);
		var newTemplateFormat = app.lookup("OptionAuth").getValue("TemplateFormat");
		if (jsonInitAuth.TemplateFormat != newTemplateFormat) {
			//경고창 텍스트 번역 요청
			//Changing templateformat deletes all currently stored data and keeps adding?
			if ( confirm(dataManager.getString("Str_TemplateFormatConvert")) == false ) {
				app.lookup("OptionAuth").setValue("TemplateFormat", jsonInitAuth.TemplateFormat); // 초기값 변경 
			}
			initAuth = JSON.stringify(app.lookup("OptionAuth").getDatas()); //설정업데이트
		}
		
		var smsUpdateOption = app.lookup("sms_updateOption");
		if (OEM_VERSION == OEM_ITONE_TRDATA || OEM_VERSION == OEM_ITONE_POSCO_DX){
			smsUpdateOption.action = "/v1/itone/options";
		}
			smsUpdateOption.send();
		
		// Dashboard 창이 활성화 되어 있을 경우 refresh
		var programManager = cpr.core.Module.require("lib/ProgramManager");
		var embDashboard = programManager.getEmbDashboard();
		
		if (embDashboard != null && embDashboard.disposed == false) {
			var root = app.getRootAppInstance();
			programManager.disposeEmbDashboard();
			programManager.createEmbDashboard(root);
		}
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_updateOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_updateOption = e.control;
	var dmResult = app.lookup("Result");
	var result = dmResult.getValue("ResultCode");
	
	console.log("regist privilege result = ", result);
	
	if (result == 0) {
		var optionAuth = app.lookup("OptionAuth")
		//dataManager.setTemperatureUnit(optionAuth.getValue("TemperatureUnit"));
		//notify("desktop-notify",{type : "success", message :"옵션 설정 성공"});
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Option_Success"));
	} else {
		//dialogAlert(app, "error", "옵션 설정 실패 \n\n [CODE : " + result + "]");
		dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString(getErrorString(result)));
	}
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSELBA_ImgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getDashboardOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getDashboardOption = e.control;
	
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") != COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Error")+" : "+dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
		return;
	}
	
	var dsOptionDashboard = app.lookup("OptionDashboard");	
	dashboardSettingModule.initUserSetting(dsOptionDashboard.getRowDataRanged());
	
}


function OptionDataVerification(){
	
	var data = app.lookup("OptionElevator");
	if(data.getValue("FirstFloor") > data.getValue("TotalFloorCount")){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorElevatorFirstFloorOver"));
		return false;
	}
	return true;
}
