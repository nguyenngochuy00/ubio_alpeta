/************************************************
 * MonitoringAuthImage.js
 * Created at 2020. 3. 5. 오후 4:08:03.
 *
 * @author jrh
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var CloseTimer = 6;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var initValue = app.getHost().initValue;
	app.lookup("image").src = "data:image/png;base64," + initValue["logImage"];
	var temperature = initValue["temperature"];
	var temperatureValid = initValue["temperatureValid"];
		
	if( temperature ){
		app.lookup("MRAIP_opbTemperature").visible = true;
		app.lookup("MRAIP_opbTemperature").value = temperature;
		var temperatureErrorNotify = dataManager.getTemperatureErrorNotify();
		
		if( temperatureErrorNotify == 1 && temperatureValid==2){
			app.lookup("MRAIP_ctrlAudio").play();
		}
	}else{
		app.lookup("MRAIP_opbTemperature").visible = false;
	}
	app.lookup("OTP_AutoCloseTimer").value = CloseTimer;
	AuthImageAutoClose();
	//console.log(app.getActualRect().height,app.getActualRect().width);
}

function AuthImageAutoClose(){
	if(CloseTimer == 1){
		app.close();
	}else{
		CloseTimer--;
		app.lookup("OTP_AutoCloseTimer").value = CloseTimer;
		setTimeout(function(){ 
			AuthImageAutoClose();
		}, 1000);
	}
}

// Body에서 before-unload 이벤트 발생 시 호출.
function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	AuthImageDialogLeft = app.getActualRect().left;
	AuthImageDialogTop = app.getActualRect().top-32;
	AuthImageWidth = app.getActualRect().width; 
	AuthImageHeight = app.getActualRect().height+32;
}


// 도움말
function onMRMAN_imgHelpPageClick( /* cpr.events.CMouseEvent */ e) {
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}