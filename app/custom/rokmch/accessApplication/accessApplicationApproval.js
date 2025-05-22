/************************************************
 * accessApplicationApproval.js
 * Created at 2020. 12. 17. 오전 10:39:43.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");

var pageRowCount  = 30;
var viewPageCount = 10;
var menuType;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	var initValue = app.getHost().initValue;
	var programID = parseInt(initValue["programID"]);
	
	app.lookup("ACAPAP_opbTitle").unbind("value");
	switch (programID) {
	case DLG_ARMYHQ_ACCESS_APPLICATION_APPROVAL:
		app.lookup("ACAPAP_opbTitle").value = dataManager.getString("Str_ARMYHQ_AccessApplicationApproval");
		menuType = 1;
		break;
	case DLG_ARMYHQ_VISIT_APPLICATION_APPROVAL:
		app.lookup("ACAPAP_opbTitle").value = dataManager.getString("Str_ARMYHQ_VisitApplicationApproval");
		menuType = 2;
		break;
	default: // programID 없으면 default 0
		// Todo: 에러 처리
		// 0일경우 출입신청, 방문 조회 모두 조회됨
		menuType = 0;
	}

	
	var today = dateLib.getDate();
	app.lookup("ACAPAP_dtiStart").value = today.substr(0, 8).toString();
	app.lookup("ACAPAP_dtiEnd").value = today.substr(0, 8).toString();
	
	var dsGroupList = app.lookup("GroupList");
	var groupList = dataManager.getGroup();
	groupList.copyToDataSet(dsGroupList);
	dsGroupList.addRowData({"Name":dataManager.getString("Str_All"),"GroupID":0});
	dsGroupList.commit();
	
	app.lookup("ARMY_cmbGroup").redraw();
	
	var cmbGroup = app.lookup("ARMY_cmbGroup");
	cmbGroup.setItemSet(dsGroupList, {label: "Name",value: "GroupID"});
	
	var cmbUserAccessGroup = app.lookup("ARMY_cmbAccessGroup");	
	cmbUserAccessGroup.setItemSet(dataManager.getAccessGroup(), {
			label: "Name",
			value: "ID"		
	});
	
	app.lookup("ACAPAP_opbTotal").value = 0;
	setPageIndexer(0, 1, pageRowCount,10);
	sendSmsAccessApplicationApproval();
	
	// Master 계정의 경우 반려, 승인 버튼 제거
	if (dataManager.getAccountID() == 1000000000000000000) {
		app.lookup("ACAPAP_btnCompanion").visible = false;
		app.lookup("ACAPAP_btnApproved").visible = false;	
	}
}

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("ACAPAP_listPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("ACAPAP_listPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function sendSmsAccessApplicationApproval() {
	app.lookup("AccessApplicationApprovalList").clear();

	var curPageIndex = app.lookup("ACAPAP_listPageIndexer").currentPageIndex;
	var offset = (curPageIndex-1) * pageRowCount;
	var sms_getAccessApplicationApprovals = app.lookup("sms_getAccessApplicationApprovals");
	sms_getAccessApplicationApprovals.setParameters("offset", offset);	
	sms_getAccessApplicationApprovals.setParameters("limit", pageRowCount);
	
	sms_getAccessApplicationApprovals.setParameters("menuType", menuType);	// MenuType 0: 구분없음, 1: 출입신청, 2: 방문신청 
	sms_getAccessApplicationApprovals.setParameters("startTime", app.lookup("ACAPAP_dtiStart").value);
	sms_getAccessApplicationApprovals.setParameters("endTime", app.lookup("ACAPAP_dtiEnd").value);
	
	// Todo: 필수 값 초기화 확인 필요
	sms_getAccessApplicationApprovals.setParameters("accessCardStatus", -1); 
	sms_getAccessApplicationApprovals.setParameters("userType", -1);		
	sms_getAccessApplicationApprovals.setParameters("expire", -1);
	
	sms_getAccessApplicationApprovals.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAccessApplicationApprovalsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getAccessApplicationApprovals = e.control;
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		var acApApprovals = app.lookup("AccessApplicationApprovalList");
		var count = acApApprovals.getRowCount();
		for( var i = 0; i < count; i++){
			var approval = acApApprovals.getRow(i)
			if (approval.getValue("ApprovalState") != 2) {	// 결재 진행 상태가 아니면 산태값을 삭제 상태로
				approval.setState(cpr.data.tabledata.RowState.DELETED); 
			}
		}
		var totalCount = app.lookup("Total").getValue("Count");
		
		// var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		selectPaging(totalCount, viewPageCount);
		
		app.lookup("ACAPAP_opbTotal").value = totalCount;
		app.lookup("ARMY_grdAccessApplicaionApproval").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getAccessApplicationApprovalsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getAccessApplicationApprovalsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

/*
 * "Search" 버튼(ACAPAP_btnSearch)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACAPAP_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndex = app.lookup("ACAPAP_listPageIndexer");	
	pageIndex.currentPageIndex = 1;
	sendSmsAccessApplicationApproval();
}

/*
 * 버튼(ACAPAP_btnCompanion)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACAPAP_btnCompanionClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCAPAP_btnCompanion = e.control;
	
	var acApApprovals = app.lookup("ARMY_grdAccessApplicaionApproval");
	var updateApprovals = app.lookup("UserAccessApproval");
	updateApprovals.clear();
	
	var ckIndices = acApApprovals.getCheckRowIndices();
	ckIndices.forEach(function(idx){
		if(acApApprovals.getRowState(idx) == cpr.data.tabledata.RowState.DELETED || acApApprovals.getRow(idx).getValue("ApprovalState") != 2 ){
			acApApprovals.setCheckRowIndex(idx, false);
		}
	});
	
	var indices = acApApprovals.getCheckRowIndices();
	if (indices.length == 0){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection")); 
		return;
	}
	
	// 반려사유 입력
	var appld = "app/dialog/inputMessage";
	app.openDialog(appld, {width : 450, height : 300}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_ARMY_Companion");
		dialog.style.header.css("background-color", "#528443");
		dialog.initValue = {"title": dataManager.getString("Str_ARMY_EnterReasonRejectMessage")};
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != "" ){
			// 반려 사유를 입력 받아 업데이트
			indices.forEach(function(idx){
				var approval = acApApprovals.getRow(idx);
				if(acApApprovals.getRowState(idx) != cpr.data.tabledata.RowState.DELETED && approval.getValue("ApprovalState") == 2 ){
					var rowData = {"ApplicationIndex": approval.getValue("ApplicationIndex"), "ApprovalState": 4, "Message": returnValue};  //결재반려
					updateApprovals.addRowData(rowData);
				} else {
					acApApprovals.setCheckRowIndex(idx, false);
				}
			});
				
			app.lookup("sms_putAccessApplicationApprovals").send();
		} 
	});	
}

/*
 * 버튼(ACAPAP_btnApproved)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACAPAP_btnApprovedClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aCAPAP_btnApproved = e.control;
	
	var acApApprovals = app.lookup("ARMY_grdAccessApplicaionApproval");
	var updateApprovals = app.lookup("UserAccessApproval");
	updateApprovals.clear();
	
	var indices = acApApprovals.getCheckRowIndices();
	indices.forEach(function(idx){
		var approval = acApApprovals.getRow(idx);
		if(acApApprovals.getRowState(idx) != cpr.data.tabledata.RowState.DELETED && approval.getValue("ApprovalState") == 2 ){
			var rowData = {"ApplicationIndex": approval.getValue("ApplicationIndex"), "ApprovalState": 3};  //결재승인
			updateApprovals.addRowData(rowData);
		} else {
			acApApprovals.setCheckRowIndex(idx, false);
		}
	});
	
	if (updateApprovals.getRowCount() == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection")); 
		return 
	}
	
	app.lookup("sms_putAccessApplicationApprovals").send();	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putAccessApplicationApprovalsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putAccessApplicationApprovals = e.control;
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode != COMERROR_NONE){		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	
	sendSmsAccessApplicationApproval();
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_putAccessApplicationApprovalsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_putAccessApplicationApprovalsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onACAPAP_listPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var aCAPAP_listPageIndexer = e.control;
	sendSmsAccessApplicationApproval();
}


/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onARMY_grdAccessApplicaionApprovalRowDblclick(/* cpr.events.CGridMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var aRMY_grdAccessApplicaionApproval = e.control;
	if (menuType == 2) { // 방문 신청일 경우
		var grdApproval = app.lookup("ARMY_grdAccessApplicaionApproval");
		var selectedIndex = grdApproval.getSelectedRowIndex();
		if (grdApproval.getRow(selectedIndex).getValue("ApprovalState") == 4) {	// 반려 상태일 경우
			var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
				content: {
					"Target": DLG_ARMYHQ_VISIT_APPLICATION_MANAGEMENT,
					"ApplicationIndex": e.row.getValue("ApplicationIndex"),
				}
			});
			app.getHostAppInstance().dispatchEvent(selectionEvent);
		}
	}
}
