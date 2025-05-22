/************************************************
 * excel.js
 * Created at 2018. 10. 11. 오후 4:10:27.
 *
 * @author osm86
 ************************************************/


/*
 * "export" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_ExportClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_Export = e.control;
	var oGrid = app.lookup("grd1");
	var filereq = app.lookup("sms2");
	if(oGrid.getRowCount()==0){//grid에 조회된 항목이 없다면 이벤트를 멈춥니다.
		alert('조회된 항목이 없습니다.')
		return;
	}
	var data = oGrid.getExportData();//그리드에 있는 데이터를 엑셀 설정을 포함한 json 형식으로 반환합니다.
	filereq.action = "../../export/test.xlsx";//파일이름을 동적으로 혹은 고정하여 서브미션을 수행합니다.
	filereq.setRequestObject(data);//요청 데이터를 세팅합니다.
	filereq.send();//서브미션을 수행합니다.
}


/*
 * "import" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_ImportClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_Import = e.control;
	// UDC 동적 생성
	var fileupload = new udc.fileupload("fileuploader");
	var showConstraint = {
		"position" : "absolute",
		"top" : "0",
		"bottom" : "0",
		"left" : "0",
		"right" : "0"
	};
	
	// UDC 출판된 이벤트 : "filesend"
	fileupload.addEventListener("filesend", function(/* cpr.events.CEvent */e) {
		// UDC 함수 호출
		var files = fileupload.getFiles();
		if(!files) return;
		app.getContainer().removeChild(fileupload);

		var submission = app.lookup("sms1");
		submission.setFileParameters("ds1", files);
		
		submission.send();
		
	});
	
	app.getContainer().addChild(fileupload, showConstraint);
	//앱 컨테이너(최상위)에 udc를 띄웁니다.
}


/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_DownClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_Down = e.control;
	
}
