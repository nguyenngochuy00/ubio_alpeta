/************************************************
 * visitCardIssuance.js
 * Created at 2021. 2. 1. 오전 11:59:17.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

var VMVIS_deviceWebSocket;
var VMVIS_pageRowCount = 50;
var VMVIS_cardTarget; // AccessCardTypeOtherUnit:공무원증(타부대원), 2:AccessCardTypeForeign:방문증
var VMVIS_cardValidation; // 0 : 미등록카드(방문증), 1: 등록된 카드, 2: 미등록카드(공무원증)

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var cmbUserGroup = app.lookup("VMVIS_cmbGroup");
	cmbUserGroup.setItemSet(dataManager.getGroup(), {
		label: "Name",
		value: "GroupID"		
	});
	cmbUserGroup.addItem(new cpr.controls.Item("------", 0));
	cmbUserGroup.selectItemByValue(0);
	
	var pageIndexer = app.lookup("VMVIS_piVisitorList");	
	pageIndexer.pageRowCount = VMVIS_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	var link = app.lookup("VMVIS_sniDownloadLink");
	link.value=	"<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">"+dataManager.getString("Str_ARMYHQ_PrintServerDownloadPath")+"</a>";
	
	connectDeviceServer("127.0.0.1:9600");
	
	sendAccessApplicationListReq();
}

function onBodyUnload(/* cpr.events.CEvent */ e){	
	if(VMVIS_deviceWebSocket != null){VMVIS_deviceWebSocket.close();VMVIS_deviceWebSocket = null;}
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onAMACI_btnVisitorSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndexer = app.lookup("VMVIS_piVisitorList");	
	pageIndexer.currentPageIndex = 1;//한 페이지에 보여 줄 행의 수	
	sendAccessApplicationListReq();
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var pageIndexer = app.lookup("VMVIS_piVisitorList");	
		pageIndexer.currentPageIndex = 1;//한 페이지에 보여 줄 행의 수	
		sendAccessApplicationListReq();		
	}
}

