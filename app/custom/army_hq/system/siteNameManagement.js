/************************************************
 * siteNameManagement.js
 * Created at 2021. 2. 9. 오후 2:27:10.
 *
 * @author fois
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	var siteInfo = app.lookup("SiteInfo");
	
	var siteName = dataManager.getSystemData("SiteName");
	if( siteName && siteName.length>0){
		app.lookup("SMSNM_ipbSiteName").value = dataManager.getSystemData("SiteName");
		siteInfo.setValue("SiteName", siteName)
	}else{
		app.lookup("SMSNM_ipbSiteName").value = "과학화 출입통제 체계";
	}
	
	var siteMessageWarning = dataManager.getSystemData("SiteMessageWarning");
	if( siteMessageWarning && siteMessageWarning.length>0){
		app.lookup("SMSNM_ipbSiteMessageWarning").value = dataManager.getSystemData("SiteMessageWarning");
		siteInfo.setValue("SiteMessageWarning", siteMessageWarning)
	}else{
		app.lookup("SMSNM_ipbSiteMessageWarning").value = "";
	}
	
	var siteLogo = dataManager.getSystemData("SiteLogo");
	if( siteLogo && siteLogo.length>0){
		app.lookup("SMSNM_imgSiteLogo").style.css({"background-image" : 'url(data:image/png;base64,'+siteLogo+')'})		
		siteInfo.setValue("SiteLogo", siteLogo);
	}else {
		app.lookup("SMSNM_imgSiteLogo").style.css({"background-image" : "url('../theme/custom/armyhq/sign_img_logo_01.png')"})		
	}
}

function onSms_postSiteInfoSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var resultCode = app.lookup("Result").getValue("ResultCode");	
	if(resultCode == COMERROR_NONE) {	
		var siteInfo = app.lookup("SiteInfo");
		var systemOption = dataManager.getSystemInfo();
		var data = systemOption.getDatas();			
		data.SiteName = siteInfo.getValue("SiteName");		
		data.SiteLogo = siteInfo.getValue("SiteLogo");
		data.SiteMessageWarning = siteInfo.getValue("SiteMessageWarning");		
		systemOption.build(data);		
		dataManager.setSystemInfo(systemOption);
				
		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {"target":ARMYHQ_REFRESH_LOGO}
		});
		app.getRootAppInstance().dispatchEvent(commandEvent);
		
		dialogAlertAMHQ(app, dataManager.getString("Str_Success"), "부대정보가 업데이트 되었습니다.");		
	} else {				
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}	
}

function onSubmitError(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);}
function onSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);}


/*
 * 파일 인풋에서 value-change 이벤트 발생 시 호출.
 * FileInput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onSMSNM_fiSiteLogoValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** @type cpr.controls.FileInput	 */
	var fiSiteLogo = e.control;
	var reader = new FileReader();
    reader.readAsDataURL(fiSiteLogo.files [0]);
    
    reader.onload = function  () {
    	var imgSiteLogo = app.lookup("SMSNM_imgSiteLogo");
    	var tempImage = new Image(); 
    	tempImage.src = reader.result;    	 
    	tempImage.onload = function () {    
    		var canvas = document.createElement('canvas');
    		var canvasContext = canvas.getContext("2d");
    		//canvas.width = tempImage.width; 
    		//canvas.height = tempImage.height;    	
    		canvas.width = 200; 
    		canvas.height = 200;
    		canvasContext.drawImage(this, 0,0, tempImage.width, tempImage.height,0, 0, canvas.width, canvas.height);
    		
    		var imageData = canvas.toDataURL("image/jpeg");
    		imgSiteLogo .style.css({
				"background-image" : 'url('+imageData+')',
				"background-repeat" : "none",
				"background-position" : "center",
				"background-size" : "cover"
			});
			var siteInfo = app.lookup("SiteInfo");
			
			var imageData = imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
			siteInfo.setValue("SiteLogo", imageData);
			
			imgSiteLogo.redraw();			
		}	 
    }; 
}

//
function onSMSNM_btnSaveClick(/* cpr.events.CMouseEvent */ e){
	var sms_postSiteInfo = app.lookup("sms_postSiteInfo");
	sms_postSiteInfo.send();
}
