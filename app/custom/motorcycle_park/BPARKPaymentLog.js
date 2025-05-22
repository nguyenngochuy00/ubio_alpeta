/************************************************
 * BPARKPaymentLog.js
 * Created at 2018. 12. 26. 오후 6:01:05.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var util = cpr.core.Module.require("lib/util");
var pageRowCount = 20;
var comLib;
var ALEMP_pageRowCount = 1000; // 사용안함
var ALMGR_recvRowPerExport  = 2000;
var oem_version;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	comLib =  createComUtil(app);
	dataManager = getDataManager();
	
	var dtStart = app.lookup("ALMGR_dtStart");
	var dtEnd = app.lookup("ALMGR_dtEnd");
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	dtStart.value = now.format('YYYY-MM-DD');
	
	SetMaxDate();
	
	var groupList = dataManager.getGroup();	
	var cmbGroup = app.lookup("ALMGR_cmbGroup");	
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",
	});
	
	var dm_ExportParam = app.lookup("dm_ExportParam")
	dm_ExportParam.setValue("mode", "list");
	
	// 인증로그 레이아웃: 커스텀 버전에 따라 udc 생성하여 addChild
//	var customLyout = app.lookup("authLogListLayout");
//	var udcPaymentLogList;
//	udcPaymentLogList = new udc.grid.PaymentLogListMotorcyclePark("ALMGR_udcAuthLogList");
//	

	var udcPaymentLogList = app.lookup("authLogListLayout");
	udcPaymentLogList.addEventListener("pagechange", onALMGR_udcAuthLogListPagechange )
		udcPaymentLogList.addEventListener("dblclick", onALMGR_udcAuthLogListDblclick )
		//customLyout.addChild(udcPaymentLogList,  {	"colIndex": 0, "rowIndex": 0	});
	
	udcPaymentLogList.redraw();
	//sendPaymentLogListRequest();
}

function SetMaxDate() {
	var date = new Date();
    date.setFullYear(date.getFullYear());// y년을 더함
    date.setMonth(date.getMonth());// m월을 더함
    date.setDate(date.getDate());// d일을 더함
    
	app.lookup("ALMGR_dtStart").maxDate = date;
	app.lookup("ALMGR_dtEnd").maxDate = date;	
}

// Payment 로그 검색 버튼 클릭시
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	var startTime = app.lookup("ALMGR_dtStart").value;
	var endTime = app.lookup("ALMGR_dtEnd").value;
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}
	var dm_ExportParam = app.lookup("dm_ExportParam")
	dm_ExportParam.setValue("mode", "list");
	
	var dsPaymentLogList = app.lookup("PaymentLogList");
	dsPaymentLogList.clear();
	var udcPaymentLogList = app.lookup("authLogListLayout");
	//udcPaymentLogList.setAuthLogList(dsPaymentLogList);
	udcPaymentLogList.setpaymentLogList(dsPaymentLogList)

	var udcAuthLogList = app.lookup("authLogListLayout");
	udcAuthLogList.setCurrentPageIndex(1);
	sendPaymentLogListRequest();	
}

function sendPaymentLogListRequest() {
	var dtStart = app.lookup("ALMGR_dtStart");
	var dtEnd = app.lookup("ALMGR_dtEnd");

	var udcPaymentLogList = app.lookup("authLogListLayout");
	var curIndex = udcPaymentLogList.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount;
	
	var smsGetAuthLogList = app.lookup("sms_getPaymentLogList");
	var edtKeyword = app.lookup("ALMGR_edtKeyword");
	
	smsGetAuthLogList.setParameters("startTime", dtStart.value + " 00:00:00");
	smsGetAuthLogList.setParameters("endTime", dtEnd.value + " 23:59:59");
	smsGetAuthLogList.setParameters("offset", offset);
	smsGetAuthLogList.setParameters("limit", pageRowCount);
	
	var cmbGroup = app.lookup("ALMGR_cmbGroup");
	if( cmbGroup.value != null && cmbGroup.value != null){
		smsGetAuthLogList.setParameters("groupID", cmbGroup.value);
	}
	
	//2019-11-29 새로 추가한 소스
	var dm_ExportParam = app.lookup("dm_ExportParam")	
	if( dm_ExportParam.getValue("mode")=="export"){
		smsGetAuthLogList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsGetAuthLogList.setParameters("limit", ALMGR_recvRowPerExport);
	}
	//2019-11-29 추가 끝
	
	var dsPaymentLogList = app.lookup("PaymentLogList");
	dsPaymentLogList.clear();
	var udcAuthLogList = app.lookup("authLogListLayout");
	udcAuthLogList.setpaymentLogList(dsPaymentLogList);	
	udcAuthLogList.setPaging(0, pageRowCount, 0);
	
	smsGetAuthLogList.send();
	var dm_ExportParam = app.lookup("dm_ExportParam")		
	if( dm_ExportParam.getValue("mode")=="list"){
		comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
	}
}

function pad(n, width)
{
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function onALMGR_udcAuthLogListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.authLogList
	 */
	var aLMGR_udcAuthLogList = e.control;
	sendPaymentLogListRequest();	
}


