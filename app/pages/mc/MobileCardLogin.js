/************************************************
 * MobileCardLogin.js
 * Created at 2018. 11. 1. 오전 10:13:02.
 *
 * @author osm8667
 ************************************************/
var comLib = createComUtil(app);

/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onIpb1ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var ipb1 = e.control;
	var isValid = comLib.validateControl(ipb1);
	console.log(isValid)
}



/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
}


/*
 * "로그인" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	valLib.validate("grp1", null);
	
}
