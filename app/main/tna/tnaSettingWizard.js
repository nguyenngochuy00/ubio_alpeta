/************************************************
 * tnaSettingWizard.js
 * Created at 2018. 10. 17. 오후 7:52:45.
 *
 * @author joymrk
 ************************************************/
var clickedpage; 
var usint_version;
var dataManager = cpr.core.Module.require("lib/DataManager");
function SaveBtnVisible(visibleflag) {
	var button = app.lookup("btnSave");
	if(visibleflag == true) {
		button.visible = true;	
	} else {
		button.visible = false;
	}
}
/**
 * 버튼을 선택할 때 화면 전환
 * @param selectedButton 선택한 버튼 컨트롤
 */
function changePage(selectedButton) {
	var emb = app.lookup("emb");
	
	var grpButtons = app.lookup("grpButtons");
	var buttons = grpButtons.getChildren();
	
	var url = selectedButton.userattr("src") + "?" + usint_version;
	
	emb.app = null;
	cpr.core.App.load(url, function(loadedApp){
		if(!loadedApp) {
			return;
		}
		
		emb.app = loadedApp;
		emb.redraw();
		
		for(var i = 0; i < buttons.length; i++){
			if (selectedButton == buttons[i]) {
				buttons[i].style.css("backgroundColor", "#E3E0DF");
				buttons[i].style.css("border-bottom", "2px black solid");		
			} else {
				buttons[i].style.removeStyle("backgroundColor");
				buttons[i].style.removeStyle("border-bottom");
			}
		}
	});
}

/*
 * "STEP1
기본 근무 시간" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnStep1Click(e){
	var btnStep1 = e.control;
	changePage(btnStep1);
	
}

/*
 * "STEP2
근무 시간 설정" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnStep2Click(e){
	var btnStep2 = e.control;
	changePage(btnStep2);
}

/*
 * Body에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(e){
	
	var btnStep1 = app.lookup("btnStep1");
	changePage(btnStep1);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
}

/*
 * "STEP3
입력 정보" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnStep3Click(e){
	var btnStep3 = e.control;
	changePage(btnStep3);
}

/*
 * "STE4
근무 일정 셋팅" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnStep4Click(e){
	var btnStep4 = e.control;
	changePage(btnStep4);
}

/*
 * "STEP5
완 료" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnStep5Click(e){
	var btnStep5 = e.control;
	changePage(btnStep5);
}

/*
 * "다 음" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnAfterClick(e){
	var btnAfter = e.control;
	var button;
	//현재 버튼상태
	switch(clickedpage) {
	case 0 :	button = app.lookup("btnStep2");
		changePage(button);
		SaveBtnVisible(false);
		break;
	case 1 :	button = app.lookup("btnStep3");
		changePage(button);
		SaveBtnVisible(false);
		break;
	case 2:		button = app.lookup("btnStep4");
		changePage(button);
		SaveBtnVisible(false);
		break;
	case 3:		button = app.lookup("btnStep5");
		changePage(button);
		SaveBtnVisible(true);
		break;
	case 4:	alert("마지막 항목 입니다.");
		SaveBtnVisible(true);
		break;
	}
	
}

/*
 * "이 전" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnBeforeClick(e){
	var btnBefore = e.control;
	var button;
	//현재 버튼상태
	switch(clickedpage) {
	case 0:	alert("첫 페이지  입니다.");
		SaveBtnVisible(false);
		break;
	case 1:	button = app.lookup("btnStep1");
		changePage(button);
		SaveBtnVisible(false);
		break;
	case 2:	button = app.lookup("btnStep2");
		changePage(button);
		SaveBtnVisible(false);
		break;
	case 3:	button = app.lookup("btnStep3");
		changePage(button);
		SaveBtnVisible(false);
		break;
	case 4:	button = app.lookup("btnStep4");
		changePage(button);
		SaveBtnVisible(false);
		break;		
	}
}


/*
 * "완 료" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSaveClick(e){
	var btnSave = e.control;
}
