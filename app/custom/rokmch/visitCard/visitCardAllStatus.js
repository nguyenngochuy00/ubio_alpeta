/************************************************
 * visitCardIssueStatus.js
 * Created at 2021. 2. 4. 오전 8:19:53.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var VMIAS_pageRowCount = 500;
var VMIAS_exportCount = 100; // 한번에 요청할 데이터 수

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var today = dateLib.getToday("-");
	app.lookup("VMIAS_dtiIssueStartAt").value = today;
	app.lookup("VMIAS_dtiIssueEndAt").value = today;
	
	var pageIndexer = app.lookup("VMIAS_piVisitCardList");
	pageIndexer.pageRowCount = VMIAS_pageRowCount; //한 페이지에 보여 줄 행의 수
	pageIndexer.viewPageCount = 10; // 보여지는 페이지 수(하단 부 인덱스 수)
	
	// 숫자가 아닌 이름으로 표기하기 위한 추가 - pse
	var cardTypeCombo = app.lookup("cmb_cardType");
	cardTypeCombo.addItem(new cpr.controls.Item(getAccessCardTypeNameforList(1), 1)); // 출입증(병사)
	cardTypeCombo.addItem(new cpr.controls.Item(getAccessCardTypeNameforList(2), 2)); // 출입증(군가족)
	cardTypeCombo.addItem(new cpr.controls.Item(getAccessCardTypeNameforList(3), 3)); // 출입증(상주민간인)
	cardTypeCombo.addItem(new cpr.controls.Item(getAccessCardTypeNameforList(4), 4)); // 방문증(방문)
	cardTypeCombo.addItem(new cpr.controls.Item(getAccessCardTypeNameforList(5), 5)); // 출입증(고정출입자)
	cardTypeCombo.addItem(new cpr.controls.Item(getAccessCardTypeNameforList(6), 6)); // 방문증(공사)
	cardTypeCombo.addItem(new cpr.controls.Item(getAccessCardTypeNameforList(7), 7)); // 방문증(면회)
	cardTypeCombo.addItem(new cpr.controls.Item(getAccessCardTypeNameforList(100), 100)); // 임시출입증
	cardTypeCombo.addItem(new cpr.controls.Item(getAccessCardTypeNameforList(201), 201)); // 공무원증
	cardTypeCombo.addItem(new cpr.controls.Item(getAccessCardTypeNameforList(202), 202)); // 방문 공무원증
	cardTypeCombo.addItem(new cpr.controls.Item(getAccessCardTypeNameforList(203), 203)); // 나라사랑카드
	
	// 숫자가 아닌 이름으로 표기하기 위한 추가  - pse
	var cardStatusCombo = app.lookup("cmb_cardStatus");
	cardStatusCombo.addItem(new cpr.controls.Item(getAccessCardStatusName(1), 1)); // 출력대기
	cardStatusCombo.addItem(new cpr.controls.Item(getAccessCardStatusName(2), 2)); // 발급 대기
	cardStatusCombo.addItem(new cpr.controls.Item(getAccessCardStatusName(3), 3)); // 발금
	cardStatusCombo.addItem(new cpr.controls.Item(getAccessCardStatusName(4), 4)); // 교부
	cardStatusCombo.addItem(new cpr.controls.Item(getAccessCardStatusName(5), 5)); // 회수
	cardStatusCombo.addItem(new cpr.controls.Item(getAccessCardStatusName(6), 6)); // 사고
	cardStatusCombo.addItem(new cpr.controls.Item(getAccessCardStatusName(7), 7)); // 사용중단
	cardStatusCombo.addItem(new cpr.controls.Item(getAccessCardStatusName(61), 61)); // 분실
	cardStatusCombo.addItem(new cpr.controls.Item(getAccessCardStatusName(62), 62)); // 훼손
	cardStatusCombo.addItem(new cpr.controls.Item(getAccessCardStatusName(63), 63)); // 기간만료
	cardStatusCombo.addItem(new cpr.controls.Item(getAccessCardStatusName(64), 64)); // 강제회수
	
	// 인원구분으로 검색 불가로 해당 조건 삭제  - pse
	app.lookup("searchGroup").getLayout().removeColumns([9,10]);
	
	// 처음 설정 = 전체 조회
	app.lookup("VMIAS_cmbAccessCardType").value = 9999;
	sendVisitCardListReq(true);
}

function onSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 방문증 검색
function onVMIAS_btnCardIssueStatusSearchClick( /* cpr.events.CMouseEvent */ e) {
	var pageIndexer = app.lookup("VMIAS_piVisitCardList");
	pageIndexer.currentPageIndex = 1;
	sendVisitCardListReq(true);
}

