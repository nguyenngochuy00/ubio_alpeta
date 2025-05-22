/************************************************
 * Mornitoring.js
 * Created at Oct 14, 2020 1:19:38 PM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var isAutimating = false;
var fetching = false;
var fetchedTerminal = 0;
var fetchedMornitoringTerminal = 0;
var hasNextTerminal = true;
var hasNextMornitoringTerminal = true;
var knownBottomReached = false;

function onMorRowClick(e, row) {
	if (isAutimating) {
		e.preventDefault();
		return;
	}
	isAutimating = true;
	app.openDialog("app/mobile/Admin/Monitoring/TerminalLogsDetail", {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		headerVisible : false,
	}, function(loadedApp) {
		loadedApp.addEventListenerOnce("init", function () {
			loadedApp.setAppProperties({
				ID: row.getValue("ID"),
				Name: row.getValue("Name"),
			});
		})
		loadedApp.addEventListenerOnce("close", function () {
			isAutimating = false;
		})
	});	
}


function render() {
	var monitorList = app.lookup("monitorList");
	app.lookup("TerminalList").forEachOfUnfilteredRows(function(row) {
		var mor = new udc.Monitoring.MonitoringRow();
		
		mor.setAppProperties({
			ID: row.getValue("ID") ? "(" + row.getValue("ID") + ")" : "",
			Name: row.getValue("Name"),
			LiveStatus: row.getValue("LiveStatus"),
			Type: row.getValue("Type"),
			State: row.getValue("Status")
		});
		mor.addEventListener("click", function(e) {
			onMorRowClick(e, row)
		});
		
		monitorList.insertChild(monitorList.getChildren().indexOf(app.lookup("loader")), mor, {
			height: "80px"
		});
	});
	
	fetching = false;
	fetchedTerminal = fetchedTerminal + app.lookup("TerminalList").getRowCount();
	if (fetchedTerminal >= app.lookup("Total").getValue("Count")) {
		app.lookup("loader").setAppProperties({
			loaderImageVisible: false,
			loaderTextValue: cpr.I18N.INSTANCE.message("Str_Common_No_More")
		})
		hasNextTerminal = false;
	} 
}

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var monitorList = app.lookup("monitorList");
	var morAll = new udc.Monitoring.MonitoringAllLogs();
	morAll.addEventListener("click", function (e) {
		if (isAutimating) {
			e.preventDefault();
			return;
		}
		isAutimating = true;
		app.openDialog("app/mobile/Admin/Monitoring/TerminalLogsDetail", {
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
			headerVisible : false,
		}, function(loadedApp) {
			loadedApp.addEventListenerOnce("init", function () {
				loadedApp.setAppProperties({
					Name: cpr.I18N.INSTANCE.message("Str_Log_FullLog"),
				});
			})
			loadedApp.addEventListenerOnce("close", function () {
				isAutimating = false;
			})
		});	
	});
	monitorList.addChild(morAll, {
		height: "80px"
	});
	app.lookup("monitorList").addChild(new udc.Common.Loader("loader"), {
		height: "52px"
	});
	fetchTerminal(0);
}

function fetchTerminal(offset) {
	if (!hasNextTerminal) {
		return;
	}
	var smsGetTerminals = app.lookup("smsGetTerminals");
	smsGetTerminals.removeAllParameters();
	smsGetTerminals.setRequestActionUrl(config.apiHostResolution() + smsGetTerminals.action);
	smsGetTerminals.addParameter("limit", 10);
	smsGetTerminals.addParameter("offset", offset || 0);
	smsGetTerminals.send()
}

function fetchMornitoringTerminal(offset) {
	if (!hasNextMornitoringTerminal) {
		return;
	}
	var smsGetMornitoringTerminal = app.lookup("smsGetMornitoringTerminal");
	smsGetMornitoringTerminal.removeAllParameters();
	smsGetMornitoringTerminal.setRequestActionUrl(config.apiHostResolution() + smsGetMornitoringTerminal.action);
	smsGetMornitoringTerminal.addParameter("limit", 10);
	smsGetMornitoringTerminal.addParameter("offset", offset || 0);
	smsGetMornitoringTerminal.send()
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetMornitoringTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetMornitoringTerminal = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	app.lookup("TerminalLiveInfo").forEachOfUnfilteredRows(function(row) {
		var mor = new udc.Monitoring.MonitoringRow();

		var terminalInfo = app.lookup("TerminalList").findAllRow("ID===" + row.getValue("ID"))[0];
		if( terminalInfo ){
			terminalInfo.setValue("LiveStatus", row.getValue("Status"));
		} 
	});
	fetchedMornitoringTerminal = fetchedMornitoringTerminal + app.lookup("TerminalLiveInfo").getRowCount();
	render();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetTerminalsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTerminals = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	fetchMornitoringTerminal(fetchedMornitoringTerminal);
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetMornitoringTerminalBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetMornitoringTerminal = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetMornitoringTerminalReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetMornitoringTerminal = e.control;
	hideLoading();
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetTerminalsBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTerminals = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetTerminalsReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTerminals = e.control;
	hideLoading();
}


/*
 * Triggered when scroll event is fired from Group.
 * 그룹 컨텐츠가 스크롤될 때 발생하는 이벤트.
 */
function onMonitorListScroll(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var monitorList = e.control;
	var viewport = app.lookup("monitorList").getViewPortRect();
	var loader = app.lookup("loader");
	var bottomReached = viewport.intersects(loader.getOffsetRect());
	if (knownBottomReached != bottomReached && bottomReached) {
		if (fetchedTerminal >= app.lookup("Total").getValue("Count")) {
			loader.style.animateAndReverse({
				"transform": "scale(1.3)",
				"color": "red"
			}, 0.2);
		} else {
			fetchTerminal(fetchedTerminal);
		}
	}
	knownBottomReached = bottomReached;
}


/*
 * Triggered when init event is fired from Body.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	app.lookup("header").setAppProperties({
		pageName: cpr.I18N.INSTANCE.message("Str_Monitoring")
	});
}
