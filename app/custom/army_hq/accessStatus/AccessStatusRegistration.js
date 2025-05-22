/************************************************
 * AccessStatusRegistration.js
 * Created at 2021. 1. 27. 오전 10:25:27.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

var ASR_tabIndex = 1; 			// 현재 탭 인덱스
var UserAccessRegistration = 1;
var CarAccessRegistration= 2;
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	// alert("개발중인 메뉴입니다");
	var userType = app.lookup("ASR_cmbUserType1");
	userType.addItem(new cpr.controls.Item("----", 0));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_OtherUnit"), UserPrivArmyOtherUnit));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Foreign"), UserPrivArmyForeign));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Soldier"), UserPrivArmySoldier));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Family"), UserPrivArmyFamily));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Resident"), UserPrivArmyResident));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Regular"), UserPrivArmyRegular));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_MilitaryPersonnel"), UserPrivArmyMilitaryPersonnel));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_ArmyPublicServicel"), UserPrivArmyPublicService));
	
	app.lookup("sms_getMusteringList").send();
	
}


/*
 * 탭 폴더에서 selection-change 이벤트 발생 시 호출.
 * Tab Item을 선택한 후에 발생하는 이벤트.
 */
function onASR_tapMenuSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var tabFolder = e.control;
	var tabItem = tabFolder.getSelectedTabItem();
 	ASR_tabIndex = tabItem.id;
}


/* 버튼 클릭 이벤트 */
function onDeleteLineButtonClick(/* cpr.events.CMouseEvent */ e){
	var dataSet;
	switch (ASR_tabIndex) {
	case UserAccessRegistration:
		dataSet = app.lookup("dsUserAccessInfo");	
		break;
	case CarAccessRegistration:
		dataSet = app.lookup("dsCarAccessInfo");
		break;
	}
	
	var count = dataSet.getRowCount();
	dataSet.deleteRow(count-1);
	dataSet.commit();
}

function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (var i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}

function onAddLineButtonClick(/* cpr.events.CMouseEvent */ e){
	var dataSet;
	var insertRow;
	var now = new Date();
	var time = leadingZeros(now.getHours(), 2) + ':' +  leadingZeros(now.getMinutes(), 2);
	var date = leadingZeros(now.getFullYear(), 4) + '-' +  leadingZeros(now.getMonth()+1, 2) + '-' + leadingZeros(now.getDate(), 2); 
	switch (ASR_tabIndex) {
	case UserAccessRegistration:
		dataSet = app.lookup("dsUserAccessInfo");
		insertRow = {"AccessTime": time, "AccessDate": date, "AccessAreaID": 0, "AccessType": 1, "UserType": 0};
		break;
	case CarAccessRegistration:
		dataSet = app.lookup("dsCarAccessInfo");
		insertRow = {"AccessTime": time, "AccessDate": date, "AccessAreaID": 0, "AccessType": 1, "CarType": 1};
		break;
	}
	
	dataSet.addRowData(insertRow);
	dataSet.commit();
}

function onRegistButtonClick(/* cpr.events.CMouseEvent */ e){
	if (!validationCheck()) {
		console.log("validationCheck()");
		return;
	} 
	
	var submission = app.lookup("sms_postManualAccessStatus");
	submission.action = "/v1/armyhq/manualAccessStatus/" + ASR_tabIndex;
	submission.send();
}

function validationCheck(){
	var dataSet;
	switch (ASR_tabIndex) {
	case UserAccessRegistration:
		dataSet = app.lookup("dsUserAccessInfo");
		for (var i=0; i < dataSet.getRowCount(); i++) {
			var row = dataSet.getRow(i);
			if (!checkZeroControl(i+1, row.getValue("AccessAreaID"), "Str_ARMY_AccessAreaInvalid")){ return false; }
			if (!checkZeroControl(i+1, row.getValue("UserType"), "Str_ARMY_UserTypeInvalid")){ return false; }
			if (!checkNullControl(i+1, row.getValue("Name"), "Str_ARMY_UserNameInvalid")){ return false; }
			if (!checkNullControl(i+1, row.getValue("AddressNote"), "Str_ARMY_AddressMemoInvalid")){ return false; }
			if (!checkNullControl(i+1, row.getValue("PurposeOfAccess"), "Str_ARMY_PurposeVisitInvalid")){ return false; }
		}
		break;
	case CarAccessRegistration:
		dataSet = app.lookup("dsCarAccessInfo");
		for (var i=0; i < dataSet.getRowCount(); i++) {
			var row = dataSet.getRow(i);
			if (!checkZeroControl(i+1, row.getValue("AccessAreaID"), "Str_ARMY_AccessAreaInvalid")){ return false; }
			if (!checkNullControl(i+1, row.getValue("CarNumber"), "Str_ARMY_CarNumberInvalid")){ return false; }
			if (!checkNullControl(i+1, row.getValue("Name"), "Str_ARMY_UserNameInvalid")){ return false; }
			if (!checkNullControl(i+1, row.getValue("AddressNote"), "Str_ARMY_AddressMemoInvalid")){ return false; }
			if (!checkNullControl(i+1, row.getValue("PurposeOfAccess"), "Str_ARMY_PurposeVisitInvalid")){ return false; }
		}
		break;
	}
	return true;
}

function checkNullControl(lineIndex, dataValue, ErrorMsg) {
	if( dataValue == null || dataValue.length < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "No [" + lineIndex +"] :" + dataManager.getString(ErrorMsg));
		return false;
	}
	return true;
}

function checkZeroControl(lineIndex, dataValue, ErrorMsg) {
	if( dataValue == 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "No [" + lineIndex +"] :" + dataManager.getString(ErrorMsg));
		return false;
	}
	return true;
}




/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getMusteringListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		var insetData = {"MusteringID": 0, "MusteringName": "--------"};
		app.lookup("MusteringList").addRowData(insetData);
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}	
}

function onSms_getMusteringListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);	
}

function onSms_getMusteringListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postManualAccessStatusSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMY_AccessStatusRegistCompleated"));
		app.lookup("dsUserAccessInfo").clear();
		app.lookup("dsCarAccessInfo").clear();
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}	
	
}

function onSms_postManualAccessStatusSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);	
}

function onSms_postManualAccessStatusSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);	
}


/*
 * 파일 인풋에서 context-value-change 이벤트 발생 시 호출.
 * 바인드컨텍스트를 가지고 있는 컨트롤에서 바인드컨텍스트를 이용해 값이 변경된 후에 발생하는 이벤트.
 */
function onASR_fiUserFile1ContextValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.FileInput
	 */
	var aSR_fiUserFile1 = e.control;
	alert("개발중 입니다.");
}


/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onASR_fiUserFile2ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.FileInput
	 */
	var aSR_fiUserFile2 = e.control;
	alert("개발중 입니다.");
}
