/************************************************
 * UserManagementRow.js
 * Created at Sep 16, 2020 3:43:12 PM.
 *
 * @author EVN0025
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAccessGroupBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var accessGroupBtn = e.control;
	app.dispatchEvent(new cpr.events.CUIEvent("GroupRowClick"));	
}
