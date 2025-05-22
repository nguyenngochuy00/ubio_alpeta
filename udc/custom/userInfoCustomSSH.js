/************************************************
 * userInfoCustomSSH.js
 * Created at 2020. 8. 5. 오전 11:30:11.
 *
 * @author joymrk
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

exports.setSSHUserInfo = function(dataMap){
	var userInfo = app.lookup("UserInfo");
	userInfo.clear();
	userInfo.build(dataMap);
	console.log(userInfo.getDatas());
}

exports.getSSHUserBirthday = function(){
	var sshBirthday = app.lookup("UCSSH_ipbBirthday").value;
	return sshBirthday;
	
}

/*
 * "결제" 버튼(UCSSH_ipbPrepayment)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUCSSH_ipbPrepaymentClick(/* cpr.events.CMouseEvent */ e){
	var userinfo = app.lookup("UserInfo");
	app.getRootAppInstance().openDialog("app/main/ssHospital/popup/sshprepayment", {width: 750, height: 550}, function(dialog){
		dialog.ready(function(dialogApp){
			// 사용자 기본정보 동기화. 
			dialog.headerTitle ="사용자정보 선불결제";
			dialog.initValue = {
				"ID":userinfo.getValue("ID"),
				"Name": userinfo.getValue("Name"),
				"Balance": app.lookup("UCSSH_nbeBalance").value,
				"CreateDate": userinfo.getValue("CreateDate")
			};
			dialog.modal = true;
		});
	}).then(function(returnValue){
		console.log(returnValue); /// -> 잔액 변경
		if (returnValue == 1) {
			var hostAppIns = app.getHostAppInstance();
			var _result = hostAppIns.callAppMethod("ssh_refreshSSHInfo", returnValue);
		}
	});
}
