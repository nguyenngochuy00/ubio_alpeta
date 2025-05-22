/************************************************
 * aMealManagement.js
 * Created at 2018. 11. 14. 오후 1:01:36.
 *
 * @author joymrk
 ************************************************/
var util = cpr.core.Module.require("lib/util");
var dataManager = cpr.core.Module.require("lib/DataManager");
var strLib = cpr.core.Module.require("lib/StrLib");
var comLib;
var MSSCM_intMode = 0;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	
	var cmbMealDataType = app.lookup("MSSCM_cmbMealDataType");
	
	cmbMealDataType.addItem(new cpr.controls.Item(dataManager.getString("Str_BreakFast"),1));
	cmbMealDataType.addItem(new cpr.controls.Item(dataManager.getString("Str_Lunch"),2));
	cmbMealDataType.addItem(new cpr.controls.Item(dataManager.getString("Str_Dinner"),3));
	cmbMealDataType.addItem(new cpr.controls.Item(dataManager.getString("Str_Snack"),4));
	cmbMealDataType.addItem(new cpr.controls.Item(dataManager.getString("Str_LateSnack"),5));
	
	if(dataManager.getOemVersion() == OEM_KANGWONLAND) {	//강원랜드.
		cmbMealDataType.addItem(new cpr.controls.Item("테이크 아웃", 98));
		cmbMealDataType.addItem(new cpr.controls.Item("패스트 푸드", 99));
		
	}
	
	comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "", 10);
	var sms_getMealDataList = app.lookup("sms_getMealDataList");
	sms_getMealDataList.send();
}

function setEditMode(mode){
	MSSCM_intMode = mode
	if( MSSCM_intMode == 1 ){// 추가
		setMealDataAddMode()		
	}
}

function getEditMode(mode){
	return MSSCM_intMode;
}

function getNewMealDataCode(){
	var code = 0;
	var dsMealData = app.lookup("MealData");
	var count = dsMealData.getRowCount();
	var strCode = ""
	for(;;){
		code++;
		var strCode = strLib.lpad( code.toString() ,4,"0");
		
		var row = dsMealData.findFirstRow("Code=='"+strCode+"'");
		if( row == null || row == undefined ){
			break;
		}
	}	
	return strCode;
}

// 끼니 데이터 추가 모드로 설정.
function setMealDataAddMode(){
	
	app.lookup("MSSCM_ipbMealDataCode").enabled = true;
	var dmMealData =app.lookup("dmMealData");
	app.lookup("MSSCM_grdMealDataList").clearSelection();		
	dmMealData.clear();
	
	var strCode = getNewMealDataCode();
	
	app.lookup("MSSCM_ipbMealDataCode").value = strCode;	
	
	app.lookup("MSSCM_dtiStartTime").value="00:00";		
	app.lookup("MSSCM_dtiEndTime").value="23:59";
	app.lookup("MSSCM_nbeMaxCount").value=1;	
	
	app.lookup("MSSCM_cmbNextDateStartTimFlag").value = 0;
	app.lookup("MSSCM_cmbNextDateEndTimFlag").value = 0;
	app.lookup("MSSCM_grpMealDataView").redraw();
}

// 식수 데이터 리스트에서 식수 데이터 선택시
function onMSSCM_grdMealDataListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/* @type cpr.controls.Grid */
	var grdMealDataList = e.control;
	var row = grdMealDataList.getSelectedRow();
	if ( row ){
		setEditMode(2);
		app.lookup("MSSCM_ipbMealDataCode").enabled = false;
		var code = row.getValue("Code");
		var dsMealData =app.lookup("MealData");
		var dmMealData =app.lookup("dmMealData");
		var mealData = dsMealData.findFirstRow("Code == '"+code+"'");				
		dmMealData.build(mealData.getRowData());	
	}
	app.lookup("MSSCM_grpMealDataView").redraw();	
}

// 식수 메뉴 데이터 리스트 수신 완료
function onSms_getMealDataListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	comLib.hideLoadMask();
	
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsMealData = app.lookup("MealData");
		
		if( dsMealData.getRowCount()>0){
			app.lookup("MSSCM_grdMealDataList").select({ rowIndex: 0});			
		}else {
			setEditMode(1);
		}
		
	} else {
		//dialogAlert(app, "Warning", dataManager.getString("Str_ListLoading")+dataManager.getString("Str_Failed"));
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ListLoading")+" "+dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 식수 메뉴 데이터 리스트 수신 에러
function onSms_getMealDataListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 식수 메뉴 데이터 리스트 수신 타임아웃
function onSms_getMealDataListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 식수 메뉴 추가 버튼 클릭
function onMSSCM_btnMealDataAddClick(/* cpr.events.CMouseEvent */ e){
	
	if( getEditMode() == 1 ){
		dialogConfirm(app, "", dataManager.getString("Str_NotSavedConfirm"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {	
					setEditMode(1);
				} else {
					return;
				}
			});
		});
	} else {
		setEditMode(1);
	}
}

