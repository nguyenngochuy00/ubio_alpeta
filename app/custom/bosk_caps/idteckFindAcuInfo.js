/************************************************
 * idteckFindAcuInfo.js
 * Created at 2023. 9. 18. ���� 4:13:06.
 *
 * @author kth
 ************************************************/
var dataManager = getDataManager();


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var initValue = app.getHost().initValue;
	if (initValue) {
		var finedData = initValue["FinedData"];
		if( finedData != null ){
			finedData.copyToDataMap(app.lookup("FindAcuDevice"));
		}	
	}	
	app.lookup("IFAI_grp_main").redraw();
}


/*
 * "적용" 버튼(IFAI_btn_apply)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onIFAI_btn_applyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var iFAI_btn_apply = e.control;
	var findAcuDevice = app.lookup("FindAcuDevice");
	var ipAddress = findAcuDevice.getValue("DeviceIpAddress");
	var port = findAcuDevice.getValue("DevicePort");
	app.close({"Result": 0, "DeviceIpAddress": ipAddress, "DevicePort": port});
}


/*
 * "종료" 버튼(IFAI_btn_close)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onIFAI_btn_closeClick(/* cpr.events.CMouseEvent */ e){
	app.close();
}
