/************************************************
 * VisitApplicantForeignExcelArmyHQ.js
 * Created at 2021. 1. 18. 오전 10:34:01.
 *
 * @author blue1
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var util = cpr.core.Module.require("lib/util")
var usint_version;
var rABS = true; // T : 바이너리, F : 어레이 버퍼
var srcTitle;
var initDay;
var utilLib = cpr.core.Module.require("lib/util");
var eDate; // 출입신청 종료일 . 선택 잘 못할 경우 이전 값으로 되돌리기 위해 전역선언 -mjy

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
	usint_version = dataManager.getSystemVersion();
	srcTitle = new Array();
	var grdVisitInfo = app.lookup("VAFEAMHQ_grdVisitorInfo");
	for(var i=0;i<grdVisitInfo.getColumnWidths().length;i++){
		srcTitle[i] = grdVisitInfo.header.getColumn(i).text;
	}
	
	var today = dateLib.getToday();
	initDay = dateLib.nextDate(today, 1, "-");
	
	var cmbUserAccessGroup = app.lookup("VAFEAMHQ_cmbUserAccessGroup");	
	var accessGroup = dataManager.getAccessGroup();
	cmbUserAccessGroup.addItem(new cpr.controls.Item("------", 0));
	var accessGroupCnt = accessGroup.getRowCount();
	for (var i=0; i < accessGroupCnt; i++) {
		if (accessGroup.getRow(i).getValue("VisitEnable") == 1) {
			cmbUserAccessGroup.addItem(new cpr.controls.Item(accessGroup.getRow(i).getValue("Name"), accessGroup.getRow(i).getValue("ID")));		
		}
	}

	cmbUserAccessGroup.selectItemByValue(0);
		
	var cmbUserTargetUserPosition = app.lookup("VAFEAMHQ_cmbTargetUserPosition");	
	cmbUserTargetUserPosition.setItemSet(dataManager.getPositionList(), {
		label: "Name",
		value: "PositionID"		
	});	
	cmbUserTargetUserPosition.addItem(new cpr.controls.Item("------", 0));
	cmbUserTargetUserPosition.selectItemByValue(0);
		
	var cmbTargetUserGroup = app.lookup("VAFEAMHQ_cmbTargetUserGroup");	
	cmbTargetUserGroup.setItemSet(dataManager.getGroup(), {
		label: "Name",
		value: "GroupID"		
	});
	cmbTargetUserGroup.addItem(new cpr.controls.Item("------", 0));
	cmbTargetUserGroup.selectItemByValue(0);
	
	app.lookup("VAFEAMHQ_dtiAccessStart").value = initDay;
	app.lookup("VAFEAMHQ_dtiAccessEnd").value = initDay;	
	
	//민간인 일괄방문신청 excel 양식
	var link = app.lookup("VAFEAMHQ_sniDownloadLink");
	link.value=	"<a href=\"/setup/custom_armyhq/민간인일괄신청양식.xlsx\" target=\"_blank\">양식 다운로드</a>";

	var accountInfo = dataManager.getAccountInfo();
	var UserID = Number(accountInfo.getValue("UserID"));
	
	//마스터일 경우
	if ( UserID == 1000000000000000000 ) {
		return;
	} else {	
		var userID = dataManager.getAccountID();
		var sms_getUserInfo = app.lookup("sms_getUserInfo");
		sms_getUserInfo.action = "/v1/armyhq/users/"+userID;
		sms_getUserInfo.send();		
	}
}

exports.initAllControl = function(){
	app.lookup("VAFEAMHQ_fiUserFile").value = "";
	// app.lookup("VAFEAMHQ_grdVisitorInfo").clear();
	app.lookup("dsAccessApplicationInfo").clear();
	
	app.lookup("VAFEAMHQ_dtiAccessStart").value = initDay;
	app.lookup("VAFEAMHQ_dtiAccessEnd").value = initDay;
	
	app.lookup("VAFEAMHQ_opbUserName").value = "";
	app.lookup("VAFEAMHQ_cmbTargetUserPosition").selectItemByValue(0);
	app.lookup("VAFEAMHQ_cmbTargetUserGroup").selectItemByValue(0);
	// app.lookup("VAFEAMHQ_rdbPredecessor").value = 0;
	
	app.lookup("VAFEAMHQ_cmbUserAccessGroup").selectItemByValue(0);
	app.lookup("VAFEAMHQ_ipb1stApprovalName").value = "";
	app.lookup("VAFEAMHQ_ipb1stApprovalGroup").value = "";
	app.lookup("VAFEAMHQ_ipb2stApprovalName").value = "";
	app.lookup("VAFEAMHQ_ipb2stApprovalGroup").value = "";
}

exports.setApprovalOptioin = function(optionVaule) {
	var apOption = app.lookup("VAFEAMHQ_rdbPredecessor");
	// 승인옵션 라디오를 모이지 않게 처리하고, 옵션 내역만 띄우는 output 추가 - sep
	var outPut_apOption = app.lookup("VAFEAMHQ_opdPredecessor");
	switch (optionVaule) {	
	case 1:
		apOption.addItem(new cpr.controls.Item("1차 승인", 1));
		apOption.selectItem(0);
		outPut_apOption.value = "1차 승인";
		break;
	case 2:
		apOption.addItem(new cpr.controls.Item("2차 승인", 2));
		apOption.selectItem(0);
		outPut_apOption.value = "2차 승인";
		break;
	case 3:
		/* 
		apOption.addItem(new cpr.controls.Item("1차 승인", 1));
		apOption.addItem(new cpr.controls.Item("2차 승인", 2));
		*/
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		apOption.selectItem(0);
		outPut_apOption.value = "1, 2차 승인";	
		break;
	case 4:
		apOption.addItem(new cpr.controls.Item("전결", 4));
		apOption.selectItem(0);
		outPut_apOption.value = "전결";
		break;
	// 2차 추가 개발부터는 1 ~ 4까지의 값만 사용하지만 이전 1차 개발에는 7까지 값을 사용했기 때문에 오류 방지를 위해 아래의 case 구문을 남겨둡니다. - sep	
	case 5:
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		outPut_apOption.value = "1, 2차 승인";	
		/* 
		apOption.addItem(new cpr.controls.Item("1차 승인", 1));
		apOption.addItem(new cpr.controls.Item("전결", 4));
		*/
		apOption.selectItem(0);
		break;
	case 6:
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		outPut_apOption.value = "1, 2차 승인";	
		/*
		apOption.addItem(new cpr.controls.Item("2차 승인", 2));
		apOption.addItem(new cpr.controls.Item("전결", 4));
		*/ 
		apOption.selectItem(0);
		break;
	case 7:
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		outPut_apOption.value = "1, 2차 승인";	 
		/*
		apOption.addItem(new cpr.controls.Item("1차 승인", 1));
		apOption.addItem(new cpr.controls.Item("2차 승인", 2));
		apOption.addItem(new cpr.controls.Item("1,2차 승인", 3));
		apOption.addItem(new cpr.controls.Item("전결", 4));
		*/ 
		apOption.selectItem(0);
		break;
	}
	apOption.redraw();
	outPut_apOption.redraw();
}

