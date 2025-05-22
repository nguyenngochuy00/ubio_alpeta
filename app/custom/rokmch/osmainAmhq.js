/************************************************
 * osmain1.js
 * Created at 2021. 1. 25. ���� 3:00:58.
 *
 * @author A
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
var embeddedAppAmhq;
var armyhq_menu_id;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	var userInfo = dataManager.getAccountInfo().getDatas();
	//console.log(userInfo);
		history.replaceState({}, null, location.pathname);
	if (userInfo) {
		var opbAccountName = app.lookup("AHNMT_opbAccountName");
		if( userInfo.id == 1000000000000000000) {
			opbAccountName.value = "관리자";
		}else{
			if( userInfo.Name == "Master"){ 
				opbAccountName.value = "관리자";
			}else{
				opbAccountName.value = userInfo.Name;
			}
		}
	}
	updateLogoData();	
	// onMenuChange(null,"app/custom/rokmch/layout/visitApplicationManagement");
	var sms_getLoginInfo = app.lookup("sms_getLoginInfo");
	sms_getLoginInfo.send();
	
	var embView = app.lookup("AHNMT_eaMainView");
	var srcPath = "app/custom/rokmch/mainPageAMHQ";
	if( srcPath.length > 0 ){cpr.core.App.load(srcPath, function(app){if(app){embView.app = app;}});}
	
}

exports.updateLogo = function(){updateLogoData();}

function updateLogoData(){
	var siteName = dataManager.getSystemData("SiteName");
	if( siteName && siteName.length>0){
		app.lookup("AHNMT_opbSiteTitle").value = dataManager.getSystemData("SiteName");
	}else{
		app.lookup("AHNMT_opbSiteTitle").value = "출입통제 체계";
	}
	var siteMsg = dataManager.getSystemData("SiteMessageWarning");
	
	if( siteMsg && siteMsg.length>0){
		app.lookup("AHNMT_opbWarningMessage").value = siteMsg;
	}else{
		app.lookup("AHNMT_opbWarningMessage").value = "";
	}
	
	var siteLogo = dataManager.getSystemData("SiteLogo");
	if( siteLogo && siteLogo.length>0){
		app.lookup("AHNMT_imbSiteLogo").style.css({"background-image" : 'url(data:image/png;base64,'+siteLogo+')', "mix-blend-mode": "multiply"});
	}else {
		app.lookup("AHNMT_imbSiteLogo").style.css({"background-image" : "url('../theme/custom/rokmch/sign_img_logo_01.png')", "mix-blend-mode": "multiply"})		
	}
}

function onMenuChange( /* cpr.events.CMouseEvent */ e, menuPath, menuID, subMenuID ){
	if( e ){e.stopImmediatePropagation()}
	embeddedAppAmhq = app.lookup("AHNMT_eaMainView");
	cpr.core.App.load(menuPath, function(app){
		if(app){
			armyhq_menu_id = menuID;
			embeddedAppAmhq.app = app;			
			embeddedAppAmhq.initValue = subMenuID;
		}
	});
}
exports.openSubMenu = function( menuID,subMenuID){
	var src = "";
	switch(subMenuID){
		// 방문신청관리
		case "10201": src = "app/custom/rokmch/layout/visitApplicationManagement"; break;
		
		// 출입신청관리	
		case "20201": src = "app/custom/rokmch/layout/accessApplicationManagement"; break;
		case "20601": src = "app/custom/rokmch/layout/accessApplicationManagement"; break;		
		case "20702": src = "app/custom/rokmch/layout/accessApplicationManagement"; break;
		
		//장소/장비관리
		case "40201": src = "app/custom/rokmch/layout/placeEquipmentManagement"; break;
		case "40203": src = "app/custom/rokmch/layout/placeEquipmentManagement"; break;
		
		default:
			var topMenu = app.lookup("AHNMT_grpTopMenu");
			if (topMenu.getChildrenCount() == 0) {
				console.log("child 0!!")
				menuID = 0
				src = "app/custom/rokmch/blankPage";
			} else {
				switch(topMenu.getFirstChild().value) {
					case "외래인방문신청관리": 
						menuID = 10;
						src = "app/custom/rokmch/layout/visitApplicationManagement";
						break;
					case "출입신청관리":
						menuID = 20; 
						src = "app/custom/rokmch/layout/accessApplicationManagement";
						break;
					case "출입현황": 
						menuID = 30;
						src = "app/custom/rokmch/layout/accessStatus";
						break;
					case "장소/장비관리": 
						menuID = 40;
						src = "app/custom/rokmch/layout/placeEquipmentManagement";
						break;
					case "모니터링": 
						menuID = 50;
						src = "app/custom/rokmch/layout/monitoring";
						break;
					case "시스템관리": 
						menuID = 60;
						src = "app/custom/rokmch/layout/systemManagement";
						break;												
				}
			}
	}
	if(src.length>0){
		onMenuChange(null, src, menuID,subMenuID);
	}
}

