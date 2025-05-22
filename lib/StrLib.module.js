/************************************************
 * StrLib.module.js
 * Created at 2018. 11. 6. 오후 3:55:20.
 *
 * @author osm8667
 ************************************************/

/**
 * Null 및 공란이면 True 아니면 False 반환한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> str_val 문자열
 * @return true/false
 */
exports.isEmpty = function(str_val) {
    str_val = trim(str_val);

    if (str_val == null && str_val.length == 0)
        return true;
    else
        return false;
};

/**
 * 입력받은 str 의 왼쪽을 num만큼 chr로 채운다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> str 원본 문자열
 * @param <Number> num 채울 자리수
 * @param <String> chr 채울 문자
 * @example lpad("1", 3, "0")
 * @return
 */
exports.lpad = function(str, num, chr) {
    if (!str || !chr || str.length >= num) {
        return str;
    }

    var max = num - str.length;
    for ( var i = 0; i < max; i++) {
        str = chr + str;
    }

    return str;
};

/**
 * 문자열 중간 잘라서 반환한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> source 원본 문자열
 * @param <Number> start 자를 문자열 시작 위치
 * @param <Number> length 자를 문자열 길이
 * @return <String> 잘라낸 문자열
 */
exports.mid = function(source, start, length) {
    if (start < 0 || length < 0)
        return "";

    var endLength = -1;
    var sourceLength = source.toString().length;
    if (start + length > sourceLength)
        endLength = sourceLength;
    else
        endLength = start + length;
    return source.toString().substring(start, endLength);
};

/**
 * 문자열의 앞 뒤 공백을 제거한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> 문자열
 * @return <String>
 */
exports.trim = function(str) {
    return str.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
};

/**
 * 문자열의 앞 공백을 제거한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> 문자열
 * @return <String>
 */
exports.ltrim = function(str) {
    return str.replace(/^\s+/, "");
};

/**
 * 문자열의 뒤 공백을 제거한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> 문자열
 * @return <String>
 */
exports.rtrim = function(str) {
    return str.replace(/\s+$/, "");
};

/**
 * locIndex 뒤의 문자열을 특정 문자로 마스킹 처리한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> value 원본 문자열
 * @param <Number> locIndex locIndex 뒤의 문자열을 마스킹 처리
 * @param <String> maskingChar 마스킹 문자 (*)
 * @return <String> 마스킹 처리된 문자열
 * @example maskRStr("082-123456-02-123", 6, "*");
 */
exports.maskRStr = function(value, locIndex, maskingChar) {
    var retValue = "";
    var idx = 0;
    for ( var i = 0; i < value.length; i++) {
        var oneChar = value.charAt(i);
        if (oneChar == "-") {
            retValue += oneChar;
        } else {
            idx++;
            retValue = (idx > locIndex) ? retValue + maskingChar : retValue + oneChar;
        }
    }
    return retValue;
};


/**
 * 주민등록번호에 "-"가 없는 경우 "-"를 추가한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> value 주민등록번호
 * @return <String> Masked 문자열
 * @example maskSSNFormat("9901012123456");  // 990101-2123456
 */
exports.maskSSNFormat = function(value) {

    if (typeof value == "number") {
        value = value + "";
    }
    var pos = -1;

    // 1. test pos value
    pos = value.indexOf("-");
    if (pos > -1 && (pos != 6 || value.length <= 7)) {
        value = value.slice(0, pos) + value.slice(pos + 1, value.length);
    }
    // 2. add "-"
    pos = value.indexOf("-");
    if (pos == -1 && value.length >= 7) {
        value = value.slice(0, 6) + "-" + value.slice(6, value.length);
    }
    // 3. check max length
    if (value.length > 14) {
        value = value.slice(0, 14);
    }
    return value;
};

/**
 * 주민등록번호에 "-"가 없는 경우 "-"를 추가하며 뒤에 6자리를 *로 처리한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> value 주민등록번호
 * @return <String> Masked 문자열
 * @example maskSSNFormat2("9901012123456");  // 990101-2******
 */
exports.maskSSNFormat2 = function(value) {

    if (typeof value == "number") {
        value = value + "";
    }
    if (value.indexOf("-") >= 0) {
        var pos = value.indexOf("-");
        retValue = value.substring(0, pos) + value.substring(pos + 1);
    } else {
        retValue = value;
    }
    if (retValue.length > 7) {
        retValue = retValue.substring(0, 6) + "-" + retValue.substring(6, 7) + "*******".substring(0, retValue.length - 7);
    } else if (retValue.length > 6) {
        retValue = retValue.substring(0, 6) + "-" + retValue.substring(6);
    }
    return retValue;
};

