/************************************************
 * tnaDetailInout.js
 * Created at 2018. 11. 28. 오후 7:16:23.
 *
 * @author joymrk
 ************************************************/
var util = cpr.core.Module.require("lib/util");
var errMessage = "입력 예 : 하루전[-22:40], 해당일[ 17:30], 다음날[+08:20]";
var dataManager = cpr.core.Module.require("lib/DataManager");
function RefreshData() {
	var dmWorkShiftInfo = app.lookup("dmWorkShiftInfo"); //
	app.lookup("TADTS_ipbWorkStartTime").value = dmWorkShiftInfo.getValue("WorkStartTime"); // 
	app.lookup("TADTS_ipbWorkEndTime").value = dmWorkShiftInfo.getValue("WorkEndTime");
	var multiRange = dmWorkShiftInfo.getValue("MultiRange");
	if (multiRange == 0) {
		
		ValueChange(app.lookup("TADTS_cbxRange1").id, -1);
		ValueChange(app.lookup("TADTS_cbxRange2").id, -1);
		ValueChange(app.lookup("TADTS_cbxRange3").id, -1);
		ValueChange(app.lookup("TADTS_cbxRange4").id, -1);
		
		var AutoInTime = dmWorkShiftInfo.getValue("AutoInTime");
		if (AutoInTime == -1) {
			app.lookup("TADTS_cbxAutoIn").value = AutoInTime;
			ValueChange(app.lookup("TADTS_cbxAutoIn").id,AutoInTime);
		} else {
			app.lookup("TADTS_cbxAutoIn").value = 1;
			ValueChange(app.lookup("TADTS_cbxAutoIn").id,1);
			app.lookup("TADTS_ipbAutoInTime").value = util.ConvDHHMMfromMinute(AutoInTime);
		}
		
		var AutoOutTime = dmWorkShiftInfo.getValue("AutoOutTime");
		if (AutoOutTime == -1) {
			app.lookup("TADTS_cbxAutoOut").value = AutoOutTime;
			ValueChange(app.lookup("TADTS_cbxAutoOut").id,AutoOutTime);
		} else {
			app.lookup("TADTS_cbxAutoOut").value = 1;
			ValueChange(app.lookup("TADTS_cbxAutoOut").id,1);
			app.lookup("TADTS_ipbAutoOutTime").value = util.ConvDHHMMfromMinute(AutoOutTime);
		}
		
	} else {	// 다중구간.
		
		app.lookup("TADTS_cbxRange1").enabled = true;
		app.lookup("TADTS_cbxRange2").enabled = true;
		app.lookup("TADTS_cbxRange3").enabled = true;
		app.lookup("TADTS_cbxRange4").enabled = true;
		
		var sTime = dmWorkShiftInfo.getValue("Range1StartTime");
		var eTime = dmWorkShiftInfo.getValue("Range1EndTime");
		
		if (sTime == -1 || eTime == -1) {
			app.lookup("TADTS_cbxRange1").value = -1;
			ValueChange(app.lookup("TADTS_cbxRange1").id,-1);
		} else {
			app.lookup("TADTS_cbxRange1").value = 1;
			ValueChange(app.lookup("TADTS_cbxRange1").id,1);
			app.lookup("TADTS_cbxRange1StartTm").value =  util.ConvDHHMMfromMinute(sTime);
			app.lookup("TADTS_cbxRange1EndTm").value =  util.ConvDHHMMfromMinute(eTime);
		}
		sTime = dmWorkShiftInfo.getValue("Range2StartTime");
		eTime = dmWorkShiftInfo.getValue("Range2EndTime");
		
		if (sTime == -1 || eTime == -1) {
			app.lookup("TADTS_cbxRange2").value = -1;
			ValueChange(app.lookup("TADTS_cbxRange2").id,-1);
		} else {
			app.lookup("TADTS_cbxRange2").value = 1;
			ValueChange(app.lookup("TADTS_cbxRange2").id,1);
			app.lookup("TADTS_cbxRange2StartTm").value =  util.ConvDHHMMfromMinute(sTime);
			app.lookup("TADTS_cbxRange2EndTm").value =  util.ConvDHHMMfromMinute(eTime);
		}
		sTime =dmWorkShiftInfo.getValue("Range3StartTime");
		eTime =dmWorkShiftInfo.getValue("Range3EndTime");
		
		if (sTime == -1 || eTime == -1) {
			app.lookup("TADTS_cbxRange3").value = -1;
			ValueChange(app.lookup("TADTS_cbxRange3").id,-1);
		} else {
			app.lookup("TADTS_cbxRange3").value = 1;
			ValueChange(app.lookup("TADTS_cbxRange3").id,1);
			app.lookup("TADTS_cbxRange3StartTm").value =  util.ConvDHHMMfromMinute(sTime);
			app.lookup("TADTS_cbxRange3EndTm").value =  util.ConvDHHMMfromMinute(eTime);
		}
		sTime =dmWorkShiftInfo.getValue("Range4StartTime");
		eTime =dmWorkShiftInfo.getValue("Range4EndTime");
		
		if (sTime == -1 || eTime == -1) {
			app.lookup("TADTS_cbxRange4").value = -1;
			ValueChange(app.lookup("TADTS_cbxRange4").id,-1);
		} else {
			app.lookup("TADTS_cbxRange4").value = 1;
			ValueChange(app.lookup("TADTS_cbxRange4").id,1);
			app.lookup("TADTS_cbxRange4StartTm").value =  util.ConvDHHMMfromMinute(sTime);
			app.lookup("TADTS_cbxRange4EndTm").value =  util.ConvDHHMMfromMinute(eTime);
		}
		
		// 자동 기록 생성 ==> 미사용
		ValueChange(app.lookup("TADTS_cbxAutoIn").id,-1);
		ValueChange(app.lookup("TADTS_cbxAutoOut").id,-1);
	}
	
	// 고정 제외시간 셋팅
	var sExcept = dmWorkShiftInfo.getValue("Except1StartTime");
	
	var eExcept = dmWorkShiftInfo.getValue("Except1EndTime");
	if (sExcept == -1 || eExcept == -1 ) {
		app.lookup("TADTS_cbxExcept1").value = -1;
		ValueChange(app.lookup("TADTS_cbxExcept1").id,-1);
	} else {
		app.lookup("TADTS_cbxExcept1").value = 1;
		ValueChange(app.lookup("TADTS_cbxExcept1").id,1);
		app.lookup("TADTS_cbxExcept1StartTm").value =  util.ConvDHHMMfromMinute(sExcept);
		app.lookup("TADTS_cbxExcept1EndTm").value =  util.ConvDHHMMfromMinute(eExcept);
	}
	sExcept = dmWorkShiftInfo.getValue("Except2StartTime");
	eExcept = dmWorkShiftInfo.getValue("Except2EndTime");
	if (sExcept == -1 || eExcept == -1 ) {
		app.lookup("TADTS_cbxExcept2").value = -1;
		ValueChange(app.lookup("TADTS_cbxExcept2").id,-1);
	} else {
		app.lookup("TADTS_cbxExcept2").value = 1;
		ValueChange(app.lookup("TADTS_cbxExcept2").id,1);
		app.lookup("TADTS_cbxExcept2StartTm").value =  util.ConvDHHMMfromMinute(sExcept);
		app.lookup("TADTS_cbxExcept2EndTm").value =  util.ConvDHHMMfromMinute(eExcept);
	}
	sExcept = dmWorkShiftInfo.getValue("Except3StartTime");
	eExcept = dmWorkShiftInfo.getValue("Except3EndTime");
	if (sExcept == -1 || eExcept == -1 ) {
		app.lookup("TADTS_cbxExcept3").value = -1;
		ValueChange(app.lookup("TADTS_cbxExcept3").id,-1);
	} else {
		app.lookup("TADTS_cbxExcept3").value = 1;
		ValueChange(app.lookup("TADTS_cbxExcept3").id,1);
		app.lookup("TADTS_cbxExcept3StartTm").value =  util.ConvDHHMMfromMinute(sExcept);
		app.lookup("TADTS_cbxExcept3EndTm").value =  util.ConvDHHMMfromMinute(eExcept);
	}
	sExcept = dmWorkShiftInfo.getValue("Except4StartTime");
	eExcept = dmWorkShiftInfo.getValue("Except4EndTime");
	if (sExcept == -1 || eExcept == -1 ) {
		app.lookup("TADTS_cbxExcept4").value = -1;
		ValueChange(app.lookup("TADTS_cbxExcept4").id,-1);
	} else {
		app.lookup("TADTS_cbxExcept4").value = 1;
		ValueChange(app.lookup("TADTS_cbxExcept4").id,1);
		app.lookup("TADTS_cbxExcept4StartTm").value =  util.ConvDHHMMfromMinute(sExcept);
		app.lookup("TADTS_cbxExcept4EndTm").value =  util.ConvDHHMMfromMinute(eExcept);
	}
	sExcept = dmWorkShiftInfo.getValue("Except5StartTime");
	eExcept = dmWorkShiftInfo.getValue("Except5EndTime");
	if (sExcept == -1 || eExcept == -1 ) {
		app.lookup("TADTS_cbxExcept5").value = -1;
		ValueChange(app.lookup("TADTS_cbxExcept5").id,-1);
	} else {
		app.lookup("TADTS_cbxExcept4").value = 1;
		ValueChange(app.lookup("TADTS_cbxExcept5").id,1);
		app.lookup("TADTS_cbxExcept5StartTm").value =  util.ConvDHHMMfromMinute(sExcept);
		app.lookup("TADTS_cbxExcept5EndTm").value =  util.ConvDHHMMfromMinute(eExcept);
	}
	
	// 기록 제외시간 셋팅
	var exceptEx =  dmWorkShiftInfo.getValue("ExceptExit");
	if( exceptEx == 0 ) {
		app.lookup("TADTS_cbxExceptExit").value = exceptEx;
		ValueChange(app.lookup("TADTS_cbxExceptExit").id,exceptEx);
	} else {
		app.lookup("TADTS_cbxExceptExit").value = exceptEx;
		ValueChange(app.lookup("TADTS_cbxExceptExit").id,exceptEx);
		app.lookup("TADTS_cmbExceptRtnMode").value = dmWorkShiftInfo.getValue("ExceptReturnMode");
	}
	
	var exceptOut =  dmWorkShiftInfo.getValue("ExceptOut");
	if( exceptOut == 0 ){
		app.lookup("TADTS_cbxExceptOut").value = exceptOut;
		ValueChange(app.lookup("TADTS_cbxExceptOut").id,exceptOut);
	} else {
		app.lookup("TADTS_cbxExceptOut").value = exceptOut;
		ValueChange(app.lookup("TADTS_cbxExceptOut").id,exceptOut);
		app.lookup("TADTS_cmbExceptRtnMode").value = dmWorkShiftInfo.getValue("ExceptInMode");
	}
}

