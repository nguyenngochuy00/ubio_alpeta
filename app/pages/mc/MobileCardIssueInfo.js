/************************************************
 * MobileCardInfo.js
 * Created at 2018. 10. 29. 오후 6:10:09.
 *
 * @author osm8667
 ************************************************/

var dateLib = cpr.core.Module.require("lib/DateLib");
var comLib; 
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	initLayout();
	comLib = createComUtil(app);
}


/*
 * 특정 이벤트 및 트랜잭션 수행 후 초기화가 필요한 컨트롤러 및 레이아웃, 데이터에 대해 초기화를 수행
 */
function initLayout() {
	
	var oSearchParam = app.lookup("dm_SearchParam");
	oSearchParam.reset();
	
	var oRenewButton = app.lookup("btn_Renew");
	var oAutoRenewButton = app.lookup("btn_AutoRenew");
	var oRenewAllButton = app.lookup("btn_RenewAll");
	var oAutoAllRenewButton = app.lookup("btn_AutoRenewAll");
	var oDeleteButton = app.lookup("btn_IssueDelete");
	
	oRenewButton.enabled = false; // 갱신 버튼 disabled
	oAutoRenewButton.enabled = false; // 자동 갱신 버튼 disabled
	oRenewAllButton.enabled = false; // 갱신 전체 선택 버튼 disabled
	oAutoAllRenewButton.enabled = false; // 자동 갱신 전체 선택 버튼 disabled
	oDeleteButton.enabled = false; // 삭제 버튼 disabled
}


/*
 * 특정 이벤트 및 트랜잭션 수행 후 버튼 레이아웃 enable 조정
 */
function enableControl(){
	
	var oRenewButton = app.lookup("btn_Renew");
	var oAutoRenewButton = app.lookup("btn_AutoRenew");
	var oRenewAllButton = app.lookup("btn_RenewAll");
	var oAutoAllRenewButton = app.lookup("btn_AutoRenewAll");
	var oDeleteButton = app.lookup("btn_IssueDelete");
	
	oRenewButton.enabled = true; // 갱신 버튼 disabled
	oAutoRenewButton.enabled = true; // 자동 갱신 버튼 disabled
	oRenewAllButton.enabled = true; // 갱신 전체 선택 버튼 disabled
	oAutoAllRenewButton.enabled = true; // 자동 갱신 전체 선택 버튼 disabled
	oDeleteButton.enabled = true; // 삭제 버튼 disabled
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCbx_cateSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cbx_cate = e.control;
	var value = cbx_cate.value;
	/*
	 * 검색 텍스트 널값 허용 -> 널값 조회 시 전체 목록으로 조회.
	 * 최소 길이는 설정 안함
	 * 전체 또는 만료일 기준의 조회 시 input 제어
	 * 포커스 이동 처리
	 */
	var oInput = app.lookup("ipt_search");
	if(value==0||value==3){
		oInput.value = "";
		oInput.enabled = false;
	}else{
		oInput.focus();
		oInput.enabled = true;
	}
}


/*
 * "검색" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_IssueSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_IssueSearch = e.control;
	initLayout();
	onIssueSearch();
	
}


/*
 * "검색" 서브미션 부 분리
 */
