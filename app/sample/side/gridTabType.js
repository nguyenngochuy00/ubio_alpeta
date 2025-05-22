/************************************************
 * gridTabType.js
 * Created at 2018. 10. 15. 오후 5:10:14.
 *
 * @author wonji
 ************************************************/



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	console.log("onBodyLoad:::")
//	app.lookup("groupList").redraw();
	app.lookup("sms1").send();
	app.lookup("subList").send();
}


/*
 * 메뉴에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onGroupListItemClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.Menu
	 */
	var groupList = e.control;
}
