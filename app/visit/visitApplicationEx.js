/************************************************
 * visitApplication.js
 * Created at 2020. 2. 12. 오후 1:21:28.
 * Prefix : VMVAP_
 * @author fois
 * 직원이 방문신청. 방문 대상이 본인으로 고정
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib = createComUtil(app);
var dateLib = cpr.core.Module.require("lib/DateLib");
var orientation;
var VMVAP_cameraInit = false;
var VMVAP_ver = 0;

function onBodyLoad(/* cpr.events.CEvent */ e){
	
	dataManager = getDataManager();
	
	var today = dateLib.getToday();
	app.lookup("VMVAP_dtiStartDate").value = today;
	app.lookup("VMVAP_dtiStartTime").value = "00:00";
	app.lookup("VMVAP_dtiEndDate").value = today;
	app.lookup("VMVAP_dtiEndTime").value = "23:59";

	var initValue = app.getHost().initValue;	
	VMVAP_ver= initValue["OEM"];
	if( VMVAP_ver == 3 ){
		app.lookup("VMVAP_opb1").unbind("value");
		app.lookup("VMVAP_opb1").value = "참가 신청 관리";
		app.lookup("VMVAP_opb1").redraw();
		
		app.lookup("VMVAP_opb1").unbind("value");
		app.lookup("VMVAP_opb1").value = "참가 신청";
		app.lookup("VMVAP_opb1").redraw();
		
	}
	initControls();
	
	sendVisitTargetInfoRequest();
}

function sendVisitTargetInfoRequest(){
	var accountInfo = dataManager.getAccountInfo();
	var userID = accountInfo.getValue("UserID");
	
	var sms_GetUserList = new cpr.protocols.Submission("sms_GetUserList");
	sms_GetUserList.action = "/v1/visitor/users";
	sms_GetUserList.method = "get";
	sms_GetUserList.mediaType = "application/x-www-form-urlencoded";
		
	sms_GetUserList.addResponseData(app.lookup("Result"), false, "Result");
	sms_GetUserList.addResponseData(app.lookup("UserList"), false, "UserList");
		
	sms_GetUserList.setParameters("searchCategory", "id");	
	sms_GetUserList.setParameters("searchKeyword", userID);
	// smsGetUserList.setParameters("groupID", 0);
	var fields = ["user_id","name","group_code","position_code"];
	sms_GetUserList.setParameters("fields", fields);		
	
	sms_GetUserList.addEventListenerOnce("submit-done", onSms_getUserListSubmitDone);
	sms_GetUserList.addEventListenerOnce("submit-error", onSms_getUserListSubmitError);
	sms_GetUserList.addEventListenerOnce("submit-timeout", onSms_getUserListSubmitTimeout);
	
	comLib.showLoadMask("",dataManager.getString("Str_VisitUserSearching"),"",0);
	sms_GetUserList.send();
}
// 사용자 검색 완료
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){ 
		
		var dsUserList = app.lookup("UserList");
		if (dsUserList.getRowCount()>0){
			var userInfo = dsUserList.getRow(0);
			
			var opbVisitTargetName = app.lookup("VMVAP_obpVisitTargetName");			
			opbVisitTargetName.value = userInfo.getValue("Name");
				
			var opbVisitTargetGroup = app.lookup("VMVAP_obpVisitTargetGroup");
			opbVisitTargetGroup.value = userInfo.getValue("Group")+" / "+userInfo.getValue("Position");
								
			var dmVisitInfo = app.lookup("VisitInfo");
			dmVisitInfo.setValue("VisitTargetID", userInfo.getValue("UserID"));
			dmVisitInfo.setValue("VisitTargetUserName", userInfo.getValue("Name"));
			dmVisitInfo.setValue("VisitTargetGroupName", userInfo.getValue("Group"));
			dmVisitInfo.setValue("VisitTargetPositionName", userInfo.getValue("Position"));
			dmVisitInfo.setValue("Purpose", userInfo.getValue("Name"));
				
			app.lookup("VMVAP_grpVisitInfo").redraw();	
		}
	} else {
		
	}	
}

