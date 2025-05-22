/************************************************
 * TerminalManagement.js
 * Created at 2018. 11. 16. 오후 3:16:52.
 *
 * @author wonki
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var TMMGR_common;
var TMMGR_gridUtil = createGridUtil(app);

var TMMGR_pageRowCount = 20;
var TMMGR_deleteIndices;
var TMMGR_bPageChange = false;
var usint_version;
var dataManager;
var comLib;
var TMMGR_brandType;
var oemVersion;
var exportOffset = 0;
var exportCount = 100;

var NSH_DEV_CODE = 0;
var ENABLE_MCP040 = 0;

function onBodyLoad(/* cpr.events.CEvent */ e){

	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	var groupList = dataManager.getGroup();
	NSH_DEV_CODE = dataManager.getNSH_DEV_CODE();
	ENABLE_MCP040 = dataManager.getENABLE_MCP040();

	TMMGR_brandType = dataManager.getSystemBrandType();
	oemVersion = dataManager.getOemVersion();

	var udcTerminalList = app.lookup("TMMGR_udcTerminalList");
	udcTerminalList.setPaging(0,1,10,TMMGR_pageRowCount);
	if (oemVersion != OEM_HYUNDAI_HI){
		udcTerminalList.deleteColumn([3,4,5,6,7,8,9,18]);
		app.lookup("TMMGR_btnGroup").getLayout().removeColumns([6]); // 엑셀 버튼 삭제
		// 검색 조건 추가
//		app.lookup("TMMGR_udcSearchTerminal").addCategory("Str_BuildingNumber", "buildingnumber", true);
//		app.lookup("TMMGR_udcSearchTerminal").addCategory("Str_BuildingName", "buildingname", true);
	} else {
		app.lookup("TMMGR_btnExcel").visible = true;
	}
	udcTerminalList.setGroupList(groupList);

	var initValue = app.getHost().initValue;
	var dsGroupList = app.lookup("GroupList");

	if(oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX){
		app.lookup("mdi2").getTabItemByID(1).bind("text").toLanguage("Str_PartnerCompany");
	}
	
	if(oemVersion != OEM_ITONE_TRDATA){
		app.lookup("TMMGR_btnAlc").visible = false;
	}
	
	var productID = dataManager.getSystemData("ProductID");
	if (productID == ProductCore){
		app.lookup("TMMGR_grbCore").visible = true;
		app.lookup("TMMGR_cbxCore").enabled = true;
		app.lookup("TMMGR_cbxCore").visible = true;
	}

	groupList.copyToDataSet(dsGroupList);
	app.lookup("TMMGR_treGroup").redraw();

	sendTerminalListRequest();
}

// 단말기 리스트 요청
function sendTerminalListRequest(initPage) {
	var dsTerminalList = app.lookup("TerminalList");
	dsTerminalList.clear();
	var udcTerminalList = app.lookup("TMMGR_udcTerminalList");
	if (initPage) udcTerminalList.setCurrentPageIndex(1);
	var curIndex = udcTerminalList.getCurrentPageIndex();

	var offset = (curIndex - 1) * TMMGR_pageRowCount;
	//console.log(curIndex, offset);

	var searchCtrl = app.lookup("TMMGR_udcSearchTerminal")
	var smsGetTerminalList = app.lookup("sms_getTerminalList");

	smsGetTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsGetTerminalList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	if( searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0 ){
		smsGetTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	}else{
		smsGetTerminalList.setParameters("searchCategory", "");
	}
	
	if(app.lookup("TMMGR_cbxCore").checked){ // Core 단말기 조회
		smsGetTerminalList.setParameters("searchKeyword2", 1);
	} else {
		smsGetTerminalList.setParameters("searchKeyword2", 0);
	}

	var groupList = app.lookup("TMMGR_treGroup");
	var group = groupList.getSelectionFirst();
	if (group != undefined && group.value != "") {
		smsGetTerminalList.setParameters("groupID", parseInt(group.value, 10));
	} else {
		smsGetTerminalList.setParameters("groupID", 0);
	}
	smsGetTerminalList.setParameters("subInclude", "true");

	smsGetTerminalList.setParameters("offset", offset);
	smsGetTerminalList.setParameters("limit", TMMGR_pageRowCount);
	
	if (oemVersion == OEM_HYUNDAI_HI){
		app.lookup("TerminalCustomHDHIList").clear();
		smsGetTerminalList.addRequestData(app.lookup("TerminalCustomHDHIList"), "TerminalCustomHDHIList");
	}
	smsGetTerminalList.send();
}

