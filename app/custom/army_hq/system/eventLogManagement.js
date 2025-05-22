/************************************************
 * eventLogManagement.js
 * Created at 2022. 11. 24.
 *
 * @author
 ************************************************/

var pageRowCount = 50;
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var oem_version;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var dtStart = app.lookup("SLMGR_dtStart");
	var dtEnd = app.lookup("SLMGR_dtEnd");
	
//	dtStart.value = '2018-09-01';
//	dtEnd.value = '2018-10-01';
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	
	var before = now.add(-30, 'days');
	dtStart.value = before.format('YYYY-MM-DD');
	
	var udcEventLogList = app.lookup("AMHQ_udcEventLogList");
	udcEventLogList.setPaging(0, 1, 10, pageRowCount);
	
	oem_version = dataManager.getOemVersion();
	
	var cmbCategory = app.lookup("ALMGR_cmbCategory");	
		cmbCategory.addItem(new cpr.controls.Item("----","all"));
	//cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_UserID"),"user_id"));
	cmbCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_TerminalLocation"),"terminal_name"));
	cmbCategory.selectItemByValue("all");
	sendEventLogListRequest();
}

// 검색 버튼 클릭
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	var udcEventLogList = app.lookup("AMHQ_udcEventLogList");
	udcEventLogList.setCurrentPageIndex(1);
	
	var dsEventLogList = app.lookup("EventLogList");
	dsEventLogList.clear();
	var udcEventLogList = app.lookup("AMHQ_udcEventLogList");
	udcEventLogList.setEventLogList(dsEventLogList);
	sendEventLogListRequest();	
}

function sendEventLogListRequest() {
	var dtStart = app.lookup("SLMGR_dtStart");
	var dtEnd = app.lookup("SLMGR_dtEnd");
	
	
	if(dateLib.minusDates(dtStart.value.replace(/-/gi,""),dtEnd.value.replace(/-/gi,"")) >= 31){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ThirtyDayOverError"));
		return;
	}
	
	var udcEventLogList = app.lookup("AMHQ_udcEventLogList");
	var curIndex = udcEventLogList.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount;
	
	var smsGetAuthLogList = app.lookup("sms_getEventLogList");
	
	
	var cmbCategory = app.lookup("ALMGR_cmbCategory");
	var edtKeyword = app.lookup("SLMGR_edtKeyword");

	smsGetAuthLogList.setParameters("startTime", dtStart.value + " 00:00:00");
	smsGetAuthLogList.setParameters("endTime", dtEnd.value + " 23:59:59");
	smsGetAuthLogList.setParameters("offset", offset);
	smsGetAuthLogList.setParameters("limit", pageRowCount);

	if(cmbCategory.value == "terminal_name"){
		var bFound = false;
		for(var i=0; i<dataManager.getTerminalList().getRowCount();i++){
			
			var row = dataManager.getTerminalList().getRow(i);
			if(row.getValue("Name") == edtKeyword.value){
				smsGetAuthLogList.setParameters("searchCategory", "terminal_id");
				smsGetAuthLogList.setParameters("searchKeyword", row.getValue("ID"));
				bFound = true;
							break;
			}
		}
		if( bFound == false ){
			return;
		}
	}else if(cmbCategory.value != null && cmbCategory.value.length > 0) {
		smsGetAuthLogList.setParameters("searchCategory", cmbCategory.value);
		
		if (edtKeyword.value != null && edtKeyword.value.length > 0) {
			smsGetAuthLogList.setParameters("searchKeyword", edtKeyword.value);
		}
	}
	
	var dsEventLogList = app.lookup("EventLogList");
	dsEventLogList.clear();
	udcEventLogList.setEventLogList(dsEventLogList);	
	udcEventLogList.setPaging(0, pageRowCount, 0);
	
	smsGetAuthLogList.send();
//	comLib.showLoadMask("", dataManager.getString("Str_TaskStateRunning"), "");
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getEventlogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
		/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getEventLogList = e.control;
	comLib.hideLoadMask();

	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){

		var dsEventLogList = app.lookup("EventLogList");
		
		var dmTerminalInfo = app.lookup("TerminalInfo");
		
		var i;
		for (i = 0; i < dsEventLogList.getRowCount(); i++) {
			//dmTerminalInfo.clear();
			var terminalID = dsEventLogList.getValue(i, "TerminalID");
            dmTerminalInfo = dataManager.getTerminal(terminalID);
			if(dmTerminalInfo){
				var terminalLocation = dmTerminalInfo.getValue("Name");
				dsEventLogList.setValue(i, "TerminalLocation", terminalLocation);
			} else {
				dsEventLogList.setValue(i, "TerminalLocation", "");
			}
		}
		
		
		var dmTotal = app.lookup("Total");
		
		var totalCount = parseInt(dmTotal.getValue("Count"));
		var totalLabel = app.lookup("SLMGR_optTotal");
		totalLabel.value = totalCount;
		
		
		var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
		
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		var udcEventLogList = app.lookup("AMHQ_udcEventLogList");
		udcEventLogList.setEventLogList(dsEventLogList);	
		udcEventLogList.setPaging(totalCount, pageRowCount, viewPageCount);
		
		app.lookup("SLMGR_grp").redraw();

	} else {
		//dialogAlertAMHQ(app, "Waning", dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Import")+" "+dataManager.getString("Str_Failed")+"."+dataManager.getString(getErrorString(resultCode)));
	}

}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onSLMGR_udcAuthLogListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.EventLogList
	 */
	var sLMGR_udcAuthLogList = e.control;
	sendEventLogListRequest();
}
