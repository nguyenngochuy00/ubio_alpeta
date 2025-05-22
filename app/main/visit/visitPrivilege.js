/************************************************
 * visitManagementPrivilege.js
 * Created at 2020. 3. 9. 오전 9:22:40.
 *
 * @author fois
 ************************************************/
var comLib;
var usint_version;
var dataManager = cpr.core.Module.require("lib/DataManager");
var VPList_pageRowCount = 20;
var VPList_enablePageIndexer = true;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	comLib = createComUtil(app);
	
	var grdVisitPrivilegeList = app.lookup("grd_VisitPrivilegeList");
	setPaging(0, 1, 10, VPList_pageRowCount);
	getVisitPrivilegeList();
}

//권한 리스트 가져오기
function getVisitPrivilegeList(){
	var grdVisitPrivilegeList = app.lookup("grd_VisitPrivilegeList");
	var curIndex = app.lookup("VPList_pageIndexer").currentPageIndex;
	
	var offset = (curIndex - 1) * VPList_pageRowCount;
	
	var smsGetVisitPrivilege = app.lookup("sms_getVisitPrivilege");
	
	
	smsGetVisitPrivilege.setParameters("offset", offset);
	smsGetVisitPrivilege.setParameters("limit", VPList_pageRowCount);
	
	smsGetVisitPrivilege.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getVisitPrivilegeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();

	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){

		var sms_getUserList = e.control;
		var dsVisitPrivilegeList = app.lookup("VisitPrivilegeList");
		var grdVisitPrivilegeList = app.lookup("grd_VisitPrivilegeList");
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		
		var recvCount = dsVisitPrivilegeList.getRowCount();
		
		//var totalLabel = app.lookup("opt_tot");
		//totalLabel.value = totalCount;

		var viewPageCount = totalCount / VPList_pageRowCount + (totalCount % VPList_pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}

		setPaging(totalCount, VPList_pageRowCount, viewPageCount);
		grdVisitPrivilegeList.redraw();
	} else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
	}

}


/*
 * 버튼(VMVTR_btnFAWUserSelect)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMVTR_btnFAWUserSelectClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vMVTR_btnFAWUserSelect = e.control;
	var appld = "app/main/visit/visitUserSelect" + "?" + usint_version;
	app.openDialog(appld, {width : 750, height : 400},function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		//dialog.initValue = .value;
	}).then(function(returnValue){
		var UserID = returnValue["ID"];
		var UserUniqueID = returnValue["UniqueID"];
		var UserName = returnValue["Name"];
		console.log("UserID : "+UserID,"UserUniqueID : "+UserUniqueID,"UserName : "+UserName);
		app.lookup("OTP_VisitUserID").value = UserID;
		app.lookup("OTP_VisitUserName").value = UserName;
	});
}


/*
 * "추가" 버튼(BTN_VisitPrivilegeAdd)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBTN_VisitPrivilegeAddClick(/* cpr.events.CMouseEvent */ e){
	var dmVisitPrivilege = app.lookup("VisitPrivilege");
	var VisitUserID = app.lookup("OTP_VisitUserID").value;
	var VisitUserName = app.lookup("OTP_VisitUserName").value;
	console.log("VisitUserID : "+VisitUserID);	
	if(VisitUserID == null){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_UserNotSelected"));
		return;
	}
	dmVisitPrivilege.setValue("userID", VisitUserID);
	dmVisitPrivilege.setValue("userName", VisitUserName);
	
	if(app.lookup("CBX_Privilege_View").checked == true){
		dmVisitPrivilege.setValue("View", 1);
	}
	if(app.lookup("CBX_Privilege_Approval").checked == true){
		dmVisitPrivilege.setValue("Approval", 1);
	}
	if(app.lookup("CBX_Privilege_VisitorRegist").checked == true){
		dmVisitPrivilege.setValue("VisitorRegist", 1);
	}
	
	var sms_postVisitPrivilege = app.lookup("sms_postVisitPrivilege");
	sms_postVisitPrivilege.send();
}



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postVisitPrivilegeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Success"));
		getVisitPrivilegeList();
	} else {		
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
		
	}
}



/*
 * "수정" 버튼(BTN_VisitPrivilegeUpdate)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBTN_VisitPrivilegeUpdateClick(/* cpr.events.CMouseEvent */ e){
	var dmVisitPrivilege = app.lookup("VisitPrivilege");
	var VisitUserID = app.lookup("OTP_VisitUserID").value;
	var VisitUserName = app.lookup("OTP_VisitUserName").value;
	dmVisitPrivilege.setValue("userID", VisitUserID);
	dmVisitPrivilege.setValue("userName", VisitUserName);
	
	if(app.lookup("CBX_Privilege_View").checked == true){
		dmVisitPrivilege.setValue("View", 1);
	}else{
		dmVisitPrivilege.setValue("View", 0);
	}
	if(app.lookup("CBX_Privilege_Approval").checked == true){
		dmVisitPrivilege.setValue("Approval", 1);
	}else{
		dmVisitPrivilege.setValue("Approval", 0);
	}
	if(app.lookup("CBX_Privilege_VisitorRegist").checked == true){
		dmVisitPrivilege.setValue("VisitorRegist", 1);
	}else{
		dmVisitPrivilege.setValue("VisitorRegist", 0);
	}
	console.log(dmVisitPrivilege.getDatas());
	var sms_putVisitPrivilege = app.lookup("sms_putVisitPrivilege");
	sms_putVisitPrivilege.action = "/v1/VisitPrivilege/"+VisitUserID;
	sms_putVisitPrivilege.send();
}



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putVisitPrivilegeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Success"));
		var dsVisitPrivilegeList = app.lookup("VisitPrivilegeList");
		var visitPrivilegeInfo = dsVisitPrivilegeList.findFirstRow("userID == '"+app.lookup("VisitPrivilege").getValue("userID")+"'");
		if(visitPrivilegeInfo){
			visitPrivilegeInfo.setRowData(app.lookup("VisitPrivilege").getDatas());
		}
	} else {		
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			+dataManager.getString("Str_UserDelete")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
		
	}
}

