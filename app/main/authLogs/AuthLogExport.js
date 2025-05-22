/************************************************
 * AuthLogExport.js
 * Created at 2019. 1. 9. 오후 6:33:38.
 *
 * @author wonki
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var ALEMP_pageRowCount = 1000;
var ALEMP_recvRowPerExport = 2000; // 내보내기를 위해 서버에서 한번에 요청하는 최대 로그 수
var ALEMP_excelRowCountPerFile = 100000; // 엑셀 파일당 최대 열 수
var ALEMP_exportFileOffset = 0; // 엑셀 파일당 최대 열 수
var comLib;

function onBodyLoad(/* cpr.events.CEvent */ e) {
  comLib = createComUtil(app);
  dataManager = getDataManager();

  var dtiStart = app.lookup("ALEMP_dtiStart");
  var dtiEnd = app.lookup("ALEMP_dtiEnd");

  var date = moment().format("YYYY-MM-DD");
  var now = moment.utc(date).local();
  dtiEnd.value = now.format("YYYY-MM-DD");
  dtiStart.value = now.format("YYYY-MM-DD");

  var customLyout = app.lookup("udcAuthLogListLayout");
  var udcList;
  var oemVersion = dataManager.getOemVersion();
  if (oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) {
    udcList = new udc.grid.authLogListITONE("ALEMP_udcAuthlogList");

    // 콤보박스에 아이디 관련 검색 제거 (보이는 아이디는 유니크아이디이므로)
    var cmbCategory = app.lookup("ALEMP_cmbCategory");
    cmbCategory.deleteItemByValue("user_id");
    cmbCategory.deleteItemByValue("unique_id");
  } else {
    udcList = new udc.grid.authLogList("ALEMP_udcAuthlogList");
    udcList.setAppProperty("requestMenuExport", "AuthLogExport");
  }

  if (oemVersion == OEM_DIGIMARK_CSVEXPORT) {
    var CSVExport_button = app.lookup("ALEMP_dtiExportCSV");
    CSVExport_button.visible = true;
  }

  udcList.addEventListener("pagechange", onALEMP_udcAuthlogListPagechange);
  customLyout.addChild(udcList, { colIndex: 0, rowIndex: 0 });

  customLyout.redraw();

  var udcAuthLogList = app.lookup("ALEMP_udcAuthlogList");

  //	udcAuthlogList.deleteColumn([17,16]);

  var ALEMP_cmbResult = app.lookup("ALEMP_cmbResult");
  ALEMP_cmbResult.addItem(
    new cpr.controls.Item(dataManager.getString("Str_All"), "0")
  );
  ALEMP_cmbResult.addItem(
    new cpr.controls.Item(dataManager.getString("Str_Success"), "1")
  );
  ALEMP_cmbResult.addItem(
    new cpr.controls.Item(dataManager.getString("Str_Fail"), "2")
  );
  ALEMP_cmbResult.selectItemByValue("0");

  if (dataManager.getOemVersion() != OEM_INDO_MAURITIUS) {
    app.lookup("AuthLogList").deleteColumn("Department");
    app.lookup("ExportAuthLogList").deleteColumn("Department");
  }
}

// 검색 클릭
function onALEMP_btnSearchClick(/* cpr.events.CMouseEvent */ e) {
  var udcUserList = app.lookup("ALEMP_udcAuthlogList");
  udcUserList.setCurrentPageIndex(1);

  var dsAuthLogList = app.lookup("AuthLogList");
  dsAuthLogList.clear();
  var udcAuthLogList = app.lookup("ALEMP_udcAuthlogList");
  udcAuthLogList.setAuthLogList(dsAuthLogList);

  var dm_ExportParam = app.lookup("dm_ExportParam");
  dm_ExportParam.setValue("mode", "list");
  sendAuthLogListRequest();
}

// 내보내기 클릭
function onALEMP_dtiExportClick(/* cpr.events.CMouseEvent */ e) {
  ALEMP_exportFileOffset = 0;

  var totalLabel = app.lookup("ALEMP_opbTotal");
  var dmTotal = app.lookup("Total");
  var dm_ExportParam = app.lookup("dm_ExportParam");
  dm_ExportParam.setValue("mode", "export");
  dm_ExportParam.setValue("total", dmTotal.getValue("Count"));
  dm_ExportParam.setValue("offset", 0);
  if (totalLabel.value == 0) {
    dialogAlert(
      app,
      dataManager.getString("Str_Warning"),
      dataManager.getString("Str_AuthLogExportFail")
    );
  } else {
    var totalLabel = parseInt(totalLabel.value);
    if (totalLabel >= ALEMP_recvRowPerExport) {
      comLib.showLoadMask(
        "pro",
        dataManager.getString("Str_AuthLogExport"),
        "",
        totalLabel / ALEMP_recvRowPerExport
      );
    } else {
      comLib.showLoadMask(
        "pro",
        dataManager.getString("Str_AuthLogExport"),
        "",
        totalLabel / totalLabel
      );
    }
    sendAuthLogListRequest();

    return;
  }
}

