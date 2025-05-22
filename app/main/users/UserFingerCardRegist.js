/************************************************
 * UserFingerCardRegist.js
 * Created at 2020. 9. 25. 오후 4:48:40.
 *
 * @author joymrk
 ************************************************/
/*
 * 1. 카드레이아웃 정보가져오기 
 * 2. 등록된 카드 값 가져오기 (가져올필요 없지 )
 * 3. 등록된 지문값 가져오기
 * 4. 지문없으면 등록하게 하기
 * 5. 카드 무조건 라이팅
 */
var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;
var deviceWebSocket;
var USFCR_duressFinger = []; // 서버에서 사용자 지문 최초 수신시만 적용. 이후에는 UserFPInfo의 값으로만 판단

var USFCR_templateIndex = 0;
var USFCR_fingerID = 0;
var USFCR_url;
var USFCR_fpMax;
var USFCR_mode; // 체크 다시 한다.
var USFCR_FPModified = 0; //기본 0
var brandType = BRAND_VRIDI;
var USFCR_userID=0;
var USFCR_result = 0; //0 init , 1 add
var USFCR_templateFormat = 3; //3 UNION , 36 ISO Standard
/*
 * 기본 정보 세팅
 */
function InitData() { 
	dataManager = getDataManager();
	comLib = createComUtil(app);
	USFCR_result =0;
	app.lookup("USFCR_imgfinger_1").userAttr("fid", "1");
	app.lookup("USFCR_imgfinger_2").userAttr("fid", "2");
	app.lookup("USFCR_imgfinger_3").userAttr("fid", "3");
	app.lookup("USFCR_imgfinger_4").userAttr("fid", "4");
	app.lookup("USFCR_imgfinger_5").userAttr("fid", "5");
	app.lookup("USFCR_imgfinger_6").userAttr("fid", "6");
	app.lookup("USFCR_imgfinger_7").userAttr("fid", "7");
	app.lookup("USFCR_imgfinger_8").userAttr("fid", "8");
	app.lookup("USFCR_imgfinger_9").userAttr("fid", "9");
	app.lookup("USFCR_imgfinger_10").userAttr("fid", "10");
	
	USFCR_templateFormat = dataManager.getClientOption().getValue("TemplateFormat");
	var link = app.lookup("USFCR_sniDownloadLink");
	link.value=	"<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">"+dataManager.getString("Str_DeviceServerDownloadPath")+"</a>";
	app.lookup("USFCR_opbMessage").value = dataManager.getString("Str_HamsterConnectTry");
}
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	InitData();
	USFCR_fpMax = dataManager.getClientOption().getValue("FpRegMax");
	brandType = ( dataManager.getSystemBrandType() == BRAND_NITGEN) ?"NITGEN":"VIRDI";
	connectDeviceServer("127.0.0.1:9600");
	//--------------------------------------------------------------------------------
	var initValue = app.getHost().initValue;
	USFCR_userID = initValue["ID"];
	USFCR_url = initValue["Url"];	//"Url":"/v1",
	USFCR_duressFinger = initValue["DuressFinger"];
	USFCR_FPModified = initValue["fpmodified"];	// "fpmodified": USINT_fpModified,
	var dsInitUserCardData = initValue["UserCardInfo"]; 
	//--------------------------------------------------------------------<getInitValue
	setCardInfo(dsInitUserCardData); //기존등록된 카드 정보를 설정하는기능 제거해도 되면 추후 제외
	//--------------------------------------------------------------------< setCardInfo
	getCardLayout();	//무조건 카드레아웃 먼저 가져오도록 수정  
}

function getCardLayout() {
	comLib.showLoadMask("",dataManager.getString("Str_CardLayout"),"",0);
	var smsGetCardLayout = app.lookup("sms_getCardLayoutInfo");
	smsGetCardLayout.action = USFCR_url+"/cardLayout";
	smsGetCardLayout.send();	
}

