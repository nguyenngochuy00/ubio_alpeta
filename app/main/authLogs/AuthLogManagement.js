/************************************************
 * AuthLogManagement.js
 * Created at 2018. 12. 26. 오후 6:01:05.
 *
 * @author wonki
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var util = cpr.core.Module.require("lib/util");
var pageRowCount = 20;
var comLib;
var ALEMP_pageRowCount = 1000; // 사용안함
var ALMGR_recvRowPerExport = 2000;
var oem_version;
var customFlag = false;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e) {
  comLib = createComUtil(app);
  dataManager = getDataManager();

  var dtStart = app.lookup("ALMGR_dtStart");
  var dtEnd = app.lookup("ALMGR_dtEnd");

  //	dtStart.value = '2018-09-01';
  //	dtEnd.value = '2018-10-01';

  var date = moment().format("YYYY-MM-DD");
  var now = moment.utc(date).local();
  dtEnd.value = now.format("YYYY-MM-DD");

  //var before = now.add(-30, 'days');
  dtStart.value = now.format("YYYY-MM-DD");

  SetMaxDate();

  var groupList = dataManager.getGroup();
  var cmbGroup = app.lookup("ALMGR_cmbGroup");
  cmbGroup.setItemSet(groupList, {
    label: "Name",
    value: "GroupID",
  });

  //app.lookup("ALMGR_cmbOutputCount").value = 20;
  //pageRowCount = app.lookup("ALMGR_cmbOutputCount").value; // 초기값

  //var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
  //udcAuthLogList.setCurrentPaging(0, 1, 10, pageRowCount);

  var dm_ExportParam = app.lookup("dm_ExportParam");
  dm_ExportParam.setValue("mode", "list");

  if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
    var cmbSearchCategory = app.lookup("ALMGR_cmbCategory");
    cmbSearchCategory.addItem(new cpr.controls.Item("출입증번호", "cardnum"));
    app.lookup("ALMGR_cmbCategory").value = "user_name";
  }

  if (dataManager.getOemVersion() == OEM_HANAMICRON_EXDB_WORKTIME) {
    var cmdFuncType = app.lookup("ALMGR_cmbFuncType");
    cmdFuncType.visible = true;
    cmdFuncType.addItem(
      new cpr.controls.Item(dataManager.getString("Str_All"), "0")
    );
    cmdFuncType.addItem(
      new cpr.controls.Item(dataManager.getString("Str_TNA"), "1")
    );
    cmdFuncType.addItem(
      new cpr.controls.Item(dataManager.getString("Str_Meal"), "2")
    );
    cmdFuncType.selectItemByValue("0");
  }

  var ALMGR_cmbResult = app.lookup("ALMGR_cmbResult");
  ALMGR_cmbResult.addItem(
    new cpr.controls.Item(dataManager.getString("Str_All"), "0")
  );
  ALMGR_cmbResult.addItem(
    new cpr.controls.Item(dataManager.getString("Str_Success"), "1")
  );
  ALMGR_cmbResult.addItem(
    new cpr.controls.Item(dataManager.getString("Str_Fail"), "2")
  );
  ALMGR_cmbResult.selectItemByValue("0");

  oem_version = dataManager.getOemVersion();
  // 인증로그 레이아웃: 커스텀 버전에 따라 udc 생성하여 addChild
  var customLyout = app.lookup("authLogListLayout");
  var udcAuthLogList;
  switch (oem_version) {
    case OEM_HYUNDAI_EC: // 인증로그 체크박스 선택이 가능한 udc
      udcAuthLogList = new udc.grid.authLogListCkb("ALMGR_udcAuthLogList");

      // 전송 버튼: 선택된 인증로그 전송
      var customBT = app.lookup("btCustom");
      customBT.value = "전송";
      customBT.visible = true;

      break;
    case OEM_ARMY_HQ:
    case OEM_ROKMCH:
      udcAuthLogList = new udc.grid.authLogListAMHQ("ALMGR_udcAuthLogList");
      break;
    case OEM_LOTTE_CS:
      udcAuthLogList = new udc.grid.authLogListLotteCS("ALMGR_udcAuthLogList");
      break;
    case OEM_UMS_QRCODE:
      udcAuthLogList = new udc.grid.authLogListUMSQRCODE(
        "ALMGR_udcAuthLogList"
      );
      break;
    case OEM_ITONE_POSCO_DX:
    case OEM_ITONE_TRDATA:
      var customBT = app.lookup("btCustom");
      customBT.value = "수동 동기화";
      customBT.visible = true;
      app.lookup("ALMGR_SmartSafety").visible = true;

      app
        .lookup("ALMG_opbGroup")
        .bind("value")
        .toLanguage("Str_PartnerCompany");
      udcAuthLogList = new udc.grid.authLogListITONE("ALMGR_udcAuthLogList");

      // 콤보박스에 아이디 관련 검색 제거 (보이는 아이디는 유니크아이디이므로)
      var cmbCategory = app.lookup("ALMGR_cmbCategory");
      cmbCategory.deleteItemByValue("user_id");
      cmbCategory.deleteItemByValue("unique_id");
      cmbCategory.addItem(
        new cpr.controls.Item(dataManager.getString("Str_All"), "all")
      );
      cmbCategory.addItem(
        new cpr.controls.Item(dataManager.getString("Str_Name"), "user_name")
      );
      cmbCategory.addItem(
        new cpr.controls.Item(dataManager.getString("Str_ID"), "user_id")
      );
      cmbCategory.addItem(
        new cpr.controls.Item(
          dataManager.getString("Str_CardNumber"),
          "card_number"
        )
      );
      cmbCategory.addItem(
        new cpr.controls.Item(
          dataManager.getString("Str_TerminalName"),
          "terminal_name"
        )
      );
      cmbCategory.addItem(
        new cpr.controls.Item(
          dataManager.getString("Str_UniqueID"),
          "unique_id"
        )
      );
      cmbCategory.addItem(
        new cpr.controls.Item(
          dataManager.getString("Str_UserType"),
          "user_type"
        )
      );
      break;
    default:
      udcAuthLogList = new udc.grid.authLogList("ALMGR_udcAuthLogList");
      udcAuthLogList.setAppProperty("requestMenu", "AuthLogManagement");
      break;
  }

  if (oem_version != OEM_INDO_BNP_CNP) {
    app.lookup("ALMGR_cmbCategory").deleteItemByValue("user_type");
  }

  udcAuthLogList.addEventListener(
    "pagechange",
    onALMGR_udcAuthLogListPagechange
  );
  udcAuthLogList.addEventListener("dblclick", onALMGR_udcAuthLogListDblclick);
  customLyout.addChild(udcAuthLogList, { colIndex: 0, rowIndex: 0 });

  customLyout.redraw();
  sendAuthLogListRequest();

  // 영상로그
  initForVideoLog();
}

function SetMaxDate() {
  var date = new Date();
  date.setFullYear(date.getFullYear()); // y년을 더함
  date.setMonth(date.getMonth()); // m월을 더함
  date.setDate(date.getDate()); // d일을 더함

  app.lookup("ALMGR_dtStart").maxDate = date;
  app.lookup("ALMGR_dtEnd").maxDate = date;
}

// 인증로그 검색 버튼 클릭시
function onButtonClick(/* cpr.events.CMouseEvent */ e) {
  if (!customFlag) {
    // 일반 검색
    SearchNormalList();
  } else {
    // 아이티원 커스텀 검색
    SearchItoneLog();
  }
}

