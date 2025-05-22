/************************************************
 * visitCardPrintSetting.js
 * Created at 2021. 2. 1. 오전 8:43:36.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var utilLib = cpr.core.Module.require("lib/util");
var comLib;

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app);
	
	var sms_getVisitCardPrintInfoList = app.lookup("sms_getVisitCardPrintInfoList");
	sms_getVisitCardPrintInfoList.setParameters("type", "visit");
	sms_getVisitCardPrintInfoList.send();
}

// 방문증 인쇄 정보 가져오기 완료
function onSms_getVisitCardPrintInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {			
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 방문증 인쇄 정보 가져오기 에러
function onSms_getVisitCardPrintInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 방문증 인쇄 정보 가져오기 타임아웃
function onSms_getVisitCardPrintInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 방문증 클릭시
function onVMCPS_grdVisitCardListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.Grid	 */
	var grdVisitCardList = e.control;
	var index = grdVisitCardList.getSelectedRowIndex();
	if(index<0){return;}
	var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
			
	var acpInfo = accessCardPrintInfoList.getRow(index);
	app.lookup("VMCPS_cmbCardType").value = acpInfo.getValue("AccessCardType");
	
	app.lookup("VMCPS_txaPrintTextFrontTop").value = acpInfo.getValue("TextFrontTop");
	app.lookup("VMCPS_txaPrintTextFrontCenterBox").value = acpInfo.getValue("TextFrontCenterBox");
	app.lookup("VMCPS_txaPrintTextFrontBottomBox").value = acpInfo.getValue("TextFrontBottomBox");
	app.lookup("VMCPS_txaPrintTextFrontBottom").value = acpInfo.getValue("TextFrontBottom");
	app.lookup("VMCPS_ipbPrintTextBackTop").value = acpInfo.getValue("TextBackTop");
	
	var grpAccessCardFront = app.lookup("VMCPS_grpAccessCardFront");
	var imageData = acpInfo.getValue("ImageFront")
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
	
	var grpAccessCardBack = app.lookup("VMCPS_grpAccessCardBack");
	var imageData = acpInfo.getValue("ImageBack")		
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
}

function displayImage( fileCtrl,desCtrl,columnName ){
	var reader = new FileReader();
    reader.readAsDataURL(fileCtrl.files [0]);
    
    reader.onload = function  () {
    	var tempImage = new Image(); 
    	tempImage.src = reader.result;    	 
    	tempImage.onload = function () {    
    		var canvas = document.createElement('canvas');
    		var canvasContext = canvas.getContext("2d");
    		//canvas.width = tempImage.width; 
    		//canvas.height = tempImage.height;    	
    		canvas.width = 660; 
    		canvas.height = 1024;
    		canvasContext.drawImage(this, 0,0, tempImage.width, tempImage.height,0, 0, canvas.width, canvas.height);
    		
    		var imageData = canvas.toDataURL("image/jpeg");
    		desCtrl.style.css({
				"background-image" : 'url('+imageData+')',
				"background-repeat" : "none",
				"background-position" : "center",
				"background-size" : "cover"
			});
			var grdAccessCardList = app.lookup("VMCPS_grdVisitCardList");
			var index = grdAccessCardList.getSelectedRowIndex();
			if(index>-1){
				var imageData = imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");	
				var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
				var acpInfo = accessCardPrintInfoList.getRow(index);
				acpInfo.setValue(columnName, imageData);
			}					
			
			desCtrl.redraw();			
		}	 
    }; 
}

// 앞면 이미지 변경시
function onVMCPS_fiFrontImageValueChange(/* cpr.events.CValueChangeEvent */ e){	
	var pictureFile = app.lookup("VMCPS_fiFrontImage");	
	if (pictureFile.files.length > 0) {
		var ext = utilLib.getExtensionOfFilename(pictureFile.files[0].name);
		if (ext.toUpperCase()== "JPG" || ext.toUpperCase()== "PNG" ) {
			var grpAccessCardFront = app.lookup("VMCPS_grpAccessCardFront");
			displayImage(pictureFile,grpAccessCardFront,"ImageFront");	
		} else {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "확장자가  JPG, PNG 이외의 파일은 업로드 할 수 없습니다.");
			pictureFile.clear();
		}
	}
}

// 앞면 이미지 버튼 클릭시
function onVMCPS_btnFrontImageClick(/* cpr.events.CMouseEvent */ e){
	var pictureFile = app.lookup("VMCPS_fiFrontImage");	
	pictureFile.openFileChooser();
}

// 뒷면 이미지 변경시
function onVMCPS_fiBacktImageValueChange(/* cpr.events.CValueChangeEvent */ e){
	var pictureFile = app.lookup("VMCPS_fiBacktImage");
	if (pictureFile.files.length > 0) {
		var ext = utilLib.getExtensionOfFilename(pictureFile.files[0].name);
		if (ext.toUpperCase()== "JPG" || ext.toUpperCase()== "PNG" ) {
			var grpAccessCardFront = app.lookup("VMCPS_grpAccessCardBack");
			displayImage(pictureFile,grpAccessCardFront,"ImageBack");
		} else {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "확장자가  JPG, PNG 이외의 파일은 업로드 할 수 없습니다.");
			pictureFile.clear();
		}	
	}
}

// 뒷면 이미지 버튼 클릭시
function onVMCPS_btnBackImageClick(/* cpr.events.CMouseEvent */ e){
	var pictureFile = app.lookup("VMCPS_fiBacktImage");	
	pictureFile.openFileChooser();
}

// 방문증 환경설정 저장 클릭
function onVMCPS_btnSavePrintSettingClick(/* cpr.events.CMouseEvent */ e){
	var grdAccessCardList = app.lookup("VMCPS_grdVisitCardList");
	var row = grdAccessCardList.getSelectedRow();
	if(row){
		var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");	 		
		var acpInfo = accessCardPrintInfoList.getRow(row.getIndex());
		acpInfo.setValue("TextFrontTop",app.lookup("VMCPS_txaPrintTextFrontTop").value);
	 	acpInfo.setValue("TextFrontCenterBox",app.lookup("VMCPS_txaPrintTextFrontCenterBox").value);
	 	acpInfo.setValue("TextFrontBottomBox",app.lookup("VMCPS_txaPrintTextFrontBottomBox").value);
	 	acpInfo.setValue("TextFrontBottom",app.lookup("VMCPS_txaPrintTextFrontBottom").value);
	 	acpInfo.setValue("TextBackTop",app.lookup("VMCPS_ipbPrintTextBackTop").value);
	}
	 	 	
	var sms_putAccessCardPrintInfo = app.lookup("sms_putAccessCardPrintInfo");
	sms_putAccessCardPrintInfo.send();
}

// 방문증 인쇄 설정 저장 완료
function onSms_putAccessCardPrintInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {	
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));		
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 방문증 인쇄 설정 저장 에러
function onSms_putAccessCardPrintInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 방문증 인쇄 설정 저장 타임아웃
function onSms_putAccessCardPrintInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}
