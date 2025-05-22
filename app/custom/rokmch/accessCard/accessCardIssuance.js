/************************************************
 * accessCardIssuance.js
 * Created at 2021. 2. 5. 오전 10:12:10.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var comLib;
var AMACI_pageRowCount = 50;
var AMACI_deviceWebSocket;
var ACMTP_templateIndex;
var loginPrivilege = 0; // (0: 사용자, 1: 관리자, 2: 승인자)
var USINT_fpModified; // 사용자가 지문 데이터를 수정 했는지 여부
var USFPR_templateFormat= 3; //ISO 템플릿 포멧 추가

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	USFPR_templateFormat = dataManager.getClientOption().getValue("TemplateFormat");
	console.log("templateType : " + USFPR_templateFormat);
	
	var link = app.lookup("AMACI_sniDownloadLink");
	link.value=	"<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">"+dataManager.getString("Str_ARMYHQ_PrintServerDownloadPath")+"</a>";
		
	app.lookup("AMACI_opbDeviceMsg").value = dataManager.getString("Str_ARMYHQ_DeviceConnectTry");
	
	connectDeviceServer("127.0.0.1:9600");
	
	var accountInfo = dataManager.getAccountInfo();
	var privilege = Number(accountInfo.getValue("Privilege"));
	console.log("privilege", privilege)
	if (privilege == 1) { // 관리자일 경우
		loginPrivilege = 1;
		app.lookup("AMACI_btnDelete").visible = true;
	}
	
	initControls();	
	
	var sms_getAccessApplicationList = app.lookup("sms_getAccessApplicationList");
	sms_getAccessApplicationList.setParameters("applicationStatus", AccessApplicationStatusApproval);	
	sms_getAccessApplicationList.setParameters("accessCardStatus", AccessCardStatusIssueOrRetrive);
	sms_getAccessApplicationList.setParameters("userType", 10003);
	sms_getAccessApplicationList.send();
}

function initControls(){
	var pageIndexer = app.lookup("AMACI_piAccessApplication");	
	pageIndexer.pageRowCount = AMACI_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
		
	var cmbGroup = app.lookup("AMACI_cmbGroup");
	if (isLoginMaster()){ // 24년도부터 Master를 제외한 관리자는 본인 부서 + 하위 부서만 관리 가능
		cmbGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID"});
		cmbGroup.addItem(new cpr.controls.Item("------", 0));	
	} else {
		cmbGroup.setItemSet(dataManager.getLoginUserGroups(), {label: "Name",	value: "GroupID"});
	}
	cmbGroup.selectItemByValue(getLoginUserGroupCode());
	
	var cmdGrdGroup = app.lookup("AMACI_cmdGrdPersonnelListGroup");
	cmdGrdGroup.setItemSet(dataManager.getGroup(),{label:"Name",value:"GroupID"});			
	var cmdGrdPosition = app.lookup("AMACI_cmdGrdPersonnelListPosition");
	cmdGrdPosition.setItemSet(dataManager.getPositionList(),{label: "Name",value:"PositionID"}); 	
 	var cmbUserGroup = app.lookup("AMACI_cmbPersonnelInfoUserGroup");
	cmbUserGroup.setItemSet(dataManager.getGroup(),{label:"Name",value:"GroupID"});
	var cmbPosition = app.lookup("AMACI_cmbPersonnelInfoPosition");
	cmbPosition.setItemSet(dataManager.getPositionList(), {label: "Name", value:"PositionID"});
}

function onBodyUnload(/* cpr.events.CEvent */ e){
	if(AMACI_deviceWebSocket != null){AMACI_deviceWebSocket.close();AMACI_deviceWebSocket = null;}	
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

// 출입자 목록 가져오기 완료
function onSms_getAccessApplicationListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		if( app.lookup("UserAccessApplications").getRowCount() == 0 ){
			//dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_NoSearchResult"));
		}		
		sendAccessCardUserInfoReq();
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function clearPersonnelDetail(){
	app.lookup("AMACI_cmbPersonnelInfoUserType").value = "";
	app.lookup("AMACI_opbPersonnelInfoName").value = "";
	app.lookup("AMACI_opbPersonnelInfoServiceNumber").value = "";
	app.lookup("AMACI_cmbPersonnelInfoPosition").value = "";
	app.lookup("AMACI_cmbPersonnelInfoUserGroup").value = "";
		
	app.lookup("AMACI_opbPersonnelInfoAccessStart").value = "";
	app.lookup("AMACI_opbPersonnelInfoAccessEnd").value = "";
	app.lookup("AMACI_opbAccessGroup").value ="";
	
	app.lookup("AMACI_cmbPersonnelInfoAccessCardType").value = "";
	app.lookup("AMACI_opbPersonnelInfoManagementNumber").value = "";
	
	app.lookup("AMACI_opbPersonnelInfoCardSerial").value = "";
	app.lookup("AMACI_opbPersonnelInfoFPInfo").value = "";
}

// 출입자 조회 클릭
function onAMACI_btnPersonnelListSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndexer = app.lookup("AMACI_piAccessApplication");
	pageIndexer.currentPageIndex = 1;
	sendAccessCardUserInfoReq();
}