function SearchNormalList() {
  var startTime = app.lookup("ALMGR_dtStart").value;
  var endTime = app.lookup("ALMGR_dtEnd").value;
  var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
  if (isStartEndDateValid === false) {
    dialogAlert(
      app.getHostAppInstance(),
      "error",
      dataManager.getString("Str_ErrorStartEndDateInvalid")
    );
    return false;
  }
  var dm_ExportParam = app.lookup("dm_ExportParam");
  dm_ExportParam.setValue("mode", "list");

  var dsAuthLogList = app.lookup("AuthLogList");
  dsAuthLogList.clear();
  var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
  udcAuthLogList.setAuthLogList(dsAuthLogList);
  udcAuthLogList.setCurrentPageIndex(1);
  sendAuthLogListRequest();
}

function sendAuthLogListRequest() {
  var dtStart = app.lookup("ALMGR_dtStart");
  var dtEnd = app.lookup("ALMGR_dtEnd");

  var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
  var curIndex = udcAuthLogList.getCurrentPageIndex();
  var offset = (curIndex - 1) * pageRowCount;

  var smsGetAuthLogList = app.lookup("sms_getAuthLogList");
  smsGetAuthLogList.removeAllParameters();

  var cmbCategory = app.lookup("ALMGR_cmbCategory");
  var edtKeyword = app.lookup("ALMGR_edtKeyword");

  smsGetAuthLogList.setParameters("startTime", dtStart.value + " 00:00:00");
  smsGetAuthLogList.setParameters("endTime", dtEnd.value + " 23:59:59");
  smsGetAuthLogList.setParameters("offset", offset);
  smsGetAuthLogList.setParameters("limit", pageRowCount);

  var cmbGroup = app.lookup("ALMGR_cmbGroup");
  if (cmbGroup.value != null && cmbGroup.value != null) {
    smsGetAuthLogList.setParameters("groupID", cmbGroup.value);
  }

  if (edtKeyword.value == "") {
    cmbCategory.value = "all";
  }

  if (cmbCategory.value == "terminal_name") {
    var bFound = false;
    for (var i = 0; i < dataManager.getTerminalList().getRowCount(); i++) {
      var row = dataManager.getTerminalList().getRow(i);
      if (row.getValue("Name") == edtKeyword.value) {
        smsGetAuthLogList.setParameters("searchCategory", "terminal_id");
        smsGetAuthLogList.setParameters("searchKeyword", row.getValue("ID"));
        bFound = true;
        break;
      }
    }
    if (bFound == false) {
      return;
    }
  } else if (cmbCategory.value != null && cmbCategory.value.length > 0) {
    smsGetAuthLogList.setParameters("searchCategory", cmbCategory.value);
    if (edtKeyword.value != null && edtKeyword.value.length > 0) {
      smsGetAuthLogList.setParameters("searchKeyword", edtKeyword.value);
    }
  }

  if (dataManager.getOemVersion() == OEM_HANAMICRON_EXDB_WORKTIME) {
    var cmdFuncType = app.lookup("ALMGR_cmbFuncType");
    smsGetAuthLogList.setParameters("Keyword2", cmdFuncType.value);
    console.log("Keyword2 : " + cmdFuncType.value);
  }

  //console.log("category : " + cmbCategory.value);
  //console.log("keyword : " + edtKeyword.value);

  //2019-11-29 새로 추가한 소스
  var dm_ExportParam = app.lookup("dm_ExportParam");
  if (dm_ExportParam.getValue("mode") == "export") {
    smsGetAuthLogList.setParameters(
      "offset",
      dm_ExportParam.getValue("offset")
    );
    smsGetAuthLogList.setParameters("limit", ALMGR_recvRowPerExport);
  }
  //2019-11-29 추가 끝

  var ALMGR_cmbResult = app.lookup("ALMGR_cmbResult");
  if (ALMGR_cmbResult.value == "1") {
    smsGetAuthLogList.setParameters("authResult", 1);
  } else if (ALMGR_cmbResult.value == "2") {
    smsGetAuthLogList.setParameters("authResult", 2);
  } else {
    smsGetAuthLogList.setParameters("authResult", 0);
  }

  var dsAuthLogList = app.lookup("AuthLogList");
  dsAuthLogList.clear();
  var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
  udcAuthLogList.setAuthLogList(dsAuthLogList);
  udcAuthLogList.setPaging(0, pageRowCount, 0);

  smsGetAuthLogList.send();
  var dm_ExportParam = app.lookup("dm_ExportParam");
  if (dm_ExportParam.getValue("mode") == "list") {
    comLib.showLoadMask("", dataManager.getString("Str_ListLoading"), "");
  }
}

