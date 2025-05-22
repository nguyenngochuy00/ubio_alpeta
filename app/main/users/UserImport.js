/************************************************
 * userImport.js
 * Created at 2018. 10. 16. 오후 1:40:12.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var usint_version;
var oemVersion;
var rABS = true; // T : 바이너리, F : 어레이 버퍼

var curImportIndex = 0; // 현재 보낸 유저 인덱스 

var srcColumn;
var srcTitle;
function onBodyLoad( /* cpr.events.CEvent */ e) {
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	oemVersion = dataManager.getOemVersion();
	
	srcColumn = new Array();
	srcTitle = new Array();
	
	var grdUserImportList = app.lookup("USIMP_grdUserImportList");
	
	for (var i = 0; i < grdUserImportList.getColumnWidths().length; i++) {
		srcColumn[i] = grdUserImportList.header.getColumn(i).text;
		srcTitle[i] = grdUserImportList.header.getColumn(i).text;
	}
	
	var accessGroupList = dataManager.getAccessGroup();
	accessGroupList.setSort("Name");
	var cmbAccessGroup2 = app.lookup("USIMP_cmbAccessGroup2");
	cmbAccessGroup2.setItemSet(accessGroupList, {
		label: "Name",
		value: "ID",
	});
	
	// OEM_MULTI_BUILDING_MAMAGEMENT 건물 이름 컬럼 추가
	if(oemVersion == OEM_MULTI_BUILDING_MAMAGEMENT){
		app.lookup("sms_getElevatorSetList").send();
	}
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 어레이 버퍼를 처리한다 ( 오직 readAsArrayBuffer 데이터만 가능하다 )
function fixdata(data) {
	var o = "",
		l = 0,
		w = 10240;
	for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
	o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
	return o;
}

// 데이터를 바이너리 스트링으로 얻는다.
function getConvertDataToBin($data) {
	var arraybuffer = $data;
	var data = new Uint8Array(arraybuffer);
	var arr = new Array();
	for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
	var bstr = arr.join("");
	
	return bstr;
}

// 파일 인풋에서 value-change 이벤트 발생 시 호출.
function onMy_file_inputValueChange( /* cpr.events.CValueChangeEvent */ e) {
	var fileType = e.control.file.name.split('.');
	/* 지원 타입 */
	var fileTypeArr = ['XLSX', 'XLSM' ,'XLSB','XLTX','XLTM','XLT','XLS','XML','XLAM','XLA','XLW','XLR'];
	var count = 0;
	for (var type of fileTypeArr) {
		if(type == fileType[fileType.length - 1].toUpperCase()){
			count++;
		}
	}
	if (!count) {
		/* 지원하지 않는 파일 확장자 입니다. */
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorUnsupportedFileExtention"));
		return;
	}
	
	var dsUserInfo = app.lookup("dsUserImportDataTemp");
	dsUserInfo.clear();
	
	/** @type cpr.controls.FileInput	 */
	var my_file_input = e.control;
	var files = my_file_input.files;
	
	var i, f;
	for (i = 0; i != files.length; ++i) {
		f = files[i];
		
		var reader = new FileReader();
		var name = f.name;
		
		reader.onload = function(e) {
			var data = e.target.result;
			
			var workbook;
			
			if (rABS) {
				/* if binary string, read with type 'binary' */
				workbook = XLSX.read(data, {
					type: 'binary'
				});
			} else {
				/* if array buffer, convert to base64 */
				var arr = fixdata(data);
				workbook = XLSX.read(btoa(arr), {
					type: 'base64'
				});
			}
			
			var first_sheet_name = workbook.SheetNames[0]; // 처음 시트의 명칭 얻기 			 	
			var worksheet1 = workbook.Sheets[first_sheet_name];
			var rangeLabel = worksheet1['!ref'].split(':');
			
			var result = [];
			var row;
			var rowNum;
			var colNum;
			var range = XLSX.utils.decode_range(worksheet1['!ref']);
			
			for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
				row = [];
				for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
					var nextCell = worksheet1[
						XLSX.utils.encode_cell({
							r: rowNum,
							c: colNum
						})
					];
					
					if (typeof nextCell === 'undefined') {
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
			app.getRootAppInstance().openDialog(appld, {
				width: 480,
				height: 600
			}, function(dialog) {
				dialog.initValue = {
					"SrcTitle": srcTitle,
					"Title": result[0]
				};
				dialog.bind("headerTitle").toLanguage("Str_ImportContentSetting");
				dialog.modal = true;
			}).then(function(returnValue) {
				var contentMap = new Map();
				for (var idx = 0; idx < returnValue.length; idx++) {
					contentMap.set(returnValue[idx]["SourceName"], returnValue[idx]["ColumnName"]);
				}
				var userList = new Array();
				var dsUserList = app.lookup("dsUserImportDataTemp");
				workbook.SheetNames.forEach(function(item, index, array) {
					var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
					
					for (var idx = 0; idx < json.length; idx++) {
						var userInfo = [];
						srcTitle.forEach(function(item, index) {
							var columnName = contentMap.get(item);
							if (columnName != "" && columnName != undefined) {
								var value = {
									item: json[idx][columnName]
								};
								userInfo[item] = json[idx][columnName]; // srcColumn-항목별로 언어를 적용한 상태이므로 원본 칼럼을 찾아와 적용
							}
						});
						userList.push(userInfo);
					}
				});
				
				for (var i = 0; i < userList.length; i++) {
					var row = dsUserList.addRow();
					
					row.setValue("ID", userList[i][dataManager.getString("Str_ID")]);
					row.setValue("UniqueID", userList[i][dataManager.getString("Str_UniqueID")]);
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
					row.setValue("CarType", userList[i][dataManager.getString("Str_CarType")]);
					row.setValue("CarColor", userList[i][dataManager.getString("Str_CarColor")]);
					row.setValue("CarBlackbox", userList[i][dataManager.getString("Str_CarBlackbox")]);
					if (oemVersion == OEM_MULTI_BUILDING_MAMAGEMENT){
						var dsElevatorSet = app.lookup("ElevatorSetList");
						for(var j = 0; j < dsElevatorSet.getRowCount(); j++){
							var buildingColumn = dsElevatorSet.getValue(j, "ElevatorSetName");
							var data = userList[i][buildingColumn] + "";
							if (data != null && data.length > 0 && data != "undefined"){
								row.setValue(buildingColumn, data.replace(/\s/gi, ''));								
							}
						}
					}
				}
//				console.log(dsUserList.getRowDataRanged());
			});
			
			/* 워크북 처리 */
			workbook.SheetNames.forEach(function(item, index, array) {
				
				var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[item]); // default : ","
				var csvToFS = XLSX.utils.sheet_to_csv(workbook.Sheets[item], {
					FS: "\t"
				}); // "Field Separator" delimiter between fields
				var csvToFSRS = XLSX.utils.sheet_to_csv(workbook.Sheets[item], {
					FS: ":",
					RS: "|"
				}); // "\n" "Record Separator" delimiter between rows
				
				// html
				var html = XLSX.utils.sheet_to_html(workbook.Sheets[item]);
				var htmlHF = XLSX.utils.sheet_to_html(workbook.Sheets[item], {
					header: "<html><title='custom'><body><table>",
					footer: "</table><body></html>"
				});
				var htmlTable = XLSX.utils.sheet_to_html(workbook.Sheets[item], {
					header: "<table border='1'>",
					footer: "</table>"
				});
				
				// json
				var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
				
				//formulae
				var formulae = XLSX.utils.sheet_to_formulae(workbook.Sheets[item]);
				formulae.filter(function(v, i) {
					return i % 13 === 0;
				});
			}); //end. forEach
		}; //end onload
		
		if (rABS) reader.readAsBinaryString(f);
		else reader.readAsArrayBuffer(f);
		
	} //end. for	
}

// 등록 버튼 클릭
function onUSIMP_btnBatchRegistClick( /* cpr.events.CMouseEvent */ e) {
	
	var dsUserImportDataTemp = app.lookup("dsUserImportDataTemp");
	var count = dsUserImportDataTemp.getRowCount();
	if (count <= 0) {
		return;
	}
	
	curImportIndex = 0; // 초기화를 해 놓읍시다
	
	var smsRequestData = app.lookup("sms_postUserDataImport");
	
	// 1개씩 보냅시다 
	var dsUserImportData = app.lookup("dsUserImportData");
	
	dsUserImportData.clear();
	
	var nPrivilegeID;
	var strPrivilegeName = dsUserImportDataTemp.getValue(curImportIndex, "Privilege");
	if (strPrivilegeName) {
		nPrivilegeID = 2; // 기본 사용자
		if (strPrivilegeName == "관리자" || strPrivilegeName == "Admin") {
			nPrivilegeID = 1;
		} else if (strPrivilegeName == "사용자" || strPrivilegeName == "User") {
			nPrivilegeID = 2;
		} else {
			var privilegeList = dataManager.getPrivilegeList();
			if (privilegeList) {
				var rowData = privilegeList.findFirstRow("Name == '" + strPrivilegeName + "'");
				if (rowData) {
					nPrivilegeID = rowData.getValue("privilegeID");
				}
			}
		}
	}
	
	dsUserImportData.addRowData(dsUserImportDataTemp.getRowData(curImportIndex));
	dsUserImportData.setValue(0, "Privilege", nPrivilegeID);
	dsUserImportData.commit();
	if (oemVersion == OEM_MULTI_BUILDING_MAMAGEMENT){
		var rowData = dsUserImportDataTemp.getRow(curImportIndex);
		var dsElevatorSet = app.lookup("ElevatorSetList");
		var dsUserBuildingElevator = app.lookup("UserBuildingElevatorSet");
		dsUserBuildingElevator.clear();
		for(var i = 0; i < dsElevatorSet.getRowCount(); i++){
			var row = dsElevatorSet.getRow(i);
			dsUserBuildingElevator.addRowData({
				"UserID": rowData.getValue("ID"),
				"BuildingCode": row.getValue("ElevatorSetID"),
				"AccessFloor": rowData.getValue(row.getValue("ElevatorSetName"))
			})		
		}
//		console.log(dsUserBuildingElevator.getRowDataRanged());
		dsUserBuildingElevator.commit();
	}

	app.lookup("UserImportResult").reset();
	app.lookup("UserImportResult").setValue("Total", dsUserImportDataTemp.getRowCount());
	smsRequestData.send();
	comLib.showLoadMask("", dataManager.getString("Str_UserImport"), "", 0);
}

// 사용자 등록 요청 완료
function onSms_postUserDataImportSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postUserDataImport = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var total = app.lookup("UserImportResult").getValue("Total");
	var fail = app.lookup("UserImportResult").getValue("Fail");
	var success = app.lookup("UserImportResult").getValue("Success");
	if (resultCode == COMERROR_NONE) {
		//success += 1;
		app.lookup("UserImportResult").setValue("Total", success);
		var dsUserImportDataTemp = app.lookup("dsUserImportDataTemp");
		
		var count = dsUserImportDataTemp.getRowCount();
		
		curImportIndex++; // 다음 인덱스를 보냅시다.
		
		if (count == curImportIndex) {
			comLib.hideLoadMask(); // 이미 다 보낸 것이라면 그만 합시다
			/*var msg = dataManager.getString("Str_Complete") + "\n" + 
				dataManager.getString("Str_All")+" : " + total + ", " + 
				dataManager.getString("Str_Success")+ " : "+ success + ", " +
				dataManager.getString("Str_Fail") + " : "+ fail;*/
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Complete"));
			return;
		}
		
		var smsRequestData = app.lookup("sms_postUserDataImport");
		
		// 1개씩 보냅시다 
		var dsUserImportData = app.lookup("dsUserImportData");
		dsUserImportData.clear();
		var strPrivilegeName = dsUserImportDataTemp.getValue(curImportIndex, "Privilege");
		
		var nPrivilegeID;
		var strPrivilegeName = dsUserImportDataTemp.getValue(curImportIndex, "Privilege");
		if (strPrivilegeName) {
			nPrivilegeID = 2; // 기본 사용자
			if (strPrivilegeName == "관리자" || strPrivilegeName == "Admin") {
				nPrivilegeID = 1;
			} else if (strPrivilegeName == "사용자" || strPrivilegeName == "User") {
				nPrivilegeID = 2;
			} else {
				var privilegeList = dataManager.getPrivilegeList();
				if (privilegeList) {
					var rowData = privilegeList.findFirstRow("Name == '" + strPrivilegeName + "'");
					if (rowData) {
						nPrivilegeID = rowData.getValue("privilegeID");
					}
				}
			}
		}
		
		dsUserImportData.addRowData(dsUserImportDataTemp.getRowData(curImportIndex));
		dsUserImportData.setValue(0, "Privilege", nPrivilegeID);
		dsUserImportData.commit();
		
		if (oemVersion == OEM_MULTI_BUILDING_MAMAGEMENT){
			var rowData = dsUserImportDataTemp.getRow(curImportIndex);
			var dsElevatorSet = app.lookup("ElevatorSetList");
			var dsUserBuildingElevator = app.lookup("UserBuildingElevatorSet");
			dsUserBuildingElevator.clear();
			for(var i = 0; i < dsElevatorSet.getRowCount(); i++){
				var row = dsElevatorSet.getRow(i);
				dsUserBuildingElevator.addRowData({
					"UserID": rowData.getValue("ID"),
					"BuildingCode": row.getValue("ElevatorSetID"),
					"AccessFloor": rowData.getValue(row.getValue("ElevatorSetName"))
				})		
			}
			console.log(dsUserBuildingElevator.getRowDataRanged());
			dsUserBuildingElevator.commit();
		}
		
		smsRequestData.send();
		
	} else {
		var dsUserImportDataTemp = app.lookup("dsUserImportDataTemp");
		var userInfo = dsUserImportDataTemp.getRow(curImportIndex);
		var userID = userInfo.getValue("ID");
		var userName = userInfo.getValue("Name");
		var msg = dataManager.getString(getErrorString(resultCode)) + "\n" +
			dataManager.getString("Str_UserID") + " : " + userID + "\n" +
			dataManager.getString("Str_UserName") + " : " + userName;
		
		fail += 1;
		app.lookup("UserImportResult").setValue("Fail", fail);
		comLib.hideLoadMask();
		
		dialogAlert(app, dataManager.getString("Str_Failed"), msg);
	}
}

