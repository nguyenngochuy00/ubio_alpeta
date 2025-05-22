/************************************************
 * Wedget.module.js
 * Created at 2020. 3. 12. 오후 1:09:38.
 *
 * @author blue1
 ************************************************/

exports.id = "Wedget.module.js";

// wedget 정보 저장
// key = wedgetID, [0] = wedgetName, [1] = wedgetSize, [2] = wedgetTitle
var wedgetDef = {
	0: ["RegistrationStatus", 2, "Str_RegistrationStatus"],
	1: ["LogStatus", 1, "Str_LogStatus"],
	2: ["AuthLogToday", 1, "Str_AuthLogToday"],
	3: ["DataServerCPU", 1, "Str_DataServerCpu"],
	4: ["DataServerMEM", 1, "Str_DataServerMemory"],
	5: ["ControlServerCPU", 1, "Str_WebServerCPU"],
	6: ["ControlServerMEM", 1, "Str_WebServerMemory"],
	7: ["TerminalStatus", 1, "Str_TerminalStatus"],
	8: ["DatabaseInformation", 1, "Str_DatabaseInformation"],
	9: ["VisitorStatus", 1, "Str_VisitorStatus"],
	10: ["TodayTNAStatus", 1, "Str_TodayTnaStatus"],
	11: ["TodayMealStatus", 1, "Str_TodayMealStatus"],
	12: ["TodayAccessAreaStatus", 1, "Str_AccessAreaStatus_ABP"]
};

 
exports.getWedgetName = function(wedgetID){
	return wedgetDef[wedgetID][0];
};


exports.getWedgetSize = function(wedgetID){
	return wedgetDef[wedgetID][1];
};

exports.getWedgetHightPx = function(wedgetID){
	var size = this.getWedgetSize(wedgetID);
	return size * 215 + (size-1) *5;
};

exports.getWedgetTitle = function(wedgetID){
	var dataManager = getDataManager();
	return dataManager.getString(wedgetDef[wedgetID][2]);
};

exports.getWedgetListLength = function(){
	
	var len = 0;
	for (var i in wedgetDef){
      len++;
   }

	return len;
};


/*
 * wedget id를 입력 받아 wedget 객체 생성 후 return
 */
exports.createWedget = function(wedgetID) {
	var ret = null;
	
	switch (wedgetID) {
		case 0:
			ret = new udc.dashboard.RegistrationStatus("RegistrationStatus");
			break;
		case 1:
			ret = new udc.dashboard.LogStatus("LogStatus");
			break;
		case 2:
			ret = new udc.dashboard.AuthLogToday("AuthLogToday");
			break;
		case 3:
			ret = new udc.dashboard.DataServerCPU("DataServerCPU");
			break;
		case 4:
			ret = new udc.dashboard.DataServerMEM("DataServerMEM");
			break;
		case 5:
			ret = new udc.dashboard.ControlServerCPU("ControlServerCPU");
			break;
		case 6:
			ret = new udc.dashboard.ControlServerMEM("ControlServerMEM");
			break;
		case 7:
			ret = new udc.dashboard.TerminalStatus("TerminalStatus");
			break;
		case 8:
			ret = new udc.dashboard.DatabaseInformation("DatabaseInformation");
			break;
		case 9:
			ret = new udc.dashboard.VisitorStatus("VisitorStatus");
			break;
		case 10:
			ret = new udc.dashboard.TodayTNAStatus("TodayTNAStatus");
			break;
		case 11:
			ret = new udc.dashboard.TodayMealStatus("TodayMealStatus");
			break;
		case 12:
			ret = new udc.dashboard.TodayAccessAreaStatus("TodayAccessAreaStatus");
			break;			
					
		default:
			// Todo 에러 처리
	}
	
	return ret;
};