function sendAuthLogListRequest() {
  var dtiStart = app.lookup("ALEMP_dtiStart");
  var dtiEnd = app.lookup("ALEMP_dtiEnd");

  /*	if (dateLib.minusDates(dtiStart.value.replace(/-/gi, ""), dtiEnd.value.replace(/-/gi, "")) >= 31) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ThirtyDayOverError"));
		app.lookup("ALMGR_opbTotal").value = 0;
		return;
	}*/

  var udcAuthLogList = app.lookup("ALEMP_udcAuthlogList");
  var curIndex = udcAuthLogList.getCurrentPageIndex();
  var offset = (curIndex - 1) * ALEMP_pageRowCount;

  var smsGetAuthLogList = app.lookup("sms_getAuthLogList");

  var cmbCategory = app.lookup("ALEMP_cmbCategory");
  var edtKeyword = app.lookup("ALEMP_edtKeyword");

  smsGetAuthLogList.setParameters("startTime", dtiStart.value + " 00:00:00");
  smsGetAuthLogList.setParameters("endTime", dtiEnd.value + " 23:59:59");
  smsGetAuthLogList.setParameters("offset", offset);
  smsGetAuthLogList.setParameters("limit", ALEMP_pageRowCount);

  if (cmbCategory.value != null && cmbCategory.value.length > 0) {
    smsGetAuthLogList.setParameters("searchCategory", cmbCategory.value);
  }
  if (edtKeyword.value != null && edtKeyword.value.length > 0) {
    smsGetAuthLogList.setParameters("searchKeyword", edtKeyword.value);
  } else {
    /* search 데이터가 없는데 이전에 보낸 잔여  searchKeyword Parameter가 남아있음 */
    smsGetAuthLogList.setParameters("searchCategory", "all");
    smsGetAuthLogList.removeParameters("searchKeyword");
  }

  var dm_ExportParam = app.lookup("dm_ExportParam");
  if (dm_ExportParam.getValue("mode") == "list") {
    var udcUserList = app.lookup("ALEMP_udcAuthlogList");
    var curIndex = udcUserList.getCurrentPageIndex();
    var offset = (curIndex - 1) * ALEMP_pageRowCount;
    smsGetAuthLogList.setParameters("offset", offset);
    smsGetAuthLogList.setParameters("limit", ALEMP_pageRowCount);
  } else {
    smsGetAuthLogList.setParameters(
      "offset",
      dm_ExportParam.getValue("offset")
    );
    smsGetAuthLogList.setParameters("limit", ALEMP_recvRowPerExport);
  }

  var ALEMP_cmbResult = app.lookup("ALEMP_cmbResult");
  if (ALEMP_cmbResult.value == "1") {
    smsGetAuthLogList.setParameters("authResult", 1);
  } else if (ALEMP_cmbResult.value == "2") {
    smsGetAuthLogList.setParameters("authResult", 2);
  } else {
    smsGetAuthLogList.setParameters("authResult", 0);
  }

  var dsAuthLogList = app.lookup("AuthLogList");
  dsAuthLogList.clear();

  smsGetAuthLogList.send();
  var dm_ExportParam = app.lookup("dm_ExportParam");
  if (dm_ExportParam.getValue("mode") == "list") {
    comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
  }
}

