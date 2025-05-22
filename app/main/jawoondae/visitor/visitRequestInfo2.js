/************************************************
 * visitRegistInfo.js
 * Created at 2019. 9. 18. 오전 9:56:39.
 *
 * @author fois
 ************************************************/
var comLib;
var dateLib = cpr.core.Module.require("lib/DateLib");
var pageRowCount = 10;
var dataManager = cpr.core.Module.require("lib/DataManager");
var JWDVI_version;
function InitData() {
	dataManager = getDataManager();
	JWDVI_version = dataManager.getSystemVersion();
	var groupList = dataManager.getGroup();
	var cmbGroup = app.lookup("JWDVI_cmbTargetGroup");	 //출입 부대
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",
	});
	/*
	var cmbGroup = app.lookup("JWDVI_cmbvisitorGroup");	//소속
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",
	});
	*/
	var positionList = dataManager.getPositionList();
	var cmbPosition = app.lookup("JWDVI_cmbVisitorPosition");	
		cmbPosition.setItemSet(positionList, {
			label: "Name",
			value: "PositionID",
	});	
}
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	InitData();
	JWDVI_version = dataManager.getSystemVersion();
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var initValue = app.getHost().initValue;
		var indexKey = initValue["Index"];
		getVisitRequestInfo(indexKey);
	} else {
		// index 정보 없음 경고 표시
	}
}
//-------------------------------------------------------------------------------- VisitRequestInfo
function getVisitRequestInfo(indexKey) {
	var requestData = app.lookup("sms_getVisitRequestInfo");
	requestData.action = '/v1/visitRequest/' + indexKey;
	requestData.send();
}

function onSms_getVisitRequestInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var visitReqData = app.lookup("VisitRequestInfo");
		var appro = app.lookup("ApproverInfo");
		console.log(appro.getDatas());
		var Leader = app.lookup("LeaderInfo");
		var status = visitReqData.getValue("Status");
		if (status == 0) { // 대기
			app.lookup("JWDVI_opbStatus").value = dataManager.getString("Str_VisitRequestWaiting") + " " + dataManager.getString("Str_State");	
		} else if (status == 1) { // 승인
			app.lookup("JWDVI_opbStatus").value = dataManager.getString("Str_VisitRequestApproval") + " " + dataManager.getString("Str_State");
		} else if (status == 2) { // 거부
			app.lookup("JWDVI_opbStatus").value = dataManager.getString("Str_VisitRequestDeny") + " " + dataManager.getString("Str_State");
		} else if (status == 3) { // 발급
			app.lookup("JWDVI_opbStatus").value = dataManager.getString("Str_Issued") + " " + dataManager.getString("Str_State");
		}
		var processAt = visitReqData.getValue("ProcessAt");
		if (processAt == "0001-01-01 00:00:00") {
			processAt = "----";
		}
		app.lookup("JWDVI_ipbProcessAt").value = processAt; // 처리 일시
		app.lookup("JWDVI_cmbTargetGroup").value = visitReqData.getValue("TargetGroupID"); // 방문 그룹
		app.lookup("JWDVI_cmbvisitorGroup").value = visitReqData.getValue("VisitorGroupName"); // 방문 그룹
		app.lookup("JWDVI_cmbVisitorPosition").value = visitReqData.getValue("VisitorPosition");
		
		enableCtrlByVisitStatus(status);
		
	} else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_VisitRequestInfo")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", dataManager.getString("Str_VisitRequestInfo")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	
	app.lookup("JWDVI_grpVisitRequestInfo").redraw();
}

function onSms_getVisitRequestInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getVisitRequestInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//------------------------------------------------------------------------------------------------------------------------------------------------------

