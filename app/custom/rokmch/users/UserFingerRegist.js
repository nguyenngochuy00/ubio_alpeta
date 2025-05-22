/************************************************
 * userFingerRegist.js
 * Created at 2018. 10. 16. 오후 1:08:47.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var pageRowCount = 500;
var comLib;
var deviceWebSocket;
var USFPR_duressFinger = []; // 서버에서 사용자 지문 최초 수신시만 적용. 이후에는 UserFPInfo의 값으로만 판단

var USFPR_templateIndex = 0;
var USFPR_fingerID = 0;
var USFPR_url;
var USFPR_fpMax;
var USFPR_templateFormat= 3; //ISO 템플릿 포멧 추가

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
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
	
	USFPR_templateFormat = dataManager.getClientOption().getValue("TemplateFormat");
	console.log("templateType : " + USFPR_templateFormat);
	
	var link = app.lookup("USFPR_sniDownloadLink");
	link.value=	"<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">"+dataManager.getString("Str_DeviceServerDownloadPath")+"</a>";
	
	app.lookup("USFPR_opbMessage").value = dataManager.getString("Str_HamsterConnectTry");
	connectDeviceServer("127.0.0.1:9600");
		
	var udcTerminalList = app.lookup("USFPR_udcTerminalList");	
	udcTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
		
	var submission = app.lookup("sms_getUserFPInfo");
	var initValue = app.getHost().initValue;
	var userID = initValue["UserID"];
	USFPR_url = initValue["Url"];
	if(initValue["FPMax"]){
		USFPR_fpMax = initValue["FPMax"];
	}else{
		USFPR_fpMax = dataManager.getClientOption().getValue("FpRegMax");
	}
	
	var dmFPInfo = app.lookup("dm_FPInfo");
	dmFPInfo.setValue("UserID",userID);
	USFPR_duressFinger = initValue["DuressFinger"];
	
	var oemVer = dataManager.getOemVersion();
	if( oemVer == OEM_JAWOONDAE){
		var tabDevice = app.lookup("USFPR_tabDeviceType");
		var tabItems = tabDevice.getTabItems();
		tabDevice.setSelectedTabItem(tabItems[1]);
	}	else if (oemVer == OEM_SS_HOSPITAL) {
		var tabitems = app.lookup("USFPR_tabDeviceType").getTabItems();
		app.lookup("USFPR_tabDeviceType").setSelectedTabItem(tabitems[1]);	
	}
	
	
	if(initValue["FPModified"] == 1 ){
		var dsUserFPInfo = app.lookup("UserFPInfo");
		dsUserFPInfo.clear();
		/** @type cpr.data.DataSet */
		var modifiedData = initValue["UserFPInfo"];
		modifiedData.copyToDataSet(dsUserFPInfo);			
		
	
		//지문 수정 플래그가 1일때도 협박지문 표기를 위해 협박지문 여부를 검사한다. 그 후 refreshFPInfo();
		if(USFPR_duressFinger && USFPR_duressFinger.length>0){
			var dsFPInfo = app.lookup("UserFPInfo");		
			USFPR_duressFinger.forEach(function(idx){
				var existRow = dsFPInfo.findFirstRow("FingerID == '" + idx+"' && TemplateIndex == 1");
    			if( existRow != null ){
    				existRow.setValue("Duress",1);
				}		
			});
		}
		
		
		refreshFPInfo();
					
		sendConnectedTerminalListRequest();
	} else {
		submission.action = USFPR_url+"/users/"+userID+"/fingerPrint";
		submission.send();		
	}
}

// 서브미션에서 submit-done 이벤트 발생 시 호출.
function onSms_getUserFPInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_getUserFPInfo = e.control;
	
	var dmResultCode = app.lookup("Result").getValue("ResultCode");
	if( dmResultCode == 0){	
		
		if(USFPR_duressFinger && USFPR_duressFinger.length>0){
			var dsFPInfo = app.lookup("UserFPInfo");		
			USFPR_duressFinger.forEach(function(idx){
				var existRow = dsFPInfo.findFirstRow("FingerID == '" + idx+"' && TemplateIndex == 1");
    			if( existRow != null ){
    				existRow.setValue("Duress",1);
				}		
			});
		}
			
		
		refreshFPInfo();
	} else if (dmResultCode == 4 || dmResultCode == 16777218) { //등록된 지문이 없거나 사용자가 없는 경우. 최초 사용자인 경우 
		//dialogAlertAMHQ(app, "Warning", " 등록된 지문이 없습니다.");
	}else {	
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(dmResultCode)));		
	}
	
	// 인증가능 단말기 
	sendConnectedTerminalListRequest();
}

