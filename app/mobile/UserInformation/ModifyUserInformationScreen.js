/************************************************
 * ModifyUserInformationScreen.js
 * Created at Sep 2, 2020 3:47:42 PM.
 *
 * @author Sam
 ************************************************/

var auth = cpr.core.Module.require("lib/Auth");
var lodashModule = cpr.core.Module.require("lib/Lodash");
var lodash = lodashModule._;
var config = getConfig();
var dataManager = getDataManager();
var DEFAULT_PICTURE = "/theme/images/mobile/common_img_profile_blank_gray_human.png";
var submittingPicture = false;
var isPictureChanged = false;

/*
 * Triggered when click event is fired from Image.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	app.lookup("wrongPasswordMessage").visible = false;
	var dialogProp = {
		top: 200,
		headerVisible : false,
		width: 320, 
		modal: true,
		resizable: false
	};
	app.openDialog("app/mobile/UserInformation/TakePhotoPopup", dialogProp, function (popup) {
		popup.addEventListener("TakePicture", function(e) {
			if (window.webkit) {
				window.webkit.messageHandlers.userImageMessageHandler.postMessage(JSON.stringify({
					event: "REQUEST_ACCESS_CAMERA",
				}));
			} else if (window.userImageMessageHandler) {
				window.userImageMessageHandler.postMessage(JSON.stringify({
					event: "REQUEST_ACCESS_CAMERA",
				}));
			} else {
				app.lookup("USINB_ImageFileInput").openFileChooser();
			}
		    
		    popup.close();
		});
		
		popup.addEventListener("OpenGallery", function() {
			if (window.webkit) {
				window.webkit.messageHandlers.userImageMessageHandler.postMessage(JSON.stringify({
					event: "REQUEST_ACCESS_GALLERY",
				}));
			} else if (window.userImageMessageHandler) {
				window.userImageMessageHandler.postMessage(JSON.stringify({
					event: "REQUEST_ACCESS_GALLERY",
				}));
			} else {
				app.lookup("USINB_ImageFileInput").openFileChooser();
			}	
			
			popup.close();
		});
		
		popup.addEventListener("DeletePicture", function() {
			app.lookup("picture").src = DEFAULT_PICTURE;
			isPictureChanged = true;
			popup.close()
		});
	});
}

function submitChangePassword() {
	var password = lodash.trim(app.lookup("userInfoPassword").value);
	var confirmPassword = lodash.trim(app.lookup("userInfoConfirmPassword").value);
//	var name = lodash.trim(app.lookup("userInfoName").value);
//	var group = lodash.trim(app.lookup("group").value);
//	var position = lodash.trim(app.lookup("position").value);
	var UserInfo = app.lookup("UserInfo");	
	if ( password || confirmPassword) {
		if (password !== confirmPassword) {
			app.lookup("wrongPasswordMessage").visible = true;
			app.lookup("messageContent").value = "패스워드가 일치하지 않습니다." + "\n"+ "다시 입력해주세요.";
			app.lookup("appContent").scrollTo(0, "100px");
			if (password.length < 4 || confirmPassword.length < 4 ) {
				app.lookup("messageContent").value = "패스워드는 4자리 이상으로 설정 가능합니다.";
			}
			return;
		}
		app.lookup("messageContent").value = "패스워드 변경이 완료되었습니다.";
//		UserInfo.setValue("Name", name);
//		UserInfo.setValue("PositionCode", position);
//		UserInfo.setValue("GroupCode", group);
		UserInfo.setValue("LoginPW", password);
		UserInfo.setValue("Password", password);
	}
	
	if (isPictureChanged && app.lookup("picture").src === DEFAULT_PICTURE) {
		UserInfo.setValue("Picture", "");
	}
	
	if (isPictureChanged) {
		UserInfo.setValue("Picture", app.lookup("picture").value.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""));	
	} 

	var updateUserInfoSub = app.lookup("updateUserInfoSub");
	updateUserInfoSub.setRequestActionUrl(config.apiHostResolution()+ 
	updateUserInfoSub.action.replace("{id}", parseInt(UserInfo.getValue("ID"), 10)));
	updateUserInfoSub.send();
	
	var pictureInfo = app.lookup("PictureInfo");
	if (isPictureChanged && app.lookup("picture").src === DEFAULT_PICTURE) {
		pictureInfo.setValue("ImageType", "");
		pictureInfo.setValue("ImageData", "");
		pictureInfo.setValue("Thumbnail", "");
		var smsUserPhotoUpdate = app.lookup("smsUserPhotoUpdate");
		smsUserPhotoUpdate.setRequestActionUrl(config.apiHostResolution()+ 
		smsUserPhotoUpdate.action.replace("{id}", parseInt(UserInfo.getValue("ID"), 10)));
		smsUserPhotoUpdate.send();
		return;
	}
	
	if (isPictureChanged) {
		var userPicture = app.lookup("picture");
		var imageData = userPicture.src.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
		var thumbnailImg = app.lookup("thumbnail");
		var imageThumbnailData = thumbnailImg.src.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
		var pictureInfo = app.lookup("PictureInfo");
		pictureInfo.setValue("ImageType", "jpeg");
		pictureInfo.setValue("ImageData", imageData);
		pictureInfo.setValue("Thumbnail", imageThumbnailData);
		var smsUserPhotoUpdate = app.lookup("smsUserPhotoUpdate");
		smsUserPhotoUpdate.setRequestActionUrl(config.apiHostResolution()+ 
		smsUserPhotoUpdate.action.replace("{id}", parseInt(UserInfo.getValue("ID"), 10)));
		smsUserPhotoUpdate.send();
	}
}

function handleImageSelected() {
	isPictureChanged = true;
	var imagedata = "data:image/png;base64," + event.detail.image;	
	var userPicture = app.lookup("picture");
    resizeImage(userPicture, imagedata, 160,160);       
    var thumbnailImg = app.lookup("thumbnail"); 
    resizeImage(thumbnailImg, imagedata, 80,80); 
    
    if (window.webkit) {
		window.webkit.messageHandlers.userImageMessageHandler.postMessage(JSON.stringify({
			event: "IMAGE_RECEIVED",
		}));
	} else if (window.userImageMessageHandler) {
		window.userImageMessageHandler.postMessage(JSON.stringify({
			event: "IMAGE_RECEIVED",
		}));
	}
}

function handleImageCancel() {
	console.log("Image selected cancel");
}

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("header").setAppProperties({
		pageName: cpr.I18N.INSTANCE.message("Str_Modify_User_Info")
	});
	window.addEventListener("UserImageSelected", handleImageSelected, true);
	
	window.addEventListener("UserImageCancel", handleImageCancel, true);
		
	app.lookup("picture").src === DEFAULT_PICTURE;
	var UserInfo = app.lookup("UserInfo");
	var PositionList = app.lookup("PositionList");
//	dataManager.getPositionList().copyToDataSet(PositionList);
	renderData(UserInfo, PositionList)
	dataManager.getUserInfo().copyToDataMap(UserInfo);
	console.log(app.lookup("UserInfo").getValue("ID"));
}

function renderData(data, positionList) {
	app.lookup("userInfoName").value = data.getValue("Name");
	if (app.lookup("UserInfo").getValue("Picture")) {
		app.lookup("picture").src = "data:image/png;base64," + app.lookup("UserInfo").getValue("Picture");
		app.lookup("picture").style.css({
			"border-radius": "5px"
		})
		app.lookup("thumbnail").src = "data:image/png;base64," + app.lookup("UserInfo").getValue("Picture");
	}
//	if (positionList) {
//		var position = positionList.findAllRow("PositionID===" + data.getValue("PositionCode"))[0];
//		if (position) {
//			app.lookup("position").value = position.getValue("Name");
//		}
//	}
//	var group = dataManager.getGroup().findAllRow("GroupID===" + app.lookup("UserInfo").getValue("GroupCode"));
//	if (group && group[0]) {
//		app.lookup("group").value = group[0].getValue("Name");
//	}
}


/*
 * Triggered when click event is fired from Output "저장"(confirmBtn).
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onConfirmBtnClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var confirmBtn = e.control;
	var password = lodash.trim(app.lookup("userInfoPassword").value);
	var confirmPassword = lodash.trim(app.lookup("userInfoConfirmPassword").value);
	if (auth.isAdmin()) {
		if (password.length < 4 || confirmPassword.length < 4) {
				app.lookup("messageContent").value = "패스워드는 4자리 이상으로 설정 가능합니다."
				return;
			}
		submitChangePassword();
	} else {
		if (password.length < 4 || confirmPassword.length < 4) {
				app.lookup("messageContent").value = "패스워드는 4자리 이상으로 설정 가능합니다."
				return;
			}
		submitChangePasswordForUser();
	}
}

function submitChangePasswordForUser() {
	var password = lodash.trim(app.lookup("userInfoPassword").value);
	var confirmPassword = lodash.trim(app.lookup("userInfoConfirmPassword").value);
//	var name = lodash.trim(app.lookup("userInfoName").value);
//	var group = lodash.trim(app.lookup("group").value);
//	var position = lodash.trim(app.lookup("position").value);
	var UserInfo = app.lookup("UserInfo");	
	var UserId = UserInfo.getValue("ID");
	if ( password || confirmPassword) {
		if (password !== confirmPassword) {
			app.lookup("wrongPasswordMessage").visible = true;
			app.lookup("messageContent").value = "패스워드가 일치하지 않습니다." + "\n"+ "다시 입력해주세요.";
			app.lookup("appContent").scrollTo(0, "100px");
			if (password.length < 4 || confirmPassword.length < 4) {
				app.lookup("messageContent").value = "패스워드는 4자리 이상으로 설정 가능합니다."
			}
			return;
		}
		app.lookup("messageContent").value = "패스워드 변경이 완료되었습니다.";
		
		var UserPasswordInfo = app.lookup("UserPasswordInfo");
		UserPasswordInfo.setValue("CurrentPassword", app.getAppProperty("currentPassword"));
		UserPasswordInfo.setValue("NewPassword", password);
		UserPasswordInfo.setValue("ID", UserId);
		
		var updateLoginPasswordSub = app.lookup("updateLoginPasswordSub");
		updateLoginPasswordSub.setRequestActionUrl(config.apiHostResolution() + updateLoginPasswordSub.action.replace("{id}", userId));
		updateLoginPasswordSub.send();
	}
	
	var pictureInfo = app.lookup("PictureInfo");
	if (isPictureChanged && app.lookup("picture").src === DEFAULT_PICTURE) {
		pictureInfo.setValue("ImageType", "");
		pictureInfo.setValue("ImageData", "");
		pictureInfo.setValue("Thumbnail", "");
		var smsUserPhotoUpdate = app.lookup("smsUserPhotoUpdate");
		smsUserPhotoUpdate.setRequestActionUrl(config.apiHost + smsUserPhotoUpdate.action.replace("{id}", UserId));
		smsUserPhotoUpdate.send();
		return;
	}
	
	if (isPictureChanged) {
		var userPicture = app.lookup("picture");
		var imageData = userPicture.src.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
		var thumbnailImg = app.lookup("thumbnail");
		var imageThumbnailData = thumbnailImg.src.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
		var pictureInfo = app.lookup("PictureInfo");
		pictureInfo.setValue("ImageType", "jpeg");
		pictureInfo.setValue("ImageData", imageData);
		pictureInfo.setValue("Thumbnail", imageThumbnailData);
		var smsUserPhotoUpdate = app.lookup("smsUserPhotoUpdate");
		smsUserPhotoUpdate.setRequestActionUrl(config.apiHost + smsUserPhotoUpdate.action.replace("{id}", UserId));
		smsUserPhotoUpdate.send();
	}
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onUpdateUserInfoSubSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var updateUserInfoSub = e.control;
	var password = app.lookup("userInfoPassword").value;
	var confirmPassword = app.lookup("userInfoConfirmPassword").value;
	var result = app.lookup("Result");
	handleUnauthorize(app);
	
	if (result.getValue("ResultCode") === 16777242) {
		app.lookup("wrongPasswordMessage").visible = true;
		if (password.length < 4 || confirmPassword.length < 4) {
				app.lookup("messageContent").value = "패스워드는 4자리 이상으로 설정 가능합니다."
				return;
			}
		app.lookup("messageContent").value = "현재 암호와 동일한 암호가 사용되었습니다."; // The same password was already used as the current password.
		app.lookup("appContent").scrollTo(0, "100px");
		return;
	}
	app.lookup("messageContent").value = "패스워드 변경이 완료되었습니다.";
}


/*
 * Triggered when init event is fired from Body.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	auth.isAuthenticated(app);
}


/*
 * Triggered when focus event is fired from InputBox.
 * 컨트롤이 포커스를 획득한 후 발생하는 이벤트.
 */
