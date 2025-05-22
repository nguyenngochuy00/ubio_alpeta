/************************************************
 * carListManagement.js
 * Created at 2020. 1. 20. 오후 2:35:54.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var USMGR_pageRowCount = 14;
var USMGR_recvRowPerExport = 2000;

function onBodyLoad(/* cpr.events.CEvent */ e){
	
	comLib = createComUtil(app);
	dataManager = getDataManager();
	app.lookup("USMAG_cmbCategory").value = "name";
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	
	sendCarInfoListRequest();
}

function sendCarInfoListRequest(){
	var USMAG_udcCarInfoList = app.lookup("USMAG_udcCarInfoList");
	var curIndex = USMAG_udcCarInfoList.getCurrentPageIndex();
	var offset = (curIndex - 1) * USMGR_pageRowCount
	
	var sms_getCarInfoList = app.lookup("sms_getCarInfoList");
	var category = app.lookup("USMAG_cmbCategory").value;
	var keyword = app.lookup("USMAG_ipbKeyword").value;
	sms_getCarInfoList.setParameters("offset", offset);
	sms_getCarInfoList.setParameters("limit", USMGR_pageRowCount);
	sms_getCarInfoList.setParameters("searchCategory", category);
	sms_getCarInfoList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		sms_getCarInfoList.setParameters("searchCategory", "");
		sms_getCarInfoList.setParameters("searchKeyword", "");
	} 
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	if( dm_ExportParam.getValue("mode")=="export"){
		sms_getCarInfoList.setParameters("offset", dm_ExportParam.getValue("offset"));
		sms_getCarInfoList.setParameters("limit", USMGR_recvRowPerExport);
	}
	
	var dsCarInfoList = app.lookup("CarInfoList");
	dsCarInfoList.clear();
	
	var udcCarInfoList = app.lookup("USMAG_udcCarInfoList");
	udcCarInfoList.setCarInfoList(dsCarInfoList);
	udcCarInfoList.setPaging(0, USMGR_pageRowCount, 0);
	
	sms_getCarInfoList.send();
	var dm_ExportParam = app.lookup("dm_ExportParam");
	if( dm_ExportParam.getValue("mode")=="list"){
		comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
	}
	
}

function onSms_getCarInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		var dsCarInfoList = app.lookup("CarInfoList");
		var count = dsCarInfoList.getRowCount();
		var positionList = dataManager.getPositionList();
		for(var i =0; i<count; i++){
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

		var dm_ExportParam = app.lookup("dm_ExportParam")		
		if( dm_ExportParam.getValue("mode")=="list"){
			var viewPageCount = totalCount / USMGR_pageRowCount + (totalCount % USMGR_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			
			var udcCarInfoList = app.lookup("USMAG_udcCarInfoList");
			udcCarInfoList.setCarInfoList(dsCarInfoList);
			udcCarInfoList.setPaging(totalCount, USMGR_pageRowCount, viewPageCount);
			comLib.hideLoadMask();
			//udcCarInfoList.redraw();
			
		} else{
			var exportCarInfoList = app.lookup("ExportCarInfoList");
			
			if(dsCarInfoList.getRowCount() == 0 ){
				comLib.hideLoadMask();
				if( exportCarInfoList.getRowCount() >0 ){
					exportExcel();					
					exportCarInfoList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			}else {				
				if( exportCarInfoList.getRowCount() == 0 ){ // 엑셀 내보내기시 전체 수를 처음에는 알 수 없으므로 첫번째 리스트 수신시 전체 카운트 셋팅
					dm_ExportParam.setValue("total",totalCount);
					
					//comLib.hideLoadMask();
					
					comLib.showLoadMask("pro", dataManager.getString("Str_ListLoading"), "",totalCount/USMGR_recvRowPerExport);					
				}
				//dsAuthLogList.copyToDataSet(exportAuthLogList)
				for( i = 0; i < count; i++){
					exportCarInfoList.pushRowData(dsCarInfoList.getRowData(i));
				}			
				
				if( exportCarInfoList.getRowCount() >= dm_ExportParam.getValue("total")){
					comLib.showLoadMask("","엑셀 데이터 변환 중","");
								
					setTimeout(function(){
  						exportExcel();					
						exportCarInfoList.clear();
  					}, 100);
					
				} else {
					var offset = dm_ExportParam.getValue("offset")
					offset += USMGR_recvRowPerExport;
					dm_ExportParam.setValue("offset",offset)
					comLib.updateLoadMask(offset);
					sendCarInfoListRequest();
				}
			}
		}
		
	} else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getCarInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}
function onSms_getCarInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

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
	sms_deleteCarInfo.addResponseData(app.lookup("Result"), false, "Result");
		
	sms_deleteCarInfo.addEventListenerOnce("submit-done", onSms_deleteCarInfoSubmitDone);
	sms_deleteCarInfo.addEventListenerOnce("submit-error", onSms_deleteCarInfoSubmitError);
	sms_deleteCarInfo.addEventListenerOnce("submit-timeout", onSms_deleteCarInfoSubmitTimeout);
	sms_deleteCarInfo.send();
}

function onSms_deleteCarInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
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

function onSms_deleteCarInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_deleteCarInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);	
}

function onUSMAG_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	
	var dsCarInfoList = app.lookup("CarInfoList");
	dsCarInfoList.clear();
	
	var udcCarInfoLis = app.lookup("USMAG_udcCarInfoList");
	udcCarInfoLis.setCarInfoList(dsCarInfoList);
	sendCarInfoListRequest();
}
function onUSMAG_udcCarInfoListPagechange(/* cpr.events.CSelectionEvent */ e){
		
	var uSMAG_udcCarInfoList = e.control;
	sendCarInfoListRequest();
}


/*
 * Body에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onBodyKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(dataManager.getOemVersion() == OEM_JAWOONDAE){
		if (e.code == 'Enter') {
			var udcCarInfoLis = app.lookup("USMAG_udcCarInfoList");
			udcCarInfoLis.setCurrentPageIndex(1);
			sendCarInfoListRequest();
		}
	}
}


/*
 * "Button" 버튼(USMAG_btnExport)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSMAG_btnExportClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSMAG_btnExport = e.control;
	var totalLabel = app.lookup("opt_tot");
	var dmTotal = app.lookup("Total");
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));	
	dm_ExportParam.setValue("offset", 0);
	comLib.showLoadMask("pro","차량내보내기","",parseInt(totalLabel.value)/1000);
	
	sendCarInfoListRequest();
}

function exportExcel(){
	
	dataManager = getDataManager();
	var dsCarInfoList = app.lookup("ExportCarInfoList");
	var total = dsCarInfoList.getRowCount();
	comLib.showLoadMask("pro","차량리스트 내보내기","",total);
	for( var i = 0; i < total ; i++){
		var carInfo = dsCarInfoList.getRow(i);
		
		var groupName = carInfo.getValue("Group");		
		//var groupName = dataManager.getGroupName(groupID);		
		carInfo.setValue("Group",groupName);
		
		/* ExportAuthLogList에서 Property 일단 삭제. 로그 생성 위치, 저장 방법, 외부장비 종류, 관리자 개입 여부 기록 
				var property = authLogInfo.getValue("Property");
		* */
		
	}
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "CarInfoList_"+today+".xlsx";	
	var ws_name = "CarInfoList__";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(dsCarInfoList.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
	comLib.hideLoadMask();
}