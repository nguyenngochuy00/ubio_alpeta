/************************************************
 * terminalVInfoFrame.js
 * Created at 2018. 12. 4. 오후 4:16:41.
 *
 * @author joymrk
 ************************************************/
var SvrSendFlag;
var dataManager = cpr.core.Module.require("lib/DataManager");
var comLib;
var usint_version;
var NSH_DEV_CODE;
var ENABLE_INNODEP_VMS = 0;
var ENABLE_MCP040 = 0;

/*
 * 단말기 옵션정보 저장항 데이터 셋, 맵 초기화
 */
function OptDataInit() {
	app.lookup("BasicOptionInfo").reset();
	app.lookup("NetWorkOptionInfo").reset();
	app.lookup("MealOptValue").reset();
	app.lookup("VoipOptValue").reset();
	app.lookup("AlarmOptionList").clear();
}


function UTCDataInit2() { // by nsh saving daylight new version
	
	var Cmb_utcIndex = app.lookup("cmb_utcIndex");
	var Item0 = new cpr.controls.Item(dataManager.getString("Str_All"), -43200);
	var Item1 = new cpr.controls.Item(dataManager.getString("Str_All"), -39600);
	//var Item1sd = new cpr.controls.Item(dataManager.getString("Str_All"), -39600111);
	var Item2 = new cpr.controls.Item(dataManager.getString("Str_All"), -36000);
	//var Item2sd = new cpr.controls.Item(dataManager.getString("Str_All"), -36000111);
	var Item3 = new cpr.controls.Item(dataManager.getString("Str_All"), -32400);
	//var Item3sd = new cpr.controls.Item(dataManager.getString("Str_All"), -32400111);
	var Item4 = new cpr.controls.Item(dataManager.getString("Str_All"), -28800);
	//var Item4sd = new cpr.controls.Item(dataManager.getString("Str_All"), -28800111); // by nsh test saving daylight
	//var Item5 = new cpr.controls.Item(dataManager.getString("Str_All"), -28800);
	var Item6 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200);
	//var Item6sd = new cpr.controls.Item(dataManager.getString("Str_All"), -25200111);
	//var Item7 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200);
	//var Item8 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200);
	var Item9 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600);
	//var Item9sd = new cpr.controls.Item(dataManager.getString("Str_All"), -21600111);
	//var Item10 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600);
	//var Item11 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600);
	//var Item12 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600);
	var Item13 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000);
	//var Item13sd = new cpr.controls.Item(dataManager.getString("Str_All"), -18000111);
	//var Item14 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000);
	//var Item15 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000);
	var Item16 = new cpr.controls.Item(dataManager.getString("Str_All"), -16200);
	var Item17 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	//var Item17sd = new cpr.controls.Item(dataManager.getString("Str_All"), -14400111);
	//var Item18 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	//var Item19 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	//var Item20 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	//var Item21 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	var Item22 = new cpr.controls.Item(dataManager.getString("Str_All"), -12600);
	//var Item22sd = new cpr.controls.Item(dataManager.getString("Str_All"), -12600111);
	var Item23 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800);
	//var Item23sd = new cpr.controls.Item(dataManager.getString("Str_All"), -10800111);
	//var Item24 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800);
	//var Item25 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800);
	//var Item26 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800);
	//var Item27 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800);
	var Item28 = new cpr.controls.Item(dataManager.getString("Str_All"), -7200);
	var Item29 = new cpr.controls.Item(dataManager.getString("Str_All"), -3600);
	//var Item30 = new cpr.controls.Item(dataManager.getString("Str_All"), -3600);
	var Item31 = new cpr.controls.Item(dataManager.getString("Str_All"), 0);
	//var Item31sd = new cpr.controls.Item(dataManager.getString("Str_All"), 0111);
	//var Item32 = new cpr.controls.Item(dataManager.getString("Str_All"), 0);
	//var Item33 = new cpr.controls.Item(dataManager.getString("Str_All"), 0);
	//var Item34 = new cpr.controls.Item(dataManager.getString("Str_All"), 0);
	var Item35 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	//var Item35sd = new cpr.controls.Item(dataManager.getString("Str_All"), 3600111);
	//var Item36 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	//var Item37 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	//var Item38 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	//var Item39 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	var Item40 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item40sd = new cpr.controls.Item(dataManager.getString("Str_All"), 7200111);
	//var Item41 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item42 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item43 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item44 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item45 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item46 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item47 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item48 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	var Item49 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800);
	//var Item49sd = new cpr.controls.Item(dataManager.getString("Str_All"), 10800111);
	//var Item50 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800);
	//var Item51 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800);
	//var Item52 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800);
	var Item53 = new cpr.controls.Item(dataManager.getString("Str_All"), 12600);
	//var Item53sd = new cpr.controls.Item(dataManager.getString("Str_All"), 12600111);
	var Item54 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	//var Item54sd = new cpr.controls.Item(dataManager.getString("Str_All"), 14400111);
	//var Item55 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	//var Item56 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	//var Item57 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	//var Item58 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	var Item59 = new cpr.controls.Item(dataManager.getString("Str_All"), 16200);
	var Item60 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000);
	//var Item60sd = new cpr.controls.Item(dataManager.getString("Str_All"), 18000111);
	//var Item61 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000);
	//var Item62 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000);
	var Item63 = new cpr.controls.Item(dataManager.getString("Str_All"), 19800);
	//var Item63sd = new cpr.controls.Item(dataManager.getString("Str_All"), 19800111);
	//var Item64 = new cpr.controls.Item(dataManager.getString("Str_All"), 19800);
	var Item65 = new cpr.controls.Item(dataManager.getString("Str_All"), 20700);
	var Item66 = new cpr.controls.Item(dataManager.getString("Str_All"), 21600);
	//var Item67 = new cpr.controls.Item(dataManager.getString("Str_All"), 21600);
	var Item68 = new cpr.controls.Item(dataManager.getString("Str_All"), 23400);
	var Item69 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200);
	//var Item70 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200);
	var Item71 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	//var Item72 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	//var Item73 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	//var Item74 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	//var Item75 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	//var Item76 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	var Item77 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400);
	//var Item78 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400);
	//var Item79 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400);
	var Item80 = new cpr.controls.Item(dataManager.getString("Str_All"), 34200);
	//var Item81 = new cpr.controls.Item(dataManager.getString("Str_All"), 34200);
	var Item82 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	//var Item82sd = new cpr.controls.Item(dataManager.getString("Str_All"), 36000111);
	//var Item83 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	//var Item84 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	//var Item85 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	//var Item86 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	var Item87 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600);
	//var Item87sd = new cpr.controls.Item(dataManager.getString("Str_All"), 39600111);
	var Item88 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200);
	//var Item88sd = new cpr.controls.Item(dataManager.getString("Str_All"), 43200111);
	//var Item89 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200);
	//var Item90 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200);
	var Item91 = new cpr.controls.Item(dataManager.getString("Str_All"), 46800);
	
	Item0.bind("label").toLanguage("Str_InternationalDateLineWest"); // -12
	Item1.bind("label").toLanguage("Str_MidwayIsland"); // -11
	//Item1sd.bind("label").toLanguage("Str_MidwayIslandSD"); // -11
	Item2.bind("label").toLanguage("Str_Hawaii"); //-10
	//Item2sd.bind("label").toLanguage("Str_HawaiiSD"); //-10
	Item3.bind("label").toLanguage("Str_Alaska"); // -9
	//Item3sd.bind("label").toLanguage("Str_AlaskaSD"); // -9
	Item4.bind("label").toLanguage("Str_PacificTime(US&Canada)"); // -8
	//Item4sd.bind("label").toLanguage("Str_PacificTime(US&Canada)SD"); // -8   // by nsh test saving daylight
	Item6.bind("label").toLanguage("Str_MountainTime(US&Canada)"); // -7
	//Item6sd.bind("label").toLanguage("Str_MountainTime(US&Canada)SD"); // -7
	Item9.bind("label").toLanguage("Str_CentralTime(US&Canada)"); //-6
	//Item9sd.bind("label").toLanguage("Str_CentralTime(US&Canada)SD"); //-6
	Item13.bind("label").toLanguage("Str_EasternTime(US&Canada)"); //-5
	//Item13sd.bind("label").toLanguage("Str_EasternTime(US&Canada)SD"); //-5
	Item16.bind("label").toLanguage("Str_Caracas"); // -4:30
	Item17.bind("label").toLanguage("Str_AtlanticTime(Canada)"); // -4
	//Item17sd.bind("label").toLanguage("Str_AtlanticTime(Canada)SD"); // -4
	Item22.bind("label").toLanguage("Str_Newfoundland"); //-3:30
	//Item22sd.bind("label").toLanguage("Str_NewfoundlandSD"); //-3:30
	Item23.bind("label").toLanguage("Str_Brasilia"); // -3
	//Item23sd.bind("label").toLanguage("Str_BrasiliaSD"); // -3
	Item28.bind("label").toLanguage("Str_Mid-Atlantic"); //-2
	Item29.bind("label").toLanguage("Str_Azores"); //-1
	Item31.bind("label").toLanguage("Str_Casablanca"); //0
	//Item31sd.bind("label").toLanguage("Str_CasablancaSD"); //0
	Item35.bind("label").toLanguage("Str_Amsterdam"); //1
	//Item35sd.bind("label").toLanguage("Str_AmsterdamSD"); //1
	Item40.bind("label").toLanguage("Str_Amman"); //2
	//Item40sd.bind("label").toLanguage("Str_AmmanSD"); //2
	Item49.bind("label").toLanguage("Str_Baghdad"); //3
	//Item49sd.bind("label").toLanguage("Str_BaghdadSD"); //3
	Item53.bind("label").toLanguage("Str_Tehran"); //3:30
	//Item53sd.bind("label").toLanguage("Str_TehranSD"); //3:30
	Item54.bind("label").toLanguage("Str_AbuDhabi"); //4
	//Item54sd.bind("label").toLanguage("Str_AbuDhabiSD"); //4
	Item59.bind("label").toLanguage("Str_Kabul"); //4:30
	Item60.bind("label").toLanguage("Str_Ekaterinburg"); //5
	//Item60sd.bind("label").toLanguage("Str_EkaterinburgSD"); //5
	Item63.bind("label").toLanguage("Str_Chennai"); //5:30
	//Item63sd.bind("label").toLanguage("Str_ChennaiSD"); //5:30
	Item65.bind("label").toLanguage("Str_Kathmandu"); //5:45
	Item66.bind("label").toLanguage("Str_Astana"); //6
	Item68.bind("label").toLanguage("Str_Yangon"); //6:30
	Item69.bind("label").toLanguage("Str_Bangkok"); //7
	Item71.bind("label").toLanguage("Str_Beijing"); //8
	Item77.bind("label").toLanguage("Str_Seoul"); //9 
	Item80.bind("label").toLanguage("Str_Adelaide"); //9:30
	Item82.bind("label").toLanguage("Str_Brisbane"); //10 
	//Item82sd.bind("label").toLanguage("Str_BrisbaneSD"); //10 
	Item87.bind("label").toLanguage("Str_Magadan"); //11
	//Item87sd.bind("label").toLanguage("Str_MagadanSD"); //11
	Item88.bind("label").toLanguage("Str_Auckland"); //12
	//Item88sd.bind("label").toLanguage("Str_AucklandSD"); //12
	Item91.bind("label").toLanguage("Str_Nukualofa"); //13 
	Cmb_utcIndex.addItem(Item0);
	Cmb_utcIndex.addItem(Item1);
	//Cmb_utcIndex.addItem(Item1sd);
	Cmb_utcIndex.addItem(Item2);
	//Cmb_utcIndex.addItem(Item2sd);
	Cmb_utcIndex.addItem(Item3);
	//Cmb_utcIndex.addItem(Item3sd);
	Cmb_utcIndex.addItem(Item4);
	//Cmb_utcIndex.addItem(Item4sd);   // by nsh test saving daylight
	Cmb_utcIndex.addItem(Item6);
	//Cmb_utcIndex.addItem(Item6sd);
	Cmb_utcIndex.addItem(Item9);
	//Cmb_utcIndex.addItem(Item9sd);
	Cmb_utcIndex.addItem(Item13);
	//Cmb_utcIndex.addItem(Item13sd);
	Cmb_utcIndex.addItem(Item16);
	Cmb_utcIndex.addItem(Item17);
	//Cmb_utcIndex.addItem(Item17sd);
	Cmb_utcIndex.addItem(Item22);
	//Cmb_utcIndex.addItem(Item22sd);
	Cmb_utcIndex.addItem(Item23);
	//Cmb_utcIndex.addItem(Item23sd);
	Cmb_utcIndex.addItem(Item28);
	Cmb_utcIndex.addItem(Item29);
	Cmb_utcIndex.addItem(Item31);
	//Cmb_utcIndex.addItem(Item31sd);
	Cmb_utcIndex.addItem(Item35);
	//Cmb_utcIndex.addItem(Item35sd);
	Cmb_utcIndex.addItem(Item40);
	//Cmb_utcIndex.addItem(Item40sd);
	Cmb_utcIndex.addItem(Item49);
	//Cmb_utcIndex.addItem(Item49sd);
	Cmb_utcIndex.addItem(Item53);
	//Cmb_utcIndex.addItem(Item53sd);
	Cmb_utcIndex.addItem(Item54);
	//Cmb_utcIndex.addItem(Item54sd);
	Cmb_utcIndex.addItem(Item59);
	Cmb_utcIndex.addItem(Item60);
	//Cmb_utcIndex.addItem(Item60sd);
	Cmb_utcIndex.addItem(Item63);
	//Cmb_utcIndex.addItem(Item63sd);
	Cmb_utcIndex.addItem(Item65);
	Cmb_utcIndex.addItem(Item66);
	Cmb_utcIndex.addItem(Item68);
	Cmb_utcIndex.addItem(Item69);
	Cmb_utcIndex.addItem(Item71);
	Cmb_utcIndex.addItem(Item77);
	Cmb_utcIndex.addItem(Item80);
	Cmb_utcIndex.addItem(Item82);
	//Cmb_utcIndex.addItem(Item82sd);
	Cmb_utcIndex.addItem(Item87);
	//Cmb_utcIndex.addItem(Item87sd);
	Cmb_utcIndex.addItem(Item88);
	//Cmb_utcIndex.addItem(Item88sd);
	Cmb_utcIndex.addItem(Item91);
	Cmb_utcIndex.redraw();
	
}