exports.initWedget = function(wedget, wedgetID){
	switch (wedgetID) {
		case 0:
			wedget.DASHB_optUserCount = "0";
			wedget.DASHB_optUserUsed = "100.0";
			wedget.DASHB_optTerminalCount = "0";
			wedget.DASHB_optTerminalUsed = "100.0";
			wedget.DASHB_optGroupCount = "0";
			wedget.DASHB_optGroupUsed = "100.0";
			wedget.DASHB_optAccessGroupCount = "0";
			wedget.DASHB_optAccessGroupUsed = "100.0";
			wedget.DASHB_optPositionCount = "0";
			wedget.DASHB_optPositionUsed = "100.0";
			break;
		case 1:
			wedget.DASHB_optAuthCount = "0";
			wedget.DASHB_optAuthStartTime = "YYYY-MM-DD";
			wedget.DASHB_optAuditCount = "0";
			wedget.DASHB_optAuditStartTime = "YYYY-MM-DD";
			wedget.DASHB_optEventCount = "0";
			wedget.DASHB_optEventStartTime = "YYYY-MM-DD";
			break;
		case 2:
			wedget.DASHB_optTodayAuthUserCount = "0";
			break;
		case 3:
			break;
		case 4:
			break;
		case 5:
			break;
		case 6:
			break;
		case 7:
			wedget.DASHB_optTMTotalCnt = "0";
			wedget.DASHB_optTMConnectCnt = "0";
			wedget.DASHB_optTMDisconnectCnt = "0";
			wedget.DASHB_optTMDoorOpenCnt = "0";
			wedget.DASHB_optTMDoorCloseCnt = "0";
			wedget.DASHB_optTMLockForceCnt = "0";
			break;
		case 8:
			wedget.DASHB_optDBType = "";
			wedget.DASHB_optDBName = "";
			wedget.DASHB_optDBDatafilePath = "";
			wedget.DASHB_optDBUsage = "0 MB";
			break;
		case 9:
			wedget.DASHB_optTotalVisitorCount = "0"
			wedget.DASHB_optTodayVisitorCount = "0"
			break;
		case 10:
			break;
		case 11:
			break;
		case 12:
			break;			
		default:
			// Todo 에러 처리
	}
};