//function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
//	if(e.keyCode == 13) {
//		var pageIndexer = app.lookup("AMACI_piAccessApplication");
//		pageIndexer.currentPageIndex = 1;
//		sendAccessCardUserInfoReq();
//	}
//}

// 검색어 2글자 이상 팝업 제대로 보이도록 keydown을 keyup으로 변경 - pse 
function onAMACI_ipbNameKeyup(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var pageIndexer = app.lookup("AMACI_piAccessApplication");
		pageIndexer.currentPageIndex = 1;
		sendAccessCardUserInfoReq();
	}
}

// 페이지 클릭
function onAMACI_piAccessApplicationSelectionChange(/* cpr.events.CSelectionEvent */ e){sendAccessCardUserInfoReq();}

function sendAccessCardUserInfoReq(){
	var userName = app.lookup("AMACI_ipbName").value;
	if( userName != null && userName.length == 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_SearchNameLengthInvalid"));
		return;
	}
	
	clearPersonnelDetail();	
	app.lookup("AccessCardUserInfoList").clear();
	
	var userType = app.lookup("AMACI_cmbUserType").value;
	if(userType==0){
		userType = UserPrivArmyNotVisit;
	}
	var group  = app.lookup("AMACI_cmbGroup").value;
	
	var pageIndexer = app.lookup("AMACI_piAccessApplication");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * AMACI_pageRowCount;
	
	var sms_getAccessCardUserInfoList = app.lookup("sms_getAccessCardUserInfoList");
 			
	sms_getAccessCardUserInfoList.setParameters("accessCardStatus", AccessCardStatusIssueOrRetrive);
	sms_getAccessCardUserInfoList.setParameters("userType", userType);	
	sms_getAccessCardUserInfoList.setParameters("userName", userName);
	sms_getAccessCardUserInfoList.setParameters("group", group);
	sms_getAccessCardUserInfoList.setParameters("limit", AMACI_pageRowCount);
	sms_getAccessCardUserInfoList.setParameters("offset", offset);
	
	sms_getAccessCardUserInfoList.send();
}
// 출입증 발급 현황 리스트 가져오기 완료
function onSms_getAccessCardUserInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		/*
		if( app.lookup("AccessCardUserInfoList").getRowCount() == 0 ){
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_NoSearchResult"));
		}
		* */
		var pageIndexer = app.lookup("AMACI_piAccessApplication");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 출입자 목록에서 출입자 선택시

