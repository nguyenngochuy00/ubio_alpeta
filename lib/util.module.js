/************************************************
 * util.module.js
 * Created at 2018. 12. 27. 오후 2:58:49.
 *
 * @author wonki
 ************************************************/

/**
 * 두 개의 DataMap을 비교
 * @param dm1
 * @param dm2
 */
exports.compareDataMap = function(/*cpr.data.DataMap*/dm1, /*cpr.data.DataMap*/dm2) {
	var val_1 = JSON.stringify(dm1.getDatas());
	var val_2 = JSON.stringify(dm2.getDatas());
	
	//console.log(val_1);
	//console.log(val_2);
	
	if (val_1.indexOf(val_2) == 0) {
		return true;
	}
	return false;
}

exports.GetDateStringFromDateInput = function(/*cpr.controls.DateInput*/di) {
	
}
/**
 * @date 2019. 11. 29.
 * @param <Number>  
 * @return Number 분단위를   '-' 전날,' ' 당일, '+'다음날  + HH:mm 으로 String 반환
 */
exports.ConvDHHMMfromMinute = function(tm) {
	if(tm < 0 || tm >= 4320) {
		return  "--:--";
	}
	var day;
	if (tm < 1440)
    {
        day = '-';
    }
    else if (tm < 2880)
    {
        day = ' ';
        tm = tm - 1440;
    }
    else
    {
        day = '+';
        tm = tm - 2880;
    }
    var hh = parseInt(tm / 60);
    var mm = tm % 60;
    if (hh < 10) {
    	hh = '0'+hh; 
    }
    if (mm < 10) {
    	mm = '0'+mm; 
    }
    var HHmm = day+hh+":"+mm;
  
    return HHmm;
}
/**
 * @date 2019. 11. 29.
 * @param <String, Numbaer>  tm <- 시:분, minuteDigit <- 시분 형태 : 소수점 형태 Type 지정
 * @return Number 분단위를    HH:mm 으로 String 반환
 */
exports.ConvHHMMfromMinute = function(tm, minuteDigit) {
	var str;
	var hh = parseInt(tm/60);
	var mm = tm % 60;
	
	if (minuteDigit == 0) { //시분 형태
		if (tm < 0) { return "--:--"; }
		else {
			if (hh < 10) { hh = '0'+ hh; }
			if (mm < 10) { mm = '0'+ mm; }
			str = hh + ":" + mm;
			return str;
		}
	} else {
		if (tm < 0) { return "--.--"; }
        else {
          	str = String((tm / 60.0));
            return str;
        }
	}
}

/**
 *  전날 00:00기준 3일간 HHMM을 분단위 값으로(0분에서 4319분까지)
 * @date 2019. 11. 29.
 * @param <String>  tm <- '-' 전날,' ' 당일, '+'다음날  + HH:mm(string)
 * @return '-' 전날,' ' 당일, '+'다음날  + HH:mm(string)를 분단위로 반환(Number)  
 */
