/************************************************
 * mealManagement.js
 * Created at 2018. 11. 14. 오전 9:25:17.
 *
 * @author joymrk
 ************************************************/
var dataManager;
var usint_version;
var comLib;
var strLib = cpr.core.Module.require("lib/StrLib");
var inputValidManager = createInputValidator(app);

var MSMGR_intMode = 0;
var MSMGR_userCntPerRequest = 2000;
var MSMGR_total = 0;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	var mealLocation = app.lookup("HECJFM_cmbMealLocation");
	mealLocation.addItem(new cpr.controls.Item("미지정","0"));
	mealLocation.addItem(new cpr.controls.Item("연지동","1"));
	mealLocation.addItem(new cpr.controls.Item("충주공장","2"));
	mealLocation.addItem(new cpr.controls.Item("청라","3"));
	mealLocation.selectItem(0);
	comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), '',0);
	var sms_getMealDataList = app.lookup("sms_getMealDataList");
	sms_getMealDataList.send();
}

function setEditMode(mode){
	MSMGR_intMode = mode
	if( MSMGR_intMode == 1 ){// 추가
		setMealDataAddMode()
	}
}

function getEditMode(mode){
	return MSMGR_intMode;
}

function getNewMealCode(){
	var code = 0;
	var dsMeal = app.lookup("Meal");
	var count = dsMeal.getRowCount();
	var strCode = ""
	for(;;){
		code++;
		var strCode = strLib.lpad( code.toString() ,4,"0");

		var row = dsMeal.findFirstRow("Code=='"+strCode+"'");
		if( row == null || row == undefined ){
			break;
		}
	}
	return strCode;
}

// 오늘 날짜 구하기
function getToday(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();

	if(dd < 10) {dd = '0'+dd}
	if(mm<10) {mm='0'+mm}

	var date = yyyy + "-" + mm + "-" + dd;

	return date;
}

// 식수  추가 모드로 설정.
function setMealDataAddMode(){

	app.lookup("MSMGR_ipbMealCode").enabled = true;
	var dmMeal = app.lookup("dmMeal");
	app.lookup("MSMGR_grdMealList").clearSelection();
	dmMeal.clear();

	var strCode = getNewMealCode();
	dmMeal.setValue("Code",strCode);
	dmMeal.setValue("DayLimit",0);
	dmMeal.setValue("MonthLimit",0);
	dmMeal.setValue("StartAt",getToday());
	dmMeal.setValue("EndAt",getToday());

	app.lookup("MSMGR_grpMealDetail").redraw();
	app.lookup("MealDataInMeal").clear();
}

// 식수 리스트에서 식수 클릭시
function onMealListGridSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/* @type cpr.controls.Grid */
	var mealListGrid = e.control;
	var row = mealListGrid.getSelectedRow();
	if( row ){
		setEditMode(2);
		app.lookup("MSMGR_ipbMealCode").enabled = false;
		var mealCode = row.getValue("Code");
		displayMealDetail(mealCode);
	}
}

function displayMealDetail(mealCode){
	var dsMeal = app.lookup("Meal");
	var row = dsMeal.findFirstRow("Code =='"+mealCode+"'");
	if( row ){
		var dmMeal = app.lookup("dmMeal");
		dmMeal.build(row.getRowData());

		var dsMealData = app.lookup("MealData");
		var dsMealDataInMeal = app.lookup("MealDataInMeal");
		dsMealDataInMeal.clear();

		var mealCode1 = dmMeal.getValue("MealDataCode1");
		var mealData1 = dsMealData.findFirstRow("Code =='"+mealCode1+"'");
		if( mealData1 ){
			dsMealDataInMeal.addRowData(mealData1.getRowData());
		}
		var mealCode2 = dmMeal.getValue("MealDataCode2");
		var mealData1 = dsMealData.findFirstRow("Code =='"+mealCode2+"'");
		if( mealData1 ){
			dsMealDataInMeal.addRowData(mealData1.getRowData());
		}
		var mealCode3 = dmMeal.getValue("MealDataCode3");
		var mealData1 = dsMealData.findFirstRow("Code =='"+mealCode3+"'");
		if( mealData1 ){
			dsMealDataInMeal.addRowData(mealData1.getRowData());
		}
		var mealCode4 = dmMeal.getValue("MealDataCode4");
		var mealData1 = dsMealData.findFirstRow("Code =='"+mealCode4+"'");
		if( mealData1 ){
			dsMealDataInMeal.addRowData(mealData1.getRowData());
		}
		var mealCode5 = dmMeal.getValue("MealDataCode5");
		var mealData1 = dsMealData.findFirstRow("Code =='"+mealCode5+"'");
		if( mealData1 ){
			dsMealDataInMeal.addRowData(mealData1.getRowData());
		}
		dsMealDataInMeal.commit();

		app.lookup("MSMGR_nbeDayLimit").redraw();
		app.lookup("MSMGR_nbeMonthLimit").redraw();
		app.lookup("MSMGR_grpMealDetail").redraw();
	}
}

