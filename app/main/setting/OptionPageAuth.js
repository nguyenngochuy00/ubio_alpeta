/************************************************
 * OptionPageAuth.js
 * Created at 2019. 4. 29. 오후 8:22:15.
 *
 * @author wonki
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
var oem_version;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var hostApp = app.getHostAppInstance();
	var dmAuth = app.lookup("OptionAuth");
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	oem_version = dataManager.getOemVersion();
	hostApp.callAppMethod("getAuthData").copyToDataMap(dmAuth);
	
	var cmbTermperatureUnit = app.lookup("NSOAU_cmbTermperatureUnit");
	cmbTermperatureUnit.addItem(new cpr.controls.Item(dataManager.getString("Str_Celsius"),0));
	cmbTermperatureUnit.addItem(new cpr.controls.Item(dataManager.getString("Str_Fahrenheit"),1));	
	
	var cmbTermperatureAbnormalNotify = app.lookup("NSOAU_cmbTermperatureAbnormalNotify");
	cmbTermperatureAbnormalNotify.addItem(new cpr.controls.Item("----",0));
	cmbTermperatureAbnormalNotify.addItem(new cpr.controls.Item(dataManager.getString("Str_ErrorEffect"),1));	
	
	// 배트남 주차관제 qrcode 팝업과 겹쳐서 off - zzik
	if (dataManager.getOemVersion() == OEM_MOTORCYCLE_PARK) {
		app.lookup("cmb8").value = 0;
		app.lookup("cmb8").enabled = false;
	}
	
	// 지문 다운로드 수 초기에 0인 경우 10으로 보이도록 -mjy
	if (app.lookup("OptionAuth").getValue("FpDownloadCount") == 0) {
		app.lookup("cmb6").value = 10;
	}
	
	app.lookup("SEAUT_grpMain").redraw();
	
	if(dmAuth.getValue("AuthLogImagePopup") == 0){
		cmbTermperatureAbnormalNotify.value = 0;
		cmbTermperatureAbnormalNotify.enabled = false;
	} else {
		cmbTermperatureAbnormalNotify.enabled = true;
	}
	if (oem_version == OEM_GS_BASIC){
		app.lookup('SEAUT_grpMain').getLayout().setRowVisible(15, false);
		app.lookup('SEAUT_grpMain').getLayout().setRowVisible(20, false);
		app.lookup('SEAUT_grpMain').getLayout().setRowVisible(21, false);
		app.lookup('SEAUT_grpMain').getLayout().setRowVisible(22, false);
		app.lookup('SEAUT_grpMain').getLayout().setRowVisible(23, false);
	}
}


/*
 * Body에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
//function onBodyUnload(/* cpr.events.CEvent */ e){
//	var hostApp = app.getHostAppInstance();
//	hostApp.callAppMethod("setAuthData", app.lookup("OptionAuth"));
//}
exports.requestSetData = function() {
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setAuthData", app.lookup("OptionAuth"));
}


/*
 * "손가락 순위지정" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSESFP_FingerRangkingClick(/* cpr.events.CMouseEvent */ e){
	var OptionList = app.lookup("OptionAuth");
	var fpOrderList = OptionList.getValue("FpOrder").split(',');
	
	var arrfpOrder = [];
	
	for( var idx=0; idx < fpOrderList.length; idx++ ){		
		arrfpOrder[idx] = parseInt(fpOrderList[idx],10);
	} 
	var appld = "app/main/setting/popup/setFingerOrder" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 350, height : 450}, function(dialog){
		dialog.initValue = {"arrFpOrder":arrfpOrder};		
		dialog.bind("headerTitle").toLanguage("Str_SetFingerOrderTitle"); 
		dialog.modal = true;		
	}).then(function(returnValue){
		console.log(returnValue);
		var strFpOrder = "";
		var init = false;
		returnValue.forEach(function(fporder){
			if( init == false ){
				init = true
			} else{
				strFpOrder += ",";
			}
			
			strFpOrder += fporder
		});
		
		console.log(strFpOrder);
		OptionList.setValue("FpOrder", strFpOrder);
	});
}



/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onSESFP_cmbTemplateFormatSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var sESFP_cmbTemplateFormat = e.control;
	//타입을 변경후 저장하게 되면 등록된 모든 지문데이터가 삭제 됩니다.
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmb8SelectionChange(/* cpr.events.CSelectionEvent */ e){

	var cmb8 = e.control;
	var cmbTermperatureAbnormalNotify = app.lookup("NSOAU_cmbTermperatureAbnormalNotify");
	if(cmb8.value == 1){
		cmbTermperatureAbnormalNotify.enabled = true;
	} else {
		cmbTermperatureAbnormalNotify.value = 0;
		cmbTermperatureAbnormalNotify.enabled = false;		
	}
}
