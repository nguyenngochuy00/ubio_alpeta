/************************************************
 * AprovalPopup.js
 * Created at Nov 10, 2020 1:09:44 PM.
 *
 * @author EVN0025
 ************************************************/



/*
 * Triggered when click event is fired from Output "취소"(cancelBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onCancelBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var cancelBtn = e.control;
	app.close()
}


/*
 * Triggered when click event is fired from Output "거절"(endBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onEndBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var endBtn = e.control;
	var approveEvent = new cpr.events.CUIEvent("Approve");
  	app.dispatchEvent(approveEvent);
}
