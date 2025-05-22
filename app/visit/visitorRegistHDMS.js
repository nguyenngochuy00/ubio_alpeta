/************************************************
 * visitInfo.js
 * Created at 2020. 3. 3. 오후 1:21:28.
 * Prefix : VMVTR_
 * @author jrh
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib = createComUtil(app);
var dateLib = cpr.core.Module.require("lib/DateLib");
var VMVTR_fpModified; // 사용자가 지문 데이터를 수정 했는지 여부
var VMVTR_ver = 0;
var usint_version;

function onBodyLoad(/* cpr.events.CEvent */ e){	
	dataManager = getDataManager();
	VMVTR_fpModified = 1;
	usint_version = dataManager.getSystemVersion();
	var initValue = app.getHost().initValue;
	VMVTR_ver= initValue["OEM"];
	if( VMVTR_ver == 3 ){
		app.lookup("VMVTR_opb1").unbind("value");
		app.lookup("VMVTR_opb1").value = "참가자 등록";
		app.lookup("VMVTR_opb1").redraw();
		
		app.lookup("VMVTR_opb2").unbind("value");
		app.lookup("VMVTR_opb2").value = "참가 정보";
		app.lookup("VMVTR_opb2").redraw();
		
		app.lookup("VMVTR_opb3").unbind("value");
		app.lookup("VMVTR_opb3").value = "행사명";
		app.lookup("VMVTR_opb3").redraw();
		
		app.lookup("VMVTR_opb4").unbind("value");
		app.lookup("VMVTR_opb4").value = "행사일시";
		app.lookup("VMVTR_opb4").redraw();
		
		app.lookup("VMVTR_opb5").unbind("value");
		app.lookup("VMVTR_opb5").value = "행사일정";
		app.lookup("VMVTR_opb5").redraw();
		
		app.lookup("VMVTR_opb6").unbind("value");
		app.lookup("VMVTR_opb6").value = "참가자 정보";
		app.lookup("VMVTR_opb6").redraw();
		
		app.lookup("VMVTR_opb7").unbind("value");
		app.lookup("VMVTR_opb7").value = "참가자 아이디";
		app.lookup("VMVTR_opb7").redraw();
	}
	
	var visitInfo  = app.lookup("VisitInfo");
	visitInfo.build(initValue["VisitInfo"]);
	
	app.lookup("VMVTR_dtiStartDate").value = visitInfo.getValue("StartAt");
	app.lookup("VMVTR_dtiEndDate").value = visitInfo.getValue("EndAt");

	
	app.lookup("VMVTR_dtiStartTime").value = "00:00";
	app.lookup("VMVTR_dtiEndTime").value = "23:59";
	
	var visitorInfo  = app.lookup("VisitorInfo");
	visitorInfo.build(initValue["VisitorInfo"]);
	
	var rdbAuthInputType = app.lookup("VMVTR_rdbAuthInputType");
	rdbAuthInputType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeDirect"),0));
	rdbAuthInputType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeLinkSend"),1));
	rdbAuthInputType.selectItem(0,false);	
	
	sendAccessGroupRefresh();
		/*
	var accessGroup = dataManager.getAccessGroup();
	if( accessGroup == undefined || accessGroup.getRowCount() == 0 ){
		
		dsAccessGroupList.addRowData({"ID":0,"Name":"----"})			
		var sms_getAccessGroupList = app.lookup("sms_getAccessGroupList") ;		
		sms_getAccessGroupList.send();
	} else {		
		accessGroup.copyToDataSet(dsAccessGroupList);
	}	
	* */
	var userInfo = app.lookup("UserInfo");
	userInfo.setValue("AuthInfo", "9,0,0,0,0,0,0,0");
	var photo = visitorInfo.getValue("Photo");
	if( photo && photo.length > 0 ){
		app.lookup("VMVTR_imgPhoto").putValue('data:image/png;base64,'+visitorInfo.getValue("Photo"));
		var dmUserFaceWTInfo = app.lookup("UserFaceWTInfo");
		dmUserFaceWTInfo.addRow();
		dmUserFaceWTInfo.setValue(0, "TemplateData", photo);
		dmUserFaceWTInfo.setValue(0, "TemplateType", 1);
		dmUserFaceWTInfo.setValue(0, "TemplateSize", photo.length);
		
		app.lookup("VMVTR_opbFAWRegist").value="0";	
	}else{
		app.lookup("VMVTR_imgPhoto").visible = false;
	}
	onDisplayAuthType();		
	validateAuthDataBtn();
	
	var cmbAccessGroup = app.lookup("VMVTR_cmbAccessGroup");
	cmbAccessGroup.selectItem(0, false);
	
	app.lookup("VMVTR_cbxVisitorID").checked = true;
	
	app.lookup("VMVTR_grpVisitInfo").redraw();
	app.lookup("VMVTR_grpVisitorInfo").redraw();	
}


