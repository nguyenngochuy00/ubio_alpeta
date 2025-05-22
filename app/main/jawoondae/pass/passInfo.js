/************************************************
 * passInfo.js
 * Created at 2019. 9. 23. 오후 5:16:39.
 *
 * @author jrh
 ************************************************/
var comLib;
var dateLib = cpr.core.Module.require("lib/DateLib");
var pageRowCount = 10;
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var initValue = app.getHost().initValue;
		var CardNum = initValue["CardNum"];
		var CardType = initValue["CardType"];
		var IssueStatus = initValue["IssueStatus"];
		var CardName = initValue["CardName"];
		var RegistDate = initValue["RegistDate"];
		var IssueUniqueid = initValue["IssueUniqueid"];
		var IssueUserid = initValue["IssueUserid"];
	}
	//console.log(CardNum," ",CardType," ",IssueStatus);
	var OTP_PassNumber = app.lookup("OTP_PassNumber");
	var COMB_PassKind = app.lookup("CMB_PassType");
	var COMB_PassIssue = app.lookup("CMB_PassIssue");
	var opt_RegistDate = app.lookup("opt_RegistDate");
	var opt_userID = app.lookup("opt_userID");
	var Date = RegistDate.substring(0,10);
	
	if(IssueUserid != 0 || IssueUserid != ""){
		var submission = app.lookup("smsUserInfoReq");
		submission.action = "/v1/users/"+IssueUserid;		
		submission.send();	
	}
	
	OTP_PassNumber.value = CardNum;
	COMB_PassKind.value = CardType;
	COMB_PassIssue.value = IssueStatus;
	opt_RegistDate.value = Date;
	app.lookup("JWDPM_ipbPassName").text = CardName;
	
	PassIssuedLogList();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsUserInfoReqSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfoReq = e.control;
	var UserInfo = app.lookup("UserInfo");
	var opt_userName = app.lookup("opt_userName");
	var opt_userID = app.lookup("opt_userID");
	var opt_uniqueID = app.lookup("opt_uniqueID");

	opt_userName.value = UserInfo.getValue("Name");
	opt_userID.value = UserInfo.getValue("ID");
	opt_uniqueID.value = UserInfo.getValue("UniqueID");
	
	//console.log(UserInfo.getValue("Name"),UserInfo.getValue("ID"),UserInfo.getValue("UniqueID"));
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsUserInfoReqSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSmsUserInfoReqSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

function PassIssuedLogList(){
	app.lookup("CardIssuelogList").clear();
	var OTP_PassNumber = app.lookup("OTP_PassNumber");
	//app.lookup("CardInfo").clear();
	
	var udcPassIssuanceHistoryGrid = app.lookup("udcPassIssuanceHistoryGrid");
	  
	var curIndex = udcPassIssuanceHistoryGrid.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount;
	var sms_getPassIssuedLogList = app.lookup("sms_getPassIssuedLogList");
	
	sms_getPassIssuedLogList.setParameters("searchCategory", "cardNum");
	sms_getPassIssuedLogList.setParameters("searchKeyword",OTP_PassNumber.value);
	
	sms_getPassIssuedLogList.setParameters("offset", offset);
	sms_getPassIssuedLogList.setParameters("limit", pageRowCount);
	
	sms_getPassIssuedLogList.setParameters("startTime", "1901-01-01 00:00:00");
	sms_getPassIssuedLogList.setParameters("endTime", "2999-12-31 23:59:59");
	
	sms_getPassIssuedLogList.setParameters("cardType", 0);
	sms_getPassIssuedLogList.setParameters("issueType", 0);
	sms_getPassIssuedLogList.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getPassIssuedLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmTotal = app.lookup("Total");
	var totalCount = parseInt(dmTotal.getValue("Count"));

	var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
	
	if (viewPageCount > 10) {
		viewPageCount = 10;
	}

	var dsCardIssuelogList = app.lookup("CardIssuelogList");
	var udcPassIssuanceHistoryGrid = app.lookup("udcPassIssuanceHistoryGrid");
	udcPassIssuanceHistoryGrid.setPassLogList(dsCardIssuelogList);
	udcPassIssuanceHistoryGrid.setPaging(totalCount, pageRowCount, viewPageCount);
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getPassIssuedLogListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getPassIssuedLogListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}


/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPassSaveButtonClick(/* cpr.events.CMouseEvent */ e){
	
	
	var OTP_PassNumber = app.lookup("OTP_PassNumber");
	var sms_UpdatePass = app.lookup("sms_UpdatePass");
	var dm_PassType = app.lookup("dm_PassType");
	var CMB_PassType = app.lookup("CMB_PassType");
	
	dm_PassType.setValue("CardType",CMB_PassType.value);
	
	dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_SaveConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				sms_UpdatePass.addRequestData(dm_PassType, "CardType");
				sms_UpdatePass.action = "/v1/cardInfo/update/" + OTP_PassNumber.value;
				sms_UpdatePass.send();
			} else {}
		});
	
	});
	
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_UpdatePassSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	
	if ( ResultCode == COMERROR_NONE) {
		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {
				"target": DLG_PASS_MANAGEMENT,	
				"command": "ReSearch"
			}
		});
	
		app.getHostAppInstance().dispatchEvent(commandEvent);		
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_Failed"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(ResultCode)));
	}
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_UpdatePassSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_UpdatePassSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}


