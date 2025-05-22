/************************************************
 * userExport.js
 * Created at 2018. 10. 16. 오후 4:48:50.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib;
var USEXP_pageRowCount = 50;
var USEXP_exportCount = 100; // 사용자 내보내기시 한번에 요청 할 사용자 수
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);

	var udcUserList = app.lookup("USEXP_udcUserList");
	udcUserList.setPaging(0, 1, 10, USEXP_pageRowCount);
	udcUserList.deleteColumn([14,0]);

	var initValue = app.getHost().initValue;

	var groupList = dataManager.getGroup();
	var dsGroupList = app.lookup("GroupList");
	groupList.copyToDataSet(dsGroupList);

	var treeGroup = app.lookup("USEXP_treeGroup");
	treeGroup.addItem(new cpr.controls.Item(dataManager.getString("Str_All"), 0));
	treeGroup.redraw();

	var cmbFileFormat = app.lookup("USEXP_cmbFileFormat");
	cmbFileFormat.addItem(new cpr.controls.Item(dataManager.getString("Str_ExcelFormat"), 0));
	cmbFileFormat.addItem(new cpr.controls.Item(dataManager.getString("Str_SelfFormat"), 1));
	cmbFileFormat.selectItemByValue(0,false);
	// TODO : 브랜드 타입별 자체 포맷 내보내기 기능 추가 시 활성화 할 것...
	//cmbFileFormat.addItem(new cpr.controls.Item(dataManager.getString("Str_SelfFormat"), 1));


	var dm_ExportParam = app.lookup("ExportParam")
	dm_ExportParam.setValue("mode", "list");
	sendUserListRequest();
}


// "내보내기" 버튼에서 click 이벤트 발생 시 호출.
function onUSEXP_btnUserExportClick(/* cpr.events.CMouseEvent */ e){

	var totalLabel = app.lookup("USEXP_optTotal");
	var dm_ExportParam = app.lookup("ExportParam");
	dm_ExportParam.setValue("mode", "export");
	dm_ExportParam.setValue("total", parseInt(totalLabel.value));
	dm_ExportParam.setValue("offset", 0);
	
	
	var SelfileFormate = app.lookup("USEXP_cmbFileFormat");
	if (SelfileFormate.value == 0) {
		comLib.showLoadMask("pro",dataManager.getString("Str_UserExport"),"",parseInt(totalLabel.value)/USEXP_exportCount);
		sendUserListRequest();	
	} else {
		comLib.showLoadMask("",dataManager.getString("Str_SelfFormatImport"),"", 20);
		sendUserListExportRequest();
	}
	
}

function sendUserListExportRequest() {
	var searchCtrl = app.lookup("USEXP_udcSearchUser");
	// 검색 조건 세팅
	var sms_getUserListExport = app.lookup("sms_getUserListExport");
	sms_getUserListExport.setParameters("searchCategory", searchCtrl.searchCategory);
	sms_getUserListExport.setParameters("searchKeyword", searchCtrl.searchKeyword);

	if (searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0) {
		sms_getUserListExport.setParameters("searchCategory", searchCtrl.searchCategory);
	} else {
		sms_getUserListExport.setParameters("searchCategory", "");
	}
	
	var groupList = app.lookup("USEXP_treeGroup");
	var group = groupList.getSelectionFirst();
	if (group != undefined && group.value != "") {
		sms_getUserListExport.setParameters("groupID", parseInt(group.value, 10));
	} else {
		sms_getUserListExport.setParameters("groupID", 0);
	}
	sms_getUserListExport.setParameters("subInclude", "true");

	var dm_ExportParam = app.lookup("ExportParam");
	var offset = dm_ExportParam.getValue("offset");
	var totalCnt = dm_ExportParam.getValue("total");
	sms_getUserListExport.setParameters("offset", offset);
	sms_getUserListExport.setParameters("limit", totalCnt); // VirdiType 은 사용자100당 파일 하나.
	sms_getUserListExport.send();
}
/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUserListExportSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	dataManager = getDataManager();
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	
	comLib.hideLoadMask();
	if (ResultCode == COMERROR_NONE) {
		var dmUserExportData = app.lookup("UserExportData");
										
		var dmExportParam = app.lookup("ExportParam");
		var total = dmExportParam.getValue("total");
		var offset = dmExportParam.getValue("offset");
		
		exportUserData(Math.floor(offset / USEXP_exportCount)); 	

		offset += USEXP_exportCount;
				
		if( offset >= total ) {
			dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Success"));			
		} else {			
			dmExportParam.setValue("offset",offset);
			sendUserListExportRequest();		
		}
	} else {
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(ResultCode)));		
	}
}

// 사용자 내보내기 에러
function onSms_getUserListExportSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);	
}

// 사용자 내보내기 타임아웃
function onSms_getUserListExportSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
	const slice = byteCharacters.slice(offset, offset + sliceSize);

	const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
		byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
    
  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