// 인증로그 가져오기 성공
function onSms_getAuthLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
  //comLib.hideLoadMask();
  var result = app.lookup("Result");
  if (result.getValue("ResultCode") == COMERROR_NONE) {
    var temperatureUnit = dataManager.getTemperatureUnit();
    var dsAuthLogList = app.lookup("AuthLogList");
    var count = dsAuthLogList.getRowCount();
    var terminalList = dataManager.getTerminalList();
    for (var i = 0; i < count; i++) {
      var logInfo = dsAuthLogList.getRow(i);
      var strDummy = logInfo.getValue("Dummy");
      if (strDummy == "-Str_DummyReader-") {
        // 더미면
        logInfo.setValue(dataManager.getString("Str_DummyReader"));
      }
      if (logInfo.getValue("TerminalName").length <= 0) {
        // 이름이 없으면
        var terminalID = logInfo.getValue("TerminalID");
        var searchData = terminalList.findFirstRow("ID =='" + terminalID + "'");
        if (searchData) {
          logInfo.setValue("TerminalName", searchData.getValue("Name"));
        }
      }
      if (logInfo.getValue("ReserveType") == 1) {
        var reservData = logInfo.getValue("ReserveData");
        if (reservData.length > 4) {
          var data = reservData.split(",");
          if (data[3] < 10) {
            data[3] = "0" + data[3];
          }
          var temp = "";
          if (data[1] == 1) {
            temp = dataManager.getString("Str_Mask") + " ";
          } else if (data[1] == 2) {
            temp = dataManager.getString("Str_MaskInvalid") + " ";
          } else if (data[1] == 3) {
            temp = dataManager.getString("Str_MaskNo") + " ";
          }
          if (temperatureUnit == 1) {
            var tempValue = (
              (parseFloat(data[2] + "." + data[3]) * 9) / 5 +
              32
            ).toFixed(2);
            temp += tempValue;
          } else {
            temp += parseFloat(data[2] + "." + data[3]).toFixed(2);
          }
          if (temperatureUnit == 0) {
            logInfo.setValue("Detail", temp + "℃");
          } else if (temperatureUnit == 1) {
            logInfo.setValue("Detail", temp + "℉");
          }
        }
      } else if (logInfo.getValue("ReserveType") == 3) {
        //ReserveType = 1  온도, Type 2= LPR
        console.log(logInfo.getValue("ReserveData"));
        var data = logInfo.getValue("ReserveData").split(",");
        var strData;
        if (data[1] == 0) {
          // 사용안함
          strData = dataManager.getString("Str_NotUsed");
        } else if (data[1] == 1) {
          //입구
          strData = dataManager.getString("Str_LprIn");
        } else if (data[1] == 2) {
          //출구
          strData = dataManager.getString("Str_LprOut");
        }
        logInfo.setValue("Detail", strData);
      } else if (logInfo.getValue("ReserveType") == 9) {
        if (
          dataManager.getOemVersion() == OEM_ARMY_HQ ||
          dataManager.getOemVersion() == OEM_ROKMCH
        ) {
          console.log(logInfo.getValue("ReserveData"));
          var data = logInfo.getValue("ReserveData").split(",");
          var strData;
          if (data[0] == 1) {
            strData = "입구";
          } else if (data[0] == 2) {
            strData = "출구";
          }
          logInfo.setValue("Detail", strData);
        }
      } else if (logInfo.getValue("ReserveType") == 4) {
        // 음주
        var data = logInfo.getValue("ReserveData").split(",");
        var strData;
        if (data[0] == 0) {
          // 미측정
          strData = dataManager.getString("Str_AlcholeNoChk") + " ";
        } else if (data[0] == 1) {
          // 정상
          strData = dataManager.getString("Str_AlcholNormal") + " ";
        } else if (data[0] == 2) {
          // 음주
          strData = dataManager.getString("Str_AlcholDetected") + " ";
        }
        var alcolValue = data[2] | (data[3] << 8);
        alcolValue = data[1] + "." + alcolValue;
        alcolValue = parseFloat(alcolValue).toFixed(3);
        strData = strData + alcolValue;
        logInfo.setValue("Detail", strData);
      }
    }

    var dmTotal = app.lookup("Total");
    var totalCount = parseInt(dmTotal.getValue("Count"));
    app.lookup("ALEMP_opbTotal").value = totalCount;

    var dm_ExportParam = app.lookup("dm_ExportParam");
    if (dm_ExportParam.getValue("mode") == "list") {
      // 리스트 조회인 경우
      var viewPageCount =
        totalCount / ALEMP_pageRowCount + (totalCount % ALEMP_pageRowCount > 0);
      if (viewPageCount > 10) {
        viewPageCount = 10;
      }
      var udcAuthLogList = app.lookup("ALEMP_udcAuthlogList");
      udcAuthLogList.setAuthLogList(dsAuthLogList);
      udcAuthLogList.setPaging(totalCount, ALEMP_pageRowCount, viewPageCount);
      comLib.hideLoadMask();
    } else {
      // 엑셀 내보내기인 경우
      var exportAuthLogList;
      var exportExcelFunction; // 커스텀별로 exportExcel 함수를 다르게 실행하도록
      var oemVersion = dataManager.getOemVersion();
      if (oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) {
        exportAuthLogList = app.lookup("ExportAuthLogList_ITONE");
        exportExcelFunction = exportExcelITONE;
      } else {
        // 일반향의 경우
        exportAuthLogList = app.lookup("ExportAuthLogList");
        exportExcelFunction = exportExcel;
      }

      if (dsAuthLogList.getRowCount() == 0) {
        // 수신된 데이터가 없으면 종료
        comLib.hideLoadMask();
        if (exportAuthLogList.getRowCount() > 0) {
          // 더이상 받을 데이터가 없으면 내보내기 리스트에 남아있는 데이터 엑셀 내보내기
          exportExcelFunction(ALEMP_exportFileOffset);
          exportAuthLogList.clear();
        } else {
          dialogAlert(
            app,
            dataManager.getString("Str_Warning"),
            dataManager.getString("Str_NoItemSave")
          );
        }
      } else {
        for (var i = 0; i < dsAuthLogList.getRowCount(); i++) {
          var row = exportAuthLogList.pushRowData(dsAuthLogList.getRowData(i));
          row.setValue("Func", getFuncValue(row.getValue("Func")));
        }
        var exportCount = exportAuthLogList.getRowCount();
        if (exportCount >= ALEMP_excelRowCountPerFile) {
          exportExcelFunction(ALEMP_exportFileOffset);
          ALEMP_exportFileOffset++;
          exportAuthLogList.clear();
        }
        var offset = dm_ExportParam.getValue("offset");
        offset += ALEMP_recvRowPerExport;
        dm_ExportParam.setValue("offset", offset);
        comLib.updateLoadMask(offset);
        sendAuthLogListRequest();
      }
    }
  } else {
    //dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ListLoading"));
    dialogAlert(
      app,
      dataManager.getString("Str_Failed"),
      dataManager.getString(getErrorString(result.getValue("ResultCode")))
    );
  }
}

