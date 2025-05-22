/************************************************
 * Utils.module.js
 * Created at Sep 14, 2020 2:04:19 PM.
 *
 * @author EVN0025
 ************************************************/
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
		case 2: type = cpr.I18N.INSTANCE.message("Str_NormalUser"); break;
		case 1: type = cpr.I18N.INSTANCE.message("Str_Admin"); break;
		default : return "";	
	}
	
	return type;
}

exports.getAuthority = getAuthority;

function getTypeOfUser(value) {
	var type = "";
	switch ( value ){
		case 0: type = cpr.I18N.INSTANCE.message("Str_User"); break;
		default : return cpr.I18N.INSTANCE.message("Str_Visitor");	
	}
	
	return type;
}

exports.getTypeOfUser = getTypeOfUser;

var getAuthFunctionType = function(value) {
	
	var type = "";
	switch ( value ){
		case 0: type = cpr.I18N.INSTANCE.message("Str_AuthLogFuncTypeAccess"); break;
		case 1: type = cpr.I18N.INSTANCE.message("Str_AuthLogFuncTypeTna"); break;
		case 2: type = cpr.I18N.INSTANCE.message("Str_AuthLogFuncTypeMeal"); break;
		default : return "";	
	}
	
	return type;
}
exports.getAuthFunctionType = getAuthFunctionType;

var getAuthFunctionKey = function(value) {
	
	var type = "";
	switch ( value ){
		case 1: type = cpr.I18N.INSTANCE.message("Str_FKeyF1"); break;
		case 2: type = cpr.I18N.INSTANCE.message("Str_FKeyF2"); break;
		case 3: type = cpr.I18N.INSTANCE.message("Str_FKeyAccess"); break; // Access
		case 4: type = cpr.I18N.INSTANCE.message("Str_FKeyF3"); break;
		case 5: type = cpr.I18N.INSTANCE.message("Str_FKeyF4"); break;
		case 11: type = cpr.I18N.INSTANCE.message("Str_FKeyAttend"); break;
		case 12: type = cpr.I18N.INSTANCE.message("Str_FKeyLeave"); break;
		case 13: type = cpr.I18N.INSTANCE.message("Str_FKeyAccess"); break;
		case 14: type = cpr.I18N.INSTANCE.message("Str_FKeyOut"); break;
		case 15: type = cpr.I18N.INSTANCE.message("Str_FKeyIn"); break;
		case 21: type = cpr.I18N.INSTANCE.message("Str_FKeyMenu1"); break;
		case 22: type = cpr.I18N.INSTANCE.message("Str_FKeyMenu2"); break;
		case 23: type = cpr.I18N.INSTANCE.message("Str_FKeyMenu5"); break;
		case 24: type = cpr.I18N.INSTANCE.message("Str_FKeyMenu3"); break;
		case 25: type = cpr.I18N.INSTANCE.message("Str_FKeyMenu4"); break;
		default : return "";	
	}
	
	return type;
}
exports.getAuthFunctionKey = getAuthFunctionKey;

 var getEventLogCategory = function (value) {
	var type = "";
	switch ( value ){
		case 1: type = cpr.I18N.INSTANCE.message("Str_Terminal"); break;
		case 2: type = cpr.I18N.INSTANCE.message("Str_Door"); break;
		case 3: type = cpr.I18N.INSTANCE.message("Str_Emergency"); break;
		case 4: type = cpr.I18N.INSTANCE.message("Str_ExtnalSignal"); break;
		case 5: type = cpr.I18N.INSTANCE.message("Str_System"); break;
		default : return "";	}
	return type;
 }
exports.getEventLogCategory = getEventLogCategory;


var getAuthTypelistString = function (value) {
	var type = "";
	switch ( value ){
		case 1: type = cpr.I18N.INSTANCE.message("Str_AuthTypeFPVerify"); break;
		case 2: type = cpr.I18N.INSTANCE.message("Str_AuthTypeFPIdentify"); break;
		case 3: type = cpr.I18N.INSTANCE.message("Str_Password"); break;
		case 4: type = cpr.I18N.INSTANCE.message("Str_Card"); break;
		case 5: type = cpr.I18N.INSTANCE.message("Str_AuthTypeFaceVerify"); break;
		case 6: type = cpr.I18N.INSTANCE.message("Str_AuthTypeFaceIdentify"); break;
		case 7: type = cpr.I18N.INSTANCE.message("Str_MobileCard"); break;
		case 8: type = cpr.I18N.INSTANCE.message("Str_Iris"); break;
		case 9: type = cpr.I18N.INSTANCE.message("Str_Face"); break;
		case 13: type = cpr.I18N.INSTANCE.message("Str_Fail"); break;
		default : return "";	}
	return type;
 }
