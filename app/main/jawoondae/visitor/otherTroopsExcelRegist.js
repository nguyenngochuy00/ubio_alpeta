/************************************************
 * otherTroopsExcelRegist.js
 * Created at 2019. 11. 17. 오후 10:22:01.
 *
 * @author joymrk
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var jwdote_version;
var rABS = true; // T : 바이너리, F : 어레이 버퍼


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	jwdote_version = dataManager.getSystemVersion();
		
	var groupList = dataManager.getGroup();
	var cmbGroup = app.lookup("JWDOTE_cmbTargetGroup");	 //출입 부대
		cmbGroup.setItemSet(groupList, {
			label: "Name",
			value: "GroupID",
	});
	
	var positionList = dataManager.getPositionList();
	var cmbPosition = app.lookup("JWDOTE_cmbVisitorPosition");	//직급
		cmbPosition.setItemSet(positionList, {
			label: "Name",
			value: "PositionID",
	});	
	var cmbPosition2 = app.lookup("JWDOTE_cmbVisitorPosition2");	//직급
		cmbPosition2.setItemSet(positionList, {
			label: "Name",
			value: "PositionID",
	});	
	

	var link = app.lookup("JWDOTE_sniDownloadLink");
	link.value=	"<a href=\"/setup/타부대원 방문신청 샘플.xlsx\" target=\"_blank\">신청양식 다운로드</a>";
	
	
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
	"군번",
	"계급",
	"성명",
	"전화",
	"휴대전화",
	"차량번호"
];//,"차량색상",	"차량종류"

function onJWDOTE_fiUserFileValueChange(/* cpr.events.CValueChangeEvent */ e){
	
	var fi1 = e.control;
	var columnName = [	"visitorGroupName",	"visitorID",	"visitorPosition",	"visitorName",	"visitorPhone",	
		"visitorMobile", "carNumber" ]; //,"carColor", "carType"
	
	var files = fi1.files;
	var positionList = dataManager.getPositionList();
    var i,f;
    for (i = 0; i != files.length; ++i) {
    	f = files[i];
        var reader = new FileReader();
        var name = f.name;
        
        reader.onload = function(e) {
        	var data = e.target.result;
            
            var workbook;
 			if(rABS) { /* if binary string, read with type 'binary' */                
                workbook = XLSX.read(data, {type: 'binary'});
            } else { /* if array buffer, convert to base64 */                
                var arr = fixdata(data);
                workbook = XLSX.read(btoa(arr), {type: 'base64'});
            }//end. i            
            
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
   			var visitList = new Array();
   			var dsVisitList = app.lookup("dsOtherTroopsRegistInfo");
   			
   			var LastRow = workbook.Sheets[first_sheet_name]['!ref'].split(":");
   			workbook.Sheets[first_sheet_name]['!ref'] = "A1:"+LastRow[1];
   			workbook.SheetNames.forEach(function(item, index, array) {
				var json = XLSX.utils.sheet_to_json(workbook.Sheets[item]);
									
				for( var idx = 0; idx < json.length; idx++){					
					var visitInfo = [];
					xlsColumName.forEach(function(item, index){
						var value = { item : json[idx][item]};
						if (item == "계급") {
							
							var getValue = positionList.findFirstRow("Name == '"+ json[idx][item] + "'");
							if (getValue) {
								visitInfo[columnName[index]] = getValue.getValue("PositionID");
							} else {
								visitInfo[columnName[index]] =json[idx][item];
							}
							
						} else {
							visitInfo[columnName[index]] =json[idx][item];
						}
					});
					
					var addFlag = true
					for (var idx2 = 0; idx2 < visitList.length; idx2++) {
						if (visitList[idx2][columnName[1]] == visitInfo[columnName[1]]) {
							console.log(visitList[idx2][columnName[1]] + " : " + visitInfo[columnName[1]]);	
							if (visitList[idx2][columnName[5]] == visitInfo[columnName[5]]) {
								// 둘다 중복이면 추가 안함
								addFlag = false
								break;
							}
						}
						
					}
					visitList.push(visitInfo);
				}			
				dsVisitList.build(visitList); // 엑셀에서 읽은 방문 신청 정보를 데이터 셋이 저장				
			});			
        }
        
		if(rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
   	}
}

function onJWDOTE_btnIssueClick(/* cpr.events.CMouseEvent */ e){
	
	var visitPurpose = app.lookup("JWDOTE_ipbVisitPurpose").value;
	if (visitPurpose.length <= 0 ) {
		dialogAlert(app, dataManager.getString("Str_Warning"),"방문 목적을 입력해 주세요");
		return;
	}
	
	var grdOtherTroopsRequestList = app.lookup("JWDOTE_grdOtherTroopsRegist");
	var total = grdOtherTroopsRequestList.getRowCount();
	for (var i = 0 ; i < total ; i++) {
		var rowData = grdOtherTroopsRequestList.getRow(i);
		var sourceCarNum = rowData.getValue("carNumber");
		if( sourceCarNum.toString().length > 0){
			for(var j = i+1; j < total;j++) {
				var compareInfo = grdOtherTroopsRequestList.getRow(j);
				if (sourceCarNum == compareInfo.getValue("carNumber")) {
					var strMsg = rowData.getValue("visitorID") + " 신청자와 " + compareInfo.getValue("visitorID") +" 신청자의 " 
					dialogAlert(app, dataManager.getString("Str_Warning"),strMsg + " 차량번호가 중복됩니다.");
					return;
				}
			}
		}
		
		if( rowData.getValue("carNumber").toString().indexOf(' ') > -1){
			dialogAlert(app, dataManager.getString("Str_Warning"),"입력 할 수 없는 문자가 포함되어 있습니다.");
			return;
		}
		if( rowData.getValue("carNumber").toString().indexOf('.') > -1){
			dialogAlert(app, dataManager.getString("Str_Warning"),"입력 할 수 없는 문자가 포함되어 있습니다.");
			return;
		}
		if( rowData.getValue("visitorName").toString().indexOf('.') > -1){
			dialogAlert(app, dataManager.getString("Str_Warning"),"입력 할 수 없는 문자가 포함되어 있습니다.");
			return;
		}
		if( rowData.getValue("visitorName").toString().indexOf(' ') > -1){
			dialogAlert(app, dataManager.getString("Str_Warning"),"입력 할 수 없는 문자가 포함되어 있습니다.");
			return;
		}
		if( rowData.getValue("visitorID").toString().indexOf(' ') > -1){
			dialogAlert(app, dataManager.getString("Str_Warning"),"입력 할 수 없는 문자가 포함되어 있습니다.");
			return;
		}
		if( rowData.getValue("visitorID").toString().indexOf('.') > -1){
			dialogAlert(app, dataManager.getString("Str_Warning"),"입력 할 수 없는 문자가 포함되어 있습니다.");
			return;
		}
		
		
		if( rowData.getValue("visitorGroupName").length==0){
		dialogAlert(app, dataManager.getString("Str_Warning"),"소속을 입력해 주세요");
			return
		}
		if( rowData.getValue("visitorID").length==0){
			dialogAlert(app, dataManager.getString("Str_Warning"),"군번을 입력해 주세요");
			return
		}
		if( rowData.getValue("visitorPosition")==0){
			dialogAlert(app, dataManager.getString("Str_Warning"),"계급을 선택해 주세요");
			return
		}
		if( rowData.getValue("visitorName").length==0){
			dialogAlert(app, dataManager.getString("Str_Warning"),"이름을 입력해 주세요");
			return
		}
		
		if( rowData.getValue("visitorName").toString().indexOf('.') > -1){
			dialogAlert(app, dataManager.getString("Str_Warning"),". 문자를 제거하세요");
			return
		}
		if( rowData.getValue("visitorMobile").length==0){
			dialogAlert(app, dataManager.getString("Str_Warning"),"핸드폰 번호를 입력해 주세요");
			return
		}
	}
	
	if( total < 1 ){
		dialogAlert(app, dataManager.getString("Str_Warning"), "발급가능한 신청 정보가 없습니다.");
		return;
	}
		
	comLib.showLoadMask("","타부대원 발급 신청","",total);
	
	sendOtherTroopsIssue();
}

function sendOtherTroopsIssue() {	
	var smsPostVisitInfo = app.lookup("sms_IssueOtherTroopsRequestList");
	smsPostVisitInfo.action = "/v1/visitRequest/othertroops/excel";	
	smsPostVisitInfo.send();
}

function onSms_IssueOtherTroopsRequestListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	
	var sms_IssueOtherTroopsRequestList = e.control;
	var postOtherTroopsList = app.lookup("registOtherTroopsList");
	postOtherTroopsList.realDeleteRow(0);
	
	var dsOtherTroopsRegistInfo = app.lookup("dsOtherTroopsRegistInfo");
	
	comLib.hideLoadMask();
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		dialogAlert(app, dataManager.getString("Str_Success"), "타부대원 방문신청 성공", function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {app.close();});
		});
	} else {		
		//dialogAlert(app, dataManager.getString("Str_Failed"),"타부대원 방문신청 실패 ("+resultCode+")");
		dialogAlert(app, dataManager.getString("Str_Failed"),"타부대원 방문신청 실패  : "+dataManager.getString(getErrorString(resultCode)));
	}
}

