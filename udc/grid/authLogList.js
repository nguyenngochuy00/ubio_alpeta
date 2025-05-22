/************************************************
 * authLogList.js
 * Created at 2018. 12. 26. 오후 8:19:17.
 *
 * @author wonki
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var oem_version;
var requestMenu;
var requestMenuExport;

/*
https://www.google.com/maps/search/?api=1&query={0},{1};
*/

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e) {
  dataManager = getDataManager();
  var dsGroupList = dataManager.getGroup();

  var groupList = dataManager.getGroup();
  if (groupList && groupList.getRowCount() > 0) {
    var cmbGroup = app.lookup("authLogListGrid_cmb_GroupName");
    var count = groupList.getRowCount();
    for (var i = 0; i < count; i++) {
      var groupInfo = groupList.getRow(i);
      cmbGroup.addItem(
        new cpr.controls.Item(
          groupInfo.getValue("Name"),
          groupInfo.getValue("GroupID")
        )
      );
    }
  }

  if (dataManager.getOemVersion() != OEM_INDO_MAURITIUS) {
    app.lookup("authLogListGrid").columnVisible(21, false);
    app.lookup("AuthLogList").deleteColumn("Department");
  }

  initComboAuthType();
  initComboAuthResult();
  initComboFuncType();

  oem_version = dataManager.getOemVersion();
  switch (oem_version) {
    case OEM_ND_POWER_PLANT:
      // 남동발전소 Card -> 소속회사로 변경
      var authLogListGrid = app.lookup("authLogListGrid");
      var grdCard = app.lookup("authLogListGrid").header.getColumn(12);
      grdCard.unbind("text");
      grdCard.setText(dataManager.getString("Str_AffiliatedCompany"));
      break;
    case OEM_UMS_QRCODE:
      // 태국 UMS Position -> ExpiryDatetime 변경 - zzik
      var authLogListGrid = app.lookup("authLogListGrid");
      var grdCard = app.lookup("authLogListGrid").header.getColumn(7);
      grdCard.unbind("text");
      grdCard.setText("ExpiryDatetime");
      break;
    case OEM_MOTORCYCLE_PARK:
      var authLogListGrid = app.lookup("authLogListGrid");
      authLogListGrid.deleteColumn(17);
      authLogListGrid.deleteColumn(16);
      break;
  }
  // authLogListGrid.redraw();

  // 요청 메뉴('AuthLogManagement'에서만 동작)
  requestMenu = app.getAppProperty("requestMenu");
  if (requestMenu == "AuthLogManagement") {
    var authLogGrid = app.lookup("authLogListGrid");
    var grdColumnCount = authLogGrid.columnCount; // 그리드 총 카운트
    var index = 0;
    var setColumnName = [];
    for (i = 0; i < grdColumnCount; i++) {
      if (authLogGrid.header.getColumn(i).columnType == "normal") {
        // columnType normal만 적용
        if (authLogGrid.header.getColumn(i).visible) {
          // visible 활성화만 적용
          setColumnName[index] = authLogGrid.detail.getColumn(i).columnName;
          index++;
        }
      }
    }
    var grdStorage = setColumnName.toString();
    localStorage.setItem("grdStorage_authLog", grdStorage);

    var selectStorageBefore = localStorage.getItem("selectStorage_authLog");
    if (selectStorageBefore == null) {
      localStorage.setItem("selectStorage_authLog", grdStorage);
    }
    var selectStorageAfter = localStorage.getItem("selectStorage_authLog");
    GridSetting(selectStorageAfter);
  }

  // Request menu export (only works with 'AuthLogExport')
  requestMenuExport = app.getAppProperty("requestMenuExport");
  if (requestMenuExport == "AuthLogExport") {
    var authLogGrid = app.lookup("authLogListGrid");
    var grdColumnCount = authLogGrid.columnCount; // 그리드 총 카운트
    var index = 0;
    var setColumnName = [];
    for (i = 0; i < grdColumnCount; i++) {
      if (authLogGrid.header.getColumn(i).columnType == "normal") {
        // columnType normal만 적용
        if (authLogGrid.header.getColumn(i).visible) {
          // visible 활성화만 적용
          setColumnName[index] = authLogGrid.detail.getColumn(i).columnName;
          index++;
        }
      }
    }
    var grdStorage = setColumnName.toString();
    localStorage.setItem("grdStorage_authLogExport", grdStorage);

    var selectStorageBefore = localStorage.getItem(
      "selectStorage_authLogExport"
    );
    if (selectStorageBefore == null) {
      localStorage.setItem("selectStorage_authLogExport", grdStorage);
    }
    var selectStorageAfter = localStorage.getItem(
      "selectStorage_authLogExport"
    );
    GridSetting(selectStorageAfter);
  }
}

