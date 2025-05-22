/************************************************
 * pictureRegist.js
 * Created at 2021. 5. 21. 오후 4:57:05.
 *
 * @author joymrk
 ************************************************/

var _Mode;
var comLib;
//var _UserID;
var _FaceDatas;
var USFWR_url;
var USFWR_imageMax = 130000;

var dataManager = cpr.core.Module.require("lib/DataManager");
var util = cpr.core.Module.require("lib/util");

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();		
	comLib = createComUtil(app);
	var initValue = app.getHost().initValue;
	_Mode = initValue["Mode"];
	USFWR_url = initValue["Url"];
	
	var udcTerminalList = app.lookup("PRAMHQ_udcTerminalList");	
	udcTerminalList.deleteColumn([13,12,11,10,9,8,7,6,5,4,3]);
	
	//_UserID = 1;
	sendConnectedTerminalListRequest()
}

function sendConnectedTerminalListRequest() {
	var terminalList = app.lookup("PRAMHQ_udcTerminalList");	
	var curIndex = terminalList.getCurrentPageIndex();
	
	var pageRowCount = terminalList.getPageRowCount();
	var offset = (curIndex - 1) * pageRowCount;
	
	var searchCtrl = app.lookup("PRAMHQ_udcSearchTerminal")
	var smsGetConnectedTerminalList = app.lookup("sms_getConnectedTerminalList");
	smsGetConnectedTerminalList.action = USFWR_url+'/terminals'
	
	smsGetConnectedTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	smsGetConnectedTerminalList.setParameters("searchKeyword", searchCtrl.searchKeyword);
	if( searchCtrl.searchKeyword != undefined && searchCtrl.searchKeyword.length > 0 ){
		smsGetConnectedTerminalList.setParameters("searchCategory", searchCtrl.searchCategory);
	}else{
		smsGetConnectedTerminalList.setParameters("searchCategory", "");
	}
	
	smsGetConnectedTerminalList.setParameters("offset", offset);
	smsGetConnectedTerminalList.setParameters("limit", pageRowCount);
	smsGetConnectedTerminalList.setParameters("AuthType", 'facewt');
	
	var fields = ["terminal_id","name"];
	smsGetConnectedTerminalList.setParameters("fields", fields);
	
	comLib.showLoadMask("",dataManager.getString("Str_TerminalLoading"),"",pageRowCount);
	smsGetConnectedTerminalList.send();
}

function onSms_getConnectedTerminalListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	var sms_getConnectedTerminalList = e.control;
	var bResultCode = app.lookup("Result").getValue("ResultCode");
	if(bResultCode == COMERROR_NONE) {
		var dsTerminalList = app.lookup("TerminalList");
			
		var terminalList = app.lookup("PRAMHQ_udcTerminalList");
		terminalList.setTerminalList(dsTerminalList);
		var dmTotal = app.lookup("Total");
		var totalCount = parseInt(dmTotal.getValue("Count"));		
		terminalList.setTotalCount(totalCount);
		
		terminalList.setCurrentPageIndex(0);
		
	} else {
		
	}
	comLib.hideLoadMask();
}

function onSms_SubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_ERROR);
}

function onSms_SubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode",COMERROR_NET_TIMEOUT);
}


/*
 * 사용자 정의 컨트롤에서 search 이벤트 발생 시 호출.
 */
function onPRAMHQ_udcSearchTerminalSearch(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.search.searchTerminal
	 */
	var pRAMHQ_udcSearchTerminal = e.control;
	sendConnectedTerminalListRequest();
}


/*
 * 사용자 정의 컨트롤에서 pagechange 이벤트 발생 시 호출.
 */
function onPRAMHQ_udcTerminalListPagechange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type udc.grid.terminalList
	 */
	var pRAMHQ_udcTerminalList = e.control;
	sendConnectedTerminalListRequest();
}


/*
 * 버튼(PRAMHQ_btnCapture)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPRAMHQ_btnCaptureClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var pRAMHQ_btnCapture = e.control;
	sendFaceCaptureRequest();
}

function sendFaceCaptureRequest() {
	
	var SelectedTerminalInfo = app.lookup("PRAMHQ_udcTerminalList");
	var checkedRowIndices = SelectedTerminalInfo.getCheckedRowIndices();
	
	if (checkedRowIndices.length <= 0) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	
	if (checkedRowIndices.length > 1) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), "단말기는 한대만 체크해 주세요.");
		return;
	}
	var reqIndex = checkedRowIndices.pop();
	if (reqIndex == undefined ) {
		dialogAlertAMHQ(app, dataManager.getString("Str_Warning"), dataManager.getString("Str_TerminalNotSelected"));
		return;
	}
	
	var tID = SelectedTerminalInfo.getTerminalID(reqIndex);
	
	var sms_getUserFaceFromTerminal = app.lookup("sms_getUserFaceFromTerminal");
	sms_getUserFaceFromTerminal.action = USFWR_url+"/terminals/" + tID + "/scan/facewt";
	sms_getUserFaceFromTerminal.setParameters("capture_timeout", 60);
	comLib.showLoadMask("", dataManager.getString("Str_FingerRegist"), "", 60);	
	sms_getUserFaceFromTerminal.send();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getUserFaceFromTerminalSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getUserFaceFromTerminal = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if(resultCode == COMERROR_NONE) {
		var faceWTList = app.lookup("UserFaceWTInfo");
		var count = faceWTList.getRowCount();
		console.log(count);
		var templateExist = false;
		for( var i = 0; i < count; i++){ // 전송받은 데이터 중 템플릿이 있으면 템플릿을 저장
			var faceWTInfo = faceWTList.getRow(i);
			var templateType = faceWTInfo.getValue("TemplateType");
			if( templateType == FaceWTTypeTemplate ){
				templateExist = true;
				var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");
				dmUserFaceInfo.build(faceWTInfo.getRowData());
				dmUserFaceInfo.setValue("TemplateType",FaceWTTypeTemplate);
				break;
			}
		}
		
		for( var i = 0; i < count; i++){
			var faceWTInfo = faceWTList.getRow(i);
			var templateType = faceWTInfo.getValue("TemplateType");
			if( templateType == FaceWTTypeImage){ // 이미지
				if( templateExist == false ){ // 템플릿이 없는 경우 이미지로 저장
					var dmUserFaceInfo = app.lookup("dmUserFaceWTInfo");
					dmUserFaceInfo.build(faceWTInfo.getRowData());
					dmUserFaceInfo.setValue("TemplateType",FaceWTTypeImage);
				}
				var imgPhoto = app.lookup("PRAMHQ_imgPhoto");
				imgPhoto.putValue('data:image/jpg;base64,'+faceWTInfo.getValue("TemplateData"));			
				imgPhoto.redraw();
				break;
			}			
		}	
	} else {		
		dialogAlertAMHQ(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(resultCode)));
	}
	comLib.hideLoadMask();
}


/*
 * 버튼(PRAMHQ_btnComplete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPRAMHQ_btnCompleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var pRAMHQ_btnComplete = e.control;
	app.close(app.lookup("PRAMHQ_imgPhoto").src);
}
