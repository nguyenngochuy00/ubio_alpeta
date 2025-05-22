/************************************************
 * pro-license.js
 * Created at 2019. 3. 20. 오전 9:22:03.
 *
 * @author gyjeon
 ************************************************/

/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onFileInputValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.FileInput
	 */
	var fileInput = e.control;
	var file = fileInput.file;
	var reader = new FileReader();
	
	reader.onload = function(e) {
		app.lookup("licenseOut").value = e.target.result;
	}
	reader.readAsText(file);
}