function initComboAuthType() {
  var cmbAuthType = app.lookup("cmb_AuthLogType");
  if (cmbAuthType == null) return;

  cmbAuthType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPVerify"), 1)
  );
  cmbAuthType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPIdentify"), 2)
  );
  cmbAuthType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_Password"), 3)
  );
  cmbAuthType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_Card"), 4)
  );
  cmbAuthType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceVerify"), 5)
  );
  cmbAuthType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceIdentify"), 6)
  );
  cmbAuthType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_MobileCard"), 7)
  );
  cmbAuthType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_TypeIrisIdentify"), 8)
  );
  cmbAuthType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_TypeIrisVerify"), 9)
  );
  //cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeQR"), 10));
  cmbAuthType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_Inside"), 15)
  ); //ACU 인사이드버튼 공유
  cmbAuthType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_NotAssigned"), 16)
  ); //ACU 인사이드버튼 공유
  cmbAuthType.addItem(new cpr.controls.Item("Car #", 20));

  /*
	if (dataManager.getOemVersion() == OEM_MCP040) {
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Inside"), 15));
	}		
	*/
  if (
    dataManager.getOemVersion() == OEM_JAWOONDAE ||
    dataManager.getOemVersion() == OEM_HYUNDAI_MSEAT
  ) {
    cmbAuthType.addItem(new cpr.controls.Item("PDA", 9998));
    cmbAuthType.addItem(new cpr.controls.Item("LPR", 9999));
  }
}

function initComboAuthResult() {
  var cmbAuthResult = app.lookup("cmb_AuthLogResult");
  if (cmbAuthResult == null) return;

  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_Success"),
      AuthLogResultSuccess
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultFail"),
      AuthLogResultFail
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultAccessDenied"),
      AuthLogResultAccessDenied
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultTimeout"),
      AuthLogResultTimeout
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultTimeoutCapture"),
      AuthLogResultTimeoutCapture
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultTimeoutIdentify"),
      AuthLogResultTimeoutIdentify
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultAntiPassback"),
      AuthLogResultAntiPassback
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultDuress"),
      AuthLogResultDuress
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultBlackList"),
      AuthLogResultBlackList
    )
  );

  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultUnregistUser"),
      AuthLogResultInvalidUser
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultFPCaptureFailed"),
      AuthLogResultCapture
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultDuplicatedAuth"),
      AuthLogResultDuplicatedAuthentication
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultNetworkError"),
      AuthLogResultNetwork
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultServerBusy"),
      AuthLogResultServerBusy
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultFaceDetectionFailed"),
      AuthLogResultFaceDetection
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthLogResultFailMealPay"),
      AuthLogResultFailMealPay
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthLogResultFailMealTime"),
      AuthLogResultFailMealTime
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthLogResultFailNotExistsMealCode"),
      AuthLogResultFailNotExistsMealCode
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthLogResultFailPeriod"),
      AuthLogResultFailPeriod
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthLogResultFailMealLimit"),
      AuthLogResultFailMealLimit
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthLogResultFailDayLimit"),
      AuthLogResultFailDayLimit
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthLogResultFailMonthLimit"),
      AuthLogResultFailMonthLimit
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthLogResultSoftpassback"),
      AuthLogResultSoftpassback
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthLogResultNoMask"),
      AuthLogResultNoMask
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthLogResultFeverDetection"),
      AuthLogResultFeverDetection
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthLogResultXKeyInvalidMasterKey"),
      AuthLogResultXKeyInvalidMasterKey
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthLogResultXKeyInvalidTime"),
      AuthLogResultXKeyInvalidTime
    )
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item("인증순서오류", AuthLogResultFailPunch)
  );

  cmbAuthResult.addItem(
    new cpr.controls.Item(dataManager.getString("Str_AuthResultLprFail"), 125)
  );
  cmbAuthResult.addItem(
    new cpr.controls.Item(
      dataManager.getString("Str_AuthResultLprUnRegist"),
      126
    )
  );
}

