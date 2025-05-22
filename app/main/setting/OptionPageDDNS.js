/************************************************
 * OptionPageDDNS.js
 * Created at 2019. 4. 30. 오전 8:21:39.
 *
 * @author wonki
 ************************************************/

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var hostApp = app.getHostAppInstance();
	var dmDDNS = app.lookup("OptionDDNS");
	
	// 포트번호로 숫자만 입력할 수 있도록 한다.
	app.lookup("ipbPort1").inputFilter = "[0-9]"; 
	app.lookup("ipbPort2").inputFilter = "[0-9]";
	hostApp.callAppMethod("getDDNSData").copyToDataMap(dmDDNS);
	
	app.lookup("SEDDNS_grpMain").redraw();
}

/*
 * Body에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
//function onBodyUnload(/* cpr.events.CEvent */ e){
//	var hostApp = app.getHostAppInstance();
//	hostApp.callAppMethod("setDDNSData", app.lookup("OptionDDNS"));
//}
exports.requestSetData = function() {
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setDDNSData", app.lookup("OptionDDNS"));
}