function sendAccessApplicationListReq(){
	
	app.lookup("VMVIS_cmbVisitorUserType").value = "";
	app.lookup("VMVIS_opbVisitorName").value = ""		
	app.lookup("VMVIS_opbVisitorServiceNumber").value = "";
	app.lookup("VMVIS_opbVisitPhone").value = "";			
	app.lookup("VMVIS_opbVisitorPosition").value = "";
	app.lookup("VMVIS_opbVisitPurpose").value = "";
	app.lookup("VMVIS_opbVisitorGroup").value = "";
				 
	app.lookup("VMVIS_opbVisitorVisitStart").value = "";
	app.lookup("VMVIS_opbVisitorVisitEnd").value = "";
		
	app.lookup("VMVIS_opbCarNumber").value = "";
	app.lookup("VMVIS_opbCarType").value = "";
		
	app.lookup("VMVIS_opbTargetName").value = "";
	app.lookup("VMVIS_opbTargetGroup").value = "";
						
	app.lookup("VMVIS_opbVisitCardServiceNumber").value="";
	app.lookup("VMVIS_opbVisitCardManagementNumber").value="";
	
	app.lookup("VMVIS_optVisitorAccessGroup").value="";
	
	
	app.lookup("UserAccessApplications").clear();
	
	var pageIndexer = app.lookup("VMVIS_piVisitorList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * VMVIS_pageRowCount;
	
	var sms_getAccessApplicationList = app.lookup("sms_getAccessApplicationList");
	sms_getAccessApplicationList.setParameters("applicationStatus", AccessApplicationStatusApproval);
	sms_getAccessApplicationList.setParameters("accessCardStatus", AccessCardStatusIssueOrRetrive);
	sms_getAccessApplicationList.setParameters("group", app.lookup("VMVIS_cmbGroup").value);
	sms_getAccessApplicationList.setParameters("userType", app.lookup("VMVIS_cmbUserType").value);	
	var applicationType = app.lookup("VMVIS_cmpApplicationType").value;
	if(applicationType == 0 ){applicationType=AccessApplicationTypeVisit;}	
	sms_getAccessApplicationList.setParameters("applicationType",applicationType );
	sms_getAccessApplicationList.setParameters("userName", app.lookup("VMVIS__ipbName").value);	
	sms_getAccessApplicationList.setParameters("offset", offset);
	sms_getAccessApplicationList.setParameters("limit", VMVIS_pageRowCount);
	sms_getAccessApplicationList.setParameters("expire", 3);
	
	
			
	sms_getAccessApplicationList.send();
}

//방문신청 리스트 가져오기 완료
function onSms_getAccessApplicationListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {	
			var pageIndexer = app.lookup("VMVIS_piVisitorList");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;//total/VMVCI_pageRowCount + (total%VMVCI_pageRowCount>0);
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

// 방문자 목록 선택시
function onVMVIS_grdVisitorListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.Grid	 */		
	var grdVisitorList = e.control;
	var index = grdVisitorList.getSelectedRowIndex();
	if( index < 0 ){return;}
	var applicationList = app.lookup("UserAccessApplications");
	var applicationInfo = applicationList.getRow(index);
	if (applicationInfo) {
		app.lookup("VMVIS_cmbVisitorUserType").value = applicationInfo.getValue("UserType");
		app.lookup("VMVIS_opbVisitorName").value = applicationInfo.getValue("Name");
		var serviceNumber = applicationInfo.getValue("ServiceNumber");
		if(serviceNumber == undefined || serviceNumber.length ==0){
			serviceNumber = applicationInfo.getValue("Birthday");
		}
		app.lookup("VMVIS_opbVisitorServiceNumber").value = serviceNumber;
		var serviceNumber = applicationInfo.getValue("ServiceNumber");
		app.lookup("VMVIS_opbVisitPhone").value = applicationInfo.getValue("Mobile");
		
		var position= applicationInfo.getValue("Position");
		position = dataManager.getPositionName(position);
		if(position.length==0){
			position = applicationInfo.getValue("UserClass");
		}	
		app.lookup("VMVIS_opbVisitorPosition").value = position;
		app.lookup("VMVIS_opbVisitPurpose").value = applicationInfo.getValue("VisitPurpose");
		app.lookup("VMVIS_opbVisitorGroup").value = applicationInfo.getValue("Address");
		
		var accessStart = applicationInfo.getValue("AccessStart");
		//accessStart = accessStart.substring(0, 10) +" " + accessStart.substring(11, 19);
		accessStart = accessStart.substring(0, 10); // 날짜만 보이도록 수정 - pse
		app.lookup("VMVIS_opbVisitorVisitStart").value = accessStart;
		
		var accessEnd= applicationInfo.getValue("AccessEnd");
		//accessEnd = accessEnd.substring(0, 10) +" " + accessEnd.substring(11, 19);
		accessEnd = accessEnd.substring(0, 10); // 날짜만 보이도록 수정 - pse
		app.lookup("VMVIS_opbVisitorVisitEnd").value = accessEnd;
		
		app.lookup("VMVIS_opbCarNumber").value = applicationInfo.getValue("CarNumber");
		app.lookup("VMVIS_opbCarType").value = applicationInfo.getValue("CarType");
		
		app.lookup("VMVIS_opbTargetName").value = applicationInfo.getValue("VisitTargetName");
		app.lookup("VMVIS_opbTargetGroup").value = applicationInfo.getValue("VisitTargetGroup");
		
		var terminalList = app.lookup("TerminalsInfo");
		terminalList.clear();
		
		var accessCardInfo = app.lookup("AccessCardInfo");
		accessCardInfo.clear();
		
		app.lookup("VMVIS_opbVisitCardServiceNumber").value="";
		app.lookup("VMVIS_opbVisitCardManagementNumber").value="";
		
		
//		var smsGetTerminalList = app.lookup("sms_getTerminalList");	
//		smsGetTerminalList.setParameters("limit", 1000);
//		smsGetTerminalList.setParameters("offset", 0);		
//		smsGetTerminalList.action = "/v1/accessGroups/"+applicationInfo.getValue("AccessGroup")+"/terminals";
//		smsGetTerminalList.send();	
		getAccessArea(applicationInfo.getValue("AccessGroup"));
	}
}

//출입장소 가져오기 완료
function onSms_getTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		var accessArea = "";	
		var terminalList = app.lookup("TerminalsInfo");
		for( var i = 0; i < terminalList.getRowCount();i++){
			var terminalInfo = terminalList.getRow(i);
			if(accessArea.length>0){
				accessArea += ", ";
			}
			accessArea += terminalInfo.getValue("Name");
		}
		app.lookup("VMVIS_optVisitorAccessGroup").value = accessArea;
		
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

function connectDeviceServer(address){    
        
    VMVIS_deviceWebSocket = new WebSocket("ws://"+address+"/v1/webEntry");
    
    VMVIS_deviceWebSocket.onopen = function(message){      
    	app.lookup("VMVIS_opbDeviceMsg").value = "카드 리더기 연결 성공";   
        console.log("device server ws connected.");
    };

    VMVIS_deviceWebSocket.onclose = function(message){
    	VMVIS_deviceWebSocket = null;
        console.log("Server disconnect..."); 
    };

    VMVIS_deviceWebSocket.onerror = function(message){
        console.log("error... " + message);
        var opbMessage = app.lookup("VMVIS_opbDeviceMsg");
        if(opbMessage){
        	opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
        }      
        app.lookup("VMVIS_sniDownloadLink").visible=true;
      
    };

    VMVIS_deviceWebSocket.onmessage = function(message){
        
        var msg = JSON.parse(message.data);
        console.log("onmessage : "+msg.msgId);
        switch( msg.msgId){
        	case WSCmdCardCaptureRes:{ // 캡쳐 완료. 결과 수신.
            	comLib.hideLoadMask();	
                var result = JSON.parse(msg.body);
                
                if( result.Result == "success" ){  
		            var opbCardSerial;
		            if(VMVIS_cardTarget==AccessCardTypeOtherUnit){ opbCardSerial = app.lookup("VMVIS_opbVisitCardServiceNumber");}
		            else{opbCardSerial = app.lookup("VMVIS_opbVisitCardManagementNumber");}
		            
		            var accessCardInfo = app.lookup("AccessCardInfo");
					accessCardInfo.setValue("CardNumber", result.CardNum);
					
		            opbCardSerial.value = result.CardNum; // 카드 교부 클릭시 컨트롤의 데이터를 사용
		            opbCardSerial.redraw();	
		            sendVisitCardListReq(result.CardNum);		            	           
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

function onCardSendClick(target){
	VMVIS_cardValidation = 0;
	VMVIS_cardTarget = target;
	var grdVisitorList = app.lookup("VMVIS_grdVisitorList");
	var index = grdVisitorList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문자가 선택되지 않았습니다.");
		return;
	}
		
	var userInfo = grdVisitorList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문자가 선택되지 않았습니다.");
		return;
	}
		
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
	VMVIS_deviceWebSocket.send(msgData);
}

function onTerminalCardSendClick(target){
	VMVIS_cardValidation = 0;
	VMVIS_cardTarget = target;
	
	var grdVisitorList = app.lookup("VMVIS_grdVisitorList");
	
	var index = grdVisitorList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문자가 선택되지 않았습니다.");
		return;
	}
		
	var userInfo = grdVisitorList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문자가 선택되지 않았습니다.");
		return;
	}
	
	var CardSerial = app.lookup("UserCardInfo");
	var appld = "app/custom/army_hq/users/userCardRegist";
		
	app.getRootAppInstance().openDialog(appld, {width: 640,height: 490}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_ARMYHQ_CardScan");
		dialog.style.header.css("background-color", "#528443");
		dialog.initValue = {
			"userID": userInfo.getValue("OwnerID"),
			"UserCardInfo": CardSerial,
			"Mode": "Regist",
			"Url": "/v1"
		};
		dialog.resizable = false;
		dialog.modal = true;
	}).then(function(returnValue) {
		
		if(returnValue.length>1){
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "한 개의 카드를 입력해 주세요.");
			return;
		}		
		
		for (var i = 0; i < returnValue.length; i++) {
			CardSerial.addRowData(returnValue[i]);
		}
		var opbCardSerial;
		var CardNum = CardSerial.getValue(0, "CardNum");
		console.log("CardNum : " + CardNum);
		if(VMVIS_cardTarget==AccessCardTypeOtherUnit){ 
			CardSerial.clear();
			opbCardSerial = app.lookup("VMVIS_opbVisitCardServiceNumber");
			opbCardSerial.value = CardNum; 
			opbCardSerial.redraw();	
			var accessCardInfo = app.lookup("AccessCardInfo");
			accessCardInfo.setValue("CardNumber",CardNum);
	
			sendVisitCardListReq(CardNum);		
		} else {
			CardSerial.clear();
			opbCardSerial = app.lookup("VMVIS_opbVisitCardManagementNumber");
			opbCardSerial.value = CardNum; 
			opbCardSerial.redraw();	
			var accessCardInfo = app.lookup("AccessCardInfo");
			accessCardInfo.setValue("CardNumber",CardNum);
	
			sendVisitCardListReq(CardNum);			
		}
	});
}

