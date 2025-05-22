/************************************************
 * TerminalUser.js
 * Created at 2019. 1. 11. 오후 2:30:52.
 *
 * @author joymrk
 ************************************************/
var comLib;
var selectTerminalID;
var selectUserID;

var TMUSR_pageRowCount = 50;
var TMUSR_userCountPerRequest = 10; // 한번에 가져올 사용자 ID,Name 리스트. 단말에서 최대 10명씩만 보냄
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var usint_version;
var oem_version;

var NSH_DEV_CODE = 0;
var ENABLE_MCP040 = 0;
var MCP_SENDMODE = false;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	NSH_DEV_CODE = dataManager.getNSH_DEV_CODE();
	ENABLE_MCP040 = dataManager.getENABLE_MCP040();
	oem_version = dataManager.getOemVersion();
	
	var udcTerminalList = app.lookup("TMUSR_udcTerminalList");
	udcTerminalList.deleteColumn([13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 0]); //체크 기능 추가	
	udcTerminalList.setPaging(0, 1, 5, TMUSR_pageRowCount);
	
	var dsTerminalList = dataManager.getTerminalList();
	
	/*
	for (var ii=0;ii< dsTerminalList.getRowCount();ii++) {
		
		console.log("ID: " + dsTerminalList.getRow(ii).getValue("ID"));
		console.log("GroupCode: " + dsTerminalList.getRow(ii).getValue("GroupCode"));
		console.log("Name: " + dsTerminalList.getRow(ii).getValue("Name"));
		console.log("Status: " + dsTerminalList.getRow(ii).getValue("Status"));
		console.log("TimezoneVersion: " + dsTerminalList.getRow(ii).getValue("TimezoneVersion"));
		console.log("Type: " + dsTerminalList.getRow(ii).getValue("Type"));
	}	
	*/
	
	if(oem_version == OEM_REMOTE_FAW_MANAGEMENT){
		udcTerminalList.setTerminalList(dsTerminalList, "connectNotAuth");
	} else {
		udcTerminalList.setTerminalList(dsTerminalList, "connect");		
	}
	
	//udcTerminalList.setTerminalList(dsTerminalList,"");
	
	var udcServerUserList = app.lookup("TMUSR_udcServerUserList");
	if (dataManager.getOemVersion() == OEM_KANGWONLAND) {
		udcServerUserList.deleteColumn([14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4]);
	} else {
		udcServerUserList.deleteColumn([14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
	}
	
	udcServerUserList.setPaging(0, 1, 5, TMUSR_pageRowCount);
	
	var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
	
	if (dataManager.getOemVersion() == OEM_OMAN_TERMINAL_UPDATEUSER) {
		udcTerminalUserList.visibleColumn(14, true);
	}
	udcTerminalUserList.deleteColumn([13, 12, 11, 10, 9, 7, 6, 5, 4, 3]);
	udcTerminalUserList.enablePageIndexer(false);
	
	/*
	if(dataManager.getSystemBrandType()==BRAND_NITGEN){
		app.lookup("TMUSR_btnUserIDInfoRequest").visible = false;
	 }else {
	 	
		app.lookup("TMUSR_btnUserIDInfoRequest").visible = true;
	}
	* */
	app.lookup("TMUSR_btnUserIDInfoRequest").visible = true;
	
	if (ENABLE_MCP040 == 1) {
		var sms_get_mcp_list = app.lookup("sms_get_mcp_list");
		sms_get_mcp_list.send();
	}
	
	if (dataManager.getOemVersion() == OEM_KANGWONLAND || dataManager.getOemVersion() == OEM_HYUNDAI_MSEAT) {
		TMUSR_pageRowCount = 10000;
		app.lookup("TMUSR_btnUserReSend").visible = true;
		if(dataManager.getOemVersion() == OEM_KANGWONLAND) {
			app.lookup("TMUSR_btnUserReSend").enabled = true;			
		}
		
		app.lookup("TMUSR_cmbUserCategory").addItem(new cpr.controls.Item("UniqueID", "UniqueID"));
		
	} else if (dataManager.getOemVersion() == OEM_DJMCITYHALL) {
		var tmpCmbGroupList = app.lookup("cmbGroupList");
		tmpCmbGroupList.visible = true;
		var groupList = dataManager.getGroup();
		tmpCmbGroupList.setItemSet(groupList, {
			label: "Name",
			value: "GroupID"
		});
	}
	else if (dataManager.getOemVersion() == OEM_OMAN_TERMINAL_UPDATEUSER) {
		app.lookup("TMUSR_cmbTerminalUserCategory").addItem(new cpr.controls.Item(dataManager.getString("Str_Update") + "(X)", "UpdateX"));
		app.lookup("TMUSR_cmbTerminalUserCategory").addItem(new cpr.controls.Item(dataManager.getString("Str_Update") + "(O)", "UpdateO"));
	}
}

// 단말기 리스트에서 단말 클릭 시
function onTMUSR_udcTerminalListTerminalListClick( /* cpr.events.CSelectionEvent */ e) {
	/** @type cpr.data.Row */
	var terminalInfo = e.newSelection;
	
	app.lookup("TMUSR_cmbUserCategory").value = 0;
	app.lookup("TMUSR_ipbUserKeyword").value = "";
	app.lookup("TMUSR_cmbTerminalUserCategory").value = 0;
	app.lookup("TMUSR_ipbTerminalUserKeyword").value = "";
	
	console.log("onTMUSR_udcTerminalListTerminalListClick");
	
	var dsUserList = app.lookup("UserList");
	dsUserList.clear();
	
	var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
	udcTerminalUserList.clearUserList();
	
	var dmTerminalInfo = app.lookup("TerminalInfo");
	dmTerminalInfo.setValue("ID", terminalInfo.getValue("ID"));
	sendServerUserListRequest();
	
	if (ENABLE_MCP040 == 0) {
		return;
	}
	
	var cmbMcpAcuList = app.lookup("cmbMcpAcuList");
	cmbMcpAcuList.deleteAllItems();
	cmbMcpAcuList.visible = false;
	
	var TerminalMcpList = app.lookup("TerminalMcpList");
	for (var ii = 0; ii < TerminalMcpList.getRowCount(); ii++) {
		var terminalID = dmTerminalInfo.getValue("ID");
		
		var McpTerminalID = TerminalMcpList.getRow(ii).getValue("TerminalID");
		if (McpTerminalID == terminalID) {
			cmbMcpAcuList.visible = true;
			
			var AcuTerminalID1 = TerminalMcpList.getRow(ii).getValue("AcuTerminalID1");
			var AcuTerminalID2 = TerminalMcpList.getRow(ii).getValue("AcuTerminalID2");
			var AcuTerminalID3 = TerminalMcpList.getRow(ii).getValue("AcuTerminalID3");
			var AcuTerminalID4 = TerminalMcpList.getRow(ii).getValue("AcuTerminalID4");
			
			var Item1 = new cpr.controls.Item("AcuList", 0);
			cmbMcpAcuList.addItem(Item1);
			
			if (0 != AcuTerminalID1) {
				var Item1 = new cpr.controls.Item(AcuTerminalID1, AcuTerminalID1);
				cmbMcpAcuList.addItem(Item1);
			}
			
			if (0 != AcuTerminalID2) {
				var Item2 = new cpr.controls.Item(AcuTerminalID2, AcuTerminalID2);
				cmbMcpAcuList.addItem(Item2);
			}
			
			if (0 != AcuTerminalID3) {
				var Item3 = new cpr.controls.Item(AcuTerminalID3, AcuTerminalID3);
				cmbMcpAcuList.addItem(Item3);
			}
			
			if (0 != AcuTerminalID4) {
				var Item4 = new cpr.controls.Item(AcuTerminalID4, AcuTerminalID4);
				cmbMcpAcuList.addItem(Item4);
			}
			cmbMcpAcuList.selectItem(0);
			cmbMcpAcuList.redraw();
			break;
		}
	}
	
}

// 서버 기준 단말 사용자 리스트 PageChange 이벤트 발생
function onTMUSR_udcServerUserListPagechange( /* cpr.events.CSelectionEvent */ e) {
	sendServerUserListRequest();
}
// 서버 기준 단말 사용자 리스트 요청
function sendServerUserListRequest() {
	var cmbUserCategory = app.lookup("TMUSR_cmbUserCategory");
	var ipbUserKeyword = app.lookup("TMUSR_ipbUserKeyword");
	if (cmbUserCategory.value != 0) {
		// 사용자 ID로 검색 시에는 글자 수가 1개여도 허용하도록 수정 -mjy
		if (ipbUserKeyword.value != null && ((cmbUserCategory.value != "id") && 
				ipbUserKeyword.value.length == 1)) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSearchLength"));
			return;
		}
	}
	
	comLib.showLoadMask("", dataManager.getString("Str_UserListGet"), "", 0);
	
	var dmTerminalInfo = app.lookup("TerminalInfo");
	var terminalID = dmTerminalInfo.getValue("ID");
	
	var udcServerUserList = app.lookup("TMUSR_udcServerUserList");
	var curIndex = udcServerUserList.getCurrentPageIndex();
	var offset = (curIndex - 1) * TMUSR_pageRowCount
	
	var sms_getTerminalServerUserList = app.lookup("sms_getTerminalServerUserList");
	sms_getTerminalServerUserList.action = "/v1/terminals/" + terminalID + "/users"
	sms_getTerminalServerUserList.setParameters("offset", offset);
	sms_getTerminalServerUserList.setParameters("limit", TMUSR_pageRowCount);
	
	if (cmbUserCategory.value != 0) {
		sms_getTerminalServerUserList.setParameters("category", cmbUserCategory.value);
	} else {
		sms_getTerminalServerUserList.setParameters("category", "");
	}
	
	if (ipbUserKeyword.value != null && ipbUserKeyword.value.length != 0) {
		sms_getTerminalServerUserList.setParameters("keyword", ipbUserKeyword.value);
	} else {
		sms_getTerminalServerUserList.setParameters("keyword", "");
	}
	if (dataManager.getOemVersion() == OEM_DJMCITYHALL) {
		var getGroupId = app.lookup("cmbGroupList").value;
		sms_getTerminalServerUserList.setParameters("groupCode", getGroupId);
	}
	
	sms_getTerminalServerUserList.send();
}