function exportUserData(index) {
	
	var filename = "000" + index + ".dat";
								
	var dmUserExportData = app.lookup("UserExportData");
	var userExportData = dmUserExportData.getValue("Data");	
	
	const contentType = 'application/octet-stream'; // text/plain 테스트 후 이상이 없는 경우 text/plain으로 변경
	
	const blob = b64toBlob(userExportData, contentType);	
	var objURL = URL.createObjectURL(blob);
	
	window.__Xr_objURL_forCreatingFile__ = objURL;
 
    var downloadLink = document.createElement('a'); 	
    downloadLink.download = filename;
    downloadLink.href = objURL;
    document.body.appendChild(downloadLink);
    downloadLink.click();	
    document.body.removeChild(downloadLink);    
    
    window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
}


// 사용자 정의 컨트롤에서 search 이벤트 발생 시 호출.
function onUSEXP_udcSearchUserSearch(/* cpr.events.CUIEvent */ e){
	var udcUserList = app.lookup("USEXP_udcUserList");
	udcUserList.setCurrentPageIndex(1);
	var dm_ExportParam = app.lookup("ExportParam")
	dm_ExportParam.setValue("mode", "list");
	sendUserListRequest();
}

function sendUserListRequest() {

	var searchCtrl = app.lookup("USEXP_udcSearchUser");
	// 검색 조건 세팅
	var smsGetUserList = app.lookup("sms_getUserList");
	smsGetUserList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsGetUserList.setParameters("searchKeyword", searchCtrl.searchKeyword);

	if (searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0) {
		smsGetUserList.setParameters("searchCategory", searchCtrl.searchCategory);
	} else {
		smsGetUserList.setParameters("searchCategory", "");
	}
	var groupList = app.lookup("USEXP_treeGroup");
	var group = groupList.getSelectionFirst();
	if (group != undefined && group.value != "") {
		smsGetUserList.setParameters("groupID", parseInt(group.value, 10));
	} else {
		smsGetUserList.setParameters("groupID", 0);
	}
	smsGetUserList.setParameters("subInclude", "true");

	var dm_ExportParam = app.lookup("ExportParam")
	//console.log(dm_ExportParam.getValue("mode"));
	if( dm_ExportParam.getValue("mode")=="list"){
		var udcUserList = app.lookup("USEXP_udcUserList");
		var curIndex = udcUserList.getCurrentPageIndex();
		var offset = (curIndex - 1) * USEXP_pageRowCount
		smsGetUserList.setParameters("offset", offset);
		smsGetUserList.setParameters("limit", USEXP_pageRowCount);
	} else {

		smsGetUserList.setParameters("offset", dm_ExportParam.getValue("offset"));
		smsGetUserList.setParameters("limit", 1000);
	}
	smsGetUserList.send();
}

// 서브미션에서 submit-success 이벤트 발생 시 호출.
function onSms_getUserListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",0)
}
// 서브미션에서 submit-error 이벤트 발생 시 호출.
function onSms_getUserListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",-1)
}
// 서브미션에서 submit-timeout 이벤트 발생 시 호출.
function onSms_getUserListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result")
	result.setValue("ResultCode",-2)
}
// 서브미션에서 submit-done 이벤트 발생 시 호출.
function onSms_getUserListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/* @type cpr.protocols.Submission */
	var sms_getUserList = e.control;

	dataManager = getDataManager();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if( resultCode == COMERROR_NONE ){

		var dsUserList = app.lookup("UserList");
		var total = dsUserList.getRowCount()
		for( var i = 0; i < total ; i++){
			var userInfo = dsUserList.getRow(i);

			// 필수 / 선택 인증 정보 파싱
			var AuthType = userInfo.getValue("AuthInfo").split(',');

			var setCount = 0;
			var andAuth = "";
			for( var idx=0; idx < AuthType[7]; idx++ ){
				if(AuthType[idx]!="0"){
					andAuth += getAuthTypeString( parseInt(AuthType[idx],10))+" ";
					setCount++;
				}
			}
			var orAuth = "";
			for( var idx=AuthType[7]; idx< AuthType.length-1; idx++ ){
				if(AuthType[idx]!="0"){
					orAuth += getAuthTypeString( parseInt(AuthType[idx],10))+" ";
					setCount++;
				}
			}

			if( setCount > 1 ){
				userInfo.setValue("AuthInfo",andAuth+"/ "+orAuth);
			} else {
				userInfo.setValue("AuthInfo",andAuth+orAuth);
			}
		};

		var dm_ExportParam = app.lookup("ExportParam")
		if( dm_ExportParam.getValue("mode")=="list"){

			var grdUserList = app.lookup("grdUserList");
			grdUserList.clear();
			dsUserList.copyToDataSet(grdUserList)

			var dmTotal = app.lookup("Total");
			var totalCount = parseInt(dmTotal.getValue("Count"));

			var totalLabel = app.lookup("USEXP_optTotal");
			totalLabel.value = totalCount;

			var viewPageCount = totalCount / USEXP_pageRowCount + (totalCount % USEXP_pageRowCount > 0);
			if (viewPageCount > 10) {
				viewPageCount = 10;
			}
			var udcUserList = app.lookup("USEXP_udcUserList");
			udcUserList.setUserList(grdUserList);
			udcUserList.setPaging(totalCount, USEXP_pageRowCount, viewPageCount);
			udcUserList.redraw();
			comLib.hideLoadMask();
		} else {

			var exportUserList = app.lookup("ExportUserList");

			if(dsUserList.getRowCount() == 0 ){
				comLib.hideLoadMask();
				if( exportUserList.getRowCount() >0 ){
					exportExcel();
					exportUserList.clear();
				} else {
					dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_NoItemSave"));
				}
			}else {
				dsUserList.copyToDataSet(exportUserList)

				if( exportUserList.getRowCount() >= dm_ExportParam.getValue("total")){
					exportExcel();
					comLib.hideLoadMask();
					exportUserList.clear();
				} else {
					var offset = dm_ExportParam.getValue("offset")
					offset += 1000
					dm_ExportParam.setValue("offset",offset)
					comLib.updateLoadMask(offset);
					sendUserListRequest();
				}
			}
		}
	}else{
		comLib.hideLoadMask();

		alert(dataManager.getString("Str_UserListGet")+" "+dataManager.getString("Str_Failed")+" "+dataManager.getString(getErrorString(resultCode)));
	}
}

