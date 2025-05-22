/************************************************
 * visitApplicationList.js
 * Created at 2020. 2. 13. 오전 9:11:41.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var VMVAL_ver = 0;
var OEM_VERSION = 0;
function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	var locale = dataManager.getLocale();
	OEM_VERSION = dataManager.getOemVersion();
	
	var sms_getLangList = app.lookup("sms_getLangList");
	sms_getLangList.action = "data/lang/lang_visit_" + locale + ".json";
	sms_getLangList.send();
	
	if (VMVAL_ver == 3) {
		app.lookup("VMVAL_opb1").unbind("value");
		app.lookup("VMVAL_opb1").value = "참가신청 리스트";
		app.lookup("VMVAL_opb1").redraw();
		
		app.lookup("VMVAL_btnVisitApplication").unbind("value");
		app.lookup("VMVAL_btnVisitApplication").value = "참가신청";
		
		var grdVisitApplicationList = app.lookup("VMVAL_grdVisitApplicationList");
		var grd2 = grdVisitApplicationList.header.getColumn(2);
		grd2.unbind("text");
		grd2.setText("행사시작일시");
		
		var grd3 = grdVisitApplicationList.header.getColumn(3);
		grd3.unbind("text");
		grd3.setText("행사종료일시");
		
		var grd4 = grdVisitApplicationList.header.getColumn(4);
		grd4.unbind("text");
		grd4.setText("행사명");
		
		var grd6 = grdVisitApplicationList.header.getColumn(6);
		grd6.unbind("text");
		grd6.setText("행사일정");
		
		var grd7 = grdVisitApplicationList.header.getColumn(7);
		grd7.unbind("text");
		grd7.setText("참가자 정보");
	}
	// 서버에서 처리
//	app.lookup("VMVAL_grdVisitApplicationList").sort("RegistAt DESC");
}
exports.setOEMVer = function(ver) {
	VMVAL_ver = ver
}
//
function onSms_getLangListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var sms_getLangList = app.lookup("sms_getLangErrorList");
	var locale = dataManager.getLocale();
	sms_getLangList.action = "data/lang/lang_error_" + locale + ".json";
	sms_getLangList.send();
}

//
function onSms_getLangListSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	var dsLangList = app.lookup("LangList");
	var locale = dataManager.getLocale();
	dataManager.setLanguage(locale, dsLangList);
	
	document.title = dataManager.getString("Str_VisitorManagementTitle");
}

//
function onSms_getLangErrorListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	refreshVisitorSummary();
	
	var cmbStatus = app.lookup("VMVAL_cmbStatus");
	cmbStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_ApprovalWait"), VisitApprovalWaiting));
	cmbStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_Approved"), VisitApprovalApproved));
	cmbStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_Denied"), VisitApprovalDenied));
	cmbStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_ApprovalExpired"), VisitApprovalExpired));
}

//
function onSms_getLangErrorListSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	var dsLangErrorList = app.lookup("LangErrorList");
	var dsLangList = app.lookup("LangList");
	for (var i = 0; i < dsLangErrorList.getRowCount(); i++) {
		var row = dsLangErrorList.getRow(i);
		dsLangList.addRowData(row.getRowData());
	}
	
	var locale = dataManager.getLocale();
	dataManager.setLanguage(locale, dsLangList);
}

function refreshVisitorSummary() {
	var local = dataManager.getLocale(); // 언어 확인을 위한 변수 - sep
	var dsVisitInfoList = app.lookup("VisitInfoList");
	var count = dsVisitInfoList.getRowCount();
	
	var and; // "외"를 언어별로 표기할 변수  - sep
	if (local == "ko"){ // 한국어
		and = " 외 ";			
	} else if (local == "ja"){ // 일본어
		and = " 外 ";
	} else { // 영어 포함 그 외 언어들
		and = " and ";
	}
	
	for (var i = 0; i < count; i++) {
		var visitInfo = dsVisitInfoList.getRow(i);
		if (visitInfo) { 
			//var name = visitInfo.getValue("VisitorFirstName")+ " " + visitInfo.getValue("VisitorLastName") + " 외 " +visitInfo.getValue("VisitorCount");
			var name = visitInfo.getValue("VisitorLastName") + " " + visitInfo.getValue("VisitorFirstName") + and + visitInfo.getValue("VisitorCount");		
			visitInfo.setValue("VisitorSummary", name);
		}
	}
}
exports.setVisitInfoList = function(applicationInfo, visitInfoList) {
	var dmApplicationInfo = app.lookup("ApplicationInfo");
	dmApplicationInfo.build(applicationInfo);
	
	var dsVisitInfoList = app.lookup("VisitInfoList");
	dsVisitInfoList.build(visitInfoList);
}
exports.setVisitorInfo = function(firstName, lastName, birthday, password) {
	var sms_getVisitorLogin = app.lookup("sms_getVisitApplicationList");
	sms_getVisitorLogin.setParameters("FirstName", firstName);
	sms_getVisitorLogin.setParameters("LastName", lastName);
	sms_getVisitorLogin.setParameters("Birthday", birthday);
	sms_getVisitorLogin.setParameters("Password", password);
	sms_getVisitorLogin.send();
}

// 방문 신청 리스트 더블 클릭
function onVMVAL_grdVisitApplicationListRowDblclick( /* cpr.events.CGridEvent */ e) {
	/** @type cpr.controls.Grid	 */
	
	var oem = dataManager.getOemVersion();
	if (oem == OEM_HYUNDAI_MSEAT) {
		return;
	}
	var vMVAL_grdVisitApplicationList = e.control;
	if (e.row.getValue("Status") != VisitApprovalNone && e.row.getValue("Status") != VisitApprovalWaiting) {
		return;
	}
	cpr.core.App.load("app/visitor/visitApplication", function(newapp) {
		app.close();
		var instance = newapp.createNewInstance().run();
		instance.callAppMethod("setModify", VMVAL_ver, 1, e.row.getValue("VisitIndex"));
	});
}

