/************************************************
 * AccessCardRegist.js
 * Created at 2019. 9. 9. 오후 2:26:00.
 *
 * @author jrh
 ************************************************/

var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var StrLib = cpr.core.Module.require("lib/StrLib");
var USCDR_userID;
var deviceWebSocket;
var submission_count=-1;
var rABS = true; // T : 바이너리, F : 어레이 버퍼
var dateLib = cpr.core.Module.require("lib/DateLib");
var usint_version;
var srcColumn = [
	"CardNum",
	"CardType"
]; 

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	comLib = createComUtil(app);	
	dataManager = getDataManager();
		
	var tabDevice = app.lookup("USCDR_tabDeviceType");
	var tabItems = tabDevice.getTabItems();
	tabDevice.setSelectedTabItem(tabItems[1]);
	
	var usint_version;
	var link = app.lookup("USCDR_sniDownloadLink");
	link.value=	"<a href=\"/setup/AlpetaDevice.exe\" target=\"_blank\">"+dataManager.getString("Str_DeviceServerDownloadPath")+"</a>";
	var link2 = app.lookup("USCDR_sniDownloadLink_Drive");
	link2.value=	"<a href=\"/setup/EasyInstallationV3.12.zip\" target=\"_blank\">"+"EasyInstallationV3.12"+"</a>";
	var link3 = app.lookup("USCDR_sniDownloadLink_Device32bit");
	link3.value=	"<a href=\"/setup/AlpetaDevice32bit.exe\" target=\"_blank\">"+"AlpetaDevice32bit"+"</a>";
		
	app.lookup("USCDR_opbMessage").value = dataManager.getString("Str_HamsterConnectTry");
	connectDeviceServer("127.0.0.1:9600");
	
	var udcTerminalList = app.lookup("USCDR_udcTerminalList");	
	udcTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);

	var initValue = app.getHost().initValue;	
	USCDR_userID  = initValue["UserID"];
	
	sendConnectedTerminalListRequest();
}


function sendConnectedTerminalListRequest() {
	var terminalList = app.lookup("USCDR_udcTerminalList");	
	var curIndex = terminalList.getCurrentPageIndex();
	
	var pageRowCount = terminalList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;
	
	var searchCtrl = app.lookup("USCDR_udcSearchTerminal")
	var smsGetConnectedTerminalList = app.lookup("sms_getConnectedTerminalList");
	smsGetConnectedTerminalList.action = '/v1/terminals'
	
	smsGetConnectedTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsGetConnectedTerminalList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	if( searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0 ){
		smsGetConnectedTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	}else{
		smsGetConnectedTerminalList.setParameters("searchCategory", "");
	}
	
	smsGetConnectedTerminalList.setParameters("offset", offset);
	smsGetConnectedTerminalList.setParameters("limit", pageRowCount);
	smsGetConnectedTerminalList.setParameters("AuthType", 'finger');
	
	var fields = ["terminal_id","name"];
	smsGetConnectedTerminalList.setParameters("fields", fields);
	
	comLib.showLoadMask("","단말기 로딩","",pageRowCount);
	smsGetConnectedTerminalList.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getConnectedTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var bResultCode = app.lookup("Result").getValue("ResultCode");
	if(bResultCode == COMERROR_NONE) {
		var dsTerminalList = app.lookup("TerminalList");
			
		var terminalList = app.lookup("USCDR_udcTerminalList");
		terminalList.setTerminalList(dsTerminalList);
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));		
		terminalList.setTotalCount(totalCount);		
	} else {		
	}
	var tabDevice = app.lookup("USCDR_tabDeviceType");
	var tabItems = tabDevice.getTabItems();
	tabDevice.setSelectedTabItem(tabItems[1]); 
}

// 단말 리스트 가져오기 에러
function onSms_getConnectedTerminalListSubmitError(/* cpr.events.CSubmissionEvent */ e){
var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}


// 단말 리스트 가져오기 타임아웃
function onSms_getConnectedTerminalListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