function getFuncValue(value) {
  var result = "";
  switch (Number(value)) {
    case 1:
      result = dataManager.getString("Str_FKeyF1");
      break;
    case 2:
      result = dataManager.getString("Str_FKeyF2");
      break;
    case 3:
      result = dataManager.getString("Str_FKeyAccess");
      break;
    case 4:
      result = dataManager.getString("Str_FKeyF3");
      break;
    case 5:
      result = dataManager.getString("Str_FKeyF4");
      break;

    case 11:
      result = dataManager.getString("Str_FKeyAttend");
      break;
    case 12:
      result = dataManager.getString("Str_FKeyLeave");
      break;
    case 13:
      result = dataManager.getString("Str_FKeyAccess");
      break;
    case 14:
      result = dataManager.getString("Str_FKeyOut");
      break;
    case 15:
      result = dataManager.getString("Str_FKeyIn");
      break;

    case 21:
      result = dataManager.getString("Str_FKeyMenu1");
      break;
    case 22:
      result = dataManager.getString("Str_FKeyMenu2");
      break;
    case 23:
      result = dataManager.getString("Str_FKeyMenu5");
      break;
    case 24:
      result = dataManager.getString("Str_FKeyMenu3");
      break;
    case 25:
      result = dataManager.getString("Str_FKeyMenu4");
      break;
  }
  return result;
}

// 인증로그 가져오기 에러
function onSms_getAuthLogListSubmitError(/* cpr.events.CSubmissionEvent */ e) {
  var result = app.lookup("Result");
  result.setValue("ResultCode", COMERROR_NET_ERROR);
}

