/************************************************
 * visitApplication.js
 * Created at 2020. 2. 12. 오후 1:21:28.
 * Prefix : VMVAD_
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib = createComUtil(app);
var dateLib = cpr.core.Module.require("lib/DateLib");
var VMVAD_ver = 0
var OEM_VERSION = 0;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	
	dataManager = getDataManager();
	OEM_VERSION = dataManager.getOemVersion();
	var accountInfo = dataManager.getAccountInfo();
	app.lookup("VMVAD_opbUserName").value = accountInfo.getValue("Name");
	
	initData();
	
	var initValue = app.getHost().initValue;
	var visitIndex = initValue["VisitIndex"];
	VMVAD_ver = initValue["OEM"];
	if (VMVAD_ver == 3) {
		app.lookup("VMVAD_obp1").unbind("value");
		app.lookup("VMVAD_obp1").value = "참가신청 정보";
		app.lookup("VMVAD_obp1").redraw();
		
		app.lookup("VMVAD_obp2").unbind("value");
		app.lookup("VMVAD_obp2").value = "참가정보";
		app.lookup("VMVAD_obp2").redraw();
		
		app.lookup("VMVAD_obp3").unbind("value");
		app.lookup("VMVAD_obp3").value = "행사명";
		
		app.lookup("VMVAD_obp4").unbind("value");
		app.lookup("VMVAD_obp4").value = "행사시작일시";
		
		app.lookup("VMVAD_obp5").unbind("value");
		app.lookup("VMVAD_obp5").value = "행사종료일시";
		
		app.lookup("VMVAD_obp6").unbind("value");
		app.lookup("VMVAD_obp6").value = "행사일정";
		
		app.lookup("VMVAD_obp7").unbind("value");
		app.lookup("VMVAD_obp7").value = "참가자 리스트";
	}
	
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		app.lookup("VMVAD_btnCancel").unbind("value");
		app.lookup("VMVAD_btnCancel").value = "닫기";
	}
	var sms_getVisitApplication = app.lookup("sms_getVisitApplication");
	sms_getVisitApplication.action = "/v1/visit/visitApplication/" + visitIndex;
	sms_getVisitApplication.send();
	
}

function initData() {
	var cmbItemType = app.lookup("VMVAD_cmbGrdItemType");
	cmbItemType.addItem(new cpr.controls.Item("------", "0"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeNetworkDevice"), "1"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeStorage"), "2"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeRecordDevice"), "3"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeEtc"), "4"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeFacilityOperating"), "5"));
	
	var cmbGrdItemNameType = app.lookup("VMVAD_cmbGrdItemNameType");
	cmbGrdItemNameType.addItem(new cpr.controls.Item("-----", "0"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameNotebook"), "1"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNamePC"), "2"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNamePDA"), "3"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNamePMP"), "4"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameMobile"), "5"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameUSB"), "11"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameHard"), "12"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameCD"), "13"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameDisk"), "14"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameRecoder"), "21"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameCamera"), "22"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameCam"), "23"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameVoiceRecoder"), "24"));
	
	var cmbGrdItemInOut = app.lookup("VMVAD_cmbGrdItemInOut");
	cmbGrdItemInOut.addItem(new cpr.controls.Item("------", "0"));
	cmbGrdItemInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemIn"), "1"));
	cmbGrdItemInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemOut"), "2"));
	cmbGrdItemInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemInOut"), "3"));
	
	var cmbVisitorStatus = app.lookup("VMVAD_cmbVisitorStatus");
	cmbVisitorStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_VisitorNotRegistered"), 0));
	cmbVisitorStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_VisitorRegistered"), "1"));
	cmbVisitorStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_VisitorDeleted"), "2"));
	cmbVisitorStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_VisitorWaitRegist"), "3"));
	cmbVisitorStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_VisitorVisiting"), "4"));
	cmbVisitorStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_VisitorVisited"), "5"));
	
	var cmbStatus = app.lookup("VMVAD_cmbStatus");
	cmbStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_ApprovalWait"), VisitApprovalWaiting));
	cmbStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_Approved"), VisitApprovalApproved));
	cmbStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_Denied"), VisitApprovalDenied));
	cmbStatus.addItem(new cpr.controls.Item(dataManager.getString("Str_ApprovalExpired"), VisitApprovalExpired));
}

function updateBtnStatus(status) {
	var btnApproval = app.lookup("VMVAD_btnApproval");
	var btnDenial = app.lookup("VMVAD_btnDenial");
	var btnCancleApproval = app.lookup("VMVAD_btnCancleApproval");
	var btnCancleDenial = app.lookup("VMVAD_btnCancleDenial");
	var enableBtn = false;
	var enableVisitor = false;
	var enableDenial = false;
	switch (status) {
		case VisitApprovalWaiting:
			enableBtn = true;
			break; // 대기	
		case VisitApprovalApproved:
			enableVisitor = true;
			break; // 승인
		case VisitApprovalDenied:
			enableDenial = true; 
			break; // 거부
		case VisitApprovalExpired:
			break; // 만료
		default:
			break;
	}
	btnApproval.visible = enableBtn;
	btnDenial.visible = enableBtn;
	
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		var visitorStatus = app.lookup("VisitorList").getRow(0).getValue("Status");
		if(visitorStatus == VisitorStatusRegistered && status == VisitApprovalApproved) {	
			var btnEndAtUpdate = app.lookup("VMVAD_btnVisitorEndAtUpdate");
			btnEndAtUpdate.visible = enableVisitor;
			
			// 엠시트 요청. 만료일 수정 버튼 비활성화. 활성화시 밑에 줄 삭제.
			btnEndAtUpdate.visible = false;
		}
		
		btnCancleApproval.visible = enableVisitor;
		btnCancleDenial.visible = enableDenial;
	}
	
	var btnVisitorRegist = app.lookup("VMVAD_btnVisitorRegist");
	btnVisitorRegist.visible = enableVisitor;
}

// 방문 신청 정보 수신 완료
function onSms_getVisitApplicationSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		var dmVisitInfo = app.lookup("VisitInfo");
		app.lookup("VMVAP_obpVisitTargetGroup").value = dmVisitInfo.getValue("VisitTargetGroupName") + " / " + dmVisitInfo.getValue("VisitTargetPositionName");
		var startAtTime = dmVisitInfo.getValue("StartAt");
//		console.log(startAtTime, startAtTime.substr(11, 5))
		app.lookup("StartAtTime").value = startAtTime.substr(11, 5);
		var endAtTime = dmVisitInfo.getValue("EndAt");
//		console.log(endAtTime, endAtTime.substr(11, 5))
		app.lookup("EndAtTime").value = endAtTime.substr(11, 5);
		
		var status = dmVisitInfo.getValue("Status");
		updateBtnStatus(status);
		
		// 엠시트 승인 취소 기능
		if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
			var dm_paramHDMS = app.lookup("dm_paramHDMS");
			var delete_flag = dm_paramHDMS.getValue("DeleteFlag");
			var applying_flag = dm_paramHDMS.getValue("ApplyingFlag");
			
			app.lookup("deleteIDList").clear();
			
			if (delete_flag=="true") {
				// 승인 취소떄만
				var visitorList = app.lookup("VisitorList");
				
				for (var i=0; i<visitorList.getRowCount(); i++) {
					var visitorStatus = visitorList.getRow(i).getValue("Status");
					var visitorID = visitorList.getRow(i).getValue("VisitorID");
					
					if (visitorID == 0) {
						continue;
					}

					// 등록 대기중
					if (status == VisitApprovalWaiting) {
						if (visitorStatus == VisitorStatusRegistered || visitorStatus == VisitorStatusVisiting || visitorStatus == VisitorStatusVisited) {
							app.lookup("deleteIDList").addRowData({"deleteID":visitorID});
						}
					}
					if (i==visitorList.getRowCount()-1) {
						dm_paramHDMS.setValue("DeleteFlag", "false");
					}
				}
				
				app.lookup("deleteIDList").commit();
				
				// 승인 취소시 아이디 삭제
				processVisitorDelete();
			}
			
			// 승인 상태이고 등록중이 아니라면 방문객 등록이 되지 않은 상태라면 승인 취소
			if (status == VisitApprovalApproved) {
				if (!(applying_flag=="true")) {	// 등록 중이 아닐때 검사
					var visitorList = app.lookup("VisitorList");
					var visitorStatusCnt = 0;
					for (var i=0; i<visitorList.getRowCount(); i++) {
						var visitorStatus = visitorList.getRow(i).getValue("Status");
						var visitorID = visitorList.getRow(i).getValue("VisitorID");
						
						if (visitorStatus == VisitorStatusNone || visitorStatus == VisitorStatusDeleted) {
							visitorStatusCnt++;
						}
						
					}

					if (visitorList.getRowCount() == visitorStatusCnt) {	// 방문객 전체가 미등록 / 등록 삭제 상태라면 자동 승인 취소
						onVMVAD_btnCancleApprovalClick();
					}
				}	
			}
		}
		app.lookup("VMVAP_grpVisitInfo").redraw();
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 방문 신청 정보 수신 에러
function onSms_getVisitApplicationSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 방문 신청 정보 수신 타임아웃
function onSms_getVisitApplicationSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

// 방문 신청 승인 클릭
function onVMVAD_btnApprovalClick( /* cpr.events.CMouseEvent */ e) {
	var dmVisitStatus = app.lookup("VisitStatus");
	dmVisitStatus.setValue("Status", VisitApprovalApproved);
	
	var dmVisitInfo = app.lookup("VisitInfo");
	var visitIndex = dmVisitInfo.getValue("VisitIndex");
	
	var sms_putVisitApplication = app.lookup("sms_putVisitApplicationStatus");
	sms_putVisitApplication.action = "/v1/visit/visitApplication/" + visitIndex + "/status";
	//현대 엠시트 POST 요청
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		sms_putVisitApplication.method = "POST";
		sms_putVisitApplication.action += "HDMSPUT";
	}
	sms_putVisitApplication.send();
	app.lookup("VMVAD_btnApproval").enabled = false;
	app.lookup("VMVAD_btnDenial").enabled = false;
}

