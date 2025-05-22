/************************************************
 * brandType.js
 * Created at 2019. 3. 20. 오후 4:26:27.
 *
 * @author gyjeon
 ************************************************/




/*
 * 아웃풋에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onNitgenClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var nitgen = e.control;
	var virdi = app.lookup("virdi");
	nitgen.style.css("border", "2px solid blue");
	virdi.style.css("border", "1px solid black");
}


/*
 * 아웃풋에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVirdiClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var virdi = e.control;
	var nitgen = app.lookup("nitgen");
	virdi.style.css("border", "2px solid blue");
	nitgen.style.css("border", "1px solid black");
}