function enableCtrlByVisitStatus(status) {
	if (status == 0 ) {	// Wait -> 승인 , 거부 가능
		app.lookup("JWDVI_btnApprove").enabled = true;
		app.lookup("JWDVI_btnDeny").enabled = true;
		app.lookup("JWDVI_btnVisitIssue").enabled = false;
		VisitTargetInfoEnableStatus(1); //수정가능
		VisitorInfoEnableStatus(1);
	} else if (status == 1 ) { // Approval  
		app.lookup("JWDVI_btnApprove").enabled = false;
		app.lookup("JWDVI_btnDeny").enabled = true;
		app.lookup("JWDVI_btnVisitIssue").enabled = true;
		VisitTargetInfoEnableStatus(1);
		VisitorInfoEnableStatus(0);
	} else if (status == 2 ) { // Denial
		app.lookup("JWDVI_btnApprove").enabled = false;
		app.lookup("JWDVI_btnDeny").enabled = false;
		app.lookup("JWDVI_btnVisitIssue").enabled = false;
		VisitTargetInfoEnableStatus(0);
		VisitorInfoEnableStatus(0);
	} else if (status == 3 ) { // Issue -> 발급 상태 아무것도 안됨 -> 승인상태와 동일하게 
		app.lookup("JWDVI_btnApprove").enabled = false; 
		app.lookup("JWDVI_btnDeny").enabled = true;
		app.lookup("JWDVI_btnVisitIssue").enabled = true;
		VisitTargetInfoEnableStatus(1);
		VisitorInfoEnableStatus(0);
	} 
	
	app.lookup("JWDVI_grpTopVisitRequestInfo").redraw();
}

function VisitTargetInfoEnableStatus(openStatus) {
	if (openStatus == 0) { // 잠금
		app.lookup("JWDVI_cmbTargetGroup").enabled = false;
		app.lookup("JWDVI_ipbVisitPurpose").enabled = false;
		app.lookup("JWDVI_ipbVisitStartAt").enabled = false;
		app.lookup("JWDVI_ipbVisitEndAt").enabled = false;
		app.lookup("JWDVI_opbLeaderName").enabled = false;
		app.lookup("JWDVI_opbLeaderUniqueID").enabled = false;
		app.lookup("JWDVI_btnUserSearch").enabled = false;
	} else if (openStatus == 1) { // 열림
		app.lookup("JWDVI_cmbTargetGroup").enabled = true;
		app.lookup("JWDVI_ipbVisitPurpose").enabled = true;
		app.lookup("JWDVI_ipbVisitStartAt").enabled = true;
		app.lookup("JWDVI_ipbVisitEndAt").enabled = true;
		app.lookup("JWDVI_opbLeaderName").enabled = true;
		app.lookup("JWDVI_opbLeaderUniqueID").enabled = true;
		app.lookup("JWDVI_btnUserSearch").enabled = true;
	}
	app.lookup("JWDVI_grpVisitTargetInfo").redraw();
}
function VisitorInfoEnableStatus(openStatus) {
	if (openStatus == 0) { // 잠금
		app.lookup("JWDVI_cmbvisitorGroup").enabled = false;
		app.lookup("JWDVI_ipbVisitorID").enabled = false;
		app.lookup("JWDVI_cmbVisitorPosition").enabled = false;
		app.lookup("JWDVI_ipbVisitorName").enabled = false;
		app.lookup("JWDVI_ipbVisitorPhone").enabled = false;
		app.lookup("JWDVI_ipbVisitorMobile").enabled = false;
		app.lookup("JWDVI_btnCarDelete").enabled = false;
		
	} else if (openStatus == 1) { // 열림
		app.lookup("JWDVI_cmbvisitorGroup").enabled = true;
		app.lookup("JWDVI_ipbVisitorID").enabled = true;
		app.lookup("JWDVI_cmbVisitorPosition").enabled = true;
		app.lookup("JWDVI_ipbVisitorName").enabled = true;
		app.lookup("JWDVI_ipbVisitorPhone").enabled = true;
		app.lookup("JWDVI_ipbVisitorMobile").enabled = true;
		app.lookup("JWDVI_btnCarDelete").enabled = false;
	}
	app.lookup("JWDVI_grpVisitorInfo").redraw();
} 
//------------------------------------------------------------------------------------------------------------------------------------------------------

