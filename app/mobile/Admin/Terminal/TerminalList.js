/************************************************
 * TerminalList.js
 * Created at Sep 14, 2020 4:51:47 PM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var auth = cpr.core.Module.require("lib/Auth");
var isAutimating = false;
var knownBottomReached = false;
var fetching = false;
var fetchCount = 0;
var hasNext = true;

function fetchMore(offset) {
	if (!hasNext) {
		return;
	}
	fetching = true;
	
	var smsGetTerminals = app.lookup("smsGetTerminals");
	smsGetTerminals.removeAllParameters();
	smsGetTerminals.setRequestActionUrl(config.apiHostResolution() + smsGetTerminals.action);
	smsGetTerminals.addParameter("offset", offset);
	smsGetTerminals.addParameter("limit", 10);
	smsGetTerminals.send()
}

function renderRow() {
	app.lookup("TerminalList").forEachOfUnfilteredRows(function (row) {
		var terminalRow = new udc.TerminalRowComponent();
		terminalRow.Name = row.getValue("Name");
		terminalRow.ID = row.getValue("ID");
		terminalRow.IPAddress = row.getValue("IPAddress");
		terminalRow.MacAddress = row.getValue("MacAddress");
		terminalRow.GroupCode = row.getValue("GroupCode");
		terminalRow.RemoteDoor = row.getValue("RemoteDoor");
		terminalRow.Status = row.getValue("Status");
		terminalRow.Type = row.getValue("Type");
		terminalRow.UTCIndex = row.getValue("UTCIndex");
		terminalRow.Version = row.getValue("Version");
		terminalRow.FuncType = row.getValue("FuncType");
		terminalRow.Description = row.getValue("Description");
		
		var index = app.lookup("terminalList").getChildren().indexOf(app.lookup("loader"));
		app.lookup("terminalList").insertChild(index, terminalRow, {
			height: "87px"
		});
		terminalRow.style.animateFrom({	
			"transform": "translateY(100%)",
			"opacity": "0"
		}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
		terminalRow.addEventListener("click", function(e){
			var dialogProp = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				headerVisible : false,
			};
			app.openDialog("app/mobile/Admin/Terminal/Terminal", dialogProp, function(loadedApp) {
				loadedApp.style.animateFrom({	
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				loadedApp.addEventListenerOnce("init", function () {
					loadedApp.setAppProperties({
						ID: row.getValue("ID"),
						TerminalName: row.getValue("Name")
					});
				})
			});
		});
	});
	app.lookup("totalTerminal").value = app.lookup("Total").getValue("Count") + (cpr.I18N.INSTANCE.currentLanguage === "ko"? " 대" : "");
	fetching = false;
	fetchCount = fetchCount + app.lookup("TerminalList").getRowCount();
	if (fetchCount >= app.lookup("Total").getValue("Count")) {
		hasNext = false;
		app.lookup("loaderIcon").visible = false;
		app.lookup("loaderText").value = cpr.I18N.INSTANCE.message("Str_Common_No_More");
	} 
	
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
	renderRow();
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("header").leftBtnPath = app.getAppProperty("prePage");
	fetchMore(0)
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsGetTerminalsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetTerminals = e.control;
	auth.logout(app);
}

/*
 * Triggered when rightBtnClick event is fired from User Defined Control.
 */
function onHeaderRightBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.Header
	 */
	var header = e.control;
	if (isAutimating) {
		e.preventDefault();
		return;
	}
	isAutimating = true;
	cpr.core.App.load("app/mobile/Admin/Terminal/TerminalSearch", function(loadedApp){
		loadedApp.createNewInstance().run(null, function(createdApp) {
			createdApp.setAppProperties({
				prePage: app.getAppProperty("prePage"),
			});
			createdApp.getContainer().style.animateFrom({	
				"transform": "translateX(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
			app.close();
			isAutimating = false;
		})
	});
}


/*
 * Triggered when value-change event is fired from Output "10대"(totalGroups).
 * Output의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onTotalGroupsValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var totalGroups = e.control;
	
}


/*
 * Triggered when scroll event is fired from Group.
 * 그룹 컨텐츠가 스크롤될 때 발생하는 이벤트.
 */
function onTerminalListScroll(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var terminalList = e.control;
	var viewport = app.lookup("terminalList").getViewPortRect();
	var loader = app.lookup("loader");
	var bottomReached = viewport.intersects(loader.getOffsetRect());
	if (knownBottomReached != bottomReached && bottomReached) {
		if (fetchCount >= app.lookup("Total").getValue("Count")) {
			loader.style.animateAndReverse({
				"transform": "scale(1.3)",
				"color": "red"
			}, 0.2);
		} else {
			fetchMore(fetchCount);
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
		pageName: cpr.I18N.INSTANCE.message("Str_TerminalSettings")
	});
}
