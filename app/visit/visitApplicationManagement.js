/************************************************
 * visitApplicationList.js
 * Created at 2020. 2. 13. 오전 9:11:41.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var util = cpr.core.Module.require("lib/util");
var comLib;
var VMEVA_ver = 0;
var VMEVA_pageRowCount = 14;
var Searchable = false;
var OEM_VERSION;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var locale = dataManager.getLocale();
	console.log(locale);
	var accountInfo = dataManager.getAccountInfo();
	var privilege = accountInfo.getValue("Privilege");
	OEM_VERSION = dataManager.getOemVersion();
	
	// 관리자 권한일 때만 검색조건으로 검색 가능.
	if (privilege === "1" || privilege > 999 ) {
		Searchable = true;
		app.lookup("group_searchInfo").visible = true;
		
		// 날짜 세팅
		// 현대 엠시트 날짜 제한 x
		if ( OEM_VERSION == OEM_HYUNDAI_MSEAT) {
			var today = new Date();
			today.setFullYear(today.getFullYear()); // y년을 더함
			today.setMonth(today.getMonth()); // m월을 더함
			today.setDate(today.getDate()); // d일을 더함
			var endDate = app.lookup("dateInput_dtEnd");
			endDate.dateValue = today;
		} else {
			SetMaxDate();
		}
		SetStartDate();
	}
	
	var accountInfo = dataManager.getAccountInfo();
	app.lookup("VMEVA_opbUserName").value = accountInfo.getValue("Name");
	

	var pageIndexer = app.lookup("VMEVA_piVisitApplicationList");	
	pageIndexer.pageRowCount = VMEVA_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)	

	if ( OEM_VERSION == OEM_HYUNDAI_MSEAT ) {
		// 현대 엠시트 방문 신청 리스트 차량번호 휴대품 정보 추가 - zzik
		app.lookup("VMEVA_grdVisitApplicationList").columnVisible(9, true);
		app.lookup("VMEVA_grdVisitApplicationList").columnVisible(10, true);
		app.lookup("VMEVA_grdVisitApplicationList").redraw();
	}
	
	// 웹소켓 연결 웹 접속 시 자동 로그아웃...
	dataManager.connectServer(window.location.host, dataManager.getAccountID(),dataManager.getAccountUuid(),onClose,onError,onMessage);
	
	var sms_getLangList = app.lookup("sms_getLangList");
	sms_getLangList.action = "data/lang/lang_visit_" + locale + ".json";
	sms_getLangList.send();
}

function SetMaxDate() {
	var date = new Date();
	date.setFullYear(date.getFullYear()); // y년을 더함
	date.setMonth(date.getMonth()); // m월을 더함
	date.setDate(date.getDate()); // d일을 더함
	
	var startDate = app.lookup("dateInput_dtStart");
	var endDate = app.lookup("dateInput_dtEnd");
	startDate.maxDate = date;
	endDate.maxDate = date;
	endDate.dateValue = date;
}

function SetStartDate() {
	var date = new Date();
	date.setFullYear(date.getFullYear()); // y년을 더함
	date.setMonth(date.getMonth()); // m월을 더함
	date.setDate(1); // d일을 더함
	
	var startDate = app.lookup("dateInput_dtStart");
	startDate.dateValue = date;
}
exports.setVisitLoginInfo = function(loginInfo) {
	var dmLoginInfo = app.lookup("LoginInfo");
	dmLoginInfo.build(loginInfo);
}

exports.setOEMVer = function(ver) {
	VMEVA_ver = ver
	if (VMEVA_ver == 3) {
		app.lookup("VMEVA_opb1").unbind("value");
		app.lookup("VMEVA_opb1").value = "참가신청 관리";
		app.lookup("VMEVA_opb1").redraw();
		
		app.lookup("VMEVA_opb2").unbind("value");
		app.lookup("VMEVA_opb2").value = "참가신청 리스트";
		app.lookup("VMEVA_opb2").redraw();
		
		app.lookup("VMEVA_btnVisitApplication").unbind("value");
		app.lookup("VMEVA_btnVisitApplication").value = "참가신청";
		
		var grdVisitApplicationList = app.lookup("VMEVA_grdVisitApplicationList");
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
		grd6.setText("행사내용");
		
		var grd7 = grdVisitApplicationList.header.getColumn(7);
		grd7.unbind("text");
		grd7.setText("참가자 정보");
	}
}

// 언어 가져오기 성공
function onSms_getLangListSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	var dsLangList = app.lookup("LangList");
	var locale = dataManager.getLocale();
	dataManager.setLanguage(locale, dsLangList);
	
	document.title = dataManager.getString("Str_VisitorManagementTitle");
}

// 언어 가져오기 완료
function onSms_getLangListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var sms_getLangList = app.lookup("sms_getLangErrorList");
	var locale = dataManager.getLocale();
	sms_getLangList.action = "data/lang/lang_error_" + locale + ".json";
	sms_getLangList.send();
}

//
function onSms_getLangErrorListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	document.title = dataManager.getString("Str_VisitorManagementTitle");
	
	var cmbStatusFilter = app.lookup("VMEVA_cmbStatusFilter");
	cmbStatusFilter.addItem(new cpr.controls.Item("--------", -1));
	cmbStatusFilter.addItem(new cpr.controls.Item(dataManager.getString("Str_ApprovalWait"), VisitApprovalWaiting));
	cmbStatusFilter.addItem(new cpr.controls.Item(dataManager.getString("Str_Approved"), VisitApprovalApproved));
	cmbStatusFilter.addItem(new cpr.controls.Item(dataManager.getString("Str_Denied"), VisitApprovalDenied));
	cmbStatusFilter.addItem(new cpr.controls.Item(dataManager.getString("Str_ApprovalExpired"), VisitApprovalExpired));
	cmbStatusFilter.selectItemByValue(-1, false);
	
	var cmbStatus = app.lookup("VMVAL_cmbStatus");
	cmbStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_ApprovalWait"), VisitApprovalWaiting));
	cmbStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_Approved"), VisitApprovalApproved));
	cmbStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_Denied"), VisitApprovalDenied));
	cmbStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_ApprovalExpired"), VisitApprovalExpired));
	
	// 기간 검색 조건. 1: 등록일, 2: 방문시작일, 3: 방문종료일 
	var cmbPeriodType = app.lookup("cmb_periodType");
	cmbPeriodType.addItem(new cpr.controls.Item("--------", -1));
	cmbPeriodType.addItem(new cpr.controls.Item(dataManager.getString("Str_VisitRegistAt"), 1));
	cmbPeriodType.addItem(new cpr.controls.Item(dataManager.getString("Str_VisitStartAt"), 2));
	cmbPeriodType.addItem(new cpr.controls.Item(dataManager.getString("Str_VisitEndAt"), 3));
	cmbPeriodType.addItem(new cpr.controls.Item(dataManager.getString("Str_VisitStartEndAt"), 4));
	
	cmbPeriodType.selectItemByValue(-1, true);
	
	
//	if ( OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		FirstLoginCheck();
//	}

	sendVisitApplicationList();
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

function sendVisitApplicationList() {
	
//	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		var AccountInfo = dataManager.getAccountInfo();
		var firstFlag = AccountInfo.getValue("FirstLoginFlag");
		if (firstFlag == 1) {
			return
		}
//	}
	
	var pageIndexer = app.lookup("VMEVA_piVisitApplicationList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * VMEVA_pageRowCount;
	
	
	app.lookup("op_Total").value = "";
	var getVisitApplicationList = app.lookup("sms_getVisitApplicationList");
	var dmLoginInfo = app.lookup("ApplicationInfo");
	//getVisitApplicationList.setParameters("FirstName", "");
	//getVisitApplicationList.setParameters("LastName", "");
	getVisitApplicationList.setParameters("FirstName", app.lookup("VMEVA_ipbFirstName").text);
	getVisitApplicationList.setParameters("LastName", app.lookup("VMEVA_ipbLastName").text);
	getVisitApplicationList.setParameters("Birthday", "");
	getVisitApplicationList.setParameters("Password", "");
	getVisitApplicationList.setParameters("Status", dmLoginInfo.getValue("Status"));
	getVisitApplicationList.setParameters("limit", VMEVA_pageRowCount);
	getVisitApplicationList.setParameters("offset", offset);
	getVisitApplicationList.send();
}

function sendVisitApplicationListOnSearch() {
	var startTime = app.lookup("dateInput_dtStart").value;
	var endTime = app.lookup("dateInput_dtEnd").value;
	app.lookup("op_Total").value = "";
	var getVisitApplicationList = app.lookup("sms_getVisitApplicationList");
	var dmLoginInfo = app.lookup("ApplicationInfo");
	
	var pageIndexer = app.lookup("VMEVA_piVisitApplicationList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * VMEVA_pageRowCount;
	
	
	
	getVisitApplicationList.setParameters("FirstName", app.lookup("VMEVA_ipbFirstName").text);
	getVisitApplicationList.setParameters("LastName", app.lookup("VMEVA_ipbLastName").text);
	getVisitApplicationList.setParameters("Birthday", "");
	getVisitApplicationList.setParameters("Password", "");
	getVisitApplicationList.setParameters("startTime", startTime + " 00:00:00");
	getVisitApplicationList.setParameters("endTime", endTime + " 23:59:59");
	getVisitApplicationList.setParameters("Status", dmLoginInfo.getValue("Status"));
	getVisitApplicationList.setParameters("PriodType", app.lookup("cmb_periodType").value);
	getVisitApplicationList.setParameters("limit", VMEVA_pageRowCount);
	getVisitApplicationList.setParameters("offset", offset);
	
	if( app.lookup("cmb_periodType").value == "4") {
		getVisitApplicationList.setParameters("endTime", startTime + " 23:59:59");
	}
	
	getVisitApplicationList.send();
}

function refreshVisitorSummary() {
	
	var dsVisitInfoList = app.lookup("VisitInfoList");
	var count = dsVisitInfoList.getRowCount();
	
	//app.lookup("op_Total").value = count.toString();
	for (var i = 0; i < count; i++) {
		var visitInfo = dsVisitInfoList.getRow(i);
		//console.log(visitInfo.getRowData());
		if (visitInfo) {
			var name = visitInfo.getValue("VisitorFirstName") + " " + visitInfo.getValue("VisitorLastName") + " 외 " + visitInfo.getValue("VisitorCount");
			visitInfo.setValue("VisitorSummary", name);
		}
	}
}

// 방문 신청 취소 클릭
function onVMVAL_btnVisitApplicationCancelClick( /* cpr.events.CMouseEvent */ e) {
	/** @type cpr.controls.Button	 */
	var vMVAL_btnVisitApplicationCancel = e.control;
	
	console.log("onVMVAL_btnVisitApplicationCancelClick2");
}

