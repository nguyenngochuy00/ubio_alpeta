/************************************************
 * settingType.js
 * Created at 2018. 10. 16. 오후 2:49:50.
 *
 * @author wonji
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
function changePage(selectedButton){
	var emb = app.lookup("emb2");
	/** @type cpr.controls.Container */
	var grpButtons = app.lookup("grpButtons");
	var buttons = grpButtons.getChildren();
	var url = selectedButton.userattr("src") + "?" + usint_version;
	emb.app = null;
	console.log("url::: "+url)
	cpr.core.App.load(url, function(/* cpr.core.App*/ loadedApp){
		if(!loadedApp){
			return;
		}
		emb.app = loadedApp;
		emb.redraw();
		
		for(var i = 0; i < buttons.length; i++){
			if(selectedButton == buttons[i]){
				buttons[i].style.css("backgroundColor","SkyBlue");
			}else{
				buttons[i].style.removeStyle("backgroundColor");
			}
		}
	});
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGrpButtonsClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var grpButtons = e.control;
	changePage(grpButtons);
	
}






/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	var btn = app.lookup("defaultgrid");
	changePage(btn);
}
