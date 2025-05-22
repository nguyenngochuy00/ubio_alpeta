/************************************************
 * searchTerminal.js
 * Created at 2018. 11. 20. 오후 3:42:41.
 *
 * @author wonki
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var cmbCategory = app.lookup("cmbSearchCategory");
	cmbCategory.selectItemByValue("id");
}

/*
 * "검색" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnSearch = e.control;
	
	var event = new cpr.events.CUIEvent("search");
	app.dispatchEvent(event);
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	var event = new cpr.events.CUIEvent("searchKeyDown");
	app.dispatchEvent(event);
}

exports.deleteSearchCategoryItem = function(itemIndex){
	app.lookup("cmbSearchCategory").deleteItem(itemIndex);
}
