/************************************************
 * sideLayout.js
 * Created at 2018. 10. 16. 오후 2:07:32.
 *
 * @author wonji
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var usint_version;
/**
 * 버튼을 선택할 때 화면 전환
 * @param selectedButton 선택한 버튼 컨트롤
 */
function changePage(selectedButton){
	//emb ID 정보를 받아온다.
	var emb = app.lookup("emb");
	/** @type cpr.controls.Container */
	//버튼을 감싸고 있는 그룹버튼의 ID 정보를 받아온다.
	var grpButtons = app.lookup("grpButtons");
	var buttons = grpButtons.getChildren();
	var url = selectedButton.userattr("src") + "?" + usint_version;
	console.log("url:::: "+url)
	
	emb.app = null;
	cpr.core.App.load(url, function(/* cpr.core.App*/ loadedApp){
		if(!loadedApp){
			return;
		}
		emb.app = loadedApp;
		//emb화면을 다시그려줍니다.
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
	if(grpButtons.userAttr("src") == "sample/side/settingType") {
		var appld = "sample/side/settingType" + "?" + usint_version;
		app.openDialog(appld, {width : 930, height : 650}, function(dialog){
			dialog.ready(function(dialogApp){
				// 필요한 경우, 다이얼로그의 앱이 초기화 된 후, 앱 속성을 전달하십시오.
			});
		}).then(function(returnValue){
			;
		});
	} else {
		changePage(grpButtons);
	}
}


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
}