function sendConnectedTerminalListRequest() {
	var terminalList = app.lookup("USFPR_udcTerminalList");	
	var curIndex = terminalList.getCurrentPageIndex();
	
	var pageRowCount = terminalList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;
	
	var searchCtrl = app.lookup("USFPR_udcSearchTerminal")
	var smsGetConnectedTerminalList = app.lookup("sms_getConnectedTerminalList");
	smsGetConnectedTerminalList.action = USFPR_url+'/terminals'
	
	smsGetConnectedTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsGetConnectedTerminalList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	if( searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0 ){
		smsGetConnectedTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	}else{
		smsGetConnectedTerminalList.setParameters("searchCategory", "");
	}
	
	smsGetConnectedTerminalList.setParameters("offset", offset);
	smsGetConnectedTerminalList.setParameters("limit", pageRowCount);
	smsGetConnectedTerminalList.setParameters("AuthType", 'finger');
	smsGetConnectedTerminalList.setParameters("IsTerminalStatus", true);
	
	var fields = ["terminal_id","name","register_flag"];
	smsGetConnectedTerminalList.setParameters("fields", fields);
	
	comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
	smsGetConnectedTerminalList.send();
}

// 단말기 리스트 페이지 변경
function onUSFPR_udcTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	sendConnectedTerminalListRequest();
}

// 단말기 검색 클릭
function onSearchTerminalSearch(/* cpr.events.CUIEvent */ e){
	sendConnectedTerminalListRequest();
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
    deviceWebSocket = new WebSocket("ws://"+address+"/v1/webEntry");
    var svrDeviceVer = dataManager.getDeviceServerVersion();
    
    deviceWebSocket.onopen = function(message){      
    	app.lookup("USFPR_opbMessage").value = dataManager.getString("Str_DeviceServerUpdateRequired");
    	var link = app.lookup("USFPR_sniDownloadLink");
        link.visible=true;          
        console.log("device server ws connected.");
        
        /*
        var strSendInfo = '{"msgId":"' + WSCmdDeviceServerVersionReq + '"}';
        deviceWebSocket.send(strSendInfo);
        */	
    };

    deviceWebSocket.onclose = function(message){
    	deviceWebSocket = null;
        console.log("\Server disconnect..."); 
    };

    deviceWebSocket.onerror = function(message){
        console.log("error... " + message);
        app.lookup("USFPR_opbMessage").value = dataManager.getString("Str_DeviceServerInstallRequired");
        var link = app.lookup("USFPR_sniDownloadLink");
        link.visible=true;
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
                if(USFPR_templateIndex == 0 ){
	                USFPR_templateIndex = 1;
	                var dmFPInfo = app.lookup("dm_FPInfo");				
					var userID = dmFPInfo.getValue("UserID");
					var fingerID = dmFPInfo.getValue("FingerID");
					dmFPInfo.setValue("Template1", result["FingerData"]);
					onFPCaptureReq(userID,fingerID);
				} else if ( USFPR_templateIndex == 1 ){ // 두개의 템플릿에 대해 매칭 시도
					var dmFPInfo = app.lookup("dm_FPInfo");
					dmFPInfo.setValue("Template2", result["FingerData"]);
					var userID = dmFPInfo.getValue("UserID");
					var template_1 = dmFPInfo.getValue("Template1");
					var template_2 = dmFPInfo.getValue("Template2");
					dmFPInfo.setValue("templateFormat", USFPR_templateFormat);
					onFPVerifyReq(userID,template_1,template_2);
				}
                //console.log(dsFPInfo.getRowDataRanged());
            }break;
            
            case WSCmdFPVerifyRes:
            	var body = JSON.parse(msg.body);
            	
            	if( body.Result == 0){            	
            		app.lookup("USFPR_btnRegist").visible = true;
            		app.lookup("USFPR_opbInfoMsg").text = "Mached";
            	} else {
            		app.lookup("USFPR_opbInfoMsg").text = "Mached failed. " + body.Result;
            	}
            break;
            
            case WSCmdDeviceServerVersionRes:{ // 버전정보 확인         
            	var result = JSON.parse(msg.body);   	     
            	var deviceVer = result.Version;
            	console.log("recv WSCmdDeviceServerVersionRes, Version = " + deviceVer);
            	
            	// 서버와 디바이스 버전이 일치하면 링크 비활성화
            	if (deviceVer >= svrDeviceVer) {        			
        			app.lookup("USFPR_opbMessage").value = dataManager.getString("Str_HamsterConnected");
        			var link = app.lookup("USFPR_sniDownloadLink");
        			link.visible=false;
            	}
            } break;
            
            default: console.log(msg); break;
        }
    }
}