// 공무원증 인식 클릭
function onVMVIS_btnServiceCardScanClick(/* cpr.events.CMouseEvent */ e){
	app.lookup("VMVIS_opbVisitCardServiceNumber").value = "";
	app.lookup("VMVIS_opbVisitCardManagementNumber").value = "";
	onCardSendClick(AccessCardTypeOtherUnit);
}

// 공무원증 단말기선택 클릭
function onVMVIS_btnServiceCardScanClick2(/* cpr.events.CMouseEvent */ e){
	app.lookup("VMVIS_opbVisitCardServiceNumber").value = "";
	app.lookup("VMVIS_opbVisitCardManagementNumber").value = "";
	onTerminalCardSendClick(AccessCardTypeOtherUnit);
}

// 방문증 인식 클릭
function onVMVIS_btnVisitCardScanClick(/* cpr.events.CMouseEvent */ e){	
	app.lookup("VMVIS_opbVisitCardServiceNumber").value = "";
	app.lookup("VMVIS_opbVisitCardManagementNumber").value = "";
	onCardSendClick(AccessCardTypeForeign);	
}

// 방문증 단말기선택 클릭
function onVMVIS_btnVisitCardScanClick2(/* cpr.events.CMouseEvent */ e){	
	app.lookup("VMVIS_opbVisitCardServiceNumber").value = "";
	app.lookup("VMVIS_opbVisitCardManagementNumber").value = "";
	onTerminalCardSendClick(AccessCardTypeForeign);	
}

