/************************************************
 * MPPaymentManagement.js
 * Created at 2022. 4. 12. 오전 11:01:16.
 *
 * @author zxc
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	var dsInfo = app.lookup("BPARKInfoList");
	var dsVal = app.lookup("BPARKValList");
	var dmOptionPayment = app.lookup("BPARKOptionPayment");
	var dmPayInfo = app.lookup("BPARKPayInfo");
	
	dataManager.getInfoListBPARK().copyToDataSet(dsInfo);
	dataManager.getValListBPARK().copyToDataSet(dsVal);
	dataManager.getOptionPaymentBPARK().copyToDataMap(dmOptionPayment);

	dsInfo.commit();
	dsVal.commit();
	
	convertInfoData();
	
	dmPayInfo.setValue("ThirdTimeHoursTypeA", 24);
	dmPayInfo.setValue("ThirdTimeMinutesTypeA", 0);
	
	
	var settingTypeId = dmOptionPayment.getValue("TypeID");
	if (settingTypeId == 1) {
		app.lookup("BPARKPM_cbxApplayTypeA").checked = true;
		app.lookup("BPARKPM_cbxApplayTypeB").checked = false;
	} else if (settingTypeId == 2) {
		app.lookup("BPARKPM_cbxApplayTypeB").checked = true;
		app.lookup("BPARKPM_cbxApplayTypeA").checked = false;
	}
	
	app.lookup("BPARKPM_grpAll").redraw();
}

/*
 * # BPARKInfoList
 * 
 *   IndexKey		|	BasicTime		| 	BasicPrice
 * 	1 : Type A		|	기본 시간(분)		|	기본 금액
 *  2 : Type B		|	기본 시간(분)		|	기본 금액
 *  3 : Type C		|					|	정기권 금액
 *  4 : Type D		|					|	일과금
 * 
 * # BPARKValList
 * 
 *  IndexKey		|	SubType			|	Param1			|	Param2				|	Price
 * 	1 : TypeA		|	1 : 첫번째 시간		|	시작시간			|	종료시간				|	첫번째 시간 차등 부과 가격 
 *  1 : TypeA		|	2 : 두번째 시간		|	시작시간			|	종료시간				|	두번째 시간 차등 부과 가격
 * 	1 : TypeA		|	3 : 세번째 시간		|	시작시간			| 	종료시간				|	세번째 시간 차등 부과 가격
 * 	1 : TypeA		|	4 : 오전 추과 과금	|					|						|	오전 추과 과금 가격
 *  1 : TypeA		|	5 : 오후 추과 과금	|					|						|	오후 추과 과금 가격
 * 	2 : TypeB		|	1 : 추가 요금 설정	|	추가요금 시간 설정	|	요금상한금액			|	추가요금 시간 당 과금 가격
 */

