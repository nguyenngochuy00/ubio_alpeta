/************************************************
 * terminalOptionPageVMS.js
 * Created at 2019. 1. 9. 오후 12:13:59.
 *
 * @author joymrk
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
}

/*
 * "실시간 영상" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var path;
	path = "app/main/terminals/commonPage/terminalVMScamera" + "?" + usint_version;
	
	console.log(path);
	app.getRootAppInstance().openDialog(path, {width: 850, height: 650}, function(dialog){
		dialog.modal = false;
	}).then(function(returnValue){
		;
	});
}
