/************************************************
 * visitorInfoUpdate.js
 * Created at 2020. 2. 13. 오전 10:28:33.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();	
	comLib = createComUtil(app);
	// 직급 추가.
	var positionList = dataManager.getPositionList();
	var cmbPosition = app.lookup("JWDVU_cmbVisitorPosition");	//직급
		cmbPosition.setItemSet(positionList, {
			label: "Name",
			value: "PositionID",
	});	
	
	var initValue = app.getHost().initValue;
	var visitorInfo = initValue["visitorInfo"];
	if (visitorInfo) {
		app.lookup("VisitorRequestInfo").build(visitorInfo);
		//	console.log(app.lookup("VisitorRequestInfo").getDatas());
		var visitorInfo = app.lookup("VisitorRequestInfo");
		var issueStatus = visitorInfo.getValue("IssueStatus");
		if (issueStatus == 0 ) {	// 대기 상태 Wait -> 승인 , 거부 가능
			app.lookup("JWDVU_opbIssueStatus").value = dataManager.getString("Str_VisitRequestWaiting") + " " + dataManager.getString("Str_State");
		} else if (issueStatus == 1 ) { // 승인 상태 Approval  -> 거부, 발급 가능
			app.lookup("JWDVU_opbIssueStatus").value = dataManager.getString("Str_VisitRequestApproval") + " " + dataManager.getString("Str_State");
		} else if (issueStatus == 2 ) { // 거부 상태 Denial -> 다시신청
			app.lookup("JWDVU_opbIssueStatus").value = dataManager.getString("Str_VisitRequestDeny") + " " + dataManager.getString("Str_State");
		} else if (issueStatus == 3 ) { // Issue -> 발급 상태 아무것도 안됨 -> 승인상태와 동일하게 
			app.lookup("JWDVU_opbIssueStatus").value = dataManager.getString("Str_Issued") + " " + dataManager.getString("Str_State");
		} 
		//var visitorType = visitorInfo.getValue("VisitorType");
		var visitorType = initValue["visitorType"];
		if (visitorType == 0) { 
			app.lookup("JWDVU_ipbVisitorID").inputFilter= '^[0-9]*$';
			app.lookup("JWDVU_ipbVisitorID").maxLength= 8;
			
			//app.lookup("JWDVU_cmbVisitorPosition").enabled = false;
		}
	}
	var index = initValue["visitIndex"];
	if (index) {
		var visitIndex = app.lookup("VisitIndex");
		var visitorRequest = app.lookup("VisitorRequestInfo");
		visitIndex.setValue("Index", index);
		visitIndex.setValue("VisitorID", visitorRequest.getValue("VisitorID"));
		visitIndex.setValue("Mobile", visitorRequest.getValue("VisitorMobile"));
	}
	app.lookup("JWDVU_grpMain").redraw();
}

function onJWDVU_btnModifyClick(/* cpr.events.CMouseEvent */ e){
	comLib.showLoadMask("","방문 신청 정보 수정","",0);	
	var visitIndex = app.lookup("VisitIndex");
	var smsData = app.lookup("sms_putVisitorInfoUpdate");
	smsData.action = '/v1/visitRequest/update' + '/' + visitIndex.getValue("Index");
	smsData.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putVisitorInfoUpdateSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, "성공", "방문신청자 정보가 성공 하였습니다.");
		app.close(app.lookup("VisitorRequestInfo"));
	} else {
		console.log("resultCode : " + resultCode);
		if(resultCode == 0x00000001){ // ErrorInvalidParameter
			dialogAlert(app, dataManager.getString("Str_Failed"), "이미 등록된 차량번호가 있습니다.");		
		} else if (resultCode == 0x04000005) { //ErrorPrivilegeNotPermission
			dialogAlert(app, dataManager.getString("Str_Failed"), "수정 권한이 없습니다.");		
		} else if (resultCode == ERROR_VISIT_REQUEST_NOT_EXIST){ //ErrorVisitRequestNotExist
			dialogAlert(app, dataManager.getString("Str_Failed"), "방문신청서가 존재 하지 않습니다.");
		} else if (resultCode == 0x0D000001) { //ErrorDB
			dialogAlert(app, dataManager.getString("Str_Failed"), "방문신청서 정보를 가져올수 없습니다.");
		} else if (resultCode == 0x7F000019) { // 0x7F000019 
			dialogAlert(app, dataManager.getString("Str_Failed"), "방문신청서 정보를 변경 할 수 없습니다.");
		} else if (resultCode == 0x7F000010) { //ErrorUserCarRegist
			dialogAlert(app, dataManager.getString("Str_Failed"), "차량정보 삭제에 실패 하였습니다.");
		} else {
			dialogAlert(app, "Waning", "방문신청자 정보 수정 실패");
		}
		
	}
}

function onSms_putVisitorInfoUpdateSubmitError(/* cpr.events.CSubmissionEvent */ e){
	
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putVisitorInfoUpdateSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * "취 소" 버튼(JWDVU_btnCancel)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWDVU_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}