function sendVisitCardListReq(cardNumber){
	app.lookup("AccessCardList").clear();
		
	var sms_getVisitCardList = app.lookup("sms_getVisitCardList");
	sms_getVisitCardList.setParameters("offset", 0);
	sms_getVisitCardList.setParameters("limit", 1);
	sms_getVisitCardList.setParameters("cardNum",cardNumber);
	
	sms_getVisitCardList.send();
}

// 카드 검색 결과 가져오기 완료
function onSms_getVisitCardListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	VMVIS_cardValidation = 0
	
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		var accessCardList = app.lookup("AccessCardList");
		
		if( accessCardList.getRowCount()> 0 ){ // 출입증 정보를 찾은 경우
			var accessCardInfo = accessCardList.getRow(0);
			var cardStatus = accessCardInfo.getValue("CardStatus");
			
			/*
			 * globals.AccessCardStatusNone       = 0 // 미사용
globals.AccessCardStatusPrintReady = 1 // 출력대기
globals.AccessCardStatusIssueReady = 2 // 발급 대기 
globals.AccessCardStatusIssue      = 3 // 발급 
globals.AccessCardStatusIssuance   = 4 // 교부
globals.AccessCardStatusRetrive    = 5 // 회수
globals.AccessCardStatusAccident   = 6 // 사고
globals.AccessCardStatusStopUsing  = 7 // 사용중단
			 * 
			 */
			console.log("cardStatus");
			console.log(cardStatus);
			if( cardStatus == AccessCardStatusIssue || cardStatus == AccessCardStatusRetrive ||
			cardStatus == AccessCardStatusExpiration || cardStatus == AccessCardStatusForcedRetrive){ // 발급이나 회수, 강제회 상태인 경우 교부 가능
			
				var grdVisitorList = app.lookup("VMVIS_grdVisitorList");
				var index = grdVisitorList.getSelectedRowIndex();
				
				var applicationList = app.lookup("UserAccessApplications");
				var applicationInfo = applicationList.getRow(index);
				
				if(VMVIS_cardTarget==AccessCardTypeOtherUnit){//공무원증
					// 생년월일과 공무원증 비교 로직 삭제 -mjy
					VMVIS_cardValidation = 1
					app.lookup("VMVIS_opbVisitCardServiceNumber").value = accessCardInfo.getValue("ManagementNumber");	
					
					var dmAccessCardInfo = app.lookup("AccessCardInfo");	
					dmAccessCardInfo.setValue("CardType",accessCardInfo.getValue("CardType"));		
					dmAccessCardInfo.setValue("CardTypeEx",CivilServiceCardVisit);			
					dmAccessCardInfo.setValue("ManagementNumber", accessCardInfo.getValue("ManagementNumber"));
//					var birthday = applicationInfo.getValue("Birthday");
//										
//					birthday = birthday.replace(/-/gi,"");
//					birthday = birthday.substring(2, 8);
//					
//					var cardNum = app.lookup("VMVIS_opbVisitCardServiceNumber").value;
//					cardNum = cardNum.substring(0, 6);
//					
//					console.log(birthday,cardNum);
//					if(birthday==cardNum){ // 공무원증 정보 일치
//					}else{ // 공무원증 신규 등록
//						dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "해당 등록자의 공무원증이 아닙니다.");
//					}								
				}else{
					VMVIS_cardValidation = 1
					var dmAccessCardInfo = app.lookup("AccessCardInfo");	
					dmAccessCardInfo.setValue("CardType",accessCardInfo.getValue("CardType"));									
					dmAccessCardInfo.setValue("ManagementNumber", accessCardInfo.getValue("ManagementNumber"));
					
					app.lookup("VMVIS_opbVisitCardManagementNumber").value = accessCardInfo.getValue("ManagementNumber");
				}	
			}else{ 
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "교부되었거나 교부할 수 없는 카드입니다.");
			}
		} else { // 등록된 출입증 정보가 없는 경우.
			if(VMVIS_cardTarget==AccessCardTypeOtherUnit){ // 공무원증 신규 등록
				var grdVisitorList = app.lookup("VMVIS_grdVisitorList");
				var index = grdVisitorList.getSelectedRowIndex();
				if( index > -1 ){
					var applicationList = app.lookup("UserAccessApplications");
					var applicationInfo = applicationList.getRow(index);
					if (applicationInfo) {
						// 생년월일과 공무원증 비교 로직 삭제 -mjy
						VMVIS_cardValidation = 2	
						var dmAccessCardInfo = app.lookup("AccessCardInfo");	
						dmAccessCardInfo.setValue("CardType",AccessCardTypeCivilService);									
						dmAccessCardInfo.setValue("CardTypeEx",CivilServiceCardVisit);		
														
//						var birthday = applicationInfo.getValue("Birthday");
//						birthday = birthday.replace(/-/gi,"");
//						birthday = birthday.substring(2, 8);
//					
//						var cardNum = app.lookup("VMVIS_opbVisitCardServiceNumber").value;
//						cardNum = cardNum.substring(0, 6);
//						if( birthday == cardNum ){ // 공무원증 정보 일치. 신규 등록 처리
//						}else{					
//							dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "해당 등록자의 공무원증이 아닙니다.");
//						}
					}else{
						dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "등록된 카드가 아닙니다.");
					}								
				} else {
					dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "등록된 카드가 아닙니다.");
				}
			}else{
				dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "등록된 카드가 아닙니다.");
			}
		}
		
	} else {	
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

// 교부 버튼 클릭
function onVMVIS_btnIssuanceClick(/* cpr.events.CMouseEvent */ e){	
	var grdVisitorList = app.lookup("VMVIS_grdVisitorList");
	var index = grdVisitorList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문자가 선택되지 않았습니다.");
		return;
	}
		
	var applicationInfo = grdVisitorList.getRow(index);
	if (applicationInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "방문자가 선택되지 않았습니다.");
		return;
	}
	
	if( VMVIS_cardValidation == 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "카드가 인식되지 않았습니다.");
		return;
	}
	
	// 출입신청
	var accessCardInfo = app.lookup("AccessCardInfo");
	
	accessCardInfo.setValue("ApplicationIndex",applicationInfo.getValue("ApplicationIndex"));
		
	accessCardInfo.setValue("CardStatus",AccessCardStatusIssuance);
	accessCardInfo.setValue("OwnerID",applicationInfo.getValue("UserID"));
	accessCardInfo.setValue("OwnerName",applicationInfo.getValue("Name"));	
	
	var position= applicationInfo.getValue("Position");
	position = dataManager.getPositionName(position);
	if(position.length==0){
		position = applicationInfo.getValue("UserClass");
	}
	accessCardInfo.setValue("OwnerPosition",position);	
	accessCardInfo.setValue("OwnerGroup",applicationInfo.getValue("Address"));
	accessCardInfo.setValue("OwnerServiceNumber",applicationInfo.getValue("ServiceNumber"));
	accessCardInfo.setValue("OwnerBirthday",applicationInfo.getValue("Birthday"));
	accessCardInfo.setValue("Description",app.lookup("VMVIS_ipbDescription").value);
		
	var sms_putVisitCard = app.lookup("sms_putVisitCard");
	sms_putVisitCard.send();
}

