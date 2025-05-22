/************************************************
 * visitorInManagement.js
 * Created at 2020. 12. 15. 오후 8:25:03.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;
var KWLVR_version;
var deviceWebSocket;
var clearFlag;
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();	
	KWLVR_version = dataManager.getSystemVersion();
	connectDeviceServer("127.0.0.1:9600");
	clearFlag =0;
	initStatus(false);
	
}
function initStatus(status) {
	app.lookup("KWLVI_ipbLeaderName").enabled = status;
	app.lookup("KWLVI_ipbCardNum").enabled = status;
	app.lookup("KWLVI_ipbCompanyname").enabled = status;
	app.lookup("KWLVI_ipbLeaderDepartment").enabled = status;
	app.lookup("KWLVI_ipbLeaderPhone").enabled = status;
	app.lookup("KWLVI_ipbPurpose").enabled = status;
	app.lookup("KWLVI_ipbVisitorName").enabled = status;
	app.lookup("KWLVR_btnSave1").enabled = status;
	app.lookup("KWLVR_btnSave2").enabled = status;
}

/*
 * 루트 컨테이너에서 before-unload 이벤트 발생 시 호출.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	if(deviceWebSocket != null){
		deviceWebSocket.close();
		deviceWebSocket = null;
	}
}


function connectDeviceServer(address){    
    
    deviceWebSocket = new WebSocket("ws://"+address+"/v1/webEntry");
        
    deviceWebSocket.onopen = function(message){      
    	//app.lookup("USCDR_opbMessage").value = dataManager.getString("Str_HamsterConnected");          
        console.log("device server ws connected.");
    };

    deviceWebSocket.onclose = function(message){
    	deviceWebSocket = null;
        console.log("\Server disconnect..."); 
    };

    deviceWebSocket.onerror = function(message){
        console.log("error... " + message);
        //app.lookup("USCDR_opbMessage").value = dataManager.getString("Str_DeviceServerInstallRequired");
        //var link = app.lookup("USCDR_sniDownloadLink");
        //link.visible=true;
        
    };

    deviceWebSocket.onmessage = function(message){
        
        var msg = JSON.parse(message.data);
        
        switch( msg.msgId){                       
            case WSCmdCardCaptureRes:{ // 캡쳐 완료. 결과 수신.
            	comLib.hideLoadMask();	
                var result = JSON.parse(msg.body);
                
                if( result.Result == "success" ){
		            var strCardNum = result.CardNum; // 카드번호 옮겨 담기
		            if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
		            	strCardNum = StrLib.formattedString("00000000",String(result.CardNum), "left");	
		            } 
		            var ipbCardNum = app.lookup("KWLVI_ipbCardNum");
		            	ipbCardNum.value = strCardNum;
	            } else if (result.Result=="Capture failed"){
	            	dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardCapture"));
	            } else {
	            	dialogAlert(app, dataManager.getString("Str_Failed"), result.Result);	            	
	            }
				
            }break;
            
            default: console.log(msg); break;
        }
    } 
}


function onCardCaptureReq(uid){	
	var brandType = ( dataManager.getSystemBrandType() == BRAND_NITGEN) ?"NITGEN":"VIRDI";
	if(deviceWebSocket){
		var dmCardlayoutInfo = app.lookup("dmCardLayoutInfo");
		var cardType = dmCardlayoutInfo.getValue("CardType");
		var readType = dmCardlayoutInfo.getValue("ReadType");
			 
		var serialType = convertSerialType();
		var dsCardlayoutDataList = app.lookup("dsCardLayoutData");
		/*{
			"msgId":"WSCmdCardCaptureReq",
			"body": {
				"UserId":"uid",
				"BrandType":"brandType",
				"CardType":"cardType",
				"readType":"readType",
				"serialType":"serialType"
				"sectorData":[{ 
							"AIDCode": "ffff",
							"Block": "0"
							"Index": "0"
							"KeyType": 96"
							"KeyValue": "ffffffffffff"
							"Length": "3"
							"Sector": "0"
							"Start": "10"
							},	
						{""}
					] 
				}
		}*/
		 
		var strSector = '';
		var RowCnt = dsCardlayoutDataList.getRowCount();
		for (var i= 0; i< RowCnt;i++) {
			if (i == 0) { // 제일 처음
				strSector = '"sectorData":[{';
			} else {
				strSector = strSector + ',{'
			}
			var rowData = dsCardlayoutDataList.getRow(i);
			strSector = strSector +  '"Index":"' +  rowData.getValue("Index") + '","Sector":"' + rowData.getValue("Sector") + '","Block":"' +
				rowData.getValue("Block") + '","Start":"' + rowData.getValue("Start") + '","Length":"' + rowData.getValue("Length") + '","KeyType":"' + 
				rowData.getValue("KeyType") + '","KeyValue":"' + rowData.getValue("KeyValue") + '","AIDCode":"' + rowData.getValue("AIDCode")+'"}'
			
		}
		if(RowCnt > 0 ) {
			strSector = strSector + "]";	
		}
		var strSendinfo = '';
		strSendinfo = '{"msgId":"'+ WSCmdCardCaptureReq+'","body":{"UserId":"0","BrandType":"'+brandType+'","CardType":"' + cardType + 
		'","readType":"' + readType + '","serialType":"'+ serialType +'"}';
				
		if (strSector.length > 0) {
			strSendinfo = strSendinfo + ',' + strSector + '}';
		} else {
			strSendinfo = strSendinfo + '}';
		}
		
		comLib.showLoadMask("", "카드 캡쳐 요청", "", 15);
		console.log(strSendinfo);
		deviceWebSocket.send(strSendinfo);	
		//deviceWebSocket.send('{"msgId":"'+WSCmdCardCaptureReq+'","body":{"UserId":"'+uid+'","BrandType":"'+brandType+'","CardType":"' + cardType + 
		//'","readType":"' + readType + '","serialType":"'+ serialType +'"}}');
		
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterConnectFailed"));			
	}
}


