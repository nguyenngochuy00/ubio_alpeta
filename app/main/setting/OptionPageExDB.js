/************************************************
 * OptionPageExDB.js
 * Created at 2020. 1. 15. 오후 1:42:57.
 *
 * @author union
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
/*
function onBodyLoad(e){
	comLib = createComUtil(app);
	dataManager = getDataManager();	
	
	//var test1 = app.lookup("Exdb_ipb_id");
	//var test2 = app.lookup("Exdb_ipb_pw");
	
	//test1.setValue("id", "fdmsusr");
	//test2.setValue("pw", "fdmsamho");
	
	//test1.redraw()
	//test2.redraw()
	
	
	var ExdbCmdColSel = app.lookup("ExdbCmdColSel");
	
	ExdbCmdColSel.addItem(new cpr.controls.Item("aaa", 1));
	ExdbCmdColSel.addItem(new cpr.controls.Item("bbb", 2));
}
*/

/*
 * "접속" 버튼(Exdb_btnConnect)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */

var comLib;

function onExdb_btnConnectClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var exdb_btnConnect = e.control;
	
	comLib.showLoadMask("", "Loading", "", 0);
	
	updateExdbLoginInfo();
	app.lookup("smsExdbLogin").send();
	
	
}

function updateExdbLoginInfo(){
	var dmLoginReq = app.lookup("ExdbLoginAccountInfo");

	dmLoginReq.setValue("id", app.lookup("Exdb_ipb_id").value);
	dmLoginReq.setValue("pw", app.lookup("Exdb_ipb_pw").value);
	dmLoginReq.setValue("dbType", app.lookup("Exdb_cbxOracleDB").value);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsExdbLoginSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbLogin = e.control;
	
	comLib.hideLoadMask();
	
	var dataManager = getDataManager();	
	var result = app.lookup("Result");	
	if( result.getValue("ResultCode")==0){
		var Exdb_cmb_extables = app.lookup("Exdb_cmb_extables");
		var dsExdbTableList = app.lookup("ExdbTableList");
		
		Exdb_cmb_extables.deleteAllItems();
		
		var rowCount = dsExdbTableList.getRowCount()
		
		for( var i = 0; i < rowCount; i++){
			var data = dsExdbTableList.getRow(i);
			var posID = data.getValue("tablename");
			
			Exdb_cmb_extables.addItem(new cpr.controls.Item(posID, i));
		}
		
		Exdb_cmb_extables.enabled = true;
		
		Exdb_cmb_extables.redraw();
		
		//Exdb_cmb_extables.setUserList(dsExdbTableList);
		//udcUserList.setPaging(totalCount, USMGR_pageRowCount, viewPageCount);
		//Exdb_cmb_extables.redraw();
		
	}else{		
		//dialogAlert(app, dataManager.getString("Str_Info"), "fail");	
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));	
	
		comLib.hideLoadMask();
	}
	
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsExdbLoginSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbLogin = e.control;
	
	
	
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSmsExdbLoginSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbLogin = e.control;
	
	comLib.hideLoadMask();
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsExdbLoginSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbLogin = e.control;
	
	comLib.hideLoadMask();
}


