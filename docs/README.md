<script type="text/javascript" src="jquery.min.js"></script>
<script type="text/javascript" src="qrcode.js"></script>

<script type="text/javascript">

var lastcmd = ""
var lasttimecmd = ""
var changed = false;
var ms = 0;
var lastms = 0;
var timechecked = false;
var once = true;
var even = 0;
var qrcode;

function makeQR() {	
	if(once == true)
	{
		qrcode = new QRCode(document.getElementById("qrcode"), 
		{
			text : "GP",
			width : 400,
			height : 400,
			correctLevel : QRCode.CorrectLevel.M
		});
	}
	once = false;
}

function startTime() {	
    var today;
    var yy;
    var mm;
    var dd;
    var h;
    var m;
    var s;
	var timecodefps = 30;
    var ms;
    var f;
	var cmd = "";
	var timestr = "";
	
	today = new Date();
	
	{
		ms = today.getTime();
		changed = true;
		lastcmd = cmd;
	}
	
	{
		var frms;
		var secs = true;//document.getElementById("dtsec").checked;
		var timecode = false;
		
		yy = today.getFullYear() - 2000;
		mm = today.getMonth() + 1;
		dd = today.getDate();
		h = today.getHours();
		m = today.getMinutes();
		s = today.getSeconds();
		ms = today.getMilliseconds();
		
		
		frms = (h * 3600 + m * 60 + s) * timecodefps + Math.floor((timecodefps * ms) / 1000);
		
		yy = checkTime(yy);
		mm = checkTime(mm);
		dd = checkTime(dd);
		h = checkTime(h);
		m = checkTime(m);
		s = checkTime(s);
		ms = Math.floor(ms / 10); // hundredths
		ms = checkTime(ms);
	
		//var curr = today.getTime();
		
		cmd = cmd + "oT" + yy + mm + dd + h + m;
		timestr = "20"+yy+"/"+mm+"/"+dd+" "+h+":"+m;
		if(secs)
		{
			cmd = cmd + s;
			timestr = timestr + ":" + s;
		}

		
		if(cmd != lasttimecmd)
		{
			changed = true;
			lasttimecmd = cmd;
		}
	
		timechecked = true; 
	}
	
	var delay = 200;
	
	if(changed == true)
	{	
		makeQR();
		
		even ++;
		{
			qrcode.clear(); 
			qrcode.makeCode(cmd);
		}
		
		lastms = today.getTime();
		changed = false;
		
		delay = 10;
	}
	
	var t = setTimeout(startTime, delay);
}
function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}



function myReloadFunction() {
    location.reload();
}
 

</script>

# QR Test

![](qrcode)