// 방문 신청 거부 클릭
function onVMVAD_btnDenialClick( /* cpr.events.CMouseEvent */ e) {
	var dmVisitStatus = app.lookup("VisitStatus");
	dmVisitStatus.setValue("Status", VisitApprovalDenied);
	
	var dmVisitInfo = app.lookup("VisitInfo");
	var visitIndex = dmVisitInfo.getValue("VisitIndex");
	
	var sms_putVisitApplication = app.lookup("sms_putVisitApplicationStatus");
	sms_putVisitApplication.action = "/v1/visit/visitApplication/" + visitIndex + "/status";
	//현대 엠시트 POST 요청
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		sms_putVisitApplication.method = "POST";
		sms_putVisitApplication.action += "HDMSPUT";
	}
	sms_putVisitApplication.send();
	app.lookup("VMVAD_btnApproval").enabled = false;
	app.lookup("VMVAD_btnDenial").enabled = false;
	
}

// 방문 신청 상태 변경 완료
function onSms_putVisitApplicationStatusSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		var dmVisitStatus = app.lookup("VisitStatus");
		var visitStatus = dmVisitStatus.getValue("Status");
		
		var dmVisitInfo = app.lookup("VisitInfo");
		dmVisitInfo.setValue("Status", visitStatus);
		
		var msg;
		
		if (VMVAD_ver == 3) {
			if (visitStatus == VisitApprovalApproved) {
				msg = "행사신청이 승인되었습니다.";
			} else if (visitStatus == VisitApprovalDenied) {
				msg = "행사신청이 거부되었습니다.";
			}
		} else {
			if (visitStatus == VisitApprovalApproved) {
				msg = dataManager.getString("Str_VisitApproved");
			} else if (visitStatus == VisitApprovalDenied) {
				msg = dataManager.getString("Str_VisitDenied");
			}
		}
		
		if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
			// 승인 후 redraw 
			var visitIndex = app.lookup("VisitInfo").getValue("VisitIndex");
			var sms_getVisitApplication = app.lookup("sms_getVisitApplication");
			sms_getVisitApplication.action = "/v1/visit/visitApplication/" + visitIndex;
			sms_getVisitApplication.send();

			if (visitStatus == VisitApprovalApproved) {
				
				// 등록중 플래그
				app.lookup("dm_paramHDMS").setValue("ApplyingFlag", "true");
				
				// 승인
				msg = dataManager.getString("Str_VisitApprovedHDMS");
				
				dialogConfirm(app, dataManager.getString("Str_Success"), msg, function(/*cpr.controls.Dialog*/dialog){
					dialog.addEventListenerOnce("close", function(e) {
						if (dialog.returnValue) {
							// 일괄 등록 확인 눌렀을때
							var dsIndexList = app.lookup("IndexList");
							dsIndexList.clear();
							
							var grdVisitorList = app.lookup("VMVAD_grdVisitorList");
							grdVisitorList.checkAllRow();
							var indices = grdVisitorList.getCheckRowIndices();

							for (var i = 0; i < indices.length; i++) {
								var visitorInfo = grdVisitorList.getRow(indices[i]);
								if (visitorInfo) {
									var visitorStatus = visitorInfo.getValue("Status");
									if (visitorStatus == VisitorStatusNone || visitorStatus == VisitorStatusDeleted) { // 등록전 or 삭제된 경우면 추가
										dsIndexList.addRowData({
											"VisitorIndex": visitorInfo.getValue("VisitorIndex")
										})
									}
								}
							}
							processVisitorRegist();			
							grdVisitorList.clearAllCheck();
						} else {
							// 일괄 등록 안할 시 승인 -> 대기 변경
							// 엠시트 요청 사항 
							onVMVAD_btnCancleApprovalClick();
							
							// 등록중 플래그
							app.lookup("dm_paramHDMS").setValue("ApplyingFlag", "false");
						}
					});
				});
			} else if (visitStatus == VisitApprovalDenied) {
				// 거부
				dialogAlert(app, dataManager.getString("Str_Success"), msg);
			} else if (visitStatus == VisitApprovalWaiting) {
				var statusCancle = app.lookup("dm_paramHDMS").getValue("StatusCancle");		// 승인 취소 2, 거부취소 3		
				if (statusCancle == VisitApprovalApproved) {
					// 승인 취소
					dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_VisitCancleApproved"));					
				} else if (statusCancle == VisitApprovalDenied) {
					// 거부 취소
					dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_VisitCancleDenied"));
				} else {
					
				}
			} else {
				dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
			}
			return;
		}
		
		dialogAlert(app, dataManager.getString("Str_Success"), msg, function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				var dmVisitInfo = app.lookup("VisitInfo");
				var status = dmVisitInfo.getValue("Status");
				app.close(status);
			});
		});
		
	} else {
		app.lookup("VMVAD_btnApproval").enabled = true;
		app.lookup("VMVAD_btnDenial").enabled = true;
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 방문 신청 상태 변경 에러
function onSms_putVisitApplicationStatusSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 방문 신청 상태 변경 타임아웃
function onSms_putVisitApplicationStatusSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}