function UTCDataInit() {
	
	var Cmb_utcIndex = app.lookup("cmb_utcIndex");
	var Item0 = new cpr.controls.Item(dataManager.getString("Str_All"), -43200); //날짜변경선 서쪽 UTC-12:00
	//var Item1 = new cpr.controls.Item(dataManager.getString("Str_All"), -39600);
	var Item1sd = new cpr.controls.Item(dataManager.getString("Str_All"), -39600111); //협정 세계시-11 UTC-11:00
	//var Item2 = new cpr.controls.Item(dataManager.getString("Str_All"), -36000);
	var Item2sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -36000111); //알류샨 열도 UTC-10:00
	var Item2sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -36000112); //하와이 UTC-10:00
	var Item2sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), -34200111); //마키저스 제도 UTC-10:30
	//var Item3 = new cpr.controls.Item(dataManager.getString("Str_All"), -32400);
	var Item3sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -32400111); //알래스카 UTC-09:00
	var Item3sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -32400112); //협정 세계시 UTC-09:00
	//var Item4 = new cpr.controls.Item(dataManager.getString("Str_All"), -28800);
	var Item4sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -28800111); //바하 캘리포니아 UTC-08:00
	var Item4sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -28800112); //태평양 표준시 (미국, 캐나다) UTC-08:00
	var Item4sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), -28800113); //협정 세계시 UTC-08:00
	//var Item5 = new cpr.controls.Item(dataManager.getString("Str_All"), -28800);
	//var Item6 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200);
	var Item6sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200111); //산지표준시 UTC-07:00
	var Item6sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200112); //애리조나 UTC-07:00
	var Item6sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200113); //유콘 UTC-07:00
	var Item6sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200114); //치와와,라파스,마사틀란 UTC-07:00
	//var Item7 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200);
	//var Item8 = new cpr.controls.Item(dataManager.getString("Str_All"), -25200);
	//var Item9 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600);
	var Item9sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600111); //과달라하라,멕시코시티,몬테레이 UTC-06:00
	var Item9sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600112); //서스캐처원 UTC-06:00
	var Item9sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600113); //이스터섬 UTC-06:00
	var Item9sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600114); //중부 표준시 UTC-06:00
	var Item9sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600115); //중앙 아메리카 UTC-06:00
	//var Item10 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600);
	//var Item11 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600);
	//var Item12 = new cpr.controls.Item(dataManager.getString("Str_All"), -21600);
	//var Item13 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000);
	var Item13sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000111); //동부 표준시 UTC-05:00
	var Item13sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000112); //보고타,리마,키토,리오브랑코 UTC-05:00
	var Item13sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000113); //아이티 UTC-05:00
	var Item13sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000114); //인디애나(동부)-05:00
	var Item13sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000115); //체투말 UTC-05:00
	var Item13sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000116); //터크스 케이커스 UTC-05:00
	var Item13sd7 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000117); //하바나 UTC-05:00
	//var Item14 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000);
	//var Item15 = new cpr.controls.Item(dataManager.getString("Str_All"), -18000);
	var Item16sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -16200111); //대서양표준시 (캐나다) UTC-04:30
	var Item16sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400112); //산티아고 UTC-04:00
	var Item16sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400113); //아순시온 UTC-04:00
	var Item16sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400114); //조지타운,라파스,마노스,산후안 UTC-04:00
	var Item16sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400115); //카라카스 UTC-04:00
	var Item16sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400116); //쿠이아바 UTC-04:00
	//var Item17 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	var Item17sd = new cpr.controls.Item(dataManager.getString("Str_All"), -12600111); //뉴펀들랜드 UTC-03:30
	//var Item18 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	//var Item19 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	//var Item20 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	//var Item21 = new cpr.controls.Item(dataManager.getString("Str_All"), -14400);
	//var Item22 = new cpr.controls.Item(dataManager.getString("Str_All"), -12600);
	var Item22sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800111); //그린란드 UTC-03:00
	var Item22sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800112); //몬테비디오 UTC-03:00
	var Item22sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800113); //부에노스아이레스 UTC-03:00
	var Item22sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800114); //브라질리아 UTC-03:00
	var Item22sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800115); //살바도르 UTC-03:00
	var Item22sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800116); //생피에르앤드미클롱 UTC-03:00
	var Item22sd7 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800117); //아라구아이나 UTC-03:00
	var Item22sd8 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800118); //카옌,포르탈레자 UTC-03:00
	var Item22sd9 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800119); //푼타아레나스 UTC-03:00
	//var Item23 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800); 
	var Item23sd = new cpr.controls.Item(dataManager.getString("Str_All"), -7200111); //협정 세계시-02
	//var Item24 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800);
	//var Item25 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800);
	//var Item26 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800);
	//var Item27 = new cpr.controls.Item(dataManager.getString("Str_All"), -10800);
	var Item28sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), -3600111); //아조레스 UTC-01:00
	var Item28sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), -3600112); //카보베르데 제도 UTC-01:00
	//var Item29 = new cpr.controls.Item(dataManager.getString("Str_All"), -3600);
	//var Item30 = new cpr.controls.Item(dataManager.getString("Str_All"), -3600);
	//var Item31 = new cpr.controls.Item(dataManager.getString("Str_All"), 0);
	var Item29sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 111); //협정 세계시 UTC-00:00
	var Item29sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 112); //더블린,에든버러,리스본,런던 UTC-00:00
	var Item29sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 113); //몬로비아,레이캬비크 UTC-00:00
	var Item29sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 114); //상투메 UTC-00:00
	//var Item32 = new cpr.controls.Item(dataManager.getString("Str_All"), 0);
	//var Item33 = new cpr.controls.Item(dataManager.getString("Str_All"), 0);
	//var Item34 = new cpr.controls.Item(dataManager.getString("Str_All"), 0);
	//var Item35 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	var Item31sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600111); //카사블랑카 UTC+01:00
	var Item31sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600112); //베오그라드,브라티슬라바,부다페스트,류블랴나,프라하 UTC+01:00
	var Item31sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600113); //브뤼셀,코펜하겐,마드리드,파리 UTC+01:00
	var Item31sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600114); //사리예보,스코페,바르샤바,자그레브 UTC+01:00
	var Item31sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600115); //서중앙 아프리카 UTC+01:00
	var Item31sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600116); //암스테르담,베를린,베른,로마,스톡홀롬,빈 UTC+01:00
	//var Item36 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	//var Item37 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	//var Item38 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	//var Item39 = new cpr.controls.Item(dataManager.getString("Str_All"), 3600);
	//var Item40 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	var Item35sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200111); //가자,헤브론 UTC+02:00
	var Item35sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200112); //다마스쿠스 UTC+02:00
	var Item35sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200113); //베이루트 UTC+02:00
	var Item35sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200114); //빈트후크 UTC+02:00
	var Item35sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200115); //아테네,부카레스트 UTC+02:00
	var Item35sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200116); //암만 UTC+02:00
	var Item35sd7 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200117); //예루살렘 UTC+02:00
	var Item35sd8 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200118); //주바 UTC+02:00
	var Item35sd9 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200119); //카이로 UTC+02:00
	var Item35sd10 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200120); //칼리닌그라드 UTC+02:00
	var Item35sd11 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200121); //키시네프 UTC+02:00
	var Item35sd12 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200122); //트리폴리 UTC+02:00
	var Item35sd13 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200123); //하라레,프리토리아 UTC+02:00
	var Item35sd14 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200124); //하르툼 UTC+02:00
	var Item35sd15 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200125); //헬싱키,키예프,리가,소피아,탈린,빌뉴스 UTC+02:00
	//var Item41 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item42 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item43 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item44 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item45 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item46 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item47 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item48 = new cpr.controls.Item(dataManager.getString("Str_All"), 7200);
	//var Item49 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800);
	var Item40sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800111); //나이로비 UTC+03:00
	var Item40sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800112); //모스크바,상트페테르부르크 UTC+03:00
	var Item40sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800113); //민스크 UTC+03:00
	var Item40sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800114); //바그다드 UTC+03:00
	var Item40sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800115); //볼고그라드 UTC+03:00
	var Item40sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800116); //이스탄불 UTC+03:00
	var Item40sd7 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800117); //쿠웨이트,리야드 UTC+03:00
	//var Item50 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800);
	//var Item51 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800);
	//var Item52 = new cpr.controls.Item(dataManager.getString("Str_All"), 10800);
	//var Item53 = new cpr.controls.Item(dataManager.getString("Str_All"), 12600);
	var Item49sd = new cpr.controls.Item(dataManager.getString("Str_All"), 12600111); //테헤란 UTC+03:30
	//var Item54 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	var Item53sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400111); //바쿠 UTC+04:00
	var Item53sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400112); //사라토브 UTC+04:00
	var Item53sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400113); //아랍:아부다비,무스카트 UTC+04:00
	var Item53sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400114); //아스트라한,울랴노브스크 UTC+04:00
	var Item53sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400115); //예레반 UTC+04:00
	var Item53sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400116); //이젭스크,사마라 UTC+04:00
	var Item53sd7 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400117); //트빌리시 UTC+04:00
	var Item53sd8 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400118); //포트루이스 UTC+04:00
	//var Item55 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	//var Item56 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	//var Item57 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	//var Item58 = new cpr.controls.Item(dataManager.getString("Str_All"), 14400);
	var Item54sd = new cpr.controls.Item(dataManager.getString("Str_All"), 16200111); //카불 UTC+04:30
	//var Item60 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000);
	var Item59sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000111); //아슈하바트,타슈켄트 UTC+05:00
	var Item59sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000112); //예카테린부르크 UTC+05:00
	var Item59sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000113); //이슬라마바드,카리치 UTC+05:00
	var Item59sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000114); //키질로르다 UTC+05:00
	//var Item61 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000);
	//var Item62 = new cpr.controls.Item(dataManager.getString("Str_All"), 18000);
	//var Item63 = new cpr.controls.Item(dataManager.getString("Str_All"), 19800);
	var Item60sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 19800111); //스리자야와르데네푸라+05:30
	var Item60sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 19800112); //첸나이,콜카타,뭄바이,뉴델리 UTC+05:30
	//var Item64 = new cpr.controls.Item(dataManager.getString("Str_All"), 19800);
	var Item63sd = new cpr.controls.Item(dataManager.getString("Str_All"), 20700111); //카트만두 UTC+05:45
	var Item65sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 21600111); //다카 UTC+06:00
	var Item65sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 21600112); //아스타나 UTC+06:00
	var Item65sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 21600113); //옴스크 UTC+06:00
	//var Item67 = new cpr.controls.Item(dataManager.getString("Str_All"), 21600); 
	var Item66 = new cpr.controls.Item(dataManager.getString("Str_All"), 23400111); //양곤 UTC+06:30
	var Item68sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200111); //노보시비르스크 UTC+07:00
	var Item68sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200112); //바르나울,고르노알타이스크 UTC+07:00
	var Item68sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200113); //방콕,하노이,자카르타 UTC+07:00
	var Item68sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200114); //크라스노야르스크 UTC+07:00
	var Item68sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200115); //톰스크 UTC+07:00
	var Item68sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200116); //호브드 UTC+07:00
	//var Item70 = new cpr.controls.Item(dataManager.getString("Str_All"), 25200);
	var Item69sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800111); //베이징,충칭,홍콩 특별 행정구,우루무치 UTC+08:00
	var Item69sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800112); //울란바토르 UTC+08:00
	var Item69sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800113); //이르쿠츠크 UTC+08:00
	var Item69sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800114); //콸라룸푸르,싱가포르 UTC+08:00
	var Item69sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800115); //타이베이 UTC+08:00
	var Item69sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800116); //퍼스 UTC+08:00
	var Item71sd = new cpr.controls.Item(dataManager.getString("Str_All"), 31500111); //유클라 UTC+08:45
	//var Item72 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	//var Item73 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	//var Item74 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	//var Item75 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	//var Item76 = new cpr.controls.Item(dataManager.getString("Str_All"), 28800);
	var Item77sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400111); //서울 UTC+09:00
	var Item77sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400112); //야쿠츠크 UTC+09:00
	var Item77sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400113); //오사카,삿포로,도쿄 UTC+09:00
	var Item77sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400114); //치타 UTC+09:00
	var Item77sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400115); //평양 UTC+09:00
	//var Item78 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400);
	//var Item79 = new cpr.controls.Item(dataManager.getString("Str_All"), 32400);
	var Item80sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 34200111); //다윈 UTC+09:30
	var Item80sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 34200112); //애들레이드 UTC+09:30
	//var Item81 = new cpr.controls.Item(dataManager.getString("Str_All"), 34200);
	//var Item82 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	var Item82sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000111); //괌,포트모르즈비 UTC+10:00
	var Item82sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000112); //브리즈번 UTC+10:00
	var Item82sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000113); //블라디보스토크 UTC+10:00
	var Item82sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000114); //캔버라,멜버른,시드니 UTC+10:00
	var Item82sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000115); //호바트 UTC+10:00
	//var Item83 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	//var Item84 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	//var Item85 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	//var Item86 = new cpr.controls.Item(dataManager.getString("Str_All"), 36000);
	//var Item87 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600);
	var Item87sd = new cpr.controls.Item(dataManager.getString("Str_All"), 37800111); //로드하우 섬 UTC+10:30
	//var Item88 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200);
	var Item88sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600111); //노퍽 섬 UTC+11:00
	var Item88sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600112); //마가단 UTC+11:00
	var Item88sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600113); //부건빌 섬 UTC+11:00
	var Item88sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600114); //사할린 UTC+11:00
	var Item88sd5 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600115); //솔로몬제도,뉴칼레도니아 UTC+11:00
	var Item88sd6 = new cpr.controls.Item(dataManager.getString("Str_All"), 39600116); //초쿠르다흐 UTC+11:00
	//var Item89 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200);
	//var Item90 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200);
	var Item91sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200111); //아나다리,페트로파블로프스크-캄차스키 UTC+12:00
	var Item91sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200112); //오클랜드,웰링턴 UTC+12:00
	var Item91sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200113); //피지 UTC+12:00
	var Item91sd4 = new cpr.controls.Item(dataManager.getString("Str_All"), 43200114); //협정 세계시 +12
	var Item92sd = new cpr.controls.Item(dataManager.getString("Str_All"), 49500111); //채텀섬 UTC+12:45
	var Item93sd1 = new cpr.controls.Item(dataManager.getString("Str_All"), 46800111); //누쿠알로파 UTC+13:00
	var Item93sd2 = new cpr.controls.Item(dataManager.getString("Str_All"), 46800112); //사모아 UTC+13:00
	var Item93sd3 = new cpr.controls.Item(dataManager.getString("Str_All"), 46800113); //협정 세계시 +13 
	var Item94sd = new cpr.controls.Item(dataManager.getString("Str_All"), 50400111); //키리티마티 섬 UTC+14:00 
	
	Item0.bind("label").toLanguage("Str_InternationalDateLineWest"); // -12
	//Item1.bind("label").toLanguage("Str_MidwayIsland"); // -11
	Item1sd.bind("label").toLanguage("Str_GMT+11"); // -11
	//Item2.bind("label").toLanguage("Str_Hawaii"); //-10
	Item2sd1.bind("label").toLanguage("Str_AleutianIslands"); //-10
	Item2sd2.bind("label").toLanguage("Str_HawaiiSD"); //-10
	Item2sd3.bind("label").toLanguage("Str_Marquesas"); //-10:30
	//Item3.bind("label").toLanguage("Str_Alaska"); // -9
	Item3sd1.bind("label").toLanguage("Str_AlaskaSD"); // -9
	Item3sd2.bind("label").toLanguage("Str_GMT+9"); // -9
	//Item4.bind("label").toLanguage("Str_PacificTime(US&Canada)"); // -8
	Item4sd1.bind("label").toLanguage("Str_BajaCaliforniaSD"); // -8
	Item4sd2.bind("label").toLanguage("Str_PacificTime(US&Canada)SD1"); // -8
	Item4sd3.bind("label").toLanguage("Str_GMT+8"); // -8
	//Item6.bind("label").toLanguage("Str_MountainTime(US&Canada)"); // -7
	Item6sd1.bind("label").toLanguage("Str_MountainTime(US&Canada)SD1"); // -7
	Item6sd2.bind("label").toLanguage("Str_Arizona"); // -7
	Item6sd3.bind("label").toLanguage("Str_Yukon"); // -7
	Item6sd4.bind("label").toLanguage("Str_Chihuahua,La_Paz,Mazatlan"); // -7
	//Item9.bind("label").toLanguage("Str_CentralTime(US&Canada)"); //-6
	Item9sd1.bind("label").toLanguage("Str_Guadalajara,MexicoCity,Monterrey"); //-6
	Item9sd2.bind("label").toLanguage("Str_Saskatchewan"); //-6
	Item9sd3.bind("label").toLanguage("Str_EsaterIsland"); //-6
	Item9sd4.bind("label").toLanguage("Str_CentralTime"); //-6
	Item9sd5.bind("label").toLanguage("Str_CentralAmerica"); //-6
	//Item13.bind("label").toLanguage("Str_EasternTime(US&Canada)"); //-5
	Item13sd1.bind("label").toLanguage("Str_EasternTime"); //-5
	Item13sd2.bind("label").toLanguage("Str_Bogota,Lima,Quito,RioBranco"); //-5
	Item13sd3.bind("label").toLanguage("Str_Haiti"); //-5
	Item13sd4.bind("label").toLanguage("Str_Indiana"); //-5
	Item13sd5.bind("label").toLanguage("Str_Chetumal"); //-5
	Item13sd6.bind("label").toLanguage("Str_TurksAndCaicos"); //-5
	Item13sd7.bind("label").toLanguage("Str_Havana"); //-5
	Item16sd1.bind("label").toLanguage("Str_AtlanticTime"); // -4:30
	Item16sd2.bind("label").toLanguage("Str_Santiago"); // -4
	Item16sd3.bind("label").toLanguage("Str_Asuncion"); // -4
	Item16sd4.bind("label").toLanguage("Str_GeorgeTown,LaPaz,Manos,SanJuan"); // -4
	Item16sd5.bind("label").toLanguage("Str_Caracas"); // -4
	Item16sd6.bind("label").toLanguage("Str_Cuiabah"); // -4
	//Item17.bind("label").toLanguage("Str_AtlanticTime(Canada)"); // -4
	Item17sd.bind("label").toLanguage("Str_NewfoundlandSD"); // -3:30
	//Item22.bind("label").toLanguage("Str_Newfoundland"); //-3:30
	Item22sd1.bind("label").toLanguage("Str_Greenland"); //-3
	Item22sd2.bind("label").toLanguage("Str_Montevideo"); //-3
	Item22sd3.bind("label").toLanguage("Str_BuenosAires"); //-3
	Item22sd4.bind("label").toLanguage("Str_Brasilia"); //-3
	Item22sd5.bind("label").toLanguage("Str_Salvador"); //-3
	Item22sd6.bind("label").toLanguage("Str_SaintPierreAndMiquelon"); //-3
	Item22sd7.bind("label").toLanguage("Str_Araguaina"); //-3
	Item22sd8.bind("label").toLanguage("Str_cayenne"); //-3
	Item22sd9.bind("label").toLanguage("Str_PuntaArenas"); //-3
	//Item23.bind("label").toLanguage("Str_Brasilia"); // -3
	Item23sd.bind("label").toLanguage("Str_GMT+02"); // -2
	Item28sd1.bind("label").toLanguage("Str_Azores"); //-1
	Item28sd2.bind("label").toLanguage("Str_CapeVerde"); //-1
	Item29sd1.bind("label").toLanguage("Str_UTC"); //0
	Item29sd2.bind("label").toLanguage("Str_Dublin"); //0
	Item29sd3.bind("label").toLanguage("Str_Monrovia"); //0
	Item29sd4.bind("label").toLanguage("Str_SaoTome"); //0
	//Item31.bind("label").toLanguage("Str_Casablanca"); //0
	Item31sd1.bind("label").toLanguage("Str_Casablanca"); //1
	Item31sd2.bind("label").toLanguage("Str_Belgrade"); //1
	Item31sd3.bind("label").toLanguage("Str_Brussels"); //1
	Item31sd4.bind("label").toLanguage("Str_Sarajevo"); //1
	Item31sd5.bind("label").toLanguage("Str_WestCentralAfrica"); //1
	Item31sd6.bind("label").toLanguage("Str_Amsterdam"); //1
	//Item35.bind("label").toLanguage("Str_Amsterdam"); //1
	Item35sd1.bind("label").toLanguage("Str_Hebron"); //2
	Item35sd2.bind("label").toLanguage("Str_Damascus"); //2
	Item35sd3.bind("label").toLanguage("Str_Beirut"); //2
	Item35sd4.bind("label").toLanguage("Str_windhoek"); //2
	Item35sd5.bind("label").toLanguage("Str_Athens"); //2
	Item35sd6.bind("label").toLanguage("Str_Amman"); //2
	Item35sd7.bind("label").toLanguage("Str_Jerusalem"); //2
	Item35sd8.bind("label").toLanguage("Str_Juba"); //2
	Item35sd9.bind("label").toLanguage("Str_Cairo"); //2
	Item35sd10.bind("label").toLanguage("Str_Kaliningrad"); //2
	Item35sd11.bind("label").toLanguage("Str_Chisinau"); //2
	Item35sd12.bind("label").toLanguage("Str_Tripoli"); //2
	Item35sd13.bind("label").toLanguage("Str_Harare"); //2
	Item35sd14.bind("label").toLanguage("Str_Khartoum"); //2
	Item35sd15.bind("label").toLanguage("Str_Helsinki"); //2
	//Item40.bind("label").toLanguage("Str_Amman"); //2
	Item40sd1.bind("label").toLanguage("Str_Nairobi"); //3
	Item40sd2.bind("label").toLanguage("Str_Moscow"); //3
	Item40sd3.bind("label").toLanguage("Str_Minsk"); //3
	Item40sd4.bind("label").toLanguage("Str_Baghdad"); //3
	Item40sd5.bind("label").toLanguage("Str_Volgograd"); //3
	Item40sd6.bind("label").toLanguage("Str_Istanbul"); //3
	Item40sd7.bind("label").toLanguage("Str_Kuwait"); //3
	//Item49.bind("label").toLanguage("Str_Baghdad"); //3
	Item49sd.bind("label").toLanguage("Str_TehranSD"); //3:30
	//Item53.bind("label").toLanguage("Str_Tehran"); //3:30
	Item53sd1.bind("label").toLanguage("Str_Baku"); //4
	Item53sd2.bind("label").toLanguage("Str_Saratov"); //4
	Item53sd3.bind("label").toLanguage("Str_Muscat"); //4
	Item53sd4.bind("label").toLanguage("Str_Astrakhan"); //4
	Item53sd5.bind("label").toLanguage("Str_Yerevan"); //4
	Item53sd6.bind("label").toLanguage("Str_Samara"); //4
	Item53sd7.bind("label").toLanguage("Str_Tbilisi"); //4
	Item53sd8.bind("label").toLanguage("Str_PortLouis"); //4
	//Item54.bind("label").toLanguage("Str_AbuDhabi"); //4
	Item54sd.bind("label").toLanguage("Str_Kabul"); //4:30
	Item59sd1.bind("label").toLanguage("Str_Tashkent"); //5
	Item59sd2.bind("label").toLanguage("Str_Yekaterinburg"); //5
	Item59sd3.bind("label").toLanguage("Str_Karachi"); //5
	Item59sd4.bind("label").toLanguage("Str_Qyzylorda"); //5
	//Item60.bind("label").toLanguage("Str_Ekaterinburg"); //5
	Item60sd1.bind("label").toLanguage("Str_SriJaya"); //5:30
	Item60sd2.bind("label").toLanguage("Str_Chennai"); //5:30
	//Item63.bind("label").toLanguage("Str_Chennai"); //5:30
	Item63sd.bind("label").toLanguage("Str_Kathmandu"); //5:45
	Item65sd1.bind("label").toLanguage("Str_Dhaka"); //6
	Item65sd2.bind("label").toLanguage("Str_Astana"); //6
	Item65sd3.bind("label").toLanguage("Str_Omsk"); //6
	Item66.bind("label").toLanguage("Str_Yangon"); //6:30
	Item68sd1.bind("label").toLanguage("Str_Novosibirsk"); //7
	Item68sd2.bind("label").toLanguage("Str_Barnaul"); //7
	Item68sd3.bind("label").toLanguage("Str_Bangkok"); //7
	Item68sd4.bind("label").toLanguage("Str_Krasnoyarsk"); //7
	Item68sd5.bind("label").toLanguage("Str_Tomsk"); //7
	Item68sd6.bind("label").toLanguage("Str_Hovd"); //7
	Item69sd1.bind("label").toLanguage("Str_Shanghai"); //8
	Item69sd2.bind("label").toLanguage("Str_Ulaanbaatar"); //8
	Item69sd3.bind("label").toLanguage("Str_Irkutsk"); //8
	Item69sd4.bind("label").toLanguage("Str_Singapore"); //8
	Item69sd5.bind("label").toLanguage("Str_Taipei"); //8
	Item69sd6.bind("label").toLanguage("Str_Perth"); //8
	Item71sd.bind("label").toLanguage("Str_Eucla"); //8:45
	Item77sd1.bind("label").toLanguage("Str_Seoul"); //9
	Item77sd2.bind("label").toLanguage("Str_Yakutsk"); //9 
	Item77sd3.bind("label").toLanguage("Str_Tokyo"); //9 
	Item77sd4.bind("label").toLanguage("Str_Chita"); //9 
	Item77sd5.bind("label").toLanguage("Str_Pyongyang"); //9  
	Item80sd1.bind("label").toLanguage("Str_Darwin"); //9:30
	Item80sd2.bind("label").toLanguage("Str_Adelaide"); //9:30
	//Item82.bind("label").toLanguage("Str_Brisbane"); //10 
	Item82sd1.bind("label").toLanguage("Str_Guam"); //10
	Item82sd2.bind("label").toLanguage("Str_Brisbane"); //10
	Item82sd3.bind("label").toLanguage("Str_Vladivostok"); //10
	Item82sd4.bind("label").toLanguage("Str_Canberra"); //10
	Item82sd5.bind("label").toLanguage("Str_Hobart"); //10 
	//Item87.bind("label").toLanguage("Str_Magadan"); //11
	Item87sd.bind("label").toLanguage("Str_LordHowe"); //10:30
	//Item88.bind("label").toLanguage("Str_Auckland"); //12
	Item88sd1.bind("label").toLanguage("Str_Norfolk"); //11
	Item88sd2.bind("label").toLanguage("Str_Magadan"); //11
	Item88sd3.bind("label").toLanguage("Str_Bougainville"); //11
	Item88sd4.bind("label").toLanguage("Str_Sakhalin"); //11
	Item88sd5.bind("label").toLanguage("Str_Guadalcanal"); //11
	Item88sd6.bind("label").toLanguage("Str_Chokurdakh"); //11
	Item91sd1.bind("label").toLanguage("Str_Anadyr"); //12
	Item91sd2.bind("label").toLanguage("Str_Auckland"); //12
	Item91sd3.bind("label").toLanguage("Str_Fiji"); //12
	Item91sd4.bind("label").toLanguage("Str_GMT-12"); //12
	Item92sd.bind("label").toLanguage("Str_Chatham"); //12:45
	Item93sd1.bind("label").toLanguage("Str_Tongatapu"); //13
	Item93sd2.bind("label").toLanguage("Str_Apia"); //13
	Item93sd3.bind("label").toLanguage("Str_GMT-13"); //13
	Item94sd.bind("label").toLanguage("Str_Kiritimati"); //14
	Cmb_utcIndex.addItem(Item0);
	//Cmb_utcIndex.addItem(Item1);
	Cmb_utcIndex.addItem(Item1sd);
	//Cmb_utcIndex.addItem(Item2);
	Cmb_utcIndex.addItem(Item2sd1);
	Cmb_utcIndex.addItem(Item2sd2);
	Cmb_utcIndex.addItem(Item2sd3);
	//Cmb_utcIndex.addItem(Item3);
	Cmb_utcIndex.addItem(Item3sd1);
	Cmb_utcIndex.addItem(Item3sd2);
	//Cmb_utcIndex.addItem(Item4);
	Cmb_utcIndex.addItem(Item4sd1);
	Cmb_utcIndex.addItem(Item4sd2);
	Cmb_utcIndex.addItem(Item4sd3);
	//Cmb_utcIndex.addItem(Item6);
	Cmb_utcIndex.addItem(Item6sd1);
	Cmb_utcIndex.addItem(Item6sd2);
	Cmb_utcIndex.addItem(Item6sd3);
	Cmb_utcIndex.addItem(Item6sd4);
	//Cmb_utcIndex.addItem(Item9);
	Cmb_utcIndex.addItem(Item9sd1);
	Cmb_utcIndex.addItem(Item9sd2);
	Cmb_utcIndex.addItem(Item9sd3);
	Cmb_utcIndex.addItem(Item9sd4);
	Cmb_utcIndex.addItem(Item9sd5);
	//Cmb_utcIndex.addItem(Item13);
	Cmb_utcIndex.addItem(Item13sd1);
	Cmb_utcIndex.addItem(Item13sd2);
	Cmb_utcIndex.addItem(Item13sd3);
	Cmb_utcIndex.addItem(Item13sd4);
	Cmb_utcIndex.addItem(Item13sd5);
	Cmb_utcIndex.addItem(Item13sd6);
	Cmb_utcIndex.addItem(Item13sd7);
	Cmb_utcIndex.addItem(Item16sd1);
	Cmb_utcIndex.addItem(Item16sd2);
	Cmb_utcIndex.addItem(Item16sd3);
	Cmb_utcIndex.addItem(Item16sd4);
	Cmb_utcIndex.addItem(Item16sd5);
	Cmb_utcIndex.addItem(Item16sd6);
	//Cmb_utcIndex.addItem(Item17);
	Cmb_utcIndex.addItem(Item17sd);
	//Cmb_utcIndex.addItem(Item22);
	Cmb_utcIndex.addItem(Item22sd1);
	Cmb_utcIndex.addItem(Item22sd2);
	Cmb_utcIndex.addItem(Item22sd3);
	Cmb_utcIndex.addItem(Item22sd4);
	Cmb_utcIndex.addItem(Item22sd5);
	Cmb_utcIndex.addItem(Item22sd6);
	Cmb_utcIndex.addItem(Item22sd7);
	Cmb_utcIndex.addItem(Item22sd8);
	Cmb_utcIndex.addItem(Item22sd9);
	//Cmb_utcIndex.addItem(Item23);
	Cmb_utcIndex.addItem(Item23sd);
	Cmb_utcIndex.addItem(Item28sd1);
	Cmb_utcIndex.addItem(Item28sd2);
	Cmb_utcIndex.addItem(Item29sd1);
	Cmb_utcIndex.addItem(Item29sd2);
	Cmb_utcIndex.addItem(Item29sd3);
	Cmb_utcIndex.addItem(Item29sd4);
	//Cmb_utcIndex.addItem(Item31);
	Cmb_utcIndex.addItem(Item31sd1);
	Cmb_utcIndex.addItem(Item31sd2);
	Cmb_utcIndex.addItem(Item31sd3);
	Cmb_utcIndex.addItem(Item31sd4);
	Cmb_utcIndex.addItem(Item31sd5);
	Cmb_utcIndex.addItem(Item31sd6);
	//Cmb_utcIndex.addItem(Item35);
	Cmb_utcIndex.addItem(Item35sd1);
	Cmb_utcIndex.addItem(Item35sd2);
	Cmb_utcIndex.addItem(Item35sd3);
	Cmb_utcIndex.addItem(Item35sd4);
	Cmb_utcIndex.addItem(Item35sd5);
	Cmb_utcIndex.addItem(Item35sd6);
	Cmb_utcIndex.addItem(Item35sd7);
	Cmb_utcIndex.addItem(Item35sd8);
	Cmb_utcIndex.addItem(Item35sd9);
	Cmb_utcIndex.addItem(Item35sd10);
	Cmb_utcIndex.addItem(Item35sd11);
	Cmb_utcIndex.addItem(Item35sd12);
	Cmb_utcIndex.addItem(Item35sd13);
	Cmb_utcIndex.addItem(Item35sd14);
	Cmb_utcIndex.addItem(Item35sd15);
	//Cmb_utcIndex.addItem(Item40);
	Cmb_utcIndex.addItem(Item40sd1);
	Cmb_utcIndex.addItem(Item40sd2);
	Cmb_utcIndex.addItem(Item40sd3);
	Cmb_utcIndex.addItem(Item40sd4);
	Cmb_utcIndex.addItem(Item40sd5);
	Cmb_utcIndex.addItem(Item40sd6);
	Cmb_utcIndex.addItem(Item40sd7);
	//Cmb_utcIndex.addItem(Item49);
	Cmb_utcIndex.addItem(Item49sd);
	//Cmb_utcIndex.addItem(Item53);
	Cmb_utcIndex.addItem(Item53sd1);
	Cmb_utcIndex.addItem(Item53sd2);
	Cmb_utcIndex.addItem(Item53sd3);
	Cmb_utcIndex.addItem(Item53sd4);
	Cmb_utcIndex.addItem(Item53sd5);
	Cmb_utcIndex.addItem(Item53sd6);
	Cmb_utcIndex.addItem(Item53sd7);
	Cmb_utcIndex.addItem(Item53sd8);
	//Cmb_utcIndex.addItem(Item54);
	Cmb_utcIndex.addItem(Item54sd);
	Cmb_utcIndex.addItem(Item59sd1);
	Cmb_utcIndex.addItem(Item59sd2);
	Cmb_utcIndex.addItem(Item59sd3);
	Cmb_utcIndex.addItem(Item59sd4);
	//Cmb_utcIndex.addItem(Item60);
	Cmb_utcIndex.addItem(Item60sd1);
	Cmb_utcIndex.addItem(Item60sd2);
	//Cmb_utcIndex.addItem(Item63);
	Cmb_utcIndex.addItem(Item63sd);
	Cmb_utcIndex.addItem(Item65sd1);
	Cmb_utcIndex.addItem(Item65sd2);
	Cmb_utcIndex.addItem(Item65sd3);
	Cmb_utcIndex.addItem(Item66);
	Cmb_utcIndex.addItem(Item68sd1);
	Cmb_utcIndex.addItem(Item68sd2);
	Cmb_utcIndex.addItem(Item68sd3);
	Cmb_utcIndex.addItem(Item68sd4);
	Cmb_utcIndex.addItem(Item68sd5);
	Cmb_utcIndex.addItem(Item68sd6);
	Cmb_utcIndex.addItem(Item69sd1);
	Cmb_utcIndex.addItem(Item69sd2);
	Cmb_utcIndex.addItem(Item69sd3);
	Cmb_utcIndex.addItem(Item69sd4);
	Cmb_utcIndex.addItem(Item69sd5);
	Cmb_utcIndex.addItem(Item69sd6);
	Cmb_utcIndex.addItem(Item71sd);
	Cmb_utcIndex.addItem(Item77sd1);
	Cmb_utcIndex.addItem(Item77sd2);
	Cmb_utcIndex.addItem(Item77sd3);
	Cmb_utcIndex.addItem(Item77sd4);
	Cmb_utcIndex.addItem(Item77sd5);
	Cmb_utcIndex.addItem(Item80sd1);
	Cmb_utcIndex.addItem(Item80sd2);
	//Cmb_utcIndex.addItem(Item82);
	Cmb_utcIndex.addItem(Item82sd1);
	Cmb_utcIndex.addItem(Item82sd2);
	Cmb_utcIndex.addItem(Item82sd3);
	Cmb_utcIndex.addItem(Item82sd4);
	Cmb_utcIndex.addItem(Item82sd5);
	//Cmb_utcIndex.addItem(Item87);
	Cmb_utcIndex.addItem(Item87sd);
	//Cmb_utcIndex.addItem(Item88);
	Cmb_utcIndex.addItem(Item88sd1);
	Cmb_utcIndex.addItem(Item88sd2);
	Cmb_utcIndex.addItem(Item88sd3);
	Cmb_utcIndex.addItem(Item88sd4);
	Cmb_utcIndex.addItem(Item88sd5);
	Cmb_utcIndex.addItem(Item88sd6);
	Cmb_utcIndex.addItem(Item91sd1);
	Cmb_utcIndex.addItem(Item91sd2);
	Cmb_utcIndex.addItem(Item91sd3);
	Cmb_utcIndex.addItem(Item91sd4);
	Cmb_utcIndex.addItem(Item92sd);
	Cmb_utcIndex.addItem(Item93sd1);
	Cmb_utcIndex.addItem(Item93sd2);
	Cmb_utcIndex.addItem(Item93sd3);
	Cmb_utcIndex.addItem(Item94sd);
	Cmb_utcIndex.redraw();
	
}