// 검색* 버튼(VMEVA_btnSearch)에서 click 이벤트 발생 시 호출.
function onVMEVA_btnSearchClick( /* cpr.events.CMouseEvent */ e) {
	var pageIndexer = app.lookup("VMEVA_piVisitApplicationList");
	pageIndexer.currentPageIndex = 1;
	
	//시간 유효성 확인
	var startTime = app.lookup("dateInput_dtStart").value;
	var endTime = app.lookup("dateInput_dtEnd").value;
	if( app.lookup("cmb_periodType").value != "4"){
	var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
	if (isStartEndDateValid === false) {
		dialogAlert(app, "error", dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false
	}
	}
	comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
	if (Searchable) {
		sendVisitApplicationListOnSearch();
	} else {
		sendVisitApplicationList();
	}
	
	if ( OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		app.lookup("VMEVA_ipbLastName").clear();
		app.lookup("VMEVA_ipbFirstName").clear();
	}
	
}

// 방문 신청 리스트 가져오기 완료
function onSms_getVisitApplicationListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		refreshVisitorSummary();
		var pageIndexer = app.lookup("VMEVA_piVisitApplicationList");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;
		app.lookup("op_Total").value = total;
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
	
	var sms_getAccessGroupList = app.lookup("sms_getAccessGroupList");
	sms_getAccessGroupList.send();
}

