/************************************************
 * exports.module.js
 * Created at 2018. 10. 16. 오전 9:37:27.
 *
 * @author osm86
 ************************************************/
/**
 * 오늘 날짜(년월일시분초)를 YYYYMMDDHH24MISS 포맷의 문자열로 반환한다.
 *
 * @date 2018. 10. 10.
 * @memberOf dateLib
 * @return <String> YYYYMMDDHH24MISS
 */
exports.getDate = function() {

    var today = new Date();
    var year = today.getFullYear();
    var month = (today.getMonth() + 1);
    var day = today.getDate();
    var hour = today.getHours();
    var min = today.getMinutes();
    var second = today.getSeconds();
    var millisecond = today.getMilliseconds();

    if (parseInt(month) < 10)
        month = "0" + month;
    if (parseInt(day) < 10)
        day = "0" + day;
    if (parseInt(hour) < 10)
        hour = "0" + hour;
    if (parseInt(min) < 10)
        min = "0" + min;
    if (parseInt(second) < 10)
        second = "0" + second;
    if (parseInt(millisecond) < 10) {
        millisecond = "00" + millisecond;
    } else {
        if (parseInt(millisecond) < 100)
            millisecond = "0" + millisecond;
    }

    return String(year) + String(month) + String(day) + String(hour) + String(min) + String(second);
};

/**
 * 날짜형 변수로 변환한다. (yyyyMMdd)
 *
 * @date 2018. 10. 10.
 * @memberOf dateLib
 * @param <String> pdate 날짜
 * @param <String> flag 구분자(/, .)
 * @return <String> 날짜형 변수
 * @example
 * exports.makeDateFormat("20120719", "/") ==> 2012/07/19
 */
exports.makeDateFormat = function(pdate, flag) {
    var yy = "", mm = "", dd = "", yymmdd;
    var ar;
    if (pdate.indexOf(".") > -1) { // yyyy.mm.dd
        ar = pdate.split(".");
        yy = ar[0];
        mm = ar[1];
        dd = ar[2];
        if (mm.length < 2)
            mm = "0" + mm;
        if (dd.length < 2)
            dd = "0" + dd;
    } else if (pdate.indexOf("-") > -1) { // yyyy-mm-dd
        ar = pdate.split("-");
        yy = ar[0];
        mm = ar[1];
        dd = ar[2];
        if (mm.length < 2)
            mm = "0" + mm;
        if (dd.length < 2)
            dd = "0" + dd;
    } else if (pdate.length == 8) {
        yy = pdate.substr(0, 4);
        mm = pdate.substr(4, 2);
        dd = pdate.substr(6, 2);
    }
    var p = "/";
    if ((typeof flag != "undefined" && flag != "" && flag != null)) {
        p = flag;
    }

    yymmdd = yy + p + mm + p + dd;
    // yymmdd = new Date(yymmdd);

    return yymmdd;
};


/**
 * 시간형 변수로 변환한다. (HHmm)
 * @writter 이재우
 * @date 2019. 02. 16.
 * @memberOf dateLib
 * @param <String> ptime 시간
 * @param <String> flag 구분자(:, .)
 * @return <String> 시간형 변수
 * @example
 * exports.makeTimeFormat("1452", ":") ==> 14:52
 */
exports.makeTimeFormat = function(ptime, flag) {
    var hh = "", mm = "", ss="", retstr="";
    var p = ":";

    if ((typeof flag != "undefined" && flag != "" && flag != null)) {
        p = flag;
    }

   if (ptime.length == 4) {
        hh = ptime.substr(0, 2);
        mm = ptime.substr(2, 2);
        retstr = hh + p + mm;
    }
   if (ptime.length == 6) {
        hh = ptime.substr(0, 2);
        mm = ptime.substr(2, 2);
        ss = ptime.substr(4, 2);
        retstr = hh + p + mm + p + ss;
    }
    // yymmdd = new Date(yymmdd);

    return retstr;
};

