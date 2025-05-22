/************************************************
 * lprRegist.js
 * Created at 2019. 10. 26. 오후 2:14:20.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var JWDLR_reqType;
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();	
	
	var initValue = app.getHost().initValue;
	var reqType = initValue["reqType"];
	if (reqType == 0) {
		JWDLR_reqType = reqType;	
		app.lookup("JWDLR_btnRegist").value = dataManager.getString("Str_Regist");
	} else {
		app.lookup("JWDLR_btnRegist").value = dataManager.getString("Str_Update");
		JWDLR_reqType = reqType;
		var lprInfo = initValue["lprInfo"];
		app.lookup("LprInfo").build(lprInfo);
		console.log(app.lookup("LprInfo").getDatas());
	}
	app.lookup("JWDLR_grpMain").redraw();
}

function onJWDLR_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	var lprInfo = app.lookup("LprInfo");
	app.close({"Result":0, "reqType": JWDLR_reqType,"LprInfo":lprInfo.getDatas()});
}

function onJWDLR_btnCloseClick(/* cpr.events.CMouseEvent */ e){
		app.close({"Result":1});
}


/*
 * "개폐 오픈" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	var control = app.lookup("Control");
	control.reset();
	control.setValue("Command", 1); // 1 열림 2 닫힘
	
	var reqSms = app.lookup("smsPutLprControl");
	reqSms.action = "/v1/jawoondae/lpr/control/" + app.lookup("LprInfo").getValue("DeviceID");
	reqSms.send();
}


/*
 * "개폐 폐쇄" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	var control = app.lookup("Control");
	control.reset();
	control.setValue("Command", 2);
	
	var reqSms = app.lookup("smsPutLprControl");
	reqSms.action = "/v1/jawoondae/lpr/control/" + app.lookup("LprInfo").getValue("DeviceID");
	reqSms.send();
}

function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	var openRule = app.lookup("Rule");
	openRule.clear();
	openRule.setValue("OpenRule", parseInt(app.lookup("JWDLR_cmbGate1Set").value, 10)); // 0, 1, 2
//	openRule.setValue("Lpr2OpenRule", parseInt(app.lookup("JWDLR_cmbGate2Set").value, 10)); // 0, 1, 2
	var reqSms = app.lookup("smsPutLprControlSet");
	reqSms.action = "/v1/jawoondae/lpr/controlSet/" + app.lookup("LprInfo").getValue("DeviceID");
	reqSms.send();
}


/*
 * "pdaCard인증" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick4(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var pdatest = app.lookup("cardInfo");
	pdatest.setValue("cardNum", "AAAAAAA");
	pdatest.setValue("picture", "true");
	pdatest.setValue("gio", "I");
	

	var req = app.lookup("smsPDAAUth");
	req.action = "/v1/jawoondae/accessCard/authentication";
	req.send();
	
}
