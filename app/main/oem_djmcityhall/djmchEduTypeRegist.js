/************************************************
 * djmchEduTypeRegist.js
 * Created at 2021. 7. 2. 오전 11:39:05.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();	
}


/*
 * 버튼(DJMCETR_btnRegist)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDJMCETR_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dJMCETR_btnRegist = e.control;
	var EduTypeInfo = app.lookup("eduTypeInfo");
	app.close({"Result":0,"eduTypeInfo":EduTypeInfo.getDatas()});
}


/*
 * 버튼(DJMCETR_btnCancel)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDJMCETR_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dJMCETR_btnCancel = e.control;
	app.close({"Result":1});
}
