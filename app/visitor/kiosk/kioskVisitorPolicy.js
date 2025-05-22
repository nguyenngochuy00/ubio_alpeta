/************************************************
 * kioskVisitApplicationStep1.js
 * Created at 2023. 3. 6. ���� 2:41:47.
 *
 * @author MJY
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(e){
	dataManager = getDataManager();
	var objTermsPage1 = app.lookup("HTML_Terms1");
	
	var locale = dataManager.getLocale(); 
	if( locale == 'en'){
		objTermsPage1.data = "/data/custom/privatePolicyKioskEng.htm"
	} 
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
	cpr.core.App.load("app/visitor/kiosk/kioskVisitorLogin", function(newapp){
		app.close();
		var instance = newapp.createNewInstance().run();
	});
}


/*
 * 아웃풋(VMVAS2_btnHome)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMVAS2_btnHomeClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var vMVAS2_btnHome = e.control;
	removeStepData();
	cpr.core.App.load("app/visitor/kiosk/kioskVisitorLogin", function(newapp){
		app.close();
		var instance = newapp.createNewInstance().run();
	});
}


/*
 * 버튼(VMVAS1_btnNext)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMVAS1_btnNextClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vMVAS1_btnNext = e.control;
	var check2 = app.lookup("cbx2");
	if (!check2.value) {
		dialogAlert(app, "Warning", dataManager.getString("Str_PrivatePolicyCheck"));
		return;
	}
	cpr.core.App.load("app/visitor/kiosk/kioskVisitApplicationStep1", function(newapp){
		app.close();
		var instance = newapp.createNewInstance().run();
	});
}