// 서버 기준 단말 사용자 리스트 완료
function onSms_getTerminalServerUserListSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if (resultCode == COMERROR_NONE) {
		var sms_getUserList = e.control;
		var dsUserList = app.lookup("UserList");
		
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));
		app.lookup("TMUSR_ipbServerUserCount").value = totalCount;
		/*
		var totalLabel = app.lookup("opt_tot");
		totalLabel.value = totalCount+" Users";
		*/
		
		var viewPageCount = totalCount / TMUSR_pageRowCount + (totalCount % TMUSR_pageRowCount > 0);
		if (viewPageCount > 3) {
			viewPageCount = 3;
		}
		
		var udcUserList = app.lookup("TMUSR_udcServerUserList");
		udcUserList.setUserList(dsUserList);
		udcUserList.setPaging(totalCount, TMUSR_pageRowCount, viewPageCount);
		udcUserList.redraw();
	} else {
		//dialogAlert(app, "Waning", dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserListGet") + " " + dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(resultCode)));
	}
}

// 서버 기준 단말 사용자 리스트 에러
function onSms_getTerminalServerUserListSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_ERROR)
}

// 서버 기준 단말 사용자 리스트 타임아웃
function onSms_getTerminalServerUserListSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

// 단말기 사용자 추가
function onTMUSR_btnUserAddClick( /* cpr.events.CMouseEvent */ e) {
	var udcTerminalList = app.lookup("TMUSR_udcTerminalList");
	var terminalID = udcTerminalList.getSelectedTerminalID();
	if (terminalID == "") {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	var dsUserIDList = app.lookup("UserIDList");
	var totalCount;
	var dmDownloadInfo = app.lookup("DownloadInfo");
	if (dataManager.getOemVersion() == OEM_JAWOONDAE || dataManager.getOemVersion() == OEM_KANGWONLAND || dataManager.getOemVersion() == OEM_HYUNDAI_MSEAT) {
		// 출입그룹으로 추가할지 그룹으로 할지 정하기
		
		dialogSelectAccessGroupAndGroup(app, "출입그룹/그룹 선택", "", function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue > 0 && dialog.returnValue != undefined) {
					var appld;
					console.log(dialog.returnValue);
					if (dialog.returnValue == 1) { //출입그룹
						appld = "app/main/users/AccessGroupUserSelect" + "?" + usint_version;
					} else if (dialog.returnValue == 0) { // 그룹기준
						appld = "app/main/users/UserSelect" + "?" + usint_version;
					} else {
						appld = "app/main/users/UserSelect" + "?" + usint_version;
					}
					
					app.getRootAppInstance().openDialog(appld, {
						width: 960,
						height: 500
					}, function(dialog) {
						dialog.initValue = {
							"ExcludeGroup": -1
						};
						dialog.bind("headerTitle").toLanguage("Str_UserSelect");
						var modalVal = true;
						if (dataManager.getOemVersion() == OEM_HYUNDAI_MSEAT) {
							modalVal = false;
						}
						dialog.modal = modalVal;
					}).then(function( /*cpr.data.DataSet*/ idMap) {
						dsUserIDList.clear();
						idMap.forEach(function(value, key) {
							dsUserIDList.addRowData({
								"ID": key
							});
						});
						totalCount = dsUserIDList.getRowCount();
						dmDownloadInfo.setValue("Total", totalCount);
						comLib.showLoadMask("pro", dataManager.getString("Str_UserAdd"), "", totalCount);
						sendTerminalUserAdd();
					});
				} else {
					return;
				}
			});
		});
		
	} else { //
		var appld = "app/main/users/UserSelect" + "?" + usint_version;
		app.getRootAppInstance().openDialog(appld, {
			width: 960,
			height: 500
		}, function(dialog) {
			dialog.initValue = {
				"ExcludeGroup": -1
			};
			dialog.bind("headerTitle").toLanguage("Str_UserSelect");
			dialog.modal = true;
		}).then(function( /*cpr.data.DataSet*/ idMap) {
			
			dsUserIDList.clear();
			idMap.forEach(function(value, key) {
				dsUserIDList.addRowData({
					"ID": key
				});
			});
			
			MCP_SENDMODE = false;
			if (ENABLE_MCP040 == 1) {
				var dsUserIDListCopy = app.lookup("UserIDListCopy");
				dsUserIDListCopy.clear();
				idMap.forEach(function(value, key) {
					dsUserIDListCopy.addRowData({
						"ID": key
					});
				});
				
				// TerminalAcuList 에 Mcp 에 소속된 단말 아이디를 저장하고 반복해서 유저 리스트를 전송한다
				var TerminalAcuList = app.lookup("TerminalAcuList");
				TerminalAcuList.clear();
				
				var dmTerminalInfo = app.lookup("TerminalInfo");
				var terminalID = dmTerminalInfo.getValue("ID");
				
				var TerminalMcpList = app.lookup("TerminalMcpList");
				for (var ii = 0; ii < TerminalMcpList.getRowCount(); ii++) {
					var McpTerminalID = TerminalMcpList.getRow(ii).getValue("TerminalID");
					if (McpTerminalID == terminalID) {
						MCP_SENDMODE = true;
						
						console.log("this terminal is mcp");
						
						var AcuTerminalID1 = TerminalMcpList.getRow(ii).getValue("AcuTerminalID1");
						var AcuTerminalID2 = TerminalMcpList.getRow(ii).getValue("AcuTerminalID2");
						var AcuTerminalID3 = TerminalMcpList.getRow(ii).getValue("AcuTerminalID3");
						var AcuTerminalID4 = TerminalMcpList.getRow(ii).getValue("AcuTerminalID4");
						
						if (0 != McpTerminalID) {
							var row = TerminalAcuList.addRow();
							row.setValue("TerminalID", McpTerminalID);
						}
						
						if (0 != AcuTerminalID1) {
							var row = TerminalAcuList.addRow();
							row.setValue("TerminalID", AcuTerminalID1);
						}
						
						if (0 != AcuTerminalID2) {
							var row = TerminalAcuList.addRow();
							row.setValue("TerminalID", AcuTerminalID2);
						}
						
						if (0 != AcuTerminalID3) {
							var row = TerminalAcuList.addRow();
							row.setValue("TerminalID", AcuTerminalID3);
						}
						
						if (0 != AcuTerminalID4) {
							var row = TerminalAcuList.addRow();
							row.setValue("TerminalID", AcuTerminalID4);
						}
						
						for (var pp = 0; pp < TerminalAcuList.getRowCount(); pp++) {
							console.log(TerminalAcuList.getRow(pp).getRowData());
						}
						
						break;
					}
				}
				
				totalCount = dsUserIDList.getRowCount();
				dmDownloadInfo.setValue("Total", totalCount);
				comLib.showLoadMask("pro", dataManager.getString("Str_UserAdd"), "", totalCount);
				
				if (MCP_SENDMODE == true) {
					sendTerminalMcpUserAdd();
				} else {
					sendTerminalUserAdd();
				}
				
			} // <== ENABLE_MCP040
			else {
				totalCount = dsUserIDList.getRowCount();
				dmDownloadInfo.setValue("Total", totalCount);
				comLib.showLoadMask("pro", dataManager.getString("Str_UserAdd"), "", totalCount);
				sendTerminalUserAdd();
			}
			
		});
	}
	
}

