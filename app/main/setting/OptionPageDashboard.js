/************************************************
 * OptionPageDashboard.js
 * Created at 2020. 3. 13. 오전 11:15:22.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

var WedgetModule = cpr.core.Module.require("udc.dashboard.Wedget");
var SettingModule = cpr.core.Module.require("udc.dashboard.Setting");

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var dataManager = getDataManager();
	var userID = dataManager.getViewAccountID();
	var userName = dataManager.getAccountName();
	
	var optUserID = app.lookup("SESDASH_optUserID");
	optUserID.value = userID;
	var optUserName = app.lookup("SESDASH_optUserName");
	optUserName.value = userName;

	var fLayout = app.lookup("fLayout");
	var wgSize = WedgetModule.getWedgetListLength();
	for (var i=0; i < wgSize ; i++) {
		var setForm = new udc.dashboard.SettingForm(i);
		setForm.DASHB_optWedgetName = WedgetModule.getWedgetTitle(i);
		fLayout.addChild( setForm , {
			"width": "380px",
			"height": "120px",
			"autoSize": "height"
		});
	}
	
	reloadSettingForm();
}

function reloadSettingForm() {
	var setSize = SettingModule.getSettingLength();
	if (setSize == 0) {
		SettingModule.defaultSetting();
		setSize = SettingModule.getSettingLength();
	}
	
	if (setSize > 1) {
		SettingModule.sortSettingWedget();	
	}
	
	var j=0;
	var fLayout = app.lookup("fLayout");
	var wgSize = WedgetModule.getWedgetListLength();
	var setForm = null;
	for (var i=0; i < wgSize ; i++) {
		setForm = fLayout.getChild(i);
		// Setting 값 설정
		if ( j < setSize && i == SettingModule.getSettingWGID(j)) {
			setForm.DASHB_cbxWedgetEnable = "true";
			setForm.wedgetEnableValueChange();
			setForm.DASHB_cmbWedgetLeyout = SettingModule.getSettingWGLayout(j);
			setForm.DASHB_ipbWedgetIndex = SettingModule.getSettingWGIndex(j);
			j++;
		} else {
			setForm.DASHB_cbxWedgetEnable = "false";
			setForm.wedgetEnableValueChange();
		}
	}
	fLayout.redraw();
}

exports.requestSetData = function() {
	var dataManager = getDataManager();
	var userID = Number(dataManager.getAccountID());
	
	SettingModule.clearUserSetting();
	
	var fLayout = app.lookup("fLayout");
	var wgSize = WedgetModule.getWedgetListLength();
	var setForm = null;
	for (var i=0; i < wgSize ; i++) {
		 setForm = fLayout.getChild(i);
		 if (setForm.DASHB_cbxWedgetEnable == "true"){
		 	SettingModule.addUserSetting([userID, i, setForm.DASHB_cmbWedgetLeyout, setForm.DASHB_ipbWedgetIndex]);
		 }
	}
	
	if (SettingModule.getSettingLength() == 0) {
		SettingModule.defaultSetting()
	}
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setDashboardData");
	
	reloadSettingForm()
}



