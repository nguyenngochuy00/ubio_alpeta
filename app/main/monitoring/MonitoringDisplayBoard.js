/************************************************
 * MonitoringManagement.js
 * Created at 2023. 12. 21. 오전 10:31:13.
 *
 * @author 960405
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var oem_version;

// Body에서 load 이벤트 발생 시 호출.
function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	oem_version = dataManager.getOemVersion();
	var accountInfo = dataManager.getAccountInfo();
	var privilege = Number(accountInfo.getValue("Privilege"));
	
	// 콤보박스용 단말기 리스트 copy
	var TerminalList = app.lookup('TerminalList');
	if (oem_version == OEM_REMOTE_FAW_MANAGEMENT){ // 유사얼굴체크용 단말기 제외
		dataManager.getTerminalList().copyToDataSet(TerminalList, "UseAuth != 1");	
	} else {
		dataManager.getTerminalList().copyToDataSet(TerminalList);		
	}
	
	// 폰트 사이즈, 상단 그룹 칼럼 사이즈, 단말 선택 콤보박스  border-width 넓이 기준
	/*
	var appwidth = 0;
	if (privilege == DLG_DISPLAYBOARD_MANAGEMENT) {
		// 전광판 관리자는 screen 기준
		appwidth = screen.width;
	} else {
		// 마스터는 app 기준
		appwidth = app.getHostAppInstance().getActualRect().width;
	}*/
	
	var appwidth = screen.width;
	
	// 폰트 크기 설정	
	var fontSize1 = Math.floor(appwidth / 145) + "px";
	var fontSize2 = Math.floor(appwidth / 170) + "px";
	var fontSize3 = Math.floor(appwidth / 120) + "px";
	var fontSize4 = Math.floor(appwidth / 100) + "px";
	
	var dmfontSize = app.lookup('fontSize');
	dmfontSize.setValue('font1', fontSize1); // 단말기 선택
	dmfontSize.setValue('font2', fontSize2); // 단말기 선택 콤보박스
	dmfontSize.setValue('font3', fontSize3); // 콤보박스 리스트	
	dmfontSize.setValue('font4', fontSize4); // 이름
	
	
	// 단말기 선택 시 레이아웃 사이즈 
	var iconSize = Math.floor(appwidth / 48) + "px"; // 전광판 관리자 - 언어,로그아웃 아이콘
	var terminalSelectgroup1 = app.lookup('MDB_terminalSelectgroup1');
	
	// 마스터만 도움말 
	if (privilege == DLG_DISPLAYBOARD_MANAGEMENT) {
		// 전광판 관리자
		terminalSelectgroup1.getLayout().setColumns(["5px", "50px", "200px", iconSize, "40px", "1fr", "1fr", iconSize, iconSize, "0px"]);
	} else {
		// 마스터
		terminalSelectgroup1.getLayout().setColumns(["5px", "50px", "200px", iconSize, "40px", "1fr", "1fr", iconSize, "0px", iconSize]);
	}
	terminalSelectgroup1.getLayout().setColumnAutoSizing(1, true); // 단말기 선택
	terminalSelectgroup1.getLayout().setColumnAutoSizing(2, true); // 단말기 선택 콤보
	terminalSelectgroup1.getLayout().setColumnAutoSizing(4, true); // 상호명
	
	// 단말기 선택 콤보박스 border-width 설정
	var cmbTerminalList1 = app.lookup('MDB_cmbTerminalList1');
	cmbTerminalList1.style.css({
		"border-width": Math.floor(appwidth / 700) + "px"
	});
	
	// 최대 5개 - 모니터 사이즈별  maxVisible 달라짐
	cmbTerminalList1.maxVisibleItems = 5;
	
	// 권한별 로그아웃/언어설정 버튼 활성화 
	var accountInfo = dataManager.getAccountInfo();
	var privilege = Number(accountInfo.getValue("Privilege"));
	var logOut = app.lookup('MDB_logOutimage');
	var languageSelect = app.lookup('MDB_languageSelect');
	
	if (privilege == DLG_DISPLAYBOARD_MANAGEMENT) {
		logOut.visible = true;
		logOut.enabled = true;
		languageSelect.visible = true;
		languageSelect.enabled = true;
	} else {
		logOut.visible = false;
		logOut.enabled = false;
		languageSelect.visible = true;
		languageSelect.enabled = true;
	}
	
	// 이미지, 상호명, 카운트 설정
	var dm_returnValue = app.lookup("returnValue");
	var storage_Iamge = localStorage.getItem("displayBoard_Iamge");
	var storage_Name = localStorage.getItem("displayBoard_Name");
	var storage_Count = localStorage.getItem("displayBoard_Count");
	
	if (storage_Iamge != null && storage_Iamge != "") {
		app.lookup(dm_returnValue.setValue("image", storage_Iamge));
	}
	if (storage_Name != null && storage_Name != "") {
		app.lookup(dm_returnValue.setValue("name", storage_Name));
	}
	if (storage_Count != null && storage_Count != "") {
		app.lookup(dm_returnValue.setValue("count", storage_Count));
	}
	app.lookup('MDB_terminalSelectgroup1').redraw();
}