/**
 * 사업자번호의 포맷 유효성을 검사한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> value 사업자번호
 * @return <Boolean> 
 * @example checkCorpFormat("1234567890"); 
 */
exports.checkCorpFormat = function(value) {

    var sum = 0;
    var aBizID = new Array(10);
    var checkID = new Array("1", "3", "7", "1", "3", "7", "1", "3", "5");

    for ( var i = 0; i < 10; i++) {
        aBizID[i] = str.substring(i, i + 1);
    }
    for ( var i = 0; i < 9; i++) {
        sum += aBizID[i] * checkID[i];
    }
    sum = sum + parseInt((aBizID[8] * 5) / 10);
    temp = sum % 10;
    temp1 = 0;

    if (temp != 0) {
        temp1 = 10 - temp;
    } else {
        temp1 = 0;
    }
    if (temp1 != aBizID[9]) {
        return false;
    }
    return true;
};

/**
 * 주민번호, 사업자번호 체크하여 포맷에 맞게 "-" 추가한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> value 주민번호 또는 사업자번호
 * @return <String> Masked 문자열
 * @example maskSSNCorpFormat("1234567890"); // 123-45-67890(사업자번호), 123456-1234567(주민등록번호)
 */
exports.maskSSNCorpFormat = function(value) {

    if (typeof value == "number") {
        value = value + "";
    }

    // 1. test pos value
    var pos = value.indexOf("-");
    var lastPos = value.lastIndexOf("-");
    if (lastPos == 6 && value.length <= 7) {
        value = value.slice(0, lastPos) + value.slice(lastPos + 1, value.length);
    }
    if (lastPos == 3 && value.length <= 4) {
        value = value.slice(0, lastPos) + value.slice(lastPos + 1, value.length);
    }
    // 2. add "-"
    pos = value.indexOf("-");
    if (pos == -1 && value.length >= 4) {
        value = value.slice(0, 3) + "-" + value.slice(3, value.length);
    }
    pos = value.indexOf("-");
    var lastPos = value.lastIndexOf("-");
    if (pos == 3 && value.length >= 7 && lastPos == pos) {
        value = value.slice(0, 6) + "-" + value.slice(6, value.length);
    }

    var sregExp = /-/g;

    // 3. check max length
    if (value.length > 12) {
        value = value.replace(sregExp, "");
        value = value.slice(0, 6) + "-" + value.slice(6, value.length);
    }
    if (value.length > 14) {
        value = value.slice(0, 14);
    }
    return value;
};

/**
 * 전화번호의 "-"가 없는 경우 "-"를 추가하여 표시한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> value 전화번호
 * @return <String> Masked 문자열
 * @example maskTelFormat("0226631234");  // 02-2663-1234
 */
exports.maskTelFormat = function(value) {

    if (typeof value == "number") {
        value = value + "";
    }

    var delimeter1 = "-";
    var delimeter2 = "-";

    var firstDelimeterPos = 3;
    var maxLength = 11 + delimeter1.length + delimeter2.length;

    if (value.indexOf("02") == 0) {
        firstDelimeterPos -= 1;
        maxLength -= 1;
    }

    // limit max length
    if (value.length > maxLength) {
        value = value.substr(0, maxLength);
    }

    // remove delimeter
    var regExp = new RegExp("[0-9]*", 'g');
    var result = (value + "").match(regExp);
    value = result.join("");

    // 1st delimeter
    if (value.length > firstDelimeterPos) {
        value = value.substr(0, firstDelimeterPos) + delimeter1 + value.substr(firstDelimeterPos, value.length);
    }
    // 2nd delimeter
    if (value.length > firstDelimeterPos + delimeter1.length + 4) {
        value = value.substr(0, value.length - 4) + delimeter2 + value.substr(value.length - 4, value.length);
    }
    return value;
};

/**
 * 문자열의 Byte를 계산한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> content 텍스트
 * @param <Object> outObj 총 Byte가 표시될 Object (생략가능)
 * @example 
 * getByteLength(obj.getValue()); 
 * getByteLength(obj.getValue(), obj1);
 */
