/************************************************
 * DateCombo.js
 * Created at 2018. 10. 30. 오전 9:14:05.
 *
 * @author osm8667
 ************************************************/
/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
}


/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getComboDate = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	var oCombo = app.lookup("cbx_dateCombo");
	var selectDateStr = oCombo.value;
	return selectDateStr;
};

exports.getComboObj = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	var oCombo = app.lookup("cbx_dateCombo");
	return oCombo;
};



/*
 * 데이트 인풋에서 value-change 이벤트 발생 시 호출.
 * Dateinput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onCbx_dateComboValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.DateInput
	 */
	var cbx_dateCombo = e.control;
	
	var evt = new cpr.events.CUIEvent("change-value");
	app.dispatchEvent(evt);
}