// DB data -> 결제 정보로 변환
function convertInfoData() {
	
	var dsInfoList = app.lookup("BPARKInfoList");
	var dsValList = app.lookup("BPARKValList");
	var dmPayInfo = app.lookup("BPARKPayInfo");
	dmPayInfo.clear();
	for (var i=0; i < dsInfoList.getRowCount(); i++) {
		var typeInfo = dsInfoList.getRow(i);
		var indexKey = typeInfo.getValue("IndexKey");
		
		if (indexKey == "1") {	// type A
			
			var dsInfo = dsInfoList.getRow(i);
			var basicTime = minutesToHm(dsInfo.getValue("BasicTime"));
//			console.log("basicTime"+basicTime);
			dmPayInfo.setValue("BasicTimeHoursTypeA", basicTime.split(":")[0]);
			dmPayInfo.setValue("BasicTimeMinutesTypeA", basicTime.split(":")[1]);
			dmPayInfo.setValue("BasicPriceTypeA", dsInfo.getValue("BasicPrice"));
			
			dsValList.findAllRow("IndexKey == "+ indexKey).forEach(function(row){
//				console.log(row.getRowData());
				var subType = row.getValue("SubType");
				if (subType == 4) {		// AM
					dmPayInfo.setValue("AddPriceAMTypeA", row.getValue("Price"));	// 오전 가격
				} else if (subType == 5) {	// PM
					dmPayInfo.setValue("AddPricePMTypeA", row.getValue("Price"));	// 오후 가격
				} else if (subType == 1) {	// firstTime
					var firstTime = minutesToHm(row.getValue("Param2"));
//					console.log(row.getValue("Param2"));
					dmPayInfo.setValue("FirstTimeHoursTypeA", firstTime.split(":")[0]);		// 첫번째 시간 시
					dmPayInfo.setValue("FirstTimeMinutesTypeA", firstTime.split(":")[1]);	// 첫번쨰 시간 분
					dmPayInfo.setValue("FirstTimePriceTypeA", row.getValue("Price"));		// 첫번쨰 시간 가격
				} else if (subType == 2) {
					var secondTime = minutesToHm(row.getValue("Param2"));
					
					dmPayInfo.setValue("SecondTimeHoursTypeA", secondTime.split(":")[0]);		// 두번째 시간 시
					dmPayInfo.setValue("SecondTimeMinutesTypeA", secondTime.split(":")[1]);	// 두번째 시간 분
					dmPayInfo.setValue("SecondTimePriceTypeA", row.getValue("Price"));		// 두번째 시간 가격
				} else if (subType == 3) {
					var thirdTime = minutesToHm(row.getValue("Param2"));
					
					dmPayInfo.setValue("ThirdTimeHoursTypeA", thirdTime.split(":")[0]);		// 세번째 시간 시
					dmPayInfo.setValue("ThirdTimeMinutesTypeA", thirdTime.split(":")[1]);	// 세번째 시간 분
					dmPayInfo.setValue("ThirdTimePriceTypeA", row.getValue("Price"));		// 세번째 시간 가격
				} else {
					// 파라미터 에러
					dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString("Str_InvalidParamater"));
					dmPayInfo.clear();
					return;
				}
			});
			
		} else if (indexKey == "2") {	// type B
		
			var dsInfo = dsInfoList.getRow(i);
			var basicTime = minutesToHm(dsInfo.getValue("BasicTime"));
			
			dmPayInfo.setValue("BasicTimeHoursTypeB", basicTime.split(":")[0]);
			dmPayInfo.setValue("BasicTimeMinutesTypeB", basicTime.split(":")[1]);
			dmPayInfo.setValue("BasicPriceTypeB", dsInfo.getValue("BasicPrice"));
		
			dsValList.findAllRow("IndexKey == "+ indexKey).forEach(function(row){
//				console.log(row.getRowData());
				var subType = row.getValue("SubType");
				if (subType == 1) {
					var addTime = minutesToHm(row.getValue("Param1"));
					
					dmPayInfo.setValue("AddPriceHoursTypeB", addTime.split(":")[0]);		//  추가 시간 시
					dmPayInfo.setValue("AddPriceMinutesTypeB", addTime.split(":")[1]);		// 추가 시간 분
					dmPayInfo.setValue("AddPriceTypeB", row.getValue("Price"));				// 추가 시간 가격
					dmPayInfo.setValue("LimmitPriceTypeB", row.getValue("Param2"));			// 상한금액
					
				} else {
					// 파라미터 에러
					dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString("Str_InvalidParamater"));
					dmPayInfo.clear();
					return;
				}
			});
		
			
		} else if (indexKey == "3") {	// type C
			var dsInfo = dsInfoList.getRow(i);
			dmPayInfo.setValue("BasicPriceTypeC", dsInfo.getValue("BasicPrice"));
			
		} else if (indexKey == "4") {	// type D
			var dsInfo = dsInfoList.getRow(i);
			dmPayInfo.setValue("BasicPriceTypeD", dsInfo.getValue("BasicPrice"));
			
		} else {
			// 파라미터 에러
			dialogAlert(app, dataManager.getString("Str_Error"), dataManager.getString("Str_InvalidParamater"));
			dmPayInfo.clear();
			return;
		}
		
	}
	
}