exports.getByteLength = function(content, outObj) {
    var tmpStr;
    var temp = 0;
    var onechar;
    var tcount = 0;
    var obj = outObj;
    tmpStr = new String(content);
    temp = tmpStr.toString().length;
    for ( var k = 0; k < temp; k++) {
        onechar = tmpStr.toString().charAt(k);
        if (escape(onechar) == '%0D') {
        } else if (escape(onechar).length > 4) {
            tcount += 2;
        } else {
            tcount++;
        }
    }
    if (typeof outObj != 'undefined' && outObj != null) {
        obj.setValue(tcount);
    }
    return tcount;
};

/**
 * 스트링의 replace 작업을 처리한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> str 원문
 * @param <String> orgStr 검색할 문자
 * @param <String> repStr 치환할 문자
 * @return <String> 치환된 문자열
 * @example replaceAll(obj.getValue(), "/", "");
 */
exports.replaceAll = function(str, orgStr, repStr) {
    return str.split(orgStr).join(repStr);
};

/**
 * 문자열 영단어 여부 체크
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param word : 문자열
 * @return 영단어이면 true, 아니면 false
 * @description 입력받은 문자열이 모두 영단어이면 true, 아니면 false를 리턴한다
 * @example isEnglish("abcdefg");
 */
exports.isEnglish = function(word) {

    var c;
    if (trim(word).length == 0) {
        return false;
    }

    for ( var i = 0; i < word.length; i++) {
        c = word.toLowerCase().charAt(i);
        if (c < 'a' || c > 'z') {
            if ((c == " ") || (c == ".") || (c == "-")) {
                continue;
            }

            return false;
        }
    }
    return true;
};

/**
 * 입력받은 문자열이 모두 영문 또는 숫자로 되어 있으면 true, 아니면 false를 리턴한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param word : 문자열
 * @return 영문or숫자이면 true, 아니면 false
 * @example hasNumOrLetter("abc123de4fg");
 */
exports.hasNumOrLetter = function(word) {

    var c;
    for ( var i = 0; i < word.length; i++) {
        c = word.toLowerCase().charAt(i);

        if ((c < 'a' || c > 'z') && (c < '0' || c > '9')) {
            return false;
        }

    }
    return true;
};

/**
 * 입력받은 문자열에 한글이 포함되어 있으면 true, 아니면 false를 리턴한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param word : 문자열
 * @return 한글이면 true, 아니면 false
 * @example isKoreanWord("abcd무궁화");
 */
exports.isKoreanWord = function(word) {

    var c;
    for ( var i = 0; i < word.length; i++) {
        c = word.charAt(i);
        if (isKorean(c)) {
            return true;
        }
    }
    return false;
};

/**
 * 입력받은 문자열이 한글이면 true, 아니면 false를 리턴한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib 
 * @param str : 문자열
 * @return 한글이 포함되어 있으면 true, 아니면 false
 * @example isKorean("무궁화꽃이");
 */
exports.isKorean = function(str) {

    if (str != null && str.length > 0) {
        var locale = 0;
        for ( var i = 0; i < str.length; i++) {
            locale = getLocale(str.charAt(i));
        }
        if ((locale & ~0x3) == 0) {
            return true;
        }
    }
    return false;
};

/**
 * 문자(char)의 유형을 리턴한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> str 문자(char)
 * @return <Number> 한글음절(1), 한글자모(2), 숫자(4), 특수문자(8), 영문대(16), 영문소(32), 기타(48)
 * @example getLocale(str);
 */
exports.getLocale = function(str) {

    var locale = 0;
    if (str.length > 0) {
        var charCode = str.charCodeAt(0);

        if (charCode >= 0XAC00 && charCode <= 0XD7A3) { // 한글음절.[ 44032 ~ 55203 ]
            locale = 0X1; // 1
        } else if ((charCode >= 0X1100 && charCode <= 0X11F9) || (charCode >= 0X3131 && charCode <= 0X318E)) { // 한글자모.[ 4352 ~ 4601 ]
            locale = 0X2; // 2
        } else if (charCode >= 0X30 && charCode <= 0X39) { // 숫자.[ 48 ~ 57 ]
            locale = 0X4; // 4
        } else if ((charCode >= 0X20 && charCode <= 0X2F) || (charCode >= 0X3A && charCode <= 0X40) || (charCode >= 0X5B && charCode <= 0X60)
                || (charCode >= 0X7B && charCode <= 0X7E)) { // 특수문자
            locale = 0X8; // 8
        } else if (charCode >= 0X41 && charCode <= 0X5A) { // 영문 대.[ 65 ~ 90 ]
            locale = 0X10; // 16
        } else if (charCode >= 0X61 && charCode <= 0X7A) { // 영문 소.[ 97 ~ 122 ]
            locale = 0X20; // 32
        } else { // 기타
            locale = 0X30; // 48
        }
    }
    return locale;
};

