/************************************************
 * CardManagement.js
 * Created at 2019. 9. 9. 오전 10:58:30.
 *
 * @author jrh
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var pageRowCount = 17;
var comLib;
var USCDR_userID;
var deviceWebSocket;
var usint_version;
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);	
	dataManager = getDataManager();
	var usint_version;
	var Pass_InputKeyword = app.lookup("Pass_InputKeyword");
	var PassTypeFilterCmb = app.lookup("PassTypeFilterCmb");
	
	connectDeviceServer("127.0.0.1:9600");
	sendJWDCardInfoListRequest();
}

/*
 * Body에서 before-unload 이벤트 발생 시 호출.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	if(deviceWebSocket != null){
		deviceWebSocket.close();
		deviceWebSocket = null;
	}
}


/*
 * "" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPassAddButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {"Target":DLG_PASS_REGIST}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
	
}



function sendJWDCardInfoListRequest() {

	app.lookup("CardInfoList").clear();
	
	var udcPassListGrid = app.lookup("udcPassListGrid");
	 
	var curIndex = udcPassListGrid.getCurrentPageIndex();
	var offset = (curIndex - 1) * pageRowCount;
	var sms_getCardInfoList = app.lookup("sms_getCardInfoList");
	
	var edtKeyword = app.lookup("PassTypeFilterCmb");

	if(edtKeyword.value == "all"){
		sms_getCardInfoList.setParameters("searchCategory", "");
		sms_getCardInfoList.setParameters("searchKeyword", "");
	}else{
		sms_getCardInfoList.setParameters("searchCategory", "cardType");
		sms_getCardInfoList.setParameters("searchKeyword", edtKeyword.value);
	}
	
	var UnIssuedCbx = app.lookup("UnIssuedCbx");
	var IssuedCbx = app.lookup("IssuedCbx");
	var TakeBackCbx = app.lookup("TakeBackCbx");
	
	if(UnIssuedCbx.checked == true){
		sms_getCardInfoList.setParameters("notIssuedStatus", 1);
	}
	else{
		sms_getCardInfoList.setParameters("notIssuedStatus", 0);
	}
	
	if(IssuedCbx.checked == true){
		sms_getCardInfoList.setParameters("issuedStatus", 1);
	}
	else{
		sms_getCardInfoList.setParameters("issuedStatus", 0);
	}
	
	if(TakeBackCbx.checked == true){
		sms_getCardInfoList.setParameters("retrievalStatus", 1);
	}else{
		sms_getCardInfoList.setParameters("retrievalStatus", 0);
	}
	
	sms_getCardInfoList.setParameters("offset", offset);
	sms_getCardInfoList.setParameters("limit", pageRowCount);
	sms_getCardInfoList.send();
	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getCardInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	
	var sms_getCardInfoList = e.control;
	var dmTotal = app.lookup("Total");
	var Result = app.lookup("Result");
	var totalCount = parseInt(dmTotal.getValue("Count"));
	var totalLabel = app.lookup("PassCount");
	
	var dsCardInfoList = app.lookup("CardInfoList");
	var udcPassListGrid = app.lookup("udcPassListGrid");
	
	totalLabel.value = totalCount;
	
	
	
	var totalCount = parseInt(dmTotal.getValue("Count"));
		
	var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
	
	if (viewPageCount > 10) {
		viewPageCount = 10;
	}

	udcPassListGrid.setPassList(dsCardInfoList);
	udcPassListGrid.setPaging1(totalCount, pageRowCount, viewPageCount);
	app.lookup("udcPassListGrid").redraw();
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getCardInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getCardInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onPassTypeFilterCmbSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var passTypeFilterCmb = e.control;
	var udcPassListGrid = app.lookup("udcPassListGrid");
	udcPassListGrid.set1page(1);
	sendJWDCardInfoListRequest();
	
}



// 출입증 캡쳐 후 검색
function onPassCaptureSearch(/* cpr.events.CMouseEvent */ e){
	//조회 결과 초기화
	var udcPassListGrid = app.lookup("udcPassListGrid");
	udcPassListGrid.InitpassList();
	app.lookup("CardInfoList").clear();
	var sms_getCardInfo = app.lookup("sms_getCardInfo");
	
	var cardNum = app.lookup("Pass_InputKeyword").value;
	sms_getCardInfo.action = "/v1/cardInfo/"+cardNum;
	sms_getCardInfo.send();
	
}