// 식수 추가 클릭
function onOnMSMGR_btnMealAddClick(/* cpr.events.CMouseEvent */ e){
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

function validateMeal(){
	var dmMeal = app.lookup("dmMeal");
	var code = dmMeal.getValue("Code");
	if( code.length != 4 ){
		dialogAlert(app, dataManager.getString("Str_Info"),dataManager.getString("Str_MealCodeLengthInvalid"));
		return false;
	}
	if( code == "0000" ){
		dialogAlert(app, dataManager.getString("Str_Info"),dataManager.getString("Str_MealCodeInvalid"));
		return false;
	}
	var name = dmMeal.getValue("Name");
	if( name.length == 0 ){
		dialogAlert(app, dataManager.getString("Str_Info"),dataManager.getString("Str_MealNameInvalid"));
		return false;
	}
	return true;
}
// 식수 저장 클릭
function onOnMSMGR_btnMealSaveClick(/* cpr.events.CMouseEvent */ e){

	if (validateMeal() == true ){

		comLib.showLoadMask("", dataManager.getString("Str_Save"), "", 0);

		if( getEditMode() == 1 ){
			app.lookup("sms_postMeal").send();
		}else{
			var dmMeal = app.lookup("dmMeal");
			var code = dmMeal.getValue("Code");
			var sms_putMealData = app.lookup("sms_putMeal");
			sms_putMealData.action = "/v1/meals/"+code;
			sms_putMealData.send();
		}
	}
}

// 식수 업데이트 완료
function onSms_postMealSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsMeal = app.lookup("Meal");
		var dmMeal = app.lookup("dmMeal");
		var newRow = dsMeal.addRowData(dmMeal.getDatas());
		dsMeal.commit();
		app.lookup("MSMGR_grdMealList").select({ rowIndex: newRow.getIndex()});
	} else {
		//dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_Failed"));
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 식수 업데이트 에러
function onSms_postMealSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 식수 업데이트 타임아웃
function onSms_postMealSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 식수  수정 완료
function onSms_putMealSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_putMeal = e.control;
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){

		var dsMeal = app.lookup("Meal");
		var dmMeal = app.lookup("dmMeal");
		var code = dmMeal.getValue("Code");

		var mealData = dsMeal.findFirstRow("Code == '"+code+"'");
		mealData.setRowData(dmMeal.getDatas());
		app.lookup("MSMGR_grdMealList").select({ rowIndex: mealData.getIndex()});
	} else {
		//dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_Failed"));
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 식수  수정 에러
function onSms_putMealSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 식수  수정 타임아웃
function onSms_putMealSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 식수 삭제 클릭
function onOnMSMGR_btnMealDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdMealList = app.lookup("MSMGR_grdMealList");
	var row = grdMealList.getSelectedRow();
	if ( row ){
	} else {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	var dsMeal = app.lookup("Meal");
	console.log(dsMeal.getRowDataRanged());
	var code = row.getValue("Code");

	comLib.showLoadMask("", dataManager.getString("Str_Save"), "", 0);
	var sms_deleteMealData = app.lookup("sms_deleteMeal");
	sms_deleteMealData.action = "/v1/meals/" + code;
	sms_deleteMealData.setParameters("ID", code);
	sms_deleteMealData.send();
}

// 식수  삭제 완료
function onSms_deleteMealSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_deleteMeal = e.control;
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var code = sms_deleteMeal.getParameters("ID");
		var dsMeal = app.lookup("Meal");		
		var meal = dsMeal.findFirstRow("Code == '"+code+"'");
		if( meal ){
			dsMeal.realDeleteRow(meal.getIndex());
		}

		if( dsMeal.getRowCount()>0){
			app.lookup("MSMGR_grdMealList").select({ rowIndex: 0});
		}else {
			setEditMode(1);
		}

	} else {
		//dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_Failed"));
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 식수  삭제 에러
function onSms_deleteMealSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 식수  삭제 타임아웃
function onSms_deleteMealSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

//"끼니 추가" 버튼에서 click
function onMSMGR_btnMealDataAddClick(/* cpr.events.CMouseEvent */ e){

	var mealDataCount = app.lookup("MSMGR_grdMealDataList").getRowCount(); // 식수에 추가되어 있는 식수 메뉴 수.
	if ( mealDataCount >= 5) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_MealDataInMealMaxExceed"));
		return;
	}

	var cmbMealData = app.lookup("MSMGR_cmbMealData").getSelectionFirst();
	if( cmbMealData ){
		//220510 otk - 식수 업데이트 오동작 수정 
		var grdMealDataList = app.lookup("MSMGR_grdMealDataList");
		var dmMeal = app.lookup("dmMeal");
		var dsMealData = app.lookup("MealData");
		var mealDataCode = cmbMealData.value;
		
		console.log(dsMealData.getRowDataRanged());
		console.log(dmMeal.getDatas())

		var mealCode1 = dmMeal.getValue("MealDataCode1");
		if ((mealCode1 == "    ") || (mealCode1 == "")) {
			var mealData = dsMealData.findFirstRow("Code == '"+mealDataCode+"'");
			if( mealData ){
				var dsMealDataInMeal = app.lookup("MealDataInMeal");
				dsMealDataInMeal.addRowData(mealData.getRowData());
				dmMeal.setValue("MealDataCode1", mealDataCode);
			}
			dsMealDataInMeal.commit();
			return;
		}
		
		var mealCode2 = dmMeal.getValue("MealDataCode2");
		if ((mealCode2 == "    ") || (mealCode2 == "")) {
			var mealData = dsMealData.findFirstRow("Code == '"+mealDataCode+"'");
			if( mealData ){
				var dsMealDataInMeal = app.lookup("MealDataInMeal");
				dsMealDataInMeal.addRowData(mealData.getRowData());
				dmMeal.setValue("MealDataCode2", mealDataCode);
			}
			dsMealDataInMeal.commit();
			return;
		}
		var mealCode3 = dmMeal.getValue("MealDataCode3");
		if ((mealCode3 == "    ") || mealCode3 == "") {
			var mealData = dsMealData.findFirstRow("Code == '"+mealDataCode+"'");
			if( mealData ){
				var dsMealDataInMeal = app.lookup("MealDataInMeal");
				dsMealDataInMeal.addRowData(mealData.getRowData());
				dmMeal.setValue("MealDataCode3", mealDataCode);
			}
			dsMealDataInMeal.commit();
			return;
		}
		
		var mealCode4 = dmMeal.getValue("MealDataCode4");
		if ((mealCode4 == "    ") || (mealCode4 == "")) {
			var mealData = dsMealData.findFirstRow("Code == '"+mealDataCode+"'");
			if( mealData ){
				var dsMealDataInMeal = app.lookup("MealDataInMeal");
				dsMealDataInMeal.addRowData(mealData.getRowData());
				dmMeal.setValue("MealDataCode4", mealDataCode);
			}
			dsMealDataInMeal.commit();
			return;
		}
		
		var mealCode5 = dmMeal.getValue("MealDataCode5");
		if ((mealCode5 == "    ") || (mealCode5 == "")) {
			var mealData = dsMealData.findFirstRow("Code == '"+mealDataCode+"'");
			if( mealData ){
				var dsMealDataInMeal = app.lookup("MealDataInMeal");
				dsMealDataInMeal.addRowData(mealData.getRowData());
				dmMeal.setValue("MealDataCode5", mealDataCode);
			}
			dsMealDataInMeal.commit();
			return;
		}		
	} else {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoSelectedItem"));
	}
}

