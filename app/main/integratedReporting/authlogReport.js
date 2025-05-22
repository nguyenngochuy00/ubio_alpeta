/************************************************
 * authlogReport.js
 * Created at 2020. 2. 21. 오후 2:25:29.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var util = cpr.core.Module.require("lib/util");
var comLib;
var ITGAM_pageRowCount = 50;
var itgam_groupID;
var itgam_version;

function initComboAuthType() {
	var cmbAuthType = app.lookup("cmb_AuthLogType");
	if (cmbAuthType == null) return;
	
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPVerify"), 1));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPIdentify"), 2));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Password"), 3));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Card"), 4));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceVerify"), 5));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceIdentify"), 6));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_MobileCard"), 7));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeIrisIdentify"), 8));
	cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeIrisVerify"), 9));  
	
	
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		cmbAuthType.addItem(new cpr.controls.Item("PDA", 9998));
		cmbAuthType.addItem(new cpr.controls.Item("LPR", 9999));
	}
	
}

function initComboAuthResult() {
	var cmbAuthResult = app.lookup("cmb_AuthLogResult");
	if (cmbAuthResult == null) return;
	
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_Success"), 0));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFail"), 1));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAccessDenied"), 2));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeout"), 3));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutCapture"), 4));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutIdentify"), 5));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAntiPassback"), 6));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuress"), 7));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultBlackList"), 8));
	
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultLprFail"), 125));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultLprUnRegist"), 126));
	
}

function initComboFuncType() {
	var cmbAuthLogFuncType = app.lookup("cmb_AuthLogFuncType");
	if (cmbAuthLogFuncType == null) return;
	
	cmbAuthLogFuncType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeAccess"), 0));
	cmbAuthLogFuncType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeTna"), 1));
	cmbAuthLogFuncType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeMeal"), 2));
	
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		cmbAuthLogFuncType.addItem(new cpr.controls.Item("PDA", 9998));
		cmbAuthLogFuncType.addItem(new cpr.controls.Item("LPR", 9999));
	}
	
	var cmbFKey = app.lookup("cmb_AuthFuncKey");
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF1"), 1));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF2"), 2));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 3));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF3"), 4));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF4"), 5));
	
	//functype == 1 : 근태
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAttend"), 11));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyLeave"), 12));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 13));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyOut"), 14));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyIn"), 15));
	
	//functype == 2 : 식수
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu1"), 21));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu2"), 22));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu5"), 23));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu3"), 24));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu4"), 25));
}

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("authLogListPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("authLogListPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = ITGAM_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}

function SetMaxDate() {
	var date = new Date();
    date.setFullYear(date.getFullYear());// y년을 더함
    date.setMonth(date.getMonth());// m월을 더함
    date.setDate(date.getDate());// d일을 더함

	app.lookup("ITGAM_dtiStart").maxDate = date;
	app.lookup("ITGAM_dtiEnd").maxDate = date;	
}

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	itgam_version = dataManager.getSystemVersion();
	
	initComboAuthType();
	initComboAuthResult();
	initComboFuncType();
	
	SetMaxDate();	
	
	var hostApp = app.getHostAppInstance();
	itgam_groupID = hostApp.callAppMethod("getSelectedTree");
	
	var dtStart = app.lookup("ITGAM_dtiStart");
	var dtEnd = app.lookup("ITGAM_dtiEnd");
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');

	//var before = now.add(-30, 'days');
	dtStart.value = now.format('YYYY-MM-DD');
	
	//---------------------------------------------------------//출입 부대
	/*
	var groupList = dataManager.getGroup();	
	var cmbGroup = app.lookup("ITGAM_cmbGroupList");	 
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",
	});
	*/
	
	
	
	
	
	var ITGAM_cmbResult = app.lookup("ITGAM_cmbResult");
	ITGAM_cmbResult.value = "0";
	
	var ITGAM_btnPDF = app.lookup("ITGAM_btnPDF");
	ITGAM_btnPDF.text = dataManager.getString("Str_PDFSave");
	
	
	
	setPageIndexer(0,1,ITGAM_pageRowCount, 10); // 초기값
	sendAuthLogListRequest();
}


