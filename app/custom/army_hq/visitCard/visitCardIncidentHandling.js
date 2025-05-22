/************************************************
 * accessCardRetrieve.js
 * Created at 2021. 2. 5. 오전 11:06:06.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var AMACR_pageRowCount = 50;
var AMACR_deviceWebSocket;
// 사고처리 후, 새로고침하지 않고 그리드에서 다른 줄을 선택했다 사고처리한 카드로 돌아오면 카드상태값이 선택이 되지 않아 임시 처리를 위한 값
//var tempIncidentCardStatus;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	initControls();
//	sendAcceesCardIssuanceList();
}

function onBodyUnload(/* cpr.events.CEvent */ e){
	if(AMACR_deviceWebSocket != null){AMACR_deviceWebSocket.close();AMACR_deviceWebSocket = null;}
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function initControls(){
	var cmbGroup = app.lookup("AMCIH_cmbGroup");
	cmbGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID" });
	cmbGroup.selectItemByValue(0);
		
	var pageIndexer = app.lookup("AMCIH_piPersonnelList");	
	pageIndexer.pageRowCount = AMACR_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10;// 보여지는 페이지 수(하단 부 인덱스 수)
}

function clearPersonnelDetail(){
	app.lookup("AMCIH_cmbPersonnelInfoUserType").value = "";
	app.lookup("AMCIH_opbPersonnelInfoName").value = "";
	app.lookup("AMCIH_opbPersonnelInfoServiceNumber").value = "";
	app.lookup("AMCIH_opbPersonnelInfoPosition").value = "";
	app.lookup("AMCIH_opbPersonnelInfoUserGroup").value = "";
		
	app.lookup("AMCIH_opbPersonnelInfoAccessStart").value = "";
	app.lookup("AMCIH_opbPersonnelInfoAccessEnd").value = "";
	
	app.lookup("AMCIH_cmbPersonnelInfoAccessCardType").value = "";
	app.lookup("AMCIH_opbPersonnelInfoManagementNumber").value = "";
	
	app.lookup("AMCIH_opbAccessGroup").value = "";
	app.lookup("AMCIH_opbIssueAt").value = "";
	app.lookup("AMCIH_cmbIncidentType").value = 0;	
}

function sendAcceesCardIssuanceList(){
	var userName = app.lookup("AMCIH_ipbName").value;
	if( userName != null && userName.length == 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_SearchNameLengthInvalid"));
		return;
	}
	clearPersonnelDetail();	
	
	var dsAccessCardList = app.lookup("AccessCardList");
	dsAccessCardList.clear();
	
	var pageIndexer = app.lookup("AMCIH_piPersonnelList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * AMACR_pageRowCount;
	
	var group  = app.lookup("AMCIH_cmbGroup").value;
	
	var sms_getAccessCardInfoExList = app.lookup("sms_getVisitCardInfoList");	
	sms_getAccessCardInfoExList.setParameters("accessCardStatus", AccessCardStatusIncident);
	//sms_getAccessCardInfoExList.setParameters("cardType", app.lookup("AMCIH_rdbCardType").value);
	
	sms_getAccessCardInfoExList.setParameters("userName", userName);
	sms_getAccessCardInfoExList.setParameters("group", group);
	sms_getAccessCardInfoExList.setParameters("limit", AMACR_pageRowCount);
	sms_getAccessCardInfoExList.setParameters("offset", offset);
	sms_getAccessCardInfoExList.send();
}
// 출입증 교부 출입자 목록 가져오기
function onAMACR_btnPersonnelListSearchClick(/* cpr.events.CMouseEvent */ e){	
	sendAcceesCardIssuanceList();		
}

//function onKeywordKeydown(/* cpr.events.CKeyboardEvent */ e){
//	if(e.keyCode == 13) {
//		sendAcceesCardIssuanceList();		
//	}
//}

// 검색어 2글자 이상 팝업 제대로 보이도록 keydown을 keyup으로 변경 - pse
function onAMCIH_ipbNameKeyup(/* cpr.events.CKeyboardEvent */ e){
	if(e.keyCode == 13) {
		sendAcceesCardIssuanceList();		
	}
}

// 출입증 리스트 가져오기 완료
function onSms_getAccessCardInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		if( app.lookup("AccessCardList").getRowCount() == 0 ){
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_NoSearchResult"));
		}
		var pageIndexer = app.lookup("AMCIH_piPersonnelList");
		var total = app.lookup("Total").getValue("Count");
		pageIndexer.totalRowCount = total;
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 출입증 교부 사용자 리스트 클릭
function onAMACR_grdPersonnelListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	clearPersonnelDetail();	
	
	/** @type cpr.controls.Grid	 */	
	var grdPersonnelList = e.control;	
	var index = grdPersonnelList.getSelectedRowIndex();
	if( index < 0  ){
		return
	}		
	app.lookup("AMCIH_opbProcessAt").value = "";	
	var cardInfo = grdPersonnelList.getRow(index);
	if (cardInfo) {
		console.log(cardInfo.getRowData());
		var applicationIndex = cardInfo.getValue("ApplicationIndex");
		
		var sms_getAccessApplicationInfo = app.lookup("sms_getAccessApplicationInfo");
		sms_getAccessApplicationInfo.action = "/v1/armyhq/accessApplication/"+applicationIndex;
		sms_getAccessApplicationInfo.send();
		
		app.lookup("AMCIH_cmbPersonnelInfoUserType").value = cardInfo.getValue("UserType");
		app.lookup("AMCIH_opbPersonnelInfoName").value = cardInfo.getValue("OwnerName");
		var serviceNumber = cardInfo.getValue("OwnerServiceNumber");
		if( serviceNumber.length == 0 ){serviceNumber = cardInfo.getValue("OwnerBirthday");}
		app.lookup("AMCIH_opbPersonnelInfoServiceNumber").value = serviceNumber;
		app.lookup("AMCIH_opbPersonnelInfoPosition").value = cardInfo.getValue("OwnerPosition");
		app.lookup("AMCIH_opbPersonnelInfoUserGroup").value = cardInfo.getValue("OwnerGroup");
		var startAt = cardInfo.getValue("IssueAt");
		if( startAt.length>10){startAt = startAt.substring(0, 10);}
		app.lookup("AMCIH_opbIssueAt").value = startAt;
		
		var cardType = cardInfo.getValue("CardType"); 
		var cmbCardType = app.lookup("AMCIH_cmbPersonnelInfoAccessCardType").value = cardType;
		var managementNumber = cardInfo.getValue("ManagementNumber");
		
		var retrieveAt = cardInfo.getValue("RetrieveAt"); 
		if( retrieveAt.length>10){retrieveAt = retrieveAt.substring(0, 10);}
		//app.lookup("AMCIH_opbProcessAt").value = retrieveAt;
		
		/* // managementNumber 서버에서 정리되서 넘어오므로 주석처리 -mjy
		if( cardType.length < 2 ){
			cardType = "00"+cardType;
		} 
		
		var mNum = managementNumber.length;
		for( var i = 0; i < 4 - mNum; i++){
			managementNumber = "0"+managementNumber;
		}	
		* */
		
//		app.lookup("AMCIH_opbPersonnelInfoManagementNumber").value = cardType + " - " +managementNumber;
		app.lookup("AMCIH_opbPersonnelInfoManagementNumber").value = managementNumber;
		var cmbIncidentType = app.lookup("AMCIH_cmbIncidentType");
		cmbIncidentType.value = cardInfo.getValue("CardStatus");
		if (Number(cmbIncidentType.value) >= 61){
			// 기존에는 사고처리 안된 경우 처리 일시가 0001-01-01로 보여 사고처리된 카드만 처리일시 보이도록 처리 - pse
			app.lookup("AMCIH_opbProcessAt").value = retrieveAt;
			cmbIncidentType.readOnly = true;
			cmbIncidentType.hideButton = true;
			app.lookup("AMCIH_btnSave").enabled = false;
			app.lookup("AMCIH_btnSave").visible = false;
		} else {
			cmbIncidentType.readOnly = false;
			cmbIncidentType.hideButton = false;
			app.lookup("AMCIH_btnSave").enabled = true;
			app.lookup("AMCIH_btnSave").visible = true;
		}
	}
}

function onSms_getAccessApplicationInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	console.log(app.lookup("AccessApplicationInfo").getDatas());
	
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		var accessApplicationInfo = app.lookup("AccessApplicationInfo");
		var startAt = accessApplicationInfo.getValue("AccessStart");
		if( startAt.length>10){startAt = startAt.substring(0, 10);}
		app.lookup("AMCIH_opbPersonnelInfoAccessStart").value = startAt;
		var endAt = accessApplicationInfo.getValue("AccessEnd");
		if( endAt.length>10){endAt = endAt.substring(0, 10);}
		app.lookup("AMCIH_opbPersonnelInfoAccessEnd").value = endAt;	
		app.lookup("AMCIH_cmbPersonnelInfoUserType").value=accessApplicationInfo.getValue("UserType");
		
//		var smsGetTerminalList = app.lookup("sms_getTerminalList");			
//		smsGetTerminalList.setParameters("limit", 1000);
//		smsGetTerminalList.setParameters("offset", 0);
//		smsGetTerminalList.action = "/v1/accessGroups/"+accessApplicationInfo.getValue("AccessGroup")+"/terminals";
//		smsGetTerminalList.send();
		getAccessArea();
			
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}


