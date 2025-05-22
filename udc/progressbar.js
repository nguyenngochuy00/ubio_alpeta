/************************************************
 * ProgressBar.js
 * Created at Aug 27, 2020 1:46:52 PM.
 *
 * @author EVN0025
 ************************************************/
var utils = cpr.core.Module.require("lib/Utils");
var workColor = "#91C720";
var overWorkColor = "#91C720";

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

function render() {
	var progress = app.lookup("pgr1");
	var maxValue = app.getAppProperty("maxValue");
	var currentValue = app.getAppProperty("currentValue");
	app.lookup("currentValue").value = utils.converTimeNumberToString(currentValue, "hour") || "00:00";
	app.lookup("maxValue").value = utils.converTimeNumberToString(maxValue, "hour") || "00:00";
	var percent = currentValue/maxValue * 100;
	app.lookup("currentValue").style.css({
		"margin-left" : "calc(" + percent + "%" + " - 21px)",
	});
	app.lookup("pgr1").max = maxValue;
	app.lookup("pgr1").value = currentValue;
}



/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	render()
}


/*
 * Triggered when property-change event is fired from Body.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(/* cpr.events.CPropertyChangeEvent */ e){
	render()
}