// 단말기 사용자 추가 요청
function sendTerminalMcpUserAdd() {
	
	var TerminalAcuList = app.lookup("TerminalAcuList");
	
	var dsUserIDList = app.lookup("UserIDList");
	
	var dsUserIDListCopy = app.lookup("UserIDListCopy");
	
	var count = dsUserIDList.getRowCount();
	if (count < 1) {
		
		// 첫번째 MCP 에 연관된 터미널에 사용자 정보를 다 보냈으므로 리스트에서 제거한다.
		TerminalAcuList.realDeleteRow(0);
		
		if (TerminalAcuList.getRowCount() == 0) {
			comLib.hideLoadMask();
			
			sendServerUserListRequest();
			return;
		} else {
			// 복사해 놓은 셋을 나머지 터미널에 보내기 위해 복사한다
			dsUserIDListCopy.copyToDataSet(dsUserIDList);
		}
	}
	
	var userInfo = dsUserIDList.getRow(0);
	var userID = userInfo.getValue("ID");
	dsUserIDList.realDeleteRow(0);
	
	var dmTerminalInfo = app.lookup("TerminalInfo");
	
	//var terminalID = dmTerminalInfo.getValue("ID");
	var terminalID = TerminalAcuList.getRow(0).getValue("TerminalID");
	
	var dmResult = app.lookup("Result");
	
	var sms_postTerminalUser = new cpr.protocols.Submission("sms_postTerminalUser");
	sms_postTerminalUser.userAttr("userID", String(userID));
	sms_postTerminalUser.action = "/v1/terminals/" + terminalID + "/users/" + userID;
	sms_postTerminalUser.method = "post";
	sms_postTerminalUser.mediaType = "application/x-www-form-urlencoded";
	
	sms_postTerminalUser.addEventListenerOnce("submit-done", onSms_postTerminalUserSubmitDone);
	sms_postTerminalUser.addEventListenerOnce("submit-error", onSms_postTerminalUserSubmitError);
	sms_postTerminalUser.addEventListenerOnce("submit-timeout", onSms_postTerminalUserSubmitTimeout);
	
	var dmDownloadInfo = app.lookup("DownloadInfo");
	var total = dmDownloadInfo.getValue("Total");
	dmDownloadInfo.setValue("Offset", total - count + 1);
	sms_postTerminalUser.addRequestData(dmDownloadInfo, "DownloadInfo");
	sms_postTerminalUser.addResponseData(dmResult);
	
	sms_postTerminalUser.send();
}

