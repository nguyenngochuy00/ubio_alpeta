/************************************************
 * calender.js
 * Created at 2020. 8. 20. 오전 11:01:28.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var SSHDM_version;
var dateLib = cpr.core.Module.require("lib/DateLib");
var SSHDM_maxCount = 200;


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	// 1. 버전체크 
	comLib = createComUtil(app);
	dataManager = getDataManager();
	SSHDM_version = dataManager.getSystemVersion();
	// 2. 저장 정보 가져오기 
	// 일단 UI 동작 패스
	var cmbDataType = app.lookup("cmbMealDataType");
	cmbDataType.addItem(new cpr.controls.Item(dataManager.getString("Str_BreakFast"),1));
	cmbDataType.addItem(new cpr.controls.Item(dataManager.getString("Str_Lunch"),2));
	cmbDataType.addItem(new cpr.controls.Item(dataManager.getString("Str_Dinner"),3));
	cmbDataType.addItem(new cpr.controls.Item(dataManager.getString("Str_Snack"),4));
	cmbDataType.addItem(new cpr.controls.Item(dataManager.getString("Str_LateSnack"),5));
	comLib.showLoadMask("","무료 식수 일자 가져오기","",0);
	app.lookup("sms_getMealHolidayList").send();
}

function onSSHDM_calenderDblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Calendar
	 */
	var sSHDM_calender = e.control;
	
	var getDate = dateLib.makeDateFormat(sSHDM_calender.value, "-");
	console.log(getDate);
	var mealHolidayList = app.lookup("MealHolidayList");
	var count = mealHolidayList.getRowCount();
	if (count == SSHDM_maxCount) { // 추후 개선여지 있음
		var strMsg = "최대 등록 갯수는 200개 입니다. 더이상 무료일자를 추가 할수 없습니다.";
		app.lookup("SSHDM_opbMsg").value= strMsg;
		dialogAlert(app, dataManager.getString("Str_Info"),strMsg);
		return
	}
	if (count > 0) { // 중복 일자 체크
		for(var i=0; i< count; i++) {
			console.log(mealHolidayList.getRowDataRanged());
			var holiday= mealHolidayList.getValue(i, "Holiday");
			if (holiday == getDate) {
				//저장불가
				var strMsg = "이미 등록된 날짜입니다.";
				app.lookup("SSHDM_opbMsg").value= strMsg;
				dialogAlert(app, dataManager.getString("Str_Info"),strMsg);
				// row이동
				return;
			}	
		}
	} 
	var strMsg = "";
	app.lookup("SSHDM_opbMsg").value= strMsg;
	
	mealHolidayList.addRowData({"Holiday": getDate, "Type": 0 });	
	mealHolidayList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	mealHolidayList.setSort("Holiday");
	app.lookup("SSHDM_grdHolidayList").redraw();
}



/*
 * "날짜 제거" 버튼(SSHDM_btnDeleteDate)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onSSHDM_btnDeleteDateClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var sSHDM_btnDeleteDate = e.control;
	// 저장 전에 삭제 하는 기능
	var accountInfo = dataManager.getAccountInfo(); //로그인 권한 가져오기
	
	var grdHolidayList = app.lookup("SSHDM_grdHolidayList");
	var chkIndices = grdHolidayList.getCheckRowIndices();
	
	var count = chkIndices.length;
	if (count == 0) {
		dialogAlert(app, "Waning", "체크 항목이 없습니다.");
		return;
    }
    
    dialogConfirm(app.getRootAppInstance(), "무료 식수 일자 삭제", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
    	dialog.addEventListenerOnce("close", function(e){
    		if (dialog.returnValue) {
    			for(var i =0 ;i < count;) {
    				var delIndex = chkIndices[i]; //0 번째 체크
					var preInfo = grdHolidayList.getRow(delIndex);
					if (!preInfo) {
						dialogAlert(app, "삭제 처리를 다시 시도해 주세요");
						return;
					}
					grdHolidayList.deleteRow(delIndex); 
					chkIndices = grdHolidayList.getCheckRowIndices();	
					count = chkIndices.length;
					
    			}
    		}else {}
    	});
    });
    grdHolidayList.commitData();
    console.log(app.lookup("MealHolidayList").getRowDataRanged());
}
	
function onSms_getMealHolidayListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		console.log(app.lookup("MealHolidayList").getRowDataRanged());
		var strMsg = "총 " + app.lookup("Total").getValue("Count") + "갯 수의 공휴일 리스트를 가져왔습니다.";
	} else {
		dialogAlert(app, "Waning", "무료식수 일자 가져오기"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("SSHDM_grdHolidayList").redraw(); //
}
function onSms_getMealHolidayListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}
function onSms_getMealHolidayListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onTMHDM_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMHDM_btnSave = e.control;
	//등록된 리스트 일괄 전달.
	// 무한정 할수는 없으니 맥스 카운트 200개로 제한한다.
	
	app.lookup("MealHolidayList").setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	app.lookup("MealHolidayList").commit();
	comLib.showLoadMask("","무료 식수 일자 저장하기","",0);
	console.log(app.lookup("MealHolidayList").getRowDataRanged());
	app.lookup("sms_postMealHolidayLIst").send();
	
}

function onSms_postMealHolidayLIstSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		console.log(app.lookup("MealHolidayList").getRowDataRanged());
		var strMsg = "총 " + app.lookup("Total").getValue("Count") + "갯 수의 공휴일 리스트를 저장하였습니다.";
	} else {
		dialogAlert(app, "Waning", "무료식수 일자 저장하기"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
	app.lookup("SSHDM_grdHolidayList").redraw(); //
}

function onSms_postMealHolidayLIstSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",  COMERROR_NET_ERROR);
}

function onSms_postMealHolidayLIstSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",  COMERROR_NET_TIMEOUT);
}
