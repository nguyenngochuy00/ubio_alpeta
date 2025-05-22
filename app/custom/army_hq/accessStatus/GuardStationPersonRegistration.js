/************************************************
 * GuardStationPersonRegistration.js
 * Created at 2021. 2. 2. 오후 2:19:10.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var UserAccessRegistration = 1;
var usint_version;
var rABS = true; // T : 바이너리, F : 어레이 버퍼
var srcTitle;
var utilLib = cpr.core.Module.require("lib/util");

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	srcTitle = new Array();
	var grdVisitInfo = app.lookup("ASR_grdUserAccessRegistration");
	for(var i=0;i<grdVisitInfo.getColumnWidths().length;i++){
		if (grdVisitInfo.header.getColumn(i).text != "AccessDate" && grdVisitInfo.header.getColumn(i).text != "No") {
			srcTitle[i] = grdVisitInfo.header.getColumn(i).text;
		}
	}

	var userType = app.lookup("AMGPR_cmbUserType");
	userType.addItem(new cpr.controls.Item("----", 0));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_OtherUnit"), UserPrivArmyOtherUnit));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Foreign"), UserPrivArmyForeign));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Soldier"), UserPrivArmySoldier));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Family"), UserPrivArmyFamily));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Resident"), UserPrivArmyResident));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_Regular"), UserPrivArmyRegular));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_OnDuty"), UserPrivArmyOnDuty));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_MilitaryPersonnel"), UserPrivArmyMilitaryPersonnel));
	userType.addItem(new cpr.controls.Item(dataManager.getString("Str_ARMY_ArmyPublicServicel"), UserPrivArmyPublicService));
	
	app.lookup("sms_getMusteringList").send();
	
	// 위병소 인원출입 일괄등록 excel 양식
	var link = app.lookup("AMGPR_sniDownloadLink");
	link.value=	"<a href=\"/setup/custom_armyhq/위병소인원출입일괄등록양식.xlsx\" target=\"_blank\">양식 다운로드</a>";

}


/* 버튼 클릭 이벤트 */
function onDeleteLineButtonClick(/* cpr.events.CMouseEvent */ e){
	var dataSet = app.lookup("dsUserAccessInfo");
	
	var count = dataSet.getRowCount();
	dataSet.deleteRow(count-1);
	dataSet.commit();
}

function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (var i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}

function onAddLineButtonClick(/* cpr.events.CMouseEvent */ e){
	
	var insertRow;
	var now = new Date();
	var time = leadingZeros(now.getHours(), 2) + ':' +  leadingZeros(now.getMinutes(), 2);
	var date = leadingZeros(now.getFullYear(), 4) + '-' +  leadingZeros(now.getMonth()+1, 2) + '-' + leadingZeros(now.getDate(), 2); 
	
	var dataSet = app.lookup("dsUserAccessInfo");
	insertRow = {"AccessTime": time, "AccessDate": date, "AccessAreaID": 0, "AccessType": 1, "UserType": 0};

	dataSet.addRowData(insertRow);
	dataSet.commit();
}

function onRegistButtonClick(/* cpr.events.CMouseEvent */ e){
	if (!validationCheck()) {
		return;
	} 
	
	var submission = app.lookup("sms_postManualAccessStatus");
	submission.action = "/v1/armyhq/manualAccessStatus/" + UserAccessRegistration;
	submission.send();
}

function validationCheck(){
	var dataSet = app.lookup("dsUserAccessInfo");
	for (var i=0; i < dataSet.getRowCount(); i++) {
		var row = dataSet.getRow(i);
		if (!checkZeroControl(i+1, row.getValue("AccessAreaID"), "Str_ARMY_AccessAreaInvalid")){ return false; }
		if (!checkZeroControl(i+1, row.getValue("UserType"), "Str_ARMY_UserTypeInvalid")){ return false; }
		if (!checkNullControl(i+1, row.getValue("Name"), "Str_ARMY_UserNameInvalid")){ return false; }
		if (!checkNullControl(i+1, row.getValue("AddressNote"), "Str_ARMY_AddressMemoInvalid")){ return false; }
		if (!checkNullControl(i+1, row.getValue("PurposeOfAccess"), "Str_ARMY_PurposeVisitInvalid")){ return false; }
	}
	return true;
}

function checkNullControl(lineIndex, dataValue, ErrorMsg) {
	if( dataValue == null || dataValue.length < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "No [" + lineIndex +"] :" + dataManager.getString(ErrorMsg));
		return false;
	}
	return true;
}

function checkZeroControl(lineIndex, dataValue, ErrorMsg) {
	if( dataValue == 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "No [" + lineIndex +"] :" + dataManager.getString(ErrorMsg));
		return false;
	}
	return true;
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getMusteringListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		var insetData = {"MusteringID": 0, "MusteringName": "--------"};
		app.lookup("MusteringList").addRowData(insetData);
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getMusteringListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getMusteringListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postManualAccessStatusSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_ARMY_AccessStatusRegistCompleated"));
		app.lookup("dsUserAccessInfo").clear();
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}	
}

function onSms_postManualAccessStatusSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_postManualAccessStatusSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onAMGPR_fiUserFileValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.FileInput
	 */
	var now = new Date();
	var date = leadingZeros(now.getFullYear(), 4) + '-' +  leadingZeros(now.getMonth()+1, 2) + '-' + leadingZeros(now.getDate(), 2);
	
	var my_file_input = e.control;
	var files = my_file_input.files;
	
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
				var dsUserList = app.lookup("dsUserAccessInfo");						
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
				
				console.log(app.lookup("AMGPR_cmbAccessArea").getItems());
				
				var accessAreaItems = app.lookup("AMGPR_cmbAccessArea").getItems();
				var accessTypeItems = app.lookup("AMGPR_cmbAccessType").getItems();
				var userTypeItems = app.lookup("AMGPR_cmbUserType").getItems();

				for(var i=0;i<userList.length;i++){
					var row = dsUserList.addRow();
					accessAreaItems.forEach(function(item) {
						if (item.label == userList[i][dataManager.getString("Str_ARMYHQ_AccessArea")]){
							row.setValue("AccessAreaID", item.value);
						} 
					});
					accessTypeItems.forEach(function(item) {
						if (item.label == userList[i][dataManager.getString("Str_ARMYHQ_AccessType")]){
							row.setValue("AccessType", item.value);
						} 
					});					
					row.setValue("AccessTime", userList[i][dataManager.getString("Str_ARMYHQ_AccessTime")]);
					userTypeItems.forEach(function(item) {
						if (item.label == userList[i][dataManager.getString("Str_ARMY_UserType")]){
							row.setValue("UserType", item.value);
						} 
					});
					row.setValue("Name", userList[i][dataManager.getString("Str_ARMY_Name")]);
					row.setValue("AddressNote", userList[i][dataManager.getString("Str_ARMYHQ_AddressNote")]);
					row.setValue("Position", userList[i][dataManager.getString("Str_ARMY_Position")]);
					row.setValue("PurposeOfAccess", userList[i][dataManager.getString("Str_ARMYHQ_PurposeOfAccess")]);
					row.setValue("AccessDate", date);

				}				
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
        }; //end onload
        if(rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
    }//end. for	
}
