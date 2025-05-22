/************************************************
 * tnaStep4.js
 * Created at 2018. 10. 18. 오후 2:01:42.
 *
 * @author joymrk
 ************************************************/

function setGridSpinofDays(selectedidx) {
	var spinCnt = parseFloat(selectedidx)+1;
	
	var selDate = app.lookup("dti1");
	var sDate = new Date(selDate.text);	//시작일자
	var grid = app.lookup("grd1");
	for(var i=0; i < spinCnt; i++) {
		sDate.setDate(sDate.getDate()+1);
		
		var insertRow = grid.insertRow(i+1, true);
		grid.updateRow(insertRow.getIndex(), {"C_BasicDay": sDate.getDate(), "L_SpinCount" : sDate.getDay()});

	}
	grid.redraw();
}

/*
 * Body에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();''
	
	if(dd<10) {
    	dd='0'+dd;
	} 

	if(mm<10) {
	    mm='0'+mm;
	} 

	today = yyyy+'-'+mm+'-'+dd;
	
	var datainput = app.lookup("dti1");
	datainput.value = today;
	
	var combo = app.lookup("cmb1");
	for(var i = 0; i < 30; i++){
		var label = (i+1) + "일";
		combo.addItem(new cpr.controls.Item(label, i));
	
	}
	combo.value = "6";
	//
	var selected = combo.value;
	setGridSpinofDays(selected);
}