/*
 * "선택한 테이블 정보 가져오기" 버튼(Exdb_btnTableColumInfo)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onExdb_btnTableColumInfoClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var exdb_btnTableColumInfo = e.control;
	var Exdb_cmb_extables = app.lookup("Exdb_cmb_extables");
	console.log(Exdb_cmb_extables.getItemCount());
	var ExdbTableName = app.lookup("ExdbReqTableColumInfo");
	ExdbTableName.setValue("id", app.lookup("Exdb_ipb_id").value);
	ExdbTableName.setValue("pw", app.lookup("Exdb_ipb_pw").value);
	if (Exdb_cmb_extables.getItemCount() == 1) {
		
	} else {
		var seldata = Exdb_cmb_extables.getSelectionFirst();			
		var selTableName = Exdb_cmb_extables.getItem(seldata.value);
		ExdbTableName.setValue("tablename", Exdb_cmb_extables.text);	
	}
	console.log(ExdbTableName.getDatas());
		
		//console.log(seldata)
		//console.log(seldata.value)
		//console.log(selTableName)
		//console.log(selTableName.value)
		
	app.lookup("smsExdbTableColumInfo").send();
	
	
	comLib.showLoadMask("", "Loading", "", 0);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsExdbTableColumInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbTableColumInfo = e.control;
	
	
	dataManager = getDataManager();	
	var result = app.lookup("Result");	
	if( result.getValue("ResultCode")==0){
		var Exdb_grd_selectcolum = app.lookup("Exdb_grd_selectcolum");
		var dsExdbTableColumInfo = app.lookup("ExdbTableColumInfo");
		
		comLib.hideLoadMask();
		
		/*
		var rowCount = dsExdbTableColumInfo.getRowCount()
		for( var i = 0; i < rowCount; i++){
			var row = dsExdbTableColumInfo.getRow(i);
			var colname = row.getValue("colname");
			var coltype = row.getValue("coltype");
			var collen = row.getValue("collen");
			var colnum = row.getValue("colnum");
			
			
			Exdb_grd_selectcolum.setValue("colname", colname);
			Exdb_grd_selectcolum.setValue("coltype", coltype);
			Exdb_grd_selectcolum.setValue("collen", collen);
			//Exdb_grd_selectcolum.setValue("colnum", colnum);
			
		}
		
		Exdb_grd_selectcolum.redraw();*/
		
		
		
	/*
	var Exdb_Cmb_ColSel = app.lookup("Exdb_Cmb_ColSel");
	
	console.log("Exdb_Cmb_ColSel")
	
	Exdb_Cmb_ColSel.deleteAllItems();
	
	Exdb_Cmb_ColSel.visible = true;
	
	var idx = 0;
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_NONE"), idx++));   
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_DATE"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_TIME"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_SDNO"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_NAME"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_WORK"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_CARD"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_GATE"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_GATENAME"), idx++));       
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_FIXED"), idx++));          
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_DATETIME"), idx++));       
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_BLANK"), idx++));          
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_NOTUSED"), idx++));        
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_USER"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_TYPE"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_E_USER"), idx++));         
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_E_ETC"), idx++));          
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_E_UPTIME"), idx++));       
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_E_GROUP"), idx++));        
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_WEEK"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_INTIME"), idx++));         
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXPORT_OUTTIME"), idx++));      

	Exdb_Cmb_ColSel.selectItem(0); 
	
	Exdb_Cmb_ColSel.value = Exdb_Cmb_ColSel.getItem(0)
	
	Exdb_Cmb_ColSel.redraw();
	
	Exdb_grd_selectcolum.redraw();
	*/
	
	/*
	{"Key": "Str_EXPORT_DATE,"Value":"일자"},
	{"Key": "Str_EXPORT_TIME,"Value":"시간"},
	{"Key": "Str_EXPORT_SDNO,"Value":"사원번호"},
	{"Key": "Str_EXPORT_NAME,"Value":"이름"},
	{"Key": "Str_EXPORT_WORK,"Value":"근태내역"},
	{"Key": "Str_EXPORT_CARD,"Value":"카드번호"},
	{"Key": "Str_EXPORT_GATE,"Value":"단말기ID"},
	{"Key": "Str_EXPORT_GATENAME,"Value":"단말기명"},
	{"Key": "Str_EXPORT_FIXED,"Value":"고정값"},
	{"Key": "Str_EXPORT_DATETIME,"Value":"일자+시간"},
	{"Key": "Str_EXPORT_BLANK,"Value":"공백(0x20)"},
	{"Key": "Str_EXPORT_NOTUSED,"Value":"지정없음"},
	{"Key": "Str_EXPORT_USER,"Value":"사용자ID"},
	{"Key": "Str_EXPORT_TYPE,"Value":"인증방식"},
	{"Key": "Str_EXPORT_E_USER,"Value":"사용자구분"},
	{"Key": "Str_EXPORT_E_ETC,"Value":"기타"},
	{"Key": "Str_EXPORT_E_UPTIME,"Value":"로그저장시간"},
	{"Key": "Str_EXPORT_E_GROUP,"Value":"그룹ID"},
	{"Key": "Str_EXPORT_WEEK,"Value":"요일"},
	{"Key": "Str_EXPORT_INTIME,"Value":"출근시간"},
	{"Key": "Str_EXPORT_OUTTIME,"Value":"퇴근시간"},
	
	*/
		
	}else{		
		//dialogAlert(app, dataManager.getString("Str_Info"), "fail");
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));	
	
		comLib.hideLoadMask();
	}
	
	
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsExdbTableColumInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbTableColumInfo = e.control;
	
	comLib.hideLoadMask();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsExdbTableColumInfoSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbTableColumInfo = e.control;
	
	
	var Exdb_Cmb_ColSel = app.lookup("Exdb_Cmb_ColSel");
	
	console.log("Exdb_Cmb_ColSel")
	
	Exdb_Cmb_ColSel.deleteAllItems();
	
	var idx = 0;
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_NOTUSED"), idx++));   
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_DATE"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_TIME"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_TID"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_UID"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_NAME"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_IDNO"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_GID"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_WORKMODE"), idx++));       
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_FIXEDVALUE"), idx++));          
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_VARIFY"), idx++));       
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_USER"), idx++));          
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_ETC"), idx++));        
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_UPTIME"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_UPMODE"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_PICTURE"), idx++));         
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_RESULT"), idx++));          
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_PART"), idx++));       
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_POSITION"), idx++));        
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_DATETIME"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_CARDNUM"), idx++));         
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_FUNC"), idx++));         
    Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_RESERVED"), idx++));    
     
     
	Exdb_Cmb_ColSel.redraw();
	//Exdb_Cmb_ColSel.value = 0;// .selectItem(0); 
	var idx = app.lookup("ExdbTableColumInfo").getRowCount();
	for (var i = 0 ; i < idx  ; i++ ) {
		app.lookup("ExdbTableColumInfo").getRow(i).setValue("colsel", 0);
	}
	app.lookup("ExdbTableColumInfo").commit();
	
	
	//Exdb_grd_selectcolum.redraw();
}


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad2(/* cpr.events.CEvent */ e){
		
	comLib = createComUtil(app);
	dataManager = getDataManager();	
	
	comLib.showLoadMask("", "Loading", "", 0);
	
	var smsExdbGetLoginInfo = app.lookup("smsExdbGetLoginInfo");
	smsExdbGetLoginInfo.send();
	
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onExdbCmdColSelSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var exdbCmdColSel = e.control;
	/*
	var test1 =app.lookup("Exdb_grd_selectcolum");
	
	var grdidx = test1.getSelectedRowIndex();
	app.lookup("ExdbTableColumInfo").setValue(grdidx, "colsel", exdbCmdColSel.value);
	//test1.setCellValue(grdidx, 4, exdbCmdColSel.value);
	test1.redraw();*/
}


