/************************************************
 * mealClsCode.js
 * Created at 2020. 12. 14. 오전 9:53:19.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comUtil = createComUtil(app);
var mtccg_version;
var comLib;
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	mtccg_version = dataManager.getSystemVersion();
	sendGetMealClsCodeLsit();
}

function sendGetMealClsCodeLsit() {
	app.lookup("MealClsCodeList").clear();
	comLib.showLoadMask("","식수 대상 회사리스트","",0);
	var smsgetMealClsCodetList = app.lookup("sms_getMealClsCodetList");
	
	smsgetMealClsCodetList.send();
}

function onSms_getMealClsCodetListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getMealClsCodetList = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var totalCount = app.lookup("Total").getValue("Count");
		mtccg_clearInfo();
	} else {
		dialogAlert(app, "Waning", "강원랜드 식수대상자 회사구분"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getMealClsCodetListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getMealClsCodetListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//------------------------------------------------------------------------------------------------------<<

/*
 * "초기화" 버튼(MTCCG_btnClear)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMTCCG_btnClearClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var mTCCG_btnClear = e.control;
	mtccg_clearInfo();
	
}
//------------------------------------------------------------------------------------------------------<<

function mtccg_clearInfo() {
	app.lookup("MTCCG_ipbClsCode").value = "";
	app.lookup("MTCCG_ipbClsName").value = "";
	
	app.lookup("MTCCG_grdMealClsCodeList").clearSelection();
	app.lookup("MTCCG_grdMealClsCodeList").clearAllCheck();
	app.lookup("MTCCG_grdMain").redraw();
}

/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onMTCCG_grdMealClsCodeListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var mTCCG_grdMealClsCodeList = e.control;
	var grdMealClsCodeList = app.lookup("MTCCG_grdMealClsCodeList");
	var getRow = grdMealClsCodeList.getSelectedRow();
	if (getRow != null) {
		console.log(mTCCG_grdMealClsCodeList.getSelectedRow().getIndex());
		app.lookup("MTCCG_ipbClsCode").value = getRow.getValue("ClsCode");
		app.lookup("MTCCG_ipbClsName").value = getRow.getValue("ClsName");
	} else {
//		dialogAlert(app, "Waning", "선택된 대상이 없습니다.");
	}
}

/*
 * 버튼(MTCCG_btnAdd)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMTCCG_btnAddClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var mTCCG_btnAdd = e.control;
	var targetClsCode = app.lookup("MTCCG_ipbClsCode").value;
	var rowData = app.lookup("MealClsCodeList").findFirstRow("ClsCode == '"+ targetClsCode + "'");

	if (rowData) { //있으면 이미 등록된 것
		dialogAlert(app, "Waning", "이미 등록된 회사구분 코드 입니다.");
		return;
	} 
	var clsCode = app.lookup("MTCCG_ipbClsCode").value;
	if (clsCode.length <= 0) {
		dialogAlert(app, "Waning", "회사구분 코드가 입력되지 않았습니다.");
		return;
	}
	var clsName = app.lookup("MTCCG_ipbClsName").value;
	var mealClsCode = app.lookup("MealClsCodeInfo");
	mealClsCode.setValue("ClsCode", clsCode);
	mealClsCode.setValue("ClsName", clsName);
	
	comLib.showLoadMask("","식수 대상 회사코드 등록","",0);
	var smspostMealClsCode =app.lookup("sms_postMealClsCode");
	smspostMealClsCode.send();
}

function onSms_postMealClsCodeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if( resultCode == COMERROR_NONE){
		dialogAlert(app, dataManager.getString("Str_Success"), "식수 대상코드 등록 성공");
		sendGetMealClsCodeLsit();
	} else {
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_lprRegist"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_postMealClsCodeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

function onSms_postMealClsCodeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 버튼(MTCCG_btnDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMTCCG_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var mTCCG_btnDelete = e.control;
	var clsCode = app.lookup("MTCCG_ipbClsCode").value;
	if (clsCode.length <= 0) {
		dialogAlert(app, "Waning", "회사구분 코드가 입력되지 않았습니다.");
		return;
	}
	var rowData = app.lookup("MealClsCodeList").findFirstRow("ClsCode == '"+ clsCode + "'");

	if (!rowData) { //있으면 이미 등록된 것
		dialogAlert(app, "Waning", "등록안 된 회사구분 코드입니다.");
		return;
	} 
	
	var smsDeleteMealClsCode = app.lookup("sms_DeleteMealClsCode");
	smsDeleteMealClsCode.action = "/v1/kangwonland/meal/clsCode/" + clsCode;
	smsDeleteMealClsCode.send();
}
	
function onSms_DeleteMealClsCodeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		dialogAlert(app, dataManager.getString("Str_Success"), "식수 대상코드 삭제");
		sendGetMealClsCodeLsit();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_DeleteMealClsCodeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_DeleteMealClsCodeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
