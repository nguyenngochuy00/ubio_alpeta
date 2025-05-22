/************************************************
 * kioskVisitApplicationStep1.js
 * Created at 2023. 3. 6. ���� 2:41:47.
 *
 * @author MJY
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib = createComUtil(app);
var dateLib = cpr.core.Module.require("lib/DateLib");
var VMVASI_ver = 0;
var VMVASI_src = "";
var OEM_VERSION;


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	dataManager = getDataManager();
	
	VMVAS1_ver = localStorage.getItem("oem");
	VMVAS1_src = localStorage.getItem("src");
	
	var today = dateLib.getToday();
	var day3 = dateLib.addDay(today, 3);
	app.lookup("VMVAS1_dtiStartDate").value = today;
	app.lookup("VMVAS1_dtiStartTime").value = "00:00";
	app.lookup("VMVAS1_dtiEndDate").value = day3;
	app.lookup("VMVAS1_dtiEndTime").value = "23:59";
	
	if (VMVAS1_src == "visit") {
		sendVisitTargetInfoRequest();
	} else {
		var language = localStorage.getItem("language");
		var sms_getLangList = app.lookup("sms_getLangList");
		sms_getLangList.action = "data/lang/lang_visit_" + language + ".json";
		sms_getLangList.send();
	}
	OEM_VERSION = dataManager.getOemVersion();
	
	var strStep1Data = localStorage.getItem("step1Data");
	if(strStep1Data != null) {
		var step1Data = JSON.parse(strStep1Data);
		var dmVisitInfo = app.lookup("VisitInfo");
		dmVisitInfo.build(step1Data.visitInfo);		
	}
	
}

function onSms_getLangListSubmitDone(e){
	var sms_getLangList = app.lookup("sms_getLangErrorList");
	var locale = dataManager.getLocale();
	sms_getLangList.action = "data/lang/lang_error_" + locale + ".json";
	sms_getLangList.send();
}

function onSms_getLangListSubmitSuccess(e){
	var dsLangList = app.lookup("LangList");
	var locale = dataManager.getLocale();
	dataManager.setLanguage(locale, dsLangList);
	
	document.title = dataManager.getString("Str_VisitorManagementTitle");	
}

function onSms_getLangErrorListSubmitDone(e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getLangErrorList = e.control;
}

function onSms_getLangErrorListSubmitSuccess(e){
	var dsLangErrorList = app.lookup("LangErrorList");
	var dsLangList = app.lookup("LangList");
	for (var i = 0; i < dsLangErrorList.getRowCount(); i++) {
		var row = dsLangErrorList.getRow(i);
		dsLangList.addRowData(row.getRowData());
	}
	
	var locale = dataManager.getLocale();
	dataManager.setLanguage(locale, dsLangList);
}

function sendVisitTargetInfoRequest() {
	var accountInfo = dataManager.getAccountInfo();
	var userID = accountInfo.getValue("UserID");
	
	var sms_GetUserList = new cpr.protocols.Submission("sms_GetUserList");
	sms_GetUserList.action = "/v1/visitor/users";
	sms_GetUserList.method = "get";
	sms_GetUserList.mediaType = "application/x-www-form-urlencoded";
	
	sms_GetUserList.addResponseData(app.lookup("Result"), false, "Result");
	sms_GetUserList.addResponseData(app.lookup("UserList"), false, "UserList");
	
	sms_GetUserList.setParameters("searchCategory", "id");
	sms_GetUserList.setParameters("searchKeyword", userID);
	// smsGetUserList.setParameters("groupID", 0);
	var fields = ["user_id", "name", "group_code", "position_code"];
	sms_GetUserList.setParameters("fields", fields);
	
	sms_GetUserList.addEventListenerOnce("submit-done", onSms_getUserListSubmitDone);
	sms_GetUserList.addEventListenerOnce("submit-error", onSms_getUserListSubmitError);
	sms_GetUserList.addEventListenerOnce("submit-timeout", onSms_getUserListSubmitTimeout);
	
	comLib.showLoadMask("", dataManager.getString("Str_VisitUserSearching"), "", 0);
	sms_GetUserList.send();
}

// 사용자 검색 완료
function onSms_getUserListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		
		var dsUserList = app.lookup("UserList");
		if (dsUserList.getRowCount() > 0) {
			var userInfo = dsUserList.getRow(0);
			
			var opbVisitTargetName = app.lookup("VMVAS1_obpVisitTargetName");
			opbVisitTargetName.value = userInfo.getValue("Name");
			
			var opbVisitTargetGroup = app.lookup("VMVAS1_obpVisitTargetGroup");
			opbVisitTargetGroup.value = userInfo.getValue("Group") + " / " + userInfo.getValue("Position");
			
			var dmVisitInfo = app.lookup("VisitInfo");
			dmVisitInfo.setValue("VisitTargetID", userInfo.getValue("UserID"));
			dmVisitInfo.setValue("VisitTargetUserName", userInfo.getValue("Name"));
			dmVisitInfo.setValue("VisitTargetGroupName", userInfo.getValue("Group"));
			dmVisitInfo.setValue("VisitTargetPositionName", userInfo.getValue("Position"));
			dmVisitInfo.setValue("Purpose", userInfo.getValue("Name"));   // 방문 목적 비워놓는 게 낫지 않을까 ?
			
			app.lookup("VMVAS1_grpVisitInfo").redraw();
		}
	} else {
		
	}
}

// 사용자 검색 에러
function onSms_getUserListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 사용자 검색 타임아웃
function onSms_getUserListSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}


function isMobile() {
	var pc_device = "win16|win32|win64|mac|macintel";
	if (navigator.platform) {
		if (pc_device.indexOf(navigator.platform.toLowerCase()) < 0) {
			return true;
		}
	}
	return false;
}

function onSearchTargetUser() {
	var width = window.innerWidth;
	var height = window.innerHeight;
	if (isMobile() == false) {
		width = 800;
		height = 1015;
	}
	var appScr;
	appScr = "app/visitor/kiosk/kioskUserSearch";
	
	app.openDialog( appScr , {
		width: width,
		height: height
	}, function(dialog) {
		dialog.headerVisible = false;
		dialog.resizable = false;
		dialog.addEventListenerOnce("close", function(e) {
			var result = dialog.returnValue;
			if (result) {
				var opbVisitTargetName = app.lookup("VMVAS1_obpVisitTargetName");
				var name = result[0]["Name"];
				if (name == undefined) {
					name = "";
				}
				opbVisitTargetName.value = name;
				
				var group = result[0]["Group"];
				if (group == undefined) {
					group = "";
				}
				var position = result[0]["Position"];
				if (position == undefined) {
					position = "";
				}
				if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
					var factory = result[1];
					if (!factory) {
						factory = "";
					} else {
						var titleOP = app.lookup("VMVAS1_obpVisitTargetFactory");
						titleOP.value = " " + factory;
					}
				}
				
				var opbVisitTargetGroup = app.lookup("VMVAS1_obpVisitTargetGroup");
				opbVisitTargetGroup.value = group + " / " + position;
				var dmVisitInfo = app.lookup("VisitInfo");
				dmVisitInfo.setValue("VisitTargetID", result[0]["UserID"]);
				dmVisitInfo.setValue("VisitTargetUserName", name);
				dmVisitInfo.setValue("VisitTargetGroupName", group);
				dmVisitInfo.setValue("VisitTargetPositionName", position);
				
				app.lookup("VMVAS1_grpVisitInfo").redraw();
			}
		})
	});
}

/*
 * 버튼(VMVAS1_btnSearchTarget)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMVAS1_btnSearchTargetClick(e){
	onSearchTargetUser();
}

/*
 * 아웃풋(VMVAS1_obpVisitTargetName)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMVAS1_obpVisitTargetNameClick(e){
	onSearchTargetUser();
}


function validateVisitInfo() {
	var dmVisitInfo = app.lookup("VisitInfo");
	
	if (dmVisitInfo.getValue("VisitTargetID").length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitTargetInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS1_obpVisitTargetName").focus(true);
			});
		});
		
		return false
	}
	
	var today = dateLib.getToday();
	var startAt = dmVisitInfo.getValue("StartDate");
	var endAt = dmVisitInfo.getValue("EndDate");
	
	if (dateLib.compareDate(today, startAt) == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitStartBeforeToday"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS1_dtiStartDate").focus(true);
			});
		});
		return false;
	}
	
	if (dateLib.compareDate(startAt, endAt) == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitStarOverEnd"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS1_dtiEndDate").focus(true);
			});
		});
		return false
	}
	//현대 엠시트, 방문목적 필수
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		if (dmVisitInfo.getValue("Purpose").length < 1) {
			dialogAlert(app, dataManager.getString("Str_Warning"), "방문목적을 입력해주세요.", function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					app.lookup("VMVAS1_ipbPurpose").focus(true);
				});
			});
			return false
		}
		
		// 현대 엠시트 방문자 옵션 만료일 검증  - zzik
		var msg = validateOptionVisit();
		
		if (msg != "true" && msg != "err") {
			dialogAlert(app, dataManager.getString("Str_Warning"), "방문 종료일을 초과하였습니다.\n" + msg + " 까지 설정 가능합니다.", function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					app.lookup("VMVAS1_dtiEndDate").focus(true);
					onVMVAS1_dtiStartDateValueChange();
				});
			});
			return false
		} else if (msg == "err") {
			// 데이터 베이스 오류 당일날 설정 가능
			dialogAlert(app, dataManager.getString("Str_Warning"), "설정 오류\n당일 설정만 가능합니다.", function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					onVMVAS1_dtiStartDateValueChange();
				});
			});
			return false
		}
	}
	if (dmVisitInfo.getValue("Purpose").length < 1) { // 방문 목적은 기본 문구 입력
		dmVisitInfo.setValue("Purpose", dataManager.getString("Str_VisitApplication"));
		//dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitPurposeInvalid"));		
		//return false
	}
	
	if (dmVisitInfo.getValue("Password").length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitPasswordInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS1_ipbPassword").focus(true);
			});
		});
		return false
	}
	
	return true;
}

/*
 * 버튼(VMVAS1_btnNext)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMVAS1_btnNextClick(e){
	// 키오스크에서  Password 없이 신청되도록 고정값 적용 (값이 바뀌어도 상관X) 
	app.lookup("VMVAS1_ipbPassword").value = "1111"; 
	
	if (validateVisitInfo() == false) {
		return;
	}
	var dmVisitInfo = app.lookup("VisitInfo");
	localStorage.setItem("step1Data", JSON.stringify({
		"visitInfo": dmVisitInfo.getDatas()
	}));
	
	cpr.core.App.load("app/visitor/kiosk/kioskVisitApplicationStep2", function(newapp) {
		app.close();
		var instance = newapp.createNewInstance().run();
	});
	
}

// 현대 엠시트 방문시작일 설정시 방문종료일 자동 방문시작일 설정
function onVMVAS1_dtiStartDateValueChange(e){
	//현대 엠시트
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		var chageStartAt = app.lookup("VMVAS1_dtiStartDate").value;
		app.lookup("VMVAS1_dtiEndDate").value = chageStartAt;
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getOptionSubmitDone(e){
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		
	} else {
		
	}
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getOptionSubmitError(e){
app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getOptionSubmitTimeout(e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


function validateOptionVisit() {
	var msg = "";
	var dmOptionVisitor = app.lookup("OptionVisitor");
	var startDate = app.lookup("VMVAS1_dtiStartDate");
	var endDate = app.lookup("VMVAS1_dtiEndDate");
	var allowDay = dmOptionVisitor.getValue("Param1");
	var allowDate = startDate.dateValue;
	
	if (allowDay) {
		allowDate.setDate(allowDate.getDate() + allowDay - 1);
		if (endDate.dateValue > allowDate) {
			msg = allowDate.getFullYear() +"-"+ (allowDate.getMonth()+1)+"-"+ allowDate.getDate();
			return msg
		}
	} else {
		msg = "err";
		return msg
	}
	msg = "true";
	return msg
}







/*
 * 버튼(VMVAS1_btnPrev)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMVAS1_btnPrevClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vMVAS1_btnPrev = e.control;
	cpr.core.App.load("app/visitor/kiosk/kioskVisitorPolicy", function(newapp){
		app.close();
		var instance = newapp.createNewInstance().run();
	});
}


/*
 * 아웃풋(VMVAS2_btnHome)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMVAS2_btnHomeClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var vMVAS2_btnHome = e.control;
	removeStepData();
	cpr.core.App.load("app/visitor/kiosk/kioskVisitorLogin", function(newapp){
		app.close();
		var instance = newapp.createNewInstance().run();
	});
}
