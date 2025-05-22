/************************************************
 * otherTroopsExcelRegist.js
 * Created at 2019. 11. 17. 오후 10:22:01.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var JWDVI_version;
var rABS = true; // T : 바이너리, F : 어레이 버퍼


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	JWDVI_version = dataManager.getSystemVersion();
		
	var groupList = dataManager.getGroup();
	var cmbGroup = app.lookup("JWDVI_cmbTargetGroup");	 //출입 부대
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",
	});
	
	var positionList = dataManager.getPositionList();
	var cmbPosition = app.lookup("JWDVI_cmbVisitorPosition");	//직급
		cmbPosition.setItemSet(positionList, {
			label: "Name",
			value: "PositionID",
	});	
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var initValue = app.getHost().initValue;
		var indexKey = initValue["Index"];
		sendVisitRequestInfo(indexKey);
	} 
	
	
}

function sendVisitRequestInfo(indexKey) {
	var sms_getVisitRequestInfo = app.lookup("sms_getVisitRequestInfo");
	sms_getVisitRequestInfo.action = '/v1/visitRequest/' + indexKey;
	sms_getVisitRequestInfo.send();
}

function onSms_getVisitRequestInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	
	var dmVisitRequestInfo = app.lookup("VisitRequestInfo");
	var status = dmVisitRequestInfo.getValue("Status");
	if (status == 0) { // 대기
		app.lookup("JWDVI_opbStatus").value = dataManager.getString("Str_VisitRequestWaiting") + " " + dataManager.getString("Str_State");	
	} else if (status == 1) { // 승인
		app.lookup("JWDVI_opbStatus").value = dataManager.getString("Str_VisitRequestApproval") + " " + dataManager.getString("Str_State");
	} else if (status == 2) { // 거부
		app.lookup("JWDVI_opbStatus").value = dataManager.getString("Str_VisitRequestDeny") + " " + dataManager.getString("Str_State");
	} else if (status == 3) { // 발급
		app.lookup("JWDVI_opbStatus").value = dataManager.getString("Str_Issued") + " " + dataManager.getString("Str_State");
	}
	var processAt = dmVisitRequestInfo.getValue("ProcessAt");
	if (processAt == "0001-01-01 00:00:00") {
		processAt = "----";
	}
	enableCtrlByVisitStatus(status);
	
	var userInfo = dataManager.getAccountInfo();
	if (userInfo.getValue("Privilege") == 1 && dmVisitRequestInfo.getValue("VisitorRegistType") == 1) {
		app.lookup("JWDVI_btnCarInfoSet").visible = true
	}
	
	app.lookup("JWDVI_ipbProcessAt").value = processAt; // 처리 일시
	app.lookup("JWDVI_grdVisitorList").sort("VisitorName");
	app.lookup("JWDVI_grpVisitRequestResult").redraw();
	app.lookup("JWDVI_grpVisitRequestInfo").redraw();
}

function onSms_getVisitRequestInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getVisitRequestInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function enableCtrlByVisitStatus(status) {
	if (status == 0 ) {	// 대기 상태 Wait -> 승인 , 거부 가능
		app.lookup("JWDVI_btnApprove").enabled = true;
		app.lookup("JWDVI_btnDeny").enabled = true;
		app.lookup("JWDVI_btnVisitIssue").enabled = false;		
		app.lookup("JWDVI_btnDelete").enabled = true;		
	} else if (status == 1 ) { // 승인 상태 Approval  -> 거부, 발급 가능
		app.lookup("JWDVI_btnApprove").enabled = false;
		app.lookup("JWDVI_btnDeny").enabled = true;
		app.lookup("JWDVI_btnVisitIssue").enabled = true;
		app.lookup("JWDVI_btnDelete").enabled = true;		
	} else if (status == 2 ) { // 거부 상태 Denial -> 다시신청
		app.lookup("JWDVI_btnApprove").enabled = false;
		app.lookup("JWDVI_btnDeny").enabled = false;
		app.lookup("JWDVI_btnVisitIssue").enabled = false;
		app.lookup("JWDVI_btnDelete").enabled = false;
	} else if (status == 3 ) { // Issue -> 발급 상태 아무것도 안됨 -> 승인상태와 동일하게 
		app.lookup("JWDVI_btnApprove").enabled = false; 
		app.lookup("JWDVI_btnDeny").enabled = false;
		app.lookup("JWDVI_btnVisitIssue").enabled = true;
		app.lookup("JWDVI_btnDelete").enabled = false;
	} 
	
	app.lookup("JWDVI_grpTopVisitRequestInfo").redraw();
}

function onJWDVI_btnApproveClick(/* cpr.events.CMouseEvent */ e){
	
	comLib.showLoadMask("",dataManager.getString("Str_VisitRequestApproval"),"",0);	
	
	var sms_putVisitRequestInfoApproval = app.lookup("sms_putVisitRequestInfoApproval");
	var visitRequestInfo = app.lookup("VisitRequestInfo");
	sms_putVisitRequestInfoApproval.action = "/v1/visitRequest/approval/" + visitRequestInfo.getValue("IndexKey");
	sms_putVisitRequestInfoApproval.send();
}

function onSms_putVisitRequestInfoApprovalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {		
		dialogAlert(app, dataManager.getString("Str_Success"), "승인 완료", function( /*cpr.controls.Dialog*/ dialog){
			dialog.addEventListenerOnce("close", function(e){
				sendVisitRequestInfo(app.lookup("VisitRequestInfo").getValue("IndexKey"));	
			});
		});		
		
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
		
	var selectionEvent = new cpr.events.CUIEvent("execute-command", {content: {"target":DLG_VISIT_MANAGEMENT,"command":"refresh" }});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
	if (resultCode == COMERROR_NONE) {
		app.close(); //성공일때만 종료
	}
	
}

function onSms_putVisitRequestInfoApprovalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putVisitRequestInfoApprovalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onJWDVI_btnDenyClick(/* cpr.events.CMouseEvent */ e){
	dialogConfirm(app.getRootAppInstance(), "", "거부 하시겠습니까?", function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				comLib.showLoadMask("",dataManager.getString("Str_VisitRequestDeny"),"",0);	
				
				var sms_putVisitRequestInfoDeny = app.lookup("sms_putVisitRequestInfoDeny"); // 거부
				var visitRequestInfo = app.lookup("VisitRequestInfo");
				sms_putVisitRequestInfoDeny.action = "/v1/visitRequest/denial/" + visitRequestInfo.getValue("IndexKey");
				sms_putVisitRequestInfoDeny.send();
			} else {
				return;
			}
		});
	});
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
	var selectionEvent = new cpr.events.CUIEvent("execute-command", {content: {"target":DLG_VISIT_MANAGEMENT,"command":"refresh" }});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

function onSms_putVisitRequestInfoDenySubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putVisitRequestInfoDenySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 버튼(JWDVI_btnVisitIssue)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWDVI_btnVisitIssueClick(/* cpr.events.CMouseEvent */ e){
	
	var grdVisitorList= app.lookup("JWDVI_grdVisitorList");
	var chkIndices = grdVisitorList.getCheckRowIndices();
	var count = chkIndices.length;
	
	if( count < 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), "출입증 발급 대상이 선택되지 않았습니다.");
		return;
	} else if (count > 2) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "출입증 발급 대상을 한명만 지정해 주세요");
		return;
	}
	var dsVisitorInfoList = app.lookup("VisitorInfoList");
	
	var dsIssueRequestList = app.lookup("IssueRequestList");
	dsIssueRequestList.clear();
	
	for( var i = 0; i < count; i++ ){
		var visitorInfo = dsVisitorInfoList.getRow(chkIndices[i]);
		//if( visitorInfo.getValue("IssueStatus")==0) {
			dsIssueRequestList.addRowData({"VisitorID":visitorInfo.getValue("VisitorID"),"RowIndex":chkIndices[i]});
		//}
	}	
	if( dsIssueRequestList.getRowCount() == 0 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), "출입증 발급 대상이 없습니다.");
		return;
	}
	
	processCardIssue();
}