function onAMACI_grdPersonnelListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grdPersonnelList = e.control;	
	var index = grdPersonnelList.getSelectedRowIndex();
	if( index >= 0 ){		
		var row = grdPersonnelList.getRow(index);
		if (row) {
			console.log(row.getRowData());
			var applicationIndex = row.getValue("ApplicationIndex");
			var accessCardInfo = app.lookup("AccessCardInfo");
			var accessApplication = app.lookup("UserAccessApplications");
			var applicationID = row.getValue("OwnerID");
			console.log(applicationID);
			//console.log(accessApplication.getRowDataRanged(),applicationIndex);
			var aaInfo = accessApplication.findFirstRow("ApplicationIndex == "+applicationIndex);			
			if( aaInfo ){
				console.log(aaInfo.getValue("UserID"));
				//console.log(aaInfo.getRowData());
				app.lookup("AMACI_cmbPersonnelInfoUserType").value = aaInfo.getValue("UserType");
				app.lookup("AMACI_opbPersonnelInfoName").value = aaInfo.getValue("Name");
				var serviceNumber = aaInfo.getValue("ServiceNumber");
				if( serviceNumber.length == 0 ){serviceNumber = aaInfo.getValue("Birthday");}
				app.lookup("AMACI_opbPersonnelInfoServiceNumber").value = serviceNumber;
				// userAccessApplications에는  position 안 담김
				app.lookup("AMACI_cmbPersonnelInfoPosition").value = row.getValue("PositionCode"); 
				app.lookup("AMACI_cmbPersonnelInfoUserGroup").value = aaInfo.getValue("GroupCode");
				
				var startAt = aaInfo.getValue("AccessStart");
				if( startAt.length>10){startAt = startAt.substring(0, 10);}
				app.lookup("AMACI_opbPersonnelInfoAccessStart").value = startAt;
				var endAt = aaInfo.getValue("AccessEnd");
				if( endAt.length>10){endAt = endAt.substring(0, 10);}
				app.lookup("AMACI_opbPersonnelInfoAccessEnd").value = endAt;
				
				app.lookup("AMACI_cmbPersonnelInfoAccessCardType").value = row.getValue("CardType");
				app.lookup("AMACI_opbPersonnelInfoManagementNumber").value = row.getValue("ManagementNumber");
				
				var smsGetTerminalList = app.lookup("sms_getTerminalList");	
				smsGetTerminalList.setParameters("limit", 1000);
				smsGetTerminalList.setParameters("offset", 0);
				smsGetTerminalList.action = "/v1/accessGroups/"+aaInfo.getValue("AccessGroup")+"/terminals";
				smsGetTerminalList.send();	
			} else { // 초기화 예외처리 안되어 있음 bisangoo20220311
				clearPersonnelDetail();
			}	
		} else {
			
		}
		app.lookup("AMACI_opbPersonnelInfoCardSerial").value = "";
		app.lookup("AMACI_opbPersonnelInfoFPInfo").value = "";
		
		var dsUserFpInfo = app.lookup("UserFPInfo");
		dsUserFpInfo.clear();
		var dmUserFpInfo = app.lookup("dmFPInfo");
		dmUserFpInfo.clear();
		
		
	}
}

// 카드입력 버튼 클릭
function onAMACI_btnCardScanClick(/* cpr.events.CMouseEvent */ e){
	
	var grdPersonnelList = app.lookup("AMACI_grdPersonnelList");
	var index = grdPersonnelList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var userInfo = grdPersonnelList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	app.lookup("AMACI_opbPersonnelInfoCardSerial").value = "";
			
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
	AMACI_deviceWebSocket.send(msgData);
}

