/************************************************
 * accessCardPrintSetting.js
 * Created at 2021. 2. 3. 오후 3:28:59.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var utilLib = cpr.core.Module.require("lib/util");

// 탭 인덱스
var ACCPS_tabIndex = 1; 			// 현재 탭 인덱스

function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	comLib = createComUtil(app)
	var cardPrintTap = app.lookup("tabFolder");
	//탭 텍스트 스토리지 get, 설정 전이면 기본 value
	var tabStorage = localStorage.getItem("tabStorage");
	if(tabStorage){
		var tabArr = tabStorage.split(',');
	    if (tabArr) {
	        for (var i = 0; i < tabArr.length; i++) {
	            cardPrintTap.getTabItemByID(i + 1).text = tabArr[i];
	        } 
	    }
		tabSetting(tabStorage)
	}
	var sms_getAccessCardPrintInfoList = app.lookup("sms_getAccessCardPrintInfoList");
	sms_getAccessCardPrintInfoList.send();
}

// 출입증 인쇄 정보 가져오기 완료
function onSms_getAccessCardPrintInfoListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {
		var AccessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
		AccessCardPrintInfoList.setFilter("PrintType == " + ACCPS_tabIndex);
	} else {
		dialogAlertAMHQ(app, dataManager.getString ("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 출입증 인쇄 정보 가져오기 에러
function onSms_getAccessCardPrintInfoListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 출입증 인쇄 정보 가져오기 타임아웃
function onSms_getAccessCardPrintInfoListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

// 출입증 목록 선택시
function onACCPS_grdAccessCardListSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.Grid	 */
	var aCCPS_grdAccessCardList = e.control;
	var index = aCCPS_grdAccessCardList.getSelectedRowIndex();
	if(index>-1){
			var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
				
			var acpInfo = accessCardPrintInfoList.getRow(index);	
			app.lookup("ACCPS_cmbCardType"+ACCPS_tabIndex).value = acpInfo.getValue("AccessCardType");
			app.lookup("ACCPS_nabGroupPrint"+ACCPS_tabIndex).value = acpInfo.getValue("GroupPrint");
			app.lookup("ACCPS_nabServiceNamePrint"+ACCPS_tabIndex).value = acpInfo.getValue("ServiceNumberPrint");
			app.lookup("ACCPS_nabNamePrint"+ACCPS_tabIndex).value = acpInfo.getValue("NamePrint");
			app.lookup("ACCPS_nabPhotoPrint"+ACCPS_tabIndex).value = acpInfo.getValue("PhotoPrint");
			app.lookup("ACCPS_nabFamilyPrint"+ACCPS_tabIndex).value = acpInfo.getValue("FamilyPrint");
			app.lookup("ACCPS_fiFrontImage"+ACCPS_tabIndex).value = "";
			app.lookup("ACCPS_fiBacktImage"+ACCPS_tabIndex).value = "";
			var grpAccessCardFront = app.lookup("ACCPS_grpAccessCardFront"+ACCPS_tabIndex);
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
			
			var grpAccessCardBack = app.lookup("ACCPS_grpAccessCardBack"+ACCPS_tabIndex);
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
			app.lookup("ACCPS_txaPrintTextFrontTop"+ACCPS_tabIndex).value = acpInfo.getValue("TextFrontTop");
			app.lookup("ACCPS_txaPrintTextFrontCenterBox"+ACCPS_tabIndex).value = acpInfo.getValue("TextFrontCenterBox");
			app.lookup("ACCPS_txaPrintTextFrontBottomBox"+ACCPS_tabIndex).value = acpInfo.getValue("TextFrontBottomBox");
			app.lookup("ACCPS_txaPrintTextFrontBottom"+ACCPS_tabIndex).value = acpInfo.getValue("TextFrontBottom");
			app.lookup("ACCPS_ipbPrintTextBackTop"+ACCPS_tabIndex).value = acpInfo.getValue("TextBackTop");
			
			switch (Number(app.lookup("ACCPS_cmbCardType"+ACCPS_tabIndex).value)) {
			case 902:
				app.lookup("ACCPS_nabGroupPrint"+ACCPS_tabIndex).enabled = false;
				app.lookup("ACCPS_nabNamePrint"+ACCPS_tabIndex).enabled = false;
				app.lookup("ACCPS_nabFamilyPrint"+ACCPS_tabIndex).enabled = false;
				app.lookup("ACCPS_nabServiceNamePrint"+ACCPS_tabIndex).enabled = false;
				app.lookup("ACCPS_nabPhotoPrint"+ACCPS_tabIndex).enabled = false;
				
				app.lookup("ACCPS_nabGroupPrint"+ACCPS_tabIndex).value = 0;
				app.lookup("ACCPS_nabNamePrint"+ACCPS_tabIndex).value = 0;
				app.lookup("ACCPS_nabFamilyPrint"+ACCPS_tabIndex).value = 0;
				app.lookup("ACCPS_nabServiceNamePrint"+ACCPS_tabIndex).value = 0;
				app.lookup("ACCPS_nabPhotoPrint"+ACCPS_tabIndex).value = 0;
				
				app.lookup("ACCPS_optPrintTextGroup"+ACCPS_tabIndex).value = "";
				app.lookup("ACCPS_optPrintTextServiceName"+ACCPS_tabIndex).value = "";
				app.lookup("ACCPS_optPrintTextName"+ACCPS_tabIndex).value = "";
				break;
			case 906:
				app.lookup("ACCPS_nabGroupPrint"+ACCPS_tabIndex).enabled = true;
				app.lookup("ACCPS_nabNamePrint"+ACCPS_tabIndex).enabled = true;
				app.lookup("ACCPS_nabFamilyPrint"+ACCPS_tabIndex).enabled = true;
				app.lookup("ACCPS_nabServiceNamePrint"+ACCPS_tabIndex).enabled = true;
				app.lookup("ACCPS_nabPhotoPrint"+ACCPS_tabIndex).enabled = true;
				
				app.lookup("ACCPS_optPrintTextGroup"+ACCPS_tabIndex).value = "부서:";
				app.lookup("ACCPS_optPrintTextServiceName"+ACCPS_tabIndex).value = "관계/군번:";	
				app.lookup("ACCPS_optPrintTextName"+ACCPS_tabIndex).value = "성명:";
				break;
			default:
				app.lookup("ACCPS_nabGroupPrint"+ACCPS_tabIndex).enabled = true;
				app.lookup("ACCPS_nabNamePrint"+ACCPS_tabIndex).enabled = true;
				app.lookup("ACCPS_nabFamilyPrint"+ACCPS_tabIndex).enabled = false;
				app.lookup("ACCPS_nabServiceNamePrint"+ACCPS_tabIndex).enabled = true;
				app.lookup("ACCPS_nabPhotoPrint"+ACCPS_tabIndex).enabled = true;
				
				app.lookup("ACCPS_nabFamilyPrint"+ACCPS_tabIndex).value = 0;
				
				app.lookup("ACCPS_optPrintTextGroup"+ACCPS_tabIndex).value = "부서:";
				app.lookup("ACCPS_optPrintTextServiceName"+ACCPS_tabIndex).value = "군번:";
				app.lookup("ACCPS_optPrintTextName"+ACCPS_tabIndex).value = "성명:";
			}
	
	}
	
}

function onACCPS_grdAccessCardListBeforeSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** @type cpr.controls.Grid	 */
	var aCCPS_grdAccessCardList = e.control;
	if(e.oldSelection != null){		
		var grdAccessCardList = app.lookup("ACCPS_grdAccessCardList"+ACCPS_tabIndex);
		var index = e.oldSelection[0];
		
	 	var acpInfo = grdAccessCardList.getRow(index);
	 	if(acpInfo){
	 		var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
			var acpInfo = accessCardPrintInfoList.getRow(index);
			acpInfo.setValue("GroupPrint",app.lookup("ACCPS_nabGroupPrint"+ACCPS_tabIndex).value);
			acpInfo.setValue("ServiceNumberPrint",app.lookup("ACCPS_nabServiceNamePrint"+ACCPS_tabIndex).value);
		 	acpInfo.setValue("NamePrint",app.lookup("ACCPS_nabNamePrint"+ACCPS_tabIndex).value);
		 	acpInfo.setValue("PhotoPrint",app.lookup("ACCPS_nabPhotoPrint"+ACCPS_tabIndex).value);
		 	acpInfo.setValue("FamilyPrint",app.lookup("ACCPS_nabFamilyPrint"+ACCPS_tabIndex).value);
		 		
		 	acpInfo.setValue("TextFrontTop",app.lookup("ACCPS_txaPrintTextFrontTop"+ACCPS_tabIndex).value);
		 	acpInfo.setValue("TextFrontCenterBox",app.lookup("ACCPS_txaPrintTextFrontCenterBox"+ACCPS_tabIndex).value);
		 	acpInfo.setValue("TextFrontBottomBox",app.lookup("ACCPS_txaPrintTextFrontBottomBox"+ACCPS_tabIndex).value);
		 	acpInfo.setValue("TextFrontBottom",app.lookup("ACCPS_txaPrintTextFrontBottom"+ACCPS_tabIndex).value);
		 	acpInfo.setValue("TextBackTop",app.lookup("ACCPS_ipbPrintTextBackTop"+ACCPS_tabIndex).value);
	 	}	 		
	 }
	
}
function valueChanged(ctrl,column,value){
	var index = ctrl.getSelectedRowIndex();
	if( index >- 1 ){
		var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
		var acpInfo = accessCardPrintInfoList.getRow(index);
		acpInfo.setValue(column,value);
	}		
}