/*
 * "저장하기" 버튼(Exdb_btnSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onExdb_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var exdb_btnSave = e.control;
	

	//dmLoginReq.commit();
	//console.log(app.lookup("ExdbTableColumInfo").getRowDataRanged());
	
	
	var setdata = app.lookup("ExdbTableColumInfo");
	setdata.commit();
	
	var test = app.lookup("smsExdbSaveTableColumInfo");
	test.removeAllRequestData();
	
	var dmLoginReq = app.lookup("ExdbReqTableColumInfo");
	dmLoginReq.setValue("id", app.lookup("Exdb_ipb_id").value);
	dmLoginReq.setValue("pw", app.lookup("Exdb_ipb_pw").value);
	
	//var seldata = Exdb_cmb_extables.getSelectionFirst();
	//seExdb_cmb_extables.getItem(seldata.value);
	
	dmLoginReq.setValue("tablename", app.lookup("Exdb_cmb_extables").text);
	
	
	test.addRequestData(dmLoginReq, "ExdbReqTableColumInfo",cpr.protocols.PayloadType.all);
	test.addRequestData(setdata, "ExdbTableColumInfo",cpr.protocols.PayloadType.all);
	
	console.log(test);
	
	test.send();
	
	
	//removeAllRequestData
	
	//sms_put_terminalUserData.addEventListenerOnce("submit-done", onSms_put_terminalUserDataSubmitDone);
	//sms_put_terminalUserData.addEventListenerOnce("submit-error", onSms_put_terminalUserDataSubmitError);
	//sms_put_terminalUserData.addEventListenerOnce("submit-timeout", onSms_put_terminalUserDataSubmitTimeout);
		
	//var test = app.lookup("smsExdbSaveTableColumInfo");
	//test.addRequestData(setdata, "ExdbTableColumInfo2",cpr.protocols.PayloadType.all);
	//test.send();
	
	
	
	//console.log(app.lookup("smsExdbSaveTableColumInfo").getRowDataRanged());
	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsExdbSaveTableColumInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbSaveTableColumInfo = e.control;
	
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsExdbSaveTableColumInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbSaveTableColumInfo = e.control;
	
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsExdbSaveTableColumInfoSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbSaveTableColumInfo = e.control;
	
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onExdb_Cmb_ColSelSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var exdb_Cmb_ColSel = e.control;
	
}


/*
 * "저장된 정보 가져오기" 버튼(Exdb_btnLoad)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onExdb_btnLoadClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var exdb_btnLoad = e.control;
		
	var test = app.lookup("smsExdbLoadTableColumInfo");
	test.removeAllRequestData();
	
	var dmLoginReq = app.lookup("ExdbLoginAccountInfo");
	dmLoginReq.setValue("id", app.lookup("Exdb_ipb_id").value);
	dmLoginReq.setValue("pw", app.lookup("Exdb_ipb_pw").value);
	
	test.addRequestData(dmLoginReq, "ExdbLoginAccountInfo",cpr.protocols.PayloadType.all);
	test.send();
	
		var Exdb_Cmb_ColSel = app.lookup("Exdb_Cmb_ColSel");
	
	console.log("Exdb_Cmb_ColSel")
	
	Exdb_Cmb_ColSel.deleteAllItems();
	
	var idx = 0;
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_NOTUSED"), idx++));   
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_DATE"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_TIME"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_TID"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_UID"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_NAME"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_IDNO"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_GID"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_WORKMODE"), idx++));       
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_FIXEDVALUE"), idx++));          
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_VARIFY"), idx++));       
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_USER"), idx++));          
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_ETC"), idx++));        
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_UPTIME"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_UPMODE"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_PICTURE"), idx++));         
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_RESULT"), idx++));          
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_PART"), idx++));       
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_POSITION"), idx++));        
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_DATETIME"), idx++));           
	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_CARDNUM"), idx++));         
 	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_FUNC"), idx++));  
 	Exdb_Cmb_ColSel.addItem(new cpr.controls.Item(dataManager.getString("Str_EXDB_RESERVED"), idx++));        
     
	
	
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsExdbLoadTableColumInfoSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbLoadTableColumInfo = e.control;
	
	
	
	
}


/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onExdb_ipb_idValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var exdb_ipb_id = e.control;
	
	var Exdb_btnConnect = app.lookup("Exdb_btnConnect");
	Exdb_btnConnect.enabled = false;
	
	
	var Exdb_ipb_id = app.lookup("Exdb_ipb_id");	
	var Exdb_ipb_pw = app.lookup("Exdb_ipb_pw");
	
	if( Exdb_ipb_id.text != null && Exdb_ipb_id.text.length > 0 ) {
		
		if( Exdb_ipb_pw.text != null && Exdb_ipb_pw.text.length > 0 ) {
				
			Exdb_btnConnect.enabled = true;
		}
	}
}


/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onExdb_ipb_pwValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var exdb_ipb_id = e.control;
	

	var Exdb_btnConnect = app.lookup("Exdb_btnConnect");
	Exdb_btnConnect.enabled = false;
	
	var Exdb_ipb_id = app.lookup("Exdb_ipb_id");	
	var Exdb_ipb_pw = app.lookup("Exdb_ipb_pw");
	
	if( Exdb_ipb_id.text != null && Exdb_ipb_id.text.length > 0 ) {
		
		if( Exdb_ipb_pw.text != null && Exdb_ipb_pw.text.length > 0 ) {
				
			Exdb_btnConnect.enabled = true;
		}
	}
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onExdb_cmb_extablesSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var exdb_cmb_extables = e.control;
	
	var Exdb_btnTableColumInfo = app.lookup("Exdb_btnTableColumInfo");
	Exdb_btnTableColumInfo.enabled = false;
	
	if( exdb_cmb_extables.text != "" ) {
		Exdb_btnTableColumInfo.enabled = true;
	}
	
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSmsExdbTableColumInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbTableColumInfo = e.control;
	
	comLib.hideLoadMask();
}


/*
 * 그리드에서 update 이벤트 발생 시 호출.
 * Grid의 행 데이터가 수정되었을 때 이벤트.
 */