// 단말기 사용자 추가 요청
function sendTerminalUserAdd() {
	var dsUserIDList = app.lookup("UserIDList");
	var count = dsUserIDList.getRowCount();
	if (count < 1) {
		comLib.hideLoadMask();
		
		sendServerUserListRequest();
		return;
	}
	
	var userInfo = dsUserIDList.getRow(0);
	var userID = userInfo.getValue("ID");
	dsUserIDList.realDeleteRow(0);
	
	var dmTerminalInfo = app.lookup("TerminalInfo");
	var terminalID = dmTerminalInfo.getValue("ID");
	
	var dmResult = app.lookup("Result");
	
	var sms_postTerminalUser = new cpr.protocols.Submission("sms_postTerminalUser");
	sms_postTerminalUser.userAttr("userID", String(userID));
	sms_postTerminalUser.action = "/v1/terminals/" + terminalID + "/users/" + userID;
	sms_postTerminalUser.method = "post";
	sms_postTerminalUser.mediaType = "application/x-www-form-urlencoded";
	
	sms_postTerminalUser.addEventListenerOnce("submit-done", onSms_postTerminalUserSubmitDone);
	sms_postTerminalUser.addEventListenerOnce("submit-error", onSms_postTerminalUserSubmitError);
	sms_postTerminalUser.addEventListenerOnce("submit-timeout", onSms_postTerminalUserSubmitTimeout);
	
	var dmDownloadInfo = app.lookup("DownloadInfo");
	var total = dmDownloadInfo.getValue("Total");
	dmDownloadInfo.setValue("Offset", total - count + 1);
	sms_postTerminalUser.addRequestData(dmDownloadInfo, "DownloadInfo");
	sms_postTerminalUser.addResponseData(dmResult);
	
	sms_postTerminalUser.send();
}

// 단말기 사용자 추가 완료
function onSms_postTerminalUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	
	var sms_deleteTerminalUser = e.control;
	var userID = sms_deleteTerminalUser.userAttr("userID");
	
	comLib.updateLoadMask(userID);
	
	if (ENABLE_MCP040 == 1) {
		if (MCP_SENDMODE == true) {
			sendTerminalMcpUserAdd();
		} else {
			sendTerminalUserAdd();
		}
	} else {
		sendTerminalUserAdd();
	}
	
	/*if( resultCode == COMERROR_NONE){	
	} else {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAdd")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
	}*/
}

// 단말기 사용자 추가 에러
function onSms_postTerminalUserSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_ERROR)
}

// 단말기 사용자 추가 타임아웃
function onSms_postTerminalUserSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