function onBodyLoad( /* cpr.events.CEvent */ e) {
	
	comLib = createComUtil(app);
	dataManager = getDataManager();
	usint_version = dataManager.getSystemVersion();
	NSH_DEV_CODE = dataManager.getENABLE_INNODEP_VMS();
	ENABLE_MCP040 = dataManager.getENABLE_MCP040();
	
	SvrSendFlag = 0; // 단말기 설정 정보 저장 요청 Flag
	OptDataInit();
	
	UTCDataInit();
	
	var hostAppIns = app.getHostAppInstance();
	if (hostAppIns) {
		var initValue = app.getHost().initValue;
		
		var requestData = app.lookup("sms_get_terminal_info");
		var terminalID = initValue["TerminalID"];
		
		requestData.action = requestData.action + "/" + terminalID;
		requestData.setParameters("apbflag", true);
		requestData.setParameters("imageflag", false);
		console.log("send Submission :" + requestData.action);
		requestData.send();
	}
	
	if (dataManager.getOemVersion() == OEM_KANGWONLAND) {
		//스크립트 수정 
		app.lookup("TMVBA_opbDiscription").value = "외부전송 코드"
		
		app.lookup("TMVBA_cmbfunctionType").addItem(new cpr.controls.Item("RMS_TYPE", 98));
		app.lookup("TMVBA_cmbfunctionType").addItem(new cpr.controls.Item("CMS_TYPE", 99));
	} else if (dataManager.getOemVersion() == OEM_HYUNDAI_EC) {
		app.lookup("TMVBA_btnHIoSRegist").visible = true;// 버튼 활성화
	} else if (dataManager.getOemVersion() == OEM_3D_NORMAL ) {
		app.lookup("TMVBA_opbDiscription").bind("value").toLanguage("Str_Location");
		app.lookup("TMVBA_opbDiscription").redraw();
	} else {
		app.lookup("TMVBA_opbDiscription").bind("value").toLanguage("Str_Description");
	}
	var getTimezoneList = dataManager.getTimezoneSet();
	var dsTimezoneTinyList = app.lookup("TimezoneTinyList");
	getTimezoneList.copyToDataSet(dsTimezoneTinyList);
	
	if (dataManager.getOemVersion() == OEM_ARMY_HQ || dataManager.getOemVersion() == OEM_ROKMCH) {
		app.lookup("cbxRegistTerminal").visible = true;
		app.lookup("TMVBA_opbRegistTerminal").visible = true;
		// 육군본부는 이름을 장비 위치로 사용 - pse
		app.lookup("TMVBA_opbName").unbind("value");
		app.lookup("TMVBA_opbName").value = "장비 위치";
		
	}
	
	var groupList;
	if (isLoginMaster()){
		groupList = dataManager.getGroup();
	}else  {
		groupList = dataManager.getLoginUserGroups();
	}
	
	var cmbGroup = app.lookup("TMVBA_cmbGroup");
	cmbGroup.setItemSet(groupList, {
		label: "Name",
		value: "GroupID"
	});
	cmbGroup.addItem(new cpr.controls.Item("------",0));
	//cmbGroup.selectItemByLabel(getLoginUserGroupCode());
//	if(!isSuperGroupAdmin()) {
	if(!isLoginUserPrivAdmin()) {	
		cmbGroup.readOnly = true;
		cmbGroup.hideButton = true;
	}
}

