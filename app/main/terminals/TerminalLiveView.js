/************************************************
 * TerminalMultiView.js
 * Created at 2023. 6. 19. ���� 09:20:21.
 *
 * @author mjy
 ************************************************/

//cpr.core.ResourceLoader.loadScript("../../thirdparty/dmsPlayer/dms-video-player.min.js");
var dataManager = cpr.core.Module.require("lib/DataManager");

// 미디어 서버설정 초기값
var rtspUrl = "NotSet";
var proto = "NotSet";
var transcodeValue = -2;

var player;
var playerMap = new Map(); // player 생성확인용

// 브라우저에서 API 할 경우 필요. API 서버URL
//var URL = 'http://192.168.30.186:8080/'; 

// 실시간 인증로그, 이벤트로그 관련
var terminalMap = new Map();


/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	// 터미널 리스트 가져오기
	var terminalList = dataManager.getTerminalList();
	if(terminalList){
		var dsTerminalList = app.lookup("TerminalList");
		dsTerminalList.clear();
		
		var LoginUserInfo = dataManager.getAccountInfo();
		var LoginUserID = LoginUserInfo.getValue("UserID");
		var LoginPrivilege = LoginUserInfo.getValue("Privilege");
		
		for (var i=0; i<terminalList.getRowCount(); i++) {
			var terminalInfo = terminalList.getRow(i);
			
			dsTerminalList.addRowData(terminalInfo.getRowData());
		}	
	}
	
//	app.lookup("sms_getVurixConfig").send();
	
	/*
	// 기존에 정보 받아왔으면 API Login X
	if(localStorage.getItem("vurixDeviceList")){
		var deviceList = JSON.parse(localStorage.getItem("vurixDeviceList"));
		var vurixDeviceList = app.lookup("VurixDeviceList");
		vurixDeviceList.clear();
		
		deviceList.forEach(function(value, index){
			vurixDeviceList.addRowData(value);
		});
	} else {
//		vurixAPI_Login(); 
	}
	*/
	
	app.lookup("sms_getVurixDeviceList").send();
	
}


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){

	app.lookup("MRMAN_treGroup").redraw();
	
	
	// 이벤트기록 리스트
	var cmbEventCategory = app.lookup("MRMAN_cmbEventCategory");
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Terminal"), 1));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Door"), 2));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_Emergency"), 3));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal"), 4));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_System"), 5));
	
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_EventCategoryDoorUint"), 0x0f000000));
	cmbEventCategory.addItem(new cpr.controls.Item(dataManager.getString("Str_EventCategoryTurnstileUint"), 0x0f000010));
	
	initComboEventLogContents();
	initComboAuthLog();
	
	var grdcount = app.lookup("MRMAN_grdAuthlog").columnCount; 
	var grdArr = [];
	for(var i=0;i<grdcount;i++){
		grdArr[i] = app.lookup("MRMAN_grdAuthlog").detail.getColumn(i).columnName;
	}
	//기존 칼럼 리스트 스토리지 set
	var grdStorage = grdArr.toString();
	localStorage.setItem("grdStorage",grdStorage);
	
	var selectStorageBefore = localStorage.getItem("selectStorage");
	if (selectStorageBefore == null){
		localStorage.setItem("selectStorage",grdStorage);
	}
	var selectStorageAfter = localStorage.getItem("selectStorage");
	GridSetting(selectStorageAfter);
	
	var dsTerminalList = app.lookup("TerminalList");
	for (var i = 0; i < dsTerminalList.getRowCount(); i++) {			
		var terminalInfo = dsTerminalList.getRow(i);
		if( terminalInfo.getValue("Status") == 0 ){	terminalInfo.setValue("Event",1);}
//		terminalMap.set(terminalInfo.getValue("ID"), terminalInfo);
	}
}



/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl1Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl1 = e.control;
	var content = e.content;
	
	content.innerHTML = "<div id = \"video_parent\"></div>";
}


/*
 * 트리에서 item-dblclick 이벤트 발생 시 호출.
 * 아이템 더블 클릭시 발생하는 이벤트.
 */
function onMRMAN_treGroupItemDblclick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.Tree
	 */
	var mRMAN_treGroup = e.control;
	
	var dsTerminalList = app.lookup("TerminalList");
	
	// findFirstRow로 인한 성능 이슈가 있을 수 있으므로 데이터셋 따로해서 ID를 devSerial로 하는 Tree 제작 고려중
	var terminalID = mRMAN_treGroup.value;
	var terminalName = mRMAN_treGroup.getItemByValue(terminalID).label;
	var vurixSerial = dsTerminalList.findFirstRow("ID == " + terminalID).getValue("dev_serial");
	
	if(playerMap.size == 4) {
		dialogAlert(app, dataManager.getString("Str_Fail") , dataManager.getString("Str_only4Monitoring") );
		return;
	}
	
	if(vurixSerial != "" && vurixSerial != undefined) { // vurix에 등록된 단말기면 player 생성
		if(playerMap.get(terminalID)){  // 이미 player가 만들어져있으면 return
			dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorLiveViewAlreadyExist"))
			return;
		}	
		createPlay(terminalID, terminalName, vurixSerial);
	} else {
		dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorNotExistVurix"));
	}
	
}


