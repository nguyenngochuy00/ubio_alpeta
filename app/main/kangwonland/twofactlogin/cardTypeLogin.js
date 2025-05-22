/************************************************
 * cardTypeLogin.js
 * Created at 2020. 11. 15. 오후 1:19:33.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var TFCLG_userID;
var TFCLG_deviceWebSocket;
var TFCLG_mode; // "Regist":카드 등록, "Scan":카드 번호 스캔
var TFCLG_url;
var endFlag = 0;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);	
	dataManager = getDataManager();
	var link = app.lookup("TFCLG_sniDownloadLink");
	link.value=	"<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">"+"다운로드 : 등록기 웹 연동 프로그램"+"</a>";
	
	app.lookup("TFCLG_opbMessage").value = "등록기 연결 시도 중";
	connectDeviceServer("127.0.0.1:9600");
	
	var link2 = app.lookup("TFCLG_sniDownloadLink2");
	link2.value=	"<a href=\"/setup/Product_Drivers.zip\" target=\"_blank\">"+"다운로드 : 등록기 드라이버"+"</a>";
	TFCLG_userID = parseInt(dataManager.getAccountID(), 10);
	//app.lookup("CardTypeLoginInfo").setValue("UserID",dataManager.getAccountID());
	
	TFCLG_mode ="Scan";
	app.lookup("TFCLG_grpTopMain").redraw();
	//var smsGetCardLayout = app.lookup("sms_getCardInfo");
	//smsGetCardLayout.action = "/v1/cardLayout";
	//smsGetCardLayout.send();
	endFlag = 0;	
}

function connectDeviceServer(address){    
    
    TFCLG_deviceWebSocket = new WebSocket("ws://"+address+"/v1/webEntry");
        
    TFCLG_deviceWebSocket.onopen = function(message){      
    	app.lookup("TFCLG_opbMessage").value = "등록기 연결 성공";          
        console.log("device server ws connected.");
    };

    TFCLG_deviceWebSocket.onclose = function(message){
    	TFCLG_deviceWebSocket = null;
        console.log("\Server disconnect..."); 
    };

    TFCLG_deviceWebSocket.onerror = function(message){
        console.log("error... " + message);
        app.lookup("TFCLG_opbMessage").value = "등록기 웹 연동 프로그램을 설치하시기 바랍니다.";
        var link = app.lookup("TFCLG_sniDownloadLink");
        link.visible=true;
        var link = app.lookup("TFCLG_sniDownloadLink2");
        link.visible=true;
    };

    TFCLG_deviceWebSocket.onmessage = function(message){
        
        var msg = JSON.parse(message.data);
        
        switch( msg.msgId){                       
            case WSCmdCardCaptureRes:{ // 캡쳐 완료. 결과 수신.
            	comLib.hideLoadMask();	
                var result = JSON.parse(msg.body);
                
                if( result.Result == "success" ){
                	
		            var dmUserCardInfo = app.lookup("CardTypeLoginInfo");
		            if( TFCLG_mode == "scan"){
		            	dmUserCardInfo.clear();
		            }
		            var strCardNum = result.CardNum; // 카드번호 옮겨 담기
		            if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
		            	strCardNum = StrLib.formattedString("00000000",String(result.CardNum), "left");	
		            } 
		           
		            dmUserCardInfo.setValue("CardNum",strCardNum);
		          	console.log(dmUserCardInfo.getDatas());
	            } else if (result.Result=="Capture failed"){
	            	dialogAlert(app, "실패", "카드 정보 읽기 실패");
	            } else {
	            	dialogAlert(app, "실패", result.Result);	            	
	            }
				app.lookup("TFCLG_ipbCardNum").redraw();
            }break;
            
            default: console.log(msg); break;
        }
        
    } 
}


/*
 * 루트 컨테이너에서 before-unload 이벤트 발생 시 호출.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	if(TFCLG_deviceWebSocket != null){
		TFCLG_deviceWebSocket.close();
		TFCLG_deviceWebSocket = null;
	}
}


/*
 * "스캔" 버튼(TFCLG_btnScan)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTFCLG_btnScanClick(/* cpr.events.CMouseEvent */ e){
	var maxCard = 1;
	var dmCardTypeLoginInfo = app.lookup("CardTypeLoginInfo");
	dmCardTypeLoginInfo.clear();
	
	onCardCaptureReq(TFCLG_userID);
}


function onCardCaptureReq(uid){
	var brandType = ( dataManager.getSystemBrandType() == BRAND_NITGEN) ?"NITGEN":"VIRDI";
	if(TFCLG_deviceWebSocket){
		var dmCardlayoutInfo = app.lookup("dmCardLayoutInfo");
		var cardType = dmCardlayoutInfo.getValue("CardType");
		var readType = dmCardlayoutInfo.getValue("ReadType");
			
		var serialType = convertSerialType();
		var dsCardlayoutDataList = app.lookup("dsCardLayoutData");
		/*{
			"msgId":"WSCmdCardCaptureReq",
			"body": {
				"UserId":"uid",	"BrandType":"brandType", "CardType":"cardType",	"readType":"readType",
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
		if (uid == undefined) {
			uid = 0
		}
		
		var strSendinfo = '';
		strSendinfo = '{"msgId":"'+ WSCmdCardCaptureReq+'","body":{"UserId":"'+uid+'","BrandType":"'+brandType+'","CardType":"' + cardType + 
		'","readType":"' + readType + '","serialType":"'+ serialType +'"}';
				
		if (strSector.length > 0) {
			strSendinfo = strSendinfo + ',' + strSector + '}';
		} else {
			strSendinfo = strSendinfo + '}';
		}
		
		comLib.showLoadMask("", "카드 읽기", "", 60);
		console.log(strSendinfo);
		TFCLG_deviceWebSocket.send(strSendinfo);	
	} else {
		dialogAlert(app, "경고", "등록기 연결 실패");			
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

function onSms_getCardInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		console.log("cardlayout success");
	} else {
		dialogAlert(app, "경고", "실패"+" "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getCardInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getCardInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);	
}

/*
 * "2차 인증 " 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var cardNum = app.lookup("CardTypeLoginInfo").getValue("CardNum");
	if(cardNum.toString().length <= 0 ){
		dialogAlert(app, "경고", "카드정보가 업습니다."+" "+ "카드 정보가 없습니다.");
		return;
	}
	// 로그인 요청 하듯이 요청
	var ctlinfo = app.lookup("CardTypeLoginInfo");
	ctlinfo.setValue("UserID", TFCLG_userID);
	console.log(ctlinfo.getDatas());
	
	
	var smsPostCardTypLogin = app.lookup("sms_postCardTypLogin");
	smsPostCardTypLogin.action = "/v1/kangwonland/login/card";
	smsPostCardTypLogin.send();	
}

function onSms_postCardTypLoginSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	endFlag = 1;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.close({"Result":0});
	} else { //로그인 실패
		dialogAlert(app, "경고", "실패"+" "+ "카드 번호 로그인에 실패하였습니다. 관리자에게 문의 하세요");
		app.close({"Result":1});
	}
}

function onSms_postCardTypLoginSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

function onSms_postCardTypLoginSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onBodyDispose(/* cpr.events.CEvent */ e){
	if (endFlag == 0) {
		app.lookup("sms_logout").send(); // 프로그램 중간에 종료시 로그 아웃 처리
	}
	//
}
