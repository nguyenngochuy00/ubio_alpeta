/************************************************
 * OptionPageInnodep.js
 * Created at 2020. 4. 21. 오후 12:57:56.
 *
 * @author union
 ************************************************/



/*
 * 데이터맵에서 load 이벤트 발생 시 호출.
 * build 메소드에 의해 데이터 구조가 재구성될 때 발생하는 이벤트. 초기 생성시에도 발생합니다.
 */
function onOptionInnodepLoad(/* cpr.events.CDataEvent */ e){
	/** 
	 * @type cpr.data.DataMap
	 */
	var optionInnodep = e.control;
	
	
	
}

exports.requestSetData = function() {
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setInnodepData", app.lookup("OptionInnodep"));
	
	console.log(app.lookup("OptionInnodep"));
}

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	
	
	var hostApp = app.getHostAppInstance();
	var dmInnodep = app.lookup("OptionInnodep");
	
	hostApp.callAppMethod("getInnodepData").copyToDataMap(dmInnodep);
	
	app.lookup("Vms_grpMain").redraw();
}
