/************************************************
 * vasitCardIssue.js
 * Created at 2021. 1. 30. 오전 9:38:27.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;

var VMVCI_deviceWebSocket;
var VMVCI_pageRowCount = 50;


function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var pageIndexer = app.lookup("VMVCI_piVisitCardList");	
	pageIndexer.pageRowCount = VMVCI_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	var link = app.lookup("VMVCI_sniDownloadLink");
	link.value=	"<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">"+dataManager.getString("Str_ARMYHQ_PrintServerDownloadPath")+"</a>";
	
	connectDeviceServer("127.0.0.1:9600");
	var sms_getAccessCardPrintInfoList = app.lookup("sms_getAccessCardPrintInfoList");
	sms_getAccessCardPrintInfoList.setParameters("type","visit");
	
	sms_getAccessCardPrintInfoList.send();
	
	sendVisitCardListReq();
}

function onBodyUnload(/* cpr.events.CEvent */ e){	
	if(VMVCI_deviceWebSocket != null){VMVCI_deviceWebSocket.close();VMVCI_deviceWebSocket = null;}
}

// 페이지 인덱서 페이지 클릭
function onVMVCI_piVisitCardListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	sendVisitCardListReq();
}

function sendVisitCardListReq(){
	app.lookup("AccessCardList").clear();
	var pageIndexer = app.lookup("VMVCI_piVisitCardList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * VMVCI_pageRowCount
	
	var sms_getVisitCardList = app.lookup("sms_getVisitCardList");
	sms_getVisitCardList.setParameters("offset", offset);
	sms_getVisitCardList.setParameters("limit", VMVCI_pageRowCount);
	sms_getVisitCardList.setParameters("cardType",app.lookup("VMVCI_cmbCardType").value);	
	var cardStatus = app.lookup("VMVCI_cmbCardStatus").value;
	if( cardStatus == 0 ){
		cardStatus = AccessCardStatusIssueable
	}
	sms_getVisitCardList.setParameters("accessCardStatus",cardStatus);
	sms_getVisitCardList.setParameters("managementNumber",app.lookup("VMVCI_ipbManagementNumber").value);
	sms_getVisitCardList.send();
}
// 조회 버튼 클릭
function onVMVCI_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndexer = app.lookup("VMVCI_piVisitCardList");
	pageIndexer.currentPageIndex = 1;
	sendVisitCardListReq();
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var pageIndexer = app.lookup("VMVCI_piVisitCardList");
		pageIndexer.currentPageIndex = 1;
		sendVisitCardListReq();		
	}
}

// 카드 신규 등록 클릭
function onVMVCI_btnCardRegistClick(/* cpr.events.CMouseEvent */ e){	
	var appld = "app/custom/army_hq/visitCard/visitCardRegist";
	app.openDialog(appld, {width : 500, height : 200}, function(dialog){
		dialog.headerTitle = "방문증 등록";
		dialog.modal = true;
		dialog.style.header.css("background-color", "#528443");
	}).then(function(returnValue){
		sendVisitCardListReq();
	});
}

function validateDate( value ){
	if (value==undefined||value == "0001-01-01T00:00:00Z"){return "";}
	if (value.substring(0, 10)=="0001-01-01"){return;}
	return value.substring(0, 10) +" " + value.substring(11, 19);	
}

// 방문증 리스트 가져오기 완료
function onSms_getVisitCardListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		var accessCardList = app.lookup("AccessCardList");
		var count = accessCardList.getRowCount();
		for(var i=0; i<count; i++){
			var accessCard = accessCardList.getRow(i);
			accessCard.setValue("IssueAt", validateDate(accessCard.getValue("IssueAt")));
			accessCard.setValue("RegistAt", validateDate(accessCard.getValue("RegistAt")));
		}
		accessCardList.commit();
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	var pageIndexer = app.lookup("VMVCI_piVisitCardList");
	var total = app.lookup("Total").getValue("Count");
	pageIndexer.totalRowCount = total;//total/VMVCI_pageRowCount + (total%VMVCI_pageRowCount>0);
}

// 방문증 리스트 가져오기 에러
function onSms_getVisitCardListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 방문증 리스트 가져오기 타임아웃
function onSms_getVisitCardListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

