/************************************************
 * setFolderName.js
 * Created at 2019. 2. 27. 오후 7:01:11.
 *
 * @author osm8667
 ************************************************/

var iconValue = null;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns){
		var name = app.getHostProperty("initValue");
		var oInput = app.lookup("iptName");
		oInput.value = name?name:"";
	}
}


/*
 * "변경" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnChangeClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnChange = e.control;
	var oInput = app.lookup("iptName");
	app.close(oInput.value);
}


/*
 * "취소" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnCancelClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnCancel = e.control;
	app.close();
}