// 취소 버튼 클릭시
function onVMVAD_btnCancelClick( /* cpr.events.CMouseEvent */ e) {
	var visitIndex = app.lookup("VisitInfo").getValue("VisitIndex");
	app.close(visitIndex);
}

//
function onVMVAD_btnVisitorRegistClick( /* cpr.events.CMouseEvent */ e) {
	
	var dsIndexList = app.lookup("IndexList");
	dsIndexList.clear();
	
	var grdVisitorList = app.lookup("VMVAD_grdVisitorList");
	var indices = grdVisitorList.getCheckRowIndices();
	for (var i = 0; i < indices.length; i++) {
		var visitorInfo = grdVisitorList.getRow(indices[i]);
		if (visitorInfo) {
			var visitorStatus = visitorInfo.getValue("Status");
			if (visitorStatus == VisitorStatusNone || visitorStatus == VisitorStatusDeleted) { // 등록전 or 삭제된 경우면 추가
				dsIndexList.addRowData({
					"VisitorIndex": visitorInfo.getValue("VisitorIndex")
				})
			}
		}
	}
	processVisitorRegist();
}

function processVisitorRegist() {
	var dsIndexList = app.lookup("IndexList");
	var visitInfo = app.lookup("VisitInfo")
	
	if (dsIndexList.getRowCount() < 1) {
		//dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_VisitorRegistSuccess"));
		
		var visitIndex = visitInfo.getValue("VisitIndex");
		var sms_getVisitApplication = app.lookup("sms_getVisitApplication");
		sms_getVisitApplication.action = "/v1/visit/visitApplication/" + visitIndex;
		sms_getVisitApplication.send();
		return;
	}
	var visitorIndex = dsIndexList.getRow(0).getValue("VisitorIndex");
	dsIndexList.realDeleteRow(0);
	
	var visitorInfo = app.lookup("VisitorList").findFirstRow("VisitorIndex == '" + visitorIndex + "'");
	
	var rect = app.getActualRect();
	var appSrc;
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		appSrc = "app/visit/visitorRegistHDMS";
	} else {
		appSrc = "app/visit/visitorRegist";
	}
	app.getRootAppInstance().openDialog(appSrc, {
		width: rect.width,
		height: rect.height
	}, function(dialog) {
		dialog.initValue = {
			"VisitInfo": visitInfo.getDatas(),
			"VisitorInfo": visitorInfo.getRowData(),
			"OEM": VMVAD_ver
		};
		dialog.resizable = false;
		dialog.maximize();
		dialog.headerVisible = false;
		//dialog.bind("headerTitle").toLanguage("Str_WebCamViewer");
		dialog.modal = true;
	}).then(function(returnValue) {
		if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
			app.lookup("dm_paramHDMS").setValue("ApplyingFlag", "false");
		}
		processVisitorRegist();
	});
}