// vaidatdCheck
exports.validateData = function(){
	
	var dsAcApInfo = app.lookup("dsAccessApplicationInfo");
	if (dsAcApInfo.getRowDataRanged().length == 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMYHQ_NoVisitorInformation"));
		return false;
	}
	
	// 엑셀에서 가져온 데이터 필수값이 검사
	if (dsAcApInfo.findFirstRow("Name == null") != null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "Excel file: " + dataManager.getString("Str_ARMY_UserNameInvalid"));
		return false;
	}
	if (dsAcApInfo.findFirstRow("Birthday == null") != null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "Excel file: " + dataManager.getString("Str_ARMY_BirthdayInvalid"));
		return false;
	}
	if (dsAcApInfo.findFirstRow("Mobile == null") != null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "Excel file: " + dataManager.getString("Str_ARMY_UserMobileInvalid"));
		return false;
	}
	if (dsAcApInfo.findFirstRow("VisitPurpose == null") != null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "Excel file: " + dataManager.getString("Str_ARMY_PurposeVisitInvalid"));
		return false;
	}
	if (dsAcApInfo.findFirstRow("Address == null") != null) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "Excel file: " + dataManager.getString("Str_ARMY_CompanyAddressInvalid"));
		return false;
	}
	
	// 방문 시작 종료일 검사
	var today = dateLib.getToday();
	var startAt =app.lookup("VAFEAMHQ_dtiAccessStart").value;
	startAt = startAt.replace(/-/gi,"");
	var endAt = app.lookup("VAFEAMHQ_dtiAccessEnd").value;
	endAt = endAt.replace(/-/gi,"");
	
	if(dateLib.compareDate( today, startAt ) == 0){	
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_WarnAccessStartBeforeToday"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VAFEAMHQ_dtiAccessStart").focus(true);			
			});
		});		
		return false;
	}
	
	if(dateLib.compareDate( startAt, endAt ) == 0){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_WarnAccessStarOverEnd"), function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				app.lookup("VAFEAMHQ_dtiAccessEnd").focus(true);			
			});
		});
		return false
	}
	
	if( app.lookup("VAFEAMHQ_dtiAccessStart").value == null || app.lookup("VAFEAMHQ_dtiAccessStart").value.length < 10 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserAccessStartInvalid"));
		return false;
	}
	
	if( app.lookup("VAFEAMHQ_dtiAccessEnd").value == null || app.lookup("VAFEAMHQ_dtiAccessEnd").value.length < 10 ){
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ARMY_UserAccessEndInvalid"));
		return false;
	}
	
	if (!checkNullControl("VAFEAMHQ_opbUserName", "Str_ARMY_TargetUserInvalid")){ return false; }
	if (!checkZeroControl("VAFEAMHQ_cmbUserAccessGroup", "Str_ARMY_UserAccessGroupInvalid")){ return false; }
	
	switch (app.lookup("VAFEAMHQ_rdbPredecessor").value) {
	case 1:
		if (!checkNullControl("VAFEAMHQ_ipb1stApprovalName", "Str_ARMY_1stApprovalInvalid")){ return false; }
		break;
	case 2:
		if (!checkNullControl("VAFEAMHQ_ipb2stApprovalName", "Str_ARMY_2stApprovalInvalid")){ return false; }
		break;
	case 3:
		if (!checkNullControl("VAFEAMHQ_ipb1stApprovalName", "Str_ARMY_1stApprovalInvalid")){ return false; }
		if (!checkNullControl("VAFEAMHQ_ipb2stApprovalName", "Str_ARMY_2stApprovalInvalid")){ return false; }
		break;
	}

}

