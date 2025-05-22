/************************************************
 * accessCardIssue.js
 * Created at 2021. 2. 3. 오후 2:03:52.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;

var AMAAI_deviceWebSocket;
var AMAAI_pageRowCount = 50;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var link = app.lookup("AMAAI_sniDownloadLink");
	link.value=	"<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">"+dataManager.getString("Str_ARMYHQ_PrintServerDownloadPath")+"</a>";
	
	app.lookup("AMAAI_opbMessage").value = dataManager.getString("Str_ARMYHQ_DeviceConnectTry");
	
	initControls();
	
	connectDeviceServer("127.0.0.1:9600");
		
	var tabStorage = localStorage.getItem("tabStorage");
	var cardPrintType = app.lookup("cardPrintType");
	if(tabStorage){
		var tabArr = tabStorage.split(',');
	    if (tabArr) {
	        for (var i = 0; i < tabArr.length; i++) {
	        	cardPrintType.addItem(new cpr.controls.Item(tabArr[i], i+1));
	        }
	    }
	}
	var sms_getAccessCardPrintInfoList = app.lookup("sms_getAccessCardPrintInfoList");
	sms_getAccessCardPrintInfoList.send();

	sendAccessApplicationReq();
}

function onBodyUnload(/* cpr.events.CEvent */ e){
	if(AMAAI_deviceWebSocket != null){AMAAI_deviceWebSocket.close();AMAAI_deviceWebSocket = null;}	
}

function initControls(){
	var pageIndexer = app.lookup("AMAAI_piApplication");	
	pageIndexer.pageRowCount = AMAAI_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
	
	var cmbUserPosition = app.lookup("AMAAI_grdCmbUserPosition");
	cmbUserPosition.setItemSet(dataManager.getPositionList(), {label: "Name",value: "PositionID"});	
	cmbUserPosition.addItem(new cpr.controls.Item("", 0));
	cmbUserPosition.selectItemByValue(0);
	
	var cmbUserGroup = app.lookup("AMAAI_cmbUserGroup");
	if (isLoginMaster()){ // 24년도부터 Master를 제외한 관리자는 본인 부서 + 하위 부서만 관리 가능
		cmbUserGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID"});
		cmbUserGroup.addItem(new cpr.controls.Item("------", 0));	
	} else {
		cmbUserGroup.setItemSet(dataManager.getLoginUserGroups(), {label: "Name",	value: "GroupID"});
	}
	cmbUserGroup.selectItemByValue(getLoginUserGroupCode());

	var grdCmbUserGroup = app.lookup("AMAAI_grdCmbUserGroup");
	grdCmbUserGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID"});
	grdCmbUserGroup.addItem(new cpr.controls.Item("------", 0));
	grdCmbUserGroup.selectItemByValue(0);
	
	app.lookup("AMAAI_cmbExpire").selectItemByValue(0);	
	app.lookup("AMAAI_cmbCardStatus").selectItemByValue(0);

}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function connectDeviceServer(address){    
        
    AMAAI_deviceWebSocket = new WebSocket("ws://"+address+"/v1/webEntry");
    
    AMAAI_deviceWebSocket.onopen = function(message){      
    	app.lookup("AMAAI_opbMessage").value = dataManager.getString("Str_ARMYHQ_DeviceConnected");
        console.log("device server ws connected.");
    };

    AMAAI_deviceWebSocket.onclose = function(message){
    	AMAAI_deviceWebSocket = null;
        console.log("Server disconnect..."); 
    };

    AMAAI_deviceWebSocket.onerror = function(message){
        console.log("error... " + message);
        var opbMessage = app.lookup("AMAAI_opbMessage");
        if(opbMessage){
        	opbMessage.value = dataManager.getString("Str_ARMYHQ_PrintServerInstallRequired");
        }        
        var sniDownloadLink = app.lookup("AMAAI_sniDownloadLink");
        if(sniDownloadLink){
        	sniDownloadLink.visible=true;
        }        
    };

    AMAAI_deviceWebSocket.onmessage = function(message){
        
        var msg = JSON.parse(message.data);
        console.log("onmessage : "+msg.msgId);
        switch( msg.msgId){
            default: console.log(msg); break;
        }
    }
}