// 결제 정보 -> DB data 변환
function convertSendData() {
	
	var dsInfoList = app.lookup("BPARKInfoList");
	var dsValList = app.lookup("BPARKValList");
	var dmPayInfo = app.lookup("BPARKPayInfo");

	var msg = ""

	// 시분초 변환

	// Type A
	var basicTimeTypeA = hmToMinutes(dmPayInfo.getValue("BasicTimeHoursTypeA") +":"+ dmPayInfo.getValue("BasicTimeMinutesTypeA"));	// "HH:MM"
	if (basicTimeTypeA == "0") {
		msg = dataManager.getString("Str_BPARK_ErrorTimeCheck");
		return msg;
	}
	
	var basicPriceTypeA = parseInt(dmPayInfo.getValue("BasicPriceTypeA"), 10);
	if (isNaN(basicPriceTypeA) || basicPriceTypeA.toString().length == 0) {
		msg = dataManager.getString("Str_InvalidParamater");
		return msg;
	} else {
		if (basicPriceTypeA == 0) {	// 기본 요금 0원 설정 불가
			msg = dataManager.getString("Str_BPARK_ErrorBasicSettingCheck");
			return msg;
		}
	}

	
	var addPriceAMTypeA = parseInt(dmPayInfo.getValue("AddPriceAMTypeA"), 10);
	if (isNaN(addPriceAMTypeA) || addPriceAMTypeA.toString().length == 0) {
		msg = dataManager.getString("Str_InvalidParamater");
		return msg;
	}
	
	var addPricePMTypeA = parseInt(dmPayInfo.getValue("AddPricePMTypeA"), 10);
	if (isNaN(addPricePMTypeA) || addPricePMTypeA.toString().length == 0) {
		msg = dataManager.getString("Str_InvalidParamater");
		return msg;
	}
	
//	console.log("addPriceAMTypeA : "+addPriceAMTypeA);
//	console.log("addPricePMTypeA : "+addPricePMTypeA);
	
	var firstTimeTypeA = hmToMinutes(dmPayInfo.getValue("FirstTimeHoursTypeA")+":"+dmPayInfo.getValue("FirstTimeMinutesTypeA"));
	if (firstTimeTypeA == "0") {
		msg = dataManager.getString("Str_BPARK_ErrorTimeCheck");
		return msg;
	}
	var firstTimePriceTypeA = parseInt(dmPayInfo.getValue("FirstTimePriceTypeA"), 10);
	if (isNaN(firstTimePriceTypeA) || firstTimePriceTypeA.toString().length == 0) {
		msg = dataManager.getString("Str_InvalidParamater");
		return msg;
	}
	
	var secondTimeTypeA = hmToMinutes(dmPayInfo.getValue("SecondTimeHoursTypeA")+":"+dmPayInfo.getValue("SecondTimeMinutesTypeA"));
	if (secondTimeTypeA == "0") {
		msg = dataManager.getString("Str_BPARK_ErrorTimeCheck");
		return msg;
	}
	var secondTimePriceTypeA = parseInt(dmPayInfo.getValue("SecondTimePriceTypeA"), 10);
	if (isNaN(secondTimePriceTypeA) || secondTimePriceTypeA.toString().length == 0) {
		msg = dataManager.getString("Str_InvalidParamater");
		return msg;
	}
	
	var thirdTimeTypeA = hmToMinutes(dmPayInfo.getValue("ThirdTimeHoursTypeA")+":"+dmPayInfo.getValue("ThirdTimeMinutesTypeA"));
	if (thirdTimeTypeA == "0") {
		msg = dataManager.getString("Str_BPARK_ErrorTimeCheck");
		return msg;
	}
	var thirdTimePriceTypeA = parseInt(dmPayInfo.getValue("ThirdTimePriceTypeA"), 10);
	if (isNaN(thirdTimePriceTypeA) || thirdTimePriceTypeA.toString().length == 0) {
		msg = dataManager.getString("Str_InvalidParamater");
		return msg;
	}
	
	var InfoTypeA = dsInfoList.findFirstRow("IndexKey == 1");
	InfoTypeA.setValue("BasicTime", basicTimeTypeA);
	InfoTypeA.setValue("BasicPrice", basicPriceTypeA);

	var addPriceAMValTypeA = dsValList.findFirstRow("IndexKey == 1 && SubType == 4");
	addPriceAMValTypeA.setValue("Price", addPriceAMTypeA);
	
	var addPricePMValTypeA = dsValList.findFirstRow("IndexKey == 1 && SubType == 5");
	addPricePMValTypeA.setValue("Price", addPricePMTypeA);
	
	var firstTimeValTypeA = dsValList.findFirstRow("IndexKey == 1 && SubType == 1");
	firstTimeValTypeA.setValue("Param1", 0);
	firstTimeValTypeA.setValue("Param2", firstTimeTypeA);
	firstTimeValTypeA.setValue("Price", firstTimePriceTypeA);
	
	var secondTimeValTypeA = dsValList.findFirstRow("IndexKey == 1 && SubType == 2");
	secondTimeValTypeA.setValue("Param1", firstTimeTypeA + 1);
	secondTimeValTypeA.setValue("Param2", secondTimeTypeA);
	secondTimeValTypeA.setValue("Price", secondTimePriceTypeA);
	
	var thirdTimeValTypeA = dsValList.findFirstRow("IndexKey == 1 && SubType == 3");
	thirdTimeValTypeA.setValue("Param1", secondTimeTypeA + 1);
	thirdTimeValTypeA.setValue("Param2", thirdTimeTypeA);
	thirdTimeValTypeA.setValue("Price", thirdTimePriceTypeA);
	
	// 첫번째 시간 두번째 시간 세번째 시간 유효성 검사
	if (firstTimeTypeA >= secondTimeTypeA || firstTimeTypeA >= thirdTimeTypeA || secondTimeTypeA >= thirdTimeTypeA) {
		msg = dataManager.getString("Str_BPARK_ErrorFixedBillingTimeCheck");
		return msg;
	}
	
	// Type B
//	console.log("basicTimeTypeB : "+ dmPayInfo.getValue("BasicTimeHoursTypeB") +":"+ dmPayInfo.getValue("BasicTimeMinutesTypeB"));
	var basicTimeTypeB = hmToMinutes(dmPayInfo.getValue("BasicTimeHoursTypeB") +":"+ dmPayInfo.getValue("BasicTimeMinutesTypeB"));	// "HH:MM"
	if (basicTimeTypeB == "0") {
		msg = dataManager.getString("Str_BPARK_ErrorTimeCheck");
		return msg;
	}
	var basicPriceTypeB = parseInt(dmPayInfo.getValue("BasicPriceTypeB"), 10);
	if (isNaN(basicPriceTypeB) || basicPriceTypeB.toString().length == 0) {
		msg = dataManager.getString("Str_InvalidParamater");
		return msg;
	} else {
		if (basicPriceTypeB == 0) {		// 기본요금 0원 설정 불가
			msg = dataManager.getString("Str_BPARK_ErrorBasicSettingCheck");
			return msg;
		}
	}
//	console.log("addPriceTimeTypeB : "+ dmPayInfo.getValue("AddPriceHoursTypeB")+":"+dmPayInfo.getValue("AddPriceMinutesTypeB"));
	var addPriceTimeTypeB = hmToMinutes(dmPayInfo.getValue("AddPriceHoursTypeB")+":"+dmPayInfo.getValue("AddPriceMinutesTypeB"));	// param1
	// type B 추가요금 시간 0 허용
	
	var addPriceTypeB =  parseInt(dmPayInfo.getValue("AddPriceTypeB"), 10);		// price
	if (isNaN(addPriceTypeB) || addPriceTypeB.toString().length == 0) {
		msg = dataManager.getString("Str_InvalidParamater");
		return msg;
	}
	
	var limmitPriceTypeB = parseInt(dmPayInfo.getValue("LimmitPriceTypeB"), 10);	// param2
	if (isNaN(limmitPriceTypeB) || limmitPriceTypeB.toString().length == 0) {
		msg = dataManager.getString("Str_InvalidParamater");
		return msg;
	} else {
		if (!(limmitPriceTypeB >= basicPriceTypeB)) {				// 상한요금 >= 기본요금 아니라면
			msg = dataManager.getString("Str_BPARK_ErrorLimmitPriceCheck");
			return msg;
		}
	}
	
	var InfoTypeB = dsInfoList.findFirstRow("IndexKey == 2");
	InfoTypeB.setValue("BasicTime", basicTimeTypeB);
	InfoTypeB.setValue("BasicPrice", basicPriceTypeB);
	
	var valTypeB = dsValList.findFirstRow("IndexKey == 2 && SubType == 1");
	valTypeB.setValue("Param1", addPriceTimeTypeB);
	valTypeB.setValue("Param2", limmitPriceTypeB);
	valTypeB.setValue("Price", addPriceTypeB);
	
	// Type C	
	var basicPriceTypeC =  parseInt(dmPayInfo.getValue("BasicPriceTypeC"), 10);
	if (isNaN(basicPriceTypeC) || basicPriceTypeC.toString().length == 0) {
		msg = dataManager.getString("Str_InvalidParamater");
		return msg;
	} else {
		if (basicPriceTypeC == 0) {			// 정기권 0원 설정 불가
			msg = dataManager.getString("Str_BPARK_ErrorBasicSettingCheck");
		return msg;
		}
	}
	var InfoTypeB = dsInfoList.findFirstRow("IndexKey == 3");
	InfoTypeB.setValue("BasicPrice", basicPriceTypeC);
	
	// TypeD
	var basicPriceTypeD = parseInt(dmPayInfo.getValue("BasicPriceTypeD"), 10);
	if (isNaN(basicPriceTypeD) || basicPriceTypeD.toString().length == 0) {
		msg = dataManager.getString("Str_InvalidParamater");
		return msg;
	} else {
		if (basicPriceTypeD == 0) {			// 일과금 0원 설정 불가
			msg = dataManager.getString("Str_BPARK_ErrorBasicSettingCheck");
			return msg;
		}
	}
	
	var InfoTypeB = dsInfoList.findFirstRow("IndexKey == 4");
	InfoTypeB.setValue("BasicPrice", basicPriceTypeD);
	
	return msg;
}