// 그리드에서 row-dblclick 이벤트 발생 시 호출.
function onVMVAD_grdVisitorListRowDblclick( /* cpr.events.CGridEvent */ e) {
	var dmVisitInfo = app.lookup("VisitInfo");
	var status = dmVisitInfo.getValue("Status");
	if (status != VisitApprovalApproved) {
		return;
	}
	var visitorIndex = e.row.getValue("VisitorIndex")
	var visitorInfo = app.lookup("VisitorList").findFirstRow("VisitorIndex == '" + visitorIndex + "'");
	var visitorStatus = visitorInfo.getValue("Status");
	if (visitorStatus != VisitorStatusNone && visitorStatus != VisitorStatusDeleted) { // 등록전 or 삭제된 경우가 아니면 리턴 
		return;
	}
	
	var dsIndexList = app.lookup("IndexList");
	dsIndexList.addRowData({
		"VisitorIndex": visitorIndex
	});
	
	processVisitorRegist();
}

function onVMVAD_btnLogoutClick( /* cpr.events.CMouseEvent */ e) {
	app.lookup("sms_logout").send();
}

function onSms_logoutSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var appld = "app/visitLogin";
	cpr.core.App.load(appld, function(newapp) {
		app.getRootAppInstance().close();
		location.reload();
	});
	return;
}

