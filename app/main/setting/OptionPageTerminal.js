/************************************************
 * OptionPageTerminal.js
 * Created at 2019. 4. 29. 오후 7:39:57.
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
	app.lookup("cbx1").text = dataManager.getString("Str_OptionControlterminalsinAccessGroup");
	app.lookup("cbx2").text = dataManager.getString("Str_OptionDooropen");
	app.lookup("cbx3").text = dataManager.getString("Str_OptionSoundalarm");
	app.lookup("cbx4").text = dataManager.getString("Str_OptionAutomaticallyterminates");
	app.lookup("cbx5").text = dataManager.getString("Str_OptionDooropen");
	app.lookup("cbx6").text = dataManager.getString("Str_OptionSoundalarm");
	app.lookup("cbx7").text = dataManager.getString("Str_OptionAutomaticallyterminates");
	app.lookup("cbx8").text = dataManager.getString("Str_OptionDooropen");
	app.lookup("cbx9").text = dataManager.getString("Str_OptionSoundalarm");
	app.lookup("cbx10").text = dataManager.getString("Str_OptionAutomaticallyterminates");
	
	if(dataManager.getOemVersion() == OEM_KANGWONLAND) {	//강원랜드.
		var cmb1 = app.lookup("cmb1");
		var cmb2 = app.lookup("cmb2");
		var cmb3 = app.lookup("cmb3");
		cmb1.addItem(new cpr.controls.Item("비상상황 그룹", 3));
		cmb2.addItem(new cpr.controls.Item("비상상황 그룹", 3));
		cmb3.addItem(new cpr.controls.Item("비상상황 그룹", 3));
	}
	var hostApp = app.getHostAppInstance();
	var dmTerminal = app.lookup("OptionTerminal");
	hostApp.callAppMethod("getTerminalData").copyToDataMap(dmTerminal);
	
	app.lookup("SETER_grpMain").redraw();
}


/*
 * Body에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
//function onBodyUnload(/* cpr.events.CEvent */ e){
//	var hostApp = app.getHostAppInstance();
//	hostApp.callAppMethod("setTerminalData", app.lookup("OptionTerminal"));
//}
exports.requestSetData = function() {
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setTerminalData", app.lookup("OptionTerminal"));
}