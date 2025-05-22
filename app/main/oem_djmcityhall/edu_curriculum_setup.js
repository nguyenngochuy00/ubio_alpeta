/************************************************
 * edu_curriculum_setup.js
 * Created at 2021. 4. 26. 오후 2:17:46.
 *
 * @author union
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var selectIDMap;
var djchedu_pageTerminalRowCount = 500;
var djchedu_pageEduRowCount = 50;
var _terminalListInit = false;
var djchedu_version;


function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("EduListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}
function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("EduListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = djchedu_pageEduRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function onBodyLoad(/* cpr.events.CEvent */ e){
	
	dataManager = getDataManager();
	comLib = createComUtil(app);
	djchedu_version = dataManager.getSystemVersion();
	selectIDMap = new Map();
		
	var DJCHEDU_dtStart = app.lookup("DJCHEDU_dtStart");
	var DJCHEDU_dtEnd = app.lookup("DJCHEDU_dtEnd");
		
	var DJCHEDU_dtSelectedStart = app.lookup("dti_start");
	var DJCHEDU_dtSelectedEnd = app.lookup("dti_end");
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	
	DJCHEDU_dtStart.value = now.format('YYYY-MM-DD');
	DJCHEDU_dtEnd.value = now.format('YYYY-MM-DD');

	DJCHEDU_dtSelectedStart.value = now.format('YYYY-MM-DD');
	DJCHEDU_dtSelectedEnd.value = now.format('YYYY-MM-DD');
		
	var udcRegistTerminalList = app.lookup("DJCHEDU_udcRegistTerminalList");	
	udcRegistTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);	
	
	var udcUnregistTerminalList = app.lookup("DJCHEDU_udcUnregistTerminalList");	
	udcUnregistTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
	
	var terminalList = app.lookup("DJCHEDU_udcUnregistTerminalList");
	terminalList.setPaging(0, 500, 3);
	setPageIndexer(0,1,djchedu_pageEduRowCount, 10);
	
	comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",djchedu_pageTerminalRowCount);
	sendTerminalListRequest();
}

function onSms_getSubmitError(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}

function onSms_getSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function sendTerminalListRequest() {
	var terminalList = app.lookup("DJCHEDU_udcUnregistTerminalList");	
	var curIndex = terminalList.getCurrentPageIndex();
	
	var pageRowCount = terminalList.getPageRowCount(); // 무조건 전체 단말기 요청하게 되어 있다.
	var offset = (curIndex - 1) * pageRowCount;
	
	// 검색 조건 세팅
	var smsGetTerminalList = app.lookup("sms_getTerminalList");
	// 페이징 계산하여 요청
	smsGetTerminalList.setParameters("offset", offset);
	smsGetTerminalList.setParameters("limit", pageRowCount);
	
	var fields = ["terminal_id","name"];
	smsGetTerminalList.setParameters("fields", fields);
	
	comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
	smsGetTerminalList.send();	
} 

function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getTerminalList = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		_terminalListInit = true;
		var dsTerminalList = app.lookup("TerminalList");
			
		var terminalList = app.lookup("DJCHEDU_udcUnregistTerminalList");
		terminalList.setTerminalList(dsTerminalList);
		terminalList.refreshTerminalList(selectIDMap);
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));		
		terminalList.setTotalCount(totalCount);
		
		
		comLib.showLoadMask("","교육 타입정보 가져오기","",0);
		var smsGetEduTypeList = app.lookup("sms_getEduTypeList");	
		smsGetEduTypeList.send();	
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "단말기 리스트 가져오기 실패!");
	}	
	
}

function onSmsGetEduTypeListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetEduTypeList = e.control;
	comLib.hideLoadMask();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var cmb_edu_type = app.lookup("cmb_edu_type");
		cmb_edu_type.deleteAllItems();
		
		var EduTypeList = app.lookup("EduTypeList");
		console.log("EduTypeList.getRowCount() :" + EduTypeList.getRowCount());
		
		for (var ii=0;ii<EduTypeList.getRowCount();ii++) {
			var row = EduTypeList.getRow(ii);
			cmb_edu_type.addItem(new cpr.controls.Item(row.getValue("Name"), row.getValue("Code")));
		}
		
		cmb_edu_type.selectItem(0);
		
		comLib.showLoadMask("","교육 방식정보 가져오기","",0);
		var smsGetEduMethodList = app.lookup("sms_getEduMethodList");	
		smsGetEduMethodList.send();	
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "교육 타입 가져오기");
	}
}

function onSmsGetEduMethodListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetEduMethodList = e.control;
	comLib.hideLoadMask();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var cmb_edu_method = app.lookup("cmb_edu_method");
		cmb_edu_method.deleteAllItems();
		
		var EduMethodList = app.lookup("EduMethodList");
		for (var ii=0;ii<EduMethodList.getRowCount();ii++) {
			var row = EduMethodList.getRow(ii);
			cmb_edu_method.addItem(new cpr.controls.Item(row.getValue("Name"), row.getValue("Code")));
		}
		
		cmb_edu_method.selectItem(0);
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "교육 타입 가져오기");
	}
	
}

//----------------------------------------------------------------------------------------------> 기본정보가져오기
/*
 * "<" 버튼(DJCHEDU_btnTerminalUnregist)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDJCHEDU_btnTerminalUnregistClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dJCHEDU_btnTerminalUnregist = e.control;
	var dsRegistTerminalList = app.lookup("TerminalInfo");
	
	var udcRegistTerminalList = app.lookup("DJCHEDU_udcRegistTerminalList");
	var checkedIndices = udcRegistTerminalList.getCheckedRowIndices();
	
	var idList = [];
	checkedIndices.forEach(function(index){
		var row = udcRegistTerminalList.getRow(index);		
		var terminalID = row.getValue("ID");
			
		selectIDMap.delete(terminalID);
		idList.push(terminalID);
	});
		
	idList.forEach(function(terminalID){						
		var delRow = dsRegistTerminalList.findFirstRow("ID == "+terminalID)
		dsRegistTerminalList.realDeleteRow(delRow.getIndex());
	});
			
	var selectTotal = dsRegistTerminalList.getRowCount();
	
	udcRegistTerminalList.setTotalCount(selectTotal);		
	udcRegistTerminalList.setPaging(selectTotal, djchedu_pageTerminalRowCount, 3);
	var readCount = (djchedu_pageTerminalRowCount-1>selectTotal)?selectTotal-1:djchedu_pageTerminalRowCount-1;	
	
	var pageidx = udcRegistTerminalList.getCurrentPageIndex();
	var start = (pageidx-1)*djchedu_pageTerminalRowCount;
	var end = pageidx*djchedu_pageTerminalRowCount-1;
	if ( end >= dsRegistTerminalList.getRowCount() ){
		end = dsRegistTerminalList.getRowCount()-1;
	}
	
	udcRegistTerminalList.setTerminalListRows(dsRegistTerminalList.getRowDataRanged(start, end));
	
	var udcUnRegistTerminalList = app.lookup("DJCHEDU_udcUnregistTerminalList");
	udcUnRegistTerminalList.refreshTerminalList(selectIDMap);	
}


/*
 * ">>" 버튼(DJCHEDU_btnTerminalRegistAll)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDJCHEDU_btnTerminalRegistAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dJCHEDU_btnTerminalRegistAll = e.control;
	var udcUnRegisteredTerminalList = app.lookup("DJCHEDU_udcUnregistTerminalList");
	var dsUnRegisteredTerminalList = app.lookup("TerminalList");
	
	var udcRegisteredTerminal = app.lookup("DJCHEDU_udcRegistTerminalList");	
	var dsRegisteredTerminalList = app.lookup("TerminalInfo");
		
	var total = dsUnRegisteredTerminalList.getRowCount();
	for( var index = 0; index < total; index++ ){
		var row = dsUnRegisteredTerminalList.getRow(index);
		var terminalID = row.getValue("ID");
		
		if( selectIDMap.get(terminalID) == undefined ){				
			dsRegisteredTerminalList.addRowData(row.getRowData());
			
			selectIDMap.set(terminalID,1);
			dsUnRegisteredTerminalList.deleteRow(row.getIndex())
		}
	}
		
	udcUnRegisteredTerminalList.setUnCheckAll();
	dsRegisteredTerminalList.setSort("TerminalID");
		
	var registTotal = dsRegisteredTerminalList.getRowCount();	
	udcRegisteredTerminal.setTotalCount(registTotal);
		
	udcRegisteredTerminal.setPaging(registTotal, djchedu_pageTerminalRowCount, 3);
		
	var pageidx = udcRegisteredTerminal.getCurrentPageIndex();
	
	var start = (pageidx-1)*djchedu_pageTerminalRowCount;
	var end = pageidx*djchedu_pageTerminalRowCount-1;
	if ( end >= dsRegisteredTerminalList.getRowCount() ){
		end = dsRegisteredTerminalList.getRowCount()-1;		
	}
	
	udcRegisteredTerminal.setTerminalListRows(dsRegisteredTerminalList.getRowDataRanged(start, end));	
	udcUnRegisteredTerminalList.refreshTerminalList(selectIDMap);

	
}

/*
 * "<<" 버튼(DJCHEDU_btnTerminalUnregistAll)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDJCHEDU_btnTerminalUnregistAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dJCHEDU_btnTerminalUnregistAll = e.control;
	
	var dsRegistTerminalList = app.lookup("TerminalInfo");	
	var udcRegistTerminalList = app.lookup("DJCHEDU_udcRegistTerminalList");
	
	dsRegistTerminalList.clear();
	selectIDMap.clear();
	udcRegistTerminalList.setTotalCount(0);
	udcRegistTerminalList.setTerminalList(dsRegistTerminalList);

	var udcUnRegistTerminalList = app.lookup("DJCHEDU_udcUnregistTerminalList");
	udcUnRegistTerminalList.refreshTerminalList(selectIDMap);	
	
}

//--------------------------------------------------------------------------------------------------------< 단말기 선택

function onDJCHEDU_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var dJCHEDU_btnSearch = e.control;
	var pageIndexer = app.lookup("EduListPageIndexer");
	pageIndexer.currentPageIndex = 1;	
	SendGetEduCourseList();		
}

function SendGetEduCourseList(){
	var eduCurseList = app.lookup("EduCourseList");
	eduCurseList.clear();
	var curIndex = app.lookup("EduListPageIndexer").currentPageIndex;
	var offset = (curIndex - 1) * djchedu_pageEduRowCount;
	var dtiRecordStart = app.lookup("DJCHEDU_dtStart");
	var dtiRecordEnd = app.lookup("DJCHEDU_dtEnd");
	var category = app.lookup("DJCHEDU_cmbCategory").value;
	var keyword = app.lookup("DJCHEDU_ipbKeyword").value;
	
	var sms_getEduCourseList = app.lookup("sms_getEduCourseList");
	
	sms_getEduCourseList.setParameters("StartAt", dtiRecordStart.text);
	sms_getEduCourseList.setParameters("EndAt", dtiRecordEnd.text);
		
	sms_getEduCourseList.setParameters("offset", offset);
	sms_getEduCourseList.setParameters("limit", djchedu_pageEduRowCount);
	
	sms_getEduCourseList.setParameters("searchCategory", category);
	sms_getEduCourseList.setParameters("searchKeyword", keyword);
	if (keyword == null || keyword.length == 0) {
		sms_getEduCourseList.setParameters("searchCategory", "");
	}
	
	comLib.showLoadMask("",dataManager.getString("Str_ListLoading"),"",0);
	sms_getEduCourseList.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getEduCourseListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getEduCourseList = e.control;
	comLib.hideLoadMask();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var totalCount = app.lookup("Total").getValue("Count");
		var viewPageCount = totalCount / djchedu_pageEduRowCount + (totalCount % djchedu_pageEduRowCount > 0);
		app.lookup("DJCHEDU_optTotal").value = totalCount;
		selectPaging(totalCount, viewPageCount);
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "교육 리스트 가져오기 실패");
	}
	
}


/*
 * "단말기사용자관리" 버튼(btnTerminalUser)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnTerminalUserClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnTerminalUser = e.control;
	var grdEduList = app.lookup("grdEduList");
	var row = grdEduList.getSelectedRow();
	if(null == row)
	{
		dialogAlert(app, dataManager.getString("Str_Failed"), "선택된 교육이 없습니다.");
		return;
	}
		
		
	var Status = row.getValue("eduStatus");
	if(Status != 0) {
		dialogAlert(app, dataManager.getString("Str_Failed"), "이미 수강처리된 교육입니다");
		return;
	}
	var termials = row.getValue("eduTerminals");
	var option = {
		width : 1000,
		height : 600
		//right: app.getContainer().getActualRect().left/4
	};
	
	var appld = "app/main/terminals/terminalUserEx" + "?" + djchedu_version;
	app.getRootAppInstance().openDialog(appld, option, function(dialog){
		
		dialog.bind("headerTitle").toLanguage("Str_AddEnterTerminal");
		//등록된 단말기만 
		dialog.initValue = {"initType": "eduTerminals","termials": termials};
			
		dialog.modal = true;
	
		dialog.addEventListenerOnce("close", function(e){
			var result = dialog.returnValue;
			if(result){
				
			}
		});
	});				
	
}


/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onGrdEduListCellClick(/* cpr.events.CGridMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grdEduList = e.control;
	
	var row = grdEduList.getSelectedRow();
	
	var dti_start = app.lookup("dti_start");
	var dti_end = app.lookup("dti_end");
		
	var ipb_edu_code = app.lookup("ipb_edu_code");
	var ipb_edu_name = app.lookup("ipb_edu_name");
	var ipb_edu_contents = app.lookup("ipb_edu_contents");
	var ipb_edu_location = app.lookup("ipb_edu_location");
	var cmb_edu_type = app.lookup("cmb_edu_type");
	var cmb_edu_method = app.lookup("cmb_edu_method");
	//var ipb_edu_terminals = app.lookup("ipb_edu_terminals");

	var EduCourseList = app.lookup("EduCourseList");
	var idx = row.getIndex();
	ipb_edu_code.text = EduCourseList.getRow(idx).getValue("eduCode");
	ipb_edu_name.text = EduCourseList.getRow(idx).getValue("eduName");
	ipb_edu_contents.text = EduCourseList.getRow(idx).getValue("eduContents");
	ipb_edu_location.text = EduCourseList.getRow(idx).getValue("eduLocation");
	cmb_edu_type.value = EduCourseList.getRow(idx).getValue("eduType");
	cmb_edu_method.value = EduCourseList.getRow(idx).getValue("eduMethod");
	
	dti_start.value = EduCourseList.getRow(idx).getValue("eduStartDate");
	dti_end.value = EduCourseList.getRow(idx).getValue("eduEndDate");
	
	var eduTerminals = "";
	var eduTerminals = EduCourseList.getRow(idx).getValue("eduTerminals");
	var eduTermArray = eduTerminals.split(',');
	
	var udcRegistTerminalList = app.lookup("DJCHEDU_udcRegistTerminalList");
	//udcRegistTerminalList.clearTerminalList();
	
	var udcUnRegistTerminalList = app.lookup("DJCHEDU_udcUnregistTerminalList");
	//udcUnRegistTerminalList.clearTerminalList();
	
	selectIDMap.clear();
	var dsTerminalInfo = app.lookup("TerminalInfo");
	
	dsTerminalInfo.clear();
	
	if(eduTermArray.length == 0)
		return;
	
	for(var kk=0;kk<eduTermArray.length;kk++) {
		
		console.log("eduTermArray[kk]: " + eduTermArray[kk]);
		
		var termStringID = eduTermArray[kk];
		termStringID = termStringID.trim();
		if (termStringID == "")
			continue;
		var inputID = parseInt(termStringID,10);
		console.log("inputID: " + inputID);
	
		var rowKK = dsTerminalInfo.addRow();
		rowKK.setValue("ID", inputID);
		var name = findTerminalName(inputID);
		rowKK.setValue("Name", name);
	}
	
	var terminalCnt = dsTerminalInfo.getRowCount();
		
	for( var i=0; i < terminalCnt; i++ ){
	
		var row = dsTerminalInfo.getRow(i);
		if( row ){
			selectIDMap.set(row.getValue("ID"),1);
		}
	}	
			
	udcRegistTerminalList.setTerminalList(dsTerminalInfo);
		
	udcUnRegistTerminalList.refreshTerminalList(selectIDMap);		
}


function findTerminalName(inputID) {
	
	var TerminalList = app.lookup("TerminalList");
	for( var i=0; i < TerminalList.getRowCount(); i++ ){
	
		var row = TerminalList.getRow(i);
		if( row ){
			if (row.getValue("ID") == inputID) {
				
				return row.getValue("Name");
			}
		}
	}	
	
	return "";
}


function exportExcel() {
	
	dataManager = getDataManager();
	

	var dsExportList = app.lookup("EduCourseListExport");
	
	var EduCourseList = app.lookup("EduCourseList");
	
	for (var i = 0; i < EduCourseList.getRowCount(); i++) {
		var row = dsExportList.pushRowData(EduCourseList.getRowData(i));
		//row.setValue("Func", getFuncValue(row.getValue("Func")));
	}
	
	
	var total = dsExportList.getRowCount()
	for (var i = 0; i < total; i++) {
		var eduCourse = dsExportList.getRow(i);
		
		var eduCode = eduCourse.getValue("eduCode");
		eduCourse.setValue("eduCode", eduCode);
		
		var eduName = eduCourse.getValue("eduName");
		eduCourse.setValue("eduName", eduName);
		
		var eduContents = eduCourse.getValue("eduContents");
		eduCourse.setValue("eduContents", eduContents);		
		
	}
	var locale = dataManager.getLocale();
	var InputData;
			
	var stringified = JSON.stringify(dsExportList.getRowDataRanged());		
	stringified = stringified.replace(/"eduCode"/gi, '"'+"교육코드"+'"');
	stringified = stringified.replace(/"eduName"/gi, '"'+"교육명"+'"');
	stringified = stringified.replace(/"eduContents"/gi, '"'+"교육내용"+'"');
	stringified = stringified.replace(/"eduType"/gi, '"'+"교육유형"+'"');
	stringified = stringified.replace(/"eduMethod"/gi, '"'+"교육방법"+'"');
	stringified = stringified.replace(/"eduLocation"/gi, '"'+"교육장소"+'"');
	
	InputData = JSON.parse(stringified);
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "eduCourseList_" + today + ".xlsx";
	var ws_name = "eduCourseLis_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(InputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}


/*
 * "엑셀" 버튼(btnExcel)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnExcelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnExcel = e.control;
	exportExcel();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsDeleteEduCourseSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsDeleteEduCourse = e.control;
	
}


/*
 * "등록" 버튼(DJCHEDU_Regist)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDJCHEDU_RegistClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dJCHEDU_Regist = e.control;

	var option = {
		width : 500,
		height : 500,
		right: app.getContainer().getActualRect().left/4
	};

	var appld = "app/main/oem_djmcityhall/edu_course_regi" + "?" + djchedu_version;
	app.openDialog(appld, option, function(dialog){
		dialog.headerTitle = "교육 등록";
		dialog.modal = true;
	
		dialog.addEventListenerOnce("close", function(e){
			var result = dialog.returnValue;
			if(result){
				var pageIndexer = app.lookup("EduListPageIndexer");
				pageIndexer.currentPageIndex = 1;	
				SendGetEduCourseList();				
			}
		});
	});	
}


/*
 * "수정" 버튼(DJCHEDU_Modify)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDJCHEDU_ModifyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dJCHEDU_Modify = e.control;
	var grdEduList = app.lookup("grdEduList");
	var row = grdEduList.getSelectedRow();
	if(row == null) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "선택된 교육 정보가 없습니다.");
		return;
	}
			
	
	var Status = row.getValue("eduStatus");
	if(Status != 0) {
		dialogAlert(app, dataManager.getString("Str_Failed"), "이미 수강처리된 교육입니다");
		return;
	}
	var strTerminals = "";
	var ii = 0;
	
	selectIDMap.forEach(function(value,key){
		var intTerminalID = 0;	
      	intTerminalID = key;
		//console.log("intTerminalID: " + intTerminalID);
		strTerminals += String(intTerminalID);
		
		ii++;
		
		if (ii != selectIDMap.size)
			strTerminals += ',';
	});	
	
	//console.log("strTerminals: " + strTerminals);
	
	var ipb_edu_code = app.lookup("ipb_edu_code");
	var ipb_edu_name = app.lookup("ipb_edu_name");
	var ipb_edu_contents = app.lookup("ipb_edu_contents");
	var ipb_edu_location = app.lookup("ipb_edu_location");
	var cmb_edu_type = app.lookup("cmb_edu_type");
	var cmb_edu_method = app.lookup("cmb_edu_method");	
	var dti_edu_start = app.lookup("dti_start");
	var dti_edu_end = app.lookup("dti_end");
	
	var EduCourse = app.lookup("EduCourse");
	
	
	var txtEduCode = row.getValue("eduCode");
	if ( confirm("교육코드  " + txtEduCode + "을 수정하시겠습니까?") == false ) {
		return;
	}	
	
	EduCourse.clear();
	EduCourse.setValue("Code", ipb_edu_code.text);
	EduCourse.setValue("Name", ipb_edu_name.text);
	EduCourse.setValue("Contents", ipb_edu_contents.text);
	EduCourse.setValue("Type", cmb_edu_type.value);
	EduCourse.setValue("Method", cmb_edu_method.value);
	EduCourse.setValue("Location", ipb_edu_location.text);
	EduCourse.setValue("StartDate", dti_edu_start.text);
	EduCourse.setValue("EndDate", dti_edu_end.text);
	EduCourse.setValue("Terminals", strTerminals);
	EduCourse.setValue("Status", Status);
	
	var smsPutEduCourse = app.lookup("sms_putEduCourse");
	smsPutEduCourse.action = "/v1/djmch/edu_course/" + ipb_edu_code.text;
	smsPutEduCourse.send();
	
}

function onSms_putEduCourseSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		//dialogAlert(app, dataManager.getString("Str_Success"), "수정완료");
		var pageIndexer = app.lookup("EduListPageIndexer");
		pageIndexer.currentPageIndex = 1;	
		SendGetEduCourseList();	
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "단말기 리스트 가져오기 실패!");
	}	
	
}


/*
 * "삭제" 버튼(DJCHEDU_btnDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDJCHEDU_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dJCHEDU_btnDelete = e.control;
	var grdEduList = app.lookup("grdEduList");
	var row = grdEduList.getSelectedRow();
	if(null == row)
	{
		dialogAlert(app, dataManager.getString("Str_Failed"), "선택된 교육이 없습니다.");
		return;
	}
		
		
	var Status = row.getValue("eduStatus");
	if(Status != 0) {
		dialogAlert(app, dataManager.getString("Str_Failed"), "이미 수강처리된 교육입니다");
		return;
	}	
	
	var EduCourse = app.lookup("EduCourse");
	
	var txtEduCode = row.getValue("eduCode");
	if ( confirm("교육코드  " + txtEduCode + "을 삭제하시겠습니까?") == false ) {
		return;
	}
	
	var smsDeleteEduCourse = app.lookup("sms_deleteEduCourse");	
	comLib.showLoadMask("","교육정보 삭제 요청","",0);
	smsDeleteEduCourse.action = "/v1/djmch/edu_course/" + txtEduCode;
	smsDeleteEduCourse.send();
}


/*
 * "수강처리" 버튼(DJCHEDU_Processing)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDJCHEDU_ProcessingClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dJCHEDU_Processing = e.control;
	var grdEduList = app.lookup("grdEduList");
	var row = grdEduList.getSelectedRow();
	if(null == row)
	{
		dialogAlert(app, dataManager.getString("Str_Failed"), "선택된 교육이 없습니다.");
		return;
	}
		
		
	var Status = row.getValue("eduStatus");
	if(Status != 0) {
		dialogAlert(app, dataManager.getString("Str_Failed"), "이미 수강처리된 교육입니다");
		return;
	}	
	
//	var EduCourse = app.lookup("EduCourse");
	comLib.showLoadMask("","수강 처리를 진행 요청 중입니다...","",0);
	var txtEduCode = row.getValue("eduCode");
	if ( confirm("교육코드  " + txtEduCode + "을 수강처리하시겠습니까?") == false ) {
		return;
	}

		
	
/*	EduCourse.clear();
	EduCourse.setValue("Code", row.getValue("eduCode"));
	EduCourse.setValue("Name", row.getValue("eduName"));
	EduCourse.setValue("Contents", row.getValue("eduContents"));
	EduCourse.setValue("Type", row.getValue("eduType"));
	EduCourse.setValue("Method", row.getValue("eduMethod"));
	EduCourse.setValue("Location", row.getValue("eduLocation"));
	EduCourse.setValue("StartDate", row.getValue("eduStartDate"));
	EduCourse.setValue("EndDate", row.getValue("eduEndDate"));
	EduCourse.setValue("Terminals", row.getValue("eduTerminals"));
	EduCourse.setValue("Status", 1);*/
	
	var smsPutEduProcessing = app.lookup("sms_putEduProcessing");
	smsPutEduProcessing.action = "/v1/djmch/edu_course/processing/" + row.getValue("eduCode");
	smsPutEduProcessing.send();	
}