function onFPCaptureReq(uid,fingerIdx){	
	if ( deviceWebSocket == null ){		
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterNotFound"));
		return;
	}
	var brandType = ( dataManager.getSystemBrandType() == BRAND_NITGEN) ?"NITGEN":"VIRDI";
	deviceWebSocket.send('{"msgId":"'+WSCmdFPCaptureReq+'","body":{"UserId":"'+uid+'","ImageType":"JPG","BrandType":"'+brandType+'","FingerIndex":'+fingerIdx+ ',"TemplateFormat":'+ USFPR_templateFormat+'}}'); // RAW,JPG,BMP	
}

function onFPCaptureReqToTerminal(uid, fingerIdx) {
	var SelectedTerminalInfo = app.lookup("USFPR_udcTerminalList");
	var RecvDataMap = app.lookup("dmFPImage");
	//RecvDataMap.setValue("UserID", uid);
	//RecvDataMap.setValue("FingerID", fingerIdx);

	var checkedRowIndices = SelectedTerminalInfo.getCheckedRowIndices();
	var tID;
	if (checkedRowIndices.length <= 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}else if (checkedRowIndices.length > 1 ) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), dataManager.getString("Str_SelectedOneTerminal"));
		return;
	}
	var reqIndex = checkedRowIndices.pop();
	if (reqIndex == undefined ) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	tID = SelectedTerminalInfo.getTerminalID(reqIndex);

	var RequestData = app.lookup("sms_getUserFPInfoToTerminal");
	RequestData.action = USFPR_url+"/terminals/" + tID + "/scan/fp_image";
	//console.log(RequestData.action);
	RequestData.setParameters("regcount", 1);
	RequestData.setParameters("regtimeout", 60);
	RequestData.setParameters("UserID", uid);
	RequestData.setParameters("FingerID", fingerIdx);
	//console.log("fingerIdx : "+ fingerIdx);
	comLib.showLoadMask("", dataManager.getString("Str_FingerRegist"), "", 60);	
	RequestData.send();
} 

function onFPVerifyReq(uid,template_1,template_2){	
	var brandType = ( dataManager.getSystemBrandType() == BRAND_NITGEN) ?"NITGEN":"VIRDI";	
	deviceWebSocket.send('{"msgId":"'+WSCmdFPVerifyReq+'","body":{"UserId":"'+uid+'","BrandType":"'+brandType+'","Template1":"'+template_1+'","Template2":"'+template_2+'","TemplateFormat":' + USFPR_templateFormat + '}}');
}

// "등록" 버튼에서 click 이벤트 발생 시 호출.
function onUSFPR_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	/* @type cpr.controls.Button */
	var uSFPR_btnRegist = e.control;
	
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
    app.lookup("USFPR_opbInfoMsg").text = "";
    app.lookup("USFPR_btnRegist").visible = false;
    refreshFPInfo();                
   
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
	var i;
	for (i = 0; i < dsFingerMenu.getRowCount(); i++) {
		console.log("dsFingerMenu : ", dsFingerMenu.getRowData(i));
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
				var UserFingerInfo = app.lookup("UserFPInfo");
				var FingerCnt = UserFingerInfo.getRowCount();
				FingerCnt = FingerCnt / 2;
				
				if (USFPR_fpMax <= FingerCnt) {
					dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorMaxFingerRegistConunt"));
					break;
				}
				var dmFPInfo = app.lookup("dm_FPInfo");
				var userID = dmFPInfo.getValue("UserID");
				dmFPInfo.clear();								
				dmFPInfo.setValue("FingerID",fingerID);
				dmFPInfo.setValue("Template1","");		
				dmFPInfo.setValue("Template2","");
				app.lookup("USFPR_btnRegist").visible = false;
				
				USFPR_templateIndex = 0; // 첫번째 템플릿 요청
				var tabDevice = app.lookup("USFPR_tabDeviceType");
				var tabItem = tabDevice.getSelectedTabItem();
				if( tabItem.id == 1){ // 단말기 
					onFPCaptureReqToTerminal(userID, fingerID);
				
				} else{					
					onFPCaptureReq(userID,fingerID);
				}
				break;
			case "delete":
				var ctrlName = "USFPR_imgfinger_"+fpInfo.getValue("FingerID");
				var imgFinger = app.lookup(ctrlName);
				imgFinger.src = "theme/custom/armyhq/common_check_box_normal.png";
			
				console.log(dsUserFPInfo.getRowDataRanged());
				console.log(fpInfo.getIndex());
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
		height: "100px",
		width: "210px",
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
	//console.log(dsUserFPInfo.getRowDataRanged());
	
	var count = dsUserFPInfo.getRowCount();
	for ( var i = 0; i <count; i++ ){
		var fpInfo = dsUserFPInfo.getRow(i);
				
		if( fpInfo.getValue("TemplateIndex") == 1 ){
			var ctrlName = "USFPR_imgfinger_"+fpInfo.getValue("FingerID");
			var imgFinger = app.lookup(ctrlName);
			
			imgFinger.src = "theme/custom/armyhq/user_fingerprint_img_enrollment_normal.png";
				
		}		
	}
}