function connectDeviceServer(address){    
    
    deviceWebSocket = new WebSocket("ws://"+address+"/v1/webEntry");
        
    deviceWebSocket.onopen = function(message){      
    	app.lookup("USCDR_opbMessage").value = dataManager.getString("Str_HamsterConnected");          
        console.log("device server ws connected.");
    };

    deviceWebSocket.onclose = function(message){
    	deviceWebSocket = null;
        console.log("\Server disconnect..."); 
    };

    deviceWebSocket.onerror = function(message){
        console.log("error... " + message);
        app.lookup("USCDR_opbMessage").value = dataManager.getString("Str_DeviceServerInstallRequired");
        var link = app.lookup("USCDR_sniDownloadLink");
        link.visible=true;
        var link2 = app.lookup("USCDR_sniDownloadLink_Drive");
        link2.visible=true;
        var link3 = app.lookup("USCDR_sniDownloadLink_Device32bit");
        link3.visible=true;
    };

    deviceWebSocket.onmessage = function(message){
        
        var msg = JSON.parse(message.data);
        
        switch( msg.msgId){                       
            case WSCmdCardCaptureRes:{ // 캡쳐 완료. 결과 수신.
            	comLib.hideLoadMask();	
                var result = JSON.parse(msg.body);
                
                if( result.Result == "success" ){
                	
		            var dsCardInfoList = app.lookup("CardInfoList");
		            var strCardNum = result.CardNum; // 카드번호 옮겨 담기
		            if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // 버디 타입은 8자리 채워준다.
		            	strCardNum = StrLib.formattedString("00000000",String(result.CardNum), "left");	
		            } 
		            var existRow = dsCardInfoList.findFirstRow("CardNum == '"+strCardNum+"'");
		            if(existRow){
		            	dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_DuplicateAlert"));
		            }else {
		            	//console.log(dsUserCardInfo.getRowDataRanged());
		            	var cmbPassType = app.lookup("cmbPassType");
		            	dsCardInfoList.addRowData({"CardNum":strCardNum, "CardType":cmbPassType.value, "IssueStatus":0});		
		            }
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
	var maxCard = 50;
	if( dataManager.getSystemBrandType() == BRAND_NITGEN) {
		maxCard = 1;
	}
	
	var dsCardInfoList = app.lookup("CardInfoList");
	var count = dsCardInfoList.getRowCount();
	if( count >= maxCard ){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_CardCountMaxExceeded"));
		return
	}  
	
	var udcTerminalList = app.lookup("USCDR_udcTerminalList");
		
	var tabDevice = app.lookup("USCDR_tabDeviceType");
	var tabItem = tabDevice.getSelectedTabItem();
	if( tabItem.id == 1){ // 단말기 
		onCardCaptureReqToTerminal(USCDR_userID);				
	} else{		
		onCardCaptureReq(USCDR_userID);
	}
	
}

function onCardCaptureReqToTerminal(uid) {
	var udcTerminalListInfo = app.lookup("USCDR_udcTerminalList");
	
	var checkedRowIndices = udcTerminalListInfo.getCheckedRowIndices();
	
	if (checkedRowIndices.length <= 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	var reqIndex = checkedRowIndices.pop();
	if (reqIndex == undefined ) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	} 
	var terminalID = udcTerminalListInfo.getTerminalID(reqIndex);
	var dmCardData = app.lookup("CardData");
	dmCardData.clear();
	
	var sms_getCardInfoToTerminal = app.lookup("sms_getCardInfoToTerminal");
	sms_getCardInfoToTerminal.action = "/v1/terminals/" + terminalID + "/scan/card";	
	comLib.showLoadMask("", "카드 캡쳐 요청", "", 60);	
	sms_getCardInfoToTerminal.send();
} 

// 사용자 카드 캡쳐 완료
function onSms_getCardInfoToTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	comLib.hideLoadMask();
	var bResultCode = app.lookup("Result").getValue("ResultCode");
	if(bResultCode == COMERROR_NONE) {
		
		var dmCardData = app.lookup("CardData");
		var dsCardInfo = app.lookup("CardInfoList");
		var cmbPassType = app.lookup("cmbPassType");
		
		var cardNum = dmCardData.getValue("CardNum");
		if( cardNum.length > 1){
			
			var DuplicateCheck = dsCardInfo.findFirstRow("CardNum == '" + cardNum + "'");
			if (DuplicateCheck) {
				dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorRfCardDupilcate"));
				return;
			}
			var today = dateLib.makeDateFormat(dateLib.getToday(),"-");
			dsCardInfo.addRowData({"CardNum":dmCardData.getValue("CardNum"), "CardType":cmbPassType.value, "IssueStatus":0, "EventTime":today});
		}	
	} else if (bResultCode == ERROR_RFCARD_DUPLICATE ) {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorRfCardDupilcate"));
	} else {		
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardCapture"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(bResultCode)));
	}
}

// 사용자 카드 캡쳐 에러
function onSms_getCardInfoToTerminalSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}


// 사용자 카드 캡쳐 타임아웃
function onSms_getCardInfoToTerminalSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
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
		
		var uid = 1;
		var strSendinfo = '';
		strSendinfo = '{"msgId":"'+ WSCmdCardCaptureReq+'","body":{"UserId":"'+uid+'","BrandType":"'+brandType+'","CardType":"' + cardType + 
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


 
// 등록된 카드 삭제.
function onUSCDR_btnCardDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdCardList = app.lookup("USCDR_grdCardList");
	var checkIndices = grdCardList.getCheckRowIndices();
	if (checkIndices.length <= 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedItem"));
		return;
	}
	checkIndices.forEach(function(rowIndex){
		grdCardList.deleteRow(rowIndex);		
	});
	grdCardList.commitData();
}