// Player 생성
function createPlay(terminalID, terminalName, vurixSerial){
	
	var dmVurixServerInfo = app.lookup("VurixServerInfo");
	var transcode = dmVurixServerInfo.getValue("TransCode");
	var vmsID = dmVurixServerInfo.getValue("VmsID");
	var serverURL = dmVurixServerInfo.getValue("DmsURL");
	var dsTerminalList = app.lookup("TerminalList");
	
	serverURL = "ws://" + serverURL + "/media/api/v1/stream";
	
    if (transcode.length > 0) {
      transcodeValue = Number(transcode);
      if (transcodeValue != -1 && transcodeValue != 0 && transcodeValue < 32 && transcodeValue > 2000) {
        errorMsgCallback(`invalid transcode value ${transcodeValue}`)
        return
      }
    }

    rtspUrl = "vurix:///"+ vmsID +"/"+vurixSerial+"/0/0";
    if (!rtspUrl || '' || null) {
//      app.lookup("playerStatus1").value = " :: RTSP URL 정보를 입력해 주세요."
      return false;
    }
    if (rtspUrl.search(/rtsp:\/\/[^\/]+/g) == 0) {
      proto = "rtsp";
    } else if (rtspUrl.search(/realhub:\/\/\/[^\/]+/g) == 0) {
      proto = "realhub";
    } else if (rtspUrl.search(/vurix:\/\/\/[^\/]+/g) == 0) {
      proto = "vurix";
    } else if (rtspUrl.search(/cinderella:\/\/\/[^\/]+/g) == 0) {
      proto = "cinderella";
    } else {
      errorMsgCallback(`invalid url: ${rtspUrl}`);
      return
    }
	
	// 동영상에 캡션넣기
	var figure = document.createElement("div");
	figure.id = "figure"+terminalID;
	figure.className = "figure-monitoring";
	
	var btnSrc = "/../../theme/images/icon_closes.png";
	figure.innerHTML = "<b><p style=\"text-align:center; font-weight:bold; font-size: 15px;\">"+terminalName+""
	 + "<input type=\"image\" id=\""+terminalID+"\" style=\"float:right; width:5%; height:2%;\" src = "+btnSrc+"></input></b></p>";

	// <button type=\"button\"><img src="+btnSrc+" alt=\"\"></button>
	// <input type=\"image\" id=\""+terminalID+"\" style=\"float:right; font:bold;\" value=\" X \" src = "+btnSrc+"></input>
    var videoOptions = {
      'id': 'video_' + terminalID,                           
      'url': rtspUrl,      
      'srcType': proto,                           
      'stream': serverURL,            
      'errorMsgFunc': errorMsgCallback
    };

    if (transcodeValue != -2) {
      videoOptions.transcode = transcodeValue;
    }
//    console.log(videoOptions);
    
	player = dmsVideoPlayer.createVideo(videoOptions);
	figure.appendChild(player);
	
    document.getElementById('video_parent').appendChild(figure);
//    document.querySelector("video").className = "video-monitoring"; // 화면회전 CSS
//    player.className = "video-monitoring";
    
	// videojs control	
    player.className = "video-js";
	var videoID = 'video_'+terminalID;	
	var videoEle = videojs(videoID,{
		controls:true,
		playbackRates: [.5, .75, 1, 1.25, 1.5],
		controlBar: {
        	children: [
            	"playToggle",
	            "volumeMenuButton",
	            "timeDivider",
	            "currentTimeDisplay",
	            "progressControl",
//	            "remainingTimeDisplay",
	            "durationDisplay",
	            'playbackRateMenuButton',
	            'pictureInPictureToggle',
	            "fullscreenToggle"
	        ]
    	}
	});
	
	// 영상에 단말기 ID , 이름 overlay 작업
 	var div = document.createElement("div");
    div.innerHTML = `<b>
    <p style=" margin: 0; color: blue; font-size: 15px; position: absolute; left:5px;">`+terminalID+`_`+terminalName+
    `</b></p>`;
//    vv.el().appendChild(div); // 영상에 안넣는게 나은거 같기도	
    
	// 일시 정지 정상 동작하도록
    player.addEventListener("pause", function(e){
    	var id = e.target.id.substr(6);
    	id = id.split("_")[0];
    	var targetPlayer = playerMap.get(id);
		if(targetPlayer != undefined){
			targetPlayer.stop;		
		}
    	
    }, false);
    
    player.addEventListener("error", function(e){
    	var id = e.target.id.substr(6);
    	id = id.split("_")[0];
    	var targetPlayer = playerMap.get(id);
    	if(targetPlayer){
	    	var c = targetPlayer.error;
	    	console.log(c);
    	}
    }, false);
    
//	player.onloadedmetadata = function(e){
//		var id = e.target.id.substr(6);
//		id = id.split("_")[0];
//    	var targetPlayer = playerMap.get(id);
//	}
//	
	// 재생중에 영상이 멈추는 경우 발생하는 이벤트
	player.onwaiting = function(e) {
		var id = e.target.id.substr(6);
		id = id.split("_")[0];
    	var targetPlayer = playerMap.get(id);
		if(targetPlayer){
			/*
			 * readyState 속성 정보
			 * HAVE_NOTHING  미디어에 대한 정보 없음 : 		   					 0
			 * HAVE_METADATA 메타데이터만 있음 (지금 재생할 데이터는 없음) :    		 1
			 * HAVE_CURRENT_DATA 지금 재생할 미디어 데이터는 있으나, 향후 진행할 데이터가 없음 : 2
			 * HAVE_FUTURE_DATA 현재도, 앞으로도 데이터 있음 : 				     3
			 * HAVE_ENOUGH_DATA 전체 재생까지 문제없음 : 					     4
			 */
			var readyState = targetPlayer.readyState;
			var networkState = targetPlayer.networkState;
	    	var originTime = targetPlayer.currentTime; // 현재 재생중인 시간
	    	var duration = targetPlayer.duration; // 메타데이터를 로딩하여 얻은 재생가능 길이
			var buffer = targetPlayer.buffered;
			
			// 스트림 첫 시작 시 재생안되는 경우가 있어 작성 (시작시 무조건 +1초 뒤 재생)
			if(originTime == 0) {
				targetPlayer.currentTime = originTime + 1;
			} 
			
			if(duration >= 18000){
				// 웹소켓이 끊어진 건 아닌데 바이너리 파일(미디어 데이터)을 못받는 상태가 간혹 있어서 작성
				// 5시간이 지나면 스트림 다시 하기
				dmsVideoPlayer.streamStop(targetPlayer);
				dmsVideoPlayer.streamPlay(targetPlayer);
			}
			
			if(readyState != 2) {
//				console.error(terminalID + "  " + readyState);
			}
			
			if(targetPlayer.error != null) {
				console.error("TerminalID = " + id +"error : "+ targetPlayer.error)
			}
		}
	}
	
	// 오랫동안 스트림중이면 중계서버가 동작하지 않는 경우가 발생하여 작성 
	player.ondurationchange = function(e) {
		var id = e.target.id.substr(6);
		id = id.split("_")[0];		
    	var targetPlayer = playerMap.get(id);
		if(targetPlayer){
	    	var readyState = targetPlayer.readyState;
	    	var originTime = targetPlayer.currentTime; // 현재 재생중인 시간
	    	var duration = targetPlayer.duration; // 메타데이터를 로딩하여 얻은 재생가능 길이
	    	
			if( originTime + 300 <= duration){ 
				// 메타데이터는 로드되지만(재생가능한 길이는 증가), 미디어 데이터를 로딩못해서(재생이 안되는 현상) 무한 버퍼링 걸리는 경우가 발생함
				// 계속 내버려두면 중계서버도 정상동작이 안되게 되므로, 현재 재생시점보다 재생가능 길이가 5분이상 차이나면(버퍼링중이라 판단) 스트림 다시 하도록.  
				dmsVideoPlayer.streamStop(targetPlayer);
				dmsVideoPlayer.streamPlay(targetPlayer);
			}
		}
	}
	
    // 삭제버튼 이벤트 할당
	document.getElementById(terminalID).addEventListener("click", function(e){
		var id = e.target.id;
		deleteVideo(id);
	}, false);  
    
    
	if(!player) {
		console.log("player 생성오류");
	} else { // 잘 생성됨
//		console.log( ":: "+ rtspUrl +"생성됨");
	    stream_play();
	    
	    // map에 저장
	    playerMap.set(terminalID, player);
	    terminalMap.set(Number(terminalID),dsTerminalList.findFirstRow("ID == " + terminalID));
	}
}

