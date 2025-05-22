/************************************************
 * OptionPageMail.js
 * Created at 2019. 5. 1. 오전 10:23:05.
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
	var dmMail = app.lookup("OptionMail");
	/*
	app.lookup("cbx1").text = dataManager.getString("Str_OptionMailServiceUsing");
	app.lookup("cbx2").text = dataManager.getString("Str_OptionPhotoAttached");
	app.lookup("cbx3").text = dataManager.getString("Str_OptionTerminalDisconnect");
	app.lookup("cbx4").text = dataManager.getString("Str_OptionTerminalTamper");
	app.lookup("cbx5").text = dataManager.getString("Str_OptionAuthFail");
	app.lookup("cbx6").text = dataManager.getString("Str_OptionDoorNotClosed");
	app.lookup("cbx7").text = dataManager.getString("Str_OptionNoPermission");
	app.lookup("cbx8").text = dataManager.getString("Str_OptionLockError");
	app.lookup("cbx9").text = dataManager.getString("Str_OptionDuress");
	app.lookup("cbx10").text = dataManager.getString("Str_OptionEmergencyState");
	app.lookup("cbx11").text = dataManager.getString("Str_OptionDoorLockError");
	*/
	hostApp.callAppMethod("getMailData").copyToDataMap(dmMail);
	
	app.lookup("SEAUT_grpMain").redraw();
}


/*
 * Body에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
//function onBodyUnload(/* cpr.events.CEvent */ e){
//	var hostApp = app.getHostAppInstance();
//	hostApp.callAppMethod("setMailData", app.lookup("OptionMail"));
//}
exports.requestSetData = function() {
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setMailData", app.lookup("OptionMail"));
}