/**
 * 특정일자에 날짜를 더한다.
 *
 * @date 2018. 10. 10.
 * @memberOf dateLib
 * @param <String> 년월일 (yyyyMMdd)
 * @param <Number> arg 더할 날짜
 * @return YYYYMMDD
 */
exports.addDay = function(pYmd, offset) {

    var yyyy = pYmd.substr(0, 4);
    var mm = eval(pYmd.substr(4, 2) + "- 1");
    var dd = pYmd.substr(6, 2);

    var dt3 = new Date(yyyy, mm, eval(dd + '+' + offset));

    yyyy = dt3.getFullYear();

    mm = (dt3.getMonth() + 1) < 10 ? "0" + (dt3.getMonth() + 1) : (dt3.getMonth() + 1);
    dd = dt3.getDate() < 10 ? "0" + dt3.getDate() : dt3.getDate();

    return "" + yyyy + "" + mm + "" + dd;
};

/**
 * 오늘 일자에 날짜를 던한다.
 *
 * @date 2018. 10. 10.
 * @memberOf dateLib
 * @param <Number> arg 더할 날짜
 * @return YYYYMMDD
 */
exports.addToDay = function(arg) {

    var sz_ymd;
    if (arg == "")
        arg = 0;

    var date = new Date();
    date.setFullYear(date.getFullYear());// y년을 더함
    date.setMonth(date.getMonth());// m월을 더함
    date.setDate(date.getDate() + arg);// d일을 더함

    sz_ymd = "" + date.getFullYear();

    if (date.getMonth() < 9) {
        sz_ymd += "0" + (date.getMonth() + 1);
    } else {
        sz_ymd += (date.getMonth() + 1);
    }
    if (date.getDate() < 10) {
        sz_ymd += "0" + date.getDate();
    } else {
        sz_ymd += "" + date.getDate();
    }
    return sz_ymd;
};


/**
 * 오늘날짜에서 년/월/일을 자유롭게 더하고 뺀 결과를 문자열로 반환한다.
 *
 * @date 2018. 10. 10.
 * @memberOf dateLib
 * @param year 가감할년수
 * @param month 가감할월수
 * @param day 가감할일수
 * @return YYYYMMDD
 */
exports.calcToday = function(year, month, day) {
    var sz_ymd;
    if (year == "")
        year = 0;
    if (month == "")
        month = 0;
    if (day == "")
        day = 0;

    var date = new Date();
    date.setFullYear(date.getFullYear() + year);// y년을 더함
    date.setMonth(date.getMonth() + month);// m월을 더함
    date.setDate(date.getDate() + day);// d일을 더함

    sz_ymd = "" + date.getFullYear();

    if (date.getMonth() < 9) {
        sz_ymd += "0" + (date.getMonth() + 1);
    } else {
        sz_ymd += (date.getMonth() + 1);
    }
    if (date.getDate() < 10) {
        sz_ymd += "0" + date.getDate();
    } else {
        sz_ymd += "" + date.getDate();
    }
    return sz_ymd;
};


/**
 * 두 개의 날짜를 비교한다.
 *
 * @date 2018. 10. 10.
 * @memberOf dateLib
 * @param <String> fromDate 시작일자
 * @param <String> toDate 종료일자
 * @description fromDate 가 toDate 보다 큰지 체크
 * @example exports.compareDate( "20110204", "20110305" )
 * @return <String> 9 : 비교 조건부족, 0 : 오류, 1 : 정상
 */
exports.compareDate = function(fromDate, toDate) {
    var flag = "9";
    if (fromDate != "" && toDate != "") {
        if (fromDate > toDate)
            flag = "0";
        else
            flag = "1";
    }
    return flag;
};

/**
 * 두 날짜 사이의 차일을 리턴한다
 *
 * @date 2018. 10. 10.
 * @memberOf dateLib
 * @param <String> fromdate 시작날짜
 * @param <String> todate 종료날짜
 * @return 종료날짜에서 시작날짜의 차일
 * @example exports.minusDates("20120102", "20121201")
 */