function initComboFuncType() {
  var cmbAuthLogFuncType = app.lookup("cmb_AuthLogFuncType");
  if (cmbAuthLogFuncType == null) return;

  cmbAuthLogFuncType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeAccess"), 0)
  );
  cmbAuthLogFuncType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeTna"), 1)
  );
  cmbAuthLogFuncType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeMeal"), 2)
  );

  cmbAuthLogFuncType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeLPR"), 6)
  );
  if (
    dataManager.getOemVersion() == OEM_JAWOONDAE ||
    dataManager.getOemVersion() == OEM_HYUNDAI_MSEAT
  ) {
    cmbAuthLogFuncType.addItem(new cpr.controls.Item("PDA", 14));
    cmbAuthLogFuncType.addItem(new cpr.controls.Item("LPR", 15));
    cmbAuthLogFuncType.addItem(new cpr.controls.Item("PDA", 127)); // 127
    cmbAuthLogFuncType.addItem(new cpr.controls.Item("LPR", 128)); // 128
    cmbAuthLogFuncType.addItem(new cpr.controls.Item("LPR", 126));
  }

  var cmbFKey = app.lookup("cmb_AuthFuncKey");
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyF1"), 1)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyF2"), 2)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 3)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyF3"), 4)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyF4"), 5)
  );

  //functype == 1 : 근태
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyAttend"), 11)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyLeave"), 12)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 13)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyOut"), 14)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyIn"), 15)
  );

  //functype == 2 : 식수
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyMenu1"), 21)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyMenu2"), 22)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyMenu5"), 23)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyMenu3"), 24)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyMenu4"), 25)
  );

  //functype == 6 : LPR
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 63)
  );

  for (var i = 101; i < 161; i++) {
    var label = "Ex " + (i - 100);
    cmbFKey.addItem(new cpr.controls.Item(label, i));
  }
}
/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function () {
  // TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
  return "";
};
exports.getSelectedRow = function () {
  var authLogListGrid = app.lookup("authLogListGrid");
  var selectionRow = authLogListGrid.getSelectedRow();

  if (selectionRow.getIndex() != null) {
    return selectionRow;
  }

  return null;
};

exports.getCheckedRowIndices = function () {
  var authLogList = app.lookup("authLogListGrid");
  var indices = authLogList.getCheckRowIndices();

  var result = [];
  indices.forEach(function (idx) {
    if (authLogList.getRowState(idx) != cpr.data.tabledata.RowState.DELETED) {
      result.push(idx);
    } else {
      authLogList.setCheckRowIndex(idx, false);
    }
  });

  return result;
};

exports.setUnCheckAll = function (idx, checked) {
  var authLogList = app.lookup("authLogListGrid");
  var indices = authLogList.getCheckRowIndices();

  indices.forEach(function (idx) {
    authLogList.setCheckRowIndex(idx, false);
  });
};

exports.deleteColumn = function (indices) {
  if (indices == undefined || indices == null) {
    return;
  }
  var authLogList = app.lookup("authLogListGrid");
  indices.forEach(function (index) {
    authLogList.deleteColumn(index);
  });
};

