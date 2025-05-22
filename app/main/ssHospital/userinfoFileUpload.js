/************************************************
 * userinfoFileUpload.js
 * Created at 2020. 8. 31. 오전 9:24:32.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var SSHUFU_version;
var rABS = true; // T : 바이너리, F : 어레이 버퍼
 
var curImportIndex = 0; // 현재 보낸 유저 인덱스 


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	SSHUFU_version = dataManager.getSystemVersion();
	//출입그룹, 그룹, 식수
	var accessGroupList = dataManager.getAccessGroup();
	var cmbAccessGroupSet = app.lookup("SSHUFU_cmbAccessGroupSet");
	
	cmbAccessGroupSet.setItemSet(accessGroupList, {
			label: "Name",
			value: "ID",
	});
	
	//----------------------------------------------------------------
	var groupList = dataManager.getGroup();	
	var cmbGroupSet = app.lookup("SSHUFU_cmbGroupSet");
	
	cmbGroupSet.setItemSet(groupList, {
		label: "Name",
		value: "GroupID",
	});
	
	//----------------------------------------------------------------
	var mealList = dataManager.getMealList();
	var cmbMealSet = app.lookup("SSHUFU_cmbMealSet");
	
	cmbMealSet.setItemSet(mealList, {
		label:"Name",
		value:"Code",
	});
	
	//-------------------------------------------------------------------
}

var srcColumn = [ "UniqueID",	"Name",	"Balance", "Birthday", "CardNum","Result"	];

/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onSSHUFU_fileInputValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.FileInput
	 */
	var sSHUFU_fileInput = e.control;
	/** 
	 * @type cpr.controls.FileInput
	 */
	var sshfu_files = e.control;
	var accessGroupList = dataManager.getAccessGroup();
	var groupList = dataManager.getGroup();	
	var mealList = dataManager.getMealList();
	var files = sshfu_files.files;
	
    var i,f;
    for (i = 0; i != files.length; ++i) {
    	f = files[i];
     //   console.log(f.name);
        
        var reader = new FileReader();
        var name = f.name;
        
        reader.onload = function(e) {
			var data = e.target.result;
            var workbook;
            /* if binary string, read with type 'binary' */
            if(rABS) {
                /* if binary string, read with type 'binary' */
                workbook = XLSX.read(data, {type: 'binary'});
            } else {
                /* if array buffer, convert to base64 */
                var arr = fixdata(data);
                workbook = XLSX.read(btoa(arr), {type: 'base64'});
            }//end. if
            
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
			
			var srcTitle = [
				"Q-ID",
				"이름",
				"잔액",
				"생년월일",
				"카드번호"
			];
			
   			var appld = "app/popup/ContentSelector" + "?" + SSHUFU_version;
			app.getRootAppInstance().openDialog(appld, {width : 480, height : 600}, function(dialog){
				dialog.initValue = {"SrcTitle":srcTitle,"Title":result[0]};				
				//dialog.bind("headerTitle").toLanguage("Str_ImportContentSetting");
				dialog.modal = true;		
			}).then(function(returnValue){
								
				var contentMap = new Map();
				for( var idx = 0; idx < returnValue.length; idx++){
					contentMap.set( returnValue[idx]["SourceName"], returnValue[idx]["ColumnName"] );
				}				
				var userUploadArray = new Array();
				var userUploadList = app.lookup("UserUploadList");						
				workbook.SheetNames.forEach(function(item, index, array) {
					var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
										
					for( var idx = 0; idx < json.length; idx++){
						var userUploadInfo = [];
						
						srcTitle.forEach(function(item, index){
							var columnName = contentMap.get(item);
							if( columnName != "" && columnName != undefined ){
								var value = { item : json[idx][columnName]};
 								userUploadInfo[srcColumn[index]]=json[idx][columnName]; // srcColumn-항목별로 언어를 적용한 상태이므로 원본 칼럼을 찾아와 적용
							}
						});					
						userUploadInfo[srcColumn[6]] = 0; // 기본값		
						userUploadArray.push(userUploadInfo);			
					}
				});
				userUploadList.build(userUploadArray);
				console.log(userUploadList.getRowDataRanged());
				
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
    }//end. for	
}

function onSSHUFU_btnBatchRegistClick(/* cpr.events.CMouseEvent */ e){
	var grdUserUploadList = app.lookup("SSHUFU_grdUserUploadList");
	var chkIndices = grdUserUploadList.getCheckRowIndices();
	var count = chkIndices.length;
	if (count == 0) {
		dialogAlert(app, "Waning", "체크된 항목이 없습니다.");
		return;
    }
    
    // 모든 기록이 넘어가는 것이 아니다.
	
	// 전송할 리스트 작성 (index, )
	dialogConfirm(app.getRootAppInstance(), "", "사용자 일괄등록을 진행 하시겠습니까?", function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {

				comLib.showLoadMask("pro","식수 사용자 일괄등록","",chkIndices.length);

				var uploadList = app.lookup("dsUploadList");
				uploadList.clear();

				for( var i = 0; i < count; i++){
					var uploadIndex = chkIndices[i];
					var checkedData = grdUserUploadList.getRow(uploadIndex);
					var result = checkedData.getValue("Result");
					if ( result == 1 || result == 3 || result == 4 || result == 5 ) {//대상아님
						//grdUserUploadList.setCheckRowIndex(uploadIndex, false);
						continue; //체크 해제
					}
					var uploadInfo = {"rowIndex":uploadIndex,"Result":grdUserUploadList.getRow(uploadIndex).getValue("Result")};
					uploadList.addRowData(uploadInfo);
				}
				//console.log(uploadList.getRowDataRanged());
				sendUserUpload();

			} else {}
		});
	});
}

	
function sendUserUpload() {
	var uploadList = app.lookup("dsUploadList");
	if( uploadList.getRowCount() == 0 ){
		comLib.hideLoadMask();
		dataManager = getDataManager();
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserNotSelected"));
		return;
	}
	var accessGroupList = dataManager.getAccessGroup();
	var groupList = dataManager.getGroup();	
	var mealList = dataManager.getMealList();
	
	//1 해당 로우 데이터 가져와엇 info에 한건씩넣기
	var dsUpInfo = uploadList.getRow(0);
	var rowIndex = dsUpInfo.getValue("rowIndex");
	
	var dsUserUploadRow = app.lookup("SSHUFU_grdUserUploadList").getRow(rowIndex);
	var UniqueID = dsUserUploadRow.getValue("UniqueID");
	var Name = dsUserUploadRow.getValue("Name");
	var msg = "사원번호 : " + UniqueID + "이름 :" + Name;
	comLib.updateLoadMask(msg);
	
	var userUploadInfo = app.lookup("UserUploadInfo");
	userUploadInfo.clear();
	var groupCode = app.lookup("SSHUFU_cmbGroupSet").value;
	var accessGroupCode = app.lookup("SSHUFU_cmbAccessGroupSet").value;
	var mealCode = app.lookup("SSHUFU_cmbMealSet").value;
	
	userUploadInfo.setValue("UniqueID", UniqueID);
	userUploadInfo.setValue("Name", Name);
	userUploadInfo.setValue("GroupCode", groupCode);
	userUploadInfo.setValue("AccessGroupCode", accessGroupCode);
	userUploadInfo.setValue("MealCode", mealCode);
	var Birthday = dsUserUploadRow.getValue("Birthday");
	userUploadInfo.setValue("Birthday", Birthday);
	
	var tmpBalance = dsUserUploadRow.getValue("Balance");
	if (dsUserUploadRow.getValue("Balance") == "") { 
		userUploadInfo.setValue("Balance", 0);
	} else {
		userUploadInfo.setValue("Balance", parseInt(tmpBalance));
	}
	 
	userUploadInfo.setValue("CardNum", dsUserUploadRow.getValue("CardNum"));
	var smsPostPrepaymentUpload = app.lookup("sms_postUserInfoUpload");
	smsPostPrepaymentUpload.send();
}
	 

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postUserInfoUploadSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postUserInfoUpload = e.control;
	var dsUploadList = app.lookup("dsUploadList");
	var rowIndex = dsUploadList.getValue(0, "rowIndex"); 
	dsUploadList.realDeleteRow(0); // 삭제
	var grdUserUploadList = app.lookup("SSHUFU_grdUserUploadList");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		grdUserUploadList.setCellValue(rowIndex, "Result", 1); 
		sendUserUpload();
	} else {
		if (resultCode == ErrorReDuplicateUniqueId) {// 사번중복
			grdUserUploadList.setCellValue(rowIndex, "Result", 4);
			sendUserUpload();
		} if (resultCode == ErrorUserRfCardDuplicate) { // 카드번호 중복
			grdUserUploadList.setCellValue(rowIndex, "Result", 5);
			sendUserUpload();
		}else {
			comLib.hideLoadMask();
			dataManager = getDataManager();
			dialogAlert(app, dataManager.getString("Str_Failed"),"파일 업로드 실패. 문서 파일을 다시 확인해 주세요");
		}
	}
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_postUserInfoUploadSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_postUserInfoUploadSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
