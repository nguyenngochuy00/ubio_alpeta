/************************************************
 * prepayFileUpload.js
 * Created at 2020. 8. 10. 오전 8:14:14.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var SSHFU_version;
var rABS = true; // T : 바이너리, F : 어레이 버퍼
 
var curImportIndex = 0; // 현재 보낸 유저 인덱스 


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	SSHFU_version = dataManager.getSystemVersion();
}

var srcColumn = [ "ChargeDate",	"UniqueID",	"Depositor", "Amount", "Mode", "Result"	];

/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onSSHFU_fileInputValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.FileInput
	 */
	var sshfu_files = e.control;
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
				"입금 일자",
				"사원번호",
				"입금자",
				"입금금액",
				"입금구분",
				"결과"
			];
			
   			var appld = "app/popup/ContentSelector" + "?" + SSHFU_version;
			app.getRootAppInstance().openDialog(appld, {width : 480, height : 600}, function(dialog){
				dialog.initValue = {"SrcTitle":srcTitle,"Title":result[0]};				
				//dialog.bind("headerTitle").toLanguage("Str_ImportContentSetting");
				dialog.modal = true;		
			}).then(function(returnValue){
								
				var contentMap = new Map();
				for( var idx = 0; idx < returnValue.length; idx++){
					contentMap.set( returnValue[idx]["SourceName"], returnValue[idx]["ColumnName"] );
				}				
				var prepayUploadArray = new Array();
				var prepayUploadList = app.lookup("PrepayUploadList");						
				workbook.SheetNames.forEach(function(item, index, array) {
					var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
										
					for( var idx = 0; idx < json.length; idx++){
						var prepayUploadInfo = [];
						
						srcTitle.forEach(function(item, index){
							var columnName = contentMap.get(item);
							if( columnName != "" && columnName != undefined ){
								var value = { item : json[idx][columnName]};
								prepayUploadInfo[srcColumn[index]]=json[idx][columnName]; // srcColumn-항목별로 언어를 적용한 상태이므로 원본 칼럼을 찾아와 적용
							}
						});					
						prepayUploadInfo[srcColumn[5]] = 0; // 기본값							
					//	console.log(prepayUploadInfo);
						prepayUploadArray.push(prepayUploadInfo);
					//	console.log(prepayUploadArray);						
					}
				});
				prepayUploadList.build(prepayUploadArray);
				//console.log(prepayUploadList.getRowDataRanged());
				
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

function onSSHFU_btnModifyClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sSHFU_btnModify = e.control;
	var accountInfo = dataManager.getAccountInfo(); //로그인 권한 가져오기
	
	var grdPrepayuploadList = app.lookup("SSHFU_grdPrepaymentList");
	var chkIndices = grdPrepayuploadList.getCheckRowIndices();
	var count = chkIndices.length;
	if (count == 0) {
		dialogAlert(app, "Waning", "체크 항목이 없습니다.");
		return;
    } else if (count > 1) {
    	dialogAlert(app, "Waning", "복수 항목이 체크 되어 있습니다. 변경 기능은 한건씩 진행해 주세요.");
    	return;
    }
    
    var prepayuploadList = app.lookup("PrepayUploadList");
    var prepayuploadInfo = prepayuploadList.getRow(chkIndices[0]);
    //1: 결제완료 0: '', 2: 결제실패
    var status = prepayuploadInfo.getValue("Result");
    if (status == undefined || status == 0 || status == 2) {
		var appld = "app/main/ssHospital/popup/prepayUploadInfo" + "?" + SSHFU_version; //경로 체크
		app.getRootAppInstance().openDialog(appld, {width : 350, height : 400}, function(dialog){
			
			dialog.ready(function(dialogApp){
				// 초기값 올려주기 //
				dialog.headerTitle = "xlsx 파일로 선불결제 정보 수정";
				dialog.initValue = {
					"prepayUploadInfo": prepayuploadInfo.getRowData()
				}
				dialog.modal = true;
			});
		}).then(function(returnValue){
		//	console.log(returnValue);
			if (returnValue != undefined) {
				prepayuploadList.updateRow(chkIndices[0], returnValue.getDatas());
			}
		});
    } else if(status == 1 ){ //결제 완료 수정불가
    	dialogAlert(app, "Waning", "결제 완료된 기록은 수정할 수 없습니다.");
    }
    
}

function onSSHFU_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sSHFU_btnDelete = e.control;
	// 저장 전에 삭제 하는 기능
	var accountInfo = dataManager.getAccountInfo(); //로그인 권한 가져오기
	
	var grdPrepayuploadList = app.lookup("SSHFU_grdPrepaymentList");
	var chkIndices = grdPrepayuploadList.getCheckRowIndices();
	
	var count = chkIndices.length;
	if (count == 0) {
		dialogAlert(app, "Waning", "체크 항목이 없습니다.");
		return;
    } 
    dialogConfirm(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				dialogConfirm(app.getRootAppInstance(), "파일업로드 삭제 재확인.", dataManager.getString("Str_DeleteConfirm"), function ( /*cpr.controls.Dialog*/ dialog){
					dialog.addEventListenerOnce("close", function (e){
						if (dialog.returnValue){
							for(var i = 0; i < count;) {
					
								var delIndex = chkIndices[i]; //0 번째 체크
								var preInfo = grdPrepayuploadList.getRow(delIndex);
								if (!preInfo) {
									dialogAlert(app, "삭제 처리를 다시 시도해 주세요");
									return;
								}
								if (preInfo.getValue("Result") == 1) { // 1: 성공이라서 삭제 안됨
									dialogAlert(app, "이미 결제 처리된 데이터가 있습니다. 해당 기록을 제외해 주세요");
									break;
								}
								grdPrepayuploadList.deleteRow(delIndex); 
								chkIndices = grdPrepayuploadList.getCheckRowIndices();	
								count = chkIndices.length;
							}
						} 						
					});
					
				});
				
				
			} else {}
		});
	});
}