// 카드 단말기선택 버튼 클릭
function onAMACI_btnCardScanClick2(/* cpr.events.CMouseEvent */ e){
	
	var grdPersonnelList = app.lookup("AMACI_grdPersonnelList");
	
	var dsAccessCardInfo = app.lookup("UserCardInfo");
	
	var index = grdPersonnelList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var userInfo = grdPersonnelList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	
	var appld = "app/custom/rokmch/users/userCardRegist";
	
	app.lookup("AMACI_opbPersonnelInfoCardSerial").value = "";
	
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

// 지문 입력 버튼 클릭
function onAMACI_btnFPScanClick(/* cpr.events.CMouseEvent */ e){
	
	if ( AMACI_deviceWebSocket == null ){		
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterNotFound"));
		return;
	}
	
	var grdPersonnelList = app.lookup("AMACI_grdPersonnelList");
	var index = grdPersonnelList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var userInfo = grdPersonnelList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	
	app.lookup("AMACI_opbPersonnelInfoFPInfo").text = "지문을 입력해주세요.";
	
	var dmFPInfo = app.lookup("dmFPInfo");	
	dmFPInfo.clear();
	
	dmFPInfo.setValue("UserID",userInfo.getValue("OwnerID"));
	dmFPInfo.setValue("FingerID",1);
	
	ACMTP_templateIndex = 0;
	onFPCaptureReq();
}

/* 얼걸 긍록 버튼 클릭  */
function onAMACI_btnFaceWTCaptureClick(/* cpr.events.CMouseEvent */ e){
	var dsUserFaceWTInfo = app.lookup("UserFaceWTInfo"); // 현재는 1장의 사진을 사용.. 추후 여러 장을 등록하게 될 경우를 대비해서 맵이 아닌 셋으로 구성
	
	var grdPersonnelList = app.lookup("AMACI_grdPersonnelList");
	var index = grdPersonnelList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	var userInfo = grdPersonnelList.getRow(index);
	var appld = "app/custom/rokmch/users/UserFaceWTRegist";
	app.getRootAppInstance().openDialog(appld, {width : 780, height : 500}, function(dialog){
		dialog.initValue = {
			"Mode": "Modify",			
		    "ID": userInfo.getValue("OwnerID"),
		    "FaceDatas": dsUserFaceWTInfo.getRowDataRanged(),
		    "Url":"/v1"
		};		
		dialog.style.header.css("background-color", "#528443");
		dialog.bind("headerTitle").toLanguage("Str_FaceRegist");
		dialog.modal = true;		
	}).then(function(returnValue){
		var dsUserFaceWTInfo = app.lookup("UserFaceWTInfo");
		//console.log(returnValue["TemplateData"]);
		if(returnValue["TemplateData"] != ""){
			dsUserFaceWTInfo.clear();
			dsUserFaceWTInfo.addRowData(returnValue);
			app.lookup("AMACI_opbPersonnelInfoFaceWT").value = "얼굴 캡쳐 완료";
		} else {
			app.lookup("AMACI_opbPersonnelInfoFaceWT").value = "얼굴 캡쳐 실패";
		}
	});
	
}


function onFPCaptureReq(){	
	var dmFPInfo = app.lookup("dmFPInfo");				
	var uid = dmFPInfo.getValue("UserID");
	var fingerID = dmFPInfo.getValue("FingerID");
	
	var bodyData = {};
	bodyData.UserId = uid;
	bodyData.BrandType = "VIRDI";
	bodyData.ImageType = "JPG";
	bodyData.FingerIndex = fingerID;
	bodyData.TemplateFormat = USFPR_templateFormat;
	
	var msgReq = {
    	msgId: String(WSCmdFPCaptureReq),
    	body: bodyData
	};
	
	var msgData = JSON.stringify(msgReq);	 	
	AMACI_deviceWebSocket.send(msgData);
}

function onFPVerifyReq(uid,template_1,template_2){	
	var bodyData = {};
	bodyData.UserId = uid;
	bodyData.BrandType = "VIRDI";
	bodyData.Template1 = template_1;
	bodyData.Template2 = template_2;
	bodyData.TemplateFormat = USFPR_templateFormat;
	
	var msgReq = {
    	msgId: String(WSCmdFPVerifyReq),
    	body: bodyData
	};
	
	var msgData = JSON.stringify(msgReq);	 	
	AMACI_deviceWebSocket.send(msgData);
}

// 지문 삭제 클릭
function onAMACI_btnFPDeleteClick(/* cpr.events.CMouseEvent */ e){
	var dmFPInfo = app.lookup("dmFPInfo");
	dmFPInfo.clear();
	app.lookup("AMACI_opbPersonnelInfoFPInfo").text = "";
	
}

// 교부 클릭
function onAMACI_btnIssuanceClick(/* cpr.events.CMouseEvent */ e){
	var grdPersonnelList = app.lookup("AMACI_grdPersonnelList");
	var index = grdPersonnelList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var userInfo = grdPersonnelList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	
	var cardNum = app.lookup("AMACI_opbPersonnelInfoCardSerial").value;
	if( cardNum == null || cardNum.length < 1){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_CardSeriaNotValid"));
		return;
	}
	
	var accessCardInfo = app.lookup("AccessCardInfo");
	accessCardInfo.setValue("CardType",userInfo.getValue("CardType"));
	accessCardInfo.setValue("CardNumber",cardNum);
	accessCardInfo.setValue("ApplicationIndex",userInfo.getValue("ApplicationIndex"));
	accessCardInfo.setValue("OwnerID",userInfo.getValue("OwnerID"));
	
	var sms_postAccessCardIssuance = app.lookup("sms_postAccessCardIssuance");
	sms_postAccessCardIssuance.send();
}

// 출입증 교부 완료
function onSms_postAccessCardIssuanceSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		// 출입자 목록 갱신
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMYHQ_IssuanceSuccess"));
	} else {	
		if (resultCode == ErrorAmhqCardIsIssueStatus) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "현재 교부상태 카드입니다.");
		} else if (resultCode == ErrorAmhqCardIsAccidentStatus) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "현재 사고상태 카드입니다.");
		} else if (resultCode == ErrorAmhqCardIsStopUsingStatus) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "현재 사용정지상태 카드입니다.");
		}else if (resultCode == ErrorAmhqCardIsIncidentLostStatus) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "현재 분실상태 카드입니다.");
		}else if (resultCode == ErrorAmhqCardIsIncidentDamageStatus) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "현재 훼손상태 카드입니다.");
		} else {
			dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
			return;
		}

	}
}