function onExdb_grd_selectcolumUpdate(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var exdb_grd_selectcolum = e.control;
	
	var Exdb_btnSave = app.lookup("Exdb_btnSave");
	Exdb_btnSave.enabled = true;
	
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSmsExdbGetLoginInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbGetLoginInfo = e.control;
	
	comLib.hideLoadMask();
	
	dataManager = getDataManager();	
	var result = app.lookup("Result");	
	if( result.getValue("ResultCode")==0){
		
		var Exdb_ipb_id = app.lookup("Exdb_ipb_id");
		var Exdb_ipb_pw = app.lookup("Exdb_ipb_pw");
		var Exdb_cmb_extables = app.lookup("Exdb_cmb_extables");
		Exdb_cmb_extables.deleteAllItems();
		
		var ExdbReqTableColumInfo = app.lookup("ExdbReqTableColumInfo");
		
		Exdb_ipb_id.text = ExdbReqTableColumInfo.getValue("id");
		Exdb_ipb_pw.text = ExdbReqTableColumInfo.getValue("pw");
		Exdb_cmb_extables.addItem(new cpr.controls.Item(ExdbReqTableColumInfo.getValue("tablename"), 0));
		Exdb_cmb_extables.selectItem(0);
		Exdb_cmb_extables.enabled = true;	
				
		Exdb_ipb_id.redraw();
		Exdb_ipb_pw.redraw();
		Exdb_cmb_extables.redraw();
		
		
	}else{		
		//dialogAlert(app, dataManager.getString("Str_Info"), "fail");	
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString(getErrorString(result.getValue("ResultCode"))));	
	
		
	}	
	
}