// 사용자 검색 에러
function onSms_getUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 사용자 검색 타임아웃
function onSms_getUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

//
function initControls(){
	var cmbItemType = app.lookup("VMVAP_cmbItemType");
	cmbItemType.addItem(new cpr.controls.Item("------","0"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeNetworkDevice"),"1"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeStorage"),"2"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeRecordDevice"),"3"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeEtc"),"4"));
	cmbItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeFacilityOperating"),"5"));
		
	var cmbItemName = app.lookup("VMVAP_cmbItemName");
	cmbItemName.addItem(new cpr.controls.Item("-----","0"));
	
	var cmbInOut = app.lookup("VMVAP_cmbInOut");
	cmbInOut.addItem(new cpr.controls.Item("------","0"));
	cmbInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemIn"),"1"));
	cmbInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemOut"),"2"));
	cmbInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemInOut"),"3"));
	
	var cmbGrdItemType = app.lookup("VMVAP_cmbGrdItemType");
	cmbGrdItemType.addItem(new cpr.controls.Item("------","0"));
	cmbGrdItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeNetworkDevice"),"1"));
	cmbGrdItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeStorage"),"2"));
	cmbGrdItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeRecordDevice"),"3"));
	cmbGrdItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeEtc"),"4"));
	cmbGrdItemType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemTypeFacilityOperating"),"5"));
	
	var cmbGrdItemNameType = app.lookup("VMVAP_cmbGrdItemNameType");
	cmbGrdItemNameType.addItem(new cpr.controls.Item("-----","0"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameNotebook"),"1"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNamePC"),"2"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNamePDA"),"3"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNamePMP"),"4"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameMobile"),"5"));			
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameUSB"),"11"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameHard"),"12"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameCD"),"13"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameDisk"),"14"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameRecoder"),"21"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameCamera"),"22"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameCam"),"23"));
	cmbGrdItemNameType.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameVoiceRecoder"),"24"));
				
	var cmbGrdItemInOut = app.lookup("VMVAP_cmbGrdItemInOut");
	cmbGrdItemInOut.addItem(new cpr.controls.Item("------","0"));
	cmbGrdItemInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemIn"),"1"));
	cmbGrdItemInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemOut"),"2"));
	cmbGrdItemInOut.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemInOut"),"3"));
}

// 휴대품 구분 항목 변경시
function onVMVAP_cmbItemTypeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.ComboBox	 */
	var vMVAP_cmbItemType = e.control;
	var cmbItemName = app.lookup("VMVAP_cmbItemName");
	cmbItemName.deleteAllItems();
	
	var type = 0;
	
	switch( vMVAP_cmbItemType.value ){
		case "1":				
			cmbItemName.addItem(new cpr.controls.Item("-----","0"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameNotebook"),"1"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNamePC"),"2"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNamePDA"),"3"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNamePMP"),"4"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameMobile"),"5"));		
			break;
		case "2":
			cmbItemName.addItem(new cpr.controls.Item("-----","0"));			
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameUSB"),"11"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameHard"),"12"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameCD"),"13"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameDisk"),"14"));
			break;
		case "3":
			cmbItemName.addItem(new cpr.controls.Item("-----","0"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameRecoder"),"21"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameCamera"),"22"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameCam"),"23"));
			cmbItemName.addItem(new cpr.controls.Item(dataManager.getString("Str_ItemNameVoiceRecoder"),"24"));
			break;
		case "4":
			type = 1;			
			break;
		case "5":
			type = 1;			
			break;
		default:
			break;
	}
	if( type == 0 ){
		var cmbItemName = app.lookup("VMVAP_cmbItemName").enabled = true;
		var ipbItemName = app.lookup("VMVAP_ipbItemName");
		ipbItemName.enabled = false;
		ipbItemName.value = "";
	} else {
		var cmbItemName = app.lookup("VMVAP_cmbItemName").enabled = false;
			var ipbItemName = app.lookup("VMVAP_ipbItemName").enabled = true;
	}
	
}

function onAlert(title,message){
	dialogAlert(app, dataManager.getString(title), dataManager.getString(message));
}

