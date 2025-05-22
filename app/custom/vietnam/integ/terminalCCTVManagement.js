/************************************************
 * terminalCCTVManagement.js
 * Created at 2024. 8. 16. ���� 2:34:03.
 *
 * @author SW2Team
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var oem_version;
var terminalID;
var szDeviceIdentify; // CCTV identify
var comLib;
var txtArea; // 앱
var terminalMap = new Map(); // 라이브 영상 open 여부

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	oem_version = dataManager.getOemVersion();
	comLib = createComUtil(app);
	txtArea = app.lookup("VICTCM_txt");
	
	var terminalList = dataManager.getTerminalList();
	
	terminalList.copyToDataSet(app.lookup("TerminalList"));
	var rowCnt = terminalList.getRowCount();
	
	for(var i=0; i<rowCnt; i++) {
		terminalMap.set(terminalID, false);
	}
	
	var snippet = app.lookup("VICTCM_snippet");
	var address = "setup/HCWebSDKPlugin.exe"
	snippet.value = "<a href="+address+" target=\"_blank\">" + "HCWebSDKPlugin.exe" + "</a>";
	
	app.lookup("sms_get_terminal_cctv_infos").send();
	
	
	// 연결 테스트 위해 플러그인 Init
	initPlugin();
}




/*
 * "설정 저장" 버튼(VICTCM_btnSaveSetting)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVICTCM_btnSaveSettingClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vICTCM_btnSaveSetting = e.control;
	
	var cctvInfo = app.lookup("CCTVInfo");
	cctvInfo.setValue("TerminalID", terminalID);
	
	if(!validateData(cctvInfo)) {
		return;
	}
	
	var submission = app.lookup("sms_put_terminal_cctv_info");
	submission.send();
}

function validateData(data) {
	var terminalID = data.getValue("TerminalID"),
		ip = data.getValue("CameraIP"),
		port = data.getValue("CameraPort"),
		userID = data.getValue("UserID"),
		pwd = data.getValue("UserPassword"),
		rtspPort = data.getValue("RTSPPort"),
		message = "";
		
	if(terminalID == "" || terminalID == null) {
		dialogAlert(app, dataManager.getString("Str_Fail") , dataManager.getString("Str_NoSelection") );
		return false;
	}
	if(ip == "") {
		message = "IP Address " + dataManager.getString("Str_CommonRequiredAlert");
		dialogAlert(app,dataManager.getString("Str_Warning"), message);
		return false;
	}
	if(port == 0 || isNaN(port)) {
		message = "Port " + dataManager.getString("Str_CommonRequiredAlert");
		dialogAlert(app,dataManager.getString("Str_Warning"), message);
		return false;
	}
	if(userID == "") {
		message = "User Name " + dataManager.getString("Str_CommonRequiredAlert");
		dialogAlert(app,dataManager.getString("Str_Warning"), message);
		return false;
	}
	if(pwd == "") {
		message = "Password " + dataManager.getString("Str_CommonRequiredAlert");
		dialogAlert(app,dataManager.getString("Str_Warning"), message);
		return false;
	}
	return true;
	
}


/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onVICTCM_grdTerminalListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var vICTCM_grdTerminalList = e.control;
	var terminalRow = vICTCM_grdTerminalList.getSelectedRow();
	terminalID = terminalRow.getValue("ID");
	
	var cctvList = app.lookup("CCTVList");
	var cctvInfo = app.lookup("CCTVInfo");
	
	txtArea.value = "";
	var row = cctvList.findFirstRow("TerminalID == "+terminalID);
	if(row) {
		cctvList.copyToDataMap(cctvInfo, row.getIndex())
		app.lookup("VICTCM_gr_cctv_info").redraw();
		if(szDeviceIdentify != undefined ) {
			cctvLogout();			
			szDeviceIdentify = undefined;
		}	
	} else {
		cctvInfo.clear();
		cctvInfo.setValue("TerminalID", terminalID);
		app.lookup("VICTCM_gr_cctv_info").redraw();		
	}
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_put_terminal_cctv_infoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_put_terminal_cctv_info = e.control;
	var result = app.lookup("Result").getValue("ResultCode");
	
	if(result == COMERROR_NONE) {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_SaveNotify"));
		
		var cctvList = app.lookup("CCTVList");
		var cctvInfo = app.lookup("CCTVInfo").getDatas();
		var row = cctvList.findFirstRow("TerminalID == " + cctvInfo.TerminalID);
		if(row) {
			cctvList.updateRow(row.getIndex(), cctvInfo);
		} else {
			cctvList.addRowData(cctvInfo);
		}
		
		dataManager.setTerminalCCTVList_VIC(cctvList);
		
//		var rootApp = app.getRootAppInstance();
//		if(rootApp.hasAppMethod("setVIC_CCTVInfo")) {
//			rootApp.callAppMethod("setVIC_CCTVInfo", row);	
//		}
	} else {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString(getErrorString(result)));
	}
}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}
function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_get_terminal_cctv_infosSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_get_terminal_cctv_infos = e.control;
	var result = app.lookup("Result").getValue("ResultCode");
	
	if(result == COMERROR_NONE) {
		console.log("onSms_get_terminal_cctv_infosSubmitDone");
	} else {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString(getErrorString(result)));
	}
}


/*
 * "라이브 영상" 버튼(VICTCM_btnLiveView)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVICTCM_btnLiveViewClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
//	var appID = "app/custom/vietnam/integ/hikLiveView";
//	app.openDialog(appID, {width : 500, height : 500}, function(dialog) {
//		dialog.bind("headerTitle").toLanguage("Str_Monitoring");
//		dialog.initValue = {
//			"CCTVInfo": app.lookup("CCTVInfo")
//		}
//		dialog.modal = true;
//	})

	var cctvInfo = app.lookup("CCTVInfo");
	if(!validateData(cctvInfo)) {
		return;
	}

	if(terminalMap.get(terminalID)) {
		console.log("이미 새 창이 열려있음")
		return;
	}

	var address = document.URL.toString() + '/hikLiveView';
	var newWindow = window.open(address, terminalID, "resizable=yes,width=300, height=400,top=150,left=510,menubar=false");
	var initValue = app.lookup("CCTVInfo").getDatas();

	var messageHandler = function(event) {
		if (event.data === "initReq") {
	        var data = { type: "initData", value:initValue };
	        newWindow.postMessage(data);
	    } 
	}

	window.addEventListener("message", messageHandler);
	
	terminalMap.set(terminalID, true);
	
	var checkPopupClosed = setInterval(function() {
	    if (newWindow === null || newWindow.closed) {
        	clearInterval(checkPopupClosed);  // 타이머 정지
	        
	        terminalMap.set(terminalID, false);
	        window.removeEventListener("message", messageHandler);
	    }
	}, 500);  // 0.5초 간격으로 창 상태 확인
}


/*
 * "연결 테스트" 버튼(VICTCM_btnConnectTest)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVICTCM_btnConnectTestClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	
	var cctvInfo = app.lookup("CCTVInfo");
	if(!validateData(cctvInfo)) {
		return;
	}
	cctvLogin();
//	getDeviceInfo(); // 비동기 작업 다 끝난 후 호출 필요
}


function cctvLogin() {
	txtArea.value += "Connecting Device.... \n ";
	var ERROR_CODE_LOGIN_REPEATLOGIN = 2001;
	
	var cctvInfo = app.lookup("CCTVInfo");
	var szIP = cctvInfo.getValue("CameraIP");
	var szPort = cctvInfo.getValue("CameraPort");
	var szUsername = cctvInfo.getValue("UserID");
	var szPassword = cctvInfo.getValue("UserPassword");
	
	szDeviceIdentify = szIP + "_" + szPort;
	
	WebVideoCtrl.I_Login(szIP, 1, szPort, szUsername, szPassword, {
		timeout: 3000,
		success: function () {
			txtArea.value += szDeviceIdentify + " login successful !\n ";
			setTimeout(function() {
				getChannelInfo();
			}, 1000);
			getDevicePort();
			getDeviceInfo();
		},
		error: function(oError) {
			if(oError.errorCode == ERROR_CODE_LOGIN_REPEATLOGIN) {
				txtArea.value += szDeviceIdentify + " already login. \n ";
				getDeviceInfo();
			} else {
	        	var message = "device login failed. \n errorCode : " + oError.errorCode + "\n Msg:" + oError.errorMsg;
        		dialogAlert(app, dataManager.getString("Str_Fail") , message );
			}
		}
	});
	
}

function getChannelInfo() {
	if(szDeviceIdentify == null) {
		txtArea.value += "getChannelInfo(), szDeviceIdentify is null \n";
		return;
	}
	// analog channel
	WebVideoCtrl.I_GetAnalogChannelInfo(szDeviceIdentify, {
		success: function(xmlDoc) {
			var oChannels = $(xmlDoc).find("VideoInputChannel");
			
			$.each(oChannels, function (i) {
				var id = $(this).find("id").eq(0).text(),
					name = $(this).find("name").eq(0).text();
				if(name == ""){
					name = "Camera " + (i < 9 ? "0" + (i + 1) : (i + 1));
				}
//				oSel.append("<option value='" + id + "' bZero='false'>" + name + "</option>");
			})
			txtArea.value += szDeviceIdentify + " get analog channel success. \n";
		},
		error: function(oError) {
//			txtArea.value += szDeviceIdentify + " get analog channel failed " 
//			"errCode : " + oError.errorCode + "errMsg : " + oError.errorMsg +"\n";
			console.log(szDeviceIdentify + " get analog channel failed ",oError.errorCode,oError.errorMsg);
		}
	});
	
	// IP channel
    WebVideoCtrl.I_GetDigitalChannelInfo(szDeviceIdentify, {
        success: function (xmlDoc) {
            var oChannels = $(xmlDoc).find("InputProxyChannelStatus");

            $.each(oChannels, function (i) {
                var id = $(this).find("id").eq(0).text(),
                    name = $(this).find("name").eq(0).text(),
                    online = $(this).find("online").eq(0).text();
                if ("false" == online) {
                    return true;
                }
                if ("" == name) {
                    name = "IPCamera " + (i < 9 ? "0" + (i + 1) : (i + 1));
                }
            });
            txtArea.value += szDeviceIdentify + " get IP channel success.\n";
        },
        error: function (oError) {
//        	txtArea.value += szDeviceIdentify + " get IP channel failed " + 
//        	"errCode : " + oError.errorCode + "errMsg : " + oError.errorMsg +"\n";
        	console.log(szDeviceIdentify + " get IP channel failed. ",oError.errorCode,oError.errorMsg);
        }
    });
    // zero-channel info
    WebVideoCtrl.I_GetZeroChannelInfo(szDeviceIdentify, {
        success: function (xmlDoc) {
            var oChannels = $(xmlDoc).find("ZeroVideoChannel");
            
            $.each(oChannels, function (i) {
                var id = $(this).find("id").eq(0).text(),
                    name = $(this).find("name").eq(0).text();
                if ("" == name) {
                    name = "Zero Channel " + (i < 9 ? "0" + (i + 1) : (i + 1));
                }
                if ("true" == $(this).find("enabled").eq(0).text()) {
                }
            });
            txtArea.value += szDeviceIdentify + " get zero-channel success. \n";
        },
        error: function (oError) {
//        	txtArea.value += szDeviceIdentify + " get zero-channel failed. " + 
//        	"errCode : " + oError.errorCode + "errMsg : " + oError.errorMsg +"\n";
        	console.log(szDeviceIdentify + " get zero-channel failed. ",oError.errorCode,oError.errorMsg);
        }
    });
}

//get port
function getDevicePort() {
    if (null == szDeviceIdentify) {
    	txtArea.value += "getDevicePort(), szDeviceIdentify is null \n";
        return;
    }
    
    WebVideoCtrl.I_GetDevicePort(szDeviceIdentify);
    try {
    	// success callback
    	txtArea.value += szDeviceIdentify + " get port success.\n";
    } catch (oError) {
    	// Error callback
//    	txtArea.value += szDeviceIdentify + " get port failed." + 
//        	"errCode : " + oError.errorCode + "errMsg : " + oError.errorMsg +"\n";
        console.log(szDeviceIdentify + " get port failed. ",oError.errorCode,oError.errorMsg);
    	
    }
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl1Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl1 = e.control;
	var content = e.content;
	content.innerHTML = "<div id = \"divPlugin\"></div>";
}

function getDeviceInfo() {
	if (szDeviceIdentify == null) {
        return;
    }
    
    WebVideoCtrl.I_GetDeviceInfo(szDeviceIdentify, {
        success: function (xmlDoc) {
            var arrStr = [];
            arrStr.push("device name: \t" + $(xmlDoc).find("deviceName").eq(0).text() + "\r\n");
            arrStr.push("device ID: \t" + $(xmlDoc).find("deviceID").eq(0).text() + "\r\n");
            arrStr.push("model: \t" + $(xmlDoc).find("model").eq(0).text() + "\r\n");
            arrStr.push("serial number: \t" + $(xmlDoc).find("serialNumber").eq(0).text() + "\r\n");
            arrStr.push("MAC address: \t" + $(xmlDoc).find("macAddress").eq(0).text() + "\r\n");
            arrStr.push("firmware version: \t" + $(xmlDoc).find("firmwareVersion").eq(0).text() + " " + $(xmlDoc).find("firmwareReleasedDate").eq(0).text() + "\r\n");
            arrStr.push("encoder version: \t" + $(xmlDoc).find("encoderVersion").eq(0).text() + " " + $(xmlDoc).find("encoderReleasedDate").eq(0).text() + "\r\n");
            
            txtArea.value += szDeviceIdentify + " get deivce info success.\n"
            dialogVICCCTVAlert(app, dataManager.getString("Str_Success") , arrStr.join("") );
//            alert(arrStr.join(""));
        },
        error: function (oError) {
        	var message = " get device info failed. \n errorCode : " + oError.errorCode + "\n Msg:" + oError.errorMsg;
        	dialogAlert(app, dataManager.getString("Str_Fail") , message );
        }
    });
}



/*
 * "삭제" 버튼(VICTCM_btnDeleteCamera)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVICTCM_btnDeleteCameraClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vICTCM_btnDeleteCamera = e.control;
	
	dialogConfirm(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_DeleteConfirm"), function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e){
			if(dialog.returnValue) { // 확인
				var CameraIP = app.lookup("CCTVInfo").getValue("CameraIP"); // 확인용. 다른 column이어도 가능 
				if(CameraIP) {
					comLib.showLoadMask("","","",0);
					var sms = app.lookup("sms_del_terminal_cctv_info");
					sms.action = "/v1/vietnam/integ/cctv/" + terminalID;
					sms.send();					
				} else {
					dialogAlert(app, dataManager.getString("Str_Fail") , dataManager.getString("Str_NoSelection") );
				}
			
			
			} 
		})
	});
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_del_terminal_cctv_infoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_del_terminal_cctv_info = e.control;
	var result = app.lookup("Result").getValue("ResultCode");
	
	comLib.hideLoadMask();
	if(result == COMERROR_NONE) {
		var cctvInfo = app.lookup("CCTVInfo"); 
		cctvInfo.clear();
		cctvInfo.setValue("TerminalID", terminalID); // 삭제 후 재 입력의 경우 
		
		app.lookup("VICTCM_gr_cctv_info").redraw();
		
		var cctvList = app.lookup("CCTVList");
		var row = cctvList.findFirstRow("TerminalID == " + terminalID);
		
		cctvList.realDeleteRow(row.getIndex());
		dataManager.setTerminalCCTVList_VIC(cctvList);
		
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_DeleteNotify"));
		
		
//		var rootApp = app.getRootAppInstance();
//		if(rootApp.hasAppMethod("delVIC_CCTVInfo")) {
//			rootApp.callAppMethod("delVIC_CCTVInfo", terminalID);	
//		}
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString(getErrorString(result)));
	}
}

function cctvLogout() {	
	WebVideoCtrl.I_Logout(szDeviceIdentify)
	try {
		txtArea.value += szDeviceIdentify + " logout successful. \n";
	} catch (error) {
		txtArea.value += szDeviceIdentify + " logout failed. \n";
	}
}


/*
 * 루트 컨테이너에서 before-unload 이벤트 발생 시 호출.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	if(szDeviceIdentify != undefined) {
		cctvLogout();
	}
}

/*
 * 인풋 박스에서 mousedown 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 누를 때 발생하는 이벤트.
 */