// 현대 엠시트 만료일 수정
function onVMVAD_btnVisitorEndAtUpdateClick(/* cpr.events.CMouseEvent */ e){
	// 현대 엠시트 방문종료일 수정 버튼
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		var visitInfo = app.lookup("VisitInfo");
		var grdVisitorList = app.lookup("VMVAD_grdVisitorList");
		
		var visitorList = app.lookup("VisitorList");
		var visitorListArr = visitorList.getColumnData("Status");
		var status_flag = true;

		for (var i=0; i<visitorListArr.length; i++) {
			if (visitorListArr[i]!=VisitorStatusRegistered){
				status_flag = false;
				break;
			}
		}

		if (status_flag) {
			var visitorInfo = grdVisitorList.getRow(0);
			if (visitorInfo) {
				var visitorStatus = visitorInfo.getValue("Status");
					if (visitorStatus == VisitorStatusRegistered) { // 등록 완료 되었을때만 동작
						
						var appld = "app/visit/visitorEndAtUpdateHDMS";
						app.getRootAppInstance().openDialog(appld, {
							width: 700,
							height: 240
						}, function(dialog) {
							dialog.bind("headerTitle").toLanguage("Str_EndAtModification");
							dialog.modal = true;
							dialog.initValue = {
								"VisitInfo": visitInfo.getDatas(),
								"VisitorInfo": visitorInfo.getRowData()
							}
						}).then(function(returnValue) {
							if( returnValue != null ){
								processVisitorRegist();
							}
						});
							
					} else {
						// 모든 사용자가 등록 아닙니다.
						dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_VisitorEndAtModifyNot"));
					}
			}
			
		} else {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_VisitorEndAtModifyNot"));
		}

	} else {
		return;
	}
	
	
	
}

