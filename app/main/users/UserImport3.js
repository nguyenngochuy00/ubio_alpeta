/************************************************
 * userImport.js
 * Created at 2018. 10. 16. 오후 1:40:12.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var usint_version;
var rABS = true; // T : 바이너리, F : 어레이 버퍼
 
var curImportIndex = 0; // 현재 보낸 유저 인덱스 
 

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
}

// 어레이 버퍼를 처리한다 ( 오직 readAsArrayBuffer 데이터만 가능하다 )
function fixdata(data) {
    var o = "", l = 0, w = 10240;
    for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
    o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
    return o;
}
 
// 데이터를 바이너리 스트링으로 얻는다.
function getConvertDataToBin($data){
    var arraybuffer = $data;
    var data = new Uint8Array(arraybuffer);
    var arr = new Array();
    for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
    var bstr = arr.join("");
 
    return bstr;
}

var srcColumn = [
	"UserID",
	"UniqueID",
	"Name",
	"AuthType",
	"Card",
	"Password",
	"Group",
	"Position",
	"AccessGroup",
	"Department"
];
/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onFi1ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.FileInput
	 */
	var fi1 = e.control;
	
	var files = fi1.files;
	
    var i,f;
    for (i = 0; i != files.length; ++i) {
        f = files[i];
        console.log(f.name);
        console.log(f);
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
          				row.push(nextCell.w);	          				
          			}
       			}
       			result.push(row);
   			}
	   			
	   			//console.log(result);
	   			// 언어 적용을 위한 변환 배열.. 원본 컬럼 명은 srcColumn에 선언되어 있음
   			var srcTitle = [
				dataManager.getString("Str_UserID"),
				dataManager.getString("Str_UniqueID"),
				dataManager.getString("Str_Name"),
				dataManager.getString("Str_AuthType"),
				dataManager.getString("Str_Card"),
				dataManager.getString("Str_Password"),
				dataManager.getString("Str_Group"),
				dataManager.getString("Str_Position"),
				dataManager.getString("Str_AccessGroup"),
				dataManager.getString("Str_Department")
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
				var userList = new Array();
				var dsUserList = app.lookup("dsUserImportDataTemp");						
				workbook.SheetNames.forEach(function(item, index, array) {
					var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
										
					for( var idx = 0; idx < json.length; idx++){
						var userInfo = [];
						
						srcTitle.forEach(function(item, index){
							var columnName = contentMap.get(item);
							if( columnName != "" && columnName != undefined ){
								var value = { item : json[idx][columnName]};
								userInfo[srcColumn[index]]=json[idx][columnName]; // srcColumn-항목별로 언어를 적용한 상태이므로 원본 칼럼을 찾아와 적용
							}
						});													
						
						userList.push(userInfo);						
					}
				});
				dsUserList.build(userList);
				
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
 * 
  wb.Sheets.Sheet1['!ref']
'A1:C3'
   var sheet2arr = function(sheet){
   var result = [];
   var row;
   var rowNum;
   var colNum;
   var range = XLSX.utils.decode_range(sheet['!ref']);
   for(rowNum = range.s.r; rowNum <= range.e.r; rowNum++){
      row = [];
       for(colNum=range.s.c; colNum<=range.e.c; colNum++){
          var nextCell = sheet[
             XLSX.utils.encode_cell({r: rowNum, c: colNum})
          ];
          if( typeof nextCell === 'undefined' ){
             row.push(void 0);
          } else row.push(nextCell.w);
       }
       result.push(row);
   }
   return result;
};
 */


/*
 * "일괄등록" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSIMP_btnBatchRegistClick(/* cpr.events.CMouseEvent */ e){
	var dsUserImportDataTemp = app.lookup("dsUserImportDataTemp");
	var count = dsUserImportDataTemp.getRowCount();
	if (count <= 0) {
		return;
	}
	
	curImportIndex = 0; // 초기화를 해 놓읍시다
	
	//console.log(dsUserImportData);
	/*
	console.log("NSH Debug.......................");
	console.log(dsUserImportDataTemp.getValue(curImportIndex, "UserID"));
	console.log(dsUserImportDataTemp.getValue(curImportIndex, "Name"));
	console.log(dsUserImportDataTemp.getValue(curImportIndex, "AuthType"));
	console.log(dsUserImportDataTemp.getValue(curImportIndex, "Card"));
	console.log(dsUserImportDataTemp.getValue(curImportIndex, "Password"));
	console.log(dsUserImportDataTemp.getValue(curImportIndex, "Group"));
	console.log(dsUserImportDataTemp.getValue(curImportIndex, "Staff"));
	console.log(dsUserImportDataTemp.getValue(curImportIndex, "EmployeeNum"));
	console.log(dsUserImportDataTemp.getValue(curImportIndex, "AccessGroup"));
	console.log(dsUserImportDataTemp.getValue(curImportIndex, "Department"));
	*/
	
	
	var smsRequestData = app.lookup("sms_postUserDataImport");
	
	// 1개씩 보냅시다 
	var dsUserImportData = app.lookup("dsUserImportData");
	
	dsUserImportData.clear();
	
	dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "UserID"));
	dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "Name"));
	dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "AuthType"));
	dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "Card"));
	dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "Password"));
	dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "Group"));
	dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "Staff"));
	dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "EmployeeNum"));
	dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "AccessGroup"));
	dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "Department"));
			
	dsUserImportData.addRowData(dsUserImportDataTemp.getRowData(curImportIndex));
	dsUserImportData.commit();
		
	console.log(dsUserImportDataTemp.getRowData(curImportIndex));
	console.log(dsUserImportData.getRowData(0));
			
	
	smsRequestData.send();
	comLib.showLoadMask("",dataManager.getString("Str_UserImport"),"",0);	
}

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSIMP_btnHelpPageClick(/* cpr.events.CMouseEvent */ e){

	var uSIMP_btnHelpPage = e.control;
	var menu_id = app.getHostProperty("initValue")["programID"]; // mainManager.module.js ExecuteMenu <- 셋팅
	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target":DLG_HELP,	
			"ID": menu_id
		}
	});

	app.getHostAppInstance().dispatchEvent(selectionEvent);
}