//
function onVMVCI_grdVisitCardListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.Grid	 */
	var grdVisitCardList = e.control;
	var index = grdVisitCardList.getSelectedRowIndex();
	if( index < 0 ){return;}
			
	var row = grdVisitCardList.getRow(index);
	if (row) {
		var cardStatus = row.getValue("CardStatus"); // 발급대기, 발급(재발급으로 인식)인 경우 카드 발급 가능하도록
		
		var cbxPrintSkip = app.lookup("VMVCI_cbxPrintSkip").value;
		if(cbxPrintSkip == "true"){ // 인쇄 건너뛰기의 경우. 출력대기도 카드 발급 화면을 표시해준다. 발급인 경우는 재발급의 의미로 표시...
			if( cardStatus == 1 || cardStatus == 2 || cardStatus == 3){
				app.lookup("VMVCI_grpCardInfo").visible=true;
			}else{
				app.lookup("VMVCI_grpCardInfo").visible=false;
			}
		}else{
			if( cardStatus == 2 || cardStatus == 3){
				app.lookup("VMVCI_grpCardInfo").visible=true;
			}else{
				app.lookup("VMVCI_grpCardInfo").visible=false;
			}
		}
		
		var cardType = row.getValue("CardType");
		var acpInfo;
		if (cardType == 6) {
			acpInfo = app.lookup("AccessCardPrintInfoList").findFirstRow("AccessCardType == 6");
		} else {
			acpInfo = app.lookup("AccessCardPrintInfoList").findFirstRow("AccessCardType == 7");
		}
		
		if( acpInfo ){
			app.lookup("VMVCI_ipbTextFrontTop").value = acpInfo.getValue("TextFrontTop");				
			app.lookup("VMVCI_ipbTextFrontCenterBox").value = acpInfo.getValue("TextFrontCenterBox");
			app.lookup("VMVCI_ipbTextFrontBottomBox").value = acpInfo.getValue("TextFrontBottomBox");
			app.lookup("VMVCI_ipbTextFrontBottom").value = acpInfo.getValue("TextFrontBottom");
			app.lookup("VMVCI_ipbTextBackTop").value = acpInfo.getValue("TextBackTop");
		}
	}
	app.lookup("VMVCI_opbCardSerial").value="";
}

// 인쇄 건너뛰기 클릭
function onPrintSkipValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.CheckBox	 */
	var cbxPrintSkip = e.control;
	
	var grdVisitCardList = app.lookup("VMVCI_grdVisitCardList");
	var index = grdVisitCardList.getSelectedRowIndex();
	if( index < 0 ){return;}
	var row = grdVisitCardList.getRow(index);
	
	if (row) {
		var cardStatus = row.getValue("CardStatus"); 
		if(cbxPrintSkip.value == "true"){ // 인쇄 건너뛰기의 경우. 출력대기도 카드 발급 화면을 표시해준다. 발급인 경우는 재발급의 의미로 표시...
			if( cardStatus == 1 || cardStatus == 2 || cardStatus == 3){
				app.lookup("VMVCI_grpCardInfo").visible=true;
			}else{
				app.lookup("VMVCI_grpCardInfo").visible=false;
			}
		}else{
			if( cardStatus == 2 || cardStatus == 3){
				app.lookup("VMVCI_grpCardInfo").visible=true;
			}else{
				app.lookup("VMVCI_grpCardInfo").visible=false;
			}
		}
	}
}