// 인증로그 가져오기 타임아웃
function onSms_getAuthLogListSubmitTimeout(
  /* cpr.events.CSubmissionEvent */ e
) {
  var result = app.lookup("Result");
  result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function getLogAuthResultString(value) {
  var type = "";
  switch (value) {
    case AuthLogResultSuccess:
      type = dataManager.getString("Str_Success");
      break;
    case AuthLogResultFail:
      type = dataManager.getString("Str_AuthResultFail");
      break;
    case AuthLogResultAccessDenied:
      type = dataManager.getString("Str_AuthResultAccessDenied");
      break;
    case AuthLogResultTimeout:
      type = dataManager.getString("Str_AuthResultTimeout");
      break;
    case AuthLogResultTimeoutCapture:
      type = dataManager.getString("Str_AuthResultTimeoutCapture");
      break;
    case AuthLogResultTimeoutIdentify:
      type = dataManager.getString("Str_AuthResultTimeoutIdentify");
      break;
    case AuthLogResultAntiPassback:
      type = dataManager.getString("Str_AuthResultAntiPassback");
      break;
    case AuthLogResultDuress:
      type = dataManager.getString("Str_AuthResultDuress");
      break;
    case AuthLogResultBlackList:
      type = dataManager.getString("Str_AuthResultBlackList");
      break;
    case AuthLogResultInvalidUser:
      type = dataManager.getString("Str_AuthResultUnregistUser");
      break;
    case AuthLogResultCapture:
      type = dataManager.getString("Str_AuthResultFPCaptureFailed");
      break;
    case AuthLogResultDuplicatedAuthentication:
      type = dataManager.getString("Str_AuthResultDuplicatedAuth");
      break;
    case AuthLogResultNetwork:
      type = dataManager.getString("Str_AuthResultNetworkError");
      break;
    case AuthLogResultServerBusy:
      type = dataManager.getString("Str_AuthResultServerBusy");
      break;
    case AuthLogResultFaceDetection:
      type = dataManager.getString("Str_AuthResultFaceDetectionFailed");
      break;
    case AuthLogResultFailMealPay:
      type = dataManager.getString("Str_AuthLogResultFailMealPay");
      break;
    case AuthLogResultFailMealTime:
      type = dataManager.getString("Str_AuthLogResultFailMealTime");
      break;
    case AuthLogResultFailNotExistsMealCode:
      type = dataManager.getString("Str_AuthLogResultFailNotExistsMealCode");
      break;
    case AuthLogResultFailPeriod:
      type = dataManager.getString("Str_AuthLogResultFailPeriod");
      break;
    case AuthLogResultFailMealLimit:
      type = dataManager.getString("Str_AuthLogResultFailMealLimit");
      break;
    case AuthLogResultFailDayLimit:
      type = dataManager.getString("Str_AuthLogResultFailDayLimit");
      break;
    case AuthLogResultFailMonthLimit:
      type = dataManager.getString("Str_AuthLogResultFailMonthLimit");
      break;
    case AuthLogResultSoftpassback:
      type = dataManager.getString("Str_AuthLogResultSoftpassback");
      break;
    case AuthLogResultNoMask:
      type = dataManager.getString("Str_AuthLogResultNoMask");
      break;
    case AuthLogResultFeverDetection:
      type = dataManager.getString("Str_AuthLogResultFeverDetection");
      break;
    case AuthLogResultXKeyInvalidMasterKey:
      type = dataManager.getString("Str_AuthLogResultXKeyInvalidMasterKey");
      break;
    case AuthLogResultXKeyInvalidMasterKey:
      type = dataManager.getString("Str_AuthLogResultXKeyInvalidTime");
      break;
    case AuthLogResultXKeyInvalidMasterKey:
      type = dataManager.getString("Str_AuthLogResultXKeyInvalidTime");
      break;
    case AuthLogResultLprAuthResultFail:
      type = dataManager.getString("Str_AuthResultLprFail");
      break;
    case AuthLogResultLprAuthResultUnRegist:
      type = dataManager.getString("Str_AuthResultLprUnRegist");
      break;
    default:
      return "";
      break;
  }
  return type;
}

function getLogFuncType(value) {
  var type = "";
  switch (value) {
    case 0:
      type = dataManager.getString("Str_AuthLogFuncTypeAccess");
      break;
    case 1:
      type = dataManager.getString("Str_AuthLogFuncTypeTna");
      break;
    case 2:
      type = dataManager.getString("Str_AuthLogFuncTypeMeal");
      break;
    case 14:
    case 127:
      type = "PDA";
      break;
    case 15:
    case 126:
    case 128:
      type = "LPR";
      break;
    default:
      type = "";
      break;
  }
  return type;
}
function getLogFuncKey(value) {
  var key = "";
  switch (value) {
    case 1:
      key = dataManager.getString("Str_FKeyF1");
      break;
    case 2:
      key = dataManager.getString("Str_FKeyF2");
      break;
    case 3:
      key = dataManager.getString("Str_FKeyAccess");
      break;
    case 4:
      key = dataManager.getString("Str_FKeyF3");
      break;
    case 5:
      key = dataManager.getString("Str_FKeyF4");
      break;
    case 11:
      key = dataManager.getString("Str_FKeyAttend");
      break;
    case 12:
      key = dataManager.getString("Str_FKeyLeave");
      break;
    case 13:
      key = dataManager.getString("Str_FKeyAccess");
      break;
    case 14:
      key = dataManager.getString("Str_FKeyOut");
      break;
    case 15:
      key = dataManager.getString("Str_FKeyIn");
      break;
    case 21:
      key = dataManager.getString("Str_FKeyMenu1");
      break;
    case 22:
      key = dataManager.getString("Str_FKeyMenu2");
      break;
    case 23:
      key = dataManager.getString("Str_FKeyMenu5");
      break;
    case 24:
      key = dataManager.getString("Str_FKeyMenu3");
      break;
    case 25:
      key = dataManager.getString("Str_FKeyMenu4");
      break;
    case 63:
      key = dataManager.getString("Str_FKeyAccess");
      break;
    default:
      type = "";
      break;
  }
  return key;
}

function getConfiguredColumns() {
  // Retrieve the configured columns from localStorage
  const configuredColumns = localStorage
    .getItem("selectStorage_authLogExport")
    .split(",");

  return configuredColumns || [];
}

function processExportExcel(fileNum) {
  var locale = dataManager.getLocale();
  const configuredColumns = getConfiguredColumns(); // Get configured columns
  var R = new cpr.data.DataSet();
  var InputData = R.getRowDataRanged();
  var OutputFinal;

  var dsExportList = app.lookup("ExportAuthLogList");

  // Delete the GroupCode column
  //      dsExportList.deleteColumn("GroupCode");

  var total = dsExportList.getRowCount();

  for (var i = 0; i < total; i++) {
    var rowData = dsExportList.getRowData(i);
    var filteredRowData = {};

    // Only include the configured columns
    configuredColumns.forEach(function (column) {
      if (column in rowData) {
        filteredRowData[column] = rowData[column];
      }
    });

    // Check if GroupCode is in the configured columns, overwrite GroupCode with GroupName
    if (configuredColumns.includes("GroupCode") && rowData.GroupName) {
      filteredRowData.GroupCode = rowData.GroupName; // Set GroupCode to GroupName
    }

    // Add the filtered item to the final output if it has any keys
    if (Object.keys(filteredRowData).length > 0) {
      InputData.push(filteredRowData);
    }
  }

  var stringified = JSON.stringify(InputData);
  stringified = stringified.replace(
    /"TerminalID"/gi,
    '"' + dataManager.getString("Str_TerminalID") + '"'
  );
  stringified = stringified.replace(
    /"TerminalName"/gi,
    '"' + dataManager.getString("Str_TerminalName") + '"'
  );
  stringified = stringified.replace(
    /"UserID"/gi,
    '"' + dataManager.getString("Str_UserID") + '"'
  );
  stringified = stringified.replace(
    /"UniqueID"/gi,
    '"' + dataManager.getString("Str_UniqueID") + '"'
  );
  stringified = stringified.replace(
    /"GroupCode"/gi,
    '"' + dataManager.getString("Str_GroupName") + '"'
  );
  //  stringified = stringified.replace(
  //    /"GroupName"/gi,
  //    '"' + dataManager.getString("Str_GroupName") + '"'
  //  );
  stringified = stringified.replace(
    /"UserName"/gi,
    '"' + dataManager.getString("Str_UserName") + '"'
  );
  stringified = stringified.replace(
    /"PositionName"/gi,
    '"' + dataManager.getString("Str_Position") + '"'
  );
  stringified = stringified.replace(
    /"EventTime"/gi,
    '"' + dataManager.getString("Str_AuthEventTime") + '"'
  );
  stringified = stringified.replace(
    /"AuthType"/gi,
    '"' + dataManager.getString("Str_AuthType") + '"'
  );
  stringified = stringified.replace(
    /"AuthResult"/gi,
    '"' + dataManager.getString("Str_AuthResult") + '"'
  );
  stringified = stringified.replace(
    /"Func"/gi,
    '"' + dataManager.getString("Str_Func") + '"'
  );
  stringified = stringified.replace(
    /"FuncType"/gi,
    '"' + dataManager.getString("Str_FuncType") + '"'
  );
  stringified = stringified.replace(
    /"Card"/gi,
    '"' + dataManager.getString("Str_CardNum") + '"'
  );
  stringified = stringified.replace(
    /"IsPicture"/gi,
    '"' + dataManager.getString("Str_IsPicture") + '"'
  );
  stringified = stringified.replace(
    /"Latitude"/gi,
    '"' + dataManager.getString("Str_Latitude") + '"'
  );
  stringified = stringified.replace(
    /"Longitude"/gi,
    '"' + dataManager.getString("Str_Longitude") + '"'
  );
  stringified = stringified.replace(
    /"Property"/gi,
    '"' + dataManager.getString("Str_Property") + '"'
  );
  stringified = stringified.replace(
    /"ServerRecordTime"/gi,
    '"' + dataManager.getString("Str_ServerRecordTime") + '"'
  );
  stringified = stringified.replace(
    /"Dummy"/gi,
    '"' + dataManager.getString("Str_ExtraDevice") + '"'
  );
  stringified = stringified.replace(
    /"Detail"/gi,
    '"' + dataManager.getString("Str_Detail") + '"'
  );

  if (dataManager.getOemVersion() == OEM_INDO_MAURITIUS) {
    /* OEM_INDO_MAURITIUS 내보내기 Department(부서)추가 */
    stringified = stringified.replace(
      /"Department"/gi,
      '"' + dataManager.getString("Str_Department") + '"'
    );
  }
  OutputFinal = JSON.parse(stringified);

  /* original data */
  var today = dateLib.getToday();
  var dm_ExportParam = app.lookup("dm_ExportParam");
  if (dm_ExportParam.getValue("mode") == "CSV") {
    var filename = "AuthLogList_" + today + "_" + fileNum + ".csv"; // 가능여부 테스트 완료 - otk
  } else {
    var filename = "AuthLogList_" + today + "_" + fileNum + ".xlsx";
  }

  var ws_name = "AuthLogList_";

  var wb = XLSX.utils.book_new(),
    ws = XLSX.utils.json_to_sheet(OutputFinal);
  /* add worksheet to workbook */
  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  XLSX.writeFile(wb, filename);
}

function exportExcel(fileNum) {
  dataManager = getDataManager();
  var dsExportList = app.lookup("ExportAuthLogList");

  var total = dsExportList.getRowCount();
  for (var i = 0; i < total; i++) {
    var authLogInfo = dsExportList.getRow(i);

    var groupID = authLogInfo.getValue("GroupCode");
    var groupName = dataManager.getGroupName(groupID);
    authLogInfo.setValue("GroupName", groupName);

    var authType = authLogInfo.getValue("AuthType");
    var authTypeName = dataManager.getLogAuthTypeString(authType); //getLogAuthTypeString(parseInt(authType));

    if (
      dataManager.getOemVersion() == OEM_JAWOONDAE ||
      dataManager.getOemVersion() == OEM_HYUNDAI_MSEAT
    ) {
      if (parseInt(authType) == 9998) {
        authTypeName = "PDA";
      } else if (parseInt(authType) == 9999) {
        authTypeName = "LPR";
      }
    }

    authLogInfo.setValue("AuthType", authTypeName);

    var authResult = authLogInfo.getValue("AuthResult");
    var authResultName = getLogAuthResultString(parseInt(authResult));
    authLogInfo.setValue("AuthResult", authResultName);

    var funcType = authLogInfo.getValue("FuncType");
    var funcTypeName = getLogFuncType(parseInt(funcType));
    authLogInfo.setValue("FuncType", funcTypeName);

    //var funcKey = authLogInfo.getValue("Func");
    //var funcKeyName = getLogFuncKey(parseInt(funcKey));
    //authLogInfo.setValue("Func", funcKeyName);
    /* ExportAuthLogList에서 UserType 일단 삭제. 방문객 구현 완료시 추가
		var userType = authLogInfo.getValue("UserType");
		if( userType == "0") {
			userType = dataManager.getString("Str_User");
		} else {
			userType = dataManager.getString("Str_Visitor");
		}
		*/

    /* ExportAuthLogList에서 Property 일단 삭제. 로그 생성 위치, 저장 방법, 외부장비 종류, 관리자 개입 여부 기록 
				var property = authLogInfo.getValue("Property");
		* */
  }

  processExportExcel(fileNum);
}

// 도움말
function onALEMP_imgHelpPageClick(/* cpr.events.CMouseEvent */ e) {
  var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
  var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
    content: {
      Target: DLG_HELP,
      ID: menu_id,
    },
  });
  app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onALEMP_udcAuthlogListPagechange(/* cpr.events.CSelectionEvent */ e) {
  /**
   * @type udc.grid.authLogList
   */
  var aLEMP_udcAuthlogList = e.control;
  var dm_ExportParam = app.lookup("dm_ExportParam");
  dm_ExportParam.setValue("mode", "list");
  sendAuthLogListRequest();
}

