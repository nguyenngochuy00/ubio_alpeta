/************************************************
 * UserInfor.js
 * Created at 2018. 10. 30. 오전 11:21:21.
 *
 * @author wonji
 ************************************************/

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
	console.log("success:::::::::::::::::::::::;alert ")
	var message = fileUpload.getMetadata("message");
	dialogAlert(app, "", message);
	fileUpload.removeAllParameters();
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
	
//	var thumbext = document.getElementById('file').value; //파일을 추가한 input 박스의 값
	var fileExt = file.name.substring(file.name.lastIndexOf('.')+1);
	console.log("fileName:::::::::::::::::: "+fileExt)
	if(fileExt != "jpg" && fileExt != "png" &&  fileExt != "gif" &&  fileExt != "bmp"){ //확장자를 확인합니다.
		dialogAlert(app, "", "썸네일은 이미지 파일(jpg, png, gif, bmp)만 등록 가능합니다.");
		image.src = "";
		return;
	}

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
 * "다운로드" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	var ResponseData = app.lookup("response_map");

	app.lookup("request_map").setValue("file_url", encodeURI( ResponseData.getValue("file_url").replace(/(\s*)/g,"") ));
	app.lookup("request_map").setValue("file_name", encodeURI(ResponseData.getValue("file_name").replace(/(\s*)/g,"") ));
	app.lookup("fildDownload").send();	
}


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	if(hostAppIns){
		var userInfo = app.getHostProperty("initValue");
		console.log(userInfo);
	}
	app.lookup("userinfo").build(userInfo);
	app.lookup("grp1").redraw();
	app.lookup("grp2").redraw();
	
}
