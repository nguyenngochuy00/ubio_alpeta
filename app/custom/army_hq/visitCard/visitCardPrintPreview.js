/************************************************
 * visitCardPrintPreview.js
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
	app.lookup("VMCP_txaPrintTextFrontTop").value = initValue["FrontTop"];
	app.lookup("VMCP_txaPrintTextFrontCenterBox").value = initValue["FrontCenterBox"];
	app.lookup("VMCP_txaPrintTextFrontBottomBox").value = initValue["FrontBottomBox"];
	app.lookup("VMCP_txaPrintTextFrontBottom").value = initValue["FrontBottom"];
	app.lookup("VMCP_ipbPrintTextBackTop").value = initValue["BackTop"];
	
	app.lookup("VMCP_txaPrintTextFrontTop").style.css("color", "#" + initValue["FrontTopColor"]);
	app.lookup("VMCP_txaPrintTextFrontCenterBox").style.css("color", "#" + initValue["FrontCenterBoxColor"]);
	app.lookup("VMCP_txaPrintTextFrontBottomBox").style.css("color", "#" + initValue["FrontBottomBoxColor"]);
	app.lookup("VMCP_txaPrintTextFrontBottom").style.css("color", "#" + initValue["FrontBottomColor"]);
	app.lookup("VMCP_ipbPrintTextBackTop").style.css("color", "#" + initValue["BackTopColor"]);
	
	
	var grpAccessCardFront = app.lookup("VMCP_grpAccessCardFront");
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
	
	var grpAccessCardBack = app.lookup("VMCP_grpAccessCardBack");
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
	
	// Todo: 사용되는 위치를 찾아야함!!
	app.lookup("VMCP_txaManagementNumber").value = "No: " + initValue["managementNumber"];
	
	var date = new Date();
	var Today = date.getFullYear() + ". " + (" " + (1 + date.getMonth())).slice(-2) + ". " + (" " + date.getDate()).slice(-2);
	app.lookup("VMCP_txaIssueDate").value = "발급일: " + Today;

}


/* 버튼 종료  */
function onVMVCI_btnCloseClick(/* cpr.events.CMouseEvent */ e){
	app.close();
	
}