function onSms_IssueOtherTroopsRequestListSubmitError(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_IssueOtherTroopsRequestListSubmitTimeout(/* cpr.events.CSubmissionEvent */ e){
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}



/*
 * 버튼(JWDOTE_btnAdd)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWDOTE_btnAddClick(/* cpr.events.CMouseEvent */ e){	
	var dmOtherTroopsInfo = app.lookup("otherTroopsInfo");
	if( dmOtherTroopsInfo.getValue("visitorGroupName").length==0){
		dialogAlert(app, dataManager.getString("Str_Warning"),"소속을 입력해 주세요");
		return
	}
	if( dmOtherTroopsInfo.getValue("visitorID").length==0){
		dialogAlert(app, dataManager.getString("Str_Warning"),"군번을 입력해 주세요");
		return
	}
	if( dmOtherTroopsInfo.getValue("visitorPosition")==0){
		dialogAlert(app, dataManager.getString("Str_Warning"),"계급을 선택해 주세요");
		return
	}
	if( dmOtherTroopsInfo.getValue("visitorName").length==0){
		dialogAlert(app, dataManager.getString("Str_Warning"),"이름을 입력해 주세요");
		return
	}
	if( dmOtherTroopsInfo.getValue("visitorName").toString().indexOf('.') > -1){
		dialogAlert(app, dataManager.getString("Str_Warning"),". 문자를 제거하세요");
		return
	}
	
	if( dmOtherTroopsInfo.getValue("visitorMobile").length==0){
		dialogAlert(app, dataManager.getString("Str_Warning"),"핸드폰 번호를 입력해 주세요");
		return
	}
	
	var troopsInfo = dmOtherTroopsInfo.getDatas();
	var dsOtherTroopsRegistInfo = app.lookup("dsOtherTroopsRegistInfo");
	
	var strCompare = "visitorID == '" + dmOtherTroopsInfo.getValue("visitorID") + "' and visitorMobile == '" +	dmOtherTroopsInfo.getValue("visitorMobile") + "' "; //생년월일 + 핸드폰 번호 동일 사용자 제외
	
	var OTRInfo = dsOtherTroopsRegistInfo.findFirstRow(strCompare); 
	if (OTRInfo) {
		dialogAlert(app, dataManager.getString("Str_Warning"),"군번과 핸드폰 번호가 동시에 중복되는 사용자가 있습니다.");
		return;
	}
	////////////////////////////////////////////////////////////////////
	var carNum = dmOtherTroopsInfo.getValue("carNumber");
	if (carNum.length > 0 ) {
		strCompare = "carNumber == '" + dmOtherTroopsInfo.getValue("carNumber") + "'"; //차량번호
		var dsOTRInfo = dsOtherTroopsRegistInfo.findFirstRow(strCompare); 
		if (dsOTRInfo) {
			dialogAlert(app, dataManager.getString("Str_Warning"),"이미 신청서에 있는 차량번호 입니다.");
			return;
		}	
	}
	
	dsOtherTroopsRegistInfo.addRowData(troopsInfo);
}


