/************************************************
 * AccessBatchRegist.js
 * Created at 2021. 2. 24. 오전 11:21:22.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var usint_version;
var rABS = true; // T : 바이너리, F : 어레이 버퍼
var srcTitle;
var utilLib = cpr.core.Module.require("lib/util");

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	
	srcTitle = new Array();
	var grdAccessorList = app.lookup("DAABR_grdAccessorList");
	for(var i=1;i<grdAccessorList.getColumnWidths().length;i++){
		srcTitle[i] = grdAccessorList.header.getColumn(i).text;
	}
	
	var link = app.lookup("DAABR_sniDownloadLink");
	link.value=	"<a href=\"/setup/custom_armyhq/출입자일괄업로드양식.xlsx\" target=\"_blank\">출입자 일괄업로드 양식</a>";	
}

function onDAABR_fiExcelValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.FileInput	 */
	var fiExcel = e.control;
	var files = fiExcel.files;
	var dsAccessorList = app.lookup("AccessorList");
	dsAccessorList.clear();
	
    var i,f;
    for (i = 0; i != files.length; ++i) {
        f = files[i];        
        
        var reader = new FileReader();
        var name = f.name;
        var ext = utilLib.getExtensionOfFilename(name);
        if (ext.toUpperCase()!="XLS" && ext.toUpperCase()!="XLSX" ) {
        	dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "확장자가  XLS, XLSX 이외의 파일은 업로드 할 수 없습니다.");
        	continue;
        }
 
        reader.onload = function(e) {
            var data = e.target.result;
 
            var workbook;
 
            if(rABS){ /* if binary string, read with type 'binary' */                
                workbook = XLSX.read(data, {type: 'binary'});
            } else {  /* if array buffer, convert to base64 */
                var arr = fixdata(data);
                workbook = XLSX.read(btoa(arr), {type: 'base64'});
            }
            
            var first_sheet_name = workbook.SheetNames[0]; // 처음 시트의 명칭 얻기 			 	
 			var worksheet1 = workbook.Sheets[first_sheet_name]; 					
 			var rangeLabel = worksheet1['!ref'].split(':');
 			
			var result = [];
			var row;
			var rowNum;
			var colNum;
			var range = XLSX.utils.decode_range(worksheet1['!ref']);
				
			for(rowNum = range.s.r; rowNum <= range.e.r; rowNum++){				
				row = [];
				for(colNum=range.s.c; colNum<=range.e.c; colNum++){					
					var nextCell = worksheet1[
						XLSX.utils.encode_cell({r: rowNum, c: colNum})
					];
									
          			if( typeof nextCell === 'undefined' ){          				
             			row.push(void 0);
          			} else {
          				row.push(nextCell.w);	          				
          			}
       			}
       			result.push(row);
   			}	
			
   			var appld = "app/popup/ContentSelector" + "?" + usint_version;
   			// 가져오기 컬럼과 엑셀 파일의 컬럼 매핑을 위한 다이얼로그 팝업
			app.getRootAppInstance().openDialog(appld, {width : 480, height : 600}, function(dialog){
				dialog.initValue = {"SrcTitle":srcTitle,"Title":result[0]};				
				dialog.bind("headerTitle").toLanguage("Str_ImportContentSetting");
				dialog.style.header.css("background-color", "#528443");
				dialog.modal = true;		
			}).then(function(returnValue){								
				var contentMap = new Map();
				for( var idx = 0; idx < returnValue.length; idx++){					
					contentMap.set( returnValue[idx]["SourceName"], returnValue[idx]["ColumnName"] );
				}				
				var userList = new Array();
				var dsAccessorList = app.lookup("AccessorList");						
				workbook.SheetNames.forEach(function(item, index, array) {
					var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
										
					for( var idx = 0; idx < json.length; idx++){
						var userInfo = [];						
						srcTitle.forEach(function(item, index){
							var columnName = contentMap.get(item);
							if( columnName != "" && columnName != undefined ){
								var value = { item : json[idx][columnName]};
								userInfo[item]=json[idx][columnName]; // srcColumn-항목별로 언어를 적용한 상태이므로 원본 칼럼을 찾아와 적용
							}
						});
						userList.push(userInfo);
					}
				});		
				
				for(var i=0;i<userList.length;i++){					
					var userType = getUserTypeID(userList[i]["인원구분"]);
					if (userType != 901 && userType != 902) {
						userType = 0;
					}
					
					var row = dsAccessorList.addRow();
					row.setValue("UserType", userType);
					row.setValue("DocumentNumber", userList[i]["문서번호"]);
					row.setValue("UserGroup", userList[i]["소속/부대"]);
					row.setValue("UserPosition", userList[i]["계(직)급"]);
					row.setValue("UserName", userList[i]["성명"]);
					row.setValue("Birthday", userList[i]["생년월일"]);
					row.setValue("SecureNumber", userList[i]["비취인가/신원조사연번"]);
					row.setValue("Phone", userList[i]["휴대폰"]);
					row.setValue("CarNumber", userList[i]["차량번호"]);
					row.setValue("CarType", userList[i]["차량종류"]);
					row.setValue("AccessStart", userList[i]["출입시작일"]);
					row.setValue("AccessEnd", userList[i]["출입종료일"]);
					row.setValue("AccessPurpose", userList[i]["출입목적"]);
				}	
				dsAccessorList.commit();			
			});
	   			
          
        }; //end onload
        if(rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
    }//end. for	
	
}

function onDAABR_btnAccessorUploadClick(/* cpr.events.CMouseEvent */ e){
	var sms_postAccessorImport = app.lookup("sms_postAccessorImport");
	sms_postAccessorImport.send();
}

function onSms_postAccessorRegistSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		var resultInfoList = app.lookup("ResultInfoList");
		var count = resultInfoList.getRowCount();
		var msgResult = "";
		if( count == 0){
			msgResult = "출입자 등록 완료";
		}else{
			msgResult = "출입자 등록 실패\n 성명 :";
			for( var i = 0; i < count; i++ ){
				var resultInfo = resultInfoList.getRow(i);
				if( i != 0){msgResult += ",";}
				msgResult += resultInfo.getValue("TargetID");
			}
		}
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), msgResult);
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_postAccessorRegistSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_postAccessorRegistSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
