/************************************************
 * VisitApplicationSearchAndApproval.js
 * Created at 2021. 2. 1. 오후 2:03:05.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var pageRowCount = 30;
var viewPageCount = 10;
var menuType = 2;

var loginPrivilege = 0; // (0: 사용자, 1: 관리자, 2: 승인자)
var loginID;
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var initValue = app.getHost().initValue;
	var today = dateLib.getDate();
	app.lookup("AMVSA_dtiStart").value = today.substr(0, 8).toString();
	app.lookup("AMVSA_dtiEnd").value = today.substr(0, 8).toString();
	
	var dsGroupList = app.lookup("GroupList");
	var groupList = dataManager.getGroup();
	groupList.copyToDataSet(dsGroupList);
	dsGroupList.addRowData({
		"Name": dataManager.getString("Str_All"),
		"GroupID": 0
	});
	dsGroupList.commit();
	
	app.lookup("ARMY_cmbGroup").redraw();
	
	var cmbGroup = app.lookup("ARMY_cmbGroup");
	cmbGroup.setItemSet(dsGroupList, {
		label: "Name",
		value: "GroupID"
	});
	
	var cmbUserAccessGroup = app.lookup("ARMY_cmbAccessGroup");
	cmbUserAccessGroup.setItemSet(dataManager.getAccessGroup(), {
		label: "Name",
		value: "ID"
	});
	
	app.lookup("AMVSA_opbTotal").value = 0;
	setPageIndexer(0, 1, pageRowCount, 10);
	sendSmsAccessApplicationApproval();
	
	var approver = dataManager.getApprover();
	if (approver.getValue("UserID") == "") {
		loginPrivilege = 0;
	} else {
		loginPrivilege = 2;
	}
	
	var accountInfo = dataManager.getAccountInfo();
	var privilege = Number(accountInfo.getValue("Privilege"));
	if (privilege == 1 && loginPrivilege != 2) { // 관리자일 경우
		loginPrivilege = 1;
	}
	
	switch (loginPrivilege) {
		case 0: // 사용자
			app.lookup("AMVSA_btnCompanion").visible = false;
			app.lookup("AMVSA_btnApproved").visible = false;
			break;
		case 1: // 관리자
			app.lookup("AMVSA_btnCompanion").value = "삭제";
			app.lookup("AMVSA_btnCompanion").visible = true;
			app.lookup("AMVSA_btnApproved").visible = false;
			break;
		case 2: // 승인자
			app.lookup("AMVSA_btnCompanion").value = "반려";
			app.lookup("AMVSA_btnCompanion").visible = true;
			app.lookup("AMVSA_btnApproved").visible = true;
			break;
	}
	
	// 22년 추가 사항
	// 디폴트 메뉴 출입자
	// 콤보박스 출입 권한 정보 삭제
	// 방문대상자 -> 출입자 변경
	app.lookup("AMVSA_cmbSearchCategory").value = "3";
	
	loginID = dataManager.getAccountID();
	if (loginID == 1000000000000000000){
		app.lookup("btnGroup").getLayout().removeColumns([3]);
	}
}

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("AMVSA_listPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("AMVSA_listPageIndexer");
	pageIndex.totalRowCount = totalCount; //전체 데이터 수.
	pageIndex.pageRowCount = pageRowCount; //한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount; // 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function sendSmsAccessApplicationApproval() {
	app.lookup("AccessApplicationApprovalList").clear();
	
	var curPageIndex = app.lookup("AMVSA_listPageIndexer").currentPageIndex;
	var offset = (curPageIndex - 1) * pageRowCount;
	var sms_getAccessApplicationApprovals = app.lookup("sms_getAccessApplicationApprovals");
	sms_getAccessApplicationApprovals.setParameters("offset", offset);
	sms_getAccessApplicationApprovals.setParameters("limit", pageRowCount);
	
	sms_getAccessApplicationApprovals.setParameters("menuType", menuType); // MenuType 0: 구분없음, 1: 출입신청, 2: 방문신청 
	sms_getAccessApplicationApprovals.setParameters("startTime", app.lookup("AMVSA_dtiStart").value);
	sms_getAccessApplicationApprovals.setParameters("endTime", app.lookup("AMVSA_dtiEnd").value);
	
	sms_getAccessApplicationApprovals.setParameters("searchKeyword", app.lookup("AMVSA_ipbKeyword").value);
	var category = app.lookup("AMVSA_cmbSearchCategory").value
	switch (Number(category)) {
		case 1:
			sms_getAccessApplicationApprovals.setParameters("searchCategory", "area");
			break;
		case 2:
			sms_getAccessApplicationApprovals.setParameters("searchCategory", "targetName");
			break;
		case 3:
			sms_getAccessApplicationApprovals.setParameters("searchCategory", "name");
			break;
		case 4:
			sms_getAccessApplicationApprovals.setParameters("searchCategory", "carNumber");
			break;	
		default:
			sms_getAccessApplicationApprovals.setParameters("searchCategory", "");
	}
	
	// 승인장 일경우 검색 조건 승인자ID 추가	
	var approver = dataManager.getApprover()
	if (approver.getValue("UserID") != "") {
		sms_getAccessApplicationApprovals.setParameters("ApproverID", approver.getValue("UserID"));
	}
	
	sms_getAccessApplicationApprovals.setParameters("applicationStatus", app.lookup("AMVSA_cmbApplicationStatus").value);
	
	// Todo: 필수 값 초기화 확인 필요
	sms_getAccessApplicationApprovals.setParameters("applicationType", 0);
	sms_getAccessApplicationApprovals.setParameters("accessCardStatus", -1);
	sms_getAccessApplicationApprovals.setParameters("userType", -1);
	sms_getAccessApplicationApprovals.setParameters("expire", -1);
	
	sms_getAccessApplicationApprovals.send();
}

/*
 * "Search" 버튼(AMVSA_btnSearch)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMVSA_btnSearchClick( /* cpr.events.CMouseEvent */ e) {
	var pageIndex = app.lookup("AMVSA_listPageIndexer");
	pageIndex.currentPageIndex = 1;
	sendSmsAccessApplicationApproval();
}

