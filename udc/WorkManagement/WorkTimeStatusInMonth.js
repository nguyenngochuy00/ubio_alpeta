/************************************************
 * WorkTimeStatusInMonth.js
 * Created at Sep 29, 2020 9:40:17 AM.
 *
 * @author EVN0025
 ************************************************/

var current = moment();
var maxBasicWorkTimeMonth = 40;
var maxOverWorkTimeMonth = 12;
var utils = cpr.core.Module.require("lib/Utils");

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

function render() {
	var overWorkTime = app.getAppProperty("overWorkTime");
	var basicWorkTime = app.getAppProperty("basicWorkTime");
	var maxBasicWorkTimeMonth = app.getAppProperty("maxBasicWorkTime");
	var maxOverWorkTimeMonth = app.getAppProperty("maxOverWorkTime");
	
	app.lookup("overWorkTimeMonth").value = overWorkTime  || "00:00";
	app.lookup("basicWorkTimeMonth").value = basicWorkTime || "00:00";
	
	app.lookup("maxBasicWorkTimeMonth").value = maxBasicWorkTimeMonth;
	app.lookup("maxOverWorkTimeMonth").value = maxOverWorkTimeMonth;
	
	app.lookup("basicWorkTimeMonthBar").value = utils.calculateWorkTimeSideBar(basicWorkTime, maxBasicWorkTimeMonth);
	app.lookup("overWorkTimeMonthBar").value = utils.calculateWorkTimeSideBar(overWorkTime, maxOverWorkTimeMonth);
}

function renderTime() {
	var now = app.lookup("now");
	if(app.getAppProperty("periodTime") === "Day") {
		now.value = moment(current).format("MM.DD");
	} else {
		now.value = moment(current).startOf('isoWeek').format("MM.DD") + " ~ " + moment(current).endOf('isoWeek').format("MM.DD");
	}
	if (moment(current).format("MM.DD") === moment().format("MM.DD")) {
		app.lookup("thisMonth").style.css({
			"background-color": "#BFBFBF"
		});
		app.lookup("thisMonth").enabled = false;
	} else {
		app.lookup("thisMonth").style.css({
			"background-color": "#00B7CC"
		});
		app.lookup("thisMonth").enabled = true;
	}
}

/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPreMonthClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var preMonth = e.control;
	if(app.getAppProperty("periodTime") === "Day") {
		current = moment(current).subtract(1, "days")
	} else {
		current = moment(current).subtract(1, "weeks")
	}
	
	var preMonthClick = new cpr.events.CUIEvent("PreMonthClick", {
		content: {
			current: current
		}
	});
  	app.dispatchEvent(preMonthClick);
  	renderTime()
}


/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onNextMonthClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var nextMonth = e.control;
	if(app.getAppProperty("periodTime") === "Day") {
		current = moment(current).add(1, "days")
	} else {
		current = moment(current).add(1, "weeks")
	}
	
	var nextMonthClick = new cpr.events.CUIEvent("NextMonthClick", {
		content: {
			current: current
		}
	});
  	app.dispatchEvent(nextMonthClick);
  	renderTime()
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	if(app.getAppProperty("periodTime") === "Day") {
		app.lookup("thisMonth").value = cpr.I18N.INSTANCE.message("Str_Work_Today");
	}
	renderTime()
	render();
}


/*
 * Triggered when click event is fired from Output "이번달"(thisMonth).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onThisMonthClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var thisMonth = e.control;
	current = moment();
	renderTime()
}



/*
 * Triggered when property-change event is fired from Body.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(/* cpr.events.CPropertyChangeEvent */ e){
	render();
}
