/************************************************
 * edu_course_inquiry.js
 * Created at 2021. 4. 26. 오후 3:26:32.
 *
 * @author nsh
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var pageRowCount = 500;
var srcTitle;	
var djchers_version;

 function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("eduUserListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("eduUserListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}


function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);

	var dtStart = app.lookup("DJCHERS_dtStart");
	var dtEnd = app.lookup("DJCHERS_dtEnd");
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	
	dtStart.value = now.format('YYYY-MM-DD');
	dtEnd.value = now.format('YYYY-MM-DD');

	/// 최상위 부서 가져오기
	setPageIndexer(0,1,pageRowCount, 10);
		
	comLib.showLoadMask("","사업장 정보가져오기","",0);
	var smsGetOfficeList = app.lookup("sms_getOfficeList");
	smsGetOfficeList.send();
}

function onSmsSubmitError(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}

function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}
//--------------------------------------------------------------------------------------------------<
//--------------------------------------------------------------------------------------------------> 사업장 (최상위 그룹)
function onSmsGetOfficeListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		//사업장 가져오기
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "사업장 리스트 가져오기 실패");
	}
	
	
}

function onDJCHERS_cmbOfficelistSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var dJCHERS_cmbOfficelist = e.control;
	if (dJCHERS_cmbOfficelist.getSelectionFirst().value == 0) { // 전체 사업장이다 별도 부서를 표기 하지않음
		return;
	}
	
	
	comLib.showLoadMask("","부서 정보 정보가져오기","",0);
	var smsGetPostList = app.lookup("sms_getPostList");
	//	/v1/djmch/postlist/{officeID}
	smsGetPostList.action = "/v1/djmch/postlist/" + dJCHERS_cmbOfficelist.getSelectionFirst().value; 
	smsGetPostList.send();
}



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getPostListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "부서 리스트 가져오기 실패");
	}

}

//------------------------------------------------------------------------------------------------------------------<

function onDJCHERS_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var dJCHERS_btnSearch = e.control;
	app.lookup("EduResultList").clear();
	var pageIndexer = app.lookup("eduUserListPageIndexer");
	pageIndexer.currentPageIndex = 1;
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "list");	
	sendGetEduCourseInquiryList();		
}
function sendGetEduCourseInquiryList() {
	var cmbPostlist = app.lookup("DJCHERS_cmbPostlist");
	var cmbOfficelist = app.lookup("DJCHERS_cmbOfficelist");
	var dtStart = app.lookup("DJCHERS_dtStart");
	var dtEnd = app.lookup("DJCHERS_dtEnd");
	
	
	var category = app.lookup("DJCHERS_cmbCategory").value;
	var keyword = app.lookup("DJCHERS_ipbKeyword").value;
	
	var smsGetEduResultList = app.lookup("sms_getEduResultList");
	
	console.log(dtStart.text);
	smsGetEduResultList.setParameters("StartAt", dtStart.text);
	smsGetEduResultList.setParameters("EndAt", dtEnd.text);
	smsGetEduResultList.setParameters("searchCategory", category);
	smsGetEduResultList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		smsGetEduResultList.setParameters("searchCategory", "");
	}
	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	if (dm_ExportParam.getValue("mode") == "list") {
		var curIndex = app.lookup("eduUserListPageIndexer").currentPageIndex;
		var offset = (curIndex - 1) * pageRowCount;
		smsGetEduResultList.setParameters("offset", offset);
		smsGetEduResultList.setParameters("limit", pageRowCount);
	} else {
		smsGetEduResultList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsGetEduResultList.setParameters("limit", pageRowCount);
	}
	
	smsGetEduResultList.setParameters("post", cmbPostlist.value);
	smsGetEduResultList.setParameters("office", cmbOfficelist.value);
	
	smsGetEduResultList.setParameters("limit", pageRowCount);
	smsGetEduResultList.send();	
	var dm_ExportParam = app.lookup("dm_ExportParam");
	if (dm_ExportParam.getValue("mode") == "list") {
		comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
	}
}

function onSms_getEduResultListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		app.lookup("DJCHERS_opbTotal").value = totalCount;
		var dsEduResultList = app.lookup("EduResultList");
		var dm_ExportParam = app.lookup("dm_ExportParam");
		if (dm_ExportParam.getValue("mode") == "list") {
			var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
			app.lookup("DJCHERS_opbTotal").value = totalCount;
			selectPaging(totalCount, viewPageCount);
			comLib.hideLoadMask();
		} else {
			
			var eduResultListExport = app.lookup("EduResultListExport");
			
			if (dsEduResultList.getRowCount() == 0) {
				comLib.hideLoadMask();
				if (eduResultListExport.getRowCount() > 0) {
					exportExcel();
					eduResultListExport.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			} else {
				
				for (var i = 0; i < dsEduResultList.getRowCount(); i++) {
					var row = eduResultListExport.pushRowData(dsEduResultList.getRowData(i));
					
				}
				
				if (eduResultListExport.getRowCount() >= dm_ExportParam.getValue("total")) {
					exportExcel();
					comLib.hideLoadMask();
					eduResultListExport.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset");
					offset += pageRowCount;
					dm_ExportParam.setValue("offset", offset)
					comLib.updateLoadMask(offset);
					sendGetEduCourseInquiryList();
				}
			}
		}
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), "수강결과 가져오기 실패");
	}
}



/*
 * "엑셀출력" 버튼(EduResultExcel)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onEduResultExcelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var eduResultExcel = e.control;
	
	//exportExcel();
	var totalLabel = app.lookup("DJCHERS_opbTotal");
	var dmTotal = app.lookup("Total")
	var dm_ExportParam = app.lookup("dm_ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));
	dm_ExportParam.setValue("offset", 0);
	if (totalLabel.value == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "조회된 수강기록이 없습니다.");
	} else {
		comLib.showLoadMask("pro", "수강기록 내보내기", "", parseInt(totalLabel.value) / 1000);
		sendGetEduCourseInquiryList();
		return;
	}
}


function exportExcel() {
	
	dataManager = getDataManager();
	

	var dsExportList = app.lookup("EduResultListExport");
	var total = dsExportList.getRowCount()
	
	var locale = dataManager.getLocale();
	var InputData;
			
	var stringified = JSON.stringify(dsExportList.getRowDataRanged());		
	stringified = stringified.replace(/"EduCode"/gi, '"'+"교육코드"+'"');
	stringified = stringified.replace(/"EduName"/gi, '"'+"교육명"+'"');
	stringified = stringified.replace(/"BgDateTime"/gi, '"'+"시작"+'"');
	stringified = stringified.replace(/"EdDateTime"/gi, '"'+"종료"+'"');
	stringified = stringified.replace(/"EduTime"/gi, '"'+"교육시간(분)"+'"');
	
	stringified = stringified.replace(/"EduContents"/gi, '"'+"교육내용"+'"');
	stringified = stringified.replace(/"EduType"/gi, '"'+"교육유형코드"+'"');
	stringified = stringified.replace(/"EduTypeName"/gi, '"'+"교육유형"+'"');
	stringified = stringified.replace(/"EduMethod"/gi, '"'+"교육방법코드"+'"');
	stringified = stringified.replace(/"EduMethodName"/gi, '"'+"교육방법"+'"');
	
	stringified = stringified.replace(/"EduLocation"/gi, '"'+"교육장소"+'"');
	stringified = stringified.replace(/"UniqueID"/gi, '"'+"유저아이디"+'"');
	stringified = stringified.replace(/"UniqueID2"/gi, '"'+"대체키"+'"');
	
	stringified = stringified.replace(/"OfficeCode"/gi, '"'+"사업장코드"+'"');
	stringified = stringified.replace(/"OfficeName"/gi, '"'+"사업장명"+'"');
	
	stringified = stringified.replace(/"PostCode"/gi, '"'+"부서코드"+'"');
	stringified = stringified.replace(/"PostName"/gi, '"'+"부서명"+'"');
	
	stringified = stringified.replace(/"StaffCode"/gi, '"'+"직급코드"+'"');
	stringified = stringified.replace(/"StaffName"/gi, '"'+"직급명"+'"');
	
	
	InputData = JSON.parse(stringified);
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "eduResultList_" + today + ".xlsx";
	var ws_name = "eduResultList_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(InputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}