exports.getTerminalID = function() {
	var terminalID = app.lookup("TerminalInfo").getValue("ID");
	return terminalID;
}

// 슬림단말기 타입을 가져오기 위한 작업  - 220506 otk
exports.getTerminalModel = function() {
	var terminalModel = app.lookup("TerminalInfo").getValue("Type");
	return terminalModel;
}

/*
 * 단말기 옵션 상태 체크
 */
exports.getTerminalOptStatus = function(valName) {
	var tOf = app.lookup("terminalOptflag").getValue(valName);
	return tOf;
}

exports.initTerminalOptStatus = function(valName) {
	var tOf = app.lookup("terminalOptflag").setValue(valName, 1);
	var tOfRes = app.lookup("terminalOptflag").getValue(valName);
	return tOfRes;
}

exports.modifyTerminalOptStatus = function(valName) {
	var tOf = app.lookup("terminalOptflag").setValue(valName, 2);
	var tOfRes = app.lookup("terminalOptflag").getValue(valName);
	return tOfRes;
}

//---------------------------------------------------------------------------> basic opt
exports.getBasicOption = function() {
	var BasicOptionData = app.lookup("BasicOptionInfo");
	return BasicOptionData;
}

exports.setBasicOption = function(bOptData) {
	var BasicOptionData = app.lookup("BasicOptionInfo");
	var result = bOptData.copyToDataMap(BasicOptionData);
	return result;
}