// 단말기 사용자 삭제
function onTMUSR_btnUserRemoveClick( /* cpr.events.CMouseEvent */ e) {
	
	var udcTerminalList = app.lookup("TMUSR_udcTerminalList");
	var terminalID = udcTerminalList.getSelectedTerminalID();
	if (terminalID == "") {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	
	var udcServerUserList = app.lookup("TMUSR_udcServerUserList");
	var chkIndices = udcServerUserList.getCheckedRowIndices();
	if (chkIndices.length == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserNotSelected"));
		return;
	}
	
	var dsUserIDList = app.lookup("UserIDList");
	dsUserIDList.clear(); // 요청데이터 초기화 
	
	chkIndices.forEach(function(index) {
		var row = udcServerUserList.getRow(index);
		dsUserIDList.addRowData(row.getRowData());
	});
	var total = dsUserIDList.getRowCount();
	comLib.showLoadMask("pro", dataManager.getString("Str_UserDelete"), "", total);
	
	sendTerminalUserDelete("S");
}

function sendTerminalUserDelete(delType) {
	var dsUserIDList = app.lookup("UserIDList");
	var count = dsUserIDList.getRowCount();
	if (count < 1) {
		comLib.hideLoadMask();
		return;
	}
	
	var userInfo = dsUserIDList.getRow(0);
	var userID = userInfo.getValue("ID");
	dsUserIDList.realDeleteRow(0);
	
	var dmTerminalInfo = app.lookup("TerminalInfo");
	var terminalID = dmTerminalInfo.getValue("ID");
	
	var dmResult = app.lookup("Result");
	if (delType == "S") {
		var sms_deleteTerminalUser = new cpr.protocols.Submission("sms_deleteTerminalUser");
		sms_deleteTerminalUser.userAttr("userID", String(userID));
		sms_deleteTerminalUser.userAttr("delType", delType);
		
		sms_deleteTerminalUser.action = "/v1/terminals/" + terminalID + "/users/" + userID;
		sms_deleteTerminalUser.method = "delete";
		sms_deleteTerminalUser.mediaType = "application/x-www-form-urlencoded";
		
		sms_deleteTerminalUser.addEventListenerOnce("submit-done", onSms_deleteTerminalUserSubmitDone);
		sms_deleteTerminalUser.addEventListenerOnce("submit-error", onSms_deleteTerminalUserSubmitError);
		sms_deleteTerminalUser.addEventListenerOnce("submit-timeout", onSms_deleteTerminalUserSubmitTimeout);
		sms_deleteTerminalUser.addResponseData(dmResult);
		sms_deleteTerminalUser.send();
	} else {
		var sms_deleteTerminalUser = new cpr.protocols.Submission("sms_deleteTerminalUser");
		sms_deleteTerminalUser.userAttr("userID", String(userID));
		sms_deleteTerminalUser.userAttr("delType", delType);
		
		sms_deleteTerminalUser.action = "/v1/terminals/" + terminalID + "/terminalusers/" + userID;
		sms_deleteTerminalUser.method = "delete";
		sms_deleteTerminalUser.mediaType = "application/x-www-form-urlencoded";
		
		sms_deleteTerminalUser.addEventListenerOnce("submit-done", onSms_deleteTerminalUserSubmitDone);
		sms_deleteTerminalUser.addEventListenerOnce("submit-error", onSms_deleteTerminalUserSubmitError);
		sms_deleteTerminalUser.addEventListenerOnce("submit-timeout", onSms_deleteTerminalUserSubmitTimeout);
		sms_deleteTerminalUser.addResponseData(dmResult);
		sms_deleteTerminalUser.send();
	}
	
}

// 단말기 사용자 삭제 완료.
function onSms_deleteTerminalUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode")
	if (resultCode == COMERROR_NONE) {
		var sms_deleteTerminalUser = e.control;
		var userID = sms_deleteTerminalUser.userAttr("userID");
		var delType = sms_deleteTerminalUser.userAttr("delType");
		if (delType == "S") {
			var udcServerUserList = app.lookup("TMUSR_udcServerUserList");
			udcServerUserList.deleteUser(userID);
			comLib.updateLoadMask(userID);
			sendTerminalUserDelete(delType);
		} else {
			
			if(userID == -1){
				var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
				udcTerminalUserList.clearUserList();
			} else {
				var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
				udcTerminalUserList.deleteUser(userID);
				comLib.updateLoadMask(userID);
				sendTerminalUserDelete(delType);
			}		
		}
		
	} else {
		comLib.hideLoadMask();
		//dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserDelete")+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserDelete") + " " + dataManager.getString(getErrorString(resultCode)));
	}
}

// 단말기 사용자 삭제 에러
function onSms_deleteTerminalUserSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_ERROR)
}

// 단말기 사용자 삭제 타임아웃
function onSms_deleteTerminalUserSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result")
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