// 언어 리스트 가져오기 완료
function onSms_getLangListSubmitDone(/* cpr.events.CSubmissionEvent */ e){	
}

// // 언어 리스트 가져오기 성공
function onSms_getLangListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){	
	//var dsLangList = app.lookup("LangList");
	//var locale = dataManager.getLocale();
	//dataManager.setLanguage(locale, dsLangList);	
}

// 자동 아이디 체크 
function onVMVTR_cbxVisitorIDValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.CheckBox	 */
	var cbxVisitorID = e.control;
	if( cbxVisitorID.value == true){
		app.lookup("VMVTR_ipbVisitorID").enabled = false;
	}else{
		app.lookup("VMVTR_ipbVisitorID").enabled = true;
	}
}

// 인증정보 배열 분석하여 화면 표시
function onDisplayAuthType(){
	var userInfo = app.lookup("UserInfo");
	// 필수 / 선택 인증 정보 파싱
	var AuthType = userInfo.getValue("AuthInfo").split(',');
		
	var fpExist = false;
	var andAuth = "";
	for( var idx=0; idx < AuthType[7]; idx++ ){		
		var authType = parseInt(AuthType[idx],10);
		andAuth += getAuthTypeString(authType )+" ";		
	}
	var orAuth = "";	
	for( var idx=AuthType[7]; idx< AuthType.length-1; idx++ ){		
		orAuth += getAuthTypeString( parseInt(AuthType[idx],10))+" ";
	}			
	app.lookup("VMVTR_opbAuthAnd").value = andAuth;
	app.lookup("VMVTR_opbAuthOr").value = orAuth;
}

// 인증 수단 수정 버튼 클릭시
function onVMVTR_btnAuthTypeModifyClick(/* cpr.events.CMouseEvent */ e){
	var userInfo = app.lookup("UserInfo");
	
	var AuthType = userInfo.getValue("AuthInfo").split(',');	
	var andAuth = [];	
	for( var idx=0; idx < AuthType[7]; idx++ ){		
		andAuth[idx] = parseInt(AuthType[idx],10);		
	}
	var orAuth = [];
	var count = 0;
	for( var idx=AuthType[7]; idx< AuthType.length-1; idx++ ){		
		orAuth[count++]= parseInt(AuthType[idx],10);
	}
	var privilege = dataManager.getAccountInfo().getValue("Privilege");
	var excludeAuth = [];
	if( privilege > 1 && privilege < 1000){
		excludeAuth = [1,4]
	}
	var appld = "app/visit/visitAuthTypeSet";
	app.getRootAppInstance().openDialog(appld, {width : 410, height : 500}, function(dialog){
		dialog.initValue = {"AuthAnd":andAuth,"AuthOr":orAuth,"Exclude":excludeAuth};		
		dialog.bind("headerTitle").toLanguage("Str_AuthTypeSelect");
		dialog.modal = true;		
	}).then(function(returnValue){
		
		var strAuthType = "";
		var init = false;
		returnValue.forEach(function(authType){
			if( init == false ){
				init = true
			} else{
				strAuthType += ","
			}
			strAuthType += authType
		});
		userInfo.setValue("AuthInfo", strAuthType);
		onDisplayAuthType();
		
		validateAuthDataBtn();
	});
}

