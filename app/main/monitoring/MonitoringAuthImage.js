/************************************************
 * MonitoringAuthImage.js
 * Created at 2020. 3. 5. 오후 4:08:03.
 *
 * @author jrh
 ************************************************/

var dataManager = cpr.core.Module.require("lib/DataManager");
var CloseTimer;
var oem_version;

/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e) {
  dataManager = getDataManager();
  var initValue = app.getHost().initValue;
  var account = dataManager.getAccountInfo();
  oem_version = dataManager.getOemVersion();
  switch (oem_version) {
    case OEM_DMCC_NOPICTURE:
      app.lookup("image").src = "../../../theme/images/noImg.gif";
      /* 주석 풀면 마스터만 볼 수 있음
			if(Number(account.getValue("UserID")) == 1000000000000000000){
				app.lookup("image").src = "data:image/png;base64," + initValue["logImage"];
			} else {
				app.lookup("image").src = "../../../theme/images/noImg.gif";
			}*/
      break;

    default:
      app.lookup("image").src =
        "data:image/png;base64," + initValue["logImage"];
      // Add feature alarm sound when popup image show
      app.lookup("MRAIP_ctrlLogImageAudio").play();
      break;
  }

  var temperature = initValue["temperature"];
  var temperatureValid = initValue["temperatureValid"];
  oem_version = dataManager.getOemVersion();

  if (dataManager.getOemVersion() == OEM_LOTTE_FC) {
    CloseTimer = 601;
  } else {
    CloseTimer = 6;
  }

  if (temperature) {
    app.lookup("MRAIP_opbTemperature").visible = true;
    app.lookup("MRAIP_opbTemperature").value = temperature;
    var temperatureErrorNotify = dataManager.getTemperatureErrorNotify();

    if (temperatureErrorNotify == 1 && temperatureValid == 2) {
      app.lookup("MRAIP_ctrlAudio").play();
    }
  } else {
    app.lookup("MRAIP_opbTemperature").visible = false;
  }
  app.lookup("OTP_AutoCloseTimer").value = CloseTimer;
  AuthImageAutoClose();
  //console.log(app.getActualRect().height,app.getActualRect().width);
}

function AuthImageAutoClose() {
  if (CloseTimer == 1) {
    app.close();
  } else {
    CloseTimer--;
    app.lookup("OTP_AutoCloseTimer").value = CloseTimer;
    setTimeout(function () {
      AuthImageAutoClose();
    }, 1000);
  }
}

// Body에서 before-unload 이벤트 발생 시 호출.
function onBodyBeforeUnload(/* cpr.events.CEvent */ e) {
  AuthImageDialogLeft = app.getActualRect().left;
  AuthImageDialogTop = app.getActualRect().top - 32;
  AuthImageWidth = app.getActualRect().width;
  AuthImageHeight = app.getActualRect().height + 32;
}

// 도움말
function onMRMAN_imgHelpPageClick(/* cpr.events.CMouseEvent */ e) {
  var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
  var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
    content: {
      Target: DLG_HELP,
      ID: menu_id,
    },
  });
  app.getHostAppInstance().dispatchEvent(selectionEvent);
}