function connectDeviceServer(address){    
    AMACI_deviceWebSocket = new WebSocket("ws://"+address+"/v1/webEntry");
    
    AMACI_deviceWebSocket.onopen = function(message){
    	app.lookup("AMACI_opbDeviceMsg").value = dataManager.getString("Str_ARMYHQ_DeviceConnected");
        console.log("device server ws connected.");
    };

    AMACI_deviceWebSocket.onclose = function(message){
    	AMACI_deviceWebSocket = null;
        console.log("Server disconnect..."); 
    };

    AMACI_deviceWebSocket.onerror = function(message){
        console.log("error... " + message);
        var opbMessage = app.lookup("AMACI_opbDeviceMsg");
        if(opbMessage){
        	opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
        }        
        var sniDownloadLink = app.lookup("AMACI_sniDownloadLink");
        if(sniDownloadLink){
        	sniDownloadLink.visible=true;
        } 
    };

    AMACI_deviceWebSocket.onmessage = function(message){
        
        var msg = JSON.parse(message.data);
        console.log("onmessage : "+msg.msgId);
        switch( msg.msgId){
        	case WSCmdCardCaptureRes:{ // 캡쳐 완료. 결과 수신.
            	comLib.hideLoadMask();	
                var result = JSON.parse(msg.body);
                
                if( result.Result == "success" ){
		            var opbPersonnelInfoCardSerial = app.lookup("AMACI_opbPersonnelInfoCardSerial");
					var strCardNum = result.CardNum; // 카드번호 옮겨 담기

					if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
						if ( strCardNum.length < 8){
							strCardNum = StrLib.formattedString("00000000",String(result.CardNum), "left");	
						}
					}
					
					result.CardNum = strCardNum;					
		            opbPersonnelInfoCardSerial.value = result.CardNum; // 카드 교부 클릭시 컨트롤의 데이터를 사용
		            opbPersonnelInfoCardSerial.redraw();
	            } else if (result.Result=="Capture failed"){
	            	dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardCapture"));
	            } else {
	            	dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), result);	            	
	            }
				
            }break;
            case WSCmdFPCaptureRes:{ // 캡쳐 완료. 결과 수신. 
                var result = JSON.parse(msg.body);
                if(ACMTP_templateIndex == 0 ){
                	app.lookup("AMACI_opbPersonnelInfoFPInfo").text = "확인을 위해 지문을 다시 입력해주세요.";
	                ACMTP_templateIndex = 1;
	                var dmFPInfo = app.lookup("dmFPInfo");
					dmFPInfo.setValue("Template1", result["FingerData"]);
					onFPCaptureReq();
				} else if ( ACMTP_templateIndex == 1 ){ // 두개의 템플릿에 대해 매칭 시도
					app.lookup("AMACI_opbPersonnelInfoFPInfo").text = "지문 데이터 검증중입니다.";
					var dmFPInfo = app.lookup("dmFPInfo");
					dmFPInfo.setValue("Template2", result["FingerData"]);					
					var template_1 = dmFPInfo.getValue("Template1");
					var template_2 = dmFPInfo.getValue("Template2");
					dmFPInfo.setValue("templateFormat", USFPR_templateFormat);
					onFPVerifyReq(dmFPInfo.getValue("UserID"),template_1,template_2);
					ACMTP_templateIndex = 0
				}                
            }break;
            
            case WSCmdFPVerifyRes:
            	var body = JSON.parse(msg.body);
            	
            	if( body.Result == 0){            	
            		app.lookup("AMACI_opbPersonnelInfoFPInfo").text = "지문 입력 성공";    
            		var dsUserFpInfo = app.lookup("UserFPInfo");
					dsUserFpInfo.clear();
					
					var dmFPInfo = app.lookup("dmFPInfo");
					dsUserFpInfo.addRowData({"FingerID":1,"MinConvType":3,"TemplateIndex":1,"TemplateData":dmFPInfo.getValue("Template1")});
					dsUserFpInfo.addRowData({"FingerID":1,"MinConvType":3,"TemplateIndex":2,"TemplateData":dmFPInfo.getValue("Template2")});
					        		
            	} else {
            		app.lookup("AMACI_opbPersonnelInfoFPInfo").text = "지문 입력 실패";
            	}
            break;
            
            default: console.log(msg); break;
        }
    }
}

