/************************************************
 * DialogManager.module.js
 * Created at 2019. 3. 7. 오전 9:26:46.
 *
 * @author osm8667
 ************************************************/

/**
 * @param app 현재 화면의 app 인스턴스
 * @param src 다이얼로그 경로
 * @param width 다이얼로그 폭
 * @param height 다이얼로그 높이
 * @param keypath 헤더에 표시할 다국어 언어 Key값
 * @param isModal 모달창 여부
 * @param initValue 전달할 값 (any type)
 * @param callback 콜백함수
 * @description 최상위 앱에서 실행되는 다이얼로그를 생성합니다.
 */
globals.rootDialog = function(/*cpr.core.AppInstance*/app, /*String*/src, /*Number*/width, /*Number*/height
					, /*String*/keypath, /*Boolean*/isModal, initValue, callback)
{
	
	var rootApp = app.getRootAppInstance();
	var option = {
		width : width,
		height : height,
		headerVisible : true,
		headerClose : true,
		resizable : true
	};
	rootApp.openDialog(src, option, function(/*cpr.controls.Dialog*/dialog){
		dialog.modal = isModal;
		if(keypath){
			dialog.bind("headerTitle").toLanguage(keypath);
		}
		if(initValue){
			dialog.initValue = initValue;
		}
	}).then(function(returnValue){
		if(callback){
			callback(returnValue);
		}
	});
}
