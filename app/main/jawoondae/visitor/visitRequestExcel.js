/************************************************
 * visitRegistrationExcel.js
 * Created at 2019. 9. 18. 오전 10:26:42.
 *
 * @author fois
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var jwded_version;
var rABS = true; // T : 바이너리, F : 어레이 버퍼

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	jwded_version = dataManager.getSystemVersion();
	
	var groupList = dataManager.getGroup();
	var cmbGroup = app.lookup("JWDVR_cmbTargetGroup");	 //출입 부대
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",
	});
	
	var link = app.lookup("JWDVX_sniDownloadLink");
	link.value=	"<a href=\"/setup/방문신청 샘플.xlsx\" target=\"_blank\">신청양식 다운로드</a>";
}

// 어레이 버퍼를 처리한다 ( 오직 readAsArrayBuffer 데이터만 가능하다 )
function fixdata(data) {
    var o = "", l = 0, w = 10240;
    for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
    o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
    return o;
}

var xlsColumName = [	
	"소속",
	"생년월일",
	"성명",
	"전화",
	"휴대전화",
	"차량번호",
	"차량색상",
	"차량종류"
];


function onJWDVX_fiUserFileValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.FileInput
	 */
	var fi1 = e.control;
	var columnName = [ "visitorGroupName","visitorID","visitorName", "visitorPhone", "visitorMobile", 
		"carNumber","carColor", "carType" ];
	var files = fi1.files;
	
    var i,f;
    for (i = 0; i != files.length; ++i) {
        f = files[i];
		//console.log(f.name);
		//console.log(f);
        var reader = new FileReader();
        var name = f.name;
 
        reader.onload = function(e) {
            var data = e.target.result;
            
            var workbook;
 
            if(rABS) {
                /* if binary string, read with type 'binary' */
                workbook = XLSX.read(data, {type: 'binary'});
            } else {
                /* if array buffer, convert to base64 */
                var arr = fixdata(data);
                workbook = XLSX.read(btoa(arr), {type: 'base64'});
            }//end. i
            console.log(workbook);
            var first_sheet_name = workbook.SheetNames[0]; // 처음 시트의 명칭 얻기
 			var worksheet1 = workbook.Sheets[first_sheet_name];		
 			var rangeLabel = worksheet1['!ref'].split(':');
 			
 			var result = [];
			var row;
			var rowNum;
			var colNum;
			var range = XLSX.utils.decode_range(worksheet1['!ref']);
			
			for(rowNum = range.s.r; rowNum <= range.e.r; rowNum++){
				//console.log("Row : "+rowNum);
				row = [];
				for(colNum=range.s.c; colNum<=range.e.c; colNum++){
					//console.log("Col : "+colNum);
					var nextCell = worksheet1[
						XLSX.utils.encode_cell({r: rowNum, c: colNum})
					];
									
          			if( typeof nextCell === 'undefined' ){
          				//console.log("undefined");
             			row.push(void 0);
          			} else {
          				row.push(nextCell.w);	          				
          			}
       			}
       			result.push(row);
   			}
   			var visitList = new Array();
   			var dsVisitList = app.lookup("dsVisitRegistInfo");
   			
   			var LastRow = workbook.Sheets[first_sheet_name]['!ref'].split(":");
   			workbook.Sheets[first_sheet_name]['!ref'] = "A1:"+LastRow[1];
			//console.log(workbook.Sheets[first_sheet_name]['!ref']);
			workbook.SheetNames.forEach(function(item, index, array) {
				
				var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
							
				for( var idx = 0; idx < json.length; idx++){
					//console.log(json[idx]);
					var visitInfo = [];
					xlsColumName.forEach(function(item, index){
						var value = { item : json[idx][item]};
						visitInfo[columnName[index]] =json[idx][item];
					});
					console.log(visitInfo)
					visitList.push(visitInfo);
					//console.log(json[idx][columnName[0]]);	
					
								
				}
			//	console.log(visitList);
				dsVisitList.build(visitList);
				
			});			
		}
		
		if(rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
	}
	 
}