// 출입자 목록 선택시
function onAMAAI_grdAccessUserListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var grdAccessUserList = app.lookup("AMAAI_grdAccessUserList");
	var index = grdAccessUserList.getSelectedRowIndex();
	if( index >- 1 ){
		var row = grdAccessUserList.getRow(index);
		if (row) {
			var cardType = row.getValue("UserType");
			var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
			var acpInfo = accessCardPrintInfoList.findFirstRow("AccessCardType == "+cardType);
			if( acpInfo ){
				app.lookup("AMAAI_ipbTextFrontTop").value = acpInfo.getValue("TextFrontTop");				
				app.lookup("AMAAI_ipbTextFrontCenterBox").value = acpInfo.getValue("TextFrontCenterBox");
				app.lookup("AMAAI_ipbTextFrontBottomBox").value = acpInfo.getValue("TextFrontBottomBox");
				app.lookup("AMAAI_ipbTextFrontBottom").value = acpInfo.getValue("TextFrontBottom");
				app.lookup("AMAAI_ipbTextBackTop").value = acpInfo.getValue("TextBackTop");
			}	
			var applicationIndex = row.getValue("ApplicationIndex");
			sendAccessCardListReq(applicationIndex)
		}
	}		
}
function sendAccessCardListReq(applicationIndex) {
	app.lookup("AccessCardList").clear();
	
	var sms_getAccessCardInfo = app.lookup("sms_getAccessCardInfo");	
	sms_getAccessCardInfo.setParameters("applicationIndex", applicationIndex);	
	sms_getAccessCardInfo.setParameters("limit", 1);
	sms_getAccessCardInfo.setParameters("offset", 0);	
	sms_getAccessCardInfo.send();
}

function onSms_getAccessCardInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission */
	var sms_getAccessCardInfo = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if( resultCode == COMERROR_NONE) {	
		var dsAccessCardList = app.lookup("AccessCardList");
		if( dsAccessCardList.getRowCount()>0){
			var dsAccessCardInfo = dsAccessCardList.getRow(0);
			
			var cardInfo = app.lookup("AccessCardInfo");
			cardInfo.setValue("CardType", dsAccessCardInfo.getValue("CardType"));
			var managementNumber = dsAccessCardInfo.getValue("ManagementNumber");
			var managementNumber = managementNumber.split("-");
			if( managementNumber.length > 1 ){
				managementNumber = Number(managementNumber[1]);
				cardInfo.setValue("ManagementNumber", managementNumber);
			}			
		}		
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

function sendAccessApplicationReq(){
	app.lookup("UserAccessApplications").clear();
	
	var pageIndexer = app.lookup("AMAAI_piApplication");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * AMAAI_pageRowCount;
		
	var accessCardStatus = app.lookup("AMAAI_cmbCardStatus").value;
	if(accessCardStatus == 0){
		accessCardStatus = AccessCardStatusIssueable
	}
	
	var userType = app.lookup("AMAAI_cmbUserType").value;
	var expire = app.lookup("AMAAI_cmbExpire").value;
	var userName = app.lookup("AMAAI_ipbUserName").value;
	var group  = app.lookup("AMAAI_cmbUserGroup").value;
	if(userType == 0 ){
		userType = UserPrivArmyFixPersion;
	}
	
	var sms_getAccessApplicationList = app.lookup("sms_getAccessApplicationList");	
	
	sms_getAccessApplicationList.setParameters("applicationType",AccessApplicationTypeAccess );
	sms_getAccessApplicationList.setParameters("applicationStatus", AccessApplicationStatusApproval);
	sms_getAccessApplicationList.setParameters("accessCardStatus", accessCardStatus);
	sms_getAccessApplicationList.setParameters("userType", userType);
	sms_getAccessApplicationList.setParameters("expire", expire);
	sms_getAccessApplicationList.setParameters("userName", userName);
	sms_getAccessApplicationList.setParameters("group", group);
	sms_getAccessApplicationList.setParameters("offset", offset);
	sms_getAccessApplicationList.setParameters("limit", AMAAI_pageRowCount);
	
	sms_getAccessApplicationList.send();
}

//
function onAMAAI_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	var pageIndexer = app.lookup("AMAAI_piApplication");	
	pageIndexer.currentPageIndex = 1;
	sendAccessApplicationReq();
}

function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		var pageIndexer = app.lookup("AMAAI_piApplication");	
		pageIndexer.currentPageIndex = 1;
		sendAccessApplicationReq();	
	}
}