// 인증정보 배열 분석하여 화면 표시
function onDisplayAuthType(){
	var userInfo = app.lookup("UserInfo");	
	var AuthType = userInfo.getValue("AuthInfo").split(',');
	
	var andAuth = "";
	for( var idx=0; idx < AuthType[7]; idx++ ){		
		var authType = parseInt(AuthType[idx],10);
		andAuth += getAuthTypeString(authType )+" ";		
	}
	var orAuth = "";	
	for( var idx=AuthType[7]; idx< AuthType.length-1; idx++ ){		
		orAuth += getAuthTypeString( parseInt(AuthType[idx],10))+" ";
	}
	app.lookup("VMVTR_opbAuthAnd").value = andAuth;
	app.lookup("VMVTR_opbAuthOr").value = orAuth;
}

function validateAuthDataBtn() {	
	var authTypeList = [AuthTypeFingerPrint,AuthTypeFace,AuthTypeFaceWT,AuthTypePassword,AuthTypeCard];
	var editBtnList = ["VMVTR_btnFPRegist","VMVTR_btnFARegist","VMVTR_btnFAWRegist","VMVTR_ipbPassword","VMVTR_btnCDRegist"];
	for( var i = 0; i < authTypeList.length; i++ ){
		var enabled = false;
		if(IsExistAuthType(authTypeList[i])==true){enabled = true;}
		app.lookup(editBtnList[i]).visible = enabled;
		switch(i){
			case 0: app.lookup("VMVTR_btnFPRegist").enabled = enabled; break;
			case 1: app.lookup("VMVTR_btnFARegist").enabled = enabled; break;
			case 2: app.lookup("VMVTR_btnFAWRegist").enabled = enabled;
			        app.lookup("VMVTR_btnFAWApply").enabled = enabled;  break;
					//app.lookup("VMVTR_btnFAWRegist").enabled = enabled; break;
			case 3: app.lookup("VMVTR_ipbPassword").enabled = enabled; break;
			case 4:	app.lookup("VMVTR_ipbCard").enabled = enabled;
					app.lookup("VMVTR_btnCDRegist").enabled = enabled;
					/*var privilege = dataManager.getAccountInfo().getValue("Privilege");					
					if( privilege > 1 && privilege < 1000){
						app.lookup("VMVTR_btnCDRegist").enabled = false;
					} else {
						app.lookup("VMVTR_btnCDRegist").enabled = enabled; 
					}
					팀장님께 문의 해보세요 */ 
					break;	
		}	
	}
}

function IsExistAuthType(authType){
	var userInfo = app.lookup("UserInfo");
	var AuthType = userInfo.getValue("AuthInfo").split(',');
	for( var idx=0; idx < 7; idx++ ){		
		var checkData = parseInt(AuthType[idx],10);
		if( checkData == authType ){
			return true;
		}		
	}
	return false;
}

