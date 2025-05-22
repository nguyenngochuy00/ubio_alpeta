/************************************************
 * MultiLang.js
 * Created at 2018. 12. 21. 오전 9:56:06.
 *
 * @author osm8667
 ************************************************/
var dataManager = getDataManager();

function onBodyLoad(/* cpr.events.CEvent */ e){
	var select = app.lookup("LS_cmbLanguage");
	select.value = cpr.I18N.INSTANCE.currentLanguage;
	//日本語 ja. countrycode.json에도 추가
	
	if(dataManager.getOemVersion() == OEM_GS_BASIC){
		select.deleteItemByValue("ja");
		select.deleteItemByValue("fr");
		select.deleteItemByValue("es");
		select.deleteItemByValue("vi");
		select.deleteItemByValue("ru");
	}
}

// 언어 선택 변경
function onCmb1SelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.ComboBox	 */
	var cmbLanguage = e.control;
	
	cpr.I18N.INSTANCE.currentLanguage = e.newSelection[e.newSelection.length-1].value;
	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_STRING,
			"ID": cpr.I18N.INSTANCE.currentLanguage
		}
	});
	//오픈 소스등 다국어 바인딩 처리가 어려운 부분의 수동 이벤트 핸들러 (특정 이벤트 발생 시 다른 화면에서 해당 이벤트를 캐치 할 수 있도록 하는 기능)
	cpr.core.NotificationCenter.INSTANCE.post("timeline", {});
	cpr.core.NotificationCenter.INSTANCE.post("antipass", cmbLanguage.value);
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 확인 click
function onButtonClick(/* cpr.events.CMouseEvent */ e){	
	app.close();
}

// 편집 클릭
function onLS_btnEditClick(/* cpr.events.CMouseEvent */ e){
	rootDialog(app, "app/main/dashboard/languageManagement", 1024, 800, "Str_LanguageSetting", true, null, null);		
}