function convertSerialType() {
	var dmCardlayoutInfo = app.lookup("dmCardLayoutInfo");
	var serialType = dmCardlayoutInfo.getValue("TemplateSize"); 
	var cardType = dmCardlayoutInfo.getValue("CardType");
	var readType = dmCardlayoutInfo.getValue("ReadType");
	if (cardType == 1) {
		serialType = 0; // 지문카드 --> 기본으로 처리
	} else {
		if (readType == 2) {//MAD
			serialType = 0; //MAD --> 기본으로 처리
		} 
	}
	
	return serialType;
}

/*
 * "카드읽기" 버튼(KWLVR_CardReader)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLVR_CardReaderClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLVR_CardReader = e.control;
	onCardCaptureReq(1);
}


/*
 * "클리어" 버튼(KWLVR_btnClear)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLVR_btnClearClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLVR_btnClear = e.control;
	clearKwlInfos();
}
function clearKwlInfos() {
	app.lookup("KWLVI_ipbCardNum").clear();
	app.lookup("KWLVI_ipbCompanyname").clear();
	app.lookup("KWLVI_ipbLeaderDepartment").clear();
	app.lookup("KWLVI_ipbLeaderName").clear();
	app.lookup("KWLVI_ipbLeaderPhone").clear();
	app.lookup("KWLVI_ipbPurpose").clear();
	app.lookup("KWLVI_ipbVisitorName").clear();
	
	app.lookup("visitRequestInfo").clear();
}

/*
 * "저장 & 클리어" 버튼(KWLVR_btnSave1)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLVR_btnSave1Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLVR_btnSave1 = e.control;
	var cardNum = app.lookup("KWLVI_ipbCardNum").value;
	if(cardNum.length <= 0) {
		dialogAlert(app, "Waning", "입장 카드가 지정안되었습니다.");
		return;
	} 
	var leaderName = app.lookup("KWLVI_ipbLeaderName").value;
	if(leaderName.length <= 0) {
		dialogAlert(app, "Waning", "인솔자 성명이 지정안되었습니다.");
		return;
	}
	app.lookup("visitRequestInfo").setValue("InputAdminName", app.lookup("VisitLoginInfo").getValue("UniqueID"));
	
	clearFlag = 1;
	comLib.showLoadMask("","방문신청 입장기록 등록","",0);
	var smspostKwlVisitorIn = app.lookup("sms_postKwlVisitorIn");
	smspostKwlVisitorIn.send();
}

function onSms_postKwlVisitorInSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		if (clearFlag == 1) { //세이브 클리어
			clearKwlInfos();
		} else if (clearFlag == 2) {// 세이브 계속
			app.lookup("KWLVI_ipbCardNum").clear();
			app.lookup("KWLVI_ipbVisitorName").clear();
		}
	} else {
		dialogAlert(app, "Waning", dataManager.getString("Str_VisitorManagement")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("KWLVI_grpMain").redraw();
}

function onSms_postKwlVisitorInSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postKwlVisitorInSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * "저장 & 계속" 버튼(KWLVR_btnSave2)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLVR_btnSave2Click(/* cpr.events.CMouseEvent */ e){
	var cardNum = app.lookup("KWLVI_ipbCardNum").value;
	if(cardNum.length <= 0) {
		dialogAlert(app, "Waning", "입장 카드가 지정안되었습니다.");
		return;
	} 
	var leaderName = app.lookup("KWLVI_ipbLeaderName").value;
	if(leaderName.length <= 0) {
		dialogAlert(app, "Waning", "인솔자 성명이 지정안되었습니다.");
		return;
	}
	//등록 -> clear
	clearFlag = 2;
	comLib.showLoadMask("","방문신청 입장기록 등록","",0);
	var smspostKwlVisitorIn = app.lookup("sms_postKwlVisitorIn");
	smspostKwlVisitorIn.send(); 
}