// 방문신청 관리 클릭
function onAHNMT_btnVisitApplicationManagementClick( /* cpr.events.CMouseEvent */ e) {
	return onMenuChange(e, "app/custom/rokmch/layout/visitApplicationManagement",10);
}

// "출입신청관리" 버튼에서 click 이벤트 발생 시 호출.
function onAHNMT_btnAccessApplicationManagementClick( /* cpr.events.CMouseEvent */ e) {
	return onMenuChange(e,"app/custom/rokmch/layout/accessApplicationManagement",20);	
}

//"출입현황" 버튼에서 click 이벤트 발생 시 호출.
function onAHNMT_btnAccessStatusClick( /* cpr.events.CMouseEvent */ e) {
	return onMenuChange(e, "app/custom/rokmch/layout/accessStatus",30);	
}

// "장소/장비관리" 버튼에서 click 이벤트 발생 시 호출.
function onAHNMT_btnAreaDeviceManagementClick( /* cpr.events.CMouseEvent */ e) {
	return onMenuChange(e, "app/custom/rokmch/layout/placeEquipmentManagement",40);	
}

// "모니터링" 버튼에서 click 이벤트 발생 시 호출.
function onAHNMT_btnMonitoringClick( /* cpr.events.CMouseEvent */ e) {
	return onMenuChange(e,"app/custom/rokmch/layout/monitoring",50);	
}

// "시스템관리" 버튼에서 click 이벤트 발생 시 호출.
function onAHNMT_btnSystemManagementClick( /* cpr.events.CMouseEvent */ e) {
	return onMenuChange(e, "app/custom/rokmch/layout/systemManagement",60);
}

// "비밀번호 변경" 버튼에서 click 이벤트 발생 시 호출.
function onAHNMT_btnPasswordClick( /* cpr.events.CMouseEvent */ e) {	
	app.getRootAppInstance().openDialog("app/main/mainEmb/SetPassword", {		
		width: 400,
		height: 220
	}, function(dialog) {
		dialog.ready(function(dialogApp) {
			dialog.headerTitle = "비밀번호 변경";
			dialog.style.header.css("background-color", "#528443");
			dialog.modal = true;
		});
	}).then(function(returnValue) {});
}

// "로그아웃" 버튼에서 click 이벤트 발생 시 호출.
function onAHNMT_btnLogoutClick( /* cpr.events.CMouseEvent */ e) {	
	dialogConfirmAMHQ(app.getRootAppInstance(), dataManager.getString("Str_Logout"), dataManager.getString("Str_LogoutConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				app.lookup("sms_logout").send();
			} 
		});
	});
}

// 로그아웃 완료
function onSms_logoutSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if(resultCode == COMERROR_NONE) {	
		var appld = "app/app" + "?" + usint_version;
		cpr.core.App.load(appld, function(newapp) {
			app.getRootAppInstance().close();
			location.reload(); //임시..현재 app 최초호출 시 라이브러리들이 호출되는데 로그아웃 후 newInstance를 해도 라이브러리는 안불러와서 화면이 보이지 않음
		});
	}
}

exports.addAuthLog = function(authLog){
	if(armyhq_menu_id == 50){embeddedAppAmhq.callAppMethod("addAuthLog", authLog)}
}

exports.addEventLog = function(msgBody){
	if(armyhq_menu_id == 50){embeddedAppAmhq.callAppMethod("addEventLog", msgBody)}
}

exports.updateTerminalStatus = function(msgBody){
	if(armyhq_menu_id == 50){embeddedAppAmhq.callAppMethod("updateTerminalStatus", msgBody)}
}

// 사용자 접속정보 가져오기 완료
function onSms_getLoginInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		var userLoginInfo = app.lookup("UserLoginInfo");			
		var opbAccountPosition = app.lookup("AHNMT_opbAccountPosition");
		opbAccountPosition.value = userLoginInfo.getValue("Position");
		var opbLoginInfo = app.lookup("AHNMT_opbLoginInfo");
		opbLoginInfo.value = userLoginInfo.getValue("LastLoginTime")+" ["+userLoginInfo.getValue("LastLoginIP")+"]"
		dataManager.setApprover(app.lookup("Approver"));
		dataManager.setUserInfoARMHQ(app.lookup("UserLoginInfo"));
		app.lookup("sms_getPrivilegeListJSON").send();
	} 
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}


