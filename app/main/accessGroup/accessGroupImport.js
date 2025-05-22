/************************************************
 * userImport.js
 * Created at 2018. 10. 16. 오후 1:40:12.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var utils = cpr.core.Module.require("lib/util");
var comLib;
var usint_version;
var rABS = true; // T : 바이너리, F : 어레이 버퍼
 
var curImportIndex = 0; // 현재 보낸 유저 인덱스 
 
var srcTitleAccessGroup;

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
		
	if (dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH) {
		srcTitleAccessGroup = new Array();
		srcTitleAccessGroup = [dataManager.getString("Str_ID"),dataManager.getString("Str_Name")];
	}
}

// 출입그룹 파일 인풋 이벤트
function onAGAAI_fiAccessGroupValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.FileInput	 */
	var fiAccessGroup = e.control;	
	var files = fiAccessGroup.files;
	
    var i,f;
    for (i = 0; i != files.length; ++i) {
        f = files[i];        
        var reader = new FileReader();
        var name = f.name;
        reader.onload = function(e) {
            var data = e.target.result;
            
            var workbook;
            if(rABS){workbook = XLSX.read(data, {type: 'binary'});} /* if binary string, read with type 'binary' */
            else{var arr = utils.fixdata(data);workbook = XLSX.read(btoa(arr), {type: 'base64'});}/* if array buffer, convert to base64 */            
            
            var first_sheet_name = workbook.SheetNames[0]; // 처음 시트의 명칭 얻기 			 	
 			var worksheet1 = workbook.Sheets[first_sheet_name]; // 첫번째 시트 가져오기 					
 			//var rangeLabel = worksheet1['!ref'].split(':');
 			
			var result = [];
			var row, rowNum, colNum;
			var range = XLSX.utils.decode_range(worksheet1['!ref']);				
			for(rowNum = range.s.r; rowNum <= range.e.r; rowNum++){				
				row = [];
				for(colNum=range.s.c; colNum<=range.e.c; colNum++){					
					var nextCell = worksheet1[XLSX.utils.encode_cell({r: rowNum, c: colNum})];									
          			
          			if( typeof nextCell === 'undefined' ){row.push(void 0);}
          			else {row.push(nextCell.w);}
       			}
       			result.push(row);
   			}	
   			
   			var appld = "app/popup/ContentSelector" + "?" + usint_version;
   			// 가져오기 컬럼과 엑셀 파일의 컬럼 매핑을 위한 다이얼로그 팝업
			app.getRootAppInstance().openDialog(appld, {width : 480, height : 600}, function(dialog){
				dialog.initValue = {"SrcTitle":srcTitleAccessGroup,"Title":result[0]};				
				dialog.bind("headerTitle").toLanguage("Str_ImportContentSetting");
				dialog.modal = true;		
			}).then(function(returnValue){								
				
				var contentMap = new Map();
				for( var idx = 0; idx < returnValue.length; idx++){					
					contentMap.set( returnValue[idx]["SourceName"], returnValue[idx]["ColumnName"] );
				}				
				
				var accessGroupList = new Array();										
				workbook.SheetNames.forEach(function(item, index, array) {
					var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
										
					for( var idx = 0; idx < json.length; idx++){
						var accessGroupInfo = [];						
						srcTitleAccessGroup.forEach(function(item, index){
							var columnName = contentMap.get(item);
							if( columnName != "" && columnName != undefined ){
								var value = { item : json[idx][columnName]};
								accessGroupInfo[item]=json[idx][columnName]; // 항목별로 언어를 적용한 상태이므로 원본 칼럼을 찾아와 적용
							}
						});
						accessGroupList.push(accessGroupInfo);
					}
				});		
				
				var dsAccessGroupList = app.lookup("AccessGroupList");
				dsAccessGroupList.clear();
				for(var i=0;i<accessGroupList.length;i++){
					var row = dsAccessGroupList.addRow();					
					row.setValue("ID", accessGroupList[i][dataManager.getString("Str_ID")]);
					row.setValue("Name", accessGroupList[i][dataManager.getString("Str_Name")]);										
				}		
				
				console.log(dsAccessGroupList.getRowDataRanged());		
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
	//var treGroup = app.lookup("GIDLG_treGroup");
	//treGroup.redraw();	
}

// 그룹 등록 클릭
function onGIDLG_btnGroupImportClick(/* cpr.events.CMouseEvent */ e){
	comLib.showLoadMask("",dataManager.getString("Str_Save"),"",0);	
	
	var sms_postAccessGroupImport = app.lookup("sms_postAccessGroupImport");
	sms_postAccessGroupImport.send();
}






