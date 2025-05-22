/************************************************
 * OptionSystem.js
 * Created at 2019. 4. 29. 오후 2:30:16.
 *
 * @author wonki
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	var hostApp = app.getHostAppInstance();
	var dmElevator = app.lookup("OptionElevator");
	
	hostApp.callAppMethod("getElevatorData").copyToDataMap(dmElevator);
	console.log(dmElevator.getDatas());
	dataManager = getDataManager();
	app.lookup("SESYS_grpMain").redraw();
}

exports.requestSetData = function() {
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setElevatorData", app.lookup("OptionElevator"));

}

function initData() {
		
}
