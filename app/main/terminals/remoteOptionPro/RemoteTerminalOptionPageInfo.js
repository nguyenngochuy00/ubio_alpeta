/************************************************
 * RemoteTerminalOptionPageInfo.js
 * Created at 2023. 11. 24. 오후 5:53:50.
 *
 * @author zxc
 ************************************************/

var comLib;			
var dataManager = cpr.core.Module.require("lib/DataManager");

function onBodyLoad(/* cpr.events.CEvent */ e){
	comLib = createComUtil(app);
	dataManager = getDataManager();
	var terminalType = app.getHost().initValue;
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var termianlAllOpt = hostAppIns.callAppMethod("getTerminalAllOption");
		var dOptinfo = app.lookup("TerminalSystemInfo");
		termianlAllOpt.copyToDataMap(dOptinfo);


		setProgress(dOptinfo);
	}
	app.lookup("infotab").redraw();
}

function setProgress(optInfo) {
	var useDisk = optInfo.getValue("InfoSys_UseDisk");
	var totDisk = optInfo.getValue("InfoSys_TotalDisk");
	app.lookup("RTOPI_MHard_opt").value = useDisk + "M" + " / " + totDisk + "M";
	app.lookup("RTOPI_Hard_pgr").value = calculatePercentage(useDisk, totDisk);
	
	var useRam = optInfo.getValue("InfoSys_UseRam");
	var totRam = optInfo.getValue("InfoSys_TotalRam");
	app.lookup("RTOPI_MRam_opt").value = useRam + "M" + " / " + totRam + "M";
	app.lookup("RTOPI_Ram_pgr").value = calculatePercentage(useRam, totRam);
	
	var user = optInfo.getValue("InfoUser_User");
	var totUser = optInfo.getValue("InfoUser_MUser");
	var admin = optInfo.getValue("InfoUser_Admin");
	app.lookup("RTOPI_Admin_opt").value = admin;
	app.lookup("RTOPI_MUser_opt").value = user + " / " + totUser;
	app.lookup("RTOPI_User_pgs").value = calculatePercentage(user, totUser);
	
	var fp = optInfo.getValue("InfoUser_Fp");
	var totFp = optInfo.getValue("InfoUser_MFp");
	app.lookup("RTOPI_MFp_opt").value = fp + " / " + totFp;
	app.lookup("RTOPI_Fp_pgr").value = calculatePercentage(fp, totFp);
	
	var fp1toN = optInfo.getValue("InfoUser_Fp1toN");
	var totFp1toN = optInfo.getValue("InfoUser_MFp1toN");
	app.lookup("RTOPI_MFp1toN_opt").value = fp1toN + " / " + totFp1toN;
	app.lookup("RTOPI_Fp1toN_pgr").value = calculatePercentage(fp1toN, totFp1toN);
	
	var fc = optInfo.getValue("InfoUser_Fc");
	var totFc = optInfo.getValue("InfoUser_MFc");
	app.lookup("RTOPI_MFace_opt").value = fc + " / " + totFc;
	app.lookup("RTOPI_Face_pgr").value = calculatePercentage(fc, totFc);
	
	var fc1toN = optInfo.getValue("InfoUser_Fc1toN");
	var totFc1toN = optInfo.getValue("InfoUser_MFc1toN");
	app.lookup("RTOPI_MFace1toN_opt").value = fc1toN + " / " + totFc1toN;
	app.lookup("RTOPI_Face1toN_pgr").value = calculatePercentage(fc1toN, totFc1toN);
	
	var card = optInfo.getValue("InfoUser_Card");
	var totCard = optInfo.getValue("InfoUser_MCard");
	app.lookup("RTOPI_MCard_opt").value = card + " / " + totCard;
	app.lookup("RTOPI_Card_pgr").value = calculatePercentage(card, totCard);
	
	var photo = optInfo.getValue("InfoUser_Photo");
	var totPhoto = optInfo.getValue("InfoUser_MPhoto");
	app.lookup("RTOPI_MPhoto_opt").value = photo + " / " + totPhoto;
	app.lookup("RTOPI_Photo_pgr").value = calculatePercentage(photo, totPhoto);
	
	var log = optInfo.getValue("InfoLog_Log");
	var totLog = optInfo.getValue("InfoLog_MLog");
	app.lookup("RTOPI_Log_opt").value = log + " / " + totLog;
	
	var imgLog = optInfo.getValue("InfoLog_ImgLog");
	var totImgLog = optInfo.getValue("InfoLog_MImgLog");
	app.lookup("RTOPI_ImgLog_opt").value = imgLog + " / " + totImgLog;
}

function calculatePercentage(use, total) {
	var u = parseInt(use);
	var t = parseInt(total);
	var val = 0;
	if (u && t) {
		val = (u/t) * 100;
	}
	return val
}


//<-------------------------------------------------------------------------------

exports.getPageInfo = function() {
	return "Info";
}

//-------------------------------------------------------------------------------->