function exportExcel(){

	dataManager = getDataManager();
	var dsUserList = app.lookup("ExportUserList");
	var total = dsUserList.getRowCount()
	for( var i = 0; i < total ; i++){
		var userInfo = dsUserList.getRow(i);

		var groupID = userInfo.getValue("GroupCode");
		var groupName = dataManager.getGroupName(groupID);
		userInfo.setValue("GroupCode",groupName);


		var accessGroupID = userInfo.getValue("AccessGroupCode");
		var accessGroupName = dataManager.getAccessGroupName(accessGroupID);
		userInfo.setValue("AccessGroupCode",accessGroupName);

		var privilegeID = userInfo.getValue("Privilege");
		var privilegeName = dataManager.getPrivilegeName(privilegeID);
		userInfo.setValue("Privilege",privilegeName);
	}
	var exportUserList = app.lookup("ExportUserList");
	var locale = dataManager.getLocale();
	var InputData;
	if( locale == "en"){
		InputData = exportUserList.getRowDataRanged();
	}else {
		var stringified = JSON.stringify(exportUserList.getRowDataRanged());
		stringified = stringified.replace(/"ID"/gi, '"'+dataManager.getString("Str_UserID")+'"');
		stringified = stringified.replace(/"UniqueID"/gi, '"'+dataManager.getString("Str_UniqueID")+'"');
		stringified = stringified.replace(/"Name"/gi, '"'+dataManager.getString("Str_Name")+'"');
		stringified = stringified.replace(/'AuthInfo"/gi, '"'+dataManager.getString("Str_AuthType")+'"');
		stringified = stringified.replace(/'Privilege"/gi, '"'+dataManager.getString("Str_Privilege")+'"');
		stringified = stringified.replace(/"RegistDate"/gi, '"'+dataManager.getString("Str_RegistDate")+'"');
		stringified = stringified.replace(/"ExpiredDate"/gi, '"'+dataManager.getString("Str_ExpireDate")+'"');
		stringified = stringified.replace(/'GroupCode"/gi, '"'+dataManager.getString("Str_Group")+'"');
		stringified = stringified.replace(/"AccessGroupCode"/gi, '"'+dataManager.getString("Str_AccessGroup")+'"');
		stringified = stringified.replace(/"TimezoneCode"/gi, '"'+dataManager.getString("Str_Timezone")+'"');
		stringified = stringified.replace(/"BlackList"/gi, '"'+dataManager.getString("Str_BlackList")+'"');
		stringified = stringified.replace(/"FPIdentify"/gi, '"'+dataManager.getString("Str_FPIdentify")+'"');
		stringified = stringified.replace(/"FaceIdentify"/gi, '"'+dataManager.getString("Str_FAIdentify")+'"');
		//stringified = stringified.replace('"Card"', '"'+dataManager.getString("Str_Card")+'"');
		//stringified = stringified.replace('"Password"', '"'+dataManager.getString("Str_Password")+'"');
		//dataManager.getString("Str_Position"),
		//dataManager.getString("Str_EmployeeNumber"),				
		//dataManager.getString("Str_Department")
		
		InputData = JSON.parse(stringified);		
	}

	/* original data */
	var today = dateLib.getToday();
	var filename = "UserList_"+today+".xlsx";
	var ws_name = "UserList";
	

	var wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(InputData);
	/* add worksheet to workbook */
	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);
}

// 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
function onUSEXP_udcUserListPagechange(/* cpr.events.CSelectionEvent */ e){
	var dm_ExportParam = app.lookup("ExportParam")
	dm_ExportParam.setValue("mode", "list");
	sendUserListRequest();
}


// 트리에서 selection-change 이벤트 발생 시 호출.
function onUSEXP_treeGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var dm_ExportParam = app.lookup("ExportParam")
	dm_ExportParam.setValue("mode", "list");
	sendUserListRequest();
}



// 도움말
function onUSEXP_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