exports.minusDates = function(fromdate, todate) {

    var tmpFromDate = new Date(parseInt(Number(fromdate.substring(0, 4))), parseInt(Number(fromdate.substring(4, 6))) - 1, parseInt(Number(fromdate
            .substring(6))));
    var tmpNextDate = new Date(parseInt(Number(todate.substring(0, 4))), parseInt(Number(todate.substring(4, 6))) - 1, parseInt(Number(todate.substring(6))));
    var days = (tmpNextDate - tmpFromDate) / (3600 * 24 * 1000);
    return days;
};

/**
 * 입력받은 from월로부터 입력to월까지 개월 수를 반환한다.
 *
 * @date 2018. 10. 10.
 * @memberOf dateLib
 * @param <String> fMonth 시작월
 * @param <String> tMonth 종료월
 * @return <number> 개월 수
 * @example exports.getMonthTerm("201102", "201303")
 */
exports.getMonthTerm = function(fMonth, tMonth) {
    var iMonth = 0; // 계산된 개월수
    var iYear = 0; // 계산된 년도
    var rMonth = 0; // 반환할 개월수

    if (parseInt(fMonth) <= parseInt(tMonth)) {
        iYear = parseInt(tMonth.substr(0, 4)) - parseInt(fMonth.substr(0, 4));
        iMonth = parseInt(tMonth.substr(4, 2), 10) - parseInt(fMonth.substr(4, 2), 10);
        rMonth = (12 * iYear) + iMonth + 1;
        return rMonth;
    } else {
        return 0;
    }
};

/**
 * 입력받은 fromQuarter로부터 입력toQuarter까지 Quarter수반환하기
 *
 * @date 2018. 10. 10.
 * @memberOf dateLib
 * @param <String> fQuarter 시작 Quarter
 * @param <String> tQuerter 종료 Quarter
 * @return 총 Quarter 수
 * @example exports.getQuarterTerm( "20111", "20132" )
 */
exports.getQuarterTerm = function(fQuarter, tQuarter) {
    var iQuarter = 0; // 계산된 Quarter수
    var iYear = 0; // 계산된 년도
    var rQuarter = 0; // 반환할 Quarter수

    if (parseInt(fQuarter) <= parseInt(tQuarter)) {
        iYear = parseInt(tQuarter.substr(0, 4)) - parseInt(fQuarter.substr(0, 4));
        iQuarter = parseInt(tQuarter.substr(4, 1), 10) - parseInt(fQuarter.substr(4, 1), 10);
        rQuarter = (4 * iYear) + iQuarter + 1;
        return rQuarter;
    } else {
        return 0;
    }
};

/**
 * 날짜형식 체크한다. (yyyyMMdd)
 *
 * @date 2018. 10. 10.
 * @memberOf dateLib
 * @param <String> str 날짜
 * @return 정상이면 true, 그외는 false
 * @example exports.isDate("20120719")
 */