exports.getVisitorInfoLength = function(){
	return app.lookup("dsAccessApplicationInfo").getRowCount();
}
exports.CheckCarNumberDuplication = function() {
	var cnt = 0;
	var dsAccessApplicationInfoList = app.lookup("dsAccessApplicationInfo");
	if (dsAccessApplicationInfoList.getRowCount() <= 0) {
		return 0;
	}
	var endIndex = dsAccessApplicationInfoList.getRowCount();
	for (var i = 0; i < endIndex;i++) {
		var rowData = dsAccessApplicationInfoList.getRow(i);
		var curCarNumber = rowData.getValue("CarNumber");
		var startIndex = i+1;
		if (startIndex > endIndex) {
			startIndex = endIndex
		}
		var getRowData = dsAccessApplicationInfoList.findAllRow("CarNumber == '" + curCarNumber + "'" , startIndex, endIndex);
		if (getRowData.length > 0) {
			return getRowData.length;
		} else {
			return 0;
		}
	}
 	return 
}
// 데이터 맵 값 입력 
exports.getApplicationInfoDataMap = function(dataMap, index){
	var dsRow = app.lookup("dsAccessApplicationInfo").getRow(index);
	
	var name = dsRow.getValue("Name").trim();
	dataMap.setValue("Name", name);
	//dataMap.setValue("Name", dsRow.getValue("Name"));
	dataMap.setValue("Birthday", dsRow.getValue("Birthday"));
	dataMap.setValue("Mobile", dsRow.getValue("Mobile"));
	dataMap.setValue("VisitPurpose", dsRow.getValue("VisitPurpose"));
	dataMap.setValue("UserClass", nullToEmpty(dsRow.getValue("UserClass")));

	dataMap.setValue("AccessStart", app.lookup("VAFEAMHQ_dtiAccessStart").value);
	dataMap.setValue("AccessEnd", app.lookup("VAFEAMHQ_dtiAccessEnd").value);
	var carNumber = dsRow.getValue("CarNumber").trim();
	dataMap.setValue("CarNumber", nullToEmpty(carNumber));
	//dataMap.setValue("CarNumber", nullToEmpty(dsRow.getValue("CarNumber")));
	dataMap.setValue("CarType", nullToEmpty(dsRow.getValue("CarType")));
	dataMap.setValue("CarBlackbox", nullToEmpty(dsRow.getValue("CarBlackbox")));
	dataMap.setValue("CarColor", nullToEmpty(dsRow.getValue("CarColor")));
	
	dataMap.setValue("VisitTargetUserID", app.lookup("UnitMember").getValue("ID"));
	dataMap.setValue("VisitTargetName", app.lookup("UnitMember").getValue("Name"));
	dataMap.setValue("VisitTargetPosition", app.lookup("VAFEAMHQ_cmbTargetUserPosition").getSelection()[0].label);
	dataMap.setValue("VisitTargetGroup", app.lookup("VAFEAMHQ_cmbTargetUserGroup").getSelection()[0].label);
	dataMap.setValue("VisitTargetDepartment", app.lookup("UnitMember").getValue("Department"));
	
	console.log(app.lookup("UnitMember").getValue("Department"));
	
	dataMap.setValue("AccessGroup", app.lookup("VAFEAMHQ_cmbUserAccessGroup").value);
	dataMap.setValue("Predecessor", app.lookup("VAFEAMHQ_rdbPredecessor").value);
	dataMap.setValue("1stApproval", app.lookup("VAFEAMHQ_opb1stApprovalID").value);
	dataMap.setValue("2stApproval", app.lookup("VAFEAMHQ_opb2stApprovalID").value);
	
	dataMap.setValue("UserType", UserPrivArmyForeign);
	dataMap.setValue("Address", dsRow.getValue("Address"));
	dataMap.setValue("GroupCode", app.lookup("VAFEAMHQ_cmbTargetUserGroup").value);
}

