/************************************************
 * approvalUser.js
 * Created at 2020. 12. 15. 오후 3:19:10.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var ApprovalLevel;
var oem_version;


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	oem_version = dataManager.getOemVersion();
	console.log(oem_version);
	if (oem_version == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
		app.lookup("UMAPL_grdApproverList").header.getColumn(3).bind("text").toLanguage("Str_ARMY_UserGroup1");
	}
	
	var dsGroupList = app.lookup("GroupList");
	var groupList = dataManager.getGroup();
	groupList.copyToDataSet(dsGroupList);
	dsGroupList.addRowData({"Name":dataManager.getString("Str_All"),"GroupID":0});
	dsGroupList.commit();
	
	var cmbGroup = app.lookup("UMAPM_cmbGroup");
	cmbGroup.setItemSet(dsGroupList, {label: "Name",value: "GroupID"});
	
	var initValue = app.getHost().initValue;
	ApprovalLevel = initValue["ApprovalLevel"];
	
	var sms_getApproverList = app.lookup("sms_getApproverList");
	if (ApprovalLevel == 1) { // 1차 승인자 
		var accountInfo = dataManager.getAccountInfo();
		//var userInfo = dataManager.getAccountInfo().getDatas();
		console.log(accountInfo.getDatas());
		if (accountInfo) {
			var userID = accountInfo.getValue("UserID");
			if (userID == 1000000000000000000) {
				sms_getApproverList.setParameters("adminID", 0);
			} else {
				sms_getApproverList.setParameters("adminID", userID);
			}
		} else {
			sms_getApproverList.setParameters("adminID", 0);	
		}
		
		sms_getApproverList.setParameters("MinLevel", 1);
		sms_getApproverList.setParameters("MaxLevel", 1);		
	} else {
		sms_getApproverList.setParameters("MinLevel", 2);
		sms_getApproverList.setParameters("MaxLevel", 2);
	}
	
	app.lookup("UMAPL_grdApproverList").redraw();
	//app.lookup("grp_full").redraw();
	sms_getApproverList.send();
}

/*
 * 버튼(APL_btnApply)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAPL_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aPL_btnApply = e.control;
	var grdApprovals = app.lookup("UMAPL_grdApproverList");
	var indices = grdApprovals.getCheckRowIndices();
	
	if (indices.length != 1) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_ApproverSelectOneError")); 
		return;
	} else {
		app.close(grdApprovals.getRow(indices[0]));
	}
}

/*
 * 버튼(APL_btnCancel)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAPL_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getApproverListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		var approverList = app.lookup("ApproverList");
		var count = approverList.getRowCount();
		for( var i = 0; i < count; i++){
			var approverInfo = approverList.getRow(i);
		}
		app.lookup("UMAPL_grdApproverList").redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getApproverListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);	
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getApproverListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);	
}


/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onUMAPL_grdApproverListCellClick(/* cpr.events.CGridMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
		if (oem_version == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH) {
		var clickRowIndex = e.rowIndex;
		
		var checkeIndices = app.lookup("UMAPL_grdApproverList").getCheckRowIndices();
		if (checkeIndices.length > 0) {
			app.lookup("UMAPL_grdApproverList").clearAllCheck();
			app.lookup("UMAPL_grdApproverList").setCheckRowIndex(clickRowIndex, true);
		} else {
			app.lookup("UMAPL_grdApproverList").setCheckRowIndex(clickRowIndex, true);
		}
		
	}
}