// 식수 메뉴(끼니) 열기
function onMSMGR_btnMealDataLinkClick(/* cpr.events.CMouseEvent */ e){
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_MEALSERVICE_MENU_MANAGEMENT,
		}
	});

	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 식수 메뉴(끼니) 가져오기 완료
function onSms_getMealDataListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var sms_getMealList = app.lookup("sms_getMealList");
	sms_getMealList.send();
}

// 식수 메뉴 가져오기 에러
function onSms_getMealDataListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 식수 메뉴 가져오기 타임아웃
function onSms_getMealDataListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 식수 리스트 가져오기 완료
function onSms_getMealListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsMeal = app.lookup("Meal");
		if( dsMeal.getRowCount()>0){
			app.lookup("MSMGR_grdMealList").select({ rowIndex: 0});
		}else {
			setEditMode(1);
		}

		var cmbMealData = app.lookup("MSMGR_cmbMealData");
		var dsMealData = app.lookup("MealData");
		var mealDataCount = dsMealData.getRowCount();
		for (var i=0; i<mealDataCount; i++ ){
			var mealData = dsMealData.getRow(i);
			cmbMealData.addItem(new cpr.controls.Item(
				mealData.getValue("Code")+" : "+mealData.getValue("Name"),
				mealData.getValue("Code")
			));
		}
		if(mealDataCount>0){
			cmbMealData.selectItem(0);
		}

	} else {
		//dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_Failed"));
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 식수 리스트 가져오기 에러
function onSms_getMealListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 식수 리스트 가져오기 타임아웃
function onSms_getMealListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 끼니 삭제
function onMSMGR_btnMealDataDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdMealDataList = app.lookup("MSMGR_grdMealDataList");
	var dmMeal = app.lookup("dmMeal");

	var dsMealData = app.lookup("MealDataInMeal");
	var chkIndices = grdMealDataList.getCheckRowIndices()
	var count = chkIndices.length;
	for(var i = count-1; i>=0; i--)
	{
		var rowIndex = chkIndices[i];
		var row = grdMealDataList.getRow(rowIndex);
		var mealDataCode = row.getValue("Code");

		var mealData = dsMealData.findFirstRow("Code == '"+mealDataCode+"'");
		if( mealData ){
			dsMealData.realDeleteRow(mealData.getIndex());
		}
		var codeIndex = rowIndex+1;
		var strMealDataCode = "MealDataCode"+codeIndex;

		var dmMeal = app.lookup("dmMeal");
		dmMeal.setValue(strMealDataCode,"");

	}
	grdMealDataList.redraw();
}