// 사용자 ID 정보 가져오기 클릭시
function onTMUSR_btnUserIDInfoRequestClick( /* cpr.events.CMouseEvent */ e) {
	
	var udcTerminalList = app.lookup("TMUSR_udcTerminalList");
	var terminalID = udcTerminalList.getSelectedTerminalID();
	if (terminalID == "") {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	app.lookup("TMUSR_cmbTerminalUserCategory").value = 0;
	app.lookup("TMUSR_ipbTerminalUserKeyword").value = "";
	
	var dsUserInfoList = app.lookup("TerminalUserInfo");
	dsUserInfoList.clear();
	var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
	udcTerminalUserList.clearUserList();
	
	comLib.showLoadMask("", dataManager.getString("Str_UserListGet"), "", 10);
	var dmTerminalInfo = app.lookup("TerminalInfo");
	dmTerminalInfo.setValue("ID", terminalID);
	
	var sms_get_terminalUserCounts = app.lookup("sms_get_terminalUserCounts");
	sms_get_terminalUserCounts.action = "/v1/terminalUsers/" + terminalID + "/count";
	sms_get_terminalUserCounts.send();
}

// 단말기 사용자 카운트 가져오기 완료
function onSms_get_terminalUserCountsSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	if (result.getValue("ResultCode") == 0) {
		comLib.hideLoadMask();
		
		var dmUserCount = app.lookup("TerminalCount");
		dmUserCount.setValue("Offset", 0);
		var userCount = dmUserCount.getValue("Count");
		console.log("userCount" + userCount);
		if (userCount > 0) {
			var total = userCount / TMUSR_userCountPerRequest; // 단말에서 한번에 10명만 주므로 
			if (userCount % TMUSR_userCountPerRequest != 0) {
				total++;
			}
			
			comLib.showLoadMask("pro", dataManager.getString("Str_UserListGet"), "", total);
			// 사용자 정보 요청
			onTerminalUserInfoRequest();
		}
	} else {
		comLib.hideLoadMask();
		//dialogAlert(app, dataManager.getString("Str_UserListGet"),dataManager.getString("Str_Failed")+" ("+result.getValue("ResultCode")+")");	
		dialogAlert(app, dataManager.getString("Str_UserListGet"), dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 단말기 사용자 카운트 가져오기 에러
function onSms_get_terminalUserCountsSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", -1);
}

// 단말기 사용자 카운트 가져오기 타임아웃
function onSms_get_terminalUserCountsSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", -2);
}

function onTerminalUserInfoRequest() {
	
	var dmUserCount = app.lookup("TerminalCount");
	var userCount = dmUserCount.getValue("Count");
	var offset = dmUserCount.getValue("Offset");
	
	if (offset >= userCount) {
		comLib.hideLoadMask();
		return
	}
	
	var reqCount = userCount - offset;
	if (reqCount > TMUSR_userCountPerRequest) {
		reqCount = TMUSR_userCountPerRequest;
	}
	
	comLib.updateLoadMask(dataManager.getString("Str_UserListGet"));
	
	var dmTerminalInfo = app.lookup("TerminalInfo");
	var terminalID = dmTerminalInfo.getValue("ID");
	
	// 사용자 ID,Name 리스트 가져오기 
	
	var dmResult = app.lookup("Result");
	var dsTerminalUserInfo = app.lookup("TerminalUserInfo");
	
	var sms_get_terminalUserInInfo = new cpr.protocols.Submission("sms_get_terminalUserInInfo");
	sms_get_terminalUserInInfo.method = "GET";
	sms_get_terminalUserInInfo.mediaType = "application/x-www-form-urlencoded";
	sms_get_terminalUserInInfo.action = "/v1/terminalUsers/" + terminalID + "/info";
	
	sms_get_terminalUserInInfo.setParameters("offset", offset);
	sms_get_terminalUserInInfo.setParameters("limit", reqCount);
	//console.log(offset,reqCount);
	
	sms_get_terminalUserInInfo.addResponseData(dmResult);
	sms_get_terminalUserInInfo.addResponseData(dsTerminalUserInfo, true);
	
	sms_get_terminalUserInInfo.addEventListenerOnce("submit-done", onSms_get_terminalUserInInfoSubmitDone);
	sms_get_terminalUserInInfo.addEventListenerOnce("submit-error", onSms_get_terminalUserInInfoSubmitError);
	sms_get_terminalUserInInfo.addEventListenerOnce("submit-timeout", onSms_get_terminalUserInInfoSubmitTimeout);
	
	sms_get_terminalUserInInfo.send();
}

// 사용자 ID 가져오기 완료
function onSms_get_terminalUserInInfoSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	var result = app.lookup("Result");
	if (result.getValue("ResultCode") == 0) {
		
		var dsUserInfoList = app.lookup("TerminalUserInfo");
		
		var dmUserCount = app.lookup("TerminalCount");
		var userCount = dmUserCount.getValue("Count");
		var offset = dmUserCount.getValue("Offset");
		offset += TMUSR_userCountPerRequest;
		dmUserCount.setValue("Offset", offset);
		//console.log(dmUserCount.getDatas());	
		//console.log(dsUserInfoList.getRowDataRanged());
		
		if (offset < userCount) {
			onTerminalUserInfoRequest();
		} else {
			var count = dsUserInfoList.getRowCount();
			for (var i = 0; i < count; i++) {
				var userInfo = dsUserInfoList.getRow(i);
				var authType = userInfo.getValue("AuthInfo").split(',');
				
				var andAuth = "";
				for (var idx = 0; idx < authType[7]; idx++) {
					var authTypeValue = parseInt(authType[idx], 10);
					var type = getAuthTypeString(authTypeValue)
					andAuth += type + " ";
				}
				var orAuth = "";
				for (var idx = authType[7]; idx < authType.length - 1; idx++) {
					var authTypeValue = parseInt(authType[idx], 10);
					var type = getAuthTypeString(authTypeValue)
					orAuth += type + " ";
				}
				userInfo.setValue("AuthInfo", andAuth + "/" + orAuth);
				
			/*	
				var updateFalg = ""
				if (dsUserInfoList.getValue("UpdateFlag") == 0)
					userInfo.setValue("UpdateFlag", "X");
				else
					userInfo.setValue("UpdateFlag", "O");
				*/
			}
			
			var udcUserList = app.lookup("TMUSR_udcTerminalUserList");			
			//console.log(dsUserInfoList.getRowDataRanged());
			
			udcUserList.setUserList(dsUserInfoList);
			comLib.hideLoadMask();
			app.lookup("TMUSR_ipbTerminalUserCount").value = dsUserInfoList.getRowCount();
		}
		
	} else {
		comLib.hideLoadMask();
		//dialogAlert(app, dataManager.getString("Str_UserListGet"),dataManager.getString("Str_Failed")+" ("+result.getValue("ResultCode")+")");
		dialogAlert(app, dataManager.getString("Str_UserListGet"), dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
}

// 사용자 ID 가져오기 submit-error 
function onSms_get_terminalUserInInfoSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", -1);
}

// 사용자 ID 가져오기 서브미션에서 submit-timeout 이벤트 발생 시 호출. 
function onSms_get_terminalUserInInfoSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", -2);
}

// 단말 사용자 가져오기 클릭
function onTMUSR_btnUserDataRequestClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var tMUSR_btnUserDataRequest = e.control;
	var grdUdcUserList = app.lookup("TMUSR_udcTerminalUserList");
	
	var CheckedRowIndices = grdUdcUserList.getCheckedRowIndices();
	
	if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // virdi 타입은 가져올 사용자 아이디를 직접 지정하므로 사용자 선택 여부 체크
		if (CheckedRowIndices.length == 0) {
			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_SelectCallUpUser"), "");
			return;
		}
	}
	
	var ReqUserList = app.lookup("UserIDList");
	ReqUserList.clear(); // 요청데이터 초기화 
	CheckedRowIndices.forEach(function(index) {
		var row = grdUdcUserList.getRow(index);
		ReqUserList.addRowData(row.getRowData());
	});
	//ReqUserList.commit();
	
	onTerminalUserDataRequest();
	// 	RequestData.action = "/v1/terminalUsers/" + terminalID + "/data";
}

