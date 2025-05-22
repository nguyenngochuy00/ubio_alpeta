/************************************************
 * AreaSelect.js
 * Created at 2019. 2. 26. 오전 9:16:29.
 *
 * @author osm8667
 ************************************************/

var code = null;
var dataManager = getDataManager();
var inputValidManager = createInputValidator(app);
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	//화면 구분 코드 전달받음
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns){
		/**
		 * @type Array
		 */
		code = app.getHostProperty("initValue");
		if( code =="an"){
			app.lookup("iptID").placeholder = "1000~9999";
		}
	}
	
	//20190827 정래훈 인풋에 값이 없으면 경고 표시를 주기위해 작성
	var iptID = app.lookup("iptID").value;
	if(!iptID){
		inputValidManager.validate(app.lookup("iptID"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}
	var iptName = app.lookup("iptName").value;
	if(!iptName){
		inputValidManager.validate(app.lookup("iptName"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}
	//console.log(app.getHost().getBindInfo("headerTitle"));
	var headerTitle = app.getHost().getBindInfo("headerTitle").keyPath
	if (headerTitle == "Str_AddMapDrawings"){
		app.lookup("iptName").maxLength = 77; // 도면 관리만 글자수 77자까지(한줄에 보이게 할 수 있는 한글 최대 글자 수..)
	} else {
		app.lookup("iptName").maxLength = 255; // 이름 최대 225자까지 입력 가능
	}
	//console.log(app.lookup("iptName").maxLength);
	
}


/*
 * "확인" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnConfirmClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnConfirm = e.control;
	var oIDInput = app.lookup("iptID");
	var oNameInput = app.lookup("iptName");
	var resultMSG = app.lookup('resultMSG');
	if (oIDInput.value == '' || oIDInput.value == null || oNameInput.value == '' || oNameInput.value == null) {
		resultMSG.value = "*" + dataManager.getString('Str_RequiredAlert');
		resultMSG.style.css("color", 'RED');
		return;
	}
	var dmAreas = app.lookup("AreaInfo");
	dmAreas.setValue("AreaID", app.lookup("iptID").value);
	dmAreas.setValue("Name", app.lookup("iptName").value);
	saveArea(code);
}


/*
 * "취소" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnCancelClick(/* cpr.events.CMouseEvent */ e){
	/**
	 * @type cpr.controls.Button
	 */
	var btnCancel = e.control;
	app.close();
}

function saveArea(/*String*/code){
	var smsSave = app.lookup("smsSave");
	var oIDInput = app.lookup("iptID");

	if(code.toLowerCase()=="an"){
		smsSave.action = "/v1/antiPassback/areas";
		smsSave.send();
	}else{
		var dmMapAreaInfo = app.lookup("MapAreaInfo");
		dmMapAreaInfo.setValue("MapCode", app.lookup("iptID").value);
		dmMapAreaInfo.setValue("Name", app.lookup("iptName").value);

		var sms_postMapArea = app.lookup("sms_postMapArea");
		sms_postMapArea.action = "/v1/map/areas";//위치형상화..
		sms_postMapArea.send();
	}
}

// 구역 추가 완료
function onSmsSaveSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var smsSave = e.control;
	var resultMap = app.lookup("Result");
	var resultCode = resultMap.getValue("ResultCode");
	var oIDInput = app.lookup("iptID");
	var oNameInput = app.lookup("iptName");
	var resultMSG = app.lookup('resultMSG');
	if(resultCode != 0){
		oIDInput.value = "";
		oIDInput.placeholder = "1000~9999";
		oIDInput.redraw();
		resultMSG.value = "*"+dataManager.getString(getErrorString(resultCode));
		resultMSG.style.css("color", 'RED');
		inputValidManager.validate(app.lookup("iptID"), "isNull", dataManager.getString("Str_RequiredAlert"));
	}else{
		var info = {};
		info.id = oIDInput.value;
		info.name = oNameInput.value;
		app.close(info);
	}
}

// 구역 추가 에러
function onSmsSaveSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

// 구역 추가 타임아웃
function onSmsSaveSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onIptIDValueChange(/* cpr.events.CValueChangeEvent */ e){
	/**
	 * @type cpr.controls.InputBox
	 */
	var iptID = e.control;
	if(iptID.style.getCSS("border-color")){//border-color red 해제
		iptID.style.css("border-color", "");
	}
}

/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onIptNameValueChange(/* cpr.events.CValueChangeEvent */ e){
	/**
	 * @type cpr.controls.InputBox
	 */
	var iptName = e.control;
	if(iptName.style.getCSS("border-color")){//border-color red 해제
		iptName.style.css("border-color", "");
	}
}

// 도면 추가 완료
function onSms_postMapAreaSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/**
	 * @type cpr.protocols.Submission
	 */
	var sms_postMapArea = e.control;
	var resultMap = app.lookup("Result");
	var resultCode = resultMap.getValue("ResultCode");
	var oIDInput = app.lookup("iptID");
	var oNameInput = app.lookup("iptName");
	if(resultCode != 0){
		oIDInput.value = "";
		oIDInput.placeholder = "Invalid value.";
		oIDInput.style.css("border-color", "red");
	}else{
		var info = {};
		info.id = oIDInput.value;
		info.name = oNameInput.value;
		app.close(info);
	}

}

//도면 추가 에러
function onSms_postMapAreaSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

//도면 추가 타임아웃
function onSms_postMapAreaSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT)
}




/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onIptIDKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var iptID = e.control;
	app.lookup("iptID").value = iptID.displayText;
	if(iptID.displayText != ""){
		inputValidManager.validate(app.lookup("iptID"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("iptID"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onIptNameKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var iptName = e.control;
	app.lookup("iptName").value = iptName.displayText;
	if(iptName.displayText != ""){
		inputValidManager.validate(app.lookup("iptName"), "isValid", "");
	}else{
		inputValidManager.validate(app.lookup("iptName"), "isNull", dataManager.getString("Str_RequiredAlert"));	
	}
}