// 웹 소켓 수신 시 레이아웃 생성
exports.addAuthLog = function(authLog) {
	// console.log(authLog);
	var selectTabItem = app.lookup('MDB_Tabfolder').getSelectedTabItem().id;
	var selectTerminalListValues = app.lookup('MDB_cmbTerminalList').values;
	
	// 1. 보여줄 선택 단말기 확인
	if (selectTerminalListValues.length == 0) {
		console.log('선택 단말 없음');
		return;
	}
	
	// 2. 설정 탭 확인
	if (selectTabItem == 1) {
		//console.log('현재 탭 ID = 1  입니다.');
		
		// 2-1 탭1은 단말기 선택 시 이미 레이아웃 세팅 마친 상태, 웹 소켓 수신 시 선택한 단말기 ID가 포함되어 있으면  UDC에 인증 데이터 세팅 'setAuthInfo()'
		if (selectTerminalListValues.includes(authLog.TerminalID.toString())) {
			var udcList = app.lookup('USMAG_udcUserList' + authLog.TerminalID);
			udcList.setAuthInfo(authLog);
		} else {
			return;
		}
	} else if (selectTabItem == 2) {
		//console.log('현재 탭 ID = 2  입니다.');
		
		// 2-2 탭2는 웹 소켓 수신 시 레이아웃 세팅(수신때마다 쌓는 방식), 웹 소켓 수신 시 선택한 단말기 ID가 포함되어 있으면  레이아웃 추가 및 UDC에 인증 데이터 세팅 'setAuthInfo()'
		if (selectTerminalListValues.includes(authLog.TerminalID.toString())) {
			var authGroup2 = app.lookup('authGroup2');
			var authGroupLayout = authGroup2.getLayout();
			
			// 탭2모아보기 => 픽셀 단위로 하면 모니터 크기와 상관없이 무조건 픽셀 단위로 나옴, 때문에 가로/4 px 사이즈로  
			var appwidth = app.getHostAppInstance().getActualRect().width;
			
			// 16:9 표준 비율
			var width = Math.floor(appwidth / 4) - Math.floor(appwidth / 500) + "px";
			authGroupLayout.insertColumns([width], 0);
			
			// 추가된 레이아웃에 바인딩
			var udcList = new udc.AuthDisplayBoard("USMAG_udcUserList");
			udcList.setTerminalName(dataManager.getTerminalList().findFirstRow("ID == '" + authLog.TerminalID + "'").getValue('Name'));
			udcList.setAuthInfo(authLog);
			authGroup2.addChild(udcList, {
				bottomSpacing: Math.floor(appwidth / 170),
				topSpacing: Math.floor(appwidth / 170),
				"colIndex": 0,
				"rowIndex": 0
			});
		}
	}
}