exports.getAuthTypelistString = getAuthTypelistString;


var getAuthTypeString = function( value ){
	var type = "";
	switch ( value ){
		case 1: type = cpr.I18N.INSTANCE.message("Str_AuthTypeFPVerify"); break;
		case 2: type = cpr.I18N.INSTANCE.message("Str_AuthTypeFPIdentify"); break;
		case 3: type = cpr.I18N.INSTANCE.message("Str_Password"); break;
		case 4: type = cpr.I18N.INSTANCE.message("Str_Card"); break;
		case 5: type = cpr.I18N.INSTANCE.message("Str_AuthTypeFaceVerify"); break;
		case 6: type = cpr.I18N.INSTANCE.message("Str_AuthTypeFaceIdentify"); break;
		case 7: type = cpr.I18N.INSTANCE.message("Str_MobileCard"); break;
		case 8: type = cpr.I18N.INSTANCE.message("Str_Iris"); break;
		case 9: type = cpr.I18N.INSTANCE.message("Str_Face"); break;
		case 13: type = cpr.I18N.INSTANCE.message("Str_Fail"); break;
		case 9999: type = "LPR"; break;
		default : return "";	}
	return type;
}

exports.getAuthTypeString = getAuthTypeString;


var getLogAuthResultString = function(value) {
	var type = "";
	switch ( value ) {
		case 0 : type = cpr.I18N.INSTANCE.message("Str_AuthLogFuncTypeAccess"); break;		
		case 1: type = cpr.I18N.INSTANCE.message("Str_AuthLogFuncTypeTna"); break ;
		case 2: type = cpr.I18N.INSTANCE.message("Str_AuthLogFuncTypeTnabreak");
			
		default : type = ""; break;
	}
	return type;
}
exports.getLogAuthResultString = getLogAuthResultString;