exports.isDate = function(str) {
    var year_data = "";
    var month_data = "";
    var date_data = "";
    var i;

    str = objString.prototype.replaceAll(str, "/", "");
    str = objString.prototype.replaceAll(str, "-", "");
    str = objString.prototype.replaceAll(str, ".", "");
    if (str.length != 8)
        return false;

    for (i = 0; i < 8; i++) {
        var c = str.charAt(i);
        if (c < '0' || c > '9') {
            return false;
        }
        if (i < 4)
            year_data += c;
        else if (i >= 4 && i < 6)
            month_data += c;
        else if (i >= 6)
            date_data += c;
    }

    var mnthst = month_data;
    var mnth = parseInt(mnthst, 10);
    var dy = parseInt(date_data, 10);

    if (mnth < 1 || mnth > 12 || dy < 1 || dy > 31) {
        return false;
    }

    if (mnth != 2) {
        if (mnth == 4 || mnth == 6 || mnth == 9 || mnth == 11) {
            if (dy > 30) {
                return false;
            }
        } else if (mnth == 1 || mnth == 3 || mnth == 5 || mnth == 7 || mnth == 8 || mnth == 10 || mnth == 12) {
            if (dy > 31) {
                return false;
            }
        }
    } else {
        var yr1 = parseInt(year_data);
        var maxdy;
        if ((yr1 % 400 == 0) || ((yr1 % 4 == 0) && (yr1 % 100 != 0))) {
            maxdy = 29;
        } else {
            maxdy = 28;
        }

        if (dy > maxdy) {
            return false;
        }
    }
    return true;
};
exports.getQuarter = function(__now_month) {
	var _now_month = parseInt(__now_month);
	if(_now_month > 0 && _now_month < 4){
		return "1";
	}else if(_now_month > 3 && _now_month < 7){
		return "2";
	}else if(_now_month > 6 && _now_month < 10){
		return "3";
	}else if(_now_month > 9 && _now_month < 13){
		return "4";
	}else{
		return "";
	}
};
/* ==========================================================================================
 * 해당 프로젝트에서 새로 만든 메소드들을 정의한다.
 * ========================================================================================== */

exports.getToday = function(_sepa) {

    var today = new Date();
    var year = today.getFullYear();
    var month = (today.getMonth() + 1);
    var day = today.getDate();

    if (parseInt(month) < 10)
        month = "0" + month;
    if (parseInt(day) < 10)
        day = "0" + day;

    var todayStr = '';
    if(_sepa != null){
    	todayStr = String(year) + _sepa + String(month) + _sepa + String(day);
    }else{
    	todayStr = String(year) + String(month) + String(day);
    }
    return todayStr;
};

/**
 * 기준일자 부터  요청된 일수 만큼 만큼 이후 날짜 얻기
 * bisangoo
 * @date 2019.01.31
 * @memberOf dateLib
 * @return <String> YYYYMMDD
 */
exports.nextDate = function(basicDay, days, _sepa) {
	var NextDate = new Date();
	NextDate.setFullYear(basicDay.substr(0,4));
	NextDate.setMonth(Number(basicDay.substr(4,2))-1);
	NextDate.setDate(basicDay.substr(6,2));
	NextDate.setDate(NextDate.getDate() + days);
	var bYear = NextDate.getFullYear();
    var bMonth = (NextDate.getMonth() + 1);
    var bDay = NextDate.getDate();

    if (parseInt(bMonth) < 10) {
    	bMonth = "0" + bMonth;
    }

    if (parseInt(bDay) < 10) {
    	bDay = "0" + bDay;
    }
    var todayStr = '';
    if(_sepa != null){
    	todayStr = String(bYear) + _sepa + String(bMonth) + _sepa + String(bDay);
    } else {
    	todayStr = String(bYear) + String(bMonth) + String(bDay);
    }
    return todayStr;
};

/**
 * 특정날짜 요일 얻기
 * bisangoo
 * @date 2019.01.31
 * @memberOf dateLib
 * @return <String> Day['일','월','화','수','목','금','토']
 */
exports.DayOftheWeek = function(Ymd) {
	var week = new Array('일','월','화','수','목','금','토');
	var Year = Ymd.substr(0,4);
	var Month = Ymd.substr(4,2);
	var Day = Ymd.substr(6,2);
	var tmpstr = Year + "-" + Month + "-" + Day;
	var dDate = new Date(tmpstr).getDay();
	var DotWeek = week[dDate];
    return DotWeek;
};