function onSms_getCardInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}



function onSms_getCardInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onMy_file_inputValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.FileInput
	 */
	var fi1 = e.control;
	
	var files = fi1.files;
	
    var i,f;
    for (i = 0; i != files.length; ++i) {
        f = files[i];
        //console.log(f.name);
        //console.log(f);
        var reader = new FileReader();
        var name = f.name;
 
        reader.onload = function(e) {
            var data = e.target.result;
 
            var workbook;
 
            if(rABS) {
                /* if binary string, read with type 'binary' */
                workbook = XLSX.read(data, {type: 'binary'});
            } else {
                /* if array buffer, convert to base64 */
                var arr = fixdata(data);
                workbook = XLSX.read(btoa(arr), {type: 'base64'});
            }//end. if
            
            var first_sheet_name = workbook.SheetNames[0]; // 처음 시트의 명칭 얻기
 			//var worksheet1 = workbook.Sheets.Sheet1; 	
 			var worksheet1 = workbook.Sheets[first_sheet_name];
 			//console.log(XLSX.utils.sheet_to_json(worksheet1, {header:1}))		
 			var rangeLabel = worksheet1['!ref'].split(':');
 			//console.log(rangeLabel);
 			
 			
			var result = [];
			var row;
			var rowNum;
			var colNum;
			var range = XLSX.utils.decode_range(worksheet1['!ref']);
				
			for(rowNum = range.s.r; rowNum <= range.e.r; rowNum++){
				//console.log("Row : "+rowNum);
				row = [];
				for(colNum=range.s.c; colNum<=range.e.c; colNum++){
					//console.log("Col : "+colNum);
					var nextCell = worksheet1[
						XLSX.utils.encode_cell({r: rowNum, c: colNum})
					];
									
          			if( typeof nextCell === 'undefined' ){
          				//console.log("undefined");
             			row.push(void 0);
          			} else {
       					if(nextCell.w.indexOf("(") != -1){
       						nextCell.w = nextCell.w.substring(0,nextCell.w.indexOf("(", 0));
       					}
          				row.push(nextCell.w);	          				
          			}
       			}
       			result.push(row);
   			}
	   			
	   			//console.log(result);
	   			// 언어 적용을 위한 변환 배열.. 원본 컬럼 명은 srcColumn에 선언되어 있음
   			var srcTitle = [
				dataManager.getString("Str_PassNum"),
				dataManager.getString("Str_CardType"),
				dataManager.getString("Str_CardName")
			];
			
   			var uSINT_btnAuthTypeModify = e.control;
   			var appld = "app/popup/ContentSelector" + "?" + usint_version;
			app.getRootAppInstance().openDialog(appld, {width : 480, height : 500}, function(dialog){
				dialog.initValue = {"SrcTitle":srcTitle,"Title":result[0]};				
				dialog.bind("headerTitle").toLanguage("Str_ImportContentSetting");
				dialog.modal = true;		
			}).then(function(returnValue){
								
				var contentMap = new Map();
				for( var idx = 0; idx < returnValue.length; idx++){
					contentMap.set( returnValue[idx]["SourceName"], returnValue[idx]["ColumnName"] );
				}				
				var cardList = new Array();
				var dsCardInfoList = app.lookup("CardInfoList");						
				workbook.SheetNames.forEach(function(item, index, array) {
					var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
										
					for( var idx = 0; idx < json.length; idx++){
						var cardInfo = [];
						
						srcTitle.forEach(function(item, index){
							var columnName = contentMap.get(item);
							if( columnName != "" && columnName != undefined ){
								var value = { item : json[idx][columnName]};
								switch(json[idx][columnName]){
									case "임시" : json[idx][columnName] = 1; break;
									case "교육" : json[idx][columnName] = 2; break;
									case "공무" : json[idx][columnName] = 3; break;
									//case "상주" : json[idx][columnName] = 4; break;
									case "상시" : json[idx][columnName] = 5; break;
									//case "병사" : json[idx][columnName] = 6; break;
									case "방문" : json[idx][columnName] = 7; break;
									//case "가족" : json[idx][columnName] = 8; break;
									//case "현역" : json[idx][columnName] = 0; break;
								}
								//console.log(json[idx][columnName]);
								cardInfo[srcColumn[index]]=json[idx][columnName]; // srcColumn-항목별로 언어를 적용한 상태이므로 원본 칼럼을 찾아와 적용
							}
						});													
						
						cardList.push(cardInfo);						
					}
				});
				dsCardInfoList.build(cardList);
				
			});
	   		
   			
    			
            /* 워크북 처리 */
            
            workbook.SheetNames.forEach(function(item, index, array) {
            	
            	var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[item]); // default : ","
				var csvToFS = XLSX.utils.sheet_to_csv(workbook.Sheets[item], {FS:"\t"} ); // "Field Separator" delimiter between fields
				var csvToFSRS = XLSX.utils.sheet_to_csv(workbook.Sheets[item], {FS:":",RS:"|"} ); // "\n" "Record Separator" delimiter between rows
 
				// html
				var html = XLSX.utils.sheet_to_html(workbook.Sheets[item]);
				var htmlHF = XLSX.utils.sheet_to_html(workbook.Sheets[item], {header:"<html><title='custom'><body><table>", footer:"</table><body></html>"});
				var htmlTable = XLSX.utils.sheet_to_html(workbook.Sheets[item], {header:"<table border='1'>", footer:"</table>"});
 
				// json
				var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
 
				//formulae
				var formulae = XLSX.utils.sheet_to_formulae(workbook.Sheets[item]);
				formulae.filter(function(v,i){return i%13 === 0;});
 
 /*
				console.group("CSV");
    			//console.log(csv);
    			//console.log(csvToFS);
    			//console.log(csvToFSRS);
				console.groupEnd();
 
				console.group("html");
    			//console.log(html);
    			//console.log(htmlHF);
    			//console.log(htmlTable);
				console.groupEnd();
 
				console.group("json");
    			//console.log(json);
				console.groupEnd();
 
				console.group("formulae");
    			//console.log(formulae);
				console.groupEnd();
				* */
				

  				/*
                var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[item]);
                var html = XLSX.utils.sheet_to_html(workbook.Sheets[item]);
                var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
                var formulae = XLSX.utils.sheet_to_formulae(workbook.Sheets[item]);
               	console.log(csv);
                console.log(html);
                console.log(json);
                console.log(formulae);
                * */ 
                
            });//end. forEach
        }; //end onload
 
        if(rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
 
    }//end. for	
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

