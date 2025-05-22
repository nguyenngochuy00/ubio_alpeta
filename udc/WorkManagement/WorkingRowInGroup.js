/************************************************
 * UserListInGroupRow.js
 * Created at Sep 22, 2020 9:53:41 AM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var utils = cpr.core.Module.require("lib/Utils");
var now;

function getWorkTime(input) {
	switch(input){
		case "Day" :
			return {
				basic: "08:00",
				overWork: "04:00",
				total: "12:00"
			}
			break;
		case "Week" :
			return {
				basic: "40:00",
				overWork: "12:00",
				total: "52:00"
			}
			break;
		case "Month" :
			return {
				basic: "160:00",
				overWork: "48:00",
				total: "208:00"
			}
			break;
		default :
			break;
	}
}

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
	now = moment(app.getAppProperty("Time"), "YYYY.MM.DD")
	console.log(app.getAppProperty("periodTime"));
	var smsGetPicture = app.lookup("smsGetPicture");
	smsGetPicture.setRequestActionUrl(config.apiHostResolution() + smsGetPicture.action.replace("{id}", app.getAppProperty("UserID")));
	smsGetPicture.send();

	var smsGetTnaPeriodWorkTime = app.lookup("smsGetTnaPeriodWorkTime");
	smsGetTnaPeriodWorkTime.removeAllParameters();
	smsGetTnaPeriodWorkTime.setRequestActionUrl(config.apiHostResolution() + smsGetTnaPeriodWorkTime.action);
	
	if (app.getAppProperty("periodTime") === "Week") {
		smsGetTnaPeriodWorkTime.addParameter("startDate", now.startOf('isoWeek').format("YYYY-MM-DD"));
		smsGetTnaPeriodWorkTime.addParameter("endDate", now.endOf('isoWeek').format("YYYY-MM-DD"));
	} else if (app.getAppProperty("periodTime") === "Day") {
		smsGetTnaPeriodWorkTime.addParameter("startDate", now.format("YYYY-MM-DD"));
		smsGetTnaPeriodWorkTime.addParameter("endDate", now.format("YYYY-MM-DD"));
	} else if (app.getAppProperty("periodTime") === "Month") {
		smsGetTnaPeriodWorkTime.addParameter("startDate", now.startOf('month').format("YYYY-MM-DD"));
		smsGetTnaPeriodWorkTime.addParameter("endDate", now.endOf('month').format("YYYY-MM-DD"));
	}

	smsGetTnaPeriodWorkTime.addParameter("searchCategory", "id");
	smsGetTnaPeriodWorkTime.addParameter("searchKeyword", parseInt(app.getAppProperty("UserID"), 10));
	smsGetTnaPeriodWorkTime.addParameter("offset", 0);
	smsGetTnaPeriodWorkTime.addParameter("limit", 10);
	smsGetTnaPeriodWorkTime.send();
	
	app.lookup("totalWorkTime").value = getWorkTime(app.getAppProperty("periodTime")).basic;
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetPictureBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetPicture = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetPictureReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetPicture = e.control;
	hideLoading();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetPictureSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetPicture = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		var image = app.lookup("PictureInfo");
		if (image) {
			app.lookup("userPicture").value = app.lookup("PictureInfo").getValue("Picture");
			app.lookup("userPicture").src = "data:image/" + image.getValue("ImageType") + ";base64," + image.getValue("Picture");
			app.lookup("userPicture").style.css({
				"border-radius": "25px"
			});
		}
	}
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetTnaPeriodWorkTimeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTnaPeriodWorkTime = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		
		if (app.lookup("WorkTimeList").getRowCount() > 0) {
			var workTime = app.lookup("WorkTimeList").getRow(0)
			app.lookup("currentWorkTime").value = workTime.getValue("BasicWorkTime");
			app.lookup("overWorkTime").value = workTime.getValue("OverWorkTime");
			app.lookup("basicWorkTime").value = workTime.getValue("BasicWorkTime");
			app.lookup("totalWorkTime").value = getWorkTime(app.getAppProperty("periodTime")).total;
			app.lookup("basicWorkTimeBar").value = utils.calculateWorkTimeSideBar(workTime.getValue("BasicWorkTime"), getWorkTime(app.getAppProperty("periodTime")).basic);
			app.lookup("overWorkTimeBar").value = utils.calculateWorkTimeSideBar(workTime.getValue("OverWorkTime"), getWorkTime(app.getAppProperty("periodTime")).overWork);
		}	
	}
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetTnaPeriodWorkTimeBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTnaPeriodWorkTime = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetTnaPeriodWorkTimeReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTnaPeriodWorkTime = e.control;
	hideLoading();
}