exports.modifyBasicOption = function(modiBoptinfo) {
	var dsApbInfo = app.lookup("TerminalApbAreaInfo");
	if (modiBoptinfo[0] == "PassbackLevel" && modiBoptinfo[1] == 0) {
		app.lookup("TMVBA_cmbSoftPassback").enabled = false;
	} else {
		if (dsApbInfo.getValue("AreaIn") == 0 && dsApbInfo.getValue("AreaOut") == 0) {
			app.lookup("TMVBA_cmbSoftPassback").enabled = false;
		} else {
			app.lookup("TMVBA_cmbSoftPassback").enabled = true;
		}
	}
	
	var bOi = app.lookup("BasicOptionInfo");
	var beforeValue = bOi.getValue(modiBoptinfo[0]);
	
	if (beforeValue == modiBoptinfo[1]) {
		return -1;
	} else {
		bOi.setValue(modiBoptinfo[0], modiBoptinfo[1]);
		app.lookup("terminalOptflag").setValue("BasicOpt", 2);
	}
	
	return bOi;
}
//<---------------------------------------------------------------------------- basic opt End
//-----------------------------------------------------------------------------> Network opt
exports.getNetworkOption = function() {
	var NetWorkOptionData = app.lookup("NetWorkOptionInfo");
	return NetWorkOptionData;
}

