/************************************************
 * inputMessage.js
 * Created at 2020. 12. 24. 오후 12:18:04.
 *
 * @author blue1
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	var initValue = app.getHost().initValue;
	app.lookup("INMSG_optTitle").value = initValue["title"];
}


/*
 * 버튼(INMSG_btnApply)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onINMSG_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var iNMSG_btnApply = e.control;
	
	var message = app.lookup("INMSG_ipbMessage").value;
	if (message == "" || message == null) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorNotInputMessage")); 
		return;
	} else {
		app.close(message);
	}
}


/*
 * 버튼(INMSG_btnClose)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onINMSG_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	app.close("");	
}