// 인증로그 리스트 가져오기 완료
function onSms_getAuthLogListSubmitSuccess(
  /* cpr.events.CSubmissionEvent */ e
) {}

function pad(n, width) {
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join("0") + n;
}

function onSms_getAuthLogListSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
  var temperatureUnit = dataManager.getTemperatureUnit();

  var resultCode = app.lookup("Result").getValue("ResultCode");
  if (resultCode == COMERROR_NONE) {
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
        //ReserveType = 1  온도
        var data = logInfo.getValue("ReserveData").split(",");
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

        // otk 추가 수정 마스크관련
        if (data[0] == 0) {
          var temp = "";
          if (data[1] == 1) {
            temp = dataManager.getString("Str_Mask") + " ";
          } else if (data[1] == 2) {
            temp = dataManager.getString("Str_MaskInvalid") + " ";
          } else if (data[1] == 3) {
            temp = dataManager.getString("Str_MaskNo") + " ";
          }
          logInfo.setValue("Detail", temp);
        } else {
          var alcolValue = data[2] | (data[3] << 8);
          alcolValue = data[1] + "." + pad(alcolValue, 3);
          console.log(alcolValue);
          alcolValue = parseFloat(alcolValue).toFixed(3);
          strData = strData + alcolValue;
          logInfo.setValue("Detail", strData);
        }
      }
    }
    var dmTotal = app.lookup("Total");
    var totalCount = parseInt(dmTotal.getValue("Count"));

    //2019-11-29 신규 추가
    var dm_ExportParam = app.lookup("dm_ExportParam");
    if (dm_ExportParam.getValue("mode") == "list") {
      var viewPageCount =
        totalCount / pageRowCount + (totalCount % pageRowCount > 0);
      if (viewPageCount > 10) {
        viewPageCount = 10;
      }
      pageRowCount = parseInt(pageRowCount, 0); // pageRowCount가 String 형태로 넘어가고 있었는데, String 형태로 넘기면 페이징에 오류가 있어 int로 바꿈

      var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");

      udcAuthLogList.setAuthLogList(dsAuthLogList);
      udcAuthLogList.setPaging(totalCount, pageRowCount, viewPageCount);
      comLib.hideLoadMask();
    } else {
      var exportAuthLogList = app.lookup("ExportAuthLogList");

      if (dsAuthLogList.getRowCount() == 0) {
        comLib.hideLoadMask();
        if (exportAuthLogList.getRowCount() > 0) {
          exportExcel();
          exportAuthLogList.clear();
        } else {
          dialogAlert(
            app,
            dataManager.getString("Str_Warning"),
            dataManager.getString("Str_NoItemSave")
          );
        }
      } else {
        if (exportAuthLogList.getRowCount() == 0) {
          // 엑셀 내보내기시 전체 수를 처음에는 알 수 없으므로 첫번째 리스트 수신시 전체 카운트 셋팅
          dm_ExportParam.setValue("total", totalCount);

          //comLib.hideLoadMask();
          comLib.showLoadMask(
            "pro",
            dataManager.getString("Str_ListLoading"),
            "",
            totalCount / ALMGR_recvRowPerExport
          );
        }
        //dsAuthLogList.copyToDataSet(exportAuthLogList)
        for (i = 0; i < count; i++) {
          exportAuthLogList.pushRowData(dsAuthLogList.getRowData(i));
        }

        if (
          exportAuthLogList.getRowCount() >= dm_ExportParam.getValue("total")
        ) {
          comLib.showLoadMask(
            "",
            dataManager.getString("Str_ExcelDataConversion"),
            ""
          );

          setTimeout(function () {
            exportExcel();
            exportAuthLogList.clear();
          }, 100);
        } else {
          var offset = dm_ExportParam.getValue("offset");
          offset += ALMGR_recvRowPerExport;
          dm_ExportParam.setValue("offset", offset);
          comLib.updateLoadMask(offset);
          sendAuthLogListRequest();
        }
      }
    }
    //2019-11-29 신규 끝

    switch (oem_version) {
      case OEM_HYUNDAI_EC:
        // 커스템 데이터 가져오기
        var dsAuthLogCustom = app.lookup("AuthLogCustomHDEC");
        dsAuthLogCustom.clear();

        var smsGetAuthLogCustom = app.lookup("sms_getAuthLogCustomsHDEC");

        var IndexKeys = "";
        for (var i = 0; i < count; i++) {
          var logInfo = dsAuthLogList.getRow(i);
          IndexKeys += logInfo.getValue("IndexKey");
          IndexKeys += ",";
        }

        smsGetAuthLogCustom.setParameters("IndexKeys", IndexKeys);
        smsGetAuthLogCustom.send();
        break;
      default:
        break;
    }
    app.lookup("ALMGR_grp").redraw();
  } else {
    var errStr = getErrorString(resultCode);
    var errMsg = "Str_AuthLog";
    if (errStr.length > 0) {
      errMsg = dataManager.getString(errStr);
    } else {
      errMsg = dataManager.getString(errMsg);
    }
    comLib.hideLoadMask();
    dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
  }
  app.lookup("ALMGR_grp").redraw();
}