exports.deleteRow = function (checkedRowIndices) {
  var authLogList = app.lookup("authLogListGrid");
  authLogList.deleteRow(checkedRowIndices);
  authLogList.clearAllCheck();
  return;
};

exports.setAuthLogList = function (/*cpr.data.DataSet*/ authLogDataSet) {
  var authLogListSet = app.lookup("AuthLogList");
  authLogListSet.clear();
  authLogDataSet.copyToDataSet(authLogListSet);
  authLogListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
  var authLogList = app.lookup("authLogListGrid");
  authLogList.redraw();
};

exports.setAuthLogListRows = function (
  /*cpr.data.RowConfigInfo[]*/ authLogData
) {
  var authLogListSet = app.lookup("AuthLogList");
  authLogListSet.clear();
  authLogListSet.build(authLogData);
  authLogListSet.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);

  var authLogList = app.lookup("authLogListGrid");
  authLogList.redraw();
};

exports.getAuthLogIndexKey = function (index) {
  var authLogList = app.lookup("authLogListGrid");
  var authLogIndexKey = authLogList.getRow(index).getString("IndexKey");
  return authLogIndexKey;
};

exports.getRowData = function (index) {
  var authLogList = app.lookup("authLogListGrid");
  return authLogList.getRow(index).getRowData();
};

exports.getRow = function (index) {
  var authLogList = app.lookup("authLogListGrid");
  return authLogList.getRow(index);
};

exports.getRowState = function (index) {
  var authLogList = app.lookup("authLogListGrid");
  return authLogList.getRowState(index);
};

exports.setRowState = function (index, state) {
  var authLogList = app.lookup("authLogListGrid");
  authLogList.setRowState(index, state);
};

exports.getRowCount = function (index, state) {
  var authLogList = app.lookup("authLogListGrid");
  return authLogList.getRowCount();
};

/**
 * 사용자 리스트 컨트롤의 페이징 정보를 설정합니다.
 */
exports.setPaging = function (
  totalCount,
  currentPageIndex,
  pageRowCount,
  viewPageCount
) {
  var pageIndex = app.lookup("authLogListPageIndexer");

  pageIndex.totalRowCount = totalCount; //전체 데이터 수.
  pageIndex.currentPageIndex = currentPageIndex; //현재 선택된 페이지의 인덱스
  pageIndex.pageRowCount = pageRowCount; //한 페이지에 보여 줄 행의 수
  pageIndex.viewPageCount = viewPageCount; // 보여지는 페이지 수(하단 부 인덱스 수)

  if (totalCount == 0) {
    pageIndex.visible = false;
  } else {
    pageIndex.visible = true;
  }

  pageIndex.redraw();
};

exports.setPaging = function (totalCount, pageRowCount, viewPageCount) {
  var pageIndex = app.lookup("authLogListPageIndexer");

  pageIndex.totalRowCount = totalCount; //전체 데이터 수.
  //pageIndex.currentPageIndex = currentPageIndex;//현재 선택된 페이지의 인덱스
  pageIndex.pageRowCount = pageRowCount; //한 페이지에 보여 줄 행의 수
  pageIndex.viewPageCount = viewPageCount; // 보여지는 페이지 수(하단 부 인덱스 수)

  if (totalCount == 0) {
    pageIndex.visible = false;
  } else {
    pageIndex.visible = true;
  }
  pageIndex.redraw();
};

exports.setTotalCount = function (totalCount) {
  var pageIndex = app.lookup("authLogListPageIndexer");
  pageIndex.totalRowCount = totalCount;

  if (totalCount == 0) {
    pageIndex.visible = false;
  } else {
    pageIndex.visible = true;
  }

  pageIndex.redraw();
};

exports.getCurrentPageIndex = function () {
  var pageIndex = app.lookup("authLogListPageIndexer");
  return pageIndex.currentPageIndex;
};

