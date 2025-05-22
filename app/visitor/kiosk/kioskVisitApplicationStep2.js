/************************************************
 * kioskVisitApplicationStep1.js
 * Created at 2023. 3. 6. ���� 2:41:47.
 *
 * @author MJY
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib = createComUtil(app);
var dateLib = cpr.core.Module.require("lib/DateLib");
var util = cpr.core.Module.require("lib/util");

var VMVAS2_ver = 0;
var VMVAS2_src = "";
var VMVAS2_convert = false;
var VMSRP_rotateAngle = 0;
var orientation;
var OEM_VERSION;

// 전시회용
var VMVAS3_ver = 0;
var VMVAS3_src = "";

var addFlag = false;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	
	VMVAS2_ver = localStorage.getItem("oem");
	VMVAS2_src = localStorage.getItem("src");
	var strStep1Data = localStorage.getItem("step1Data");
	var step1Data = JSON.parse(strStep1Data);
	var dmVisitInfo = app.lookup("VisitInfo");
	dmVisitInfo.build(step1Data.visitInfo);
	
	var strStep2Data = localStorage.getItem("step2Data");
	if(strStep2Data != null){
		var step2Data = JSON.parse(strStep2Data);
		var dsVisitorList = app.lookup("VisitorList");
		dsVisitorList.build(step2Data.visitorList);
	}
	
	
	
	OEM_VERSION = dataManager.getOemVersion();
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) { //현대 엠시트
		//app.lookup("op_companyRequired").value = "*";
		//app.lookup("op_carRequired").value = "*";
		app.lookup("op_birthRequired").value = "*";
		app.lookup("op_photoRequired").value = "*";
	}
	
	VMVAS3_ver = localStorage.getItem("oem");
	VMVAS3_src = localStorage.getItem("src");
	
	// 키오스크 플래그 , language 추가
	dmVisitInfo.setValue("KioskFlag", 1);
	dmVisitInfo.setValue("Language", localStorage.getItem("language"));
}

function isMobile() {
	var pc_device = "win16|win32|win64|mac|macintel";
	if (navigator.platform) {
		if (pc_device.indexOf(navigator.platform.toLowerCase()) < 0) {
			return true;
		}
	}
	return false;
}

// Canvas load
function onVMVAS2_shlCanvasLoad( /* cpr.events.CUIEvent */ e) {
	var content = e.content;
	content.innerHTML = "<canvas width=\"0px\" height=\"0px\" id=\"captureCanvas\"></canvas>";
}

// Camera load
function onVMVAS2_shlCameraLoad( /* cpr.events.CUIEvent */ e) {
	var content = e.content;
	content.innerHTML = "<input id=\"camera\" style=\"width:0px;visibility:hidden\" type=\"file\" accept=\"image/*\" capture=\"camera\"/>";
	content.addEventListener('change', onCameraChangeEvent);
}

function onCameraChangeEvent(e) {
	var file = e.target.files[0];
	var reader = new FileReader();
	reader.readAsDataURL(file);
	
	reader.onload = function() {
		var exif = EXIF.readFromBinaryFile(util.base64ToArrayBuffer(this.result));
		orientation = exif.Orientation;
		if (orientation == undefined) {
			orientation = "undefined";
		}
		
		if (exif.Model != null && (exif.Model.indexOf('SM-N97') > -1 || exif.Model.indexOf('SM-G97') > -1)) {
			VMVAS2_convert = true;
		}
		
		var tempImage = new Image();
		tempImage.src = reader.result;
		
		tempImage.onload = function() {
			VMSRP_rotateAngle = 0;
			
			var canvas = document.getElementById("captureCanvas");
			
			canvas.width = this.width
			canvas.height = this.height
			
			var step = 0;
			if (this.width > 1024) {
				step = 65;
			}
			
			while (true) {
				canvas.width = this.width * (100 - step) / 100;
				canvas.height = this.height * (100 - step) / 100;

				var imageSrc = util.processImage(canvas, this, orientation, 130000, VMVAS2_convert);
				if (imageSrc != null) {
					var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
					var dmVisitorInfo = app.lookup("VisitorInfo");
					dmVisitorInfo.setValue("Photo", imageData);
					
					var imgPhoto = app.lookup("VMVAS2_imgVisitorPhoto");
					imgPhoto.src = imageSrc;
					imgPhoto.redraw();
					break;
				}
				
				step += 1;
			}
		}
	}
	
	return true;
}

