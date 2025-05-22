/************************************************
 * tnaDetailWorkTime.js
 * Created at 2018. 10. 22. 오후 1:50:14.
 *
 * @author joymrk
 ************************************************/
var _popupType =0;
var dmApp;
var util = cpr.core.Module.require("lib/util");
var dataManager = cpr.core.Module.require("lib/DataManager");
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();	
	var initValue = app.getHost().initValue;	
	_popupType = initValue["popupType"];
	
	switch (_popupType) {
	case 0:
		dmApp = app.lookup("dmBasicWorkDetailSetting");
		initValue["WorkDetailSetting"].copyToDataMap(dmApp);
		app.lookup("TAWTD_cmbTimeUnit").value 		= dmApp.getValue("Wt1Unit");
		app.lookup("TAWTD_ipbAddTime").value  		= util.ConvHHMMfromMinute(dmApp.getValue("Wt1AddTime"), 0);
		app.lookup("TAWTD_ipbAddCondition").value 	= util.ConvHHMMfromMinute(dmApp.getValue("Wt1AddCondi"), 0);
		app.lookup("TAWTD_ipbDelTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt1DelTime"),0);
		app.lookup("TAWTD_ipbDelCondition").value  	= util.ConvHHMMfromMinute(dmApp.getValue("Wt1DelCondi"),0);
		app.lookup("TAWTD_ipbMinTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt1Min"),0);
		app.lookup("TAWTD_ipbMaxTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt1Max"),0);
		app.lookup("TAWTD_nbeTimeRate").value 		= dmApp.getValue("Wt1Rate");
		
		app.lookup("TAWTD_ipbAddSumm").value			= util.ConvHHMMfromMinute(dmApp.getValue("St1AddTime"), 0);
		app.lookup("TAWTD_ipbAddSummCondition").value	= dmApp.getValue("St1AddCondi");
		app.lookup("TAWTD_ipbDelSumm").value			= util.ConvHHMMfromMinute(dmApp.getValue("St1DelTime"), 0);
		app.lookup("TAWTD_ipbDelSummCondition").value	= dmApp.getValue("St1DelCondi");
		app.lookup("TAWTD_ipbSummMinTime").value		= util.ConvHHMMfromMinute(dmApp.getValue("St1Min"), 0);
		app.lookup("TAWTD_ipbSummMaxTime").value		= util.ConvHHMMfromMinute(dmApp.getValue("St1Max"), 0);
		app.lookup("TAWTD_cmbSumTrans").value			= dmApp.getValue("St1Trans");
		break;
	case 1:
		
		dmApp = app.lookup("dmEarlyWorkDetailSetting");
		initValue["WorkDetailSetting"].copyToDataMap(dmApp);
		
		app.lookup("TAWTD_cmbTimeUnit").value 		= dmApp.getValue("Wt2Unit");
		app.lookup("TAWTD_ipbAddTime").value  		= util.ConvHHMMfromMinute(dmApp.getValue("Wt2AddTime"), 0);
		app.lookup("TAWTD_ipbAddCondition").value 	= util.ConvHHMMfromMinute(dmApp.getValue("Wt2AddCondi"), 0);
		app.lookup("TAWTD_ipbDelTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt2DelTime"),0);
		app.lookup("TAWTD_ipbDelCondition").value  	= util.ConvHHMMfromMinute(dmApp.getValue("Wt2DelCondi"),0);
		app.lookup("TAWTD_ipbMinTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt2Min"),0);
		app.lookup("TAWTD_ipbMaxTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt2Max"),0);
		app.lookup("TAWTD_nbeTimeRate").value 		= dmApp.getValue("Wt2Rate");
		
		app.lookup("TAWTD_ipbAddSumm").value			= util.ConvHHMMfromMinute(dmApp.getValue("St2AddTime"), 0);
		app.lookup("TAWTD_ipbAddSummCondition").value	= dmApp.getValue("St2AddCondi");
		app.lookup("TAWTD_ipbDelSumm").value			= util.ConvHHMMfromMinute(dmApp.getValue("St2DelTime"), 0);
		app.lookup("TAWTD_ipbDelSummCondition").value	= dmApp.getValue("St2DelCondi");
		app.lookup("TAWTD_ipbSummMinTime").value		= util.ConvHHMMfromMinute(dmApp.getValue("St2Min"), 0);
		app.lookup("TAWTD_ipbSummMaxTime").value		= util.ConvHHMMfromMinute(dmApp.getValue("St2Max"), 0);
		app.lookup("TAWTD_cmbSumTrans").value			= dmApp.getValue("St2Trans");
		break;
	case 2:
		dmApp = app.lookup("dmOverWorkDetailSetting");
		initValue["WorkDetailSetting"].copyToDataMap(dmApp);
		app.lookup("TAWTD_cmbTimeUnit").value 		= dmApp.getValue("Wt3Unit");
		app.lookup("TAWTD_ipbAddTime").value  		= util.ConvHHMMfromMinute(dmApp.getValue("Wt3AddTime"), 0);
		app.lookup("TAWTD_ipbAddCondition").value 	= util.ConvHHMMfromMinute(dmApp.getValue("Wt3AddCondi"), 0);
		app.lookup("TAWTD_ipbDelTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt3DelTime"),0);
		app.lookup("TAWTD_ipbDelCondition").value  	= util.ConvHHMMfromMinute(dmApp.getValue("Wt3DelCondi"),0);
		app.lookup("TAWTD_ipbMinTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt3Min"),0);
		app.lookup("TAWTD_ipbMaxTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt3Max"),0);
		app.lookup("TAWTD_nbeTimeRate").value 		= dmApp.getValue("Wt3Rate");
		
		app.lookup("TAWTD_ipbAddSumm").value			= util.ConvHHMMfromMinute(dmApp.getValue("St3AddTime"), 0);
		app.lookup("TAWTD_ipbAddSummCondition").value	= dmApp.getValue("St3AddCondi");
		app.lookup("TAWTD_ipbDelSumm").value			= util.ConvHHMMfromMinute(dmApp.getValue("St3DelTime"), 0);
		app.lookup("TAWTD_ipbDelSummCondition").value	= dmApp.getValue("St3DelCondi");
		app.lookup("TAWTD_ipbSummMinTime").value		= util.ConvHHMMfromMinute(dmApp.getValue("St3Min"), 0);
		app.lookup("TAWTD_ipbSummMaxTime").value		= util.ConvHHMMfromMinute(dmApp.getValue("St3Max"), 0);
		app.lookup("TAWTD_cmbSumTrans").value			= dmApp.getValue("St3Trans");
		break;
	case 3:
		dmApp = app.lookup("dmNightWorkDetailSetting");
		initValue["WorkDetailSetting"].copyToDataMap(dmApp);
		app.lookup("TAWTD_cmbTimeUnit").value 		= dmApp.getValue("Wt4Unit");
		app.lookup("TAWTD_ipbAddTime").value  		= util.ConvHHMMfromMinute(dmApp.getValue("Wt4AddTime"), 0);
		app.lookup("TAWTD_ipbAddCondition").value 	= util.ConvHHMMfromMinute(dmApp.getValue("Wt4AddCondi"), 0);
		app.lookup("TAWTD_ipbDelTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt4DelTime"),0);
		app.lookup("TAWTD_ipbDelCondition").value  	= util.ConvHHMMfromMinute(dmApp.getValue("Wt4DelCondi"),0);
		app.lookup("TAWTD_ipbMinTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt4Min"),0);
		app.lookup("TAWTD_ipbMaxTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt4Max"),0);
		app.lookup("TAWTD_nbeTimeRate").value 		= dmApp.getValue("Wt4Rate");
		
		app.lookup("TAWTD_ipbAddSumm").value			= util.ConvHHMMfromMinute(dmApp.getValue("St4AddTime"), 0);
		app.lookup("TAWTD_ipbAddSummCondition").value	= dmApp.getValue("St4AddCondi");
		app.lookup("TAWTD_ipbDelSumm").value			= util.ConvHHMMfromMinute(dmApp.getValue("St4DelTime"), 0);
		app.lookup("TAWTD_ipbDelSummCondition").value	= dmApp.getValue("St4DelCondi");
		app.lookup("TAWTD_ipbSummMinTime").value		= util.ConvHHMMfromMinute(dmApp.getValue("St4Min"), 0);
		app.lookup("TAWTD_ipbSummMaxTime").value		= util.ConvHHMMfromMinute(dmApp.getValue("St4Max"), 0);
		app.lookup("TAWTD_cmbSumTrans").value			= dmApp.getValue("St4Trans");
		break;
	case 4:
		dmApp = app.lookup("dmHolidayWorkDetailSetting");
		initValue["WorkDetailSetting"].copyToDataMap(dmApp);
		app.lookup("TAWTD_cmbTimeUnit").value 		= dmApp.getValue("Wt5Unit");
		app.lookup("TAWTD_ipbAddTime").value  		= util.ConvHHMMfromMinute(dmApp.getValue("Wt5AddTime"), 0);
		app.lookup("TAWTD_ipbAddCondition").value 	= util.ConvHHMMfromMinute(dmApp.getValue("Wt5AddCondi"), 0);
		app.lookup("TAWTD_ipbDelTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt5DelTime"),0);
		app.lookup("TAWTD_ipbDelCondition").value  	= util.ConvHHMMfromMinute(dmApp.getValue("Wt5DelCondi"),0);
		app.lookup("TAWTD_ipbMinTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt5Min"),0);
		app.lookup("TAWTD_ipbMaxTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt5Max"),0);
		app.lookup("TAWTD_nbeTimeRate").value 		= dmApp.getValue("Wt5Rate");
		
		app.lookup("TAWTD_ipbAddSumm").value			= util.ConvHHMMfromMinute(dmApp.getValue("St5AddTime"), 0);
		app.lookup("TAWTD_ipbAddSummCondition").value	= dmApp.getValue("St5AddCondi");
		app.lookup("TAWTD_ipbDelSumm").value			= util.ConvHHMMfromMinute(dmApp.getValue("St5DelTime"), 0);
		app.lookup("TAWTD_ipbDelSummCondition").value	= dmApp.getValue("St5DelCondi");
		app.lookup("TAWTD_ipbSummMinTime").value		= util.ConvHHMMfromMinute(dmApp.getValue("St5Min"), 0);
		app.lookup("TAWTD_ipbSummMaxTime").value		= util.ConvHHMMfromMinute(dmApp.getValue("St5Max"), 0);
		app.lookup("TAWTD_cmbSumTrans").value			= dmApp.getValue("St5Trans");
		break;
	case 5:
		dmApp = app.lookup("dmOverWorkDetailSetting2");
		initValue["WorkDetailSetting"].copyToDataMap(dmApp);
		app.lookup("TAWTD_cmbTimeUnit").value 		= dmApp.getValue("Wt6Unit");
		app.lookup("TAWTD_ipbAddTime").value  		= util.ConvHHMMfromMinute(dmApp.getValue("Wt6AddTime"), 0);
		app.lookup("TAWTD_ipbAddCondition").value 	= util.ConvHHMMfromMinute(dmApp.getValue("Wt6AddCondi"), 0);
		app.lookup("TAWTD_ipbDelTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt6DelTime"),0);
		app.lookup("TAWTD_ipbDelCondition").value  	= util.ConvHHMMfromMinute(dmApp.getValue("Wt6DelCondi"),0);
		app.lookup("TAWTD_ipbMinTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt6Min"),0);
		app.lookup("TAWTD_ipbMaxTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt6Max"),0);
		app.lookup("TAWTD_nbeTimeRate").value 		= dmApp.getValue("Wt6Rate");
		
		app.lookup("TAWTD_ipbAddSumm").value			= util.ConvHHMMfromMinute(dmApp.getValue("St6AddTime"), 0);
		app.lookup("TAWTD_ipbAddSummCondition").value	= dmApp.getValue("St6AddCondi");
		app.lookup("TAWTD_ipbDelSumm").value			= util.ConvHHMMfromMinute(dmApp.getValue("St6DelTime"), 0);
		app.lookup("TAWTD_ipbDelSummCondition").value	= dmApp.getValue("St6DelCondi");
		app.lookup("TAWTD_ipbSummMinTime").value		= util.ConvHHMMfromMinute(dmApp.getValue("St6Min"), 0);
		app.lookup("TAWTD_ipbSummMaxTime").value		= util.ConvHHMMfromMinute(dmApp.getValue("St6Max"), 0);
		app.lookup("TAWTD_cmbSumTrans").value			= dmApp.getValue("St6Trans");
		break;
	default:
		dmApp = app.lookup("dmBasicWorkDetailSetting");
		initValue["WorkDetailSetting"].copyToDataMap(dmApp);
		app.lookup("TAWTD_cmbTimeUnit").value 		= dmApp.getValue("Wt1Unit");
		app.lookup("TAWTD_ipbAddTime").value  		= util.ConvHHMMfromMinute(dmApp.getValue("Wt1AddTime"), 0);
		app.lookup("TAWTD_ipbAddCondition").value 	= util.ConvHHMMfromMinute(dmApp.getValue("Wt1AddCondi"), 0);
		app.lookup("TAWTD_ipbDelTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt1DelTime"),0);
		app.lookup("TAWTD_ipbDelCondition").value  	= util.ConvHHMMfromMinute(dmApp.getValue("Wt1DelCondi"),0);
		app.lookup("TAWTD_ipbMinTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt1Min"),0);
		app.lookup("TAWTD_ipbMaxTime").value 		= util.ConvHHMMfromMinute(dmApp.getValue("Wt1Max"),0);
		app.lookup("TAWTD_nbeTimeRate").value 		= dmApp.getValue("Wt1Rate");
		
		app.lookup("TAWTD_ipbAddSumm").value			= util.ConvHHMMfromMinute(dmApp.getValue("St1AddTime"), 0);
		app.lookup("TAWTD_ipbAddSummCondition").value	= dmApp.getValue("St1AddCondi");
		app.lookup("TAWTD_ipbDelSumm").value			= util.ConvHHMMfromMinute(dmApp.getValue("St1DelTime"), 0);
		app.lookup("TAWTD_ipbDelSummCondition").value	= dmApp.getValue("St1DelCondi");
		app.lookup("TAWTD_ipbSummMinTime").value		= util.ConvHHMMfromMinute(dmApp.getValue("St1Min"), 0);
		app.lookup("TAWTD_ipbSummMaxTime").value		= util.ConvHHMMfromMinute(dmApp.getValue("St1Max"), 0);
		app.lookup("TAWTD_cmbSumTrans").value			= dmApp.getValue("St1Trans");
		break;
	}
	
	app.lookup("TAWTD_grpWorkDetailSetting").redraw();
}