exports.ConvDHHMMtoMinute = function(tm){
	
	var str = new Array();
	var str = tm.split("");
	var length = str.length;
	if(length > 10) return -1;
	
	var dayMark = ' ';
	var hh = new Array();
	var mm = new Array();
	var hi = 0;
	var mi = 0;
	var bColon = false;
	
	for(var i =0; i< length; i++) {
		var IsNum = isNaN(str[i]);
		if (IsNum == false && str[i] == ' ') {
			IsNum = true;	// ' ' 공백을 문자로 인식 못함.
		}
		if( IsNum == true) { 
			if ( str[i] == ':') {
				if (bColon) { return -1; }	// ':' 또나왔음
				else {
					if(hi == 0) { return -1; } // 시값 없음
					bColon = true;
				}
			} else if (str[i] == '-') {
				if (hi > 0)  { return -1; } // 시간 값 이후 문자 error
				if(dayMark == ' ') { dayMark = '-'; }
				else { return -1; }
			} else if(str[i] == '+') {
				if (hi > 0) { return -1; }
				if (dayMark == ' ') dayMark = '+';
				else { return -1; }
			} else if (str[i] == ' ') {
				if (hi > 0) { return -1; }
				if (dayMark == ' ') { dayMark = ' '; }
                else { return -1; }
			} else { return -1; }
		} else {
			if (!bColon) { hh[hi++] = str[i]; }
            else { mm[mi++] = str[i]; }
		}
	}
	
	
	if (hi == 3 && mi == 0) { // 숫자 3개만 입력 ==> 숫자 4개 입력을 진행중
        mm[0] = hh[2]; hh[2] = ' ';
        mm[1] = '0';
        hi = 2; mi = 1;
    } else if (hi == 4 && mi == 0) {// 숫자4개만 입력시 ==> 시2:분2 로 인정
        mm[0] = hh[2]; hh[2] = ' ';
        mm[1] = hh[3]; hh[3] = ' ';
        hi = 2; mi = 2;
    }
    var h = Number(hh.join(''));
    var m = Number(mm.join(''));
    if(h > 23 || m > 59) { return -1; } // 시값, 분값 정상치 초과
    var hm = (h*60)+m;
	if (dayMark == '-') { return (hm); }
	else if (dayMark == '+') { return (2880 + hm); }
	else { return (1440 + hm); }
}

/**
 *  00:00기준 1일간 HHMM을 분단위 값으로(0분에서 4319분까지)
 * @date 2019. 11. 29.
 * @param <String>  tm <- HH:mm(string), minuteDigit <- 시분 형태 : 소수점 형태 Type 지정
 * @return HH:mm(string)를 분단위로 반환(Number)  
 */
exports.ConvHHMMtoMinute = function(tm) {
	var str = new Array();
	var str = tm.split("");
	
	var length = str.length;
	if(length > 10) return -1;
	
	var dayMark = ' ';
	var hh = new Array();
	var mm = new Array();
	var hi = 0;
	var mi = 0;
	var bColon = false;
	
	for(var i=0; i<length; i++)
	{
		var IsNum = isNaN(str[i]);
		if (IsNum == false && str[i] == ' ') {
			IsNum = true;	// ' ' 공백을 문자로 인식 못함.
		}
		
		if( IsNum == true) { 
			if(str[i] == ':') {
				if(bColon) { return -1; }	//':' 반복 발생.
				else {
					if(hi == 0) { return -1; }	//시간 없음
					bColon = true;
				}
			} else if( str[i] == ' ') {
				if(hi > 0) { return -1; } //시간 값 이후 문자 error
				if( dayMark == null ||dayMark == ' ') { dayMark = ' '; }
				else { return -1; }
			} else { return -1; }
			
		} else {
			if(!bColon) { hh[hi++] = str[i]; }
			else { mm[mi++] = str[i]; }
		}
	}
	
	if (!bColon && mi == 0 ) {
		if(hi == 4) { // 숫자4 개 입력시 -> 시2:분2 인정
			mm[0] = hh[2];
	        mm[1] = hh[3];
	        hi = 2;
	        mi = 2;
		} else {	//시간 값 모두 분처리
			mi = hi;
			mm = hh;
			hh = new Array();
			hi = 0;
		}
	}
	
	var h = Number(hh.join(''));
    var m = Number(mm.join(''));
    if(bColon && m > 59) { return -1; }//분값 정상치 초과
    var hm = (h*60)+m;
    return (hm);
} 

