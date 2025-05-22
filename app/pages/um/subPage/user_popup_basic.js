/************************************************
 * user_popup_basic.js
 * Created at 2018. 10. 4. 오후 3:15:08.
 *
 * @author donghee
 ************************************************/



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	
	if(hostAppIns){
		var initValue = app.getHostProperty("initValue");
		if(initValue != null){
			app.lookup("AUTHINFO").value = initValue["AUTHINFO"];
			app.lookup("PRIVILEGE").value = initValue["PRIVILEGE"];
			app.lookup("CREATE").value = initValue["CREATE"];
			app.lookup("USE_PERIOD").value = initValue["USE_PERIOD"];
			app.lookup("REGIST").value = initValue["REGIST"];
			app.lookup("EXPIRED").value = initValue["EXPIRED"];
			app.lookup("PASSWORD").value = initValue["PASSWORD"];
			app.lookup("TYPE").value = initValue["TYPE"];
		}
	}
}
