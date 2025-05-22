/************************************************
 * OptionPageLog.js
 * Created at 2019. 4. 29. 오후 8:31:56.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var hostApp = app.getHostAppInstance();
	var dmLog = app.lookup("OptionLog");
	
	hostApp.callAppMethod("getLogData").copyToDataMap(dmLog);
	/*
	app.lookup("SESLO_cbx1").text = dataManager.getString("Str_OptionSuccessLogSave");
	app.lookup("SESLO_cbx2").text = dataManager.getString("Str_OptionAuthLogDuplicateCheck");
	app.lookup("SESLO_cbx3").text = dataManager.getString("Str_OptionSystemLogSave");
	app.lookup("SESLO_cbx4").text = dataManager.getString("Str_OptionClientLoginSave"); 
	app.lookup("SESLO_cbx5").text = dataManager.getString("Str_OptionUserLogSave");
	app.lookup("SESLO_cbx6").text = dataManager.getString("Str_OptionUserLogSave");
	app.lookup("SESLO_cbx7").text = dataManager.getString("Str_OptionTerminalLogSave");
	app.lookup("SESLO_cbx8").text = dataManager.getString("Str_OptionGroupLogSave");
	app.lookup("SESLO_cbx9").text = dataManager.getString("Str_OptionPriviligeLogSave");
	app.lookup("SESLO_cbx10").text = dataManager.getString("Str_OptionTnaLogSave");
	app.lookup("SESLO_cbx11").text = dataManager.getString("Str_OptionMealLogSave");
	app.lookup("SESLO_cbx12").text = dataManager.getString("Str_OptionTerminalOptionModifyLogSave");
	app.lookup("SESLO_cbx13").text = dataManager.getString("Str_OptionTerminalUserLogSave");
	app.lookup("SESLO_cbx14").text = dataManager.getString("Str_OptionTerminalNetworkLogSave");
	app.lookup("SESLO_cbx15").text = dataManager.getString("Str_OptionTerminalDoorLogSave");
	*/
	app.lookup("SELOG_grpMain").redraw();
	app.lookup("SELOG_grpSaveOptionMain").redraw();
}


/*
 * Body에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
//function onBodyUnload(/* cpr.events.CEvent */ e){
//	var hostApp = app.getHostAppInstance();
//	hostApp.callAppMethod("setLogData", app.lookup("OptionLog"));
//}
exports.requestSetData = function() {
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setLogData", app.lookup("OptionLog"));
}

