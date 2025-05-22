/************************************************
 * userFingerRegist.js
 * Created at 2018. 10. 16. 오후 1:08:47.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

var deviceWebSocket;
var USFPR_duressFinger = [];

var USFPR_templateIndex = 0;
var USFPR_fingerID = 0;
// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	app.lookup("USFPR_imgfinger_1").userAttr("fid", "1");
	app.lookup("USFPR_imgfinger_2").userAttr("fid", "2");
	app.lookup("USFPR_imgfinger_3").userAttr("fid", "3");
	app.lookup("USFPR_imgfinger_4").userAttr("fid", "4");
	app.lookup("USFPR_imgfinger_5").userAttr("fid", "5");
	app.lookup("USFPR_imgfinger_6").userAttr("fid", "6");
	app.lookup("USFPR_imgfinger_7").userAttr("fid", "7");
	app.lookup("USFPR_imgfinger_8").userAttr("fid", "8");
	app.lookup("USFPR_imgfinger_9").userAttr("fid", "9");
	app.lookup("USFPR_imgfinger_10").userAttr("fid", "10");
	
	connectDeviceServer("127.0.0.1:9600");
		
	var udcTerminalList = app.lookup("USFPR_udcTerminalList");	
	udcTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
		
	var submission = app.lookup("sms_getUserFPInfo");
	var initValue = app.getHost().initValue;
	var userID = initValue["UserID"];
	var dmFPInfo = app.lookup("dm_FPInfo");
	dmFPInfo.setValue("userID",userID)
				
	submission.action = "/v1/users/"+userID+"/fingerPrint";
	submission.send();	
	USFPR_duressFinger = initValue["DuressFinger"];	
}

// 서브미션에서 submit-done 이벤트 발생 시 호출.
function onSms_getUserFPInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_getUserFPInfo = e.control;
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == 0){	
		refreshFPInfo();
	} else {	
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));		
	}
}

// 서브미션에서 submit-error 이벤트 발생 시 호출.
function onSms_getUserFPInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",-1)
}

// 서브미션에서 submit-timeout 이벤트 발생 시 호출.
function onSms_getUserFPInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",-2)
}

// Body에서 unload 이벤트 발생 시 호출.
function onBodyUnload(/* cpr.events.CEvent */ e){
	if(deviceWebSocket != null){
		deviceWebSocket.close();
		deviceWebSocket = null;
	}	
}

function connectDeviceServer(address){    
    
    //deviceWebSocket = new WebSocket("ws://127.0.0.1:9600/v1/webEntry");
    deviceWebSocket = new WebSocket("wss://"+address+"/v1/webEntry");
        
    deviceWebSocket.onopen = function(message){                
        console.log("device server ws connected.");
    };

    deviceWebSocket.onclose = function(message){
    	deviceWebSocket = null;
        console.log("\Server disconnect...");
    };

    deviceWebSocket.onerror = function(message){
        console.log("error... " + message);
    };

    deviceWebSocket.onmessage = function(message){
        
        var msg = JSON.parse(message.data);
        console.log("onmessage : "+msg.msgId);
        switch( msg.msgId){
            case WSCmdFPCaptureImageCallback: { // 캡쳐 이미지 수신.	
                var imageInfo = JSON.parse(msg.body);
                var imageCtrl;
                if(USFPR_templateIndex == 0 ){
				 	imageCtrl = app.lookup("USFPR_imgFPDisplay_1");
				} else {
					imageCtrl = app.lookup("USFPR_imgFPDisplay_2");
				}
                imageCtrl.src = 'data:image/jpeg;base64,' + imageInfo.imageData;
            } break;
            
            case WSCmdFPCaptureRes:{ // 캡쳐 완료. 결과 수신. 
                
                var result = JSON.parse(msg.body);
                console.log(msg.body);
                /*
                var dsFPInfo = app.lookup("UserFPInfo");
                var existRow = dsFPInfo.findFirstRow("Index == '" + result["FingerIndex"]+"'");
                if( existRow != null ){
                	dsFPInfo.realDeleteRow(existRow.getIndex());                	
                }
                dsFPInfo.addRowData({
                	"FingerID":result["FingerIndex"],
                	"MinConvType":3,
                	"TemplateIndex":0,
                	"TemplateData":result["FingerData"]
                });
                * */
                if(USFPR_templateIndex == 0 ){
	                USFPR_templateIndex = 1;
	                var dmFPInfo = app.lookup("dm_FPInfo");				
					var userID = dmFPInfo.getValue("userID");
					var fingerID = dmFPInfo.getValue("fingerID");
					dmFPInfo.setValue("Template1", result["FingerData"]);
					onFPCaptureReq(userID,fingerID);
				} else if ( USFPR_templateIndex == 1 ){ // 두개의 템플릿에 대해 매칭 시도
					var dmFPInfo = app.lookup("dm_FPInfo");
					dmFPInfo.setValue("Template2", result["FingerData"]);
					var userID = dmFPInfo.getValue("userID");
					var template_1 = dmFPInfo.getValue("Template1");
					var template_2 = dmFPInfo.getValue("Template2");
					onFPVerifyReq(userID,template_1,template_2);
				}
                //console.log(dsFPInfo.getRowDataRanged());
            }break;
            
            case WSCmdFPVerifyRes:
            	console.log(msg)
            break;
            
            default: console.log(msg); break;
        }
    }
}

