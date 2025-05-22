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
 
var srcTitle;	

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
		
	srcTitle = new Array();
	
	var grdUserImportList = app.lookup("GIDLGP_grdGroupImportList");
	
	for(var i=0;i<grdUserImportList.getColumnWidths().length;i++){
		srcTitle[i] = grdUserImportList.header.getColumn(i).text;
	}
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

// 파일 인풋에서 value-change 이벤트 발생 시 호출.
function onMy_file_inputValueChange(/* cpr.events.CValueChangeEvent */ e){
	var my_file_input = e.control;
	var files = my_file_input.files;
	
    var i,f;
    for (i = 0; i != files.length; ++i) {
        f = files[i];        
        
        var reader = new FileReader();
        var name = f.name;
 
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
			
   			var uSINT_btnAuthTypeModify = e.control;
   			var appld = "app/popup/ContentSelector" + "?" + usint_version;
   			// 가져오기 컬럼과 엑셀 파일의 컬럼 매핑을 위한 다이얼로그 팝업
			app.getRootAppInstance().openDialog(appld, {width : 480, height : 600}, function(dialog){
				dialog.initValue = {"SrcTitle":srcTitle,"Title":result[0]};				
				dialog.bind("headerTitle").toLanguage("Str_ImportContentSetting");
				dialog.modal = true;		
			}).then(function(returnValue){								
				var contentMap = new Map();
				for( var idx = 0; idx < returnValue.length; idx++){					
					contentMap.set( returnValue[idx]["SourceName"], returnValue[idx]["ColumnName"] );
				}				
				var groupList = new Array();
				var dsGroupList = app.lookup("dsGroupInfo");						
				workbook.SheetNames.forEach(function(item, index, array) {
					var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
										
					for( var idx = 0; idx < json.length; idx++){
						var userInfo = [];						
						srcTitle.forEach(function(item, index){
							var columnName = contentMap.get(item);
							if( columnName != "" && columnName != undefined ){
								var value = { item : json[idx][columnName]};
								userInfo[item]=json[idx][columnName]; // 항목별로 언어를 적용한 상태이므로 원본 칼럼을 찾아와 적용
							}
						});
						groupList.push(userInfo);
					}
				});		
				
				for(var i=0;i<groupList.length;i++){
					var row = dsGroupList.addRow();
					
					row.setValue("GroupID", groupList[i][dataManager.getString("Str_GroupID")]);
					row.setValue("GroupName", groupList[i][dataManager.getString("Str_GroupName")]);
					row.setValue("Parent", groupList[i][dataManager.getString("Str_GroupParent")]);
					row.setValue("Description", groupList[i][dataManager.getString("Str_Description")]);					
				}				
			});
	   		
        }; //end onload
 
        if(rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
 
    }//end. for	
}

// 도움말 클릭
function onUSIMP_btnHelpPageClick(/* cpr.events.CMouseEvent */ e){	
	var menu_id = app.getHostProperty("initValue")["programID"]; // mainManager.module.js ExecuteMenu <- 셋팅
	var selectionEvent = new cpr.events.CUIEvent("execute-menu",{content:{"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 그룹 가져오기 완료
function onSms_postGroupImportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Success"));
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 그룹 가져오기 에러
function onSms_postGroupImportSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 그룹 가져오기 타임아웃
function onSms_postGroupImportSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 갱신 버튼 클릭
function onGIDLG_btnRefreshClick(/* cpr.events.CMouseEvent */ e){
	var uSIMP_btnRefresh = e.control;
	var treGroup = app.lookup("GIDLG_treGroup");
	treGroup.redraw();	
}

// 그룹 등록 클릭
function onGIDLG_btnGroupImportClick(/* cpr.events.CMouseEvent */ e){
	comLib.showLoadMask("",dataManager.getString("Str_Save"),"",0);	
	
	var sms_postGroupImport = app.lookup("sms_postGroupImport");
	sms_postGroupImport.send();
}
