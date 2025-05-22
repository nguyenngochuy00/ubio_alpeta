/************************************************
 * config.js
 * Created at 2019. 3. 20. 오전 10:07:22.
 *
 * @author gyjeon
 ************************************************/



/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDefault_configClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var default_config = e.control;
	var dispersion_config = app.lookup("dispersion_config");
	default_config.style.css("border","2px solid blue");
	dispersion_config.style.css("border", "1px solid black");
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDispersion_configClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var dispersion_config = e.control;
	var default_config = app.lookup("default_config");
	dispersion_config.style.css("border","2px solid blue");
	default_config.style.css("border", "1px solid black");
	
}


/*
 * "찾기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var fileInput = app.lookup("fileInput");
	
	fileInput.openFileChooser();
}


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
		app.lookup("configOut").value = e.target.result;
	}
	reader.readAsText(file);
}