//출입 단말 가져오기 완료
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
		app.lookup("AMACI_opbAccessGroup").value = accessArea;
		
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}


/*
 *"삭제"
 버튼(AMACI_btnDelete) 에서 click 이벤트 발생 시 호출.*사용자가 컨트롤을 클릭할 때 발생하는 이벤트.*/
 
 function onAMACI_btnDeleteClick( /* cpr.events.CMouseEvent */ e) {
 	/** 
 	 * @type cpr.controls.Button
 	 */
 	var aMACI_btnDelete = e.control;
 	var grdPersonnelList = app.lookup("AMACI_grdPersonnelList");
 	var index = grdPersonnelList.getSelectedRowIndex();
 	if (index < 0) {
 		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
 		return;
 	}
 	
 	var userInfo = grdPersonnelList.getRow(index);
 	if (userInfo == undefined) {
 		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
 		return;
 	}
 	dialogConfirmAMHQ(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
 		dialog.addEventListenerOnce("close", function(e) {
 			if (dialog.returnValue) {
			 	console.log("userInfo.getRowData()", userInfo.getRowData())
			 	console.log("userID", userInfo.getValue("OwnerID"))
			 	sendDeleteUser(userInfo.getValue("OwnerID"), 0)
 			}
 		});
 	});
 	//	var sms_postAccessCardIssuance = app.lookup("sms_postAccessCardIssuance");
 	//	sms_postAccessCardIssuance.send();
 }
 // 사용자 삭제 요청 전송
