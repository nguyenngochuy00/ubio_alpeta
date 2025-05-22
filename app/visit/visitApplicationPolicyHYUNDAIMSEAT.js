/************************************************
 * visitApplicationPolicyHYUNDAIMSEAT.js
 * Created at 2020. 6. 2. 오후 2:43:58.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib = createComUtil(app);
var dateLib = cpr.core.Module.require("lib/DateLib");


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var objTermsPage1 = app.lookup("HTML_Terms1");
	var objTermsPage2 = app.lookup("HTML_Terms2");
}


/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var check1 = app.lookup("cbx1");
	var check2 = app.lookup("cbx2");
	if (!check1.value) {
		dialogAlert(app, "Warning", dataManager.getString("Str_VAPolicyCheck"));
		return;
	}
	if (!check2.value) {
		dialogAlert(app, "Warning", dataManager.getString("Str_PrivatePolicyCheck"));
		return;
	}
	cpr.core.App.load("app/visit/visitApplicationStep1", function(newapp) {
		app.close();
		var instance = newapp.createNewInstance().run();
	});
}


/*
 * 버튼(VMVAS1_btnPrev)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMVAS1_btnPrevClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vMVAS1_btnPrev = e.control;
	cpr.core.App.load("app/visitorLogin", function(newapp) {
		app.close();
		var instance = newapp.createNewInstance().run();
	});
}
