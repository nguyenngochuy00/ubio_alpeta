/************************************************
 * accessApplicationSearchApproval.js
 * Created at 2021. 2. 1. 오후 3:58:35.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");

var pageRowCount  = 30;
var viewPageCount = 10;
var menuType=1;

var loginPrivilege = 0;	 // (0: 사용자, 1: 관리자, 2: 승인자)
var loginID;
var groupCode;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	groupCode = getLoginUserGroupCode();
	
	var initValue = app.getHost().initValue;
	var today = dateLib.getDate();
	app.lookup("AMASA_dtiStart").value = today.substr(0, 8).toString();
	app.lookup("AMASA_dtiEnd").value = today.substr(0, 8).toString();
	
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
	
	app.lookup("AMASA_opbTotal").value = 0;
	setPageIndexer(0, 1, pageRowCount,10);
	sendSmsAccessApplicationApproval();
	
	var approver = dataManager.getApprover();
	if (approver.getValue("UserID") == "") {
		loginPrivilege = 0;
	} else {
		loginPrivilege = 2;
	}
	
	var accountInfo = dataManager.getAccountInfo();
	var privilege = Number(accountInfo.getValue("Privilege"));
	if (privilege == 1 && loginPrivilege != 2) {	// 관리자일 경우
		loginPrivilege = 1;
	}
	
	switch (loginPrivilege) {
	case 0:	// 사용자
		app.lookup("AMASA_btnCompanion").visible = false;
		app.lookup("AMASA_btnApproved").visible = false;
		break;
	case 1:	// 관리자
//		app.lookup("AMASA_btnCompanion").value = "삭제";
//		app.lookup("AMASA_btnCompanion").visible = true;
		app.lookup("AMASA_btnCompanion").visible = false;
		app.lookup("AMASA_btnApproved").visible = false;
		break;
	case 2:	// 승인자
		app.lookup("AMASA_btnCompanion").value = "반려";
		app.lookup("AMASA_btnCompanion").visible = true;
		app.lookup("AMASA_btnApproved").visible = true;
		break;
	}
	
	if (dataManager.getAccountID() == 1000000000000000000){ //마스터는 삭제 버튼만 보임
		app.lookup("AMASA_btnDelete").visible = true;
		app.lookup("AMASA_btnDelete").enabled = true;
		app.lookup("btnGroup").getLayout().removeColumns([2,3]);
	}
	
	// 검색 조건 디폴트 출입자
	app.lookup("AMASA_cmbSearchCategory").value = "1";
	loginID = dataManager.getAccountID();
}

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("AMASA_listPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("AMASA_listPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function sendSmsAccessApplicationApproval() {
	app.lookup("AccessApplicationApprovalList").clear();

	var curPageIndex = app.lookup("AMASA_listPageIndexer").currentPageIndex;
	var offset = (curPageIndex-1) * pageRowCount;
	var sms_getAccessApplicationApprovals = app.lookup("sms_getAccessApplicationApprovals");
	sms_getAccessApplicationApprovals.setParameters("offset", offset);	
	sms_getAccessApplicationApprovals.setParameters("limit", pageRowCount);
	
	sms_getAccessApplicationApprovals.setParameters("menuType", menuType);	// MenuType 0: 구분없음, 1: 출입신청, 2: 방문신청 
	sms_getAccessApplicationApprovals.setParameters("startTime", app.lookup("AMASA_dtiStart").value);
	sms_getAccessApplicationApprovals.setParameters("endTime", app.lookup("AMASA_dtiEnd").value);
	
	//console.log(app.lookup("AMASA_ipbKeyword").value);
	//console.log(app.lookup("AMASA_cmbSearchCategory").value);
	
	sms_getAccessApplicationApprovals.setParameters("searchKeyword", app.lookup("AMASA_ipbKeyword").value);
	var category = app.lookup("AMASA_cmbSearchCategory").value
	switch (Number(category)) {
	case 1:  // 출입자
		sms_getAccessApplicationApprovals.setParameters("searchCategory", "name");
		break;
	case 2:  // 신청자
		sms_getAccessApplicationApprovals.setParameters("searchCategory", "writer");
		break;
	default:
		sms_getAccessApplicationApprovals.setParameters("searchCategory", "");
	}
	
	// 승인장 일경우 검색 조건 승인자ID 추가	
	var approver = dataManager.getApprover()
	if (approver.getValue("UserID") != "") {
		sms_getAccessApplicationApprovals.setParameters("ApproverID", approver.getValue("UserID"));
	} 

	sms_getAccessApplicationApprovals.setParameters("applicationStatus", app.lookup("AMASA_cmbApplicationStatus").value);
	
	// Todo: 필수 값 초기화 확인 필요	
	sms_getAccessApplicationApprovals.setParameters("applicationType", 0);
	sms_getAccessApplicationApprovals.setParameters("accessCardStatus", -1);
	sms_getAccessApplicationApprovals.setParameters("userType", -1);		
	sms_getAccessApplicationApprovals.setParameters("expire", -1);
	
	sms_getAccessApplicationApprovals.send();
}


/*
 * "Search" 버튼(AMASA_btnSearch)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMASA_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndex = app.lookup("AMASA_listPageIndexer");	
	pageIndex.currentPageIndex = 1;
	sendSmsAccessApplicationApproval();	
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var pageIndex = app.lookup("AMASA_listPageIndexer");	
		pageIndex.currentPageIndex = 1;
		sendSmsAccessApplicationApproval();		
	}
}

function processCompanion() {
	var AMASAprovals = app.lookup("ARMY_grdAccessApplicaionApproval");
	var updateApprovals = app.lookup("UserAccessApproval");
	updateApprovals.clear();
	
	var ckIndices = AMASAprovals.getCheckRowIndices();
	ckIndices.forEach(function(idx){
		var approvalInfo = AMASAprovals.getRow(idx);
		var approvalState = approvalInfo.getValue("ApprovalState");
		if(approvalState !=2 && approvalState != 10 && approvalState != 11) { // 1차 승인대기, 2차 승인대기 반려 추가
			AMASAprovals.setCheckRowIndex(idx, false);
		} else if (approvalState == 10) { // 1차 승인대기 시에 반려는 1차 승인자만 할 수 있다.
			if (approvalInfo.getValue("OnestApprovalID") != loginID){
				AMASAprovals.setCheckRowIndex(idx, false);
			}
		} else if (approvalState == 11) { // 2차 승인대기 시에 바려는 2차 승인자만 할 수 있다.
			if (approvalInfo.getValue("TwostApprovalID") != loginID){
				AMASAprovals.setCheckRowIndex(idx, false);
			}
		}
	});
	
	var indices = AMASAprovals.getCheckRowIndices();
	if (indices.length == 0){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "반려 가능한 항목이 없습니다. \n결제 차례에만 반려가 가능합니다."); 
		return;
	}
	
	// 반려 확인 팝업창 		
	dialogConfirmAMHQ(app.getRootAppInstance(), dataManager.getString("Str_OK"), "신청을 반려하시겠습니까?", function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) { // 수정 진행 시		
				indices.forEach(function(idx) {
					var approval = AMASAprovals.getRow(idx);
					if (AMASAprovals.getRowState(idx) != cpr.data.tabledata.RowState.DELETED){
						if (approval.getValue("ApprovalState") == 2 || approval.getValue("ApprovalState") == 10 || approval.getValue("ApprovalState") == 11) {
							var rowData = {
								"ApplicationIndex": approval.getValue("ApplicationIndex"),
								"ApprovalState": 4,
							}; //결재반려
							updateApprovals.addRowData(rowData);
						} else {
							AMASAprovals.setCheckRowIndex(idx, false);
						}
					} else {
						AMASAprovals.setCheckRowIndex(idx, false);
					}
				});	
				app.lookup("sms_putAccessApplicationApprovals").send();
		
			}
		});
	});
	
	
	// 반려사유 입력
	/*
	var appld = "app/dialog/inputMessage";
	app.openDialog(appld, {width : 450, height : 300}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_ARMY_Companion");
		dialog.initValue = {"title": dataManager.getString("Str_ARMY_EnterReasonRejectMessage")};
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != "" ){
			// 반려 사유를 입력 받아 업데이트
			indices.forEach(function(idx){
				var approval = AMASAprovals.getRow(idx);
				if(AMASAprovals.getRowState(idx) != cpr.data.tabledata.RowState.DELETED){
					if (approval.getValue("ApprovalState") == 2 || approval.getValue("ApprovalState") == 10 || approval.getValue("ApprovalState") == 11){
						var rowData = {
							"ApplicationIndex": approval.getValue("ApplicationIndex"), 
							"ApprovalState": 4, 
							"Message": returnValue
						};  //결재반려
						updateApprovals.addRowData(rowData);
					} else {
						AMASAprovals.setCheckRowIndex(idx, false);
					}
				} else {
					AMASAprovals.setCheckRowIndex(idx, false);
				}
			});			
			app.lookup("sms_putAccessApplicationApprovals").send();
		} 
	});
	*/ 	
}