// 아이티원향 엑셀 내보내
function processExportExcelITONE(fileNum) {
  var locale = dataManager.getLocale();
  var InputData;

  var dsExportList = app.lookup("ExportAuthLogList_ITONE");

  var total = dsExportList.getRowCount();

  dsExportList.deleteColumn("GroupCode");

  var stringified = JSON.stringify(dsExportList.getRowDataRanged());
  stringified = stringified.replace(
    /"TerminalID"/gi,
    '"' + dataManager.getString("Str_TerminalID") + '"'
  );
  stringified = stringified.replace(
    /"TerminalName"/gi,
    '"' + dataManager.getString("Str_TerminalName") + '"'
  );

  // 유니크아이디를 사용자아이디 처럼보이게
  stringified = stringified.replace(
    /"UniqueID"/gi,
    '"' + dataManager.getString("Str_UserID") + '"'
  );
  stringified = stringified.replace(
    /"GroupCode"/gi,
    '"' + dataManager.getString("Str_GroupCode") + '"'
  );

  // 그룹을 협력사로
  stringified = stringified.replace(
    /"GroupName"/gi,
    '"' + dataManager.getString("Str_PartnerCompany") + '"'
  );
  stringified = stringified.replace(
    /"UserName"/gi,
    '"' + dataManager.getString("Str_UserName") + '"'
  );

  // 직급을 직종
  stringified = stringified.replace(
    /"PositionName"/gi,
    '"' + dataManager.getString("Str_JobName") + '"'
  );
  stringified = stringified.replace(
    /"EventTime"/gi,
    '"' + dataManager.getString("Str_AuthEventTime") + '"'
  );
  stringified = stringified.replace(
    /"AuthType"/gi,
    '"' + dataManager.getString("Str_AuthType") + '"'
  );
  stringified = stringified.replace(
    /"AuthResult"/gi,
    '"' + dataManager.getString("Str_AuthResult") + '"'
  );
  stringified = stringified.replace(
    /"Func"/gi,
    '"' + dataManager.getString("Str_Func") + '"'
  );
  stringified = stringified.replace(
    /"FuncType"/gi,
    '"' + dataManager.getString("Str_FuncType") + '"'
  );

  InputData = JSON.parse(stringified);

  /* original data */
  var today = dateLib.getToday();
  var filename = "AuthLogList_" + today + "_" + fileNum + ".xlsx";
  var ws_name = "AuthLogList_";

  var wb = XLSX.utils.book_new(),
    ws = XLSX.utils.json_to_sheet(InputData);
  /* add worksheet to workbook */
  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  XLSX.writeFile(wb, filename);

  // 그룹코드 지웠으니 다시 생성
  dsExportList.addColumn(new cpr.data.header.DataHeader("GroupCode", "string"));
}

