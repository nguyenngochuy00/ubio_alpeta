/************************************************
 * VisitUserSearch.js
 * Created at 2021. 2. 26. 오후 3:22:46.
 *
 * @author blue1
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	dataManager = getDataManager();
	app.lookup("VUS_btnGroup").getLayout().removeColumns([1,2]);
	app.lookup("VUS_cmbSearchCategory").selectItem(0);
	//app.lookup("VUS_cmbExpire").selectItem(0);
	var cmbUserTargetUserPosition = app.lookup("VUS_cmbPosition");	
	cmbUserTargetUserPosition.setItemSet(dataManager.getPositionList(), {
		label: "Name",
		value: "PositionID"		
	});	

	var initValue = app.getHost().initValue;
	var UserType = Number(initValue["UserType"]);
	
	var uType = app.lookup("VUS_cmbUserType");
	switch (UserType) {
	case 1:
		uType.value = 902;
		break;
	case 2:
		uType.value = 901;
		break;
	}
	uType.redraw();
}

function sendVisitorInformationSearch() {
	app.lookup("VisitorInformations").clear();
	
	var submission = app.lookup("sms_getVisitorInfoSearch");
	submission.removeAllParameters();
	submission.setParameters("userType", app.lookup("VUS_cmbUserType").value);
	var searchCategory = app.lookup("VUS_cmbSearchCategory").value;
	if (searchCategory == 2) { // 차량번호 검색
		submission.setParameters("carNumber", app.lookup("VUS_ipbUserName").value);
	} else { // 방문객 이름 검색
		submission.setParameters("userName", app.lookup("VUS_ipbUserName").value);
	}
	//submission.setParameters("expire", app.lookup("VUS_cmbExpire").value);
	
	// 필수값 초기값으로 설정
	submission.setParameters("limit", 100);
	submission.setParameters("offset", 0);
	submission.send();
}

/* 버튼 이벤트 */
function onSearchButtonClick(/* cpr.events.CMouseEvent */ e){
	sendVisitorInformationSearch();	
}

function onCancelButtonClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}

function onSelectButtonClick(/* cpr.events.CMouseEvent */ e){
	var button = e.control;
	var grdVisitInfo = app.lookup("VUS_grdVisitorInformation");
	var indices = grdVisitInfo.getCheckRowIndices();
	var visitInfo = app.lookup("VisitorInformations");
	if (indices.length != 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), "사용자 1명만 선택하세요."); 
		return;
	} else {
		visitInfo.copyToDataMap(app.lookup("AccessApplicationInfo"), indices[0]);
		app.lookup("AccessApplicationInfo").setValue("Predecessor", 3);	// 기본 승인 (1/2차 승인 처리) - otk
		//console.log(app.lookup("AccessApplicationInfo").getDatas());
		app.close(app.lookup("AccessApplicationInfo"));
	}
}

/* 서브미션 이벤트  */
function onSms_getVisitorInfoSearchSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		app.lookup("VUS_grdVisitorInformation").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}

function onSms_getVisitorInfoSearchSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);	
}

function onSms_getVisitorInfoSearchSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);	
}

function onVUS_ipbUserNameKeyup(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13){
		sendVisitorInformationSearch();	
	}
}

function onVUS_grdVisitorInformationCellClick(/* cpr.events.CGridMouseEvent */ e){
	var vUS_grdVisitorInformation = e.control;
	var rowIndex = vUS_grdVisitorInformation.getSelectedRowIndex();
	vUS_grdVisitorInformation.clearAllCheck();
	vUS_grdVisitorInformation.setCheckRowIndex(rowIndex, true);
}