// 단말기 리스트 가져오기 완료
function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var value = result.getValue("ResultCode");

	if( result.getValue("ResultCode")== COMERROR_NONE) { // 성공
		var dsTerminalList = app.lookup("TerminalList");

		var dmTotal = app.lookup("Total");
		var totalCount = parseInt( dmTotal.getValue("Count"));
		app.lookup("TMMGR_lbTotal").redraw();
		app.lookup("TMMGR_opbRegistedCount").redraw();
		app.lookup("TMMGR_opblimitCount").redraw();

		var viewPageCount = totalCount/TMMGR_pageRowCount + (totalCount%TMMGR_pageRowCount>0);
		if( viewPageCount > 10 ) {
			viewPageCount = 10;
		}
		
		var udcTerminalList = app.lookup("TMMGR_udcTerminalList");
		udcTerminalList.setPaging(totalCount, TMMGR_pageRowCount, viewPageCount);
		// 현대 중공업 분기 처리하기
		if(oemVersion == OEM_HYUNDAI_HI){
			var terminalHDHIList = app.lookup("TerminalHDHIList");
			terminalHDHIList.clear();
			var dsTerminalCustomHDHI = app.lookup("TerminalCustomHDHIList");
			dsTerminalList.copyToDataSet(terminalHDHIList);
			for (var i = 0; i < dsTerminalCustomHDHI.getRowCount(); i++){
				var row = dsTerminalCustomHDHI.getRow(i);
				var findRow = terminalHDHIList.findFirstRow("ID == " + row.getValue("TerminalID"));
				findRow.setValue("DeptID", row.getValue("GroupID"));
				findRow.setValue("PartnerID", row.getValue("PartnerID"));
				findRow.setValue("BuildingName", row.getValue("BuildingName"));
				findRow.setValue("BuildingNumber", row.getValue("BuildingNumber"));
				findRow.setValue("Part1", row.getValue("Part1"));
				findRow.setValue("Part2", row.getValue("Part2"));
				findRow.setValue("Part3", row.getValue("Part3"));
				findRow.setValue("Remark", row.getValue("Remark"));
			}
			udcTerminalList.setTerminalList(terminalHDHIList);
		} else {
			udcTerminalList.setTerminalList(dsTerminalList);
		}
		udcTerminalList.redraw();
//		udcTerminalList.setTerminalList(dsTerminalList);
//		udcTerminalList.redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TerminalListLoadingFailed"));
	}
	if (oemVersion == OEM_INNODEP_NORMAL) {
		getTerminalModelString = function( value ){
			switch ( value ) {
			case 33:	return "IUA-7100S";	break;
			case 34:	return "IUC-5110S";	break;
			case 41:	return "IFFR-SC7000";	break;
			case 45:	return "IFFR-XFS";	break;
			default:	alert(	"undefined terminal type");			return
			}
		}
	}
}

// 단말기 리스트 가져오기 에러
function onSms_getTerminalListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 단말기 리스트 가져오기 타임아웃
function onSms_getTerminalListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 단말기 리스트 페이지 변경
function onTMMGR_udcTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendTerminalListRequest(); // 서버에 새로운 페이지의 단말 리스트 요청
}

// 단말기 검색 클릭
function onTM_MGR_udcSearchTerminalSearch(/* cpr.events.CUIEvent */ e){
	var TMMGR_udcTerminalList = app.lookup("TMMGR_udcTerminalList");
	TMMGR_udcTerminalList.setCurrentPageIndex(1);
	sendTerminalListRequest(); // 서버에 검색 조건에 따른 단말 리스트 요청
}

