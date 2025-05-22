/************************************************
 * civilServiceCardRegist.js
 * Created at 2021. 2. 5. 오후 4:18:05.
 *
 * @author fois
 ************************************************/


var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var AMCCR_pageRowCount = 50;
var AMCCR_deviceWebSocket;
var AMCCR_templateIndex = 0;
var loginPrivilege = 0; // (0: 사용자, 1: 관리자, 2: 승인자)
var USINT_fpModified; // 사용자가 지문 데이터를 수정 했는지 여부
var USFPR_templateFormat= 3; //ISO 템플릿 포멧 추가

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	USFPR_templateFormat = dataManager.getClientOption().getValue("TemplateFormat");
	console.log("templateType : " + USFPR_templateFormat);
	
	var link = app.lookup("AMCCR_sniDownloadLink");
	link.value=	"<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">"+dataManager.getString("Str_ARMYHQ_PrintServerDownloadPath")+"</a>";
		
	app.lookup("AMCCR_opbDeviceMsg").value = dataManager.getString("Str_ARMYHQ_DeviceConnectTry");
	
	connectDeviceServer("127.0.0.1:9600");

	var accountInfo = dataManager.getAccountInfo();
	var privilege = Number(accountInfo.getValue("Privilege"));
	console.log("privilege", privilege)
	if (privilege == 1) { // 관리자일 경우
		loginPrivilege = 1;
		app.lookup("AMCCR_btnDelete").visible = true;
	}
	
	initControls();	

	sendAccessApplicationListReq();	
}

function initControls(){
	var pageIndexer = app.lookup("AMCCR_piPersonnelList");	
	pageIndexer.pageRowCount = AMCCR_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)	
	var cmbGroup = app.lookup("AMCCR_cmbGroup");
	if (isLoginMaster()){ // 24년도부터 Master를 제외한 관리자는 본인 부서 + 하위 부서만 관리 가능
		cmbGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID"});
		cmbGroup.addItem(new cpr.controls.Item("------", 0));	
	} else {
		cmbGroup.setItemSet(dataManager.getLoginUserGroups(), {label: "Name",	value: "GroupID"});
	}
	cmbGroup.selectItemByValue(getLoginUserGroupCode());
	
	var cmdGrdGroup = app.lookup("AMCCR_cmdGrdPersonnelListGroup");
	cmdGrdGroup.setItemSet(dataManager.getGroup(),{label:"Name",value:"GroupID"});
	var cmdGrdPosition = app.lookup("AMCCR_cmbPersonnelInfoPosition");
	cmdGrdPosition.setItemSet(dataManager.getPositionList(),{label: "Name",value:"PositionID"});
	var cmdGrdPosition = app.lookup("AMCCR_cmdGrdPersonnelListPosition");
	cmdGrdPosition.setItemSet(dataManager.getPositionList(),{label: "Name",value:"PositionID"}); 			
 	var cmbUserGroup = app.lookup("AMCCR_cmbPersonnelInfoUserGroup");
	cmbUserGroup.setItemSet(dataManager.getGroup(),{label:"Name",value:"GroupID"});	
}

function onBodyUnload(/* cpr.events.CEvent */ e){
	if(AMCCR_deviceWebSocket != null){AMCCR_deviceWebSocket.close();AMCCR_deviceWebSocket = null;}	
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
		var pageIndexer = app.lookup("AMCCR_piPersonnelList");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function clearPersonnelDetail(){
	app.lookup("AMCCR_cmbPersonnelInfoUserType").value = "";
	app.lookup("AMCCR_opbPersonnelInfoName").value = "";
	app.lookup("AMCCR_opbPersonnelInfoServiceNumber").value = "";
	app.lookup("AMCCR_cmbPersonnelInfoPosition").value = "";
	app.lookup("AMCCR_cmbPersonnelInfoUserGroup").value = "";
		
	app.lookup("AMCCR_opbPersonnelInfoAccessStart").value = "";
	app.lookup("AMCCR_opbPersonnelInfoAccessEnd").value = "";
	
	app.lookup("AMCCR_opbPersonnelInfoCardSerial").value = "";
	app.lookup("AMCCR_opbPersonnelInfoFPInfo").value = "";
}

// 출입자 조회 클릭
function onAMCCR_btnPersonnelListSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndexer = app.lookup("AMCCR_piPersonnelList");
	pageIndexer.currentPageIndex = 1; 
	sendAccessApplicationListReq();
}
// 페이지 클릭
function onAMCCR_piAccessApplicationSelectionChange(/* cpr.events.CSelectionEvent */ e){sendAccessApplicationListReq();}