function onKeywordKeydown( /* cpr.events.CKeyboardEvent */ e) {
	if (e.keyCode == 13) {
		var pageIndexer = app.lookup("VMIAS_piVisitCardList");
		pageIndexer.currentPageIndex = 1;
		sendVisitCardListReq(true);
	}
}

function sendVisitCardListReq(isList) {
	app.lookup("AccessCardList").clear();
	var pageIndexer = app.lookup("VMIAS_piVisitCardList");
	var curIndex = pageIndexer.currentPageIndex;
	var offset = (curIndex - 1) * VMIAS_pageRowCount;
	
	var startAt = app.lookup("VMIAS_dtiIssueStartAt").value;
	var endAt = app.lookup("VMIAS_dtiIssueEndAt").value;
	
	var sms_getVisitCardList;
	if (isList == true) {
		sms_getVisitCardList = app.lookup("sms_getVisitCardList");
	} else {
		sms_getVisitCardList = app.lookup("sms_getVisitCardListExport");
	}
	sms_getVisitCardList.setParameters("startAt", startAt);
	sms_getVisitCardList.setParameters("endAt", endAt);
	//	sms_getVisitCardList.setParameters("expire", 1);
	
	if (isList == true) {
		sms_getVisitCardList.setParameters("limit", VMIAS_pageRowCount);
		sms_getVisitCardList.setParameters("offset", offset);
	} else {
		var exportParam = app.lookup("ExportParam");
		offset = exportParam.getValue("offset")
		sms_getVisitCardList.setParameters("limit", VMIAS_exportCount);
		sms_getVisitCardList.setParameters("offset", offset);
	}
	sms_getVisitCardList.setParameters("cardType", app.lookup("VMIAS_cmbAccessCardType").value);
	var cardStatus = app.lookup("VMIAS_cmbAccessCardStatus").value;
	if (cardStatus == 0) {
		cardStatus = AccessCardStatusIssuanceStatus;
	}
	sms_getVisitCardList.setParameters("accessCardStatus", cardStatus);
	sms_getVisitCardList.setParameters("managementNumber", app.lookup("VMIAS_ipbManagementNumber").value);
	sms_getVisitCardList.setParameters("userName", app.lookup("VMIAS_ipbName").value);	
	sms_getVisitCardList.send();
}

function validateDate(value) {
	if (value == undefined || value == "0001-01-01T00:00:00Z") {
		return "";
	}
	if (value.substring(0, 10) == "0001-01-01") {
		return;
	}
	return value.substring(0, 10) + " " + value.substring(11, 19);
}

// 방문증 리스트 가져오기 완료
function onSms_getVisitCardListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		console.log(app.lookup("AccessCardList").getRowDataRanged());
		var accessCardList = app.lookup("AccessCardList");
		var count = accessCardList.getRowCount();
		for (var i = 0; i < count; i++) {
			var accessCard = accessCardList.getRow(i);
//			accessCard.setValue("CardType", getAccessCardTypeName(accessCard.getValue("CardType"), accessCard.getValue("CardTypeEx"), true));
//			accessCard.setValue("CardStatus", getAccessCardStatusName(accessCard.getValue("CardStatus")));
			// 카드 종류를 표기하기 위해 cardType 과 cardTypeEx를 더해서 값을 지정...(공무원증 종류가 cardTypeEx를 사용해서 값이 있고, 나머지는 0..) - pse
			var cardTypePlusEx = Number(accessCard.getValue("CardType")) + accessCard.getValue("CardTypeEx");
			console.log(cardTypePlusEx);
			accessCard.setValue("CardType", cardTypePlusEx);
			accessCard.setValue("RegistAt", validateDate(accessCard.getValue("RegistAt")));
			accessCard.setValue("IssueAt", validateDate(accessCard.getValue("IssueAt")));
			accessCard.setValue("RetrieveAt", validateDate(accessCard.getValue("RetrieveAt")));
		}
		accessCardList.commit();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	var pageIndexer = app.lookup("VMIAS_piVisitCardList");
	var total = app.lookup("Total").getValue("Count");
	pageIndexer.totalRowCount = total;
}