function errorMsgCallback(err){
	var errStr = JSON.stringify(err, null, 4);
	console.error(errStr);
	dialogAlert(app, dataManager.getString("Str_Fail"), dataManager.getString("Str_ErrorDataNotExist"));
}

// Player 재생
function stream_play() {
	if(player) {
		dmsVideoPlayer.streamPlay(player);
//		console.log(":: "+ rtspUrl +"재생중");
	}
}


/*
 * 쉘에서 init 이벤트 발생 시 호출. 
 */
function onShl1Init(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl1 = e.control;
	//쉘 다시 그리지 않도록 방지
	if(e.content) {
		e.preventDefault();
	}
}


// 메뉴 닫을 경우 중계서버와 웹소켓 연결 해제
//exports.webSocket_disconnect = function(){
//	for(var value of playerMap.values()){
//		dmsVideoPlayer.playerClose(value);
//	}
//}


function vurixAPI_Login(){
	$(document).ready(function(){
		$.ajax({
			url : URL+"api/login",
			type : "GET",
			async : false,
			beforeSend : function(xhr){
				xhr.setRequestHeader("x-account-id", "admin");
				xhr.setRequestHeader("x-account-pass", "admin");
				xhr.setRequestHeader("x-account-group", "group1");
				xhr.setRequestHeader("x-license", "licNormalClient|licAccessControl");
			},
			success : function(result){
				console.log("로그인 성공");
				
				localStorage.setItem("vurixWebAPI_AuthToken",result.results.auth_token);
				
				var info = app.lookup("VurixInfo");
				info.setValue("authToken", result.results.auth_token);
				info.setValue("apiSerial", result.results.api_serial);
				info.setValue("vmsID", result.results.vms_id);
				
				vurixAPI_getDeviceList();
			},
			error : function(error){
				console.log("로그인 실패");
				console.log(error.responseJSON);
			}
		})
	})
}