exports.base64ToArrayBuffer = function(base64) {
    base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
    var binaryString = atob(base64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

exports.processImage = function( canvas, srcImage, orientation, maxSize, convert ){
	var ctx = canvas.getContext("2d");
	ctx.save();
    	
	var hRatio = canvas.width / srcImage.width;
	var vRatio = canvas.height / srcImage.height;
	
	var ratio  = Math.min ( hRatio, vRatio );
	var centerShift_x = ( canvas.width - srcImage.width*hRatio ) / 2;
   	var centerShift_y = ( canvas.height - srcImage.height*vRatio ) / 2;
				
   	switch(orientation){
		case 2:          // horizontal flip				            
	        ctx.translate(canvas.width, 0);
	        ctx.scale(-1, 1);
	        break;
	    case 3:
	        // 180° rotate left				            
	        ctx.translate(canvas.width, canvas.height);
	        ctx.rotate(Math.PI);
	        break;
	    case 4:
	        // vertical flip
	        ctx.translate(0, canvas.height);
	        ctx.scale(1, -1);
	        break;
	    case 5:
	        
			if( convert == true ){
				ctx.rotate(0.5 * Math.PI);
	        	ctx.scale(1, -1);
	        	        	
		        var temp = canvas.width;
		        canvas.width = canvas.height;
		        canvas.height = temp;
		        
		        centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
			}else {
	        	if(canvas.width>canvas.height){
	        		canvas.height = canvas.width;
	        	}else{
	        		canvas.width = canvas.height;
	        	}
	        	centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
		   		
		   		ctx.rotate(0.5 * Math.PI);
	        	ctx.scale(1, -1);
	        }
	        break;
	    case 6: // 90° rotate right	    	
			if( convert == true ){
	        	ctx.rotate(0.5 * Math.PI);
	        	ctx.translate(0, -canvas.height);  
	        	        	
		        var temp = canvas.width;
		        canvas.width = canvas.height;
		        canvas.height = temp;
		        
		        centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
	        }else {
	        	if(canvas.width>canvas.height){
	        		canvas.height = canvas.width;
	        	}else{
	        		canvas.width = canvas.height;
	        	}
	        	centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
		   		
		   		ctx.rotate(0.5 * Math.PI);
	        	ctx.translate(0, -canvas.height);  
	        }	 
	        temp = hRatio;
			hRatio = vRatio;
			vRatio = temp;      
				
	        break;
	        
	    case 7:        // horizontal flip + 90 rotate right
			if( convert == true ){
				ctx.rotate(0.5 * Math.PI);
		        ctx.translate(canvas.width, -canvas.height);
		        ctx.scale(-1, 1);
	        	        	
		        var temp = canvas.width;
		        canvas.width = canvas.height;
		        canvas.height = temp;
		        
		        centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
	        }else {
	        	if(canvas.width>canvas.height){
	        		canvas.height = canvas.width;
	        	}else{
	        		canvas.width = canvas.height;
	        	}
	        	centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
		   		
				ctx.rotate(0.5 * Math.PI);
		        ctx.translate(canvas.width, -canvas.height);
		        ctx.scale(-1, 1);
	        }	 
	        temp = hRatio;
			hRatio = vRatio;
			vRatio = temp;      
			
	        break;
	    case 8:	        // 90° rotate left
            if( convert == true ){
	        	ctx.rotate(-0.5 * Math.PI);
	            ctx.translate(-canvas.width, 0);
	        	        	
		        var temp = canvas.width;
		        canvas.width = canvas.height;
		        canvas.height = temp;
		        
		        centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
	        }else {
	        	if(canvas.width>canvas.height){
	        		canvas.height = canvas.width;
	        	}else{
	        		canvas.width = canvas.height;
	        	}
	        	centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
		   		centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;	
		   		
		   		ctx.rotate(-0.5 * Math.PI);
            	ctx.translate(-canvas.width, 0);;
	        }	 
            break;
   	}				    
	
	ctx.drawImage(srcImage, 0,0, srcImage.width, srcImage.height,
		centerShift_x,centerShift_y,srcImage.width*hRatio, srcImage.height*vRatio);
		    	
	var imageSrc = canvas.toDataURL("image/jpeg");
	var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");	
	
	var a = canvas.width;
	var b = canvas.height; 
	canvas.width = 0;
	canvas.height = 0;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
		
	ctx.restore();
		
	if(imageData.length >= maxSize ){		
		return null
	}
	
	return imageSrc;	
}

// from CMC

function showloading() {
	var $this = $(),
    	html = $this.jqmData( "html" ) || "";
    $.mobile.loading( "show", {
        html: html
    });
}

function hideLoading() {
	$.mobile.loading( "hide" );
}
globals.showloading = showloading;

globals.hideLoading = hideLoading;

function getAuthority(value) {
	var type = "";
	switch ( value ){
		case 2: type = "User"; break;
		case 1: type = "Admin"; break;
		default : return "";	
	}
	
	return type;
}

exports.getAuthority = getAuthority;

function getTypeOfUser(value) {
	var type = "";
	switch ( value ){
		case 0: type = "General User"; break;
		default : return "Visitor";	
	}
	
	return type;
}

exports.getTypeOfUser = getTypeOfUser;

var getAuthFunctionType = function(value) {
	
	var type = "";
	switch ( value ){
		case 0: type = "Access"; break;
		case 1: type = "TNA"; break;
		case 2: type = "MEAL"; break;
		default : return "";	
	}
	
	return type;
}
exports.getAuthFunctionType = getAuthFunctionType;

var getAuthFunctionKey = function(value) {
	
	var type = "";
	switch ( value ){
		case 1: type = "F1"; break;
		case 2: type = "F2"; break;
		case 3: type = "출입"; break; // Access
		case 4: type = "F3"; break;
		case 5: type = "F4"; break;
		case 11: type = "출근"; break;
		case 12: type = "퇴근"; break;
		case 13: type = "출입"; break;
		case 14: type = "외출"; break;
		case 15: type = "복귀"; break;
		case 21: type = "Menu1"; break;
		case 22: type = "Menu2"; break;
		case 23: type = "****"; break;
		case 24: type = "Menu3"; break;
		case 25: type = "Menu5"; break;
		case 63: type = "출입"; break;
		default : return "";	
	}
	
	return type;
}
exports.getAuthFunctionKey = getAuthFunctionKey;

 var getEventLogCategory = function (value) {
	var type = "";
	switch ( value ){
		case 1: type = "Terminal"; break;
		case 2: type = "Door"; break;
		case 3: type = "Emergency"; break;
		case 4: type = "ExtnalSignal"; break;
		case 5: type = "System"; break;
		default : return "";	}
	return type;
 }
exports.getEventLogCategory = getEventLogCategory;

var getAuthTypeString = function( value ){
	var type = "";
	switch ( value ){
		case 1: type = "Fingerprint (1:1)"; break;
		case 2: type = "Fingerprint (1:N)"; break;
		case 3: type = "Password"; break;
		case 4: type = "Card"; break;
		case 5: type = "Face (1:1)"; break;
		case 6: type = "Face (1:N)"; break;
		case 7: type = "Mobile Card"; break;
		case 8: type = "QR Code"; break;
	
		default : return "";	}
	return type;
}

exports.getAuthTypeString = getAuthTypeString;


var getLogAuthResultString = function(value) {
	var type = "";
	switch ( value ) {
		case 0 : type = "출입"; break;		
		case 1: type = "근태"; break;
		case 2: type = "근태"; break;
			
		default : type = ""; break;
	}
	return type;
}
exports.getLogAuthResultString = getLogAuthResultString;

exports.buildAuthType = function (authType){
	var andAuth = [];
	for( var idx=0; idx < authType.length; idx++ ){		
		var authType = parseInt(authType[idx], 10);
		if (getAuthTypeString(authType)) {
			andAuth.push(getAuthTypeString(authType));
		}		
	}
	return andAuth.join(", ");
}

var convertTimeString = function (time, unit) {
	if (!time) {
		return;
	}
	var arrayTime = time.split(":");
	var hour = parseInt(arrayTime[0], 10);
	var minute = parseInt(arrayTime[1], 10);
	
	return (hour*60) + minute;
}

var converTimeNumberToString = function (time, unit) {
	
	if (!time) {
		return "";
	}
	
	if (unit === "hour") {
		var hour = Math.floor(time/60) ;
		
		var ex = (time - (hour*60));
		if (ex < 10) {
			ex = "0" + ex;
		}
		return hour + ":" + ex;
	} else if (unit === "0hour"){
		var hour = Math.floor(time/60) ;
		
		var ex = (time - (hour*60));
		if (ex < 10) {
			ex = "0" + ex;
		}
		if (hour < 10){
			hour = "0"+hour;
		}
		return hour + ":" + ex;
	}
}

exports.convertTimeString = convertTimeString;
exports.converTimeNumberToString = converTimeNumberToString;

exports.calculateWorkTimeSideBar = function (time, totalTime) {
	return parseInt((convertTimeString(time)/convertTimeString(totalTime))*100, 10);
}

// 어레이 버퍼를 처리한다 ( 오직 readAsArrayBuffer 데이터만 가능하다 )
exports.fixdata = function(data) {
    var o = "", l = 0, w = 10240;
    for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
    o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
    return o;
}

// 데이터를 바이너리 스트링으로 얻는다.
exports.getConvertDataToBin = function($data){
    var arraybuffer = $data;
    var data = new Uint8Array(arraybuffer);
    var arr = new Array();
    for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
    var bstr = arr.join("");
 
    return bstr;
}
/**
 * 
 * @param {user} user
 * @return boolean
 */
exports.isAdmin = function (user) {
	return true;
}

exports.isStaff = function (user) {
	return true;
}

exports.numberWithCommas = function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getAuthLogContent(value) {
	var type = "";
	switch ( value ){
		// category - Terminal
		case 65537: type = "Disconnected"; break;
		case 65538: type = "Connected"; break;
		case 65539: type = "Locked"; break;
		case 65540: type = "Unlocked"; break;
		case 65541: type = "Tamper"; break;
		case 65542: type = "Attached"; break;
		case 65543: type = "Lockdowned"; break;
		
		// category - door
		case 131073: type = "Str_DoorOpen"; break;
		case 131074: type = "Str_DoorClose"; break;
		case 131075: type = "Str_DoorUnlock"; break;
		case 131076: type = "Str_DoorLock"; break;
		case 131077: type = "Str_DoorForced"; break;
		case 131078: type = "Str_DoorNotClosed"; break;
		case 131079: type = "Str_DoorLockRestored"; break;
		case 131080: type = "Str_DoorLockError"; break;
		case 131081: type = "Str_DoorNotMonitor"; break;
		
		case 131083: type = "Str_DoorCommandOpen"; break;
		case 131084: type = "Str_DoorCommandClose"; break;
		
		case 131088: type = "Str_DoorRemoteOpen"; break;
		case 131089: type = "Str_DoorRemoteUnlock"; break;
		case 131090: type = "Str_DoorRemoteLock"; break;
		case 131091: type = "Str_DoorChange"; break;
		case 131092: type = "Str_DoorIndoorOpen"; break;
		case 131093: type = "Str_Door2Open"; break;
		case 131094: type = "Str_Door2Close"; break;
		case 131095: type = "Str_Door2IndoorOpen"; break;
		case 131096: type = "Str_DoorNotClosedClear"; break;
		
		// category - emergency
		case 196609: type = "Str_EmergencyAlarm"; break;
		case 196610: type = "Str_EmergencyDisarm"; break;
		case 196611: type = "Str_EmergencyFireDetectStart"; break;
		case 196612: type = "Str_EmergencyFireDetectStop"; break;
		case 196613: type = "Str_EmergencyPanicDetectStart"; break;
		case 196614: type = "Str_EmergencyPanicDetectStop"; break;
		case 196615: type = "Str_EmergencyCrisisDetectStart"; break;
		case 196616: type = "Str_EmergencyCrisisDetectStop"; break;
		case 196617: type = "Str_EmergencyBlacklistAttempt"; break;
		case 196624: type = "Str_EmergencyDuress"; break;
		case 196625: type = "Str_EmergencySystemError"; break;
		case 196626: type = "Str_EmergencyDoorEmergency"; break;
		case 196627: type = "Str_EmergencyDoor2"; break;
		case 196628: type = "Str_EmergencyDoor2Emergency"; break;
		case 196629: type = "Str_EmergencyDoor2NotClosedClear"; break;
		case 196630: type = "Str_EmergencyFire"; break;
		case 196631: type = "Str_EmergencyPanic"; break;
		case 196632: type = "Str_EmergencyPanicClear"; break;
		case 196633: type = "Str_EmergencyFireClear"; break;
		case 196640: type = "Str_EmergencyFPSensorAbnormal"; break;
		case 196641: type = "Str_EmergencyDBAbnormal"; break;
		case 196642: type = "Str_EmergencyRTCAbnormal"; break;
		case 196643: type = "Str_EmergencyTouchAbnormal"; break;
		
		// category - external signal
		case 262145: type = "Str_ExtnalSignal1Start"; break;
		case 262146: type = "Str_ExtnalSignal1Stop"; break;
		case 262147: type = "Str_ExtnalSignal2Start"; break;
		case 262148: type = "Str_ExtnalSignal2Stop"; break;
		case 262149: type = "Str_ExtnalSignal3Start"; break;
		case 262150: type = "Str_ExtnalSignal3Stop"; break;
		case 262151: type = "Str_ExtnalSignal4Start"; break;
		case 262152: type = "Str_ExtnalSignal4Stop"; break;
		
		// category - system
		case 327681: type = "Str_SystemFPUpdate"; break;
		case 327682: type = "Str_SystemUIUpdate"; break;
		case 327683: type = "Str_SystemSystemUpdate"; break;
		case 327684: type = "Str_SystemTimeUpdate"; break;
		case 327685: type = "Str_SystemFixedUpdate"; break;
		case 327686: type = "Str_SystemAllUpdate"; break;
		
		default : return "";	
	}
	return type;
}

// -1 : All, 1 : Waiting, 2 : Approved, 3 : denial, 4 : expiration
function getVisitApplicationStatus(value) {
	var type = "";
	switch ( value ) {
		case 1: type = "Pending"; break;		
		case 2: type = "Approved"; break;
		case 3: type = "Denied"; break;
		case 4: type = "Expiration"; break;	
		default : type = ""; break;
	}
	return type;
}

exports.getVisitApplicationStatus = getVisitApplicationStatus;

exports.getAuthLogContent = getAuthLogContent;

exports.getMealType = function(type) {
	var value = "";
	switch ( type ) {
		case 1: value = "아침"; break;	// breakfast	
		case 2: value = "점심"; break; // lunch
		case 3: value = "저녁"; break; // dinner
		case 4: value = "간식"; break;	// snack
		case 5: value = "야식"; break;	 // Midnight Snack
		default : value = ""; break;
	}
	return value;
}

exports.getFormatByteSizeString = function(bytes, fixed) { //2 메가
	if (bytes === 0) {
		return '0 Byte';
	} else if (bytes >= 1024 * 1024) {
		bytes = bytes / (1024 * 1024);
		bytes = (fixed === undefined) ? bytes : bytes.toFixed(fixed);
		return bytes + ' MB';
	}
	//KB 단위 이상일때 KB 단위로 환산
	else if (bytes >= 1024) {
		bytes = bytes / 1024;
		bytes = (fixed === undefined) ? bytes : bytes.toFixed(fixed);
		return bytes + ' KB';
	}
	//KB 단위보다 작을때 byte 단위로 환산
	else {
		bytes = (fixed === undefined) ? bytes : bytes.toFixed(fixed);
		return bytes + ' byte';
	}
}

exports.getExtensionOfFilename = function(filename) {
    var _fileLen = filename.length;
    var _lastDot = filename.lastIndexOf('.');
    var _fileExt = filename.substring(_lastDot+1, _fileLen).toLowerCase();
 
    return _fileExt;
}

exports.comboboxItemReverse = function(combCnt) {
	var items = combCnt.getItems();
	combCnt.deleteAllItems();
	for (var i=(items.length-1); i >= 0; i--) {
		combCnt.addItem(items[i]);	
	}
}

/*
 * tnaResult 객체의 DayofWeek(요일) 컬럼을 다국어로 표현하기 위한 함수.
 * 예) Tue => 화요일
 * 파라미터: 데이터셋 리스트(tnaResultList), dataManager 
 */
exports.setDayofWeekLangMapping = function(dsList, dataManager){
	for (var i = 0; i < dsList.getRowCount(); i++) {
		
		switch (dsList.getValue(i, "DayofWeek")) {
			case "Mon":
				dsList.setValue(i, "DayofWeek", dataManager.getString("Str_MonDay"))
				break;
			case "Tue":
				dsList.setValue(i, "DayofWeek", dataManager.getString("Str_TuesDay"))
				break;
			case "Wen":
				dsList.setValue(i, "DayofWeek", dataManager.getString("Str_Wednesday"))
				break;
			case "Thu":
				dsList.setValue(i, "DayofWeek", dataManager.getString("Str_ThursDay"))
				break;
			case "Fri":
				dsList.setValue(i, "DayofWeek", dataManager.getString("Str_FriDay"))
				break;
			case "Sat":
				dsList.setValue(i, "DayofWeek", dataManager.getString("Str_SaturDay"))
				break;
			case "Sun":
				dsList.setValue(i, "DayofWeek", dataManager.getString("Str_SunDay"))
				break;
		}
	}
	
	return dsList
}
//
function thousandsSeparator(Number) {
	return Number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
exports.thousandsSeparator = thousandsSeparator;
cpr.expression.ExpressionEngine.INSTANCE.registerFunction("thousandsSeparator", thousandsSeparator);

/*
 * 시작일 ~ 종료일 유효성 확인
 */
exports.isStartEndDateValid = function(startDateValue, endDateValue){
	startDateValue = startDateValue.replaceAll('-','').replaceAll('.','').replaceAll(' ','');
	endDateValue = endDateValue.replaceAll('-','').replaceAll('.','').replaceAll(' ','');
	if (Number(endDateValue) < Number(startDateValue)) {
		return false;
	}
	return true;
}


// 실제 초과근무시간 계산
var ActualOverTime = function(tnaResultList){
	var cnt = tnaResultList.getRowCount();
	var actualOverTime;

	for (var i=0; i<cnt; i++){
		var row = tnaResultList.getRow(i);
		var Wt2Time = convertTimeString(row.getValue("Wt2Time"));
		var Wt3Time = convertTimeString(row.getValue("Wt3Time"));
		var Wt4Time = convertTimeString(row.getValue("Wt4Time"));
		var Wt5Time = convertTimeString(row.getValue("Wt5Time"));
		var Wt6Time = convertTimeString(row.getValue("Wt6Time"));
		var s = Wt2Time + Wt3Time + Wt4Time + Wt5Time + Wt6Time ;
	
		actualOverTime = converTimeNumberToString(s,"0hour");
		if(actualOverTime == ""){
			actualOverTime = "#--:--";
		}
		row.setValue("ActualOverTime", actualOverTime);
		console.log(row.getString("ActualOverTime"));
	}

//	dsTnaResultList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	return tnaResultList
}

exports.ActualOverTime = ActualOverTime;