/*
 * "취 소" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTAWTD_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tAWTD_btnCancel = e.control;
	app.close();	
}


/*
 * "설 정" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTAWTD_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tAWTD_btnApply = e.control;
	var arrColumnNames = dmApp.getColumnNames();
	// Make Data
	var WtUnit = app.lookup("TAWTD_cmbTimeUnit").value 	
	var WtAddTime = util.ConvHHMMtoMinute(app.lookup("TAWTD_ipbAddTime").value);
	if(WtAddTime < 0) {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorTNAAddTime"));	
		return;
	}
	var WtAddCondi = util.ConvHHMMtoMinute(app.lookup("TAWTD_ipbAddCondition").value);
	 if(WtAddCondi < 0) {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorTNAAddCondition"));	
		return;
	}	
	var WtDelTime = util.ConvHHMMtoMinute(app.lookup("TAWTD_ipbDelTime").value );
	 if(WtDelTime < 0) {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorTNADelTime"));	
		return;
	}	
	var WtDelCondi = util.ConvHHMMtoMinute(app.lookup("TAWTD_ipbDelCondition").value );
	 if(WtDelCondi < 0) {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorTNADelCondition"));	
		return;
	}		
	var WtMinTime = util.ConvHHMMtoMinute(app.lookup("TAWTD_ipbMinTime").value);
	 if(WtMinTime < 0) {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorTNAMinTime"));	
		return;
	}
	var WtMaxTime = util.ConvHHMMtoMinute(app.lookup("TAWTD_ipbMaxTime").value );
	 if(WtMaxTime < 0) {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorTNAMaxTime"));	
		return;
	}
	var WtRate = app.lookup("TAWTD_nbeTimeRate").value 	
	var StAddSumm = util.ConvHHMMtoMinute(app.lookup("TAWTD_ipbAddSumm").value);
	 if(StAddSumm < 0) {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorTNAAddSumm"));	
		return;
	}
	var StAddCondi = util.ConvHHMMtoMinute(app.lookup("TAWTD_ipbAddSummCondition").value);
	 if(StAddCondi < 0) {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorTNAAddSummCondition"));	
		return;
	}
	var StDelSumm = util.ConvHHMMtoMinute(app.lookup("TAWTD_ipbDelSumm").value);
	 if(StDelSumm < 0) {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorTNADelSumm"));	
		return;
	}
	var StDelCondi = util.ConvHHMMtoMinute(app.lookup("TAWTD_ipbDelSummCondition").value);
	 if(StDelCondi < 0) {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorTNADelSummCondition"));	
		return;
	}		
	var StMinTime = util.ConvHHMMtoMinute(app.lookup("TAWTD_ipbSummMinTime").value	);
	 if(StMinTime < 0) {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorTNASummMinTime"));	
		return;
	}			
	var StMaxTime = util.ConvHHMMtoMinute(app.lookup("TAWTD_ipbSummMaxTime").value);
	 if(StMaxTime < 0) {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorTNASummMaxTime"));	
		return;
	}		
	var StTrans = app.lookup("TAWTD_cmbSumTrans").value
	
	
	dmApp.setValue(arrColumnNames[1], _popupType);
	dmApp.setValue(arrColumnNames[2], WtUnit);
	dmApp.setValue(arrColumnNames[3], WtAddTime);
	dmApp.setValue(arrColumnNames[4], WtAddCondi);
	dmApp.setValue(arrColumnNames[5], WtDelTime);
	dmApp.setValue(arrColumnNames[6], WtDelCondi);
	dmApp.setValue(arrColumnNames[7], WtMinTime);
	dmApp.setValue(arrColumnNames[8], WtMaxTime);
	dmApp.setValue(arrColumnNames[9], WtRate);
	dmApp.setValue(arrColumnNames[10], _popupType);
	dmApp.setValue(arrColumnNames[11], StAddSumm);
	dmApp.setValue(arrColumnNames[12], StAddCondi);
	dmApp.setValue(arrColumnNames[13], StDelSumm);
	dmApp.setValue(arrColumnNames[14], StDelCondi);
	dmApp.setValue(arrColumnNames[15], StMinTime);
	dmApp.setValue(arrColumnNames[16], StMaxTime);
	dmApp.setValue(arrColumnNames[17], StTrans);
	
	app.setHostProperty("returnValue", dmApp);
	app.close();	
}