// 그룹 출력 옵션 수정
function onACCPS_nabGroupPrintSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.NavigationBar	 */
	var aCCPS_nabGroupPrint = e.control;
	var ctrl = app.lookup("ACCPS_grdAccessCardList"+ACCPS_tabIndex);
	valueChanged(ctrl,"GroupPrint",aCCPS_nabGroupPrint.value);
}

// 군번 출력 옵션 수정
function onACCPS_nabServiceNamePrintSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.NavigationBar	 */
	var aCCPS_nabServiceNamePrint = e.control;
	var ctrl = app.lookup("ACCPS_grdAccessCardList"+ACCPS_tabIndex);
	valueChanged(ctrl,"ServiceNamePrint",aCCPS_nabServiceNamePrint.value);
	
	if (aCCPS_nabServiceNamePrint.value == 1) {
		app.lookup("ACCPS_nabFamilyPrint"+ACCPS_tabIndex).value = 0;
	}
}

// 성별 출력 옵션 수정
function onACCPS_nabNamePrintSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.NavigationBar	 */
	var aCCPS_nabNamePrint = e.control;
	var ctrl = app.lookup("ACCPS_grdAccessCardList"+ACCPS_tabIndex);
	valueChanged(ctrl,"NamePrint",aCCPS_nabNamePrint.value);
}

// 사진 출력 옵션 수정
function onACCPS_nabPhotoPrintSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.NavigationBar	 */
	var aCCPS_nabPhotoPrint = e.control;
	var ctrl = app.lookup("ACCPS_grdAccessCardList"+ACCPS_tabIndex);
	valueChanged(ctrl,"PhotoPrint",aCCPS_nabPhotoPrint.value);
}