function onTerminalUserDataRequest() {
	
	var dmTerminalInfo = app.lookup("TerminalInfo");
	var terminalID = dmTerminalInfo.getValue("ID");
	
	var ReqUserList = app.lookup("UserIDList");
	var total = ReqUserList.getRowCount();
	comLib.showLoadMask("pro", dataManager.getString("Str_UserDataUpload"), "", 10);
	//console.log(ReqUserList.getRowDataRanged());
	
	var dmResult = app.lookup("Result");
	
	var sms_put_terminalUserData = new cpr.protocols.Submission("sms_put_terminalUserData");
	sms_put_terminalUserData.method = "PUT";
	sms_put_terminalUserData.mediaType = "application/x-www-form-urlencoded";
	sms_put_terminalUserData.action = "/v1/terminalUsers/" + terminalID + "/data";
	
	sms_put_terminalUserData.addResponseData(dmResult);
	sms_put_terminalUserData.addRequestData(ReqUserList, "UserIDList");
	
	sms_put_terminalUserData.addEventListenerOnce("submit-done", onSms_put_terminalUserDataSubmitDone);
	sms_put_terminalUserData.addEventListenerOnce("submit-error", onSms_put_terminalUserDataSubmitError);
	sms_put_terminalUserData.addEventListenerOnce("submit-timeout", onSms_put_terminalUserDataSubmitTimeout);
	
	sms_put_terminalUserData.send();
}

// 단말 사용자 가져오기 완료
function onSms_put_terminalUserDataSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	if (result.getValue("ResultCode") == 0) {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalUserDateUploadSuccess"));
	} else {
		//dialogAlert(app, dataManager.getString("Str_UserDataUpload"),dataManager.getString("Str_Failed")+" ("+result.getValue("ResultCode")+")");	
		dialogAlert(app, dataManager.getString("Str_UserDataUpload"), dataManager.getString("Str_Failed") + " : " + dataManager.getString(getErrorString(result.getValue("ResultCode"))));
	}
	comLib.hideLoadMask();
}

// 단말 사용자 가져오기 에러
function onSms_put_terminalUserDataSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", -1);
}

// 단말 사용자 가져오기 타임아웃
function onSms_put_terminalUserDataSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", -2);
}

// 도움말
function onTMUSR_imgHelpPageClick( /* cpr.events.CMouseEvent */ e) {
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

/*
 * 버튼(TMUSR_btnUserDataDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */

function onTMUSR_btnUserDataDeleteClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var tMUSR_btnUserDataDelete = e.control;
	var udcTerminalList = app.lookup("TMUSR_udcTerminalList");
	var terminalID = udcTerminalList.getSelectedTerminalID();
	if (terminalID == "") {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	
	var grdUdcUserList = app.lookup("TMUSR_udcTerminalUserList");
	
	var CheckedRowIndices = grdUdcUserList.getCheckedRowIndices();
	
	if (dataManager.getSystemBrandType() == BRAND_VRIDI) { // virdi 타입은 가져올 사용자 아이디를 직접 지정하므로 사용자 선택 여부 체크
		if (CheckedRowIndices.length == 0) {
			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_UserNotSelected"), "");
			return;
		}
	}
	var ReqUserList = app.lookup("UserIDList");
	ReqUserList.clear(); // 요청데이터 초기화 
	CheckedRowIndices.forEach(function(index) {
		var row = grdUdcUserList.getRow(index);
		ReqUserList.addRowData(row.getRowData());
	});
	var total = ReqUserList.getRowCount();
	comLib.showLoadMask("pro", dataManager.getString("Str_UserDelete"), "", total);
	
	sendTerminalUserDelete("T");
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_get_mcp_listSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_get_mcp_list = e.control;
	
	console.log("onSms_get_mcp_listSubmitDone");
	
	var dsTerminalList = dataManager.getTerminalList();
	//console.log("dsTerminalList type: " + dsTerminalList.getRow(0).getValue("Type"));	
	
	/*
	var cmbMcpAcuList = app.lookup("cmbMcpAcuList");
	cmbMcpAcuList.deleteAllItems();
	
	for (var ii=0;ii<dsTerminalList.getRowCount();ii++) {
		var acuTerminalID = dsTerminalList.getRow(ii).getValue("TerminalID");
		var Item = new cpr.controls.Item(acuTerminalID, acuTerminalID);
		cmbMcpAcuList.addItem(Item);	
	}
	
	cmbMcpAcuList.selectItem(0);
	cmbMcpAcuList.redraw();
	*/
}

/*
 * "재전송" 버튼(TMUSR_btnUserReSend)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMUSR_btnUserReSendClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var tMUSR_btnUserReSend = e.control;
	var udcTerminalList = app.lookup("TMUSR_udcTerminalList");
	var terminalID = udcTerminalList.getSelectedTerminalID();
	if (terminalID == "") {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	
	var dsUserIDList = app.lookup("UserIDList");
	var totalCount;
	var dmDownloadInfo = app.lookup("DownloadInfo");
	if (dataManager.getOemVersion() == OEM_KANGWONLAND || dataManager.getOemVersion() == OEM_HYUNDAI_MSEAT) {
		dsUserIDList.clear();
		var dsUserList = app.lookup("UserList");
		totalCount = dsUserList.getRowCount();
		if (totalCount <= 0) {
			dialogAlert(app, dataManager.getString("Str_Warning"), "단말로 전송한 사용자가 없습니다.");
			return;
		}
		for (var i = 0; i < totalCount; i++) {
			var rowData = dsUserList.getRow(i);
			dsUserIDList.addRowData({
				"ID": rowData.getValue("ID")
			});
		}
		totalCount = dsUserIDList.getRowCount();
		dmDownloadInfo.setValue("Total", totalCount);
		comLib.showLoadMask("pro", dataManager.getString("Str_UserAdd"), "", totalCount);
		sendTerminalUserAdd();
		
	}
	
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMUSR_btnUserSearchClick( /* cpr.events.CMouseEvent */ e) {
	if (app.lookup("TMUSR_udcTerminalList").getSelectedTerminalID() == "") {
		return
	}
	var terminalInfo = app.lookup("TerminalInfo");
	
	var dsUserList = app.lookup("UserList");
	dsUserList.clear();
	
	var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
	udcTerminalUserList.clearUserList();
	
	var dmTerminalInfo = app.lookup("TerminalInfo");
	dmTerminalInfo.setValue("ID", terminalInfo.getValue("ID"));
	sendServerUserListRequest();
	/*
	var reg = /[\{\}\[\]\/?.,;:|\)`^\<>@\#$%&\\\=\(\'\"]/gi;
	
	var keyword = app.lookup("TMUSR_ipbUserKeyword").value;
	if (keyword == undefined ||keyword.length <= 0) {
		//선택 해제
	} else {
		if (reg.test(keyword)) {
			// 들어가 있으면 입력불가능한 특수 문자 입니다.
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorSpecialCharacters"));
			return;
		}
		var category = app.lookup("TMUSR_cmbUserCategory").value;
		var udcServerUserList = app.lookup("TMUSR_udcServerUserList");
		udcServerUserList.findInnerUserList(category, keyword);
	}
	* 	*/
}