/*
 * "종료" 버튼(KWLVR_btnClose)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLVR_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLVR_btnClose = e.control;
	app.close();
}

function onSms_putKwlVisitLoginSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		//console.log(app.lookup("VisitLoginResult").getValue("AdminName"));
		app.lookup("KWLVI_btnLogin").enabled = false;
		app.lookup("VisitLoginInfo").setValue("UniqueID",  app.lookup("VisitLoginResult").getValue("AdminName"));
		app.lookup("KWLVI_ipbIdno").enabled = false;
		app.lookup("KWLVI_ipbPassword").value = "";
		app.lookup("KWLVI_ipbPassword").enabled = false;
		initStatus(true);
	} else {
		if (resultCode == 0x7F000001) {// 최초 로그인
			
		//	dialogAlert(app, "Waning", "최초 로그인 사용자 입니다. 다음 화면에서 패스워드를 등록 해주세요");
			app.getRootAppInstance().openDialog("app/main/kangwonland/visitorHistory/SetPassword", {width: 400, height: 250}, function(dialog){
				dialog.ready(function(dialogApp){
					dialog.initValue = {"userID":app.lookup("VisitLoginResult").getValue("UserID")};	
					dialog.modal = true;
				});
			}).then(function(returnValue){
			
			});
		} else if (resultCode == 0x7F000002) {
			dialogAlert(app, "Waning", "로그인 허용 횟수를 초과 하였습니다. 관리자에게 문의 하세요");
		
		} else if (resultCode == 0x0100000F) {
			app.getRootAppInstance().openDialog("app/main/kangwonland/visitorHistory/SetPassword", {width: 400, height: 250}, function(dialog){
				dialog.ready(function(dialogApp){
					dialog.initValue = {"userID":app.lookup("VisitLoginResult").getValue("UserID")};	
					dialog.modal = true;
				});
			}).then(function(returnValue){
			
			});
		}else {
			dialogAlert(app, "Waning", dataManager.getString("Str_VisitorManagement")+" 로그인 "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
		}
	}
	app.lookup("KWLVI_grpMain").redraw();
}

function onSms_putKwlVisitLoginSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putKwlVisitLoginSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * "login" 버튼(KWLVI_btnLogin)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onKWLVI_btnLoginClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var kWLVI_btnLogin = e.control;
	var smspostKwlVisitLogin = app.lookup("sms_postKwlVisitLogin");
	smspostKwlVisitLogin.action = "/v1/kangwonland/visitlogin";
	smspostKwlVisitLogin.send();
}
