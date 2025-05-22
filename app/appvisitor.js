/************************************************
 * app.js
 * Created at 2019. 1. 30. 오전 11:00:43.
 *
 * @author jwlee
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
/*
 * "방문신청" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVISITOR_btnVisitClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vISITOR_btnVisit = e.control;

	//app.lookup("sms_visit").send();	

	dataManager = getDataManager();
	var dmVisitor = app.lookup("VisitorInfo");
	dmVisitor.setValue( "Name", app.lookup("VISITOR_ipbName").value);
	dmVisitor.setValue( "Phone", app.lookup("VISITOR_ipbPhone").value);
	
	if(dmVisitor.getValue("Name").length == 0) {
		dialogAlert(app, "#Waning", "#이름을 입력해주세요 !!!");
		return;			
	} 
	if(dmVisitor.getValue("Phone").length == 0) {
		dialogAlert(app, "#Waning", "#휴대폰 번호를 입력해주세요 !!!");
		return;			
	} 
	
	if(dmVisitor.getValue("Phone").length == 0) return;
		
	dataManager.setVisitInfo(dmVisitor);			

	cpr.core.App.load("app/visit/VisitApply", function(newapp) {
			app.close();
			newapp.createNewInstance().run();				
	});			
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSms_visitSubmitSuccess(e){
	var sms_visit = e.control;
	
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_visitSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
}


/*
 * "신청조회" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVISITOR_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vISITOR_btnSearch = e.control;
	
}
