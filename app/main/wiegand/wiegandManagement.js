/************************************************
 * wiegandManagement.js
 * Created at 2019. 3. 13. 오후 4:25:00.
 *
 * @author osm8667
 ************************************************/
var inOutCode = null;
var comLib = createComUtil(app);
var dataManager = getDataManager();
var inputValidManager = createInputValidator(app);

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	//라디오버튼 셀렉션 이벤트
	var radWiegendHeader = app.lookup("radWiegendHeader");
	radWiegendHeader.selectItem(0, true);
	
	//20190827 정래훈 인풋에 값이 없으면 경고 표시를 주기위해 작성
	var ipbWiegandCode = app.lookup("ipbWiegandCode").value;
	if(!ipbWiegandCode){
		inputValidManager.validate(app.lookup("ipbWiegandCode"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}
}


/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onRadWiegendHeaderSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/**
	 * @type cpr.controls.RadioButton
	 */
	var radWiegendHeader = e.control;

	var selectValue = radWiegendHeader.value;
	//in out 코드 설정
	inOutCode = selectValue;
	var grdWiegend = app.lookup("grdWiegend");
	if(grdWiegend.getSelectedRow()){
		grdWiegend.clearSelection();
	}
	var udcBitField = setInfoLayout(selectValue);
	initLayouts();
	udcBitField.setCategoriesFilter(selectValue);//비트 필드 중간에 들어가는 카테고리 생성

	var getWiegand = new cpr.protocols.Submission("smsGetWiegand"+selectValue);
	getWiegand.action = "/v1/wiegand/" + selectValue;
	getWiegand.method = "GET";
	getWiegand.mediaType = "application/x-www-form-urlencoded";

	getWiegand.addResponseData(app.lookup("WiegandList"), false, "WiegandList");
	getWiegand.addResponseData(app.lookup("Result"), false, "Result");
	comLib.showLoadMask("", "Loading Wiegand-" + selectValue + " Data", "", 100);
	getWiegand.send();
	getWiegand.addEventListenerOnce("submit-done", function(){
		/**
		 * @type cpr.protocols.Submission
		 */
		var sms_getWiegand = e.control;
		var resultMap = app.lookup("Result");
		var resultCode = resultMap.getValue("ResultCode");
		if(resultCode!=0){
//			app.lookup("grdWiegend").insertRowData(0, true, {Code: 200, Name: "test"});
//			app.lookup("grdWiegend").insertRowData(1, true, {Code: 400, Name: "test2"});
		}
		comLib.hideLoadMask();
	});
}


