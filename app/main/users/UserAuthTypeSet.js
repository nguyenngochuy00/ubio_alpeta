/************************************************
 * userAuthTypeSet.js
 * Created at 2018. 10. 16. 오전 10:17:14.
 *
 * @author fois
 ************************************************/
var dataDragManager = cpr.core.Module.require("lib/DataDragManager");
var dataManager = cpr.core.Module.require("lib/DataManager");

var USATS_authCountMax = 3;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	var brandType = dataManager.getSystemBrandType();
	
	var initValue = app.getHost().initValue;
	var arrAndAuth = initValue["AuthAnd"];
	var arrOrAuth = initValue["AuthOr"];
	var arrExcludeAuth = initValue["Exclude"]
	
	var dsAndAuth = app.lookup("dsAndAuth");
	for (var i = 0; i < arrAndAuth.length; i++) {
		var type = getAuthTypeString(arrAndAuth[i]);
		if (type == null || type == "") continue;
		
		if ( dataManager.getOemVersion() == OEM_HDEC_CW ) {
			if (type == "CD") {
				type = "카드";
			} else if (type == "PW") {
				type = "패스워드";
			} else if (type == "FP") {
				type = "지문";
			} else if (type == "FAW") {
				type = "워크스루";
			} else if (type == "FA") {
				type = "얼굴"
			} else if (type == "MC") {
				type = "모바일키";
			} else if (type == "FPCard") {
				type = "지문카드";
			} else if (type == "IR") {
				type = "홍채";
			}
		}
		dsAndAuth.addRowData({
			"Type": type,
			"Value": arrAndAuth[i]
		});
	}
	
	var dsOrAuth = app.lookup("dsOrAuth");
	for (var i = 0; i < arrOrAuth.length; i++) {
		var type = getAuthTypeString(arrOrAuth[i]);
		if (type == null || type == "") continue;
		
		if ( dataManager.getOemVersion() == OEM_HDEC_CW ) {
			if (type == "CD") {
				type = "카드";
			} else if (type == "PW") {
				type = "패스워드";
			} else if (type == "FP") {
				type = "지문";
			} else if (type == "FAW") {
				type = "워크스루";
			} else if (type == "FA") {
				type = "얼굴"
			} else if (type == "MC") {
				type = "모바일키";
			} else if (type == "FPCard") {
				type = "지문카드";
			} else if (type == "IR") {
				type = "홍채";
			}
		}
		dsOrAuth.addRowData({
			"Type": type,
			"Value": arrOrAuth[i]
		});
	}
	
	var dsAuthTypeList = app.lookup("dsAuthTypeList");
	
	if ( dataManager.getOemVersion() == OEM_UMS_QRCODE ) {
		
		// 학번, 위도 경도, 만기 시간일자 3 가지 인증 타입 추가 수정 	- zzik
		for (var i = 1; i < 33; i++) {
			if (i == 6 || i == 7 || ( i > 9 && i < 30)) {
				continue;
			}
			var isExclude = false;
			if (arrExcludeAuth) {
				for (var k = 0; k < arrExcludeAuth.length; k++) {
					if (arrExcludeAuth[k] == i) {
						isExclude = true;
						break;
					}
				}
			}
			if (isExclude) {
				continue;
			}
			
			var Type = getAuthTypeString(i);
			
			var newRow = dsAuthTypeList.addRowData({
				"Type": Type,
				"Value": i
			});
			var selRow = dsAndAuth.findFirstRow("Value == '" + i + "'");
			if (selRow != null) {
				dsAuthTypeList.setRowState(newRow.getIndex(), cpr.data.tabledata.RowState.DELETED);
			} else {
				selRow = dsOrAuth.findFirstRow("Value == '" + i + "'");
				if (selRow != null) {
					dsAuthTypeList.setRowState(newRow.getIndex(), cpr.data.tabledata.RowState.DELETED);
				} else {
					dsAuthTypeList.setRowState(newRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
				}
			}
		}
	} else {
		for (var i = 1; i < 10; i++) {
			if ( dataManager.getOemVersion() == OEM_GS_BASIC ) {
				if (i == 5 || i == 7 || i == 8 ){ //MC, QR, FPCard
					continue;
				} 
			}	
			//if( i == 5 ){continue;} // MC 예외 처리
			if (i == 7) {
				continue;
			} // QR 예외 처리
			
			var isExclude = false;
			if (arrExcludeAuth) {
				for (var k = 0; k < arrExcludeAuth.length; k++) {
					if (arrExcludeAuth[k] == i) {
						isExclude = true;
						break;
					}
				}
			}
			if (isExclude) {
				continue;
			}
			
			var Type = getAuthTypeString(i);
			if ( dataManager.getOemVersion() == OEM_HDEC_CW ) {
				if (Type == "CD") {
					Type = "카드";
				} else if (Type == "PW") {
					Type = "패스워드";
				} else if (Type == "FP") {
					Type = "지문";
				} else if (Type == "FAW") {
					Type = "워크스루";
				} else if (Type == "FA") {
					Type = "얼굴"
				} else if (Type == "MC") {
					Type = "모바일키";
				} else if (Type == "FPCard") {
					Type = "지문카드";
				} else if (Type == "IR") {
					Type = "홍채";
				}
			}
			var newRow = dsAuthTypeList.addRowData({
				"Type": Type,
				"Value": i
			});
			var selRow = dsAndAuth.findFirstRow("Value == '" + i + "'");
			if (selRow != null) {
				dsAuthTypeList.setRowState(newRow.getIndex(), cpr.data.tabledata.RowState.DELETED);
			} else {
				selRow = dsOrAuth.findFirstRow("Value == '" + i + "'");
				if (selRow != null) {
					dsAuthTypeList.setRowState(newRow.getIndex(), cpr.data.tabledata.RowState.DELETED);
				} else {
					dsAuthTypeList.setRowState(newRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
				}
			}
		}
	}

	
	refreshAuthContrl();
	
	app.lookup("USATS_grdAuthTypeList").redraw();
	app.lookup("USATS_grdAuthAnd").redraw();
	app.lookup("USATS_grdAuthOr").redraw();
}

// 버디 타입인 경우 필수나 선택 한쪽만 선택이 가능하므로 이 함수에서 컨트롤 활성화 여부 수행
function refreshAuthContrl() {
	var brandType = dataManager.getSystemBrandType();
	if (brandType != BRAND_VRIDI) {
		return;
	}
	var enableAnd = true;
	var enableOr = true;
	var dsAndAuth = app.lookup("dsAndAuth");
	var dsOrAuth = app.lookup("dsOrAuth");
	if (dsAndAuth.getRowCount() > 0) {
		enableOr = false;
	}
	if (dsOrAuth.getRowCount() > 0) {
		enableAnd = false;
	}
	if (enableAnd == false && enableOr == false) {
		enableAnd = true; // 예외처리 .. 인증수단이 둘다 비활성화 되면 수정이 불가능하므로
	}
	
//	if ( dataManager.getOemVersion() == OEM_UMS_QRCODE ) {
//		// 인증타입 and 만 사용
//		enableOr = false;
//		enableAnd = true;
//	}
	
	app.lookup("USATS_grdAuthAnd").enabled = enableAnd
	app.lookup("USATS_grdAuthOr").enabled = enableOr
}
//and 인증에서 드래그 시작
function onUSATS_grdAuthAndMousedown( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSATS_grdAuthAnd = e.control;
	
	if (e.targetObject && e.targetObject.row) {
		var row = e.targetObject.row;
		dataDragManager.dataTransfer = {
			"Src": "andAuth",
			"Row": row
		};
	} else {
		return;
	}
	
	var appRect = app.getActualRect();
	
	var buffer = 20;
	var dragMessage = new cpr.controls.Output("rowmessage");
	dragMessage.style.css({
		"position": "absolute",
		"left": (e.clientX - appRect.left) + "px",
		"top": ((e.clientY - appRect.top) + buffer) + "px",
		width: "100px",
		height: "25px",
		"text-align": "center",
		border: "solid 1px red",
		backgroundColor: "#FFF",
		"box-shadow": "0px 2px 2px 0px rgba(0, 0, 0, .3)"
	});
	
	dragMessage.ellipsis = true;
	var text = e.targetObject.row.getValue("Type");
	dragMessage.value = text;
	dataDragManager.dragStart(dragMessage, app, e);
}

// and 인증으로 인증수단 그래그 함
function onUSATS_grdAuthAndMouseup( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSATS_grdAuthAnd = e.control;
	
	if (dataDragManager.dataTransfer) {
		
		var row = dataDragManager.dataTransfer["Row"];
		if (e.targetObject != null && e.targetObject.rowIndex == row.getIndex()) {
			return;
		}
		var type = row.getValue("Type");

		var value = row.getValue("Value");
		if (type == null) {
			return;
		}
		
		var dsAndAuth = app.lookup("dsAndAuth");
		var brandType = dataManager.getSystemBrandType();
		if (brandType == BRAND_VRIDI) { // 버디 타입인 경우	
			var authCount = dsAndAuth.getRowCount();
			
			// UMS_QRCODE 향 qrcode 인증 수단 중 Coordinate, ExpiryDatetime count 제외
			if ( dataManager.getOemVersion() == OEM_UMS_QRCODE ) {
				if ( authCount != 0 ) {
//					var qrcodeAuthRows = dsAndAuth.findAllRow("Value == 30 || Value == 31 || Value == 32");
					var qrcodeAuthRows = dsAndAuth.findAllRow("Value == 31 || Value == 32");
				}
				
				if (qrcodeAuthRows) {
					authCount = authCount - qrcodeAuthRows.length;
				}
				
				// 30 : StudentID , 31 : Coordinate , 32 : ExpiryDatetime
				// studentID 는 qrcode 디폴트 값이므로 sutudentID 가 존재 해야지만 위도경도, 만료일 추가 가능
				if ( value == 31 || value == 32) {
					var defaultQrcodeRow = dsAndAuth.findFirstRow("Value == 30");
					if ( !defaultQrcodeRow ) {
						dialogAlert(app, dataManager.getString("Str_Warning"), "QR code cannot be used without the default studentID.");
						return;
					}
				}
			
			}
			
			if (dataDragManager.dataTransfer["Src"] != "andAuth" && authCount >= USATS_authCountMax) { // And 인증내 순서 변경이 아니고 이미 3개의 등록 수단이 있는 경우
				// UMS_QRCODE 향 qrcode 인증 수단 중 Coordinate, ExpiryDatetime count 제외
				if ( dataManager.getOemVersion() == OEM_UMS_QRCODE ) { 
//					if ( value == 30 || value == 31 || value == 32 ) {
					if ( value == 31 || value == 32 ) {
						
					} else {
						dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeMaxExceed"));
						return;
					}
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeMaxExceed"));
					return;
				}
			}
			if (value == AuthTypeFingerCard) { // 지문카드가 추가되는 경우
				// 지문카드는 독립된 인증수단 이므로 and에 추가 안됨
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeFPCardAndError"));
				return;
			}
			if (value == AuthTypeMobileCard) { // 모바일카드가 추가되는 경우
				// 모바일카드는 and에 추가 안됨
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeMobileCardAndError"));
				return;
			}
		}
		
		var targetIndex = (e.targetObject != null) ? e.targetObject.rowIndex : dsAndAuth.getRowCount();
		
		if (dataDragManager.dataTransfer["Src"] === "authList") { // 인증 리스트에서 추가한 경우		
			
			var dsAuthTypeList = app.lookup("dsAuthTypeList");
			var updateRow = dsAuthTypeList.findFirstRow("Type == '" + type + "'");
			dsAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.DELETED);
			dsAndAuth.insertRowData(targetIndex, false, {
				"Type": type,
				"Value": value
			});
			
		} else if (dataDragManager.dataTransfer["Src"] === "orAuth") { // OR 인증에서 옮겨온 경우
			var dsOrAuth = app.lookup("dsOrAuth");
			var deleteRow = dsOrAuth.findFirstRow("Type == '" + type + "'");
			dsOrAuth.realDeleteRow(deleteRow.getIndex());
			dsAndAuth.insertRowData(targetIndex, false, {
				"Type": type,
				"Value": value
			});
			
		} else { // And 내부에서 순서만 변경한 경우.
			var srcIndex = row.getIndex();
			var bAfter = false
			if (targetIndex > srcIndex) {
				//targetIndex -= 1;
				bAfter = true
			}
			dsAndAuth.moveRowIndex(srcIndex, targetIndex, bAfter);
			//realDeleteRow(delIndex);	
		}
		uSATS_grdAuthAnd.redraw();
		refreshAuthContrl();
	}
}

