/************************************************
 * AuthLogListSearch.js
 * Created at Oct 27, 2020 9:23:06 PM.
 *
 * @author Sam
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var auth = cpr.core.Module.require("lib/Auth");
var util = cpr.core.Module.require("lib/util");
var config = getConfig();
var totalRow = [];
var currentRow = 0;
var isAutimating = false;
var searchCondition;
var comLib;


/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onNavigationBarLeftBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.NavigationBar
	 */
	var navigationBar = e.control;
	if (isAutimating) {
		e.preventDefault();
		return;
	}
	isAutimating = true;
	cpr.core.App.load("app/mobile/Admin/Logs/AuthLogList", function(loadedApp){
		var newAppInstance = loadedApp.createNewInstance();
		newAppInstance.run(null, function(createdApp) {
			createdApp.setAppProperties({
				prePage: app.getAppProperty("prePage"),
			});
			app.close();
			isAutimating = false;
		});	
	});
}


/*
 * Triggered when onSearch event is fired from User Defined Control.
 */
function onNavigationBarOnSearch(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.NavigationBar
	 */
	var navigationBar = e.control;
	searchCondition = e.content;
	var dsAuthLogList = app.lookup("AuthLogList");
	dsAuthLogList.clear();
	var startTime = app.lookup("authlogdate1").value;
	var endTime = app.lookup("authlogdate2").value;
	// 조회 기간 유효성 검사 
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime)
	if (!searchCondition.searchValue) {
		renderDefaultMessage()
		return;
	} else if (isStartEndDateValid === false) {
		renderInvalidDateSet()
		return;
	} 
	var smsAuthLogsList = app.lookup("smsAuthLogsList");
	smsAuthLogsList.removeAllParameters();
	smsAuthLogsList.setRequestActionUrl(config.apiHostResolution() + smsAuthLogsList.action);
	smsAuthLogsList.addParameter("searchCategory", searchCondition.searchCategory.value);
	smsAuthLogsList.addParameter("searchKeyword", searchCondition.searchValue);
	smsAuthLogsList.addParameter("startTime",startTime + " 00:00:00");
	smsAuthLogsList.addParameter("endTime", endTime + " 00:00:00");
	smsAuthLogsList.addParameter("offset", 0);
	smsAuthLogsList.addParameter("limit", 2000);
	smsAuthLogsList.send();
}

function renderDefaultMessage() {
	app.lookup("searchResult").removeAllChildren();
	var rowUI = new cpr.controls.Output();
	rowUI.style.css({
		color: "#909090",
		font: "14px",
		"text-align": "center"
	});
	rowUI.value = cpr.I18N.INSTANCE.message("Str_Common_Search_PleaseEnterKeywork");
	app.lookup("searchResult").addChild(rowUI, {
		height: "240px"
	});
}

function renderInvalidDateSet() {
	renderDefaultMessage();
	app.lookup("searchResult").removeAllChildren();
	var rowUI = new cpr.controls.Output();
	rowUI.style.css({
		color: "#909090",
		font: "14px",
		"text-align": "center"
	});
	rowUI.value = "조회 기간이 잘못되었습니다. \n다시 설정해주세요";
	app.lookup("searchResult").addChild(rowUI, {
		height: "240px"
	});
}

