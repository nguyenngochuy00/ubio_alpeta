/************************************************
 * terminalManualSearch.js
 * Created at 2023. 12. 18. ���� 9:40:21.
 *
 * @author SW2Team
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");;

/*
 * "확인" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	
	var ipValue = app.lookup("TMS_ipbIP").value;
	if(ipValue.length != 12) {
		dialogAlert(app,"",dataManager.getString("Str_ErrorCommonRequired"));
		return;
	}
	
	makeIPFormat()
	var ManualTerminalInfo = app.lookup("ManualTerminalInfo");
	
	app.close({"ManualTerminalInfo" : ManualTerminalInfo});
}


/*
 * "취소" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.close();
}

function makeIPFormat() {
	var ipValue = app.lookup("TMS_ipbIP").value;
	
	var ip1 = ipValue.substring(0, 3) + ".";
	var ip2 = ipValue.substring(3, 6)+ ".";
	var ip3 = ipValue.substring(6, 9) + ".";
	var ip4 = ipValue.substring(9, 12);
	
	ipValue = ip1 + ip2 + ip3 + ip4;
	
	app.lookup("ManualTerminalInfo").setValue("NetWorkIpAddr", ipValue);
}



/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	// 현재 단말기는  UDP를 9870에서만 받을 수 있으므로 value 고정
	app.lookup("TMS_ipbPort").value = "9870";
	
}

///*
// * 인풋 박스에서 keydown 이벤트 발생 시 호출.
// * 사용자가 키를 누를 때 발생하는 이벤트.
// */
//function onTMS_ipbIPKeydown(/* cpr.events.CKeyboardEvent */ e){
//	/** 
//	 * @type cpr.controls.InputBox
//	 */
//	var tMS_ipbIP = e.control;
//	
//	if(e.key == "Backspace") {
//		return;
//	}
//	
//	var value = tMS_ipbIP.displayText;
//	var leng = value.length;
//	if (leng == 3) {
//		calDotCount(1);
//		return;
//	}
//	 
//	if(leng == 7) {
//		calDotCount(2);
//		return;
//	}
//	if(leng == 11) {
//		calDotCount(3);
//		return;
//	}
//}
//
//// 아이피 자리수가 3자리가 안되면 .을 먼저 찍고 옆으로 갈 수 있으므로
//// ex) 192.168.10.1
//function calDotCount(cnt) {
//	var control = app.lookup("TMS_ipbIP");
//	var value = control.displayText;
//	var splitValue = value.split(".");
//	var count = splitValue.length;
//	
//	if(count == cnt) {
//		control.value = value + ".";
//	}
//	
//}