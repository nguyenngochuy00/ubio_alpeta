/************************************************
 * selectAccessGroup.js
 * Created at 2020. 3. 23. 오후 7:40:24.
 *
 * @author joymrk
 ************************************************/



/*
 * "출입그룹 기준" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	app.getHost().returnValue = 1;
	app.close();
}


/*
 * "그룹 기준" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	app.getHost().returnValue = 2;
	app.close();
}