// 방문 대상 검색 버튼(VMVAP_btnSearchTarget)에서 click 이벤트 발생 시 호출.
function onVMVAP_btnSearchTargetClick(/* cpr.events.CMouseEvent */ e){	
	
	var width = window.innerWidth;
	var height = window.innerHeight;
	if(isMobile() == false){
		width = 400;
		height = 400;
	}
	app.openDialog("app/visit/userSearch", {width : width, height : height}, function(dialog){		
		dialog.headerVisible =false;
		dialog.resizable = false;
		dialog.addEventListenerOnce("close", function(e){
			var result = dialog.returnValue;
			if(result){
				var opbVisitTargetName = app.lookup("VMVAP_obpVisitTargetName");
				var name = result[0]["Name"];
				if( name == undefined ){name = "";}
				opbVisitTargetName.value = name;
				
				var group = result[0]["Group"];
				if( group == undefined ){group = "";}
				var position = result[0]["Position"];
				if( position == undefined ){position = "";}
				
				var opbVisitTargetGroup = app.lookup("VMVAP_obpVisitTargetGroup");
				opbVisitTargetGroup.value = group+" / "+position;
				var dmVisitInfo = app.lookup("VisitInfo");
				dmVisitInfo.setValue("VisitTargetID", result[0]["UserID"]);
				dmVisitInfo.setValue("VisitTargetUserName", name);
				dmVisitInfo.setValue("VisitTargetGroupName", group);
				dmVisitInfo.setValue("VisitTargetPositionName", position);
				
				app.lookup("VMVAP_grpVisitInfo").redraw();				
			}
		})
	});
}

// "취소" 버튼에서 click 이벤트 발생 시 호출.
function onButtonClick(/* cpr.events.CMouseEvent */ e){	
	app.close();
}

function validateVisitInfo(){
	var dmVisitInfo = app.lookup("VisitInfo");
		
	if( dmVisitInfo.getValue("VisitTargetID").length < 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitTargetInvalid"));
		return false
	}
	
	var today = dateLib.getToday();
	var startAt = dmVisitInfo.getValue("StartDate");
	var endAt = dmVisitInfo.getValue("EndDate");
	
	if(dateLib.compareDate( today, startAt ) == 0){
		onAlert("Str_Warning","Str_WarnVisitStartBeforeToday");		
		return false
	}
	
	if(dateLib.compareDate( startAt, endAt ) == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitStarOverEnd"));
		return false
	}
	
	if( dmVisitInfo.getValue("Purpose").length < 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitPurposeInvalid"));
		return false
	}
	
	var dsVisitorList = app.lookup("VisitorList");
	if(dsVisitorList.getRowCount()<1){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitVisitorNotRegistered"));
		return false
	}
	
	return true;
}
// "방문신청" 버튼(VMVAP_btnVisitRequest)에서 click 이벤트 발생 시 호출.
function onVMVAP_btnVisitRequestClick(/* cpr.events.CMouseEvent */ e){	
	if ( validateVisitInfo() == false ){				
		return;
	}
	
	var sms_postVisitApplication = app.lookup("sms_postVisitApplication");
	sms_postVisitApplication.send();
}

// 방문 신청 완료
function onSms_postVisitApplicationSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var dmResult = app.lookup("Result");
	if( dmResult.getValue("ResultCode") == COMERROR_NONE){ 
		app.close("success");
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}	
}

// 방문 신청 에러
function onSms_postVisitApplicationSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR)
}

// 방문 신청 타임아웃
function onSms_postVisitApplicationSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT)
}

