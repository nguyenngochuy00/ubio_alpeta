/************************************************
 * tnaStep3.js
 * Created at 2018. 10. 18. 오전 11:25:45.
 *
 * @author joymrk
 ************************************************/

/*
 * Body에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
	// DB에 등록된 wWorkShift 테이블에 있는 근무시간 코드 요청
	// 받아와서 다음 코드번호 자동 표기
}

/*
 * "추가 등록" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnAddClick(e){
	var btnAdd = e.control;
	var editbox1 = app.lookup("ipb1");
	var editbox2 = app.lookup("ipb2");
	
	if( editbox1.length <= 0) {
		alert("코드 정보는 필수 입력 정보 입니다.");
		return;
	} else if(editbox2.length <= 0) {
		alert("명칭 정보는 필수 입력 정보 입니다.");
		return;
	}
	
	var grid = app.lookup("grd1");
	
	var insertRow = grid.insertRow(1,true);
	grid.updateRow(insertRow.getIndex(), {"code": editbox1.value, "name": editbox2.value});
}


/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(e){
	var button = e.control;
	var grid = app.lookup("grd1");
	var selectedIdx = grid.getSelectedRowIndex();
	
	grid.deleteRow(selectedIdx);
}
