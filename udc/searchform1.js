/************************************************
 * searchform1.js
 * Created at 2018. 10. 11. 오전 11:16:06.
 *
 * @author osm86
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return app.lookup("ipt_search").value;
};



/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var search = new cpr.events.CUIEvent("search");
	app.dispatchEvent(search);//udc를 사용하는 페이지에서 접근할 이벤트를 생성하고 전달합니다.(클릭이벤트 전달)
}
