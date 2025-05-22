/************************************************
 * vmsVideo1x1.js
 * Created at 2020. 5. 29. 오후 3:13:26.
 *
 * @author union
 ************************************************/


var MAX_DEIVCE_CNT = 100;

var MAX_DEIVCE_SHOW =1;

var MAX_VIEWPAGECOUNT = 5;


var player ;  

var curDevSerial ;
var curChannel;
var curMedia;

var ptzCameraSerial = 0;
var ptzMoveDirection = 14;

var userName = "sdk";
var userPw = "Innodep1@";

var authToken = "";
var apiSerial = 0;
var userSerial = 0;

var deviceAddr = "112.219.69.210";
var devicePort = "16118";

var lic = "licAccessControl";
var group = 'group1';

var vms_id = "";

var mediaStreamVideo = null;
var dmsVideoPlayerURL = null;

var deviceList = null;


function deviceStruct() {
	var deviceName = "";
	var channelName = "";
	var deviceSerial = 0;
	var channelSerial = 0;
	var channelMediaSerial = 0;
	var rtspUrl = "";
}

//document.write("<script type='text/javascript' src='http://112.219.69.210:16789/media/api/public/scripts/dms-video-player.min.js'><"+"/script>");  


exports.VideoReload = function() {
	
	var i = 0;

	var select1 = app.lookup("select1");
	select1.visible = false;
	
	var hostApp = app.getHostAppInstance();
	var SelectDevice = hostApp.callAppMethod("getVmsSelectDevice");	
	if(-1 == SelectDevice)
	{
		SelectDevice = 0;
		//hostApp.callAppMethod("setVmsSelectDevice", SelectDevice);	
		//showSelectControl(SelectDevice);
		
		console.log("VideoReload");
		console.log("video1x1 SelectDevice:" + SelectDevice);
		console.log("video1x1 player[SelectDevice]:" + player[SelectDevice]);
		
		hostApp.callAppMethod("setVmsSelectDevicePlayer", player[SelectDevice]);	
	}	
	
	console.log("VideoReload...SelectDevice: " + SelectDevice);

	var totalCount = 0;
	for (var i = 0; i < MAX_DEIVCE_CNT; i++) {
		if(deviceList[i].deviceSerial != -1)
		totalCount++;
	}	

	createVideo(0, deviceList[SelectDevice].deviceSerial,
 	deviceList[SelectDevice].channelSerial, 
 	deviceList[SelectDevice].channelMediaSerial);


	var pageIndex = app.lookup("videoPageIndexer");
	pageIndex.totalRowCount = totalCount;
	pageIndex.currentPageIndex = SelectDevice + 1;
	pageIndex.pageRowCount = 1;
	
	
	var ii = 0;
	ii = ( SelectDevice / MAX_VIEWPAGECOUNT);
	ii = ii | 0;
	var iii = ii * MAX_VIEWPAGECOUNT;
	var iiii = iii + 1
	
	console.log("*** ii: " + ii);
	console.log("*** iii: " + iii);
	console.log("*** iiii: " + iiii);
	
	pageIndex.startPageIndex = iiii;
	
	pageIndex.viewPageCount = ( pageIndex.totalRowCount / pageIndex.pageRowCount ) + ( pageIndex.totalRowCount % pageIndex.pageRowCount );
	if(pageIndex.viewPageCount > MAX_VIEWPAGECOUNT)
		pageIndex.viewPageCount = MAX_VIEWPAGECOUNT;

	pageIndex.redraw();	
	
	showSelectControl(SelectDevice);
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group = e.control;
	
	var hostApp = app.getHostAppInstance();
	var SelectDevice = hostApp.callAppMethod("getVmsSelectDevice");	
		
	showSelectControl(SelectDevice);
}

