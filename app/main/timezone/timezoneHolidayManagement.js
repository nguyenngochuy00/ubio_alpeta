/************************************************
 * timezoneHolidayManagement.js
 * Created at 2019. 1. 9. 오후 3:32:30.
 *
 * @author joymrk!!!!!
 ************************************************/
var comUtil = createComUtil(app);
var TMHDM_isOk  = false;
var dataManager = getDataManager();
var dateLib = cpr.core.Module.require("lib/DateLib");

var arrCalControl = ["TMHDM_Jan", "TMHDM_Feb", "TMHDM_Mar", "TMHDM_Apr", "TMHDM_May", "TMHDM_Jun", 
    					 "TMHDM_Jul", "TMHDM_Aug", "TMHDM_Sep", "TMHDM_Oct", "TMHDM_Nov", "TMHDM_Dec"];

var srcColumn;
var srcTitle;
var usint_version;
var rABS = true; // T : 바이너리, F : 어레이 버퍼

function InitCalendars() {
    var year = new Date().getFullYear();	// 년도
}

/*
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	InitCalendars();
	usint_version = dataManager.getSystemVersion();
	app.lookup("sms_getHolidayList").send();
	comUtil.showLoadMask("", dataManager.getString("Str_GetHolidayList"), "", 0);	
	app.lookup("ipb1").enabled=false;
	app.lookup("ipb2").enabled=false;
	
	if (dataManager.getOemVersion() == OEM_HYUNDAI_HI) {
		app.lookup("my_file_input").visible = true;	// 버튼 보이게
		srcColumn = new Array();
		srcTitle = new Array();
		srcColumn = ["일자","요일","구분"];
		srcTitle = ["일자","요일","구분"];
	}
}
//------------------------------------------------------------------------------------------------------> get HolidayList
function onSms_getHolidayListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comUtil.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		app.lookup("TMHDM_grpMain").redraw(); 	
	} else {
		dialogAlert(app,dataManager.getString("Str_Failed"), dataManager.getString("Str_GetHolidayList"));
	}
}

function onSms_getHolidayListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getHolidayListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
//------------------------------------------------------------------------------------------------------< end get HolidayList
//------------------------------------------------------------------------------------------------------> Add grdholidayList

function onTMHDM_btnRegistClick(/* cpr.events.CMouseEvent */ e){
	//
	//checkGrdHolidayList(); //원래 있던 소스
	//TMHDM_isOk = true;
	var isUpdated = comUtil.isUpdated("HolidayList");
	
	if(TMHDM_isOk == false && isUpdated == false){
		TMHDM_isOk = true;
	}
	
	var holidayList = app.lookup("HolidayList");
	var max = holidayList.getMax("HolidayID"); // 
	
	var cal = app.lookup("TMHDM_udcCalendar");
	cal.clearCalendar();
	var holidays = cal.getDates();
	var grdHolidayList = app.lookup("TMHDM_grdHolidayList");
	grdHolidayList.insertRowData(grdHolidayList.getRowCount(), true, {"HolidayID":max==null?1:parseInt(max)+1, "Name": "New Holiday", "RepeatYear": 0, "Holidays": ""});
	grdHolidayList.setEditRowIndex(grdHolidayList.getRowCount()-1); //별도 다이얼로그 없이 그리드에서 이름 등록
	grdHolidayList.selectRows(grdHolidayList.getRowCount()-1);

	grdHolidayList.setRowState(grdHolidayList.getRowCount(), cpr.data.tabledata.RowState.UNCHANGED);
	if(grdHolidayList.getRowCount()==0){
	//	setCalender();
	}
	TMHDM_isOk = false;
	
	//var row = grdHolidayList.getSelectedRow();
	//var holidayInfo = app.lookup("HolidayInfo");
	//holidayInfo.clear();
	//holidayInfo.setValue("HolidayID", row.getValue("HolidayID"));
	//holidayInfo.setValue("Name", row.getValue("Name"));
	////holidayInfo.setValue("RepeatYear", row.getValue("RepeatYear"));
	//holidayInfo.setValue("Holidays", row.getValue("Holidays"));
	app.lookup("TMHDM_grpBasicInfo").redraw();
}
//------------------------------------------------------------------------------------------------------< Add grdholidayList
//------------------------------------------------------------------------------------------------------> SelChange holidayList
function onTMHDM_grdHolidayListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	app.lookup("ipb1").enabled=true;
	app.lookup("ipb2").enabled=true;
	
	
	//신규추가 시작
	var leftGrdHolidayList = app.lookup("TMHDM_grdHolidayList");
	var rowIndex = leftGrdHolidayList.getSelectedRowIndex();
	var rowCount = leftGrdHolidayList.getRowCount();
	var isUpdated = comUtil.isUpdated("HolidayList");
	//console.log(rowIndex,rowCount);
	//console.log("rowIndex-1 : ",leftGrdHolidayList.getRowState(rowIndex-1));
	//console.log("rowIndex : ",leftGrdHolidayList.getRowState(rowIndex));
	//2개 이상 추가 한 상태에서 새로 추가한 후 다른 휴일 클릭 시 경고창 -> 취소 버튼 누르면 접근
	if(TMHDM_isOk == false && isUpdated == true && rowIndex == rowCount-1 && leftGrdHolidayList.getRowState(rowIndex-1) == 1){
		//console.log("111");
		return;
	}
	
	//1개만 저장한 상태에서 추가 후 저장 안하고 첫번째 로우 클릭했을시 경고창 -> 취소 버튼 클릭시 접근 
	if(TMHDM_isOk == false && isUpdated == true && rowIndex == rowCount-2 && leftGrdHolidayList.getRowState(rowIndex) == 2){
		//console.log("222");
		var grd = app.lookup("TMHDM_grdHolidayList");
		grd.deleteRow(grd.getSelectedRow().getIndex()+1);
		return;
	}
	/*
	//새롭게 추가하고 저장하지 않은 상태에서 새로운 휴일을 추가하면 경고창 -> 취소하면 접근
	if(TMHDM_isOk == false && isUpdated == true && rowIndex == rowCount-2 && leftGrdHolidayList.getRowState(rowIndex-1) == 1 && leftGrdHolidayList.getRowState(rowIndex) == 2){
		console.log("333");
		var grd = app.lookup("TMHDM_grdHolidayList");
		grd.deleteRow(grd.getSelectedRow().getIndex()+1);
		return;
	}
	*/ 
	//신규 추가 끝
	
	
	checkGrdHolidayList(e);
	if(!TMHDM_isOk) {
		return;
	}
	var tMHDM_grdHolidayList = e.control;
	var row = tMHDM_grdHolidayList.getSelectedRow();
	var holidayInfo = app.lookup("HolidayInfo");
	holidayInfo.clear();
	
	
	holidayInfo.setValue("HolidayID", row.getValue("HolidayID"));
	holidayInfo.setValue("Name", row.getValue("Name"));
	holidayInfo.setValue("RepeatYear", row.getValue("RepeatYear"));
	holidayInfo.setValue("Holidays", row.getValue("Holidays"));
	
	app.lookup("TMHDM_grpBasicInfo").redraw();
	
	var cal = app.lookup("TMHDM_udcCalendar");
	var days = "";
	days = holidayInfo.getValue("Holidays");

	cal.clearCalendar();
	if(days.length>0){
		cal.setDates(days);
	}
	
}
//------------------------------------------------------------------------------------------------------< SelChange holidayList
//저장 ---------------------------------------------------------------------------------------------------> Save holidayInfo
function onTMHDM_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	
	var grdHolidayList = app.lookup("TMHDM_grdHolidayList");
	
	var rowIndex = grdHolidayList.getSelectedRowIndex();
	if(rowIndex==null || rowIndex=="-1"){
		dialogAlert(app, "", dataManager.getString("Str_NoSelection"), "");
		return;
	}
	
	dialogConfirm(app, "", dataManager.getString("Str_SaveConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				SaveHolidayInfo();
			} else {
				return;
			}
		});
	});
}