exports.getApprovalInfoDataMap = function(dataMap){
	dataMap.setValue("Predecessor", app.lookup("VAFEAMHQ_rdbPredecessor").value);
	dataMap.setValue("1stApprovalID", app.lookup("VAFEAMHQ_opb1stApprovalID").value);
	dataMap.setValue("1stApprovalName", app.lookup("VAFEAMHQ_ipb1stApprovalName").value);
	dataMap.setValue("1stApprovalGroup", app.lookup("VAFEAMHQ_ipb1stApprovalGroup").value);
	dataMap.setValue("2stApprovalID", app.lookup("VAFEAMHQ_opb2stApprovalID").value);
	dataMap.setValue("2stApprovalName", app.lookup("VAFEAMHQ_ipb2stApprovalName").value);
	dataMap.setValue("2stApprovalGroup", app.lookup("VAFEAMHQ_ipb2stApprovalGroup").value);
}

function nullToEmpty(value) {
	if (value == null) {
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

/*
 * "..." 버튼(VAFEAMHQ_btnSelectUnitMember)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVAFEAMHQ_btnSelectUnitMemberClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/custom/army_hq/users/userSelectOne";
	app.getRootAppInstance().openDialog(appld, {width : 755, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.style.header.css("background-color", "#528443");
		dialog.initValue = {
			DelColunm: [14,13,12,11,10,9,8,6,4],
			Fields:["user_id","name","unique_id","privilege","position_code", "group_code", "department"],
			UnVisibles: [1],
			SearchType:"NO" // 처음 방문자 선택 창 띄울때 리스트 가져오지 않도록 하기 위해 수정 - pse
			//SearchType:"10000"
		};
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != null ){
			var unitMember = app.lookup("UnitMember");
			unitMember.setValue("ID", returnValue["ID"]);
			unitMember.setValue("Name", returnValue["Name"]);
			unitMember.setValue("Position", returnValue["PositionCode"]);
			unitMember.setValue("Group", returnValue["GroupCode"]);
			unitMember.setValue("Department", returnValue["Department"]);
		}
	});		
}

/*
 * "..." 버튼(VAFEAMHQ_btn1stApproval)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVAFEAMHQ_btn1stApprovalClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/main/users/approvalUser";
	app.openDialog(appld, {width : 500, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_ApproverSelect");
		dialog.style.header.css("background-color", "#528443");
		dialog.initValue = {"ApprovalLevel":1};
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != null ){
			var groupName = dataManager.getGroupName(returnValue.getValue("GroupCode"));
			app.lookup("VAFEAMHQ_opb1stApprovalID").value = returnValue.getValue("ID");
			app.lookup("VAFEAMHQ_ipb1stApprovalName").value = returnValue.getValue("Name");
			app.lookup("VAFEAMHQ_ipb1stApprovalGroup").value = groupName;
		}
	});
}

/*
 * "..." 버튼(VAFEAMHQ_btn2stApproval)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVAFEAMHQ_btn2stApprovalClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/main/users/approvalUser";
	app.openDialog(appld, {width : 500, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_ApproverSelect");
		dialog.style.header.css("background-color", "#528443");
		dialog.initValue = {"ApprovalLevel":2};
		dialog.modal = true;
	}).then(function(returnValue){
		if( returnValue != null ){
			var groupName = dataManager.getGroupName(returnValue.getValue("GroupCode"));
			app.lookup("VAFEAMHQ_opb2stApprovalID").value = returnValue.getValue("ID");
			app.lookup("VAFEAMHQ_ipb2stApprovalName").value = returnValue.getValue("Name");
			app.lookup("VAFEAMHQ_ipb2stApprovalGroup").value = groupName;
		}
	});		
}

var carNumberMap = new Map();
/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onVAFEAMHQ_fiUserFileValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.FileInput
	 */
	var my_file_input = e.control;
	var files = my_file_input.files;
	carNumberMap.clear();
	
    var i,f;
    for (i = 0; i != files.length; ++i) {
        f = files[i];        
        
        var reader = new FileReader();
        var name = f.name;
        
        var ext = utilLib.getExtensionOfFilename(name);
        if (ext.toUpperCase()!="XLS" && ext.toUpperCase()!="XLSX" ) {
        	dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "확장자가  XLS, XLSX 이외의 파일은 업로드 할 수 없습니다.");
        	continue;
        }
 
        reader.onload = function(e) {
            var data = e.target.result;
 
            var workbook;
 
            if(rABS){ /* if binary string, read with type 'binary' */                
                workbook = XLSX.read(data, {type: 'binary'});
            } else {  /* if array buffer, convert to base64 */
                var arr = fixdata(data);
                workbook = XLSX.read(btoa(arr), {type: 'base64'});
            }
            
            var first_sheet_name = workbook.SheetNames[0]; // 처음 시트의 명칭 얻기 			 	
 			var worksheet1 = workbook.Sheets[first_sheet_name]; 					
 			var rangeLabel = worksheet1['!ref'].split(':');
 			
			var result = [];
			var row;
			var rowNum;
			var colNum;
			var range = XLSX.utils.decode_range(worksheet1['!ref']);
				
			for(rowNum = range.s.r; rowNum <= range.e.r; rowNum++){				
				row = [];
				for(colNum=range.s.c; colNum<=range.e.c; colNum++){					
					var nextCell = worksheet1[
						XLSX.utils.encode_cell({r: rowNum, c: colNum})
					];
									
          			if( typeof nextCell === 'undefined' ){          				
             			row.push(void 0);
          			} else {
          				row.push(nextCell.w);	          				
          			}
       			}
       			result.push(row);
   			}	
			
   			var appld = "app/popup/ContentSelector" + "?" + usint_version;
   			// 가져오기 컬럼과 엑셀 파일의 컬럼 매핑을 위한 다이얼로그 팝업
			app.getRootAppInstance().openDialog(appld, {width : 480, height : 600}, function(dialog){
				dialog.initValue = {"SrcTitle":srcTitle,"Title":result[0]};				
				dialog.bind("headerTitle").toLanguage("Str_ImportContentSetting");
				dialog.modal = true;		
			}).then(function(returnValue){								
				var contentMap = new Map();
				for( var idx = 0; idx < returnValue.length; idx++){					
					contentMap.set( returnValue[idx]["SourceName"], returnValue[idx]["ColumnName"] );
				}				
				var userList = new Array();
				var dsUserList = app.lookup("dsAccessApplicationInfo");						
				workbook.SheetNames.forEach(function(item, index, array) {
					var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
										
					for( var idx = 0; idx < json.length; idx++){
						var userInfo = [];						
						srcTitle.forEach(function(item, index){
							var columnName = contentMap.get(item);
							if( columnName != "" && columnName != undefined ){
								var value = { item : json[idx][columnName]};
								userInfo[item]=json[idx][columnName]; // srcColumn-항목별로 언어를 적용한 상태이므로 원본 칼럼을 찾아와 적용
							}
						});
						userList.push(userInfo);
					}
				});		
				
				for(var i=0;i<userList.length;i++){
					var row = dsUserList.addRow();
					
					row.setValue("Name", userList[i][dataManager.getString("Str_ARMY_Name")]);
					row.setValue("Birthday", userList[i][dataManager.getString("Str_DateOfBirth")]);
					row.setValue("Mobile", userList[i][dataManager.getString("Str_ARMY_Mobile")]);
					row.setValue("Address", userList[i][dataManager.getString("Str_ARMY_CompanyAddress")]);
					row.setValue("UserClass", userList[i][dataManager.getString("Str_ARMY_JobUserClasses")]);
					row.setValue("VisitPurpose", userList[i][dataManager.getString("Str_ARMY_PurposeOfVisit")]);
					var carNumber = userList[i][dataManager.getString("Str_CarNumber")];
					if (carNumber == undefined) {
						row.setValue("CarNumber", "");
						row.setValue("CarType", "");
						row.setValue("CarBlackbox", "");
						row.setValue("CarColor", "");
						
					} else {
						carNumber = carNumber.replace(/(\s*)/g, "");
						var exist = carNumberMap.get(carNumber);			
						if( exist == undefined ){
							carNumberMap.set(carNumber,1);
							row.setValue("CarNumber", userList[i][dataManager.getString("Str_CarNumber")]);
							row.setValue("CarType", userList[i][dataManager.getString("Str_ARMY_CarType")]);
							row.setValue("CarBlackbox", userList[i][dataManager.getString("Str_ARMY_CarBlackBox")]);
							row.setValue("CarColor", userList[i][dataManager.getString("Str_ARMY_CarColor")]);
						}
					}
					
				}				
			});
	   			
            /* 워크북 처리 */            
            workbook.SheetNames.forEach(function(item, index, array) {
            	
            	var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[item]); // default : ","
				var csvToFS = XLSX.utils.sheet_to_csv(workbook.Sheets[item], {FS:"\t"} ); // "Field Separator" delimiter between fields
				var csvToFSRS = XLSX.utils.sheet_to_csv(workbook.Sheets[item], {FS:":",RS:"|"} ); // "\n" "Record Separator" delimiter between rows
 
				// html
				var html = XLSX.utils.sheet_to_html(workbook.Sheets[item]);
				var htmlHF = XLSX.utils.sheet_to_html(workbook.Sheets[item], {header:"<html><title='custom'><body><table>", footer:"</table><body></html>"});
				var htmlTable = XLSX.utils.sheet_to_html(workbook.Sheets[item], {header:"<table border='1'>", footer:"</table>"});
 
				// json
				var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
 
				//formulae
				var formulae = XLSX.utils.sheet_to_formulae(workbook.Sheets[item]);
				formulae.filter(function(v,i){return i%13 === 0;});                
            });//end. forEach
        }; //end onload
        if(rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
    }//end. for
}

