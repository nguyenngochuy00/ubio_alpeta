/************************************************
 * UserManagement.js
 * Created at 2018. 10. 29. 오후 5:49:46.
 *
 * @author osm8667
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

var comLib;
var USMGR_pageRowCount = 14;

// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad( /* cpr.events.CEvent */ e) {

	comLib = createComUtil(app);
	dataManager = getDataManager();

	sendCarInfoListRequest();
}


function sendCarInfoListRequest(){
	comLib.showLoadMask("",dataManager.getString("Str_UserListGet"),"",0);
	var sms_getCarInfoList = app.lookup("sms_getCarInfoList");
	var USMAG_udcCarInfoList = app.lookup("USMAG_udcCarInfoList");
	var curIndex = USMAG_udcCarInfoList.getCurrentPageIndex();
	var offset = (curIndex - 1) * USMGR_pageRowCount
	sms_getCarInfoList.setParameters("searchCategory", "");
	sms_getCarInfoList.setParameters("searchKeyword","");
	/*
	if (searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0) {
		sms_getCarInfoList.setParameters("searchCategory", searchCtrl.searchCategory);
	} else {
		sms_getCarInfoList.setParameters("searchCategory", "");
	}
	*/

	// 페이징 계산하여 요청
	sms_getCarInfoList.setParameters("offset", offset);
	sms_getCarInfoList.setParameters("limit", USMGR_pageRowCount);
	sms_getCarInfoList.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getCarInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){

	comLib.hideLoadMask();

	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){

		var sms_getUserList = e.control;
		var dsCarInfoList = app.lookup("CarInfoList");
		var count = dsCarInfoList.getRowCount();
		var positionList = dataManager.getPositionList();
		for( i =0; i<count; i++){
			var carInfo = dsCarInfoList.getRow(i);
			var groupCode = carInfo.getValue("Group");
			var groupName = dataManager.getGroupName(groupCode);
			carInfo.setValue("Group",groupName);
			
			var positionID = carInfo.getValue("Position");
			var searchData = positionList.findFirstRow("PositionID =='"+positionID+"'");
			if( searchData ){
				carInfo.setValue("Position",searchData.getValue("Name"));
			}else{
				carInfo.setValue("Position","---");
			}	
		}

		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		var totalLabel = app.lookup("opt_tot");
		totalLabel.value = totalCount;

		var viewPageCount = totalCount / USMGR_pageRowCount + (totalCount % USMGR_pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		//console.log(dsUserList.getRowDataRanged());
		var udcCarInfoList = app.lookup("USMAG_udcCarInfoList");
		udcCarInfoList.setCarInfoList(dsCarInfoList);
		udcCarInfoList.setPaging(totalCount, USMGR_pageRowCount, viewPageCount);
		udcCarInfoList.redraw();
	} else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onUSMAG_udcCarInfoListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.carInfoList
	 */
	var uSMAG_udcCarInfoList = e.control;
	sendCarInfoListRequest();
}




/*
 * 버튼(USMGR_btnDeleteCar)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSMGR_btnDeleteCarClick(/* cpr.events.CMouseEvent */ e){

	var gridCarInfoList = app.lookup("USMAG_udcCarInfoList");
	var checkedRowIndices = gridCarInfoList.getCheckedRowIndices();
	var delCount = checkedRowIndices.length;

	dataManager = getDataManager();
	if (delCount == 0) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return
	} else {
		dialogConfirm(app.getRootAppInstance(), "", "삭제 하시겠습니까?", function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {

					comLib.showLoadMask("pro",dataManager.getString("Str_UserDelete"),"",checkedRowIndices.length);

					var dsCarDeleteList = app.lookup("dsCarDeleteList");
					dsCarDeleteList.clear();

					for( var i = 0; i < delCount; i++){
						var delIndex = checkedRowIndices[i];
						var delUser = {"UserIndexKey":gridCarInfoList.getUserIndexKey(delIndex),
										"VisitorIndexKey":gridCarInfoList.getVisitorIndexKey(delIndex),
										"CarNumber":gridCarInfoList.getCarNumber(delIndex),
										"rowIndex":delIndex};
						dsCarDeleteList.addRowData(delUser);
					}
					sendDeleteCar();

				} else {}
			});
		});
	}
}


// 사용자 삭제 요청 전송
function sendDeleteCar(){
	var dsCarDeleteList = app.lookup("dsCarDeleteList");
	if( dsCarDeleteList.getRowCount() == 0 ){
		comLib.hideLoadMask();
		dataManager = getDataManager();
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserNotSelected"));
		return;
	}
	var row = dsCarDeleteList.getRow(0);
	var userIndexKey = row.getValue("UserIndexKey");
	var visitorIndexKey = row.getValue("VisitorIndexKey");
	var carNumber = row.getValue("CarNumber");
	console.log(userIndexKey, visitorIndexKey, carNumber);
	
	var msg = dataManager.getString("Str_UserID");
	comLib.updateLoadMask(msg);
	
	var sms_deleteCarInfo = new cpr.protocols.Submission("sms_deleteCarInfo");
	sms_deleteCarInfo.action = "/v1/jawoondae/carinfo/delete/"+carNumber;
	sms_deleteCarInfo.method = "GET";
	sms_deleteCarInfo.mediaType = "application/x-www-form-urlencoded";
	sms_deleteCarInfo.setParameters("UserIndexKey", userIndexKey);
	sms_deleteCarInfo.setParameters("VisitorIndexKey", visitorIndexKey);
	sms_deleteCarInfo.setParameters("rowIndex", row.getValue("rowIndex").toString());
	//sms_deleteCarInfo.userAttr("UserIndexKey", userIndexKey);
	//sms_deleteCarInfo.userAttr("VisitorIndexKey", visitorIndexKey);
	//sms_deleteCarInfo.userAttr("CarNumber", carNumber);
	//sms_deleteCarInfo.userAttr("rowIndex", row.getValue("rowIndex").toString());	
	sms_deleteCarInfo.addResponseData(app.lookup("Result"), false, "Result");
		
	sms_deleteCarInfo.addEventListenerOnce("submit-done", onSms_deleteUserSubmitDone);
	sms_deleteCarInfo.addEventListenerOnce("submit-error", onSms_deleteUserSubmitError);
	sms_deleteCarInfo.addEventListenerOnce("submit-timeout", onSms_deleteUserSubmitTimeout);
	sms_deleteCarInfo.send();
}

// 사용자 삭제 완료
function onSms_deleteUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/* @type cpr.protocols.Submission */
	var sms_deleteUser = e.control;
	
	var dsCarDeleteList = app.lookup("dsCarDeleteList");
	dsCarDeleteList.realDeleteRow(0);

	var gridCarInfoList = app.lookup("USMAG_udcCarInfoList");
 
	//var uid = sms_deleteUser.userAttr("uid");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		gridCarInfoList.deleteRow( parseInt(sms_deleteUser.getParameters("rowIndex"),10));
		sendDeleteCar();
	} else {		
		comLib.hideLoadMask();
		dataManager = getDataManager();
		//dialogAlert(app, dataManager.getString("Str_Failed"),
		//	dataManager.getString("Str_UserDelete")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, dataManager.getString("Str_Failed"),
			dataManager.getString("Str_UserDelete")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}
// 사용자 삭제 실패
function onSms_deleteUserSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 사용자 삭제 타임아웃
function onSms_deleteUserSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

/*
 * 사용자 정의 컨트롤에서 search 이벤트 발생 시 호출.
 */
function onUSMAG_udcSearchUserSearch(/* cpr.events.CUIEvent */ e){
	sendCarInfoListRequest();
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
