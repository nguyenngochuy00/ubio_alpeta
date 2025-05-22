/************************************************
 * VisitorDetail.js
 * Created at Nov 10, 2020 10:14:37 AM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var Auth = cpr.core.Module.require("lib/Auth");
var utils = cpr.core.Module.require("lib/Utils");

/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onNavigationBarLeftBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.NavigationBar
	 */
	var navigationBar = e.control;
	app.close();
}


/*
 * Triggered when click event is fired from Output "승인"(rejectBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onRejectBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var rejectBtn = e.control;
	var dialogProp = {
		top: 200,
		headerVisible : false,
		width: 320, 
		modal: true,
		resizable: false
	};
	app.openDialog("app/mobile/Admin/VisitorManagement/denyPopup", dialogProp, function (loadedApp) {
		loadedApp.addEventListener("Approve", function(e){
			var smsUpdateVisitorDetail = app.lookup("smsUpdateVisitorDetail");
			var action = smsUpdateVisitorDetail.action.replace("{visitIndex}", app.getAppProperty("visitIndex"));
			action = action.replace("{status}", 3)
			smsUpdateVisitorDetail.setRequestActionUrl(config.apiHostResolution() + action);
			smsUpdateVisitorDetail.send();
		});
	});
}


/*
 * Triggered when click event is fired from Output "거절"(approveBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onApproveBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var approveBtn = e.control;
	var dialogProp = {
		top: 200,
		headerVisible : false,
		width: 320, 
		modal: true,
		resizable: false
	};
	app.openDialog("app/mobile/Admin/VisitorManagement/approvePopup", dialogProp, function (loadedApp) {
		loadedApp.addEventListener("Approve", function(e){
			var smsUpdateVisitorDetail = app.lookup("smsUpdateVisitorDetail");
			var action = smsUpdateVisitorDetail.action.replace("{visitIndex}", app.getAppProperty("visitIndex"));
			action = action.replace("{status}", 2)
			smsUpdateVisitorDetail.setRequestActionUrl(config.apiHostResolution() + action);
			smsUpdateVisitorDetail.send();
		});
	});
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var smsGetVisitorDetail = app.lookup("smsGetVisitorDetail");
	smsGetVisitorDetail.setRequestActionUrl(config.apiHostResolution() + smsGetVisitorDetail.action.replace("{id}", app.getAppProperty("visitIndex")));
	smsGetVisitorDetail.send();
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsGetVisitorDetailBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetVisitorDetail = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsGetVisitorDetailReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetVisitorDetail = e.control;
	hideLoading();
}

function render() {
	
	if (Auth.isUser()) {
		app.lookup("actionComponent").visible = false;
	}
	// Approved
	if (app.lookup("VisitInfo").getValue("Status") === 2) {
		app.lookup("actionComponent").visible = false;
		app.getContainer().updateConstraint(app.lookup("vistorContent"), {
			bottom: "2px"
		});
		app.lookup("statusIcon").src = "/theme/images/mobile/visit_cardview_icon_agree.png";
		app.lookup("statusText").value = cpr.I18N.INSTANCE.message("Str_VisitRequestApproval");
		app.lookup("statusText").style.css({
			color: "#006B38"
		});
	}
	// denial
	if (app.lookup("VisitInfo").getValue("Status") === 3) {
		app.lookup("actionComponent").visible = false;
		app.getContainer().updateConstraint(app.lookup("vistorContent"), {
			bottom: "2px"
		});
		app.lookup("statusIcon").src = "/theme/images/mobile/visit_cardview_icon_hold.png";
		app.lookup("statusText").value = cpr.I18N.INSTANCE.message("Str_VisitRequestDeny");
		app.lookup("statusText").style.css({
			color: "#FF8D80"
		})
	}
	
	// expiration
	if (app.lookup("VisitInfo").getValue("Status") === 4) {
		app.lookup("actionComponent").visible = false;
		app.getContainer().updateConstraint(app.lookup("vistorContent"), {
			bottom: "2px"
		});
		app.lookup("statusIcon").src = "/theme/images/mobile/visit_cardview_icon_hold.png";
		app.lookup("statusText").value = cpr.I18N.INSTANCE.message("Str_VisitRequestExpired"); 
		app.lookup("statusText").style.css({
			color: "#FF8D80"
		})
	}
	// pending
	if (app.lookup("VisitInfo").getValue("Status") === 1) {
		app.lookup("actionComponent").visible = true;
		app.lookup("statusIcon").src = "/theme/images/mobile/visit_cardview_icon_wait.png";
		app.lookup("statusText").value = cpr.I18N.INSTANCE.message("Str_VisitRequestWaiting");
		app.lookup("statusText").style.css({
			color: "#008FCE"
		})
 	}
	
	var visitorInfo = app.lookup("VisitInfo");
	app.lookup("companyNameValue").value = visitorInfo.getValue("VisitorCompany");
	var bod = app.lookup("VisitorList").getValue(0, "Birthday");
	var startDateValue = app.lookup("startDateValue");
	startDateValue.value = app.lookup("VisitInfo").getValue("StartAt");
	var endDateValue = app.lookup("endDateValue");
	endDateValue.value = app.lookup("VisitInfo").getValue("EndAt");	
	app.lookup("purposeValue").value = visitorInfo.getValue("Purpose");
	app.lookup("companyNameValue").value = app.lookup("VisitorList").getValue(0, "Company");
	app.lookup("licensePlateValue").value = app.lookup("VisitorList").getValue(0, "CarNumber");
	app.lookup("phoneNumberValue").value = app.lookup("VisitorList").getValue(0, "Mobile");
	app.lookup("dobValue").value = bod ? moment(bod, "YYYYMMDD").format("YYYY.MM.DD") : "";
	
//	app.lookup("VisitorList").forEachOfUnfilteredRows(function(row) {
//		app.lookup("visitorForm").addChild(new udc.Common.DivideRow(), {
//			height: "25px"
//		});
//	});
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsGetVisitorDetailSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsGetVisitorDetail = e.control;
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	render()
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsUpdateVisitorDetailBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUpdateVisitorDetail = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsUpdateVisitorDetailReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUpdateVisitorDetail = e.control;
	hideLoading();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsUpdateVisitorDetailSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUpdateVisitorDetail = e.control;
	
	if (app.lookup("Result").getValue("ResultCode") === 0) {
		app.close();
	}
}


/*
 * Triggered when click event is fired from Output " 010-1234-5678"(phoneNumberValue).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPhoneNumberValueClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var phoneNumberValue = e.control;
	if (phoneNumberValue.value) {
		if (window.webkit) {
			window.webkit.messageHandlers.conmonMessageHandler.postMessage(JSON.stringify({
			event: "CALL",
				data: {
					phoneNumber: phoneNumberValue.value
				}
			}));
		}
		
		if (window.conmonMessageHandler) {
			window.conmonMessageHandler.postMessage(JSON.stringify({
				event: "CALL",
				data: {
					phoneNumber: phoneNumberValue.value
				}
			}));
		}
	}
}
