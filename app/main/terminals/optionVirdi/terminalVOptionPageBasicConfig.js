/************************************************
 * terminalVOptionPageBasicConfig.js
 * Created at 2018. 12. 4. 오후 5:02:09.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var oem_version;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	comLib = createComUtil(app);
	dataManager = getDataManager();
	oem_version = dataManager.getOemVersion();
	
	if (dataManager.getOemVersion() == OEM_KANGWONLAND) {
		app.lookup("TIBAP_opbAuthTypeTitle").visible = true;
		
		app.lookup("TIBAP_opbAuthType1").visible = true;
		app.lookup("TIBAP_cmbAuthType1").visible = true;
		
		app.lookup("TIBAP_opbAuthType2").visible = true;
		app.lookup("TIBAP_cbxAuthType2").visible = true;
		
		app.lookup("TIBAP_opbThermalExceptionTitle").visible = true;
		app.lookup("TIBAP_cmbTermalException").visible = true;
	}
	
	var hostAppIns = app.getHostAppInstance();
	//======== 슬림 단말기에서는 최대 소리가 5까지 수정 - 220506 otk
	var TerminalModel = hostAppIns.callAppMethod("getTerminalModel");
	var Vol = app.lookup("Volume_cmb");
	Vol.deleteAllItems();
	if (TerminalModel == 40) {
		for(var i=0; i<=5; i ++)	{
			var idx = String(i);
			Vol.addItem(new cpr.controls.Item(idx,i));
		}
	} else { 		// 기존 단말기 들은 최대 20 까지
		for(var i=0; i <=20; i ++) {
			var idx = String(i);
			Vol.addItem(new cpr.controls.Item(idx,i));
		}
	}
	// 슬림 단말기에서는 최대 소리가 5까지 수정========//
	if (hostAppIns) {
		var bOptStatus = hostAppIns.callAppMethod("getTerminalOptStatus", "BasicOpt");
		if (bOptStatus == 0) { // 단말에서 정보 가져올때
			if (hostAppIns.callAppMethod("getTerminalID")) {
				var tID = hostAppIns.callAppMethod("getTerminalID");
				var requestData = app.lookup("sms_get_terminal_option_Basic");
				requestData.action = requestData.action + tID + "/option/basic";
				hostAppIns.callAppMethod("parentShowLoadMask", "Str_DefaultOption");
				requestData.send();
			}
		} else {
			// Vinfo에서 데이터 다시 받기
			var getBopt = hostAppIns.callAppMethod("getBasicOption");
			var BOptinfo = app.lookup("BasicOptionInfo");
			getBopt.copyToDataMap(BOptinfo);
			app.lookup("basicgrd").redraw();
		}
	}
	if (oem_version == OEM_GS_BASIC){
		app.lookup("opt_accesslevel").visible = false;
		app.lookup("opt_antipassback").visible = false;
		app.lookup("PassbackLevel_group").visible = false;
	}
}

function onSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	var selectedCtrl = e.control;
	var bOptResult;
	var hostAppIns = app.getHostAppInstance();
	switch (selectedCtrl.id) {
		case "VerifyLevel_cmb":
			bOptResult = hostAppIns.callAppMethod("modifyBasicOption", ["VerifyLevel", selectedCtrl.value]);
			break;
		case "IdentifyLevel_cmb":
			bOptResult = hostAppIns.callAppMethod("modifyBasicOption", ["IdentifyLevel", selectedCtrl.value]);
			break;
		case "PassbackLevel_cmb":
			bOptResult = hostAppIns.callAppMethod("modifyBasicOption", ["PassbackLevel", selectedCtrl.value]);
			break;
		case "Volume_cmb":
			bOptResult = hostAppIns.callAppMethod("modifyBasicOption", ["Volume", selectedCtrl.value]);
			break;
		case "UserKey_cmb":
			bOptResult = hostAppIns.callAppMethod("modifyBasicOption", ["UserKey", selectedCtrl.value]);
			break;
		case "UserIdLength_cmb":
			bOptResult = hostAppIns.callAppMethod("modifyBasicOption", ["UserIdLength", selectedCtrl.value]);
			break;
		case "TIBAP_cmbAuthType1":
			var cbxAuthType2 = app.lookup("TIBAP_cbxAuthType2");
			for(var i = 0; i < 5; i++){
					var item = cbxAuthType2.getItem(i);
					cbxAuthType2.setItemEnable(item, true);
				}
			switch(selectedCtrl.value){
				case "0": break; //체크 안함
				case "2":	
					cbxAuthType2.removeSelectionByValue(2); 
					var item = cbxAuthType2.getItemByValue(2); 
					cbxAuthType2.setItemEnable(item, false); break;
				case "3":	
					cbxAuthType2.removeSelectionByValue(3); 
					var item = cbxAuthType2.getItemByValue(3); 
					cbxAuthType2.setItemEnable(item, false); break;
				case "4":	
					cbxAuthType2.removeSelectionByValue(4);
					var item = cbxAuthType2.getItemByValue(4); 
					cbxAuthType2.setItemEnable(item, false); break;
				case "5":	
					cbxAuthType2.removeSelectionByValue(5); 
					var item = cbxAuthType2.getItemByValue(5); 
					cbxAuthType2.setItemEnable(item, false); break;
				default:		return;
			}
			bOptResult = hostAppIns.callAppMethod("modifyBasicOption", ["AuthType1", parseInt(selectedCtrl.value)]); 
			break;
		case "TIBAP_cbxAuthType2":
			var cbxAuthType2 = app.lookup("TIBAP_cbxAuthType2");
			var authType2 = 0;
			var values = cbxAuthType2.getSelectedIndices();
			//console.log(values);
			values.forEach(function(index){
				authType2 = authType2 | 1 << index;
			});
			bOptResult = hostAppIns.callAppMethod("modifyBasicOption", ["AuthType2", authType2]);
			//console.log(authType2);
			break;
		case "TIBAP_cmbTermalException":
			bOptResult = hostAppIns.callAppMethod("modifyBasicOption", ["ThermalException", selectedCtrl.value]);
			break;
	}
	
	if (oem_version == OEM_VICTORYARCH){
		app.getHostAppInstance().callAppMethod("setModifiedList", 0);
	}
	
	if (bOptResult == -1) {
		console.log("equal data select");
	}
}

function onSms_get_terminal_option_BasicSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	//comLib.hideLoadMask();
	var hostAppIns = app.getHostAppInstance();
	
	hostAppIns.callAppMethod("parentHideLoadMask", "");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if (resultCode == COMERROR_NONE) {
		var bOptStatus = hostAppIns.callAppMethod("initTerminalOptStatus", "BasicOpt");
		var basicInfo = app.lookup("BasicOptionInfo");
		var res = hostAppIns.callAppMethod("setBasicOption", basicInfo);
		if (dataManager.getOemVersion() == OEM_KANGWONLAND) {
			var cbxAuthType2 = app.lookup("TIBAP_cbxAuthType2");
			var authType2 = basicInfo.getValue("AuthType2");
			if (authType2 & (1 << 0)){cbxAuthType2.selectItem(0);}
			if (authType2 & (1 << 1)){cbxAuthType2.selectItem(1);}
			if (authType2 & (1 << 2)){cbxAuthType2.selectItem(2);}
			if (authType2 & (1 << 3)){cbxAuthType2.selectItem(3);}
			if (authType2 & (1 << 4)){cbxAuthType2.selectItem(4);}
			
			var authType1 = basicInfo.getValue("AuthType1");		
			switch(authType1){				
				case "2":	
					cbxAuthType2.removeSelectionByValue(2); 
					var item = cbxAuthType2.getItemByValue(2); 
					cbxAuthType2.setItemEnable(item, false); break;
				case "3":	
					cbxAuthType2.removeSelectionByValue(3); 
					var item = cbxAuthType2.getItemByValue(3); 
					cbxAuthType2.setItemEnable(item, false); break;
				case "4":	
					cbxAuthType2.removeSelectionByValue(4);
					var item = cbxAuthType2.getItemByValue(4); 
					cbxAuthType2.setItemEnable(item, false); break;
				case "5":	
					cbxAuthType2.removeSelectionByValue(5); 
					var item = cbxAuthType2.getItemByValue(5); 
					cbxAuthType2.setItemEnable(item, false); break;			
			}
			var cmbTermalException = app.lookup("TIBAP_cmbTermalException");
			var themalException = basicInfo.getValue("ThermalException");
			cmbTermalException.selectItemByValue(themalException);
			console.log(themalException);
		}
		
		app.lookup("basicgrd").redraw();
	} else {
		if(dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH){
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalBasicInfoGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));						
		} else{
			//dialogAlert(app, "Waning", dataManager.getString("Str_TerminalBasicInfoGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalBasicInfoGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));			
		}
	}
}

function onSms_get_terminal_option_BasicSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_get_terminal_option_BasicSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onTIBAP_cbxAuthType2BeforeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.CheckBoxGroup */
	var tIBAP_cbxAuthType2 = e.control;
	if( e.newSelection.length > e.oldSelection.length){	
		var cbxAuthType2 = app.lookup("TIBAP_cbxAuthType2");
		var values = cbxAuthType2.getSelectedIndices();
		if (values.length>= 3 ){
			e.preventDefault();
		}
	}
	
}