function validateVisitorInfo(dmVisitorInfo){
	var lastName = dmVisitorInfo.getValue("LastName");
	if( lastName == null || lastName.length < 1 ){
		onAlert("Str_Warning","Str_WarnVisitNameInvalid");
		return false;		
	}
	var firstName = dmVisitorInfo.getValue("FirstName");
	if( firstName == null || firstName.length < 1 ){
		onAlert("Str_Warning","Str_WarnVisitNameInvalid");
		return false;		
	}
	var birthday = dmVisitorInfo.getValue("Birthday");
	if( birthday == null || birthday.length < 8 ){
		onAlert("Str_Warning","Str_WarnVisitBirthdayInvalid");
		return false;		
	}
	var mobile = dmVisitorInfo.getValue("Mobile");
	if( mobile == null || mobile.length < 8 ){
		onAlert("Str_Warning","Str_WarnVisitMobileInvalid");
		return false;		
	}
	var company = dmVisitorInfo.getValue("Company");
	if( company == null || company.length < 1 ){
		onAlert("Str_Warning","Str_WarnVisitCompanyInvalid");
		return false;		
	}
	var email = dmVisitorInfo.getValue("Email");
	if( email == null || email.length < 1 ){
		onAlert("Str_Warning","Str_WarnVisitEmailInvalid");
		return false;		
	}
	/*
	var carNumber = dmVisitorInfo.getValue("CarNumber");
	if( carNumber == null || carNumber.length < 1 ){
		onAlert("Str_Warning","Str_WarnVisitCarNumberInvalid");
		return false;		
	}
	*/
	return true;
}
// 방문자 "추가" 버튼(VMVAP_btnVisitorAdd)에서 click 이벤트 발생 시 호출.
function onVMVAP_btnVisitorAddClick(/* cpr.events.CMouseEvent */ e){
	var dmVisitorInfo = app.lookup("VisitorInfo");
	if( validateVisitorInfo(dmVisitorInfo) == false ){
		return;
	}	
	var dsVisitorList = app.lookup("VisitorList");
	dsVisitorList.addRowData(dmVisitorInfo.getDatas());
}

// 방문자 "삭제" 버튼(VMVAP_btnVisitorDelete)에서 click 이벤트 발생 시 호출.
function onVMVAP_btnVisitorDeleteClick(/* cpr.events.CMouseEvent */ e){
	var vMVAP_btnVisitorDelete = e.control;
	var grdVisitorList = app.lookup("VMVAP_grdVisitorList");
	var indices = grdVisitorList.getCheckRowIndices();
	for( var i = indices.length; i > 0; i--){
		grdVisitorList.deleteRow(indices[i-1]);		
	}
	grdVisitorList.commitData();
}

// 방문자 사진 "등록" 버튼(VMVAP_btnVisitorPhotoAdd)에서 click 이벤트 발생 시 호출.
function onVMVAP_btnVisitorPhotoAddClick(/* cpr.events.CMouseEvent */ e){	
	if(isMobile()==true){
		var ipbCapture = document.getElementById("camera");
		ipbCapture.click();
	}else{
		app.openDialog("app/visit/userPhotoRegist", {width : 430, height : 440}, function(dialog){		
			dialog.headerVisible =false;
			dialog.resizable = false;
			dialog.addEventListenerOnce("close", function(e){
				var imageSrc = dialog.returnValue;
				if(imageSrc){					
					var dmVisitorInfo = app.lookup("VisitorInfo");
					dmVisitorInfo.setValue("Photo", imageSrc);
			
					var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");					
					var imgVisitor = app.lookup("VMVAP_imgVisitorPhoto");					
					imgVisitor.style.css({
							"background-image" : 'url(data:image/jpg;base64,'+imageSrc+')',
							"background-repeat" : "none",
							"background-position" : "center",
							"background-size" : "cover"
					});					
					//imgVisitor.putValue('data:image/png;base64,'+imageSrc);
					imgVisitor.redraw();
				}
			})
		});
	}
}

function isMobile() {    
    var pc_device = "win16|win32|win64|mac|macintel";     
    if ( navigator.platform ) { 
        if ( pc_device.indexOf(navigator.platform.toLowerCase()) < 0 ) {
            return true;
        }
	} 
	return false;
 }

// 방문자 사진 "삭제" 버튼(VMVAP_btnVisitorPhotoDelete)에서 click 이벤트 발생 시 호출.
function onVMVAP_btnVisitorPhotoDeleteClick(/* cpr.events.CMouseEvent */ e){
}

