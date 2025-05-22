/************************************************
 * edu_course_regi.js
 * Created at 2021. 4. 28. 오전 10:56:36.
 *
 * @author union
 ************************************************/


var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var dti_start = app.lookup("DJCHECR_dtiStart");
	var dti_end = app.lookup("DJCHECR_dtiEnd");

	var date = moment().format('YYYY-MM-DD');
	var now = moment.utc(date).local();
	dti_start.value = now.format('YYYY-MM-DD');
	dti_end.value = now.format('YYYY-MM-DD');
	
	comLib.showLoadMask("","교육 타입정보 가져오기","",0);
	var smsGetEduTypeList = app.lookup("sms_GetEduTypeList");	
	smsGetEduTypeList.send();
}
function onSms_GetListSubmitError(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSms_GetListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

function onSmsGetEduTypeListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		comLib.showLoadMask("","학습방법 정보 가져오기","",0);
		var smsGetEduMethodList = app.lookup("smsGetEduMethodList");	
		smsGetEduMethodList.send();	
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "교육 타입정보 가져오기");
	}
	
}

function onSmsPostEduCourseListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		dialogAlert(app, "알림", "등록되었습니다.");
		app.close(true);
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "교육 정보 등록 실패");
	}
	
}


/*
 * "추가" 버튼(DJCHECR_btnRegi)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDJCHECR_btnRegiClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dJCHECR_btnRegi = e.control;
	
	var ipb_edu_code = app.lookup("DJCHECR_ipbEduCode");
	var ipb_edu_name = app.lookup("DJCHECR_ipbEduName");
	var ipb_edu_contents = app.lookup("DJCHECR_ipbEduContents");
	var cmb_edu_type = app.lookup("DJCHECR_cmbEduMethod");
	var cmb_edu_method = app.lookup("DJCHECR_cmbEduType");
	var ipb_edu_location = app.lookup("DJCHECR_ipbEduLocation");

	var dti_start = app.lookup("DJCHECR_dtiStart");
	var dti_end = app.lookup("DJCHECR_dtiEnd");

	if(ipb_edu_code.text == "") {
		dialogAlert(app, dataManager.getString("Str_Failed"), "교육코드를 입력하십시요");
		return;
	}

	if(ipb_edu_name.text == "") {
		dialogAlert(app, dataManager.getString("Str_Failed"), "교육명을 입력하십시요");
		return;
	}
	
	if(ipb_edu_contents.text == "") {
		dialogAlert(app, dataManager.getString("Str_Failed"), "교육내용을 입력하십시요");
		return;
	}	
	
	if(ipb_edu_location.text == "") {
		dialogAlert(app, dataManager.getString("Str_Failed"), "교육장소를 입력하십시요");
		return;
	}		
	
	var EduCourse = app.lookup("EduCourse");
	EduCourse.setValue("StartDate", dti_start.text);	
	EduCourse.setValue("EndDate", dti_end.text);	
	
	EduCourse.setValue("Code", ipb_edu_code.text);
	EduCourse.setValue("Name", ipb_edu_name.text);
	EduCourse.setValue("Contents", ipb_edu_contents.text);
	EduCourse.setValue("Location", ipb_edu_location.text);
	
	EduCourse.setValue("Type", cmb_edu_type.value);
	EduCourse.setValue("Method", cmb_edu_method.value);
	
	comLib.showLoadMask("","교육 정보 등록","",0);
	var smsPostEduCourseList = app.lookup("smsPostEduCourseList");
	smsPostEduCourseList.send();
}

function onSmsGetEduMethodListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	comLib.hideLoadMask();
	if (resultCode == COMERROR_NONE) {
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), "학습방법 정보 가져오기");
	}
}


/*
 * "닫기" 버튼(DJCHECR_btnClose)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onDJCHECR_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var dJCHECR_btnClose = e.control;
	app.close(false);

}
