/************************************************
 * accessCardSelectOne.js
 * Created at 2019. 10. 25. 오후 2:50:42.
 *
 * @author joymrk
 ************************************************/
var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var deviceWebSocket;
var JWACS_pageRowCount = 20;
var _cardType;
var _popupType;
function initPageIndexer(totalRowCount, currentPageIndex, pageRowCount, viewPageCount) {
	var pageIndex = app.lookup("accessCardPageIndexer");
	pageIndex.totalRowCount = totalRowCount;
	pageIndex.currentPageIndex = currentPageIndex;
	pageIndex.pageRowCount = pageRowCount;
	pageIndex.viewPageCount = viewPageCount;
	pageIndex.redraw();
}

function selectPaging(totalCount, viewPageCount) {
	var pageIndex = app.lookup("accessCardPageIndexer");
	pageIndex.totalRowCount = totalCount;//전체 데이터 수.
	pageIndex.pageRowCount = JWACS_pageRowCount;//한 페이지에 보여 줄 행의 수
	pageIndex.viewPageCount = viewPageCount;// 보여지는 페이지 수(하단 부 인덱스 수)
	pageIndex.redraw();
}
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();

	var link = app.lookup("JWACS_sniDownloadLink");
	link.value=	"<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">"+dataManager.getString("Str_DeviceServerDownloadPath")+"</a>";
	
	connectDeviceServer("127.0.0.1:9600");
	
	initPageIndexer(0,1,5, JWACS_pageRowCount);

	var initValue = app.getHost().initValue;	
	if (initValue) {
		_cardType = initValue["CardType"];
		if (_cardType == undefined) {
			if (_cardType == 7) {
				app.lookup("PassTypeFilterCmb").value = _cardType;	 // 방문일때만
			}		
		}		
		var name = initValue["VisitorName"];
		if (name != undefined) {
			app.lookup("JWACS_opbName").value=name;
		}
				
	}	
	var popupType = initValue["PopupType"];
	switch(popupType) {
		case "MultiCheck":
			_popupType = 0;		
			break;
		case "SingleCheck":
			_popupType = 1;
			break;	
		default:
			_popupType = 0;
			break;		
	}
	if (_popupType == 1) {
		app.lookup("JWACS_grdCardList").header.getColumn(0).style.css("visibility", "hidden");//상단 전체체크 해제 버튼 숨김
	}
	sendAccessCardListRequest();
}

function connectDeviceServer(address) {
	deviceWebSocket = new WebSocket("ws://"+address+"/v1/webEntry");
        
    deviceWebSocket.onopen = function(message){      
    	console.log("device server ws connected.");   
        //dialogAlert(app, "Error", dataManager.getString("Str_HamsterConnected"));
    };

    deviceWebSocket.onclose = function(message){
    	deviceWebSocket = null;
        console.log("\Server disconnect..."); 
    };

    deviceWebSocket.onerror = function(message){
    	console.log("error... " + message);
        //app.lookup("USCDR_opbMessage").value = dataManager.getString("Str_DeviceServerInstallRequired");
        var link = app.lookup("JWACS_sniDownloadLink");
        link.visible=true;
    };
    
    deviceWebSocket.onmessage = function(message){
    	var msg = JSON.parse(message.data);
        
        switch( msg.msgId){                       
            case WSCmdCardCaptureRes:{
            	comLib.hideLoadMask();	
                var result = JSON.parse(msg.body);
                if( result.Result == "success" ) {
                	
                	var strCardNum = result.CardNum;
                	if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
                		if (strCardNum.length < 8) {
                			strCardNum = StrLib.formattedString("00000000",String(result.CardNum), "left");	
                		}
                		app.lookup("JWACS_ipbCardNum").value = strCardNum;
		            } 
                } else if (result.Result=="Capture failed"){
	            	dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardCapture"));
	            } else {
	            	dialogAlert(app, dataManager.getString("Str_Failed"), result.Result);	            	
	            }
           	}
		}
    }
}