function onSms_getAuthLogListSubmitError(/* cpr.events.CSubmissionEvent */ e) {
  app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getAuthLogListSubmitTimeout(
  /* cpr.events.CSubmissionEvent */ e
) {
  app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onALMGR_udcAuthLogListPagechange(/* cpr.events.CSelectionEvent */ e) {
  /**
   * @type udc.grid.authLogList
   */
  var aLMGR_udcAuthLogList = e.control;

  var oemVersion = dataManager.getOemVersion();
  if (
    (oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) &&
    customFlag
  ) {
    sendITONEAuthLogListRequest();
  } else {
    sendAuthLogListRequest();
  }
}

/*
 * 인풋 박스에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onALMGR_edtKeywordKeydown(/* cpr.events.CKeyboardEvent */ e) {
  /**
   * @type cpr.controls.InputBox
   */
  var aLMGR_edtKeyword = e.control;

  if (e.keyCode == 13) {
    var oemVersion = dataManager.getOemVersion();
    if (
      (oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) &&
      customFlag
    ) {
      sendITONEAuthLogListRequest();
    } else {
      sendAuthLogListRequest();
    }
  }
}

/*
 * 콤보 박스에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onALMGR_cmbCategoryMousedown(/* cpr.events.CMouseEvent */ e) {
  /**
   * @type cpr.controls.ComboBox
   */
  var aLMGR_cmbCategory = e.control;
  if (e.keyCode == 13) {
    var oemVersion = dataManager.getOemVersion();
    if (
      (oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) &&
      customFlag
    ) {
      sendITONEAuthLogListRequest();
    } else {
      sendAuthLogListRequest();
    }
  }
}

/*
 * 사용자 정의 컨트롤에서 dblclick 이벤트 발생 시 호출.
 */
function onALMGR_udcAuthLogListDblclick(/* cpr.events.CSelectionEvent */ e) {
  var oemVersion = dataManager.getOemVersion();
  if (
    (oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) &&
    customFlag
  ) {
    return;
  }

  if (
    dataManager.getOemVersion() == OEM_DUKYANG_WARDOFFICE &&
    dataManager.getAccountID() != 0xde0b6b3a7640000
  ) {
    return;
  }

  var dsAuthLogList = app.lookup("ALMGR_udcAuthLogList");
  var selectionRow = dsAuthLogList.getSelectedRow();

  if (
    selectionRow.getStateString() == "D" ||
    selectionRow.getStateString() == "ID"
  ) {
    return;
  }
  var cmbCategory = app.lookup("ALMGR_cmbCategory");
  var edtKeyword = app.lookup("ALMGR_edtKeyword");

  var indexKey = selectionRow.getRowData()["IndexKey"];

  // 영상로그 관련 정보 setting -mjy
  var dsTerminalList = app.lookup("TerminalList");
  var vurixConfig = app.lookup("VurixServerInfo");
  var videoLogConfig = {
    dsTerminalList: dsTerminalList,
    vurixConfig: vurixConfig,
  };

  var param = [cmbCategory.value, edtKeyword.value, videoLogConfig];
  var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
    content: {
      Target: DLG_AUTHLOG_VIEW,
      ID: indexKey,
      Param: param,
    },
  });

  app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 도움말
function onALMGR_imgHelpPageClick(/* cpr.events.CMouseEvent */ e) {
  var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
  var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
    content: { Target: DLG_HELP, ID: menu_id },
  });
  app.getHostAppInstance().dispatchEvent(selectionEvent);
}

function onALEMP_dtiExportClick(/* cpr.events.CMouseEvent */ e) {
  var totalLabel = app.lookup("ALMGR_opbTotal");
  var dmTotal = app.lookup("Total");
  var dm_ExportParam = app.lookup("dm_ExportParam");
  dm_ExportParam.setValue("mode", "export");
  dm_ExportParam.setValue("total", dmTotal.getValue("Count"));
  dm_ExportParam.setValue("offset", 0);
  comLib.showLoadMask(
    "pro",
    dataManager.getString("Str_UserExport"),
    "",
    parseInt(totalLabel.value) / 1000
  );

  sendAuthLogListRequest();
}

function getLogAuthTypeString(value) {
  var type = "";
  switch (value) {
    case 1:
      type = dataManager.getString("Str_AuthTypeFPVerify");
      break;
    case 2:
      type = dataManager.getString("Str_AuthTypeFPIdentify");
      break;
    case 3:
      type = dataManager.getString("Str_Password");
      break;
    case 4:
      type = dataManager.getString("Str_Card");
      break;
    case 5:
      type = dataManager.getString("Str_AuthTypeFaceVerify");
      break;
    case 6:
      type = dataManager.getString("Str_AuthTypeFaceIdentify");
      break;
    case 7:
      type = dataManager.getString("Str_MobileCard");
      break;
    case 8:
      type = dataManager.getString("Str_TypeQR");
      break;

    case 15:
      type = dataManager.getString("Str_Inside");
      break;
    case 16:
      type = dataManager.getString("Str_NotAssigned");
      break;

    default:
      return "";
      break;
  }
  return type;
}

