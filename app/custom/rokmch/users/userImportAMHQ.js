/************************************************
 * UserImportAMHQ.js
 * Created at 2021. 1. 12. 오후 2:57:51.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var usint_version;
var rABS = true; // T : 바이너리, F : 어레이 버퍼
 
var curImportIndex = 0; // 현재 보낸 유저 인덱스 
var success = 0;
var fail = false;
 
var srcColumn;
var srcTitle;	

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	
	srcColumn = new Array();
	srcTitle = new Array();
	
	var grdUserImportList = app.lookup("USIMP_grdUserImportList");
	
	for(var i=0;i<grdUserImportList.getColumnWidths().length;i++){		
		srcColumn[i] = grdUserImportList.header.getColumn(i).text;
		srcTitle[i] = grdUserImportList.header.getColumn(i).text;
	}
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

// 파일 인풋에서 value-change 이벤트 발생 시 호출.
function onMy_file_inputValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.FileInput	 */
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
				dialog.style.header.css("background-color", "#528443");
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
								userInfo[item]=json[idx][columnName]; // srcColumn-항목별로 언어를 적용한 상태이므로 원본 칼럼을 찾아와 적용
							}
						});
						userList.push(userInfo);
					}
				});		
				
				
				
				for(var i=0;i<userList.length;i++){
					var row = dsUserList.addRow();
				
					row.setValue("ID", userList[i][dataManager.getString("Str_ID")]);
					row.setValue("UniqueID", userList[i][dataManager.getString("Str_UniqueID")]);
					//row.setValue("UniqueID", userList[i][dataManager.getString("Str_UniqueID")].trim()); // 앞뒤 공백 제거 - pse
					row.setValue("Name", userList[i][dataManager.getString("Str_Name")]);
					row.setValue("AuthInfo", userList[i][dataManager.getString("Str_AuthInfo")]);
					row.setValue("Privilege", userList[i][dataManager.getString("Str_Privilege")]);
					row.setValue("CreateDate", userList[i][dataManager.getString("Str_CreateDate")]);
					row.setValue("UsePeriodFlag", userList[i][dataManager.getString("Str_UsePeriod")]);
					row.setValue("RegistDate", userList[i][dataManager.getString("Str_RegistDate")]);
					row.setValue("ExpireDate", userList[i][dataManager.getString("Str_ExpireDate")]);
					row.setValue("Password", userList[i][dataManager.getString("Str_Password")]);
					row.setValue("Group", userList[i][dataManager.getString("Str_Group")]);
					row.setValue("AccessGroup", userList[i][dataManager.getString("Str_AccessGroup")]);
					row.setValue("BlackList", userList[i][dataManager.getString("Str_BlackList")]);
					row.setValue("FPIdentify", userList[i][dataManager.getString("Str_AuthTypeFPIdentify")]);
					row.setValue("FaceIdentify", userList[i][dataManager.getString("Str_AuthTypeFaceIdentify")]);
					row.setValue("APBZone", userList[i][dataManager.getString("Str_APBAreaLocation")]);
					row.setValue("APBExcept", userList[i][dataManager.getString("Str_APBException2")]);
					row.setValue("WorkName", userList[i][dataManager.getString("Str_Schedule3")]);
					row.setValue("MealName", userList[i][dataManager.getString("Str_MealCode")]);
					row.setValue("MoneyName", userList[i][dataManager.getString("Str_Salary2")]);
					row.setValue("VerifyLevel", userList[i][dataManager.getString("Str_VerifyLevel")]);
					row.setValue("Position", userList[i][dataManager.getString("Str_Position")]);
					row.setValue("Department", userList[i][dataManager.getString("Str_Department")]);
					row.setValue("LoginPW", userList[i][dataManager.getString("Str_LoginPassword2")]);
					row.setValue("LoginAllowed", userList[i][dataManager.getString("Str_AllowSignin2")]);
					row.setValue("Email", userList[i][dataManager.getString("Str_EmailAddress")]);
					row.setValue("IrisIdentify", userList[i][dataManager.getString("Str_TypeIrisIdentify")]);
					row.setValue("Card", userList[i][dataManager.getString("Str_Card")]);
					row.setValue("CarNumber", userList[i][dataManager.getString("Str_CarNumber")]);
					//row.setValue("CarNumber", userList[i][dataManager.getString("Str_CarNumber")].trim()); // 앞뒤 공백 제거 - pse
					row.setValue("CarType", userList[i][dataManager.getString("Str_CarType")]);
					row.setValue("CarColor", userList[i][dataManager.getString("Str_CarColor")]);
					row.setValue("CarBlackbox", userList[i][dataManager.getString("Str_CarBlackbox")]);
					
					// UserCustomAMHQ info
					row.setValue("Phone", userList[i][dataManager.getString("Str_ARMY_Phone")]);
					row.setValue("Birthday", userList[i][dataManager.getString("Str_DateOfBirth")]);
					row.setValue("BasisIssuanceCertificate", userList[i][dataManager.getString("Str_ARMY_BasisIssuanceCertificate")]);
					row.setValue("Gender", userList[i][dataManager.getString("Str_ARMY_Gender")]);
					row.setValue("EnlistmentDate", userList[i][dataManager.getString("Str_ARMY_EnlistmentDate")]);
					row.setValue("DischargeDate", userList[i][dataManager.getString("Str_ARMY_DischargeDate")]);
					row.setValue("MoveInDate", userList[i][dataManager.getString("Str_ARMY_MoveInDate")]);
					row.setValue("Address", userList[i][dataManager.getString("Str_ARMY_CompanyAddress")]);
					row.setValue("IdentificationNumber", userList[i][dataManager.getString("Str_ARMY_BackgroundCheckNumber")]);
					row.setValue("FamilyName", userList[i][dataManager.getString("Str_ARMYHQ_FamilyName")]);
					row.setValue("FamilyRelationship", userList[i][dataManager.getString("Str_ARMYHQ_FamilyRelationship")]);
					row.setValue("MobilePhone", userList[i][dataManager.getString("Str_MobileNum")]);
					
					console.log(dataManager.getString("Str_ARMY_DeletedDate"));
					console.log(dataManager.getString("Str_ARMY_Deleter"));
					
					row.setValue("DeletedDate", userList[i][dataManager.getString("Str_ARMY_DeletedDate")]);
					row.setValue("Deleter", userList[i][dataManager.getString("Str_ARMY_Deleter")]);		
					
					
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

// 등록 버튼 클릭
function onUSIMP_btnBatchRegistClick(/* cpr.events.CMouseEvent */ e){
	
	var dsUserImportDataTemp = app.lookup("dsUserImportDataTemp");
	var count = dsUserImportDataTemp.getRowCount();
	if(count<=0){return;}
	
	curImportIndex = 0; // 초기화를 해 놓읍시다
	
	var smsRequestData = app.lookup("sms_postUserDataImport");
	
	// 1개씩 보냅시다 
	var dsUserImportData = app.lookup("dsUserImportData");
	var dsUserImportCustomData = app.lookup("dsUserImportCustomAMHQ");
	dsUserImportData.clear();
	dsUserImportCustomData.clear();
	
	var strPrivilegeName = dsUserImportDataTemp.getValue(curImportIndex, "Privilege");
	var nPrivilegeID = 2; // 기본 사용자
	switch (strPrivilegeName) {
	case "관리자":
	case "Admin":
		nPrivilegeID = 1; break;
	case "사용자":
	case "User":
		nPrivilegeID = 2; break;
	case "현역":
		nPrivilegeID = 900; break;
	case "군무원":
		nPrivilegeID = 907; break;
	case "공무직":
		nPrivilegeID = 908; break;
	case "병사":
		nPrivilegeID = 905; break;
	case "군가족":
		nPrivilegeID = 906; break;
	case "상주민간인":
		nPrivilegeID = 903; break;
	case "고정출입자":
		nPrivilegeID = 904; break;
	case "타부대원":
		nPrivilegeID = 901; break;	
	case "민간인":
		nPrivilegeID = 902; break;											
	default:
		var privilegeList = dataManager.getPrivilegeList();	
		if( privilegeList ){
			var rowData = privilegeList.findFirstRow("Name == '" + strPrivilegeName + "'");
			if (rowData) {
				nPrivilegeID = rowData.getValue("privilegeID");
			}
		}
	}
		
	dsUserImportData.addRowData(dsUserImportDataTemp.getRowData(curImportIndex));
	dsUserImportData.setValue(0, "Privilege", nPrivilegeID);
	dsUserImportData.commit();
	
	dsUserImportCustomData.addRowData(dsUserImportDataTemp.getRowData(curImportIndex));
	dsUserImportCustomData.commit();

	app.lookup("UserImportResult").reset();
	app.lookup("UserImportResult").setValue("Total", dsUserImportDataTemp.getRowCount());
	
	smsRequestData.send();
	comLib.showLoadMask("",dataManager.getString("Str_UserImport"),"",0);	
}

// 사용자 등록 요청 완료
function onSms_postUserDataImportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postUserDataImport = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var ImportResult = app.lookup("UserImportResult");
	var dsFailedUserList = app.lookup("dsFailedUserList");
//	var total = ImportResult.getValue("Total");
//	var fail = ImportResult.getValue("Fail");
//	var success = ImportResult.getValue("Success");
	
	// 실패여도 다음 사용자 전송하도록 수정
	if (resultCode != COMERROR_NONE) {
		var dsUserImportDataTemp = app.lookup("dsUserImportDataTemp");
		var userInfo = dsUserImportDataTemp.getRow(curImportIndex);
		var userID = userInfo.getValue("ID");
		var userName = userInfo.getValue("Name");
		var msg = dataManager.getString(getErrorString(resultCode))+ "\n" +
			dataManager.getString("Str_UserID")+ " : " + userID + "\n" +
			dataManager.getString("Str_UserName")+ " : " + userName;
		
		console.log(msg);
		var data = {"ID" : userID, "Name" : userName, "Msg" : dataManager.getString(getErrorString(resultCode))};
		dsFailedUserList.pushRowData(data);
		
		fail = true;
		// dialogAlertAMHQ(app, dataManager.getString("Str_Failed"),msg);
	} else {
		success++;
	}
	
	var dsUserImportDataTemp = app.lookup("dsUserImportDataTemp");

	var count = dsUserImportDataTemp.getRowCount();
	curImportIndex ++; // 다은 인덱스를 보냅시다.
		
	if (count == curImportIndex) {
		comLib.hideLoadMask(); // 이미 다 보낸 것이라면 그만 합시다
		if(success == 0) {  // 모두 실패
			dialogAlertAMHQ(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_Fail"));
			return;			
		} else if(fail) {  // 일부만 성공
			var appld = "app/custom/rokmch/users/failedUserIDList";
			app.openDialog(appld, 
			{width : 500, 
			height : 500}, 
			function(dialog){
				dialog.bind("headerTitle").toLanguage("Str_ARMYHQ_FailedIDList");
				dialog.initValue = {"FailedUserList": dsFailedUserList};
				dialog.style.header.css("background-color", "#528443");
				dialog.modal = true;
				dialog.headerClose = false;
			}).then(function(returnValue){
				dsFailedUserList.clear();
			});	
			
			return;
		} else { // 모두 성공
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Success"));
			return;
			
		}
	}
		
	var smsRequestData = app.lookup("sms_postUserDataImport");

	// 1개씩 보냅시다 
	var dsUserImportData = app.lookup("dsUserImportData");
	var dsUserImportCustomData = app.lookup("dsUserImportCustomAMHQ");
	dsUserImportData.clear();
	dsUserImportCustomData.clear();
	var strPrivilegeName = dsUserImportDataTemp.getValue(curImportIndex, "Privilege");
	
	var nPrivilegeID = 2; // 기본 사용자
	switch (strPrivilegeName) {
	case "관리자":
	case "Admin":
		nPrivilegeID = 1; break;
	case "사용자":
	case "User":
		nPrivilegeID = 2; break;
	case "현역":
		nPrivilegeID = 900; break;
	case "군무원":
		nPrivilegeID = 907; break;
	case "공무직":
		nPrivilegeID = 908; break;
	case "병사":
		nPrivilegeID = 905; break;
	case "군가족":
		nPrivilegeID = 906; break;
	case "상주민간인":
		nPrivilegeID = 903; break;
	case "고정출입자":
		nPrivilegeID = 904; break;
	case "타부대원":
		nPrivilegeID = 901; break;	
	case "민간인":
		nPrivilegeID = 902; break;											
	default:
		var privilegeList = dataManager.getPrivilegeList();	
		if( privilegeList ){
			var rowData = privilegeList.findFirstRow("Name == '" + strPrivilegeName + "'");
			if (rowData) {
				nPrivilegeID = rowData.getValue("privilegeID");
			}
		}
	}
	
	dsUserImportData.addRowData(dsUserImportDataTemp.getRowData(curImportIndex));
	dsUserImportData.setValue(0, "Privilege", nPrivilegeID);
	dsUserImportData.commit();
		
	dsUserImportCustomData.addRowData(dsUserImportDataTemp.getRowData(curImportIndex));
	dsUserImportCustomData.commit();
	
	smsRequestData.send();
}

// 사용자 등록 요청 에러
function onSms_postUserDataImportSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 사용자 등록 요청 타임아웃
function onSms_postUserDataImportSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 도움말 클릭
function onUSIMP_btnHelpPageClick(/* cpr.events.CMouseEvent */ e){	
	var menu_id = app.getHostProperty("initValue")["programID"]; // mainManager.module.js ExecuteMenu <- 셋팅
	var selectionEvent = new cpr.events.CUIEvent("execute-menu",{content:{"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