function sendDeleteUser(userID, option){
		
	var sms_deleteUser = new cpr.protocols.Submission("sms_delete");
	sms_deleteUser.action = "/v1/users/"+userID;
	if(option==1){
		sms_deleteUser.action += "?option=1";
	}
	sms_deleteUser.method = "DELETE";
	sms_deleteUser.mediaType = "application/x-www-form-urlencoded";			
	sms_deleteUser.addResponseData(app.lookup("Result"), false, "Result");
		
	sms_deleteUser.addEventListenerOnce("submit-done", onSms_deleteUserSubmitDone);
	sms_deleteUser.addEventListenerOnce("submit-error", onSubmitError);
	sms_deleteUser.addEventListenerOnce("submit-timeout", onSubmitTimeout);
	sms_deleteUser.send();
}

// 사용자 삭제 완료
function onSms_deleteUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/* @type cpr.protocols.Submission */
	var sms_deleteUser = e.control;
	
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if (resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), "소속부대원 정보가 삭제되었습니다.");
		app.lookup("AMACI_opbAccessGroup").value = "";
		// refresh
		var sms_getAccessApplicationList = app.lookup("sms_getAccessApplicationList");
		sms_getAccessApplicationList.setParameters("applicationStatus", AccessApplicationStatusApproval);
		sms_getAccessApplicationList.setParameters("accessCardStatus", AccessCardStatusIssueOrRetrive);
		sms_getAccessApplicationList.send();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 지문 단말기 선택 클릭  - pse
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	var grdPersonnelList = app.lookup("AMACI_grdPersonnelList");
	var dsUserAccessApplications = app.lookup("UserAccessApplications");
	var selectIndex = app.lookup("AMACI_grdPersonnelList").getSelectedRowIndex();
	var row = app.lookup("AMACI_grdPersonnelList").getRow(selectIndex);
	
	// 출입자 선택 안하면 경고 팝업 띄우기
	var index = grdPersonnelList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var userInfo = grdPersonnelList.getRow(index);
	if (userInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	
	var appId = "app/custom/rokmch/users/UserFingerRegist"
	var dsUserFpInfo = app.lookup("UserFPInfo");
	app.getRootAppInstance().openDialog(appId, {width : 640, height : 490}, function(dialog){
		// 협박 지문 인자로 전달
		var duressFinger = userInfo.getValue("DuressFinger");
		console.log("duressFinger : " + duressFinger);
		if (duressFinger) {
			duressFinger = duressFinger.split(",");
		}
		
		dialog.bind("headerTitle").toLanguage("Str_FingerRegist");			
		dialog.initValue = {
			"UserID": row.getValue("UserID"),
			"Url": "/v1",
			"FPModified": USINT_fpModified,
			"UserFPInfo": dsUserFpInfo,
			"DuressFinger": duressFinger
		}
		dialog.style.header.css("background-color", "#528443");
		dialog.resizable = false;
		dialog.modal = true;
		
	}).then(function(returnValue){
		USINT_fpModified = 1;
		dsUserFpInfo.clear();
		//console.log("returnValue : " + returnValue);
		if (returnValue != "") {
			app.lookup("AMACI_opbPersonnelInfoFPInfo").text = "지문 입력 성공";
			
			var count = 0;
			var duress = "";
			for (var i = 0; i < returnValue.length; i++) {
				if (returnValue[i]["TemplateIndex"] == 1 && returnValue[i]["Duress"] == 1) {
					if (duress.length != 0) {
						duress += ",";
					}
					duress += returnValue[i]["FingerID"];
					count++;
				}
					
					dsUserFpInfo.addRowData(returnValue[i]);
			} 
		} else {
			app.lookup("AMACI_opbPersonnelInfoFPInfo").text = "";
		}
	});
	
}