function getLogAuthResultString(value) {
  var type = "";
  switch (value) {
    case 0:
      type = dataManager.getString("Str_Success");
      break;
    case 1:
      type = dataManager.getString("Str_AuthResultFail");
      break;
    case 2:
      type = dataManager.getString("Str_AuthResultAccessDenied");
      break;
    case 3:
      type = dataManager.getString("Str_AuthResultTimeout");
      break;
    case 4:
      type = dataManager.getString("Str_AuthResultTimeoutCapture");
      break;
    case 5:
      type = dataManager.getString("Str_AuthResultTimeoutIdentify");
      break;
    case 6:
      type = dataManager.getString("Str_AuthResultAntiPassback");
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

    default:
      type = "";
      break;
  }
  return type;
}
function exportExcel() {
  dataManager = getDataManager();
  var dsAuthLogList = app.lookup("ExportAuthLogList");
  var total = dsAuthLogList.getRowCount();
  comLib.showLoadMask(
    "pro",
    dataManager.getString("Str_UserExport"),
    "",
    total
  );
  for (var i = 0; i < total; i++) {
    var authLogInfo = dsAuthLogList.getRow(i);

    var groupName = authLogInfo.getValue("GroupName");
    //var groupName = dataManager.getGroupName(groupID);
    authLogInfo.setValue("GroupName", groupName);

    var authType = authLogInfo.getValue("AuthType");
    var authTypeName = getLogAuthTypeString(parseInt(authType));
    authLogInfo.setValue("AuthType", authTypeName);

    var authResult = authLogInfo.getValue("AuthResult");
    var authResultName = getLogAuthResultString(parseInt(authResult));
    authLogInfo.setValue("AuthResult", authResultName);

    var funcType = authLogInfo.getValue("FuncType");
    var funcTypeName = getLogFuncType(parseInt(funcType));
    authLogInfo.setValue("FuncType", funcTypeName);
    // funckey
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

  /* original data */
  var today = dateLib.getToday();
  var filename = "AuthLogList_" + today + ".xlsx";
  var ws_name = "AuthLogList_";

  var wb = XLSX.utils.book_new(),
    ws = XLSX.utils.json_to_sheet(dsAuthLogList.getRowDataRanged());
  /* add worksheet to workbook */
  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  XLSX.writeFile(wb, filename);
  comLib.hideLoadMask();
}

/*
 * 그룹에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGroupDblclick(/* cpr.events.CMouseEvent */ e) {
  /**
   * @type cpr.controls.Container
   */
  var group = e.control;

  var ENABLE_INNODEP_VMS = dataManager.getENABLE_INNODEP_VMS();
  if (ENABLE_INNODEP_VMS == 1) {
    var usint_version = dataManager.getSystemVersion();

    var option = {
      width: 500,
      height: 500,
      right: app.getContainer().getActualRect().left / 4,
    };

    var appld = "app/main/vmsInnodep/vmsInnodepPlayback" + "?" + usint_version;
    app.openDialog(appld, option, function (dialog) {
      dialog.bind("headerTitle").toLanguage("Str_AddEnterTerminal");

      dialog.modal = true;
      /*
       * code : 입출구구분코드, tmp : 입출구구분코드에 따른 입출구 안티패스백 데이터셋, selectArea: 현재 사이드 그리드에서 선택된 구역의 ID값, areas: 구역목록데이터셋
       * antipass: 안티패스백 데이터셋
       */
      //dialog.initValue = {code: code, tmp: code=="ent"?tmpEntranceList:tmpExitList, selectArea: selectAreaRow.getValue("AreaID"),
      //					areas: app.lookup("AreaList"), antipass: app.lookup("AntipassBack")};
      dialog.addEventListenerOnce("close", function (e) {
        var result = dialog.returnValue;
        if (result) {
        }
      });
    });
  }
}