function onKeywordKeydown( /* cpr.events.CKeyboardEvent */ e) {
	if (e.keyCode == 13) {
		var pageIndex = app.lookup("AMVSA_listPageIndexer");
		pageIndex.currentPageIndex = 1;
		sendSmsAccessApplicationApproval();
	}
}

function processCompanion() {
	var AMVSAprovals = app.lookup("ARMY_grdAccessApplicaionApproval");
	var updateApprovals = app.lookup("UserAccessApproval");
	updateApprovals.clear();
	
	var ckIndices = AMVSAprovals.getCheckRowIndices();
	ckIndices.forEach(function(idx) {
		var approvalInfo = AMVSAprovals.getRow(idx);
		var approvalState = approvalInfo.getValue("ApprovalState");
		if (approvalState != 2 && approvalState != 10 && approvalState != 11) { // 1차 승인대기, 2차 승인대기 반려 추가
			AMVSAprovals.setCheckRowIndex(idx, false);
		} else if (approvalState == 10) { // 1차 승인대기 시에 반려는 1차 승인자만 할 수 있다.
			if (approvalInfo.getValue("OnestApprovalID") != loginID){
				AMVSAprovals.setCheckRowIndex(idx, false);
			}
		} else if (approvalState == 11) { // 2차 승인대기 시에 바려는 2차 승인자만 할 수 있다.
			if (approvalInfo.getValue("TwostApprovalID") != loginID){
				AMVSAprovals.setCheckRowIndex(idx, false);
			}
		}
	});
	
	var indices = AMVSAprovals.getCheckRowIndices();
	if (indices.length == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection"));
		return;
	}
	
	// 반려 확인 팝업창 		
	dialogConfirmAMHQ(app.getRootAppInstance(), dataManager.getString("Str_OK"), "신청을 반려하시겠습니까?", function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) { // 수정 진행 시		
				indices.forEach(function(idx) {
					var approval = AMVSAprovals.getRow(idx);
					if (AMVSAprovals.getRowState(idx) != cpr.data.tabledata.RowState.DELETED){
						if (approval.getValue("ApprovalState") == 2 || approval.getValue("ApprovalState") == 10 || approval.getValue("ApprovalState") == 11) {
							var rowData = {
								"ApplicationIndex": approval.getValue("ApplicationIndex"),
								"ApprovalState": 4,
							}; //결재반려
							updateApprovals.addRowData(rowData);
						} else {
							AMVSAprovals.setCheckRowIndex(idx, false);
						}
					} else {
						AMVSAprovals.setCheckRowIndex(idx, false);
					}
				});	
				app.lookup("sms_putAccessApplicationApprovals").send();
		
			}
		});
	});
	
	// 반려사유 입력 주석 처리 - pse
	/*
	var appld = "app/dialog/inputMessage";
	app.openDialog(appld, {
		width: 450,
		height: 300
	}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_ARMY_Companion");
		dialog.initValue = {
			"title": dataManager.getString("Str_ARMY_EnterReasonRejectMessage")
		};
		dialog.modal = true;
	}).then(function(returnValue) {
		if (returnValue != "") {
			// 반려 사유를 입력 받아 업데이트
			indices.forEach(function(idx) {
				var approval = AMVSAprovals.getRow(idx);
				if (AMVSAprovals.getRowState(idx) != cpr.data.tabledata.RowState.DELETED){
					if (approval.getValue("ApprovalState") == 2 || approval.getValue("ApprovalState") == 10 || approval.getValue("ApprovalState") == 11) {
						var rowData = {
							"ApplicationIndex": approval.getValue("ApplicationIndex"),
							"ApprovalState": 4,
							"Message": returnValue
						}; //결재반려
						updateApprovals.addRowData(rowData);
					} else {
						AMVSAprovals.setCheckRowIndex(idx, false);
					}
				} else {
					AMVSAprovals.setCheckRowIndex(idx, false);
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
	
	if (loginPrivilege != "1") {
		ckIndices.forEach(function(idx) {
			if (AMASAprovals.getRow(idx).getValue("ApprovalState") != 3 && AMASAprovals.getRow(idx).getValue("ApprovalState") != 5) {
				AMASAprovals.setCheckRowIndex(idx, false);
			}
		});
	}
	
	var indices = AMASAprovals.getCheckRowIndices();
	if (indices.length == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "삭제 가능한 항목이 없습니다. \n 삭제는 결재 승인 상태만 가능합니다.");
		return;
	}
	
	// 삭제 사유 입력
	dialogConfirmAMHQ(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				indices.forEach(function(idx) {
					var approval = AMASAprovals.getRow(idx);
					//					if (loginPrivilege != "1"){
					//						if (AMASAprovals.getRowState(idx) != cpr.data.tabledata.RowState.DELETED && (approval.getValue("ApprovalState") == 3 || approval.getValue("ApprovalState") == 5)) {
					if (AMASAprovals.getRowState(idx) != cpr.data.tabledata.RowState.DELETED) {
						if (loginPrivilege == "1" || (approval.getValue("ApprovalState") == 3 || approval.getValue("ApprovalState") == 5)) {
							var rowData = {
								"ApplicationIndex": approval.getValue("ApplicationIndex"),
								"ApprovalState": -1
							}; // 출입신청 삭제
							updateApprovals.addRowData(rowData);
						} else {
							AMASAprovals.setCheckRowIndex(idx, false);
						}
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
 * 버튼(AMVSA_btnCompanion)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMVSA_btnCompanionClick( /* cpr.events.CMouseEvent */ e) {
	if (loginPrivilege == 2) { // 승인자일 경우 반려
		processCompanion();
	} else if (loginPrivilege == 1) { // 관리자일 경우 삭제
		processDelete();
	}
}

