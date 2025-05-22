/************************************************
 * RemoteTerminalOptionPageApplication.js
 * Created at 2023. 11. 23. 오후 3:22:12.
 *
 * @author zxc
 ************************************************/

var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");
var pagePrefix = "RTOPA";
var presentAppType; // 현재 단말의 운영모드

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var terminalType = app.getHost().initValue;
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var termianlAllOpt = hostAppIns.callAppMethod("getTerminalAllOption");
		presentAppType = termianlAllOpt.getValue("App_Type");
		
		var nOptinfo = app.lookup("AppOptionInfo");
		termianlAllOpt.copyToDataMap(nOptinfo);
		
		// 미지원 옵션 비활성화
		setEmbAppInnerControlEnable(app, nOptinfo, pagePrefix);
	
		if (app.lookup("RTOPA_FnKey_EnableExt_chk").value == 1) {
			app.lookup("RTOPA_FnKey_EnableExtCnt").enabled = true;
		}
		
		// UI 상에서 아예 삭제...
//		var parent = app.lookup("RTOPA_FnKey")
//		parent.getChildren().forEach(function(each){
//			if(each.id == "RTOPA_FnKey_EnableExt") {
//				console.log(each);
//				parent.removeChild(each);
//			}
//		});
		
		
		app.lookup("appgrd").redraw();
		
		
		appTypeChageTab();
	}
}

function appTypeChageTab() {
	var idx = app.lookup("AppOptionInfo").getValue("App_Type");
	var tabItems = app.lookup("apptab").getTabItems();
	app.lookup("apptab").setSelectedTabItem(tabItems[idx]);
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onRTOPA_AppType_cmbSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var rTOPA_AppType_cmb = e.control;
	appTypeChageTab();
	// 출통,근태 -> 식수 or 식수 -> 출통,근태 로 변경 시 단말 재부팅 일어남
	// 식수 -> 출통,근태 
	if(presentAppType == 2) {
		app.lookup("AppOptionInfo").setValue("Reboot_Flag", 1);
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_RebootOption"));
		return;
	}
	// 출통,근태  -> 식수
	if(presentAppType != 2 && rTOPA_AppType_cmb.value == 2) {
		app.lookup("AppOptionInfo").setValue("Reboot_Flag", 1);
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_RebootOption"));
		return;
	}
	app.lookup("AppOptionInfo").setValue("Reboot_Flag", 0);
}


/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onRTOPA_Ext_cbxValueChange(/* cpr.events.CValueChangeEvent */ e){
	var rTOPA_Ext_cbx = e.control;
	var val = rTOPA_Ext_cbx.value;
	var extCnt_cmb = app.lookup("RTOPA_FnKey_EnableExtCnt");
	if (val == 1) {
		extCnt_cmb.enabled = true;
		if (extCnt_cmb.getIndexByValue(extCnt_cmb.value) < 0) {
			extCnt_cmb.selectItem(0);	// 디폴트 4
		}
	} else {
		extCnt_cmb.enabled = false;
	}
}

//<-------------------------------------------------------------------------------

exports.getTerminalPartOption = function() {
	var TerminalPartOption = app.lookup("AppOptionInfo");
	return TerminalPartOption;
}

exports.getPageInfo = function() {
	return "App";
}

//-------------------------------------------------------------------------------->