function validateItemInfo(dmItemInfo){
	var type = dmItemInfo.getValue("ItemType");
	
	if( type == null || type== 0 || type == ""){
		onAlert("Str_Warning","Str_WarnVisitItemTypeInvalid");
		return false;		
	}
	var nameType = dmItemInfo.getValue("NameType");
	if( (nameType == null || nameType== 0 || nameType == "") && type != 4 && type != 5){
		onAlert("Str_Warning","Str_WarnVisitItemNameTypeInvalid");
		return false;		
	}
	if( type == 4|| type == 5){
		var name = dmItemInfo.getValue("Name");
		if( name == null || name.length < 1 ){
			onAlert("Str_Warning","Str_WarnVisitItemNameInvalid");
			return false;		
		}
	}
	var inOut = dmItemInfo.getValue("InOut");
	if( inOut == null || inOut== 0 || inOut == ""){
		onAlert("Str_Warning","Str_WarnVisitItemInOutInvalid");
		return false;		
	}
	/*
	var serialNum = dmItemInfo.getValue("SerialNum");
	if( serialNum == null || serialNum.length < 1 ){
		onAlert("Str_Warning","Str_WarnVisitItemSerialInvalid");
		return false;		
	}
	* */
	var model = dmItemInfo.getValue("Model");
	if( model == null || model.length < 1 ){
		onAlert("Str_Warning","Str_WarnVisitItemModelInvalid");
		return false;		
	}
	var purpose = dmItemInfo.getValue("Purpose");
	if( purpose == null || purpose.length < 1 ){
		onAlert("Str_Warning","Str_WarnVisitItemPurposeInvalid");
		return false;		
	}
	var unit = dmItemInfo.getValue("Unit");
	if( unit == null || unit.length < 1 ){
		onAlert("Str_Warning","Str_WarnVisitItemUnitInvalid");
		return false;		
	}
	var count = dmItemInfo.getValue("Count");
	if( count == null || count.length < 1 ){
		onAlert("Str_Warning","Str_WarnVisitItemCountInvalid");
		return false;		
	}
	var desc = dmItemInfo.getValue("Desc");
	if( desc == null || desc.length < 1 ){
		onAlert("Str_Warning","Str_WarnVisitItemDescInvalid");
		return false;		
	}
	 
	return true;
}
// 휴대품 "추가" 버튼 click
function onVMVAP_btnItemAddClick(/* cpr.events.CMouseEvent */ e){
	var dmItemInfo = app.lookup("ItemInfo");
	if( validateItemInfo(dmItemInfo) == false ){
		return;
	}	
	var dsItemList = app.lookup("ItemList");
	dsItemList.addRowData(dmItemInfo.getDatas());
}

// 휴대품 "삭제" 버튼  click 
function onVMVAP_btnItemDeleteClick(/* cpr.events.CMouseEvent */ e){	
	var grdItemList = app.lookup("VMVAP_grdItemList");
	var indices = grdItemList.getCheckRowIndices();
	for( var i = indices.length; i > 0; i--){
		grdItemList.deleteRow(indices[i-1]);		
	}
	grdItemList.commitData();
}

// "test" 버튼에서 click 이벤트 발생 시 호출.
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	var dmVisitInfo = app.lookup("VisitInfo");	
	dmVisitInfo.setValue("Purpose","purpose");
	dmVisitInfo.setValue("VisitTargetID","1");
	dmVisitInfo.setValue("Password","0000");
	app.lookup("VMVAP_grpVisitInfo").redraw();
	
	var dmVisitInfo = app.lookup("VisitorInfo");
	dmVisitInfo.setValue("FirstName","first name");
	dmVisitInfo.setValue("LastName","last name");
	dmVisitInfo.setValue("Birthday","20000510");
	dmVisitInfo.setValue("Mobile","01012345678");
	dmVisitInfo.setValue("Company","company");
	dmVisitInfo.setValue("CarNumber","23가2020");
	dmVisitInfo.setValue("Email","test@test.com");
	//dmVisitInfo.setValue("Photo","");
	app.lookup("VMVAP_grpVisitorInfo").redraw();
		
	var dmItemInfo = app.lookup("ItemInfo");
	dmItemInfo.setValue("ItemType","1");
	dmItemInfo.setValue("NameType","12");
	dmItemInfo.setValue("Name","");
	dmItemInfo.setValue("InOut","1");
	dmItemInfo.setValue("SerialNum","s1234");
	dmItemInfo.setValue("Model","m1234");
	dmItemInfo.setValue("Purpose","purpose");
	dmItemInfo.setValue("Unit","unit1");
	dmItemInfo.setValue("Count","2");
	dmItemInfo.setValue("Desc","desc");
	app.lookup("VMVAP_grpItemInfo").redraw();
}