exports.setNetWorkOption = function(nOptData) {
	var NetWorkOptionData = app.lookup("NetWorkOptionInfo");
	var result = nOptData.copyToDataMap(NetWorkOptionData);
	console.log(">> Network Option:" + NetWorkOptionData.getDatas());
	return result;
}

exports.modifyNetWorkOption = function(modiNoptinfo) {
	var nOi = app.lookup("NetWorkOptionInfo");
	var beforeValue = nOi.getValue(modiNoptinfo[0]);
	if (beforeValue == modiNoptinfo[1]) {
		return -1;
	} else {
		nOi.setValue(modiNoptinfo[0], modiNoptinfo[1]);
		app.lookup("terminalOptflag").setValue("NetworkOpt", 2);
	}
	return nOi;
}
//<------------------------------------------------------------------------------- Network opt End
//--------------------------------------------------------------------------------> Holiday opt
exports.getHolidayOption = function() {
	var HolidayOptionData = app.lookup("HolidayOptionList");
	return HolidayOptionData;
}

exports.getTimezoneHolidayOption = function() {
	var TimezoneHolidaysData = app.lookup("TimezoneHolidays");
	return TimezoneHolidaysData;
}

exports.setHolidayOption = function(hOptData) {
	var HolidayOptionData = app.lookup("HolidayOptionList");
	HolidayOptionData.clear();
	var TimezoneHolidaysData = app.lookup("TimezoneHolidays");
	
	TimezoneHolidaysData.clear();
	var result = hOptData[0].copyToDataSet(HolidayOptionData);
	var result2 = hOptData[1].copyToDataSet(TimezoneHolidaysData);
	return result;
}
//<--------------------------------------------------------------------------------- Holiday opt End
//----------------------------------------------------------------------------------> Alarm opt
exports.getAlarmOption = function() {
	var AlarmOptionData = app.lookup("AlarmOptionList");
	return AlarmOptionData;
}

exports.setAlarmOption = function(nOptData) {
	var AlarmOptionData = app.lookup("AlarmOptionList");
	AlarmOptionData.clear();
	var result = nOptData.copyToDataSet(AlarmOptionData);
	return result;
}
//<---------------------------------------------------------------------------------- Alarm opt End
//----------------------------------------------------------------------------------> MealTime opt

exports.getMealOption = function() {
	var MealOptionData = app.lookup("MealOptValue");
	return MealOptionData;
}

exports.setMealOption = function(bOptData) {
	var MealOptionData = app.lookup("MealOptValue");
	var result = bOptData.copyToDataMap(MealOptionData);
	return result;
}

exports.modifyMealOption = function(modiMoptinfo) {
	var mOi = app.lookup("MealOptValue");
	var beforeValue = mOi.getValue(modiMoptinfo[0]);
	if (beforeValue == modiMoptinfo[1]) {
		return -1;
	} else {
		mOi.setValue(modiMoptinfo[0], modiMoptinfo[1]);
		app.lookup("terminalOptflag").setValue("MealOpt", 2);
	}
	return mOi;
}
//-----------------------------------------------------------------------------------> Voip opt
exports.getVoipOption = function() {
	var VoipOptionData = app.lookup("VoipOptValue");
	return VoipOptionData;
}

exports.setVoipOption = function(bOptData) {
	var VoipOptionData = app.lookup("VoipOptValue");
	var result = bOptData.copyToDataMap(VoipOptionData);
	return result;
}

exports.modifyVoipOption = function(modiVoptinfo) {
	var vOi = app.lookup("VoipOptValue");
	var beforeValue = vOi.getValue(modiVoptinfo[0]);
	if (beforeValue == modiVoptinfo[1]) {
		return -1;
	} else {
		vOi.setValue(modiVoptinfo[0], modiVoptinfo[1]);
		app.lookup("terminalOptflag").setValue("VoipOpt", 2);
	}
	return vOi;
}
//<------------------------------------------------------------------------------------ Voip opt End

exports.parentShowLoadMask = function(strTitle) {
	comLib.showLoadMask("", dataManager.getString(strTitle), "", 0);
	return;
}

exports.parentHideLoadMask = function(dummy) {
	comLib.hideLoadMask();
	return;
}

function changePage(selectedButton) {
	
	var emb = app.lookup("TMVBA_INN_embpage");
	if (selectedButton == 39) {
		cpr.core.App.load("app/main/terminals/optionVirdi/terminalVOptionDoNotFunc" + "?" + usint_version, function(loadedApp) {
			if (!loadedApp) {
				return;
			}
			emb.app = loadedApp;
			emb.redraw();
		});
		return;
	}
	var grpButtons = app.lookup("TMVBA_IN_grpButtons");
	var buttons = grpButtons.getChildren();
	var url = selectedButton.userattr("src") + "?" + usint_version;
	
	console.log(url);
	emb.app = null;
	cpr.core.App.load(url, function(loadedApp) {
		if (!loadedApp) {
			return;
		}
		emb.app = loadedApp;
		emb.redraw();
		
		for (var i = 0; i < buttons.length; i++) {
			if (selectedButton == buttons[i]) {
				buttons[i].style.css("backgroundColor", "#E3E0DF");
				buttons[i].style.css("border-bottom", "2px black solid");
				buttons[i].style.css("color", "black");
			} else {
				buttons[i].style.removeStyle("backgroundColor");
				buttons[i].style.removeStyle("border-bottom");
				buttons[i].style.removeStyle("color");
			}
		}
		
	});
}

function onTMVBA_IN_grpButtonsClick( /* cpr.events.CMouseEvent */ e) {
	var grpButtons = e.control;
	changePage(grpButtons);
}

function onSms_get_terminal_infoSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var ResultCode = app.lookup("Result").getValue("ResultCode");
	if (ResultCode == 0) {
		var TerminalInfo = app.lookup("TerminalInfo");
		var Id = TerminalInfo.getValue("ID");
		app.lookup("TMVBA_ipbTerminalID").value = Id;
		
		var Name = TerminalInfo.getValue("Name");
		app.lookup("TMVBA_ipbName").value = Name;
		
		var Type = TerminalInfo.getValue("Type");
		var strType = getTerminalModelString(Type);
		app.lookup("TMVBA_cmbType").value = strType;
		
		var RegisterFlag = TerminalInfo.getValue("RegisterFlag");
		app.lookup("cbxRegistTerminal").value = RegisterFlag;
		
		//단말기 사진 이노뎁 버전용 (이미지 변경)
		if (dataManager.getOemVersion() == OEM_INNODEP_NORMAL) {
			var terminalImage = app.lookup("TMVBA_imgTerminaPicture");
			var srcPath = getTerminalModelImageSrc(Type);
			if (srcPath != undefined && srcPath.length > 0) {
				terminalImage.style.css({
					"background-repeat": "no-repeat",
					"background-color": "rgba(255,255,255,0)",
					"background-position": "center",
					"background-image": "url(" + srcPath + ")",
					"background-size": "contain",
					"font-weight": "bolder",
					"color": "black"
				});
			} else {
				terminalImage.style.css({
					"background-repeat": "no-repeat",
					"background-color": "rgba(255,255,255,0)",
					"background-position": "center",
					"background-image": "url(../../../../theme/images/common/Innodep_black_img_180.png)",
					"background-size": "contain",
					"font-weight": "bolder",
					"color": "black"
				});
			
		}
		// 단말기 사진 
		} else {
		var terminalImage = app.lookup("TMVBA_imgTerminaPicture");
		var srcPath = getTerminalModelImageSrc(Type);
		if (srcPath != undefined && srcPath.length > 0) {
			terminalImage.style.css({
				"background-repeat": "no-repeat",
				"background-color": "rgba(255,255,255,0)",
				"background-position": "center",
				"background-image": "url(" + srcPath + ")",
				"background-size": "contain",
				"font-weight": "bolder",
				"color": "black"
			});
		} else {
			terminalImage.style.css({
				"background-repeat": "no-repeat",
				"background-color": "rgba(255,255,255,0)",
				"background-position": "center",
				"background-image": "url(../../../../theme/images/common/common_black_img_180.png)",
				"background-size": "contain",
				"font-weight": "bolder",
				"color": "black"
			});
			
		}
			
	}
		
		var dsApbInfo = app.lookup("TerminalApbAreaInfo");
		
		if (dsApbInfo.getValue("AreaIn") == 0 && dsApbInfo.getValue("AreaOut") == 0) {
			app.lookup("TMVBA_cmbSoftPassback").enabled = false;
		} else {
			app.lookup("TMVBA_cmbSoftPassback").enabled = true;
		}
	} else {
		
	}
	
	var getType = app.lookup("TerminalInfo").getValue("Type");
	
	if (getType == 35 || getType == 30) {
		app.lookup("TMVBA_btnVoip").visible = true;
	} else {
		app.lookup("TMVBA_btnVoip").visible = false;
	}
	
	if (getType == 39) {
		app.lookup("TMVBA_IN_grpButtons").enabled = false;
		changePage(39);
	}
	
	app.lookup("grpTerminalInfo").redraw();
	
	if (ENABLE_MCP040 == 1) {
		var sms_get_mcp_list = app.lookup("sms_get_mcp_list");
		sms_get_mcp_list.send();
	}
	
	// 타임존 코드 추가.
	//terminal_custom_kwl 데이터 가져오기
	
}

