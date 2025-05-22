/************************************************
 * userSearchCtrl.js
 * Created at 2018. 10. 17. 오전 9:35:13.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

// UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
exports.getText = function(){	
	return "";
};

// "검색" 버튼에서 click 이벤트 발생 시 호출.
function onBtnSearchClick(e){	
	var event = new cpr.events.CUIEvent("search");
	app.dispatchEvent(event);
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	var event = new cpr.events.CUIEvent("searchKeydown");
	event.keyCode = e.keyCode;
	app.dispatchEvent(event);
}

function onKeywordKeyUp(/* cpr.events.CKeyboardEvent */ e){
	var event = new cpr.events.CUIEvent("searchKeyUp");
	event.keyCode = e.keyCode;
	app.dispatchEvent(event);
}

//
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var oemVersion = dataManager.getOemVersion();
	if(oemVersion == OEM_JAWOONDAE){
		var cmbSearchCategory = app.lookup("cmbSearchCategory");
		cmbSearchCategory.value = "name";
		var cardItem = cmbSearchCategory.getItemByValue("card");
		cardItem.label = "출입증";
		cmbSearchCategory.addItem(new cpr.controls.Item("생년월일", "birthday"));
		cmbSearchCategory.addItem(new cpr.controls.Item("차량번호", "carnumber"));
	} else if (oemVersion == OEM_SS_HOSPITAL){
		var cmbSearchCategory = app.lookup("cmbSearchCategory");
		cmbSearchCategory.value = "name";
	} else if (oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) {
		var cmbSearchCategory = app.lookup("cmbSearchCategory");

		// 콤보박스에 아이디 관련 검색 제거 (보이는 아이디는 유니크아이디이므로)
		cmbSearchCategory.deleteItemByValue("id");
		cmbSearchCategory.deleteItemByValue("uniqueID");
	} else if (oemVersion == OEM_ALMARAI_AUTHINFO) {
		var cmbSearchCategory = app.lookup("cmbSearchCategory");
		cmbSearchCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthInfo"), "authType"));
	} else if (oemVersion == OEM_HYUNDAI_HI) {
		var cmbSearchCategory = app.lookup("cmbSearchCategory");
		cmbSearchCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_PartnerName"), "partner"));
	} 
}

exports.removeItem = function(value){
	app.lookup("cmbSearchCategory").deleteItemByValue(value);
}

exports.resetValue = function(){
	app.lookup("ipbKeyword").value = "";
	app.lookup("cmbSearchCategory").value = "";
}

/*
 * 인풋 박스에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onIpbKeywordClick(/* cpr.events.CMouseEvent */ e){
	if(app.lookup("cmbSearchCategory").value == "privilegeID"){
		var appld = "app/main/users/UserPrivilegeSelect";
		app.getRootAppInstance().openDialog(appld, {
			width: 410,
			height: 500
		}, function(dialog) {
			dialog.bind("headerTitle").toLanguage("Str_PrivilegeSelect");
			dialog.modal = true;
		}).then(function(returnValue) {
			if( returnValue != null ){
				app.lookup("ipbKeyword").value = returnValue+"";
			}
		});
	}
	
}

exports.addItem = function(label, value) {
	app.lookup("cmbSearchCategory").addItem(new cpr.controls.Item(dataManager.getString(label), value));
}

exports.selectItem = function(label) {
	var SearchCategory = app.lookup("cmbSearchCategory");
	SearchCategory.selectItemByValue(label);
	SearchCategory.redraw();
}

exports.deleteAllItems = function() {
	app.lookup("cmbSearchCategory").deleteAllItems();
}