/*
 * 탭 폴더에서 selection-change 이벤트 발생 시 호출.
 * Tab Item을 선택한 후에 발생하는 이벤트.
 */
function onUSFPR_tabDeviceTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.TabFolder
	 */
	var uSFPR_tabDeviceType = e.control;
	
}


// "적용" 버튼에서 click 이벤트 발생 시 호출.
function onUSFPR_btnApplyClick2(/* cpr.events.CMouseEvent */ e){
	
	var dsFPInfo = app.lookup("UserFPInfo");
	if (dsFPInfo.getRowCount() < 1) {
		var userID = app.lookup("dm_FPInfo").getValue("UserID");
		var sms_deleteFP = app.lookup("sms_deleteUserFPInfo");
		sms_deleteFP.action = "/v1/users/" + userID + "/fingerPrint";
		sms_deleteFP.send();
	} else {
		//dsFPInfo.getRowCount();
		app.close(dsFPInfo.getRowDataRanged());
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getConnectedTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getConnectedTerminalList = e.control;
	var bResultCode = app.lookup("Result").getValue("ResultCode");
	if(bResultCode == COMERROR_NONE) {
		var dsTerminalList = app.lookup("TerminalList");
			
		var terminalList = app.lookup("USFPR_udcTerminalList");
		terminalList.setTerminalListAMHQ(dsTerminalList,"register");
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));		
		terminalList.setTotalCount(totalCount);
		
		terminalList.setCurrentPageIndex(0);
		
	} else {
		
	}
	comLib.hideLoadMask();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUserFPInfoToTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserFPInfoToTerminal = e.control;
	
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if (ResultCode == COMERROR_NONE) {
		var FPImages = app.lookup("dmFPImage");
		//console.log(FPImages.getDatas());
		var imageCtrl1 = app.lookup("USFPR_imgFPDisplay_1");
		var imageCtrl2 = app.lookup("USFPR_imgFPDisplay_2");
		imageCtrl1.src = 'data:image/jpeg;base64,' + FPImages.getValue("ConvImage1");
		imageCtrl2.src = 'data:image/jpeg;base64,' + FPImages.getValue("ConvImage2");
		
		var dmFPInfo = app.lookup("dm_FPInfo");
		dmFPInfo.setValue("UserID", FPImages.getValue("UserID"));
		dmFPInfo.setValue("FingerID", FPImages.getValue("FingerID"));
		dmFPInfo.setValue("Template1", FPImages.getValue("Template1"));
		dmFPInfo.setValue("Template2", FPImages.getValue("Template2"));
		var templateFormate = FPImages.getValue("TemplateFormat");
		if (templateFormate == 3) {
			dmFPInfo.setValue("templateFormat", templateFormate);	
		} else {
			dmFPInfo.setValue("templateFormat", 36);	
		}
//		console.log(dmFPInfo.getDatas());
		app.lookup("USFPR_btnRegist").visible = true;
        app.lookup("USFPR_opbInfoMsg").text = "Mached";
    } else {
    	app.lookup("USFPR_opbInfoMsg").text = "Mached failed. " + dataManager.getString(getErrorString(ResultCode));
	}
	comLib.hideLoadMask();
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getUserFPInfoToTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserFPInfoToTerminal = e.control;
	
	var result = app.lookup("Result");
	result.setValue("ResultCode",-1);
	app.lookup("USFPR_opbInfoMsg").text = "Mached failed. " + result.getValue("ResultCode");
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getUserFPInfoToTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserFPInfoToTerminal = e.control;
	
	var result = app.lookup("Result");
	result.setValue("ResultCode",-2);
	app.lookup("USFPR_opbInfoMsg").text = "Mached failed. " + result.getValue("ResultCode");
}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteUserFPInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == 0) {
		app.close(app.lookup("UserFPInfo").getRowDataRanged());
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}
