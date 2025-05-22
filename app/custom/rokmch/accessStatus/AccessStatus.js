/************************************************
 * AccessStatus.js
 * Created at 2021. 1. 27. 오전 10:25:46.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

var ACS_tabIndex = 1; 			// 현재 탭 인덱스
var UserAccessStatus = 1;
var CarAccessStatus = 2;


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	alert("개발중인 메뉴입니다");
}

/*
 * 탭 폴더에서 selection-change 이벤트 발생 시 호출.
 * Tab Item을 선택한 후에 발생하는 이벤트.
 */
function onACS_tapMenuSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var tabFolder = e.control;
	var tabItem = tabFolder.getSelectedTabItem();
 	ACS_tabIndex = tabItem.id;
}