function renderSearchResult() {
	app.lookup("searchResult").removeAllChildren();
	currentRow = app.lookup("AuthLogList").getRowCount();
	if (app.lookup("AuthLogList").getRowCount() === 0) {
		var rowUI = new cpr.controls.Output();
		rowUI.style.css({
			color: "#909090",
			font: "14px",
			"text-align": "center"
		});
		rowUI.value = cpr.I18N.INSTANCE.message("Str_Common_No_More")
		app.lookup("searchResult").addChild(rowUI, {
			height: "240px"
		});
	}
	
	app.lookup("AuthLogList").forEachOfUnfilteredRows(function (row) {
		var rowUI = new cpr.controls.Output(row.getIndex());
		rowUI.value = row.getValue("UserName");
		if (searchCondition.searchCategory.value === "user_id") {
			rowUI.value = row.getValue("UserID");
		}
		if (searchCondition.searchCategory.value === "user_name") {
			rowUI.value = row.getValue("UserName");
		}
		if (searchCondition.searchCategory.value === "terminal_name") {
			rowUI.value = row.getValue("TerminalName");
		}
		if (searchCondition.searchCategory.value === "terminal_id") {
			rowUI.value = row.getValue("TerminalID");
		}
		if (searchCondition.searchCategory.value === "unique_id") {
			rowUI.value = row.getValue("UniqueID");
		}
		
		rowUI.style.css({
			color: "#909090",
			font: "12px",
			"border-bottom": "solid 1px #cfcfcf"
		})
		app.lookup("searchResult").addChild(rowUI, {
			height: "34px"
		});
		
		rowUI.style.animateFrom({	
			"transform": "translateY(100%)",
			"opacity": "0"
		}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
		
		rowUI.addEventListener("click", function(e){	
			isAutimating = true;
			app.openDialog("app/mobile/Admin/Logs/AuthLogDetail", {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				headerVisible : false,
			}, function(loadedApp) {
				loadedApp.addEventListenerOnce("init", function () {
					loadedApp.setAppProperties({
						authLogIndex: row.getValue("IndexKey"),
						index: totalRow.findIndex(function (e) {
							return e.IndexKey === row.getValue("IndexKey")
						}),
						total: app.lookup("Total").getValue("Count"),
						condition: {
							key: searchCondition.searchCategory.value,
							value: searchCondition.searchValue
						}
					});
				})
				loadedApp.addEventListenerOnce("close", function () {
					isAutimating = false;
				})
			});	
		});
	});
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	renderDefaultMessage();
	
	app.lookup("searchCategory").addRowData({
		label: cpr.I18N.INSTANCE.message("Str_UserName"),
		value: "user_name",
	});
	
	app.lookup("searchCategory").addRowData({
		label: cpr.I18N.INSTANCE.message("Str_UserID"),
		value: "user_id",
	});
	
	app.lookup("searchCategory").addRowData({
		label: cpr.I18N.INSTANCE.message("Str_UniqueID"), 
		value: "unique_id",
	});
	
	app.lookup("searchCategory").addRowData({
		label: cpr.I18N.INSTANCE.message("Str_TerminalID"),
		value: "terminal_id",
	});
	
	app.lookup("searchCategory").addRowData({
		label: cpr.I18N.INSTANCE.message("Str_TerminalName"), 
		value: "terminal_name",
	});
	
	app.lookup("navigationBar").setAppProperty("searchCategory", app.lookup("searchCategory"));
	
	comLib =  createComUtil(app);
	dataManager = getDataManager();
	
	var dtStart = app.lookup("authlogdate1");
	var dtEnd = app.lookup("authlogdate2");
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dtEnd.value = now.format('YYYY-MM-DD');
	
	//var before = now.add(-30, 'days');
	dtStart.value = now.format('YYYY-MM-DD');
	
	SetMaxDate();
	
}

function SetMaxDate() {
	var date = new Date();
    date.setFullYear(date.getFullYear());// y년을 더함
    date.setMonth(date.getMonth());// m월을 더함
    date.setDate(date.getDate());// d일을 더함
    
	app.lookup("authlogdate1").maxDate = date;
	app.lookup("authlogdate2").maxDate = date;	
}

/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsAuthLogsListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsAuthLogsList = e.control;
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	
	
	app.lookup("AuthLogList").forEachOfUnfilteredRows(function (row) {
		totalRow.push(row.getRowData())
	});
	renderSearchResult()
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsAuthLogsListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsAuthLogsList = e.control;
	auth.logout(app);
}