// tab1 단말기 선택 적용
function terminalSelectTab1() {
	
	var cmbTerminalList1 = app.lookup('MDB_cmbTerminalList1'); // 탭1 단말기 콤보박스
	var cmbTerminalList1Length = cmbTerminalList1.values.length
	var authGroup1 = app.lookup('authGroup1'); // 배경 그룹
	var authGroupLayout = authGroup1.getLayout(); // 그룹 레이아웃
	var columnsLength = authGroupLayout.getColumns().length; // 열 길이
	var rowLength = authGroupLayout.getRows().length; // 행 길이
	
	// 웹 소켓 수신은 MDB_cmbTerminalList로 구분 하지만 UI 배경 이미지때문에 MDB_cmbTerminalList,1,2 를 나눴음
	app.lookup('MDB_cmbTerminalList').value = cmbTerminalList1.value;
	
	// tab1 단말기 선택 시 기존 행/열 지우기
	for (var columns = 0; columns < columnsLength; columns++) {
		authGroup1.getLayout().removeColumns([0]);
	}
	for (var rows = 1; rows < rowLength; rows++) {
		authGroup1.getLayout().removeRows([0]);
	}
	
	// 선택 갯수 별 넓이,여백 레이아웃 설정
	var columnSize = "0px";
	var rightSpacing = 0; // 오른 여백
	var leftSpacing = 0; // 왼쪽 여백 
	var appwidth = app.getHostAppInstance().getActualRect().width;
	
	if (cmbTerminalList1Length == 1) {
		columnSize = appwidth.toString() + "px"
		
		leftSpacing = Math.floor(appwidth / 3) + Math.floor(appwidth / 60); // 왼쪽 여백
		rightSpacing = Math.floor(appwidth / 3) + Math.floor(appwidth / 60); // 오른쪽 여백
		
	} else if (cmbTerminalList1Length == 2) {
		columnSize = (Math.floor(appwidth / 2) - 10).toString() + "px"
		
		leftSpacing = Math.floor(appwidth / 10) + Math.floor(appwidth / 300); // 왼쪽 여백
		rightSpacing = Math.floor(appwidth / 10) + Math.floor(appwidth / 300);; // 오른쪽 여백
		
	} else if (cmbTerminalList1Length == 3) {
		columnSize = (Math.floor(appwidth / 3) - 10).toString() + "px"
		
		leftSpacing = Math.floor(appwidth / 50); + Math.floor(appwidth / 650); // 왼쪽 여백
		rightSpacing = Math.floor(appwidth / 50); + Math.floor(appwidth / 650); // 오른쪽 여백
		
	} else {
		// 4이상 부턴 columnSize 동일
		columnSize = (Math.floor(appwidth / 4) - Math.floor(appwidth / 430)).toString() + "px"
	}
	
	// 4개 이상 이면 하단 row 한개 생성
	if (cmbTerminalList1Length > 4) {
		authGroup1.getLayout().insertRows(["1fr"]);
	}
	
	// 선택 갯수에 맞춰 레아이웃 생성
	for (var count = 0; count < cmbTerminalList1Length; count++) {
		if (count < 4) {
			// 4대 초과부턴 for문 돌면서 만든  insertColumns로 쓰면 됨 
			authGroupLayout.insertColumns([columnSize], -1); // 기본 470
		}
		
		// USMAG_udcUserList + 선택한 단말기 ID 
		var udcName = "USMAG_udcUserList";
		var selectTerminalId = cmbTerminalList1.values[count];
		// udc
		var udcList = new udc.AuthDisplayBoard(udcName + selectTerminalId);
		
		// 적용 클릭 시 단말기명 set
		var terminalName = dataManager.getTerminalList().findFirstRow("ID == '" + cmbTerminalList1.values[count] + "'").getValue('Name');
		udcList.setTerminalName(terminalName);
		
		if (count > 3) {
			authGroup1.addChild(udcList, {
				"colIndex": count - 4,
				"rowIndex": 1,
			});
		} else {
			// console.log("카운트 :", count, 'leftSpacing:', leftSpacing)
			authGroup1.addChild(udcList, {
				"leftSpacing": leftSpacing,
				"rightSpacing": rightSpacing,
				"colIndex": count,
				"rowIndex": 0
			});
		}
		// 4 이상부턴 row삭제(UI)
		if (cmbTerminalList1Length > 4) {
			udcList.removeRow();
		}
	}
}

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick2( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Image
	 */
	var image = e.control;
	// 각각 보기 -> 모아 보기
	var tabfolder = app.lookup('MDB_Tabfolder');
	tabfolder.setSelectedTabItem(tabfolder.getTabItemByID(2));
	
	// 웹 소켓 수신은 MDB_cmbTerminalList로 구분 하지만 UI 배경 이미지때문에 MDB_cmbTerminalList,1,2 를 나눴음
	app.lookup('MDB_cmbTerminalList2').value = app.lookup('MDB_cmbTerminalList').value;
}

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick3( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Image
	 */
	var image = e.control;
	var cmbTerminalList = app.lookup('MDB_cmbTerminalList');
	
	// 모아 보기 -> 각각 보기
	if (cmbTerminalList.values.length <= 8) {
		var tabfolder = app.lookup('MDB_Tabfolder');
		tabfolder.setSelectedTabItem(tabfolder.getTabItemByID(1)); // 값 전달
		
		// 웹 소켓 수신은 MDB_cmbTerminalList로 구분 하지만 UI 배경 이미지때문에 MDB_cmbTerminalList,1,2 를 나눴음
		app.lookup('MDB_cmbTerminalList1').value = cmbTerminalList.value;
		
		// 1탭 단말기 선택 적용
		terminalSelectTab1();
	} else {
		// TODO 탭2 - 추가 Str_단말기를 8개 이하로 선택해 주세요.
		dialogAlert(app, dataManager.getString("Str_Failed"), "Max select: 8");
	}
}