/*
 * 버튼(AMVSA_btnApproved)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMVSA_btnApprovedClick( /* cpr.events.CMouseEvent */ e) {
	var AMVSAprovals = app.lookup("ARMY_grdAccessApplicaionApproval");
	var updateApprovals = app.lookup("UserAccessApproval");
	updateApprovals.clear();
	
	var indices = AMVSAprovals.getCheckRowIndices();
	//console.log("login: " + loginID);
	indices.forEach(function(idx) {
		var approval = AMVSAprovals.getRow(idx);
		//console.log(approval + "/ 1 /" + approval.getValue("OnestApprovalID"));
		//console.log(approval + "/ 2 /" + approval.getValue("TwostApprovalID"));
		/*
		if (approval.getValue("ApprovalState") == 2) {
			var rowData = {
				"ApplicationIndex": approval.getValue("ApplicationIndex"),
				"ApprovalState": 3
			}; //결재승인
			updateApprovals.addRowData(rowData);
		} else {
			AMVSAprovals.setCheckRowIndex(idx, false);
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
			AMVSAprovals.setCheckRowIndex(idx, false);
		}

	});
	
	if (updateApprovals.getRowCount() == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "승인 가능한 신청서가 없습니다.");
		return
	}
	
	app.lookup("sms_putAccessApplicationApprovals").send();
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAMVSA_listPageIndexerSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var AMVSA_listPageIndexer = e.control;
	sendSmsAccessApplicationApproval();
}

/*
 * 그리드에서 row-dblclick 이벤트 발생 시 호출.
 * detail이 row를 더블클릭 한 경우 발생하는 이벤트.
 */
function onARMY_grdAccessApplicaionApprovalRowDblclick( /* cpr.events.CGridMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var aRMY_grdAccessApplicaionApproval = e.control;
	//결제 완료된것은 수정못하도록 처리
	
	/*
	 * TODO...
	 * 팝업창으로 조회 하고 단기 하도록 처리 필요
	 * visitApplicationManagement - 방문신청에 있는 모든 항목이 팝업 되어야 한다. index 기준으로 처리
	 */
	//return; // 테스트 진행시 주석처리로 활성화
	var rowIndex = aRMY_grdAccessApplicaionApproval.getSelectedRowIndex();
	if (rowIndex != -1) {
		var row = app.lookup("ARMY_grdAccessApplicaionApproval").getRow(rowIndex);
		//		if (row.getValue("ApprovalState") == 3 || row.getValue("ApprovalState") == 5) {//결제승인완료
		//			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "결제완료된 기록을 수정 할 수 없습니다."); 	
		//			return;
		//		}
		var idx = row.getValue("ApplicationIndex");
		var userType = row.getValue("ApplicantUserType");
		var userID = row.getValue("UserID");
		var ApprovalState = row.getValue("ApprovalState");
		console.log(idx);
		console.log(userType);
		console.log(userID);
		var path = "app/custom/army_hq/visitApplication/visitApplicationDetailInfo";
		app.openDialog(path, {
			//width: 1300, height: 900
		    right: 120, bottom: 10, top: 10,left: 120
		}, function(dialog) {
			dialog.ready(function(dialogApp) {
				dialog.style.header.css("background-color", "#528443");
				dialog.headerTitle = "신청내역 상세보기";
				dialog.modal = true;
				dialog.initValue = {
					"ApplicationIndex": idx,
					"userType": userType,
					"userID": userID,
					"ApprovalState": ApprovalState,
					"editFlag": true
				};
			});
		}).then(function(returnValue) {
			console.log(returnValue);
			sendSmsAccessApplicationApproval();
		});
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection"));
		return
	}
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAccessApplicationApprovalsSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var acApApprovals = app.lookup("AccessApplicationApprovalList");
		var count = acApApprovals.getRowCount();
		for (var i = 0; i < count; i++) {
			var approval = acApApprovals.getRow(i)
			if (approval.getValue("OnestApprovalID") == 0 &&
				approval.getValue("TwostApprovalID") == 0 &&
				approval.getValue("ApprovalState") == 3) {
				approval.setValue("ApprovalState", 5);
				approval.setState(cpr.data.tabledata.RowState.UNCHANGED);
			}
			
			// 방문신청 조회/승인 조회양식 변경 -mjy
			if (approval.getValue("OnestApprovalName") == "") { // 승인자가 없으면 '-'처리
				approval.setValue("OnestApprovalName", "-");
			}
			if (approval.getValue("TwostApprovalName") == "") { // 승인자가 없으면 '-'처리
				approval.setValue("TwostApprovalName", "-");
			}
			// 출입일자로 합쳐주기
			var accessDate = approval.getValue("AccessStart")+" ~ "+approval.getValue("AccessEnd");
			approval.setValue("AccessDate", accessDate);
		}
		
		var totalCount = app.lookup("Total").getValue("Count");
		selectPaging(totalCount, viewPageCount);
		
		app.lookup("AMVSA_opbTotal").value = totalCount;
		app.lookup("ARMY_grdAccessApplicaionApproval").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getAccessApplicationApprovalsSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getAccessApplicationApprovalsSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putAccessApplicationApprovalsSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode != COMERROR_NONE) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	} else {
		sendSmsAccessApplicationApproval();
	}
	
}

function onSms_putAccessApplicationApprovalsSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putAccessApplicationApprovalsSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * "삭제" 버튼(AMVSA_btnDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMVSA_btnDeleteClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var aMVSA_btnDelete = e.control;
	var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "조회된 데이터가 없습니다.");
		return
	}
	//전결처리 된 신청서 빼기 작업 진행
	var tmpGrdAccessApplicaionApprovalList = app.lookup("ARMY_grdAccessApplicaionApproval");
	var tmpCheckedRowIndices = tmpGrdAccessApplicaionApprovalList.getCheckRowIndices()
	var tmpDelCount = tmpCheckedRowIndices.length;
	if (tmpDelCount == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), "삭제 대상이 체크 안되었습니다.");
		return
	}
	//여기서 추리기
	var approvalFlag = 0;
	for (var i = 0; i < tmpDelCount; i++) {
		var index = tmpCheckedRowIndices[i];
		var rowData = tmpGrdAccessApplicaionApprovalList.getRow(index);
		var approvalState = rowData.getValue("ApprovalState");
		if (approvalState == 3 || approvalState == 5) {
			tmpGrdAccessApplicaionApprovalList.setCheckRowIndex(index, false);
			approvalFlag++;
		}
	}
	if (approvalFlag > 0) {
		if (confirm("전결 혹은 승인완료된 신청자정보를 체크 해제 하였습니다. \n 신청서 삭제를 계속 진행 하시겠습니까?") == false) {
			return;
		}
	}
	
	var grdAccessApplicaionApprovalList = app.lookup("ARMY_grdAccessApplicaionApproval");
	var checkedRowIndices = grdAccessApplicaionApprovalList.getCheckRowIndices()
	var delCount = checkedRowIndices.length;
	dataManager = getDataManager();
	if (delCount == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), "삭제할 대상이 없습니다.");
		return
	} else {
		dialogConfirmAMHQ(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					comLib.showLoadMask("pro", "신청서 삭제처리", "", checkedRowIndices.length);
					
					var dsDeleteList = app.lookup("dsDeleteList");
					dsDeleteList.clear();
					
					for (var i = 0; i < delCount; i++) {
						var delIndex = checkedRowIndices[i];
						var delCardList = {
							"rowIndex": delIndex,
							"ApplicationIndex": grdAccessApplicaionApprovalList.getRow(delIndex).getValue("ApplicationIndex"),
							"UserID": grdAccessApplicaionApprovalList.getRow(delIndex).getValue("UserID")
						};
						dsDeleteList.addRowData(delCardList);
					}
					sendDeleteApplicationApprovals();
					
				} else {}
			});
		});
	}
	
}

