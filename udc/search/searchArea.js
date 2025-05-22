/************************************************
 * searchArea.js
 * Created at 2021. 8. 11. 오후 4:24:05.
 *
 * @author zxc
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
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