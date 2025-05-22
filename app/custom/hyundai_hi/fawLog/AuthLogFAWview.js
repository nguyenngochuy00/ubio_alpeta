/************************************************
 * AuthLogFAWview.js
 * Created at 2024. 3. 12. 오전 11:23:51.
 *
 * @author sep
 ************************************************/

var comLib;
var dataManager = cpr.core.Module.require("lib/DataManager");
var dateLib = cpr.core.Module.require("lib/DateLib");
var usint_version;
var maxPeriod = 5;

function onBodyLoad(/* cpr.events.CEvent */ e){	
	dataManager = getDataManager();
	comLib = createComUtil(app.getHostAppInstance());
	usint_version = dataManager.getSystemVersion();

	// Master & 관리자만
	var userPrivilege = dataManager.getAccountInfo().getValue("Privilege");
	var userID = dataManager.getAccountInfo().getValue("UserID");
	if (userID != 1000000000000000000 && userPrivilege != 1){
		app.openDialog("app/dialog/alert" + "?" + usint_version, {width:330,height:180}, function(dialog){
			dialog.headerTitle = dataManager.getString("Str_Warning");
			dialog.initValue = dataManager.getString("Str_ErrorPrivilegeNotPermission");
			
			dialog.ready(function(dialogApp){
				dialog.addEventListener("keyup", function(e){
					if(e.keyCode == 13){
						dialog.close();
					}
				});
				dialog.addEventListener("close", function(e){
					app.close();
				});
				dialog.focusNext();
			});
		});
//		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorPrivilegeNotPermission"));
//		return;
	}
	
	var groupList = dataManager.getGroup();
	var cmbGroup = app.lookup("ALFV_cmbGroup");
	cmbGroup.setItemSet(groupList, {
		label: "Name",
		value: "GroupID"
	});
	cmbGroup.addItem(new cpr.controls.Item("----", 0));
	cmbGroup.selectItemByValue(0);
	
	var cmbPartner = app.lookup("ALFV_cmbPartner");
	var partnerList = dataManager.getPartnerListHDHI();
	cmbPartner.setItemSet(partnerList, {
		label: "PartnerName",
		value: "PartnerID"
	});
	cmbPartner.addItem(new cpr.controls.Item("----", 0));
	cmbPartner.selectItemByValue(0);
	
	var maxDate = dateLib.calcToday(0, 0, -1);
	maxDate = dateLib.makeDateFormat(maxDate, "-");
	app.lookup("ALFV_dtStart").maxDate = new Date(maxDate);
	app.lookup("ALFV_dtEnd").maxDate = new Date(maxDate);
	app.lookup("ALFV_dtStart").value = dateLib.calcToday(0, 0, (-1 * maxPeriod));
	app.lookup("ALFV_dtEnd").value = maxDate;
	
	displayAuthLogDetail(true);

}

function onALFV_btnSearchClick(/* cpr.events.CMouseEvent */ e){
	var smsGetFAWlogList = app.lookup("sms_getFAWlogList");
	var userID = app.lookup("UserInfo").getValue("ID");
	if (userID <= 0){
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_UserNotSelected"));
		return
	}
	
	comLib.showLoadMask("", dataManager.getString("Str_AuthLogFAWview"), "", 0);  
	if (!validateData()){
		return
	}	
	smsGetFAWlogList.action = "/v1/hdhi/fawlog/" + userID;
	
	var start = app.lookup("ALFV_dtStart").value;
	if(start.length < 10){
		start = dateLib.makeDateFormat(start, "-");
	}
	smsGetFAWlogList.setParameters("startDate", start);
	
	var end = app.lookup("ALFV_dtEnd").value;
	if(end.length < 10){
		end = dateLib.makeDateFormat(end, "-");
	}
	smsGetFAWlogList.setParameters("endDate", end);
	smsGetFAWlogList.send();
}

function validateData(){
	var startDate = app.lookup("ALFV_dtStart").value;
	startDate = startDate.replace(/-/gi,"");
	var endDate = app.lookup("ALFV_dtEnd").value;
	endDate = endDate.replace(/-/gi,"");
	var period = dateLib.compareDate(startDate, endDate);
//	console.log(startDate + " - " + endDate + " = " + period);
	if (period == 0) {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_ErrorStartEndDateInvalid"));
		return false;
	}
	
//	console.log(dateLib.minusDates(startDate, endDate));
	if (dateLib.minusDates(startDate, endDate) >= maxPeriod) {
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Warning"), maxPeriod + dataManager.getString("Str_ErrorInvalidSearchPeriod"));
		return false;
	}
	return true;
}