/*
 * 콤보 박스에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onMDB_cmbTerminalList1ItemClick( /* cpr.events.CItemEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var mDB_cmbTerminalList1 = e.control;
	var cmbTerminalList1 = app.lookup('MDB_cmbTerminalList1');
	if (cmbTerminalList1.values.length >= 9) {
		// 탭1 : 단말기 선택 9개 이상 시  selection-change false
		cmbTerminalList1.removeSelection(mDB_cmbTerminalList1.getSelectionLast(), false);
	} else {
		// 1탭 단말기 선택 적용
		terminalSelectTab1();
	}
}

/*
 * 콤보 박스에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onMDB_cmbTerminalList2ItemClick( /* cpr.events.CItemEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var mDB_cmbTerminalList2 = e.control;
	// tab2 단말기 선택은 갯수 제한 없음
	app.lookup('MDB_cmbTerminalList').value = mDB_cmbTerminalList2.value;
}

/*
 * 로그아웃 Submit Success
 */
function onSms_logoutSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_logout = e.control;
	var usint_version = dataManager.getSystemVersion();
	var appld = "app/app" + "?" + usint_version;
	cpr.core.App.load(appld, function(newapp) {
		app.getRootAppInstance().close();
		location.reload(); //임시..현재 app 최초호출 시 라이브러리들이 호출되는데 로그아웃 후 newInstance를 해도 라이브러리는 안불러와서 화면이 보이지 않음
	});
	return;
}

/*
 * 로그아웃
 */
function onImageClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Image
	 */
	var image = e.control;
	
	var w = Math.floor(screen.width / 7);
	var h = Math.floor(screen.width / 10);
	
	displayBoardDialogConfirm(app.getRootAppInstance(), dataManager.getString("Str_Logout"), dataManager.getString("Str_LogoutConfirm"), w, h, function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				app.lookup("sms_logout").send();
			} else {
				return;
			}
		});
	});
}

/*
 * 언어설정
 */
function onImageClick4( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Image
	 */
	var image = e.control;
	var w = Math.floor(screen.width / 5);
	var h = Math.floor(screen.width / 6);
	
	var rootApp = app.getRootAppInstance();
	var rv;
	var option = {
		width: w,
		height: h,
		headerVisible: false,
		headerClose: true,
		resizable: true,
	};
	var dm_returnValue = app.lookup('returnValue');
	rootApp.openDialog("app/main/mainEmb/displayBoardMultiLang", option, function( /*cpr.controls.Dialog*/ dialog) {}).then(function(returnValue) {
		returnValue.copyToDataMap(app.lookup('returnValue'));
		// storage set
		localStorage.setItem("displayBoard_Iamge", dm_returnValue.getValue("image"));
		localStorage.setItem("displayBoard_Name", dm_returnValue.getValue("name"));
		localStorage.setItem("displayBoard_Count", dm_returnValue.getValue("count"));
	});
}

/*
 * 콤보 박스에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMDB_cmbTerminalList1Click( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var mDB_cmbTerminalList1 = e.control;
	mDB_cmbTerminalList1.open();
}

/*
 * 도움말
 */
function onMDB_imgHelpPageClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Image
	 */
	var mDB_imgHelpPage = e.control;
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}