// 방문 신청 취소 클릭
function onVMVAL_btnVisitApplicationCancelClick( /* cpr.events.CMouseEvent */ e) {
	/** @type cpr.controls.Button	 */
	var vMVAL_btnVisitApplicationCancel = e.control;
	var grdVisitorList = app.lookup("VMVAL_grdVisitApplicationList");
	var dsVisit = app.lookup("VisitInfoList");
	
	var indices = grdVisitorList.getCheckRowIndices();
	var delCount = indices.length;
	if (delCount == 0) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_VisitApplicationNotSelected"));
		return;
	}
	
	//실제 삭제할리스트 추리기
	
	console.log("onVMVAL_btnVisitApplicationCancelClick");
	
	//	comLib.showLoadMask("pro",dataManager.getString("Str_UserDelete"),"",checkedRowIndices.length);
	
	var dsDeleteList = app.lookup("VisitInfoListDelete");
	
	dsDeleteList.clear();
	for (var i = 0; i < delCount; i++) {
		var delReqInfo = dsVisit.getRow(indices[i]);
		if (delReqInfo.getValue("Status") != VisitApprovalWaiting) {
			continue; // 대기 상태 아니면 넘기기
		}
		
		var dmDeleteList = {
			"VisitIndex": delReqInfo.getValue("VisitIndex"),
			"rowIndex": delReqInfo.getIndex()
		};
		dsDeleteList.addRowData(dmDeleteList);
	}
	
	dsDeleteList.commit();
	if (dsDeleteList.getRowCount() < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnNoCancelableVisitApplication"));
		
	} else {
		sendDeleteVisitApplication();
	}
	
	grdVisitorList.commitData();
}