function processCardIssue(){
	var dsIssueRequestList = app.lookup("IssueRequestList");
	if( dsIssueRequestList.getRowCount() == 0 ){
		return;
	}
	
	var reqInfo = dsIssueRequestList.getRow(0);				
	var dsVisitorInfoList = app.lookup("VisitorInfoList");
	var dsVisitorInfo = dsVisitorInfoList.getRow(reqInfo.getValue("RowIndex"));
	
	var visitorID = dsVisitorInfo.getValue("VisitorID");
	var visitorName = dsVisitorInfo.getValue("VisitorName");
	var mobile = dsVisitorInfo.getValue("VisitorMobile");
	
	var dmVisitRequestInfo = app.lookup("VisitRequestInfo");
	var cardType = dmVisitRequestInfo.getValue("VisitorRegistType");
	
	var dmIssueInfo = app.lookup("IssueInfo");
	dmIssueInfo.clear();	
	dmIssueInfo.setValue("VisitorID", visitorID);
	dmIssueInfo.setValue("Mobile", mobile);
		
	var appld = "app/main/jawoondae/accessCard/accessCardSelectOne" + "?" + JWDVI_version;
	app.getRootAppInstance().openDialog(appld, {width : 520, height : 450}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.bind("headerTitle").toLanguage("Str_PassList");
			dialog.initValue = {"CardType":cardType,"VisitorName":visitorName}; // 카드 발급 타입
			dialog.modal = true;
		});
	}).then(function(returnValue){
		if (returnValue != undefined && returnValue["cardNum"].toString().length > 0 ) {
			var issuetype = returnValue["OutTroopsIssueType"];
			var cardNumber = returnValue["cardNum"];			
			dmIssueInfo.setValue("CardNumber", cardNumber);
			dmIssueInfo.setValue("IssueType", issuetype);
			//{"OutTroopsIssueType":0, "cardNum": rowdata.getValue("CardNum")}		
			sendVisitRequestIssue();
		}
	});	
}
function sendVisitRequestIssue() {
	var tmpStr =  dataManager.getString("Str_VisitRequest") + " " + dataManager.getString("Str_Issued");
	comLib.showLoadMask("",tmpStr,"",0);	
	var sms_putVisitRequestInfoIssue = app.lookup("sms_putVisitRequestInfoIssue");
	sms_putVisitRequestInfoIssue.action = "/v1/visitRequest/issue/" + app.lookup("VisitRequestInfo").getValue("IndexKey");
	sms_putVisitRequestInfoIssue.send()
}

function onSms_putVisitRequestInfoIssueSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dsIssueRequestList = app.lookup("IssueRequestList");
	var issueInfo = dsIssueRequestList.getRow(0);
	
	var dsVisitorInfoList = app.lookup("VisitorInfoList");
	var visitorInfo = dsVisitorInfoList.getRow(issueInfo.getValue("RowIndex"))
	
	if( visitorInfo ){
		var resultCode = app.lookup("Result").getValue("ResultCode");
		if (resultCode == COMERROR_NONE) {
			visitorInfo.setValue("IssueStatus",1);
			visitorInfo.setValue("result","성공");	
		}else{
			visitorInfo.setValue("IssueStatus",0);
			visitorInfo.setValue("result","실패");
		}
		
		var grdVisitorList= app.lookup("JWDVI_grdVisitorList");
		//grdVisitorList.clearAllCheck();
		grdVisitorList.setCheckRowIndex(issueInfo.getValue("RowIndex"), false);
	}
	dsIssueRequestList.realDeleteRow(0);
	processCardIssue();
}

function onSms_putVisitRequestInfoIssueSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putVisitRequestInfoIssueSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 버튼(JWDVI_btnDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWDVI_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
		var approvalStatus = app.lookup("JWDVI_opbStatus").value;
		if (approvalStatus == "승인") {
			dialogAlert(app, dataManager.getString("Str_Warning"),"승인처리된 신청은 삭제 할 수 없습니다. 거부 이후 삭제 해주세요.");
			return;
		} 
		
		dialogConfirm(app.getRootAppInstance(), "", "삭제 하시겠습니까?", function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				comLib.showLoadMask("","방문 신청 삭제","",0);	
				var sms_deleteVisitRequestInfo = app.lookup("sms_deleteVisitRequestInfo");
				sms_deleteVisitRequestInfo.action = "/v1/visitRequest/" + app.lookup("VisitRequestInfo").getValue("IndexKey");
				sms_deleteVisitRequestInfo.send();
			} else {
				return;
			}
		});
	});	
}

function onSms_deleteVisitRequestInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), "삭제 완료", function( /*cpr.controls.Dialog*/ dialog){
			dialog.addEventListenerOnce("close", function(e){
				var selectionEvent = new cpr.events.CUIEvent("execute-command", {content: {"target":DLG_VISIT_MANAGEMENT,"command":"refresh" }});
				app.getHostAppInstance().dispatchEvent(selectionEvent);
				app.close();	
			});
		});		
	}else {
		//dialogAlert(app, "Waning", "방문 신청 삭제 "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", "방문 신청 삭제 "+dataManager.getString("Str_Failed")+" : "+ dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_deleteVisitRequestInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_deleteVisitRequestInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onJWDVI_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var jWDVI_btnSearch = e.control;
	var strKeyword = app.lookup("JWDVI_ipbKeyword").value;
	if (strKeyword.length == 0) {
		dialogAlert(app, "Waning", "이름을 입력해 주세요.");
		return;
	}
	
	var grdVisitorList = app.lookup("JWDVI_grdVisitorList");
	var Visitor = grdVisitorList.findFirstRow("VisitorName == '" + strKeyword + "'");
	if( Visitor ){	
		var idx = Visitor.getIndex();
		grdVisitorList.selectRows(idx);
		grdVisitorList.focusCell(idx, 0);
	} else {
		dialogAlert(app, "Waning", "검색된 이름이 없습니다..");
	}
}

function onJWDVI_btnWaitClick(/* cpr.events.CMouseEvent */ e){
	comLib.showLoadMask("","신청 대기상태","",0);	
	
	var sms_putVisitRequestInfoWaiting = app.lookup("sms_putVisitRequestInfoWait");
	var visitRequestInfo = app.lookup("VisitRequestInfo");
	sms_putVisitRequestInfoWaiting.action = "/v1/visitRequest/waiting/" + visitRequestInfo.getValue("IndexKey");
	sms_putVisitRequestInfoWaiting.send();
}

function onSms_putVisitRequestInfoWaitSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {		
		dialogAlert(app, dataManager.getString("Str_Success"), "취소 처리 완료", function( /*cpr.controls.Dialog*/ dialog){
			dialog.addEventListenerOnce("close", function(e){
				sendVisitRequestInfo(app.lookup("VisitRequestInfo").getValue("IndexKey"));	
			});
		});		
		var selectionEvent = new cpr.events.CUIEvent("execute-command", {content: {"target":DLG_VISIT_MANAGEMENT,"command":"refresh" }});
		app.getHostAppInstance().dispatchEvent(selectionEvent);
		app.close();
		return;
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
		
	var selectionEvent = new cpr.events.CUIEvent("execute-command", {content: {"target":DLG_VISIT_MANAGEMENT,"command":"refresh" }});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

function onSms_putVisitRequestInfoWaitSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putVisitRequestInfoWaitSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onJWDVI_btnVisitModifyClick(/* cpr.events.CMouseEvent */ e){
	var accountInfo = dataManager.getAccountInfo();
	var dmVisitRequestInfo = app.lookup("VisitRequestInfo");
	var status = dmVisitRequestInfo.getValue("Status");
	var visitorType = dmVisitRequestInfo.getValue("VisitorRegistType");
	if (visitorType == 0 ) {
		if (status != 0) { // 대기 상태 이외에는 수정 불가.
			dialogAlert(app, "Waning", "대기 상태가 아닙니다. 수정 할 수 없습니다.");
			return;
		} 
	}	
	
	var adminPrivilege = accountInfo.getValue("Privilege"); //권한 체크 
	if (adminPrivilege == 1 || adminPrivilege == 1000000000000000000 || adminPrivilege == 1000) {
		// 체크한 정보 어떻게 가져오는지 체크
		var dsVisitorInfoList = app.lookup("VisitorInfoList");
	
		var grdVisitorList= app.lookup("JWDVI_grdVisitorList");
		var chkIndices = grdVisitorList.getCheckRowIndices();
		var count = chkIndices.length;
		if (count == 0) {
			dialogAlert(app, "Waning", "체크된 방문신청자가 없습니다.");
        }
        
		var visitorInfo = dsVisitorInfoList.getRow(chkIndices[0]);
		if (visitorInfo.getValue("IssueStatus") == 1) {
			if ( confirm("이미 발급완료된 신청자입니다. \n계속 진행 하시겠습니까?") == false ) {
				return;
			}
		}
		var appld = "app/main/jawoondae/visitor/visitorInfoUpdate" + "?" + JWDVI_version; //경로 체크
			app.getRootAppInstance().openDialog(appld, {width : 350, height : 400}, function(dialog){
			dialog.ready(function(dialogApp){
				// 초기값 올려주기 //
				dialog.headerTitle ="방문 신청자 정보 수정";
				dialog.initValue = {
					"visitIndex": app.lookup("VisitRequestInfo").getValue("IndexKey"),
					"visitorInfo": visitorInfo.getRowData(),
					"visitorType": visitorType
				};
				dialog.headerTitle = "방문신청서 수정";
				dialog.modal = true;
			});
		}).then(function(returnValue){
			console.log(returnValue);
			if (returnValue != undefined) {
				dsVisitorInfoList.updateRow(chkIndices[0], returnValue.getDatas());
				grdVisitorList.redraw();
			} 
		});
	} else { // 수정불가
		dialogAlert(app, "Waning", "수정 권한이 없는 계정입니다.");
		return;
	}
	
}


/*
 * "차량정보" 버튼(JWDVI_btnCarInfoSet)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWDVI_btnCarInfoSetClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var jWDVI_btnCarInfoSet = e.control;
	
	var dsVisitorInfoList = app.lookup("VisitorInfoList");
	
	var dsIssueRequestList = app.lookup("IssueRequestList");
	dsIssueRequestList.clear();
	var count = dsVisitorInfoList.getRowCount();
	for( var i = 0; i < count; i++ ){
		var visitorInfo = dsVisitorInfoList.getRow(i);
		dsIssueRequestList.addRowData({"VisitorID":visitorInfo.getValue("VisitorID"),"RowIndex":i});
	}	
	if( dsIssueRequestList.getRowCount() == 0 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), "차량정보 갱신할 대상이 없습니다.");
		return;
	}
	
	//processCardIssue();
	processCarInfos();
}

function processCarInfos() {
	var dsIssueRequestList = app.lookup("IssueRequestList");
	if( dsIssueRequestList.getRowCount() == 0 ){ // 갱신할 리스트 없으면 끝
		comLib.hideLoadMask();
		return;
	}
	
	var reqInfo = dsIssueRequestList.getRow(0);				
	var dsVisitorInfoList = app.lookup("VisitorInfoList");
	var dsVisitorInfo = dsVisitorInfoList.getRow(reqInfo.getValue("RowIndex"));
	
	
	var dmIssueInfo = app.lookup("CarInfoSet");
	dmIssueInfo.clear();	
	dmIssueInfo.setValue("VisitorID", dsVisitorInfo.getValue("VisitorID"));
	dmIssueInfo.setValue("Mobile", dsVisitorInfo.getValue("VisitorMobile"));
	dmIssueInfo.setValue("VisitorCarNumber", dsVisitorInfo.getValue("VisitorCarNumber"));
	dmIssueInfo.setValue("IssueStatus", dsVisitorInfo.getValue("IssueStatus"));
	sendVisitorCarInfoSet();
}


function sendVisitorCarInfoSet() {
	var tmpStr =  "방문자 차량정보 갱신";
	
	comLib.showLoadMask("",tmpStr,"",0);	
	var sms_putVisitorCarInfoSet = app.lookup("sms_putVisitorCarInfoSet");
	sms_putVisitorCarInfoSet.action = "/v1/visitRequest/carInfoSet/" + app.lookup("VisitRequestInfo").getValue("IndexKey");
	sms_putVisitorCarInfoSet.send()
}

function onSms_putVisitorCarInfoSetSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	//comLib.hideLoadMask();
	var dsIssueRequestList = app.lookup("IssueRequestList");
	var issueInfo = dsIssueRequestList.getRow(0); // 성공이던 실패던 갱신처리
	
	var dsVisitorInfoList = app.lookup("VisitorInfoList");
	var visitorInfo = dsVisitorInfoList.getRow(issueInfo.getValue("RowIndex"))
	
	if( visitorInfo ){
		var resultCode = app.lookup("Result").getValue("ResultCode");
		if (resultCode == COMERROR_NONE) {
		}else{
			console.log(visitorInfo.getValue("VisitorID")+" : carNumber :" +visitorInfo.getValue("VisitorCarNumber")+ " : "+resultCode);
		}
		//comLib.updateLoadMask(subTitle);
	}
	dsIssueRequestList.realDeleteRow(0);
	processCarInfos();
}

function onSms_putVisitorCarInfoSetSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putVisitorCarInfoSetSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * "수 정" 버튼(JWDVI_btnVisitRequestModify)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWDVI_btnVisitRequestModifyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var jWDVI_btnVisitRequestModify = e.control;
	var accountInfo = dataManager.getAccountInfo();
	var dmVisitRequestInfo = app.lookup("VisitRequestInfo");
	var status = dmVisitRequestInfo.getValue("Status");
	var visitorType = dmVisitRequestInfo.getValue("VisitorRegistType");
	if (visitorType == 0 ) {
		if (status != 0) { // 대기 상태 이외에는 수정 불가.
			dialogAlert(app, "Waning", "대기 상태가 아닙니다. 수정 할 수 없습니다.");
			return;
		} 
	}	
	
	var adminPrivilege = accountInfo.getValue("Privilege"); //권한 체크 
	if (adminPrivilege == 1 || adminPrivilege == 1000000000000000000 || adminPrivilege == 1000) {
		// 방문신청서 인덱스 가지고 오기
		var appld = "app/main/jawoondae/visitor/visitInfoUpdate" + "?" + JWDVI_version; //경로 체크
		app.getRootAppInstance().openDialog(appld, {width : 350, height : 400}, function(dialog){
			dialog.ready(function(dialogApp){
				// 초기값 올려주기 //
				dialog.headerTitle ="방문신청서 수정";
				dialog.initValue = {
					"visitRequestInfo": app.lookup("VisitRequestInfo").getDatas()
				};
				dialog.modal = true;
			});
		}).then(function(returnValue){
			console.log(returnValue);
			if (returnValue != undefined) {
				console.log(returnValue);
				var visitRequestInfo = app.lookup("VisitRequestInfo");
				returnValue.copyToDataMap(visitRequestInfo);
				console.log(visitRequestInfo.getDatas());
				app.lookup("JWDVI_grpVisitRequestInfo").redraw();
			} 
		});
	} else { // 수정불가
		dialogAlert(app, "Waning", "수정 권한이 없는 계정입니다.");
		return;
	}
		
}