/**
 * 특수 문자가 포함된 경우 true 아니면 false를 리턴한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> word 문자열
 * @return <Boolean> 특수 문자가 포함된 경우 true 아니면 false
 * @example checkChar("abcd##무궁화");
 */
exports.checkChar = function(str) {

    var m_Sp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi
    		   //	/[$\\@\\\#%\^\&\*\(\)\[\]\+\_\{\}\`\~\=\|]/
    var m_char;

    for ( var i = 1; i <= str.length; i++) {
        m_char = str.charAt((i) - 1);

        if (m_char.search(m_Sp) != -1) {
            return true;
        }
    }
    return false;
};

/**
 * 문자열을 입력 byte 만큼만 출력하고 말줄임 한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> str 문자열
 * @param <Number> limit 가져올 byte길이
 * @return <String> limit 길이 만큼만의 문자열에 말줄임 처리
 * @example var strResult = cutByteStr("abcdefghijklmn", 5);
 */
exports.cutByteStr = function(str, limit) {

    var tmpStr = str;
    var byte_count = 0;
    var len = str.length;
    var dot = "";

    for ( var i = 0; i < len; i++) {
        byte_count += getByteCount(str.charAt(i));
        if (byte_count == limit - 1) {
            if (getByteCount(str.charAt(i + 1)) == 2) {
                tmpStr = str.substring(0, i + 1);
                dot = "...";
            } else {
                if (i + 2 != len)
                    dot = "...";
                tmpStr = str.substring(0, i + 2);
            }
            break;
        } else if (byte_count == limit) {
            if (i + 1 != len)
                dot = "...";
            tmpStr = str.substring(0, i + 1);
            break;
        }
    }
    return tmpStr + dot;
};

/**
 * 바이트 수를 반환한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> chr 문자
 * @returns <Number> 바이트수
 */
exports.getByteCount = function(chr) {
    if (escape(chr).length > 4)
        return 2;
    else
        return 1;
};

/**
 * 첫번째 문자를 대문자로 변환해서 반환한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> str 문자열
 * @returns <String> 치환된 문자열
 */
exports.firstUpperCase = function(str) {
    return str.substring(0, 1).toUpperCase() + str.substring(1);
};

/**
 * 첫번째 문자를 소문자로 변환해서 반환한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> str 문자열
 * @returns <String> 치환된 문자열
 * @returns
 */
exports.firstLowerCase = function(str) {
    return str.substring(0, 1).toLowerCase() + str.substring(1);
};

/**
 * XML, JSON Object 를 serialize/stringify 한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <Object> Object
 * @returns <String> serialize/stringify String
 */
exports.serialize = function(object) {
    if (typeof object == 'string') {
        return object;
    } else if (jsonLib.isJSON(object)){
        return JSON.stringify(object);
    } else if (xmlLib.isXmlCoc(object)) {
        return WebSquare.xml.serialize(object);
    } else {
        return object;
    }
};

/**
 * 단어 뒤에 '은'이나 '는'을 붙여서 반환한다.
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> msg
 * @returns <String> 변환된 문자열
 */
exports.attachPostposition = function(msg) {
    if(isFinalConsonant(msg)) {
        msg = msg + "은 ";
    } else {
        msg = msg + "는 ";
    }
    return msg;
};

/**
 * 종성이 존재하는지 여부를 검사한다. 
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> str 문자열
 * @return <Boolean> true : 종성이 존재, false 그외
 */
exports.isFinalConsonant = function(str) {
    var code = str.charCodeAt(str.length - 1);
    if ((code < 44032) || (code > 55197)) {
        return false;
    }
    if((code -16)%28 == 0) {
        return false;
    }
    return true;
};

/* ==========================================================================================
 * 해당 프로젝트에서 새로 만든 메소드들을 정의한다.
 * ========================================================================================== */

/**
 * 파일용량을 KB,MB단위로 보여줌
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> _bytesNum 용량
 * @return <String> 용량+"단위"
 */