function rdbPredecessorSelectionChange(){
	switch (Number(app.lookup("VAFEAMHQ_rdbPredecessor").value)) {
	case 1:
		app.lookup("VAFEAMHQ_layout1stHeadApproval").visible = true;
		app.lookup("VAFEAMHQ_layout1stApproval").visible = true;
		app.lookup("VAFEAMHQ_layout2stHeadApproval").visible = false;
		app.lookup("VAFEAMHQ_layout2stApproval").visible = false;
		break;
	case 2:
		app.lookup("VAFEAMHQ_layout1stHeadApproval").visible = false;
		app.lookup("VAFEAMHQ_layout1stApproval").visible = false;
		app.lookup("VAFEAMHQ_layout2stHeadApproval").visible = true;
		app.lookup("VAFEAMHQ_layout2stApproval").visible = true;
		break;
	case 3:
		app.lookup("VAFEAMHQ_layout1stHeadApproval").visible = true;
		app.lookup("VAFEAMHQ_layout1stApproval").visible = true;
		app.lookup("VAFEAMHQ_layout2stHeadApproval").visible = true;
		app.lookup("VAFEAMHQ_layout2stApproval").visible = true;
		break;
	case 4:
		app.lookup("VAFEAMHQ_layout1stHeadApproval").visible = false;
		app.lookup("VAFEAMHQ_layout1stApproval").visible = false;
		app.lookup("VAFEAMHQ_layout2stHeadApproval").visible = false;
		app.lookup("VAFEAMHQ_layout2stApproval").visible = false;
		break;
	}
}