/*
 * 버튼(JWDOTE_btnDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWDOTE_btnDeleteClick(/* cpr.events.CMouseEvent */ e){
	var grdOtherTroopsRegist = app.lookup("JWDOTE_grdOtherTroopsRegist");
	var chkIndices = app.lookup("JWDOTE_grdOtherTroopsRegist").getCheckRowIndices();
	if(chkIndices.length==0){return;}
	
	var dsOtherTroopsRegistInfo = app.lookup("dsOtherTroopsRegistInfo");
	chkIndices.forEach(function(rowIndex){
		dsOtherTroopsRegistInfo.deleteRow(rowIndex)
	});	
	dsOtherTroopsRegistInfo.commit();
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


/*
 * "신청자 기록 검색" 버튼(JWDOTE_btnVisitorSearch)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onJWDOTE_btnVisitorSearchClick(/* cpr.events.CMouseEvent */ e){
	var appld = "app/main/jawoondae/visitor/visitorSearch" + "?" + jwdote_version;
	app.getRootAppInstance().openDialog(appld, {width : 1024, height : 450}, function(dialog){
		dialog.ready(function(dialogApp){
			//dialog.bind("headerTitle").toLanguage("Str_PassList");
			dialog.headerTitle ="신청자 기록 검색";
			dialog.modal = true;
		});
	}).then(function(returnValue){
		if (returnValue != undefined) {
			var otherTroopsInfo =  app.lookup("otherTroopsInfo");
			otherTroopsInfo.setValue("visitorID", returnValue.getValue("VisitorID"));
			otherTroopsInfo.setValue("visitorGroupName", returnValue.getValue("VisitorGroupName"));
			otherTroopsInfo.setValue("visitorPosition", returnValue.getValue("VisitorPosition"));
			otherTroopsInfo.setValue("visitorName", returnValue.getValue("VisitorName"));
			otherTroopsInfo.setValue("visitorPhone", returnValue.getValue("VisitorPhone"));
			otherTroopsInfo.setValue("visitorMobile", returnValue.getValue("VisitorMobile"));
			otherTroopsInfo.setValue("carNumber", returnValue.getValue("VisitorCarNumber"));
			console.log(app.lookup("otherTroopsInfo").getDatas());
			app.lookup("JWDVI_grpVisitorInfo").redraw();
		}
	});	
}
