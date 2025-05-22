/************************************************
 * dialog.js
 * Created at 2018. 10. 11. 오전 11:39:47.
 *
 * @author donghee
 ************************************************/


/*
 * 탭 폴더에서 selection-change 이벤트 발생 시 호출.
 * Tab Item을 선택한 후에 발생하는 이벤트.
 */
function onTabFolderSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.TabFolder
	 */
	var tabFolder = e.control;
	tabFolder.getSelectedTabItem().userAttr();
}


/*
 * "웹캠" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnWebCabClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnWebCab = e.control;
	
}



/*
 * 사용자 정의 컨트롤에서 fileUploadEvent 이벤트 발생 시 호출.
 */
function onFileUploadButtonFileUploadEvent(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type udc.FileUploadButton
	 */
	var fileUploadButton = e.control;
	var file = fileUploadButton.getFile();
	
//	Image Preview
	var image = app.lookup("user_image");

	var reader = new FileReader();
	reader.onload = function(e){
		image.src = e.target.result;
		image.redraw();
	}
	reader.readAsDataURL(file);
	
	app.lookup("request_map").setValue("file_name", file.name.replace(/(\s*)/g,"") );
	app.lookup("fileUpload").addFileParameter("addFile", file);
	app.lookup("fileUpload").send();
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onFileUploadSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var fileUpload = e.control;

//	var ResponseData = app.lookup("response_map");
//	alert(ResponseData.getValue("result_message"));
	
	var message = fileUpload.getMetadata("message");
	alert(message);
	
	fildDownload.removeAllParameters();
	
//	var image = app.lookup("user_image");
//		image.src = ResponseData.getValue("file_url");
//		image.redraw();
}

/*
 * "다운로드" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnApplyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnApply = e.control;
	
	var ResponseData = app.lookup("response_map");

	app.lookup("request_map").setValue("file_url", encodeURI( ResponseData.getValue("file_url").replace(/(\s*)/g,"") ));
	app.lookup("request_map").setValue("file_name", encodeURI(ResponseData.getValue("file_name").replace(/(\s*)/g,"") ));
	app.lookup("fildDownload").send();

//	app.lookup("request_map").setValue("file_url", encodeURI("/exbuilder/sample/example/resource/user_image.png"));
//	app.lookup("request_map").setValue("file_name", encodeURI("user_image.png"));
//	app.lookup("fildDownload").send();










	
}



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onFildDownloadSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var fildDownload = e.control;
	
	fildDownload.removeAllParameters();
}
