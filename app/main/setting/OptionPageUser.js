/************************************************
 * OptionPageUser.js
 * Created at 2019. 4. 29. 오후 7:26:50.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var OEM_VERSION;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	var hostApp = app.getHostAppInstance();
	var dmUser = app.lookup("OptionUser");
	
	hostApp.callAppMethod("getUserData").copyToDataMap(dmUser);
	/*
	app.lookup("cbx1").text = dataManager.getString("Str_OptionAutoUploadLogdatafromterminal");
	app.lookup("cbx2").text = dataManager.getString("Str_OptionFirstLoginPasswordChange");
	app.lookup("SEUSR_chkNotAllowOld").text = dataManager.getString("Str_OptionRepeatPasswordNotAllowed");
	app.lookup("cbx5").text = dataManager.getString("Str_OptionConsecutiveCharactersNotAllowed");
	app.lookup("cbx6").text = dataManager.getString("Str_OptionIdenticalIDPasswordNotAllowed");
	app.lookup("cbx7").text = dataManager.getString("Str_OptionUppercaseRequired");
	app.lookup("cbx8").text = dataManager.getString("Str_OptionLowercaseRequired");
	app.lookup("cbx9").text = dataManager.getString("Str_OptionNumberRequired");
	app.lookup("cbx10").text = dataManager.getString("Str_OptionSpecialCharacterRequired");
	*/
	app.lookup("SEUSR_grpMain").redraw();
	
	if (dmUser.getValue("PwNotAllowOld") != 0) {
		app.lookup("SEUSR_chkNotAllowOld").value = 1;
	}
	
	if(dmUser.getValue("AuthFailCount") > 0){
		app.lookup("SEUSR_cmbauthUnaVailableTime").enabled = true;
	}
	
	// 육본의 경우엔 사용자에 엮인 테이블이 많으므로 전체삭제 안보이도록
	OEM_VERSION = dataManager.getOemVersion();
	if(OEM_VERSION == OEM_ARMY_HQ  || dataManager.getOemVersion() == OEM_ROKMCH) {
		app.lookup("SEUSR_btnUserDeleteAll").visible = false;
		app.lookup("delete_output").visible = false;	
		app.lookup("AllDELETE_btnHidden").enabled = true;	
	} else if (OEM_VERSION == OEM_REMOTE_FAW_MANAGEMENT){
		app.lookup("SEUSR_btnUserDeleteAll").visible = false;
		app.lookup("SEUSR_btnUserDeleteAll").enabled = false;
		app.lookup("delete_output").visible = false;
		if (dataManager.getAccountID() == 1000000000000000000){
			app.lookup("SEUSR_opbAuthTermnialUserAllDel").visible = true;
			app.lookup("SEUSR_btnAuthTermnialUserAllDel").visible = true;
			app.lookup("SEUSR_btnAuthTermnialUserAllDel").enabled = true;			
		}
	}
	
	// 아이티원 전용 기능. 인사동기화 주기 설정 -mjy
	if(OEM_VERSION == OEM_ITONE_TRDATA || OEM_VERSION == OEM_ITONE_POSCO_DX) {
		app.lookup("SEUSR_UserSyncGrp").visible = true;
		var dmUserSyncCycle = app.lookup("OptionUserSyncCycle");
		hostApp.callAppMethod("getUserSyncCycleData").copyToDataMap(dmUserSyncCycle);
		
		// 레이아웃 정리
		var optionUserPage = app.lookup("SEUSR_grpMain");
		var getLayout = optionUserPage.getLayout();
		var rowArr = getLayout.getRows();
		for (var i=0; i < rowArr.length; i++) {
			if (i >=30 &&i <=36) {
				rowArr[i] = '0px';
			} 
		}
		getLayout.setRows(rowArr);
		optionUserPage.redraw();
	}
	
}