function validateMealData(){
	var dmMealData = app.lookup("dmMealData");
	var code = dmMealData.getValue("Code");
	if( code.toString().length != 4 ){
		dialogAlert(app, dataManager.getString("Str_Info"),dataManager.getString("Str_MealCodeLengthInvalid"));		
		return false;
	}
	if( code == "0000" ){
		dialogAlert(app, dataManager.getString("Str_Info"),dataManager.getString("Str_MealCodeLengthInvalid"));		
		return false;
	}
	var name = dmMealData.getValue("Name");
	if( name.toString().length == 0 ){
		dialogAlert(app, dataManager.getString("Str_Info"),dataManager.getString("Str_MealCodeNameInvalid"));		
		return false;
	}
	
	// 등록시간 대소비교  
	var bResult = MealDateTimeCompare();
	if (bResult == false ) {
		return false;
	}
	
	
	return true;
}

function MealDateTimeCompare() {
	var bResult;
	bResult = true;
	
	var NextDateStartTimFlag = app.lookup("MSSCM_cmbNextDateStartTimFlag").value;
	var NextDateEndTimFlag = app.lookup("MSSCM_cmbNextDateEndTimFlag").value;
	var startTime = util.ConvHHMMtoMinute(app.lookup("MSSCM_dtiStartTime").value);
	var endTime = util.ConvHHMMtoMinute(app.lookup("MSSCM_dtiEndTime").value);
	
	// O = 0, + = 1
	if (NextDateStartTimFlag == '0' &&  NextDateEndTimFlag == '0' ) { // 당일 - 당일
	} else if (NextDateStartTimFlag == '0' &&  NextDateEndTimFlag == '1' ) { // 당일- 다음날
		endTime = endTime + 1440; // 다음날 만듬 		
	} else if (NextDateStartTimFlag == '1' &&  NextDateEndTimFlag == '1' ) { // 다음날 - 다음날
		startTime = startTime + 1440; //둘다 다음날 만듬
		endTime = endTime + 1440; // 다음날 만듬 
	} else { // 세팅오류!
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorMealDataTimeTerm"), "");
		return false;
	}
	// 시작 > 종료  false;
	if (startTime > endTime) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorMealDataTimeTerm"), "");
		bResult = false;
	}
	
	return bResult;
}

// 저장 버튼 클릭
function onMSSCM_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	var button = e.control;
	//MealDateTimeCompare();
	if (validateMealData() == true ){
		
		comLib.showLoadMask("", dataManager.getString("Str_Save"), "", 0);
		
		if( getEditMode() == 1 ){
			app.lookup("sms_postMealData").send();
		}else{
			var dmMealData = app.lookup("dmMealData");
			var code = dmMealData.getValue("Code");
			var sms_putMealData = app.lookup("sms_putMealData");
			sms_putMealData.action = "/v1/mealData/"+code;
			sms_putMealData.send();
		}	
	}	
}

// 식수 메뉴 등록 완료
function onSms_postMealDataSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		
		var dsMealData = app.lookup("MealData");
		var dmMealData = app.lookup("dmMealData");
		var newRow = dsMealData.addRowData(dmMealData.getDatas());	
		dsMealData.commit();		
		app.lookup("MSSCM_grdMealDataList").select({ rowIndex: newRow.getIndex()});	
		
	} else {
		//dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_Failed"));
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 식수 메뉴 등록 에러
function onSms_postMealDataSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 식수 메뉴 등록 타임아웃
function onSms_postMealDataSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 식수 메뉴 수정 완료
function onSms_putMealDataSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		
		var dsMealData = app.lookup("MealData");
		var dmMealData = app.lookup("dmMealData");
		var code = dmMealData.getValue("Code");
		
		var mealData = dsMealData.findFirstRow("Code == '"+code+"'");						
		mealData.setRowData(dmMealData.getDatas());
		app.lookup("MSSCM_grdMealDataList").select({ rowIndex: mealData.getIndex()});	
	} else {
		//dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_Failed"));
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 식수 메뉴 수정 에러
function onSms_putMealDataSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 식수 메뉴 수정 타임아웃
function onSms_putMealDataSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 삭제 버튼 클릭
function onMSSCM_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdMealDataList = app.lookup("MSSCM_grdMealDataList");
	var row = grdMealDataList.getSelectedRow();
	if ( row ){
	} else {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	
	var code = row.getValue("Code");
		
	var sms_deleteMealData = app.lookup("sms_deleteMealData");
	sms_deleteMealData.action = "/v1/mealData/" + code;
	sms_deleteMealData.setParameters("ID", code);
	sms_deleteMealData.send();
}

// 식수 데이터 삭제 완료
function onSms_deleteMealDataSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission	 */
	var sms_deleteMealData = e.control;
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var code = sms_deleteMealData.getParameters("ID");
		var dsMealData = app.lookup("MealData");		
		var mealData = dsMealData.findFirstRow("Code == '"+code+"'");
		if( mealData ){
			dsMealData.realDeleteRow(mealData.getIndex());
		}	
		if( dsMealData.getRowCount()>0){
			app.lookup("MSSCM_grdMealDataList").select({ rowIndex: 0});			
		}else {
			setEditMode(1);
		}
		
	} else {
		//dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_Failed"));
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 식수 데이터 삭제 에러
function onSms_deleteMealDataSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR);	
}

// 식수 데이터 삭제 타임아웃
function onSms_deleteMealDataSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 도움말 클릭
function onMSSCM_imgHelpClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

