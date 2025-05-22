/************************************************
 * accessFloorManagement.js
 * Created at 2020. 6. 15. 오후 6:06:51.
 *
 * @author jrh
 ************************************************/
var comUtil = createComUtil(app);
var dataManager = getDataManager();
var dateLib = cpr.core.Module.require("lib/DateLib");

/* 1. load시 현재 설정된 엘리베이터 설정된 출입 층 가져오기 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	var sms_getOptionElevator = app.lookup("sms_getOptionElevator");
	sms_getOptionElevator.send();
}

/* 엘리베이터 출입층, 사용자 데이터 세팅 */
function onSms_getOptionElevatorSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var dsFloorList = app.lookup("dsFloorList");
	var dmOptionElevator = app.lookup("OptionElevator");
	var totalFloorCount = parseInt(dmOptionElevator.getValue("TotalFloorCount"));
	var groundFloor = parseInt(dmOptionElevator.getValue("FirstFloor"));
	var initValue = app.getHost().initValue;
	var accessFloorList = initValue["AccessFloor"];
	var grdFloorSet = app.lookup('UESC_grdFloorSet');
	
	/* a. 엘리베이터 출입층 세팅  */
	for (var i = 1; i < totalFloorCount + 1; i++) {
		var floorInfo = "";
		if (i <= groundFloor - 1) {
			floorInfo = "B" + (groundFloor - i)
		} else {
			floorInfo = "" + (i - groundFloor + 1)
		}
		dsFloorList.addRowData({
			"Floor": i,
			/* 불필요 지울예정 */
			"FloorName": floorInfo
		})
	}
	
	/* b. 사용자 설정값 세팅  */
	if (accessFloorList == '' || accessFloorList == null) {} else {
		var arr = accessFloorList.split(',');
		for (var i = 0; arr.length > i; i++) {
			var getGridRow = grdFloorSet.getRow(parseInt(arr[i], 10) - 1);
			/* 엘리베이터 출입 층 세팅 값(일반 설정)변경으로 사용자가 출입했던 층이 없어질 경우 null */
			if (getGridRow != null) {
				grdFloorSet.setCheckRowIndex(getGridRow.getIndex(), true);
			}
		}
	}
	dsFloorList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
	app.lookup("UESC_grdFloorSet").redraw();
}

// 엘레베이터 옵션 가져오기 에러
function onSms_getOptionElevatorSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 엘레베이터 옵션 가져오기 타임아웃
function onSms_getOptionElevatorSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(e) {
	var button = e.control;
	var grd = app.lookup('UESC_grdFloorSet');
	var checkRows = grd.getCheckRowIndices();
	var returnArr = [];
	dataManager = getDataManager();
	
	if (checkRows.length == 0) {
		/* "한 개의 권한을 선택해 주세요." */
		dialogAlert(app, ' ', dataManager.getString('Str_PrivilegeSelectWarning'));
	} else {
		for (var i = 0; checkRows.length > i; i++) {
			returnArr.push(checkRows[i] + 1);
		}
		app.close(returnArr);
	}
	
}