function onVMVIS_piVisitCardListSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	sendVisitCardListReq(true);
}
//삭제용 수정
function onVMIAS_btnExportClick( /* cpr.events.CMouseEvent */ e) {
	var total = app.lookup("Total").getValue("Count");
	//wogus
	console.log("total = ", total);
	if (total == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "조회된 데이터가 없습니다.");
		return
	}
	//삭제리스트 추가.
	var grdAccessCardList = app.lookup("VMIAS_grdAccessCardList");
	var checkedRowIndices = grdAccessCardList.getCheckRowIndices();
	
	var delCount = checkedRowIndices.length;
	
	dataManager = getDataManager();
	if (delCount == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Info"), "삭제 카드 대상이 없습니다.");
		return
	} else {
		dialogConfirmAMHQ(app.getRootAppInstance(), "", dataManager.getString("Str_DeleteConfirm"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					comLib.showLoadMask("pro", "카드 삭제용", "", checkedRowIndices.length);
					
					var dsDeleteList = app.lookup("dsDeleteList");
					dsDeleteList.clear();
					
					for (var i = 0; i < delCount; i++) {
						var delIndex = checkedRowIndices[i];
						// cardType을 본래 값으로 복구.. - pse
						var cardType = Number(grdAccessCardList.getRow(delIndex).getValue("CardType")) - grdAccessCardList.getRow(delIndex).getValue("CardTypeEx");
						var delCardList = {
							"rowIndex": delIndex,
							"CardNumber": grdAccessCardList.getRow(delIndex).getValue("CardNumber"),
							"CardType": cardType,
							"CardTypeEx": grdAccessCardList.getRow(delIndex).getValue("CardTypeEx"),
							"CardStatus": grdAccessCardList.getRow(delIndex).getValue("CardStatus"),
							"OwnerID": grdAccessCardList.getRow(delIndex).getValue("OwnerID"),
							"IssuerID": grdAccessCardList.getRow(delIndex).getValue("IssuerID"),
							"CardName": grdAccessCardList.getRow(delIndex).getValue("CardName")
						};
						dsDeleteList.addRowData(delCardList);
					}
					sendDeleteCardNumber();
					
				} else {}
			});
		});
	}
	
	//sendVisitCardListReq(false);
}