function setCardInfo(hostUserCardData) {
	var dsUserCardInfo = app.lookup("UserCardInfo");
	dsUserCardInfo.clear();
	for( var i = 0; i < hostUserCardData.getRowCount(); i++ ){
		var cardInfo = hostUserCardData.getRow(i);
		if( cardInfo == null || cardInfo.getValue("CardNum")==""){
			hostUserCardData.deleteRow(i);									
		}
	}
	hostUserCardData.commit();
	hostUserCardData.copyToDataSet(dsUserCardInfo);
}
function setFpInfo(hostFpData) {
	var dmFPInfo = app.lookup("dm_FPInfo");
	dmFPInfo.setValue("UserID",USFCR_userID);	
	var dsUserFPInfo = app.lookup("UserFPInfo");
	dsUserFPInfo.clear();
	hostFpData.copyToDataSet(dsUserFPInfo);			
	if(USFCR_duressFinger && USFCR_duressFinger.length>0){
		var dsFPInfo = app.lookup("UserFPInfo");		
		USFCR_duressFinger.forEach(function(idx){
			var existRow = dsFPInfo.findFirstRow("FingerID == '" + idx+"' && TemplateIndex == 1");
			if( existRow != null ){
				existRow.setValue("Duress",1);
			}		
		});
	}
		
	refreshFPInfo();
}

function onSms_getCardLayoutInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		console.log("cardlayout success");
		var initValue = app.getHost().initValue;
		var editMode = initValue["mode"]; //Modify ,Add
		var hostUserinfo = initValue["dmUserInfo"];
		var modifiedData = initValue["UserFPInfo"];
		USFCR_FPModified = initValue["fpmodified"];
		var dmUserInfo = app.lookup("UserInfo"); //"UserInfo": userInfo, //사용자 정보
		dmUserInfo.clear();
		if (editMode == "Add") {//등록 (사용자 DB 없음)
			dmUserInfo.build(hostUserinfo);	
			setFpInfo(modifiedData);
			if (dmUserInfo.getValue("Password") == "****") { // 단말기에서 필수정보 가져와야 한다.
				getUserPasswordInfo();
			}
		} else { //수정 (사용자 DB 있음) 
			dmUserInfo.clear();
			dmUserInfo.build(hostUserinfo);
			if (USFCR_FPModified == 1) { // 수정된 지문정보가 있다
				setFpInfo(modifiedData);
				if (dmUserInfo.getValue("Password") == "****") { // 단말기에서 필수정보 가져와야 한다.
					getUserPasswordInfo();
				} 
			} else {
				var submission = app.lookup("sms_getUserFPInfo");
				submission.action = USFCR_url+"/users/"+USFCR_userID+"/fingerPrint";
				console.log(submission.action);
				submission.send();		
			}
		}
		 
	
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_Fail")+" "+dataManager.getString(getErrorString(resultCode)));
	}
}


function refreshFPInfo() {
	var dsUserFPInfo = app.lookup("UserFPInfo");
	var count = dsUserFPInfo.getRowCount();
	for ( var i = 0; i <count; i++ ){
		var fpInfo = dsUserFPInfo.getRow(i);
				
		if( fpInfo.getValue("TemplateIndex") == 1 ){
			var ctrlName = "USFCR_imgfinger_"+fpInfo.getValue("FingerID");
			var imgFinger = app.lookup(ctrlName);
					
			if(fpInfo.getValue("Duress")==1){
				imgFinger.src = "theme/images/fingerRegistration/user_fingerprint_img_enrollment_warning.png";
			}else{
				imgFinger.src = "theme/images/fingerRegistration/user_fingerprint_img_enrollment_normal.png";
			}
		}		
	}
}