// and 인증수단 더블클릭
function onUSATS_grdAuthAndDblclick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSATS_grdAuthAnd = e.control;
	
	var row = uSATS_grdAuthAnd.getSelectedRow();
	var type = row.getValue("Type");
	var qrcodeFlag = false
	var dsAuthTypeList = app.lookup("dsAuthTypeList");
	var updateRow = dsAuthTypeList.findFirstRow("Type == '" + type + "'");
	
	if (updateRow) {
		dsAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
		
		if ( dataManager.getOemVersion() == OEM_UMS_QRCODE ) {
			if ( row.getValue("Value") == 30 ) {
				var qrcodeAuthRows = dsAuthTypeList.findAllRow("Value == 31 || Value == 32");
				if ( qrcodeAuthRows ) {
					qrcodeAuthRows.forEach(function(each){
						dsAuthTypeList.setRowState(each.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
						qrcodeFlag = true;
					});
				}
			}
		}
		
		app.lookup("USATS_grdAuthTypeList").redraw();
		
		var dsAndAuth = app.lookup("dsAndAuth");
		dsAndAuth.realDeleteRow(row.getIndex());
		
		if ( dataManager.getOemVersion() == OEM_UMS_QRCODE ) { 
			if ( qrcodeFlag ) {
				var qrcodeDsAndAuth =  dsAndAuth.findAllRow("Value == 31 || Value == 32");
				if ( qrcodeDsAndAuth ) {
					qrcodeDsAndAuth.forEach(function(each){
						dsAndAuth.deleteRow(each.getIndex());
					});
					dsAndAuth.commit();
				}
			}
		}
		
		refreshAuthContrl();
	}
}

