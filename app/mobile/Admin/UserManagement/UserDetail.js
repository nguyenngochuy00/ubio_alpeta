/************************************************
 * UserDetail.js
 * Created at Nov 3, 2020 4:51:00 PM.
 *
 * @author EVN0025
 ************************************************/

var config = getConfig();
var utils = cpr.core.Module.require("lib/Utils");
var lodashModule = cpr.core.Module.require("lib/Lodash");
var lodash = lodashModule._;
var dataManager = getDataManager();

/*
 * Triggered when leftBtnClick event is fired from User Defined Control.
 */
function onHeaderLeftBtnClick(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.Header
	 */
	var header = e.control;
	app.close();
}


/*
 * Triggered when load event is fired from Body.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	var smsUserInfoReq = app.lookup("smsUserInfoReq");
	smsUserInfoReq.action = smsUserInfoReq.action + "/" + app.getAppProperty("UserID");
	smsUserInfoReq.setRequestActionUrl(config.apiHostResolution() + smsUserInfoReq.action);
	smsUserInfoReq.send();
}

function render() {
	var userData = app.lookup("UserInfo").getDatas();
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
	app.lookup("userUniqueID").value = userData.UniqueID;
	app.lookup("userID").value = userData.ID;
//	app.lookup("userCreationDate").value = userData.RegistDate ? moment(userData.RegistDate, "YYYY-MM-DD hh:mm:ss")
//	.format("YYYY.MM.DD hh:mm:ss") : "";
	app.lookup("userAuthInfoMandatory").value = andAuth.join(", ");
	app.lookup("userAuthInfoOptional").value = orAuth.join(", ");
	app.lookup("userAuthority").value = utils.getAuthority(userData.Privilege);
	app.lookup("useTypeOfUser").value = utils.getTypeOfUser(userData.UserType);
//	app.lookup("userPeriodOfUse").value = userData.RegistDate && userData.ExpireDate ? moment(userData.RegistDate, "YYYY-MM-DD HH:mm:ss")
//	.format("YYYY.MM.DD") + " ~ " + moment(userData.ExpireDate, "YYYY-MM-DD HH:mm:ss")
//	.format("YYYY.MM.DD") : "";
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
	app.lookup("header").setAppProperty("pageName", userData.Name);
	var BlackListValue = userData.BlackList
	if (BlackListValue == 1) {
		app.lookup("blacklist").toggle()
	} else {
		
	}
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
	if (app.lookup("Result").getValue("ResultCode") !== 0) {
		return;
	}
	render()
}