function minutesToHm(d) {
    d = Number(d);
    var h = Math.floor(d / 60);
    var m = Math.floor(d % 60);
    
    var hDisplay = h > 0 ? (h < 10 ? "0"+ h + ":" : h + ":") : "00:";
	var mDisplay = m > 0 ? (m < 10 ? "0"+ m + ":" : m + ":") : "00:";
	var sDisplay = "00";

    return hDisplay + mDisplay + sDisplay; 
}

function hmToMinutes(d) {
	
	var h = d.split(":")[0];
	var m = d.split(":")[1];
	
	if (h == null || h.toString().length == 0) {
		h = 0;
	}
	
	if (m == null || m.toString().length == 0) {
		m = 0;
	}
	
	var hours = parseInt(h, 10) * 60;
	var minutes = parseInt(m, 10);
	
//	console.log("hours : " + hours);
//	console.log("minutes : " + minutes);
	
	return hours + minutes;
}


/*
 * 체크 박스에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBPARKPM_cbxApplayTypeAClick(/* cpr.events.CMouseEvent */ e){
	if (app.lookup("BPARKPM_cbxApplayTypeB").checked) {
		app.lookup("BPARKPM_cbxApplayTypeB").checked = false;
	} 
	
	app.lookup("BPARKOptionPayment").setValue("TypeID", 1);
}


