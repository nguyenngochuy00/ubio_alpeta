/************************************************
 * authLogVideoViewVurix.js
 * Created at 2023. 7. 27. ���� 2:33:23.
 *
 * @author mjy
 ************************************************/
var dataManager = cpr.core.Module.require("lib/DataManager");

// 미디어 서버설정 초기값
var rtspUrl = "NotSet";
var proto = "NotSet";
var transcodeValue = -2;

var player; 
var serial;
var stopFlag = false;

var playSecond; // 영상 시작시간 초

var fileName;

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	dataManager = getDataManager();
	
	var eventTime = app.getAppProperty("UnixTime")-3; // 인증 3초전 
	var playbackConfig = app.lookup("Playback");
	playbackConfig.setValue("startDt", eventTime);
	playbackConfig.setValue("endDt", eventTime+10); // 날짜 기준이라 시,분,초는 사실 의미 없음
	playbackConfig.setValue("speed", 10);
//	endDt = startDt + 10; // 
	
	var paramVurixConfig = app.getAppProperty("VurixConfig");
	var config = app.lookup("Config");
	paramVurixConfig.copyToDataMap(config);
	
	var paramVideoInfo = app.getAppProperty("VideoInfo");
	var dmVideoInfo = app.lookup("VideoInfo");
	paramVideoInfo.copyToDataMap(dmVideoInfo);
	
	var terminalID = dmVideoInfo.getValue("terminalID");
	var tName = dmVideoInfo.getValue("terminalName");
	
//	var devSerial = dmVideoInfo.getValue("devSerial");
	serial = dmVideoInfo.getValue("devSerial");
	
	// 인증결과에 따른 배경색 변경
	var authResult = app.getAppProperty("AuthResult");
	var bgColor =""
	switch (authResult) {
		case 0: bgColor = "green"; break;
		case 7: bgColor = "red"; break;
		case 8: bgColor = "red"; break;
		case 25: bgColor = "red"; break;
		default: bgColor = "#FFC000";
	}
	
	var css = {
		"border-color" : bgColor,
	};
	
	fileName = app.getAppProperty("FileName");
	
	// API용 정보 추가
	var paramPlayTime = app.getAppProperty("PlayTime");
	var dmPlayTime = app.lookup("PlayTime");
	paramPlayTime.copyToDataMap(dmPlayTime);
	
	app.lookup("shl_player1").style.css(css);
	
//	app.getContainer().style.css(css);
	
	// DMS 사용 -----------------------------------------------------------
//	createPlay(terminalID, tName, serial, eventTime);
	// -------------------------------------------------------------------
	
	// API 사용 ----------------------------------------------------------------------------
	createVideoMP4(terminalID, tName);
	// ---------------------------------------------------------------------------------------------------
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player1Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player1 = e.control;
	var content = e.content;
	content.innerHTML = "<div id = \"video_log_parent\"></div>";
}

// Player 생성 (DMS 이용)
function createPlay(terminalID, terminalName, vurixSerial, eventTime){
	var dmConfig = app.lookup("Config");
	var transcode = dmConfig.getValue("TransCode");
	var vmsID = dmConfig.getValue("VmsID");
	var serverURL = dmConfig.getValue("DmsURL");
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
	
    var videoOptions = {
      'id': 'video_' + serial,                           
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
	
    document.getElementById('video_log_parent').appendChild(player);
//    document.querySelector("video").className = "video-monitoring"; // 화면회전 CSS
//    player.className = "video-monitoring"; // 화면회전 CSS
//	player.controls = true; // 플레이어 컨트롤러 활성화
//	player.autoplay = true;
//	player.className = "video-monitoring";

	// videojs control
	player.className = "video-js";
	var videoID = 'video_'+serial;
	var videoEle = videojs(videoID, {
		controls: true,
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
	})
	
	// 시간 표시
	var time = app.lookup("VideoInfo").getValue("eventTime");
	var et1 = time.substring(0,16);
	var et2 = zeroFill(String(Number(time.substring(17))-3));
	var et3 = zeroFill(String(Number(time.substring(17))+3));
	
	
	var div = document.createElement("div");
    div.innerHTML = `<b>
    <p style=" margin: 0; color: white; font-size: 15px; position: absolute; left:5px; background-color:rgba(0,0,0,0.2);">`
    +terminalID+`_`+terminalName+`<br>`+et1+`:`+et2+` - `+et3+`</b></p>`;
    
    videoEle.el().appendChild(div);	
 
		
	player.onwaiting = function() {
		var originTime = player.currentTime;
			
		// 스트림 시작 시 onloadeddate가 실행 안되는 브라우저의 이슈가 있어 필요 
		if(originTime == 0) {
			player.currentTime = originTime + 0.8;
		}
	}

//	 영상로그 끝에 도달 시 버퍼링 말고 loop하도록
	player.ontimeupdate = function(){
		if(player != null){
			if(player.currentTime >= 6.1){ // 6초 안가고 꺼지는게 별로여서 6.5로 설정
				player.currentTime = 0;
			}
		}
	}
	
	player.ondurationchange = function() {
		if(player != null) {
			if(player.duration >= 6.5) {
				if(!stopFlag){
					dmsVideoPlayer.streamStop(player);
					stopFlag = true;
				}
			}
		}
	}
	
	// 일시 정지
    player.addEventListener("pause", function(e){
		player.stop;		
    }, false);
    
//	player.addEventListener("onwaiting", asd);
	    
    player.addEventListener("error", function(){
    	var c = player.error;
    	console.log(c);
    }, false);
	    
	if(!player) {
		console.log("player 생성오류");
	} else { // 잘 생성됨
		console.log( ":: "+ rtspUrl +"생성됨");
	    stream_play();
	}
}

function errorMsgCallback(err){
	var errStr = JSON.stringify(err, null, 4);
	dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_ErrorDataNotExist"));
}

// Player 재생
function stream_play() {
	if(player) {
		var dmPlayback = app.lookup("Playback");
		var startDt = dmPlayback.getValue("startDt");
		var endDt = dmPlayback.getValue("endDt");
		var speed = dmPlayback.getValue("speed");
		dmsVideoPlayer.playbackPlay(player,startDt,endDt, speed);
	}
}

/*
 * 루트 컨테이너에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
function onBodyUnload(/* cpr.events.CEvent */ e){
//	deleteVideo(serial);     // DMS 이용
	deleteVideoDown(serial); // API 이용
	
}