function onVAFEAMHQ_dtiAccessStartValueChange(/* cpr.events.CValueChangeEvent */ e){
	app.lookup("VAFEAMHQ_dtiAccessEnd").value = app.lookup("VAFEAMHQ_dtiAccessStart").value;
}

function onVAFEAMHQ_btnAcGroupSortClick(/* cpr.events.CMouseEvent */ e){
	var btnSort = e.control;
	
	// combobox item 반전
	util.comboboxItemReverse(app.lookup("VAFEAMHQ_cmbUserAccessGroup"));
	
	// 버튼 클래스 스왑
	if (btnSort.style.hasClass("button-sort-desc-amhq")) {
		btnSort.style.removeClass("button-sort-desc-amhq");
		btnSort.style.addClass("button-sort-ase-amhq");
	} else {
		btnSort.style.removeClass("button-sort-ase-amhq");
		btnSort.style.addClass("button-sort-desc-amhq");
	}
	btnSort.redraw();
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUserInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){
		var unitMember = app.lookup("UnitMember");
	
		unitMember.setValue("ID", app.lookup("UserInfo").getValue("ID"));
		unitMember.setValue("Name", app.lookup("UserInfo").getValue("Name"));	
		unitMember.setValue("Position", app.lookup("UserInfo").getValue("PositionCode"));
		unitMember.setValue("Group", app.lookup("UserInfo").getValue("GroupCode"));
		unitMember.setValue("Department", app.lookup("UserInfo").getValue("Department"));
				
		app.lookup("VAFEAMHQ_grpUserInfo").redraw();
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
	
	//1 승인자리스트에 내정보 있는지 받아온다. 있으면 넣
	var userID = dataManager.getAccountID();
	var sms_getApproverList = app.lookup("sms_getApproverList");
	sms_getApproverList.action = "/v1/approvers/" + userID;
	sms_getApproverList.setParameters("MinLevel", 1);
	sms_getApproverList.setParameters("MaxLevel", 1);	
	//sms_getApproverList.setParameters(name, value);
	sms_getApproverList.send(); 
}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getApproverListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getApproverList = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE){		
		var approverList = app.lookup("ApproverList");
		var count = approverList.getRowCount();
	//	if (count == 0) {
		//	dialogAlertAMHQ(app, "경고", "승인자 지정안된 계정입니다. 승인자를 별도로 지정해 주세요.");		
		//} else {
			var approverInfo = approverList.getRow(0);	
		//}
		for( var i = 0; i < count; i++){
			var approverInfo = approverList.getRow(i);
			var groupName = dataManager.getGroupName(approverInfo.getValue("GroupCode"));
			app.lookup("VAFEAMHQ_opb1stApprovalID").value = approverInfo.getValue("ID");
			app.lookup("VAFEAMHQ_ipb1stApprovalName").value = approverInfo.getValue("Name");
			app.lookup("VAFEAMHQ_ipb1stApprovalGroup").value = groupName;
		}
	} else {
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));		
	}
}


