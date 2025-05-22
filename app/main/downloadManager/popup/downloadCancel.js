/************************************************
 * downloadCancel.js
 * Created at 2019. 2. 26. 오후 3:32:14.
 *
 * @author joymrk
 ************************************************/



/*
 * "취소" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.close()
}
