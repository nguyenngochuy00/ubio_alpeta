/************************************************
 * accessCardPrintPreview.js
 * Created at 2021. 6. 4. 오전 11:01:28.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var initValue = app.getHost().initValue;
	app.lookup("ACCP_txaPrintTextFrontTop").value = initValue["FrontTop"];
	app.lookup("ACCP_txaPrintTextFrontCenterBox").value = initValue["FrontCenterBox"];
	app.lookup("ACCP_txaPrintTextFrontBottomBox").value = initValue["FrontBottomBox"];
	app.lookup("ACCP_txaPrintTextFrontBottom").value = initValue["FrontBottom"];
	app.lookup("ACCP_ipbPrintTextBackTop").value = initValue["BackTop"];
	
	app.lookup("ACCP_txaPrintTextFrontTop").style.css("color", "#" + initValue["FrontTopColor"]);
	app.lookup("ACCP_txaPrintTextFrontCenterBox").style.css("color", "#" + initValue["FrontCenterBoxColor"]);
	app.lookup("ACCP_txaPrintTextFrontBottomBox").style.css("color", "#" + initValue["FrontBottomBoxColor"]);
	app.lookup("ACCP_txaPrintTextFrontBottom").style.css("color", "#" + initValue["FrontBottomColor"]);
	app.lookup("ACCP_ipbPrintTextBackTop").style.css("color", "#" + initValue["BackTopColor"]);
	
	var grpAccessCardFront = app.lookup("ACCP_grpAccessCardFront");
	var imageData = initValue["ImageFront"];
	if( imageData && imageData.length>0){
		grpAccessCardFront.style.css({
			"background-image" : 'url(data:image/png;base64,'+imageData+')',
			"background-repeat" : "none",
			"background-position" : "center",
			"background-size" : "cover"
		});			
	}else{
		grpAccessCardFront.style.css({
			"background-image" : '',
		});
	}
	
	var grpAccessCardBack = app.lookup("ACCP_grpAccessCardBack");
	var imageData = initValue["ImageBack"];		
	if( imageData && imageData.length>0){
		grpAccessCardBack.style.css({
			"background-image" : 'url(data:image/png;base64,'+imageData+')',
			"background-repeat" : "none",
			"background-position" : "center",
			"background-size" : "cover"
		});			
	}else{
		grpAccessCardBack.style.css({
			"background-image" : '',				
		});
	}
	
	app.lookup("ACCP_txaManagementNumber").value = "No: " + initValue["managementNumber"];
	
	var date = new Date();
	var Today = date.getFullYear() + ". " + (" " + (1 + date.getMonth())).slice(-2) + ". " + (" " + date.getDate()).slice(-2);
	app.lookup("ACCP_txaIssueDate").value = "발급일: " + Today;
	
	app.lookup("ACCP_txaGroup").value = initValue["Group"];
	app.lookup("ACCP_txaServiceNumber").value = initValue["ServiceNumber"];
	app.lookup("ACCP_txaName").value = initValue["Name"];
	
	if (initValue["UserPicture"] != "") {
		app.lookup("ACCP_txaPrintTextFrontCenterBox").style.css( {
			"background-image" : 'url(data:image/png;base64,'+initValue["UserPicture"]+')',
			"background-repeat" : "none",
			"background-position" : "center",
			"background-size" : "cover"	
		});
	}
}


/* 버튼 종료  */
function onVMVCI_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	app.close();
	
}