exports.buildAuthType = function (authType){
	var authTypeA = authType.split(',');
	var andAuth = [];
	for( var idx=0; idx < 7; idx++ ){		
		var authNum = parseInt(authTypeA[idx], 10);
		if(authNum !== 0){
		andAuth.push(getAuthTypeString(authNum));
		}
	}
	var AndOr = "";
	if(authTypeA[7] == 0){
		AndOr = " (OR)";
	} else {
		AndOr = " (AND)";
	}
	return andAuth.join(" ") + AndOr;
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
		case 65537: type = cpr.I18N.INSTANCE.message("Str_Disconnected"); break;
		case 65538: type = cpr.I18N.INSTANCE.message("Str_Connected"); break;
		case 65539: type = cpr.I18N.INSTANCE.message("Str_Locked"); break;
		case 65540: type = cpr.I18N.INSTANCE.message("Str_Unlocked"); break;
		case 65541: type = cpr.I18N.INSTANCE.message("Str_Tamper"); break;
		case 65542: type = cpr.I18N.INSTANCE.message("Str_Attached"); break;
		case 65543: type = cpr.I18N.INSTANCE.message("Str_Lockdowned"); break;
		
		// category - door
		case 131073: type = cpr.I18N.INSTANCE.message("Str_DoorOpen"); break;
		case 131074: type = cpr.I18N.INSTANCE.message("Str_DoorClose"); break;
		case 131075: type = cpr.I18N.INSTANCE.message("Str_DoorUnlock"); break;
		case 131076: type = cpr.I18N.INSTANCE.message("Str_DoorLock"); break;
		case 131077: type = cpr.I18N.INSTANCE.message("Str_DoorForced"); break;
		case 131078: type = cpr.I18N.INSTANCE.message("Str_DoorNotClosed"); break;
		case 131079: type = cpr.I18N.INSTANCE.message("Str_DoorLockRestored"); break;
		case 131080: type = cpr.I18N.INSTANCE.message("Str_DoorLockError"); break;
		case 131081: type = cpr.I18N.INSTANCE.message("Str_DoorNotMonitor"); break;
		
		case 131083: type = cpr.I18N.INSTANCE.message("Str_DoorCommandOpen"); break;
		case 131084: type = cpr.I18N.INSTANCE.message("Str_DoorCommandClose"); break;
		
		case 131088: type = cpr.I18N.INSTANCE.message("Str_DoorRemoteOpen"); break;
		case 131089: type = cpr.I18N.INSTANCE.message("Str_DoorRemoteUnlock"); break;
		case 131090: type = cpr.I18N.INSTANCE.message("Str_DoorRemoteLock"); break;
		case 131091: type = cpr.I18N.INSTANCE.message("Str_DoorChange"); break;
		case 131092: type = cpr.I18N.INSTANCE.message("Str_DoorIndoorOpen"); break;
		case 131093: type = cpr.I18N.INSTANCE.message("Str_Door2Open"); break;
		case 131094: type = cpr.I18N.INSTANCE.message("Str_Door2Close"); break;
		case 131095: type = cpr.I18N.INSTANCE.message("Str_Door2IndoorOpen"); break;
		case 131096: type = cpr.I18N.INSTANCE.message("Str_DoorNotClosedClear"); break;
		
		// category - emergency
		case 196609: type = cpr.I18N.INSTANCE.message("Str_EmergencyAlarm"); break;
		case 196610: type = cpr.I18N.INSTANCE.message("Str_EmergencyDisarm"); break;
		case 196611: type = cpr.I18N.INSTANCE.message("Str_EmergencyFireDetectStart"); break;
		case 196612: type = cpr.I18N.INSTANCE.message("Str_EmergencyFireDetectStop"); break;
		case 196613: type = cpr.I18N.INSTANCE.message("Str_EmergencyPanicDetectStart"); break;
		case 196614: type = cpr.I18N.INSTANCE.message("Str_EmergencyPanicDetectStop"); break;
		case 196615: type = cpr.I18N.INSTANCE.message("Str_EmergencyCrisisDetectStart"); break;
		case 196616: type = cpr.I18N.INSTANCE.message("Str_EmergencyCrisisDetectStop"); break;
		case 196617: type = cpr.I18N.INSTANCE.message("Str_EmergencyBlacklistAttempt"); break;
		case 196624: type = cpr.I18N.INSTANCE.message("Str_EmergencyDuress"); break;
		case 196625: type = cpr.I18N.INSTANCE.message("Str_EmergencySystemError"); break;
		case 196626: type = cpr.I18N.INSTANCE.message("Str_EmergencyDoorEmergency"); break;
		case 196627: type = cpr.I18N.INSTANCE.message("Str_EmergencyDoor2"); break;
		case 196628: type = cpr.I18N.INSTANCE.message("Str_EmergencyDoor2Emergency"); break;
		case 196629: type = cpr.I18N.INSTANCE.message("Str_EmergencyDoor2NotClosedClear"); break;
		case 196630: type = cpr.I18N.INSTANCE.message("Str_EmergencyFire"); break;
		case 196631: type = cpr.I18N.INSTANCE.message("Str_EmergencyPanic"); break;
		case 196632: type = cpr.I18N.INSTANCE.message("Str_EmergencyPanicClear"); break;
		case 196633: type = cpr.I18N.INSTANCE.message("Str_EmergencyFireClear"); break;
		case 196640: type = cpr.I18N.INSTANCE.message("Str_EmergencyFPSensorAbnormal"); break;
		case 196641: type = cpr.I18N.INSTANCE.message("Str_EmergencyDBAbnormal"); break;
		case 196642: type = cpr.I18N.INSTANCE.message("Str_EmergencyRTCAbnormal"); break;
		case 196643: type = cpr.I18N.INSTANCE.message("Str_EmergencyTouchAbnormal"); break;
		
		// category - external signal
		case 262145: type = cpr.I18N.INSTANCE.message("Str_ExtnalSignal1Start"); break;
		case 262146: type = cpr.I18N.INSTANCE.message("Str_ExtnalSignal1Stop"); break;
		case 262147: type = cpr.I18N.INSTANCE.message("Str_ExtnalSignal2Start"); break;
		case 262148: type = cpr.I18N.INSTANCE.message("Str_ExtnalSignal2Stop"); break;
		case 262149: type = cpr.I18N.INSTANCE.message("Str_ExtnalSignal3Start"); break;
		case 262150: type = cpr.I18N.INSTANCE.message("Str_ExtnalSignal3Stop"); break;
		case 262151: type = cpr.I18N.INSTANCE.message("Str_ExtnalSignal4Start"); break;
		case 262152: type = cpr.I18N.INSTANCE.message("Str_ExtnalSignal4Stop"); break;
		
		// category - system
		case 327681: type = cpr.I18N.INSTANCE.message("Str_SystemFPUpdate"); break;
		case 327682: type = cpr.I18N.INSTANCE.message("Str_SystemUIUpdate"); break;
		case 327683: type = cpr.I18N.INSTANCE.message("Str_SystemSystemUpdate"); break;
		case 327684: type = cpr.I18N.INSTANCE.message("Str_SystemTimeUpdate"); break;
		case 327685: type = cpr.I18N.INSTANCE.message("Str_SystemFixedUpdate"); break;
		case 327686: type = cpr.I18N.INSTANCE.message("Str_SystemAllUpdate"); break;
		
		default : return "";	
	}
	return type;
}