/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postUserDataImportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if(resultCode == COMERROR_NONE) {
		var total = app.lookup("UserImportResult").getValue("Total");
		var fail = app.lookup("UserImportResult").getValue("Fail");
		var success = app.lookup("UserImportResult").getValue("Success");
			
			
		var dsUserImportDataTemp = app.lookup("dsUserImportDataTemp");
		var count = dsUserImportDataTemp.getRowCount();
		
		curImportIndex ++; // 다은 인덱스를 보냅시다.
		
		if (count == curImportIndex) {
			comLib.hideLoadMask(); // 이미 다 보낸 것이라면 그만 합시다 
			
			dialogAlert(app, dataManager.getString("Str_Success"), "Total : "+ total + ", Success:"+ success +", Fail: "+ fail);
			return;
		}
		
		/*
		console.log("NSH Debug.......................");
		console.log(dsUserImportDataTemp.getValue(curImportIndex, "UserID"));
		console.log(dsUserImportDataTemp.getValue(curImportIndex, "Name"));
		console.log(dsUserImportDataTemp.getValue(curImportIndex, "AuthType"));
		console.log(dsUserImportDataTemp.getValue(curImportIndex, "Card"));
		console.log(dsUserImportDataTemp.getValue(curImportIndex, "Password"));
		console.log(dsUserImportDataTemp.getValue(curImportIndex, "Group"));
		console.log(dsUserImportDataTemp.getValue(curImportIndex, "Staff"));
		console.log(dsUserImportDataTemp.getValue(curImportIndex, "EmployeeNum"));
		console.log(dsUserImportDataTemp.getValue(curImportIndex, "AccessGroup"));
		console.log(dsUserImportDataTemp.getValue(curImportIndex, "Department"));
		*/
		
		
		var smsRequestData = app.lookup("sms_postUserDataImport");
		
		
		
		// 1개씩 보냅시다 
		var dsUserImportData = app.lookup("dsUserImportData");
		dsUserImportData.clear();
		
		dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "UserID"));
		dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "Name"));
		dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "AuthType"));
		dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "Card"));
		dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "Password"));
		dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "Group"));
		dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "Staff"));
		dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "EmployeeNum"));
		dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "AccessGroup"));
		dsUserImportData.setValue(0, dsUserImportDataTemp.getValue(curImportIndex, "Department"));
		
		dsUserImportData.addRowData(dsUserImportDataTemp.getRowData(curImportIndex));
		
			
		dsUserImportData.commit();
		
		console.log(dsUserImportDataTemp.getRowData(curImportIndex));
		console.log(dsUserImportData.getRowData(0));
		
		
		smsRequestData.send();
	
	} else {
		
		comLib.hideLoadMask();
		
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
}