exports.setCurrentPageIndex = function (index) {
  var pageIndex = app.lookup("authLogListPageIndexer");
  pageIndex.currentPageIndex = index;
};

exports.setPageRowCount = function (count) {
  var pageIndex = app.lookup("authLogListPageIndexer");
  pageIndex.pageRowCount = count;
};

exports.getPageRowCount = function () {
  var pageIndex = app.lookup("authLogListPageIndexer");
  return pageIndex.pageRowCount;
};

exports.refreshAuthLogList = function (idMap) {
  var dsAuthLogList = app.lookup("AuthLogList");

  var total = dsAuthLogList.getRowCount();
  for (var i = 0; i < total; i++) {
    var row = dsAuthLogList.getRow(i);
    if (row) {
      var authLogIndexKey = row.getValue("IndexKey");

      if (idMap.get(authLogIndexKey) != undefined) {
        dsAuthLogList.setRowState(i, cpr.data.tabledata.RowState.DELETED);
      } else {
        dsAuthLogList.setRowState(i, cpr.data.tabledata.RowState.UNCHANGED);
      }
    }
  }

  var authLogList = app.lookup("authLogListGrid");
  authLogList.redraw();
};

exports.clearAuthLogList = function () {
  var pageIndex = app.lookup("authLogListPageIndexer");
  pageIndex.totalRowCount = 0;
  pageIndex.visible = false;
  pageIndex.redraw();

  var authLogListSet = app.lookup("AuthLogList");
  authLogListSet.clear();

  var authLogList = app.lookup("authLogListGrid");
  authLogList.redraw();
};

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onAuthLogListPageIndexerSelectionChange(
  /* cpr.events.CSelectionEvent */ e
) {
  /**
   * @type cpr.controls.PageIndexer
   */
  var authLogListPageIndexer = e.control;

  var selectionEvent = new cpr.events.CSelectionEvent("pagechange", {
    oldSelection: e.oldSelection,
    newSelection: e.newSelection,
  });

  app.dispatchEvent(selectionEvent);
}

/*
 * 페이지 인덱서에서 before-selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경되기 전에 발생하는 이벤트. 다음 이벤트로 selection-change를 발생합니다.
 */
function onAuthLogListPageIndexerBeforeSelectionChange(
  /* cpr.events.CSelectionEvent */ e
) {
  /**
   * @type cpr.controls.PageIndexer
   */
  var authLogListPageIndexer = e.control;

  var selectionEvent = new cpr.events.CSelectionEvent("before-pagechange", {
    oldSelection: e.oldSelection,
    newSelection: e.newSelection,
  });

  app.dispatchEvent(selectionEvent);

  // 기본처리가 중단되었을 때 변경을 취소함.
  if (selectionEvent.defaultPrevented == true) {
    e.preventDefault();
  }
}

/*
 * 그리드에서 contextmenu 이벤트 발생 시 호출.
 * 마우스의 오른쪽 버튼이 클릭되거나 컨텍스트 메뉴 키가 눌려지면 호출되는 이벤트.
 */