// 발급 버튼 클릭
function onAMAAI_btnCardIssueClick(/* cpr.events.CMouseEvent */ e){
	var aMAAI_btnCardIssue = e.control;
	
	var grdAccessApplicationList = app.lookup("AMAAI_grdAccessUserList");
	var index = grdAccessApplicationList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var accessApplicationInfo = grdAccessApplicationList.getRow(index);
	if (accessApplicationInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	
	var cardStatus = accessApplicationInfo.getValue("AccessCardStatus");
	if( cardStatus == AccessCardStatusIssue){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "이미 발급된 카드입니다.");
		return false;
	}
		
	var userType = accessApplicationInfo.getValue("UserType");
	var cardType = 0;
	var accessCardInfo = app.lookup("AccessCardInfo");
	accessCardInfo.clear();
	
	accessCardInfo.setValue("CardType", userType);
	accessCardInfo.setValue("OwnerID", accessApplicationInfo.getValue("UserID"));
	accessCardInfo.setValue("OwnerServiceNumber", accessApplicationInfo.getValue("ServiceNumber"));
	accessCardInfo.setValue("OwnerBirthday", accessApplicationInfo.getValue("Birthday"));
		
	var dmAccessApplicationInfo = app.lookup("dmAccessApplicationInfo");
	dmAccessApplicationInfo.clear();
	dmAccessApplicationInfo.setValue("ApplicationIndex", accessApplicationInfo.getValue("ApplicationIndex").toString());
		
	console.log(dmAccessApplicationInfo.getDatas());
	var sms_postAccessCardIssue = app.lookup("sms_postAccessCardIssue");

	sms_postAccessCardIssue.userAttr("index", String(accessApplicationInfo.getIndex()));
	sms_postAccessCardIssue.send();	
}