function onNextStep(step, data) {
	var rect = app.getActualRect();
	if (step == 0) { // 방문 정보
		app.getRootAppInstance().openDialog("app/visit/visitApplicationStep1", {
			width: rect.width,
			height: rect.height
		}, function(dialog) {
			dialog.initValue = {
				"OEM": VMVAL_ver,
				"visitor": "visit"
			};
			dialog.resizable = false;
			dialog.headerVisible = false;
			dialog.modal = true;
		}).then(function(returnValue) {
			if (returnValue.result == "success") {
				onNextStep(returnValue.step, returnValue);
			}
		});
	} else if (step == 1) { // 방문자 정보
		app.getRootAppInstance().openDialog("app/visit/visitApplicationStep2", {
			width: rect.width,
			height: rect.height
		}, function(dialog) {
			dialog.initValue = {
				"OEM": VMVAL_ver,
				"src": "visitor",
				"data": data
			};
			dialog.resizable = false;
			dialog.headerVisible = false;
			dialog.modal = true;
		}).then(function(returnValue) {
			if (returnValue.result == "success") {
				onNextStep(returnValue.step, returnValue);
			}
		});
	} else if (step == 2) { // 휴대품 정보
		app.getRootAppInstance().openDialog("app/visit/visitApplicationStep3", {
			width: rect.width,
			height: rect.height
		}, function(dialog) {
			dialog.initValue = {
				"OEM": VMVAL_ver,
				"src": "visitor",
				"data": data
			};
			dialog.resizable = false;
			dialog.headerVisible = false;
			dialog.modal = true;
		}).then(function(returnValue) {
			if (returnValue.result == "success") {
				onNextStep(returnValue.step, returnValue);
			}
		});
	} else if (step == 3) { // 완료
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_VisitApplicationCompleted"));
		var sms_getVisitorLogin = app.lookup("sms_getVisitApplicationList");
		sms_getVisitorLogin.send();
	}
}

//
function onVMVAL_btnVisitApplicationClick( /* cpr.events.CMouseEvent */ e) {
	onNextStep(0);
	/*
	cpr.core.App.load("app/visitor/visitApplication", function(newapp) {
		app.close();
		newapp.createNewInstance().run();				
	})
	* */
	;
	localStorage.setItem("oem", "0");
	localStorage.setItem("src", "visitor");
	
	cpr.core.App.load("app/visit/visitApplicationStep1", function(newapp) {
		app.close();
		var instance = newapp.createNewInstance().run();
	});
	
}

function sendDeleteVisitApplication() {
	var dsDeleteList = app.lookup("VisitInfoListDelete");
	if (dsDeleteList.getRowCount() == 0) {
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_VisitApplication") + " " + dataManager.getString("Str_Delete") +
			dataManager.getString("Str_Complete"));
		return;
	}
	var dsVisitor = dsDeleteList.getRow(0);
	var VisitIndex = dsVisitor.getValue("VisitIndex");
	
	var sms_delVisitApplicationList = app.lookup("sms_delVisitApplicationList");
	// 현대 엠시트  http 메소드 우회
	
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		sms_delVisitApplicationList.action = "/v1/visitor/visitorApplicationHDMSDEL/" + VisitIndex;
		sms_delVisitApplicationList.method = "get";
	} else {
		sms_delVisitApplicationList.action = "/v1/visitor/visitorApplication/" + VisitIndex;
		sms_delVisitApplicationList.method = "delete";
	}
	sms_delVisitApplicationList.mediaType = "application/x-www-form-urlencoded";
	sms_delVisitApplicationList.userAttr("VisitIndex", VisitIndex);
	sms_delVisitApplicationList.userAttr("rowIndex", dsVisitor.getValue("rowIndex").toString());
	sms_delVisitApplicationList.send();
}

function onSms_delVisitApplicationListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var delVisitApplicationList = e.control;
	
	var dsDeleteList = app.lookup("VisitInfoListDelete");
	dsDeleteList.realDeleteRow(0);
	
	var gridVisitList = app.lookup("VMVAL_grdVisitApplicationList");
	
	var VisitIndex = delVisitApplicationList.userAttr("VisitIndex");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var rowIndex = parseInt(delVisitApplicationList.userAttr("rowIndex"), 10);
		if (rowIndex >= gridVisitList.getRowCount()) {
			return;
		}
		gridVisitList.deleteRow(rowIndex);
		gridVisitList.setCheckRowIndex(rowIndex, false);
		sendDeleteVisitApplication();
	} else {
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"),
			//VisitIndex + " " + dataManager.getString("Str_VisitApplication") + " " + dataManager.getString("Str_Delete") + " " +
			//dataManager.getString("Str_Failed") + "." + dataManager.getString(getErrorString(resultCode)));
			dataManager.getString("Str_VisitApplication") + " " + dataManager.getString("Str_Delete") + " " +
			dataManager.getString("Str_Failed") + ". " + dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_delVisitApplicationListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_delVisitApplicationListSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}