function ValueChange(id, value) {
	switch(id) {
	case 'TADTS_cbxAutoIn':
		if(value == 1) {
			app.lookup("TADTS_ipbAutoInTime").enabled = true;
		} else {
			app.lookup("TADTS_ipbAutoInTime").enabled = false;
			app.lookup("TADTS_ipbAutoInTime").value = "00:00";
		}
		break;
	case 'TADTS_cbxAutoOut':
		if(value == 1) {
			app.lookup("TADTS_ipbAutoOutTime").enabled = true;
		} else {
			app.lookup("TADTS_ipbAutoOutTime").enabled = false;
			app.lookup("TADTS_ipbAutoOutTime").value = "00:00";
		}
		break;
	case 'TADTS_cbxExceptExit':
		if(value == 1) {
			app.lookup("TADTS_cmbExceptRtnMode").enabled = true;
		} else {
			app.lookup("TADTS_cmbExceptRtnMode").enabled = false;
			app.lookup("TADTS_cmbExceptRtnMode").value = 0;
		}
		break;
	case 'TADTS_cbxExceptOut':
		if(value == 1) {
			app.lookup("TADTS_cmbExceptInMode").enabled = true;
		} else {
			app.lookup("TADTS_cmbExceptInMode").enabled = false;
			app.lookup("TADTS_cmbExceptInMode").value = 0;
		}
		break;
	case 'TADTS_cbxExcept1':
		if(value == 1) {
			app.lookup("TADTS_cbxExcept1StartTm").enabled = true;
			app.lookup("TADTS_cbxExcept1EndTm").enabled = true;
		} else {
			app.lookup("TADTS_cbxExcept1StartTm").enabled = false;
			app.lookup("TADTS_cbxExcept1EndTm").enabled = false;
			app.lookup("TADTS_cbxExcept1StartTm").value = "00:00";
			app.lookup("TADTS_cbxExcept1EndTm").value = "00:00";
		}
		break;
	case 'TADTS_cbxExcept2':
		if(value == 1) {
			app.lookup("TADTS_cbxExcept2StartTm").enabled = true;
			app.lookup("TADTS_cbxExcept2EndTm").enabled = true;
		} else {
			app.lookup("TADTS_cbxExcept2StartTm").enabled = false;
			app.lookup("TADTS_cbxExcept2EndTm").enabled = false;
			app.lookup("TADTS_cbxExcept2StartTm").value = "00:00";
			app.lookup("TADTS_cbxExcept2EndTm").value = "00:00";
		}
		break;
	case 'TADTS_cbxExcept3':
		if(value == 1) {
			app.lookup("TADTS_cbxExcept3StartTm").enabled = true;
			app.lookup("TADTS_cbxExcept3EndTm").enabled = true;
		} else {
			app.lookup("TADTS_cbxExcept3StartTm").enabled = false;
			app.lookup("TADTS_cbxExcept3EndTm").enabled = false;
			app.lookup("TADTS_cbxExcept3StartTm").value = "00:00";
			app.lookup("TADTS_cbxExcept3EndTm").value = "00:00";
		}
		break;
	case 'TADTS_cbxExcept4':
		if(value == 1) {
			app.lookup("TADTS_cbxExcept4StartTm").enabled = true;
			app.lookup("TADTS_cbxExcept4EndTm").enabled = true;
		} else {
			app.lookup("TADTS_cbxExcept4StartTm").enabled = false;
			app.lookup("TADTS_cbxExcept4EndTm").enabled = false;
			app.lookup("TADTS_cbxExcept4StartTm").value = "00:00";
			app.lookup("TADTS_cbxExcept4EndTm").value = "00:00";
		}
		break;
	case 'TADTS_cbxExcept5':
		if(value == 1) {
			app.lookup("TADTS_cbxExcept5StartTm").enabled = true;
			app.lookup("TADTS_cbxExcept5EndTm").enabled = true;
		} else {
			app.lookup("TADTS_cbxExcept5StartTm").enabled = false;
			app.lookup("TADTS_cbxExcept5EndTm").enabled = false;
			app.lookup("TADTS_cbxExcept5StartTm").value = "00:00";
			app.lookup("TADTS_cbxExcept5EndTm").value = "00:00";
		}
		break;
	case 'TADTS_cbxRange1':
		if(value == 1) {
			app.lookup("TADTS_cbxRange1StartTm").enabled = true;
			app.lookup("TADTS_cbxRange1EndTm").enabled = true;
		} else {
			app.lookup("TADTS_cbxRange1StartTm").enabled = false;
			app.lookup("TADTS_cbxRange1EndTm").enabled = false;
			app.lookup("TADTS_cbxRange1StartTm").value = "00:00";
			app.lookup("TADTS_cbxRange1EndTm").value = "00:00";
		}
		break;
	case 'TADTS_cbxRange2':
		if(value == 1) {
			app.lookup("TADTS_cbxRange2StartTm").enabled = true;
			app.lookup("TADTS_cbxRange2EndTm").enabled = true;
		} else {
			app.lookup("TADTS_cbxRange2StartTm").enabled = false;
			app.lookup("TADTS_cbxRange2EndTm").enabled = false;
			app.lookup("TADTS_cbxRange2StartTm").value = "00:00";
			app.lookup("TADTS_cbxRange2EndTm").value = "00:00";
		}
		break;
	case 'TADTS_cbxRange3':
		if(value == 1) {
			app.lookup("TADTS_cbxRange3StartTm").enabled = true;
			app.lookup("TADTS_cbxRange3EndTm").enabled = true;
		} else {
			app.lookup("TADTS_cbxRange3StartTm").enabled = false;
			app.lookup("TADTS_cbxRange3EndTm").enabled = false;
			app.lookup("TADTS_cbxRange3StartTm").value = "00:00";
			app.lookup("TADTS_cbxRange3EndTm").value = "00:00";
		}
		break;
	case 'TADTS_cbxRange4':
		if(value == 1) {
			app.lookup("TADTS_cbxRange4StartTm").enabled = true;
			app.lookup("TADTS_cbxRange4EndTm").enabled = true;
		} else {
			app.lookup("TADTS_cbxRange4StartTm").enabled = false;
			app.lookup("TADTS_cbxRange4EndTm").enabled = false;
			app.lookup("TADTS_cbxRange4StartTm").value = "00:00";
			app.lookup("TADTS_cbxRange4EndTm").value = "00:00";
		}
		break;
	default:
		break;
	}
}
function onTADTS_ValueChange(/* cpr.events.CValueChangeEvent */ e){
	var tASCR_value = e.control;
	ValueChange(tASCR_value.id, tASCR_value.value);
}

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();	
	var initValue = app.getHost().initValue;	
	var dmWorkShiftInfo = app.lookup("dmWorkShiftInfo");
	
	initValue["DetailWorkShift"].copyToDataMap(dmWorkShiftInfo);
	
	RefreshData();
	
	app.lookup("TADTS_tnaDetailInOutgrd").redraw();
	
}


