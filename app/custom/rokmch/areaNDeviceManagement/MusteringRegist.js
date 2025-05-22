/************************************************
 * TerminalRegist.js
 * Created at 2019. 3. 4. 오후 10:17:48.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
}
// 단말기 "등록" 버튼에서 click 이벤트 발생 시 호출.
function onMZREG_btnZoneRegistClick(/* cpr.events.CMouseEvent */ e){	
	var zoneInfo = app.lookup("MusteringInfo");
	app.close({"Result":0,"MusteringInfo":zoneInfo.getDatas()});
}

// 단말기 등록 취소 클릭
function onMZREG_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close({"Result":1});
}
