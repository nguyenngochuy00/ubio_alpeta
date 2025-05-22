/************************************************
 * visitorOutManagement.js
 * Created at 2020. 12. 16. 오후 5:47:30.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;
var KWLVR_version;
var deviceWebSocket;
var clearFlag;


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();	
	
	var initValue = app.getHost().initValue;
	
	var visitRequestInfo = initValue["visitRequestInfo"];
	if (visitRequestInfo != undefined) {
		app.lookup("VisitRequestInfo").build(visitRequestInfo);
		console.log(app.lookup("VisitRequestInfo").getDatas());
	}
	app.lookup("KWLVO_btnOutSave").enabled = false;
	app.lookup("KWLVO_grpMain").redraw();
}


/*
 * "퇴장" 버튼(KWLVO_btnOutSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLVO_btnOutSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLVO_btnOutSave = e.control;
	//퇴장요청
	app.lookup("VisitRequestInfo").setValue("OutputAdminName", app.lookup("VisitLoginInfo").getValue("UniqueID"));
	comLib.showLoadMask("","입장기록 퇴장처리","",0);
	app.lookup("sms_putKwlVisitorIn").send();
}

function onSms_putKwlVisitorInSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, "Success", "퇴장 처리가 완료 되었습니다.");
		app.close();
	} else {
		dialogAlert(app, "Waning", dataManager.getString("Str_VisitorManagement")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_putKwlVisitorInSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putKwlVisitorInSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * "종료" 버튼(KWLVO_btnClose)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLVO_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLVO_btnClose = e.control;
	app.close();
}


/*
 * "login" 버튼(KWLVO_btnLogin)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLVO_btnLoginClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLVO_btnLogin = e.control;
	var kWLVI_btnLogin = e.control;
	var smspostKwlVisitLogin = app.lookup("sms_postKwlVisitLogin");
	smspostKwlVisitLogin.action = "/v1/kangwonland/visitlogin";
	smspostKwlVisitLogin.send();
}

function onSms_postKwlVisitLoginSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		app.lookup("KWLVO_btnLogin").enabled = false;
		app.lookup("VisitLoginInfo").setValue("UniqueID",  app.lookup("VisitLoginResult").getValue("AdminName"));
		app.lookup("KWLVO_ipbIdno").enabled = false;
		app.lookup("KWLVO_btnOutSave").enabled = true;
		app.lookup("KWLVO_ipbPassword").value = "";
		app.lookup("KWLVO_ipbPassword").enabled = false;
	} else {
		if (resultCode == 0x7F000001) {// 최초 로그인
			app.getRootAppInstance().openDialog("app/main/kangwonland/visitorHistory/SetPassword", {width: 400, height: 250}, function(dialog){
				dialog.ready(function(dialogApp){
					dialog.initValue = {"userID":app.lookup("VisitLoginResult").getValue("UserID")};	
					dialog.modal = true;
				});
			}).then(function(returnValue){
			
			});
		} else if (resultCode == 0x7F000002) {
			dialogAlert(app, "Waning", "로그인 허용 횟수를 초과 하였습니다. 관리자에게 문의 하세요");
		} else if (resultCode == 0x0100000F) {
			app.getRootAppInstance().openDialog("app/main/kangwonland/visitorHistory/SetPassword", {width: 400, height: 250}, function(dialog){
				dialog.ready(function(dialogApp){
					dialog.initValue = {"userID":app.lookup("VisitLoginResult").getValue("UserID")};	
					dialog.modal = true;
				});
			}).then(function(returnValue){
			
			});
		} else {
			dialogAlert(app, "Waning", dataManager.getString("Str_VisitorManagement")+" 로그인 "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
		}
		
	}
	app.lookup("KWLVO_grpMain").redraw();
}

function onSms_postKwlVisitLoginSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postKwlVisitLoginSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
