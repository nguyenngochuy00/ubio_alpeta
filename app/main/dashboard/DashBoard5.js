/************************************************
 * DashBoard5.js
 * Created at 2020. 3. 9. 오전 11:20:10.
 *
 * @author blue1
 ************************************************/

// dashboard Wedget, Setting 모듈 로드
var WedgetModule = cpr.core.Module.require("udc.dashboard.Wedget");
var SettingModule = cpr.core.Module.require("udc.dashboard.Setting");

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	// 대시보드 설정 요청	
	var smsGetOption = app.lookup("sms_getDashboardOption");
	smsGetOption.send();
}

exports.setServiceStatus = function( status ) {
	
	var lLayout = app.lookup("leftLayout");
	var rLayout = app.lookup("rightLayout");
	
	for (var i=0 ; i < SettingModule.getSettingLength() ; i++){
		
		var wgID = SettingModule.getSettingWGID(i);
		var wgName = WedgetModule.getWedgetName(wgID);
		var wedget = null;
		
		if (SettingModule.getSettingWGLayout(i) == 0){
			wedget = lLayout.getChild(wgName);
		} else {
			wedget = rLayout.getChild(wgName);
		}
		
		if (wedget != undefined)
		{
			WedgetModule.setWedgetVaule(status, wedget, wgID);
			wedget.redraw();	
		}
	}
};

function initDashbordLayout() {
	var lLayout = app.lookup("leftLayout");
	var rLayout = app.lookup("rightLayout");
	
	lLayout.removeAllChildren();
	rLayout.removeAllChildren();
	
	SettingModule.sortSettingWedget();	// wedget id로 정렬
	SettingModule.sortSettingIndex();	// setting 값을  index 값으로 정렬
	
	for (var i=0 ; i < SettingModule.getSettingLength() ; i++){
		var wgID = SettingModule.getSettingWGID(i);
		var wedget = WedgetModule.createWedget(wgID);
		WedgetModule.initWedget(wedget, wgID);
		
		if (SettingModule.getSettingWGLayout(i) == 0){
			lLayout.addChild( wedget ,  {
				"width": "1fr",
				"height": WedgetModule.getWedgetHightPx(wgID) + "px",
			});
		}else {
			rLayout.addChild( wedget ,  {
				"width": "1fr",
				"height": WedgetModule.getWedgetHightPx(wgID) + "px",
			});
		}
	}
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getDashboardOptionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getDashboardOption = e.control;
	
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") != COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Error")+" : "+dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
		return;
	}
	
	var dsOptionDashboard = app.lookup("OptionDashboard");	
	SettingModule.initUserSetting(dsOptionDashboard.getRowDataRanged());
	
	if (SettingModule.getSettingLength() == 0) {
		SettingModule.defaultSetting();
	} 
	
	initDashbordLayout();
}