// TAB2 데이터 파일 Import
function onUSIMP_fiImportFileValueChange( /* cpr.events.CValueChangeEvent */ e) {
	/** @type cpr.controls.FileInput	 */
	var fiImportFile = e.control;
	var files = fiImportFile.files;
	var fileSplit = e.control.file.name.split('.');
	var fileType = fileSplit[fileSplit.length-1].toLowerCase();

	if (fileType != "dat") {
		/* 지원하지 않는 파일 확장자 입니다. */
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorUnsupportedFileExtention"));	
		return;
	}
	
	var sms_postUserFileExport = app.lookup("sms_postUserFileExport");
	for (var i = 0; i != files.length; ++i) {
		sms_postUserFileExport.addFileParameter("userDataFile", files[i]);
	}
	sms_postUserFileExport.send();
}

// 도움말 클릭
function onUSIMP_btnHelpPageClick( /* cpr.events.CMouseEvent */ e) {
	var menu_id = app.getHostProperty("initValue")["programID"]; // mainManager.module.js ExecuteMenu <- 셋팅
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

function onSms_postUserFileExportSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsUserInfo = app.lookup("UserInfo");
		var count = dsUserInfo.getRowCount();
		app.lookup("USIMP_opbTotal2").value = count;
		for (var i = 0; i < count; i++) {
			var userInfo = dsUserInfo.getRow(i);
			var AuthType = userInfo.getValue("AuthInfo").split(',');
			
			var setCount = 0;
			var andAuth = "";
			for (var idx = 0; idx < AuthType[7]; idx++) {
				if (AuthType[idx] != "0") {
					andAuth += getAuthTypeString(parseInt(AuthType[idx], 10)) + " ";
					setCount++;
				}
			}
			var orAuth = "";
			for (var idx = AuthType[7]; idx < AuthType.length - 1; idx++) {
				if (AuthType[idx] != "0") {
					orAuth += getAuthTypeString(parseInt(AuthType[idx], 10)) + " ";
					setCount++;
				}
			}
			
			if (setCount > 1) {
				userInfo.setValue("AuthInfoStr", andAuth + "/ " + orAuth);
			} else {
				userInfo.setValue("AuthInfoStr", andAuth + orAuth);
			}
		}
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

var USIMP_fileImportIndexes;
var USIMP_fileImportOffset;
var USIMP_fileImportSuccessCount;
var USIMP_fileImportFailCount;
var USIMP_fileImportTotal;

function onButtonClick( /* cpr.events.CMouseEvent */ e) {
	USIMP_fileImportOffset = 0;
	USIMP_fileImportSuccessCount = 0;
	USIMP_fileImportFailCount = 0;
	//var dsUserInfo = app.lookup("UserInfo");
	//USIMP_fileImportTotal = dsUserInfo.getRowCount();
	
	var grdUserList = app.lookup("USIMP_grdUserList");
	USIMP_fileImportIndexes = grdUserList.getCheckRowIndices();
	USIMP_fileImportTotal = USIMP_fileImportIndexes.length;
	if (USIMP_fileImportTotal < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoSelectedUser"));
		return;
	}
	
	comLib.showLoadMask("pro", dataManager.getString("Str_UserRegist"), "", USIMP_fileImportTotal);
	processUserUpload();
}

function processUserUpload() {
	var msg = dataManager.getString("Str_User") + " (" + USIMP_fileImportOffset + "/" + USIMP_fileImportTotal + ")";
	comLib.updateLoadMask(msg);
	
	var dsUserInfo = app.lookup("UserInfo");
	//var userInfo = dsUserInfo.getRow(USIMP_fileImportOffset);
	var userInfo = dsUserInfo.getRow(USIMP_fileImportIndexes[USIMP_fileImportOffset]);
	var userID = userInfo.getValue("ID");
	
	var AuthType = userInfo.getValue("AuthInfo").split(',');
	var faceExist = false;
	var faceWTExist = false;
	for (var idx = 0; idx < 7 - 1; idx++) {
		var value = parseInt(AuthType[idx], 10);
		if (value == AuthTypeFace) {
			faceExist == true;
		} else if (value == AuthTypeFaceWT) {
			faceWTExist == true;
		}
	}
	
	var dmUserInfo = app.lookup("dmUserInfo");
	dmUserInfo.clear();
	dmUserInfo.build(userInfo.getRowData());
	dmUserInfo.setValue("Privilege", 2);
	dmUserInfo.setValue("GroupCode", 0);
	
	var pictureInfo = app.lookup("UserPictureInfo");
	var dsPhotoInfo = app.lookup("dsUserFPInfo");
	dsPhotoInfo.clear();
	for (var i = 0; i < pictureInfo.getRowCount(); i++) {
		var data = pictureInfo.getRow(i);
		var chkUserID = data.getValue("UserID");
		if (userID == chkUserID) {
			dsPhotoInfo.build({
				"Photo": data.getValue("ImageData")
			});
			break;
		}
	}
	
	var fpInfo = app.lookup("UserFPInfo");
	var dsFPInfo = app.lookup("dsUserFPInfo");
	dsFPInfo.clear();
	for (var i = 0; i < fpInfo.getRowCount(); i++) {
		var data = fpInfo.getRow(i);
		var chkUserID = data.getValue("UserID");
		if (userID == chkUserID) {
			dsFPInfo.addRowData(data.getRowData());
		}
	}
	
	var faceInfo = app.lookup("UserFaceInfo");
	var dsFaceInfo = app.lookup("dsUserFaceInfo");
	dsFaceInfo.clear();
	for (var i = 0; i < faceInfo.getRowCount(); i++) {
		var data = faceInfo.getRow(i);
		var chkUserID = data.getValue("UserID");
		if (userID == chkUserID) {
			dsFaceInfo.addRowData(data.getRowData());
		}
	}
	
	var cardInfo = app.lookup("UserCardInfo");
	var dsCardInfo = app.lookup("dsUserCardInfo");
	dsCardInfo.clear();
	for (var i = 0; i < cardInfo.getRowCount(); i++) {
		var data = cardInfo.getRow(i);
		var chkUserID = data.getValue("UserID");
		if (userID == chkUserID) {
			dsCardInfo.addRowData(data.getRowData());
		}
	}
	
	var faceWTInfo = app.lookup("UserFaceWTInfo");
	var dsFaceWTInfo = app.lookup("dsUserFaceWTInfo");
	dsFaceWTInfo.clear();
	for (var i = 0; i < faceWTInfo.getRowCount(); i++) {
		var data = faceWTInfo.getRow(i);
		var chkUserID = data.getValue("UserID");
		if (userID == chkUserID) {
			dsFaceWTInfo.addRowData(data.getRowData());
			if (faceWTExist == false) { // 인증수단에 FAW가 없는 경우
				var faceCount = dsFaceInfo.getRowCount();
				if (faceCount > 0) { // 얼굴 데이터가 있으면 빈곳에 인증수단 추가
					for (var idx = 0; idx < 7; idx++) {
						if (parseInt(AuthType[idx], 10) == 0) {
							AuthType[idx] = AuthTypeFaceWT
							break;
						}
					}
				} else { // 얼굴 데이터가 없는 경우 인증수단 FA를 FAW로 변경
					for (var idx = 0; idx < 7; idx++) {
						if (parseInt(AuthType[idx], 10) == AuthTypeFace) {
							AuthType[idx] = AuthTypeFaceWT
							break;
						}
					}
				}
				var strAuthType = "";
				var init = false;
				AuthType.forEach(function(authType) {
					if (init == false) {
						init = true
					} else {
						strAuthType += ","
					}
					strAuthType += authType
				});
				userInfo.setValue("AuthInfo", strAuthType);
			}
			
		}
	}
	
	var irisInfo = app.lookup("UserIrisInfo");
	var dsIrisInfo = app.lookup("dsUserIrisInfo");
	dsIrisInfo.clear();
	for (var i = 0; i < irisInfo.getRowCount(); i++) {
		var data = irisInfo.getRow(i);
		var chkUserID = data.getValue("UserID");
		if (userID == chkUserID) {
			dsIrisInfo.addRowData(data.getRowData());
		}
	}
	
	var submission = app.lookup("sms_postUserInfo");
	submission.send();
}

function onSms_postUserInfoSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var dsUserInfo = app.lookup("UserInfo");
	//var userInfo = dsUserInfo.getRow(USIMP_fileImportOffset)
	var userInfo = dsUserInfo.getRow(USIMP_fileImportIndexes[USIMP_fileImportOffset]);
	
	if (resultCode == COMERROR_NONE) {
		userInfo.setValue("Result", dataManager.getString("Str_Success"));
		USIMP_fileImportSuccessCount++;
		//dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Complete"));
	} else {
		userInfo.setValue("Result", dataManager.getString(getErrorString(resultCode)));
		
		var userID = userInfo.getValue("ID");
		var userName = userInfo.getValue("Name");
		var msg = dataManager.getString(getErrorString(resultCode)) + "\n" +
			dataManager.getString("Str_UserID") + " : " + userID + "\n" +
			dataManager.getString("Str_UserName") + " : " + userName;
			
		USIMP_fileImportFailCount++
		//dialogAlert(app, dataManager.getString("Str_Failed"), msg);
	}
	USIMP_fileImportOffset++;
	if (USIMP_fileImportOffset >= USIMP_fileImportTotal) {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Complete"),dataManager.getString("Str_Total") + " : " + USIMP_fileImportFailCount + "\n\n" +dataManager.getString("Str_Success")+ " : "+ USIMP_fileImportSuccessCount + "\n" +dataManager.getString("Str_Fail")+ " : "+USIMP_fileImportFailCount);
	} else {
		processUserUpload();
	}
}