function vurixAPI_getDeviceList() {
	var vurixInfo = app.lookup("VurixInfo");
	var vurixDeviceList = app.lookup("VurixDeviceList");
	$.ajax({
		type : "GET",
		async : false,
		url : URL + "api/device/list/1/1?dev_only=true",
		beforeSend : function(xhr){
			xhr.setRequestHeader("x-auth-token", vurixInfo.getValue("authToken"));
			xhr.setRequestHeader("x-api-serial", vurixInfo.getValue("apiSerial"));
		},
		success : function(result){
			console.log("deviceList 요청 성공");
			console.log(result);
			
			var deviceTree = result.results.tree;
			deviceTree.forEach(function(value, index){
				var rowData = {
					"dev_addr" : value.dev_addr,
					"dev_serial" : value.dev_serial,
					"dev_name" : value.dev_name,
					"stat_name" : value.stat_name
				}
				
				vurixDeviceList.addRowData(rowData)
				vurixDeviceList.getValue(index, "dev_addr");
				vurixDeviceList.getValue(index, "dev_serial");
				vurixDeviceList.getValue(index, "dev_name");
				vurixDeviceList.getValue(index, "stat_name");
			});
			
			vurixDeviceList.setRowStateAll(cpr.data.tabledata.RowState.UNCHANGED);
			if(localStorage.getItem("vurixDeviceList")){
				localStorage.removeItem("vurixDeviceList");
			}
			
			var deviceList = JSON.stringify(vurixDeviceList.getRowDataRanged());
			localStorage.setItem("vurixDeviceList", deviceList);
//			console.log(localStorage.getItem("vurixDeviceList"));
			vurixAPI_Logout();
		},
		error : function(error){
			console.log("deviceList 요청 실패");
			console.log(error);
		}
	})
} 


function vurixAPI_Logout(){
	var vurixInfo = app.lookup("VurixInfo");
	$.ajax({
		type : "DELETE",
		aync : false,
		url : URL + "api/logout",
		beforeSend : function(xhr){
			xhr.setRequestHeader("x-auth-token", vurixInfo.getValue("authToken"));
		},
		success : function(result){
			console.log("LogOut 요청");
			console.log(result);
			
		},
		error : function(error){
			console.log("Logout 에러");
			console.log(error);
		}
	})
}

function device_addr_zeroFill(){
	var dsDeviceList = app.lookup("VurixDeviceList");
	
	var cnt = dsDeviceList.getRowCount();
	for(var i=0; i<cnt; i++){
		var row = dsDeviceList.getRow(i);
		var addr = row.getValue("dev_addr").split("."); // zero fill 해줘야하는 IP값
		var addrCh = "";
		for(var j=0; j<addr.length; j++){
			addrCh += addr[j].padStart(3, '0');
			if(j != addr.length-1) {
				addrCh += ".";
			}
		}
		row.setValue("dev_addr", addrCh);
	}
}

// dev_addr 과 IPAddress 매핑
function mapping_DeviceToTerminal(){
	var dsTerminalList = app.lookup("TerminalList");
	var cnt = dsTerminalList.getRowCount();
	
	var dsDeviceList = app.lookup("VurixDeviceList");
	var deviceCnt = dsDeviceList.getRowCount();
	
	for(var i=0; i<deviceCnt; i++){
		var row = dsDeviceList.getRow(i);
		var dev_name = row.getValue("dev_name");
		var tId = dev_name.substring(0, dev_name.indexOf("_")); // 첫번째  "_" 이전은 id
		var tName = dev_name.substring(dev_name.indexOf("_")+1); // 첫번째"_" 이후는 이름
		
		var terminalRow = dsTerminalList.findFirstRow("ID == '"+tId+"' && Name == '"+tName+"'");
		
		if(terminalRow){
			terminalRow.setValue("dev_serial", row.getValue("dev_serial"));
		} else {
			continue;
		}
	}
	
	// 매핑된 dev_serial 확인 
	if(dsTerminalList.findAllRow("dev_serial != '" + ""+"'").length > 0) {
//		var rows = dsTerminalList.findAllRow("dev_serial != '"+""+"'");
//		rows.forEach(function(each){
//			console.log("dev_serial : " + each.getValue("dev_serial"));
//		});
		console.log("Vurix 단말기 매핑 완료");
	} else {
		console.log("매핑 작업 실패 Vurix 세팅 확인 필요");
	}
}