function onSms_get_terminal_infoSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", -1);
}

function onSms_get_terminal_infoSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", -2);
}

function onTMVBA_ValueChange( /* cpr.events.CValueChangeEvent */ e) {
	var tMVBA_Des_ipb = e.control;
	var intertData = tMVBA_Des_ipb.value;
	SvrSendFlag = 1;
	
	if (dataManager.getOemVersion() == OEM_KANGWONLAND) {
		if (tMVBA_Des_ipb.value == 0) {
			app.lookup("TMVBA_Des_ipb").enabled = false; //비활성화
			// 지운다
			app.lookup("TMVBA_Des_ipb").value = "";
		} else {
			app.lookup("TMVBA_Des_ipb").enabled = true; //활성화
			
		}
		
	}
	
	console.log("cmb_utcIndex Value:" + app.lookup("cmb_utcIndex").value);
}

function onTMVBA_SaveClick( /* cpr.events.CMouseEvent */ e) {
	var TerminalApbAreaInfo = app.lookup("TerminalApbAreaInfo");
	TerminalApbAreaInfo.setValue("ID", app.lookup("TMVBA_ipbTerminalID").value);
	comLib.showLoadMask("", dataManager.getString("Str_TerminalSave"), "", 0);
	var tMVBA_Save = e.control;
	if (SvrSendFlag == 1) {
		
		var requestData = app.lookup("sms_put_terminal_info");
		var terminalID = app.lookup("TerminalInfo").getValue("ID");
		requestData.action = "/v1/terminals/" + terminalID;
		requestData.send();
	} else {
		
		if (ENABLE_MCP040 == 1) {
			
			var cmbMcpReaderIndex = app.lookup("cmbMcpReaderIndex");
			var cmbMcpTerminalID = app.lookup("cmbMcpTerminalID");
			
			var ConnMcpInfo = app.lookup("ConnMcpInfo");
			ConnMcpInfo.setValue("CurMcpTerminalID", cmbMcpTerminalID.value);
			ConnMcpInfo.setValue("CurAcuIndex", cmbMcpReaderIndex.value);
			
			console.log("send sms_put_connmcp_info");
			
			var sms_put_connmcp_info = app.lookup("sms_put_connmcp_info");
			sms_put_connmcp_info.send();
			
		} else {
			SendTransferItemstoTerminal();
		}
	}
	
}

function onSms_put_terminal_infoSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	var errorCode = app.lookup("Result").getValue("ResultCode");
	if (errorCode == COMERROR_NONE) {
		
		if (ENABLE_MCP040 == 1) {
			var cmbMcpReaderIndex = app.lookup("cmbMcpReaderIndex");
			var cmbMcpTerminalID = app.lookup("cmbMcpTerminalID");
			
			var ConnMcpInfo = app.lookup("ConnMcpInfo");
			ConnMcpInfo.setValue("CurMcpTerminalID", cmbMcpTerminalID.value);
			ConnMcpInfo.setValue("CurAcuIndex", cmbMcpTerminalID.value);
			
			console.log("send sms_put_connmcp_info");
			
			var sms_put_connmcp_info = app.lookup("sms_put_connmcp_info");
			sms_put_connmcp_info.send();
		} else {
			SvrSendFlag = 0; // Modify Flag 초기화
			SendTransferItemstoTerminal();
			
			var commandEvent = new cpr.events.CUIEvent("execute-command", {
				content: {
					"target": DLG_TERMINAL_MANAGEMENT,
					"command": "Update",
					"TerminalInfo": app.lookup("TerminalInfo").getDatas()
				}
			});
			
			app.getHostAppInstance().dispatchEvent(commandEvent);
		}
		
	} else {
		comLib.hideLoadMask();
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TerminalSaveFail"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(errorCode)));
	}
}

function onSms_put_terminal_infoSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_put_terminal_infoSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

function SendTransferItemstoTerminal() {
	
	var tOptflag = app.lookup("terminalOptflag");
	var terminalID = app.lookup("TerminalInfo").getValue("ID");
	var requestData;
	if (tOptflag.getValue("BasicOpt") == 2) {
		if (dataManager.getOemVersion() == OEM_KANGWONLAND) {
			var basicOption = app.lookup("BasicOptionInfo");
			var authType1 = basicOption.getValue("AuthType1");
			if (Number(authType1) != 0) {
				var authType2 = Number(basicOption.getValue("AuthType2"));
				var count = 0;
				for (var i = 0; i < 5; i++) {
					if ((authType2 & 1 << i) > 0) {
						count++;
					}
				}
				/*if( count < 2 ){ // 인증방식 제한 제외
					comLib.hideLoadMask();
					dialogAlert(app, dataManager.getString("Str_Warning"), "인증방식 2는 최소 두개가 선택되어야 합니다.");
					return;
				}*/
			}
		}
		requestData = app.lookup("sms_put_terminal_Basic");
		requestData.action = "/v1/terminals/" + terminalID + "/option/basic";
		console.log("send Submission :" + requestData.action);
		requestData.send();
	} else if (tOptflag.getValue("NetworkOpt") == 2) {
		requestData = app.lookup("sms_put_terminal_Network");
		requestData.action = "/v1/terminals/" + terminalID + "/option/network";
		console.log("send Submission :" + requestData.action);
		var datamap = app.lookup('NetWorkOptionInfo');
		console.log("NetworkOption :" + datamap.getDatas());
		requestData.send();
	} else if (tOptflag.getValue("LockOpt") == 2) {
		requestData = app.lookup("sms_put_terminal_lock"); // terminal_locks table에 저장
		requestData.method = "PUT"
		requestData.action = "/v1/terminals/" + terminalID + "/option/lock";
		console.log("send Submission :" + requestData.action);
		requestData.send();
	} else if (tOptflag.getValue("HolidayOpt") == 2) {
		requestData = app.lookup("sms_put_terminal_Holiday");
		requestData.action = "/v1/terminals/" + terminalID + "/option/holiday";
		console.log("send Submission :" + requestData.action);
		requestData.send();
	} else if (tOptflag.getValue("AlarmOpt") == 2) {
		requestData = app.lookup("sms_put_terminal_Alarm");
		requestData.action = "/v1/terminals/" + terminalID + "/option/alarm";
		console.log("send Submission :" + requestData.action);
		requestData.send();
	} else if (tOptflag.getValue("MealOpt") == 2) {
		requestData = app.lookup("sms_put_terminal_Meal");
		requestData.action = "/v1/terminals/" + terminalID + "/option/meal";
		console.log("send Submission :" + requestData.action);
		requestData.send();
	} else if (tOptflag.getValue("VoipOpt") == 2) {
		requestData = app.lookup("sms_put_terminal_Voip");
		requestData.action = "/v1/terminals/" + terminalID + "/option/voip";
		console.log("send Submission :" + requestData.action);
		requestData.send();
	} else {
		dialogAlert(app, dataManager.getString("Str_Success"), dataManager.getString("Str_TerminalSaveSuccess"));
		console.log("There is no submission to send to the server.");
		comLib.hideLoadMask();
	}
}

function onSms_put_terminal_setSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	var sms_put_terminal_opt = e.control;
	var OptFlag = app.lookup("terminalOptflag");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		switch (sms_put_terminal_opt.id) {
			case "sms_put_terminal_Basic":
				OptFlag.setValue("BasicOpt", 1);
				break;
			case "sms_put_terminal_Network":
				OptFlag.setValue("NetworkOpt", 1);
				break;
			case "sms_put_terminal_Holiday":
				OptFlag.setValue("HolidayOpt", 1);
				break;
			case "sms_put_terminal_Alarm":
				OptFlag.setValue("AlarmOpt", 1);
				break;
			case "sms_put_terminal_Meal":
				OptFlag.setValue("MealOpt", 1);
				break;
			case "sms_put_terminal_Voip":
				OptFlag.setValue("VoipOpt", 1);
				break;
			case "sms_put_terminal_lock":
				OptFlag.setValue("LockOpt", 1);
				break;
				
		}
		SendTransferItemstoTerminal();
	} else {
		var strMsg;
		switch (sms_put_terminal_opt.id) {
			case "sms_put_terminal_Basic":
				strMsg = dataManager.getString("Str_DefaultOption");
				break;
			case "sms_put_terminal_Network":
				strMsg = dataManager.getString("Str_Network");
				break;
			case "sms_put_terminal_Holiday":
				strMsg = dataManager.getString("Str_Holidays2");
				break;
			case "sms_put_terminal_Alarm":
				strMsg = dataManager.getString("Str_Siren");
				break;
			case "sms_put_terminal_Meal":
				strMsg = dataManager.getString("Str_MealService");
				break;
			case "sms_put_terminal_voip":
				strMsg = "Voip";
				break;
			case "sms_put_terminal_lock":
				strMsg = "lock";
				break;
		}
		//strMsg = strMsg + " " + dataManager.getString("Str_TerminalSaveFail");
		strMsg = strMsg + " " + dataManager.getString("Str_TerminalSaveFail") + " : " + dataManager.getString(getErrorString(resultCode));
		dialogAlert(app, dataManager.getString("Str_Failed"), strMsg);
		comLib.hideLoadMask();
	}
	
}

function onSms_put_terminal_setSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

function onSms_put_terminal_setSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

function onImageClick( /* cpr.events.CMouseEvent */ e) {
	var image = e.control;
	var menu_id = app.getHostProperty("initValue")["programID"]; // osmian에서 dialLog의 return 값을 받는다.
	
	var selectionEvent = new cpr.events.CUIEvent("execute-menu", {
		content: {
			"Target": DLG_HELP,
			"ID": menu_id
		}
	});
	
	app.getHostAppInstance().dispatchEvent(selectionEvent);
}

// 단말기 삭제 버튼 클릭
function onTMVBA_btnTerminalDeleteClick( /* cpr.events.CMouseEvent */ e) {
	var terminalID = app.lookup("TerminalInfo").getValue("ID");
	var terminalInfo = app.getHostProperty("initValue");
	comLib.showLoadMask("", dataManager.getString("Str_TerminalDelete"), "", 0);
	
	var sms_deleteTerminal = app.lookup("sms_deleteTerminal");
	sms_deleteTerminal.action = "/v1/terminals/" + terminalID;
	console.log(sms_deleteTerminal.action);
	sms_deleteTerminal.send();
}