// 지문 등록 클릭
function onVMVTR_btnFPRegistClick(/* cpr.events.CMouseEvent */ e){
	var cResult = CheckApprovalUserPrivilege();
	if (cResult == false) {
		return;
	} 
	var userInfo = app.lookup("UserInfo");
	var duressFinger = new Array();
	var appld = "app/main/users/UserFingerRegist";
	app.getRootAppInstance().openDialog(appld, {width : 640, height : 490}, function(dialog){
		
		/* 기본적으로는 사용자 지문 등록 창에서 서버에 사용자 지문을 요청
		 * 등록된 지문이 없는 사용자이지만 지문 등록 화면을 열어 지문을 캡쳐하고 서버에 저장 전인 사용자인 경우 지문 등록창 재 진입시 이전에 캡쳐했지만 서버 저장전인 지문 정보를 전달한다.		 */
		var dsUserFpInfo = app.lookup("UserFPInfo"); 
		
		// 협박 지문 인자로 전달
		var duressFinger = userInfo.getValue("DuressFinger");
		if( duressFinger ){
			duressFinger = duressFinger.split(",");
		}
		var clientOption = dataManager.getClientOption();
		var fpMax = 10;
		if( clientOption){
			fpMax = dataManager.getClientOption().getValue("FpRegMax");
		}
		dialog.bind("headerTitle").toLanguage("Str_FingerRegist");
		dialog.initValue = {"UserID":userInfo.getValue("ID"),"Url":"/v1/visit","FPMax":fpMax,
		"FPModified":VMVTR_fpModified,"UserFPInfo":dsUserFpInfo,"DuressFinger":duressFinger};
		dialog.resizable = false;		
		dialog.modal = true;		
	}).then(function(returnValue){ // 지문 등록 화면에서 적용을 누른 경우에만 이 부분으로 들어옴.
		VMVTR_fpModified = 1; // 사용자가 지문을 수정한 경우 다음번 지문 편집창을 열때는 수정된 데이터로 표시
		
		var dsUserFpInfo = app.lookup("UserFPInfo");
		dsUserFpInfo.clear();
		
		var count = 0;
		var duress = "";
		for (var i = 0 ; i < returnValue.length ; i++) {			
			if ( returnValue[i]["TemplateIndex"] == 1 && returnValue[i]["Duress"] == 1 ) {
				if( duress.length != 0 ){
					duress += ",";
				}				 
				duress += returnValue[i]["FingerID"];
				count ++;
			}
			
			dsUserFpInfo.addRowData(returnValue[i]);
		}
		
		for(;count<8;count++){
			if( duress.length != 0 ){
					duress += ",";
			}	
			duress += 0;
		}
		if( count > 0 ){app.lookup("VMVTR_opbFPRegist").value="0";}
		else{app.lookup("VMVTR_opbFPRegist").value="-";}
		
		userInfo.setValue("DuressFinger", duress);
	});
}

//얼굴 등록 클릭
function onVMVTR_btnFARegistClick(/* cpr.events.CMouseEvent */ e){
	var cResult = CheckApprovalUserPrivilege();
	if (cResult == false) {
		return;
	} 
	var userInfo = app.lookup("UserInfo");
	
	var UserFaceInfoList = app.lookup("UserFaceInfo");
	var NewUserFaceInfoList = UserFaceInfoList.findAllRow("status == 1");
	var data = [];
	if (NewUserFaceInfoList != null || NewUserFaceInfoList != undefined) {
		for(var i=0; i<NewUserFaceInfoList.length; i++){
			data.push(NewUserFaceInfoList[i].getRowData());
		}	
	}
	//var dmProcessInfo = app.lookup("ProcessInfo");

	var appld = "app/main/users/UserFaceRegist";
	app.getRootAppInstance().openDialog(appld, {width : 680, height : 600}, function(dialog){
		dialog.initValue = {			
			"Mode":"Add",
		    "ID":userInfo.getValue("ID"),
		    "FaceDatas": data,
		    "Url":"/v1/visit"
		};
		
		dialog.bind("headerTitle").toLanguage("Str_FaceRegist");
		dialog.modal = true;		
	}).then(function(returnValue){
		var dsUserFaceInfo = app.lookup("UserFaceInfo");
		dsUserFaceInfo.clear();
		returnValue.copyToDataSet(dsUserFaceInfo.Face);	
		if(dsUserFaceInfo.getRowCount()>0){app.lookup("VMVTR_opbFARegist").value="0";}
		else{app.lookup("VMVTR_opbFARegist").value="-";}		
	});
}

// 얼굴 (Walkthrough)등록 클릭
function onVMVTR_btnFAWRegistClick(/* cpr.events.CMouseEvent */ e){
	
	var cResult = CheckApprovalUserPrivilege();
	if (cResult == false) {
		return;
	} 
	var dsUserFaceWTInfo = app.lookup("UserFaceWTInfo"); // 현재는 1장의 사진을 사용.. 추후 여러 장을 등록하게 될 경우를 대비해서 맵이 아닌 셋으로 구성
	var userInfo = app.lookup("UserInfo");
	//var dmProcessInfo = app.lookup("ProcessInfo");

	var appld = "app/main/users/UserFaceWTRegist" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 780, height : 500}, function(dialog){
		dialog.initValue = {			
			"Mode":"Add",
		    "ID": userInfo.getValue("ID"),
		    "FaceDatas": dsUserFaceWTInfo.getRowDataRanged(),
		    "Url": "/v1/visit"
		};		
		dialog.bind("headerTitle").toLanguage("Str_FaceRegist");
		dialog.modal = true;		
	}).then(function(returnValue){
		var dsUserFaceWTInfo = app.lookup("UserFaceWTInfo");
		dsUserFaceWTInfo.clear();
		dsUserFaceWTInfo.addRowData(returnValue);
		if(dsUserFaceWTInfo.getRowCount()>0){app.lookup("VMVTR_opbFAWRegist").value="0";}
		else{app.lookup("VMVTR_opbFAWRegist").value="-";}
	});
}