function connectDeviceServer(address){    
        
    VMVCI_deviceWebSocket = new WebSocket("ws://"+address+"/v1/webEntry");
    
    VMVCI_deviceWebSocket.onopen = function(message){      
    	app.lookup("VMVCI_opbMessage").value = "카드 프린터 연결 성공";   
        console.log("device server ws connected.");
    };

    VMVCI_deviceWebSocket.onclose = function(message){
    	VMVCI_deviceWebSocket = null;
        console.log("Server disconnect..."); 
    };

    VMVCI_deviceWebSocket.onerror = function(message){
        console.log("error... " + message);
        var opbMessage = app.lookup("VMVCI_opbMessage");
        if(opbMessage){
        	opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
        }      
        app.lookup("VMVCI_sniDownloadLink").visible=true;
      
    };

    VMVCI_deviceWebSocket.onmessage = function(message){
        
        var msg = JSON.parse(message.data);
        console.log("onmessage : "+msg.msgId);
        switch( msg.msgId){
        	case WSCmdCardCaptureRes:{ // 캡쳐 완료. 결과 수신.
            	comLib.hideLoadMask();	
                var result = JSON.parse(msg.body);
                
                if( result.Result == "success" ){                	
		            var opbCardSerial = app.lookup("VMVCI_opbCardSerial");
					var strCardNum = result.CardNum; // 카드번호 옮겨 담기

					if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
						if ( strCardNum.length < 8){
							strCardNum = StrLib.formattedString("00000000",String(result.CardNum), "left");	
						}
					}
					
					result.CardNum = strCardNum;					
		            opbCardSerial.value = result.CardNum; // 카드 교부 클릭시 컨트롤의 데이터를 사용
		            opbCardSerial.redraw();		           
	            } else if (result.Result=="Capture failed"){
	            	dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardCapture"));
	            } else {
	            	dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), result);	            	
	            }				
            }break;
            default: console.log(msg); break;
        }
    }
}

// 카드 인식 클릭
function onAMACI_btnCardScanClick(/* cpr.events.CMouseEvent */ e){
	var grdVisitCardList = app.lookup("VMVCI_grdVisitCardList");
	var index = grdVisitCardList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문증이 선택되지 않았습니다.");
		return;
	}
		
	var userInfo = grdVisitCardList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문증이 선택되지 않았습니다.");
		return;
	}
	app.lookup("VMVCI_opbCardSerial").value = "";
			
	var bodyData = {};
	bodyData.UserId = String(userInfo.getRowData("OwnerID"));
	bodyData.BrandType = "VIRDI";
	bodyData.CardType = "0";
	bodyData.ReadType = "0";
	bodyData.SerialType = "0";	
	
	var msgReq = {
    	msgId: String(WSCmdCardCaptureReq),
    	body: bodyData
	};
	
	var msgData = JSON.stringify(msgReq);	 	
	VMVCI_deviceWebSocket.send(msgData);
}

// 발급 버튼 클릭
function onVMVCI_btnCardIssueClick(/* cpr.events.CMouseEvent */ e){
	
	var cardSerial = app.lookup("VMVCI_opbCardSerial").value;
	if( cardSerial == undefined||cardSerial.length==0){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "카드가 인식되지 않았습니다.");
		return;
	}
	var grdVisitCardList = app.lookup("VMVCI_grdVisitCardList");
	var index = grdVisitCardList.getSelectedRowIndex();
	if( index < 0 ){return;}
	
	var cardList= app.lookup("AccessCardList");
	var row = cardList.getRow(index);
	
	if (row) {
		var visitCardInfo = app.lookup("VisitCardInfo");
		visitCardInfo.clear();
		
		visitCardInfo.setValue("CardType", row.getValue("CardType"));
		visitCardInfo.setValue("ManagementNumber", row.getValue("ManagementNumber"));
		visitCardInfo.setValue("CardStatus", 3);
		visitCardInfo.setValue("CardNumber", cardSerial);
		
		var sms_postVisitCardIssue = app.lookup("sms_putVisitCardIssue");
		sms_postVisitCardIssue.send();
	}
}