// 시작일 변경에서 before-value-change 이벤트 발생 시 호출.
function onVMVAP_dtiStartDateBeforeValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.DateInput	 */
	var dtiStartDate = e.control;
	var today = dateLib.getToday();
	var startAt = e.newValue
		
	if(dateLib.compareDate( today, startAt ) == 0){
		onAlert("Str_Warning","Str_WarnVisitStartBeforeToday");
		e.preventDefault();		
		return;
	}
}

// 종료일 변경에서 before-value-change 이벤트 발생 시 호출.
function onVMVAP_dtiEndDateBeforeValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.DateInput */
	var dtiEndDate = e.control;
	
	var startAt = app.lookup("VMVAP_dtiStartDate").value;
	var endAt = e.newValue
		
	if(dateLib.compareDate( startAt, endAt ) == 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_WarnVisitStarOverEnd"));
		e.preventDefault();
		return;
	}
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onVMVAP_shlCanvasLoad(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var vMVAP_shlCanvas = e.control;
	var content = e.content;
	content.innerHTML = "<canvas width=\"0px\" height=\"0px\" id=\"captureCanvas\"></canvas>";
		
}

function onCameraChangeEvent(e){
	
	var file = e.target.files[0]; 
	    
	var reader = new FileReader();
	reader.readAsDataURL( file);
    	
	reader.onload = function  () {
		var exif = EXIF.readFromBinaryFile(base64ToArrayBuffer(this.result));	
		orientation = exif.Orientation;
		if( orientation == undefined ){orientation = "undefined";}
						
		var tempImage = new Image();    	
		tempImage.src = reader.result;

		tempImage.onload = function () {
			var canvas = document.getElementById("captureCanvas");
			    			
			    			var canvasMax = this.width;
				if( canvasMax < this.height ){canvasMax = this.height}
				if( canvasMax > 1024 ){ canvasMax = 1024;}	    	
		    		    	
	        	while(true){
		        
					canvas.width = canvasMax;
					canvas.height = canvasMax;
				
	        		if( processImage(canvas, this, 130000) == true ){
	        			break;
	        		}
	        		canvasMax -= 100;
        		}	    		
			
	   	}	   	
   	}
}


var orientation;
function processImage(canvas, srcImage, maxSize){
					
	var ctx = canvas.getContext("2d");
	ctx.save();
    	
	var hRatio = canvas.width / srcImage.width;
	var vRatio = canvas.height / srcImage.height;
	var ratio  = Math.min ( hRatio, vRatio );
	var centerShift_x = ( canvas.width - srcImage.width*ratio ) / 2;
   	var centerShift_y = ( canvas.height - srcImage.height*ratio ) / 2;
		
	//orientation = 0
   	switch(orientation){
		case 2:          // horizontal flip				            
	        ctx.translate(canvas.width, 0);
	        ctx.scale(-1, 1);
	        break;
	    case 3:
	        // 180° rotate left				            
	        ctx.translate(canvas.width, canvas.height);
	        ctx.rotate(Math.PI);
	        break;
	    case 4:
	        // vertical flip
	        ctx.translate(0, canvas.height);
	        ctx.scale(1, -1);
	        break;
	    case 5:
	        // vertical flip + 90 rotate right
	        ctx.rotate(0.5 * Math.PI);
	        ctx.scale(1, -1);
	        break;
	    case 6:	    	
	        // 90° rotate right				            
	        ctx.rotate(0.5 * Math.PI);
	        ctx.translate(0, -canvas.height);  
	        break;
	    case 7:
	        // horizontal flip + 90 rotate right
	        ctx.rotate(0.5 * Math.PI);
	        ctx.translate(canvas.width, -canvas.height);
	        ctx.scale(-1, 1);
	        break;
	    case 8:
	        // 90° rotate left
            ctx.rotate(-0.5 * Math.PI);
            ctx.translate(-canvas.width, 0);
            break;
   	}				    
				    
	ctx.drawImage(srcImage, 0,0, srcImage.width, srcImage.height,
		centerShift_x,centerShift_y,srcImage.width*ratio, srcImage.height*ratio);	    	
	
	    	
	var imageSrc = canvas.toDataURL("image/jpeg");
	var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");	
	
	canvas.width = 0;
	canvas.height = 0;
	
	ctx.clearRect(0, 0, srcImage.width, srcImage.height);
	ctx.beginPath();
		
	ctx.restore();
	
	console.log(imageData.length);
	if(imageData.length >= maxSize ){		
		return false
	}
		
	
	var dmVisitorInfo = app.lookup("VisitorInfo");
	dmVisitorInfo.setValue("Photo", imageData);
		
	var imgPhoto = app.lookup("VMVAP_imgVisitorPhoto");			
	imgPhoto.src = imageSrc;				
	imgPhoto.redraw();
		
	return true;
}