/*
 * Body에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
//function onBodyUnload(/* cpr.events.CEvent */ e){
//	app.callAppMethod("requestSetData");
//}

exports.requestSetData = function() {
	var dmUser = app.lookup("OptionUser");
	var chkNotAllowOld = app.lookup("SEUSR_chkNotAllowOld");
	
	//console.log(chkNotAllowOld.value);
	//console.log(chkNotAllowOld.checked);
	
//	if (!chkNotAllowOld.checked) {
//		dmUser.setValue("PwNotAllowOld", 0);
//	} 
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setUserData", dmUser);
	
	if(OEM_VERSION == OEM_ITONE_TRDATA || OEM_VERSION == OEM_ITONE_POSCO_DX) {
		var dmUserSyncCycle = app.lookup("OptionUserSyncCycle");
		hostApp.callAppMethod("setUserSyncCycleData", dmUserSyncCycle);
	}
}

/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onSEUSR_chkNotAllowOldValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	 /*
	var sEUSR_chkNotAllowOld = e.control;
	var inNotAllowOld = app.lookup("SEUSR_inNotAllowOld");
	
	if (sEUSR_chkNotAllowOld.checked) {
		inNotAllowOld.enabled = true;		
	} else {
		inNotAllowOld.enabled = false;
	}*/
}

// 사용자 워크쓰루 사진 재등록 기능 호출
function onSEUSR_btnUserFaceWTSyncClick(/* cpr.events.CMouseEvent */ e){	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_USER_FACEWT_RESYNC,			
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 사용자 데이터 전체 삭제 클릭
function onSEUSR_btnUserDeleteAllClick(/* cpr.events.CMouseEvent */ e){
	if(dataManager.getOemVersion() == OEM_KANGWONLAND) {
		dialogAlert(app, dataManager.getString("Str_Failed"), "강원랜드는 지원하지 않는 기능 입니다.");
		return;	
	}
	
	dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_UserDeleteAllConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				comLib.showLoadMask("",dataManager.getString("Str_UserDelete"),"",0);

				var sms_deleteUserAll = app.lookup("sms_deleteUserAll");
				sms_deleteUserAll.send();

			}else {}
		});
	});
}

// 사용자 데이터 전체 삭제 완료
function onSms_deleteUserAllSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_UserDeleteAllSuccess"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	
}

// 사용자 데이터 전체 삭제 에러
function onSms_deleteUserAllSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 사용자 데이터 전체 삭제 타임아웃
function onSms_deleteUserAllSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


// "사용자 로그인 불가 시간 관리" 팝업
function onSEUSR_btnUserAuthUnavailableTimeManagementClick(/* cpr.events.CMouseEvent */ e){

	var appld = "app/main/setting/UserAuthUnavailableManagement";
	app.getRootAppInstance().openDialog(appld, {
		width: 600,
		height: 450
	}, function(dialog) {
		dialog.initValue = 0;
		dialog.resizable = false;
		dialog.bind("headerTitle").toLanguage("Str_UserAuthUnavailableTimeManagement");
		dialog.headerClose = false;
		dialog.modal = true;
	}).then(function(returnValue) {
		
	});
}


/*
 * 버튼(AllDELETE_btnHidden)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAllDELETE_btnHiddenClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var allDELETE_btnHidden = e.control;
	var btnVisible = app.lookup("SEUSR_btnUserDeleteAll").visible;
	var outputVisible = app.lookup("delete_output").visible;	
	if(outputVisible){
		app.lookup("SEUSR_btnUserDeleteAll").visible = false;
		app.lookup("delete_output").visible = false;
	} else {
		app.lookup("SEUSR_btnUserDeleteAll").visible = true;
		app.lookup("delete_output").visible = true;
	}
}

function onSEUSR_ipbAuthFailCountBlur(/* cpr.events.CFocusEvent */ e){
	var authFailCount = app.lookup("SEUSR_ipbAuthFailCount");
	var authUnVailableTime = app.lookup("SEUSR_cmbauthUnaVailableTime");
	if (authFailCount.value > 0) {
		authUnVailableTime.enabled = true;
		if (authUnVailableTime.value == 0){
			authUnVailableTime.value = null;
		}
		authUnVailableTime.setItemEnable(authUnVailableTime.getItem(0), false);
	} else {
		authUnVailableTime.enabled = false;
		authUnVailableTime.value = 0;
	}
}


function onSEUSR_btnAuthTermnialUserAllDelClick(/* cpr.events.CMouseEvent */ e){
	dialogConfirm(app.getRootAppInstance(), dataManager.getString("Str_Warning"), dataManager.getString("Str_ConfirmAuthTerminalUsersAllDelete"), function(dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				comLib.showLoadMask("",dataManager.getString("sms_deleteUserAll"),"",0);
				app.lookup("sms_deleteAuthTerminalUserAll").send();
			}else {}
		});
	});
}


function onSms_deleteAuthTerminalUserAllSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_EndRequestAuthTerminalUsersAllDelete"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}
