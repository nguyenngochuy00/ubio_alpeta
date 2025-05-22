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
	comLib = createComUtil(app);
	app.lookup('opt_tot').value = 0;
	var nvbar_imageOnOff = app.lookup('NVBAR_imageInsert');
	var OnOffStorage = localStorage.getItem("UFU_imageInsertOnOff");
	if (OnOffStorage == null) {
		nvbar_imageOnOff.value = 0;
		localStorage.setItem("UFU_imageInsertOnOff", 0);
	} else {
		nvbar_imageOnOff.value = OnOffStorage;
	}
}

/*
 * "Button" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var selectRowArr = app.lookup('grd_fileInfoList').getCheckRowIndices(); // 체크박스Arr
	var smsUserFaceUpload = app.lookup('sms_userFaceUpload');
	dataManager = getDataManager();
	
	// 1. send 파라미터 초기화
	smsUserFaceUpload.removeParameters("sendFile"); // 클라이언트*
	smsUserFaceUpload.removeParameters("sendName");
	smsUserFaceUpload.removeParameters("pictureFlag");
	
	// console.log('진행할 파일 수 ::', selectRowArr.length, '건');
	if (selectRowArr.length != 0) {
		// uploadstartTime = moment().format('HH:mm:ss'); // 시작
		var getArr = app.lookup('ep1').getPageProperty("_arr");
		imageResizeSend(getArr[selectRowArr[0]], 1); 
	} else {
		/* 업로드 할 사용자를 선택해 주세요 */
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString('Str_SelectfileToUpload'));
	}
}

/*
 * 임베디드 페이지에서 load 이벤트 발생 시 호출.
 * 페이지의 Load가 완료되었을 때 호출되는 Event.
 */
function onEp1Load( /* cpr.events.CEvent */ e) {
	/** 
	 * @type cpr.controls.EmbeddedPage
	 */
	var ep1 = e.control;
	dataManager = getDataManager();
	ep1.setPageProperty("_ownerApp", app); // AppInstance 
	ep1.setPageProperty("_arr", fileArr); // file 담을  Array
	ep1.setPageProperty("_Waiting", dataManager.getString('Str_VisitRequestWaiting')); // Str_대기
	ep1.setPageProperty("_ErrorFileName", dataManager.getString('Str_ErrorFileName')); // Str_파일명이 잘못되었습니다.
	ep1.setPageProperty("_GrdFileInfoList", app.lookup('grd_fileInfoList')); // 그리드 
	ep1.setPageProperty("_GrdDELETED", cpr.data.tabledata.RowState.DELETED); // 로우의 상태 값에 대한 key, value  
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_userFaceUploadSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_userFaceUpload = e.control;
	var grdFileInfoList = app.lookup('grd_fileInfoList');
	var dsFileInfo = app.lookup('ds_fileInfo');
	var selectRowArr = grdFileInfoList.getCheckRowIndices(); // 체크박스Arr 
	var resultCode = app.lookup('Result').getValue('ResultCode');
	var smsUserFaceUpload = app.lookup('sms_userFaceUpload');
	/* 파라미터 초기화 */
	//smsUserFaceUpload.removeFileParameters('sendFile'); // 서버*
	smsUserFaceUpload.removeParameters("sendFile"); // 클라이언트*
	smsUserFaceUpload.removeParameters("sendName");
	smsUserFaceUpload.removeParameters("pictureFlag");
	
	resultArr.push(resultCode);
	
	dataManager = getDataManager();
	
	progressCount++;
	var getArr = app.lookup('ep1').getPageProperty("_arr");
	if (selectRowArr[progressCount] != undefined && getArr[selectRowArr[progressCount]] != undefined) {
		var subTitle = progressCount + " / " + dsFileInfo.getValue(selectRowArr[progressCount], 'name').toString();
		comLib.updateLoadMask(subTitle);
		imageResizeSend(getArr[selectRowArr[progressCount]], 2); // 클라이언트*
	} else {
		grdFileInfoList.clearAllCheck();
		for (var i = 0; selectRowArr.length > i; i++) {
			grdFileInfoList.setCheckColumnEnabled(selectRowArr[i], false); // 처리된 row enabled
			if (_.isEqual(app.lookup('ds_fileInfo').getValue(selectRowArr[i], 'statusValue'), dataManager.getString('Str_Fail'))) {
				
			} else {
				app.lookup('ds_fileInfo').setValue(selectRowArr[i], 'statusValue', dataManager.getString(getErrorString(resultArr[i])));
			}
			grdFileInfoList.setRowState(selectRowArr[i], cpr.data.tabledata.RowState.DELETED); // 처리된 RowState delete
		}
		grdFileInfoList.redraw();
		progressCount = 0;
		resultArr = [];
		// var uploadEndTime = moment().format('HH:mm:ss');
		// console.log('startTime:', uploadstartTime, 'endTime', uploadEndTime); // 소요 시간 확인 주석
		comLib.hideLoadMask();
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString('Str_TaskStateFinished'));
	}
}

