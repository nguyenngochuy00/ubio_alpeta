/************************************************
 * UserPrivilegeSelect.js
 * Created at 2022. 3. 14. 오전 10:14:08.
 *
 * @author sky
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var oem_version;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	oem_version = dataManager.getOemVersion();
	
	var privilegeList = dataManager.getPrivilegeList();
	var dsPrivilegeList = app.lookup("PrivilegeList");
	
	dsPrivilegeList.addRowData({"PrivilegeID": 1, "Name": dataManager.getString("Str_Admin")});
	dsPrivilegeList.addRowData({"PrivilegeID": 2, "Name": dataManager.getString("Str_NormalUser")});
	
	if (oem_version == OEM_HYUNDAI_MSEAT) {
		dsPrivilegeList.addRowData({"PrivilegeID": 10, "Name": dataManager.getString("Str_Visitor")});
		dsPrivilegeList.addRowData({"PrivilegeID": 14, "Name": dataManager.getString("Str_TempUser")});
	}
	
	privilegeList.copyToDataSet(dsPrivilegeList);
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getPrivilegeListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("PSO_grdPrivilegeList").redraw();
}

/*
 * 그리드에서 row-check 이벤트 발생 시 호출.
 * Grid의 RowCheckbox가 체크 되었을 때 발생하는 이벤트. (columnType=checkbox)
 */
function onPRMGR_grdPrivilegeListRowCheck(/* cpr.events.CGridEvent */ e){
	var PSO_grdPrivilegeList = e.control;
	var gridPrivilegeList = app.lookup("PSO_grdPrivilegeList");
	var checkedRowIndices = gridPrivilegeList.getCheckRowIndices();
	var checkedCount = checkedRowIndices.length;
	
	if(checkedCount>1){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_PrivilegeSelectWarning"));
		gridPrivilegeList.clearAllCheck();
	}
}

/*
 * "적용" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSATS_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	var grdPrivilegeList = app.lookup("PSO_grdPrivilegeList");	
	var dsSelectPrivilege = app.lookup("SelectPrivilege");
	dsSelectPrivilege.clear();

	var chkIndex = grdPrivilegeList.getCheckRowIndices();
	var selectPrivilege = grdPrivilegeList.getRow(chkIndex[0]);
	dsSelectPrivilege.addRowData({"PrivilegeID":selectPrivilege.getValue("PrivilegeID")});
	
	dsSelectPrivilege.commit();
	
	var PrivilegeID = dsSelectPrivilege.getColumnData("PrivilegeID");
	
	app.close(PrivilegeID);
}

function onSms_getPrivilegeListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getPrivilegeListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

//-------------------------------------------------------------

exports.getCheckedRowIndices = function() {
	var grdPrivilegeList = app.lookup("PSO_grdPrivilegeList");
	var indices = grdPrivilegeList.getCheckRowIndices();
	var result = [];
	indices.forEach(function(idx){
		if(grdPrivilegeList.getRowState(idx) != cpr.data.tabledata.RowState.DELETED ){
			result.push(idx);
		} else {
			grdPrivilegeList.setCheckRowIndex(idx, false);
		}
	});
	return result;
}