//function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
//	if(e.keyCode == 13) {
//		var pageIndexer = app.lookup("AMCCR_piPersonnelList");
//		pageIndexer.currentPageIndex = 1;
//		sendAccessApplicationListReq();		
//	}
//}

// 검색어 2글자 이상 팝업 제대로 보이도록 keydown을 keyup으로 변경 - pse 
function onAMCCR_ipbNameKeyup(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var pageIndexer = app.lookup("AMCCR_piPersonnelList");
		pageIndexer.currentPageIndex = 1;
		sendAccessApplicationListReq();		
	}
}


function sendAccessApplicationListReq(){
	var userName = app.lookup("AMCCR_ipbName").value;
	if( userName != null && userName.length == 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_SearchNameLengthInvalid"));
		return;
	}
	
	clearPersonnelDetail();	
	app.lookup("UserAccessApplications").clear();
	
	var userType = app.lookup("AMCCR_cmbUserType").value;
	if( userType == 0 ){
		userType = UserPrivArmyOnDutyNMilitaryPerson
	}
	var group  = app.lookup("AMCCR_cmbGroup").value;
	
	var pageIndexer = app.lookup("AMCCR_piPersonnelList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * AMCCR_pageRowCount;
	
	var sms_getAccessApplicationList = app.lookup("sms_getAccessApplicationList");
	sms_getAccessApplicationList.setParameters("applicationStatus", AccessApplicationStatusApproval);	
	sms_getAccessApplicationList.setParameters("accessCardStatus", AccessCardStatusIssue);
	sms_getAccessApplicationList.setParameters("userType", userType);
	sms_getAccessApplicationList.setParameters("limit", AMCCR_pageRowCount);
	sms_getAccessApplicationList.setParameters("offset", offset);
	sms_getAccessApplicationList.setParameters("userName", userName);
	sms_getAccessApplicationList.setParameters("group", group);
	sms_getAccessApplicationList.send(); 	
	
}

// 출입자 목록에서 출입자 선택시
function onAMCCR_grdPersonnelListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grdPersonnelList = e.control;	
	var index = grdPersonnelList.getSelectedRowIndex();
	if( index >- 1 ){		
		var row = grdPersonnelList.getRow(index);
		if (row) {
			console.log(row.getRowData());
			var applicationIndex = row.getValue("ApplicationIndex");
			var accessCardInfo = app.lookup("AccessCardInfo");
			var accessApplication = app.lookup("UserAccessApplications");
			console.log(accessApplication.getRowDataRanged(),applicationIndex);
			var aaInfo = accessApplication.findFirstRow("ApplicationIndex == "+applicationIndex);
			console.log(aaInfo.getRowData());
			if( aaInfo ){
				app.lookup("AMCCR_cmbPersonnelInfoUserType").value = aaInfo.getValue("UserType");
				app.lookup("AMCCR_opbPersonnelInfoName").value = aaInfo.getValue("Name");
				var serviceNumber = aaInfo.getValue("ServiceNumber");
				if( serviceNumber.length == 0 ){serviceNumber = aaInfo.getValue("Birthday");}
				app.lookup("AMCCR_opbPersonnelInfoServiceNumber").value = serviceNumber;
				app.lookup("AMCCR_cmbPersonnelInfoPosition").value = aaInfo.getValue("Position");
				app.lookup("AMCCR_cmbPersonnelInfoUserGroup").value = aaInfo.getValue("GroupCode");
				
				var startAt = aaInfo.getValue("AccessStart");
				if( startAt.length>10){startAt = startAt.substring(0, 10);}
				app.lookup("AMCCR_opbPersonnelInfoAccessStart").value = startAt;
				var endAt = aaInfo.getValue("AccessEnd");
				if( endAt.length>10){endAt = endAt.substring(0, 10);}
				app.lookup("AMCCR_opbPersonnelInfoAccessEnd").value = endAt;
			}	
			var smsGetTerminalList = app.lookup("sms_getTerminalList");		
			smsGetTerminalList.setParameters("limit", 1000);
			smsGetTerminalList.setParameters("offset", 0);		
			smsGetTerminalList.action = "/v1/accessGroups/"+row.getValue("AccessGroup")+"/terminals";
			smsGetTerminalList.send();	
		}
		app.lookup("AMCCR_opbPersonnelInfoCardSerial").value = "";
		app.lookup("AMCCR_opbPersonnelInfoFPInfo").value = "";
		
		var dsUserFpInfo = app.lookup("UserFPInfo");
		dsUserFpInfo.clear();
		var dmUserFpInfo = app.lookup("dmFPInfo");
		dmUserFpInfo.clear();	
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
		app.lookup("AMCCR_opbAccessGroup").value = accessArea;
		
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

// 카드입력 버튼 클릭
function onAMCCR_btnCardScanClick(/* cpr.events.CMouseEvent */ e){
	
	var grdPersonnelList = app.lookup("AMCCR_grdPersonnelList");
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
	app.lookup("AMCCR_opbPersonnelInfoCardSerial").value = "";
	AMCCR_templateIndex = 0;
	
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
	AMCCR_deviceWebSocket.send(msgData);
}


// 단말기선택 버튼 클릭
function onAMCCR_btnCardScanClick2(/* cpr.events.CMouseEvent */ e){
	
	var grdPersonnelList = app.lookup("AMCCR_grdPersonnelList");
	
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
	
	app.lookup("AMCCR_opbPersonnelInfoCardSerial").value = "";
	
	app.getRootAppInstance().openDialog(appld, {width: 640,height: 490}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_ARMYHQ_CardScan");
		dialog.initValue = {
			"userID": userInfo.getValue("OwnerID"),
			"UserCardInfo": dsAccessCardInfo,
			"Mode": "Regist",
			"Url": "/v1"
		};
		dialog.resizable = false;
		dialog.style.header.css("background-color", "#528443");
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
		
//		var CardNumber = dsAccessCardInfo.toString(0, "CardNum");
//		var birthday = userInfo.getValue("Birthday");
////		console.log(birthday);
//		birthday = birthday.replace(/-/gi,"");
//		birthday = birthday.substring(2, 8);
//		var cardNum = CardNumber.substring(0, 6);
//		console.log(birthday,cardNum);
//		if(birthday==cardNum){ // 공무원증 정보 일치
//			var opbPersonnelInfoCardSerial = app.lookup("AMCCR_opbPersonnelInfoCardSerial");
//			opbPersonnelInfoCardSerial.value = cardNum; // 카드 교부 클릭시 컨트롤의 데이터를 사용
//		    opbPersonnelInfoCardSerial.redraw();
//		}else{
//			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "해당 등록자의 공무원증이 아닙니다.");
//			app.lookup("AMCCR_opbPersonnelInfoCardSerial").value = "";
//		}
		// 공무원증 시리얼 넘버를 16자리만 보도록 변경되었으므로 생년월일과 시리얼넘버 검증 로직 주석처리   -mjy
		var CardNumber = dsAccessCardInfo.getRow(0).getValue("CardNum");
		var opbPersonnelInfoCardSerial = app.lookup("AMCCR_opbPersonnelInfoCardSerial");
		opbPersonnelInfoCardSerial.value = CardNumber; // 카드 교부 클릭시 컨트롤의 데이터를 사용
	    opbPersonnelInfoCardSerial.redraw();
	});

}

// 지문 입력 버튼 클릭
function onAMCCR_btnFPScanClick(/* cpr.events.CMouseEvent */ e){
	
	if ( AMCCR_deviceWebSocket == null ){		
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterNotFound"));
		return;
	}
	
	var grdPersonnelList = app.lookup("AMCCR_grdPersonnelList");
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
	
	app.lookup("AMCCR_opbPersonnelInfoFPInfo").text = "지문을 입력해주세요.";
	
	var dmFPInfo = app.lookup("dmFPInfo");	
	dmFPInfo.clear();
	
	dmFPInfo.setValue("UserID",userInfo.getValue("OwnerID"));
	dmFPInfo.setValue("FingerID",1);
	
	onFPCaptureReq();
}

/* 얼걸 긍록 버튼 클릭  */
function onAMCCR_btnFaceWTCaptureClick(/* cpr.events.CMouseEvent */ e){
	var dsUserFaceWTInfo = app.lookup("UserFaceWTInfo"); // 현재는 1장의 사진을 사용.. 추후 여러 장을 등록하게 될 경우를 대비해서 맵이 아닌 셋으로 구성
	
	var grdPersonnelList = app.lookup("AMCCR_grdPersonnelList");
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
		dialog.bind("headerTitle").toLanguage("Str_FaceRegist");
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;		
	}).then(function(returnValue){
		var dsUserFaceWTInfo = app.lookup("UserFaceWTInfo");
		//console.log(returnValue["TemplateData"]);
		if(returnValue["TemplateData"] != ""){
			dsUserFaceWTInfo.clear();
			dsUserFaceWTInfo.addRowData(returnValue);
			app.lookup("AMCCR_opbPersonnelInfoFaceWT").value = "얼굴 캡쳐 완료";
		} else {
			app.lookup("AMCCR_opbPersonnelInfoFaceWT").value = "얼굴 캡쳐 실패";
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
	AMCCR_deviceWebSocket.send(msgData);
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
	AMCCR_deviceWebSocket.send(msgData);
}

// 지문 삭제 클릭
function onAMCCR_btnFPDeleteClick(/* cpr.events.CMouseEvent */ e){
	var dmFPInfo = app.lookup("dmFPInfo");
	dmFPInfo.clear();
	app.lookup("AMCCR_opbPersonnelInfoFPInfo").text = "";
	
}

// 교부 클릭
function onAMCCR_btnIssuanceClick(/* cpr.events.CMouseEvent */ e){
	var grdPersonnelList = app.lookup("AMCCR_grdPersonnelList");
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
	
	var cardNum = app.lookup("AMCCR_opbPersonnelInfoCardSerial").value;
	if( cardNum == null || cardNum.length < 1){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_CardSeriaNotValid"));
		return;
	}
		
	var accessCardInfo = app.lookup("AccessCardInfo");
	accessCardInfo.setValue("IssuanceType",1); // 0 : 출입증이 발급된 상태, 1: 출입증 발급&교부 인 경우(공무원증 등록)
	accessCardInfo.setValue("CardType",AccessCardTypeCivilService);
	accessCardInfo.setValue("CardTypeEx", CivilServiceCardNormal);
	accessCardInfo.setValue("CardNumber",cardNum);
	accessCardInfo.setValue("ApplicationIndex",userInfo.getValue("ApplicationIndex"));
	
	accessCardInfo.setValue("OwnerID",userInfo.getValue("UserID"));
	accessCardInfo.setValue("OwnerName",userInfo.getValue("Name"));
	
	var group = dataManager.getGroupName(userInfo.getValue("GroupCode"));
	accessCardInfo.setValue("OwnerGroup",group);
	
	var position = dataManager.getPositionName(userInfo.getValue("Position"));	
	accessCardInfo.setValue("OwnerPosition",position);
	accessCardInfo.setValue("OwnerServiceNumber",userInfo.getValue("ServiceNumber"));
	accessCardInfo.setValue("OwnerBirthday",userInfo.getValue("Birthday"));
	
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
        
    AMCCR_deviceWebSocket = new WebSocket("ws://"+address+"/v1/webEntry");
    
    AMCCR_deviceWebSocket.onopen = function(message){
    	app.lookup("AMCCR_opbDeviceMsg").value = dataManager.getString("Str_ARMYHQ_DeviceConnected");
        console.log("device server ws connected.");
    };

    AMCCR_deviceWebSocket.onclose = function(message){
    	AMCCR_deviceWebSocket = null;
        console.log("Server disconnect..."); 
    };

    AMCCR_deviceWebSocket.onerror = function(message){
        console.log("error... " + message);
        var opbMessage = app.lookup("AMCCR_opbDeviceMsg");
        if(opbMessage){
        	opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
        }
        
        var sniDownloadLink = app.lookup("AMCCR_sniDownloadLink");
        if(sniDownloadLink){
        	sniDownloadLink.visible=true;
        }
    };

    AMCCR_deviceWebSocket.onmessage = function(message){
        
        var msg = JSON.parse(message.data);
        console.log("onmessage : "+msg.msgId);
        switch( msg.msgId){
        	case WSCmdCardCaptureRes:{ // 캡쳐 완료. 결과 수신.
            	comLib.hideLoadMask();	
                var result = JSON.parse(msg.body);
                
                if( result.Result == "success" ){
                	var grdPersonnelList = app.lookup("AMCCR_grdPersonnelList");
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
//					var birthday = userInfo.getValue("Birthday");
//					console.log(birthday);
//					birthday = birthday.replace(/-/gi,"");
//					birthday = birthday.substring(2, 8);
//					var cardNum = result.CardNum.substring(0, 6);
//					console.log(birthday,cardNum);
//					if(birthday==cardNum){ // 공무원증 정보 일치
//			            var opbPersonnelInfoCardSerial = app.lookup("AMCCR_opbPersonnelInfoCardSerial");
//			            opbPersonnelInfoCardSerial.value = result.CardNum; // 카드 교부 클릭시 컨트롤의 데이터를 사용
//		    	        opbPersonnelInfoCardSerial.redraw();
//		    	    }else{
//		    	    	dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "해당 등록자의 공무원증이 아닙니다.");
//		    	    }

					// 공무원증 시리얼 넘버를 16자리만 보도록 변경되었으므로 생년월일과 시리얼넘버 검증 로직 주석처리   -mjy
		            var opbPersonnelInfoCardSerial = app.lookup("AMCCR_opbPersonnelInfoCardSerial");
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
                if(AMCCR_templateIndex == 0 ){
                	app.lookup("AMCCR_opbPersonnelInfoFPInfo").text = "확인을 위해 지문을 다시 입력해주세요.";
	                AMCCR_templateIndex = 1;
	                var dmFPInfo = app.lookup("dmFPInfo");
					dmFPInfo.setValue("Template1", result["FingerData"]);
					onFPCaptureReq();
				} else if ( AMCCR_templateIndex == 1 ){ // 두개의 템플릿에 대해 매칭 시도
					app.lookup("AMCCR_opbPersonnelInfoFPInfo").text = "지문 데이터 검증중입니다.";
					var dmFPInfo = app.lookup("dmFPInfo");
					dmFPInfo.setValue("Template2", result["FingerData"]);					
					var template_1 = dmFPInfo.getValue("Template1");
					var template_2 = dmFPInfo.getValue("Template2");
					dmFPInfo.setValue("templateFormat", USFPR_templateFormat);
					onFPVerifyReq(dmFPInfo.getValue("UserID"),template_1,template_2);
					AMCCR_templateIndex = 0
				}                
            }break;
            
            case WSCmdFPVerifyRes:
            	var body = JSON.parse(msg.body);
            	
            	if( body.Result == 0){            	
            		app.lookup("AMCCR_opbPersonnelInfoFPInfo").text = "지문 입력 성공";    
            		var dsUserFpInfo = app.lookup("UserFPInfo");
					dsUserFpInfo.clear();
					
					var dmFPInfo = app.lookup("dmFPInfo");
					dsUserFpInfo.addRowData({"FingerID":1,"MinConvType":3,"TemplateIndex":1,"TemplateData":dmFPInfo.getValue("Template1")});
					dsUserFpInfo.addRowData({"FingerID":1,"MinConvType":3,"TemplateIndex":2,"TemplateData":dmFPInfo.getValue("Template2")});
					        		
            	} else {
            		app.lookup("AMCCR_opbPersonnelInfoFPInfo").text = "지문 입력 실패";
            	}
            break;
            
            default: console.log(msg); break;
        }
    }
}


/*
 * "사용자 삭제" 버튼(AMCCR_btnDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMCCR_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var aMCCR_btnDelete = e.control;
//	var grdPersonnelList = app.lookup("AMCCR_grdPersonnelList");
//	var index = grdPersonnelList.getSelectedRowIndex();
//	if( index < 0 ){
//		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
//		return;
//	}
//		
//	var userInfo = grdPersonnelList.getRow(index);
//	if (userInfo == undefined) {
//		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
//		return;
//	}
//	
//	accessCardInfo.setValue("OwnerID",userInfo.getValue("UserID"));
//	
//	var position = dataManager.getPositionName(userInfo.getValue("Position"));	
//	accessCardInfo.setValue("OwnerPosition",position);
//	accessCardInfo.setValue("OwnerServiceNumber",userInfo.getValue("ServiceNumber"));
//	accessCardInfo.setValue("OwnerBirthday",userInfo.getValue("Birthday"));
//	
//	var sms_postAccessCardIssuance = app.lookup("sms_postAccessCardIssuance");
//	sms_postAccessCardIssuance.send();
	
	
	
	
	
	var grdPersonnelList = app.lookup("AMCCR_grdPersonnelList");
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
			 	sendDeleteUser(userInfo.getValue("UserID"), 2)	//사용자 삭제 + 공무원증 신청까지 삭제
 			}
 		});
 	});
}
 // 사용자 삭제 요청 전송
function sendDeleteUser(userID, option){
		
	var sms_deleteUser = new cpr.protocols.Submission("sms_delete");
	sms_deleteUser.action = "/v1/users/"+userID;
	
	if(option > 0){
		sms_deleteUser.action += "?option="+option;
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
		app.lookup("AMCCR_opbAccessGroup").value = "";
		
		// refresh
		sendAccessApplicationListReq()
		
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 지문 단말기 선택 클릭  - pse
function onAMACI_btnTerminalFPScanClick(/* cpr.events.CMouseEvent */ e){
	var grdPersonnelList = app.lookup("AMCCR_grdPersonnelList");
	var dsUserAccessApplications = app.lookup("UserAccessApplications");
	var selectIndex = grdPersonnelList.getSelectedRowIndex();
	var row = grdPersonnelList.getRow(selectIndex);
	
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
		dialog.resizable = false;
		dialog.style.header.css("background-color", "#528443");
		dialog.modal = true;
		
	}).then(function(returnValue){
		USINT_fpModified = 1;
		dsUserFpInfo.clear();
		//console.log("returnValue : " + returnValue);
		if (returnValue != "") {
			app.lookup("AMCCR_opbPersonnelInfoFPInfo").text = "지문 입력 성공";
			
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
			app.lookup("AMCCR_opbPersonnelInfoFPInfo").text = "";
		}
		
	});
	
}
