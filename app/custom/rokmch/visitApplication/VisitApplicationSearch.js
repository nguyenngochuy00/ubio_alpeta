/************************************************
 * VisitApplicationSearch.js
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
	
	// 22년 추가 사항
	// 디폴트 메뉴 출입자
	// 콤보박스 출입 권한 정보 삭제
	// 방문대상자 -> 출입자 변경
	app.lookup("AMVSA_cmbSearchCategory").value = "3";
	
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
	
	sms_getAccessApplicationApprovals.setParameters("ApproverID", "");	//전체검색을 위해
	
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
		var idx = row.getValue("ApplicationIndex");
		var userType = row.getValue("ApplicantUserType");
		var userID = row.getValue("UserID");
		var ApprovalState = row.getValue("ApprovalState");
		console.log(idx);
		console.log(userType);
		console.log(userID);
		var path = "app/custom/rokmch/visitApplication/visitApplicationDetailInfo";
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
					"editFlag": false
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