// ??
function onTMMGR_udcTerminalListTerminalInfo(/* cpr.events.CGridEvent */ e){
	/** @type udc.grid.terminalList */
	console.log("check this");
    var tMMGR_udcTerminalList = e.control;
    var path;
	if( TMMGR_brandType == BRAND_VRIDI) {
		path = "app/main/terminals/optionVirdi/terminalVInfoFrame"
	} else {
		var tInfo = e.row.getRowData();

		switch (parseInt(tInfo["Type"],10)) {
			case 22:
				path = "app/main/terminals/T9/OptionFrame"
				break;

			case 6:
				path = "app/main/terminals/NAC5000/OptionFrame"
				break;
		}
	}

	//console.log(path);
	path = path + "?" + usint_version;
	app.getRootAppInstance().openDialog(path, {width: 1100, height: 600}, function(dialog){
		dialog.initValue = e.row.getRowData();
		dialog.modal = false;
	}).then(function(input){
		;
	});
}

// 그룹 선택 변경시
function onTMMGR_treGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendTerminalListRequest(true);
}

// 단말 리스트 더블 클릭시
function onTMMGR_udcTerminalListTerminalListDblclick(/* cpr.events.CGridEvent */ e){
	var path;
	
	if( TMMGR_brandType == BRAND_VRIDI) {		
		if(ENABLE_MCP040 == 1){
			var tInfo = e.row.getRowData();
			if (parseInt(tInfo["Type"],10) == 21){ // MCP			
				path = "app/main/terminals/optionMCP/terminalVInfoFrameMCP"
			} else {
				path = "app/main/terminals/optionVirdi/terminalVInfoFrame"
			}
		} else if(oemVersion == OEM_ARMY_HQ){
				path = "app/custom/army_hq/areaNDeviceManagement/terminalVInfoFrame"
		} else if(dataManager.getOemVersion() == OEM_ROKMCH){
				path = "app/custom/rokmch/areaNDeviceManagement/terminalVInfoFrame"
		} else {
			var id = e.row.getRowData()["ID"];
			var remoteOptFlag;
			var rowData = app.lookup("TerminalList").findFirstRow("ID == " + id);
			if (rowData) {
				remoteOptFlag = rowData.getValue("RemoteAllOptionFlag");
			}
			if (remoteOptFlag == RemoteOptionAvailable) {
				path = "app/main/terminals/remoteOption/RemoteTerminalOptionFrame"
			} else {
				path = "app/main/terminals/optionVirdi/terminalVInfoFrame"
			}
		}
	} else {
		var tInfo = e.row.getRowData();
		
		switch (parseInt(tInfo["Type"],10)) {
		case 6:		path = "app/main/terminals/NAC5000/OptionFrame";	break;
		case 22:	path = "app/main/terminals/T9/OptionFrame";			break;
		case 24:	path = "app/main/terminals/eNCardi/OptionFrame";	break;
		case 25:	path = "app/main/terminals/T2/OptionFrame";			break;
		case 26: 	path = "app/main/terminals/XSlim/OptionFrame";		break;
		default:	alert("undefined terminal type");			return
		}
	}
	var tInfo = e.row.getRowData();
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {"Target":DLG_TERMINAL_INFO,	"InitVal": {"ID": e.row.getRowData()["ID"],	"Path": path}}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 단말기 추가 버튼 클릭시
function onTMMGR_btnRegistTerminalClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/main/terminals/TerminalRegist" + "?" + usint_version;
	app.openDialog(appld, {width : 310, height : 220}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_TerminalRegist");
		dialog.modal = true;
	}).then(function(returnValue){
		if(returnValue["Result"] == 0){
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalRegist"));
			sendTerminalListRequest();
		}
	});
}

// 도움말 페이지
function onTMMGR_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 단말기 삭제 버튼 클릭
function onTM_MGR_btnDeleteTerminalClick(/* cpr.events.CMouseEvent */ e){
	var udcTerminalList = app.lookup("TMMGR_udcTerminalList")
	var chkIndices = udcTerminalList.getCheckedRowIndices();	
	var total = chkIndices.length;
	
	if( total < 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedTerminals"));
		return;
	}
	
	dialogConfirm(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				
				var srcCount = udcTerminalList.getRowCount();
				if( total == srcCount ){ // 화면에 보이는 모든 데이터를 삭제한 경우 첫 페이지로 이동
					TMMGR_bPageChange = true;
				} else {
					TMMGR_bPageChange = false;
				}
			
				var dsTerminalIDList = app.lookup("TerminalIDList");
				dsTerminalIDList.clear();
				for( var i = 0; i < total; i++ ){
					var row = udcTerminalList.getRow(chkIndices[i]);
					dsTerminalIDList.addRowData({"ID":row.getValue("ID")});
				}
				dsTerminalIDList.commit();
			
				comLib.showLoadMask("pro", dataManager.getString("Str_Data")+" "+dataManager.getString("Str_Sync"), "", total);
				sendTerminalDelete();
							
			} else {
				return;
			}
		});
	});
	
	
}

