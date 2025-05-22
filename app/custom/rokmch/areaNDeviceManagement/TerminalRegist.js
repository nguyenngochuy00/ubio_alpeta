/************************************************
 * TerminalRegist.js
 * Created at 2019. 3. 4. 오후 10:17:48.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();	
	var brandType = dataManager.getSystemBrandType();
	dataManager.getLoginUserGroups().copyToDataSet(app.lookup("LoginUserGroupList"));
	if (isLoginMaster()){
		app.lookup("TMREG_cmbGroup").addItem(new cpr.controls.Item("----","0"));
	}
	
	var ipbID = app.lookup("TMREG_nbeTerminalID");
	if( brandType == BRAND_NITGEN){
		ipbID.max = 2000;
	} else {
		ipbID.max = 99999999;
	}
	app.lookup("TMREG_cmbGroup").selectItemByValue(getLoginUserGroupCode());
}

// 단말기 "등록" 버튼에서 click 이벤트 발생 시 호출.
function onTMREG_btnTerminalRegistClick(/* cpr.events.CMouseEvent */ e){	
	var terminalInfo = app.lookup("TerminalInfo");
	app.close({"Result":0,"TerminalInfo":terminalInfo.getDatas()});
}

// 단말기 등록 취소 클릭
function onTMREG_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close({"Result":1});
}