function onFPCaptureReq(uid,fingerIdx){	
	var brandType = ( dataManager.getBrandType() == BRAND_NITGEN) ?"NITGEN":"VIRDI";	
	deviceWebSocket.send('{"msgId":"'+WSCmdFPCaptureReq+'","body":{"UserId":"'+uid+'","ImageType":"JPG","BrandType":"'+brandType+'","FingerIndex":'+fingerIdx+'}}'); // RAW,JPG,BMP
}

function onFPVerifyReq(uid,template_1,template_2){	
	var brandType = ( dataManager.getBrandType() == BRAND_NITGEN) ?"NITGEN":"VIRDI";	
	deviceWebSocket.send('{"msgId":"'+WSCmdFPVerifyReq+'","body":{"UserId":"'+uid+'","BrandType":"'+brandType+'","Template1":"'+template_1+'","Template2":"'+template_2+'"}}');
}

/*
 * 이미지에서 contextmenu 이벤트 발생 시 호출.
 * 마우스의 오른쪽 버튼이 클릭되거나 컨텍스트 메뉴 키가 눌려지면 호출되는 이벤트.
 */
function onImageContextmenu(/* cpr.events.CMouseEvent */ e){
	
	/* @type cpr.controls.Image */
	var image = e.control;
	e.preventDefault();
	
	var fingerID = image.userAttr("fid");
	var dsUserFPInfo = app.lookup("UserFPInfo");
	
	var fpInfo = dsUserFPInfo.findFirstRow("FingerID == "+parseInt(fingerID));
	
	var dsFingerMenu;
	if( fpInfo ){
		dsFingerMenu = app.lookup("dsFingerModifyMenu");
	} else {
		dsFingerMenu = app.lookup("dsFingerRegistMenu");
	}
	
		
	var contextMenu = new cpr.controls.Menu();
	contextMenu.setItemSet(dsFingerMenu, {
		label: "label",
		value: "value",
		parentValue: "parent"
	});
	contextMenu.addEventListener("selection-change", function(e) {
		
		var menu = e.control;
		/* @type cpr.controls.Output */
		var selectValue = menu.value;
		switch (selectValue){
			case "regist":
				var dmFPInfo = app.lookup("dm_FPInfo");				
				var userID = dmFPInfo.getValue("userID");
				dmFPInfo.setValue("fingerID",fingerID);
				dmFPInfo.setValue("Template1","");		
				dmFPInfo.setValue("Template2","");
				
				USFPR_templateIndex = 0; // 첫번째 템플릿 요청
				onFPCaptureReq(userID,fingerID);
				break;
			case "delete":
				console.log("delete");
				//지문 삭제시 협박지문도 삭제
				break;
			case "duressOn":
				console.log("duressOn");
				break;
			case "duressOff":
				console.log("duressOff");
				break;
		}
		
		menu.dispose();
	});
	var rect = app.getActualRect();
	contextMenu.style.css({
		left: (e.clientX - rect.left) + "px",
		top: (e.clientY - rect.top) + "px",
		height: "200px",
		width: "200px",
		position: "absolute"
	});
	contextMenu.focus();
	contextMenu.addEventListener("blur", function(e) {
		contextMenu.dispose();
	});
	app.floatControl(contextMenu);
}

function refreshFPInfo(){
	var dsUserFPInfo = app.lookup("UserFPInfo");
	var count = dsUserFPInfo.getRowCount();
	for ( var i = 0; i <count; i++ ){
		var fpInfo = dsUserFPInfo.getRow(i);
		var ctrlName = "USFPR_imgfinger_"+fpInfo.getValue("FingerID");
		var imgFinger = app.lookup(ctrlName);
		imgFinger.src = "theme/images/fingerRegistration/user_fingerprint_img_enrollment_normal.png";
		if(USFPR_duressFinger && len(USFPR_duressFinger)>0){		
			USFPR_duressFinger.forEach(function(idx){
				if(fpInfo.getValue("FingerID")==idx ){
					imgFinger.src = "theme/images/fingerRegistration/user_fingerprint_img_enrollment_warning.png";
					return;
				}			
			});
		}
	}
}

// "적용" 버튼에서 click 이벤트 발생 시 호출.
function onUSFPR_btnApplyClick(/* cpr.events.CMouseEvent */ e){	
	var dsFPInfo = app.lookup("UserFPInfo");
	app.close(dsFPInfo.getRowDataRanged());
}