exports.getWeekTerm = function(pYmd,_isStart) {
    var yyyy = pYmd.substr(0, 4);
    var mm = eval(pYmd.substr(4, 2) + "- 1");
    var dd = pYmd.substr(6, 2);
    var dt3 = new Date(yyyy, mm, eval(dd));
    var startEndDate;
    if(_isStart){
    	var dy = dt3.getDay();
    	startEndDate = exports.addDayFormat (pYmd, -dy,'');
    }else{
    	var dy = dt3.getDay();
    	startEndDate = exports.addDayFormat (pYmd, +(6-dy),'');
    }
    return startEndDate;
};
exports.getFirstDayOfMonth = function(pYmd) {
    var yyyy = pYmd.substr(0, 4);
    var mm = eval(pYmd.substr(4, 2));
    if (parseInt(mm) < 10)
        mm = "0" + mm;
    return yyyy+mm+"01";
};
exports.getLastDayOfMonth = function(pYmd) {
    var yyyy = pYmd.substr(0, 4);
    var mm = eval(pYmd.substr(4, 2));
    if (parseInt(mm) < 10)
        mm = "0" + mm;

    var dt3 = new Date(yyyy, mm, 0);
    return yyyy+mm+dt3.getDate();
};
exports.getQuarterTerm = function(pYmd) {
	var termObj = {};
    var yyyy = pYmd.substr(0, 4);
    var mm = eval(pYmd.substr(4, 2));
	var _now_month = parseInt(mm);
	if(_now_month > 0 && _now_month < 4){
		firtstDay = exports.getFirstDayOfMonth(yyyy+"0101");
		lastDay = exports.getLastDayOfMonth(yyyy+"0301");
	}else if(_now_month > 3 && _now_month < 7){
		firtstDay = exports.getFirstDayOfMonth(yyyy+"0401");
		lastDay = exports.getLastDayOfMonth(yyyy+"0601");
	}else if(_now_month > 6 && _now_month < 10){
		firtstDay = exports.getFirstDayOfMonth(yyyy+"0701");
		lastDay = exports.getLastDayOfMonth(yyyy+"0901");
	}else if(_now_month > 9 && _now_month < 13){
		firtstDay = exports.getFirstDayOfMonth(yyyy+"1001");
		lastDay = exports.getLastDayOfMonth(yyyy+"1201");
	}
	termObj['from'] = firtstDay;
	termObj['to'] = lastDay;

	return termObj;
};
exports.getFirstDayOfYear = function(pYmd) {
    var yyyy = pYmd.substr(0, 4);
    return yyyy+"01"+"01";
};
exports.getLastDayOfYear = function(pYmd) {
    var yyyy = pYmd.substr(0, 4);
    return yyyy+"12"+"31";
};

exports.getDay = function(_dayVal,_lang) {
	if(_dayVal == 0){
		if(_lang == 'han'){
			return "일요일";
		}else if(_lang == 'eng'){
			return "SUN";
		}else{
			return _dayVal;
		}
	}else if(_dayVal == 1){
		if(_lang == 'han'){
			return "월요일";
		}else if(_lang == 'eng'){
			return "MON";
		}else{
			return _dayVal;
		}
	}else if(_dayVal == 2){
		if(_lang == 'han'){
			return "화요일";
		}else if(_lang == 'eng'){
			return "TUE";
		}else{
			return _dayVal;
		}
	}else if(_dayVal == 3){
		if(_lang == 'han'){
			return "수요일";
		}else if(_lang == 'eng'){
			return "WED";
		}else{
			return _dayVal;
		}
	}else if(_dayVal == 4){
		if(_lang == 'han'){
			return "목요일";
		}else if(_lang == 'eng'){
			return "THU";
		}else{
			return _dayVal;
		}
	}else if(_dayVal == 5){
		if(_lang == 'han'){
			return "금요일";
		}else if(_lang == 'eng'){
			return "FRI";
		}else{
			return _dayVal;
		}
	}else if(_dayVal == 6){
		if(_lang == 'han'){
			return "토요일";
		}else if(_lang == 'eng'){
			return "SAT";
		}else{
			return _dayVal;
		}
	}else{
		return _dayVal;
	}
};

