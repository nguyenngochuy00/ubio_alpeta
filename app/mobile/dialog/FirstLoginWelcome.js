/************************************************
 * Welcome.js
 * Created at Sep 11, 2020 2:20:21 PM.
 *
 * @author EVN0025
 ************************************************/

var auth = cpr.core.Module.require("lib/Auth");


/*
 * Triggered when click event is fired from Output "확인"(confirmBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onConfirmBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var confirmBtn = e.control;
	var loggedUser = auth.getAuthenticatedUser();
	loggedUser.FirstLoginFlag = 0;
	localStorage.setItem("FirstLoginFlag", 1)
	app.close();
}


/*
 * Triggered when click event is fired from Output "다시 보지 않기"(ignoreBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onIgnoreBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var ignoreBtn = e.control;
	var loggedUser = auth.getAuthenticatedUser();
	loggedUser.FirstLoginFlag = 0;
	localStorage.setItem("FirstLoginFlag", 1)
	app.close();
}