/*
 * "삭제" 버튼(VAFEAMHQ_btnRowdelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onVAFEAMHQ_btnRowdeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var vAFEAMHQ_btnRowdelete = e.control;
	var grdVisitorInfo = app.lookup("VAFEAMHQ_grdVisitorInfo");
	var dsAccessUserInfo = app.lookup("dsAccessApplicationInfo");
	var checkUserCount = grdVisitorInfo.getCheckRowIndices().length;
	var checkUserIndices = grdVisitorInfo.getCheckRowIndices();
	if (checkUserCount < 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "사용자 선택을 해주세요");
	} else {
		grdVisitorInfo.deleteRow(checkUserIndices);
		dsAccessUserInfo.deleteRow(checkUserIndices);
		grdVisitorInfo.showDeletedRow = false;
	}
}

/*
 * 데이트 인풋에서 value-change 이벤트 발생 시 호출.
 * Dateinput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onVAFEAMHQ_dtiAccessEndValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.DateInput
	 */
	var vAFEAMHQ_dtiAccessEnd = e.control;
	var sDate = app.lookup("VAFEAMHQ_dtiAccessStart").value;
	var eDateAfter = app.lookup("VAFEAMHQ_dtiAccessEnd");
	var sDate30 = new Date(sDate);
	sDate30.setMonth(sDate30.getMonth()+1);  // 시작일 +1달 뒤 날짜
	
	var date1 = new Date(eDateAfter.value);
	if(date1 > sDate30 ){  // 종료 날짜가  시작일+30일  이후 날짜의 경우  alert
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ARMYHQ_VisitApplicationDateInvalidSelect"));	
		eDateAfter.value = eDate;
	}
}


/*
 * 데이트 인풋에서 before-value-change 이벤트 발생 시 호출.
 * Dateinput의 value를 변경하여 변경된 값이 저장되기 전에 발생하는 이벤트. 다음 이벤트로 value-change가 발생합니다.
 */
function onVAFEAMHQ_dtiAccessEndBeforeValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.DateInput
	 */
	var vAFEAMHQ_dtiAccessEnd = e.control;
	eDate = app.lookup("VAFEAMHQ_dtiAccessEnd").value;  // 선택 이전 날짜 값 저장
}