function connectDeviceServer(address){    
    
    deviceWebSocket = new WebSocket("ws://"+address+"/v1/webEntry");
    
    deviceWebSocket.onopen = function(message){      
    	app.lookup("USFCR_opbMessage").value = dataManager.getString("Str_HamsterConnected");          
        console.log("device server ws connected.");
    };

    deviceWebSocket.onclose = function(message){
    	deviceWebSocket = null;
        console.log("\Server disconnect..."); 
    };

    deviceWebSocket.onerror = function(message){
        console.log("error... " + message);
        app.lookup("USFCR_opbMessage").value = dataManager.getString("Str_DeviceServerInstallRequired");
        var link = app.lookup("USFCR_sniDownloadLink");
        link.visible=true;
        
    };

    deviceWebSocket.onmessage = function(message){
        
        var msg = JSON.parse(message.data);
        console.log("onmessage : "+msg.msgId);
        switch( msg.msgId){
            case WSCmdFPCaptureImageCallback: { // 캡쳐 이미지 수신.	
                var imageInfo = JSON.parse(msg.body);
                var imageCtrl;
                if(USFCR_templateIndex == 0 ){
				 	imageCtrl = app.lookup("USFCR_imgFPDisplay_1");
				} else {
					imageCtrl = app.lookup("USFCR_imgFPDisplay_2");
				}
                imageCtrl.src = 'data:image/jpeg;base64,' + imageInfo.imageData;
            } break;
            
            case WSCmdFPCaptureRes:{ // 캡쳐 완료. 결과 수신. 
                
                var result = JSON.parse(msg.body);
                if(USFCR_templateIndex == 0 ){
	                USFCR_templateIndex = 1;
	                var dmFPInfo = app.lookup("dm_FPInfo");				
					var userID = dmFPInfo.getValue("UserID");
					var fingerID = dmFPInfo.getValue("FingerID");
					dmFPInfo.setValue("Template1", result["FingerData"]);
					onFPCaptureReq(userID,fingerID);
				} else if ( USFCR_templateIndex == 1 ){ // 두개의 템플릿에 대해 매칭 시도
					var dmFPInfo = app.lookup("dm_FPInfo");
					dmFPInfo.setValue("Template2", result["FingerData"]);
					var userID = dmFPInfo.getValue("UserID");
					var template_1 = dmFPInfo.getValue("Template1");
					var template_2 = dmFPInfo.getValue("Template2");
					dmFPInfo.setValue("templateFormat", USFCR_templateFormat);
					onFPVerifyReq(userID,template_1,template_2);
				}
                //console.log(dsFPInfo.getRowDataRanged());
            }break;
            
            case WSCmdFPVerifyRes:
            	var body = JSON.parse(msg.body);
            	
            	if( body.Result == 0){            	
            		app.lookup("USFCR_btnRegist").visible = true;
            		app.lookup("USFCR_opbInfoMsg").text = "Mached";
            	} else {
            		app.lookup("USFCR_opbInfoMsg").text = "Mached failed. " + body.Result;
            	}
            	break;
            case WSCmdCardLayoutWritingRes:
         	   comLib.hideLoadMask();	
                var result = JSON.parse(msg.body);
                if( result.Result == "success" ){
                	               	
                	var dsUserCardInfo = app.lookup("UserCardInfo");
		            var strCardNum = result.CardNum; // 카드번호 옮겨 담기
		            
		            var existRow = dsUserCardInfo.findFirstRow("CardNum == '"+strCardNum+"'");
		            if(!existRow){
		            	dsUserCardInfo.addRowData({"CardNum":strCardNum}); //추가
		            }
		            
		            app.lookup("USFCR_ipbCardNum").value = strCardNum;
                	USFCR_result = 1; //성공
	            } else if (result.Result=="Capture failed"){
	            	dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardCapture")); // 라이팅 실패 처리
	            } else {
	            	dialogAlert(app, dataManager.getString("Str_Failed"), result.Result);	            	
	            }
            break
            default: console.log(msg); break;
        }
    }
}