function onSms_getPrivilegeListJSONSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var privilegeInfoListAHQ = app.lookup("PrivilegeInfoListAHQ");
	//console.log(privilegeInfoListAHQ.getRowDataRanged());
	if (privilegeInfoListAHQ) {
		var dmPrivilegeGroup= app.lookup("PrivilegeGroup");
		//console.log(dmPrivilegeGroup.getDatas()); 
		var rowCount = privilegeInfoListAHQ.getRowCount();
		var strID = "PrivilegeIDVal";
		
	var columnIndicies = new Array();
		for (var i = 0; i <rowCount;i++) {
			var tmpID = strID + (i+1);
			var rBool = dmPrivilegeGroup.getValue(tmpID);
			if (rBool == 1) { //true
				privilegeInfoListAHQ.setValue(i, "checkFlag", true);
			} else {
				var privilegeValue = privilegeInfoListAHQ.getRow(i).getValue("privilegeValue");
				switch(privilegeValue) {
					case 10: columnIndicies.push(0); break;
					case 20: columnIndicies.push(1); break;
					case 30: columnIndicies.push(2); break;
					case 40: columnIndicies.push(3); break;
					case 50: columnIndicies.push(4); break;
					case 60: columnIndicies.push(5); break;
				}
				privilegeInfoListAHQ.setValue(i, "checkFlag", false);
			}
		}
		if (columnIndicies.length > 0) {
			var topMenulayout = app.lookup("AHNMT_grpTopMenu").getLayout();
			topMenulayout.removeColumns(columnIndicies);
			for (var i=0; i< columnIndicies.length; i++) {
				topMenulayout.insertColumns(["1fr"]);		
			}
					
		}
		
	}
	
	if (isLoginMaster()){
		var groupList = dataManager.getGroup();
		var dsLoginGroup = app.lookup("LoginUserGroupList");
		dataManager.setLoginUserGroups(groupList);
	} else {
		app.lookup("sms_getLoginUserGroupList").send();		
	}
	
	//로그인인포는 어디 화면에서 듸우게 할지 정해야 한다 여기서 안되면 로그인 전에 뿌리고 업데이트 되도록 예외처리 해야함. 
	/*
	var AccountInfo = dataManager.getAccountInfo();
	var firstFlag = AccountInfo.getValue("FirstLoginFlag");
	if (firstFlag == 1) { //만료거나 처음로그인 최초로그인 판단은 서버에서 해주도록 수정 해야함
		app.getRootAppInstance().openDialog("app/main/mainEmb/SetPassword", {width: 400, height: 300}, function(dialog){
			dialog.ready(function(dialogApp){
				dialog.modal = true;
			});
		}).then(function(returnValue){
		});
	}*/
	
	FirstLoginCheck();
}

function onSms_getPrivilegeListJSONSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getPrivilegeListJSONSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

exports.menuPrivilegeCheck = function(privilegeID) {
	var privilegeInfoListAHQ = app.lookup("PrivilegeInfoListAHQ");
	var rowData = privilegeInfoListAHQ.findFirstRow("privilegeValue == "+ privilegeID);
	if (rowData) {
		var bflag = rowData.getValue("checkFlag");
		if (bflag == true){ 
			return bflag;
		} else {
			return bflag;
		}
	}
	return false;
}

exports.closeUI = function(){
	var hostAppIns = app.getHostAppInstance();
	var bResult = hostAppIns.callAppMethod("closeUI"); 
}

function clearButtonSelection(){
	app.lookup("AHNMT_btnVisitApplicationManagement").style.css({"background-image" : 'url(../../../theme/custom/armyhq/btn_1depth_off.jpg)'});
	app.lookup("AHNMT_btnAccessApplicationManagement").style.css({"background-image" : 'url(../../../theme/custom/armyhq/btn_1depth_off.jpg)'});
	app.lookup("AHNMT_btnAccessStatus").style.css({"background-image" : 'url(../../../theme/custom/armyhq/btn_1depth_off.jpg)'});
	app.lookup("AHNMT_btnAreaDeviceManagement").style.css({"background-image" : 'url(../../../theme/custom/armyhq/btn_1depth_off.jpg)'});
	app.lookup("AHNMT_btnMonitoring").style.css({"background-image" : 'url(../../../theme/custom/armyhq/btn_1depth_off.jpg)'});
	app.lookup("AHNMT_btnSystemMonitoring").style.css({"background-image" : 'url(../../../theme/custom/armyhq/btn_1depth_off.jpg)'});
}

