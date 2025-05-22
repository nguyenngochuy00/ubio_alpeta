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
	cpr.core.App.load("app/mobile/Admin/Logs/EventLogList", function(loadedApp){
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
	var dsAuthLogList = app.lookup("EventLogList");
	dsAuthLogList.clear();
	var startTime = app.lookup("eventlogdate1").value;
	var endTime = app.lookup("eventlogdate2").value;
	// 조회 기간 유효성 검사 
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime)
	if (!searchCondition.searchValue) {
		renderDefaultMessage()
		return;
	} else if (isStartEndDateValid === false) {
		renderInvalidDateSet()
		return;
	} 
	var smsEventLogList = app.lookup("smsEventLogList");
	smsEventLogList.removeAllParameters();
	smsEventLogList.setRequestActionUrl(config.apiHostResolution() + smsEventLogList.action);
	smsEventLogList.addParameter("searchCategory", searchCondition.searchCategory.value);
	smsEventLogList.addParameter("searchKeyword", searchCondition.searchValue);
	smsEventLogList.addParameter("startTime", startTime + " 00:00:00");
	smsEventLogList.addParameter("endTime", endTime + " 00:00:00");
	smsEventLogList.addParameter("offset", 0);
	smsEventLogList.addParameter("limit", 2000);
	smsEventLogList.send();
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
	currentRow = app.lookup("EventLogList").getRowCount();
	if (app.lookup("EventLogList").getRowCount() === 0) {
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
	
	app.lookup("EventLogList").forEachOfUnfilteredRows(function (row) {
		var rowUI = new cpr.controls.Output(row.getIndex());
		rowUI.value = row.getValue("UserName");
		if (searchCondition.searchCategory.value === "user_id") {
			rowUI.value = row.getValue("UserID");
		} 
		if (searchCondition.searchCategory.value === "terminal_id") {
			rowUI.value = row.getValue("TerminalID");
		}
		
		rowUI.style.css({
			color: "#909090",
			font: "12px",
			"border-bottom": "solid 1px #cfcfcf"
		})
		app.lookup("searchResult").addChild(rowUI, {
			height: "34px"
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
		label: cpr.I18N.INSTANCE.message("Str_UserID"),
		value: "user_id",
	});
	app.lookup("searchCategory").addRowData({
		label: cpr.I18N.INSTANCE.message("Str_TerminalID"),
		value: "terminal_id",
	});
	app.lookup("navigationBar").setAppProperty("searchCategory", app.lookup("searchCategory"));
	
	comLib =  createComUtil(app);
	dataManager = getDataManager();
	
	var dtStart = app.lookup("eventlogdate1");
	var dtEnd = app.lookup("eventlogdate2");
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
    
	app.lookup("eventlogdate1").maxDate = date;
	app.lookup("eventlogdate2").maxDate = date;	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsEventLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsEventLogList = e.control;
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	app.lookup("EventLogList").forEachOfUnfilteredRows(function (row) {
	totalRow.push(row.getRowData())
	});
	renderSearchResult()
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsEventLogListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsEventLogList = e.control;
	auth.logout(app);
}
