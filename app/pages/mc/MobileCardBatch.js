/************************************************
 * MobileCardBatch.js
 * Created at 2018. 10. 29. 오후 6:08:29.
 *
 * @author osm8667
 ************************************************/

var dateLib = cpr.core.Module.require("lib/DateLib");
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	/*화면의 초기화가 필요한 컨트롤에 대해 초기화를 수행합니다.*/
	//라이오버튼 초기화
	var oRadio = app.lookup("rad_User");
	oRadio.selectItem(0); // 초기값을 할당합니다.
	//기간 입력 초기화
	var oDateInput = app.lookup("cbx_date").getComboObj();//udc에서 컨트롤을 가져옵니다.(객체를 넘기는 방식)
	if(oDateInput.enabled){oDateInput.enabled = false;}
	var today = dateLib.getToday(); // 오늘 날짜를 가져옵니다.
	oDateInput.value = today;
	var oButton = app.lookup("btn_UserBatch");
	if(oButton.enabled){oButton.enabled = false;}
}


/*
 * "조회" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_UserSearchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_UserSearch = e.control;
	
	var param = app.lookup("dm_SearchParam");
	param.reset();//보냈던 파라미터를 초기화 해줍니다.
	onMobileCardSearch();
}

function onMobileCardSearch() {
//	var oRadio = app.lookup("rad_User");
//	var searchParam = app.lookup("dm_SearchParam");
//	var radioValue = oRadio.value;
//	searchParam.setValue("clssCd", radioValue);
	
	var getUserList = app.lookup("getUserList");
	getUserList.send();
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onGetUserListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var getUserList = e.control;
	var oRadio = app.lookup("rad_User");
	var radioValue = oRadio.value;
	var oList = app.lookup("ds_MobileUserList");
	var data = [];
	if(radioValue==1){
		var addMonth = dateLib.calcToday("", 1, "");
		var buildData = oList.findAllRow("ExpDate<'"+addMonth+"'");
		for(var i=0; i<buildData.length; i++){
			data.push(buildData[i].getRowData());
		}
		oList.build(data, false);
	}
	var oGrid = app.lookup("grd_MobileCardBatch");
	var rowCount = oGrid.getRowCount();
	oGrid.redraw();
	var oButton = app.lookup("btn_UserBatch");
	var oDateInput = app.lookup("cbx_date").getComboObj();
	if(rowCount==0){
		oButton.enabled = false;
		oDateInput.enabled = false;
	}else{
		oButton.enabled = true;
		oDateInput.enabled = true;
	}
}


/*
 * 라디오 버튼에서 selection-change 이벤트 발생 시 호출.
 * 라디오버튼 아이템을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onRad_UserSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.RadioButton
	 */
	var rad_User = e.control;
}


/*
 * 사용자 정의 컨트롤에서 change-value 이벤트 발생 시 호출.
 */
function onCbx_dateChangeValue(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type udc.DateCombo
	 */
	var cbx_date = e.control;
	var date = cbx_date.date_value;
	var valid = dateLib.compareDate(dateLib.getToday(), date);
	if(valid==0){
		dialogAlert(app, "", "오늘 이전의 날짜는 선택하실 수 없습니다.");
		cbx_date.getComboObj().value = dateLib.getToday();
		return;
	}
	
}





/*
 * "일괄발급" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_UserBatchClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btn_UserBatch = e.control;
	var oGrid = app.lookup("grd_MobileCardBatch");
	var oUserList = app.lookup("ds_MobileUserList");
	var indice = oGrid.getCheckRowIndices();//check 한 행의 인덱스를 가져옵니다.
	
	if(indice.length==0){
		dialogAlert(app, "", "선택한 항목이 없습니다.");
		return;
	}
	//confirm
	dialogConfirm(app.getRootAppInstance(), "", "선택한 항목에 대해 일괄발급 처리하시겠습니까?", function(/*cpr.controls.Dialog*/dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			if (dialog.returnValue) {
				var selectDate = app.lookup("cbx_date").date_value;
				var addDate = dateLib.addDay(selectDate, 365); // 입력 받은 날짜에서 1년을 더합니다.
				var format = dateLib.makeDateFormat(addDate, "-");
				indice.forEach(function(/* Number */ indice){
					oUserList.setValue(indice, "Card", 1);//check한 행의 값을 변경합니다.
					oUserList.setValue(indice, "ExpDate", format);
				});
			} else {
				return;
			}
		});
	});
}

function batchCard() {
	
}