// 현대 엠시트 승인 취소 클릭
function onVMVAD_btnCancleApprovalClick(/* cpr.events.CMouseEvent */ e){
	var dmVisitStatus = app.lookup("VisitStatus");
	dmVisitStatus.setValue("Status", VisitApprovalWaiting);
	
	var dm_paramHDMS = app.lookup("dm_paramHDMS");
	dm_paramHDMS.clear();
	dm_paramHDMS.setValue("DeleteFlag", "true");
	dm_paramHDMS.setValue("StatusCancle", VisitApprovalApproved);		// 승인 취소 2
	
	var dmVisitInfo = app.lookup("VisitInfo");
	var visitIndex = dmVisitInfo.getValue("VisitIndex");
	
	var sms_putVisitApplication = app.lookup("sms_putVisitApplicationStatus");
	sms_putVisitApplication.action = "/v1/visit/visitApplication/" + visitIndex + "/status";
	//현대 엠시트 POST 요청
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		sms_putVisitApplication.method = "POST";
		sms_putVisitApplication.action += "HDMSPUT";
	}
	sms_putVisitApplication.send();
	app.lookup("VMVAD_btnApproval").enabled = true;
	app.lookup("VMVAD_btnDenial").enabled = true;
}

function processVisitorDelete() {
	var deleteIDList = app.lookup("deleteIDList");
	var row = deleteIDList.getRow(0);
	if (row) {
		var userID = row.getValue("deleteID");
		var sms_deleteUser = new cpr.protocols.Submission("sms_deleteUser");
		sms_deleteUser.action = "/v1/visit/"+userID;
		sms_deleteUser.method = "delete";
		sms_deleteUser.userAttr("uid", userID);
		
		//현대 엠시트 메서드 우회
		if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
			sms_deleteUser.method = "POST";
			sms_deleteUser.action += "/HDMSDELETE";
		}
		
		// 방문객 삭제시
		sms_deleteUser.action += "?option=" + VisitApprovalDenied;
		
		sms_deleteUser.addResponseData(app.lookup("Result"), false, "Result");
		
		sms_deleteUser.addEventListenerOnce("submit-done", onSms_deleteUserSubmitDone);
		sms_deleteUser.addEventListenerOnce("submit-error", onSms_deleteUserSubmitError);
		sms_deleteUser.addEventListenerOnce("submit-timeout", onSms_deleteUserSubmitTimeout);
		sms_deleteUser.send();
	}
	
	
}

// 사용자 삭제 완료
function onSms_deleteUserSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/* @type cpr.protocols.Submission */
	var sms_deleteUser = e.control;
	var uid = sms_deleteUser.userAttr("uid");
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		var deleteIDList = app.lookup("deleteIDList");
		deleteIDList.realDeleteRow(0);
		processVisitorDelete();
	} else {		
		dataManager = getDataManager();
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			"ID : "+uid+ " 사용자 삭제 "+dataManager.getString("Str_Failed")+"\n"+dataManager.getString(getErrorString(resultCode)));
		deleteIDList.clear();
	}
	
	if (deleteIDList.getRowCount() == 0) {
		var visitIndex = app.lookup("VisitInfo").getValue("VisitIndex");
		var sms_getVisitApplication = app.lookup("sms_getVisitApplication");
		sms_getVisitApplication.action = "/v1/visit/visitApplication/" + visitIndex;
		sms_getVisitApplication.send();
	}
	
}
// 사용자 삭제 실패
function onSms_deleteUserSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

// 사용자 삭제 타임아웃
function onSms_deleteUserSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}

// 현대 엠시트 거부 취소 클릭
function onVMVAD_btnCancleDenialClick(/* cpr.events.CMouseEvent */ e){
	var dmVisitStatus = app.lookup("VisitStatus");
	dmVisitStatus.setValue("Status", VisitApprovalWaiting);
	
	var dm_paramHDMS = app.lookup("dm_paramHDMS");
	dm_paramHDMS.clear();
	dm_paramHDMS.setValue("StatusCancle", VisitApprovalDenied);		// 거부 취소 3
	
	var dmVisitInfo = app.lookup("VisitInfo");
	var visitIndex = dmVisitInfo.getValue("VisitIndex");
	
	var sms_putVisitApplication = app.lookup("sms_putVisitApplicationStatus");
	sms_putVisitApplication.action = "/v1/visit/visitApplication/" + visitIndex + "/status";
	//현대 엠시트 POST 요청
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		sms_putVisitApplication.method = "POST";
		sms_putVisitApplication.action += "HDMSPUT";
	}
	sms_putVisitApplication.send();
	app.lookup("VMVAD_btnApproval").enabled = true;
	app.lookup("VMVAD_btnDenial").enabled = true;
}
