/************************************************
 * OptionPageAuth.js
 * Created at 2019. 4. 29. 오후 8:22:15.
 *
 * @author wonki
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
var OEM_VERSION;
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	OEM_VERSION = dataManager.getOemVersion();
	
	var hostApp = app.getHostAppInstance();
	var dmOptionVisitor = app.lookup("OptionVisitor");
	hostApp.callAppMethod("getVisitorData").copyToDataMap(dmOptionVisitor);
	
	app.lookup("GEVIS_ipbWebPort").inputFilter = "[0-9]"; // 숫자만 가능
	app.lookup("GEVIS_ipbWebAddress").inputFilter = "[0-9|a-zA-Z|\.\:]"; // 숫자와 영문, 마침표와 쌍점만 가능
	
	//	현대 엠시트 방문자 만료일 기간 옵션 - zzik
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		app.lookup("OPV_grpExpirationDateOption").visible = true;
	}

	app.lookup("GEVIS_grpMain").redraw();
}

exports.requestSetData = function() {
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setVisitorData", app.lookup("OptionVisitor"));
}