//"사용자 설정" 버튼에서 click
function onOnMSMGR_btnUserMealSetClick(/* cpr.events.CMouseEvent */ e){
	var dsGroupList = dataManager.getGroup();
	var appld = "app/main/users/UserSelect" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 960, height : 500}, function(dialog){
		dialog.initValue = {"GroupList":dsGroupList,"ExcludeGroup":-1};

		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.modal = true;
	}).then(function(idMap){

		var dsUserIDSendList = app.lookup("UserIDSendList");
		console.log(idMap);
		idMap.forEach(function(value,key){
			dsUserIDSendList.addRowData({"ID":key});
		});

		MSMGR_total = dsUserIDSendList.getRowCount();
		
		if(MSMGR_total > 0){ // 적용할 사용자를 아무도 선택하지 않고 설정을 누르면 네트워크 오류 발생하며 자동 새로고침되어 조건 추가
			comLib.showLoadMask("pro",dataManager.getString("Str_UserMealCodeUpdate"),"", MSMGR_total / MSMGR_userCntPerRequest);
			sendPutUserMealCode();
		}
	});
}

function sendPutUserMealCode(){

	var dsUserIDList = app.lookup("UserIDList");
	var dsUserIDSendList = app.lookup("UserIDSendList");
	var total = dsUserIDSendList.getRowCount();

	if( total > MSMGR_userCntPerRequest ){
		total = MSMGR_userCntPerRequest;
	}
	dsUserIDList.clear();
	dsUserIDList.build(dsUserIDSendList.getRowDataRanged(0, total-1));
	console.log(dsUserIDList.getRowDataRanged());

	for( var i = 0; i < total; i++){
		dsUserIDSendList.realDeleteRow(0);
	}

	var code = app.lookup("MSMGR_ipbMealCode").value;

	var sms_putUserMealCode = app.lookup("sms_putUserMealCode");
	sms_putUserMealCode.action = "/v1/meals/"+code+"/userMealCode";
	sms_putUserMealCode.send();
}

// 사용자 식수 코드 적용 완료
function onSms_putUserMealCodeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_putUserMealCode = e.control;

	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsUserIDSendList = app.lookup("UserIDSendList");
		var leftCount = dsUserIDSendList.getRowCount();

		if( leftCount > 0){
			comLib.updateLoadMask( MSMGR_total-leftCount+"/"+MSMGR_total);
			sendPutUserMealCode();
		} else{
			console.log("end");
			comLib.hideLoadMask();
			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
		}
	} else {
		comLib.hideLoadMask();
		//dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_Failed"));
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 사용자 식수 코드 적용 에러
function onSms_putUserMealCodeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

// 사용자 식수 코드 적용 타임아웃
function onSms_putUserMealCodeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 도움말 페이지 클릭
function onMSMGR_imgHelpClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // mainManager.module.js ExecuteMenu <- 셋팅
	var selectionEvent = new cpr.events.CUIEvent("execute-menu",{content:{"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onMSMGR_ipbMealCodeKeyup(/* cpr.events.CKeyboardEvent */ e){
	/**
	 * @type cpr.controls.InputBox
	 */
	var mSMGR_ipbMealCode = e.control;
	inputValidManager.dynamicValidate(mSMGR_ipbMealCode, mSMGR_ipbMealCode.displayText, app.lookup("Meal"), "Code", "");
}
