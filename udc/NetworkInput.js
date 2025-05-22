/************************************************
 * NetworkInput.js
 * Created at 2018. 10. 23. 오후 5:52:30.
 *
 * @author wonji
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onIpbValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var ipb = e.control;
	console.log("ipb1.displayText:: "+ipb.displayText);
	
}


/*
 * 인풋 박스에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onIpbKeydown(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var ipb = e.control;
	
	console.log("ipb.displayTextDDDDDDDDDDD:: ");
	
}


/*
 * 인풋 박스에서 keyup 이벤트 발생 시 호출.
 * 사용자가 키에서 손을 뗄 때 발생하는 이벤트.
 */
function onIpbKeyup(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var ipb = e.control;
	console.log("ipb Length::: "+ipb.displayText.length)
	console.log("kepUP:::: "+ipb.displayText);
	if(e.keyCode == 190) {
		console.log("********************");
		//ipb.putValue(ipb.displayText.replace(".", ""));
		console.log(ipb.value + "aaaaaaaaaaaaaaaaaaa")
		ipb.focusNext();
	}
	onBodyBeforeDraw(e);
}


/*
 * Body에서 before-draw 이벤트 발생 시 호출.
 * 그룹 컨텐츠가 그려지기 직전에 호출되는 이벤트 입니다. 내부 컨텐츠를 동적으로 구성하기위한 용도로만 사용됩니다.
 */
function onBodyBeforeDraw(/* cpr.events.CUIEvent */ e){
	var strIP = app.getAppProperty("strIP");
//	console.log(strIP);
	
	if (strIP == null){
		return;
	}	
	
	var ipSplit = strIP.toString().split('.');

//	var ipSplit = ip.split('.');
		
	var ipMap = app.lookup("ips");
	//console.log(ipMap);
		
	ipMap.setValue("ip1", ipSplit[0]);
	ipMap.setValue("ip2", ipSplit[1]);
	ipMap.setValue("ip3", ipSplit[2]);
	ipMap.setValue("ip4", ipSplit[3]);
	
	
	
//	var grpIpbs = app.lookup("grpIPBs");
//	var ipbs = grpIpbs.getChildren();
	
//	ipbs.forEach(function(/* cpr.controls.InputBox */ each){
//		//app.lookup(each.id).value = ipSplit[0];
//		console.log(typeof(each));
//		//each.value = '123';		
//		//ipb.value = '123';
//	});
	
	
	
	
	/*
	for (var i = 0; i < ipbs.length; i++) {	
		ipb = ipbs[i].
	}
	*/
	
}
