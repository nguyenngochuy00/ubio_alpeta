/************************************************
 * UserInformation.js
 * Created at Aug 28, 2020 2:27:50 PM.
 *
 * @author EVN0025
 ************************************************/

var auth = cpr.core.Module.require("lib/Auth");
var utils = cpr.core.Module.require("lib/Utils");
var lodashModule = cpr.core.Module.require("lib/Lodash");
var lodash = lodashModule._;
var dataManager = getDataManager();

function IsExistAuthType(authType){
	var userInfo = app.lookup("UserInfo");
	var AuthType = userInfo.getValue("AuthInfo").split(',');
	for( var idx=0; idx < 7; idx++ ){		
		var checkData = parseInt(AuthType[idx],10);
		if( checkData == authType ){
			return true;
		}		
	}
	return false;
}

function buildAuthType(authType){
	var andAuth = [];
	for( var idx=0; idx < authType.length; idx++ ){		
		var authType = parseInt(authType[idx], 10);
		if (getAuthTypeString(authType)) {
			andAuth.push(getAuthTypeString(authType));
		}		
	}
	return andAuth.join(", ");
}

/*
 * Triggered when click event is fired from Output "Output".
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOutputClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var output = e.control;
	var dialogProp = {
		top: 200,
		headerVisible : false,
		width: 320, 
		modal: true,
		resizable: false
	};
	app.openDialog("app/mobile/dialog/Logout", dialogProp);
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsUserInfoReqSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfoReq = e.control;
	handleUnauthorize(app);
	var dataManager = getDataManager();
	var userInfo = app.lookup("UserInfo");
	
	// 사용자 정보 요청 결과
	var result = app.lookup("Result");
	var resultCode = result.getValue("ResultCode");
	if( resultCode == 0 ){
		var dataManager = getDataManager();
		dataManager.setUserInfo(userInfo);
		renderData(userInfo.getDatas(), app.lookup("PositionList"));
	}
}

function renderData(data, positionList) {
	var userData = data;
	var AuthType = userData.AuthInfo.split(',');
	var andAuth = [];
	for( var idx=0; idx < AuthType[7]; idx++ ){		
		var authType = parseInt(AuthType[idx],10);
		andAuth.push(getAuthTypeString( parseInt(AuthType[idx],10)));	
	}
	andAuth = lodash.without(andAuth, "")
	var orAuth = [];	
	for( var idx=AuthType[7]; idx< AuthType.length-1; idx++ ){		
		orAuth.push(getAuthTypeString( parseInt(AuthType[idx],10)));
	}
	orAuth = lodash.without(orAuth, "")
	app.lookup("userInfoName").value = userData.Name;
	app.lookup("userUniqueId").value = userData.UniqueID;
	
	if (userData.PositionCode && userData.PositionCode !== 0) {
		var positionFounded = positionList.findAllRow("PositionID===" + userData.PositionCode);
		if (positionFounded && positionFounded[0]) {
			app.lookup("userInfoPosition").value = positionFounded[0].getValue("Name");
		}
	}
	var group = dataManager.getGroup().findAllRow("GroupID===" + userData.GroupCode);
	if (group && group[0]) {
		app.lookup("group").value = group[0].getValue("Name");
	}
	
	app.lookup("userId").value = userData.ID;
	app.lookup("userCreationDate").value = userData.RegistDate ? moment(userData.RegistDate, "YYYY-MM-DD HH:mm:ss")
	.format("YYYY.MM.DD HH:mm:ss") : "";
	//@ todo
	//app.lookup("userChangeDate").value = userData.RegistDate; // need verify
	// authentication information
	app.lookup("userAuthInfoMandatory").value = andAuth.join(", ");
	app.lookup("userAuthInfoOptional").value = orAuth.join(", ");
	app.lookup("userAuthority").value = utils.getAuthority(userData.Privilege);
	app.lookup("useTypeOfUser").value = utils.getTypeOfUser(userData.UserType);
	var usePeriodFlag = app.lookup("UserInfo").getValue("UsePeriodFlag");
	switch(usePeriodFlag){
		case 1 : 
			app.lookup("userPeriodOfUse").value = dataManager.getString("Str_UsePeriodAllowed");
			app.lookup("userRegistDate").value = userData.RegistDate ? moment(userData.RegistDate, "YYYY-MM-DD HH:mm:ss").format("YYYY.MM.DD") : "" ;
			app.lookup("userExpireDate").value = userData.ExpireDate ? moment(userData.ExpireDate, "YYYY-MM-DD HH:mm:ss").format("YYYY.MM.DD") : "" ;	
			break;
		case 2 :
			app.lookup("userPeriodOfUse").value = dataManager.getString("Str_UsePeriodLimit");
			app.lookup("userRegistDate").value = userData.RegistDate ? moment(userData.RegistDate, "YYYY-MM-DD HH:mm:ss").format("YYYY.MM.DD") : "" ;
			app.lookup("userExpireDate").value = userData.ExpireDate ? moment(userData.ExpireDate, "YYYY-MM-DD HH:mm:ss").format("YYYY.MM.DD") : "" ;	
			break;
		default:
			app.lookup("userPeriodOfUse").value = dataManager.getString("Str_UsePeriodNone");
			app.lookup("userRegistDate").value = ("---");
			app.lookup("userExpireDate").value = ("---");
			break;
	}
	if (app.lookup("UserInfo").getValue("Picture")) {
		app.lookup("picture").src = "data:image/png;base64," + app.lookup("UserInfo").getValue("Picture");
		app.lookup("picture").style.css({
			"border-radius": "5px"
		})
	}
}

/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("header").setAppProperties({
		pageName: cpr.I18N.INSTANCE.message("Str_UserInfo")
	});
	var dataManager = getDataManager();
	var userInfo = app.getAppProperty("UserInfo") || dataManager.getUserInfo();
	var positionList = app.getAppProperty("PositionList") || dataManager.getPositionList();
	if(positionList) {
		positionList.copyToDataSet(app.lookup("PositionList"));
	}
	var config = getConfig();	
	var accountInfo = dataManager.getAccountInfo() || auth.getAuthenticatedUser();
	var submission = app.lookup("smsUserInfoReq");
	submission.setParameters("fingerprint", "false");
	submission.setParameters("face", "false");
	submission.setParameters("picture", "true");
	submission.action = "/users/" + accountInfo.UserID;
	submission.setRequestActionUrl(config.apiHostResolution()+ submission.action);		
	submission.send();

}


/*
 * Triggered when init event is fired from Body.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	auth.isAuthenticated(app);
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsUserInfoReqSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfoReq = e.control;
	auth.logout(app);
}


/*
 * Triggered when submit-error event is fired from Submission.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_getPositionSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getPosition = e.control;
	auth.logout(app);
}


/*
 * Triggered when submit-done event is fired from Submission.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getPositionSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getPosition = e.control;
	handleUnauthorize(app);
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSmsUserInfoReqBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfoReq = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSmsUserInfoReqReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfoReq = e.control;
	hideLoading();
}


/*
 * Triggered when before-submit event is fired from Submission.
 * 통신을 시작하기전에 발생합니다.
 */
function onSms_getPositionBeforeSubmit(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getPosition = e.control;
	showloading();
}


/*
 * Triggered when receive event is fired from Submission.
 * 서버로 부터 데이터를 모두 전송받았을 때 발생합니다.
 */
function onSms_getPositionReceive(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getPosition = e.control;
	hideLoading();
}


/*
 * Triggered when rightBtnClick event is fired from User Defined Control.
 */
function onHeaderRightBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.Header
	 */
	var header = e.control;
	var userInfo = app.lookup("UserInfo");
	cpr.core.App.load("app/mobile/UserInformation/UserInfomationConfirmPassword", function(loadedApp){
		loadedApp.createNewInstance().run(null, function(createdApp) {
			createdApp.setAppProperties({
				userInfo: userInfo
			});
			createdApp.getContainer().style.animateFrom({	
				"transform": "translateX(100%)",
				"opacity": "0"
			}, .5, cpr.animation.TimingFunction.EASE_IN_OUT);
			app.close();
		})
	});
}