function displayAuthLogDetail(init) {
	var grdAuthFaw = app.lookup("ALFV_grdAuthFaw");
	var logImageList = app.lookup("LogImageList");
	var dmUserImage = app.lookup("UserImage");
	var dmGrdAuthLog = app.lookup("GrdAuthLog");
	var passImage = app.lookup("userPass_image");
	var registeredImage = app.lookup("user_registeredImage");
	
	var defaultSrc = "../../../theme/images/noImg.gif"; 
	
	if (dmUserImage != null) {
		var userPass = dmUserImage.getValue("PassImage");
		var userRegistered = dmUserImage.getValue("RegisteredImage");
		if (userPass != null && userPass.length > 0){
			dmUserImage.setValue("PassImage", "data:image/png;base64," + userPass);
		} else {
			dmUserImage.setValue("PassImage", defaultSrc);
		}
		
		if (userRegistered != null && userRegistered.length > 0){
			dmUserImage.setValue("RegisteredImage", "data:image/png;base64," + userRegistered);
		} else {
			dmUserImage.setValue("RegisteredImage", defaultSrc);
		}
	} else {
		dmUserImage.setValue("PassImage", defaultSrc);
		dmUserImage.setValue("RegisteredImage", defaultSrc);
	}
	
	dmGrdAuthLog.clear();
	for (var i = 1; i < 6; i++){
		var timeName = "EventTime" + i;
		var inName = "InImage" + i;
		var outName = "OutImage" + i;
		dmGrdAuthLog.setValue(timeName, "0000-00-00");
		dmGrdAuthLog.setValue(inName, defaultSrc);
		dmGrdAuthLog.setValue(outName, defaultSrc);		
	}
	
	for (var i = 4; i < 12; i++){
		grdAuthFaw.getLayout().setColumnVisible(i, true);
	}
	
	if (!init) {
		var rowCount = logImageList.getRowCount();
		if (logImageList != null && rowCount > 0){
			for (var i = 0; i < rowCount; i++){
				var row = logImageList.getRow(i);
				var timeName = "EventTime" + (i+1);
				var inName = "InImage" + (i+1);
				var outName = "OutImage" + (i+1);
				dmGrdAuthLog.setValue(timeName, dateLib.makeDateFormat(row.getValue("EventTime"), "-"));
				var inImage = row.getValue("InImage");
				if (inImage != null && inImage.length > 0){
					dmGrdAuthLog.setValue(inName, "data:image/png;base64," + inImage);					
				}
				
				var outImage = row.getValue("OutImage");
				if (outImage != null && outImage.length > 0){
					dmGrdAuthLog.setValue(outName, "data:image/png;base64," + outImage);					
				}
			} // end for
			
			switch(rowCount){
				case 1:
					grdAuthFaw.getLayout().setColumnVisible(4, false);
					grdAuthFaw.getLayout().setColumnVisible(5, false);
				case 2:
					grdAuthFaw.getLayout().setColumnVisible(6, false);
					grdAuthFaw.getLayout().setColumnVisible(7, false);
				case 3:
					grdAuthFaw.getLayout().setColumnVisible(8, false);
					grdAuthFaw.getLayout().setColumnVisible(9, false);
				case 4:
					grdAuthFaw.getLayout().setColumnVisible(10, false);
					grdAuthFaw.getLayout().setColumnVisible(11, false);
			}
			
		}	
	}
		
	grdAuthFaw.redraw(); 
}

function onALFV_cmbPDFItemClick(/* cpr.events.CItemEvent */ e){
	e.preventDefault();
	var cmbPDF = app.lookup("ALFV_cmbPDF");
	var mode = cmbPDF.value;
	var imgWidth = 0;
	var printMode = ''; 
	switch(Number(mode)){
		case 1 :
			imgWidth = 277;
			printMode = 'landscape';
			break;
		case 2 :
			imgWidth = 190;
			printMode = 'portrait';
			break;
		default :
			return;
			break;
	}
	
	var elementID = document.getElementById("uuid-" + app.lookup("ALFV_grdAuthFaw").uuid);
	html2canvas(elementID).then(function(canvas) {	
	    // 캔버스를 이미지로 변환
	    var imgData = canvas.toDataURL('image/png');
		     
	    var pageHeight = imgWidth * 1.414;  // 출력 페이지 세로 길이 계산 A4 기준
	    var imgHeight = canvas.height * imgWidth / canvas.width;
	    var heightLeft = imgHeight;
	    var margin = 10; // 출력 페이지 여백설정
	    var position = 15;
	    var doc = new jsPDF(printMode, 'mm', 'a4');
	    // 'portrait' 세로 모드, 'landscape' 가로 모드
	    
	    doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
	    // (이미지 데이터, 확장자, x좌표, y좌표, 이미지 너비, 이미지 높이)
	    
	    //	    heightLeft -= pageHeight;
	         
	    // 한 페이지 이상일 경우 루프 돌면서 출력
//	    while (heightLeft >= 20) {
//	        position = heightLeft - imgHeight;
//	        doc.addPage();
//	        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//	        heightLeft -= pageHeight;
//	    }
	 
	    // 파일 저장
	    var fileName = app.lookup("ALFV_opbUniqueID").value + "_" + app.lookup("ALFV_opbUser").value;
	    doc.save(fileName + ".pdf");  
	});
	cmbPDF.clearSelection();
}

function onALFV_btnUserSelectClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/main/users/userSelectOne" + "?" + usint_version;
	app.getRootAppInstance().openDialog(appld, {width : 700, height : 600}, function(dialog){
		dialog.initValue = {DelColunm: [14,13,12,11,10,9,8,7,6,4],
							Fields:["user_id","name","unique_id","privilege","position_code", "group_code"]};
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.modal = true;
	}).then(function(returnValue){
		var dmUserInfo = app.lookup("UserInfo");
		if( returnValue != null ){
			console.log(returnValue);
			dmUserInfo.clear();
			dmUserInfo.setValue("ID", returnValue["ID"]);
			dmUserInfo.setValue("Name", returnValue["Name"]);
			dmUserInfo.setValue("UniqueID", returnValue["UniqueID"]);
			dmUserInfo.setValue("GroupCode", returnValue["GroupCode"]);
			dmUserInfo.setValue("PartnerID", returnValue["PartnerID"]);		
		}
		app.lookup("ALFV_cmbPartner").redraw();
		app.lookup("ALFV_cmbGroup").redraw();
		app.lookup("ALFV_opbUniqueID").redraw();
		app.lookup("ALFV_opbUser").redraw();
		
	});
}

function onSms_getFAWlogListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var hostAppIns = app.getHostAppInstance();
	
	var resultCode = app.lookup("Result").getValue("ResultCode");
	
	if (resultCode == COMERROR_NONE) {
		displayAuthLogDetail(false);
		comLib.hideLoadMask();		
	} else {
		comLib.hideLoadMask();	
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_getFAWlogListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_getFAWlogListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