// or 인증에서 드래그 시작
function onUSATS_grdAuthOrMousedown( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSATS_grdAuthOr = e.control;
	
	if (e.targetObject && e.targetObject.row) {
		var row = e.targetObject.row;
		dataDragManager.dataTransfer = {
			"Src": "orAuth",
			"Row": row
		};
	} else {
		return;
	}
	
	var appRect = app.getActualRect();
	
	var buffer = 20;
	var dragMessage = new cpr.controls.Output("rowmessage");
	dragMessage.style.css({
		"position": "absolute",
		"left": (e.clientX - appRect.left) + "px",
		"top": ((e.clientY - appRect.top) + buffer) + "px",
		width: "100px",
		height: "25px",
		"text-align": "center",
		border: "solid 1px red",
		backgroundColor: "#FFF",
		"box-shadow": "0px 2px 2px 0px rgba(0, 0, 0, .3)"
	});
	
	dragMessage.ellipsis = true;
	var text = e.targetObject.row.getValue("Type");
	dragMessage.value = text;
	dataDragManager.dragStart(dragMessage, app, e);
}

// or 인증으로 인증수단 드래그 해 옴
function onUSATS_grdAuthOrMouseup( /* cpr.events.CMouseEvent */ e) {
	/** @type cpr.controls.Grid */
	var uSATS_grdAuthOr = e.control;
	
	if (dataDragManager.dataTransfer == null) { // 드래그 앤 드롭이 아닌 경우 리턴.
		return;
	}
	/** @type cpr.data.Row */
	var row = dataDragManager.dataTransfer["Row"];
	if (e.targetObject != null && e.targetObject.rowIndex == row.getIndex()) { // 드롭 대상이 없거나 드래그 원본과 같은 객체일 경우 리턴
		return;
	}
	
	var type = row.getValue("Type");
	var value = row.getValue("Value");
	if (type == null) {
		return;
	}
	
	// 모바일 카드는 STANDARD 이상
	var LicenseLevel = dataManager.getSystemLicenseLevel()
	if(LicenseLevel < LicenseSTANDARD && row.getValue("Value") == AuthTypeMobileCard){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorLicenseInvalidFunc"));
		return;
	}
	
	var dsOrAuth = app.lookup("dsOrAuth"); // OR 인증 리스트 데이터 셋
	var brandType = dataManager.getSystemBrandType();
	if (brandType == BRAND_VRIDI) { // 버디 타입인 경우	
		if (dataDragManager.dataTransfer["Src"] != "orAuth") { // OR 인증 리스트 내에서 데이터 순서만 바꾸는 경우가 아니면 패스워드 인증 체크	
			var pwAuth = dsOrAuth.findFirstRow("Value == " + AuthTypePassword);
			var authCount = dsOrAuth.getRowCount();
			
			if ( dataManager.getOemVersion() == OEM_UMS_QRCODE ) {
				
				// UMS_QRCODE 향 qrcode 인증 수단 중 Coordinate, ExpiryDatetime count 제외
				if ( authCount != 0 ) {
//					var qrcodeAuthRows = dsOrAuth.findAllRow("Value == 30 || Value == 31 || Value == 32");
					var qrcodeAuthRows = dsOrAuth.findAllRow("Value == 31 || Value == 32");
				}
				
				if (qrcodeAuthRows) {
					authCount = authCount - qrcodeAuthRows.length;
				}
				
				// 30 : StudentID , 31 : Coordinate , 32 : ExpiryDatetime
				// studentID 는 qrcode 디폴트 값이므로 sutudentID 가 존재 해야지만 위도경도, 만료일 추가 가능
				if ( value == 31 || value == 32) {
					var defaultQrcodeRow = dsOrAuth.findFirstRow("Value == 30");
					if ( !defaultQrcodeRow ) {
						dialogAlert(app, dataManager.getString("Str_Warning"), "QR code cannot be used without the default studentID.");
						return;
					}
				}
			
			}
			
			if (pwAuth || value == AuthTypePassword) { // OR 인증이고 PW 인증이 포함되어 있는 경우
				if (authCount >= USATS_authCountMax - 1) { // 인증 수단이 2개이면 더이상 추가 할 수 없다.
					// UMS_QRCODE 향 qrcode 인증 수단 중 Coordinate, ExpiryDatetime count 제외
					if (dataManager.getOemVersion() == OEM_UMS_QRCODE) {
//						if ( value == 30 || value == 31 || value == 32 ) {
						if ( value == 31 || value == 32 ) {
						
						} else {
							dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeORPasswordWarning"));
							return;
						}
					} else {
						dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeORPasswordWarning"));
						return;
					}
				}
			}
			if (dataManager.getOemVersion() != OEM_HYUNDAI_MSEAT) {
				
				if (authCount >= USATS_authCountMax) {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeMaxExceed"));
					return;
				}
			} else { // 현대 엠시트는 4개까지
				if (authCount >= 4) {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeMaxExceed"));
					return;
				}
			}
			
			/*
			if (value == AuthTypeMobileCard) { // 모바일카드가 추가되는 경우. or 인증에 카드와 모바일 카드 동시 설정 불가				
				var cardAuth = dsOrAuth.findFirstRow("Value == "+AuthTypeCard);
				if( cardAuth ){
					dialogAlert(app,dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeMobileCardOrCardWarning"));				
					return;
				}				
			} else if (value == AuthTypeCard) { // 카드가 추가되는 경우. or 인증에 카드와 모바일 카드 동시 설정 불가				
				var cardAuth = dsOrAuth.findFirstRow("Value == "+AuthTypeMobileCard);
				if( cardAuth ){
					dialogAlert(app,dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeMobileCardOrCardWarning"));				
					return;
				}
			}
			*/
			
			var fpCardAuth = dsOrAuth.findFirstRow("Value == " + AuthTypeFingerCard);
			if (fpCardAuth) { // 지문카드가 있으면 어떠한 인증타입도 추가 안됨
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeFPCardIndependentError"));
				return;
			} else if (value == AuthTypeFingerCard) { // 지문카드가 추가되는 경우
				if (authCount > 0) { // 이미 추가된것이 하나라도 있으면
					//console.log("기존 등록된거 모두 제거하고 FPcard만남긴다.");
					var dsAuthTypeList = app.lookup("dsAuthTypeList");
					for (var i = 0; i < dsOrAuth.getRowCount(); i++) {
						var daOrAuthData = dsOrAuth.getRow(i);
						var tmpType = daOrAuthData.getValue("Type");
						var updateRow = dsAuthTypeList.findFirstRow("Type == '" + tmpType + "'"); //
						dsAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
					}
					app.lookup("USATS_grdAuthTypeList").redraw();
					dsOrAuth.clear();
				}
			}
		}
	}
	
	// 드롭 위치가 빈 공간이라면 리스트 맨 뒤에 아니면 드롭 위치의 row index를 가져온다.
	var targetIndex = (e.targetObject != null) ? e.targetObject.rowIndex : dsOrAuth.getRowCount();
	
	if (dataDragManager.dataTransfer["Src"] === "authList") { // 드롭 원본이 인증수단 리스트인 경우
		
		var dsAuthTypeList = app.lookup("dsAuthTypeList");
		var updateRow = dsAuthTypeList.findFirstRow("Type == '" + type + "'");
		dsAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.DELETED);
		
		dsOrAuth.insertRowData(targetIndex, false, {
			"Type": type,
			"Value": value
		})
		
	} else if (dataDragManager.dataTransfer["Src"] === "andAuth") { // 드롭 원본이 AND 인증 리스트인 경우
		var dsAndAuth = app.lookup("dsAndAuth");
		var deleteRow = dsAndAuth.findFirstRow("Type == '" + type + "'");
		dsAndAuth.realDeleteRow(deleteRow.getIndex());
		
		dsOrAuth.insertRowData(targetIndex, false, {
			"Type": type,
			"Value": value
		})
		
	} else {
		var srcIndex = row.getIndex();
		var bAfter = false
		if (targetIndex > srcIndex) {
			//targetIndex -= 1;
			bAfter = true
		}
		dsOrAuth.moveRowIndex(srcIndex, targetIndex, bAfter);
	}
	uSATS_grdAuthOr.redraw();
	refreshAuthContrl();
}