// ************************************************************************************* 이벤트기록 리스트, 인증기록 리스트 관련
function initComboEventLogContents() {
	var cmbEventContent = app.lookup("MRMAN_cmbEventContent");

	// category - Terminal
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Disconnected"), 65537));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Connected"), 65538));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Locked"), 65539));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Unlocked"), 65540));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Tamper"), 65541));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Attached"), 65542));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Lockdowned"), 65543));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_OptionPollingtime"), 65544)); // 폴링타임 추가 otk
	
	if (dataManager.getOemVersion() == OEM_3D_NORMAL) {
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_InterpolStart3D"), 393217));	// 인터폴 요청
		cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_InterpolEnd3D"), 393218));	// 인터폴 종료
	}

	// category - door
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorOpen"), 131073));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorClose"), 131074));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorUnlock"), 131075));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorLock"), 131076));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorForced"), 131077));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorNotClosed"), 131078));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorLockRestored"), 131079));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorLockError"), 131080));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorNotMonitor"), 131081));
	
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorCommandOpen"), 131083));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorCommandClose"), 131084));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorCommandOpenTemp"), 131082));
	//출입문 임시개방은 이벤트가 발생하지 않아서 코드 확인 불가 상태라 주석처리
	
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorRemoteOpen"), 131088));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorRemoteUnlock"), 131089));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorRemoteLock"), 131090));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorChange"), 131091));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorIndoorOpen"), 131092));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Door2Open"), 131093));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Door2Close"), 131094));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_Door2IndoorOpen"), 131095));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_DoorNotClosedClear"), 131096));

	// category - emergency
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyAlarm"), 196609));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDisarm"), 196610));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyFireDetectStart"), 196611));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyFireDetectStop"), 196612));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyPanicDetectStart"), 196613));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyPanicDetectStop"), 196614));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyCrisisDetectStart"), 196615));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyCrisisDetectStop"), 196616));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyBlacklistAttempt"), 196617));
	
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDuress"), 196624));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencySystemError"), 196625));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDoorEmergency"), 196626));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDoor2"), 196627));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDoor2Emergency"), 196628));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDoor2NotClosedClear"), 196629));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyFire"), 196630));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyPanic"), 196631));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyPanicClear"), 196632));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyFireClear"), 196633));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyRelease"), 196634));
	
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyFPSensorAbnormal"), 196640));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyDBAbnormal"), 196641));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyRTCAbnormal"), 196642));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EmergencyTouchAbnormal"), 196643));

	// category - external signal
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal1Start"), 262145));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal1Stop"), 262146));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal2Start"), 262147));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal2Stop"), 262148));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal3Start"), 262149));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal3Stop"), 262150));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal4Start"), 262151));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_ExtnalSignal4Stop"), 262152));

	// category - system
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_SystemFPUpdate"), 327681));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_SystemUIUpdate"), 327682));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_SystemSystemUpdate"), 327683));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_SystemTimeUpdate"), 327684));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_SystemFixedUpdate"), 327685));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_SystemAllUpdate"), 327686));
	
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentExitSwitchPress"), 0x0f000001));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentDoorOpen"), 0x0f000002));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentDoorClose"), 0x0f000003));
	
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentPersonPass"), 0x0f000011));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentPersonNotPass"), 0x0f000012));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentTurnstileError"), 0x0f000013));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentTurnstileDropArm"), 0x0f000014));
	cmbEventContent.addItem(new cpr.controls.Item(dataManager.getString("Str_EventContentTurnstileArmRestore"), 0x0f000015));
}

