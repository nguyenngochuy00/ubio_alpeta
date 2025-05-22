/************************************************
 * WorkCalendar.js
 * Created at Oct 1, 2020 10:21:48 AM.
 *
 * @author EVN0025
 ************************************************/

var calendar = false;
var config = getConfig();
var oShell
var calendarData;
var currentTime = moment();
var lodashModule = cpr.core.Module.require("lib/Lodash");
var lodash = lodashModule._;

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function() {
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

/*
 * Triggered when init event is fired from Shell.
 */
function onWorkCalendarInit( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var workCalendar = e.control;
	if (calendar) {
		return e.preventDefault();
	}
}

/*
 * Triggered when load event is fired from Shell.
 */
function onWorkCalendarLoad( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var workCalendar = e.control;
	oShell = e.content;
	oShell.innerHTML = '<div id="calendar"></div>';
	var preSelectedId;
	
	calendar = $("#calendar").zabuto_calendar({
		year: parseInt(currentTime.format("YYYY"), 10),
		month: parseInt(currentTime.format("MM"), 10),
		nav_icon: {
			prev: '<img src="/theme/images/mobile/common_day_btn_arrow_left@3x.png" style="width: 10px; height: 10px; display: block; outline: none;">',
			next: '<img src="/theme/images/mobile/common_day_btn_arrow_right@3x.png" style="width: 10px; height: 10px; display: block; outline: none;">',
		},
		action_nav: function(e) {
			
			if (this.id.includes("nav-next")) {
				app.dispatchEvent(new cpr.events.CUIEvent("onNextBtnClicked"));
			} else {
				app.dispatchEvent(new cpr.events.CUIEvent("onPreBtnClicked"));
			}
		},
		data: calendarData,
		action: function() {
			if (this.id === preSelectedId) {
				return;
			}
			var date = $("#" + this.id).data("date");
			$("#" + this.id + " > div > span").addClass("today");
			var selectID = preSelectedId || calendar[0].id + "_" + moment().format("YYYY-MM-DD");
			$("#" + selectID + " > div > span").removeClass("today");
			preSelectedId = this.id
			app.dispatchEvent(new cpr.events.CUIEvent("onDateSelected", {
				content: {
					date: date
				}
			}));
		}
	});
	
	console.log(calendar[0].id, "calendar load");
}

/*
 * Triggered when click event is fired from Output "이번달"(thisMonth).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onThisMonthClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Output
	 */
	var thisMonth = e.control;
	app.dispatchEvent(new cpr.events.CUIEvent("onThisMonthBtnClicked"));
}

exports.render = function(data, time) {
	currentTime = time;
	var daysInMonth = [];
	
	if (moment(time).format("YYYY.MM") === moment().format("YYYY.MM")) {
		app.lookup("thisMonth").style.css({
			"background-color": "#BFBFBF"
		})
		app.lookup("thisMonth").enabled = false;
	} else {
		app.lookup("thisMonth").style.css({
			"background-color": "#00B7CC"
		})
		app.lookup("thisMonth").enabled = true;
	}
	var monthDate = moment(time).startOf('month');
	
	lodash.times(monthDate.daysInMonth(), function(n) {
		daysInMonth.push({
			date: monthDate.format('YYYY-MM-DD'),
			type: "closed"
		});
		monthDate.add(1, 'day');
	});
	calendarData = lodash.map(daysInMonth, function(item) {
		return lodash.merge(item, lodash.find(data, {
			'date': item.date
		}));
	});
	
	if (!oShell) {
		return;
	}
	var preSelectedId;
	oShell.innerHTML = '<div id="calendar"></div>';
	calendar = $("#calendar").zabuto_calendar({ //language:"en"});
		year: parseInt(currentTime.format("YYYY"), 10),
		month: parseInt(currentTime.format("MM"), 10),
		nav_icon: {
			prev: '<img src="/theme/images/mobile/common_day_btn_arrow_left@3x.png" style="width: 10px; height: 10px; display: block; outline: none;">',
			next: '<img src="/theme/images/mobile/common_day_btn_arrow_right@3x.png" style="width: 10px; height: 10px; display: block; outline: none;">',
		},
		data: calendarData,
		action_nav: function(e) {
			if (this.id.includes("nav-next")) {
				app.dispatchEvent(new cpr.events.CUIEvent("onNextBtnClicked"));
			} else {
				app.dispatchEvent(new cpr.events.CUIEvent("onPreBtnClicked"));
			}
		},
		action: function() {
			if (this.id === preSelectedId) {
				return;
			}
			var date = $("#" + this.id).data("date");
			$("#" + this.id + " > div > span").addClass("today");
			var selectID = preSelectedId || calendar[0].id + "_" + moment().format("YYYY-MM-DD");
			$("#" + selectID + " > div > span").removeClass("today");
			preSelectedId = this.id
			app.dispatchEvent(new cpr.events.CUIEvent("onDateSelected", {
				content: {
					date: date
				}
			}));
		}
	});
	
	console.log(calendar[0].id, "calendar render");
}