// 사진 캡쳐 클릭
function onVMVAS2_btnPhotoAddClick( /* cpr.events.CMouseEvent */ e) {
	if (isMobile() == true) {
		var ipbCapture = document.getElementById("camera");
		ipbCapture.click();
	} else {
		var dmVisitorInfo = app.lookup("VisitorInfo");
		
		if(validateVisitorInfo2(dmVisitorInfo)){  // 입력이 완전히 잘 됐을 경우만 촬영
			app.openDialog("app/visitor/kiosk/kioskUserPhotoRegist", {
				width: 810,
				height: 1100,
				modal : true
			}, function(dialog) {
				dialog.headerVisible = false;
				dialog.resizable = false;
				dialog.style.overlay.css("background-color", "black");
				dialog.style.overlay.css("opacity", "0.8");
	//			dialog.style.css("height", "auto");
				dialog.ready(function(dialogApp){
					dialogApp.getEmbeddedAppInstance().getContainer().getFirstChild().focus();
				});
				dialog.addEventListenerOnce("close", function(e) {
					var imageSrc = dialog.returnValue;
					if (imageSrc) {
						var dmVisitorInfo = app.lookup("VisitorInfo");
						dmVisitorInfo.setValue("Photo", imageSrc);
						
						var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
						var imgVisitor = app.lookup("VMVAS2_imgVisitorPhoto");
						imgVisitor.style.css({
							"background-image": 'url(data:image/jpg;base64,' + imageSrc + ')',
							"background-repeat": "none",
							"background-position": "center",
							"background-size": "cover"
						});
						imgVisitor.src = null;
						imgVisitor.redraw();
						addEvent();
						if(addFlag){
							visitApplicationEvent();
						}
					}
				})
			});
		}
	}
}

// 이미지 회전
function onVMVAS2_btnRotateLeftClick( /* cpr.events.CMouseEvent */ e) {
	var dmVisitorInfo = app.lookup("VisitorInfo");
	var imgData = dmVisitorInfo.getValue("Photo");
	
	var tempImage = new Image();
	tempImage.src = 'data:image/png;base64,' + imgData;
	
	tempImage.onload = function() {
		var canvas = document.getElementById("captureCanvas");

		canvas.width = this.width;
		canvas.height = this.height;
		// 130K 였는데 지금은 200K ~ 300K 가능
		var imageSrc = util.processImage(canvas, this, 8, 300000, VMVAS2_convert);

		if (imageSrc != null) {
			var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
			var dmVisitorInfo = app.lookup("VisitorInfo");
			dmVisitorInfo.setValue("Photo", imageData);
			
			var imgPhoto = app.lookup("VMVAS2_imgVisitorPhoto");
			imgPhoto.src = imageSrc;
			imgPhoto.redraw();
		}
	}
}

// 이미지 삭제
function onVMVAS2_btnVisitorPhotoDeleteClick( /* cpr.events.CMouseEvent */ e) {
	var dmVisitorInfo = app.lookup("VisitorInfo");
	dmVisitorInfo.setValue("Photo", "");
	var imgPhoto = app.lookup("VMVAS2_imgVisitorPhoto");
	imgPhoto.src = "/theme/images/visitor/white.png";
	imgPhoto.redraw();
}

