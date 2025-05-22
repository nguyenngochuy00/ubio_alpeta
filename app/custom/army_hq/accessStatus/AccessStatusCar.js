/************************************************
 * AccessStatusCar.js
 * Created at 2021. 2. 2. 오후 4:32:56.
 *
 * @author blue1
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");

var viewPageCount = 10;
var pageRowCount = 30;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();

	setPageIndexer(0, 1, pageRowCount, viewPageCount);
	var today = dateLib.getToday("-");
	
	app.lookup("AMASC_dtiStart").value = today;
	app.lookup("AMASC_dtiEnd").value = today;
	
	initComboAuthResult();
}

function setPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("AMASC_listPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("AMASC_listPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}


function sendSmsGetCarAccessStatusInfos(){
	app.lookup("CarAccessStatusInfos").clear();
	var curPageIndex = app.lookup("AMASC_listPageIndexer").currentPageIndex;
	var offset = (curPageIndex-1) * pageRowCount;
	var submision = app.lookup("sms_getCarAccessStatusInfos");

	submision.setParameters("offset", offset);	
	submision.setParameters("limit", pageRowCount);
	submision.setParameters("startTime", app.lookup("AMASC_dtiStart").value);
	submision.setParameters("endTime", app.lookup("AMASC_dtiEnd").value);
	submision.setParameters("searchKeyword", app.lookup("AMASC_ipbKeyword").value);
	
	var category = app.lookup("AMASC_cmbSearchCategory").value
	switch (Number(category)) {
	case 0:
		submision.setParameters("searchCategory", "all");
		break;
	case 1:
		submision.setParameters("searchCategory", "area");
		break;
	case 2:
		submision.setParameters("searchCategory", "name");
		break;			
	}
	
	submision.send();
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick(/* cpr.events.CMouseEvent */ e){
	var pageIndex = app.lookup("AMASC_listPageIndexer");	
	pageIndex.currentPageIndex = 1;
	sendSmsGetCarAccessStatusInfos();		
}

function onAMASC_listPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendSmsGetCarAccessStatusInfos();		
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getCarAccessStatusInfosSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		var totalCount = app.lookup("Total").getValue("Count");
		selectPaging(totalCount, viewPageCount);
		
		app.lookup("AMASC_opbTotal").value = totalCount;
		app.lookup("grdCarAccessStatusInfos").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

function onSms_getCarAccessStatusInfosSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getCarAccessStatusInfosSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


function initComboAuthResult() {
	var cmbAuthResult = app.lookup("cmb_AuthLogResult");
	if (cmbAuthResult == null) return;
	
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_Success"), AuthLogResultSuccess));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFail"), AuthLogResultFail));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAccessDenied"), AuthLogResultAccessDenied));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeout"), AuthLogResultTimeout));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutCapture"), AuthLogResultTimeoutCapture));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutIdentify"), AuthLogResultTimeoutIdentify));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAntiPassback"), AuthLogResultAntiPassback));	
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuress"), AuthLogResultDuress));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultBlackList"), AuthLogResultBlackList));
		
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultUnregistUser"), AuthLogResultInvalidUser));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFPCaptureFailed"), AuthLogResultCapture));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuplicatedAuth"), AuthLogResultDuplicatedAuthentication));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultNetworkError"), AuthLogResultNetwork));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultServerBusy"), AuthLogResultServerBusy));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFaceDetectionFailed"), AuthLogResultFaceDetection));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealPay"), AuthLogResultFailMealPay));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealTime"), AuthLogResultFailMealTime));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailNotExistsMealCode"), AuthLogResultFailNotExistsMealCode));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailPeriod"), AuthLogResultFailPeriod));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealLimit"), AuthLogResultFailMealLimit));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailDayLimit"), AuthLogResultFailDayLimit));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMonthLimit"), AuthLogResultFailMonthLimit));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultSoftpassback"), AuthLogResultSoftpassback));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultNoMask"), AuthLogResultNoMask));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFeverDetection"), AuthLogResultFeverDetection));
	
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultLprFail"), 125));
	cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultLprUnRegist"), 126));
	
}