function initComboAuthLog() {
	var cmbAuthType = app.lookup("MRMAN_cmbAuthType");
	if (cmbAuthType) {
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPVerify"), 1));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFPIdentify"), 2));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Password"), 3));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Card"), 4));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceVerify"), 5));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthTypeFaceIdentify"), 6));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_MobileCard"), 7));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeIrisIdentify"), 8));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeIrisVerify"), 9));
		//cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_TypeQR"), 10));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("###"), 11)); // 아이디/유니크 아이디로 인증 수단 요청
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_Inside"), 15));
		cmbAuthType.addItem(new cpr.controls.Item(dataManager.getString("Str_NotAssigned"), 16)); //ACU 인사이드버튼 공유
	
		cmbAuthType.addItem(new cpr.controls.Item("Car #",20));
		
		
		cmbAuthType.addItem(new cpr.controls.Item("PDA", 9998));
		cmbAuthType.addItem(new cpr.controls.Item("LPR", 9999));
	}

	
	var cmbAuthResult = app.lookup("MRMAN_cmbAuthResult");
	if (cmbAuthResult) {
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_Success"), AuthLogResultSuccess));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFail"), AuthLogResultFail));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAccessDenied"), AuthLogResultAccessDenied));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeout"), AuthLogResultTimeout));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutCapture"), AuthLogResultTimeoutCapture));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultTimeoutIdentify"), AuthLogResultTimeoutIdentify));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultAntiPassback"), AuthLogResultAntiPassback));	
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuress"), AuthLogResultDuress));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultBlackList"), AuthLogResultBlackList));
		
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultUnregistUser"), AuthLogResultInvalidUser));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFPCaptureFailed"), AuthLogResultCapture));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultDuplicatedAuth"), AuthLogResultDuplicatedAuthentication));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultNetworkError"), AuthLogResultNetwork));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultServerBusy"), AuthLogResultServerBusy));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultFaceDetectionFailed"), AuthLogResultFaceDetection));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealPay"), AuthLogResultFailMealPay));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealTime"), AuthLogResultFailMealTime));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailNotExistsMealCode"), AuthLogResultFailNotExistsMealCode));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailPeriod"), AuthLogResultFailPeriod));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMealLimit"), AuthLogResultFailMealLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailDayLimit"), AuthLogResultFailDayLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFailMonthLimit"), AuthLogResultFailMonthLimit));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultSoftpassback"), AuthLogResultSoftpassback));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultNoMask"), AuthLogResultNoMask));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogResultFeverDetection"), AuthLogResultFeverDetection));
		
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultLprFail"), 125));
		cmbAuthResult.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthResultLprUnRegist"), 126));
		
	}

	var cmbFKey = app.lookup("MRMAN_cmbFKey");
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF1"), 1));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF2"), 2));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 3));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF3"), 4));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyF4"), 5));
	
	//functype == 1 : 근태
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAttend"), 11));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyLeave"), 12));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 13));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyOut"), 14));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyIn"), 15));
	
	//functype == 2 : 식수
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu1"), 21));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu2"), 22));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu5"), 23));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu3"), 24));
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyMenu4"), 25));
	
	cmbFKey.addItem(new cpr.controls.Item(dataManager.getString("Str_FKeyAccess"), 63));
	
	for( var i = 101; i < 161; i++ ){
		var label = "Ex " + (i-100);
		cmbFKey.addItem(new cpr.controls.Item(label, i));
	}
	
	var cmbAuthLogFuncType = app.lookup("MRMAN_cmbFuncType");
	if (cmbAuthLogFuncType == null) return;
	
	cmbAuthLogFuncType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeAccess"), 0));
	cmbAuthLogFuncType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeTna"), 1));
	cmbAuthLogFuncType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeMeal"), 2));
	cmbAuthLogFuncType.addItem(new cpr.controls.Item(dataManager.getString("Str_AuthLogFuncTypeLPR"), 6));
	if (dataManager.getOemVersion() == OEM_JAWOONDAE) {
		cmbAuthLogFuncType.addItem(new cpr.controls.Item("PDA", 14)); 
		cmbAuthLogFuncType.addItem(new cpr.controls.Item("LPR", 15));
		cmbAuthLogFuncType.addItem(new cpr.controls.Item("PDA", 127)); // 127
		cmbAuthLogFuncType.addItem(new cpr.controls.Item("LPR", 128)); // 128
	}
}

// returnValue값으로 그리드 세팅
function GridSetting(returnValue){
	localStorage.setItem("selectStorage",returnValue);
	var selectArr = returnValue.split(',');
	var grdcount = app.lookup("MRMAN_grdAuthlog").columnCount;
	for(var x = 0; x<grdcount; x++){
		app.lookup("MRMAN_grdAuthlog").deleteColumn(x);
	}
	for (var i = 0; i<selectArr.length;i++){ 
		app.lookup("MRMAN_grdAuthlog").addColumn({
			columnLayout: [{
				width: "100px"
			}],
			header : [{ 														
				constraint: {
					rowIndex : 0,
					colIndex : i
				},
				configurator: function(cell){
					if(selectArr[i]=="EventTime"){
						selectArr[i] = "AuthEventTime";
					}
					if(selectArr[i]=="Dummy"){
						selectArr[i] = "ExtraDevice";
					}
					cell.text = dataManager.getString("Str_"+selectArr[i]);
				}
			}],
			detail: [{															
				constraint: { 					
					rowIndex : 0,
					colIndex : i
				},
				configurator: function(cell){
					if(selectArr[i]=="AuthEventTime"){
						selectArr[i] = "EventTime";
					}
					if (selectArr[i] == "ExtraDevice") {
						selectArr[i] = "Dummy";
					}
					cell.columnName = selectArr[i];
					cell.style.bind("color").toExpression([
						"switch ( AuthResult ) {",
						"\tcase 0: \"green\"",
						"\tcase 7: \"red\"",
						"\tcase 8: \"red\"",
						"\tcase 25: \"red\"",
						"\tdefault: \"#FFC000\"",
						"}"
					].join("\n"));
					if(selectArr[i] == "AuthType"){
					cell.control = (function(){
						var comboBox_1 = new cpr.controls.ComboBox("MRMAN_cmbAuthType");
						comboBox_1.readOnly = true;
						(function(comboBox_1){
						})(comboBox_1);
						comboBox_1.bind("value").toDataColumn("AuthType");
						return comboBox_1;
					})();
					}
					if(selectArr[i] == "AuthResult"){
					cell.control = (function(){
						var comboBox_2 = new cpr.controls.ComboBox("MRMAN_cmbAuthResult");
						comboBox_2.readOnly = true;
						(function(comboBox_1){
						})(comboBox_2);
						comboBox_2.bind("value").toDataColumn("AuthResult");
						return comboBox_2;
					})();
					}
					if(selectArr[i] == "Func"){
					cell.control = (function(){
						var comboBox_3 = new cpr.controls.ComboBox("MRMAN_cmbFKey");
						comboBox_3.readOnly = true;
						(function(comboBox_1){
						})(comboBox_3);
						comboBox_3.bind("value").toDataColumn("Func");
						return comboBox_3;
					})();
					}
					if(selectArr[i] == "FuncType"){
					cell.control = (function(){
						var comboBox_4 = new cpr.controls.ComboBox("MRMAN_cmbFuncType");
						comboBox_4.readOnly = true;
						(function(comboBox_1){
						})(comboBox_4);
						comboBox_4.bind("value").toDataColumn("FuncType");
						return comboBox_4;
					})();
					}
				}
			}]
		});
	}
	initComboAuthLog();
}