/*
 * 체크 박스에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBPARK_cbxApplayTypeBClick(/* cpr.events.CMouseEvent */ e){
	if (app.lookup("BPARKPM_cbxApplayTypeA").checked) {
		app.lookup("BPARKPM_cbxApplayTypeA").checked = false;
	}
	app.lookup("BPARKOptionPayment").setValue("TypeID", 2);
}


/*
 * 버튼(BPARKPM_btnApply)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBPARKPM_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	
	var msg = "";
	
	if(vailPayTypeCheck() == false) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_BPARK_ErrorTypeCheck"));
		return;
	}
	msg = convertSendData();
//	console.log("msg : " + msg);
	if (msg) {
		dialogAlert(app, dataManager.getString("Str_Warning"), msg);
	} else {	// errorNone
		app.lookup("sms_putBPARKData").send();
	}
	
	
}

function onSms_putBPARKDataSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if( resultCode == COMERROR_NONE){
		
		var dsInfo = app.lookup("BPARKInfoList");
		var dsVal = app.lookup("BPARKValList");
		var dmOptionPayment = app.lookup("BPARKOptionPayment");
		
		dataManager.setInfoListBPARK(dsInfo);
		dataManager.setValListBPARK(dsVal);
		dataManager.setOptionPaymentBPARK(dmOptionPayment);
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
		app.lookup("BPARKPM_grpAll").redraw();
	}	
}


function onSms_putBPARKDataSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}


function onSms_putBPARKDataSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function vailPayTypeCheck() {

	var checkTypeA = app.lookup("BPARKPM_cbxApplayTypeA").checked;
	var checkTypeB = app.lookup("BPARKPM_cbxApplayTypeB").checked;
	
	if (checkTypeA == false && checkTypeB == false) {
		return false;
	}	
	return true;
}
