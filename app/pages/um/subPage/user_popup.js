/************************************************
 * user_popup.js
 * Created at 2018. 10. 4. 오후 2:30:45.
 *
 * @author donghee
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
/**
 * 버튼을 선택할 때 화면 전환
 * @param selectedButton 선택한 버튼 컨트롤
 */
function changePage(selectedButton){
	var emb = app.lookup("emb_user_info");
	/** @type cpr.controls.Container */
	var grpButtons = app.lookup("emb_user_info_button");
	var buttons = grpButtons.getChildren();
	var url = selectedButton.userattr("url");
	
	emb.app = null;
	var url = url + "?" + usint_version;
	cpr.core.App.load(url, function(/* cpr.core.App*/ loadedApp){
		if(!loadedApp){
			return;
		}
		emb.app = loadedApp;
		emb.redraw();
		
		for(var i = 0; i < buttons.length; i++){
			if(selectedButton == buttons[i]){
				buttons[i].style.css("backgroundColor","Blue");
				buttons[i].style.css("color","#FFFFFF");
			}else{
				buttons[i].style.removeStyle("backgroundColor");
				buttons[i].style.css("color","#000000");
			}
		}
	});
}




/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	var hostapp = app.getHostAppInstance();
	if(hostapp != null){
		var initValue = app.getHostProperty("initValue");
		if(initValue!= null) {
			var rowData = initValue["rowData"];
			var userInfo = initValue["userInfo"];
			
			
			console.log(rowData);
			
			app.lookup("NAME").value = rowData["NAME"];
			app.lookup("ID").value = rowData["ID"];
			app.lookup("UNIQUEID").value = rowData["UNIQUEID"];
			app.lookup("PRIVILEGE").value = rowData["PRIVILEGE"];
			app.lookup("AUTHINFO").value = rowData["AUTHINFO"];
			app.lookup("GROUP_NAME").value = rowData["GROUP_NAME"];
			app.lookup("ACGROUP").value = rowData["ACGROUP"];
			app.lookup("TIMEZONE").value = rowData["TIMEZONE"];
			app.lookup("DESCRIPT").value = rowData["DESCRIPT"];
			
			var emb = app.lookup("emb_user_info");
			emb.initValue = rowData;
			
			var basic = app.lookup("basic");
			if(userInfo == "mod"){
				basic.userAttr("url", "user_popup/user_popup_info");
			}			
			basic.click();
		} 
	}
}


/*
 * "user_info_button" 그룹 안에서 해당 function이 연결되어있는 버튼 click 시 이벤트 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 * 
 */
function onUserInfoButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var user_info_button = e.control;
	changePage(user_info_button);
}