// 방문 신청 리스트 가져오기 에러
function onSms_getVisitApplicationListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 방문 신청 리스트 가져오기 타임아웃
function onSms_getVisitApplicationListSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

// 출입그룹 가져오기 완료
function onSms_getAccessGroupListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		var dsAccessGroupList = app.lookup("AccessGroupList");
		dataManager.setAccessGroup(dsAccessGroupList);
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 출입그룹 가져오기 에러
function onSms_getAccessGroupListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}
// 출입그룹 가져오기 타임아웃
function onSms_getAccessGroupListSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

function refreshVisitorSummary() {
	var dsVisitInfoList = app.lookup("VisitInfoList");
	var count = dsVisitInfoList.getRowCount();
	//app.lookup("op_Total").value = count.toString();
	for (var i = 0; i < count; i++) {
		var visitInfo = dsVisitInfoList.getRow(i);
		if (visitInfo) {
			var visitCount = visitInfo.getValue("VisitorCount");
			visitCount -= 1;
			var name = "";
			if (visitCount != 0) {
				name = "(+" + visitCount + ")";
			}

			if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
				var	name = visitInfo.getValue("VisitorLastName") + visitInfo.getValue("VisitorFirstName") + " " + name;
			} else {
				var name = visitInfo.getValue("VisitorLastName") + " " + visitInfo.getValue("VisitorFirstName") + " " + name;
			}
			
			visitInfo.setValue("VisitorSummary", name);
			
			if ( OEM_VERSION == OEM_HYUNDAI_MSEAT ) {
				var itemCount = visitInfo.getValue("ItemCount");
				if (itemCount >= 1) {
					itemCount = itemCount - 1;
					var etc = "";
					if (itemCount != 0){
						etc =  "(+" + itemCount + ")";	
					}
					var itemName = changeItemTypetoItemName(visitInfo.getValue("VisitorItemNameType"));
					if (itemName.length > 0) {
						itemName = itemName + " " + etc;
						visitInfo.setValue("VisitorItemSummary", itemName);
					}
				}
			}
		}
	}
}
// 방문 신청 리스트 더블 클릭
function onVMEVA_grdVisitApplicationListRowDblclick( /* cpr.events.CGridEvent */ e) {
	var rect = app.getActualRect();
	app.getRootAppInstance().openDialog("app/visit/visitApplicationViewEx", {
		width: rect.width,
		height: rect.height
	}, function(dialog) {
		dialog.initValue = {
			"VisitIndex": e.row.getValue("VisitIndex"),
			"OEM": VMEVA_ver
		};
		dialog.resizable = false;
		dialog.modal = true;
		dialog.maximize();
		dialog.headerVisible = false;
		//dialog.bind("headerTitle").toLanguage("Str_WebCamViewer");				
	}).then(function(returnValue) {
		sendVisitApplicationList();
	});
}