function base64ToArrayBuffer (base64) {
    base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
    var binaryString = atob(base64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onVMVAP_shlCameraLoad(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var vMVAP_shlCamera = e.control;
	var content = e.content;
	
	content.innerHTML = "<input id=\"camera\" style=\"width:0px;visibility:hidden\" type=\"file\" accept=\"image/*\" capture=\"camera\"/>";
	content.addEventListener('change', onCameraChangeEvent);
}


/*
 * 버튼(VMSRP_btnRotateLeft)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVMSRP_btnRotateLeftClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vMSRP_btnRotateLeft = e.control;
	rotateImage(0);
	
}

var rotateAngle = 0;
function rotateImage( direction){
	
	var imgPhoto = app.lookup("VMVAP_imgVisitorPhoto");
	
	if (direction == 0) {
		rotateAngle -= 90;
	} else {
		rotateAngle += 90;
	}
	imgPhoto.style.css({"transform": "rotate("+rotateAngle+"deg)"});
		    		    	
	var dmVisitorInfo = app.lookup("VisitorInfo");
	var imgData = dmVisitorInfo.getValue("Photo");	
	
	var tempImage = new Image();
	tempImage.src = 'data:image/png;base64,'+imgData;
        
    tempImage.onload = function () {
		var canvas = document.getElementById("captureCanvas");
				    	
		var canvasMax = this.width;
		if( canvasMax < this.height ){canvasMax = this.height}
		
		canvas.width = canvasMax;
		canvas.height = canvasMax;
		
		var ctx = canvas.getContext("2d");
		ctx.save();
	    	
		var hRatio = canvas.width / this.width;
		var vRatio = canvas.height / this.height;
		var ratio  = Math.min ( hRatio, vRatio );
		var centerShift_x = ( canvas.width - this.width*ratio ) / 2;
	   	var centerShift_y = ( canvas.height - this.height*ratio ) / 2;
	
		
				//ctx.rotate(0.5 * Math.PI);
	        	//ctx.translate(0, -canvas.height); 
		
				ctx.rotate(-0.5 * Math.PI);
            	ctx.translate(-canvas.width, 0); 
		
		/*
		if (direction == 0) {
			ctx.rotate(-0.5 * Math.PI);
            ctx.translate(-canvas.width, 0);
		}else{
			ctx.rotate(0.5 * Math.PI);
	        ctx.translate(0, -canvas.height);  
		}
		* */
	 			    
		ctx.drawImage(this, 0,0, this.width, this.height,
			centerShift_x,centerShift_y,this.width*ratio, this.height*ratio);	    	
	    	
		var imageSrc = canvas.toDataURL("image/jpeg");
		var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");	
	
		canvas.width = 0;
		canvas.height = 0;	
		ctx.clearRect(0, 0, this.width, this.height);
		ctx.beginPath();			
		ctx.restore();
	
		//var dmVisitorInfo = app.lookup("VisitorInfo");
		dmVisitorInfo.setValue("Photo", imageData);
    }			   
}
