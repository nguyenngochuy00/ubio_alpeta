/************************************************
 * confirm.js
 * Created at 2018. 11. 1. 오후 2:45:03.
 *
 * @author tomato
 ************************************************/



/*
 * Body에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	var initValue = app.getHost().initValue;
	app.lookup("opt1").value = initValue;
}


/*
 * "Button" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	app.getHost().returnValue = false;
	app.close();
}


/*
 * "Button" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	app.getHost().returnValue = true;
	app.close();
	
	
}