//방문증 발급 완료
function onSms_postVisitCardIssueSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {	
		dialogAlertAMHQ(app, dataManager.getString("Str_Sccess"), "발급이 완료 되었습니다.");
		sendVisitCardListReq();	
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

//방문증 발급 에러
function onSms_postVisitCardIssueSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

//방문증 발급 타임아웃
function onSms_postVisitCardIssueSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


function onVMVCI_btnCardPrintClick(/* cpr.events.CMouseEvent */ e){
	var grdVisitCardList = app.lookup("VMVCI_grdVisitCardList");
	var index = grdVisitCardList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문증이 선택되지 않았습니다.");
		return;
	}
		
	var userInfo = grdVisitCardList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문증이 선택되지 않았습니다.");
		return;
	}
	
	
	var cardStatus = userInfo.getValue("CardStatus");
	if( cardStatus == AccessCardStatusPrintReady ){
		var visitCardInfo = app.lookup("VisitCardInfo");
		visitCardInfo.setValue("CardType", userInfo.getValue("CardType"));
		visitCardInfo.setValue("ManagementNumber", userInfo.getValue("ManagementNumber"));
		visitCardInfo.setValue("CardStatus", AccessCardStatusIssueReady);		
	
		var sms_postVisitCardStatus = app.lookup("sms_postVisitCardStatus");
		sms_postVisitCardStatus.send();
		userInfo.setValue("CardStatus",AccessCardStatusIssueReady);
	}
			
	if( onCardPrintReq() == true ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "출입증 인쇄정보를 전송했습니다.");	
	}
	
	app.lookup("VMVCI_grpCardInfo").visible=true;
	
	//sendVisitCardListReq();
}

function onCardPrintReq(){	
	if ( VMVCI_deviceWebSocket == null ){		
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_DeviceConnectFailed"));
		return false;
	}
	
	// 출입신청 정보 확인
	var grdVisitCardList = app.lookup("VMVCI_grdVisitCardList");
	var index = grdVisitCardList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문증이 선택되지 않았습니다.");
		return false;
	}
		
	var row = grdVisitCardList.getRow(index);
	if (row == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문증이 선택되지 않았습니다.");
		return false;
	}
	
	// 출입증 종류별 프린트 설정 확인
	// 부서,군번,성명,사진,가족
		
	var cardType = row.getValue("CardType");		
	var managementNumber = row.getValue("ManagementNumber");
	var splitList = managementNumber.split('-');
	if( splitList.length == 2){
		splitList[0] = splitList[1];
	}
	managementNumber = Number(splitList[0]);
	
	var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
	var acpInfo;
	if (cardType == 6) {
		acpInfo = accessCardPrintInfoList.findFirstRow("AccessCardType == 6");	
	} else {
		acpInfo = accessCardPrintInfoList.findFirstRow("AccessCardType == 7");
	}
	
			
	var bodyData = {};
	
	bodyData.CardType = Number(cardType);
	bodyData.ManagementNumber = Number(managementNumber);
	
	
		
	if(acpInfo.getValue("ImageFront").length != 0){
		bodyData.ImageFront = acpInfo.getValue("ImageFront");
	}
	
	if(acpInfo.getValue("ImageBack").length != 0){
		bodyData.ImageBack = acpInfo.getValue("ImageBack");
	}
			
	var ipbTextFrontTop = app.lookup("VMVCI_ipbTextFrontTop");
	if( ipbTextFrontTop.value && ipbTextFrontTop.value.length != 0){
		bodyData.TextFrontTop = ipbTextFrontTop.value;
		bodyData.TextFrontTopColor = app.lookup("VMVCI_cmbTextFrontTopColor").value;
	}
	
	var ipbTextFrontCenterBox = app.lookup("VMVCI_ipbTextFrontCenterBox");
	if( ipbTextFrontCenterBox.value && ipbTextFrontCenterBox.value.length != 0){
		bodyData.TextFrontCenterBox = ipbTextFrontCenterBox.value;
		bodyData.TextFrontCenterBoxColor = app.lookup("VMVCI_cmbTextFrontCenterBoxColor").value;		
	}	
	
	var ipbTextFrontBottomBox = app.lookup("VMVCI_ipbTextFrontBottomBox");
	if( ipbTextFrontBottomBox.value && ipbTextFrontBottomBox.value.length != 0){
		bodyData.TextFrontBottomBox = ipbTextFrontBottomBox.value;
		bodyData.TextFrontBottomBoxColor = app.lookup("VMVCI_cmbTextFrontBottomBoxColor").value;		
	}
	
	var ipbTextFrontBottom = app.lookup("VMVCI_ipbTextFrontBottom");
	if( ipbTextFrontBottom.value && ipbTextFrontBottom.value.length != 0){
		bodyData.TextFrontBottom = ipbTextFrontBottom.value;
		bodyData.TextFrontBottomColor = app.lookup("VMVCI_cmbTextFrontBottomColor").value;		
	}
	
	var ipbTextBackTop = app.lookup("VMVCI_ipbTextBackTop");
	if( ipbTextBackTop.value && ipbTextBackTop.value.length != 0){
		bodyData.TextBackTop = ipbTextBackTop.value;
		bodyData.TextBackTopColor = app.lookup("VMVCI_cmbTextBackTopColor").value;		
	}
	
	var msgReq = {
    	msgId: String(WSCmdCardPrintReq),
    	body: bodyData
	};
	
	var msgData = JSON.stringify(msgReq);
	console.log(msgData); 	
	VMVCI_deviceWebSocket.send(msgData);
	
	return true;
}