function onAuthLogListGridContextmenu(/* cpr.events.CMouseEvent */ e) {
  /**
   * @type cpr.controls.Grid
   */
  var authLogListGrid = e.control;

  if (
    requestMenu == "AuthLogManagement" ||
    requestMenuExport == "AuthLogExport"
  ) {
    e.preventDefault();
    var authlogMenu = new cpr.controls.Menu();
    authlogMenu.addItem(
      new cpr.controls.MenuItem(
        dataManager.getString("Str_ColumnSetting"),
        0,
        ""
      )
    );
    //	authlogMenu.addItem(new cpr.controls.MenuItem(dataManager.getString("Str_ListClear"), 1, ""));
    var rect = app.getActualRect();
    authlogMenu.style.css({
      left: e.clientX - rect.left + "px",
      top: e.clientY - rect.top + "px",
      height: "60px",
      width: "200px",
      position: "absolute",
    });
    authlogMenu.focus();
    authlogMenu.addEventListener("selection-change", function (e) {
      switch (authlogMenu.value) {
        case "0":
          authlogListGridSetting();
          break;
        //			case "1":	AuthlogClear();         break;
        default:
          break;
      }
      authlogMenu.dispose();
    });
    authlogMenu.addEventListener("blur", function (e) {
      authlogMenu.dispose();
    });
    app.floatControl(authlogMenu);
  }
}
//우클릭 '칼럼 설정'
function authlogListGridSetting() {
  if (requestMenu == "AuthLogManagement") {
    app
      .getRootAppInstance()
      .openDialog(
        "app/main/authLogs/AuthLogGrid",
        {
          width: 570,
          height: 570,
        },
        function (dialog) {
          dialog.bind("headerTitle").toLanguage("Str_ColumnSetting");
          //	dialog.setAppProperty('requestMenu', requestMenu); // err 발생
        }
      )
      .then(function (returnValue) {
        if (returnValue !== null) {
          GridSetting(returnValue);
        }
      });
  }

  if (requestMenuExport == "AuthLogExport") {
    app
      .getRootAppInstance()
      .openDialog(
        "app/main/authLogs/AuthLogExportGrid",
        {
          width: 570,
          height: 570,
        },
        function (dialog) {
          dialog.bind("headerTitle").toLanguage("Str_ColumnSetting");
          //	dialog.setAppProperty('requestMenu', requestMenu); // err 발생
        }
      )
      .then(function (returnValue) {
        if (returnValue !== null) {
          GridSetting(returnValue);
        }
      });
  }
}
// returnValue값으로 그리드 세팅
function GridSetting(returnValue) {
  if (requestMenu == "AuthLogManagement") {
    localStorage.setItem("selectStorage_authLog", returnValue);
  }

  if (requestMenuExport == "AuthLogExport") {
    localStorage.setItem("selectStorage_authLogExport", returnValue);
  }
  var selectArr = returnValue.split(",");
  var grdAuthlog = app.lookup("authLogListGrid");
  var grdcount = grdAuthlog.columnCount;
  for (var x = 0; x < grdcount; x++) {
    grdAuthlog.deleteColumn(x);
  }
  for (var i = 0; i < selectArr.length; i++) {
    var widthpx = "100px";
    if (selectArr[i].toString() == "TerminalName") {
      widthpx = "150px";
    }
    grdAuthlog.addColumn({
      columnLayout: [
        {
          //width:"100px,"
          width: widthpx,
          autoFit: true,
          resizable: true,
        },
      ],
      header: [
        {
          constraint: {
            rowIndex: 0,
            colIndex: i,
          },
          configurator: function (cell) {
            if (selectArr[i] == "EventTime") {
              selectArr[i] = "AuthEventTime";
            }
            if (selectArr[i] == "Dummy") {
              selectArr[i] = "ExtraDevice";
            }
            if (selectArr[i] == "GroupCode") {
              selectArr[i] = "GroupName";
            }
            cell.text = dataManager.getString("Str_" + selectArr[i]);
          },
        },
      ],
      detail: [
        {
          constraint: {
            rowIndex: 0,
            colIndex: i,
          },
          configurator: function (cell) {
            if (selectArr[i] == "AuthEventTime") {
              selectArr[i] = "EventTime";
            }
            if (selectArr[i] == "ExtraDevice") {
              selectArr[i] = "Dummy";
            }
            cell.columnName = selectArr[i];
            cell.style
              .bind("color")
              .toExpression(
                [
                  "switch ( AuthResult ) {",
                  '\tcase 0: "green"',
                  '\tcase 7: "red"',
                  '\tcase 8: "red"',
                  '\tcase 25: "red"',
                  '\tdefault: "#FFC000"',
                  "}",
                ].join("\n")
              );
            if (selectArr[i] == "AuthType") {
              cell.control = (function () {
                var comboBox_1 = new cpr.controls.ComboBox("cmb_AuthLogType");
                comboBox_1.readOnly = true;
                (function (comboBox_1) {})(comboBox_1);
                comboBox_1.bind("value").toDataColumn("AuthType");
                return comboBox_1;
              })();
            }
            if (selectArr[i] == "AuthResult") {
              cell.control = (function () {
                var comboBox_2 = new cpr.controls.ComboBox("cmb_AuthLogResult");
                comboBox_2.readOnly = true;
                (function (comboBox_1) {})(comboBox_2);
                comboBox_2.bind("value").toDataColumn("AuthResult");
                return comboBox_2;
              })();
            }
            if (selectArr[i] == "Func") {
              cell.control = (function () {
                var comboBox_3 = new cpr.controls.ComboBox("cmb_AuthFuncKey");
                comboBox_3.readOnly = true;
                (function (comboBox_1) {})(comboBox_3);
                comboBox_3.bind("value").toDataColumn("Func");
                return comboBox_3;
              })();
            }
            if (selectArr[i] == "FuncType") {
              cell.control = (function () {
                var comboBox_4 = new cpr.controls.ComboBox(
                  "cmb_AuthLogFuncType"
                );
                comboBox_4.readOnly = true;
                (function (comboBox_1) {})(comboBox_4);
                comboBox_4.bind("value").toDataColumn("FuncType");
                return comboBox_4;
              })();
            }
            if (selectArr[i] == "GroupCode") {
              cell.control = (function () {
                var comboBox_5 = new cpr.controls.ComboBox(
                  "authLogListGrid_cmb_GroupName"
                );
                comboBox_5.readOnly = true;
                (function (comboBox_1) {})(comboBox_5);
                comboBox_5.bind("value").toDataColumn("GroupCode");
                return comboBox_5;
              })();
            }
          },
        },
      ],
    });
  }
  grdAuthlog.resizableColumns =
    "all"; /* exbuilder 업데이트 시 적용됨 이번 릴리즈( 21/12/10 이후 ver) */
  initComboAuthLog();
}

