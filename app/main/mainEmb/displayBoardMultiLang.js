/************************************************
 * displayBoardMultiLang.js
 * Created at 2024. 01. 18. 오전 9:56:06.
 *
 * @author 960405
 ************************************************/
var dataManager = getDataManager();

function onBodyLoad( /* cpr.events.CEvent */ e) {
	var select = app.lookup("DBML_cmbLanguage");
	select.value = cpr.I18N.INSTANCE.currentLanguage;
	
	if (dataManager.getOemVersion() == OEM_GS_BASIC) {
		select.deleteItemByValue("ja");
		select.deleteItemByValue("fr");
		select.deleteItemByValue("es");
		select.deleteItemByValue("vi");
	}
	
	var dm_fontSize = app.lookup('fontSize');
	var fontSize1 = Math.floor(screen.width / 110) + "px"; // 내용 ( 설정 / 콤보박스 )
	var fontSize2 = Math.floor(screen.width / 130) + "px"; // 버튼 ( 확인 )
	var fontSize3 = Math.floor(screen.width / 140) + "px"; // 제목 ( 언어설정 )
	var fontSize4 = Math.floor(screen.width / 130) + "px"; // 리스트( 콤보박스 리스트  )
	
	dm_fontSize.setValue("font1", fontSize1);
	dm_fontSize.setValue("font2", fontSize2);
	dm_fontSize.setValue("font3", fontSize3);
	dm_fontSize.setValue("font4", fontSize4);
	
	var cmbLanguage = app.lookup('DBML_cmbLanguage');
	cmbLanguage.maxVisibleItems = 5;
	
	// 스토리지 값 설정 
	var dm_returnValue = app.lookup('returnValue');
	dm_returnValue.setValue("image", localStorage.getItem("displayBoard_Iamge"));
	dm_returnValue.setValue("name", localStorage.getItem("displayBoard_Name"));
	dm_returnValue.setValue("count", localStorage.getItem("displayBoard_Count"));
	
	app.lookup('DBML_group').redraw();
}

// 언어 선택 변경
function onCmb1SelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** @type cpr.controls.ComboBox	 */
	var cmbLanguage = e.control;
	cpr.I18N.INSTANCE.currentLanguage = e.newSelection[e.newSelection.length - 1].value;
	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_STRING,
			"ID": cpr.I18N.INSTANCE.currentLanguage
		}
	});
	
	//오픈 소스등 다국어 바인딩 처리가 어려운 부분의 수동 이벤트 핸들러 (특정 이벤트 발생 시 다른 화면에서 해당 이벤트를 캐치 할 수 있도록 하는 기능)
	cpr.core.NotificationCenter.INSTANCE.post("timeline", {});
	cpr.core.NotificationCenter.INSTANCE.post("antipass", cmbLanguage.value);
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 확인 click
function onButtonClick( /* cpr.events.CMouseEvent */ e) {
	var returnValue = app.lookup('returnValue');
	if (returnValue.getValue("image") == null) {
		returnValue.setValue("image", "");
	}
	if (returnValue.getValue("name") == null) {
		returnValue.setValue("name", "");
	}
	if (returnValue.getValue("count") == null) {
		returnValue.setValue("count", 0);
	}
	app.close(returnValue);
}

/*
 * 콤보 박스에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDBML_cmbLanguageClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var dBML_cmbLanguage = e.control;
	app.lookup('DBML_cmbLanguage').open();
}

// 이미지 리사이징 함수
function resizeImage(ctrl, imageData, width, height) {
	
	var tempImage = new Image();
	tempImage.src = imageData;
	tempImage.onload = function() {
		var canvas = document.createElement('canvas');
		var canvasContext = canvas.getContext("2d");
		canvas.width = width;
		canvas.height = height;
		
		canvasContext.drawImage(this, 0, 0, width, height);
		
		ctrl.src = canvas.toDataURL("image/jpeg");
	}
}

/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onDBML_ImageFileInputValueChange( /* cpr.events.CValueChangeEvent */ e) {
	/** 
	 * @type cpr.controls.FileInput
	 */
	var dBML_ImageFileInput = e.control;
	var pictureFile = app.lookup("DBML_ImageFileInput");
	
	var reader = new FileReader();
	reader.readAsDataURL(pictureFile.files[0]);
	//로드 한 후
	reader.onload = function() {
		var imageSrc = reader.result;
		var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
		app.lookup("DBML_imgUserPicture").src = imageSrc;
		app.lookup("DBML_imgUserPicture").redraw();
	};
}

/*
 * 로고 이미지 지우기
 */
function onImageClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Image
	 */
	var image = e.control;
	app.lookup('returnValue').setValue("image", "");
	app.lookup('DBML_imgUserPicture').redraw();
}

/*
 * 로고 파일 찾기
 */
function onGroupClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Container
	 */
	var group = e.control;
	var pictureFile = app.lookup("DBML_ImageFileInput");
	pictureFile.openFileChooser();
}