//"Use as FAW" 버튼  click
function onVMVTR_btnFAWApplyClick(/* cpr.events.CMouseEvent */ e){
	/** @type cpr.controls.Button */
	var vMVTR_btnFAWApply = e.control;
	var visitorInfo  = app.lookup("VisitorInfo");
	var photo = visitorInfo.getValue("Photo");
	if( photo && photo.length > 0){
		//var dmUserFaceWTInfo1 = app.lookup("UserFaceWTInfo1");
		//dmUserFaceWTInfo1.setValue("TemplateData", photo);
		//dmUserFaceWTInfo1.setValue("TemplateType", 1);//0:template,1:jpg
		//dmUserFaceWTInfo1.setValue("TemplateSize", photo.length);
		var dmUserFaceWTInfo = app.lookup("UserFaceWTInfo");
		dmUserFaceWTInfo.clear();// 등록된 사진정보 한장만 저장되게 처리
		dmUserFaceWTInfo.addRow();
		dmUserFaceWTInfo.setValue(0, "TemplateData", photo);
		dmUserFaceWTInfo.setValue(0, "TemplateType", 1);
		dmUserFaceWTInfo.setValue(0, "TemplateSize", photo.length);
		
		app.lookup("VMVTR_opbFAWRegist").value="0";	
	}else{
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_WarnVisitPhotoNotRegistered"));
	}
}

// 카드 등록 클릭
function onVMVTR_btnCDRegistClick(/* cpr.events.CMouseEvent */ e){
	var cResult = CheckApprovalUserPrivilege();
	if (cResult == false) {
		return;
	} 
	var userInfo = app.lookup("UserInfo");
	var appld = "app/main/users/userCardRegist";
	app.getRootAppInstance().openDialog(appld, {width : 660, height : 500}, function(dialog){		
		
		var dsUserCardInfo = app.lookup("UserCardInfo");
		dialog.bind("headerTitle").toLanguage("Str_CardRegist");
		dialog.initValue = {"UserID":userInfo.getValue("ID"),"UserCardInfo":dsUserCardInfo,"Mode":"Regist","Url":"/v1/visit"};
		dialog.resizable = false;		
		dialog.modal = true;		
	}).then(function(returnValue){ // 지문 등록 화면에서 적용을 누른 경우에만 이 부분으로 들어옴.		
		
		var dsUserCardInfo = app.lookup("UserCardInfo");
		dsUserCardInfo.clear();
						
		for (var i = 0 ; i < returnValue.length ; i++) {
			dsUserCardInfo.addRowData(returnValue[i]);
			app.lookup("VMVTR_ipbCard").value = returnValue[i].CardNum;
		}		
	});
}

function sendAccessGroupRefresh(){
	var dsAccessGroupList = app.lookup("AccessGroupList");
	dsAccessGroupList.clear();
	
	var sms_getLangList = app.lookup("sms_getAccessGroupList") ;		
	sms_getLangList.send();
}
// 출입그룹 정보 갱신
function onVMVTR_btnAccessGroupRefreshClick(/* cpr.events.CMouseEvent */ e){
	sendAccessGroupRefresh();	
}