function onJWDVI_btnCarDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdCarInfoList = app.lookup("JWDVI_grdCarInfo");
	var checkedRowIndices = grdCarInfoList.getCheckRowIndices();
	var delCount = checkedRowIndices.length;
	
	if (delCount <= 0) {
		dialogAlert(app, "알림", "삭제할 차량을 선택해 주세요","");
		return;
	} 
	
	dialogConfirm(app.getRootAppInstance(), "", "삭제 하시겠습니까?", function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e){
			if (dialog.returnValue) {
				comLib.showLoadMask("pro",dataManager.getString("Str_UserDelete"),"",checkedRowIndices.length);
				var dsDeleteCarList = app.lookup("dsDeleteCarList");
				dsDeleteCarList.clear();
				
				for( var i = 0; i < delCount; i++){
					var delIndex = checkedRowIndices[i];
					var delCarInfo = {"carNum":grdCarInfoList.getRow(delIndex).getValue("CarNumber"),"rowIndex":delIndex};
					dsDeleteCarList.addRowData(delCarInfo);
				}
			}
			
			sendDeleteCarInfo();
		});
	});
	
}

function sendDeleteCarInfo() {
	var dsDeleteList = app.lookup("dsDeleteCarList");
	if (dsDeleteList.getRowCount() == 0) {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		return;
	}
	var dsCarNum = dsDeleteList.getRow(0);
	var carNum = dsCarNum.getValue("carNum");
	
	var msg = dataManager.getString("Str_CarNumber")+ " : "+carNum;
	comLib.updateLoadMask(msg);
	
	var sms_deleteCarInfo = new cpr.protocols.Submission("sms_deleteCarInfo");
	sms_deleteCarInfo.action = "/v1/jawoondae/carinfo/"+carNum;
	sms_deleteCarInfo.method = "delete";
	sms_deleteCarInfo.mediaType = "application/x-www-form-urlencoded";
	sms_deleteCarInfo.userAttr("carNum", carNum);
	sms_deleteCarInfo.userAttr("rowIndex", dsCarNum.getValue("rowIndex").toString());	
	sms_deleteCarInfo.addResponseData(app.lookup("Result"), false, "Result");
	sms_deleteCarInfo.setParameters("UserIndexKey", -1);
	sms_deleteCarInfo.setParameters("VisitorIndexKey", app.lookup("VisitRequestInfo").getValue("IndexKey"));
		
	sms_deleteCarInfo.addEventListenerOnce("submit-done", onSms_deleteCarInfoSubmitDone);
	sms_deleteCarInfo.addEventListenerOnce("submit-error", onSms_deleteCarInfoSubmitError);
	sms_deleteCarInfo.addEventListenerOnce("submit-timeout", onSms_deleteCarInfoSubmitTimeout);
	sms_deleteCarInfo.send();
}