function SaveHolidayInfo() {	
	var cal = app.lookup("TMHDM_udcCalendar"); 
	var holidays =cal.getDates(); // 공휴일 정보 가져오기
	
	if(holidays.length < 1){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(ErrorTimezoneNotExistHoliday)));
		return;
	}
	
	var holidayInfo = app.lookup("HolidayInfo");
	holidayInfo.setValue("Holidays", holidays);
	
	if (dataManager.getOemVersion() == OEM_HYUNDAI_HI) {
		var nowYear = new Date().getFullYear();
		holidayInfo.setValue("RepeatYear", nowYear);	// 현대중공업 등록 연도로 사용
	}
	
	var grd = app.lookup("TMHDM_grdHolidayList");
	var row = grd.getSelectedRow();
	row.setRowData(holidayInfo.getDatas());
	grd.setRowState(row.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
	var smsSaveHoliday = app.lookup("sms_saveHoliday");
	smsSaveHoliday.send();
	comUtil.showLoadMask("", dataManager.getString("Str_SaveHolidayList"), "", 0);
}

function onSms_saveHolidaySubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comUtil.hideLoadMask();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if(resultCode == COMERROR_NONE) {
		//refresh
		var cal = app.lookup("TMHDM_udcCalendar");
		var days = app.lookup("HolidayInfo").getValue("Holidays");
		cal.clearCalendar();
		cal.setDates(days);
		app.lookup("TMHDM_grpMain").redraw();
		
		var target = getTargetbyBrandType();
		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {
				"target": target,	
				"command": "HolidayUpdate",
				"id": app.lookup("HolidayInfo").getValue("HolidayID"), 
			}
		});
	
		app.getHostAppInstance().dispatchEvent(commandEvent);
		//app.close();
	
	} else {
		//에라코드 
		var errStr = getErrorString(resultCode);
		var errMsg = dataManager.getString("Str_SaveHolidayList") + " " + errStr;
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}