/*
 * "Custom" 버튼(btCustom)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtCustomClick(/* cpr.events.CMouseEvent */ e) {
  /**
   * @type cpr.controls.Button
   */
  var btCustom = e.control;

  switch (oem_version) {
    case OEM_HYUNDAI_EC:
      var smsSendAuthLog = app.lookup("sms_sendAuthLogsHDEC");

      var checkIndexList = app
        .lookup("ALMGR_udcAuthLogList")
        .getAuthLogCheckRowHDEC();
      var authLogData = app.lookup("AuthLogList");
      var IndexKeys = "";
      for (var i = 0; i < checkIndexList.length; i++) {
        var authLog = authLogData.getRow(checkIndexList[i]);
        IndexKeys += authLog.getValue("IndexKey");
        if (i != checkIndexList.length - 1) {
          IndexKeys += ",";
        }
      }

      // console.log("IndexKeys: ", IndexKeys);
      smsSendAuthLog.setParameters("IndexKeys", IndexKeys);
      smsSendAuthLog.send();
      break;
    case OEM_ITONE_POSCO_DX:
    case OEM_ITONE_TRDATA:
      comLib.showLoadMask("", dataManager.getString("Str_Load"), "", 1);
      var smsManualSync = app.lookup("sms_manualSyncITONE");

      /* 기존엔 보이는 로그만 동기화했음.
       * 변경 : 통신 안된 로그들을 전부 동기화.
       * 즉, 로그를 담아서 서버에 보낼 필요는 없음
       */

      // 체크한것만 동기화 할 건지는 나중에
      //		var checkIndexList = app.lookup("ALMGR_udcAuthLogList").getCheckedRowIndices();
      var dsAuthLogList = app.lookup("AuthLogList");
      //		for(var i=0; i < checkIndexList; i++) {
      //			var authLog = dsAuthLogList.getRow(checkIndexList[i]);
      //
      //		}

      smsManualSync.send();
      break;
    default:
      break;
  }
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAuthLogCustomsHDECSubmitDone(
  /* cpr.events.CSubmissionEvent */ e
) {
  /**
   * @type cpr.protocols.Submission
   */
  var sms_getAuthLogCustomsHDEC = e.control;

  var resultCode = app.lookup("Result").getValue("ResultCode");
  if (resultCode == COMERROR_NONE) {
    var dsAuthLogCustom = app.lookup("AuthLogCustomHDEC");

    var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
    udcAuthLogList.setAuthLogCustomHDEC(dsAuthLogCustom);
  }

  app.lookup("ALMGR_grp").redraw();
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getAuthLogCustomsHDECSubmitError(
  /* cpr.events.CSubmissionEvent */ e
) {
  /**
   * @type cpr.protocols.Submission
   */
  var sms_getAuthLogCustomsHDEC = e.control;

  console.log("onSms_getAuthLogCustomsHDECSubmitError");

  var result = app.lookup("Result");
  result.setValue("ResultCode", COMERROR_NET_ERROR);
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_getAuthLogCustomsHDECSubmitTimeout(
  /* cpr.events.CSubmissionEvent */ e
) {
  /**
   * @type cpr.protocols.Submission
   */
  var sms_getAuthLogCustomsHDEC = e.control;

  console.log("onSms_getAuthLogCustomsHDECSubmitTimeout");

  var result = app.lookup("Result");
  result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_sendAuthLogsHDECSubmitDone(/* cpr.events.CSubmissionEvent */ e) {
  /**
   * @type cpr.protocols.Submission
   */
  var sms_sendAuthLogsHDEC = e.control;

  var sms_getAuthLogCustomsHDEC = e.control;

  var resultCode = app.lookup("Result").getValue("ResultCode");
  if (resultCode == COMERROR_NONE) {
    alert("전송 요청");
    sendAuthLogListRequest();
  }
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_sendAuthLogsHDECSubmitError(
  /* cpr.events.CSubmissionEvent */ e
) {
  /**
   * @type cpr.protocols.Submission
   */
  var sms_sendAuthLogsHDEC = e.control;

  console.log("onSms_sendAuthLogsHDECSubmitError");

  var result = app.lookup("Result");
  result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSms_sendAuthLogsHDECSubmitTimeout(
  /* cpr.events.CSubmissionEvent */ e
) {
  /**
   * @type cpr.protocols.Submission
   */
  var sms_sendAuthLogsHDEC = e.control;

  console.log("onSms_sendAuthLogsHDECSubmitTimeout");

  var result = app.lookup("Result");
  result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onALMGR_cmbCategorySelectionChange(
  /* cpr.events.CSelectionEvent */ e
) {
  /**
   * @type cpr.controls.ComboBox
   */
  var aLMGR_cmbCategory = e.control;
  if (oem_version == OEM_INDO_BNP_CNP) {
    if (app.lookup("ALMGR_cmbCategory").value == "user_type") {
      app.lookup("ALMGR_edtKeyword").value = 100;
      app.lookup("ALMGR_edtKeyword").visible = false;
    } else {
      app.lookup("ALMGR_edtKeyword").visible = true;
      app.lookup("ALMGR_edtKeyword").clear();
    }
  }
}

// 영상로그 작업을 위한 초기 데이터 세팅
function initForVideoLog() {
  // 스탠다드 이상만 보내도록 수정
  if (dataManager.getSystemLicenseLevel() >= LicenseSTANDARD) {
    var terminalList = dataManager.getTerminalList();
    if (terminalList) {
      var dsTerminalList = app.lookup("TerminalList");
      dsTerminalList.clear();

      var LoginUserInfo = dataManager.getAccountInfo();
      var LoginUserID = LoginUserInfo.getValue("UserID");
      var LoginPrivilege = LoginUserInfo.getValue("Privilege");

      for (var i = 0; i < terminalList.getRowCount(); i++) {
        var terminalInfo = terminalList.getRow(i);

        dsTerminalList.addRowData(terminalInfo.getRowData());
      }
    }
    if (dataManager.getENABLE_MULTIVIEW() == 1) {
      app.lookup("sms_getVurixDeviceList").send();
    }
  }
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getVurixDeviceListSubmitDone(
  /* cpr.events.CSubmissionEvent */ e
) {
  /**
   * @type cpr.protocols.Submission
   */
  var sms_getVurixDeviceList = e.control;
  var resultCode = app.lookup("Result").getValue("ResultCode");
  var vurixDeviceList = app.lookup("VurixDeviceList");
  if (resultCode == 0) {
    console.log("Vurix DeviceList 수신 완료");
    //		console.log(vurixDeviceList.getRowDataRanged());

    mapping_DeviceToTerminal();
  } else {
    console.log("Vurix DeviceList 수신 실패 :");
    console.log(dataManager.getString(getErrorString(resultCode)));
    // alert로 Vurix와 API 통신 실패했다는 걸 알리는 건 애매함..
  }
}

// dev_addr 과 IPAddress 매핑
function mapping_DeviceToTerminal() {
  var dsTerminalList = app.lookup("TerminalList");
  var cnt = dsTerminalList.getRowCount();

  var dsDeviceList = app.lookup("VurixDeviceList");
  var deviceCnt = dsDeviceList.getRowCount();

  for (var i = 0; i < deviceCnt; i++) {
    var row = dsDeviceList.getRow(i);
    var dev_name = row.getValue("dev_name");
    var tId = dev_name.substring(0, dev_name.indexOf("_")); // 첫번째  "_" 이전은 id
    var tName = dev_name.substring(dev_name.indexOf("_") + 1); // 첫번째"_" 이후는 이름

    var terminalRow = dsTerminalList.findFirstRow(
      "ID == '" + tId + "' && Name == '" + tName + "'"
    );

    if (terminalRow) {
      terminalRow.setValue("dev_serial", row.getValue("dev_serial"));
    } else {
      continue;
    }
  }

  // 매핑된 dev_serial 확인
  if (dsTerminalList.findAllRow("dev_serial != '" + "" + "'").length > 0) {
    //		var rows = dsTerminalList.findAllRow("dev_serial != '"+""+"'");
    //		rows.forEach(function(each){
    //			console.log("dev_serial : " + each.getValue("dev_serial"));
    //		});
    console.log("ip 매핑 완료");
  } else {
    console.log("매핑 작업 실패 Vurix 세팅 확인 필요");
  }
}
function onSms_manualSyncITONESubmitDone(/* cpr.events.CSubmissionEvent */ e) {
  /**
   * @type cpr.protocols.Submission
   */
  var sms_manualSyncITONE = e.control;
  comLib.hideLoadMask();

  var resultCode = app.lookup("Result").getValue("ResultCode");
  if (resultCode == COMERROR_NONE) {
    dialogAlert(app, "동기화 완료", dataManager.getString("Str_Success"));
  } else {
    dialogAlert(
      app,
      "error",
      dataManager.getString(getErrorString(resultCode))
    );
  }
}

/*
 * "SmartSafety" 버튼(ALMGR_SmartSafety)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onALMGR_SmartSafetyClick(/* cpr.events.CMouseEvent */ e) {
  /**
   * @type cpr.controls.Button
   */
  var aLMGR_SmartSafety = e.control;

  customFlag = !customFlag;

  var oemVersion = dataManager.getOemVersion();
  if (oemVersion == OEM_ITONE_TRDATA || oemVersion == OEM_ITONE_POSCO_DX) {
    var customLyout = app.lookup("authLogListLayout");
    customLyout.removeAllChildren();

    var udcAuthLogList;

    // 처음 들어온 경우 -> smartSafety Log로 변경
    if (customFlag) {
      app.lookup("ALMGR_SmartSafety").value = "인증로그";
      udcAuthLogList = new udc.grid.authLogListITONE2("ALMGR_udcAuthLogList");

      // 콤보박스에 아이디 관련 검색 제거 (보이는 아이디는 유니크아이디이므로)
      var cmbCategory = app.lookup("ALMGR_cmbCategory");
      //			cmbCategory.deleteAllItems();
      cmbCategory.addItem(new cpr.controls.Item("workerID", "worker_id"));
      cmbCategory.setFilter("value == 'worker_id'");

      udcAuthLogList.addEventListener(
        "pagechange",
        onALMGR_udcAuthLogListPagechange
      );
      udcAuthLogList.addEventListener(
        "dblclick",
        onALMGR_udcAuthLogListDblclick
      );
      customLyout.addChild(udcAuthLogList, { colIndex: 0, rowIndex: 0 });

      customLyout.redraw();
      sendITONEAuthLogListRequest();
    } else {
      app.lookup("ALMGR_SmartSafety").value = "전송확인";
      udcAuthLogList = new udc.grid.authLogListITONE("ALMGR_udcAuthLogList");

      // 카테고리 초기화
      var cmbCategory = app.lookup("ALMGR_cmbCategory");
      cmbCategory.deleteItemByValue("worker_id");
      cmbCategory.clearFilter();

      udcAuthLogList.addEventListener(
        "pagechange",
        onALMGR_udcAuthLogListPagechange
      );
      udcAuthLogList.addEventListener(
        "dblclick",
        onALMGR_udcAuthLogListDblclick
      );
      customLyout.addChild(udcAuthLogList, { colIndex: 0, rowIndex: 0 });

      customLyout.redraw();
      sendAuthLogListRequest();
    }
  }
}

function sendITONEAuthLogListRequest() {
  var dtStart = app.lookup("ALMGR_dtStart");
  var dtEnd = app.lookup("ALMGR_dtEnd");

  var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
  var curIndex = udcAuthLogList.getCurrentPageIndex();
  var offset = (curIndex - 1) * pageRowCount;

  var smsGetAuthLogList = app.lookup("sms_getAuthLogListCustomITONE");
  smsGetAuthLogList.removeAllParameters();

  var cmbCategory = app.lookup("ALMGR_cmbCategory");
  var edtKeyword = app.lookup("ALMGR_edtKeyword");

  smsGetAuthLogList.setParameters("startTime", dtStart.value + " 00:00:00");
  smsGetAuthLogList.setParameters("endTime", dtEnd.value + " 23:59:59");
  smsGetAuthLogList.setParameters("offset", offset);
  smsGetAuthLogList.setParameters("limit", pageRowCount);

  var cmbGroup = app.lookup("ALMGR_cmbGroup");
  if (cmbGroup.value != null && cmbGroup.value != "0") {
    var groupList = dataManager.getGroup();
    var cnt = groupList.getRowCount();

    // 선택한 그룹과 일치하는 그룹을 찾아서 groupCode를 통해 현장 or 협력사 코드를 찾아낸다.
    var groupCode = groupList
      .findFirstRow("GroupID == " + cmbGroup.value)
      .getValue("GroupCode");
    var chkSep = groupCode.split("_").length;
    if (chkSep != 1) {
      // length 1이면 현장 , 2면 현장_협력사
      groupCode = groupCode.split("_")[1]; // 0번 인덱스는 현장코드, 1번인덱스는 협력사코드
    } else {
      groupCode = "";
    }

    // string이므로 keyword2로 ..
    smsGetAuthLogList.setParameters("searchKeyword2", groupCode);
  }

  var ALMGR_cmbResult = app.lookup("ALMGR_cmbResult");
  // 0: 전체, 1: 성공, 2: 실패
  if (ALMGR_cmbResult.value == "1") {
    smsGetAuthLogList.setParameters("authResult", 1);
  } else if (ALMGR_cmbResult.value == "2") {
    smsGetAuthLogList.setParameters("authResult", 2);
  } else {
    smsGetAuthLogList.setParameters("authResult", 0);
  }

  //2019-11-29 새로 추가한 소스
  var dm_ExportParam = app.lookup("dm_ExportParam");
  if (dm_ExportParam.getValue("mode") == "export") {
    smsGetAuthLogList.setParameters(
      "offset",
      dm_ExportParam.getValue("offset")
    );
    smsGetAuthLogList.setParameters("limit", ALMGR_recvRowPerExport);
  }
  //2019-11-29 추가 끝

  var cmbCategory = app.lookup("ALMGR_cmbCategory");
  var edtKeyword = app.lookup("ALMGR_edtKeyword");
  if (
    cmbCategory.value != null &&
    cmbCategory.value.length > 0 &&
    edtKeyword.value != null &&
    edtKeyword.value.length > 0
  ) {
    smsGetAuthLogList.setParameters("searchCategory", cmbCategory.value);
    smsGetAuthLogList.setParameters("searchKeyword", edtKeyword.value);
  }

  var dsAuthLogList = app.lookup("AuthLogList");
  dsAuthLogList.clear();
  var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
  udcAuthLogList.setAuthLogList(dsAuthLogList);
  udcAuthLogList.setPaging(0, pageRowCount, 0);

  smsGetAuthLogList.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getAuthLogListCustomITONESubmitDone(
  /* cpr.events.CSubmissionEvent */ e
) {
  /**
   * @type cpr.protocols.Submission
   */
  var sms_getAuthLogListCustomITONE = e.control;

  var resultCode = app.lookup("Result").getValue("ResultCode");
  if (resultCode == COMERROR_NONE) {
    var dsAuthLogList = app.lookup("AuthLogListCustomITONE");
    var count = dsAuthLogList.getRowCount();

    var dmTotal = app.lookup("Total");
    var totalCount = parseInt(dmTotal.getValue("Count"));

    //2019-11-29 신규 추가
    var dm_ExportParam = app.lookup("dm_ExportParam");
    if (dm_ExportParam.getValue("mode") == "list") {
      var viewPageCount =
        totalCount / pageRowCount + (totalCount % pageRowCount > 0);
      if (viewPageCount > 10) {
        viewPageCount = 10;
      }
      pageRowCount = parseInt(pageRowCount, 0); // pageRowCount가 String 형태로 넘어가고 있었는데, String 형태로 넘기면 페이징에 오류가 있어 int로 바꿈

      var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");

      udcAuthLogList.setAuthLogList(dsAuthLogList);
      udcAuthLogList.setPaging(totalCount, pageRowCount, viewPageCount);
      comLib.hideLoadMask();
    }
  } else {
    var errStr = getErrorString(resultCode);
    var errMsg = "Str_AuthLog";
    if (errStr.length > 0) {
      errMsg = dataManager.getString(errStr);
    } else {
      errMsg = dataManager.getString(errMsg);
    }
    comLib.hideLoadMask();
    dialogAlert(app, dataManager.getString("Str_Failed"), errMsg);
  }
  app.lookup("ALMGR_grp").redraw();
}

function SearchItoneLog() {
  var startTime = app.lookup("ALMGR_dtStart").value;
  var endTime = app.lookup("ALMGR_dtEnd").value;
  var isStartEndDateValid = util.isStartEndDateValid(startTime, endTime);
  if (isStartEndDateValid === false) {
    dialogAlert(
      app.getHostAppInstance(),
      "error",
      dataManager.getString("Str_ErrorStartEndDateInvalid")
    );
    return false;
  }
  var dm_ExportParam = app.lookup("dm_ExportParam");
  dm_ExportParam.setValue("mode", "list");

  var dsAuthLogList = app.lookup("AuthLogListCustomITONE");
  dsAuthLogList.clear();
  var udcAuthLogList = app.lookup("ALMGR_udcAuthLogList");
  udcAuthLogList.setAuthLogList(dsAuthLogList);
  udcAuthLogList.setCurrentPageIndex(1);
  sendITONEAuthLogListRequest();
}