function onIssueSearch (){
	var param = app.lookup("dm_SearchParam");
	var oCombo = app.lookup("cbx_cate");
	var oInput = app.lookup("ipt_search");
	
	param.setValue("clssCd", oCombo.value);
	param.setValue("keyword", oInput.value);
	
	//app.lookup("getIssueInfo").send("getIssueInfo");
	comLib.send("getIssueInfo");
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onGetIssueInfoSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var getIssueInfo = e.control;
	var oList = app.lookup("ds_IssueInfo");
	if (oList.getRowCount()==0) {
		initLayout();
	}else{
		var oInput = app.lookup("ipt_search");
		var oCombo = app.lookup("cbx_cate");
		var text = oInput.value;
		//var oList = getIssueInfo.xhr.responseText;
		var oList = app.lookup("ds_IssueInfo");
		var data = [];
		if(text){
			if(oCombo.value==1){
				var buildData = oList.findAllRow("UserID *='"+ text +"'");
				for(var i=0; i<buildData.length; i++){
					data.push(buildData[i].getRowData());//필터링한 데이터를 json형식으로 받아옵니다.
				}
				oList.build(data, false);//받아온 데이터를 기존 데이터는 삭제한 후 빌드합니다.
			}else if(oCombo.value==2){
				var buildData = oList.findAllRow("UserName *='"+ text +"'");
				for(var i=0; i<buildData.length; i++){
					data.push(buildData[i].getRowData());
				}
				oList.build(data, false);
			}
		}else if(oCombo.value==3){
			var addMonth = dateLib.calcToday("", 1, "");
			var formDate = dateLib.makeDateFormat(addMonth, "-")+" 00:00:00";
			var buildData = oList.findAllRow("ExpDate<'"+formDate+"'");
			for(var i=0; i<buildData.length; i++){
				data.push(buildData[i].getRowData());
			}
			oList.build(data, false);
		}
		if(oList.getRowCount()==0){
			initLayout();
		}else{
			enableControl();
		}
	}
}


/*
 * "갱신" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_RenewClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_Renew = e.control;
	var oGrid = app.lookup("grd_IssueInfo");
	var issueInfo = app.lookup("ds_IssueInfo");

	var indice = oGrid.getCheckRowIndices();
	if(indice.length==0){
		dialogAlert(app, "", "선택한 항목이 없습니다.");
		return;
	}
	
	var rtn = indice.some(function(/* Number */ i){
		var expDate = oGrid.getRow(i).getRowData().ExpDate;
		var format = expDate.substr(0,4)+expDate.substr(5,2)+expDate.substr(8,2);
		if(!format){
			return true;
		}
		var compareMonth = dateLib.calcToday("", 1, "");
		var valid = dateLib.compareDate(format, compareMonth);
		if(valid==0){
			dialogAlert(app, "", "선택한 항목에 만료일이 한 달 이상인 항목이 있습니다.");
			return true;
		}
		return false;
	});
	if(!rtn){
		dialogConfirm(app, "", "선택한 "+indice.length+"개의 항목을 갱신 하겠습니까?", function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					reNew(oGrid, issueInfo, indice);
				} else {
					return;
				}
			});
		});
	}
}


function reNew(grd, ds, indice){
	for(var i=0; i<indice.length; i++) {
		var expDate = grd.getRow(indice[i]).getRowData().ExpDate;
		var format = expDate.substr(0,4)+expDate.substr(5,2)+expDate.substr(8,2);
		if(!format){
			return;
		}
		var addDate = dateLib.addDay(format, 365);
		var formatDate = dateLib.makeDateFormat(addDate, "-");
		ds.setValue(indice[i], "ExpDate", formatDate+" 00:00:00");
	}
	dialogAlert(app, "갱신", "갱신이 완료되었습니다.");
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onDoRenewSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var doRenew = e.control;
	var message = doRenew.getMetadata("msg");
	if (message) {
		dialogAlert(app, "", message);
	}
	onIssueSearch();
}


/*
 * "자동갱신" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_AutoRenewClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_AutoRenew = e.control;
	var oGrid = app.lookup("grd_IssueInfo");
	var issueInfo = app.lookup("ds_IssueInfo");
	
	var indice = oGrid.getCheckRowIndices();
	if(indice.length==0){
		dialogAlert(app, "", "선택한 항목이 없습니다.");
		return;
	}
	var rtn = indice.some(function(/* Number */ i){
		var isYn = oGrid.getRow(i).getRowData().AutoRenewalYn;
		if(isYn=='Y'){
			dialogAlert(app, "", "선택한 항목에 이미 자동갱신으로 등록된 항목이 있습니다.");
			return true;
		}
		return false;
	});
	//confirm
	if(!rtn){
		dialogConfirm(app, "", "선택한 "+indice.length+"개의 항목을 자동갱신 등록 하겠습니까?", function(/*cpr.controls.Dialog*/dialog){
			dialog.addEventListenerOnce("close", function(e) {
				if (dialog.returnValue) {
					autoRenew(issueInfo, indice);
				} else {
					return;
				}
			});
		});
	}
	//change data
