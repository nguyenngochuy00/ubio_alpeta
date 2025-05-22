/************************************************
 * FileUploadButton.js
 * Created at 2018. 10. 12. 오전 11:04:44.
 *
 * @author donghee
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
 
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

exports.getFile = function() {
	return app.lookup("fileUpload").file;
};

/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onFileUploadValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.FileInput
	 */
	var fileUpload = e.control;
	
	var event = new cpr.events.CValueChangeEvent("fileUploadEvent");
	app.dispatchEvent(event);
}

/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	app.lookup("fileUpload").openFileChooser();
	app.lookup("fileUpload").acceptFile = "image/*";
}