/*
 * 버튼(USCDR_btnEnroll)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSCDR_btnEnrollClick(/* cpr.events.CMouseEvent */ e){
	var grdCardList = app.lookup("USCDR_grdCardList");
	var checkedRowIndices = grdCardList.getCheckRowIndices();
	var chkCount = checkedRowIndices.length;
	if (chkCount == 0) {
		dialogAlert(app, dataManager.getString("Str_Info"), "선택된 카드 번호가 없습니다.");
		return
	}
	
	var dsRegistCardList = app.lookup("RegistCardList");
	dsRegistCardList.clear(); //초기화

	for( var i = 0; i < chkCount; i++){
		var rowIndex = checkedRowIndices[i];
		var cardName = grdCardList.getRow(rowIndex).getValue("CardName");
		var cardType = grdCardList.getRow(rowIndex).getValue("CardType");
		if (cardName == "" || cardName == null) {
			grdCardList.setCheckRowIndex(rowIndex, false);
			continue;
		}
		
		if(cardType == 4 || cardType == 6 || cardType == 6 || cardType == 0 ){ //방문, 공무, 상시, 교육, 임시
			grdCardList.setCheckRowIndex(rowIndex, false);
			continue;
		}
		var regUser = {"rowIndex":rowIndex,"cardNum":grdCardList.getRow(rowIndex).getValue("CardNum")};
		dsRegistCardList.addRowData(regUser);
	}
	comLib.showLoadMask("pro",dataManager.getString("Str_PassRegistRequest"),"",dsRegistCardList.getRowCount());
	submitPassInfo();
}