function exportExcelITONE(fileNum) {
  dataManager = getDataManager();
  var dsExportList = app.lookup("ExportAuthLogList_ITONE");

  var total = dsExportList.getRowCount();
  for (var i = 0; i < total; i++) {
    var authLogInfo = dsExportList.getRow(i);

    var groupID = authLogInfo.getValue("GroupCode");
    var groupName = dataManager.getGroupName(groupID);
    authLogInfo.setValue("GroupName", groupName);

    var authType = authLogInfo.getValue("AuthType");
    var authTypeName = dataManager.getLogAuthTypeString(authType); //getLogAuthTypeString(parseInt(authType));

    if (
      dataManager.getOemVersion() == OEM_JAWOONDAE ||
      dataManager.getOemVersion() == OEM_HYUNDAI_MSEAT
    ) {
      if (parseInt(authType) == 9998) {
        authTypeName = "PDA";
      } else if (parseInt(authType) == 9999) {
        authTypeName = "LPR";
      }
    }

    authLogInfo.setValue("AuthType", authTypeName);

    var authResult = authLogInfo.getValue("AuthResult");
    var authResultName = getLogAuthResultString(parseInt(authResult));
    authLogInfo.setValue("AuthResult", authResultName);

    var funcType = authLogInfo.getValue("FuncType");
    var funcTypeName = getLogFuncType(parseInt(funcType));
    authLogInfo.setValue("FuncType", funcTypeName);
  }
  processExportExcelITONE(fileNum);
}