// 저장 버튼 클릭
function onAMACR_btnRetrieveClick(/* cpr.events.CMouseEvent */ e){
	
	var grdPersonnelList = app.lookup("AMCIH_grdPersonnelList");
	var index = grdPersonnelList.getSelectedRowIndex();
	if( index < 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var rowCardInfo = grdPersonnelList.getRow(index);
	if (rowCardInfo == undefined) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_PersonnelListNotSelected"));
		return;
	}
		
	var accessCardInfo = app.lookup("AccessCardInfo");
	accessCardInfo.clear();
	
	var applicationIndex = rowCardInfo.getValue("ApplicationIndex");
	
	var ownerID = rowCardInfo.getValue("OwnerID");
	// 페이지 새로고침 전 임시 처리
	//tempIncidentCardStatus = app.lookup("AMCIH_cmbIncidentType").value;
	accessCardInfo.setValue("CardStatus",app.lookup("AMCIH_cmbIncidentType").value);	
	accessCardInfo.setValue("ApplicationIndex", applicationIndex);
	accessCardInfo.setValue("CardNumber", rowCardInfo.getValue("CardNumber"));
	accessCardInfo.setValue("OwnerID", ownerID);	
	accessCardInfo.setValue("WhereFlag", 1); // 방문증 사고처리의 회수(재사용)시에 access_card_info 테이블에서 owner_id 뺴주기 위해 생성 -mjy
	//accessCardInfo.setValue("Description", desc);
	accessCardInfo.setValue("CardType", app.lookup("AMCIH_cmbPersonnelInfoAccessCardType").value);
	var sms_postAccessCardRetrive = app.lookup("sms_postAccessCardIncident");	
	sms_postAccessCardRetrive.send();
}

