/************************************************
 * visitApplicationStep1.js
 * Created at 2020. 6. 2. 오후 2:43:58.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib = createComUtil(app);
var dateLib = cpr.core.Module.require("lib/DateLib");
var util = cpr.core.Module.require("lib/util");

var VMVAS3_ver = 0;
var VMVAS3_src = "";
var OEM_VERSION;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	OEM_VERSION = dataManager.getOemVersion();
	
	VMVAS3_ver = localStorage.getItem("oem");
	VMVAS3_src = localStorage.getItem("src");
	var strStep2Data = localStorage.getItem("step2Data");
	var step2Data = JSON.parse(strStep2Data);
	var dmVisitInfo = app.lookup("VisitInfo");
	dmVisitInfo.build(step2Data.visitInfo);
	
	var dsVisitorList = app.lookup("VisitorList");
	dsVisitorList.build(step2Data.visitorList);
	
	initControls();
}

function initControls() {
	var cmbItemType = app.lookup("VMVAS3_cmbItemType");
	cmbItemType.addItem(new cpr.controls.Item("------", "0"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeNetworkDevice"), "1"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeStorage"), "2"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeRecordDevice"), "3"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeEtc"), "4"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeFacilityOperating"), "5"));
	
	var cmbItemName = app.lookup("VMVAS3_cmbItemName");
	cmbItemName.addItem(new cpr.controls.Item("-----", "0"));
	
	var cmbInOut = app.lookup("VMVAS3_cmbInOut");
	cmbInOut.addItem(new cpr.controls.Item("------", "0"));
	cmbInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemIn"), "1"));
	cmbInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemOut"), "2"));
	cmbInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemInOut"), "3"));
	
	var cmbGrdItemType = app.lookup("VMVAS3_cmbGrdItemType");
	cmbGrdItemType.addItem(new cpr.controls.Item("------", "0"));
	cmbGrdItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeNetworkDevice"), "1"));
	cmbGrdItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeStorage"), "2"));
	cmbGrdItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeRecordDevice"), "3"));
	cmbGrdItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeEtc"), "4"));
	cmbGrdItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeFacilityOperating"), "5"));
	
	var cmbGrdItemNameType = app.lookup("VMVAS3_cmbGrdItemNameType");
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
	
	var cmbGrdItemInOut = app.lookup("VMVAS3_cmbGrdItemInOut");
	cmbGrdItemInOut.addItem(new cpr.controls.Item("------", "0"));
	cmbGrdItemInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemIn"), "1"));
	cmbGrdItemInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemOut"), "2"));
	cmbGrdItemInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemInOut"), "3"));
}

// 휴대품 구분 선택시
function onVMVAS3_cmbItemTypeSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** @type cpr.controls.ComboBox	 */
	var vMVAS3_cmbItemType = e.control;
	var cmbItemName = app.lookup("VMVAS3_cmbItemName");
	cmbItemName.deleteAllItems();
	
	var type = 0;
	switch (vMVAS3_cmbItemType.value) {
		case "1":
			cmbItemName.addItem(new cpr.controls.Item("-----", "0"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameNotebook"), "1"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNamePC"), "2"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNamePDA"), "3"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNamePMP"), "4"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameMobile"), "5"));
			break;
		case "2":
			cmbItemName.addItem(new cpr.controls.Item("-----", "0"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameUSB"), "11"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameHard"), "12"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameCD"), "13"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameDisk"), "14"));
			break;
		case "3":
			cmbItemName.addItem(new cpr.controls.Item("-----", "0"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameRecoder"), "21"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameCamera"), "22"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameCam"), "23"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameVoiceRecoder"), "24"));
			break;
		case "4":
			type = 1;
			break;
		case "5":
			type = 1;
			break;
		default:
			break;
	}
	if (type == 0) {
		var cmbItemName = app.lookup("VMVAS3_cmbItemName").enabled = true;
		var ipbItemName = app.lookup("VMVAS3_ipbItemName");
		ipbItemName.enabled = false;
		ipbItemName.value = "";
	} else {
		app.lookup("ItemInfo").setValue("NameType", 0);
		var cmbItemName = app.lookup("VMVAS3_cmbItemName").enabled = false;
		var ipbItemName = app.lookup("VMVAS3_ipbItemName").enabled = true;
	}
	//현대 엠시트
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT && vMVAS3_cmbItemType.value === "1") {
		app.lookup("op_serialNumRequired").value = "*";
	} else {
		app.lookup("op_serialNumRequired").value = "";
	}
}