/*
 * "업로드" 버튼(SSHFU_btnBatchRegist)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSSHFU_btnBatchRegistClick(/* cpr.events.CMouseEvent */ e){
	
	var grdPrepayuploadList = app.lookup("SSHFU_grdPrepaymentList");
	var chkIndices = grdPrepayuploadList.getCheckRowIndices();
	var count = chkIndices.length;
	if (count == 0) {
		dialogAlert(app, "Waning", "체크된 항목이 없습니다.");
		return;
    } 
	// 모든 기록이 넘어가는 것이 아니다.
	
	// 식대만 넘어간다. 한번 전송한 기록은 두번 안되도록 처리
	
	// 전송할 리스트 작성 (index, )
	
	dialogConfirm(app.getRootAppInstance(), "", "선불결제 처리 진행 하시겠습니까?", function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {

				comLib.showLoadMask("pro","선불 결제 처리 시작","",chkIndices.length);

				var uploadList = app.lookup("dsUploadList");
				uploadList.clear();

				for( var i = 0; i < count; i++){
					var uploadIndex = chkIndices[i];
					var checkedData = grdPrepayuploadList.getRow(uploadIndex);
					var result = checkedData.getValue("Result");
					var chargeDate = checkedData.getValue("ChargeDate");
					if (chargeDate.toString().length < 10) {
						comLib.hideLoadMask();
						dialogAlert(app, "Waning", "충전일자가 잘못되었습니다.");
						return;
					}
					if ( result == 1 || result == 3 || result == 4 || result == 5 ) {//대상아님
						//grdPrepayuploadList.setCheckRowIndex(uploadIndex, false);
						continue; //체크 해제
					}
					var mode = checkedData.getValue("Mode");
					/*if (mode != "식대") {
						grdPrepayuploadList.setCellValue(uploadIndex, "Result", 3);
						continue;
					}*/
				
					var uploadInfo = {"rowIndex":uploadIndex,"Result":grdPrepayuploadList.getRow(uploadIndex).getValue("Result")};
					uploadList.addRowData(uploadInfo);
				}
				console.log(uploadList.getRowDataRanged())
				sendPrepayUpload();

			} else {}
		});
	});
	
}