/*
 * 그룹에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGroupDblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group = e.control;
	
}


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
		
	var i = 0;
	player = new Array(MAX_DEIVCE_SHOW);
	for (i = 0; i < MAX_DEIVCE_SHOW; i++) {
		player[i] = null;
	}	
	
	var hostApp = app.getHostAppInstance();
	authToken = hostApp.callAppMethod("getVmsAuthToken");	
	apiSerial = hostApp.callAppMethod("getVmsApiSerial");	
	userSerial = hostApp.callAppMethod("getVmsUserSerial");	
	deviceAddr = hostApp.callAppMethod("getVmsDeviceAddr");	
	devicePort = hostApp.callAppMethod("getVmsDevicePort");	
	lic = hostApp.callAppMethod("getVmsLic");
	group = hostApp.callAppMethod("getVmsGroup");
	vms_id = hostApp.callAppMethod("getVmsId");
	userName = hostApp.callAppMethod("getVmsUserName");
	userPw = hostApp.callAppMethod("getVmsUserPw");	
	mediaStreamVideo = hostApp.callAppMethod("getMediaStreamVideo");		
	deviceList = hostApp.callAppMethod("getVmsDeviceList");
	dmsVideoPlayerURL =hostApp.callAppMethod("getDmsVideoPlayerURL");
		
	
	console.log("1x1 dmsVideoPlayerURL: " + dmsVideoPlayerURL);
	
	var head= document.getElementsByTagName('head')[0];
	var script= document.createElement('script');
	script.type= 'text/javascript';
	script.src= dmsVideoPlayerURL;
	head.appendChild(script);
	
	
	exports.VideoReload();
	
	
	//dmsVideoPlayerURL =hostApp.callAppMethod("setVmsDmsVideoPlayer", dmsVideoPlayer);
	
	
	
	/*
	
	for(i=0;i<MAX_DEIVCE_SHOW;i++)
	{
		createVideo(0, deviceList[i].deviceSerial,
	 	deviceList[i].channelSerial, 
	 	deviceList[i].channelMediaSerial);
	}
	
	var select1 = app.lookup("select1");
	select1.visible = false;
	
	var hostApp = app.getHostAppInstance();
	var SelectDevice = hostApp.callAppMethod("getVmsSelectDevice");	
	if(-1 == SelectDevice)
	{
		SelectDevice = 0;
		hostApp.callAppMethod("setVmsSelectDevice", SelectDevice);	
		showSelectControl(SelectDevice);
	}	

	var totalCount = 0;
	for (var i = 0; i < MAX_DEIVCE_CNT; i++) {
		if(deviceList[i].deviceSerial != -1)
		totalCount++;
	}	

	var pageIndex = app.lookup("videoPageIndexer");
	pageIndex.totalRowCount = totalCount;
	pageIndex.currentPageIndex = SelectDevice + 1;
	pageIndex.pageRowCount = 1;

	pageIndex.viewPageCount = ( pageIndex.totalRowCount / pageIndex.pageRowCount ) + ( pageIndex.totalRowCount % pageIndex.pageRowCount );
	if(pageIndex.viewPageCount > MAX_VIEWPAGECOUNT)
		pageIndex.viewPageCount = MAX_VIEWPAGECOUNT;

	pageIndex.redraw();	
	
	*/
	
	
}


/*
 * Body에서 unload 이벤트 발생 시 호출.
 * 앱이 언로드된 후 발생하는 이벤트입니다.
 */
function onBodyUnload(/* cpr.events.CEvent */ e){
	
	videoStop() ;
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
	content.innerHTML = "<div id=\"video_parent1\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
	
}