// 실시간 인증 로그 추가. main의 웹 소켓을 통해 인증로그 수신시 호출
exports.addAuthLog = function(authLog) {
	var tInfo = terminalMap.get(authLog.TerminalID);
	if( tInfo == null ){console.log("등록안된애꺼 날아옴");return;}
	
	var temperatureUnit = dataManager.getTemperatureUnit();
	if( dataManager.getOemVersion() == OEM_DUKYANG_WARDOFFICE && dataManager.getAccountID() != 0xDE0B6B3A7640000 ){
		authLog.UserID = "";
		authLog.UserName = "";
		authLog.UniqueID = "";
	}
	var dsAuthLogList = app.lookup("AuthLogList");
	//console.log(authLog);
	
	// 자운대 추가 로직
	var insertRow = dsAuthLogList.insertRowData(0, false, authLog);	
	insertRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
	if( authLog.ReserveData.length > 4 ){
		var data = authLog.ReserveData.split(',');		
		if( authLog.ReserveType == 1){ // 열화상
			if(data[3] < 10){ data[3] = "0"+data[3]; }
	 		
	 		var temp = "";
	 		if( data[1]== 1){
	 			temp = dataManager.getString("Str_Mask")+ " ";
	 		}else if( data[1]== 2){
	 			temp = dataManager.getString("Str_MaskInvalid")+ " ";
	 		}else if( data[1]== 3){
	 			temp = dataManager.getString("Str_MaskNo")+ " ";
	 		}
	 		if( temperatureUnit == 1 ){
	 			var tempValue = (parseFloat(data[2]+"."+data[3]) * 9 / 5 + 32).toFixed(2);
	 			temp += tempValue;
	 		}else{
	 			temp += parseFloat(data[2]+"."+data[3]).toFixed(2);	
	 		}
	 				
	 		if( temperatureUnit == 0 ){ 			
	 			insertRow.setValue("Detail", temp+"℃");	
	 		} else if( temperatureUnit == 1 ){ 			
	 			insertRow.setValue("Detail", temp+"℉");
	 		}
			
			insertRow.setValue("DetailColor", data[0]);
		} else if( authLog.ReserveType == 4){ // 음주
			if( data[0]== 0){ // 미측정
	 			temp = dataManager.getString("Str_AlcholeNoChk")+ " ";
	 		}else if( data[0]== 1){ // 정상
	 			temp = dataManager.getString("Str_AlcholNormal")+ " ";
	 		}else if( data[0]== 2){ // 음주
	 			temp = dataManager.getString("Str_AlcholDetected")+ " ";
	 		}
	 		
	 		if(data[0] == 0) {
 				if( data[1]== 1){
 					temp = dataManager.getString("Str_Mask")+ " ";
 				}else if( data[1]== 2){
		 			temp = dataManager.getString("Str_MaskInvalid")+ " ";
		 		}else if( data[1]== 3){
		 			temp = dataManager.getString("Str_MaskNo")+ " ";
		 		}
	 		} else {
	 			var alcolValue = (data[2]) | (data[3] << 8);	 			 		
		 		alcolValue = data[1]+"." + pad(alcolValue, 3);;
			 	alcolValue = parseFloat(alcolValue).toFixed(3);
			 	temp = temp + alcolValue;
	 		}
	 		insertRow.setValue("Detail", temp); 		 		
		}	
	}
	var rowCount = dsAuthLogList.getRowCount();
	if (rowCount > 10000) {
		var newRow = dsAuthLogList.getRowDataRanged(0, 5000);

		dsAuthLogList.clear();
		dsAuthLogList.build(newRow);
	}

	app.lookup("MRMAN_grdAuthlog").redraw();
	
	if( authLog.LogImage ){
//		popupLogImage(-1,authLog.LogImage,insertRow.getValue("Detail"),insertRow.getValue("DetailColor"));
	}
}

// 실시간 이벤트 로그 추가. main의 웹 소켓을 통해 이벤트로그 수신시 호출
exports.addEventLog = function(eventLog) {
	var tInfo = terminalMap.get(eventLog.TerminalID);
	if( tInfo == null ){console.log("등록안된애꺼 날아옴");return;}
	var terminalList = dataManager.getTerminalList();
	
	var dsEventLogList = app.lookup("EventLogList");
	
	var newRow = dsEventLogList.insertRowData(0, false, eventLog);
	var terminalName = terminalList.findFirstRow("ID=="+newRow.getValue("TerminalID")).getValue("Name");
	newRow.setValue("TerminalName",terminalName);
	newRow.setState(cpr.data.tabledata.RowState.UNCHANGED);

	var rowCount = dsEventLogList.getRowCount();
	if (rowCount > 10000) {
		var newRow = dsEventLogList.getRowDataRanged(0, 5000);

		dsEventLogList.clear();
		dsEventLogList.build(newRow);
		//dsEventLogList.realDeleteRow(3);
	}
	setTerminalEventVal(eventLog.TerminalID, eventLog.Content);
}