function sendPrepayUpload() {
	var uploadList = app.lookup("dsUploadList");
	if( uploadList.getRowCount() == 0 ){
		comLib.hideLoadMask();
		dataManager = getDataManager();
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserNotSelected"));
		return;
	}
	
	//1 해당 로우 데이터 가져와엇 info에 한건씩넣기
	var dsUpInfo = uploadList.getRow(0);
	var rowIndex = dsUpInfo.getValue("rowIndex");
	
	var dsPrePayUploadRow = app.lookup("SSHFU_grdPrepaymentList").getRow(rowIndex);
	var depositor = dsPrePayUploadRow.getValue("Depositor");
	var msg = "입금자 : " + depositor;
	comLib.updateLoadMask(msg);
	
	var prepayUploadInfo = app.lookup("prepayUploadInfo");
	prepayUploadInfo.clear();
	
	prepayUploadInfo.setValue("ChargeDate", dsPrePayUploadRow.getValue("ChargeDate"));
	prepayUploadInfo.setValue("UniqueID", dsPrePayUploadRow.getValue("UniqueID"));
	prepayUploadInfo.setValue("Depositor", dsPrePayUploadRow.getValue("Depositor"));
	prepayUploadInfo.setValue("Amount", dsPrePayUploadRow.getValue("Amount"));
	prepayUploadInfo.setValue("Mode", dsPrePayUploadRow.getValue("Mode")); //식대
	
	var smsPostPrepaymentUpload = app.lookup("sms_postPrepaymentUpload");
	smsPostPrepaymentUpload.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postPrepaymentUploadSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postPrepaymentUpload = e.control;
	var dsDeleteList = app.lookup("dsUploadList");
	var rowIndex = dsDeleteList.getValue(0, "rowIndex"); 
	dsDeleteList.realDeleteRow(0); // 삭제
	var grdPrepayUploadList = app.lookup("SSHFU_grdPrepaymentList");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		grdPrepayUploadList.setCellValue(rowIndex, "Result", 1); 
		sendPrepayUpload();
	} else {
		if (resultCode == ErrorUserNotExist) {// 사용자가 없는것 다음 사용자 전송 시도
			grdPrepayUploadList.setCellValue(rowIndex, "Result", 4);
			sendPrepayUpload();
		} else if (resultCode == ErrorSSHNotTargetUser ){
			grdPrepayUploadList.setCellValue(rowIndex, "Result", 3);
			sendPrepayUpload();
		} else if (resultCode == ErrorSSHIsExistData){
			grdPrepayUploadList.setCellValue(rowIndex, "Result", 5);
			sendPrepayUpload();
		} else {
			comLib.hideLoadMask();
			dataManager = getDataManager();
			dialogAlert(app, dataManager.getString("Str_Failed"),"파일 업로드 실패. 문서 파일을 다시 확인해 주세요");
		}
	}
}
	
function onSms_postPrepaymentUploadSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_postPrepaymentUploadSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSSHFU_FileLogSearchClick(/* cpr.events.CMouseEvent */ e){
	var sSHFU_FileLogSearch = e.control;
	var appld = "app/main/ssHospital/popup/fileuploaddataLog" + "?" + SSHFU_version; //경로 체크
	app.getRootAppInstance().openDialog(appld, {width : 920, height : 620}, function(dialog){
		
		dialog.ready(function(dialogApp){
			// 초기값 올려주기 //
			dialog.headerTitle = "충전금액 파일업로드 이력 조회";
			
			dialog.modal = true;
		});
	}).then(function(returnValue){
	
	});
}
