/************************************************
 * smpleCountryCode.js
 * Created at 2019. 8. 22. 오후 4:23:52.
 *
 * @author joymrk
 ************************************************/



/*
 * "add" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	var key = app.lookup("ipbK").value;
	var value = app.lookup("ipbV").value;
	
	var countryCodelist = app.lookup("dsContryCodeList");
	countryCodelist.clear();
	countryCodelist.addRowData({"Key":key, "Value":value});
	
	app.lookup("sms_postCountryCode").send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_postCountryCodeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	console.log(app.lookup("Result").getValue("ResultCode"));
}


/*
 * "modi" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	var key = app.lookup("ipbK").value;
	var value = app.lookup("ipbV").value;
	
	var countryCodelist = app.lookup("dsContryCodeList");
	countryCodelist.clear();
	countryCodelist.addRowData({"Key":key, "Value":value});
	
	app.lookup("sms_putCountryCode").send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_putCountryCodeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	console.log(app.lookup("Result").getValue("ResultCode"));
}


/*
 * "delect" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	var key = app.lookup("ipbK").value;
	
	var reqData = app.lookup("sms_deleteCountryCode");
	reqData.action = "/v1/MultilingualList/countrycode/" + key;
	reqData.send();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteCountryCodeSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	console.log(app.lookup("Result").getValue("ResultCode"));
}