// 출입그룹 가져오기 완료
function onSms_getAccessGroupListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		var dsAccessGroupList = app.lookup("AccessGroupList");
		dsAccessGroupList.addRowData({"ID":0,"Name":"----"});
		//dataManager.setAccessGroup(dsAccessGroupList);
		dsAccessGroupList.setSort("ID asc");
		
		var privilege = dataManager.getAccountInfo().getValue("Privilege");
		var cmbAccessGroup = app.lookup("VMVTR_cmbAccessGroup");
		var msg = "";
		
		switch (parseInt(privilege, 10)) {
		case 9001: msg = "아산_방문객"; break;
		case 9002: msg = "울산_방문객"; break;
		case 9003: msg = "문산_방문객"; break;
		default:
		}
		
		var accessGroupNameArr = dsAccessGroupList.getColumnData("Name");
		if (msg.length > 0) {
			if( cmbAccessGroup.getItemCount()>1){
				var selectFlag = 0;
				accessGroupNameArr.forEach(function(name, index) {
				if ( name == msg ) {
					cmbAccessGroup.selectItem(index, false);
					selectFlag++;
					}
				});	

				if ( selectFlag == 0 ) {
					cmbAccessGroup.selectItem(1, false);
				}
			}
		} else {
			if( cmbAccessGroup.getItemCount()>1){			
				cmbAccessGroup.selectItem(1, false);
			}
		}
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}	
}
// 출입그룹 가져오기 에러
function onSms_getAccessGroupListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}
// 출입그룹 가져오기 타임아웃
function onSms_getAccessGroupListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

