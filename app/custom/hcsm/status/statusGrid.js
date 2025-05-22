/************************************************
 * statusGrid.js
 * Created at 2022. 7. 27. 오후 1:58:02.
 *
 * @author sep
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib; // 로딩 팝업

var searchTimer = 21;
 
// 쉘 laod 이벤트를 서브미션 실행 후 한번만 실행 시킨 후, 반복적으로 load 이벤트 발생하는 것을 막기위한 처리
var shellLoadCount = 0;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	// createComUtil(app)을 사용하면 로딩 팝업창이 제대로 보이지 않음
	dataManager = getDataManager();
	var accountInfo = dataManager.getAccountInfo();
	var UserPrivilege = Number(accountInfo.getValue("Privilege"));
	//console.log("UserPrivilege : ", UserPrivilege);
	
	// 로그인 한 사용자가 관리자나 마스터가 아닐 경우
	if(UserPrivilege != 1){
		// 퍼센트 설정 버튼 삭제
		app.lookup("persentSettingButton").dispose();
	}
	
	// 현황표 조회 기준일
	var startDate = app.lookup("HCSM_baseDate");
	
	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	
	// 현재 날짜로 초기화
	startDate.value = now.format('YYYY-MM-DD');
	SetMaxDate();
	
	var smsGetStatusDate = app.lookup("sms_getStatusCheck");
	// 기준 날짜 값 세팅
	smsGetStatusDate.setParameters("startTime", startDate.value);
	smsGetStatusDate.send();	
	
	statusAutoSearch();
}

function SetMaxDate() {
	var date = new Date();
	date.setFullYear(date.getFullYear()); // y년을 더함
	date.setMonth(date.getMonth()); // m월을 더함
	date.setDate(date.getDate()); // d일을 더함
	
	app.lookup("HCSM_baseDate").maxDate = date;
}

/*
 * sms_getStatusCheck 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getStatusCheckSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var startDateInput = app.lookup("HCSM_baseDate");
	var startDate = startDateInput.value;
	
	var smsGetStatusLastWeek = app.lookup("sms_getCheckInRecode");
	smsGetStatusLastWeek.setParameters("startTime", startDate);
	smsGetStatusLastWeek.send();
		
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	
	var dsOneDayStatusInfo = app.lookup("OneDayStatusInfo");
	var dmCheckStatusInfo = app.lookup("CheckStatusInfo");
	
	if( resultCode == COMERROR_NONE ){	
		dsOneDayStatusInfo.clear();
		
		var rowData = {
			"CheckIn": dmCheckStatusInfo.getValue("CheckIn"),
			"CheckOut": dmCheckStatusInfo.getValue("CheckOut"),
			"InSite": dmCheckStatusInfo.getValue("InSite")
		}
		
		dsOneDayStatusInfo.addRowData(rowData);
		dsOneDayStatusInfo.commit();
		app.lookup("oneDayStatusGrid").redraw();
		
	}else{
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
}

/*
 * sms_getStatusCheck 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getStatusCheckSubmitError(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();	
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);	
}

/*
 * sms_getStatusCheck 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getStatusCheckSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	searchTimer = 21;
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * sms_getCheckInRecode 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getCheckInRecodeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	
	var lastWeekStatusGrid = app.lookup("lastWeekStatusGrid");
	var checkInRecodeInfoList = app.lookup("CheckInRecodeInfoList");
	var weekStatus = app.lookup("WeekStatus");
	
	
	if( resultCode == COMERROR_NONE ){
		weekStatus.clear();	
		var count = checkInRecodeInfoList.getRowCount();
		weekStatus.addRow();
		var i;
		for(i = 0; i < count; i++){
			
			if(checkInRecodeInfoList.getValue(i, "DDay") == 0){
				weekStatus.setValue(0, "D0", checkInRecodeInfoList.getValue(i, "CheckIn"));
			}else if(checkInRecodeInfoList.getValue(i, "DDay") == 1){
				weekStatus.setValue(0, "D1", checkInRecodeInfoList.getValue(i, "CheckIn"));
			}else if(checkInRecodeInfoList.getValue(i, "DDay") == 2){
				weekStatus.setValue(0, "D2", checkInRecodeInfoList.getValue(i, "CheckIn"));
			}else if(checkInRecodeInfoList.getValue(i, "DDay") == 3){
				weekStatus.setValue(0, "D3", checkInRecodeInfoList.getValue(i, "CheckIn"));
			}else if(checkInRecodeInfoList.getValue(i, "DDay") == 4){
				weekStatus.setValue(0, "D4", checkInRecodeInfoList.getValue(i, "CheckIn"));
			}else if(checkInRecodeInfoList.getValue(i, "DDay") == 5){
				weekStatus.setValue(0, "D5", checkInRecodeInfoList.getValue(i, "CheckIn"));
			}else if(checkInRecodeInfoList.getValue(i, "DDay") == 6){
				weekStatus.setValue(0, "D6", checkInRecodeInfoList.getValue(i, "CheckIn"));
			}
			
		} // end for
		weekStatus.commit();
		shellLoadCount = 1;
		lastWeekStatusGrid.redraw();			
		app.lookup("chartShell").redraw();	
		comLib.hideLoadMask();
				
	} else{
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	
}

/*
 * sms_getCheckInRecode 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getCheckInRecodeSubmitError(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}


/*
 * sms_getCheckInRecode 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getCheckInRecodeSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


// weekstatus 데이터 셋으로 차트 옵션 값 설정
function getLineOptions(dataSet){
	var options = {
			type: 'line',
			data: {
				labels: [
					'D-6',
					'D-5',
					'D-4',
					'D-3',
					'D-2',
					'D-1',
					'D-0'
				],
				datasets: [
					{
						fill: false,
						data: [
							dataSet.D6,
							dataSet.D5,
							dataSet.D4,
							dataSet.D3,
							dataSet.D2,
							dataSet.D1,
							dataSet.D0
						],
						borderColor: '#345C80',
						borderWidth: 2,
						tension: 0 // 그래프 선 곡률
					}
				] // end datasets
			}, // end data
			options: {
		    	legend: {
		        	display: false // 차트 라벨 감추기
		        },
		        animation: {
                    duration: 0 // 차트 그려질 때 보이는 애니메이션 효과 없음
                },
		        scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }
                    ]
                 }       
		    } // end options
	};
	
	return options;
}


/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onOneDayStatusGridCellClick(/* cpr.events.CGridMouseEvent */ e){
	var oneDayStatusGrid = e.control;
	
	var clickCellIndex = e.cellIndex;
	//console.log("clickCellIndex : " + clickCellIndex);
	// In site 셀을 클릭했을 때만 상세 팝업을 띄우도록 처리
	if(clickCellIndex == 3){
		
		var startDateInput = app.lookup("HCSM_baseDate");
		var startDate = startDateInput.value;
		
		var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
			content: { 
				"Target":DLG_HC_SAUDI_MARJAN_STATUS_SUB_CONTRACTOR,
				"StartTime":startDate
			 }
		});
	
		app.getHostAppInstance().dispatchEvent(selectionEvent);	
	}
	
}