// 가족 출력 옵션 수정
function onACCPS_nabFamilyPrintSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.NavigationBar	 */
	var aCCPS_nabFamilyPrint = e.control;
	var ctrl = app.lookup("ACCPS_grdAccessCardList"+ACCPS_tabIndex);
	valueChanged(ctrl,"FamilyPrint",aCCPS_nabFamilyPrint.value);
	
	if (aCCPS_nabFamilyPrint.value == 1) {
		app.lookup("ACCPS_nabServiceNamePrint"+ACCPS_tabIndex).value = 0;
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
    		//canvas.height = canvas.width * 85.6 / 54;    
    			
    		canvas.width = 660; 
    		canvas.height = canvas.width * 85.6 / 54;
    		canvasContext.drawImage(this, 0,0, tempImage.width, tempImage.height,0, 0, canvas.width, canvas.height);
    		
    		var imageData = canvas.toDataURL("image/jpeg");
    		desCtrl.style.css({
				"background-image" : 'url('+imageData+')',
				"background-repeat" : "none",
				"background-position" : "center",
				"background-size" : "cover"
			});
			var grdAccessCardList = app.lookup("ACCPS_grdAccessCardList"+ACCPS_tabIndex);
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

// 앞면 이미지 선택 클릭
function onACCPS_btnFrontImageClick(/* cpr.events.CMouseEvent */ e){
	var pictureFile = app.lookup("ACCPS_fiFrontImage"+ACCPS_tabIndex);	
	pictureFile.openFileChooser();
}

// 앞면 이미지 변경 이벤트
function onACCPS_fiFrontImageValueChange(/* cpr.events.CValueChangeEvent */ e){
	var pictureFile = app.lookup("ACCPS_fiFrontImage"+ACCPS_tabIndex);	
	if (pictureFile.files.length > 0) {
		var ext = utilLib.getExtensionOfFilename(pictureFile.files[0].name);
		if (ext.toUpperCase()== "JPG" || ext.toUpperCase()== "PNG" ) {
			var grpAccessCardFront = app.lookup("ACCPS_grpAccessCardFront"+ACCPS_tabIndex);
			displayImage(pictureFile,grpAccessCardFront,"ImageFront");
		} else {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "확장자가  JPG, PNG 이외의 파일은 업로드 할 수 없습니다.");
			pictureFile.clear();
		}			
	}
}

// 뒷면 이미지 선택 클릭
function onACCPS_btnBackImageClick(/* cpr.events.CMouseEvent */ e){
	var pictureFile = app.lookup("ACCPS_fiBacktImage"+ACCPS_tabIndex);	
	pictureFile.openFileChooser();
}

// 뒷면 이미지 변경 이벤트
function onACCPS_fiBacktImageValueChange(/* cpr.events.CValueChangeEvent */ e){
	var pictureFile = app.lookup("ACCPS_fiBacktImage"+ACCPS_tabIndex);	
	if (pictureFile.files.length > 0) {
		var ext = utilLib.getExtensionOfFilename(pictureFile.files[0].name);
		if (ext.toUpperCase()== "JPG" || ext.toUpperCase()== "PNG" ) {
			var grpAccessCardFront = app.lookup("ACCPS_grpAccessCardBack"+ACCPS_tabIndex);
			displayImage(pictureFile,grpAccessCardFront,"ImageBack");
		} else {
			dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "확장자가  JPG, PNG 이외의 파일은 업로드 할 수 없습니다.");
			pictureFile.clear();
		}			
	}
}
// 출입증인쇄 환경설정 저장 클릭
function onACCPS_btnSavePrintSettingClick(/* cpr.events.CMouseEvent */ e){
	var grdAccessCardList = app.lookup("ACCPS_grdAccessCardList"+ACCPS_tabIndex);
	var row = grdAccessCardList.getSelectedRow();
	if(row){
		var accessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");	 		
		var acpInfo = accessCardPrintInfoList.getRow(row.getIndex());
		if(acpInfo){	
	 		acpInfo.setValue("GroupPrint",app.lookup("ACCPS_nabGroupPrint"+ACCPS_tabIndex).value);	 		
	 		acpInfo.setValue("ServiceNumberPrint",app.lookup("ACCPS_nabServiceNamePrint"+ACCPS_tabIndex).value);
	 		acpInfo.setValue("NamePrint",app.lookup("ACCPS_nabNamePrint"+ACCPS_tabIndex).value);
	 		acpInfo.setValue("PhotoPrint",app.lookup("ACCPS_nabPhotoPrint"+ACCPS_tabIndex).value);
	 		acpInfo.setValue("FamilyPrint",app.lookup("ACCPS_nabFamilyPrint"+ACCPS_tabIndex).value);
	 		
	 		acpInfo.setValue("TextFrontTop",app.lookup("ACCPS_txaPrintTextFrontTop"+ACCPS_tabIndex).value);
	 		acpInfo.setValue("TextFrontCenterBox",app.lookup("ACCPS_txaPrintTextFrontCenterBox"+ACCPS_tabIndex).value);
	 		acpInfo.setValue("TextFrontBottomBox",app.lookup("ACCPS_txaPrintTextFrontBottomBox"+ACCPS_tabIndex).value);
	 		acpInfo.setValue("TextFrontBottom",app.lookup("ACCPS_txaPrintTextFrontBottom"+ACCPS_tabIndex).value);
	 		acpInfo.setValue("TextBackTop",app.lookup("ACCPS_ipbPrintTextBackTop"+ACCPS_tabIndex).value);	 
	 	}		
	}
	 	 	
	var sms_putAccessCardPrintInfo = app.lookup("sms_putAccessCardPrintInfo");
	sms_putAccessCardPrintInfo.send();
}

