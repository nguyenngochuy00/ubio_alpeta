/************************************************
 * fileuploaddataLog.js
 * Created at 2020. 9. 8. 오후 4:15:49.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var SSHFDL_pageRowCount = 50;
var SSHFDL_pageRowPerExport = 1000;

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("fileUploaddatalogListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("fileUploaddatalogListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = SSHFDL_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var dtStart = app.lookup("SSHFDL_dtStart");
	var dtEnd = app.lookup("SSHFDL_dtEnd");
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	dtStart.value = now.format('YYYY-MM-DD');
	setPageIndexer(0,1,SSHFDL_pageRowCount,10);
	app.lookup("SSHFDL_cmbCategory").value = "name";
}

function onSSHFDL_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	
	//pageIndex 초기 화
	var pageIndex = app.lookup("fileUploaddatalogListPageIndexer");	
	pageIndex.currentPageIndex = 1;
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");
	sendGetFileUploadDatalogList();
}

function sendGetFileUploadDatalogList() {
	
	var smsGetFileUploadDataLogList = app.lookup("sms_getFileUploadDataLogList");
	
	var category = app.lookup("SSHFDL_cmbCategory").value;
	var keyword = app.lookup("SSHFDL_ipbKeyword").value;
	
	var startAt = app.lookup("SSHFDL_dtStart").value;
	startAt = dateLib.makeDateFormat(startAt, "-") + " 00:00:00";
	var endAt = app.lookup("SSHFDL_dtEnd").value;
	endAt = dateLib.makeDateFormat(endAt, "-") + " 23:59:59";
	
	smsGetFileUploadDataLogList.setParameters("startTime", startAt);
	smsGetFileUploadDataLogList.setParameters("endTime", endAt);
	smsGetFileUploadDataLogList.setParameters("searchCategory", category);
	smsGetFileUploadDataLogList.setParameters("searchKeyword", keyword);
	
	if (keyword == null || keyword.length == 0) {
		smsGetFileUploadDataLogList.setParameters("searchCategory", "");
	}
	
	var dm_ExportParam = app.lookup("dm_ExportParam");	
	if( dm_ExportParam.getValue("mode")=="list"){
		
		var curIndex = app.lookup("fileUploaddatalogListPageIndexer").currentPageIndex;
		var offset = (curIndex - 1) * SSHFDL_pageRowCount;
		smsGetFileUploadDataLogList.setParameters("offset", offset);
		smsGetFileUploadDataLogList.setParameters("limit", SSHFDL_pageRowCount);
	} else {
		smsGetFileUploadDataLogList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsGetFileUploadDataLogList.setParameters("limit", SSHFDL_pageRowCount);
	}
	
	smsGetFileUploadDataLogList.setParameters("payMode", 0);
	
	var dsFileUploadDataLogList = app.lookup("FileUploadDataLogList");
	dsFileUploadDataLogList.clear();
	
	smsGetFileUploadDataLogList.send();
	var dm_ExportParam = app.lookup("dm_ExportParam");	
	if( dm_ExportParam.getValue("mode")=="list"){
		comLib.showLoadMask("","파일업로드 이력 조회","");
	}
}

function onSms_getFileUploadDataLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		///////////////////////////////////////////////////////////
		var dsFileUploadDataLogList = app.lookup("FileUploadDataLogList");
		var count = dsFileUploadDataLogList.getRowCount();
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		app.lookup("SSHFDL_opbTotal").value = totalCount;
			
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if( dm_ExportParam.getValue("mode")=="list"){
			var viewPageCount = totalCount / SSHFDL_pageRowCount + (totalCount % SSHFDL_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			selectPaging(totalCount, viewPageCount);
			comLib.hideLoadMask();				
		} else {
			var exportFileUploadDataLogList = app.lookup("ExportFileUploadDataLogList");
			if(dsFileUploadDataLogList.getRowCount() == 0 ){
				comLib.hideLoadMask();
				if( exportFileUploadDataLogList.getRowCount() >0 ){
					exportExcel();					
					exportFileUploadDataLogList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			}else {					
				for(var i = 0; i < dsFileUploadDataLogList.getRowCount(); i++){
					var row = exportFileUploadDataLogList.pushRowData(dsFileUploadDataLogList.getRowData(i));
					row.setValue("PResult", getPResultValue(dsFileUploadDataLogList.getRowData(i).PResult));
					console.log(row.getRowData());
				}	
				if( exportFileUploadDataLogList.getRowCount() >= dm_ExportParam.getValue("total")){
					exportExcel();
					comLib.hideLoadMask();
					exportFileUploadDataLogList.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset");
					offset += SSHFDL_pageRowPerExport;
					dm_ExportParam.setValue("offset",offset);
					comLib.updateLoadMask(offset);
					sendGetFileUploadDatalogList();
				}
			}
		}
	} else {
		dialogAlert(app, "Waning", "파일업로드 이력 조회"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("SSHFDL_grdLogList").redraw();
}

function onSms_getFileUploadDataLogListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getFileUploadDataLogListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onFileUploaddatalogListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendGetFileUploadDatalogList();
}

function onSSHFDL_btnExportClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sSHFDL_btnExport = e.control;
	
	var totalLabel = app.lookup("SSHFDL_opbTotal");
	var dmTotal = app.lookup("Total");
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));	
	dm_ExportParam.setValue("offset", 0);
	comLib.showLoadMask("pro","파일업로드 이력 조회","",parseInt(totalLabel.value)/1000);
	
	sendGetFileUploadDatalogList();
}

function exportExcel(){
	
	dataManager = getDataManager();
	var dsExportList = app.lookup("ExportFileUploadDataLogList");
	var total = dsExportList.getRowCount();
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "파일업로드이력_"+today+".xlsx";	
	var ws_name = "파일업로드이력_";
		
	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(dsExportList.getRowDataRanged());
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);	
}

//getFuncValue
function getPResultValue(value) {
	var result = "";
	switch (Number(value)) {
		case 0:
			result = "미지정";
			break;
		case 1:
			result = "충전성공"
			break;
		case 2:
			result = "대상아님";
			break;
		case 3:
			result = "실패";
			break;
		default:
			result = "미지정"
			break;
	}
	return result;
}



/*
 * "삭제" 버튼(SSHFDL_btnDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSSHFDL_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sSHFDL_btnDelete = e.control;
	//체크로 한건식 삭제
	//단 식대/성공항목은 제외
	var grdLogList = app.lookup("SSHFDL_grdLogList");
	var checkedRowIndices = grdLogList.getCheckRowIndices()
	var delCount = checkedRowIndices.length;
	//삭제할 리스트 체크
	var arrUnchk = new Array(); 
	var arrIdx = 0;
	for (var i = 0; i < delCount; i++) {
		var delIndex = checkedRowIndices[i];
		var pmode = grdLogList.getRow(delIndex).getValue("PMode");
		var presult =	grdLogList.getRow(delIndex).getValue("PResult");
		if (pmode == "식대") {
			if (presult == 0 || presult == 1) {
				arrUnchk[arrIdx] = delIndex;
				arrIdx++;
			}
		} else {
			if (presult == 1) {
				arrUnchk[arrIdx] = delIndex;
				arrIdx++;
			}
		}
	}
	if (arrIdx > 0) {
		//강제로 체크해제
		console.log(arrUnchk);
		confirm("삭제하시려는 이력 중에 입금 구분이 [식수]인 경우, \n 결과가 [성공 or 미지정]이면 삭제 할 수 없습니다.\n 확인을 진행하시면 해당 항목을 체크해제 후 진행 됩니다.");
		for (var i=0; i< arrUnchk.length; i++) {
			
			grdLogList.setCheckRowIndex(arrUnchk[i], false);
		}
		grdLogList.redraw();
	}
	
	var checkedRowIndices2 = grdLogList.getCheckRowIndices();
	var delCount2 = checkedRowIndices2.length;
	
	dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					comLib.showLoadMask("pro", "파일업로드 이력 삭제", "", checkedRowIndices2.length);
					
					var dsDeleteList = app.lookup("dsDeleteList");
					dsDeleteList.clear();
					
					for (var i = 0; i < delCount2; i++) {
						var delIndex = checkedRowIndices2[i];
						var delCardList = {
							"rowIndex": delIndex,
							"LIndex": grdLogList.getRow(delIndex).getValue("LIndex"),
						};
						dsDeleteList.addRowData(delCardList);
					}
					sendDeletePrepayHistory();
					
				} else {}
			});
		});
}

function sendDeletePrepayHistory() {
	var dsDeleteList = app.lookup("dsDeleteList");
	if (dsDeleteList.getRowCount() == 0) {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlert(app, "Waning", dataManager.getString("Str_UserNotSelected"));
		return;
	}
	var dsTopData = dsDeleteList.getRow(0);
	var LIndex = dsTopData.getValue("LIndex");
	console.log(dsTopData.getRowData());
	var msg = "인덱스 : " + " : " + LIndex;
	comLib.updateLoadMask(msg);

	var smsFileuploadLog = app.lookup("sms_deleteFileuploadLog");
	smsFileuploadLog.action = "/v1/ssh/prepayment/fileUploadLog/" + LIndex;
	
	smsFileuploadLog.send();
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteFileuploadLogSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteFileuploadLog = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsDelete = app.lookup("dsDeleteList");
		console.log("카운트", dsDelete.getRowCount());
		var gridRow = dsDelete.getValue(0, "rowIndex");
		var grid = app.lookup("SSHFDL_grdLogList"); 
		grid.deleteRow(gridRow);
//		dsDelete.deleteRow(0);
		dsDelete.realDeleteRow(0);
		console.log("카운트", dsDelete.getRowCount());
		if (dsDelete.getRowCount() > 0) {
			sendDeletePrepayHistory();
		} else {
			comLib.hideLoadMask();
		}
		
	}else {
		comLib.hideLoadMask();
	}
}