/*
 * "취 소" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTADTS_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	var tASCR_btnCancel = e.control;
	app.close();
}


/*
 * "설 정" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTADTS_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tASCR_btnApply = e.control;
	var returnValue = app.lookup("dmWorkShiftInfo");
	var RangeStartTime = util.ConvDHHMMtoMinute(app.lookup("TADTS_ipbWorkStartTime").value); 
	if (RangeStartTime < 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), errMessage);	
		return;
	}
	var RangeEndTime = util.ConvDHHMMtoMinute(app.lookup("TADTS_ipbWorkEndTime").value); 
	if (RangeEndTime < 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), errMessage);	
		return;
	}
	console.log("One day WorkTime Range s-e :"+ RangeStartTime + " ~ "+ RangeEndTime);
	if (RangeStartTime >= RangeEndTime) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorStartTimeBeforeEndTime"));	
		return;
	}
	
	// 자동 출퇴근 처리
	var nAutoInTime;
	var nAutoOutTime;
	if (app.lookup("TADTS_cbxAutoIn").value == 1) {
		nAutoInTime = util.ConvDHHMMtoMinute(app.lookup("TADTS_ipbAutoInTime").value);
		if (nAutoInTime < 0) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorAutoCreateWorkCorrectTime")+" "+ errMessage );	
			return;
		}
		if ((nAutoInTime < RangeStartTime) || (nAutoInTime > RangeEndTime)) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorAutoCreateWorkOutRange"));	
			return;
		}
	} else {
		nAutoInTime = -1;
	}
	
	if (app.lookup("TADTS_cbxAutoOut").value == 1) {
		nAutoOutTime = util.ConvDHHMMtoMinute(app.lookup("TADTS_ipbAutoOutTime").value);
		if (nAutoOutTime < 0) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorAutoCreateWorkCorrectTime")+" "+ errMessage );	
			return;
		}
		if ((nAutoOutTime < RangeStartTime) || (nAutoOutTime > RangeEndTime)) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorAutoCreateWorkOutRange"));	
			return;
		}
	} else {
		nAutoOutTime = -1;
	}
	
	// 기록 제외 시간 처리
	if (app.lookup("TADTS_cbxExceptExit").value == 1) { returnValue.setValue("ExceptExit", 1);	}
	else { returnValue.setValue("ExceptExit", 0); }
	
	if (app.lookup("TADTS_cbxExceptOut").value == 1) { returnValue.setValue("ExceptOut", 1); }
	else { returnValue.setValue("ExceptOut", 0); }
	
	returnValue.setValue("WorkStartTime", RangeStartTime);
	returnValue.setValue("WorkEndTime", RangeEndTime);
	returnValue.setValue("AutoInTime", nAutoInTime);
	returnValue.setValue("AutoOutTime", nAutoOutTime);
	returnValue.setValue("ExceptReturnMode", app.lookup("TADTS_cmbExceptRtnMode").value);
	returnValue.setValue("ExceptInMode", app.lookup("TADTS_cmbExceptInMode").value);
	
	//---------------------------------------------------------------------------------------------------
	var ExceptsTm = -1; var ExcepteTm = -1;
	if (app.lookup("TADTS_cbxExcept1").value == 1) {
		ExceptsTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxExcept1StartTm").value);
		if (ExceptsTm < 0 ) { return; }
		ExcepteTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxExcept1EndTm").value);
		if (ExcepteTm < 0 ) { return; }
		if (ExceptsTm >= ExcepteTm) { return; }
		if (ExceptsTm < RangeStartTime) { return; }
		if (ExcepteTm > RangeEndTime) { return; }
		returnValue.setValue("Except1StartTime", ExceptsTm);
		returnValue.setValue("Except1EndTime", ExcepteTm);
	}
	else {
		returnValue.setValue("Except1StartTime", -1);
		returnValue.setValue("Except1EndTime", -1);
	}	
	
	if (app.lookup("TADTS_cbxExcept2").value == 1) {
		ExceptsTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxExcept2StartTm").value);
		if (ExceptsTm < 0 ) { return; }
		ExcepteTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxExcept2EndTm").value);
		if (ExcepteTm < 0 ) { return; }
		if (ExceptsTm >= ExcepteTm) { return; }
		if (ExceptsTm < RangeStartTime) { return; }
		if (ExcepteTm > RangeEndTime) { return; }
		returnValue.setValue("Except2StartTime", ExceptsTm);
		returnValue.setValue("Except2EndTime", ExcepteTm);
	}
	else {
		returnValue.setValue("Except2StartTime", -1);
		returnValue.setValue("Except2EndTime", -1);
	}	
	
	if (app.lookup("TADTS_cbxExcept3").value == 1) {
		ExceptsTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxExcept3StartTm").value);
		if (ExceptsTm < 0 ) { return; }
		ExcepteTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxExcept3EndTm").value);
		if (ExcepteTm < 0 ) { return; }
		if (ExceptsTm >= ExcepteTm) { return; }
		if (ExceptsTm < RangeStartTime) { return; }
		if (ExcepteTm > RangeEndTime) { return; }
		returnValue.setValue("Except3StartTime", ExceptsTm);
		returnValue.setValue("Except3EndTime", ExcepteTm);
	}
	else {
		returnValue.setValue("Except3StartTime", -1);
		returnValue.setValue("Except3EndTime", -1);
	}	
	
	if (app.lookup("TADTS_cbxExcept4").value == 1) {
		ExceptsTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxExcept4StartTm").value);
		if (ExceptsTm < 0 ) { return; }
		ExcepteTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxExcept4EndTm").value);
		if (ExcepteTm < 0 ) { return; }
		if (ExceptsTm >= ExcepteTm) { return; }
		if (ExceptsTm < RangeStartTime) { return; }
		if (ExcepteTm > RangeEndTime) { return; }
		returnValue.setValue("Except4StartTime", ExceptsTm);
		returnValue.setValue("Except4EndTime", ExcepteTm);
	}
	else {
		returnValue.setValue("Except4StartTime", -1);
		returnValue.setValue("Except4EndTime", -1);
	}
	
	if (app.lookup("TADTS_cbxExcept5").value == 1) {
		ExceptsTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxExcept5StartTm").value);
		if (ExceptsTm < 0 ) { return; }
		ExcepteTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxExcept5EndTm").value);
		if (ExcepteTm < 0 ) { return; }
		if (ExceptsTm >= ExcepteTm) { return; }
		if (ExceptsTm < RangeStartTime) { return; }
		if (ExcepteTm > RangeEndTime) { return; }
		returnValue.setValue("Except5StartTime", ExceptsTm);
		returnValue.setValue("Except5EndTime", ExcepteTm);
	}
	else {
		returnValue.setValue("Except5StartTime", -1);
		returnValue.setValue("Except5EndTime", -1);
	}
	
	var RangesTm = -1; var RangeeTm = -1; 
	if (app.lookup("TADTS_cbxRange1").value == 1) {
		RangesTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxRange1StartTm").value);
		if (RangesTm < 0 ) { return; }
		RangeeTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxRange1EndTm").value);
		if (RangeeTm < 0 ) { return; }
		if (RangesTm >= RangeeTm) { return; }
		if (RangesTm < RangeStartTime) { return; }
		if (RangeeTm > RangeEndTime) { return; }
		returnValue.setValue("Range1StartTime", RangesTm);
		returnValue.setValue("Range1EndTime", RangeeTm);
	}
	else {
		returnValue.setValue("Range1StartTime", -1);
		returnValue.setValue("Range1EndTime", -1);
	}
	
	if (app.lookup("TADTS_cbxRange2").value == 1) {
		RangesTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxRange2StartTm").value);
		if (RangesTm < 0 ) { return; }
		RangeeTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxRange2EndTm").value);
		if (RangeeTm < 0 ) { return; }
		if (RangesTm >= RangeeTm) { return; }
		if (RangesTm < RangeStartTime) { return; }
		if (RangeeTm > RangeEndTime) { return; }
		returnValue.setValue("Range2StartTime", RangesTm);
		returnValue.setValue("Range2EndTime", RangeeTm);
	}
	else {
		returnValue.setValue("Range2StartTime", -1);
		returnValue.setValue("Range2EndTime", -1);
	}
	
	if (app.lookup("TADTS_cbxRange3").value == 1) {
		RangesTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxRange3StartTm").value);
		if (RangesTm < 0 ) { return; }
		RangeeTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxRange3EndTm").value);
		if (RangeeTm < 0 ) { return; }
		if (RangesTm >= RangeeTm) { return; }
		if (RangesTm < RangeStartTime) { return; }
		if (RangeeTm > RangeEndTime) { return; }
		returnValue.setValue("Range3StartTime", RangesTm);
		returnValue.setValue("Range3EndTime", RangeeTm);
	}
	else {
		returnValue.setValue("Range3StartTime", -1);
		returnValue.setValue("Range3EndTime", -1);
	}
	
	if (app.lookup("TADTS_cbxRange4").value == 1) {
		RangesTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxRange4StartTm").value);
		if (RangesTm < 0 ) { return; }
		RangeeTm = util.ConvDHHMMtoMinute(app.lookup("TADTS_cbxRange4EndTm").value);
		if (RangeeTm < 0 ) { return; }
		if (RangesTm >= RangeeTm) { return; }
		if (RangesTm < RangeStartTime) { return; }
		if (RangeeTm > RangeEndTime) { return; }
		returnValue.setValue("Range4StartTime", RangesTm);
		returnValue.setValue("Range4EndTime", RangeeTm);
	}
	else {
		returnValue.setValue("Range4StartTime", -1);
		returnValue.setValue("Range4EndTime", -1);
	}
	app.setHostProperty("returnValue", returnValue.getDatas());
	app.close();
}