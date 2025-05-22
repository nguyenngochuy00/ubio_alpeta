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
	var groupRowClickEvent = new cpr.events.CUIEvent("GroupRowClick", {
		content: {
			group: {
				ID: app.getAppProperty("GroupID"),
				Name: app.getAppProperty("GroupName"),
				UsersInGroup: app.getAppProperty("UsersPerGroup")
			}
		}
	});
	app.dispatchEvent(groupRowClickEvent);
}


/*
 * Triggered when property-change event is fired from Body.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(/* cpr.events.CPropertyChangeEvent */ e){
	app.lookup("userCount").value = app.getAppProperty("UsersPerGroup") + cpr.I18N.INSTANCE.message("Str_UsrCount")
}