// or 인증수단 더블 클릭
function onUSATS_grdAuthOrDblclick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSATS_grdAuthOr = e.control;
	
	var row = uSATS_grdAuthOr.getSelectedRow();
	var type = row.getValue("Type");
	var qrcodeFlag = false;
	
	var dsAuthTypeList = app.lookup("dsAuthTypeList");
	var updateRow = dsAuthTypeList.findFirstRow("Type == '" + type + "'");
	
	if (updateRow) {
		dsAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
		
		if ( dataManager.getOemVersion() == OEM_UMS_QRCODE ) {
			if ( row.getValue("Value") == 30 ) {
				var qrcodeAuthRows = dsAuthTypeList.findAllRow("Value == 31 || Value == 32");
				if ( qrcodeAuthRows ) {
					qrcodeAuthRows.forEach(function(each){
						dsAuthTypeList.setRowState(each.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
						qrcodeFlag = true;
					});
				}
			}
		}
		
		app.lookup("USATS_grdAuthTypeList").redraw();
		
		var dsOrAuth = app.lookup("dsOrAuth");
		dsOrAuth.realDeleteRow(row.getIndex());
		
		if ( dataManager.getOemVersion() == OEM_UMS_QRCODE ) { 
			if ( qrcodeFlag ) {
				var qrcodeDsAndAuth =  dsOrAuth.findAllRow("Value == 31 || Value == 32");
				if ( qrcodeDsAndAuth ) {
					qrcodeDsAndAuth.forEach(function(each){
						dsOrAuth.deleteRow(each.getIndex());
					});
					dsOrAuth.commit();
				}
			}
		}
		
		uSATS_grdAuthOr.redraw();
		refreshAuthContrl();
	}
}

