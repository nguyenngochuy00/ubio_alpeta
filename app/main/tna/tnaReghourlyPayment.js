/************************************************
 * tnaReghourlyPayment.js
 * Created at 2018. 10. 22. 오후 2:19:17.
 *
 * @author joymrk
 ************************************************/
var _SendMode;
var StrLib = cpr.core.Module.require("lib/StrLib");
var dataManager = cpr.core.Module.require("lib/DataManager");

function initWorkPayment() {
	var dmWorkPay = app.lookup("dmWorkPayment");
	dmWorkPay.clear();
	var initWorkPayment = app.lookup("initWorkPayment");
	initWorkPayment.copyToDataMap(dmWorkPay);
}

function RefreshData(code) {
	var dmWorkPay = app.lookup("dmWorkPayment");
	if (code == "" ) {	// init, failed to get data 
		//dmWorkPay.reset();
		initWorkPayment();
	} else { //TAPMR_grd - sel_change 
		if (code == undefined) {
			return;
		}
	}
	
	app.lookup("TAPMR_ipbCode").value = dmWorkPay.getValue("Code");
	app.lookup("TAPMR_ipbName").value = dmWorkPay.getValue("Name");
	app.lookup("TAPMR_rdbPayUnit").value = dmWorkPay.getValue("Unit");
	
	app.lookup("TAPMR_ipbMoney1").value = dmWorkPay.getValue("NormalTime");
	app.lookup("TAPMR_ipbMoney2").value = dmWorkPay.getValue("TimeBefore"); 
	app.lookup("TAPMR_ipbMoney3").value = dmWorkPay.getValue("Overtime1");
	app.lookup("TAPMR_ipbMoney4").value = dmWorkPay.getValue("Overtime2");
	app.lookup("TAPMR_ipbMoney5").value = dmWorkPay.getValue("OffDayHours");
	app.lookup("TAPMR_ipbMoney6").value = String(dmWorkPay.getValue("Overtime3"));
	
	app.lookup("TAPMR_grp").redraw();
}

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	_SendMode = 'Normal';
	dataManager = getDataManager();	
	var requestData = app.lookup("sms_getWorkPayments");
	console.log(requestData.action);
	requestData.send()
}
//-------------------------------------------------------------------------------------------------------------->> Sms_getWorkPayments
function onSms_getWorkPaymentsSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var sms_getWorkPayments = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		
	} else {
		//var strError = dataManager.getString("Str_TNAPaymentSetting") + ": " +dataManager.getString("Str_ErrorGetDataFail");	
		var strError = dataManager.getString("Str_TNAPaymentSetting") + ": " +dataManager.getString(getErrorString(resultCode));	
		dialogAlert(app, dataManager.getString("Str_Failed"), strError);
	}	
	RefreshData("");	
	app.lookup("TAPMR_grp").redraw();
}

function onSms_getWorkPaymentsSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getWorkPaymentsSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//--------------------------------------------------------------------------------------------------------------<< Sms_getWorkPayments
function onTAPMR_grdSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var tAPMR_grd = e.control;
	var selectedRow = tAPMR_grd.getSelectedRow();
	if (selectedRow) {
		var dmWorkPayment = app.lookup("dmWorkPayment");
		initWorkPayment();
		//dmWorkPayment.reset();
		var requestData = app.lookup("sms_getWorkPayment");
		requestData.action = '/v1/tna/payment/' + selectedRow.getValue("Code");
		//console.log(requestData.action);
		requestData.send();
	} else {
		app.lookup("dmWorkPayment").reset();
		RefreshData("");
	}
}

function onSms_getWorkPaymentSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getWorkPayment = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var resultWp = app.lookup("dmWorkPayment");
		//console.log(resultWp.getDatas());
		RefreshData(resultWp.getValue("Code"));
	} else {
		RefreshData("");
		//var strError = dataManager.getString("Str_TNAPaymentSetting") + ": " +dataManager.getString("Str_ErrorGetDataFail");	
		var strError = dataManager.getString("Str_TNAPaymentSetting") + ": " +dataManager.getString(getErrorString(resultCode));	
		dialogAlert(app, dataManager.getString("Str_Failed"), strError);
		console.log("fail get selected_Workpayment");
	}
}