function setInfoLayout(code){
	var container = app.lookup("grpWiegands");
	var udcBitField = app.lookup("udcBitField");
	if(udcBitField){
		udcBitField.dispose();
	}
	var userDefinedControl = null;
	if(code=="in"){
		userDefinedControl = new udc.wiegend.InInfoField("udcBitField");
		if(typeof onNbe1ValueChange == "function") {
			userDefinedControl.addEventListener("nbeValueChange", onNbe1ValueChange);
		}
	}else{
		userDefinedControl = new udc.wiegend.OutInfoField("udcBitField");
		if(typeof onNbe1ValueChange == "function") {
			userDefinedControl.addEventListener("nbeValueChange", onNbe1ValueChange);
		}
	}
	container.addChild(userDefinedControl, {
		"colIndex": 0,
		"rowIndex": 0
	});
	return userDefinedControl;
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrdWiegendSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/**
	 * @type cpr.controls.Grid
	 */
	var grdWiegend = e.control;

	initLayouts();

	var selectRow = grdWiegend.getSelectedRow();
	if(selectRow){
		var wiegandCode = selectRow.getValue("Code");
		var wiegandName = selectRow.getValue("Name");
		app.lookup("ipbWiegandCode").readOnly = true; // 초기화하면 사용가능함, 초기화 후 신규등록이 아니면 아이디 수정 불가
		app.lookup("ipbWiegandCode").value = wiegandCode?wiegandCode:0;
		app.lookup("ipbName").value = wiegandName?wiegandName:"";

		var udcBitField = app.lookup("udcBitField");
		var smsGetWiegandInfos = app.lookup("sms_getWiegandInfos");
		smsGetWiegandInfos.action = "/v1/wiegand/out/" + wiegandCode;
		if(inOutCode == "in"){
			smsGetWiegandInfos.action = "/v1/wiegand/in/" + wiegandCode;
		}
		smsGetWiegandInfos.send();
		smsGetWiegandInfos.addEventListenerOnce("submit-done", function(/* cpr.events.CSubmissionEvent */ e){
			var basicInfo = null;
			var parityCount = 0;
			if(inOutCode == "in"){
				basicInfo = app.lookup("InBasicInfo");

				parityCount = basicInfo.getValue("ParityCount");

				var tmp = {};
				tmp.ConvertFormat = app.lookup("ConvertFormat");
				tmp.Parity = app.lookup("Parity");

				udcBitField.setFieldData(tmp);
				udcBitField.setInBasicInfo(basicInfo);
			}else{
				basicInfo = app.lookup("OutBasicInfo");
				parityCount = basicInfo.getValue("ParityCount");

				udcBitField.setFieldData(basicInfo, app.lookup("Parity"));
			}
			udcBitField.setField(parityCount);//커스텀 사이즈 변경
		});

// 필드 초기화
	}
	
	
	
	//20190827 정래훈 인풋에 값이 없으면 경고 표시를 주기위해 작성
	var ipbWiegandCode = app.lookup("ipbWiegandCode").value;
	if(!ipbWiegandCode){
		inputValidManager.validate(app.lookup("ipbWiegandCode"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}else{
		inputValidManager.validate(app.lookup("ipbWiegandCode"), "isValid","");
		
	}
}


/*
 * 넘버 에디터에서 value-change 이벤트 발생 시 호출.
 * NumberEditor의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onNbe1ValueChange(/* cpr.events.CValueChangeEvent */ e){
	var udcBitField = app.lookup("udcBitField");
	udcBitField.setField(e.newValue);//커스텀 사이즈 변경
}


/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnWiegandSaveClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnWiegandSave = e.control;
	var udcBitField = app.lookup("udcBitField");

	var field = udcBitField.getFieldValues();
	var parity = udcBitField.getParityValues();

	var parityList = app.lookup("Parity");
	parityList.build(parity, false);

	var wiegandCode = app.lookup("ipbWiegandCode").value;
	var wiegandName = app.lookup("ipbName").value;
	
	var grdWiegend = app.lookup("grdWiegend");
	var saveWiegand = app.lookup("sms_saveWiegand");
	// 초기화
	saveWiegand.removeAllRequestData();
	saveWiegand.addRequestData(parityList, "Parity", cpr.protocols.PayloadType.all);
	//인/아웃에 따라 데이터를 udc로부터 받아와 request 데이터로 설정해준다.
	//cpr.protocols.PayloadType.all 은 상태에 관계없이 모든 데이터를 전달함, 빌드되는 로직이기때문에 무조건 insert 상태이며,
	//버튼의 속성으로 데이터 통신을 구분
	if(inOutCode=="in"){
		var convertFormat = app.lookup("ConvertFormat");
		convertFormat.build(field, false);

		var basicInfo = udcBitField.getInBasicInfo();
		/*if (wiegandCode.length <= 0) {
			return;
		} */
		basicInfo.Code = parseInt(wiegandCode);
		basicInfo.Name = wiegandName;

		if( basicInfo.Bits == 1 && basicInfo.ParityCount == 0) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorWiegandCustomSize"), "");
			return
		}

		basicInfo.Bits = basicInfo.Bits==1?basicInfo.ParityCount:basicInfo.Bits;

		//빌드
		var inBasicInfo = app.lookup("InBasicInfo");
		inBasicInfo.build(basicInfo);
		saveWiegand.addRequestData(inBasicInfo, "InBasicInfo", cpr.protocols.PayloadType.all);
		saveWiegand.addRequestData(convertFormat, "ConvertFormat", cpr.protocols.PayloadType.all);
	}else{
		//그대로 보내면됨
		var basicInfo = field;
		basicInfo.Code = parseInt(wiegandCode);
		basicInfo.Name = wiegandName;

//		if( basicInfo.Bits == 1 && basicInfo.ParityCount == 0) {
//			dialogAlert(app, dataManager.getString("Str_Warning"), "Code" + dataManager.getString("Str_ErrorWiegandCustomSize"), "");
//			return
//		}
//		basicInfo.Bits = basicInfo.Bits==1?basicInfo.ParityCount:basicInfo.Bits;
		//빌드
		var outBasicInfo = app.lookup("OutBasicInfo");
		outBasicInfo.build(basicInfo);
		saveWiegand.addRequestData(outBasicInfo, "OutBasicInfo", cpr.protocols.PayloadType.all);
	}
	//위에서 설정한 데이터를 버튼의 성격에 따라 이벤트를 분기하여 서브미션한다.
	if(btnWiegandSave.userAttr("code")=="add"){//신규

		if(!wiegandCode){
			inputValidManager.validate(app.lookup("ipbWiegandCode"), "isNull", "Code" + dataManager.getString("Str_CommonRequiredAlert"));
//			dialogAlert(app, "", "Code" + dataManager.getString("Str_CommonRequiredAlert"), "");
			return;
		}
		saveWiegand.action = "/v1/wiegand/" + inOutCode;
		saveWiegand.method = "POST";
		saveWiegand.send();
		saveWiegand.addEventListenerOnce("submit-done", function(/* cpr.events.CSubmissionEvent */ e){
			/**
			 * @type cpr.protocols.Submission
			 */
			var sms_saveWiegand = e.control;
			var resultMap = app.lookup("Result");
			var resultCode = resultMap.getValue("ResultCode");
			if(resultCode==0){
				initLayouts();
				var grdRowCount = grdWiegend.getRowCount();
				grdWiegend.insertRowData(grdRowCount==0?0:grdRowCount+1, true, basicInfo);
				grdWiegend.commitData();
				grdWiegend.clearSelection();
				dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_SaveNotify"), "");
			}else{
				if(resultCode == 167772161){
					app.lookup("ipbWiegandCode").value = "";
					dialogAlert(app, dataManager.getString("Str_Failed"), "Code" + dataManager.getString("Str_CommonValidAlert"), "");
				}else{
					dialogAlert(app, dataManager.getString("Str_Failed"), "Error occurred. ERROR_CODE: "+ resultCode+ " "+dataManager.getString(getErrorString(resultCode)), "");
				}
			}
		});
	}else{//수정
		if(!grdWiegend.getSelectedRow()){
			dialogAlert(app, "", dataManager.getString("Str_NoSelection"), "");
			return;
		}
		saveWiegand.action = "/v1/wiegand/" + inOutCode + "/" + grdWiegend.getSelectedRow().getValue("Code");
		saveWiegand.method = "PUT";
		saveWiegand.send();
		saveWiegand.addEventListenerOnce("submit-done", function(/* cpr.events.CSubmissionEvent */ e){
			/**
			 * @type cpr.protocols.Submission
			 */
			var sms_saveWiegand = e.control;
			var resultMap = app.lookup("Result");
			var resultCode = resultMap.getValue("ResultCode");
			if(resultCode==0){
				dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ModifyNotify"), "");
				var grdWiegend = app.lookup("grdWiegend");
				var selectRow = grdWiegend.getSelectedRow();
				if(selectRow){
					selectRow.setValue("Name", wiegandName);
				}
				grdWiegend.commitData();
				grdWiegend.clearSelection();
			}else{
				if(resultCode == 167772161){
					app.lookup("ipbWiegandCode").value = grdWiegend.getSelectedRow().getValue("Code");
					dialogAlert(app, dataManager.getString("Str_Failed"), "Code" + dataManager.getString("Str_CommonValidAlert"), "");
				}else{
					dialogAlert(app, dataManager.getString("Str_Failed"), "Error occurred. ERROR_CODE: "+ resultCode+" "+dataManager.getString(getErrorString(resultCode)), "");
				}
			}

		});
	}

}