function onSms_getUserFPInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserFPInfo = e.control;
	
	var dmResultCode = app.lookup("Result").getValue("ResultCode");
	if( dmResultCode == COMERROR_NONE){	
		if(USFCR_duressFinger && USFCR_duressFinger.length>0){
			var dsFPInfo = app.lookup("UserFPInfo");		
			USFCR_duressFinger.forEach(function(idx){
				var existRow = dsFPInfo.findFirstRow("FingerID == '" + idx+"' && TemplateIndex == 1");
    			if( existRow != null ){
    				existRow.setValue("Duress",1);
				}		
			});
		}
		
		refreshFPInfo();
	} else if (dmResultCode == 4 || dmResultCode == 16777218) { //등록된 지문이 없거나 사용자가 없는 경우. 최초 사용자인 경우 
		dialogAlert(app, "Warning", dataManager.getString(getErrorString(0x01000003)));
	}else {	
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(dmResultCode)));		
	}
}

/*
 * 버튼(USFCR_btnRegist)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSFCR_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSFCR_btnRegist = e.control;
	
	var dmFPInfo = app.lookup("dm_FPInfo");
	var fingerID = dmFPInfo.getValue("FingerID");
	 
    var dsFPInfo = app.lookup("UserFPInfo");
    
    var existRow = dsFPInfo.findFirstRow("FingerID == '" + fingerID+"'");
    if (existRow != null) {
    	dsFPInfo.realDeleteRow(existRow.getIndex());
		var fpInfo2 = dsFPInfo.findFirstRow("FingerID == "+fingerID+"&& TemplateIndex == 2");
		if(fpInfo2){
			dsFPInfo.realDeleteRow(fpInfo2.getIndex());
		}
    }
    
    dsFPInfo.addRowData({
    	"FingerID":fingerID,
    	"MinConvType":dmFPInfo.getValue("templateFormat"),
    	"TemplateIndex":1,
    	"TemplateData":dmFPInfo.getValue("Template1")
    });
    dsFPInfo.addRowData({
    	"FingerID":fingerID,
    	"MinConvType":dmFPInfo.getValue("templateFormat"),
    	"TemplateIndex":2,
    	"TemplateData":dmFPInfo.getValue("Template2")
    });
    app.lookup("USFCR_opbInfoMsg").text = "";
    app.lookup("USFCR_btnRegist").visible = false;
    refreshFPInfo();   
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageContextmenu(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var imageContextmenu = e.control;
	e.preventDefault();
	
	var fingerID = imageContextmenu.userAttr("fid");
	var dsUserFPInfo = app.lookup("UserFPInfo");
	
	var fpInfo = dsUserFPInfo.findFirstRow("FingerID == "+parseInt(fingerID)+"&& TemplateIndex == 1");
	
	var dsFingerMenu;
	if( fpInfo ){
		dsFingerMenu = app.lookup("dsFingerModifyMenu");
	} else {
		dsFingerMenu = app.lookup("dsFingerRegistMenu");
	}
	dsFingerMenu.setValue(0, "label", dataManager.getString("Str_FingerRegist"));
	dsFingerMenu.setValue(1, "label", dataManager.getString("Str_FingerPrintDelete"));
	dsFingerMenu.setValue(2, "label", dataManager.getString("Str_ThreatFingerPrintRegist"));
	dsFingerMenu.setValue(3, "label", dataManager.getString("Str_ThreatFingerPrintDelete"));	
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
				var UserFingerInfo = app.lookup("UserFPInfo");
				var FingerCnt = UserFingerInfo.getRowCount();
				FingerCnt = FingerCnt / 2;
				
				if (USFCR_fpMax <= FingerCnt) {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorMaxFingerRegistConunt"));
					break;
				}
				var dmFPInfo = app.lookup("dm_FPInfo");
				var userID = dmFPInfo.getValue("UserID");
				dmFPInfo.clear();								
				dmFPInfo.setValue("FingerID",fingerID);
				dmFPInfo.setValue("Template1","");		
				dmFPInfo.setValue("Template2","");
				app.lookup("USFCR_btnRegist").visible = false;
				
				USFCR_templateIndex = 0; // 첫번째 템플릿 요청
							
				onFPCaptureReq(userID,fingerID);
				break;
			case "delete":
				var ctrlName = "USFPR_imgfinger_"+fpInfo.getValue("FingerID");
				var imgFinger = app.lookup(ctrlName);
				imgFinger.src = "theme/images/common/common_check_box_normal.png";
			
				dsUserFPInfo.realDeleteRow(fpInfo.getIndex());
				var fpInfo2 = dsUserFPInfo.findFirstRow("FingerID == "+parseInt(fingerID)+"&& TemplateIndex == 2");
				if(fpInfo2){
					dsUserFPInfo.realDeleteRow(fpInfo2.getIndex());
				}
				
				refreshFPInfo();
				break;
			case "duressOn":
				fpInfo.setValue("Duress",1);
				refreshFPInfo();
				break;
			case "duressOff":
				fpInfo.setValue("Duress",0);
				refreshFPInfo();			
				break;
		}
		
		menu.dispose();
	});
	var rect = app.getActualRect();
	contextMenu.style.css({
		left: (e.clientX - rect.left) + "px",
		top: (e.clientY - rect.top) + "px",
		height: "200px",
		width: "210px",
		position: "absolute"
	});
	contextMenu.focus();
	contextMenu.addEventListener("blur", function(e) {
		contextMenu.dispose();
	});
	app.floatControl(contextMenu);
}

function onFPCaptureReq(uid,fingerIdx){	
	if ( deviceWebSocket == null ){		
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterNotFound"));
		return;
	}
	deviceWebSocket.send('{"msgId":"'+WSCmdFPCaptureReq+'","body":{"UserId":"'+uid+'","ImageType":"JPG","BrandType":"'+brandType+'","FingerIndex":'+fingerIdx+ ',"TemplateFormat":'+ USFCR_templateFormat+'}}'); // RAW,JPG,BMP
	
}

function onFPVerifyReq(uid,template_1,template_2){	
	deviceWebSocket.send('{"msgId":"'+WSCmdFPVerifyReq+'","body":{"UserId":"'+uid+'","BrandType":"'+brandType+'","Template1":"'+template_1+'","Template2":"'+template_2+'","TemplateFormat":' + USFCR_templateFormat + '}}');
}

/*
 * "스마트 카드 발행" 버튼(USFCR_btnSmartCardIssue)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSFCR_btnSmartCardIssueClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSFCR_btnSmartCardIssue = e.control;
	// 스마트 카드 발행 
	// 지문등록된 것이 있는지 체크
	// 카드read -> 
	var fpInfo = app.lookup("UserFPInfo");
	if (fpInfo.getRowCount() <= 0) { // 등록된 지문이 없으면 진행 불가.
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_FPDataNotExist"));
		return;		
	} 
	
	var maxCard = 5;
	if( brandType == BRAND_NITGEN) {
		maxCard = 1;
	}
	
	var dsUserCardInfo = app.lookup("UserCardInfo");
	var count = dsUserCardInfo.getRowCount();
	if( count >= maxCard ){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardCountMaxExceeded"));
		return
	} 
	fpCardIssue();
}

function fpCardIssue() {
	if(deviceWebSocket){
		var dmCardLayoutInfo = app.lookup("dmCardLayoutInfo");
		var nCardSize = dmCardLayoutInfo.getValue("CardSize");
		var nCardType = dmCardLayoutInfo.getValue("CardType");
		var nReadType = dmCardLayoutInfo.getValue("ReadType");
		var nTmplateSize = dmCardLayoutInfo.getValue("TemplateSize");
		var nTmplateCount = dmCardLayoutInfo.getValue("TemplateCount");
		if (nCardType != 1) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorFPCardLayoutNotSetting"));	
			return;
		}
		var userInfo = app.lookup("UserInfo");
		var userFpInfo = app.lookup("UserFPInfo");
		var dsCardlayoutDataList = app.lookup("dsCardLayoutData");
		
		var msgFirst = '{"msgId":"'+ WSCmdCardLayoutWritingReq+'","body":{"BrandType":"' + brandType + 
			'","UserID":"' + userInfo.getValue("ID")+ '","AccessGroup":' + userInfo.getValue("AccessGroupCode") + 
			',"TemplateSize":' + nTmplateSize + ',"Password":"' + userInfo.getValue("Password") + '","TemplateCount":' + 
			nTmplateCount + ',"UsePeriodFlag":' + userInfo.getValue("UsePeriodFlag") + ',"StartDate":"' + 
			userInfo.getValue("RegistDate") + '","EndDate":"' + userInfo.getValue("ExpireDate") + '"';
		//console.log(msgFirst);
		
		var msgFpInfo = ',"FPInfo":[{';
		var fpRowcount = userFpInfo.getRowCount();
		for (var i=0 ; i < fpRowcount; i++ ) {
			if (i > 0) {
				msgFpInfo = msgFpInfo + ',{'; // 이어 붙이기
			}
			var rowData = userFpInfo.getRow(i);
			msgFpInfo = msgFpInfo +  '"MinConvType":' +  rowData.getValue("MinConvType") + ',"FingerID":' + 
				rowData.getValue("FingerID") +  ',"TemplateIndex":' + rowData.getValue("TemplateIndex") + ',"TemplateData":"' + 
				rowData.getValue("TemplateData") + '"}';
		}
		if (msgFpInfo.length > 0 ) {
			msgFpInfo = msgFpInfo + ']';
		}
		
		var msgSector = ',"sectorData":[{';
		var cldRowcount = dsCardlayoutDataList.getRowCount();
		for (var i= 0; i< cldRowcount;i++) {
			if (i > 0) {
				msgSector = msgSector + ',{';
			}
			var rowData = dsCardlayoutDataList.getRow(i);
			msgSector = msgSector +  '"Index":"' +  rowData.getValue("Index") + '","Sector":"' + rowData.getValue("Sector") + '","Block":"' + 
				rowData.getValue("Block") + '","KeyType":"' + rowData.getValue("KeyType") + '","KeyValue":"' + rowData.getValue("KeyValue") + '"}';
		}
		if(msgSector.length > 0 ) {
			msgSector = msgSector + "]";	
		}
		var sendMsg = msgFirst + msgFpInfo + msgSector + '}}';
		//console.log(sendMsg);
		
		comLib.showLoadMask("", dataManager.getString("Str_CardLayoutWriteRequest"), "", 60);
		deviceWebSocket.send(sendMsg);
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterConnectFailed"));			
	}
}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){ app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR); }
function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function getUserPasswordInfo() {
	comLib.showLoadMask("",dataManager.getString("Str_UserInfo"),"",0);
	var smsGetUserPassword  = app.lookup("sms_getUserPassword");
	smsGetUserPassword.action = "/v1/users/"+ app.lookup("UserInfo").getValue("ID")+"/password";
	smsGetUserPassword.send();
}

function onSms_getUserPasswordSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResultCode = app.lookup("Result").getValue("ResultCode");
	if( dmResultCode == COMERROR_NONE){	
		app.lookup("UserInfo").setValue("Password", app.lookup("UserPassword").getValue("Password"));
	} else {	
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(dmResultCode)));		
	}
}


/*
 * "종료" 버튼(USFCR_btnClose)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSFCR_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSFCR_btnClose = e.control;
	app.close();		
	
}


/*
 * 버튼(USFCR_btnApply)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSFCR_btnApplyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var uSFCR_btnApply = e.control;
	if (USFCR_result == 1 ) {
		var writeCard = app.lookup("USFCR_ipbCardNum").value;
			app.close({"result": USFCR_result , 
				"UserFPInfo": app.lookup("UserFPInfo").getRowDataRanged(), 
				"writeCardNumber": writeCard});
	} else {
		//지문카드 라이트 안됨
	}	
}
