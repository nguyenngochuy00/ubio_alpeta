/************************************************
 * vmsVideo3x3.js
 * Created at 2020. 5. 29. 오후 2:44:02.
 *
 * @author union
 ************************************************/

//import dmsVideoPlayer from "http://112.219.69.210:16789/media/api/public/scripts/dms-video-player.min.js";

var MAX_DEIVCE_CNT = 100;

var MAX_DEIVCE_SHOW = 9;

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

var jsVideo = null;


var totalDeviceCount = 0;


function deviceStruct() {
	var deviceName = "";
	var channelName = "";
	var deviceSerial = 0;
	var channelSerial = 0;
	var channelMediaSerial = 0;
	var rtspUrl = "";
}

//document.write("<script type='text/javascript' src='http://112.219.69.210:16789/media/api/public/scripts/dms-video-player.min.js'><"+"/script>");  
//document.write('<script src="http://112.219.69.210:16789/media/api/public/scripts/dms-video-player.min.js"></script>');  

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){

	/*
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
	
	var head= document.getElementsByTagName('head')[0];
	var script= document.createElement('script');
	script.type= 'text/javascript';
	script.src= dmsVideoPlayerURL;
	head.appendChild(script)

		
	
	
	
	for(i=0;i<MAX_DEIVCE_SHOW;i++)
	{
		createVideo(i, deviceList[i].deviceSerial,
	 	deviceList[i].channelSerial, 
	 	deviceList[i].channelMediaSerial);
	 	
		if(null != player[i])
		{
			dmsVideoPlayer.streamPlay(player[i]);
		}
	}
	
	var select1 = app.lookup("select1");
	select1.visible = false;
	
	var select2 = app.lookup("select2");
	select2.visible = false;
	
	var select3 = app.lookup("select3");
	select3.visible = false;
	
	var select4 = app.lookup("select4");
	select4.visible = false;
	
	var select5 = app.lookup("select5");
	select5.visible = false;
	
	var select6 = app.lookup("select6");
	select6.visible = false;
	
	var select7 = app.lookup("select7");
	select7.visible = false;
	
	var select8 = app.lookup("select8");
	select8.visible = false;
	
	var select9 = app.lookup("select9");
	select9.visible = false;
	
	

	var totalCount = 0;
	for (var i = 0; i < MAX_DEIVCE_CNT; i++) {
		if(deviceList[i].deviceSerial != -1)
		totalCount++;
	}	

	var pageIndex = app.lookup("videoPageIndexer");
	pageIndex.totalRowCount = totalCount;
	pageIndex.currentPageIndex = 1;
	pageIndex.pageRowCount = 9;

	pageIndex.viewPageCount = ( pageIndex.totalRowCount / pageIndex.pageRowCount ) + ( pageIndex.totalRowCount % pageIndex.pageRowCount );
	if(pageIndex.viewPageCount > MAX_VIEWPAGECOUNT)
		pageIndex.viewPageCount = MAX_VIEWPAGECOUNT;
	
	pageIndex.redraw();	
	
		
	*/
		

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
	dmsVideoPlayerURL = hostApp.callAppMethod("getDmsVideoPlayerURL");
	
	console.log("3x3 dmsVideoPlayerURL: " + dmsVideoPlayerURL);
	
	var head= document.getElementsByTagName('head')[0];
	var script= document.createElement('script');
	script.type= 'text/javascript';
	script.src= dmsVideoPlayerURL;
	head.appendChild(script);	
	
	dmsVideoPlayerURL =hostApp.callAppMethod("setVmsDmsVideoPlayer", dmsVideoPlayer);
	
	
	var SelectedDevice = hostApp.callAppMethod("getVmsSelectDevice");
	if(SelectedDevice == -1)
		SelectedDevice = 0;
	
	var totalCount = 0;
	for (var i = 0; i < MAX_DEIVCE_CNT; i++) {
		if(deviceList[i].deviceSerial != -1)
			totalCount++;
	}
	
	totalDeviceCount = totalCount;
	
	var currentPage = (SelectedDevice / MAX_DEIVCE_SHOW | 0) + 1;
	var StartShowDeviceIndex =  (( SelectedDevice)  / ( MAX_DEIVCE_SHOW ) |0)* ( MAX_DEIVCE_SHOW );

	console.log("SelectedDevice : "+ SelectedDevice);	
	console.log("(( SelectedDevice / MAX_DEIVCE_SHOW) |0): "+ (( SelectedDevice / MAX_DEIVCE_SHOW) |0));	
	//console.log("SelectedDevice % MAX_DEIVCE_SHOW: "+ SelectedDevice % MAX_DEIVCE_SHOW);	
	console.log("StartShowDeviceIndex: "+ StartShowDeviceIndex);	
			
	for(i=0;i<MAX_DEIVCE_SHOW;i++)
	{
		createVideo(i, deviceList[StartShowDeviceIndex].deviceSerial,
	 	deviceList[StartShowDeviceIndex].channelSerial, 
	 	deviceList[StartShowDeviceIndex].channelMediaSerial);
	 	
		if(null != player[i])
			dmsVideoPlayer.streamPlay(player[i]);
			
		StartShowDeviceIndex++;
		if(StartShowDeviceIndex >= totalDeviceCount)
			break;
	}
	

	var select1 = app.lookup("select1");
	select1.visible = false;
	
	var select2 = app.lookup("select2");
	select2.visible = false;
	
	var select3 = app.lookup("select3");
	select3.visible = false;
	
	var select4 = app.lookup("select4");
	select4.visible = false;
	
	var select5 = app.lookup("select5");
	select5.visible = false;
	
	var select6 = app.lookup("select6");
	select6.visible = false;
	
	var select7 = app.lookup("select7");
	select7.visible = false;
	
	var select8 = app.lookup("select8");
	select8.visible = false;
	
	var select9 = app.lookup("select9");
	select9.visible = false;
	
	
	var pageIndex = app.lookup("videoPageIndexer");
	pageIndex.totalRowCount = totalDeviceCount;
	pageIndex.currentPageIndex = currentPage;
	pageIndex.pageRowCount = MAX_DEIVCE_SHOW;

	pageIndex.viewPageCount = (( pageIndex.totalRowCount / pageIndex.pageRowCount ) |0)+ ( pageIndex.totalRowCount % pageIndex.pageRowCount );
	if(pageIndex.viewPageCount > MAX_VIEWPAGECOUNT)
		pageIndex.viewPageCount = MAX_VIEWPAGECOUNT;
	
	pageIndex.redraw();	
	
	console.log("vmsVideo2x2 onBodyLoad SelectedDevice: " + SelectedDevice);
	
	if(SelectedDevice != -1)
	{
		var playerZeroBaseIndex = SelectedDevice - ( pageIndex.currentPageIndex - 1 )* MAX_DEIVCE_SHOW ;	
		showSelectControl(playerZeroBaseIndex);
	}			
		
	
	
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


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player2Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player2 = e.control;
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent2\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
	
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player3Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player3 = e.control;
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent3\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
	
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player4Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player4 = e.control;
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent4\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
	
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player5Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player5 = e.control;
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent5\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
	
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player6Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player6 = e.control;
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent6\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
	
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player7Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player7 = e.control;
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent7\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
	
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player8Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player8 = e.control;
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent8\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
	
}


