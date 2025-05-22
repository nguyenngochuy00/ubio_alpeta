/************************************************
 * LogNotFoundPopup.js
 * Created at Oct 21, 2020 1:31:54 PM.
 *
 * @author EVN0025
 ************************************************/



/*
 * Triggered when click event is fired from Output "로그아웃"(endBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onEndBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var endBtn = e.control;
	app.close();
}