//	var doAutoRenew = app.lookup("doAutoRenew");
//	doAutoRenew.send();
}

function autoRenew(ds, indice){
	for(var i=0; i<indice.length; i++){
		ds.setValue(indice[i], "AutoRenewalYn", "Y");
	}
	dialogAlert(app, "자동갱신등록", "등록이 완료되었습니다.");
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onDoAutoRenewSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var doAutoRenew = e.control;
	var message = doRenew.getMetadata("msg");
	
	if (message) {
		dialogAlert(app, "", message);
	}
	onIssueSearch();
}


/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_IssueDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_IssueDelete = e.control;
	var oGrid = app.lookup("grd_IssueInfo");
	var indice = oGrid.getCheckRowIndices();//그리드 체크 박스에 체크된 행의 배열을 가져온다.
	if(indice.length==0){
		dialogAlert(app, "", "선택한 항목이 없습니다.");
		return;
	}
	dialogConfirm(app, "", "선택한 "+indice.length+"개의 항목을 삭제하시겠습니까?", function(/*cpr.controls.Dialog*/dialog){
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				indice.forEach(function(/* Number */ each){
					oGrid.deleteRow(each);
				});
				dialogAlert(app, "목록삭제", "삭제가 완료되었습니다.");
			} else {
				return;
			}
		});
	});
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onDoDeleteInfoSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var doDeleteInfo = e.control;
	
}


/*
 * "갱신 전체선택" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_RenewAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_RenewAll = e.control;
	var oGrid = app.lookup("grd_IssueInfo");
	if(oGrid.getFilter()){
		var autoButton = app.lookup("btn_AutoRenewAll");
		autoButton.enabled = true;//자동 갱신 전체선택 버튼은 enable 시킵니다.
		btn_RenewAll.text = "갱신 전체선택";
		oGrid.clearFilter();
		oGrid.clearAllCheck();
	}else{
		var autoButton = app.lookup("btn_AutoRenewAll");
		autoButton.enabled = false;//자동 갱신 전체선택 버튼은 disabled 시킵니다.
		btn_RenewAll.text = "전체선택 해제";
		var addMonth = dateLib.calcToday("", 1, "");
		var compareDate = dateLib.makeDateFormat(addMonth, "-");
		oGrid.filter("ExpDate<'"+compareDate+"'");
		oGrid.checkAllRow();
	}
}


/*
 * "자동갱신 전체선택" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_AutoRenewAllClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_AutoRenewAll = e.control;
	
	var oGrid = app.lookup("grd_IssueInfo");
	if(oGrid.getFilter()){
		var renewButton = app.lookup("btn_RenewAll");
		renewButton.enabled = true;//갱신 전체선택 버튼은 enable 시킵니다.
		btn_AutoRenewAll.text = "자동갱신 전체선택";
		oGrid.clearFilter();
		oGrid.clearAllCheck();
	}else{
		
		var renewButton = app.lookup("btn_RenewAll");
		renewButton.enabled = false;//갱신 전체선택 버튼은 disabled 시킵니다.
		
		btn_AutoRenewAll.text = "전체선택 해제";
		var addMonth = dateLib.calcToday("", 1, "");
		var compareDate = dateLib.makeDateFormat(addMonth, "-");
		oGrid.filter("AutoRenewalYn=='N'");
		oGrid.checkAllRow();
	}
}




/*
 * 그룹에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onGroupKeydown(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group = e.control;
	// 검색부에서 Enter Key가 입력되면 자동 조회
	if (e.keyCode == cpr.events.KeyCode.ENTER) {
		// 화면 조회
		onIssueSearch();
	}
}
