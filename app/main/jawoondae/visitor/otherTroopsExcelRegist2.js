/************************************************
 * otherTroopsExcelRegist.js
 * Created at 2019. 11. 17. 오후 10:22:01.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var jwdote_version;
var rABS = true; // T : 바이너리, F : 어레이 버퍼


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	jwdote_version = dataManager.getSystemVersion();
	
}

// 어레이 버퍼를 처리한다 ( 오직 readAsArrayBuffer 데이터만 가능하다 )
function fixdata(data) {
    var o = "", l = 0, w = 10240;
    for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
    o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
    return o;
}


var xlsColumName = [
	"출입기간 시작일자",
	"출입기간 종료일자",
	"출입부대",
	"방문타입(타부대원)",
	"소속",
	"군번",
	"계급",
	"성명",
	"전화",
	"휴대전화",
	"차량번호",
	"차량색상",
	"차량종류"
];

function onJWDOTE_fiUserFileValueChange(/* cpr.events.CValueChangeEvent */ e){
	var fi1 = e.control;
	var columnName = [	"visitStartAt",	"visitEndAt",	"targetGroupID",	"visitorType",	
	"visitorGroupName",	"visitorID",	"visitorPosition",	"visitorName",	"visitorPhone",	"visitorMobile", "carNumber",
	"carColor", "carType" ];
	var files = fi1.files;
	
    var i,f;
    for (i = 0; i != files.length; ++i) {
    	f = files[i];
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
            }//end. i
            
            
            var first_sheet_name = workbook.SheetNames[0]; // 처음 시트의 명칭 얻기
 			var worksheet1 = workbook.Sheets[first_sheet_name];		
 			var rangeLabel = worksheet1['!ref'].split(':');
 			
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
          				row.push(nextCell.w);	          				
          			}
       			}
       			result.push(row);
   			}
   			var visitList = new Array();
   			var dsVisitList = app.lookup("dsOtherTroopsRegistInfo");
   			workbook.SheetNames.forEach(function(item, index, array) {
				var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
									
				for( var idx = 0; idx < json.length; idx++){
					//console.log(json[idx]);
					var visitInfo = [];
					xlsColumName.forEach(function(item, index){
						var value = { item : json[idx][item]};
						visitInfo[columnName[index]] =json[idx][item];
					});
					visitList.push(visitInfo);
					//console.log(json[idx][columnName[0]]);	
					
								
				}
			//	console.log(visitList);
				dsVisitList.build(visitList);
				
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

            });//end. forEach
        }
        
		if(rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
   	}
}

function onJWDOTE_btnIssueClick(/* cpr.events.CMouseEvent */ e){
	
	var grdOtherTroopsRequestList = app.lookup("JWDOTE_grdOtherTroopsRegist");
	var total = grdOtherTroopsRequestList.getRowCount();
	
	if( total < 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), "발급가능한 신청 정보가 없습니다.");
		return;
	}
	comLib.showLoadMask("pro","타부대원 발급 신청","",total);
	var registOtherTroopsList = app.lookup("registOtherTroopsList");
	registOtherTroopsList.clear();
	
	for( var i = 0; i < total; i++){
		var registOtherTroops = {"VisitorID":grdOtherTroopsRequestList.getRow(i).getValue("VisitorID"),"rowIndex": i};
		registOtherTroopsList.addRowData(registOtherTroops);
	}
	
	sendOtherTroopsIssue();
}

function sendOtherTroopsIssue() {
	var registOtherTroopsList = app.lookup("registOtherTroopsList");
	if (registOtherTroopsList.getRowCount() == 0 ) {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		return;
	}
	
	var registOtherTroopsInfo = registOtherTroopsList.getRow(0);
	var visitorID = registOtherTroopsInfo.getValue("VisitorID");
	var row = registOtherTroopsInfo.getValue("rowIndex");
	
	var dmOtherTroopsInfo = app.lookup("dmOtherTroopsTargetInfo");
	dmOtherTroopsInfo.clear();
	var rowdata = app.lookup("dsOtherTroopsRegistInfo").getRow(parseInt(row, 10));
	dmOtherTroopsInfo.setValue("TargetGroupID", rowdata.getValue("targetGroupID"));
	dmOtherTroopsInfo.setValue("VisitStartAt", rowdata.getValue("visitStartAt"));
	dmOtherTroopsInfo.setValue("VisitEndAt", rowdata.getValue("visitEndAt"));
	dmOtherTroopsInfo.setValue("LeaderID", "");
	dmOtherTroopsInfo.setValue("VisitorID", rowdata.getValue("visitorID"));
	dmOtherTroopsInfo.setValue("visitorGroupName", rowdata.getValue("visitorGroupName"));
	dmOtherTroopsInfo.setValue("VisitorPosition", rowdata.getValue("visitorPosition"));
	dmOtherTroopsInfo.setValue("VisitorName", rowdata.getValue("visitorName"));
	dmOtherTroopsInfo.setValue("VisitorPhone", rowdata.getValue("visitorPhone"));
	dmOtherTroopsInfo.setValue("VisitorMobile", rowdata.getValue("visitorMobile"));
	dmOtherTroopsInfo.setValue("carNumber", rowdata.getValue("carNumber"));
	dmOtherTroopsInfo.setValue("carColor", rowdata.getValue("carColor"));
	dmOtherTroopsInfo.setValue("carType", rowdata.getValue("carType"));
	//var strType = rowdata.getValue("visitorType");
	
	dmOtherTroopsInfo.setValue("VisitType", Jwd_Other_Unit);
	
	var msg = "VisitorID"+ " : "+visitorID;
	comLib.updateLoadMask(msg);
	
	var smsPostVisitInfo = app.lookup("sms_IssueOtherTroopsRequestList");
	smsPostVisitInfo.action = "/v1/visitRequest/othertroops/excel";
	smsPostVisitInfo.userAttr("VisitorID", visitorID);
	smsPostVisitInfo.userAttr("rowIndex", registOtherTroopsInfo.getValue("rowIndex").toString());
	smsPostVisitInfo.send();
}

function onSms_IssueOtherTroopsRequestListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var sms_IssueOtherTroopsRequestList = e.control;
	var postOtherTroopsList = app.lookup("registOtherTroopsList");
	postOtherTroopsList.realDeleteRow(0);
	
	var dsOtherTroopsRegistInfo = app.lookup("dsOtherTroopsRegistInfo");
	var visitID = sms_IssueOtherTroopsRequestList.userAttr("VisitorID");
	var rowIndex = sms_IssueOtherTroopsRequestList.userAttr("rowIndex");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		
		dsOtherTroopsRegistInfo.updateRow(parseInt(rowIndex,10), {"result": "성공"});
		sendOtherTroopsIssue();
	} else {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dsOtherTroopsRegistInfo.updateRow(parseInt(rowIndex,10), {"result": "실패"});
		//dialogAlert(app, dataManager.getString("Str_Failed"), 
		//	visitID+ " "+"타부대원 등록 실패"+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			visitID+ " "+"타부대원 등록 실패"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_IssueOtherTroopsRequestListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_IssueOtherTroopsRequestListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

