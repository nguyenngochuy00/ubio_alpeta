/************************************************
 * accessApplicationExcelMigration.js
 * Created at 2021. 3. 2. 오후 4:49:42.
 *
 * @author blue1
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var usint_version;
var srcColumn;
var srcTitle;

var totalCount = 0;
var curImportIndex = 0; // 보낸 인덱스 
var resultMsg = "";

var AccessGroups = null;
var Groups = null;
var Positioins = null;
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	
	srcColumn = new Array();
	srcTitle = new Array();
	
	var grdList = app.lookup("AAEM_grdAcccessApplicationList");
	for(var i=0;i<grdList.getColumnWidths().length;i++){		
		srcColumn[i] = grdList.header.getColumn(i).text;
		srcTitle[i] = grdList.header.getColumn(i).text;
	}
	
	AccessGroups = dataManager.getAccessGroup();
	Groups = dataManager.getGroup();
	Positioins = dataManager.getPositionList();
}

/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onAAEM_fiExcelFileValueChange(/* cpr.events.CValueChangeEvent */ e){
	var my_file_input = e.control;
	var files = my_file_input.files;
	
    var i,f;
    for (i = 0; i != files.length; ++i) {
        f = files[i];        
        
        var reader = new FileReader();
        var name = f.name;
 
        reader.onload = function(e) {
            var data = e.target.result;
 
            var workbook = XLSX.read(data, {type: 'binary'});
            
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
				dialog.style.header.css("background-color", "#528443");	
				dialog.bind("headerTitle").toLanguage("Str_ImportContentSetting");
				dialog.modal = true;		
			}).then(function(returnValue){								
				var contentMap = new Map();
				for( var idx = 0; idx < returnValue.length; idx++){					
					contentMap.set( returnValue[idx]["SourceName"], returnValue[idx]["ColumnName"] );
				}				
				var excelDatas = new Array();
				var dsAcApList = app.lookup("AcccessApplicationList");						
				workbook.SheetNames.forEach(function(item, index, array) {
					var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
										
					for( var idx = 0; idx < json.length; idx++){
						var excelData = [];						
						srcTitle.forEach(function(item, index){
							var columnName = contentMap.get(item);
							if( columnName != "" && columnName != undefined ){
								var value = { item : json[idx][columnName]};
								excelData[item]=json[idx][columnName]; // srcColumn-항목별로 언어를 적용한 상태이므로 원본 칼럼을 찾아와 적용
							}
						});
						excelDatas.push(excelData);
					}
				});		
				
				for(var i=0;i<excelDatas.length;i++){
					var row = dsAcApList.addRow();
					row.setValue("UserType", excelDatas[i]["인원구분"]);
					row.setValue("Name", excelDatas[i]["성명"]);
					row.setValue("Birthday", excelDatas[i]["생년월일"]);
					row.setValue("ServiceNumber", excelDatas[i]["군번"]);
					row.setValue("CardNumber", excelDatas[i]["카드번호"]);
					row.setValue("UnitName", excelDatas[i]["부대명"]);
					row.setValue("Position", excelDatas[i]["계급/직급"]);
					row.setValue("UserClass", excelDatas[i]["직책"]);
					row.setValue("Gender", excelDatas[i]["성별"]);
					row.setValue("Mobile", excelDatas[i]["핸드폰번호"]);
					row.setValue("Phone", excelDatas[i]["일반전화번호"]);
					row.setValue("Address", excelDatas[i]["주소/회사명"]);
					row.setValue("BasisIssuanceCertificate", excelDatas[i]["비취발급 근거"]);
					row.setValue("GroupCode", excelDatas[i]["소속부서"]);
					row.setValue("IdentificationNumber", excelDatas[i]["신원조회 연번"]);
					row.setValue("AccessGroup", excelDatas[i]["출입권한"]);
					row.setValue("AccessStart", excelDatas[i]["출입시작일"]);
					row.setValue("AccessEnd", excelDatas[i]["출입종료일"]);
					row.setValue("CarNumber", excelDatas[i]["차량번호"]);
					row.setValue("CarColor", excelDatas[i]["차량색상"]);
					row.setValue("CarBlackbox", excelDatas[i]["블랙박스"]);
					row.setValue("CarType", excelDatas[i]["차량종류"]);
					row.setValue("FamilyRelation", excelDatas[i]["가족관계"]);
					row.setValue("RelationUserID", excelDatas[i]["소속부대원ID"]);
					row.setValue("FamilyName", excelDatas[i]["소속부대원이름"]);
					row.setValue("MoveInDate", excelDatas[i]["전입일"]);
					row.setValue("EnlistmentDate", excelDatas[i]["입대일"]);
					row.setValue("DischargeDate", excelDatas[i]["전역예정일"]);
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
        reader.readAsBinaryString(f);
    }//end. for	
}

function sendPutAccessApplication() {
	var AcApInfo = app.lookup("AccessApplicationInfo");
	AcApInfo.clear();
	app.lookup("AcccessApplicationList").copyToDataMap(AcApInfo, curImportIndex);
	
	if (validateData()) {
		var submission = app.lookup("sms_putAccessApplicationExcel");
		submission.send();	
	} else {
		curImportIndex++;
		if (totalCount == curImportIndex) {
			comLib.hideLoadMask(); // 이미 다 보낸 것이라면 그만 합시다
			dialogAlertAMHQ(app, dataManager.getString("Str_Fail"), resultMsg);
		} else {
			sendPutAccessApplication();	
		}
	}
}

function addResultMsg(index, message) {
	var failUserName = app.lookup("AcccessApplicationList").getRow(index).getString("Name");
	var msg = "[" + String(curImportIndex+1) + "]" + failUserName + " 실패: " + message + "\n";
	resultMsg += msg;
}

/* 버튼 이벤트 */
function onUSIMP_btnBatchRegistClick(/* cpr.events.CMouseEvent */ e){
	var AcApList = app.lookup("AcccessApplicationList");
	totalCount = AcApList.getRowCount();
	if(totalCount<=0){return;}
	
	curImportIndex = 0; // 초기화를 해 놓읍시다
	resultMsg = "";
	
	sendPutAccessApplication();
	comLib.showLoadMask("",dataManager.getString("Str_UserImport"),"",0);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putAccessApplicationExcelSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode != COMERROR_NONE) {	// 실패처리
		addResultMsg(curImportIndex, dataManager.getString(getErrorString(resultCode)));
	}
	
	curImportIndex++;
	if (totalCount == curImportIndex) {
		comLib.hideLoadMask(); // 이미 다 보낸 것이라면 그만 합시다
		if (resultMsg == "") {
			dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Success"));
		} else {
			dialogAlertAMHQ(app, dataManager.getString("Str_Fail"), resultMsg);
		}
		return;
	}
	sendPutAccessApplication();
}

function onSms_putAccessApplicationExcelSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_putAccessApplicationExcelSubmitUploadProgress(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 날자 포멧 검사: YYYY-MM-DD
function isDatetime(dateString){
	var reg = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/;
	return reg.test(dateString);
	
}

function validateData(){
	var groupList = dataManager.getGroup();
	var accessInfo = app.lookup("AccessApplicationInfo");
	
	// 공통 필수값
	if (accessInfo.getValue("Name") == null || accessInfo.getValue("Name").length == 0) {
		addResultMsg(curImportIndex, "성명 값이 없습니다");
		return false;
	}
	if (accessInfo.getValue("Birthday") == null || accessInfo.getValue("Birthday").length == 0) {
		addResultMsg(curImportIndex, "생년월일 값이 없습니다");
		return false;
	} else {
		if (!isDatetime(accessInfo.getValue("Birthday"))) {
			addResultMsg(curImportIndex, "생년월일 값이 잘못된 포멧입니다");
			return false;
		}
	}
	if (accessInfo.getString("UserType") != "군가족"){
		if (accessInfo.getValue("GroupCode") == null || accessInfo.getValue("GroupCode").length == 0) {
			addResultMsg(curImportIndex, "소속부서 값이 없습니다");
			return false;
		}
	}
	if (accessInfo.getValue("AccessGroup") == null || accessInfo.getValue("AccessGroup").length == 0) {
		addResultMsg(curImportIndex, "출입그룹 값이 없습니다");
		return false;
	}
	if (accessInfo.getValue("AccessStart") == null || accessInfo.getValue("AccessStart").length == 0) {
		addResultMsg(curImportIndex, "출입시작일 값이 없습니다");
		return false;
	} else {
		if (!isDatetime(accessInfo.getValue("AccessStart"))) {
			addResultMsg(curImportIndex, "출입시작일 값이 잘못된 포멧입니다");
			return false;
		}
	}
	if (accessInfo.getValue("AccessEnd") == null || accessInfo.getValue("AccessEnd").length == 0) {
		addResultMsg(curImportIndex, "출입종료일 값이 없습니다");
		return false;
	} else {
		if (!isDatetime(accessInfo.getValue("AccessEnd"))) {
			addResultMsg(curImportIndex, "출입종료일 값이 잘못된 포멧입니다");
			return false;
		}
	}
	switch (accessInfo.getString("UserType")) {
	case "현역", "군무원", "공무직":
		if (accessInfo.getValue("UnitName") == null || accessInfo.getValue("UnitName").length == 0) {
			addResultMsg(curImportIndex, "부대명 값이 없습니다");
			return false;
		}
		if (accessInfo.getValue("Position") == null || accessInfo.getValue("Position").length == 0) {
			addResultMsg(curImportIndex, "계급/직급 값이 없습니다");
			return false;
		}
		if (accessInfo.getValue("ServiceNumber") == null || accessInfo.getValue("ServiceNumber").length == 0) {
			addResultMsg(curImportIndex, "군번 값이 없습니다");
			return false;
		}
		if (accessInfo.getValue("UserClass") == null || accessInfo.getValue("UserClass").length == 0) {
			addResultMsg(curImportIndex, "직책 값이 없습니다");
			return false;
		}
		if (accessInfo.getValue("Mobile") == null || accessInfo.getValue("Mobile").length == 0) {
			addResultMsg(curImportIndex, "핸드폰번호 값이 없습니다");
			return false;
		}
		if (accessInfo.getValue("BasisIssuanceCertificate") == null || accessInfo.getValue("BasisIssuanceCertificate").length == 0) {
			addResultMsg(curImportIndex, "비취발급 근거 값이 없습니다");
			return false;
		}						
		break;
	case "병사":
		if (accessInfo.getValue("ServiceNumber") == null || accessInfo.getValue("ServiceNumber").length == 0) {
			addResultMsg(curImportIndex, "군번 값이 없습니다");
			return false;
		}
		if (accessInfo.getValue("Position") == null || accessInfo.getValue("Position").length == 0) {
			addResultMsg(curImportIndex, "계급/직급 값이 없습니다");
			return false;
		}
		if (accessInfo.getValue("MoveInDate") != null && accessInfo.getValue("MoveInDate").length != 0) {
			if (!isDatetime(accessInfo.getValue("MoveInDate"))) {
				addResultMsg(curImportIndex, "전입일 값이 잘못된 포멧입니다");
				return false;
			}
		}
		if (accessInfo.getValue("EnlistmentDate") != null && accessInfo.getValue("EnlistmentDate").length != 0) {
			if (!isDatetime(accessInfo.getValue("EnlistmentDate"))) {
				addResultMsg(curImportIndex, "입대일 값이 잘못된 포멧입니다");
				return false;
			}
		}
		if (accessInfo.getValue("DischargeDate") != null && accessInfo.getValue("DischargeDate").length != 0) {
			if (!isDatetime(accessInfo.getValue("DischargeDate"))) {
				addResultMsg(curImportIndex, "전역예정일 값이 잘못된 포멧입니다");
				return false;
			}
		}				
		break;
	case "군가족":
		if (accessInfo.getValue("FamilyRelation") == null || accessInfo.getValue("FamilyRelation").length == 0) {
			addResultMsg(curImportIndex, "가족관계 값이 없습니다");
			return false;
		}
		if (accessInfo.getValue("RelationUserID") == null || accessInfo.getValue("RelationUserID").length == 0) {
			addResultMsg(curImportIndex, "소속부대원ID 값이 없습니다");
			return false;
		}	
		if (accessInfo.getValue("FamilyName") == null || accessInfo.getValue("FamilyName").length == 0) {
			addResultMsg(curImportIndex, "소속부대원이름 값이 없습니다");
			return false;
		}				
		break;
	case "상주민간인", "고정출입자":
		if (accessInfo.getValue("UserClass") == null || accessInfo.getValue("UserClass").length == 0) {
			addResultMsg(curImportIndex, "직책 값이 없습니다");
			return false;
		}
		if (accessInfo.getValue("IdentificationNumber") == null || accessInfo.getValue("IdentificationNumber").length == 0) {
			addResultMsg(curImportIndex, "신원조회 연번 값이 없습니다");
			return false;
		}			
		break;	
	defalut:
		addResultMsg(curImportIndex, "인원 구분 값이 잘못되었습니다")
		return false;
	}
	
	if (accessInfo.getValue("Position") != null && accessInfo.getValue("Position").length != 0) {
		if( !Positioins.findFirstRow("Name == '"+accessInfo.getValue("Position")+"'") ){					
			addResultMsg(curImportIndex, "계급/직급 값이 잘못되었습니다");
			return false;
		}
	}
	if (accessInfo.getValue("GroupCode") != null && accessInfo.getValue("GroupCode").length != 0) {
		if( !Groups.findFirstRow("Name == '"+accessInfo.getValue("GroupCode")+"'") ){					
			addResultMsg(curImportIndex, "소속부서 값이 잘못되었습니다");
			return false;
		}
	}
	if (accessInfo.getValue("AccessGroup") != null && accessInfo.getValue("AccessGroup").length != 0) {
		if( !AccessGroups.findFirstRow("Name == '"+accessInfo.getValue("AccessGroup")+"'") ){					
			addResultMsg(curImportIndex, "출입권한 값이 잘못되었습니다");
			return false;
		}
	}
	
	if (accessInfo.getValue("Gender") != null && accessInfo.getValue("Gender").length != 0) {
		if (accessInfo.getValue("Gender") != "남" &&  accessInfo.getValue("Gender") != "여") {
			addResultMsg(curImportIndex, "성별 값이 잘못되었습니다");
			console.log(accessInfo.getDatas());
			return false;
		}
	}
	if (accessInfo.getValue("CarBlackbox") != null && accessInfo.getValue("CarBlackbox").length != 0) {
		if (accessInfo.getValue("CarBlackbox") != "설치" &&  accessInfo.getValue("CarBlackbox") != "미설치") {
			addResultMsg(curImportIndex, "블랙박스 잘못되었습니다");
			console.log(accessInfo.getDatas());
			return false;
		}
	}
	if (accessInfo.getValue("FamilyRelation") != null && accessInfo.getValue("FamilyRelation").length != 0) {
		if (accessInfo.getValue("FamilyRelation") != "부" &&  
			accessInfo.getValue("FamilyRelation") != "모" &&
			accessInfo.getValue("FamilyRelation") != "배우자" &&
			accessInfo.getValue("FamilyRelation") != "자녀" &&
			accessInfo.getValue("FamilyRelation") != "형제자매" &&
			accessInfo.getValue("FamilyRelation") != "친척") {
			addResultMsg(curImportIndex, "가족관계 값이 잘못되었습니다");
			return false;
		}
	}
	return true;
}