function submitPassInfo() {
	var dsRegistCardList = app.lookup("RegistCardList");
	if( dsRegistCardList.getRowCount() == 0 ){
		comLib.hideLoadMask();
		dataManager = getDataManager();
		app.lookup("USCDR_maingrp").redraw();
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserNotSelected"));
		return;
	}

	var grdCardList = app.lookup("USCDR_grdCardList");
	var Result = app.lookup("Result");
	var CardRegistResultList = app.lookup("CardRegistResultList");
	var dsCardList = dsRegistCardList.getRow(0);
	var cardNum = dsCardList.getValue("cardNum");
	var rowIndex = dsCardList.getValue("rowIndex");
	
	var CardInfoListSubmit = app.lookup("CardInfoListSubmit");
	CardInfoListSubmit.clear();
	CardInfoListSubmit.addRowData(grdCardList.getRow(rowIndex).getRowData());
	
	var msg = " "+cardNum;
	comLib.updateLoadMask(msg);
	
	var submission = new cpr.protocols.Submission("savePassInfo");
	submission.action = "/v1/cardInfo";
	submission.method = "post";
	submission.addRequestData(CardInfoListSubmit,"CardInfoListSubmit");
	submission.addResponseData(Result, "Result");
	submission.addResponseData(CardRegistResultList, "CardRegistResultList");		
		
	submission.addEventListenerOnce("submit-done", onSms_PostCardInfoSubmitDone);
	submission.addEventListenerOnce("submit-error", onSms_PostCardInfoSubmitError);
	submission.addEventListenerOnce("submit-timeout", onSms_PostCardInfoSubmitTimeout);
	submission.send();
}


function onSms_PostCardInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dsRegistCardList = app.lookup("RegistCardList");
	var dsCardList = dsRegistCardList.getRow(0);
	var rowIndex =  dsCardList.getValue("rowIndex");
	

	var grdCardList = app.lookup("USCDR_grdCardList");
	var CardInfoList = app.lookup("CardInfoList");
	//var resultCode = app.lookup("Result").getValue("ResultCode");
	var ResultCode = app.lookup("CardRegistResultList").getValue(0, "Result");
	console.log("resultCode :"+ ResultCode + "rowIndex : " + rowIndex );
	if( ResultCode == 1  ){
		CardInfoList.setValue(rowIndex, "SubmitResult", 0);
	} else if (ResultCode == 2) {
		CardInfoList.setValue(rowIndex, "SubmitResult", 1);
	} 
	dsRegistCardList.realDeleteRow(0); 
	submitPassInfo();
}

function onSms_PostCardInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_PostCardInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
}