function createVideo(zeroBasePlayerIndex, devSerial, channel, media) {


/*
	// 비디오 생성 옵션 정의
	var videoOptions = {
		'id': 'test_video', // 생성할 비디오 객체의 ID ( <video> Element ID )
		'url': 'http://172.16.31.177', // 영상 요청 url
		'srcType': 'vurix', // 원본 소스 타입
		'stream': 'ws://112.219.69.210:16789/ws/stream', // stream url
		'vmsId': Number(vms_id),
		'devSerial': Number(devSerial),
		'channel': Number(channel),
		'media': Number(media),
		'token': authToken,
		'errorMsgFunc': errorMsgCallback // 에러 콜백 함수
	};
*/	
    var vmsUrl = 'vurix://'
    vmsUrl = vmsUrl + authToken + '@' 
    vmsUrl = vmsUrl + '/' + vms_id + '/' + devSerial + '/' +
          channel + '/' + media;	
	
 	var videoOptions = {
          'id': 'test_video',                            	
          'url': vmsUrl,                                  
          'srcType' : 'vurix',                           	
          'stream': mediaStreamVideo,                    
          'errorMsgFunc': errorMsgCallback                
     };	

	var index_String = zeroBasePlayerIndex + 1;

	var video_parent = "video_parent" + index_String.toString();
		
	console.log("video_parent: " + video_parent);

	console.log("index: " + zeroBasePlayerIndex);

	if(null != player[zeroBasePlayerIndex])
	{
		dmsVideoPlayer.streamStop(player[zeroBasePlayerIndex]);
		dmsVideoPlayer.playerClose(player[zeroBasePlayerIndex]);
		document.getElementById(video_parent).removeChild(player[zeroBasePlayerIndex]);
		player[zeroBasePlayerIndex] = null;
	}

	player[zeroBasePlayerIndex] = dmsVideoPlayer.createVideo(videoOptions);
	
	if(0 == zeroBasePlayerIndex)
	{
		document.getElementById("video_parent1").appendChild(player[zeroBasePlayerIndex]);
	}
	
	
	if(null != player[zeroBasePlayerIndex])
	{
		dmsVideoPlayer.streamPlay(player[zeroBasePlayerIndex]);
	}
	
	
	
	
}

// 에러 메시지 처리 함수 (dms-player 내부 오류)
function errorMsgCallback(err) {
	console.log(err);
}

// 영상 재생
function videoPlay() {
	for (i = 0; i < MAX_DEIVCE_SHOW; i++) {
		
		if(player[i] != null)
			dmsVideoPlayer.streamPlay(player[i]);
	}
}

// 영상 정지
function videoStop() {
	
	for (i = 0; i < MAX_DEIVCE_SHOW; i++) {
		if(player[i] != null)
			dmsVideoPlayer.streamStop(player[i]);
			dmsVideoPlayer.playerClose(player[i]);
	}	
}

function showSelectControl(zeroBaseIndex){
	
	var select1 = app.lookup("select1");
	select1.visible = true;

	var hostApp = app.getHostAppInstance();
	var SelectDevice = hostApp.callAppMethod("getVmsSelectDevice");	
	
	console.log("showSelectControl");
	console.log("video1x1 zeroBaseIndex:" + zeroBaseIndex);
	console.log("video1x1 SelectDevice:" + SelectDevice);
	console.log("video1x1 player[SelectDevice]:" + player[SelectDevice]);
			
	
	hostApp.callAppMethod("setVmsSelectDevicePlayer", player[zeroBaseIndex]);
	
	if(zeroBaseIndex == SelectDevice)	
		return;

	hostApp.callAppMethod("setVmsSelectDevice", zeroBaseIndex );//player[0]);	
	
		
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onVideoPageIndexerSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.PageIndexer
	 */
	var videoPageIndexer = e.control;
	
	var currentPageIndex = videoPageIndexer.currentPageIndex;
	var zeroBaseIndex = currentPageIndex -1;
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setVmsSelectDevice", zeroBaseIndex);		
	
	
	console.log("onVideoPageIndexerSelectionChange");
	console.log("video1x1 zeroBaseIndex:" + zeroBaseIndex);
	console.log("video1x1 player[zeroBaseIndex]:" + player[zeroBaseIndex]);
				
	
	
	createVideo(0, deviceList[zeroBaseIndex].deviceSerial,
 	deviceList[zeroBaseIndex].channelSerial, 
 	deviceList[zeroBaseIndex].channelMediaSerial);
 
	var select1 = app.lookup("select1");
	select1.visible = true; 
	
	
	hostApp.callAppMethod("setVmsSelectDevicePlayer", player[0]);
	
}


/*
 * Body에서 before-unload 이벤트 발생 시 호출.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	videoStop();
}


/*
 * "test" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	console.log("dmsVideoPlayer: " + dmsVideoPlayer);
	
	console.log("player[0]: " + player[0]);
	
	dmsVideoPlayer.ptzLeft(player[0], 4);
		
	
}
