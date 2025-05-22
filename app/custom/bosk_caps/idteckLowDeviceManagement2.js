/************************************************
 * idteckLowDeviceManagement.js
 * Created at 2023. 9. 22. ���� 1:53:11.
 *
 * @author kth
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var deviceTypePrex = "ILDM_cmb_LowDevcieType";
	var portNoPrex = "ILDM_ipb_PortNo";
	var deviceNamePrex = "ILDM_ipb_LowDevcieName";
	for (var i=0; i < 16;i++) {
		var nSuffix = i + 1;
		var ipbName = portNoPrex + nSuffix;
		var portNoctrl = app.lookup(ipbName);
		portNoctrl.value = nSuffix;
		
		var cmbName = deviceTypePrex +nSuffix;
		var cmdCtrl = app.lookup(cmbName);
		cmdCtrl.addItem(new cpr.controls.Item("Not use","0")); // 미사용
		cmdCtrl.addItem(new cpr.controls.Item("PIR Sensor","1"));
		cmdCtrl.addItem(new cpr.controls.Item("Door Contact1","2"));
		cmdCtrl.addItem(new cpr.controls.Item("Door Contact2","3"));
		cmdCtrl.addItem(new cpr.controls.Item("Shutter Sensor","4"));
		cmdCtrl.addItem(new cpr.controls.Item("Alarm Light","5"));
		cmdCtrl.addItem(new cpr.controls.Item("Alarm Speaker","6"));
		cmdCtrl.selectItem(0);
		cmdCtrl.redraw();
		
		var ipbName = deviceNamePrex + nSuffix;
		app.lookup(ipbName).maxLength = 50;
	}
	
	var initValue = app.getHost().initValue;
	if (initValue) {
		var boardID = initValue["BoardID"];
		if( boardID != null ){
			app.lookup("ILDM_nbe_boardID").value = boardID;//등록
			app.lookup("ILDM_nbe_boardID").redraw();
			comLib.showLoadMask("","ACU LowDevice Search","",0);
			var smsGetLowAcuDeviceList = app.lookup("sms_getLowAcuDeviceList");
			smsGetLowAcuDeviceList.action = "/v1/bosk/acus/LowDevice/" + boardID;
			smsGetLowAcuDeviceList.send();
		}	
	} else {//
		app.close();
	}	
}
/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getLowAcuDeviceListSubmitDone(e){
	//var sms_getLowAcuDeviceList = e.control;
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		var totalCount = app.lookup("Total").getValue("Count");
		if (totalCount > 0) {
			var dsLowAcuDeviceList = app.lookup("LowAcuDeviceList");
			var rowCount = dsLowAcuDeviceList.getRowCount();
			var namePrefix = "ILDM_ipb_LowDevcieName";
			var typePrefix = "ILDM_cmb_LowDevcieType";
			for (var i = 0; i< rowCount; i++) {//
				var row = dsLowAcuDeviceList.getRow(i);
				app.lookup(typePrefix + row.getValue("InoutPortNo")).value= row.getValue("LowDeviceType");
				app.lookup(namePrefix + row.getValue("InoutPortNo")).value= row.getValue("LowDevcieName");
			}
		}
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	app.lookup("ILDM_grp_main").redraw();
}

/*
 * "ADD" 버튼(ILDM_btn_Add)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onILDM_btn_AddClick(e){
	var lowAcuDeviceList = app.lookup("LowAcuDeviceList");
	lowAcuDeviceList.clear();//삭제
	var boardID = app.lookup("ILDM_nbe_boardID").value;	
	
	var ipbPortNo = "ILDM_ipb_PortNo";
	var ipbNamePrex = "ILDM_ipb_LowDevcieName";
	var cmbPrex = "ILDM_cmb_LowDevcieType";
	for (var i = 1; i <= 16; i++) {
		var str_id = "" + i;
		//--------------------------------------------
		var strCmbPrex = cmbPrex + str_id;
		var iclt = app.lookup(strCmbPrex).value;
		if (iclt == "0") { //0 저장안함
			continue;
		}
		//--------------------------------------------
		var nipbPortNo = ipbPortNo + str_id; 
		var iipNo = parseInt(app.lookup(nipbPortNo).value, 10);
		//--------------------------------------------
		var strIpbNamePrex = ipbNamePrex + str_id;
		var ldName = app.lookup(strIpbNamePrex).text;
		//--------------------------------------------
		lowAcuDeviceList.addRowData({"BoardID": boardID, "InoutPortNo": iipNo, "LowDeviceType": iclt, "LowDevcieName": ldName});
	}
	comLib.showLoadMask("","ACU LowDevice Regist","",0);
	app.lookup("sms_postLowAcuDeviceList").send();
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postLowAcuDeviceListSubmitDone(e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}