/*
 * "FACE" 버튼에서 click 이벤트 발생 시 호출.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	var button = e.control;
	
	app.openDialog("app/main/users/UserFaceUpload", {width : 1000, height : 500}, function(dialog){
		dialog.ready(function(dialogApp){
			// 필요한 경우, 다이얼로그의 앱이 초기화 된 후, 앱 속성을 전달하십시오.
		});
	}).then(function(returnValue){
		;
	});	
}


function onSms_getElevatorSetListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	var value = result.getValue("ResultCode");
	
	if( result.getValue("ResultCode")== COMERROR_NONE) {	
		var dsImportTemp = app.lookup("dsUserImportDataTemp");
		var dsImport = app.lookup("dsUserImportData");
		var dsElevatorSet = app.lookup("ElevatorSetList");
		var grdUserImportList = app.lookup("USIMP_grdUserImportList");
		
		if (dsElevatorSet != null){
			for(var i = 0; i < dsElevatorSet.getRowCount(); i++){
				var row = dsElevatorSet.getRow(i);
				var buildingName = row.getValue("ElevatorSetName");
				dsImportTemp.addColumn(new cpr.data.header.DataHeader(buildingName, "string"));			
				var column = {
					"columnLayout": [{ width: "100px" }],
					"header": [{"rowIndex": 0, "colIndex": grdUserImportList.columnCount, "text": buildingName}],
					"detail": [{"rowIndex": 0, "colIndex": grdUserImportList.columnCount, "columnName": buildingName}]
				};
				// 그리드에 컬럼을 추가합니다.
				grdUserImportList.addColumn(column);
				
				srcColumn[srcColumn.length] = buildingName;
				srcTitle[srcTitle.length] = buildingName;
			}
		}
		grdUserImportList.redraw();
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
//	console.log(dsImportTemp.getColumnNames());
//	console.log(dsImport.getColumnNames());
//	console.log(srcColumn);
//	console.log(srcTitle);
}

function onSms_getElevatorSetListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_getElevatorSetListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}