/*
 * 인풋 박스에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onALMGR_edtKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var aLMGR_edtKeyword = e.control;
	
	if(e.keyCode == 13) {
		sendPaymentLogListRequest();		
	}
}


/*
 * 콤보 박스에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onALMGR_cmbCategoryMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var aLMGR_cmbCategory = e.control;
	if(e.keyCode == 13) {
		sendPaymentLogListRequest();		
	}	
}


/*
 * 사용자 정의 컨트롤에서 dblclick 이벤트 발생 시 호출.
 */
function onALMGR_udcAuthLogListDblclick(/* cpr.events.CSelectionEvent */ e){
//	if( dataManager.getOemVersion() == OEM_DUKYANG_WARDOFFICE && dataManager.getAccountID() != 0xDE0B6B3A7640000 ){return;	}
//				
//	var dsAuthLogList = app.lookup("ALMGR_udcAuthLogList");
//	var selectionRow = dsAuthLogList.getSelectedRow(); 
//	
//	if( selectionRow.getStateString() == "D" || selectionRow.getStateString() == "ID" ){
//		return;
//	}
//	var cmbCategory = app.lookup("ALMGR_cmbCategory");
//	var edtKeyword = app.lookup("ALMGR_edtKeyword");
//	
//	var indexKey = selectionRow.getRowData()["IndexKey"];
//	var param = [ cmbCategory.value, edtKeyword.value];
//	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
//		content: {
//			"Target":DLG_AUTHLOG_VIEW,
//			"ID": indexKey,
//			"Param":param,			
//		}
//	});
//
//	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


// 도움말
function onALMGR_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	/*
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
	*/
}

function onALEMP_dtiExportClick(/* cpr.events.CMouseEvent */ e){
	var totalLabel = app.lookup("ALMGR_opbTotal");
	var dmTotal = app.lookup("Total")
	var dm_ExportParam = app.lookup("dm_ExportParam")
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", dmTotal.getValue("Count"));	
	dm_ExportParam.setValue("offset", 0);
	comLib.showLoadMask("pro",dataManager.getString("Str_UserExport"),"",parseInt(totalLabel.value)/1000);
	
	sendPaymentLogListRequest()
}


function exportExcel(){

//	dataManager = getDataManager();
//	var dsAuthLogList = app.lookup("ExportAuthLogList");
//	var total = dsAuthLogList.getRowCount();
//	comLib.showLoadMask("pro",dataManager.getString("Str_UserExport"),"",total);
//	for( var i = 0; i < total ; i++){
//	
//	}
//	
//	/* original data */
//	var today = dateLib.getToday();
//	var filename = "AuthLogList_"+today+".xlsx";	
//	var ws_name = "AuthLogList_";
//		
//	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(dsAuthLogList.getRowDataRanged());
//	/* add worksheet to workbook */
//	XLSX.utils.book_append_sheet(wb, ws, ws_name);
//
//	XLSX.writeFile(wb, filename);	
//	comLib.hideLoadMask();

}


/*
 * 그룹에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGroupDblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group = e.control;
	
	var ENABLE_INNODEP_VMS = dataManager.getENABLE_INNODEP_VMS();;
	if(ENABLE_INNODEP_VMS == 1)
	{
		var usint_version = dataManager.getSystemVersion();

	
		var option = {
			width : 500,
			height : 500,
			right: app.getContainer().getActualRect().left/4
		};
	
		var appld = "app/main/vmsInnodep/vmsInnodepPlayback" + "?" + usint_version;
		app.openDialog(appld, option, function(dialog){
			
			dialog.bind("headerTitle").toLanguage("Str_AddEnterTerminal");
			
			dialog.modal = true;
			/*
			 * code : 입출구구분코드, tmp : 입출구구분코드에 따른 입출구 안티패스백 데이터셋, selectArea: 현재 사이드 그리드에서 선택된 구역의 ID값, areas: 구역목록데이터셋
			 * antipass: 안티패스백 데이터셋
			 */
			//dialog.initValue = {code: code, tmp: code=="ent"?tmpEntranceList:tmpExitList, selectArea: selectAreaRow.getValue("AreaID"),
			//					areas: app.lookup("AreaList"), antipass: app.lookup("AntipassBack")};
			dialog.addEventListenerOnce("close", function(e){
				var result = dialog.returnValue;
				if(result){
					
					
				}
			});
		});		
	}
}

function onSms_getPaymentLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var temperatureUnit = dataManager.getTemperatureUnit();
		
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsPaymentLogList = app.lookup("PaymentLogList");
		var count = dsPaymentLogList.getRowCount();	
		var udcPaymentLogList = app.lookup("authLogListLayout") 	
		
		udcPaymentLogList.setpaymentLogList(dsPaymentLogList);
				
		comLib.hideLoadMask();
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));		
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_AuthLog";
		if( errStr.length > 0 ){
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);		
	}
	app.lookup("ALMGR_grp").redraw();
}

function onSms_getPaymentLogListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	//var sms_getPaymentLogList = e.control;
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_getPaymentLogListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	//var sms_getPaymentLogList = e.control;
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
	
}
