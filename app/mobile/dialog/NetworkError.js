/************************************************
 * Alert.js
 * Created at Aug 28, 2020 10:18:08 AM.
 *
 * @author EVN0025
 ************************************************/



/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
}


/*
 * Triggered when click event is fired from Output "confirm".
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOutputClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var output = e.control;
	app.getHostAppInstance().close();
}