function onJWDVX_btnRegistrationClick(/* cpr.events.CMouseEvent */ e){
	var grdVisitRequestList = app.lookup("JWDVX_grdVisitRegist");
	var total = grdVisitRequestList.getRowCount();
	
	if( total < 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), "등록한 방문신청 정보가 없습니다.");
		return;
	}
	
	var dmVisitInfo = app.lookup("dmVisitTargetInfo");
	var targetGroup = dmVisitInfo.getValue("TargetGroupID");
	if( targetGroup.length == 0 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), "출입부대가 선택되지 않았습니다.");
		return;
	}
	
	var uniqueID = app.lookup("LeaderInfo").getValue("UniqueID");
	if( uniqueID.length == 0 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), "인솔자가 선택되지 않았습니다.");
		return;
	}
	comLib.showLoadMask("pro","방문신청 등록","",total);
	var registVisitList = app.lookup("registVisitList");
	registVisitList.clear();
	
	for( var i = 0; i < total; i++){
		var registVisit = {"VisitorID":grdVisitRequestList.getRow(i).getValue("VisitorID"),"rowIndex": i};
		registVisitList.addRowData(registVisit);
	}
	
	sendVisitRequestRegist();
}

function sendVisitRequestRegist() {
	var registVisitList = app.lookup("registVisitList");
	if (registVisitList.getRowCount() == 0 ) {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		return;
	}
	
	var regVisitInfo = registVisitList.getRow(0);
	var visitorID = regVisitInfo.getValue("VisitorID");
	var row = regVisitInfo.getValue("rowIndex");
	
	var dmVisitInfo = app.lookup("dmVisitTargetInfo");
	
	var rowdata = app.lookup("dsVisitRegistInfo").getRow(parseInt(row, 10));
	dmVisitInfo.setValue("LeaderID", app.lookup("LeaderInfo").getValue("UniqueID"));	
	dmVisitInfo.setValue("VisitorGroupName", rowdata.getValue("visitorGroupName"));
	dmVisitInfo.setValue("VisitorID", rowdata.getValue("visitorID"));
	dmVisitInfo.setValue("VisitorName", rowdata.getValue("visitorName"));
	dmVisitInfo.setValue("VisitorPhone", rowdata.getValue("visitorPhone"));
	dmVisitInfo.setValue("VisitorMobile", rowdata.getValue("visitorMobile"));
	dmVisitInfo.setValue("carNumber", rowdata.getValue("carNumber"));
	dmVisitInfo.setValue("carColor", rowdata.getValue("carColor"));
	dmVisitInfo.setValue("carType", rowdata.getValue("carType"));

	dmVisitInfo.setValue("VisitType", 7);
	
	var msg = "방문자 성명  : "+rowdata.getValue("visitorName");
	comLib.updateLoadMask(msg);
	
	var smsPostVisitInfo = app.lookup("sms_RegistVisitRequestList");
	smsPostVisitInfo.action = "/v1/visitRequest/excel";
	smsPostVisitInfo.userAttr("VisitorID", visitorID);
	smsPostVisitInfo.userAttr("rowIndex", regVisitInfo.getValue("rowIndex").toString());
	smsPostVisitInfo.send();
}
function onSms_RegistVisitRequestListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_RegistVisitRequestListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}


/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_RegistVisitRequestListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_RegistVisitRequestList = e.control;
	var postVisitList = app.lookup("registVisitList");
	postVisitList.realDeleteRow(0);
	
	var dsVisitRegistInfo = app.lookup("dsVisitRegistInfo");
	var visitID = sms_RegistVisitRequestList.userAttr("VisitorID");
	var rowIndex = sms_RegistVisitRequestList.userAttr("rowIndex");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE || resultCode == COMERROR_USER_NOT_EXIST ){
		
		dsVisitRegistInfo.updateRow(parseInt(rowIndex,10), {"result": dataManager.getString("Str_Success")});
		sendVisitRequestRegist();
	} else {
		comLib.hideLoadMask();
		dataManager = getDataManager();
		dsVisitRegistInfo.updateRow(parseInt(rowIndex,10), {"result": dataManager.getString("Str_fail")});
		//dialogAlert(app, dataManager.getString("Str_Failed"), 
		//	visitID+ " "+"방문신청 등록 실패"+" "+dataManager.getString("Str_Failed")+".("+resultCode+")");
		dialogAlert(app, dataManager.getString("Str_Failed"), 
			visitID+ " "+"방문신청 등록 실패"+" "+dataManager.getString("Str_Failed")+" : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onJWDVX_btnFileSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var jWDVX_btnFileSearch = e.control;
	
}


/*
 * "검색" 버튼(JWDVX_btnUserSearch)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWDVX_btnUserSearchClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/main/users/userSelectOne" + "?" + jwded_version;
	app.getRootAppInstance().openDialog(appld, {width : 600, height : 500}, function(dialog){
		dialog.bind("headerTitle").toLanguage("Str_UserSelect");
		dialog.modal = true;
	}).then(function(/*cpr.data.DataSet*/userInfo){
		if(userInfo){
			var dmLeaderInfo = app.lookup("LeaderInfo");
			dmLeaderInfo.build(userInfo);
			
		}
	});	
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUSMAG_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}
