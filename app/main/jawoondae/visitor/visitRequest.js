/************************************************
 * visitRegistration.js
 * Created at 2019. 9. 17. 오후 3:07:21.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var usint_version;
// Body에서 load 이벤트 발생 시 호출. 
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	var groupList = dataManager.getGroup();	
	
	var cmbTargetGroup = app.lookup("JWDVR_cmbTargetGroup");
	cmbTargetGroup.addItem(new cpr.controls.Item("---",0));	
	cmbTargetGroup.setItemSet(groupList, {
		label: "Name",
		value: "GroupID",
	});
	/*
	var cmbVisitorGroup = app.lookup("JWDVR_cmbVisitorGroup");
	cmbVisitorGroup.addItem(new cpr.controls.Item("---",0));	
	cmbVisitorGroup.setItemSet(groupList, {
		label: "Name",
		value: "GroupID",
	});
	
	var positionList = dataManager.getPositionList();
	console.log(positionList);

	var positionList = dataManager.getPositionList()
	var cmpPosition = app.lookup("JWDVR_cmbVisitorPosition");
	cmpPosition.addItem(new cpr.controls.Item("---",0));	
	cmpPosition.setItemSet(positionList, {
		label: "Name",
		value: "PositionID",
	});	
	*/
	var dtiStart = app.lookup("JWDVR_dtiVisitStartAt");
	var dtiEnd = app.lookup("JWDVR_dtiVisitEndAt");
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtiEnd.value = now.format('YYYY-MM-DD');
	dtiStart.value = now.format('YYYY-MM-DD');
}

// "엑셀 등록" 버튼에서 click 이벤트 발생 시 호출.
function onJWDVR_btnExcelRegistClick(/* cpr.events.CMouseEvent */ e){	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {"Target":DLG_VISIT_REQUEST_EXCEL}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 인솔자 찾기. "검색" 버튼에서 click 이벤트 발생 시 호출.
function onJWDVR_btnUserSearchClick(/* cpr.events.CMouseEvent */ e){	
	var appld = "app/main/users/userSelectOne" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 600, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.modal = true;
	}).then(function(/*cpr.data.DataSet*/userInfo){
		if(userInfo){
			var dmLeaderInfo = app.lookup("LeaderInfo");
			dmLeaderInfo.build(userInfo);
		}
	});	
}

// "추가" 버튼에서 click 이벤트 발생 시 호출.
function onJWDVR_btnCarAddClick(/* cpr.events.CMouseEvent */ e){	
	var dsCarInfo = app.lookup("dsCarInfo");
	dsCarInfo.addRow();
	dsCarInfo.commit();
}

// "삭제" 버튼에서 click 이벤트 발생 시 호출.
function onJWDVR_btnCarDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdCardList = app.lookup("JWDVR_grdCarInfo");
	var chkIndices = grdCardList.getCheckRowIndices();
	if(chkIndices.length == 0){		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	
	var dsCarInfo = app.lookup("dsCarInfo");
	chkIndices.forEach(function(rowIndex){
		dsCarInfo.deleteRow(rowIndex)
	});	
	dsCarInfo.commit();
}

function validateVisitRequestInfo(){
	var dmVisitTargetInfo = app.lookup("dmVisitTargetInfo");
	
	if( dmVisitTargetInfo.getValue("TargetGroupID")==0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_TargetGroupNotSelected"));
		return false;
	}
	
	if( dmVisitTargetInfo.getValue("VisitPurpose").length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitPurposeNotEntered"));
		return false;
	}
	
	// 출입기간
	var visitorType = app.lookup("JWDVR_cmbVisitType").value
	var startAt = dmVisitTargetInfo.getValue("VisitStartAt");
	/*
	if (visitorType == 7) { //방문
		dmVisitTargetInfo.setValue("VisitEndAt",startAt);	
	}	 
	*/
	
	var dmLeaderInfo = app.lookup("LeaderInfo");
	var leaderID = dmLeaderInfo.getValue("ID");
	if( leaderID == null || leaderID.length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_LeaderNotSelected"));
		return false;
	} else {
		var dmVisitTargetInfo = app.lookup("dmVisitTargetInfo");
		dmVisitTargetInfo.setValue("LeaderID", leaderID);
	}
	
	if( dmVisitTargetInfo.getValue("VisitorGroupName")==""){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorGroupNotSelected"));
		return false;
	}
	
	if( dmVisitTargetInfo.getValue("VisitorID").length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorIDNotEntered"));
		return false;
	}
	/*
	if( dmVisitTargetInfo.getValue("VisitorPosition")==0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorPositionNotSelected"));
		return false;
	}
	*/
	if( dmVisitTargetInfo.getValue("VisitorName").length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorNameNotEntered"));
		return false;
	}
	/*
	if( dmVisitTargetInfo.getValue("VisitorPhone").length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorPhoneNotEntered"));
		return false;
	}
	*/
	if( dmVisitTargetInfo.getValue("VisitorMobile").length == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Warn_VisitorMobileNotEntered"));
		return false;
	}
	
	return true;
}

// "신청" 버튼에서 click 이벤트 발생 시 호출.
function onJWDVR_btnVisitRegistClick(/* cpr.events.CMouseEvent */ e){
	
	if( validateVisitRequestInfo()==false){
		return;
	}
	
	var visitRequest = app.lookup("dmVisitTargetInfo");
	visitRequest.setValue("LeaderID", app.lookup("LeaderInfo").getValue("UniqueID"));
	var sms_postVisitRequest = app.lookup("sms_postVisitRequest");
	sms_postVisitRequest.send();
}

// 방문 신청 저장 완료
function onSms_postVisitRequestSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode"); 
	if( resultCode == COMERROR_NONE ){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
	}else if(resultCode == ERROR_VISITOR_TYPE_INVALID){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ErrorVisitorTypeInvalid"));
	}else if(resultCode == ERROR_VISIT_PURPOSE_INVALID){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ErrorVisitPurposeInvalid"));
	}else if(resultCode == ERROR_VISIT_REQUEST_ACCESS_GROUP_NOT_EXIST){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ErrorVisitRequestAccessGroupNotExist"));
	}else{
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_SaveFailed"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 방문 신청 저장 에러
function onSms_postVisitRequestSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 방문 신청 저장 타임아웃
function onSms_postVisitRequestSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

function onJWDVR_cmbVisitTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** * @type cpr.controls.ComboBox */
	var jWDVR_cmbVisitType = e.control;
	DateSet(); // 날짜 초기화
	/* 고객요청에 의한 제한 삭제
 	if (jWDVR_cmbVisitType.value == 2) { //교육
		app.lookup("JWDVR_dtiVisitEndAt").enabled = true;
	} else if (jWDVR_cmbVisitType.value == 7) {
		app.lookup("JWDVR_dtiVisitEndAt").enabled = false;
	} 
	app.lookup("JWDVR_grpAccessPeriod").redraw();
	*/
}

function DateSet() {
	var visitRequest = app.lookup("dmVisitTargetInfo");
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	visitRequest.setValue("VisitStartAt", now.format('YYYY-MM-DD'));
	visitRequest.setValue("VisitEndAt", now.format('YYYY-MM-DD'));
}
	

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSMAG_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSMAG_imgHelpPageClick2(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