function validateVisitorInfo(){
	/*
	 아이디, 인증 타입, 인증 수단
	 */
	return true;
} 
// 방문자 등록 클릭
function onVMVTR_btnVisitorAddClick(/* cpr.events.CMouseEvent */ e){
	if( validateVisitorInfo() == false ){
		return;
	}	
	var visitInfo = app.lookup("VisitInfo");
	var visitorInfo = app.lookup("VisitorInfo");
	
	var userInfo = app.lookup("UserInfo");
	
	var userAuthType = userInfo.getValue("AuthInfo");
	var AuthType = userAuthType.split(",");
	var chkAuth = 0;
	for( var idx=0; idx < 7; idx++ ){		
		var checkData = parseInt(AuthType[idx],10);
		if( checkData != 0 ){
			chkAuth++;
			break;
		}		
	}
	
	if( chkAuth == 0 ){
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_InvalidAuthType"));
		return false;
	}
		
	if( IsExistAuthType(AuthTypeFingerPrint) == true ){
	
		var dsUserFPInfo = app.lookup("UserFPInfo");		
		if( dsUserFPInfo.getRowCount() == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_FPDataNotExist"));
			return false;
		}	
	}
	
	if( IsExistAuthType(AuthTypeFace) == true ){	
		var dsUserFaceInfo = app.lookup("UserFaceInfo");		
		if( dsUserFaceInfo.getRowCount() == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_FaceDataNotExist"));
			return false;
		}
	}
	 
	if( IsExistAuthType(AuthTypePassword) == true ){
		var userPassword = userInfo.getValue("Password");
		if( userPassword.length == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_InvalidPassword"));
			return false;
		}
	}
		
	if( IsExistAuthType(AuthTypeCard) == true ){
		var dsUserCardInfo = app.lookup("UserCardInfo");
		var count = dsUserCardInfo.getRowCount();
		for( var index = 0; index < count; index++ ){
			var cardInfo = dsUserCardInfo.getRow(index);
			if( cardInfo.getValue("CardNum").length == 0 ){
				dsUserCardInfo.deleteRow(index);
			}
		}
		dsUserCardInfo.commit();
		if( dsUserCardInfo.getRowCount() == 0 ){
			var ipbCard = app.lookup("VMVTR_ipbCard");
			var cardNum = ipbCard.value;
			if( cardNum != null && cardNum.length > 0){
				dsUserCardInfo.addRowData({"CardNum":cardNum});
			}	
		} 
		
		if( dsUserCardInfo.getRowCount() == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_CardDataNotExist"));
			return false;
		}
	}
	
	if( IsExistAuthType(AuthTypeFaceWT) == true ){
		var dsUserFaceWTInfo = app.lookup("UserFaceWTInfo");
		//console.log(dsUserFaceWTInfo.getRowDataRanged());		
		if( dsUserFaceWTInfo.getRowCount() == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_FaceDataNotExist"));
			return false;
		}
		/*		
		if( visitorInfo.getValue("Photo").length == 0 ){
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_FaceDataNotExist"));
			return false;
		}
		*/ 
	}
	
	
	userInfo.setValue("Name", visitorInfo.getValue("LastName") + visitorInfo.getValue("FirstName"));
	if( app.lookup("VMVTR_cbxVisitorID").value == "true" ){
		visitorInfo.setValue("VisitorID","")
		userInfo.setValue("ID","")
	}else {
		var visitorID = visitorInfo.getValue("VisitorID");
		if( visitorID == undefined ){
			dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitIDInvalid"));			
			return
		}
		
		userInfo.setValue("ID",visitorID)				
	}
	
//	userInfo.setValue("RegistDate", visitInfo.getValue("StartAt"));
//	userInfo.setValue("ExpireDate", visitInfo.getValue("EndAt"));

	userInfo.setValue("RegistDate", app.lookup("VMVTR_dtiStartDate").value);
	userInfo.setValue("ExpireDate", app.lookup("VMVTR_dtiEndDate").value);

	userInfo.setValue("UsePeriodFlag", 1);
	var accessGroupCode = visitorInfo.getValue("AccessGroup");
	console.log(accessGroupCode);
	if (accessGroupCode == null) {
		accessGroupCode = 0;
	}
	userInfo.setValue("AccessGroupCode", accessGroupCode);
	userInfo.setValue("Department", visitorInfo.getValue("Company"));
	userInfo.setValue("Email", visitorInfo.getValue("Email"));
	userInfo.setValue("Phone", visitorInfo.getValue("Mobile"));
	userInfo.setValue("EmployeeNum", visitorInfo.getValue("Birthday"));
	userInfo.setValue("Picture", visitorInfo.getValue("Photo")); // TODO : FAW 사진이 있으면 리사이징해서 전송
	
	var ipbCard = app.lookup("VMVTR_ipbCard");
	if( ipbCard.value != null && ipbCard.value.length > 0) {
		var dsUserCardInfo = app.lookup("UserCardInfo");
		if( dsUserCardInfo.getRowCount() == 0 ){		
			dsUserCardInfo.addRowData({'CardNum':app.lookup("VMVTR_ipbCard").value});
		}
	}
	
	var sms_postVisitorRegist = app.lookup("sms_postVisitorRegist");
	sms_postVisitorRegist.action = "/v1/visit/visitApplication/"+visitInfo.getValue("VisitIndex")+"/visitor/"+visitorInfo.getValue("VisitorIndex");
	sms_postVisitorRegist.send();
}

// 방문객 등록 완료
function onSms_postVisitorRegistSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){
		app.close("success");
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}	
}

// 방문객 등록 에러
function onSms_postVisitorRegistSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 방문객 등록 타임아웃
function onSms_postVisitorRegistSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

// 취소 버튼 클릭
function onVMVTR_btnCancelClick(/* cpr.events.CMouseEvent */ e){
	app.close("cancle");
}