function sendAuthLogListRequest() {
	var hostApp = app.getHostAppInstance();
	itgam_groupID = hostApp.callAppMethod("getSelectedTree");

	var pageIndex = app.lookup("authLogListPageIndexer");
	var curIndex = pageIndex.currentPageIndex;
	var offset = (curIndex - 1) * ITGAM_pageRowCount;

	var smsGetAuthLogList = app.lookup("sms_getAuthLogList");
	var dtStart = app.lookup("ITGAM_dtiStart");
	var dtEnd = app.lookup("ITGAM_dtiEnd");

	var cmbCategory = app.lookup("ITGAM_cmbCategory");
	var edtKeyword = app.lookup("ITGAM_ipbKeyword");
	var authResult = app.lookup("ITGAM_cmbResult").value;
		
	smsGetAuthLogList.setParameters("startTime", dtStart.value + " 00:00:00");
	smsGetAuthLogList.setParameters("endTime", dtEnd.value + " 23:59:59");
	smsGetAuthLogList.setParameters("offset", offset);
	smsGetAuthLogList.setParameters("limit", ITGAM_pageRowCount);
	smsGetAuthLogList.setParameters("groupID", itgam_groupID);
	smsGetAuthLogList.setParameters("authResult", authResult);
/*
	if (cmbCategory.value == "terminal_name") {
		var bFound = false;
		for (var i = 0; i < dataManager.getTerminalList().getRowCount(); i++) {

			var row = dataManager.getTerminalList().getRow(i);
			if (row.getValue("Name") == edtKeyword.value) {
				smsGetAuthLogList.setParameters("searchCategory", "terminal_id");
				smsGetAuthLogList.setParameters("searchKeyword", row.getValue("ID"));
				bFound = true;
				break;
			}
		}
		if (bFound == false) {
			return;
		}
	} else
* */
	smsGetAuthLogList.setParameters("searchCategory", cmbCategory.value);
	smsGetAuthLogList.setParameters("searchKeyword", edtKeyword.value);
	if (edtKeyword.value == null || edtKeyword.value.length <= 0) {
		smsGetAuthLogList.setParameters("searchCategory", "");
		smsGetAuthLogList.setParameters("searchKeyword", "");
	}
	var dsAuthLogList = app.lookup("AuthLogList");
	dsAuthLogList.clear();
	
	comLib.showLoadMask("",dataManager.getString("Str_Load"),"",1);
	smsGetAuthLogList.send();
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onITGAM_btnSeachClick(/* cpr.events.CMouseEvent */ e){
	
	var startTime = app.lookup("ITGAM_dtiStart").value;
	var endTime = app.lookup("ITGAM_dtiEnd").value;
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app.getHostAppInstance(), "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}	
	//pageIndex 초기 화
	var pageIndex = app.lookup("authLogListPageIndexer");	
	pageIndex.currentPageIndex = 1;
	sendAuthLogListRequest();
}

function onSms_getAuthLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		var viewPageCount = totalCount / ITGAM_pageRowCount + (totalCount % ITGAM_pageRowCount > 0);
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		app.lookup("ITGAM_opbTotal").value = totalCount;
		ITGAM_pageRowCount = parseInt(ITGAM_pageRowCount, 0); // pageRowCount가 String 형태로 넘어가고 있었는데, String 형태로 넘기면 페이징에 오류가 있어 int로 바꿈
		
		selectPaging(totalCount, viewPageCount);	
	} else {
		var errStr = getErrorString(resultCode);
		var errMsg = "Str_AuthLog";
		if (errStr.length > 0) {
			errMsg = dataManager.getString(errStr);
		} else {
			errMsg = dataManager.getString(errMsg);
		}
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
	comLib.hideLoadMask();
	app.lookup("ITGAM_grdAuthLogList").redraw();
	app.lookup("ITGAM_grpMain").redraw();
}

function onSms_getAuthLogListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getAuthLogListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAuthLogListPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var authLogListPageIndexer = e.control;
	sendAuthLogListRequest();
}