// 출입증 인쇄 정보 가져오기 완료
function onSms_getAccessCardPrintInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {	
				
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 출입신청 기록 가져오기 완료
function onSms_getAccessApplicationListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
				
		var userAccessApplications = app.lookup("UserAccessApplications");
		var count = userAccessApplications.getRowCount();
		for(var i =0; i < count; i ++ ){
			var accessApplicationInfo = userAccessApplications.getRow(i);
			var userType = accessApplicationInfo.getValue("UserType");
				
			if( userType == UserPrivArmyFamily){
				var position = accessApplicationInfo.getValue("VisitTargetPosition");
				accessApplicationInfo.setValue("Position",dataManager.getPositionIDByName(position));
				var group = accessApplicationInfo.getValue("VisitTargetGroup");
				accessApplicationInfo.setValue("GroupCode",dataManager.getGroupIDByName(group));
			}
		}
		userAccessApplications.commit();
		/*if( app.lookup("UserAccessApplications").getRowCount() == 0 ){			
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_NoSearchResult"));
		}*/
		var pageIndexer = app.lookup("AMAAI_piApplication");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;
					
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 출입증 발급 완료
function onSms_postAccessCardIssueSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** @type cpr.protocols.Submission */
	
	var sms_postAccessCardIssue = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		// onCardPrintReq(true); //발급시 카드 프린트 인쇄 X, 미리보기 확인 후 인쇄 진행
		var index = Number(sms_postAccessCardIssue.userAttr("index"));
		var application = app.lookup("UserAccessApplications").getRow(index);
		if(application){
			application.setValue("AccessCardStatus",AccessCardStatusIssue);
		}
		
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMY_AccessCardIssued"));	
		sendAccessApplicationReq();	
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onCardPrintReq(issued){	
	if ( AMAAI_deviceWebSocket == null ){		
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_DeviceConnectFailed"));
		return false;
	}
	
	// 출입신청 정보 확인
	var grdAccessUserList = app.lookup("AMAAI_grdAccessUserList");
	var index = grdAccessUserList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return false;
	}
		
	var row = grdAccessUserList.getRow(index);
	if (row == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return false;
	}
	
	// 출입증 종류별 프린트 설정 확인
	// 부서,군번,성명,사진,가족
	
	if( issued == false ){
		var cardStatus = row.getValue("AccessCardStatus");
		if( cardStatus != AccessCardStatusIssue){
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "발급된 카드가 아닙니다.");
			return false;
		}
	}
	
	var cardInfo = app.lookup("AccessCardInfo");
	var cardType = String(cardInfo.getValue("CardType"));		
	var managementNumber = String(cardInfo.getValue("ManagementNumber"));	
		
	var userType = row.getValue("UserType");
	if( userType == 900 || userType ==907 ){
		userType = 904;
	}
	var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
	var PrintType = app.lookup("cardPrintType");
	var acpInfo = accessCardPrintInfoList.findFirstRow("AccessCardType == '"+userType+"'&& PrintType == " + PrintType.value);
			
	var bodyData = {};
	
	bodyData.CardType = Number(cardType);
	bodyData.ManagementNumber = Number(managementNumber);
	
	/* 앞면상단텍스트,색상,앞면중앙박스텍스트,색상,앞면하단박스테스트,색상,앞면하단텍스트,색상,뒷면상단텍스트,색상*/
	if(acpInfo.getValue("GroupPrint")==1){
		bodyData.Group = dataManager.getGroupName(row.getValue("GroupCode"));
	}	
	if(acpInfo.getValue("ServiceNumberPrint")==1){		
		bodyData.ServiceNumber = row.getValue("ServiceNumber");
		if( bodyData.ServiceNumber == undefined || bodyData.ServiceNumber.length == 0){
			bodyData.ServiceNumber = row.getValue("Birthday");
		}
	}
	if(acpInfo.getValue("NamePrint")==1){
		bodyData.Name = row.getValue("Name");
	}
	if(acpInfo.getValue("PhotoPrint")==1){
		bodyData.UserPicture = row.getValue("UserPicture");
	}
	if (userType == UserPrivArmyFamily && acpInfo.getValue("FamilyPrint")==1 ){ // 군가족인 경우
	    var relation = row.getValue("FamilyRelation");
	    switch(Number(relation)){
	    	case 1: bodyData.FamilyRelation = "부"; break; 
	    	case 2: bodyData.FamilyRelation = "모"; break;
	    	case 3: bodyData.FamilyRelation = "배우자"; break;
	    	case 4: bodyData.FamilyRelation = "자녀"; break;
	    	case 5: bodyData.FamilyRelation = "형제자매"; break;
	    	case 6: bodyData.FamilyRelation = "친척"; break;
	    }		
	}
		
	if(acpInfo.getValue("ImageFront").length != 0){
		bodyData.ImageFront = acpInfo.getValue("ImageFront");
	}
	
	if(acpInfo.getValue("ImageBack").length != 0){
		bodyData.ImageBack = acpInfo.getValue("ImageBack");
	}
			
	var ipbTextFrontTop = app.lookup("AMAAI_ipbTextFrontTop");
	if( ipbTextFrontTop.value && ipbTextFrontTop.value.length != 0){
		bodyData.TextFrontTop = ipbTextFrontTop.value;
		bodyData.TextFrontTopColor = app.lookup("AMAAI_cmbTextFrontTopColor").value;
	}
	
	var ipbTextFrontCenterBox = app.lookup("AMAAI_ipbTextFrontCenterBox");
	if( ipbTextFrontCenterBox.value && ipbTextFrontCenterBox.value.length != 0){
		bodyData.TextFrontCenterBox = ipbTextFrontCenterBox.value;
		bodyData.TextFrontCenterBoxColor = app.lookup("AMAAI_cmbTextFrontCenterBoxColor").value;		
	}	
	
	var ipbTextFrontBottomBox = app.lookup("AMAAI_ipbTextFrontBottomBox");
	if( ipbTextFrontBottomBox.value && ipbTextFrontBottomBox.value.length != 0){
		bodyData.TextFrontBottomBox = ipbTextFrontBottomBox.value;
		bodyData.TextFrontBottomBoxColor = app.lookup("AMAAI_cmbTextFrontBottomBoxColor").value;		
	}
	
	var ipbTextFrontBottom = app.lookup("AMAAI_ipbTextFrontBottom");
	if( ipbTextFrontBottom.value && ipbTextFrontBottom.value.length != 0){
		bodyData.TextFrontBottom = ipbTextFrontBottom.value;
		bodyData.TextFrontBottomColor = app.lookup("AMAAI_cmbTextFrontBottomColor").value;		
	}
	
	var ipbTextBackTop = app.lookup("AMAAI_ipbTextBackTop");
	if( ipbTextBackTop.value && ipbTextBackTop.value.length != 0){
		bodyData.TextBackTop = ipbTextBackTop.value;
		bodyData.TextBackTopColor = app.lookup("AMAAI_cmbTextBackTopColor").value;		
	}
	
	var msgReq = {
    	msgId: String(WSCmdCardPrintReq),
    	body: bodyData
	};
	
	var msgData = JSON.stringify(msgReq);	 	
	AMAAI_deviceWebSocket.send(msgData);
	
	return true;
}


/*
 * "인쇄" 버튼(AMAAI_btnCardPrint)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onAMAAI_btnCardPrintClick(/* cpr.events.CMouseEvent */ e){
	var aMAAI_btnCardIssue = e.control;
	
	var grdAccessApplicationList = app.lookup("AMAAI_grdAccessUserList");
	var index = grdAccessApplicationList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var accessApplicationInfo = grdAccessApplicationList.getRow(index);
	if (accessApplicationInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
	
	if( onCardPrintReq(false) == true ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "출입증 인쇄정보를 전송했습니다.");	
	}
}

