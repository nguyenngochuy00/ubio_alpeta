/************************************************
 * BPARKQRcode.js
 * Created at 2022. 6. 3. 오전 12:30:34.
 *
 * @author zxc
 ************************************************/

var CloseTimer = 21;

function onBodyLoad(/* cpr.events.CEvent */ e){
	console.log("qrcode");
	var initValue = app.getHost().initValue;
	var payooQRCodeURI = initValue["payooQRCodeURI"];
	var payooQRCodeURL = initValue["payooQRCodeURL"];
	
	var objQRcode = app.lookup("BPARK_objQRCode");
	
//	if (payooQRCodeURI.toString().length > 0) {
//		objQRcode.data = payooQRCodeURI;
//	} else if (payooQRCodeURL.toString().length > 0) {
//		objQRcode.data = payooQRCodeURL;
//	}
//	
	if (payooQRCodeURL.toString().length > 0) {
		objQRcode.data = payooQRCodeURL;
	} else if (payooQRCodeURI.toString().length > 0) {
		objQRcode.data = payooQRCodeURI;
	}
	
	QRcodeAutoClose();
}

function QRcodeAutoClose(){
	if(CloseTimer == 1){
		app.close("QRCodeTimeOut");
	}else{
		CloseTimer--;
		app.lookup("BQR_optTimer").value = CloseTimer;
		setTimeout(function(){ 
			QRcodeAutoClose();
		}, 1000);
	}
}