function validateVisitorInfo(dmVisitorInfo) {
	var lastName = dmVisitorInfo.getValue("LastName");
	if (lastName == null || lastName.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitNameInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS2_ipbLastName").focus(true);
			});
		});
		
		return false;
	}
	var firstName = dmVisitorInfo.getValue("FirstName");
	if (firstName == null || firstName.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitNameInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS2_ipbFirstName").focus(true);
			});
		});
		return false;
	}
	//	var birthday = dmVisitorInfo.getValue("Birthday");
	//	if( birthday == null || birthday.length < 8 ){
	//		onAlert("Str_Warning","Str_WarnVisitBirthdayInvalid");
	//		return false;		
	//	}
	// 생일이 있을 경우, 유효성 확인
	var birthday = app.lookup("VMVAS2_dtiBirthday");
	var birthDate = birthday.dateValue;
	if (birthDate) {
		var now = new Date();
		if (birthDate > now) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitBirthdayInvalid2"), function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					app.lookup("VMVAS2_dtiBirthday").focus(true);
				});
			});
			return false;
		}
		
	}
	var mobile = dmVisitorInfo.getValue("Mobile");
	if (mobile == null || mobile.length < 8) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitMobileInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS2_ipbMobile").focus(true);
			});
		});
		return false;
	}
	var email = dmVisitorInfo.getValue("Email");
	if (email == null || email.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitEmailInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS2_ipbVisitorEmail").focus(true);
			});
		});
		return false;
	}
	// 이메일 유효성 검사
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (!re.test(email)) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitEmailInvalidReg"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS2_ipbVisitorEmail").focus(true);
			});
		});
		return false;
	}
	var company = dmVisitorInfo.getValue("Company");
	if (company == null || company.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "회사명을 입력해주세요.", function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS2_ipbCompany").focus(true);
			});
		});
		return false;
	}
	var photoReq = dmVisitorInfo.getValue("Photo");
	if (photoReq == null || photoReq.length == 0) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitPhotoInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				onVMVAS2_btnPhotoAddClick();
			});
		});
		return false;
	}
	//현대 엠시트	
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		var birthdayReq = dmVisitorInfo.getValue("Birthday");
		if (birthdayReq == null || birthdayReq.length < 8) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitBirthdayInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					app.lookup("VMVAS2_dtiBirthday").focus(true);
				});
			});
			return false;
		}
		
		// 현대 엠시트 사진 필수
		var photoReq = dmVisitorInfo.getValue("Photo");
		if (photoReq == null || photoReq.length == 0) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitPhotoInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					onVMVAS2_btnPhotoAddClick();
				});
			});
			return false;
		}
		
		
		//		var company = dmVisitorInfo.getValue("Company");
		//		if (company == null || company.length < 1) {
		//			dialogAlert(app, dataManager.getString("Str_Warning"), "회사명을 입력해주세요.", function( /*cpr.controls.Dialog*/ dialog) {
		//				dialog.addEventListenerOnce("close", function(e) {
		//					app.lookup("VMVAS2_ipbCompany").focus(true);
		//				});
		//			});
		//			return false;
		//		}
		//		var carNumber = dmVisitorInfo.getValue("CarNumber");
		//		if (carNumber == null || carNumber.length < 1) {
		//			dialogAlert(app, dataManager.getString("Str_Warning"), "차량 번호를 입력해주세요.", function( /*cpr.controls.Dialog*/ dialog) {
		//				dialog.addEventListenerOnce("close", function(e) {
		//					app.lookup("VMVAS2_ipbCarNumber").focus(true);
		//				});
		//			});
		//			return false;
		//		}
	}
	return true;
}

// 방문자 추가
function onVMVAS2_btnVisitorAddClick( /* cpr.events.CMouseEvent */ e) {
	var dmVisitorInfo = app.lookup("VisitorInfo");
	
	app.lookup("VMVAS2_ipbVisitorEmail").value = "union@union.com";
	app.lookup("VMVAS2_ipbCompany").value = "UnionCompany";
	
	if (validateVisitorInfo(dmVisitorInfo) == false) {
		return;
	}
	var dsVisitorList = app.lookup("VisitorList");
	
	var count = dsVisitorList.getRowCount();
	for( var i = 0; i<count ; i++){
		if(dsVisitorList.getValue(i, "Mobile")==dmVisitorInfo.getValue("Mobile")) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitMobileDuplication"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS2_ipbMobile").focus(true);
			});
		});
			return false;
		}
	}
	dsVisitorList.addRowData(dmVisitorInfo.getDatas());
	dsVisitorList.commit();
}