/*
 * 쉘에서 init 이벤트 발생 시 호출.
 */
function onShl_player1Init(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player1 = e.control;
	//쉘 다시 그리지 않도록 방지
	if(e.content) {
		e.preventDefault();
	}
}

function deleteVideo(serial) {
	var parent = document.getElementById('video_log_parent');
	var videoID = "video_"+serial;
	
	dmsVideoPlayer.playerClose(player);
	
	// 비디오 삭제
//	parent.removeChild(document.getElementById(videoID));
	var vv = videojs(videoID);
	vv.dispose();
}

function zeroFill(num) {
	var zeroFillNum = num.padStart(2, '0');
	return zeroFillNum;
}


// API로 다운로드하여 재생 (DMS 사용 X)-----------------------------------------------------------------
function createVideoMP4(terminalID, terminalName) {
	player = document.createElement("video");
	document.getElementById('video_log_parent').appendChild(player);

	// videojs control
	player.className = "video-js";
	var videoID = 'video_'+serial;
	player.id = videoID; 
	var videoEle = videojs(videoID, {
		controls: true,
		playbackRates: [.5, .75, 1, 1.25, 1.5],
		controlBar: {
        	children: [
            	"playToggle",
	            "volumeMenuButton",
	            "timeDivider",
	            "currentTimeDisplay",
//	            "progressControl",
//	            "remainingTimeDisplay",
//	            "durationDisplay",
	            'playbackRateMenuButton',
//	            'pictureInPictureToggle',
	            "fullscreenToggle"
	        ]
    	},
    	autoplay : 'muted',
	 	loop : true // 만약 재생길이 끝에 도달하면 재시작하도록
	})
	
	console.log("생성 : videoID는 " + videoID)
	
	
	videoEle.src({
		src : "../../../data/EventView/" + fileName,
		type : "video/mp4"
	})
	
    
    var dmPlayTime = app.lookup("PlayTime");
    var startSecond = dmPlayTime.getValue("startSecond");
    var from_date = dmPlayTime.getValue("FromDate");
    
    // 인증시간 주변만 재생하도록
    if(startSecond < 3) { // 인증 시각이 3초보다 작았다면 from_date 1분 전으로 바뀐 상황임 
		playSecond = 57+startSecond; 
	} else {
		playSecond = startSecond-3;
	}
	player.currentTime = playSecond;
    
	player.ontimeupdate = function(){
		if(player != null){
			if(player.currentTime >= playSecond + 6.5){
				player.currentTime = playSecond;
			} else if (player.currentTime < playSecond) {
				player.currentTime = playSecond;
			}
		}
	}
	
	player.paused = function(){
        if(player != null) {
            if(player.currentTime <= playSecond) {
                player.play();
            }
        }
    }
	
	// 영상 오버레이 시간 표시
	var date = app.lookup("PlayTime").getValue("FromDate");
	var et1 = date.substr(0,4) + "." + date.substr(4,2) + "." + date.substr(6,2)+ " " + date.substr(8,2) + ":" + date.substr(10,2);
	var et2 = playSecond; // 시작 초
	var et3 = playSecond+6; // 끝 초

	
	
	var div = document.createElement("div");
    div.innerHTML = `<b>
    <p style=" margin: 0; color: white; font-size: 15px; position: absolute; left:5px; background-color:rgba(0,0,0,0.2);">`
    +terminalID+`_`+terminalName+`<br>`+et1+`:`+et2+` - `+et3+`</b></p>`;
    
    videoEle.el().appendChild(div);	
	
}

function deleteVideoDown(serial) {
	var parent = document.getElementById('video_log_parent');
	var videoID = "video_"+serial;
	console.log("제거 : videoID는 " + videoID)
	
	var vv = videojs(videoID);
	vv.dispose();
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_deleteEventViewSubmitDone(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_deleteEventView = e.control;
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if( resultCode == COMERROR_NONE ){
		console.log("제거 완료");
	} else {		
		dialogAlert(app, dataManager.getString("Str_Failed"),dataManager.getString(getErrorString(resultCode)));
	}
}


/*
 * 루트 컨테이너에서 before-unload 이벤트 발생 시 호출.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	// 여기 왜 2번씩 들어오냐..? 
//	var deleteEventView = app.lookup("sms_deleteEventView");
//	deleteEventView.action = "/v1/vurix/eventViewDelete" + fileName;
//	if(deleteEventView.status == "SENDING") {
//		return;
//	} else {
//		deleteEventView.send();
//	}
}

