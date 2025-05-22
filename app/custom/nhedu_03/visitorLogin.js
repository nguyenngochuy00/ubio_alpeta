/************************************************
 * visitorLogin.js
 * Created at 2019. 1. 30. 오전 11:00:43.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
comLib = createComUtil(app);

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	var language = localStorage.getItem("language");
	if( language ){
		dataManager.setLocale(language);
	}else {
		language = dataManager.initLanguage();
		localStorage.setItem("language",language);
	}
	comLib.language(language);	
	
	document.title = dataManager.getString("Str_VisitorManagementTitle");
}

// "방문신청" 버튼(VISITOR_btnVisitRequest)에서 click 이벤트 발생 시 호출. 
function onVISITOR_btnVisitRequestClick(/* cpr.events.CMouseEvent */ e){
	cpr.core.App.load("app/visitor/visitApplication", function(newapp) {
		app.close();				
		var instance = newapp.createNewInstance().run();			
		instance.callAppMethod("setOEMVer", 3);		
	});	
}

// "신청조회" 버튼(VISITOR_btnVisitSearch)에서 click 이벤트 발생 시 호출.
function onVISITOR_btnVisitSearchClick(/* cpr.events.CMouseEvent */ e){
	var sms_getVisitorLogin = app.lookup("sms_getVisitorLogin") ;
	var dmLoginInfo = app.lookup("ApplicationInfo");
	sms_getVisitorLogin.setParameters("FirstName", dmLoginInfo.getValue("FirstName"));	
	sms_getVisitorLogin.setParameters("LastName", dmLoginInfo.getValue("LastName"));
	sms_getVisitorLogin.setParameters("Birthday", dmLoginInfo.getValue("Birthday"));
	sms_getVisitorLogin.setParameters("Password", dmLoginInfo.getValue("Password"));
	sms_getVisitorLogin.send();
}

// 방문객 로그인 완료
function onSms_getVisitorLoginSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){ 
		// 신청 결과가 없는 경우 알림 표시
		// 신청 결과 표시 후 메인 화면으로 이동	 
		var total = app.lookup("Total").getValue("Count");
		if( total > 0 ){
			cpr.core.App.load("app/visitor/visitApplicationList", function(newapp) {
				var applicationInfo= app.lookup("ApplicationInfo").getDatas();
				var visitInfoList= app.lookup("VisitInfoList").getRowDataRanged();		
				app.close();		
				
				var instance = newapp.createNewInstance().run();
				instance.callAppMethod("setVisitInfoList", applicationInfo,visitInfoList);			
				instance.callAppMethod("setOEMVer", 3);
			});
		}else {
			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_WarnVisitApplicationNotExist"));
		}		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

// 방문객 로그인 에러
function onSms_getVisitorLoginSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 방문객 로그인 타임아웃
function onSms_getVisitorLoginSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}