function getTargetbyBrandType() {
	var brandType = dataManager.getSystemBrandType();
	var target;
	if (brandType == BRAND_VRIDI) {
		target = DLG_TIMELINE_WEEKENDV;
	} else if (brandType == BRAND_NITGEN) {
		target = DLG_TIMELINE_WEEKENDN;
	}
	
	return target;
}

function onSms_saveHolidaySubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_saveHolidaySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

//------------------------------------------------------------------------------------------------------> End Save holidayInfo
//------------------------------------------------------------------------------------------------------< Delete holidayInfo
function onTMHDM_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	//checkGrdHolidayList();
	var leftGrdHolidayList = app.lookup("TMHDM_grdHolidayList");
	var rowIndex = leftGrdHolidayList.getSelectedRowIndex();
	if (rowIndex == null || rowIndex == -1) {
		dialogAlert(app, "", dataManager.getString("Str_NoSelection"), "");
		return;
	} 
	
	if(!TMHDM_isOk){
		var isUpdated = comUtil.isUpdated("HolidayList");
		if (isUpdated == true) {
			dialogConfirm(app, "", dataManager.getString("Str_NoSavedRow"), function(/*cpr.controls.Dialog*/dialog){
				dialog.addEventListenerOnce("close", function(e) {
					if (dialog.returnValue) {
						
						leftGrdHolidayList.deleteRow(rowIndex);
						return;
					} 
				});
			});
			
		} else {
			TMHDM_isOk = true;
		}
	}
	
	if(!TMHDM_isOk) {
		return;
	}
	
	
	dialogConfirm(app, "", dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var rowID = app.lookup("TMHDM_grdHolidayList").getRow(rowIndex).getValue("HolidayID");
				var smsDeleteHoliday = app.lookup("sms_deleteHoliday");
				
				smsDeleteHoliday.action = "/v1/timezones/holidays/" + rowID;
				smsDeleteHoliday.send();				
			} else {
				return;
			}
		});
	});
}

function onSms_deleteHolidaySubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		// 캘린더 초기화
		var cal = app.lookup("TMHDM_udcCalendar");
		cal.clearCalendar();
		var holidayInfo = app.lookup("HolidayInfo");
		holidayInfo.clear();
		
		var grd = app.lookup("TMHDM_grdHolidayList");
		grd.deleteRow(grd.getSelectedRow().getIndex());
		grd.setRowState(grd.getRowCount(), cpr.data.tabledata.RowState.UNCHANGED);
		grd.commitData();
		grd.redraw();
		
		var target = getTargetbyBrandType();
		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {
				"target": target,	
				"command": "HolidayUpdate",
				"id": app.lookup("HolidayInfo").getValue("HolidayID"), 
			}
		});
		app.getHostAppInstance().dispatchEvent(commandEvent);
		
	} else {
		//에라코드 
		var errStr = getErrorString(resultCode);
		var errMsg = dataManager.getString("Str_DeleteHolidayList") + " " + errStr;
		dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
	}
}

function onSms_deleteHolidaySubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_deleteHolidaySubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