function processDelete() {
	var AMASAprovals = app.lookup("ARMY_grdAccessApplicaionApproval");
	var updateApprovals = app.lookup("UserAccessApproval");
	updateApprovals.clear();
	
	var ckIndices = AMASAprovals.getCheckRowIndices();
	ckIndices.forEach(function(idx){
		if(AMASAprovals.getRow(idx).getValue("ApprovalState") != 3 && AMASAprovals.getRow(idx).getValue("ApprovalState") != 5 ){
			AMASAprovals.setCheckRowIndex(idx, false);
		}
	});
	
	var indices = AMASAprovals.getCheckRowIndices();
	if (indices.length == 0){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "선택한 항목이 없습니다. \n 삭제는 결재 승인 상태만 가능합니다."); 
		return;
	}
	
	// 삭제 사유 입력
	dialogConfirmAMHQ(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				indices.forEach(function(idx){
					var approval = AMASAprovals.getRow(idx);
					if(AMASAprovals.getRowState(idx) != cpr.data.tabledata.RowState.DELETED && (approval.getValue("ApprovalState") == 3 || approval.getValue("ApprovalState") == 5) ){
						var rowData = {"ApplicationIndex": approval.getValue("ApplicationIndex"), "ApprovalState": -1};  // 출입신청 삭제
						updateApprovals.addRowData(rowData);
					} else {
						AMASAprovals.setCheckRowIndex(idx, false);
					}
				});
				app.lookup("sms_putAccessApplicationApprovals").send();
			} else {}
		});
	});
}
/*
 * 버튼(AMASA_btnCompanion)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMASA_btnCompanionClick(/* cpr.events.CMouseEvent */ e){
	if (loginPrivilege == 2) {		// 승인자일 경우 반려
		processCompanion();
	} 
//	else if (loginPrivilege == 1) {	// 관리자일 경우 삭제
//		processDelete();
//	}
}