// 인증수단 리스트에서 드래그 시작 함.
function onUSATS_grdAuthTypeListMousedown( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSATS_grdAuthTypeList = e.control;
	
	if (e.targetObject && e.targetObject.row) {
		var row = e.targetObject.row;
		
		if (row.getState() == cpr.data.tabledata.RowState.DELETED) {
			return;
		}
		
		dataDragManager.dataTransfer = {
			"Src": "authList",
			"Row": row
		};
		
	} else {
		return;
	}
	
	var appRect = app.getActualRect();
	
	var buffer = 20;
	var dragMessage = new cpr.controls.Output("rowmessage");
	dragMessage.style.css({
		"position": "absolute",
		"left": (e.clientX - appRect.left) + "px",
		"top": ((e.clientY - appRect.top) + buffer) + "px",
		width: "100px",
		height: "25px",
		"text-align": "center",
		border: "solid 1px red",
		backgroundColor: "#FFF",
		"box-shadow": "0px 2px 2px 0px rgba(0, 0, 0, .3)"
	});
	
	dragMessage.ellipsis = true;
	var text = e.targetObject.row.getValue("Type");
	dragMessage.value = text;
	dataDragManager.dragStart(dragMessage, app, e);
	
}

// 인증수단 리스트로 인증수단 드래그 해 옴
function onUSATS_grdAuthTypeListMouseup( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var uSATS_grdAuthTypeList = e.control;
	if (dataDragManager.dataTransfer) {
		
		var row = dataDragManager.dataTransfer["Row"];
		var type = row.getValue("Type");
		var qrcodeFlag = false;
		var dsSource;
		var gridSource;
		if (dataDragManager.dataTransfer["Src"] === "andAuth") {
			dsSource = app.lookup("dsAndAuth");
			gridSource = app.lookup("USATS_grdAuthAnd")
		} else if (dataDragManager.dataTransfer["Src"] === "orAuth") {
			dsSource = app.lookup("dsOrAuth");
			gridSource = app.lookup("USATS_grdAuthOr")
		} else {
			return;
		}
		var updateRow = uSATS_grdAuthTypeList.findFirstRow("Type == '" + type + "'");
		
		if (updateRow) {
			if ( dataManager.getOemVersion() == OEM_UMS_QRCODE ) {
				if ( updateRow.getValue("Value") == 30 ) { 
					var qrcodedsSource = dsSource.findAllRow("Value == 31 || Value == 32");
					if ( qrcodedsSource ) {
						qrcodedsSource.forEach(function(each){
							dsSource.deleteRow(each.getIndex())
						});
						dsSource.commit();
					}
					qrcodeFlag = true;
				}
			}
			
			dsSource.realDeleteRow(row.getIndex());
			uSATS_grdAuthTypeList.setRowState(updateRow.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
		
			if ( dataManager.getOemVersion() == OEM_UMS_QRCODE ) {
				if ( qrcodeFlag ) {
					var qrcodeDsAndAuth = uSATS_grdAuthTypeList.findAllRow("Value == 31 || Value == 32");
					console.log(qrcodeDsAndAuth);
					if ( qrcodeDsAndAuth ) {
						qrcodeDsAndAuth.forEach(function(each){
							uSATS_grdAuthTypeList.setRowState(each.getIndex(), cpr.data.tabledata.RowState.UNCHANGED);
						});
						dsSource.commit();
					}
				}
			}
		
			gridSource.redraw();
			uSATS_grdAuthTypeList.redraw();
		}
		refreshAuthContrl();
	}
}

/*
 * "적용" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSATS_btnApplyClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var uSATS_btnApply = e.control;
	
	var dsAndAuth = app.lookup("dsAndAuth");
	var dsOrAuth = app.lookup("dsOrAuth");
	
	var andCount = dsAndAuth.getRowCount();
	var orCount = dsOrAuth.getRowCount();
	
		
//	if (dataManager.getOemVersion() != OEM_INNODEP_PHCITYHALL) {
//		if(andCount + orCount == 0) {
//			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserAuthTypeAtLeastOne"));
//			return;
//		}
//	}
	
	var OemVs = dataManager.getOemVersion()
	if (OemVs >= 21000)
	{
		var InnodepOemVersion = OemVs - 21000
		if(InnodepOemVersion != 1)
		{
			if(andCount + orCount == 0) {
				dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserAuthTypeAtLeastOne"));
				return;
			}
		}
	}
	else 
	{
		if(andCount + orCount == 0) {
			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserAuthTypeAtLeastOne"));
			return;
		}
	}

	
	var idx = 0;
	var result = [];
	
	for (var i = 0; i < andCount; i++) {
		var row = dsAndAuth.getRow(i);
		result[idx++] = row.getValue("Value");
	}
	
	for (var i = 0; i < orCount; i++) {
		var row = dsOrAuth.getRow(i);
		result[idx++] = row.getValue("Value");
	}
	for (var k = dsAndAuth.getRowCount() + dsOrAuth.getRowCount(); k < 7; k++) {
		result[idx++] = 0
	}
	result[7] = dsAndAuth.getRowCount();
	app.close(result);
}