/************************************************
 * setFingerPrintCardLayoutFormat.js
 * Created at 2019. 8. 13. 오후 8:11:24.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var deviceWebSocket;
	
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);	
	dataManager = getDataManager();
	
	// 브랜드 타입이 nitgen 이면 무조건 전부 disable
	var brandType = dataManager.getSystemBrandType();
	if (brandType == BRAND_NITGEN) {
		controlDisable();
		app.lookup("SFPCF_sniDownloadLink").visible = false;
		return;
	}
	var link = app.lookup("SFPCF_sniDownloadLink"); // 디바이스 서버 설치 프로그램
	link.value=	"<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">"+dataManager.getString("Str_DeviceServerDownloadPath")+"</a>";
	
	app.lookup("SFPCF_opbMessage").value = dataManager.getString("Str_HamsterConnectTry");
	connectDeviceServer("127.0.0.1:9600"); // 카드 서버 연결
}

function connectDeviceServer(address) {
	deviceWebSocket = new WebSocket("ws://"+address+"/v1/webEntry");
	
	 deviceWebSocket.onopen = function(message){      
    	app.lookup("SFPCF_opbMessage").value = dataManager.getString("Str_HamsterConnected");          
        console.log("device server ws connected.");
    };
    
     deviceWebSocket.onclose = function(message){
    	deviceWebSocket = null;
        console.log("\Server disconnect..."); 
    };
    
    deviceWebSocket.onerror = function(message){
        console.log("error... " + message);
        app.lookup("SFPCF_opbMessage").value = dataManager.getString("Str_DeviceServerInstallRequired");
        var link = app.lookup("SFPCF_sniDownloadLink");
        link.visible=true;
    };
    
    deviceWebSocket.onmessage = function(message){
        
        var msg = JSON.parse(message.data);
        
        switch( msg.msgId){                       
            case WSCmdCardLayoutWritingRes:{ //카드 레이아웃 라이팅 완료 
            	comLib.hideLoadMask();	
                var result = JSON.parse(msg.body);
                
                if( result.Result == "success" ){
                	//TODO: 라이팅 성공에 대한 처리 작업 진행
                	console.log(result.CardNum);
	            } else if (result.Result=="Capture failed"){
	            	dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardCapture")); // 라이팅 실패 처리
	            } else {
	            	dialogAlert(app, dataManager.getString("Str_Failed"), result.Result);	            	
	            }
				
            }break;
            
            default: console.log(msg); break;
        }
    } 
}
//---------------------------------------------------------------------------------------------------------------------------------------<

function onSms_getCardInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var nCardType = app.lookup("dmCardLayoutInfo").getValue("CardType");
		if (nCardType != 1) { // 지문카드 아니다 전부 Disable 처리
			//TODO: TDS_NONE_FPCARDLAYOUT
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorFPCardLayoutNotSetting")); // Layout definition failure	
			controlDisable();
		} else {
			var dsCardlayoutdata = app.lookup("dsCardLayoutData");
			if (dsCardlayoutdata == null) {
				return;
			}
			var grdFingerCardLayoutDataList = app.lookup("grdFingerCardLayoutDataList"); // 그리드 관리할 데이터셋		
			var index = dsCardlayoutdata.getRowCount(); 
			for (var i = 0 ; i < index; i++) {
				var rowData = dsCardlayoutdata.getRow(i); // Row Data
				var sector = ""+rowData.getValue("Sector"); // 섹터
				var strSector = StrLib.formattedString("000",String(sector), "left");
				var nKeyType = rowData.getValue("KeyType");
				var strKeyType = "";
				if (nKeyType == 96) { //0x60
					strKeyType = "A";
				} else {
					strKeyType = "B";
				}
				var nBlock = rowData.getValue("Block");
				var tmpKeyValue = rowData.getValue("KeyValue");
				var strKeyValue = tmpKeyValue.substr(0, 2) + " " + tmpKeyValue.substr(2, 2) + " " + tmpKeyValue.substr(4, 2) + " " +
				 tmpKeyValue.substr(6, 2) + " " + tmpKeyValue.substr(8, 2) + " " + tmpKeyValue.substr(10, 2) + " " + tmpKeyValue.substr(12, 2);
				 grdFingerCardLayoutDataList.addRowData({"strSector": strSector, "nBlock": Number(nBlock),"nKeyType":strKeyType, "SiteKey":strKeyValue});
			}
		}
	} else {	//TODO: 에러 로그 처리
		//dialogAlert(app, dataManager.getString("Str_Failed"), " 실 패 "); // 라이팅 실패 처리
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode))); // 라이팅 실패 처리
	}
	app.lookup("SFPCF_grpMain").redraw();
}

function onSms_getCardInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getCardInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

//---------------------------------------------------------------------------------------------------------------------------------------
function controlDisable() {
	app.lookup("SFPCF_opbMessage").enabled = false;
	//app.lookup("SFPCF_sniDownloadLink").enabled = false;
	app.lookup("SFPCF_grpRegistedCardLayout").enabled = false;
	app.lookup("SFPCF_grdRegistedCardLayoutSectorList").enabled = false;
	app.lookup("SFPCF_grpIssuedCardNumList").enabled = false;
	app.lookup("SFPCF_grdIssuedCardNumList").enabled = false;
	app.lookup("SFPCF_btnIssueCardNum").enabled = false;
}

/*
 * {"msgId":"WSCmdCardLayoutWritingReq","body": {"BrandType":"brandType"},"sectorData":[{"Index": "0","Sector": "0","Block": "0","KeyType": 96","KeyValue": "ffffffffffff",},{...}] 
		}
 */
		
function onSFPCF_btnIssueCardNumClick(/* cpr.events.CMouseEvent */ e){
	var brandType = ( dataManager.getSystemBrandType() == BRAND_NITGEN) ?"NITGEN":"VIRDI";
	if(deviceWebSocket){
		var dsCardlayoutDataList = app.lookup("dsCardLayoutData");
		
		var strSector = '';
		var RowCnt = dsCardlayoutDataList.getRowCount();
		for (var i= 0; i< RowCnt;i++) {
			if (i == 0) { // 제일 처음
				strSector = '"sectorData":[{';
			} else {
				strSector = strSector + ',{'
			}
			var rowData = dsCardlayoutDataList.getRow(i);
			strSector = strSector +  '"Index":"' +  rowData.getValue("Index") + '","Sector":"' + rowData.getValue("Sector") +  + '","Block":"' + 
				rowData.getValue("Block") + '","KeyType":"' + rowData.getValue("KeyType") + '","KeyValue":"' + rowData.getValue("KeyValue") + '"}';
		}
		
		if(RowCnt > 0 ) {
			strSector = strSector + "]";	
		}
		var strSendinfo = '{"msgId":"'+ WSCmdCardLayoutWritingReq+'","body":{"BrandType":"'+brandType+ '"}';
		if (strSector.length > 0) {
			strSendinfo = strSendinfo + ',' + strSector + '}';
		} else {
			strSendinfo = strSendinfo + '}';
		}
		
		comLib.showLoadMask("", dataManager.getString("Str_CardLayoutWriteRequest"), "", 60);
		console.log(strSendinfo);
		//deviceWebSocket.send(strSendinfo);	
	} else {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterConnectFailed"));			
	}
}	