// 로그아웃 클릭
function onVMEVA_btnLogoutClick( /* cpr.events.CMouseEvent */ e) {
	app.lookup("sms_logout").send();
}

function onSms_logoutSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var appld = "app/visitLogin";
	cpr.core.App.load(appld, function(newapp) {
		app.getRootAppInstance().close();
		location.reload();
	});
	return;
}

// "링크 발송" 버튼(VMEVA_btnInvite)에서 click 이벤트 발생 시 호출.
function onVMEVA_btnInviteClick( /* cpr.events.CMouseEvent */ e) {
	var rect = app.getActualRect();
	app.getRootAppInstance().openDialog("app/visit/visitInvite", {
		width: 490,
		height: 320
	}, function(dialog) {
		dialog.initValue = {
			"email": "",
			"mode": "invite"
		};
		dialog.resizable = false;
		dialog.headerVisible = false;
		//dialog.bind("headerTitle").toLanguage("Str_WebCamViewer");
		dialog.modal = true;
	}).then(function(returnValue) {
		if (returnValue) {
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_VisitLinkSendSuccess"));
		}
	});
}

function onNextStep(step, data) {
	var rect = app.getActualRect();
	
	if (step == 0) { // 방문 정보
		app.getRootAppInstance().openDialog("app/visit/visitApplicationStep1", {
			width: rect.width,
			height: rect.height
		}, function(dialog) {
			dialog.initValue = {
				"OEM": VMEVA_ver,
				"src": "visit"
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
				"OEM": VMEVA_ver,
				"src": "visit",
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
				"OEM": VMEVA_ver,
				"src": "visit",
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
		sendVisitApplicationList();
	}
}
// 방문 신청 클릭
function onVMEVA_btnVisitApplicationClick( /* cpr.events.CMouseEvent */ e) {
	localStorage.setItem("oem", "0");
	localStorage.setItem("src", "visit");
	
	cpr.core.App.load("app/visit/visitApplicationStep1", function(newapp) {
		app.close();
		var instance = newapp.createNewInstance().run();
	});
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmb_periodTypeSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmb_periodType = e.control;
	if (cmb_periodType.value < 0) {
		app.lookup("dateInput_dtStart").enabled = false;
		app.lookup("dateInput_dtEnd").enabled = false;
	} else {
		app.lookup("dateInput_dtStart").enabled = true;
		if (cmb_periodType.value == 4) {
			app.lookup("dateInput_dtEnd").enabled = false;	
		} else {
			app.lookup("dateInput_dtEnd").enabled = true;
		}
	}
}

/*
 * 버튼(VMEVA_btnPassword)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMEVA_btnPasswordClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vMEVA_btnPassword = e.control;
	app.getRootAppInstance().openDialog("app/main/mainEmb/SetPassword", {width: 400, height: 220}, function(dialog){
			dialog.ready(function(dialogApp){
				dialog.modal = true;
				dialog.headerClose = true;
				dialog.headerTitle = dataManager.getString("Str_PasswordChange");
				dialog.initValue = {"VisitFlag" : 1};
			});
		}).then(function(returnValue){
			if (returnValue == 1){
				dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_PasswordChangeSuccess"));
			}
		});
	
}


function onVMEVA_piVisitApplicationListSelectionChange(/* cpr.events.CSelectionEvent */ e){	
	sendVisitApplicationList();
}

function changeItemTypetoItemName(type) {
	var typeName = ""
	switch(type){
		case 1:
			typeName = dataManager.getString("Str_ItemNameNotebook");
			break;
		case 2:
			typeName = dataManager.getString("Str_ItemNamePC");
			break;
		case 3:
			typeName = dataManager.getString("Str_ItemNamePDA");
			break;
		case 4:
			typeName = dataManager.getString("Str_ItemNamePMP");
			break;
		case 5:
			typeName = dataManager.getString("Str_ItemNameMobile");
			break;
		case 11:
			typeName = dataManager.getString("Str_ItemNameUSB");
			break;
		case 12:
			typeName = dataManager.getString("Str_ItemNameHard");
			break;
		case 13:
			typeName = dataManager.getString("Str_ItemNameCD");
			break;
		case 14:
			typeName = dataManager.getString("Str_ItemNameDisk");
			break;
		case 21:
			typeName = dataManager.getString("Str_ItemNameRecoder");
			break;
		case 22:
			typeName = dataManager.getString("Str_ItemNameCamera");
			break;
		case 23:
			typeName = dataManager.getString("Str_ItemNameCam");
			break;
		case 23:
			typeName = dataManager.getString("Str_ItemNameCam");
			break;
		case 24:
			typeName = dataManager.getString("Str_ItemNameVoiceRecoder");
			break;
		case 0:
			typeName = dataManager.getString("Str_ItemTypeEtc");
			break;
		default:
			typeName = "";
	}
	return typeName;

}

function FirstLoginCheck() {

	var AccountInfo = dataManager.getAccountInfo();
	var firstFlag = AccountInfo.getValue("FirstLoginFlag");
	if (firstFlag == 1) { //만료거나 처음로그인 최초로그인 판단은 서버에서 해주도록 수정 해야함
		var headerClose = true;
		
		app.getRootAppInstance().openDialog("app/main/mainEmb/SetPassword", {width: 400, height: 220}, function(dialog){
			dialog.ready(function(dialogApp){
				dialog.modal = true;
				dialog.headerClose = false;
				dialog.headerTitle = dataManager.getString("Str_PasswordChange");
				dialog.initValue = {"VisitFlag" : 1};
			});
		}).then(function(returnValue){
			if (returnValue == 1){
				dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_PasswordChangeSuccess"), function( /*cpr.controls.Dialog*/ dialog) {
					dialog.addEventListenerOnce("close", function(e) {					
						app.lookup("sms_logout").send();
					});
				});
			}
		});
	}
}

function onClose(message){
	var msg = dataManager.getString("Str_ErrorServerDisconnected");

	var appld = "app/visitLogin";
    cpr.core.App.load(appld, function(newapp) {
		var programManager = cpr.core.Module.require("lib/ProgramManager");
		programManager.dispose();
		var dataManager = cpr.core.Module.require("lib/DataManager");
		dataManager = getDataManager();
		dataManager.dispose();

		app.getRootAppInstance().close();
		location.href = window.location.href;
	}); 
	
}

function onError(message){
	console.log("error... " + message);
}

function onMessage(message){
	var msg = JSON.parse(message.data);
	
    switch(msg.msgId){
    case WSCmdLogoutNotify:
    	var msgBody = JSON.parse(msg.body);
    	
		// 웹에서 로그인 요청시 로그인 페이지 이동
		var appld = "app/visitLogin";
		cpr.core.App.load(appld, function(newapp) {
			var programManager = cpr.core.Module.require("lib/ProgramManager");
			programManager.dispose();
			var dataManager = cpr.core.Module.require("lib/DataManager");
			dataManager = getDataManager();
			dataManager.dispose();
			
			app.getRootAppInstance().close();
			location.reload();
		});
		break;    	
    }
    
}