function onPreviewButtonClick(/* cpr.events.CMouseEvent */ e){
	var grdAccessUserList = app.lookup("AMAAI_grdAccessUserList");
	var index = grdAccessUserList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return false;
	}
		
	var row = grdAccessUserList.getRow(index);
	if (row == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return false;
	}
	
	var cardStatus = row.getValue("AccessCardStatus");
	if( cardStatus != AccessCardStatusIssue){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "발급된 카드가 아닙니다.");
		return false;
	}
	
	var PrintType = app.lookup("cardPrintType");
	if( !PrintType.value ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "인쇄 타입을 선택해 주세요.");
		return false;
	}	
	var cardInfo = app.lookup("AccessCardInfo");
	var cardType = String(cardInfo.getValue("CardType"));		
	var managementNumber = String(cardInfo.getValue("ManagementNumber"));
	
	var fillZero = function(width, str){  return str.length >= width ? str:new Array(width-str.length+1).join('0')+str; }
	managementNumber = fillZero(2, cardType) + " - " + fillZero(4, managementNumber);
		
	var userType = row.getValue("UserType");
	if( userType == 900 || userType ==907 ){
		userType = 904;
	}
	var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
	var PrintType = app.lookup("cardPrintType");
	var acpInfo = accessCardPrintInfoList.findFirstRow("AccessCardType == '"+userType+"' && PrintType == '"+PrintType.value+"'");

	var groupName = "";
	var serviceNumber = "";
	var userName = "";
	var userPicture = "";
	
	if(acpInfo.getValue("GroupPrint")==1){
		groupName = "부서: " + dataManager.getGroupName(row.getValue("GroupCode"));
	}
	
	if(acpInfo.getValue("ServiceNumberPrint")==1){		
		serviceNumber = row.getValue("ServiceNumber");
		if( serviceNumber == undefined || serviceNumber.length == 0){
			serviceNumber = "군번: " + row.getValue("Birthday");
		} else {
			serviceNumber = "군번: " + serviceNumber;
		}
	}
	
	if(acpInfo.getValue("NamePrint")==1){
		userName = "성명: " + row.getValue("Name");
	}
	
	if(acpInfo.getValue("PhotoPrint")==1){
		userPicture = row.getValue("UserPicture");
	}
	
	if (userType == UserPrivArmyFamily && acpInfo.getValue("FamilyPrint")==1 ){ // 군가족인 경우
	    var relation = row.getValue("FamilyRelation");
	    switch(Number(relation)){
	    	case 1: serviceNumber = "관계: 부"; break; 
	    	case 2: serviceNumber = "관계: 모"; break;
	    	case 3: serviceNumber = "관계: 배우자"; break;
	    	case 4: serviceNumber = "관계: 자녀"; break;
	    	case 5: serviceNumber = "관계: 형제자매"; break;
	    	case 6: serviceNumber = "관계: 친척"; break;
	    }		
	}
		
	var appld = "app/custom/rokmch/accessCard/accessCardPrintPreview";
	app.openDialog(appld, {width : 560, height : 550}, function(dialog){
		dialog.style.header.css("background-color", "#528443");
		dialog.headerTitle = ("출입증 인쇄 미리보기");
		dialog.initValue = {
			"FrontTop": app.lookup("AMAAI_ipbTextFrontTop").value,
			"FrontCenterBox": app.lookup("AMAAI_ipbTextFrontCenterBox").value,
			"FrontBottomBox": app.lookup("AMAAI_ipbTextFrontBottomBox").value,
			"FrontBottom": app.lookup("AMAAI_ipbTextFrontBottom").value,
			"BackTop": app.lookup("AMAAI_ipbTextBackTop").value,
			"FrontTopColor": app.lookup("AMAAI_cmbTextFrontTopColor").value,
			"FrontCenterBoxColor": app.lookup("AMAAI_cmbTextFrontCenterBoxColor").value,
			"FrontBottomBoxColor": app.lookup("AMAAI_cmbTextFrontBottomBoxColor").value,
			"FrontBottomColor": app.lookup("AMAAI_cmbTextFrontBottomColor").value,
			"BackTopColor": app.lookup("AMAAI_cmbTextBackTopColor").value,
			"ImageFront": acpInfo.getValue("ImageFront"),
			"ImageBack": acpInfo.getValue("ImageBack"),
			"PrintType": acpInfo.getValue("PrintType"),
			"managementNumber": managementNumber,
			"Group": groupName,
			"ServiceNumber": serviceNumber,
			"Name": userName,
			"UserPicture": userPicture
		};
			
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != null ){
		}
	});	
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAMAAI_piApplicationSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var aMAAI_piApplication = e.control;
	sendAccessApplicationReq();
}