function onSms_getWorkPaymentSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getWorkPaymentSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * "전 송" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTAPMR_btnSendClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tAPMR_btnSend = e.control;
	// 추가 변경 처리 
	var Code = app.lookup("TAPMR_ipbCode").value;
	if (Code == '' || Code == null || Code == undefined) { // 근무 형태 코드 입력상태 체크
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorTNAPayRegiCodeNull"));	
		return;
	}
	// 리스트에 코드가 존재 하는지 확인
	var WorkPaymentList = app.lookup("dsWorkPaymentTinyList"); 
	var getfindInfo = WorkPaymentList.findFirstRow("Code == '"+ Code+ "'"); // 등록된 코드 있는지 확인
	if(getfindInfo) { // Modify
		_SendMode = 'Modi';
		var bResult = SetSendData(_SendMode);	// bResult [code , txt], true 이면 정상, false 면 error
		console.log(bResult);
		if(bResult[0] == true) {
			//put /v1/tna/payment/
			var requestData =app.lookup("sms_putWorkPayment");
			requestData.action = '/v1/tna/payment/' +  bResult[1];
			console.log("put : " + requestData.action);
			requestData.send();
		} else {
			dialogAlert(app, dataManager.getString("Str_Fail"), bResult[1]);	
			return;
		}		
	} else { //Add
		_SendMode = 'Add';
		var bResult = SetSendData(_SendMode);	// bResult [code , txt], true 이면 정상, false 면 error
		console.log(bResult);
		if(bResult[0] == true) {
			//post
			var requestData =app.lookup("sms_postWorkPayment");
			requestData.action = '/v1/tna/payment/' +  bResult[1];
			console.log("post :"+ requestData.action);
			requestData.send();
		} else {
			dialogAlert(app, dataManager.getString("Str_Fail"), bResult[1]);	
			return;
		}	
	}
}

function SetSendData(SendMode) {
	var dmWorkPayment = app.lookup("dmWorkPayment");
	var tmpCode="";
	if(_SendMode == 'Add') { //추가 인경우만 사용 
		tmpCode = app.lookup("TAPMR_ipbCode").value;
		if(tmpCode.length < 4){ 
			dmWorkPayment.setValue("Code", StrLib.lpad(tmpCode, 4, "0")); 
		} else {
			dmWorkPayment.setValue("Code", tmpCode);
		}
	}
	tmpCode = dmWorkPayment.getValue("Code");
	dmWorkPayment.setValue("Name", app.lookup("TAPMR_ipbName").value);	// 이름
	dmWorkPayment.setValue("Unit", app.lookup("TAPMR_rdbPayUnit").value);	//지급액 정산 단위
	var money;
	money = app.lookup("TAPMR_ipbMoney1").value;
	if(money < 0 || money == '' || money == undefined) {
		//return [false, '[근태 지급액 등록]-[기본근무] 값이 잘못 입력되었습니다.'];
		return [false, dataManager.getString("Str_ErrorTNAPayRegiBasicWorkWrongValue")];
	}
	dmWorkPayment.setValue("NormalTime", money);
	
	money = app.lookup("TAPMR_ipbMoney2").value;
	if(money < 0 || money == '' || money == undefined) {
		//return [false, '[근태 지급액 등록]-[조기근무] 값이 잘못 입력되었습니다.'];
		return [false, dataManager.getString("Str_ErrorTNAPayRegiEarlyWorkWrongValue")];
	}	
	dmWorkPayment.setValue("TimeBefore", money);	
	
	money = app.lookup("TAPMR_ipbMoney3").value;
	if(money < 0 || money == '' || money == undefined) {
		//return [false, '[근태 지급액 등록]-[연장근무] 값이 잘못 입력되었습니다.'];
		return [false, dataManager.getString("Str_ErrorTNAPayRegiExtensionWorkWrongValue")];
	}
	dmWorkPayment.setValue("Overtime1", money);	
	
	money = app.lookup("TAPMR_ipbMoney4").value;
	if(money < 0 || money == '' || money == undefined) {
		//return [false, '[근태 지급액 등록]-[야간근무] 값이 잘못 입력되었습니다.'];
		return [false, dataManager.getString("Str_ErrorTNAPayRegiNightWorkWrongValue")];
	}
	dmWorkPayment.setValue("Overtime2", money);	
	
	money = app.lookup("TAPMR_ipbMoney5").value;
	if(money < 0 || money == '' || money == undefined) {
		//return [false, '[근태 지급액 등록]-[휴일근무] 값이 잘못 입력되었습니다.'];
		return [false, dataManager.getString("Str_ErrorTNAPayRegiHolidayWorkWrongValue")];
	}
	dmWorkPayment.setValue("OffDayHours", money);	
	
	money = app.lookup("TAPMR_ipbMoney6").value;
	if(money < 0 || money == '' || money == undefined) {
		//return [false, '[근태 지급액 등록]-[초과근무] 값이 잘못 입력되었습니다.'];
		return [false, dataManager.getString("Str_ErrorTNAPayRegiOvertimeWorkWrongValue")];
	}
	dmWorkPayment.setValue("Overtime3",money);	
	
	return [true, tmpCode];
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postWorkPaymentSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var sms_postWorkPayment = e.control;
	_SendMode = 'Normal';
	var bResult = app.lookup("Result").getValue("ResultCode");
	var dmWp = app.lookup("dmWorkPayment");
	if (bResult == 0) {
		console.log("Code : "+ dmWp.getValue("Code") + " Name : " + dmWp.getValue("Name"));
		var dsWorkPaymentTinyList = app.lookup("dsWorkPaymentTinyList");
		dsWorkPaymentTinyList.addRowData({"Code": dmWp.getValue("Code"),"Name": dmWp.getValue("Name")});	
		dsWorkPaymentTinyList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);	
	} else {
		console.log("fail Add selected_Workpayment");
		dmWp.reset();
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString(getErrorString(bResult)));	
	}
	var grd = app.lookup("TAPMR_grd"); 
	grd.clearSelection();
	grd.redraw();
}

	
	

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putWorkPaymentSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_putWorkPayment = e.control;
	_SendMode = 'Normal';
	var bResult = app.lookup("Result").getValue("ResultCode");
	var dmWp = app.lookup("dmWorkPayment");
	if (bResult == 0) {
		var dsWorkPaymentList = app.lookup("dsWorkPaymentTinyList");
		var getfindInfo = dsWorkPaymentList.findFirstRow("Code == '"+ dmWp.getValue("Code") + "'");
		getfindInfo.setRowData({"Code": dmWp.getValue("Code"), "Name":dmWp.getValue("Name")});	
		dsWorkPaymentList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	} else {
		console.log("fail Update WorkPayment info!! : ");
	}
	
	dmWp.reset();
	var grd = app.lookup("TAPMR_grd");
	grd.clearSelection();
	grd.redraw();
}
	
	

