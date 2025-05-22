
/*
 * "Search" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	//해당 이름의 이벤트 생성 후 이벤트 전달
	var event = new cpr.events.CUIEvent("search");
	app.dispatchEvent(event);
}


/*
 * Body에서 property-change 이벤트 발생 시 호출.
 * 앱의 속성이 변경될 때 발생하는 이벤트 입니다.
 */
function onBodyPropertyChange(/* cpr.events.CPropertyChangeEvent */ e){

	if(e.property == "value"){
		app.lookup("searchBox").redraw();
	}
}