function onITGAM_btnPDFClick(/* cpr.events.CMouseEvent */ e){
	
	var dmTotal = app.lookup("Total");
	var totalCount = parseInt(dmTotal.getValue("Count"));
	if( totalCount > 50000 ){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_PDFMaxDataWarning"));
		return;
	}
	
	var dtStart = app.lookup("ITGAM_dtiStart");
	var dtEnd = app.lookup("ITGAM_dtiEnd");
	var category = app.lookup("ITGAM_cmbCategory").value;
	var keyword = app.lookup("ITGAM_ipbKeyword").value;
	
	var authResult = app.lookup("ITGAM_cmbResult").value;
					
	if (keyword == null || keyword.length < 1) {
		category = "";
		keyword = "";
	}
		
	var btnText1 = dataManager.getString("Str_DefaultValue");
	var btnText2 = dataManager.getString("Str_Apply");
	
	
	var locale = dataManager.getLocale();
	
	var address = document.URL.toString() + '/reportPage?'+'&startTime='	+ dtStart.value	+ '&endTime=' + dtEnd.value
				+ '&groupID=' + itgam_groupID + '&searchCategory=' + category + '&searchKeyword=' + keyword
				+ '&version=' + itgam_version + '&authResult=' + authResult 
				+ '&btnText1=' + btnText1 + '&btnText2=' + btnText2
				+ '&locale=' + locale+'&total='+totalCount;
				

	console.log(address);

	var wp = window.open(address, '_blank', 'width=1024,height=768,resizable=no,location=no,toolbar=no,menubar=no');
	/*
	var appld = "app/main/integratedReporting/signedSetting/documentSetting" + "?" + itgam_version;
	app.getRootAppInstance().openDialog(appld, 
	{width : 700, height : 370, color : "#ffffff"}, function(dialog){
		dialog.ready(function(dialogApp){
			// 필요한 경우, 다이얼로그의 앱이 초기화 된 후, 앱 속성을 전달하십시오.
			dialog.headerTitle = "PDF " + languageMap.get("Str_Setting");
			dialog.modal = false;
			//dialog.initValue = selectionRow.getRowData();
			//dialog.initValue = initValue;
			});
		}).then(function(returnValue){
			if(returnValue) {
				var signSet = app.lookup("signedSet");
				returnValue.copyToDataMap(signSet);
				
				var dtStart = app.lookup("ITGAM_dtiStart");
				var dtEnd = app.lookup("ITGAM_dtiEnd");
			
				var cmbCategory = app.lookup("ITGAM_cmbCategory");
				var edtKeyword = app.lookup("ITGAM_ipbKeyword");
								
				if (edtKeyword.value == null || edtKeyword.value.length <= 0) {
					cmbCategory = "";
					edtKeyword = "";
				}
				var address = document.URL.toString() + '/reportPage?title=' + signSet.getValue("title")+'&fontsize='
				+ signSet.getValue("fontsize") + '&fontweight=' + signSet.getValue("fontweight") 
				+ '&signedColumnFlag=' + signSet.getValue("signedColumnFlag") 
				+ '&SignedColumn1='	+ signSet.getValue("SignedColumn1") 
				+ '&SignedColumn2='	+ signSet.getValue("SignedColumn2") 
				+ '&SignedColumn3='	+ signSet.getValue("SignedColumn3") 
				+ '&SignedColumn4='	+ signSet.getValue("SignedColumn4") 
				+ '&SignedColumn5='	+ signSet.getValue("SignedColumn5") 
				+ '&SignedColumn6='	+ signSet.getValue("SignedColumn6") 
				+ '&SignedColumn7='	+ signSet.getValue("SignedColumn7")
				+ '&SignedColumn8=' + signSet.getValue("SignedColumn8")
				+ '&smsType=' + 'authList'
				+ '&startTime='	+ dtStart.value 
				+ '&endTime=' + dtEnd.value
				+ '&groupID=' + itgam_groupID
				+ '&searchCategory=' + cmbCategory.value
				+ '&searchKeyword=' + edtKeyword.value;
				
				var wp = window.open(address, '_blank', 'width=1024,height=768,resizable=no,location=no,toolbar=no,menubar=no');
			}
	
	});	
	* */
}

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACARM_imgHelpClick(/* cpr.events.CMouseEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	var bOptResult = hostAppIns.callAppMethod("helpPageRequest", "auth");
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onACARM_imgHelpClick2(/* cpr.events.CMouseEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	var bOptResult = hostAppIns.callAppMethod("helpPageRequest", "Auth");
}