function setTerminalEventVal(terminalID, eventVal) {
	
	var terminal = terminalMap.get(terminalID);
	if (terminal) {
		var status = terminal.getValue("Status");
		//console.log("실시간 이벤트 코드 : ",eventVal);
		switch(eventVal){
			//Status1
			case EventLogTerminalDisconnected : terminal.setValue("TerminalStatus1", ""); break;
			case 65538 : 
				if(status == "1"){
					break;	
				}else{
					terminal.setValue("TerminalStatus1", TerminalStatusConnect); break;	
				}
			//Status2
			// 출입문 열림, 닫힘
			case 131073 : terminal.setValue("TerminalStatus2", TerminalStatusDoorOpen); break;
			case 131074 : terminal.setValue("TerminalStatus2", TerminalStatusDoorClose); break;
			// 강제 침입(강제 문열림)
			case 131077 : terminal.setValue("TerminalStatus2", TerminalStatusDoorEmergency); break;
			// 문열림 방치
			case 131078 : terminal.setValue("TerminalStatus2", TerminalStatusDoorOpenWarn); break;
			// 도어락 정상, 고장
			case 131079 : terminal.setValue("TerminalStatus2", ""); break;
			case 131080 : terminal.setValue("TerminalStatus2", TerminalStatusDoorLockWorking); break;
			
			// 문상태 미감시
			case 131081 : terminal.setValue("TerminalStatus2", TerminalStatusDoorNotMonitoring); break;
			
			// 출입문 입시 열기, 출입문 개방, 출입문 해제
			// case 131088 : terminal.setValue("TerminalStatus2", TerminalStatusDoorOpenState); break;
			// case 131089 : terminal.setValue("TerminalStatus2", TerminalStatusDoorOpenState); break;
			case 131090 : terminal.setValue("TerminalStatus2", ""); break;
			
			
			//Status3
			//단말기 잠김, 해제      
			case 65539 : terminal.setValue("TerminalStatus3", TerminalStatusLock); break;
			case 65540 : terminal.setValue("TerminalStatus3", ""); break;
			// 결합,분리 
			case 65542 : terminal.setValue("TerminalStatus3", ""); break;
			case 65541 : terminal.setValue("TerminalStatus3", TerminalStatusCover); break;
			//Status4
			//화재 감지 시작, 화재 감지 종료
			case 196611 : terminal.setValue("TerminalStatus4", TerminalStatusWarnFire);	break;
			case 196612 : terminal.setValue("TerminalStatus4", ""); break;
			//패닉 감지 시작, 패닉 감지 종료
			case 196613 : terminal.setValue("TerminalStatus4", TerminalStatusWarnPanic); break;
			case 196614 : terminal.setValue("TerminalStatus4", ""); break;
			//비상 감지 시작, 비상 감지 종료
			case 196615 : terminal.setValue("TerminalStatus4", TerminalStatusWarnCricis); break;
			case 196616 : terminal.setValue("TerminalStatus4", ""); break;
		}
	}
	
}

// ************************************************************************************* 이벤트기록 리스트, 인증기록 리스트 관련

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_getVurixDeviceListSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_getVurixDeviceList = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	var vurixDeviceList = app.lookup("VurixDeviceList");
	if(resultCode == 0){
		console.log("Vurix DeviceList 수신 완료");
//		console.log(vurixDeviceList.getRowDataRanged());
		
		// terminal과 연동 작업
//		device_addr_zeroFill();
		mapping_DeviceToTerminal();
	} else {
		console.log("Vurix DeviceList 수신 실패");
	}
}


/*
 * 루트 컨테이너에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
function onBodyUnload(/* cpr.events.CEvent */ e){
	// 메뉴 닫을 경우 웹소켓 해제
	for(var [key, value] of playerMap){
		deleteVideo(key);
//		dmsVideoPlayer.playerClose(value);
	}
}

//function delay(ms = 1000) {
//	return new Promise((resolve) => setTimeout(resolve, ms));
//}
//
//async function delayCurrent(player) {
//	await delay(400);
//	player.currentTime += 0.2;
//}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMRMAN_imgHelpPageClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var mRMAN_imgHelpPage = e.control;
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {content: {"Target":DLG_HELP,"ID": menu_id}});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}


function deleteVideo(id) {
	var parent = document.getElementById('video_parent');
	var divID = "figure"+id;
	var videoID = "video_"+id;
	
	var targetPlayer = playerMap.get(id); 
	if ( targetPlayer != undefined) {
		dmsVideoPlayer.playerClose(targetPlayer);
	}	
	
	// 비디오 삭제
	parent.removeChild(document.getElementById(divID));
	var vv = videojs(videoID);
	vv.dispose();
	playerMap.delete(id);
	terminalMap.delete(Number(id));
}