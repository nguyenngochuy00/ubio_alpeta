/************************************************
 * TNAWorkTypeRegistHDHI.js
 * Created at 2024. 3. 21. 오전 9:58:41.
 *
 * @author zxc
 ************************************************/



/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var initValue = app.getHost().initValue;
	var mode = initValue["mode"];
	if( mode == "edit"){
		var value = initValue["value"];	
		app.lookup("TWTRH_ipbName").value = value;
	}
}


/*
 * 버튼(TWTRH_ipbName_btnAdd)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTWTRH_ipbName_btnAddClick(/* cpr.events.CMouseEvent */ e){
	app.close(app.lookup("TWTRH_ipbName").value);
}
