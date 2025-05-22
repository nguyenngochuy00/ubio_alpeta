/************************************************
 * moveOutStatus.js
 * Created at 2021. 2. 16. 오후 12:43:50.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var AMMOS_pageRowCount = 50;
var AMMOS_exportCount = 100; // 한번에 요청할 데이터 수

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var today = dateLib.getToday("-");
	app.lookup("AMMOS_dtiDeleteStartAt").value = today
	app.lookup("AMMOS_dtiDeleteEndAt").value = today
	
	var pageIndexer = app.lookup("AMMOS_piUserList");	
	pageIndexer.pageRowCount = AMMOS_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
}

function sendUserMoveOutListReq(isList){
	app.lookup("UserMoveOutList").clear();
	
	var pageIndexer = app.lookup("AMMOS_piUserList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * AMMOS_pageRowCount;
	
	var startAt = app.lookup("AMMOS_dtiDeleteStartAt").value+" 00:00:00";
	var endAt = app.lookup("AMMOS_dtiDeleteEndAt").value+" 23:59:59";
	
	var name = app.lookup("AMMOS_ipbName").value;
	
	var sms_getAccessCardInfoList;
	if (isList == true) {
		sms_getAccessCardInfoList = app.lookup("sms_getUserMoveOutList");	
	} else {
		sms_getAccessCardInfoList = app.lookup("sms_getUserMoveOutListExport");
	}
	
	sms_getAccessCardInfoList.setParameters("startAt", startAt);
	sms_getAccessCardInfoList.setParameters("endAt", endAt);	
	sms_getAccessCardInfoList.setParameters("userName", name);
	if (isList == true) {
		sms_getAccessCardInfoList.setParameters("limit", AMMOS_pageRowCount);
		sms_getAccessCardInfoList.setParameters("offset", offset);	
	} else {
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset")
		sms_getAccessCardInfoList.setParameters("limit", AMMOS_exportCount);
		sms_getAccessCardInfoList.setParameters("offset", offset);	
	}
	
	sms_getAccessCardInfoList.send();
}

function validateDate( value ){
	if (value==undefined||value == "0001-01-01T00:00:00Z"){return "";}
	if (value.substring(0, 10)=="0001-01-01"){return;}
	return value.substring(0, 10) +" " + value.substring(11, 19);	
}

function onAMMOS_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	sendUserMoveOutListReq(true);
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		sendUserMoveOutListReq(true);		
	}
}

function onAMMOS_piUserListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendUserMoveOutListReq(true);
}

function onAMMOS_btnExportClick(/* cpr.events.CMouseEvent */ e){
	var total = app.lookup("Total").getValue("Count");
	if (total == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "조회된 데이터가 없습니다.");
		return
	}
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("total", total);
	dm_ExportParam.setValue("offset", 0);
	var totalStep = total / AMMOS_exportCount + (total % AMMOS_exportCount != 0) ? 1 : 0;
	comLib.showLoadMask("pro", "전출자 현황 내보내기", "", totalStep);
	
	sendUserMoveOutListReq(false);	
}

function onSms_getUserMoveOutListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();

	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){	
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));

		var piUserList = app.lookup("AMMOS_piUserList");
		piUserList.totalRowCount = totalCount;
	
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onSms_getUserMoveOutListExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var exportParam = app.lookup("ExportParam");
		var userMoveOutListExport = app.lookup("UserMoveOutListExport");
		var userMoveOutList = app.lookup("UserMoveOutList");
		
		if (userMoveOutList.getRowCount() == 0) {
			comLib.hideLoadMask();
			if (userMoveOutListExport.getRowCount() > 0) {
				exportExcel();
				userMoveOutListExport.clear();
			} else {
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
			}
		} else {
			
			var count = userMoveOutList.getRowCount();
			for (var i = 0; i < count; i++) {
				var userMoveOut = userMoveOutList.getRow(i);		
				userMoveOut.setValue("RegistAt", validateDate(userMoveOut.getValue("RegistAt")));
				userMoveOut.setValue("DeleteAt", validateDate(userMoveOut.getValue("DeleteAt")));
			}
			userMoveOutList.commit();
			userMoveOutList.copyToDataSet(userMoveOutListExport)

			if (userMoveOutListExport.getRowCount() >= exportParam.getValue("total")) {
				exportExcel();
				comLib.hideLoadMask();
				userMoveOutListExport.clear();
				sendUserMoveOutListReq(true);
			} else {
				var offset = exportParam.getValue("offset")
				offset += AMMOS_exportCount
				exportParam.setValue("offset", offset)
				comLib.updateLoadMask(offset);
				sendUserMoveOutListReq(false);
			}
		}
	} else {
		comLib.hideLoadMask();
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function exportExcel() {
	var dsExportList = app.lookup("UserMoveOutListExport");
	var total = dsExportList.getRowCount();
	
	for (var i = 0; i < total; i++) {
		var exportData = dsExportList.getRow(i);
		exportData.setValue("UserType", getUserTypeName(Number(exportData.getValue("UserType"))));		
	}
	
	var stringified = JSON.stringify(dsExportList.getRowDataRanged());
	
	stringified = stringified.replace(/"UserType"/gi, '"인원구분"');
	stringified = stringified.replace(/"Group"/gi, '"부서"');
	stringified = stringified.replace(/"Position"/gi, '"계급"');
	stringified = stringified.replace(/"ServiceNumber"/gi, '"군번"');
	stringified = stringified.replace(/"UserName"/gi, '"성명"');
	stringified = stringified.replace(/"UserName"/gi, '"직책"');
	stringified = stringified.replace(/"RegistAt"/gi, '"등록일"');
	stringified = stringified.replace(/"DeleteAt"/gi, '"삭제일"');
	stringified = stringified.replace(/"BasisIssuanceCertificate"/gi, '"비밀취급인가근거"');
	stringified = stringified.replace(/"IdentificationNumber"/gi, '"신원조사근거"');
	stringified = stringified.replace(/"Address"/gi, '"주소"');
	stringified = stringified.replace(/"VisitPurpose"/gi, '"방문목적"');
	stringified = stringified.replace(/"Mobile"/gi, '"연락처"');

	var inputData = JSON.parse(stringified);
	
	var today = dateLib.getToday();
	var filename = "전출자_현황_" + today + ".xlsx";
	var ws_name = "전출자_현황";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(inputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}