/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onShl_player9Load(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var shl_player9 = e.control;
	var content = e.content;
	content.innerHTML = "<div id=\"video_parent9\" style=\"width: 100%; height: 100%; background: #222222; float: left;\" ></div>";
	
}





function createVideo(playerZeroBaseIndex, devSerial, channel, media) {


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

	var shOneBaseIndex = playerZeroBaseIndex + 1;

	var video_parent_string = "video_parent" + shOneBaseIndex.toString();
		
	console.log("video_parent_string: " + video_parent_string);

	console.log("shOneBaseIndex: " + shOneBaseIndex);

	if(null != player[playerZeroBaseIndex])
	{
		dmsVideoPlayer.streamStop(player[playerZeroBaseIndex]);
		dmsVideoPlayer.playerClose(player[playerZeroBaseIndex]);
		document.getElementById(video_parent_string).removeChild(player[playerZeroBaseIndex]);
		player[playerZeroBaseIndex] = null;
	}

	player[playerZeroBaseIndex] = dmsVideoPlayer.createVideo(videoOptions);

	document.getElementById(video_parent_string).appendChild(player[playerZeroBaseIndex]);
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


/*
function showSelectControl( idx){
	

	var select1 = app.lookup("select1");
	select1.visible = false;
	
	var select2 = app.lookup("select2");
	select2.visible = false;
	
	var select3 = app.lookup("select3");
	select3.visible = false;
	
	var select4 = app.lookup("select4");
	select4.visible = false;
	
	var select5 = app.lookup("select5");
	select5.visible = false;
	
	var select6 = app.lookup("select6");
	select6.visible = false;
	
	var select7 = app.lookup("select7");
	select7.visible = false;
	
	var select8 = app.lookup("select8");
	select8.visible = false;
	
	var select9 = app.lookup("select9");
	select9.visible = false;	
	
	if(idx == 1)
		select1.visible = true;
	else if(idx == 2)
		select2.visible = true;
	else if(idx == 3)
		select3.visible = true;
	else if(idx == 4)
		select4.visible = true;
	else if(idx == 5)
		select5.visible = true;
	else if(idx == 6)
		select6.visible = true;
	else if(idx == 7)
		select7.visible = true;
	else if(idx == 8)
		select8.visible = true;
	else if(idx == 9)
		select9.visible = true;

	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setVmsSelectDevice", idx - 1);	
	
}
*/


function showSelectControl(playerZeroBaseIndex){
	
	console.log("vmsVideo3x3 showSelectControl playerZeroBaseIndex: " + playerZeroBaseIndex);
	
	var select1 = app.lookup("select1");
	select1.visible = false;
	
	var select2 = app.lookup("select2");
	select2.visible = false;
	
	var select3 = app.lookup("select3");
	select3.visible = false;
	
	var select4 = app.lookup("select4");
	select4.visible = false;
	
	var select5 = app.lookup("select5");
	select5.visible = false;
	
	var select6 = app.lookup("select6");
	select6.visible = false;
	
	var select7 = app.lookup("select7");
	select7.visible = false;
	
	var select8 = app.lookup("select8");
	select8.visible = false;
	
	var select9 = app.lookup("select9");
	select9.visible = false;	
	

	var pageIndex = app.lookup("videoPageIndexer");
	var newSelectedIndex = ( pageIndex.currentPageIndex - 1 )* MAX_DEIVCE_SHOW + playerZeroBaseIndex;	
	
	if(newSelectedIndex >= totalDeviceCount)
		return false;
	

	if(playerZeroBaseIndex == 0)
		select1.visible = true;
	else if(playerZeroBaseIndex == 1)
		select2.visible = true;
	else if(playerZeroBaseIndex == 2)
		select3.visible = true;
	else if(playerZeroBaseIndex == 3)
		select4.visible = true;
	else if(playerZeroBaseIndex == 4)
		select5.visible = true;
	else if(playerZeroBaseIndex == 5)
		select6.visible = true;
	else if(playerZeroBaseIndex == 6)
		select7.visible = true;
	else if(playerZeroBaseIndex == 7)
		select8.visible = true;
	else if(playerZeroBaseIndex == 8)
		select9.visible = true;	
	
	
	
	
	
	var hostApp = app.getHostAppInstance();
	var curSelectedIndex = hostApp.callAppMethod("getVmsSelectDevice");	
		
	hostApp.callAppMethod("setVmsSelectDevicePlayer", player[newSelectedIndex]);	
		
	if(newSelectedIndex == curSelectedIndex)	
		return true;

	hostApp.callAppMethod("setVmsSelectDevice", newSelectedIndex);	
	
	
	
	return true;
}




/*
 * 그룹에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGroup1Dblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group1 = e.control;
	
	if(false == showSelectControl(0))
		return;
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setVms1x1");			
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroup1Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group1 = e.control;
	
	
	showSelectControl(0);
	
	
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroup2Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group2 = e.control;
	

	
	showSelectControl(1);
		
	
}


/*
 * 그룹에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGroup2Dblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group2 = e.control;
	
	
	if(false == showSelectControl(1))
		return;
			
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setVms1x1");		
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroup3Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group3 = e.control;
	showSelectControl(2);
}


/*
 * 그룹에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGroup3Dblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group3 = e.control;
	
	
	if(false == showSelectControl(2))
		return;	
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setVms1x1");		
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroup4Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group4 = e.control;
	showSelectControl(3);
}


/*
 * 그룹에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGroup4Dblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group4 = e.control;
	
	if(false == showSelectControl(3))
		return;
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setVms1x1");		
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroup5Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group5 = e.control;
	showSelectControl(4);
}


/*
 * 그룹에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGroup5Dblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group5 = e.control;
	
	if(false == showSelectControl(4))
		return;
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setVms1x1");		
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroup6Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group6 = e.control;
	showSelectControl(5);
}


/*
 * 그룹에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGroup6Dblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group6 = e.control;
	
	if(false == showSelectControl(6))
		return;
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setVms1x1");		
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroup7Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group7 = e.control;
	showSelectControl(6);
}


/*
 * 그룹에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGroup7Dblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group7 = e.control;
	
	if(false == showSelectControl(6))
		return;
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setVms1x1");		
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroup8Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group8 = e.control;
	showSelectControl(7);
}


/*
 * 그룹에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGroup8Dblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group8 = e.control;
	
	if(false == showSelectControl(7))
		return;
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setVms1x1");		
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroup9Click(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group9 = e.control;
	showSelectControl(8);
	
}


/*
 * 그룹에서 dblclick 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 더블 클릭할 때 발생하는 이벤트.
 */
function onGroup9Dblclick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group9 = e.control;

	
	if(false == showSelectControl(8))
		return;
	
	var hostApp = app.getHostAppInstance();
	hostApp.callAppMethod("setVms1x1");			
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
	

	videoStop();

	/*
	var totalCount = 0;
	for (var i = 0; i < MAX_DEIVCE_CNT; i++) {
		if(deviceList[i].deviceSerial != -1)
			totalCount++;
	}
	*/
		
	var StartShowDeviceIndex = (videoPageIndexer.currentPageIndex -1 ) * MAX_DEIVCE_SHOW;
			
	for(i=0;i<MAX_DEIVCE_SHOW;i++)
	{
		createVideo(i, deviceList[StartShowDeviceIndex].deviceSerial,
	 	deviceList[StartShowDeviceIndex].channelSerial, 
	 	deviceList[StartShowDeviceIndex].channelMediaSerial);
	 	
		if(null != player[i])
			dmsVideoPlayer.streamPlay(player[i]);
			
		StartShowDeviceIndex++;
		if(StartShowDeviceIndex >= totalDeviceCount)
			break;
	}	
	
	var select1 = app.lookup("select1");
	select1.visible = false;
	
	var select2 = app.lookup("select2");
	select2.visible = false;
	
	var select3 = app.lookup("select3");
	select3.visible = false;
	
	var select4 = app.lookup("select4");
	select4.visible = false;
	
	var select5 = app.lookup("select5");
	select5.visible = false;
	
	var select6 = app.lookup("select6");
	select6.visible = false;
	
	var select7 = app.lookup("select7");
	select7.visible = false;
	
	var select8 = app.lookup("select8");
	select8.visible = false;
	
	var select9 = app.lookup("select9");
	select9.visible = false;	
	
	showSelectControl(0);	
}


/*
 * Body에서 before-unload 이벤트 발생 시 호출.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(/* cpr.events.CEvent */ e){
	videoStop();
}