function onTMUSR_btnTerminalUserSearchClick( /* cpr.events.CMouseEvent */ e) {
	
	var cmbUserCategory = app.lookup("TMUSR_cmbTerminalUserCategory");
	var ipbUserKeyword = app.lookup("TMUSR_ipbTerminalUserKeyword");
	
	if (cmbUserCategory.value == "UpdateX" || cmbUserCategory.value == "UpdateO") {
		var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
		var category = app.lookup("TMUSR_cmbTerminalUserCategory").value;
		console.log("category = ", category);
		udcTerminalUserList.setFilter(category, "");
		
		if (cmbUserCategory.value == "UpdateO") {
			console.log("Terminal User List Check All");
			udcTerminalUserList.setCheckAll(true);
		}
		
		return;
	}
	
	if (cmbUserCategory.value != 0) {
		if (ipbUserKeyword.value != null && ((cmbUserCategory.value != "id" || cmbUserCategory.value != "name" || cmbUserCategory.value != "unique_id") &&
				ipbUserKeyword.value.length == 0)) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_InvalidSearchLength"));
			return;
		}
	}
	
	var reg = /[\{\}\[\]\/?.,;:|\)`^\<>@\#$%&\\\=\(\'\"]/gi;
	var keyword = app.lookup("TMUSR_ipbTerminalUserKeyword").value;
	var udcTerminalUserList = app.lookup("TMUSR_udcTerminalUserList");
	if (keyword == undefined || keyword.length <= 0) {
		//선택 해제
		udcTerminalUserList.clearFilter();
	} else {
		if (reg.test(keyword)) {
			// 들어가 있으면 입력불가능한 특수 문자 입니다.
			dialogAlert(app, "Waning", dataManager.getString("Str_ErrorSpecialCharacters"));
			return;
		}
		var category = app.lookup("TMUSR_cmbTerminalUserCategory").value;
		console.log("category = ", category);
		udcTerminalUserList.setFilter(category, keyword);
	}
}

//단말기 사용자 엑셀 내보내기 

function onTMUSR_btnUserDataExportClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var tMUSR_btnUserDataExport = e.control;
	//	var userList = app.lookup("TerminalUserInfo");
	//	console.log("userList = ", userList.getRowDataRanged());
	
	var totalCount = app.lookup("TerminalCount").getValue("Count");
	if (totalCount == 0 || totalCount == "") {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorGroupNoSearchResult"));
	} else {
		exportExcel();
	}
	
}

function exportExcel() {
	var userList = app.lookup("TerminalUserInfo");
	var dsExportList = app.lookup("ExportTerminalUserInfo");
	dsExportList.clear();
	userList.copyToDataSet(dsExportList);
	var total = dsExportList.getRowCount()
	
	var stringified = JSON.stringify(dsExportList.getRowDataRanged());
	stringified = stringified.replace(/"ID"/gi, '"' + dataManager.getString("Str_ID") + '"');
	stringified = stringified.replace(/"Name"/gi, '"' + dataManager.getString("Str_Name") + '"');
	stringified = stringified.replace(/"AuthInfo"/gi, '"' + dataManager.getString("Str_AuthInfo") + '"');
	
	var InputData;
	InputData = JSON.parse(stringified);
	
	/* original data */
	var today = dateLib.getToday();
	var filename = "TerminalUserList_" + today + ".xlsx";
	var ws_name = "TerminalUserList_";
	
	var wb = XLSX.utils.book_new(),
		ws = XLSX.utils.json_to_sheet(InputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);
	
	XLSX.writeFile(wb, filename);
}

// 단말기 사용자 한번에 전체 삭제 하는 기능 누락 건 추가 - 20220511 otk
function onTMUSR_btnUserDataDeleteAllClick(/* cpr.events.CMouseEvent */ e){

	var tMUSR_btnUserDataDeleteAll = e.control;
	var dsUserIDList = app.lookup("UserIDList");
	
	var userInfo = dsUserIDList.getRow(0);
	var userID = -1;
	
	var dmTerminalInfo = app.lookup("TerminalInfo");
	var terminalID = dmTerminalInfo.getValue("ID");
	
	var dmResult = app.lookup("Result");
	
	var sms_deleteTerminalUser = new cpr.protocols.Submission("sms_deleteTerminalUser");
	sms_deleteTerminalUser.userAttr("userID", String(userID));
	sms_deleteTerminalUser.userAttr("delType", "T");
	
	sms_deleteTerminalUser.action = "/v1/terminals/" + terminalID + "/terminalusers/" + userID;
	sms_deleteTerminalUser.method = "delete";
	sms_deleteTerminalUser.mediaType = "application/x-www-form-urlencoded";
	
	sms_deleteTerminalUser.addEventListenerOnce("submit-done", onSms_deleteTerminalUserSubmitDone);
	sms_deleteTerminalUser.addEventListenerOnce("submit-error", onSms_deleteTerminalUserSubmitError);
	sms_deleteTerminalUser.addEventListenerOnce("submit-timeout", onSms_deleteTerminalUserSubmitTimeout);
	sms_deleteTerminalUser.addResponseData(dmResult);
	sms_deleteTerminalUser.send();
}