/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onChartShellInit(/* cpr.events.CUIEvent */ e){	
	var chartShell = e.control;
	
	// 한번만 차트가 그려지도록 하기 위한 처리
	if(e.content && shellLoadCount > 1){
		e.preventDefault();
		console.log("stop drawing chart");
	}
	
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */

function onChartShellLoad(/* cpr.events.CUIEvent */ e){

	var canvas = document.createElement("canvas");
	e.content.appendChild(canvas);
	
	var weekStatus = app.lookup("WeekStatus");
	
	if(weekStatus.getRowCount() > 0){
		console.log("draw chart");
		
		var weekStatusData = weekStatus.getRowData(0);
		var options = getLineOptions(weekStatusData);
			
		new Chart(canvas, options);
	}
	
	shellLoadCount++;	
}


/*
 * 버튼(persentSettingButton)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPersentSettingButtonClick(/* cpr.events.CMouseEvent */ e){
	
	var appID = "app/custom/hcsm/status/percentSetting";
	app.getRootAppInstance().openDialog(appID, {width : 215, height : 155}, function(dialog){		
		
		dialog.bind("headerTitle").toLanguage("Str_DisplayPercentSetting");
		dialog.resizable = false;		
		dialog.modal = true;		
	}).then(function(returnValue){
		if(returnValue == 1){
			onButtonClick(); // 표시 비율 새로 설정시 값 다시 계산
		}
	});
}


/*
 * 검색 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	
	var startDateInput = app.lookup("HCSM_baseDate");
	var startDate = startDateInput.value;
	
	var smsGetStatusDate = app.lookup("sms_getStatusCheck");
	smsGetStatusDate.setParameters("startTime", startDate);
	smsGetStatusDate.send();	
	
	searchTimer = 21;	// 검색 시 타이머 초기화
}

function statusAutoSearch(){
	if(searchTimer == 1){
		onButtonClick();
		statusAutoSearch();
	}else{
		searchTimer--;
		setTimeout(function(){ 
			statusAutoSearch();
		}, 1000);
	}
}

/*
 * 서브미션에서 before-send 이벤트 발생 시 호출.
 * XMLHttpRequest가 open된 후 send 함수가 호출되기 직전에 발생합니다.
 */
function onSms_getStatusCheckBeforeSend(/* cpr.events.CSubmissionEvent */ e){

	comLib = createComUtil(app.getHostAppInstance());
	comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");	
}