function sendTerminalDelete(){
	var dsTerminalIDList = app.lookup("TerminalIDList");
	var row = dsTerminalIDList.getRow(0);
	if( row ){
		var terminalID = row.getValue("ID")
		//dsTerminalIDList.deleteRow(0);
		dsTerminalIDList.commit();

		var dmResult = app.lookup("Result");
		var sms_deleteTerminal =  new cpr.protocols.Submission("sms_deleteTerminal");
		sms_deleteTerminal.setParameters("id", terminalID);
		sms_deleteTerminal.method = "delete";
		sms_deleteTerminal.mediaType = "application/x-www-form-urlencoded";
		sms_deleteTerminal.action = "/v1/terminals/"+terminalID;
		//sms_deleteTerminal.userAttr("rowIndex", row.getValue("rowIndex").toString());
		sms_deleteTerminal.addResponseData(dmResult);
		sms_deleteTerminal.addEventListenerOnce("submit-done", onSms_deleteTerminalSubmitDone);
		sms_deleteTerminal.addEventListenerOnce("submit-error", onSms_deleteTerminalSubmitError);
		sms_deleteTerminal.addEventListenerOnce("submit-timeout", onSms_deleteTerminalSubmitTimeout);

		sms_deleteTerminal.send();
	} else {
		comLib.hideLoadMask();
	}
}

// 단말기 삭제 완료
function onSms_deleteTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var finished = false;
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		
		var dsTerminalIDList = app.lookup("TerminalIDList");
		var row = dsTerminalIDList.getRow(0);
		var terminalID = row.getValue("ID")
		dsTerminalIDList.realDeleteRow(0);
		//var gridTerminalList = app.lookup("TMMGR_udcTerminalList");
		//gridTerminalList.deleteRow(terminalID);
		
		
		var dsTerminalIDList = app.lookup("TerminalIDList");
		var total = dsTerminalIDList.getRowCount();
		if( total > 0 ){
			comLib.updateLoadMask("");
			sendTerminalDelete();
		} else {
			finished = true;
			comLib.hideLoadMask();
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalDelete"));
			if( TMMGR_bPageChange ){ // 화면에 보이는 모든 데이터를 삭제한 경우 첫 페이지로 이동
				TMMGR_bPageChange = false;
				sendTerminalListRequest(1);
			}		
		}
	} else {
		finished = true;

		//var sms_deleteTerminal = app.lookup("sms_deleteTerminal");
		//var terminalID = sms_deleteTerminal.getParameters("id");
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorPrivilegeNotPermission"));
	}

	if( finished == true ){
		sendTerminalListRequest();
	}

}

// 단말기 삭제 에러
function onSms_deleteTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 단말기 삭제 타임아웃
function onSms_deleteTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function onTMMGR_cbxCoreValueChange(/* cpr.events.CValueChangeEvent */ e){
	var TMMGR_udcTerminalList = app.lookup("TMMGR_udcTerminalList");
	TMMGR_udcTerminalList.setCurrentPageIndex(1);
	sendTerminalListRequest();
}

// ---------------------- 동기화 함수  ------------------------->>
// 사용자 삭제 결과 콜백. 별도 오픈된 사용자 정보창에서 사용자 삭제시 발생.
exports.onTerminalUpdateSync = function( terminalInfo){
	var udcTerminalList = app.lookup("TMMGR_udcTerminalList");
	udcTerminalList.updateTerminalInfo(terminalInfo);
	dataManager.updateTerminalCoreFlag(terminalInfo.CoreFlag, terminalInfo.ID);
	app.lookup("TMMGR_opbRegistedCount").value = dataManager.getTerminalList().findAllRow("CoreFlag == " + 1).length;
	app.lookup("TMMGR_opbRegistedCount").redraw();
}
// 사용자 삭제 결과 콜백. 별도 오픈된 사용자 정보창에서 사용자 삭제시 발생.
exports.onTerminalDeleteSync = function( terminalID ){
	var udcTerminalList = app.lookup("TMMGR_udcTerminalList");
	udcTerminalList.deleteTerminal(terminalID);
	dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalDelete"));
}
// <<---------------------- 동기화 함수  -------------------------

