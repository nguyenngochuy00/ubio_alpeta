// Common Module: validator.module.js

exports.id = "validator.module.js";


/**
 * 공통 Validator Class
 */
{
	var Validator = function(comUtil) {
		this._comUtil = comUtil;
	};
	
	Validator.prototype.validate = function(/* cpr.controls.UIControl */ctrl, ctrlValue) {
		if(!ctrl) {
			return true;
		}
		
		var name = ctrl.userAttr("name");
		
		// 필수 입력 체크
		{
			var notnull = ctrl.userAttr("required");
			if(notnull == "Y") {
				if(ctrlValue == null || ctrlValue == "") {
					this._comUtil.alert(name + " 은/는 필수입력항목입니다.");
					return false;
				}
			}
		}
		
		// 나머지 항목은 값이 있을 때만 체크
		if(ctrlValue == null || ctrlValue == "") {
			return true;
		}
		
		// type check
		{
			var type = ctrl.userAttr("type");
			if(type) {
				var checker = createTypeChecker(type);
				if(checker(ctrlValue) == false) {
					this._comUtil.alert(name + " 은/는 유효하지 않은 형식입니다.");
					return false;
				}
			}
		}
		
		// minlength
		{
			var minlength = ctrl.userAttr("minlength");
			if(minlength) {
				var minlengthNum = cpr.utils.ParamUtil.toNumber(minlength);
				var length = this.getLength(ctrlValue, ctrl.lengthUnit);
				if(length < minlength) {
					this._comUtil.alert(name + " 은/는 최소 " + minlength + " 자리가 입력되어야 합니다.");
					return false;
				}
			}
		}
		
		// fixlength
		{
			var fixlength = ctrl.userAttr("fixlength");
			if(fixlength) {
				var fixlength = cpr.utils.ParamUtil.toNumber(fixlength);
				var length = this.getLength(ctrlValue, ctrl.lengthUnit);
				if(length != fixlength) {
					this._comUtil.alert(name + " 은/는 " + fixlength + " 자리가 입력되어야 합니다.");
					return false;
				}
			}
		}
		
		// TODO 속성이 추가되면 체크로직을 추가
		
		return true;
	}
	
	/**
	 * lengthUnit 별 길이를 구함
	 * @param ctrlValue
	 * @param lengthUnit
	 * @returns {Number}
	 */
	Validator.prototype.getLength = function(ctrlValue, lengthUnit) {
		if(!lengthUnit) {
			lengthUnit = "char";
		}
		var length = 0;
		switch(lengthUnit) {
		case "utf8":{
			for(var i = 0, c; c = ctrlValue.charAt(i++); length += c >> 11 ? 3 : c >> 7 ? 2 : 1);
			break;
		}
		case "ascii":{
			for(var i = 0, c; c = ctrlValue.charAt(i++); length += c >> 7 ? 2 : 1);
			break;
		}
		default : {
			length = ctrlValue.length;
		}
		}
		return length;
	}
	
	/**
	 * 컨트롤에 정의된 보정 속성이 있을 경우 컨트롤의 값을 보정합니다.
	 * 보정된 값은 Control의 value 값으로 재설정 됩니다.
	 * @param ctrl
	 */
	Validator.prototype.revise = function(/* cpr.controls.UIControl */ctrl) {
		if(!ctrl) {
			return;
		}
		var ctrlValue = ctrl.value;
		if(!ctrlValue) {
			return;
		}
		// lpadding
		bllpad : {
			var lpad = ctrl.userAttr("lpad");
			if(!lpad) break bllpad;

			// 고정길이 값이 없으면 스킵
			var fixlength = ctrl.userAttr("fixlength");
			if(!fixlength) {
				break bllpad;
			}
			var minlength = ctrl.userAttr("minlength");
			var lengthUnit = ctrl.lengthUnit;
			if(minlength) { // 입력값이 최소길이에 미치지 못할 경우 보정하지 않음
				var minlength = cpr.utils.ParamUtil.toNumber(minlength);
				var length = this.getLength(ctrlValue, lengthUnit);
				if(length < minlength) {
					break bllpad;
				}
			}
			if(fixlength) {
				while(this.getLength(ctrlValue, lengthUnit) < fixlength) {
					ctrlValue = lpad + ctrlValue;
				}
			}
		}
		// rpadding
		blrpad : {
			var rpad = ctrl.userAttr("rpad");
			if(!rpad) break blrpad;
			
			var fixlength = ctrl.userAttr("fixlength");
			if(!fixlength) {
				break blrpad;
			}
			var minlength = ctrl.userAttr("minlength");
			var lengthUnit = ctrl.lengthUnit;
			if(minlength) { // 입력값이 최소길이에 미치지 못할 경우 보정하지 않음
				var minlength = cpr.utils.ParamUtil.toNumber(minlength);
				var length = this.getLength(ctrlValue, lengthUnit);
				if(length < minlength) {
					break blrpad;
				}
			}
			if(fixlength) {
				while(this.getLength(ctrlValue, lengthUnit) < fixlength) {
					ctrlValue += rpad;
				}
			}
		}
		
		// TODO 보정속성이 추가되면 여기에 추가
		
		
		ctrl.value = ctrlValue;
	}
	
	
	globals.createValidator = function(comUtil) {
		return new Validator(comUtil);
	}
}