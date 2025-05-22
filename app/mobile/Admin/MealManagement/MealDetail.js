/************************************************
 * MealDetail.js
 * Created at Nov 5, 2020 2:32:16 PM.
 *
 * @author EVN0025
 ************************************************/
var utils = cpr.core.Module.require("lib/Utils");
var mealDetailTotalRow;
var currentMonth = moment();
var config = getConfig();
var fetched = 0;
var divideTime;

var groupByDate = [];

/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onNavigationBarLeftBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.NavigationBar
	 */
	var navigationBar = e.control;
	if (app.isEmbeddedAppInstance()) {
		app.close();
	} else {
		cpr.core.App.load("app/mobile/MainPage", function(loadedApp){
			loadedApp.createNewInstance().run(null, function(createdApp) {
				createdApp.getContainer().style.animateFrom({	
					"transform": "translateX(-100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			})
		});
	}
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	currentMonth = moment(app.getAppProperty("CurrentTime"), "YYYY-MM-DD");
	renderTime()
	fetchMealResult(0)
}

function renderTime() {
	var dateString = currentMonth.format("YYYY.MM")
	if (dateString !== moment().format("YYYY.MM")) {
		app.lookup("thisMonth").enabled = true;
		app.lookup("thisMonth").style.css({
			"background-color": "#00B7CC"
		});
	} else {	
		app.lookup("thisMonth").enabled = false;
		app.lookup("thisMonth").style.css({
			"background-color": "#BFBFBF"
		});
	}
	app.lookup("currentMonth").value = dateString;
}

function fetchMealResult(offset) {
	var smsMealResult = app.lookup("smsMealResult");
	smsMealResult.setRequestActionUrl(config.apiHostResolution() + smsMealResult.action);
	smsMealResult.removeAllParameters();
	smsMealResult.addParameter("StartAt", currentMonth.startOf("month").format("YYYY-MM-DD"));
	smsMealResult.addParameter("EndAt", currentMonth.endOf("month").format("YYYY-MM-DD"));
	smsMealResult.addParameter("offset", offset);
	smsMealResult.addParameter("limit", "100");
	smsMealResult.addParameter("searchCategory", "user_id");
	smsMealResult.addParameter("searchKeyword", parseInt(app.getAppProperty("UserID"), 10));
	smsMealResult.send();
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
	app.lookup("mealResultList").removeAllChildren();
	var mealDetailTotalRow = new udc.MealManagement.MealDetailTotalRow();
	if (cpr.I18N.INSTANCE.currentLanguage === "ko") {
		mealDetailTotalRow.setAppProperty("time", currentMonth.format("YYYY") + "년 " + currentMonth.format("MM") + "월");
	} else {
		mealDetailTotalRow.setAppProperty("time", currentMonth.format("YYYY.MM"));
	}
	
	app.lookup("mealResultList").addChild(mealDetailTotalRow, {
		height: "108px"
	});
	var totalPay = 0;
	app.lookup("MealResult").forEachOfUnfilteredRows(function(row) {
		totalPay = totalPay + row.getValue("Pay");
		var dateTime = moment(row.getValue("DateTime"), "YYYY.MM.DD").format("YYYY.MM.DD");
		if (dateTime !== divideTime) {
			divideTime = dateTime;
			groupByDate.push({
				date: dateTime,
				data: [
					row.getRowData()
				]
			});
		} else {
			var founded = groupByDate.find(function(row) {
				return row.date === dateTime
			})
			founded.data.push(row.getRowData())
		}
	});

	mealDetailTotalRow.setAppProperties({
		totalPay: utils.numberWithCommas(totalPay) + " " + cpr.I18N.INSTANCE.message("Str_Meal_Won"),
		totalMeal: utils.numberWithCommas(app.lookup("Total").getValue("Count")) + " " + cpr.I18N.INSTANCE.message("Str_Meal_Time")
	});
	
	fetched = fetched + app.lookup("MealResult").getRowCount();
	if (fetched <  app.lookup("Total").getValue("Count")) {
		fetchMealResult(fetched);
	} else {
		groupByDate.forEach(function(each){
			var divideRow = new udc.Log.LogTime();
			divideRow.setAppProperty("time", each.date);
			divideRow.style.animateFrom({	
				"transform": "translateY(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
			app.lookup("mealResultList").addChild(divideRow, {
				height: "30px"
			});
			var mealRow = new udc.MealManagement.MealDetailRow();
			mealRow.setAppProperty("data", each);
			app.lookup("mealResultList").addChild(mealRow, {
				autoSize: "height"
			});
			mealRow.style.animateFrom({	
				"transform": "translateY(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
		});
	}
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
	currentMonth = currentMonth.add(1, "month");
	app.lookup("MealResult").clear();
	groupByDate = [];
	divideTime = 0;
	fetchMealResult(0)
	fetched = 0;
	renderTime();
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
	currentMonth = currentMonth.subtract(1, "month");
	app.lookup("MealResult").clear();
	groupByDate = [];
	divideTime = 0;
	fetchMealResult(0)
	fetched = 0;
	renderTime();
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
	currentMonth = moment();
	app.lookup("MealResult").clear();
	groupByDate = [];
	divideTime = 0;
	fetchMealResult(0)
	fetched = 0;
	renderTime();
}