function sendDeleteApplicationApprovals() {
	var dsDeleteList = app.lookup("dsDeleteList");
	if (dsDeleteList.getRowCount() == 0) {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlertAMHQ(app, "Waning", dataManager.getString("Str_UserNotSelected"));
		return;
	}
	var dsTopData = dsDeleteList.getRow(0);
	var applicationIndex = dsTopData.getValue("ApplicationIndex");
	var userID = dsTopData.getValue("UserID");
	console.log(dsTopData.getRowData());
	var msg = "신청서 삭제" + " : " + dsDeleteList.getRowCount() + " 건수  ";
	comLib.updateLoadMask(msg);
	
	var sms_deleteCard = app.lookup("sms_deleteAccessApplicationApprovals");
	sms_deleteCard.action = "/v1/armyhq/accessApproval/" + applicationIndex + "/" + userID;
	//"/v1/armyhq/accessApproval/applicationIndex/userID";
	sms_deleteCard.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteAccessApplicationApprovalsSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteAccessApplicationApprovals = e.control;
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postDeleteCard = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsDelete = app.lookup("dsDeleteList");
		console.log("카운트", dsDelete.getRowCount());
		var gridRow = dsDelete.getValue(0, "rowIndex");
		var grid = app.lookup("ARMY_grdAccessApplicaionApproval");
		grid.deleteRow(gridRow);
		//		dsDelete.deleteRow(0);
		dsDelete.realDeleteRow(0);
		console.log("카운트", dsDelete.getRowCount());
		if (dsDelete.getRowCount() > 0) {
			sendDeleteApplicationApprovals();
		} else {
			comLib.hideLoadMask();
		}
		
	} else {
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "신청서 삭제를 실패 하였습니다.");
	}
}