// 출입증인쇄 설정 저장 완료
function onSms_putAccessCardPrintInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {	
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), dataManager.getString("Str_Saved"));		
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
}

// 출입증인쇄 설정 저장 에러
function onSms_putAccessCardPrintInfoSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

// 출입증인쇄 설정 저장 타임아웃
function onSms_putAccessCardPrintInfoSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * "탭 이름 변경" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var dsTabList = app.lookup("tabList");	
	var cardPrintTap = app.lookup("tabFolder");
	dsTabList.clear();
	for (var i = 1; i < 6; i++) {
	    var tabText = cardPrintTap.getTabItemByID(i).text;
	    dsTabList.addRowData({"tabText": tabText});
	}
	dsTabList.commit();
	
	app.getRootAppInstance().openDialog("app/custom/rokmch/accessCard/changeTabText", {
		width: 400,
		height: 300
	}, function(dialog) {
			dialog.headerTitle = "탭 이름 변경";
			dialog.style.header.css("background-color", "#528443");
			dialog.resizable = false;		
			dialog.modal = true;	
			dialog.initValue = {"dsTabList":dsTabList};	
		}).then(function(returnValue){
		if(returnValue != null){
			tabSetting(returnValue);
		}
		dsTabList.commit();
	});
}

function tabSetting(returnValue){
	localStorage.setItem("tabStorage", returnValue);
	var tabArr = returnValue.split(',');
	var tabCount = tabArr.length;
	var dsTabList = app.lookup("tabList");
	var cardPrintTap = app.lookup("tabFolder");
	dsTabList.clear();

    for (var i = 0; i < tabArr.length; i++) {
        dsTabList.addRowData({"tabText": tabArr[i]});
        cardPrintTap.getTabItemByID(i + 1).bind("text").toDataSet(app.lookup("tabList"), "tabText", i);
    }
    dsTabList.commit();	
}


/*
 * 탭 폴더에서 selection-change 이벤트 발생 시 호출.
 * Tab Item을 선택한 후에 발생하는 이벤트.
 */
function onTabFolderSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.TabFolder
	 */
	var tabFolder = e.control;
	var tabItem = tabFolder.getSelectedTabItem();
 	ACCPS_tabIndex = tabItem.id;
 	
 	var AccessCardPrintInfoList = app.lookup("AccessCardPrintInfoList");
	AccessCardPrintInfoList.setFilter("PrintType == " + ACCPS_tabIndex);			
}