/*
 * "delete" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var grdFileInfoList = app.lookup('grd_fileInfoList');
	var dsFileInfo = app.lookup('ds_fileInfo');
	var selectRowArr = grdFileInfoList.getCheckRowIndices();
	var smsUserFaceUpload = app.lookup('sms_userFaceUpload');
	dataManager = getDataManager();
	
	if (selectRowArr.length != 0) {
		if (smsUserFaceUpload.status == 'SENDING') {
			dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString('Str_UploadingPictures'));
		} else {
			grdFileInfoList.clearAllCheck();
			for (var i = 0; selectRowArr.length > i; i++) {
				grdFileInfoList.setCheckColumnEnabled(selectRowArr[i], false);
				dsFileInfo.setValue(selectRowArr[i], 'statusValue', dataManager.getString('Str_Delete'));
				// Str_AuditActingDelete
				grdFileInfoList.setRowState(selectRowArr[i], cpr.data.tabledata.RowState.DELETED);
			}
			grdFileInfoList.redraw();
		}
		
	} else {
		dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString('Str_Selectfile'));
	}
}

/*
 * "reset" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick4( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var smsUserFaceUpload = app.lookup('sms_userFaceUpload');
	dataManager = getDataManager();
	dialogConfirm(app.getRootAppInstance(), dataManager.getString("Str_Info"), dataManager.getString('Str_ClearConfirm'), function( /*cpr.controls.Dialog*/ dialog) {
		dialog.addEventListenerOnce("close", function(e) {
			
			if (dialog.returnValue) {
				if (smsUserFaceUpload.status == 'SENDING') {
					dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString('Str_UploadingPictures'));
				} else {
					app.lookup('opt_tot').value = 0;
					app.lookup('ds_fileInfo').clear();
					app.lookup('Result').clear();
					app.lookup('grd_fileInfoList').redraw();
					fileArr = [];
					app.lookup('ep1').setPageProperty('_arr', fileArr);
					progressCount = 0;
				}
			} else {
				
			}
		});
	});
}

/*
 * 서브미션에서 submit-error 이벤트 발생 시 호출.
 * 통신 중 문제가 생기면 발생합니다.
 */
function onSms_userFaceUploadSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_userFaceUpload = e.control;
	var selectRowArr = app.lookup('grd_fileInfoList').getCheckRowIndices();
	dataManager = getDataManager();
	app.lookup('ds_fileInfo').setValue(selectRowArr[progressCount], 'statusValue', dataManager.getString('Str_Fail'));
}

/*
 * 데이터셋에서 update 이벤트 발생 시 호출.
 * 데이터가 수정되는 경우 발생하는 이벤트. 발생 메소드 : setValue, updateRow
 */
function onDs_fileInfoUpdate2(e) {
	var ds_fileInfo = e.control;
	app.lookup('opt_tot').value = ds_fileInfo.getRowCount();
}

/*
 * "Button" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(e) {
	var button = e.control;
	app.lookup("ep1").callPageMethod("fileInputClick");
}

/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onUFU_imgHelpPageClick(e) {
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

var imageMax = 130000;
var orientation;

function processImage(canvas, srcImage, maxSize) {
	var ctx = canvas.getContext("2d");
	ctx.save();
	var hRatio = canvas.width / srcImage.width;
	var vRatio = canvas.height / srcImage.height;
	var ratio = Math.min(hRatio, vRatio);
	var centerShift_x = (canvas.width - srcImage.width * ratio) / 2;
	var centerShift_y = (canvas.height - srcImage.height * ratio) / 2;
	
	orientation = 0;
	switch (orientation) {
		case 2: // horizontal flip				            
			ctx.translate(canvas.width, 0);
			ctx.scale(-1, 1);
			break;
		case 3:
			// 180° rotate left				            
			ctx.translate(canvas.width, canvas.height);
			ctx.rotate(Math.PI);
			break;
		case 4:
			// vertical flip
			ctx.translate(0, canvas.height);
			ctx.scale(1, -1);
			break;
		case 5:
			// vertical flip + 90 rotate right
			ctx.rotate(0.5 * Math.PI);
			ctx.scale(1, -1);
			break;
		case 6:
			// 90° rotate right				            
			ctx.rotate(0.5 * Math.PI);
			ctx.translate(0, -canvas.height);
			break;
		case 7:
			// horizontal flip + 90 rotate right
			ctx.rotate(0.5 * Math.PI);
			ctx.translate(canvas.width, -canvas.height);
			ctx.scale(-1, 1);
			break;
		case 8:
			// 90° rotate left
			ctx.rotate(-0.5 * Math.PI);
			ctx.translate(-canvas.width, 0);
			break;
	}
	
	ctx.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height,
		centerShift_x, centerShift_y, srcImage.width * ratio, srcImage.height * ratio);
	
	var imageSrc = canvas.toDataURL("image/jpeg");
	var imageData = imageSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
	
	canvas.width = 0;
	canvas.height = 0;
	
	ctx.clearRect(0, 0, srcImage.width, srcImage.height);
	ctx.beginPath();
	ctx.restore();
	
	if (imageData.length >= maxSize) {
		return false
	} else {
		imageDataParameter = imageData;
	}
	
	/* 짜른 이미지 보고싶으면  .clx에 이미지 컨트롤 추가하고 밑에 주석 해제 */
	//	var imgPhoto = app.lookup("testimage");			
	//	imgPhoto.src = imageSrc;			
	//	imgPhoto.redraw();
	
	return true;
}

