/************************************************
 * UnitCarInformationArmyHQ.js
 * Created at 2021. 1. 21. 오후 3:03:51.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

var comLib;

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	comLib = createComUtil(app);	
	
	var cmbUserGroup = app.lookup("UCI_cmbCarManagerGroup");
	if (isLoginMaster()){ // 24년도부터 Master를 제외한 관리자는 본인 부서 + 하위 부서만 관리 가능
		cmbUserGroup.setItemSet(dataManager.getGroup(), {label: "Name",	value: "GroupID"});
		cmbUserGroup.addItem(new cpr.controls.Item("------", 0));	
	} else {
		cmbUserGroup.setItemSet(dataManager.getLoginUserGroups(), {label: "Name",	value: "GroupID"});
	}
	cmbUserGroup.selectItemByValue(getLoginUserGroupCode());
	
	var ipb_comport = app.lookup("ipb_comport");
	ipb_comport.value = "3"; // 기본 컴포트 3으로 변경 
}

// 컨트롤 초기화
exports.initAllControl = function(){
	app.lookup("UCI_rdbCarAccessState").value = 2;
	app.lookup("UCI_rdbRegistrationType").value = 1;
	app.lookup("UCI_ipbCarNumber").value = "";
	app.lookup("UCI_ipbRFIDNumber").value = "";
	app.lookup("UCI_ipbCarType").value = "";
	app.lookup("UCI_ipbCarUse").value = "";
	app.lookup("UCI_cmbCarManagerGroup").value = 0;
	app.lookup("UCI_ipbCarMemo").value = "";
}

exports.getUnitCarInformation = function(dataMap){
	dataMap.setValue("CarAccessState", app.lookup("UCI_rdbCarAccessState").value);
	dataMap.setValue("RegistrationType", app.lookup("UCI_rdbRegistrationType").value);
	dataMap.setValue("CarNumber", app.lookup("UCI_ipbCarNumber").value);
	dataMap.setValue("CarType", getControlValue("UCI_ipbCarType"));
	dataMap.setValue("RFIDNumber", app.lookup("UCI_ipbRFIDNumber").value);
	dataMap.setValue("CarUse", getControlValue("UCI_ipbCarUse"));
	dataMap.setValue("ManagerGroupCode", app.lookup("UCI_cmbCarManagerGroup").value);
	dataMap.setValue("CarMemo", getControlValue("UCI_ipbCarMemo"));
}

exports.setUnitCarInformation = function(setData){
	app.lookup("UCI_rdbCarAccessState").value = setData["CarAccessState"];
	app.lookup("UCI_rdbRegistrationType").value = setData["RegistrationType"];
	app.lookup("UCI_ipbCarNumber").value = setData["CarNumber"];
	app.lookup("UCI_ipbCarType").value = setData["CarType"];
	app.lookup("UCI_ipbRFIDNumber").value = setData["RFIDNumber"];
	app.lookup("UCI_ipbCarUse").value = setData["CarUse"];
	app.lookup("UCI_cmbCarManagerGroup").value = setData["ManagerGroupCode"];
	app.lookup("UCI_ipbCarMemo").value = setData["CarMemo"];
}

exports.setReadOnlyCarNumber = function(){
	app.lookup("UCI_ipbCarNumber").readOnly = true;
}


// vaidatdCheck
exports.validateData = function(){
	if (!checkNullControl("UCI_ipbCarNumber", "Str_ARMYHQ_NoCarNumber")){ return false; }
	//if( app.lookup("UCI_rdbRegistrationType").value == 2 ){
		if (!checkNullControl("UCI_ipbRFIDNumber", "Str_ARMYHQ_NoRFIDNumber")){ return false; }
	//}
	if (!checkZeroControl("UCI_cmbCarManagerGroup", "Str_ARMYHQ_NoCarManagerGroup")){ return false; }
	
	return true;
}


function getControlValue( controlName ){
	var control = app.lookup(controlName);
	if( control == null ){
		return "";
	}
	var value = control.value;
	if ( value == null ){
		return "";
	}
	return value;
}

function checkNullControl(cntName, ErrorMsg) {
	if( app.lookup(cntName).value == null || app.lookup(cntName).value.length < 1 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString(ErrorMsg));
		return false;
	}
	return true;
}

function checkZeroControl(cntName, ErrorMsg) {
	if( app.lookup(cntName).value == 0 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString(ErrorMsg));
		return false;
	}
	return true;
}




function onRm100CaptureReq(uid){	
	var brandType = ( dataManager.getSystemBrandType() == BRAND_NITGEN) ?"NITGEN":"VIRDI";
	if(USCDR_deviceWebSocket){
	
		if (uid == undefined) {
			uid = 0
		}
		
		var ipb_comport = app.lookup("ipb_comport");
		//ipb_comport.text = "4"; // 기본 컴포트가 4인것 같다 
		
		//var ipb_comport_int = parseInt(ipb_comport.text, 10);
		
		var strSendinfo = '';
		strSendinfo = '{"msgId":"'+ WSCmdRm100CaptureReq+'","body":{"UserId":"'+uid+'", "Comport":"'+ipb_comport.text+'"}';
				
		strSendinfo = strSendinfo + '}';
		
		comLib.showLoadMask("", dataManager.getString("Str_Rm100CaptureRequest"), "", 60);
		console.log(strSendinfo);
		USCDR_deviceWebSocket.send(strSendinfo);	
		
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_HamsterConnectFailed"));			
	}
}



function connectDeviceServer(address){    
    
    USCDR_deviceWebSocket = new WebSocket("ws://"+address+"/v1/webEntry");
        
    USCDR_deviceWebSocket.onopen = function(message){      
    	//app.lookup("USCDR_opbMessage").value = dataManager.getString("Str_HamsterConnected");          
        console.log("device server ws connected.");

        onRm100CaptureReq(1);
    };

    USCDR_deviceWebSocket.onclose = function(message){
    	USCDR_deviceWebSocket = null;
        console.log("\Server disconnect..."); 
    };

    USCDR_deviceWebSocket.onerror = function(message){
        console.log("error... " + message);
        //app.lookup("USCDR_opbMessage").value = dataManager.getString("Str_DeviceServerInstallRequired");
        //var link = app.lookup("USCDR_sniDownloadLink");
        //link.visible=true;
        
    };

    USCDR_deviceWebSocket.onmessage = function(message){
        
        comLib.hideLoadMask();
        
        var msg = JSON.parse(message.data);
        
        console.log("USCDR_deviceWebSocket.onmessage: " + msg);
        
        switch( msg.msgId){                       
            case WSCmdRm100CaptureRes:{ // 캡쳐 완료. 결과 수신.
            	comLib.hideLoadMask();	
                var result = JSON.parse(msg.body);
                
                console.log("result.Result: " + result.Result);
                
                if(undefined == result.Result){
                	return
                }

                if( result.Result == "success" ){
                	
                	var dsUserCardInfo = app.lookup("UserCardInfo");
		            
		            var strCardNum = result.CardNum; 
		            
                	console.log("strCardNum: " + strCardNum);
					
					/*
                	var index = strCardNum.indexOf("B4F5");
                	if(-1 == index) {
                		console.log("not found B4F5");
                	} else {
                		strCardNum = strCardNum.substring(index, strCardNum.length);
                		console.log("strCardNum: " + strCardNum);
                		app.lookup("UCI_ipbRFIDNumber").text = strCardNum;
                		app.lookup("UCI_ipbRFIDNumber").redraw();
                	}
                	*/
					// 배정현 대리가 앞자리 8자리를 자르라고 한다 
					strCardNum = strCardNum.substring(8, strCardNum.length);
                	console.log("strCardNum: " + strCardNum);
                	app.lookup("UCI_ipbRFIDNumber").text = strCardNum;
                	app.lookup("UCI_ipbRFIDNumber").redraw();

	            } else if (result.Result=="Capture failed"){
	            	dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorCardCapture"));
	            } else {
	            	dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), result.Result);	            	
	            }
				
				USCDR_deviceWebSocket.close();
				
            }break;
            
            default: console.log(msg); break;
        }
    } 
}



/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	connectDeviceServer("127.0.0.1:9600"); 
}


/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onUCI_rdbRegistrationTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.RadioButton
	 */
	var rdbRegistrationType = e.control;
	if( rdbRegistrationType.value == 1 ){
		app.lookup("UCI_opbRFIDMendatory").style.addClass("section-green-amhq");
		app.lookup("UCI_opbRFIDMendatory").style.removeClass("section-green-required-amhq");		
	}else{
		app.lookup("UCI_opbRFIDMendatory").style.addClass("section-green-required-amhq");
		app.lookup("UCI_opbRFIDMendatory").style.removeClass("section-green-amhq");
	}
	
}