// 방문자 삭제
function onVMVAS2_btnVisitorDeleteClick( /* cpr.events.CMouseEvent */ e) {
	var vMVAP_btnVisitorDelete = e.control;
	var grdVisitorList = app.lookup("VMVAS2_grdVisitorList");
	var indices = grdVisitorList.getCheckRowIndices();
	for (var i = indices.length; i > 0; i--) {
		grdVisitorList.deleteRow(indices[i - 1]);
	}
	grdVisitorList.commitData();
}




/*
 * 버튼(VMVAS2_btnPrev)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMVAS2_btnPrevClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vMVAS2_btnPrev = e.control;
	
	cpr.core.App.load("app/visitor/kiosk/kioskVisitApplicationStep1", function(newapp){
		app.close();
		var instance = newapp.createNewInstance().run();
	});
}



/*
 * 버튼(VMVAS2_btnNext)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMVAS2_btnNextClick2(/* cpr.events.CMouseEvent */ e){
	var dsVisitorList = app.lookup("VisitorList");
	if (dsVisitorList.getRowCount() < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitVisitorNotRegistered"));
		return false
	}
	
	var dmVisitInfo = app.lookup("VisitInfo");
	var dsVisitorList = app.lookup("VisitorList");
	
	var sms_postVisitApplication = app.lookup("sms_postVisitApplication");
	sms_postVisitApplication.send();
	
//	localStorage.setItem("step2Data", JSON.stringify({
//		"visitInfo": dmVisitInfo.getDatas(),
//		"visitorList": dsVisitorList.getRowDataRanged()
//	}));
//	
//	cpr.core.App.load("app/visitor/kiosk/kioskVisitApplicationStep3", function(newapp) {
//		app.close();
//		var instance = newapp.createNewInstance().run();
//	});
	
}


/*
 * 아웃풋(VMVAS2_btnHome)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMVAS2_btnHomeClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var vMVAS2_btnHome = e.control;
	removeStepData();
	cpr.core.App.load("app/visitor/kiosk/kioskVisitorLogin", function(newapp){
		app.close();
		var instance = newapp.createNewInstance().run();
	});
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postVisitApplicationSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_postVisitApplication = e.control;
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
					
					cpr.core.App.load("app/visitor/kiosk/kioskVisitorLogin", function(newapp) {
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
					
					cpr.core.App.load("app/visitor/kiosk/kioskVisitorLogin", function(newapp) {
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

function addEvent(){
	var dmVisitorInfo = app.lookup("VisitorInfo");
	
	app.lookup("VMVAS2_ipbVisitorEmail").value = "union@union.com";
	app.lookup("VMVAS2_ipbCompany").value = "UnionCompany";
	
	if (validateVisitorInfo(dmVisitorInfo) == false) {
		addFlag = false;
		return;
	}
	
	var dsVisitorList = app.lookup("VisitorList");
	var count = dsVisitorList.getRowCount();
	for( var i = 0; i<count ; i++){
		if(dsVisitorList.getValue(i, "Mobile")==dmVisitorInfo.getValue("Mobile")) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitMobileDuplication"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS2_ipbMobile").focus(true);
			});
		});
			return false;
		}
	}
	dsVisitorList.addRowData(dmVisitorInfo.getDatas());
	dsVisitorList.commit();
	addFlag = true;
}

function visitApplicationEvent() {
	var dsVisitorList = app.lookup("VisitorList");
	if (dsVisitorList.getRowCount() < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitVisitorNotRegistered"));
		return false
	}
	
	var dmVisitInfo = app.lookup("VisitInfo");
	var dsVisitorList = app.lookup("VisitorList");
	
	var sms_postVisitApplication = app.lookup("sms_postVisitApplication");
	sms_postVisitApplication.send();
}


function validateVisitorInfo2(dmVisitorInfo) {
	app.lookup("VMVAS2_ipbVisitorEmail").value = "union@union.com";
	app.lookup("VMVAS2_ipbCompany").value = "UnionCompany";
	
	var lastName = dmVisitorInfo.getValue("LastName");
	if (lastName == null || lastName.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitNameInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS2_ipbLastName").focus(true);
			});
		});
		
		return false;
	}
	var firstName = dmVisitorInfo.getValue("FirstName");
	if (firstName == null || firstName.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitNameInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS2_ipbFirstName").focus(true);
			});
		});
		return false;
	}
	//	var birthday = dmVisitorInfo.getValue("Birthday");
	//	if( birthday == null || birthday.length < 8 ){
	//		onAlert("Str_Warning","Str_WarnVisitBirthdayInvalid");
	//		return false;		
	//	}
	// 생일이 있을 경우, 유효성 확인
	var birthday = app.lookup("VMVAS2_dtiBirthday");
	var birthDate = birthday.dateValue;
	if (birthDate) {
		var now = new Date();
		if (birthDate > now) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitBirthdayInvalid2"), function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					app.lookup("VMVAS2_dtiBirthday").focus(true);
				});
			});
			return false;
		}
		
	}
	var mobile = dmVisitorInfo.getValue("Mobile");
	if (mobile == null || mobile.length < 8) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitMobileInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS2_ipbMobile").focus(true);
			});
		});
		return false;
	}
	var email = dmVisitorInfo.getValue("Email");
	if (email == null || email.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitEmailInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS2_ipbVisitorEmail").focus(true);
			});
		});
		return false;
	}
	// 이메일 유효성 검사
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (!re.test(email)) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitEmailInvalidReg"), function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS2_ipbVisitorEmail").focus(true);
			});
		});
		return false;
	}
	var company = dmVisitorInfo.getValue("Company");
	if (company == null || company.length < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), "회사명을 입력해주세요.", function( /*cpr.controls.Dialog*/ dialog) {
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VMVAS2_ipbCompany").focus(true);
			});
		});
		return false;
	}