/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getCardInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getCardInfo = e.control;
	
	
	var dsCardInfoList = app.lookup("CardInfoList");
	var dsCardInfo = app.lookup("CardInfo");
	
	if(dsCardInfo.getValue("CardNum") != ""){
		dsCardInfoList.clear();
		dsCardInfoList.addRowData(dsCardInfo.getDatas());
	}else{
		dsCardInfoList.clear();
	}
	
	var totalCount = 1;
		
	var viewPageCount = totalCount / pageRowCount + (totalCount % pageRowCount > 0);
	
	if (viewPageCount > 10) {
		viewPageCount = 10;
	}

	//var dsCardInfoList = app.lookup("CardInfoList");
	var udcPassListGrid = app.lookup("udcPassListGrid");
	udcPassListGrid.setPassList(dsCardInfoList);
	udcPassListGrid.setPaging2(totalCount,1, pageRowCount, viewPageCount);
	
	app.lookup("udcPassListGrid").redraw();
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getCardInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getCardInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",COMERROR_NET_ERROR)
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onUdcPassListGridPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.PassList
	 */
	var udcPassListGrid = e.control;
	sendJWDCardInfoListRequest();	
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
                	
		            var dsUserCardInfo = app.lookup("CardInfoList");
		            var strCardNum = result.CardNum; // 카드번호 옮겨 담기
		            if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
		            	strCardNum = StrLib.formattedString("00000000",String(result.CardNum), "left");	
		            } 
		            var existRow = dsUserCardInfo.findFirstRow("CardNum == '"+strCardNum+"'");
		            //if(existRow){
		            	//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_DuplicateAlert"));
		            //}else {
		            	//dsUserCardInfo.addRowData({"CardNum":strCardNum})
		            	//console.log(dsUserCardInfo.getRowDataRanged());
		            	var Pass_InputKeyword = app.lookup("Pass_InputKeyword");
		            	Pass_InputKeyword.value = strCardNum;
		            	onPassCaptureSearch();
		            //}
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



// 카드 캡쳐 클릭
function onUSCDR_btnCardCaptureClick(/* cpr.events.CMouseEvent */ e){		
	onCardCaptureReq(USCDR_userID);
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
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onUnIssuedCbxValueChange2(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var unIssuedCbx = e.control;
	sendJWDCardInfoListRequest();
}


/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onIssuedCbxValueChange2(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var issuedCbx = e.control;
	sendJWDCardInfoListRequest();
}


/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onTakeBackCbxValueChange2(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var takeBackCbx = e.control;
	sendJWDCardInfoListRequest();
}


/*
 * 사용자 정의 컨트롤에서 passListDblclick 이벤트 발생 시 호출.
 */
function onUdcPassListGridPassListDblclick(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type udc.grid.PassList
	 */
	var udcPassListGrid = e.control;
	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_PASS_INFO,
			"InitVal": {
				"CardNum": e.row.getRowData()["CardNum"],
				"CardType":e.row.getRowData()["CardType"],
				"IssueStatus":e.row.getRowData()["IssueStatus"],
				"CardName": e.row.getRowData()["CardName"],
				"RegistDate":e.row.getRowData()["RegistDate"],
				"IssueUniqueid":e.row.getRowData()["IssueUniqueid"],
				"IssueUserid":e.row.getRowData()["IssueUserid"]
			}
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


/*
 * "Button" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var appld = "app/main/sample/sampleAccessCard" + "?" + usint_version;
		app.openDialog(appld, {width : 500, height : 400},function(dialog){

	});
}


// 출입증 삭제 결과 콜백. 별도 오픈된 사용자 정보창에서 사용자 삭제시 발생.
exports.onPassDeleteSync = function( PassID ){
	var udcPassListGrid = app.lookup("udcPassListGrid");
	udcPassListGrid.deletePass(PassID);
}

exports.onPassReFreshSync = function( PassID ){
	var sms_getCardInfo = app.lookup("sms_getCardInfo");
	sms_getCardInfo.action = "/v1/cardInfo/"+PassID;
	sms_getCardInfo.send();
}



/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSMAG_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