/*
 * 버튼(ALEMP_dtiExportCSV)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onALEMP_dtiExportCSVClick(/* cpr.events.CMouseEvent */ e) {
  /**
   * @type cpr.controls.Button
   */
  var aLEMP_dtiExportCSV = e.control;
  ALEMP_exportFileOffset = 0;

  var totalLabel = app.lookup("ALEMP_opbTotal");
  var dmTotal = app.lookup("Total");
  var dm_ExportParam = app.lookup("dm_ExportParam");
  dm_ExportParam.setValue("mode", "CSV");
  dm_ExportParam.setValue("total", dmTotal.getValue("Count"));
  dm_ExportParam.setValue("offset", 0);
  if (totalLabel.value == 0) {
    dialogAlert(
      app,
      dataManager.getString("Str_Warning"),
      dataManager.getString("Str_AuthLogExportFail")
    );
  } else {
    var totalLabel = parseInt(totalLabel.value);
    if (totalLabel >= ALEMP_recvRowPerExport) {
      comLib.showLoadMask(
        "pro",
        dataManager.getString("Str_AuthLogExport"),
        "",
        totalLabel / ALEMP_recvRowPerExport
      );
    } else {
      comLib.showLoadMask(
        "pro",
        dataManager.getString("Str_AuthLogExport"),
        "",
        totalLabel / totalLabel
      );
    }
    sendAuthLogListRequest();
    return;
  }
}