//	var photoReq = dmVisitorInfo.getValue("Photo");
//	if (photoReq == null || photoReq.length == 0) {
//		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitPhotoInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
//			dialog.addEventListenerOnce("close", function(e) {
//				onVMVAS2_btnPhotoAddClick();
//			});
//		});
//		return false;
//	}
	//현대 엠시트	
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) {
		var birthdayReq = dmVisitorInfo.getValue("Birthday");
		if (birthdayReq == null || birthdayReq.length < 8) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitBirthdayInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					app.lookup("VMVAS2_dtiBirthday").focus(true);
				});
			});
			return false;
		}
		
		// 현대 엠시트 사진 필수
		var photoReq = dmVisitorInfo.getValue("Photo");
		if (photoReq == null || photoReq.length == 0) {
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitPhotoInvalid"), function( /*cpr.controls.Dialog*/ dialog) {
				dialog.addEventListenerOnce("close", function(e) {
					onVMVAS2_btnPhotoAddClick();
				});
			});
			return false;
		}
		
		
		//		var company = dmVisitorInfo.getValue("Company");
		//		if (company == null || company.length < 1) {
		//			dialogAlert(app, dataManager.getString("Str_Warning"), "회사명을 입력해주세요.", function( /*cpr.controls.Dialog*/ dialog) {
		//				dialog.addEventListenerOnce("close", function(e) {
		//					app.lookup("VMVAS2_ipbCompany").focus(true);
		//				});
		//			});
		//			return false;
		//		}
		//		var carNumber = dmVisitorInfo.getValue("CarNumber");
		//		if (carNumber == null || carNumber.length < 1) {
		//			dialogAlert(app, dataManager.getString("Str_Warning"), "차량 번호를 입력해주세요.", function( /*cpr.controls.Dialog*/ dialog) {
		//				dialog.addEventListenerOnce("close", function(e) {
		//					app.lookup("VMVAS2_ipbCarNumber").focus(true);
		//				});
		//			});
		//			return false;
		//		}
	}
	return true;
}

