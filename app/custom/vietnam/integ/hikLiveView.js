/************************************************
 * hikLiveView.js
 * Created at 2024. 8. 28. ���� 9:07:39.
 *
 * @author SW2Team
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var szDeviceIdentify;
/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	var cctvInfo = app.lookup("CCTVInfo");
	
	window.opener.postMessage("initReq");
	
	window.addEventListener("message", function(event) {
        var data = event.data;
        if(data.type == "initData") {
	        cctvInfo.setValue("TerminalID", data.value.TerminalID);
	        cctvInfo.setValue("CameraIP", data.value.CameraIP);
	        cctvInfo.setValue("CameraPort", data.value.CameraPort);
	        cctvInfo.setValue("UserID", data.value.UserID);
	        cctvInfo.setValue("UserPassword", data.value.UserPassword);
	        cctvInfo.setValue("RTSPPort", data.value.RTSPPort);
	        
			initPlugin();	        
        } 
    }, false);
    
//    var initValue = app.getHost().initValue;
//    initValue.CCTVInfo.copyToDataMap(cctvInfo);
//	initPlugin();
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
	content.innerHTML = "<div id = \"divPlugin2\" class=\"plugin\"></div>";
}



function cctvLogin() {
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
			console.log(szDeviceIdentify + " login successful");
			setTimeout(function() {
				getChannelInfo();
			}, 1000);
			getDevicePort();
//			getDeviceInfo();

			StartRealPlay();
		},
		error: function(oError) {
			if(oError.errorCode == ERROR_CODE_LOGIN_REPEATLOGIN) {
//				getDeviceInfo();
				StartRealPlay();
			} else {
	        	var message = "device login failed. \n errorCode : " + oError.errorCode + "\n Msg:" + oError.errorMsg;
	        	app.lookup("VICTCM_txt").value = message;
//        		alert(message);
			}
		}
	});
	
}

// 필요한가???? 채쿠
function getChannelInfo() {
	if(szDeviceIdentify == null) {
		console.log("getChannelInfo(), szDeviceIdentify is null ");
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
			console.log(szDeviceIdentify + " get analog channel success.");
		},
		error: function(oError) {
			console.log(szDeviceIdentify + " get analog channel failed ", oError.errorCode, oError.errorMsg);
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
//                oSel.append("<option value='" + id + "' bZero='false'>" + name + "</option>");
            });
            console.log(szDeviceIdentify + " get IP channel success.");
        },
        error: function (oError) {
            console.log(szDeviceIdentify + " get IP channel failed ", oError.errorCode, oError.errorMsg);
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
//                    oSel.append("<option value='" + id + "' bZero='true'>" + name + "</option>");
                }
            });
            console.log(szDeviceIdentify + " get zero-channel success.");
        },
        error: function (oError) {
            console.log(szDeviceIdentify + " get zero-channel failed ", oError.errorCode, oError.errorMsg);
        }
    });
}

//get port
function getDevicePort() {
    if (null == szDeviceIdentify) {
    	console.log("getDevicePort(), szDeviceIdentify is null ");
        return;
    }
    
    WebVideoCtrl.I_GetDevicePort(szDeviceIdentify, function (oPort) {
    	// success callback
    	 console.log(szDeviceIdentify + " get port success.");
    }, function (oError) {
    	// Error callback
    	var szInfo = "get port failed.";
        console.log(szDeviceIdentify + szInfo, oError.errorCode, oError.errorMsg);
    });
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
            
            console.log(szDeviceIdentify + " get deivce info success.");
            dialogVICCCTVAlert(app, dataManager.getString("Str_Success") , arrStr.join("") );
//            alert(arrStr.join(""));
        },
        error: function (oError) {
        	var message = " get device info failed. \n errorCode : " + oError.errorCode + "\n Msg:" + oError.errorMsg;
        	app.lookup("VICTCM_txt").value = message;
//        	alert(message);
        }
    });
}

// start real play
function StartRealPlay() {
	var g_iWndIndex = 0;
	var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
		iStreamType = 1,
		iChannelID = 1,
		bZeroChannel = false,
		szInfo = "";
	var realPlayConfig;
	var rtspPort = app.lookup("CCTVInfo").getValue("RTSPPort");
	
	if(rtspPort != 0) {
		realPlayConfig = {
	 		iStreamType: iStreamType,
            iChannelID: iChannelID,
            bZeroChannel: bZeroChannel,
            iPort : rtspPort,
            success: function () {
                szInfo = "start real play success.\nDouble-click to zoom in.";
                app.lookup("VICTCM_txt").value = szDeviceIdentify + " " + szInfo;
            },
            error: function (oError) {
            	app.lookup("VICTCM_txt").value = szDeviceIdentify + " start real play failed \n" + oError;
            }
		}
	} else {
		realPlayConfig = {
	 		iStreamType: iStreamType,
            iChannelID: iChannelID,
            bZeroChannel: bZeroChannel,
            success: function () {
                szInfo = "start real play success.";
                app.lookup("VICTCM_txt").value = szDeviceIdentify + " " + szInfo;
            },
            error: function (oError) {
            	app.lookup("VICTCM_txt").value = szDeviceIdentify + " start real play failed \n" + oError;
            }
		}
	}
	
	var startRealPlay = function () {
        WebVideoCtrl.I_StartRealPlay(szDeviceIdentify, realPlayConfig);
    };
   
    if (oWndInfo != null) {
        WebVideoCtrl.I_Stop({
            success: function () {
                startRealPlay();
            }
        });
    } else {
        startRealPlay();
    }
}



/*
 * 루트 컨테이너에서 before-unload 이벤트 발생 시 호출.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	StopRealPlay();
 	var element = document.getElementById('divPlugin2');
    if (element) {
        element.remove();  // DOM에서 해당 요소 제거
    }
}

function StopRealPlay() {
	WebVideoCtrl.I_Stop({
		success : function() {
			app.lookup("VICTCM_txt").value = szDeviceIdentify + " stop real play success. ";
//			console.log(szDeviceIdentify + " stop real play success. ");
		},
		error: function(oError) {
			app.lookup("VICTCM_txt").value = szDeviceIdentify + " stop real play failed. \n" + oError;
//			console.log(szDeviceIdentify + " stop real play failed. ", oError.errorCode, oError.errorMsg);
		}
	})
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
	StopRealPlay();
}


function initPlugin() {
	// plugin 성공하려면 div 태그가 필요하다. 추후에 이 div에 영상이 보이게 된다..
	
	// Init plugin parameters and insert the plugin
    WebVideoCtrl.I_InitPlugin({
        bWndFull: true, //Wether support doule clicking to switch the full-screen mode: it's supported by default; true:support, false:not support
        iWndowType: 1,
        cbSelWnd: function (xmlDoc) {
            g_iWndIndex = parseInt($(xmlDoc).find("SelectWnd").eq(0).text(), 10);
            var szInfo = "the selected window index: " + g_iWndIndex;
            console.log(szInfo);
        },
        cbDoubleClickWnd: function (iWndIndex, bFullScreen) {
            var szInfo = "present window number to zoom: " + iWndIndex;
            if (!bFullScreen) {            
                szInfo = "present window number to restore: " + iWndIndex;
            }
//            app.lookup("VICTCM_txt").value = szInfo;
        },
        cbInitPluginComplete: async function () {
		    try {
		    	app.lookup("VICTCM_txt").value = " Data Loading...";
		        await WebVideoCtrl.I_InsertOBJECTPlugin("divPlugin2");
		        var bFlag = await WebVideoCtrl.I_CheckPluginVersion();
		        if (bFlag) {
//		            alert("Detect the latest version, please double click HCWebSDKPlugin.exe to update!");
					app.lookup("VICTCM_txt").value = "Detect the latest version, please double click HCWebSDKPlugin.exe to update!";
		        }
		        console.log("cbInitPluginComplete 성공")
		        cctvLogin();
		    } catch (error) {
		    	app.lookup("VICTCM_txt").value = "The plugin initialization failed. Please confirm if the plugin has been installed; \nIf not installed, please double click on HCWebSDKPlugin.exe to install it!";
//		        alert("The plugin initialization failed. Please confirm if the plugin has been installed; If not installed, please double click on HCWebSDKPlugin.exe to install it!");
		    }
		}
    });
}







