/************************************************
 * languageManagement.js
 * Created at 2020. 8. 28. 오후 3:21:28.
 *
 * @author fois
 ************************************************/
var LE_languageMapL;
var LE_languageMapR;

function onBodyLoad(/* cpr.events.CEvent */ e){
	LE_languageMapL = new Map();
	LE_languageMapR = new Map();
	
	var sms_getCountryCodeList = app.lookup("sms_getCountryCodeList");
	sms_getCountryCodeList.send();
}

// 언어 코드 리스트 가져오기 성공
function onSms_getCountryCodeListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	var dsCountryCodeList = app.lookup("CountryCodeList");
	
	var cmbLanguageL = app.lookup("LE_cmbLanguageL");
	var cmbLanguageR = app.lookup("LE_cmbLanguageR");
	
	for( var i = 0; i < dsCountryCodeList.getRowCount(); i++ ){
		var codeInfo = dsCountryCodeList.getRow(i);
		cmbLanguageL.addItem(new cpr.controls.Item(codeInfo.getValue("Value"), codeInfo.getValue("Key")));
		cmbLanguageR.addItem(new cpr.controls.Item(codeInfo.getValue("Value"), codeInfo.getValue("Key")));
	}
}

// 왼쪽 언어 변경
function onLE_cmbLanguageLSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.ComboBox */
	var lE_cmbLanguageL = e.control;
	
	var sms_getLangList = app.lookup("sms_getLangList") ;
	sms_getLangList.action = "data/lang/lang_"+lE_cmbLanguageL.value+".json";
	sms_getLangList.userAttr("target", "left");
	sms_getLangList.send();
}


// 오른쪽 언어 변경
function onLE_cmbLanguageRSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.ComboBox	 */
	var lE_cmbLanguageR = e.control;
	
	var sms_getLangList = app.lookup("sms_getLangList") ;
	sms_getLangList.action = "data/lang/lang_"+lE_cmbLanguageR.value+".json";
	sms_getLangList.userAttr("target", "right");
	sms_getLangList.send();	
}

function languaeToMap( map, languageList){
	map.clear();
	
	var count = languageList.getRowCount();
	for( var i = 0; i < count; i++ ){
		var languageInfo = languageList.getRow(i);
		map.set(languageInfo.getValue("Key"),languageInfo.getValue("Value"));		
	}
}

// "검증" 버튼 클릭
function onLE_btnValidationClick(/* cpr.events.CMouseEvent */ e){
	
	LE_languageMapR.clear();
	var dsLanguageListL = app.lookup("LangListL");
	var dsLanguageListR = app.lookup("LangListR");
	
	languaeToMap(LE_languageMapL,dsLanguageListL);
	languaeToMap(LE_languageMapR,dsLanguageListR);
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_getLangListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission	 */
	var sms_getLangList = e.control;
	var dsLangList = app.lookup("LangList");
	var target = sms_getLangList.userAttr("target");
	var dsTargetLangList
	if(target=="left"){
		dsTargetLangList = app.lookup("LangListL");		
	}else{
		dsTargetLangList = app.lookup("LangListR");		
	}
	dsTargetLangList.clear();
	
	dsLangList.copyToDataSet(dsTargetLangList);
	dsTargetLangList.commit();	
}

function onSetFilter( keyword, dsLanguageList, matched ){
	if( keyword && keyword.length > 0 ){
		if( matched == true ){
 			dsLanguageList.setFilter("Value == '"+keyword+"'");
 		} else {
 			dsLanguageList.setFilter("Value *= '"+keyword+"'");
 		}	
 	}else{
 		dsLanguageList.clearFilter();
 	}
}

// left languae 검색
function onLE_ipbSearchKeywordLKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** @type cpr.controls.InputBox	 */
	var lE_ipbSearchKeywordL = e.control;
	if( e.keyCode == 13 ){ // 검색창에서 Enter 입력시..
		var dsLanguageList = app.lookup("LangListL");
 		var keyword = lE_ipbSearchKeywordL.value;
 		var matched = app.lookup("LE_cbxKeywordMatchL").checked;
 		onSetFilter(keyword,dsLanguageList,matched); 		
 	}
}

// right languae 검색
function onLE_ipbSearchKeywordRKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** @type cpr.controls.InputBox	 */
	var lE_ipbSearchKeywordR = e.control;
	if( e.keyCode == 13 ){ // 검색창에서 Enter 입력시..
		var dsLanguageList = app.lookup("LangListR");
 		var keyword = lE_ipbSearchKeywordR.value;
 		var matched = app.lookup("LE_cbxKeywordMatchR").checked;
 		onSetFilter(keyword,dsLanguageList,matched); 		
 	}
}