function validateItemInfo(dmItemInfo) {
	var type = dmItemInfo.getValue("ItemType");
	
	if (type == null || type == 0 || type == "") {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitItemTypeInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS3_cmbItemType").focus(true);
			});
		});
		return false;
	}
	var nameType = dmItemInfo.getValue("NameType");
	if ((nameType == null || nameType == 0 || nameType == "") && type != 4 && type != 5) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitItemNameTypeInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS3_cmbItemName").focus(true);
			});
		});
		return false;
	}
	if (type == 4 || type == 5) {
		var name = dmItemInfo.getValue("Name");
		if (name == null || name.length < 1) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitItemNameInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					app.lookup("VMVAS3_ipbItemName").focus(true);
				});
			});
			
			return false;
		}
	}
	var inOut = dmItemInfo.getValue("InOut");
	if (inOut == null || inOut == 0 || inOut == "") {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitItemInOutInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS3_cmbInOut").focus(true);
			});
		});
		return false;
	}
	var model = dmItemInfo.getValue("Model");
	if (model == null || model.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitItemModelInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS3_ipbItemModel").focus(true);
			});
		});
		return false;
	}
	var purpose = dmItemInfo.getValue("Purpose");
	if (purpose == null || purpose.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitItemPurposeInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS3_ipbItemPurpose").focus(true);
			});
		});
		return false;
	}
	var unit = dmItemInfo.getValue("Unit");
	if (unit == null || unit.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitItemUnitInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS3_ipbItemUnit").focus(true);
			});
		});
		return false;
	}
	var count = dmItemInfo.getValue("Count");
	if (count == null || count.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitItemCountInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS3_ipbItemCount").focus(true);
			});
		});
		return false;
	}
	// 현대 엠시트 - 노트북 선택 시, 시리얼 번호 필수
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		//노트북 일 때
		if (app.lookup("VMVAS3_cmbItemType").value === "1") {
			var serialNum = dmItemInfo.getValue("SerialNum");
			if (serialNum == null || serialNum.length < 1) {
				dialogAlert(app, dataManager.getString("Str_Warning"), "시리얼 번호를 입력해주세요", function( /*cpr.controls.Dialog*/ dialog) {
					dialog.addEventListenerOnce("close", function(e) {
						app.lookup("VMVAS3_ipbSerialNum").focus(true);
					});
				});
				return false;
			}
		}
	}
	/*
	var desc = dmItemInfo.getValue("Desc");
	if( desc == null || desc.length < 1 ){
		onAlert("Str_Warning","Str_WarnVisitItemDescInvalid");
		return false;		
	}
	* */
	
	return true;
}

// 방문자 추가
function onVMVAS3_btnItemAddClick( /* cpr.events.CMouseEvent */ e) {
	var dmItemInfo = app.lookup("ItemInfo");
	if (validateItemInfo(dmItemInfo) == false) {
		return;
	}
	var dsItemList = app.lookup("ItemList");
	dsItemList.addRowData(dmItemInfo.getDatas());
	dsItemList.commit();
}

// 방문자 삭제
function onVMVAS3_btnItemDeleteClick( /* cpr.events.CMouseEvent */ e) {
	var vMVAP_btnVisitorDelete = e.control;
	var grdItemList = app.lookup("VMVAS3_grdItemList");
	var indices = grdItemList.getCheckRowIndices();
	for (var i = indices.length; i > 0; i--) {
		grdItemList.deleteRow(indices[i - 1]);
	}
	grdItemList.commitData();
}

// 완료 클릭
function onVMVAS3_btnCompleteClick( /* cpr.events.CMouseEvent */ e) {
	app.lookup("VMVAS3_btnComplete").enabled = false;
	var sms_postVisitApplication = app.lookup("sms_postVisitApplication");
	sms_postVisitApplication.send();
}

// 방문 신청 완료
function onSms_postVisitApplicationSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("VMVAS3_btnComplete").enabled = true;
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		
		if (VMVAS3_src == "visit") { // 관리자 방문 신청인 경우
			var accountInfo = dataManager.getAccountInfo();
			
//			 cpr.core.App.load("app/visit/visitApplicationManagement", function(newapp) {
//				app.close();
//				var instance = newapp.createNewInstance().run();
//			});
			
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_VisitApplicationCompleted"), function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					localStorage.removeItem("step1Data");
					localStorage.removeItem("step2Data");
					
					cpr.core.App.load("app/visitLogin", function(newapp) {
						app.close();
						var instance = newapp.createNewInstance().run();
					});
				});
			});
				
		} else { // 방문객 방문 신청인 경우
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_VisitApplicationCompleted"), function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					localStorage.removeItem("step1Data");
					localStorage.removeItem("step2Data");
					
					cpr.core.App.load("app/visitorLogin", function(newapp) {
						app.close();
						var instance = newapp.createNewInstance().run();
					});
				});
			});
		}
		
	} else if (dmResult.getValue("ResultCode") == COMERROR_NET_ERROR) {
		// 네트워크 에러이면 중복 요청 막기 위해서 초기 화면으로 돌아감 - zzik
		if (VMVAS3_src == "visit") { // 관리자 방문 신청인 경우
			var accountInfo = dataManager.getAccountInfo();
			
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))), function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					localStorage.removeItem("step1Data");
					localStorage.removeItem("step2Data");
					
					cpr.core.App.load("app/visitLogin", function(newapp) {
						app.close();
						var instance = newapp.createNewInstance().run();
					});
				});
			});
				
		} else { // 방문객 방문 신청인 경우
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))), function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					localStorage.removeItem("step1Data");
					localStorage.removeItem("step2Data");
					
					cpr.core.App.load("app/visitorLogin", function(newapp) {
						app.close();
						var instance = newapp.createNewInstance().run();
					});
				});
			});
		}
	
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 방문 신청 에러
function onSms_postVisitApplicationSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR)
}

// 방문 신청 타임아웃
function onSms_postVisitApplicationSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT)
}