function onAHNMT_btnVisitApplicationManagementMouseup(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var btnVisitApplicationManagement = e.control;
	clearButtonSelection()
	btnVisitApplicationManagement.style.css({"background-image" : 'url(../../../theme/custom/armyhq/btn_1depth_on.jpg)'});
	
}


function onAHNMT_btnAccessApplicationManagementMouseup(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var btnAccessApplicationManagement = e.control;
	clearButtonSelection()
	btnAccessApplicationManagement.style.css({"background-image" : 'url(../../../theme/custom/armyhq/btn_1depth_on.jpg)'});
}

function onAHNMT_btnAccessStatusMouseup(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var btnAccessStatus = e.control;
	clearButtonSelection()
	btnAccessStatus.style.css({"background-image" : 'url(../../../theme/custom/armyhq/btn_1depth_on.jpg)'});
}

function onAHNMT_btnAreaDeviceManagementMouseup(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var btnAreaDeviceManagement = e.control;
	clearButtonSelection()
	btnAreaDeviceManagement.style.css({"background-image" : 'url(../../../theme/custom/armyhq/btn_1depth_on.jpg)'});
}


function onAHNMT_btnMonitoringMouseup(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var btnMonitoring = e.control;
	clearButtonSelection()
	btnMonitoring.style.css({"background-image" : 'url(../../../theme/custom/armyhq/btn_1depth_on.jpg)'});
}

function onAHNMT_btnSystemMonitoringMouseup(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var btnSystemMonitoring = e.control;
	clearButtonSelection()
	btnSystemMonitoring.style.css({"background-image" : 'url(../../../theme/custom/armyhq/btn_1depth_on.jpg)'});
}

function onAHNMT_btnMouseenter(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button */
	var btn = e.control;
	btn.style.css({"color" : '#FFEA00'});
	btn.style.css({"font-weight" : "bold"});
}

function onAHNMT_btnMouseleave(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button	 */
	var btn = e.control;
	btn.style.css({"color" : '#FFFFFF'});
	btn.style.css({"font-weight" : "light"});
}

function onAHNMT_opbSiteTitleClick(/* cpr.events.CMouseEvent */ e){
	var embView = app.lookup("AHNMT_eaMainView");
	var srcPath = "app/custom/rokmch/mainPageAMHQ";
	if( srcPath.length > 0 ){cpr.core.App.load(srcPath, function(app){if(app){embView.app = app;}});}
}

function onAHNMT_opbSiteTitleMouseenter(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Output	 */
	var opbSiteTitle = e.control;
	opbSiteTitle.style.css({"cursor":"pointer"});
}

function onAHNMT_btnPasswordMouseenter(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button */
	var btn = e.control;
	btn.style.css({"color" : '#FFEA00'});
}

function onAHNMT_btnPasswordMouseleave(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button */
	var btn = e.control;
	btn.style.css({"color" : '#FFFFFF'});
}

function onAHNMT_btnLogoutMouseenter(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button */
	var btn = e.control;
	btn.style.css({"color" : '#FFEA00'});
}

function onAHNMT_btnLogoutMouseleave(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button */
	var btn = e.control;
	btn.style.css({"color" : '#FFFFFF'});
}

function FirstLoginCheck() {
	var oemVer = dataManager.getOemVersion();
	var AccountInfo = dataManager.getAccountInfo();
	
	var firstFlag = AccountInfo.getValue("FirstLoginFlag");
	if (firstFlag == 1) { //만료거나 처음로그인 최초로그인 판단은 서버에서 해주도록 수정 해야함
		var headerClose = true;
		if (oemVer == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH) {
			headerClose = false;
		}
		
		app.getRootAppInstance().openDialog("app/main/mainEmb/SetPassword", {width: 400, height: 220}, function(dialog){
			dialog.ready(function(dialogApp){
				dialog.modal = true;
				dialog.headerClose = false;
				dialog.style.header.css("background-color", "#528443");
				dialog.headerTitle = dataManager.getString("Str_PasswordChange");
			});
		}).then(function(returnValue){
		});
	}
}

function onSms_getLoginUserGroupListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getLoginUserGroupListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_getLoginUserGroupListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		var dsUserGroupList = app.lookup("LoginUserGroupList");
		dataManager.setLoginUserGroups(dsUserGroupList);	
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "사용자 부서 정보 가져오기 실패.\n"+dataManager.getString(getErrorString(resultCode)));
	}
}