//------------------------------------------------------------------------------------------------------> End Delete holidayInfo
//------------------------------------------------------------------------------------------------------< Test Function
function RefreshHolidayInfo() {
	var grpMain = app.lookup("TMHDM_grpMain");
	var holidayInfo = app.lookup("HolidayInfo");
	
	// Holidays 값을 int 배열로 변환
	var strHolidays = "";	
	strHolidays = holidayInfo.getValue("Holidays"); 
	var holVals = strHolidays.split(",").map(function(item){
		return parseInt(item, 10);		
	});
	// 월별 구분 로직에서 마지막 데이터는 처리가 안되는 이유로 처리되지 않는 임시값을 넣어줌
	holVals.push(9999);
	
	// sort
	holVals.sort(function(a,b) {
	 return a - b;
	});
	
	// 월별로 구분하여 string(csv)으로 변환
	var tempArr = []
	var beforeVal = 0;
	
	holVals.forEach(function(/* Number */ each){
		var month = parseInt(each / 100);
		
		if (beforeVal != 0 && beforeVal != month) {
			var calControl = GetCalControl(beforeVal)
			calControl.value = tempArr.join(",");
			
			tempArr = [];
		}
		beforeVal = month;		
		tempArr.push(zeroPad(each, 4));
	});
	
	
	
	grpMain.redraw();
}
function zeroPad(n, width){
	n = n + '';
  	return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function GetCalControl(month) {
    
	var retCal = app.lookup(arrCalControl[month-1]);     					 
	
	return retCal;
}

/*
 * "test" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	// 각 calendar 초기화
	for (var i=0; i<12; i++) {
		var cal = app.lookup(arrCalControl[i]);
		cal.values = []
	}
	
	var holidayInfo = app.lookup("HolidayInfo");
	holidayInfo.setValue("HolidayID", 1);
	holidayInfo.setValue("Name", "holiday01");
	holidayInfo.setValue("RepeatYear", 0);
	holidayInfo.setValue("Holidays", "0101,0202,0303,1213,0509,0505,0606,0607,0707,0709,0808,0621,0909,1010,1111,1212");
	
	RefreshHolidayInfo();
}
//------------------------------------------------------------------------------------------------------> end Test Function

/*
 * 캘린더에서 value-change 이벤트 발생 시 호출.
 * Calendar의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onTMHDM_JanValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.Calendar
	 */
	var tMHDM_Jan = e.control;
}

function checkGrdHolidayList(/* cpr.events.CSelectionEvent */ ev){
	var leftGrdHolidayList = app.lookup("TMHDM_grdHolidayList");
	var isUpdated = comUtil.isUpdated("HolidayList");

	
	if(!TMHDM_isOk){
		var isUpdated = comUtil.isUpdated("HolidayList");
		if (isUpdated == true) {
			dialogConfirm(app, "", dataManager.getString("Str_NoSavedRow"), function(/*cpr.controls.Dialog*/dialog){
				dialog.addEventListenerOnce("close", function(e) {
					if (dialog.returnValue) {
						if(ev){
							console.log(ev.type);
							leftGrdHolidayList.deleteRow(ev.oldSelection[0]);
						}
						return;
					} else {
						if(ev){
							ev.stopPropagation();
							leftGrdHolidayList.setEditRowIndex(ev.oldSelection[0]);
							leftGrdHolidayList.selectRows(ev.oldSelection[0],false);
						}
						return;
					}
				});
			});
			
		} else {
			TMHDM_isOk = true;
		}
	}
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSMAG_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var uSMAG_imgHelpPage = e.control;
	// 도움말 페이지 클릭

	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);

}


