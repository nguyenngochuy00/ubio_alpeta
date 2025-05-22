/************************************************
 * InputValidator.module.js
 * Created at 2019. 5. 16. 오전 10:09:14.
 *
 * @author osm8667
 ************************************************/
var InputValidator = function(app) {
		this._app = app;
};


/**
 *
 * @param {cpr.controls.InputBox} ctrl
 * @param {String} type isNull: 널체크, isDuplicate: 중복체크
 * @param {String} validStr 메세지
 */
InputValidator.prototype.validate = function(/* cpr.controls.InputBox */ctrl, type, validStr, ctrlType) {
	this.clearInput(ctrl);
	//valid 속성이 있는지 확인하고 addClass;
	var targetValue = ctrl.value;
	switch(type){
		case "isNull" : {
			if(!targetValue){
				if(ctrlType == "comboBox"){
					ctrl.style.addClass("un-input-invalid-comboBox");
				}else{
					ctrl.style.addClass("un-input-invalid");
				}	
					ctrl.bind("tooltip").toLanguage("Str_CommonRequired");
			}
			break;
		}
		case "isDuplicate" : {
			ctrl.style.addClass("un-input-invalid");
			ctrl.bind("tooltip").toLanguage("Str_DuplicateAlert");
			break;
		}
		//20190827 정래훈  값을 입력했을시 인풋 상태를 변경하기 위해 추가함
		case "isValid" :{
			if(ctrlType == "comboBox"){
				ctrl.style.addClass("un-input-valid-comboBox");
			}else{
				ctrl.style.addClass("un-input-valid");
			}
			ctrl.bind("tooltip").toLanguage("Str_CommonRequired");
			break;
		}
		//20190925 정래훈  인풋 스타일을 아무것도 없는 상태로 원복시켜야 하는 경우가 있어서 추가함
		case "restore" :{
			ctrl.style.addClass("");
			ctrl.tooltip = "";
		}	
		
		case "comboDefalut":{
			if(targetValue==0){
				ctrl.style.addClass("un-input-invalid");
			}else{
				ctrl.style.addClass("un-input-valid");
			}	
			ctrl.bind("tooltip").toLanguage("Str_CommonRequired");
			break;
		}
		default : {
			break;
		}
	}
}

/**
 * 인풋박스에 입력된 값에 대해 유효성검사를 한다.
 * @param {cpr.controls.InputBox} ctrl validation 처리 할 인풋박스
 * @param {any} ctrlValue 인풋 박스의 값
 * @param {cpr.data.DataSet} list 처리 할 데이터
 * @param {String} colName validation 처리 할 데이터의 컬럼명
 * @param {String} validStr 툴팁 내용
 */
InputValidator.prototype.dynamicValidate = function(/* cpr.controls.InputBox*/ctrl, ctrlValue,/*cpr.data.DataSet*/list, colName, validStr) {
	this.clearInput(ctrl);
	//valid 속성이 있는지 확인하고 addClass;
	if(!ctrlValue){
		ctrl.style.addClass("un-input-invalid");
		ctrl.bind("tooltip").toLanguage("Str_CommonRequired");
		return;
	}
	var isExist = list.findFirstRow(colName + "==" + parseInt(ctrlValue));
	if(isExist){
		ctrl.style.addClass("un-input-invalid");
		ctrl.bind("tooltip").toLanguage("Str_DuplicateAlert");
	}else{
		ctrl.unbind("tooltip");
		ctrl.style.addClass("un-input-valid");
	}
}


/**
 * 인풋박스의 스타일을 초기화 한다.
 * @param {cpr.controls.InputBox} ctrl
 */
InputValidator.prototype.clearInput = function(/* cpr.controls.InputBox */ctrl) {
	ctrl.unbind("tooltip");
	ctrl.style.removeClass("un-input-valid");
	ctrl.style.removeClass("un-input-invalid");
	ctrl.style.removeClass("un-input-valid-comboBox");
	ctrl.style.removeClass("un-input-invalid-comboBox");
}


globals.createInputValidator = function(app) {
	return new InputValidator(app);
}