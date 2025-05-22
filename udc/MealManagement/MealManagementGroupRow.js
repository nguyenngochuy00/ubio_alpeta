/************************************************
 * UserListInGroupRow.js
 * Created at Sep 22, 2020 9:53:41 AM.
 *
 * @author EVN0025
 ************************************************/

var utils = cpr.core.Module.require("lib/Utils");
var config = getConfig();
var totalMeal = 0;
var totalPay = 0;
var fetched = 0;
var currentTime;

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

function resetData() {
	totalMeal = 0;
	totalPay = 0;
	fetched = 0;
	app.lookup("MealResult").clear();
}



/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	currentTime = moment(app.getAppProperty("CurrentTime"), "YYYY-MM-DD")
	app.getHostAppInstance().addEventListener("changeDate", function(e) {
		currentTime = moment(e.content.date, "YYYY-MM-DD");
		resetData()
		fetchMealResult(0)
	});
	
	var smsGetPicture = app.lookup("smsGetPicture");
	smsGetPicture.setRequestActionUrl(config.apiHostResolution() + smsGetPicture.action.replace("{id}", app.getAppProperty("UserID")));
	smsGetPicture.send();
	
	fetchMealResult(0)
}

function fetchMealResult(offset) {
	
	var smsMealResult = app.lookup("smsMealResult");
	smsMealResult.setRequestActionUrl(config.apiHostResolution() + smsMealResult.action);
	smsMealResult.removeAllParameters();
	smsMealResult.addParameter("StartAt", currentTime.startOf("month").format('YYYY-MM-DD'));
	smsMealResult.addParameter("EndAt", currentTime.endOf("month").format('YYYY-MM-DD'));
	smsMealResult.addParameter("offset", offset || 0);
	smsMealResult.addParameter("limit", "100");
	smsMealResult.addParameter("searchCategory", "user_id");
	smsMealResult.addParameter("searchKeyword", app.getAppProperty("UserID"));
	smsMealResult.send();
	
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
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsMealResultBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealResult = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsMealResultReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealResult = e.control;
	hideLoading();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsMealResultSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsMealResult = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	app.lookup("MealResult").forEachOfUnfilteredRows(function(row) {
		totalPay = totalPay + row.getValue("Pay");
	});
	app.lookup("totalPay").value = utils.numberWithCommas(totalPay) + " " + cpr.I18N.INSTANCE.message("Str_Meal_Won");
	app.lookup("totalMeal").value = utils.numberWithCommas(app.lookup("Total").getValue("Count")) + " " + cpr.I18N.INSTANCE.message("Str_Meal_Time");
	
	fetched = fetched + app.lookup("MealResult").getRowCount();
	if (fetched <  app.lookup("Total").getValue("Count")) {
		fetchMealResult(fetched);
	} else {
		app.dispatchEvent(new cpr.events.CUIEvent("FetchDone", {
			content: {
				totalMeal: app.lookup("Total").getValue("Count"),
				totalPay: totalPay
			}
		}));
	}
}
