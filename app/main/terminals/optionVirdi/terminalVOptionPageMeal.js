/************************************************
 * terminalVOptionPageMeal.js
 * Created at 2018. 12. 10. 오후 7:30:22.
 *
 * @author joymrk
 ************************************************/
var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");
var oem_version;
var chageCount = 0;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	oem_version = dataManager.getOemVersion();
	if (oem_version == OEM_KANGWONLAND) {
		app.lookup("KWL_cmbMealDataType").visible = true;
		app.lookup("KWL_opbMealDataType").visible = true;
	}else if (oem_version == OEM_HE_CHUNGJU_FACTORY) {
		app.lookup("HCJF_cmbMealLocation").visible = true;
		app.lookup("HCJF_opbMealLocation").visible = true;
		var mealLocation = app.lookup("HCJF_cmbMealLocation");
		mealLocation.addItem(new cpr.controls.Item("미지정", "0"));
		mealLocation.addItem(new cpr.controls.Item("연지동", "1"));
		mealLocation.addItem(new cpr.controls.Item("충주공장", "2"));
		mealLocation.addItem(new cpr.controls.Item("청라", "3"));
		mealLocation.redraw();
	}
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var mOptStatus = hostAppIns.callAppMethod("getTerminalOptStatus", "MealOpt");
		if(mOptStatus == 0) {
			if (hostAppIns.callAppMethod("getTerminalID")) {
				var tID = hostAppIns.callAppMethod("getTerminalID");
				var requestData = app.lookup("sms_get_terminal_option_meal");
				requestData.action = requestData.action + tID + "/option/meal";
				hostAppIns.callAppMethod("parentShowLoadMask", "Str_MealService");
				requestData.send();
			}
		} else {
			var getMopt = hostAppIns.callAppMethod("getMealOption");
			var MOptinfo = app.lookup("MealOptValue");
			getMopt.copyToDataMap(MOptinfo);
			app.lookup("TMVME_grd").redraw();
		}
		
	}
}

function onSnbeValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.NumberEditor
	 */
	var selectedCtrl = e.control;
	var mOptResult;
	var hostAppIns = app.getHostAppInstance();
	switch (selectedCtrl.id){
	case "breakfast_sHour_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["bStartHour", selectedCtrl.value]); 
		break;
	case "breakfast_sMin_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["bStartMinute", selectedCtrl.value]);	
		break;
	case "breakfast_eHour_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["bEndHour", selectedCtrl.value]);	
		break;
	case "breakfast_eMin_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["bEndMinute", selectedCtrl.value]);		
		break;
	case "lunch_sHour_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["lStartHour", selectedCtrl.value]);	 
		break;
	case "lunch_sMin_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["lStartMinute", selectedCtrl.value]);
		break;
	case "lunch_eHour_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["lEndHour", selectedCtrl.value]); 
		break;
	case "lunch_eMin_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["lEndMinute", selectedCtrl.value]);
		break;
	case "dinner_sHour_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["dStartHour", selectedCtrl.value]);
		break;
	case "dinner_sMin_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["dStartMinute", selectedCtrl.value]);
		break;
	case "dinner_eHour_nbe": 
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["dEndHour", selectedCtrl.value]);
		break;
	case "dinner_eMin_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["dEndMinute", selectedCtrl.value]); 
		break;
	case "snack_sHour_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["sStartHour", selectedCtrl.value]); 
		break;
	case "snack_sMin_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["sStartMinute", selectedCtrl.value]);  
		break;
	case "snack_eHour_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["sEndHour", selectedCtrl.value]);   
		break;
	case "snack_eMin_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["sEndMinute", selectedCtrl.value]);
		break;
	case "latesnack_sHour_nbe": 
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["lsStartHour", selectedCtrl.value]);
		break;
	case "latesnack_sMin_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["lsStartMinute", selectedCtrl.value]);
		break;
	case "latesnack_eHour_nbe":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["lsEndHour", selectedCtrl.value]); 
		break;
	case "latesnack_eMin_nbe": 
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["lsEndMinute", selectedCtrl.value]);
		break;
	case "Duplicate_cbx":
		mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["Duplicate", selectedCtrl.value]);
		break;
	}
	
	if (oem_version == OEM_VICTORYARCH){
		if (chageCount == 0){ // 처음 페이지 접근 시에는 변경 적용 X
			chageCount = 1;
		} else {
			app.getHostAppInstance().callAppMethod("setModifiedList", 4);
		}
	}
}

function onSms_get_terminal_option_mealSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var hostAppIns = app.getHostAppInstance();
	hostAppIns.callAppMethod("parentHideLoadMask","");
	var resultCode = app.lookup("Result").getValue("ResultCode");
				 
	if (resultCode == COMERROR_NONE) {
		var mOptStatus = hostAppIns.callAppMethod("initTerminalOptStatus", "MealOpt"); 
		var MealInfo = app.lookup("MealOptValue");
		var res = hostAppIns.callAppMethod("setMealOption", MealInfo); 
		
		app.lookup("Duplicate_cbx").value = MealInfo.getValue("Duplicate");
	} else {
		if(dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalMealInfoGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));						
		} else{
			//dialogAlert(app, "Waning", dataManager.getString("Str_TerminalMealInfoGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalMealInfoGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));			
		}
	}
	
	app.lookup("TMVME_grd").redraw();
}

function onSms_get_terminal_option_mealSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_get_terminal_option_mealSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);	
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onKWL_cmbMealDataTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var kWL_cmbMealDataType = e.control;
	var hostAppIns = app.getHostAppInstance();
	var mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["MealOperation", kWL_cmbMealDataType.value]);
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onHCJF_cmbMealLocationSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var hCJF_cmbMealLocation = e.control;
	var hostAppIns = app.getHostAppInstance();
	var mOptResult = hostAppIns.callAppMethod("modifyMealOption", ["MealLocation", hCJF_cmbMealLocation.value]);
}