function onPreviewButtonClick(/* cpr.events.CMouseEvent */ e){
	var grdVisitCardList = app.lookup("VMVCI_grdVisitCardList");
	var index = grdVisitCardList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문증이 선택되지 않았습니다.");
		return false;
	}
		
	var row = grdVisitCardList.getRow(index);
	if (row == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문증이 선택되지 않았습니다.");
		return false;
	}
	
	var cardType = row.getValue("CardType");
	var managementNumber = row.getValue("ManagementNumber");
	var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
	
	var acpInfo;
	if (cardType == 6) {
		acpInfo = app.lookup("AccessCardPrintInfoList").findFirstRow("AccessCardType == 6");
	} else {
		acpInfo = app.lookup("AccessCardPrintInfoList").findFirstRow("AccessCardType == 7");
	}

	var appld = "app/custom/army_hq/visitCard/visitCardPrintPreview";
	app.openDialog(appld, {width : 560, height : 550}, function(dialog){
		dialog.style.header.css("background-color", "#528443");
		dialog.headerTitle = ("방문증 인쇄 미리보기");
		dialog.initValue = {
			"FrontTop": app.lookup("VMVCI_ipbTextFrontTop").value,
			"FrontCenterBox": app.lookup("VMVCI_ipbTextFrontCenterBox").value,
			"FrontBottomBox": app.lookup("VMVCI_ipbTextFrontBottomBox").value,
			"FrontBottom": app.lookup("VMVCI_ipbTextFrontBottom").value,
			"BackTop": app.lookup("VMVCI_ipbTextBackTop").value,
			"FrontTopColor": app.lookup("VMVCI_cmbTextFrontTopColor").value,
			"FrontCenterBoxColor": app.lookup("VMVCI_cmbTextFrontCenterBoxColor").value,
			"FrontBottomBoxColor": app.lookup("VMVCI_cmbTextFrontBottomBoxColor").value,
			"FrontBottomColor": app.lookup("VMVCI_cmbTextFrontBottomColor").value,
			"BackTopColor": app.lookup("VMVCI_cmbTextBackTopColor").value,
			"ImageFront": acpInfo.getValue("ImageFront"),
			"ImageBack": acpInfo.getValue("ImageBack"),
			"managementNumber": managementNumber
		};
			
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != null ){
		}
	});	
		
}

/*
 * "단말기선택" 버튼(AMCCR_btnCardScan)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMCCR_btnCardScanClick(/* cpr.events.CMouseEvent */ e){
	var grdVisitCardList = app.lookup("VMVCI_grdVisitCardList");
	var dsAccessCardInfo = app.lookup("UserCardInfo");
	
	var index = grdVisitCardList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var userInfo = grdVisitCardList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	
	var appld = "app/custom/army_hq/users/userCardRegist";
	
	app.lookup("VMVCI_opbCardSerial").value = "";
	
	app.getRootAppInstance().openDialog(appld, {width: 640,height: 490}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_ARMYHQ_CardScan");
		dialog.initValue = {
			"userID": userInfo.getValue("OwnerID"),
			"UserCardInfo": dsAccessCardInfo,
			"Mode": "Regist",
			"Url": "/v1"
		};
		dialog.style.header.css("background-color", "#528443");
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) {		
		var dsAccessCardInfo = app.lookup("UserCardInfo");
		dsAccessCardInfo.clear();
		
		if(returnValue.length>1){
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "한 개의 카드를 입력해 주세요.");
			return;
		}
		
		for (var i = 0; i < returnValue.length; i++) {
			dsAccessCardInfo.addRowData(returnValue[i]);
		}
	});
}