function onSms_deleteCarInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_deleteCarInfo = e.control;
	
	var deleteCarInfo = app.lookup("dsDeleteCarList");
	deleteCarInfo.realDeleteRow(0);
	var carInfoList = app.lookup("CarInfoList");
	
	var carNum = sms_deleteCarInfo.userAttr("carNum");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if ( resultCode == COMERROR_NONE || resultCode == 4) { //DataNotExist
		var rowIndex = parseInt(sms_deleteCarInfo.userAttr("rowIndex"),10)
		var grdCarList = app.lookup("JWDVI_grdCarInfo");
		if( rowIndex < grdCarList.getRowCount()){
			grdCarList.deleteRow(rowIndex);
			grdCarList.setCheckRowIndex(rowIndex, false);
		} 
		sendDeleteCarInfo();
	} else {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		//dialogAlert(app, "Waning", dataManager.getString("Str_CarInfo")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", dataManager.getString("Str_CarInfo")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_deleteCarInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_deleteCarInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//------------------------------------------------------------------------------------------------------------------------------------------------------

function onJWDVI_btnUserSearchClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/main/users/userSelectOne" + "?" + JWDVI_version;
	var visitRequestInfo = app.lookup("VisitRequestInfo");
	app.getRootAppInstance().openDialog(appld, {width : 600, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.modal = true;
	}).then(function(/*cpr.data.DataSet*/userInfo){
		if(userInfo){
			var dmLeaderInfo = app.lookup("LeaderInfo");
			dmLeaderInfo.build(userInfo);
			
			visitRequestInfo.setValue("LeaderID", dmLeaderInfo.getValue("UniqueID"));
		}
	});	
}
function validateVisitRequestInfo(checkType) {
	var dmVisitTargetInfo = app.lookup("VisitRequestInfo");
	
	if( dmVisitTargetInfo.getValue("TargetGroupID")==0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_TargetGroupNotSelected"));
		return false;
	}
	
	if( dmVisitTargetInfo.getValue("VisitPurpose").toString().length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitPurposeNotEntered"));
		return false;
	}
	
	// 날짜 체크는 서버에서 해준다.
	var visitorType = dmVisitTargetInfo.getValue("VisitorRegistType");
	if (visitorType == 0) {
		var dmLeaderInfo = app.lookup("LeaderInfo");
		var leaderID = dmLeaderInfo.getValue("UniqueID");
		if( leaderID == null || leaderID.length == 0){
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_LeaderNotSelected"));
			return false;
		} else {
			var dmVisitTargetInfo = app.lookup("VisitRequestInfo");
			dmVisitTargetInfo.setValue("LeaderID", leaderID);
			
		}
	}
	
	
	if( dmVisitTargetInfo.getValue("VisitorGroupName")==0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorGroupNotSelected"));
		return false;
	}
	
	if( dmVisitTargetInfo.getValue("VisitorID").toString().length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorIDNotEntered"));
		return false;
	}
	/*
	if( dmVisitTargetInfo.getValue("VisitorPosition")==0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorPositionNotSelected"));
		return false;
	}
	*/
	if( dmVisitTargetInfo.getValue("VisitorName").toString().length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorNameNotEntered"));
		return false;
	}
	/*
	if( dmVisitTargetInfo.getValue("VisitorPhone").toString().length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorPhoneNotEntered"));
		return false;
	}
	*/
	if( dmVisitTargetInfo.getValue("VisitorMobile").toString().length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorMobileNotEntered"));
		return false;
	}
}
//------------------------------------------------------------------------------------------------------------------------------------------------------
function onJWDVI_btnApproveClick(/* cpr.events.CMouseEvent */ e){
	if (validateVisitRequestInfo(1) == false ) {
		return
	}
	comLib.showLoadMask("",dataManager.getString("Str_VisitRequestApproval"),"",0);	
	var requestData = app.lookup("sms_putVisitRequestInfoApproval");
	var visitRequestInfo = app.lookup("VisitRequestInfo");
	requestData.action = "/v1/visitRequest/approval/" + visitRequestInfo.getValue("IndexKey");
	requestData.send();
}

function onSms_putVisitRequestInfoApprovalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var status = app.lookup("VisitRequestInfo").setValue("Status", 1);
		app.lookup("JWDVI_opbStatus").value = dataManager.getString("Str_VisitRequestApproval") + " " + dataManager.getString("Str_State");
		enableCtrlByVisitStatus(1);
	}else if(resultCode == ERROR_VISIT_REQUEST_NOT_EXIST){
		dialogAlert(app, "Waning", dataManager.getString("Str_ErrorVisitRequestNotExist"));
	}else if(resultCode == ERROR_VISITOR_ID_REQUEST_INVALID){
		dialogAlert(app, "Waning", dataManager.getString("Str_ErrorVisitorIDRequestInvalid"));
	}else if(resultCode == ERROR_ALREADY_APPROVED_STATUS){
		dialogAlert(app, "Waning", dataManager.getString("Str_ErrorAlreadyApprovedStatus"));
	}else if(resultCode == ERROR_ALREADY_DENIED_STATUS){
		dialogAlert(app, "Waning", dataManager.getString("Str_ErrorAleadyDeniedStatus"));
	} else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_VisitRequestInfo")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", dataManager.getString("Str_VisitRequestInfo")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("JWDVI_grpVisitRequestInfo").redraw();
}

function onSms_putVisitRequestInfoApprovalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putVisitRequestInfoApprovalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//------------------------------------------------------------------------------------------------------------------------------------------------------
function onJWDVI_btnDenyClick(/* cpr.events.CMouseEvent */ e){
	if (validateVisitRequestInfo(2) == false ) {
		return;
	}
	comLib.showLoadMask("",dataManager.getString("Str_VisitRequestDeny"),"",0);	
	
	var requestData = app.lookup("sms_putVisitRequestInfoDeny"); // 거부
	var visitRequestInfo = app.lookup("VisitRequestInfo");
	requestData.action = "/v1/visitRequest/denial/" + visitRequestInfo.getValue("IndexKey");
	requestData.send();
}

function onSms_putVisitRequestInfoDenySubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
	var status = app.lookup("VisitRequestInfo").setValue("Status", 2);
		app.lookup("JWDVI_opbStatus").value = dataManager.getString("Str_VisitRequestDeny") + " " + dataManager.getString("Str_State");
		enableCtrlByVisitStatus(2);
	}else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_VisitRequestInfo")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", dataManager.getString("Str_VisitRequestInfo")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("JWDVI_grpVisitRequestInfo").redraw();
}
function onSms_putVisitRequestInfoDenySubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}
function onSms_putVisitRequestInfoDenySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//------------------------------------------------------------------------------------------------------------------------------------------------------
function onJWDVI_btnVisitIssueClick(/* cpr.events.CMouseEvent */ e){
	var cardType = app.lookup("VisitRequestInfo").getValue("VisitorType");
	var appld = "app/main/jawoondae/accessCard/accessCardSelectOne" + "?" + JWDVI_version;
	app.getRootAppInstance().openDialog(appld, {width : 520, height : 450}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.bind("headerTitle").toLanguage("Str_PassList");
				dialog.initValue = {"CardType":cardType}; // 카드 발급 타입
			dialog.modal = true;
		});
	}).then(function(returnValue){
		if (returnValue != undefined && returnValue.length > 0 ) {
			app.lookup("IssueCardInfo").setValue("cardNum", returnValue);
			sendVisitRequestIssue();
		}
	});
}
function sendVisitRequestIssue() {
	var tmpStr =  dataManager.getString("Str_VisitRequest") + " " + dataManager.getString("Str_Issued");
	comLib.showLoadMask("",tmpStr,"",0);	
	var requestData = app.lookup("sms_putVisitRequestInfoIssue");
	requestData.action = "/v1/visitRequest/issue/" + app.lookup("VisitRequestInfo").getValue("IndexKey");
	requestData.send()
}
function onSms_putVisitRequestInfoIssueSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.lookup("VisitRequestInfo").setValue("Status", 3);
		app.lookup("JWDVI_opbStatus").value = dataManager.getString("Str_Issued") + " " + dataManager.getString("Str_State");
		enableCtrlByVisitStatus(3);
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Issued"));
	}else if(resultCode == ERROR_CARD_ISSUE_STATUS_INVALID){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ErrorCardIssueStatusInvalid"));
	}else if(resultCode == ERROR_VISITOR_REQUEST_STATUS){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ErrorVisitorRequestStatus"));
	}else if(resultCode == ERROR_USER_INFO_INSERT_FAIL_FORVISITOR){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ErrorUserInfoInsertFailForvisitor"));
	}else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_RegistResult")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", dataManager.getString("Str_RegistResult")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("JWDVI_grpVisitRequestInfo").redraw();
}

function onSms_putVisitRequestInfoIssueSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putVisitRequestInfoIssueSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

//------------------------------------------------------------------------------------------------------------------------------------------------------
