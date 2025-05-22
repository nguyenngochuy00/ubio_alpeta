/************************************************
 * SettingRowWithContent.js
 * Created at Nov 14, 2020 10:22:07 AM.
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
 * Triggered when property-change event is fired from Body.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(/* cpr.events.CPropertyChangeEvent */ e){
	app.lookup("rightText").value = app.getAppProperty("rightText");
	app.lookup("leftText").value = app.getAppProperty("leftText")
}
