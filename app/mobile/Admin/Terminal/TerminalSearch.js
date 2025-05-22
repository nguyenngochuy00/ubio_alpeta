/************************************************
 * TerminalSearch.js
 * Created at Sep 21, 2020 1:41:58 PM.
 *
 * @author EVN0025
 ************************************************/


var config = getConfig();
var isAutimating = false;
var auth = cpr.core.Module.require("lib/Auth");
var currentRow = 0;


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
	cpr.core.App.load("app/mobile/Admin/Terminal/TerminalList", function(loadedApp){
		var newAppInstance = loadedApp.createNewInstance();
		newAppInstance.run(null, function(createdApp) {
			createdApp.setAppProperties({
				prePage: app.getAppProperty("prePage"),
			});
			createdApp.getContainer().style.animateFrom({	
				"transform": "translateX(-100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
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
	var searchCondition = e.content;
	if (!searchCondition.searchValue) {
		renderDefaultMessage()
		return;
	}
	var smsGetTerminals = app.lookup("smsGetTerminals");
	smsGetTerminals.removeAllParameters();
	smsGetTerminals.setRequestActionUrl(config.apiHostResolution() + smsGetTerminals.action);
	smsGetTerminals.addParameter("searchCategory", searchCondition.searchCategory.value);
	smsGetTerminals.addParameter("searchKeyword", searchCondition.searchValue);
	smsGetTerminals.addParameter("offset", 0);
	smsGetTerminals.addParameter("limit", 10);
	smsGetTerminals.send();
}

function renderDefaultMessage() {
	app.lookup("searchResult").removeAllChildren();
	var rowUI = new cpr.controls.Output();
		rowUI.style.css({
			color: "#909090",
			font: "14px",
			"text-align": "center"
		});
		rowUI.value = cpr.I18N.INSTANCE.message("Str_Common_Search_PleaseEnterKeywork")
		app.lookup("searchResult").addChild(rowUI, {
			height: "240px"
		});
}

function renderSearchResult() {
	app.lookup("searchResult").removeAllChildren();
	currentRow = app.lookup("TerminalList").getRowCount();
	if (app.lookup("TerminalList").getRowCount() === 0) {
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
	
	app.lookup("TerminalList").forEachOfUnfilteredRows(function (row) {
		var rowUI = new cpr.controls.Output(row.getIndex());
		rowUI.value = row.getValue("Name");
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
		rowUI.addEventListener("click", function (e) {
			var output = e.control;
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
		})
	});
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	renderDefaultMessage();
//	app.lookup("searchCategory").addRowData({
//		label: cpr.I18N.INSTANCE.message("Str_Total"),
//		value: "",
//	});
	
	app.lookup("searchCategory").addRowData({
		label: cpr.I18N.INSTANCE.message("Str_TerminalName"),
		value: "name",
	});
	
	app.lookup("searchCategory").addRowData({
		label: cpr.I18N.INSTANCE.message("Str_TerminalID"),
		value: "id",
	});
	
	app.lookup("navigationBar").setAppProperty("searchCategory", app.lookup("searchCategory"));
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
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	renderSearchResult()
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