// 교부 완료 (업데이트)
function onSms_putVisitCardSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {	
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "방문증이 교부 되었습니다.");
		sendAccessApplicationListReq();
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

// 교부 완료 (신규추가 )
function onSms_postVisitCardSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {	
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "방문증이 교부 되었습니다.");
		sendAccessApplicationListReq();
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onVMVIS_piVisitorListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var vMVIS_piVisitorList = e.control;
	sendAccessApplicationListReq();
}

/*
 * 터미널 ID 대신 출입구역으로 출력.
 * 방문신청자의 출입그룹에 맞는 출입구역을 찾는다. - mjy
 */
function getAccessArea(accessGroupID) {
		var accessAreaList = dataManager.getAccessArea();
		var accessAreaGroupList = dataManager.getAccessAreaGroup();
		
		var accessArea = ""
		var condition = "AccessGroupID == " + accessGroupID;
		
		var AccessAreaRows = accessAreaGroupList.findAllRow(condition);
		AccessAreaRows.forEach(function(each){
			condition = "ID == " + each.getValue("AccessAreaID");
			var AccessAreaRow = accessAreaList.findFirstRow(condition);
			if(accessArea.length > 0){
				accessArea += ", ";
			}
			accessArea += AccessAreaRow.getValue("Name");			
		});
		
		app.lookup("VMVIS_optVisitorAccessGroup").value = accessArea;
}