function onUserInfoPasswordFocus(/* cpr.events.CFocusEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var userInfoPassword = e.control;
	app.lookup("wrongPasswordMessage").visible = false;
}


/*
 * Triggered when focus event is fired from InputBox.
 * 컨트롤이 포커스를 획득한 후 발생하는 이벤트.
 */
function onUserInfoConfirmPasswordFocus(/* cpr.events.CFocusEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var userInfoConfirmPassword = e.control;
	app.lookup("wrongPasswordMessage").visible = false;
}


/*
 * Triggered when keydown event is fired from InputBox.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onUserInfoPasswordKeydown(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var userInfoPassword = e.control;
	if (e.key === "Enter" && lodash.trim(userInfoPassword.value)) {
		userInfoPassword.blur();
		app.lookup("userInfoConfirmPassword").focus();
	}
	
}


/*
 * Triggered when keydown event is fired from InputBox.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onUserInfoConfirmPasswordKeydown(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var userInfoConfirmPassword = e.control;
	if (e.key === "Enter" && lodash.trim(userInfoConfirmPassword.value)) {
		userInfoConfirmPassword.blur();
		submitChangePassword();
	}
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onUpdateUserInfoSubSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var updateUserInfoSub = e.control;
	auth.logout(app);
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onUpdateUserInfoSubBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var updateUserInfoSub = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onUpdateUserInfoSubReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var updateUserInfoSub = e.control;
	hideLoading();
}

// 이미지 리사이징 함수
function resizeImage(ctrl,imageData,width,height){

	var tempImage = new Image(); 
    tempImage.src = imageData; 
    tempImage.onload = function () {    
    	var canvas = document.createElement('canvas');
    	var canvasContext = canvas.getContext("2d");
    	canvas.width = width; 
    	canvas.height = height;
    	canvasContext.drawImage(this, 0, 0, width, height);
		ctrl.src = canvas.toDataURL("image/jpeg");
	}
}

/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onHeaderLeftBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.Header
	 */
	var header = e.control;
	cpr.core.App.load("app/mobile/UserInformation/UserInfomationConfirmPassword", function(loadedApp){
		loadedApp.createNewInstance().run(null, function(createdApp) {
			createdApp.getContainer().style.animateFrom({	
				"transform": "translateX(-100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
			app.close()
		})
	});
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsUserPhotoUpdateBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserPhotoUpdate = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsUserPhotoUpdateReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserPhotoUpdate = e.control;
	hideLoading();
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsUserPhotoUpdateSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserPhotoUpdate = e.control;
	var result = app.lookup("Result");
	handleUnauthorize(app);
	if (result.getValue("ResultCode") === 0) {
		cpr.core.App.load("app/mobile/UserInformation/UserInformation", function(loadedApp){
			loadedApp.createNewInstance().run(null, function(createdApp) {
				createdApp.getContainer().style.animateFrom({	
					"transform": "translateX(-100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			});
		});
		return;
	}
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onUpdateLoginPasswordSubSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var updateLoginPasswordSub = e.control;
	var result = app.lookup("Result");
	var password = app.lookup("userInfoPassword").value;
	var confirmPassword = app.lookup("userInfoConfirmPassword").value;
	handleUnauthorize(app);
	if (password.length < 4 || confirmPassword.length < 4) {
			app.lookup("messageContent").value = "패스워드는 4자리 이상으로 설정 가능합니다."
			return;
		}
	if (result.getValue("ResultCode") === 0 && !isPictureChanged) {
		cpr.core.App.load("app/mobile/UserInformation/UserInformation", function(loadedApp){
			loadedApp.createNewInstance().run(null, function(createdApp) {
				createdApp.getContainer().style.animateFrom({	
					"transform": "translateX(-100%)",
					"opacity": "0"
				}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
				app.close();
			});
		});
		return;
	}
	app.lookup("messageContent").value = "패스워드 변경이 완료되었습니다.";
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onUpdateLoginPasswordSubBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var updateLoginPasswordSub = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onUpdateLoginPasswordSubReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var updateLoginPasswordSub = e.control;
	hideLoading();
}


/*
 * Triggered when before-unload event is fired from Body.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	console.log("unload");
	window.removeEventListener("UserImageSelected", handleImageSelected, true)
	window.removeEventListener("UserImageCancel", handleImageCancel, true)
}


/*
 * Triggered when value-change event is fired from FileInput.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onUSINB_ImageFileInputValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.FileInput
	 */
	var uSINB_ImageFileInput = e.control;
	isPictureChanged = true;
	var fileTest = e.control;
	var pictureFile = app.lookup("USINB_ImageFileInput");	
    // 읽기
    var reader = new FileReader();
    console.log(pictureFile.files[0]);
    reader.readAsDataURL(pictureFile.files[0]);

    //로드 한 후
    reader.onload = function  () {
    	var userPicture = app.lookup("picture");
        resizeImage(userPicture, reader.result, 160,160);       
        var thumbnailImg = app.lookup("thumbnail"); 
        resizeImage(thumbnailImg, reader.result, 80,80);        
    }; 
}