/*
 * "신규" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnWiegandNewClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnWiegandNew = e.control;
	initLayouts();
	var grdWiegend = app.lookup("grdWiegend");
	grdWiegend.clearSelection();
}


function initLayouts(){
	//코드, 이름 초기화
	var ipbWiegandCode = app.lookup("ipbWiegandCode");
	var ipbName = app.lookup("ipbName");
	if(ipbWiegandCode.readOnly){
		ipbWiegandCode.readOnly = false;
	}
	ipbWiegandCode.value = "";
	ipbWiegandCode.tooltip = "";
	ipbName.value = "";
	inputValidManager.clearInput(ipbWiegandCode);
	//필드 초기화
	var udcBitField = app.lookup("udcBitField");
	udcBitField.resetField();
	udcBitField.resetInfo();
	udcBitField.resetDataSet();
	//20190828 정래훈 - 입력 값 초기화 후 경고 표시를 위해 작성
	inputValidManager.validate(app.lookup("ipbWiegandCode"), "isNull", dataManager.getString("Str_RequiredAlert"));	
}


/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnWiegandDelClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnWiegandDel = e.control;
	var grdWiegend = app.lookup("grdWiegend");
	var selectRow = grdWiegend.getSelectedRow();
	if(!selectRow){
		dialogAlert(app, "", dataManager.getString("Str_NoSelection"), "");
		return;
	}
	dialogConfirm(app, "", dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var smsDelete = app.lookup("sms_deleteWiegand");
				smsDelete.action = "/v1/wiegand/" + inOutCode + "/" + selectRow.getValue("Code");
				smsDelete.send();
			}else{
				return;
			}
		});
	});
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteWiegandSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteWiegand = e.control;
	var resultMap = app.lookup("Result");
	var resultCode = resultMap.getValue("ResultCode");
	if(resultCode!=0){
		dialogAlert(app, "", "Error occurred. ERROR_CODE: "+ resultCode+" "+dataManager.getString(getErrorString(resultCode)), "");
		return;
	}else{
		var grdWiegend = app.lookup("grdWiegend");
		grdWiegend.deleteRow(grdWiegend.getSelectedRowIndex());
		grdWiegend.commitData();
		initLayouts();
		grdWiegend.clearSelection();
		dialogAlert(app, "", dataManager.getString("Str_DeleteNotify"), "");
	}
}



/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onIpbWiegandCodeKeyup(/* cpr.events.CKeyboardEvent */ e){
	/**
	 * @type cpr.controls.InputBox
	 */
	var ipbWiegandCode = e.control;
	if(ipbWiegandCode.displayText != ""){
		inputValidManager.dynamicValidate(ipbWiegandCode, ipbWiegandCode.displayText, app.lookup("WiegandList"), "Code", dataManager.getString("Str_CommonValidAlert"));
	}else{
		inputValidManager.validate(app.lookup("ipbWiegandCode"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}

exports.smsPutWiegandtoTerminal = function(strInOutCode, terminals){
	//1. 단말기 리스트
	var dsTerminalList = app.lookup("terminals");
	dsTerminalList.clear();
	terminals.copyToDataSet(dsTerminalList);
	//<----------------------------------------------------------
	var udcBitField = app.lookup("udcBitField");
	var field = udcBitField.getFieldValues();
	var parity = udcBitField.getParityValues();
	
	console.log(parity);

	var parityList = app.lookup("Parity");
	parityList.build(parity, false);
	//<-----------------------------------------------------------
	var wiegandCode = app.lookup("ipbWiegandCode").value;
	var wiegandName = app.lookup("ipbName").value;
	//<-----------------------------------------------------------
	var sendWiegand = app.lookup("sms_putWiegandDownloadToTerminal");
	sendWiegand.removeAllRequestData();
	sendWiegand.addRequestData(parityList, "Parity", cpr.protocols.PayloadType.all);
	
	if (strInOutCode == "in") {
		var convertFormat = app.lookup("ConvertFormat");
		convertFormat.build(field, false);

		var basicInfo = udcBitField.getInBasicInfo();
		if (wiegandCode.length <= 0) {
			basicInfo.Code = 0;
		} else {
			basicInfo.Code = parseInt(wiegandCode);	
		}
		basicInfo.Name = wiegandName;
		basicInfo.Bits = basicInfo.Bits==1?basicInfo.ParityCount:basicInfo.Bits;

		//빌드
		var inBasicInfo = app.lookup("InBasicInfo");
		inBasicInfo.build(basicInfo);

		sendWiegand.addRequestData(inBasicInfo, "InBasicInfo", cpr.protocols.PayloadType.all);
		sendWiegand.addRequestData(convertFormat, "ConvertFormat", cpr.protocols.PayloadType.all);
	} else if (strInOutCode == "out") {
		//그대로 보내면됨
		var basicInfo = field;
		if (wiegandCode.length <= 0) {
			basicInfo.Code = 0;
		} else {
			basicInfo.Code = parseInt(wiegandCode);	
		}		
		
		basicInfo.Name = wiegandName;
		basicInfo.Bits = basicInfo.Bits==1?basicInfo.ParityCount:basicInfo.Bits;
		//빌드
		var outBasicInfo = app.lookup("OutBasicInfo");
		outBasicInfo.build(basicInfo);
		sendWiegand.addRequestData(outBasicInfo, "OutBasicInfo", cpr.protocols.PayloadType.all);
	}

	var grdWiegand = app.lookup("grdWiegend");
	var findWiegand = grdWiegand.findFirstRow("Code == " + wiegandCode);
	if(!findWiegand) {// 미등록 코드
		dialogAlert(app, "", dataManager.getString("Str_ErrorWiegandNotExistCode"), "");
		return;
	}

	sendWiegand.addRequestData(dsTerminalList, "terminals", cpr.protocols.PayloadType.all);
	sendWiegand.action = "/v1/wiegand/" + strInOutCode + "/download";
	sendWiegand.send();
}

exports.smsGetWiegandFromTerminal = function(strInOutCode, terminalID){
	var smsGetWiegandInfos = app.lookup("sms_getWiegandInfoFromTerminal");
	smsGetWiegandInfos.action = "/v1/wiegand/" + strInOutCode + "/" + terminalID + "/terminal";
	var udcBitField = app.lookup("udcBitField");
	comLib.showLoadMask("", "get Wiegand-" + strInOutCode + " Terminal :"+ terminalID, "", 100);
	smsGetWiegandInfos.send();
	smsGetWiegandInfos.addEventListenerOnce("submit-done", function(/* cpr.events.CSubmissionEvent */ e){
		comLib.hideLoadMask();
		
		var resultMap = app.lookup("Result");
		var resultCode = resultMap.getValue("ResultCode");
		if(resultCode==0){
			app.lookup("grdWiegend").clearSelection();
			initLayouts();
			var basicInfo = null;
			var parityCount = 0;
			if(inOutCode == "in"){
				basicInfo = app.lookup("InBasicInfo");
				parityCount = basicInfo.getValue("ParityCount");

				var tmp = {};
				tmp.ConvertFormat = app.lookup("ConvertFormat");
				tmp.Parity = app.lookup("Parity");

				udcBitField.setFieldData(tmp);//필드 데이터를 전달
				udcBitField.setInBasicInfo(basicInfo);
			}else{
				basicInfo = app.lookup("OutBasicInfo");
				parityCount = basicInfo.getValue("ParityCount");

				udcBitField.setFieldData(basicInfo, app.lookup("Parity"));
			}
			udcBitField.setField(parityCount);//커스텀 사이즈 변경
		} else {
			dialogAlert(app, "", "terminalID : " + terminalID + " " + dataManager.getString("Str_ErrorGetWiegandInfo") + " " + dataManager.getString(getErrorString(resultCode)), "");
		}
	});

}

function onSms_putWiegandDownloadToTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	app.lookup("sms_putWiegandDownloadToTerminal").removeAllRequestData();
	console.log(app.lookup("sms_putWiegandDownloadToTerminal").getRequestDataCount());
	if (resultCode == COMERROR_NONE) {
		if(inOutCode == "in"){
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_WiegandInToTerminalSucceed"));
		}else{
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_WiegandOutToTerminalSucceed"));
		}
	} else {
		if(inOutCode == "in"){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_WiegandInToTerminalFailed")+ " " + dataManager.getString(getErrorString(resultCode)));
		}else{
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_WiegandOutToTerminalFailed")+ " " + dataManager.getString(getErrorString(resultCode)));
		}
	}
}

function onSms_putWiegandDownloadToTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_putWiegandDownloadToTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}
