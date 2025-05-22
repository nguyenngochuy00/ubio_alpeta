/************************************************
 * ExtendedWorkingHours.js
 * Created at Sep 30, 2020 9:22:39 AM.
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

function render() {
	app.lookup("workDate").value = moment(app.getAppProperty("workDate"), "YYYY.MM.DD").format("MM.DD");
	// 0:Ingnore, 1:Go work, 2:Absent
	
	if (app.getAppProperty("workTime") === 0) {
		app.lookup("workStatusIcon").style.css({
			"background-image": "url(images/timeline_badge_bg_gray@3x.png)"
		})
		app.lookup("checkInTime").value = "--:--"
		app.lookup("checkoutTime").value = "--:--"
	} else if (app.getAppProperty("workTime") > 8) {
		app.lookup("workStatusIcon").style.css({
			"background-image": "url(images/timeline_badge_bg_red@3x.png)"
		})
	}
	
}

/*
 * Triggered when property-change event is fired from Body.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(/* cpr.events.CPropertyChangeEvent */ e){
	render();
}