function initComboAuthLog() {
  var cmbAuthType = app.lookup("cmb_AuthLogType");
  if (cmbAuthType) {
    cmbAuthType.addItem(
      new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPVerify"), 1)
    );
    cmbAuthType.addItem(
      new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPIdentify"), 2)
    );
    cmbAuthType.addItem(
      new cpr.controls.Item(dataManager.getString("Str_Password"), 3)
    );
    cmbAuthType.addItem(
      new cpr.controls.Item(dataManager.getString("Str_Card"), 4)
    );
    cmbAuthType.addItem(
      new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceVerify"), 5)
    );
    cmbAuthType.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthTypeFaceIdentify"),
        6
      )
    );
    cmbAuthType.addItem(
      new cpr.controls.Item(dataManager.getString("Str_MobileCard"), 7)
    );
    cmbAuthType.addItem(
      new cpr.controls.Item(dataManager.getString("Str_TypeIrisIdentify"), 8)
    );
    cmbAuthType.addItem(
      new cpr.controls.Item(dataManager.getString("Str_TypeIrisVerify"), 9)
    );
    //cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeQR"), 10));
    cmbAuthType.addItem(
      new cpr.controls.Item(dataManager.getString("###"), 11)
    ); // 아이디/유니크 아이디로 인증 수단 요청
    cmbAuthType.addItem(
      new cpr.controls.Item(dataManager.getString("Str_Inside"), 15)
    );
    cmbAuthType.addItem(
      new cpr.controls.Item(dataManager.getString("Str_NotAssigned"), 16)
    ); //ACU 인사이드버튼 공유

    cmbAuthType.addItem(new cpr.controls.Item("Car #", 20));

    cmbAuthType.addItem(new cpr.controls.Item("PDA", 9998));
    cmbAuthType.addItem(new cpr.controls.Item("LPR", 9999));
  }

  var cmbAuthResult = app.lookup("cmb_AuthLogResult");
  if (cmbAuthResult) {
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_Success"),
        AuthLogResultSuccess
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultFail"),
        AuthLogResultFail
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultAccessDenied"),
        AuthLogResultAccessDenied
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultTimeout"),
        AuthLogResultTimeout
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultTimeoutCapture"),
        AuthLogResultTimeoutCapture
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultTimeoutIdentify"),
        AuthLogResultTimeoutIdentify
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultAntiPassback"),
        AuthLogResultAntiPassback
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultDuress"),
        AuthLogResultDuress
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultBlackList"),
        AuthLogResultBlackList
      )
    );

    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultUnregistUser"),
        AuthLogResultInvalidUser
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultFPCaptureFailed"),
        AuthLogResultCapture
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultDuplicatedAuth"),
        AuthLogResultDuplicatedAuthentication
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultNetworkError"),
        AuthLogResultNetwork
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultServerBusy"),
        AuthLogResultServerBusy
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultFaceDetectionFailed"),
        AuthLogResultFaceDetection
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthLogResultFailMealPay"),
        AuthLogResultFailMealPay
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthLogResultFailMealTime"),
        AuthLogResultFailMealTime
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthLogResultFailNotExistsMealCode"),
        AuthLogResultFailNotExistsMealCode
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthLogResultFailPeriod"),
        AuthLogResultFailPeriod
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthLogResultFailMealLimit"),
        AuthLogResultFailMealLimit
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthLogResultFailDayLimit"),
        AuthLogResultFailDayLimit
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthLogResultFailMonthLimit"),
        AuthLogResultFailMonthLimit
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthLogResultSoftpassback"),
        AuthLogResultSoftpassback
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthLogResultNoMask"),
        AuthLogResultNoMask
      )
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthLogResultFeverDetection"),
        AuthLogResultFeverDetection
      )
    );

    cmbAuthResult.addItem(
      new cpr.controls.Item(dataManager.getString("Str_AuthResultLprFail"), 125)
    );
    cmbAuthResult.addItem(
      new cpr.controls.Item(
        dataManager.getString("Str_AuthResultLprUnRegist"),
        126
      )
    );
  }

  var cmbFKey = app.lookup("cmb_AuthFuncKey");
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyF1"), 1)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyF2"), 2)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 3)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyF3"), 4)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyF4"), 5)
  );

  //functype == 1 : 근태
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyAttend"), 11)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyLeave"), 12)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 13)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyOut"), 14)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyIn"), 15)
  );

  //functype == 2 : 식수
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyMenu1"), 21)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyMenu2"), 22)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyMenu5"), 23)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyMenu3"), 24)
  );
  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyMenu4"), 25)
  );

  cmbFKey.addItem(
    new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 63)
  );

  for (var i = 101; i < 161; i++) {
    var label = "Ex " + (i - 100);
    cmbFKey.addItem(new cpr.controls.Item(label, i));
  }

  var cmbAuthLogFuncType = app.lookup("cmb_AuthLogFuncType");
  if (cmbAuthLogFuncType == null) return;

  cmbAuthLogFuncType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeAccess"), 0)
  );
  cmbAuthLogFuncType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeTna"), 1)
  );
  cmbAuthLogFuncType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeMeal"), 2)
  );
  cmbAuthLogFuncType.addItem(
    new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeLPR"), 6)
  );
  if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
    cmbAuthLogFuncType.addItem(new cpr.controls.Item("PDA", 14));
    cmbAuthLogFuncType.addItem(new cpr.controls.Item("LPR", 15));
    cmbAuthLogFuncType.addItem(new cpr.controls.Item("PDA", 127)); // 127
    cmbAuthLogFuncType.addItem(new cpr.controls.Item("LPR", 128)); // 128
  }
}