/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSmsExdbGetLoginInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbGetLoginInfo = e.control;
	
	comLib.hideLoadMask();
}


/*
 * 서브미션에서 submit-timeout 이벤트 발생 시 호출.
 * 통신 중 Timeout이 발생했을 때 호출되는 이벤트입니다.
 */
function onSmsExdbGetLoginInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsExdbGetLoginInfo = e.control;
	
	comLib.hideLoadMask();
	
}


/*
 * "Add TableName" 버튼(Exdb_btn_TableName)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onExdb_btn_TableNameClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var exdb_btn_TableName = e.control;
	var ipbTableName = app.lookup("Exdb_ipb_TableName");
	if (ipbTableName.value.length <= 0 ) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_NoAddMore"));	
		return;
	}
	var tableList = app.lookup("ExdbTableList");
	var getTableInfo = tableList.findFirstRow("tablename == '"+ipbTableName.value+"'");
	
	if (getTableInfo) {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString("Str_DuplicateAlert"));	
		return;
	}
	tableList.addRowData({"tablename": ipbTableName.value});
	tableList.commit();
	
	var getGrdInfo = app.lookup("Exdb_grd_selectcolum").findFirstRow("tablename == '"+ipbTableName.value+"'");
	if (!getGrdInfo) {
		var exdb_cmb_extables = app.lookup("Exdb_cmb_extables");
		var getTableNameInfo = tableList.findFirstRow("tablename == '"+ipbTableName.value+"'");
		if (getTableNameInfo) {
			var posID = getTableNameInfo.getValue("tablename");
			
			exdb_cmb_extables.addItem(new cpr.controls.Item(posID, getTableNameInfo.getIndex()+1));
				
			exdb_cmb_extables.enabled = true;
		
			exdb_cmb_extables.redraw();
		}
		
	}
	
}