// 회수 처리 완료
function onSms_postAccessCardRetriveSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "방문증 사고처리가 완료되었습니다.");
		// 새로고침 전 사고처리 카드 상태값 제대로 반영되지 않아 임시 처리... - pse
		/*
		var selectedRowIndex = app.lookup("AMCIH_grdPersonnelList").getSelectedRowIndex();
		app.lookup("AccessCardList").setValue(selectedRowIndex, "CardStatus", tempIncidentCardStatus);
		var cmbIncidentType = app.lookup("AMCIH_cmbIncidentType");
		cmbIncidentType.readOnly = true;
		cmbIncidentType.hideButton = true;
		app.lookup("AMCIH_btnSave").enabled = false;
		app.lookup("AMCIH_btnSave").visible = false;
		cmbIncidentType.redraw();
		app.lookup("AMCIH_btnSave").redraw();
		*/
		sendAcceesCardIssuanceList();
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}


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
		app.lookup("AMCIH_opbAccessGroup").value = accessArea;
		
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAMCIH_piPersonnelListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var aMCIH_piPersonnelList = e.control;
	sendAcceesCardIssuanceList();//페이지 전환
}

/*
 * 터미널 ID 대신 출입구역으로 출력.
 * 방문신청자의 출입그룹에 맞는 출입구역을 찾는다. - mjy
 */
function getAccessArea() {
		var applicationInfo = app.lookup("AccessApplicationInfo");
		var accessAreaList = dataManager.getAccessArea();
		var accessAreaGroupList = dataManager.getAccessAreaGroup();
		
		var accessArea = ""
		var condition = "AccessGroupID == " + applicationInfo.getValue("AccessGroup");  
		
		var AccessAreaRows = accessAreaGroupList.findAllRow(condition);
		AccessAreaRows.forEach(function(each){
			condition = "ID == " + each.getValue("AccessAreaID");
			var AccessAreaRow = accessAreaList.findFirstRow(condition);
			if(accessArea.length > 0){
				accessArea += ", ";
			}
			accessArea += AccessAreaRow.getValue("Name");			
		});
		
		app.lookup("AMCIH_opbAccessGroup").value = accessArea;
}