function onTMMGR_btnExcelClick(/* cpr.events.CMouseEvent */ e){
	comLib.showLoadMask("", dataManager.getString("Str_InstallationLocation")+" "+dataManager.getString("Str_Export"), "", 0);
	smsExportHDHIList();	
//	exportExcel();
}

function smsExportHDHIList(){
	var smsExportList = app.lookup("sms_getExportTerminalLocationList");
	var searchCtrl = app.lookup("TMMGR_udcSearchTerminal");
	app.lookup("ExportTerminalLocationList").clear();
	
	smsExportList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsExportList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	if( searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0 ){
		smsExportList.setParameters("searchCategory", searchCtrl.searchCategory);
	}else{
		smsExportList.setParameters("searchCategory", "");
	}
	
	if(app.lookup("TMMGR_cbxCore").checked){ // Core 단말기 조회
		smsExportList.setParameters("searchKeyword2", 1);
	} else {
		smsExportList.setParameters("searchKeyword2", 0);
	}

	var groupList = app.lookup("TMMGR_treGroup");
	var group = groupList.getSelectionFirst();
	if (group != undefined && group.value != "") {
		smsExportList.setParameters("groupID", parseInt(group.value, 10));
	} else {
		smsExportList.setParameters("groupID", 0);
	}
	smsExportList.setParameters("subInclude", "true");
	
	smsExportList.setParameters("offset", exportOffset);
	smsExportList.setParameters("limit", exportCount);
	
	smsExportList.send();
}

function onSms_getExportTerminalLocationListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var exportList = app.lookup("ExportTerminalLocationList");
	var dsExcelList = app.lookup("ExportTerminalHDHIList");
	var total = app.lookup("Total").getValue("Count");
	if (resultCode == COMERROR_NONE){
		exportList.copyToDataSet(dsExcelList);
		if (dsExcelList.getRowCount() < total){
			exportOffset += exportCount;
			smsExportHDHIList();
		} else {
			exportOffset = 0;
			exportExcel();
		}
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function exportExcel(){
	var dsExportList = app.lookup("ExportTerminalHDHIList");
	
	var stringified = JSON.stringify(dsExportList.getRowDataRanged());
	// 부서랑 파트너 아이디를 이름을 바꿔줘야함			
	stringified = stringified.replace(/"TerminalID"/gi, '"'+"No"+'"');
	stringified = stringified.replace(/"GroupName"/gi, '"'+dataManager.getString("Str_EXDB_PART")+'"');
	stringified = stringified.replace(/"PartnerName"/gi, '"'+dataManager.getString("Str_PartnerCompany")+'"');
	stringified = stringified.replace(/"BuildingName"/gi, '"'+dataManager.getString("Str_BuildingName")+'"');		
	stringified = stringified.replace(/"BuildingNumber"/gi, '"'+dataManager.getString("Str_BuildingNumber")+'"');
	stringified = stringified.replace(/"Part1"/gi, '"'+dataManager.getString("Str_Part1")+'"');
	stringified = stringified.replace(/"Part2"/gi, '"'+dataManager.getString("Str_Part2")+'"');
	stringified = stringified.replace(/"Part3"/gi, '"'+dataManager.getString("Str_Part3")+'"');
	stringified = stringified.replace(/"Remark"/gi, '"'+dataManager.getString("Str_Remarks")+'"');
	
	var InputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = dataManager.getString("Str_InstallationLocation")+ "_"+today+".xlsx";	
	var ws_name = dataManager.getString("Str_InstallationLocation") + "_";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(InputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
	comLib.hideLoadMask();
	app.lookup("ExportTerminalHDHIList").clear();
}

/*
 * "음주 측정 설정" 버튼(TMMGR_btnAlc)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMMGR_btnAlcClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/custom/itone/terminalAlcSet";
	app.openDialog(appld, {width : 500, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_TeminalAlcOptionSet");
		dialog.modal = true;
	})
}
