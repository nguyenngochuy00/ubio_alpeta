/************************************************
 * RemoteTerminalOptionPageNetwork.js
 * Created at 2023. 11. 23. 오후 3:05:51.
 *
 * @author zxc
 ************************************************/

var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var terminalType = app.getHost().initValue;
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var termianlAllOpt = hostAppIns.callAppMethod("getTerminalAllOption");
		var nOptinfo = app.lookup("NetWorkOptionInfo");
		termianlAllOpt.copyToDataMap(nOptinfo);
		
		if (app.lookup("RTOPN_DDNS_cbx").value == 1) {
			app.lookup("RTOPN_DDNS_opt").visible = true;
			app.lookup("RTOPN_DDNS_opt").enabled = true;
		}
		
		app.lookup("networkgrd").redraw();
	}

}


function changeUseFlag(flag) {
	if (flag == 0) {	// static
		app.lookup("RTOPN_IP_ipb").enabled = true;
		app.lookup("RTOPN_Subnet_ipb").enabled = true;
		app.lookup("RTOPN_Gateway_ipb").enabled = true;
		app.lookup("RTOPN_DNS1_ipb").enabled = true;
		app.lookup("RTOPN_DNS2_ipb").enabled = true;
	} else {	// DHCP
		app.lookup("RTOPN_IP_ipb").enabled = false;
		app.lookup("RTOPN_Subnet_ipb").enabled = false;
		app.lookup("RTOPN_Gateway_ipb").enabled = false;
		app.lookup("RTOPN_DNS1_ipb").enabled = false;
		app.lookup("RTOPN_DNS2_ipb").enabled = false;
	}
}

/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onRTOPN_Type_rdbSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.RadioButton
	 */
	var nRTOPN_Type_rdb = e.control;
	changeUseFlag(nRTOPN_Type_rdb.value)
}


/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onRTOPN_DDNS_cbxValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var rTOPN_DDNS_cbx = e.control;
	if (rTOPN_DDNS_cbx.value == 1) {	// DDNS 사용
		app.lookup("RTOPN_DDNS_opt").visible = true;
		app.lookup("RTOPN_DDNS_opt").enabled = true;
	} else {
		app.lookup("RTOPN_DDNS_opt").visible = false;
		app.lookup("RTOPN_DDNS_opt").enabled = false;
	}
	app.lookup("RTOPN_DDNS_opt").redraw();
}

//<-------------------------------------------------------------------------------

exports.getTerminalPartOption = function() {
	var TerminalPartOption = app.lookup("NetWorkOptionInfo");
	return TerminalPartOption;
}

exports.getPageInfo = function() {
	return "Network";
}

//-------------------------------------------------------------------------------->