/*
 * 버튼(BTN_VisitPrivilegeDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBTN_VisitPrivilegeDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdVisitPrivilegeList = app.lookup("grd_VisitPrivilegeList");
	var checkedRowIndices = grdVisitPrivilegeList.getCheckRowIndices();
	var delCount = checkedRowIndices.length;
	if (delCount == 0) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	} else {
		dialogConfirm(app.getRootAppInstance(), "", "삭제 하시겠습니까?", function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {

					comLib.showLoadMask("pro",dataManager.getString("Str_UserDelete"),"",checkedRowIndices.length);

					var dsDeleteList = app.lookup("dsDeleteList");
					dsDeleteList.clear();
					var VisitPrivilegeList = app.lookup("VisitPrivilegeList");
					var userID = "";
					for( var i = 0; i < delCount; i++){
						var delIndex = checkedRowIndices[i];
						userID = VisitPrivilegeList.getRow(delIndex).getString("userID");
						var delUser = {"userID":userID,"rowIndex":delIndex};
						dsDeleteList.addRowData(delUser);
					}
					sendDeleteVisitPrivilege();

				} else {}
			});
		});
	}
	
}

function sendDeleteVisitPrivilege(){
	var dsDeleteList = app.lookup("dsDeleteList");
	if( dsDeleteList.getRowCount() == 0 ){
		comLib.hideLoadMask();
		dataManager = getDataManager();
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserNotSelected"));
		return;
	}
	var dsUserID = dsDeleteList.getRow(0);
	var userID = dsUserID.getValue("userID");

	var msg = dataManager.getString("Str_UserID")+ " : "+userID;
	comLib.updateLoadMask(msg);
	
	var sms_deleteVisitPrivilege = app.lookup("sms_deleteVisitPrivilege");
	sms_deleteVisitPrivilege.userAttr("rowIndex", dsUserID.getValue("rowIndex").toString());	
	sms_deleteVisitPrivilege.action = "v1/VisitPrivilege/"+userID;
	sms_deleteVisitPrivilege.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteVisitPrivilegeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_deletePrivilege = e.control;
	
	var dsDeleteList = app.lookup("dsDeleteList");
	dsDeleteList.realDeleteRow(0);

	var gridVisitPrivilegeList = app.lookup("grd_VisitPrivilegeList");

	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		gridVisitPrivilegeList.setCheckRowIndex(parseInt(sms_deletePrivilege.userAttr("rowIndex"),10), false);
		gridVisitPrivilegeList.deleteRow( parseInt(sms_deletePrivilege.userAttr("rowIndex"),10));
		sendDeleteVisitPrivilege();
	} else {		
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			+dataManager.getString("Str_UserDelete")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
		
	}
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrd_VisitPrivilegeListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var rowIndex = app.lookup("grd_VisitPrivilegeList").getSelectedRowIndex();
	console.log(rowIndex);
	if(rowIndex == -1){
		return;
	}
	var rowData = app.lookup("grd_VisitPrivilegeList").getRow(rowIndex);

	var VisitUserID = app.lookup("OTP_VisitUserID");
	var VisitUserName = app.lookup("OTP_VisitUserName");
	VisitUserID.value = rowData.getValue("userID");
	VisitUserName.value = rowData.getValue("userName");
	
	var CBX_Privilege_View = app.lookup("CBX_Privilege_View");
	var CBX_Privilege_Approval = app.lookup("CBX_Privilege_Approval");
	var CBX_Privilege_VisitorRegist = app.lookup("CBX_Privilege_VisitorRegist");

	if(rowData.getValue("View")==1){
		CBX_Privilege_View.checked = true;
	}else{
		CBX_Privilege_View.checked = false;
	}
	
	if(rowData.getValue("Approval")==1){
		CBX_Privilege_Approval.checked = true;
	}else{
		CBX_Privilege_Approval.checked = false;
	}
	
	if(rowData.getValue("VisitorRegist")==1){
		CBX_Privilege_VisitorRegist.checked = true;
	}else{
		CBX_Privilege_VisitorRegist.checked = false;
	}
}


function setPaging( totalCount, currentPageIndex, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("VPList_pageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	if( VPList_enablePageIndexer == true ){
		if(totalCount == 0) {
			pageIndex.visible = false;
		} else {
			pageIndex.visible = true;
		}
	}else {
		pageIndex.visible = false;
	}
	
	pageIndex.redraw();
}


function setPaging( totalCount, pageRowCount, viewPageCount ) {
	var pageIndex = app.lookup("VPList_pageIndexer");
	
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	//pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
		
	if( VPList_enablePageIndexer == true ){
		if(totalCount == 0) {
			pageIndex.visible = false;
		} else {
			pageIndex.visible = true;
		}
	}else {
		pageIndex.visible = false;
	}
	pageIndex.redraw();
}

function getCurrentPageIndex() {	
	var pageIndex = app.lookup("VPList_pageIndexer");
	return pageIndex.currentPageIndex
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_postVisitPrivilegeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_postVisitPrivilegeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getVisitPrivilegeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getVisitPrivilegeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_putVisitPrivilegeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_putVisitPrivilegeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}




/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_deleteVisitPrivilegeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_deleteVisitPrivilegeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}