// -1 : All, 1 : Waiting, 2 : Approved, 3 : denial, 4 : expiration
function getVisitApplicationStatus(value) {
	var type = "";
	switch ( value ) {
		case 1: type = cpr.I18N.INSTANCE.message("Str_VisitRequestWaiting"); break;		
		case 2: type = cpr.I18N.INSTANCE.message("Str_VisitRequestApproval"); break;
		case 3: type = cpr.I18N.INSTANCE.message("Str_VisitRequestDeny"); break;
		case 4: type = cpr.I18N.INSTANCE.message("Str_VisitRequestExpired"); break;	
		default : type = ""; break;
	}
	return type;
}

exports.getVisitApplicationStatus = getVisitApplicationStatus;

exports.getAuthLogContent = getAuthLogContent;

exports.getMealType = function(type) {
	var value = "";
	switch ( type ) {
		case 1: value = cpr.I18N.INSTANCE.message("Str_BreakFast"); break;	// breakfast	
		case 2: value = cpr.I18N.INSTANCE.message("Str_Lunch"); break; // lunch
		case 3: value = cpr.I18N.INSTANCE.message("Str_Dinner"); break; // dinner
		case 4: value = cpr.I18N.INSTANCE.message("Str_Snack"); break;	// snack
		case 5: value = cpr.I18N.INSTANCE.message("Str_LateSnack"); break;	 // Midnight Snack
		default : value = ""; break;
	}
	return value;
}

// 키오스크용. 로컬스토리지 데이타 삭제
globals.removeStepData = function() {
	localStorage.removeItem("step1Data");
	localStorage.removeItem("step2Data");
	localStorage.removeItem("step3Data");
}



/*  mjy
 * 단말 원격 확장 -  단말이 지원하지 않는 기능이라면 비활성화
 * dm 컬럼값에 따라 바인딩된 컨트롤 enabled 제어 , 
 */ 

/**
 *  단말 원격 확장 -  단말이 지원하지 않는 기능이라면 비활성화
 * @date 2023. 12. 05.
 */
globals.setEmbAppInnerControlEnable = function(/*cpr.core.AppInstance*/ app, /*cpr.data.DataMap*/ dm, /*string*/ pagePrefix ) {
	// 단말에 key값이 안 온 경우 비활성화
	var dmCount = dm.getColumnCount();
	var colNames = dm.getColumnNames();
	var colName = "";
	var colType;
	for (var i=0; i<dmCount; i++) {
		colName = colNames[i];
		colType = dm.getHeader(colName).getDataType();
		if (colType == cpr.data.tabledata.DataType.STRING) {
			if(dm.getValue(colName) == "x") {
				var appName = pagePrefix + "_" + colName; // "prefix_dmColumn"
				var appControl = app.lookup(appName);
				if (appControl != undefined || appControl != null) {
					app.lookup(appName).enabled = false;
				} 
			}
		}
		if (colType ==  cpr.data.tabledata.DataType.NUMBER) {
			if(dm.getValue(colName) == -1) {
				var appName = pagePrefix + "_" + colName;
				var appControl = app.lookup(appName);
				if (appControl != undefined || appControl != null) {
					app.lookup(appName).enabled = false;
				} 
			}
		}
	}
	
}

exports.ConfirmMultiViewSetting = function(/*cpr.data.DataMap*/ dm) {
	
	var vmsId = dm.getValue("VmsID");
	var apiurl = dm.getValue("VurixApiURL");
	var vurixid = dm.getValue("VurixID");
	var vurixPw = dm.getValue("VurixPass");
	var vurixGroup = dm.getValue("VurixGroup");
	
	if(vmsId.length < 1) {
		return false;
	} else if(apiurl.length < 1) {
		return false;
	} else if(vurixid.length < 1) {
		return false;
	} else if(vurixPw.length < 1) {
		return false;
	} else if(vurixGroup.length < 1) {
		return false;
	} else {
		return true
	}
}