/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onMy_file_inputValueChange(/* cpr.events.CValueChangeEvent */ e){
	
	var leftGrdHolidayList = app.lookup("TMHDM_grdHolidayList");
	var rowIndex = leftGrdHolidayList.getSelectedRowIndex();
	var rowCount = leftGrdHolidayList.getRowCount();
	var isUpdated = comUtil.isUpdated("HolidayList");

	//2개 이상 추가 한 상태에서 새로 추가한 후 다른 휴일 클릭 시 경고창 -> 취소 버튼 누르면 접근
	if(TMHDM_isOk == false && isUpdated == true && rowIndex == rowCount-1 && leftGrdHolidayList.getRowState(rowIndex-1) == 1){
		dialogAlert(app, dataManager.getString("Str_Fail"), "삭제 후 다시 등록 바랍니다.");
		return;
	}
	
	//1개만 저장한 상태에서 추가 후 저장 안하고 첫번째 로우 클릭했을시 경고창 -> 취소 버튼 클릭시 접근 
	if(TMHDM_isOk == false && isUpdated == true && rowIndex == rowCount-2 && leftGrdHolidayList.getRowState(rowIndex) == 2){
//		console.log("222");
		var grd = app.lookup("TMHDM_grdHolidayList");
		grd.deleteRow(grd.getSelectedRow().getIndex()+1);
		return;
	}

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
	
	var dsholidayInfo = app.lookup("dsHolidayListImportTempHDHI");
	dsholidayInfo.clear();
	
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
				var holidayList = new Array();
				var dsholidayInfo = app.lookup("dsHolidayListImportTempHDHI");
				workbook.SheetNames.forEach(function(item, index, array) {
					var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
					
					for (var idx = 0; idx < json.length; idx++) {
						var holidayInfo = [];
						srcTitle.forEach(function(item, index) {
							var columnName = contentMap.get(item);
							if (columnName != "" && columnName != undefined) {
								var value = {
									item: json[idx][columnName]
								};
								holidayInfo[item] = json[idx][columnName]; // srcColumn-항목별로 언어를 적용한 상태이므로 원본 칼럼을 찾아와 적용
							}
						});
						holidayList.push(holidayInfo);
					}
				});
				
				for (var i = 0; i < holidayList.length; i++) {
					var row = dsholidayInfo.addRow();
					
					row.setValue("Date", holidayList[i]["일자"]);
					row.setValue("DayofWeek", holidayList[i]["요일"]);
					row.setValue("Type", holidayList[i]["구분"]);
				}
				
//				console.log(dsholidayInfo.getRowDataRanged());
				
				showCalendarFromExcel();
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

// 어레이 버퍼를 처리한다 ( 오직 readAsArrayBuffer 데이터만 가능하다 )
function fixdata(data) {
	var o = "",
		l = 0,
		w = 10240;
	for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
	o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
	return o;
}

function showCalendarFromExcel() {
	var isUpdated = comUtil.isUpdated("HolidayList");
	
	if(TMHDM_isOk == false && isUpdated == false){
		TMHDM_isOk = true;
	}
	
	var holidayList = app.lookup("HolidayList");
	var max = holidayList.getMax("HolidayID"); // 
	
	var cal = app.lookup("TMHDM_udcCalendar");
	cal.clearCalendar();
	var holidays = cal.getDates();

		
	var strHolidays = "";
	var dsExcelInfo = app.lookup("dsHolidayListImportTempHDHI");
	
	for (var i=0; i<dsExcelInfo.getRowCount(); i++) {
		var row = dsExcelInfo.getRow(i);
		var holiType = row.getValue("Type");
		if (holiType == "휴일") {
			var holiDate = row.getValue("Date");
			if (isValidDateHDHI(holiDate)) {
				strHolidays += holiDate;
				if (i !== dsExcelInfo.getRowCount() - 1) {
			        strHolidays += ",";
			    }
			}
		}
		
	}

	var grdHolidayList = app.lookup("TMHDM_grdHolidayList");
	grdHolidayList.insertRowData(grdHolidayList.getRowCount(), true, {"HolidayID":max==null?1:parseInt(max)+1, "Name": "New Holiday", "RepeatYear": 0, "Holidays": strHolidays});
	grdHolidayList.setEditRowIndex(grdHolidayList.getRowCount()-1); //별도 다이얼로그 없이 그리드에서 이름 등록
	grdHolidayList.selectRows(grdHolidayList.getRowCount()-1);

	grdHolidayList.setRowState(grdHolidayList.getRowCount(), cpr.data.tabledata.RowState.UNCHANGED);
	if(grdHolidayList.getRowCount()==0){
	//	setCalender();
	}
	TMHDM_isOk = false;

	app.lookup("TMHDM_grpBasicInfo").redraw();

}

function isValidDateHDHI(str) {
	 // 4자리 숫자로 이루어져 있는지 확인
    if (!/^\d{4}$/.test(str)) {
        return false;
    }

    // 월과 일을 추출
    var month = parseInt(str.substring(0, 2));
    var day = parseInt(str.substring(2, 4));

    // 월이 1~12 사이에 있는지 확인
    if (month < 1 || month > 12) {
        return false;
    }

    // 일이 유효한 범위에 있는지 확인
    var daysInMonth = new Date(2022, month, 0).getDate(); // 해당 월의 일수 구하기
    if (day < 1 || day > daysInMonth) {
        return false;
    }

    // 모든 조건을 통과하면 유효한 날짜임
    return true;
}


