/************************************************
 * MealLabel.js
 * Created at Nov 26, 2020 3:32:56 PM.
 *
 * @author EVN0025
 ************************************************/

var utils = cpr.core.Module.require("lib/Utils");

var imagesSrc = [
	"/theme/images/mobile/common_colorchip_red.png", // breakfast
	"/theme/images/mobile/common_colorchip_skyblue.png", // lunch
	"/theme/images/mobile/common_colorchip_yellow.png", // snack
	"/theme/images/mobile/common_colorchip_navy.png", // dinner
	"/theme/images/mobile/common_colorchip_green.png" // midnight
]

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var type = app.getAppProperty("meaType");
	app.lookup("label").value = utils.getMealType(type);
	app.lookup("image").src = imagesSrc[type - 1]
}