//
function onVMVTR_rdbAuthInputTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.RadioButton */
	var rdbAuthInputType = e.control;
	if(rdbAuthInputType.value==0){ // 직접 입력
		app.lookup("VMVTR_grpAuth1").enabled = true;
		app.lookup("VMVTR_grpAuth2").enabled = true;
		app.lookup("VMVTR_btnAuthLinkSend").enabled = false;
		app.lookup("VMVTR_btnAuthTypeModify").enabled = true;		
	}else{
		app.lookup("VMVTR_grpAuth1").enabled = false;
		app.lookup("VMVTR_grpAuth2").enabled = false;
		app.lookup("VMVTR_btnAuthLinkSend").enabled = true;
		app.lookup("VMVTR_btnAuthTypeModify").enabled = false;
		
		var userInfo = app.lookup("UserInfo");
	
		var AuthType = userInfo.getValue("AuthInfo").split(',');	
		var orAuth = false;
		if( AuthType[7] == 0){
			orAuth = true;
		}	
		var fawExist = false;
		var pwExist = false;
		
		var newAuthType="";
		var finish = false;
		var idx=0;
		for( ; idx < 8; idx++ ){			
			var authType = parseInt(AuthType[idx],10);
			if( authType == AuthTypePassword ){
				pwExist = true;								
			}
			if( orAuth == true && pwExist == true && idx == 2){ // or인증 패스워드 포함인 경우 인증 수단은 2개까지
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeORPasswordWarning"));
				rdbAuthInputType.value = 0
				return;
			}
			if( idx == 3 ){ // 인증 수단은 최대 3개. FAW를 추가할 공간이 없다.
				dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserAuthTypeMaxExceed"));
				rdbAuthInputType.value = 0
				return;
			}
			if( authType ==  0 ){
				if( fawExist == false ){
					AuthType[idx] = AuthTypeFaceWT;
				}
				finish = true;
			}	
			if(authType == AuthTypeFaceWT){
				fawExist = true;
			}	
			if(newAuthType.length !=0){
				newAuthType += ",";
			}
			newAuthType += 	AuthType[idx];
			
			if( finish == true ){
				break;
			}
		}
		for( var i = idx+1; i < 7; i++ ){
			newAuthType += ",0";			
		}
		newAuthType+=","+AuthType[7];
		userInfo.setValue("AuthInfo",newAuthType);	
		
		onDisplayAuthType();
	}
}

// 인증수단 등록 링크 발송
function onVMVTR_btnAuthLinkSendClick(/* cpr.events.CMouseEvent */ e){
	var visitInfo = app.lookup("VisitInfo");
	var visitorInfo = app.lookup("VisitorInfo");
	var email = visitorInfo.getValue("Email");
	if( email == undefined || email.length < 1){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitEmailInvalid"));
		return;
	}
	
	app.getRootAppInstance().openDialog("app/visit/visitInvite", {width : 490, height : 320}, function(dialog){
		dialog.initValue = {"email":email,"mode":"authRegist",
			"visitIndex":visitInfo.getValue("VisitIndex"),"visitorIndex":visitorInfo.getValue("VisitorIndex"),
			"accessGroup":visitorInfo.getValue("AccessGroup")};
		dialog.resizable = false;
		dialog.headerVisible = false;
		dialog.modal = true;		
	}).then(function(returnValue){	
		if(returnValue){
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_VisitLinkSendSuccess"), function(/*cpr.controls.Dialog*/dialog){
				dialog.addEventListenerOnce("close", function(e) {
				var appld = "app/visitor/visitApplicationList";
				cpr.core.App.load(appld, function(newapp) {
				location.reload();	
					});
				});
			});
		}
	});
}

exports.setVisitLoginInfo = function(loginInfo){
	var dmLoginInfo = app.lookup("LoginInfo");
	dmLoginInfo.build(loginInfo);		
}

// 로그아웃
function onVMVAD_btnLogoutClick(/* cpr.events.CMouseEvent */ e){
	app.lookup("sms_logout").send();	
}


// 로그아웃 서브미션 done
function onSms_logoutSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var appld = "app/visitLogin";
	cpr.core.App.load(appld, function(newapp) {
		app.getRootAppInstance().close();
		location.reload();
	});
	return;
}

function CheckApprovalUserPrivilege() {
	var accountInfo = dataManager.getAccountInfo();
	var privilege = accountInfo.getValue("Privilege");
	if (privilege > 1 && privilege < 1000){ // 사용자 계정은 사용불가
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorVisitPrivilegeNotPermission"));
		return false;
	}
	return true;
}


/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onVMVTR_ipbPasswordValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var vMVTR_ipbPassword = e.control;
	var cResult = CheckApprovalUserPrivilege();
	if (cResult == false) {
		return;
	} 
}


/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onVMVTR_ipbCardValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var vMVTR_ipbCard = e.control;
	var cResult = CheckApprovalUserPrivilege();
	if (cResult == false) {
		return;
	} 
}