exports.toDataUnit = function(_bytesNum) {
	var re='';
	if(numLib.isNumber(_bytesNum) ) {
		var v1 = _bytesNum/1000;
		var arr = (v1+'').split('.');
		if(arr[0].length > 4){
			var v2 = arr[0]/1000;
			var arr2 = (v2+'').split('.');
			re = v2+'MB';
			return re;
		}
		re = v1+'KB';
		return re;
	}
	return re;
};

/**
 * 스트링을 BASE64 인코딩함
 * 
 * @date 2018. 11. 06.
 * @memberOf strLib
 * @param <String> _str 
 * @return <String> base64 encode
 */
exports.base64 = function(s){
	
	var param = {};
	var result;
	param["str"] = encodeURIComponent(s);
    var option = {
    		mode : "synchronous", 
    		action : "/com/getBase64.do", 
    		method : "POST",
    		reqData : param
    };
    result = ajaxLib.executeAjax(option);
    return result["data"];
};


/**
 * 연속된 동일한 문자가 포함된 경우 true 아니면 false를 리턴한다.
 * 
 * @date 2019.05.29.
 * @memberOf strLib
 * @param <String> word 문자열
 * @return <Boolean> 연속된 동일한 문자가 있는지 체크
 * @example checkConsecutiveDuplicateChar("asjdalwwi");
 */
exports.checkConsecutiveDuplicateChar = function(str) {
	var char, Nextchar; // 현재 문자, 다음 문자.
	for (var i = 1; i<= str.length; i++) {
		char = str.charAt((i)-1); // from 0
		Nextchar = str.charAt(i); // from 1
		if (Nextchar == "") { // 문자열의 끝
			break;
		}
		if (char == Nextchar){ 
			return true;
		} 
	}
    return false;
};
/**
 * 대문자 체크  true 면 있다. false 대문자 없다.
 * 
 * @date 2019.05.29.
 * @memberOf strLib
 * @param <String> word 문자열
 * @return <Boolean> 대문자가 있는지 체크
 * @example checkUpper("asjdalwwi");
 */
exports.checkUpper = function(str) {
	var m_Upper = /[A-Z]/;
	var char;
    for ( var i = 1; i <= str.length; i++) {
        char = str.charAt((i) - 1);
        if (char.search(m_Upper) != -1) {
            return true;
        }
    }
    return false;
}

/**
 * 소문자 체크  true 면 있다. false 대문자 없다.
 * 
 * @date 2019.05.29.
 * @memberOf strLib
 * @param <String> word 문자열
 * @return <Boolean> 소문자가 있는지 체크
 * @example checkLower("asjdalwwi");
 */
exports.checkLower = function(str) {
	var m_Lower = /[a-z]/;
	var char;
    for ( var i = 1; i <= str.length; i++) {
        char = str.charAt((i) - 1);

        if (char.search(m_Lower) != -1) {
            return true;
        }
    }
    return false;
}

/**
 * 숫자 체크  true 면 있다. false 대문자 없다.
 * 
 * @date 2019.05.29.
 * @memberOf strLib
 * @param <String> word 문자열
 * @return <Boolean> 숫자가 있는지 체크
 * @example checkNumber("1asjdalwwi");
 */
exports.checkNumber = function(str) {
	var m_Number = /[0-9]/;
	var char;
    for ( var i = 1; i <= str.length; i++) {
        char = str.charAt((i) - 1);

        if (char.search(m_Number) != -1) {
            return true;
        }
    }
    return false;
}
/**
 * string 압뒤로 특정 문자 붙이기
 * 
 * @date 2019.07.31
 * @memberOf strLib
 * @param <String> pad 문자열, str 문자열, pad_pos 문자열 (left, rigth)
 * @return pading된 문자열 
 * @example formattedString("000", "12", "left")
 */
exports.formattedString = function(pad, str, pad_pos) {
	if (typeof str === 'undefined') {
		return;
	} 
	if (pad_pos == "left") {
		return (pad + str).slice(-pad.length);
	} else if (pad_pos == "right") {
		return (str + pad).substring(0, pad.length);
	}
}


exports.isEmpty2 = function(str_val) { 
    if (str_val.length == 0)
        return true;
    else
        return false;
};

exports.isEmpty3 = function(str_val) { 
    if (str_val == 0)
        return true;
    else
        return false;
};

exports.isEmpty4 = function(str_val) { 
    if (str_val.split(" ").join("") == "")
        return true;
    else
        return false;
};