function sendAccessCardListRequest() {
	app.lookup("CardInfoList").clear(); // 그리드 초기화
	comLib.showLoadMask("",dataManager.getString("Str_PassList"),"",0);
	
	var curPageIndex = app.lookup("accessCardPageIndexer").currentPageIndex; 
	var offset = (curPageIndex - 1) * JWACS_pageRowCount;
	var smsgetVisitRequestList = app.lookup("sms_getCardInfoList");
	var SearchCtrl = app.lookup("PassTypeFilterCmb");
	
	if (SearchCtrl.value == "all") { // 신청가능한 모든 카드 타입.
		smsgetVisitRequestList.setParameters("searchCategory", "");
		smsgetVisitRequestList.setParameters("searchKeyword", "");
	} else {
		smsgetVisitRequestList.setParameters("searchCategory", "cardType");
		smsgetVisitRequestList.setParameters("searchKeyword", _cardType);
	}	
	
	smsgetVisitRequestList.setParameters("cardNum", app.lookup("JWACS_ipbCardNum").value); // 미발급 단말기 리스트만
	smsgetVisitRequestList.setParameters("notIssuedStatus", 1); // 미발급 단말기 리스트만
	smsgetVisitRequestList.setParameters("offset", offset);
	smsgetVisitRequestList.setParameters("limit", JWACS_pageRowCount);
	smsgetVisitRequestList.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getCardInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var totalCount = parseInt(app.lookup("Total").getValue("Count"));
		var viewPageCount = totalCount / JWACS_pageRowCount + (totalCount % JWACS_pageRowCount > 0);
		
		if (viewPageCount > 10) {
			viewPageCount = 10;
		}
		
		selectPaging(totalCount, viewPageCount);
	} else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_PassList")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, "Waning", dataManager.getString("Str_PassList")+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("JWACS_grpMain").redraw();
}

function onSms_getCardInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getCardInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onAccessCardPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var accessCardPageIndexer = e.control;
	sendAccessCardListRequest();
}


/*
 * 버튼(JWACS_btnSelect)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWACS_btnSelectClick(/* cpr.events.CMouseEvent */ e){
	var grdCardList = app.lookup("JWACS_grdCardList");
	var checkedRowIndices = grdCardList.getCheckRowIndices();
	var selectCount = checkedRowIndices.length;
	if (selectCount == 0 ) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"));
		return;
	} else {
		// 맨앞에 하나만 선택
		var idx = checkedRowIndices[0];
		var rowdata = grdCardList.getRow(idx);
		
		app.close({"OutTroopsIssueType":0, "cardNum": rowdata.getValue("CardNum")});	 // 선택된 카드 값
	}
	return null
}

function onJWACS_btnCardCaptureClick(/* cpr.events.CMouseEvent */ e){
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
		//strSendinfo = '{"msgId":"'+ WSCmdCardCaptureReq+'","body":{"UserId":"'+uid+'","BrandType":"'+brandType+'","CardType":"' + cardType + 
		//'","readType":"' + readType + '","serialType":"'+ serialType +'"}';
		strSendinfo = '{"msgId":"'+ WSCmdCardCaptureReq+'","body":{"UserId":"0","BrandType":"'+brandType+'","CardType":"' + cardType + 
		'","readType":"' + readType + '","serialType":"'+ serialType +'"}';
				
		if (strSector.length > 0) {
			strSendinfo = strSendinfo + ',' + strSector + '}';
		} else {
			strSendinfo = strSendinfo + '}';
		}
		
		comLib.showLoadMask("", "카드 캡쳐 요청", "", 60);
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

function onJWACS_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	//pageIndex 초기 화
	var pageIndex = app.lookup("accessCardPageIndexer");	
	pageIndex.currentPageIndex = 1;
	 sendAccessCardListRequest();
}


/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onJWACS_grdCardListCellClick(/* cpr.events.CGridEvent */ e){
	
	if (_popupType == 0 ) { //  MultiCheck
		return;
	}
	
	var jWACS_grdCardList = e.control;
	if (e.cellIndex == 0) {
		jWACS_grdCardList.clearAllCheck();
		jWACS_grdCardList.setCheckRowIndex(e.rowIndex, true);
	}
}

function onJWACS_btnIssueClickClick(/* cpr.events.CMouseEvent */ e){
	var ipbCardNum = app.lookup("JWACS_ipbCardNum");
	
	app.close({"OutTroopsIssueType":1, "cardNum": ipbCardNum.value});	 // 선택된 카드 값
	return null
}


/*
 * Body에서 before-unload 이벤트 발생 시 호출.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	if (deviceWebSocket != null) {
		deviceWebSocket.close();
		deviceWebSocket = null;
	}
}
