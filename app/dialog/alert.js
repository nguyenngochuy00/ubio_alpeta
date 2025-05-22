/************************************************
 * alert.js
 * Created at 2018. 11. 1. 오후 4:34:54.
 *
 * @author tomato
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * Body에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var initValue = app.getHost().initValue;
	app.lookup("opt1").value = initValue;
	if(initValue == "환영합니다!"){
		app.lookup("opt1").style.css("font-size" , "20px");
	} else if (initValue.toString().indexOf("VIC_") != -1) {
		var opt = app.lookup("opt1");
		opt.style.css({
			"font-size" : "16px",
			"text-align" : "left"	
		});
		opt.value = initValue.toString().replace("VIC_", "\t\t\t\t\t\t\tDevice Info  \n");		
	}
}

/*
 * "Button" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	var message = app.lookup("opt1").value;
	var strNotLogin = dataManager.getString(getErrorString(ErrorNotLoginState));
	var strNetError = dataManager.getString(getErrorString(COMERROR_NET_ERROR));
	if (( message.indexOf(strNotLogin) > -1 || message.indexOf(strNetError) > -1  ) && (strNotLogin.length > 0 || strNetError.length > 0)) {	// 로그인 상태 x or 네트워크 에러 새로 고침
		location.reload();
	}
	app.close();
}
