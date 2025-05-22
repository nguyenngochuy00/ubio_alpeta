// Common Module: typechecker.module.js

exports.id = "typechecker.module.js";

{
	// 빈 체커
	function emptyChecker(value) {
		return true;
	}

	// Email 체커
	function checkEmail(value) {
		if(!value) { // 값이 없으면 true
			return true;
		}
		
		if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
			return true;
		}
		
		return false;
	}

	// URL 체커
	function checkURL(value) {
		if(!value) { // 값이 없으면 true
			return true;
		}
		// w3resource.com
		var regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
		if(regexp.test(value)) {
			return true;
		}
		
		return false;
	}
	
	// 사업자등록번호 체크
	function checkCSN(value) {
		if(!value) { // 값이 없으면 true
			return true;
		}
		
		// 넘어온 값의 정수만 추츨하여 문자열의 배열로 만들고 10자리 숫자인지 확인합니다.
		if ((value = (value + '').match(/\d{1}/g)).length != 10) {
			return false;
		}
	
		// 합 / 체크키
		var sum = 0, key = [1, 3, 7, 1, 3, 7, 1, 3, 5];
	
		// 0 ~ 8 까지 9개의 숫자를 체크키와 곱하여 합에 더합니다.
		for (var i = 0 ; i < 9 ; i++) { sum += (key[i] * Number(value[i])); }
	
		// 각 8번배열의 값을 곱한 후 10으로 나누고 내림하여 기존 합에 더합니다.
		// 다시 10의 나머지를 구한후 그 값을 10에서 빼면 이것이 검증번호 이며 기존 검증번호와 비교하면됩니다.
		return (10 - ((sum + Math.floor(key[8] * Number(value[8]) / 10)) % 10)) == Number(value[9]);
	}
	
	// 주민등록번호 체크 (전자정부프레임워크 : http://www.egovframe.go.kr/wiki/doku.php?id=egovframework:rte:ptl:validation:add_rules_in_commons_validator)
	function checkPSN(value) {
		if(!value) { // 값이 없으면 true
			return true;
		}
		
		var fmt = /^\d{6}[1234]\d{6}$/;
    	if(!fmt.test(value)){
    		return false;
    	}

    	var birthYear = (value.charAt(7) <= "2") ? "19" : "20";
    	birthYear += value.substr(0, 2);
    	var birthMonth = value.substr(2, 2) - 1;
    	var birthDate = value.substr(4, 2);
    	var birth = new Date(birthYear, birthMonth, birthDate);

		if( birth.getYear() % 100 != value.substr(0, 2) ||
		    birth.getMonth() != birthMonth ||
		    birth.getDate() != birthDate) {
		    return false;
		}

    	var arrDivide = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];            	
    	var checkdigit = 0;            	
    	for(var i = 0; i < value.length - 1; i++) {
    		checkdigit += parseInt(value.charAt(i)) * parseInt(arrDivide[i]);
    	}
    	checkdigit = (11 - (checkdigit % 11)) % 10;
    	if(checkdigit != value.charAt(12)){
    		return false;
    	} else {
    		return true;
    	}
	}
	
	// 신용카드번호 체크
	function checkCreditCard(value) {
		if(!value) { // 값이 없으면 true
			return true;
		}
		// 카드사에 따라 카드번호의 규칙이 다양하므로 13~19 자리 숫자로 이루어졌는지만 체크
		if(/^[0-9]{13,19}$/.test(value)) {
			return true;
		}
		
		return false;
	}
	
	// 유선전화번호 체크
	function checkPhone(value) {
		if(!value) { // 값이 없으면 true
			return true;
		}
		
		if(/^\d{2,3}\d{3,4}\d{4}$/.test(value)) {
			return true;
		}
		
		return true;
	}
	
	// 휴대전화번호 체크
	function checkMobile(value) {
		if(!value) { // 값이 없으면 true
			return true;
		}
		
		if(/^01([0|1|6|7|8|9]?)([0-9]{3,4})([0-9]{4})$/.test(value)) {
			return true;
		}
		
		return true;
	}
	
	// Checker Fctory
	globals.createTypeChecker = function(type) {
		switch(type) {
		case "email" : { // email
			return checkEmail;
		}
		case "url" : { // url
			return checkURL;
		}
		case "csn" : { // 사업자등록번호
			return checkCSN;
		}
		case "psn" : { // 주민등록번호
			return checkPSN;
		}
		case "credit_card" : { // 신용카드번호
			return checkCreditCard;
		}
		case "phone" : { // 유선전화번호
			return checkPhone;
		}
		case "mobile" : { // 휴대전화번호
			return checkMobile;
		}
		default : {
			return emptyChecker;
		}
		}
	};
}