/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPassIssuedButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var passIssuedButton = e.control;
	var CMB_PassIssue = app.lookup("CMB_PassIssue");
	if(CMB_PassIssue.value == 1){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_IssueFailed"));
		return;
	}
	
	var CMB_PassType = app.lookup("CMB_PassType");
	
	var appld = "app/main/jawoondae/pass/passUserSelect" + "?" + usint_version;
	app.openDialog(appld, {width : 870, height : 520},function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.initValue = CMB_PassType.value;
	}).then(function(returnValue){
		var UserID = returnValue["ID"];
		var UserUniqueID = returnValue["UniqueID"];
		var UserName = returnValue["Name"];
		var StartTime = returnValue["ELMGR_dtStart"];
		var EndTime = returnValue["ELMGR_dtEnd"];
		var OTP_PassNumber = app.lookup("OTP_PassNumber").value;
		var CMB_PassType = app.lookup("CMB_PassType").value;
		//console.log("리턴받은 ID : ",UserID," UniqueID : ",UserUniqueID ," Name : ",UserName, "StartTime", StartTime, "EndTime", EndTime);
		
		StartTime += " 00:00:00";
		EndTime += " 23:59:59";
		
		//console.log(CMB_PassType,StartTime,EndTime);
		var cardIssueInfo = app.lookup("cardIssueInfo");
		cardIssueInfo.setValue("userID", UserID);
		cardIssueInfo.setValue("uniqueID", UserUniqueID);
		cardIssueInfo.setValue("name", UserName);
		cardIssueInfo.setValue("cardNum", OTP_PassNumber);
		cardIssueInfo.setValue("startTime", StartTime);
		cardIssueInfo.setValue("endTime", EndTime);
		cardIssueInfo.setValue("cardType", CMB_PassType);
		//console.log(cardIssueInfo.getDatas());
		
		var sms_PassIssued = app.lookup("sms_PassIssued");
		sms_PassIssued.action = "/v1/cardInfo/issue/" + cardIssueInfo.getValue("userID");
		sms_PassIssued.send();
		comLib.showLoadMask("","발급 중","",pageRowCount);
	
	});
	
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_PassIssuedSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if(resultCode == COMERROR_NONE ){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_IssueSuccess"));
		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {
				"target": DLG_PASS_MANAGEMENT,	
				"command": "ReFresh",
				"PassID": app.lookup("OTP_PassNumber").value
			}
		});
	
		app.getHostAppInstance().dispatchEvent(commandEvent);	
		app.close();
	} else {
		comLib.hideLoadMask();	
		if (resultCode == 0x01000021) {
			dialogAlert(app, dataManager.getString("Str_Failed"), "군번은 같으나 이름이 일치하지 않습니다.");
			return;	
		}
		var errStr = getErrorString(resultCode);
		var errMsg = dataManager.getString(errStr);	
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(errStr));		
			
	}
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_PassIssuedSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_PassIssuedSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onUdcPassIssuanceHistoryGridPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.PassLog
	 */
	var udcPassIssuanceHistoryGrid = e.control;
	PassIssuedLogList();
}




/*
 * "Output" 아웃풋(opt_userName)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOpt_userNameClick(/* cpr.events.CMouseEvent */ e){
	
	var opt_userID = app.lookup("opt_userID");
	if(!opt_userID.value){
		return;
	}
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_USER_INFO,
			"ID": opt_userID.value,
			"Mode": "Modify",
		}
	});

	app.getHostAppInstance().dispatchEvent(selectionEvent);
	
}


/*
 * 버튼(PassDeleteButton)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPassDeleteButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var passDeleteButton = e.control;
	dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
					var OTP_PassNumber = app.lookup("OTP_PassNumber");
					var sms_DeletePass = app.lookup("sms_DeletePass");
					sms_DeletePass.action = "/v1/cardInfo/" + OTP_PassNumber.value;
					sms_DeletePass.send();
			} else {}
		});
	
	});
}



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_DeletePassSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_DeletePass = e.control;
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	
	if ( ResultCode == COMERROR_NONE) {
		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {
				"target": DLG_PASS_MANAGEMENT,	
				"command": "Delete",
				"PassID": app.lookup("OTP_PassNumber").value
			}
		});
	
		app.getHostAppInstance().dispatchEvent(commandEvent);		
		
		app.close();
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorUserDeleteFailed."));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(ResultCode)));
	}
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_DeletePassSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_DeletePassSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}



/*
 * 버튼(PassTakeBackButton)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPassRetrieveButtonClick(/* cpr.events.CMouseEvent */ e){
	
	var CMB_PassIssue = app.lookup("CMB_PassIssue");
	if(CMB_PassIssue.value == 2){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_PassRetrieveFailed"));
		return;
	}
	
	
	dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_PassRetrieve"), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var sms_retrievalPass = app.lookup("sms_retrievalPass");
				var opt_userID = app.lookup("opt_userID");
				var OTP_PassNumber = app.lookup("OTP_PassNumber");
				var dm_PassNum = app.lookup("dm_PassNum");
				dm_PassNum.setValue("CardNum", OTP_PassNumber.value);
			
				sms_retrievalPass.action =  "/v1/cardInfo/retrieval/" + opt_userID.value;
				sms_retrievalPass.addRequestData(dm_PassNum, "CardNum");
				sms_retrievalPass.send();
			} else {}
		});
	
	});
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_retrievalPassSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	if(result.getValue("ResultCode") == COMERROR_NONE ){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Success"));
		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {
				"target": DLG_PASS_MANAGEMENT,	
				"command": "ReFresh",
				"PassID": app.lookup("OTP_PassNumber").value
			}
		});
	
		app.getHostAppInstance().dispatchEvent(commandEvent);	
		app.close();
	}else if(result.getValue("ResultCode") == ERROR_CARD_ISSUE_DUPLICATED){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardIssueDuplicated"));
	}else{
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_Failed"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_retrievalPassSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_retrievalPassSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}


