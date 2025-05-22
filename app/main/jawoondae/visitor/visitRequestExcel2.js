/************************************************
 * visitRegistrationExcel.js
 * Created at 2019. 9. 18. 오전 10:26:42.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var jwded_version;
var rABS = true; // T : 바이너리, F : 어레이 버퍼

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	jwded_version = dataManager.getSystemVersion();
	
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
	"방문타입(방문)",
	"인솔자",
	"소속",
	"생년월일",
	"성명",
	"전화",
	"휴대전화",
	"차량번호",
	"차량색상",
	"차량종류"
];


function onJWDVX_fiUserFileValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.FileInput
	 */
	var fi1 = e.control;
	var columnName = [	"visitStartAt",	"visitEndAt",	"targetGroupID",	"visitorType",	"leader",
	"VisitorGroupName",	"visitorID",	"visitorName",	"visitorPhone",	"visitorMobile", "carNumber",
	"carColor", "carType" ];
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
   			var dsVisitList = app.lookup("dsVisitRegistInfo");
			workbook.SheetNames.forEach(function(item, index, array) {
				var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
									
				for( var idx = 0; idx < json.length; idx++){
					//console.log(json[idx]);
					var visitInfo = [];
					xlsColumName.forEach(function(item, index){
						var value = { item : json[idx][item]};
						visitInfo[columnName[index]] =json[idx][item];
					});
					console.log(visitInfo)
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

function onJWDVX_btnRegistrationClick(/* cpr.events.CMouseEvent */ e){
	var grdVisitRequestList = app.lookup("JWDVX_grdVisitRegist");
	var total = grdVisitRequestList.getRowCount();
	
	if( total < 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), "등록한 방문신청 정보가 없습니다.");
		return;
	}
	comLib.showLoadMask("pro","방문신청 등록","",total);
	var registVisitList = app.lookup("registVisitList");
	registVisitList.clear();
	
	for( var i = 0; i < total; i++){
		var registVisit = {"VisitorID":grdVisitRequestList.getRow(i).getValue("VisitorID"),"rowIndex": i};
		registVisitList.addRowData(registVisit);
	}
	
	sendVisitRequestRegist();
}

function sendVisitRequestRegist() {
	var registVisitList = app.lookup("registVisitList");
	if (registVisitList.getRowCount() == 0 ) {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		return;
	}
	
	var regVisitInfo = registVisitList.getRow(0);
	var visitorID = regVisitInfo.getValue("VisitorID");
	var row = regVisitInfo.getValue("rowIndex");
	
	var dmVisitInfo = app.lookup("dmVisitTargetInfo");
	dmVisitInfo.clear();
	var rowdata = app.lookup("dsVisitRegistInfo").getRow(parseInt(row, 10));
	dmVisitInfo.setValue("TargetGroupID", rowdata.getValue("targetGroupID"));
	dmVisitInfo.setValue("VisitStartAt", rowdata.getValue("visitStartAt"));
	dmVisitInfo.setValue("VisitEndAt", rowdata.getValue("visitEndAt"));
	dmVisitInfo.setValue("LeaderID", rowdata.getValue("leader"));
	dmVisitInfo.setValue("VisitorID", rowdata.getValue("visitorID"));
	dmVisitInfo.setValue("VisitorGroupName", rowdata.getValue("VisitorGroupName"));
	dmVisitInfo.setValue("VisitorName", rowdata.getValue("visitorName"));
	dmVisitInfo.setValue("VisitorPhone", rowdata.getValue("visitorPhone"));
	dmVisitInfo.setValue("VisitorMobile", rowdata.getValue("visitorMobile"));
	dmVisitInfo.setValue("carNumber", rowdata.getValue("carNumber"));
	dmVisitInfo.setValue("carColor", rowdata.getValue("carColor"));
	dmVisitInfo.setValue("carType", rowdata.getValue("carType"));
	var strType = rowdata.getValue("visitorType");

	dmVisitInfo.setValue("VisitType", 7);
	
	var msg = "VisitorID"+ " : "+visitorID;
	comLib.updateLoadMask(msg);
	
	var smsPostVisitInfo = app.lookup("sms_RegistVisitRequestList");
	smsPostVisitInfo.action = "/v1/visitRequest/excel";
	smsPostVisitInfo.userAttr("VisitorID", visitorID);
	smsPostVisitInfo.userAttr("rowIndex", regVisitInfo.getValue("rowIndex").toString());
	smsPostVisitInfo.send();
}
function onSms_RegistVisitRequestListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_RegistVisitRequestListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_RegistVisitRequestListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_RegistVisitRequestList = e.control;
	var postVisitList = app.lookup("registVisitList");
	postVisitList.realDeleteRow(0);
	
	var dsVisitRegistInfo = app.lookup("dsVisitRegistInfo");
	var visitID = sms_RegistVisitRequestList.userAttr("VisitorID");
	var rowIndex = sms_RegistVisitRequestList.userAttr("rowIndex");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		
		dsVisitRegistInfo.updateRow(parseInt(rowIndex,10), {"result": "성공"});
		sendVisitRequestRegist();
	} else {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dsVisitRegistInfo.updateRow(parseInt(rowIndex,10), {"result": "실패"});
		//dialogAlert(app, dataManager.getString("Str_Failed"), 
		//	visitID+ " "+"방문신청 등록 실패"+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			visitID+ " "+"방문신청 등록 실패"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onJWDVX_btnFileSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var jWDVX_btnFileSearch = e.control;
	
}