function sendDeleteCardNumber() {
	var dsDeleteList = app.lookup("dsDeleteList");
	if (dsDeleteList.getRowCount() == 0) {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dialogAlertAMHQ(app, "Waning", dataManager.getString("Str_UserNotSelected"));
		return;
	}
	var dsTopData = dsDeleteList.getRow(0);
	var cardNumber = dsTopData.getValue("CardNumber");
	var cardName = dsTopData.getValue("CardName");
	console.log(dsTopData.getRowData());
	var msg = "카드 번호, 카드 명" + " : " + cardNumber + " / " + cardName;
	comLib.updateLoadMask(msg);

	// 이건 셋 파라미터로 보낸거에요 
	var accessCardInfo = app.lookup("AccessCardInfo");
	accessCardInfo.clear();
	accessCardInfo.setValue("CardNumber", dsTopData.getValue("CardNumber"));
	accessCardInfo.setValue("CardType", dsTopData.getValue("CardType"));
	accessCardInfo.setValue("CardTypeEx", dsTopData.getValue("CardTypeEx"));
	accessCardInfo.setValue("CardStatus", dsTopData.getValue("CardStatus"));
	accessCardInfo.setValue("OwnerID", dsTopData.getValue("OwnerID"));
	accessCardInfo.setValue("IssuerID", dsTopData.getValue("IssuerID"));
	accessCardInfo.setValue("CardName", dsTopData.getValue("CardName"));
	
	
	var sms_deleteCard = app.lookup("sms_postDeleteCard");
	/*
	sms_deleteCard.setParameters("CardNumber", dsTopData.getValue("CardNumber"));
	sms_deleteCard.setParameters("CardType", dsTopData.getValue("CardType"));
	sms_deleteCard.setParameters("CardTypeEx", dsTopData.getValue("CardTypeEx"));
	sms_deleteCard.setParameters("CardStatus", dsTopData.getValue("CardStatus"));
	sms_deleteCard.setParameters("OwnerID", dsTopData.getValue("OwnerID"));
	sms_deleteCard.setParameters("IssuerID", dsTopData.getValue("IssuerID"));
	sms_deleteCard.setParameters("CardName", dsTopData.getValue("CardName"));
	sms_deleteCard.mediaType = "application/x-www-form-urlencoded";
	* */
	sms_deleteCard.send();
	/*
		var sms_deleteUser = new cpr.protocols.Submission("sms_postDeleteCard");
		sms_deleteUser.action = "/v1/users/"+userID;
		sms_deleteUser.method = "post";
		sms_deleteUser.mediaType = "application/x-www-form-urlencoded";
	//	sms_deleteUser.userAttr("uid", userID);
	//	sms_deleteUser.userAttr("rowIndex", dsUserID.getValue("rowIndex").toString());	
	//	sms_deleteUser.addResponseData(app.lookup("Result"), false, "Result");
	//		
	//	sms_deleteUser.addEventListenerOnce("submit-done", onSms_deleteUserSubmitDone);
	//	sms_deleteUser.addEventListenerOnce("submit-error", onSms_deleteUserSubmitError);
	//	sms_deleteUser.addEventListenerOnce("submit-timeout", onSms_deleteUserSubmitTimeout);
	//	sms_deleteUser.send();
	* */
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postDeleteCardSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postDeleteCard = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		var dsDelete = app.lookup("dsDeleteList");
		console.log("카운트", dsDelete.getRowCount());
		var gridRow = dsDelete.getValue(0, "rowIndex");
		var grid = app.lookup("VMIAS_grdAccessCardList"); 
		grid.deleteRow(gridRow);
//		dsDelete.deleteRow(0);
		dsDelete.realDeleteRow(0);
		console.log("카운트", dsDelete.getRowCount());
		if (dsDelete.getRowCount() > 0) {
			sendDeleteCardNumber();
		} else {
			comLib.hideLoadMask();
		}
		
	}else {
		comLib.hideLoadMask();
	}
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_postDeleteCardSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postDeleteCard = e.control;
	comLib.hideLoadMask();
	dialogAlertAMHQ(app, dataManager.getString("Str_Info"), "삭제 실패하였습니다.");
	return;
}


/*
 * Grid의 RowCheckbox가 체크 되었을 때 발생하는 이벤트. (columnType=checkbox)
 */
function onVMIAS_grdAccessCardListRowCheck(/* cpr.events.CGridEvent */ e){
	var grdAccessCardList = e.control;
	// 카드번호가 0인 리스트는 삭제 못하도록 수정  - pse
	
	var checkRowIndices = grdAccessCardList.getCheckRowIndices();
	var i;
	for (i = 0; i < checkRowIndices.length; i++) {
		var index = checkRowIndices[i];
		console.log(grdAccessCardList.getCellValue(index, 4));
		if (grdAccessCardList.getCellValue(index, 4) == 0) {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "카드 번호가 없는 내역은 삭제할 수 없습니다.");
			grdAccessCardList.setCheckRowIndex(index, false);		
		}		
	}
	
}