// 단말 삭제 완료
function onSms_deleteTerminalSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	
	comLib.hideLoadMask();
	var dmResult = app.lookup("Result");
	if (dmResult.getValue("ResultCode") == COMERROR_NONE) {
		
		var terminalInfo = app.getHostProperty("initValue");
		var terminalID = terminalInfo["TerminalID"];
		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {
				"target": DLG_TERMINAL_MANAGEMENT,
				"command": "Delete",
				"TerminalID": terminalID
			}
		});
		
		app.getHostAppInstance().dispatchEvent(commandEvent);
		
		app.close();
	} else {
		comLib.hideLoadMask();
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TerminalDelete"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(dmResult.getValue("ResultCode"))));
	}
}

// 단말 삭제 에러
function onSms_deleteTerminalSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_ERROR);
}

// 단말 삭제 타임아웃
function onSms_deleteTerminalSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	var result = app.lookup("Result");
	result.setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSm_get_mcp_listSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sm_get_mcp_list = e.control;
	
	console.log("onSm_get_mcp_listSubmitDone");
	
	var terminalInfo = app.getHostProperty("initValue");
	var curTerminalID = terminalInfo["TerminalID"];
	
	var TerminalMcpList = app.lookup("TerminalMcpList");
	
	var cmbMcpTerminalID = app.lookup("cmbMcpTerminalID");
	cmbMcpTerminalID.deleteAllItems();
	cmbMcpTerminalID.addItem(new cpr.controls.Item("-------", 0));
	
	var mcpConnectedTerminalID = 0;
	var mcpConnectedAcuIndex = 0;
	for (var ii = 0; ii < TerminalMcpList.getRowCount(); ii++) {
		
		var TerminalID = TerminalMcpList.getRow(ii).getValue("TerminalID");
		var AcuTerminalID1 = TerminalMcpList.getRow(ii).getValue("AcuTerminalID1");
		var AcuTerminalID2 = TerminalMcpList.getRow(ii).getValue("AcuTerminalID2");
		var AcuTerminalID3 = TerminalMcpList.getRow(ii).getValue("AcuTerminalID3");
		var AcuTerminalID4 = TerminalMcpList.getRow(ii).getValue("AcuTerminalID4");
		
		console.log("TerminalID: " + TerminalID);
		console.log("AcuTerminalID1: " + AcuTerminalID1);
		console.log("AcuTerminalID2: " + AcuTerminalID2);
		console.log("AcuTerminalID3: " + AcuTerminalID3);
		console.log("AcuTerminalID4: " + AcuTerminalID4);
		
		cmbMcpTerminalID.addItem(new cpr.controls.Item(TerminalMcpList.getRow(ii).getValue("TerminalID"), TerminalMcpList.getRow(ii).getValue("TerminalID")));
		
		if (AcuTerminalID1 == curTerminalID && AcuTerminalID1 != 0) {
			mcpConnectedTerminalID = TerminalID;
			mcpConnectedAcuIndex = 1;
		}
		
		if (AcuTerminalID2 == curTerminalID && AcuTerminalID2 != 0) {
			mcpConnectedTerminalID = TerminalID;
			mcpConnectedAcuIndex = 2;
		}
		
		if (AcuTerminalID3 == curTerminalID && AcuTerminalID3 != 0) {
			mcpConnectedTerminalID = TerminalID;
			mcpConnectedAcuIndex = 3;
		}
		
		if (AcuTerminalID4 == curTerminalID && AcuTerminalID4 != 0) {
			mcpConnectedTerminalID = TerminalID;
			mcpConnectedAcuIndex = 4;
		}
	}
	
	if (mcpConnectedTerminalID != 0)
		cmbMcpTerminalID.value = mcpConnectedTerminalID;
	else
		cmbMcpTerminalID.value = 0;
	
	var cmbMcpReaderIndex = app.lookup("cmbMcpReaderIndex");
	if (mcpConnectedAcuIndex != 0) {
		cmbMcpReaderIndex.enabled = true;
		cmbMcpReaderIndex.value = mcpConnectedAcuIndex;
	} else {
		cmbMcpReaderIndex.enabled = false;
		cmbMcpReaderIndex.value = 0;
	}
	
	// 미리 업데이트를 해 놓는다 
	var ConnMcpInfo = app.lookup("ConnMcpInfo");
	ConnMcpInfo.setValue("PreMcpTerminalID", mcpConnectedTerminalID);
	ConnMcpInfo.setValue("PreAcuIndex", mcpConnectedAcuIndex);
	ConnMcpInfo.setValue("CurAcuTerminalID", curTerminalID);
	ConnMcpInfo.setValue("CurMcpTerminalID", mcpConnectedTerminalID);
	ConnMcpInfo.setValue("CurAcuIndex", mcpConnectedAcuIndex);
	
	console.log("=====================================");
	console.log(ConnMcpInfo.getDatas());
	console.log("=====================================");
	
	cmbMcpTerminalID.redraw();
	cmbMcpReaderIndex.redraw();
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbMcpReaderIndexSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbMcpReaderIndex = e.control;
	
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmbMcpTerminalIDSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmbMcpTerminalID = e.control;
	
	var cmbMcpReaderIndex = app.lookup("cmbMcpReaderIndex");
	
	if (cmbMcpTerminalID.value == 0) {
		cmbMcpReaderIndex.value = 0;
		cmbMcpReaderIndex.enabled = false;
	} else {
		cmbMcpReaderIndex.enabled = true;
	}
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_put_updateterminalmcpSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_put_updateterminalmcp = e.control;
	
}

/*
 * 서브미션에서 submit-done 이벤트 발생 시 호출.
 * 응답처리가 모두 종료되면 발생합니다.
 */
function onSms_put_connmcp_infoSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_put_connmcp_info = e.control;
	
	console.log("onSms_put_connmcp_infoSubmitDone");
	
	var errorCode = app.lookup("Result").getValue("ResultCode");
	if (errorCode == COMERROR_NONE) {
		
		// 저장했던 것을 다시 받아오기 때문에 화면 갱신을 해준다
		var cmbMcpTerminalID = app.lookup("cmbMcpTerminalID");
		var cmbMcpReaderIndex = app.lookup("cmbMcpReaderIndex");
		cmbMcpTerminalID.redraw();
		cmbMcpReaderIndex.redraw();
		
		SvrSendFlag = 0; // Modify Flag 초기화
		SendTransferItemstoTerminal();
		
		var commandEvent = new cpr.events.CUIEvent("execute-command", {
			content: {
				"target": DLG_TERMINAL_MANAGEMENT,
				"command": "Update",
				"TerminalInfo": app.lookup("TerminalInfo").getDatas()
			}
		});
		
		app.getHostAppInstance().dispatchEvent(commandEvent);
		
	} else {
		comLib.hideLoadMask();
		//dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString("Str_TerminalSaveFail"));
		dialogAlert(app, dataManager.getString("Str_Failed"), dataManager.getString(getErrorString(errorCode)));
	}
	
}

function onSms_put_terminal_lockSubmitDone( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var sms_put_terminal_lock = e.control;
	var OptFlag = app.lookup("terminalOptflag");
	var resultCode = app.lookup("Result").getValue("ResultCode");
	if (resultCode == COMERROR_NONE) {
		switch (sms_put_terminal_lock.id) {
			case "sms_put_terminal_Basic":
				OptFlag.setValue("BasicOpt", 1);
				break;
			case "sms_put_terminal_Network":
				OptFlag.setValue("NetworkOpt", 1);
				break;
			case "sms_put_terminal_Holiday":
				OptFlag.setValue("HolidayOpt", 1);
				break;
			case "sms_put_terminal_Alarm":
				OptFlag.setValue("AlarmOpt", 1);
				break;
			case "sms_put_terminal_Meal":
				OptFlag.setValue("MealOpt", 1);
				break;
			case "sms_put_terminal_Voip":
				OptFlag.setValue("VoipOpt", 1);
				break;
			case "sms_put_terminal_lock":
				OptFlag.setValue("LockOpt", 1);
				break;
		}
		SendTransferItemstoTerminal();
	} else {
		var strMsg;
		switch (sms_put_terminal_lock.id) {
			case "sms_put_terminal_Basic":
				strMsg = dataManager.getString("Str_DefaultOption");
				break;
			case "sms_put_terminal_Network":
				strMsg = dataManager.getString("Str_Network");
				break;
			case "sms_put_terminal_Holiday":
				strMsg = dataManager.getString("Str_Holidays2");
				break;
			case "sms_put_terminal_Alarm":
				strMsg = dataManager.getString("Str_Siren");
				break;
			case "sms_put_terminal_Meal":
				strMsg = dataManager.getString("Str_MealService");
				break;
			case "sms_put_terminal_voip":
				strMsg = "Voip";
			case "sms_put_terminal_lock":
				strMsg = "lock";
				break;
		}
		//strMsg = strMsg + " " + dataManager.getString("Str_TerminalSaveFail");
		strMsg = strMsg + " " + dataManager.getString("Str_TerminalSaveFail") + " : " + dataManager.getString(getErrorString(resultCode));
		dialogAlert(app, dataManager.getString("Str_Failed"), strMsg);
		comLib.hideLoadMask();
	}
}

function onSms_put_terminal_lockSubmitError( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_ERROR);
}

function onSms_put_terminal_lockSubmitTimeout( /* cpr.events.CSubmissionEvent */ e) {
	app.lookup("Result").setValue("ResultCode", COMERROR_NET_TIMEOUT);
}

/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onTMVBA_cmbLockTimeSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var tMVBA_cmbLockTime = e.control;
	
	if (dataManager.getOemVersion() == OEM_MOTORCYCLE_PARK) {
		SvrSendFlag = 1;
	} else {
		app.lookup("terminalOptflag").setValue("LockOpt", 2);
	}
}

/*
 * "HIoS 장비 등록" 버튼(TMVBA_btnHIoSRegist)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onTMVBA_btnHIoSRegistClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var tMVBA_btnHIoSRegist = e.control;
	/*
	 * 팝업 창생성
	 * 추가 api를 통하여 별도 테이블에 등록값 사용 
	 */
	
	var appld = "app/custom/hyundai_hios/hiosDeviceRegist" + "?" + usint_version; //경로 체크
			app.getRootAppInstance().openDialog(appld, {width : 430, height : 250}, function(dialog){
			dialog.ready(function(dialogApp){
				// 초기값 올려주기 //
				dialog.headerTitle ="HIoS 열화상 장비 등록";
				//dialog.style.header.css("background-color", "#528443");
				dialog.initValue = {
					"terminalID": app.lookup("TerminalInfo").getValue("ID")
				};
				dialog.modal = true;
			});
		}).then(function(returnValue){
			console.log(returnValue);
		});
}


function onCbxRegistTerminalValueChange(/* cpr.events.CValueChangeEvent */ e){
	var cbxRegistTerminal = e.control;
	SvrSendFlag = 1;
}

function onTMVBA_cmbGroupSelectionChange(/* cpr.events.CSelectionEvent */ e){
	var tMVBA_cmbGroup = e.control;
	SvrSendFlag = 1;
	
}