/*
 * ">" 버튼(DJCHEDU_btnTerminalRegist)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDJCHEDU_btnTerminalRegistClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dJCHEDU_btnTerminalRegist = e.control;
	var udcUnRegisteredTerminalList = app.lookup("DJCHEDU_udcUnregistTerminalList");
	var indices = udcUnRegisteredTerminalList.getCheckedRowIndices();	
	if( indices.length == 0){
		return;
	}
	
	var udcRegisteredTerminal = app.lookup("DJCHEDU_udcRegistTerminalList");	
	var dsRegisteredTerminalList = app.lookup("TerminalInfo");
		
	var dsUnRegisteredTerminalList = app.lookup("TerminalList");
	
	indices.forEach(function(index){		
		var row = dsUnRegisteredTerminalList.getRow(index);		
		var terminalID = row.getValue("ID");
				
		if( selectIDMap.get(terminalID) == undefined ){				
			dsRegisteredTerminalList.addRowData(row.getRowData());
			
			selectIDMap.set(terminalID,1);
			dsUnRegisteredTerminalList.deleteRow(row.getIndex())
		}
	});
	udcUnRegisteredTerminalList.setUnCheckAll();
	dsRegisteredTerminalList.setSort("ID");
		
	var registTotal = dsRegisteredTerminalList.getRowCount();	
	udcRegisteredTerminal.setTotalCount(registTotal);
		
	udcRegisteredTerminal.setPaging(registTotal, djchedu_pageTerminalRowCount, 3);
		
	var pageidx = udcRegisteredTerminal.getCurrentPageIndex();
	
	var start = (pageidx-1)*djchedu_pageTerminalRowCount;
	var end = pageidx*djchedu_pageTerminalRowCount-1;
	if ( end >= dsRegisteredTerminalList.getRowCount() ){
		end = dsRegisteredTerminalList.getRowCount()-1;		
	}
	
	udcRegisteredTerminal.setTerminalListRows(dsRegisteredTerminalList.getRowDataRanged(start, end));	
	udcUnRegisteredTerminalList.refreshTerminalList(selectIDMap);	
}


//-------------------------------------------------------------------------------------------------> 신규기능
/*
 * "교육유형" 버튼(DJCHEDU_btnEduType)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDJCHEDU_btnEduTypeClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dJCHEDU_btnEduType = e.control;
	var appld = "app/main/oem_djmcityhall/djmchEduTypeRegist" + "?" + djchedu_version;
	app.openDialog(appld, {width : 300, height : 150}, function(dialog){
		dialog.headerTitle = "교육 유형 등록";
		dialog.modal = true;
	}).then(function(returnValue){

		var result = returnValue["Result"];
		if( result == 0 ){
			//"Result":0,"eduTypeInfo":EduTypeInfo.getDatas()})
			var EduTypeInfo = returnValue["eduTypeInfo"];
			var dmEduTypeInfo = app.lookup("eduTypeInfo");
			dmEduTypeInfo.setValue("code", EduTypeInfo.code);
			dmEduTypeInfo.setValue("name", EduTypeInfo.name);
			// 교육 유형 등록 
			comLib.showLoadMask("","교육 타입정보 등록 요청","",0);
			var smsPostEduTypeInfo = app.lookup("sms_postEduTypeInfo");
			smsPostEduTypeInfo.send();
		}
	});
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postEduTypeInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postEduTypeInfo = e.control;
	comLib.hideLoadMask();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.lookup("EduTypeList").clear();
		comLib.showLoadMask("","교육 타입정보 가져오기","",0);
		var smsGetEduTypeList = app.lookup("sms_getEduTypeList");
		smsGetEduTypeList.send();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "교육 리스트 가져오기 실패");
	}
	
}

function onSms_deleteEduCourseSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		var pageIndexer = app.lookup("EduListPageIndexer");
		pageIndexer.currentPageIndex = 1;	
		SendGetEduCourseList();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "교육 수강 정보 삭제 실패");
	}
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onEduListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var eduListPageIndexer = e.control;
	SendGetEduCourseList();		
}

function onSms_putEduProcessingSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		var pageIndexer = app.lookup("EduListPageIndexer");
		pageIndexer.currentPageIndex = 1;	
		SendGetEduCourseList();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "교육 수강 처리요청이 실패했습니다.");
	}
}