/*
 * 버튼(AMASA_btnApproved)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMASA_btnApprovedClick(/* cpr.events.CMouseEvent */ e){
	var AMASAprovals = app.lookup("ARMY_grdAccessApplicaionApproval");
	var updateApprovals = app.lookup("UserAccessApproval");
	updateApprovals.clear();
	
	var indices = AMASAprovals.getCheckRowIndices();
	//console.log("login: " + loginID);
	indices.forEach(function(idx){
		var approval = AMASAprovals.getRow(idx);
		/*
		if( approval.getValue("ApprovalState") == 2 ){
			var rowData = {"ApplicationIndex": approval.getValue("ApplicationIndex"), "ApprovalState": 3};  //결재승인
			updateApprovals.addRowData(rowData);
		} else {
			AMASAprovals.setCheckRowIndex(idx, false);
		}
		*/
		if (approval.getValue("ApprovalState") == 10) {
			if (loginID == approval.getValue("OnestApprovalID")) { // 1차 승인자면 결재할 수 있도록
				if (approval.getValue("TwostApprovalName") != "-") {
					var rowData = {
						"ApplicationIndex": approval.getValue("ApplicationIndex"),
						"ApprovalState": 11
					}; //결재승인
					updateApprovals.addRowData(rowData);
				} else {
					var rowData = {
						"ApplicationIndex": approval.getValue("ApplicationIndex"),
						"ApprovalState": 3
					}; //결재승인
					updateApprovals.addRowData(rowData);
				}
			}		
		} else if (approval.getValue("ApprovalState") == 11) { // 2차 승인자면 결재할 수 있도록
			if (loginID == approval.getValue("TwostApprovalID")){
				var rowData = {
					"ApplicationIndex": approval.getValue("ApplicationIndex"),
					"ApprovalState": 3
				}; //결재승인
				updateApprovals.addRowData(rowData);
			}
			
		} else if (approval.getValue("ApprovalState") == 2) {
			var rowData = {
				"ApplicationIndex": approval.getValue("ApplicationIndex"),
				"ApprovalState": 3
			}; //결재승인
			updateApprovals.addRowData(rowData);
		} else {
            AMASAprovals.setCheckRowIndex(idx, false);
        } 		
	});
	
	if (updateApprovals.getRowCount() == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "승인 가능한 항목이 없습니다. \n결제 차례에만 승인이 가능합니다."); 
		return 
	}
	
	app.lookup("sms_putAccessApplicationApprovals").send();	
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAMASA_listPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var AMASA_listPageIndexer = e.control;
	sendSmsAccessApplicationApproval();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAccessApplicationApprovalsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		var acApApprovals = app.lookup("AccessApplicationApprovalList");
		var count = acApApprovals.getRowCount();
		for( var i = 0; i < count; i++){
			var approval = acApApprovals.getRow(i)
			if (approval.getValue("OnestApprovalID") == 0 && 
				approval.getValue("TwostApprovalID") == 0 &&
				approval.getValue("ApprovalState") == 3 ) {
					approval.setValue("ApprovalState", 5);
					approval.setState(cpr.data.tabledata.RowState.UNCHANGED);
			}
			
			// 출입신청 조회/승인 조회양식 변경 -mjy
			if (approval.getValue("OnestApprovalName") == "") { // 승인자가 없으면 '-'처리
				approval.setValue("OnestApprovalName", "-");
			}
			if (approval.getValue("TwostApprovalName") == "") { // 승인자가 없으면 '-'처리
				approval.setValue("TwostApprovalName", "-");
			}
			if (approval.getValue("ApplicantServiceNumber") == "") { // 승인자가 없으면 '-'처리
				approval.setValue("ApplicantServiceNumber", "-");
			}
			// 출입일자로 합쳐주기
			var accessDate = approval.getValue("AccessStart")+" ~ "+approval.getValue("AccessEnd");
			approval.setValue("AccessDate", accessDate);
			
			// 직급/계급 보여주기  
			if(approval.getValue("Position")==0){ //(0이면 민간인으로)
				approval.setValue("PositionName", "민간인");
			} else { 
				approval.setValue("PositionName", dataManager.getPositionName(approval.getValue("Position")));
			}
		}
		var totalCount = app.lookup("Total").getValue("Count");
		selectPaging(totalCount, viewPageCount);
		
		app.lookup("AMASA_opbTotal").value = totalCount;
		app.lookup("ARMY_grdAccessApplicaionApproval").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}	
}

function onSms_getAccessApplicationApprovalsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getAccessApplicationApprovalsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putAccessApplicationApprovalsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode != COMERROR_NONE){		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	
	sendSmsAccessApplicationApproval();		
}

function onSms_putAccessApplicationApprovalsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_putAccessApplicationApprovalsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);	
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
	var rowIndex = aRMY_grdAccessApplicaionApproval.getSelectedRowIndex();
	if (rowIndex != -1) {
		var row = app.lookup("ARMY_grdAccessApplicaionApproval").getRow(rowIndex);
		var idx = row.getValue("ApplicationIndex");
		if (row.getValue("ApprovalState") == 3 || row.getValue("ApprovalState") == 5) {//결제승인완료
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "결제완료된 기록은 수정 할 수 없습니다."); 	
			return;
		}
		var userType = row.getValue("ApplicantUserType");
		var userID = row.getValue("UserID");
		var ApprovalState = row.getValue("ApprovalState");
		//console.log(idx);
		//console.log(userType);
		console.log(ApprovalState);
		//출입통제 화면 추가.
		var path = "app/custom/rokmch/accessApplication/accessApplicationDetailInfo";
		app.openDialog(path, {
			//width : 1350, height : 900
		    right: 120, bottom: 10, top: 10,left: 120
		}, function(dialog){
			dialog.ready(function(dialogApp){
				dialog.style.header.css("background-color", "#528443");
				dialog.headerTitle = "신청내역 상세보기";
				dialog.modal = true;	
				dialog.initValue = {
					"ApplicationIndex": idx, 
					"userType": userType, 
					"userID": userID, 
					"ApprovalState": ApprovalState
				};
			});
		}).then(function(returnValue){
			if (returnValue){
				sendSmsAccessApplicationApproval();
			}
			//console.log(returnValue);
		});	
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection")); 
		return
	}
}

/* 결재 완료 전의 신청서만 Master가 삭제 가능.
 * "삭제" 버튼(AMASA_btnDelete)에서 click 이벤트 발생 시 호출.
 */
function onAMASA_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	var AMASAprovals = app.lookup("ARMY_grdAccessApplicaionApproval");
	var checkRowIndices = AMASAprovals.getCheckRowIndices();
	checkRowIndices.forEach(function(idx){
		var rowData = AMASAprovals.getRow(idx);
		var approvalState = rowData.getValue("ApprovalState");
		var predecessor = rowData.getValue("Predecessor");
		//console.log(approvalState + " / " + predecessor);
		if (approvalState == 3 || approvalState == 5 || predecessor == 4){ // 결재 승인, 전결 삭제 불가로 체크 해제
			AMASAprovals.setCheckRowIndex(idx, false);
		}
		
	}); 
	
	checkRowIndices = AMASAprovals.getCheckRowIndices();
	if (checkRowIndices.length == 0){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "선택한 항목이 없습니다. \n 신청서 삭제는 결재 승인 전 상태만 가능합니다."); 
		return;
	}
	
	var updateApprovals = app.lookup("UserAccessApproval");
	updateApprovals.clear();
			
	dialogConfirmAMHQ(app.getRootAppInstance(), dataManager.getString("Str_OK"), "전결 혹은 승인완료된 신청자정보를 체크 해제 하였습니다. \n 신청서 삭제를 계속 진행 하시겠습니까?", function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) { // 삭제 진행 시
				checkRowIndices.forEach(function(idx){
					var row = AMASAprovals.getRow(idx);
					updateApprovals.addRowData({
						"ApplicationIndex": row.getValue("ApplicationIndex"), 
						"ApprovalState": -1
					})
				});
				app.lookup("sms_putAccessApplicationApprovals").send();
			}
		});
	});
	
}