exports.setWedgetVaule = function(status, wedget, wedgetID){
	switch (wedgetID) {
		case 0:
			// 사용자
			wedget.DASHB_optUserCount = numberWithCommas(status.DSInfo.DBStat.User.curCnt);
			var userPercent = status.DSInfo.DBStat.User.curCnt * 100 / 200000;
			wedget.DASHB_optUserUsed = Math.floor(userPercent);
			
			//단말기
			wedget.DASHB_optTerminalCount = numberWithCommas(status.DSInfo.DBStat.Term.curCnt);
			var terminalPercent = status.DSInfo.DBStat.Term.curCnt * 100 / 2000;
			wedget.DASHB_optTerminalUsed = Math.floor(terminalPercent);
			
			// 그룹
			wedget.DASHB_optGroupCount = numberWithCommas(status.DSInfo.DBStat.Group.curCnt);
			var groupPercent = status.DSInfo.DBStat.Group.curCnt * 100 / 1000;
			wedget.DASHB_optGroupUsed = Math.floor(groupPercent);
			
			// 츌압구륩
			wedget.DASHB_optAccessGroupCount = numberWithCommas(status.DSInfo.DBStat.AccessGroup.curCnt);
			var accessGroupPercent = status.DSInfo.DBStat.AccessGroup.curCnt * 100 / 1000;
			wedget.DASHB_optAccessGroupUsed = Math.floor(accessGroupPercent);
			
			//직급
			wedget.DASHB_optPositionCount = numberWithCommas(status.DSInfo.DBStat.Position.curCnt);
			var positionPercent = status.DSInfo.DBStat.Position.curCnt * 100 / 200;
			wedget.DASHB_optPositionUsed = Math.floor(positionPercent);
			
			break;
		case 1:
			// 인증 로그
			wedget.DASHB_optAuthCount = numberWithCommas(status.DSInfo.DBStat.AuthLog.curCnt);
			wedget.DASHB_optAuthStartTime = secondsToDateString(status.DSInfo.DBStat.AuthLog.StartTime.seconds);
			
			// 시스템 로그
			wedget.DASHB_optAuditCount = numberWithCommas(status.DSInfo.DBStat.AuditLog.curCnt);
			wedget.DASHB_optAuditStartTime = secondsToDateString(status.DSInfo.DBStat.AuditLog.StartTime.seconds);
			
			// 이벤트 로그
			wedget.DASHB_optEventCount = numberWithCommas(status.DSInfo.DBStat.EventLog.curCnt);
			wedget.DASHB_optEventStartTime = secondsToDateString(status.DSInfo.DBStat.EventLog.StartTime.seconds);

			break;
		case 2:
			wedget.DASHB_optTodayAuthUserCount = numberWithCommas(status.DSInfo.DBStat.AuthLog.todayUserCnt);
				
			// 당일 인증 차트
			var todayAuthLog = new Array(
				status.DSInfo.DBStat.AuthLog.todayCnt,
				status.DSInfo.DBStat.AuthLog.todaySuccessCnt,
		        status.DSInfo.DBStat.AuthLog.todayFailCnt,
		        status.DSInfo.DBStat.AuthLog.todayFPCnt,
		        status.DSInfo.DBStat.AuthLog.todayCardCnt,
		        status.DSInfo.DBStat.AuthLog.todayPWCnt,
		        status.DSInfo.DBStat.AuthLog.todayFaceCnt
			)
			wedget.setShellTodayAuth(todayAuthLog);
			
			break;
		case 3:
			var used = Math.floor(100-status.DSInfo.SystemStat.idleCPU); 
			var free = Math.floor(status.DSInfo.SystemStat.idleCPU);
			if (used < 0 || used > 100) {
				used = Math.floor(Math.random() * 9) + 20
				free = 100 - used;
			}
			wedget.setDSCpuChart(used, free);
			break;
		case 4:
			var used = Math.floor(status.DSInfo.SystemStat.usedMemory);
			var free = Math.floor(100-status.DSInfo.SystemStat.usedMemory);

			wedget.setDSMemChart(used, free);
			break;
		case 5:
			var used = Math.floor(100-status.CSInfo.idleCPU); 
			var free = Math.floor(status.CSInfo.idleCPU);
			if (used < 0 || used > 100) {
				used = Math.floor(Math.random() * 9) + 20
				free = 100 - used;
			}
			
			wedget.setCSCpuChart(used, free);
			break;
		case 6:
			var used = Math.floor(status.CSInfo.usedMemory);
			var free = Math.floor(100-status.CSInfo.usedMemory);
			
			wedget.setCSMemChart(used, free);
			break;
		case 7:
			// Client에서 가지고있는 실시간 터미널 정보
			var dataManager = getDataManager();
			var teminal = dataManager.getTerminalList();
	
			var totalCnt = teminal.getRowCount();
			var connectCnt = 0;
			var disconnectCnt = 0;
			var doorOpenCnt = 0;
			var doorCloseCnt = 0;
			var lockForceCnt = 0;
			
			for (var i=0; i < totalCnt ; i++) {
				var row = teminal.getRowData(i);
				var status = row["Status"];
				var valueBinary = status.toString(2).padStart(32, "0");
				
				if(valueBinary[32-1-0] == 1){	// 연결
					connectCnt++;
					
					if (valueBinary[32-1-2] == 1) {	// 폐쇄 (연결된 단말기에서 폐쇄인지 아난지 검사)
						lockForceCnt++;
					}
					
					if (valueBinary[32-1-24] == 1) {	// 개방
						doorOpenCnt++;
						continue;	// 모니터링 화면에서 개방 /미감시 신호가 동시에 오는 경우가 있어 개방 신호시 open으로 처리
					}
					
					if (valueBinary[32-1-23] == 0) {	// 출입문 정상 상태
						if (valueBinary[32-1-7] == 1) {	// 열림
							doorOpenCnt++;
						} else {	// 닫힘
							doorCloseCnt++;
						}
					}
				
				} else {	// 미연결
					disconnectCnt++;
				}
			} 
			
			wedget.DASHB_optTMTotalCnt = numberWithCommas(totalCnt);
			wedget.DASHB_optTMConnectCnt = numberWithCommas(connectCnt);
			wedget.DASHB_optTMDisconnectCnt = numberWithCommas(disconnectCnt);
			wedget.DASHB_optTMDoorOpenCnt = numberWithCommas(doorOpenCnt);
			wedget.DASHB_optTMDoorCloseCnt = numberWithCommas(doorCloseCnt);
			wedget.DASHB_optTMLockForceCnt = numberWithCommas(lockForceCnt);
			break;
		case 8:
			//console.log(status.DSInfo.DBStat);
			wedget.DASHB_optDBType = status.DSInfo.DBStat.DBInformation.type;
			wedget.DASHB_optDBName = status.DSInfo.DBStat.DBInformation.name;
			wedget.DASHB_optDBDatafilePath = status.DSInfo.DBStat.DBInformation.path;
			var usage = status.DSInfo.DBStat.DBInformation.usage;
			wedget.DASHB_optDBUsage = (usage / 1048576).toFixed(2) + " MB";
			break;
		case 9:
			wedget.DASHB_optTotalVisitorCount = numberWithCommas(status.DSInfo.DBStat.Visiotor.totalCnt);
			wedget.DASHB_optTodayVisitorCount = numberWithCommas(status.DSInfo.DBStat.Visiotor.todayCnt);
			break;
		case 10:
			var todayTna = new Array(
				status.DSInfo.DBStat.TodayTna.totalCnt,
				status.DSInfo.DBStat.TodayTna.inCnt,
				status.DSInfo.DBStat.TodayTna.outCnt,
				status.DSInfo.DBStat.TodayTna.lateCnt,
				status.DSInfo.DBStat.TodayTna.absenceCnt
			);
		
			wedget.setShellTodayTna(todayTna);
			break;
		case 11:
			var todayMeal = new Array(
				status.DSInfo.DBStat.TodayMeal.totalCnt,
				status.DSInfo.DBStat.TodayMeal.breakFastCnt,
				status.DSInfo.DBStat.TodayMeal.lunchCnt,
				status.DSInfo.DBStat.TodayMeal.dinnerCnt,
				status.DSInfo.DBStat.TodayMeal.lateSnackCnt,
				status.DSInfo.DBStat.TodayMeal.snackCnt				
			);
			
			wedget.setShellTodayMeal(todayMeal);
			break;
		case 12:
			var areaNames = new Array();
			var inCounts = new Array();
			var outCounts = new Array();
			var curInConts = new Array();
			
			if (status.DSInfo.DBStat.TodayAccessArea.slice != null) {
				var areaSize = status.DSInfo.DBStat.TodayAccessArea.length
				for (var i=0; i < 3 ; i++) {
					if (i < areaSize) {
						areaNames[i] = status.DSInfo.DBStat.TodayAccessArea[i].areaName
						inCounts[i] = status.DSInfo.DBStat.TodayAccessArea[i].inAccessCnt
						outCounts[i] = status.DSInfo.DBStat.TodayAccessArea[i].outAccessCnt
						curInConts[i] = status.DSInfo.DBStat.TodayAccessArea[i].inAccessCnt - status.DSInfo.DBStat.TodayAccessArea[i].outAccessCnt
						
						if (curInConts[i] < 0) {
							curInConts[i] = 0;
						}
					} else {
						areaNames[i] = "None";
						inCounts[i] = 0;
						outCounts[i] = 0;
						curInConts[i] = 0;
					}
				}
			}
		
			wedget.setShellTodayAccessArea(areaNames, inCounts, outCounts, curInConts);
			break;			
		default:
			// Todo 에러 처리
	}
};

/*
 * Todo: 공통 모듈로 이동
 */
function numberWithCommas(x) {
	// console.log(x);
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };
String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };
Number.prototype.zf = function (len) { return this.toString().zf(len); };

function secondsToDateString(seconds){
	 var date = new Date(seconds*1000);
	 return date.getFullYear() + "-" + (date.getMonth() + 1).zf(2) + "-" + date.getDate().zf(2);
}

