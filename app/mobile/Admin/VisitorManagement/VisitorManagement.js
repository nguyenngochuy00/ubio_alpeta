/************************************************
 * VisitorManagement.js
 * Created at Nov 9, 2020 9:22:17 PM.
 *
 * @author Sam
 ************************************************/
var auth = cpr.core.Module.require("lib/Auth");
var util = cpr.core.Module.require("lib/Utils");
var config = getConfig();
var isAutimating = false;
var knownBottomReached = false;
var fetching = false;
var fetchCount = 0;
var hasNext = true;
var divideTime;
var totalRow = [];
var expiredRow = 0;

function renderRow() {
	var total = app.lookup("Total").getValue("Count");
	var now = moment();
	var year = now.format("YYYY");
	var month = now.format("MM");
	app.lookup("VisitInfoList")
	.forEachOfUnfilteredRows(function(row) {
		var index = app.lookup("visitorList").getChildren().indexOf(app.lookup("loader"));
		var eventTime = moment(row.getValue("StartAt"), "YYYY-MM-DD").format("YYYY.MM.DD");
		if (eventTime !== divideTime) {
			divideTime = eventTime;
			var timeRow = new udc.Log.LogTime();
			timeRow.setAppProperty("time", eventTime);
			app.lookup("visitorList").insertChild(index, timeRow, {
				height: "30px"
			});
			timeRow.style.animateFrom({	
				"transform": "translateY(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
		}
		
		var visitorRow = new udc.VisitorManagement.VisitorManagementRow();
		visitorRow.setAppProperties({
			status: row.getValue("Status"),
			purpose: row.getValue("Purpose"),
			startAt: row.getValue("StartAt") + now.startOf("month").format("YYYY-MM-DD") + " 00:00:00",
			endAt: row.getValue("EndAt") + now.endOf("month").format("YYYY-MM-DD") + " 23:59:59",
			visitor: (row.getValue("VisitorLastName")) + row.getValue("VisitorFirstName") + (row.getValue("VisitorCount") > 1 ?  " and " +  row.getValue("VisitorCount") + " person": "")
		});
		
		visitorRow.addEventListener("click", function(e){	
			isAutimating = true;
			app.openDialog("app/mobile/Admin/VisitorManagement/VisitorDetail", {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				headerVisible : false,
			}, function(loadedApp) {
				loadedApp.style.animateFrom({	
					"transform": "translateX(100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				loadedApp.addEventListenerOnce("init", function () {
					loadedApp.setAppProperties({
						                                                  
						visitIndex: row.getValue("VisitIndex"),
					});
				})
				loadedApp.addEventListenerOnce("close", function (e) {
					isAutimating = false;
					hasNext = true;
					app.lookup("visitorList").removeAllChildren()
					app.lookup("visitorList").addChild(new udc.Common.Loader("loader"), {
						height: "52px"
					});
					fetchMore(0);
				})
			});	
		});
		app.lookup("visitorList").insertChild(app.lookup("visitorList").getChildren().indexOf(app.lookup("loader")), visitorRow, {
			height: "90px"
		});
		visitorRow.style.animateFrom({	
			"transform": "translateY(100%)",
			"opacity": "0"
		}, .5, cpr.animation.TimingFunction.EASE_IN_OUT_BACK);
	});
	fetching = false;
	fetchCount = fetchCount + app.lookup("VisitInfoList").getRowCount();
	if (fetchCount >= (app.lookup("Total").getValue("Count")) - expiredRow) {
		hasNext = false;
		app.lookup("loader").setAppProperties({
			loaderImageVisible: false,
			loaderTextValue: cpr.I18N.INSTANCE.message("Str_Common_No_More")
		})
	}  
}

function fetchMore(offset) {
	if (!hasNext) {
		return;
	}
	var now = moment();
	var year = now.format("YYYY");
	var month = now.format("MM");
	fetching = true;
	
	var smsVisitApplication = app.lookup("smsVisitApplication");
	smsVisitApplication.removeAllParameters();
	smsVisitApplication.setRequestActionUrl(config.apiHostResolution() + smsVisitApplication.action)
	smsVisitApplication.send()
}

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("visitorList").addChild(new udc.Common.Loader("loader"), {
		height: "52px"
	});
	fetchMore(0)
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
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	app.lookup("VisitInfoList").forEachOfUnfilteredRows(function (row) {
		totalRow.push(row.getRowData())
	});
	renderRow();
}


/*
 * Triggered when scroll event is fired from Group.
 * 그룹 컨텐츠가 스크롤될 때 발생하는 이벤트.
 */
function onVisitorListScroll(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var visitorList = e.control;
	var viewport = app.lookup("visitorList").getViewPortRect();
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


///*
// * Triggered when before-submit event is fired from Submission.
// * 통신을 시작하기전에 발생합니다.
// */
//function onSmsVisitApplicationBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
//	/** 
//	 * @type cpr.protocols.Submission
//	 */
//	var smsVisitApplication = e.control;
//	showloading();
//}

/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsVisitApplicationReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsVisitApplication = e.control;
	hideLoading();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsVisitApplicationSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsVisitApplication = e.control;
	handleUnauthorize(app);
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	renderRow()
}
