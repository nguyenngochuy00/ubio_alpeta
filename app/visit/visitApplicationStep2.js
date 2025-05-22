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

var VMVAS2_ver = 0;
var VMVAS2_src = "";
var VMVAS2_convert = false;
var VMSRP_rotateAngle = 0;
var orientation;
var OEM_VERSION;

function onBodyLoad( /* cpr.events.CEvent */ e) {
	dataManager = getDataManager();
	
	VMVAS2_ver = localStorage.getItem("oem");
	VMVAS2_src = localStorage.getItem("src");
	var strStep1Data = localStorage.getItem("step1Data");
	var step1Data = JSON.parse(strStep1Data);
	var dmVisitInfo = app.lookup("VisitInfo");
	dmVisitInfo.build(step1Data.visitInfo);
	OEM_VERSION = dataManager.getOemVersion();
	if (OEM_VERSION == OEM_HYUNDAI_MSEAT) { //현대 엠시트
		//app.lookup("op_companyRequired").value = "*";
		//app.lookup("op_carRequired").value = "*";
		app.lookup("op_birthRequired").value = "*";
		app.lookup("op_photoRequired").value = "*";
	}
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
		
		// 방문객 등록 시 화면이 돌아가는 증상 수정 - otk
//		if (exif.Model != null && (exif.Model.indexOf('SM-N97') > -1 || exif.Model.indexOf('SM-G97') > -1)) {
//			VMVAS2_convert = true;
//		}
		VMVAS2_convert = true;
		
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
					var sms_postCheckToUsePhoto = app.lookup("sms_CheckUseUserPhoto");		// 모바일 등록시 퀄리티 체크
					comLib.showLoadMask("pro", getDataManager().getString("Str_VisitorPhotoQualityChecking"), "", 0);
					sms_postCheckToUsePhoto.send();
					break;
				}
				
				/*
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
				*/
				
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
		app.openDialog("app/visit/userPhotoRegist", {
			width: 430,
			height: 440
		}, function(dialog) {
			dialog.headerVisible = false;
			dialog.resizable = false;
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
				} else {
					onVMVAS2_btnVisitorPhotoDeleteClick();
				}
			})
		});
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

// 다음 클릭
function onVMVAS2_btnNextClick( /* cpr.events.CMouseEvent */ e) {
	var dsVisitorList = app.lookup("VisitorList");
	if (dsVisitorList.getRowCount() < 1) {
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitVisitorNotRegistered"));
		return false
	}
	
	var dmVisitInfo = app.lookup("VisitInfo");
	var dsVisitorList = app.lookup("VisitorList");
	localStorage.setItem("step2Data", JSON.stringify({
		"visitInfo": dmVisitInfo.getDatas(),
		"visitorList": dsVisitorList.getRowDataRanged()
	}));
	cpr.core.App.load("app/visit/visitApplicationStep3", function(newapp) {
		app.close();
		var instance = newapp.createNewInstance().run();
	});
}

// 모바일 사진 등록시 퀄리티 체크
function onSms_CheckUseUserPhotoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	var resultCode = dmResult.getValue("ResultCode");
	if ( resultCode == COMERROR_NONE) {
		var imgPhoto = app.lookup("VMVAS2_imgVisitorPhoto");
		var imageSrc = "data:image/png;base64," + app.lookup("VisitorInfo").getValue("Photo");
		imgPhoto.src = imageSrc;
		imgPhoto.redraw();
	} else {
		onVMVAS2_btnVisitorPhotoDeleteClick();
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_CheckUseUserPhotoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_CheckUseUserPhotoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode",COMERROR_NET_TIMEOUT);
}
