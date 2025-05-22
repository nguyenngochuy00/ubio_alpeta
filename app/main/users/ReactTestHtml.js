/************************************************
 * userImport.js
 * Created at 2018. 10. 16. 오후 1:40:12.
 *
 * @author fois
 ************************************************/
var comLib;
var utilLib = cpr.core.Module.require("lib/util");
var dataManager = cpr.core.Module.require("lib/DataManager");
var fileArr = []; // html에서 받아온 파일 객체
var resultArr = []; // 서브미션 done에서 서브미션 send보내는 형식이여서 결과 map을 담을 arr 생성
var progressCount = 0; // 진행 count

var util = cpr.core.Module.require("lib/util"); // 클라이언트*
var imageDataParameter = ""; // 클라이언트*

//let uploadstartTime = moment().format('HH:mm:ss'); // 건수 많을 때 시작 -종료 시간 체크용도

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	
}