/*
 * "삭 제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTAPMR_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tAPMR_btnDelete = e.control;
	var Code = app.lookup("TAPMR_ipbCode").value;
	
	if (Code == '' || Code == null || Code == undefined) { // 근무 형태 코드 입력상태 체크
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorTNAPayRegiCodeNull"));	
		return;
	}	
	
	var selectedRow = app.lookup("TAPMR_grd").getSelectedRow();
	if (selectedRow == null) { // 근무 형태 코드 선택상태 체크
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelection"));	
		return;
	}
	
	var dsWpTinyList = app.lookup("dsWorkPaymentTinyList"); 
	var getfindInfo = dsWpTinyList.findFirstRow("Code == '"+ Code+ "'"); // 등록된 코드 있는지 확인
	if(getfindInfo) {
		dsWpTinyList.deleteRow(getfindInfo.getIndex());
		
		var requestData = app.lookup("sms_deleteWorkPayment");
		requestData.action = '/v1/tna/payment/' + Code;
		console.log(requestData.action);
		console.log(requestData.method);
		requestData.send();
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorTNACodeUnregiCode"));	
		return;
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteWorkPaymentSubmitDone(/* cpr.events.CSubmissionEvent */ e){

	var sms_deleteWorkPayment = e.control;
	_SendMode = 'Normal';
	var dmWp = app.lookup("dmWorkPayment");
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if ( ResultCode == 0) {
		
	} else {
		var dsWorkPaymentTinyList = app.lookup("dsWorkPaymentTinyList");
		dsWorkPaymentTinyList.addRowData({"Code": dmWp.getValue("Code"),"Name": dmWp.getValue("Name")});	
		dsWorkPaymentTinyList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(ResultCode)));
	}
	
	dmWp.reset();
	RefreshData("");
}

	
		
		


/*
 * "종 료" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTAPMR_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tAPMR_btnClose = e.control;
	app.close();
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	console.log(menu_id);
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_HELP,	
			"ID": menu_id
		}
	});

	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