function onVICTCM_ipb_pwdMousedown(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	
	var ctrl = e.control;
	ctrl.secret = false;
}

/*
 * 인풋 박스에서 mouseup 이벤트 발생 시 호출.
 * 사용자가 컨트롤 위에 포인터를 위치한 상태로 마우스 버튼을 뗄 때 발생하는 이벤트.
 */
function onVICTCM_ipb_pwdMouseup(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var vICTCM_ipb_pwd = e.control;
	vICTCM_ipb_pwd.secret = true;
}


// async await를 exbuidler에서 인식하지 못하므로 밑으로 내려줘야한다.
function initPlugin() {
	// plugin 성공하려면 div 태그가 필요하다. 추후에 이 div에 영상이 보이게 된다.. 
	
	txtArea.value = "HikVision Web SDK Plugin initiating... \n";
	
	// Init plugin parameters and insert the plugin
    WebVideoCtrl.I_InitPlugin({
        bWndFull: true, //Wether support doule clicking to switch the full-screen mode: it's supported by default; true:support, false:not support
        iWndowType: 1,
        cbInitPluginComplete: async function () {
		    try {
		        await WebVideoCtrl.I_InsertOBJECTPlugin("divPlugin");
		        var bFlag = await WebVideoCtrl.I_CheckPluginVersion();
		        if (bFlag) {
		        	txtArea.value += "Detect the latest version, please double click HCWebSDKPlugin.exe to update!\n";
		        }
		        txtArea.value += "Plugin initiating Complete ! \n";
		        
		    } catch (error) {
		    	txtArea.value += "The plugin initialization failed. "
		    	 + "Please confirm if the plugin has been installed. "
		    	 + "If not installed, please double click on HCWebSDKPlugin.exe to install it!\n"
		    }
		}
    });
}







/*
 * "Button" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var appID = "app/custom/vietnam/integ/hikLiveView";
	app.openDialog(appID, {width : 500, height : 500}, function(dialog) {
		dialog.bind("headerTitle").toLanguage("Str_Monitoring");
		dialog.initValue = {
			"CCTVInfo": app.lookup("CCTVInfo")
		}
		dialog.modal = true;
	})
}