/**
 * 이미지 파일 리사이징 후 send(클라이언트 리사이징으로 send 프로세스 수정)
 * 일괄이 아닌 1 서브미션 1 FILE send로
 * 한번의 send 이후 서브미션 done에서 추가 파일 처리를 하면서 일괄처럼 동작하도록 되어있음
 * @param data : 파일 데이터
 * @param cnt : 1:최초 send, 2: 이후 send
 */
function imageResizeSend(data, cnt) {
	var reader = new FileReader();
	reader.readAsDataURL(data);
	reader.onload = function() {
		var exif = EXIF.readFromBinaryFile(util.base64ToArrayBuffer(this.result));
		orientation = exif.Orientation;
		if (orientation == undefined) {
			orientation = "undefined";
		}
		var tempImage = new Image();
		tempImage.src = reader.result;
		tempImage.onload = function() {
			var canvas = document.getElementById("captureCanvas");
			var srcWidth = canvas.width;
			var srcHeight = canvas.height;
			var canvasMax = this.width;
			
			if (canvasMax < this.height) {
				canvasMax = this.height
			}
			if (canvasMax > 1024) {
				canvasMax = 1024;
			}
			while (true) {
				canvas.width = canvasMax;
				canvas.height = canvasMax;
				if (processImage(canvas, this, imageMax) == true) {
					
					var sms_userFaceUpload = app.lookup('sms_userFaceUpload');
					var selectRowArr = app.lookup('grd_fileInfoList').getCheckRowIndices(); // 체크박스Arr
					var dsFileInfo = app.lookup('ds_fileInfo');
					var pictureFlag = app.lookup('NVBAR_imageInsert').value;
					if (cnt == '1') {
						// 최초 1회 send
						sms_userFaceUpload.addParameter('sendFile', imageDataParameter); // 클라이언트* 
						sms_userFaceUpload.addParameter("sendName", dsFileInfo.getValue(selectRowArr[0], 'name').toString().split('.')[0]);
						sms_userFaceUpload.addParameter("pictureFlag", pictureFlag);
						if (_.isEqual(sms_userFaceUpload.status, 'IDLE')) { // 서브미션 상태 대기
							var subtitle = app.lookup('grd_fileInfoList').getCheckRowIndices().length;
							var totalCount = app.lookup('grd_fileInfoList').getCheckRowIndices().length;
							comLib.showLoadMask("pro", dataManager.getString('Str_UploadingPictures') + " ( " + dataManager.getString('Str_Total1') + " " + totalCount + " )", subtitle, totalCount);
							//console.log('sendName:', dsFileInfo.getValue(selectRowArr[0], 'name').toString().split('.')[0]);
							sms_userFaceUpload.send();
						} else {
							dialogAlert(app, dataManager.getString("Str_Info"), dataManager.getString('Str_UploadingPictures'));
						}
					} else {
						// cnt = 2	
						// 1회 이후부터 send
						sms_userFaceUpload.addParameter('sendFile', imageDataParameter); // 클라이언트*
						sms_userFaceUpload.addParameter("sendName", dsFileInfo.getValue(selectRowArr[progressCount], 'name').toString().split('.')[0]);
						sms_userFaceUpload.addParameter("pictureFlag", pictureFlag);
						// console.log('sendName:', dsFileInfo.getValue(selectRowArr[progressCount], 'name').toString().split('.')[0]);
						sms_userFaceUpload.send();
					}
					break;
				}
				canvasMax -= 100;
			}
		}
	};
}

/*
 * 쉘에서 load 이벤트 발생 시 호출.
 */
function onUFAWR_shlCameraCaptureLoad( /* cpr.events.CUIEvent */ e) {
	/** 
	 * @type cpr.controls.UIControlShell
	 */
	var uFAWR_shlCameraCapture = e.control;
	var content = e.content;
	content.innerHTML = "<canvas width=\"1px\" height=\"1px\" id=\"captureCanvas\"></canvas>";
}

/*
 * 네비게이션 바에서 selection-change 이벤트 발생 시 호출.
 * 선택된 Item 값이 저장된 후에 발생하는 이벤트.
 */
function onNVBAR_imageInsertSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.NavigationBar
	 */
	var nVBAR_imageInsert = e.control;
	localStorage.setItem("UFU_imageInsertOnOff", nVBAR_imageInsert.value);
}