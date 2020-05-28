<script src="../../jquery.min.js"></script>
<script src="../../qrcodeborder.js"></script>
<style>
        #qrcode{
            width: 100%;
        }
        div{
            width: 100%;
            display: inline-block;
        }
</style>

# Construction Time-lapses - Daytime Only Photos

An extension of [Extra Long Time-lapses](../longtimelapse) feature, so during a time-lapse during construction hours alone, to extend your battery life and reduce the number of images you will assemble into a time-lapse.

## Time-lapse Calculator

Start Time <input type="range" id="tlstrt" name="tlstrt" min="12" max="276" value="96"><label for="tlstrt"></label> <b id="starttext"></b>

End Time <input type="range" id="tlend" name="tlend" min="12" max="192" value="108"><label for="tlend"></label> <b id="endtext"></b>

Number of photos per day <input type="range" id="tlday" name="tlday" min="10" max="300" value="24"><label for="tlday"></label> <b id="perdaytext"></b>

Estimated runtime per battery: <b id="daystext">0</b> days

<center>
<div id="qrcode"></div>
<br>
</center>

QR Command: <b id="qrtext">time</b><br>
        
## ver 1.0
[BACK](..)

<script>
var once = true;
var qrcode;
var cmd = "mPdP!60SQ!1R";

function makeQR() 
{	
  if(once === true)
  {
    qrcode = new QRCode(document.getElementById("qrcode"), 
    {
      text : "!oMBURN=\"\"",
      width : 360,
      height : 360,
      correctLevel : QRCode.CorrectLevel.M
    });
    once = false;
  }
}


function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}


function timeLoop()
{
  if(document.getElementById("tlstrt") !== null)
  {
	var start = parseInt(document.getElementById("tlstrt").value);
	var startmins = start*5;
	var end = parseInt(document.getElementById("tlend").value);
	var endmins = startmins + end*5;
	var perday = parseInt(document.getElementById("tlday").value);
	
	var starthourstime = Math.trunc(startmins / 60);
	var startminstime = startmins - starthourstime * 60;
	
	var endhourstime = Math.trunc(endmins / 60);
	var endminstime = endmins - endhourstime * 60;
	
	
	document.getElementById("perdaytext").innerHTML = perday;	
	
	var stxt = pad(starthourstime, 2) + ":" + pad(startminstime, 2);
	var etxt = pad(endhourstime, 2) + ":" + pad(endminstime, 2);
	
	document.getElementById("starttext").innerHTML = stxt;
	document.getElementById("endtext").innerHTML = etxt;
	
	var d = 406 / perday;
	var dd = (406 - d * 6) / perday;
		
	dd *= 10;
	dd = Math.truct(dd);
	
	document.getElementById("daystext").innerHTML = dd;
		
	var interval = Math.trunc(((endmins - startmins)*60 / perday) - 15);
	if(interval < 30) interval = 30;
	
	//playsecs = Math.round(playsecs); playsecs = playsecs / 10;
	//frms = Math.round(frms);
	
	cmd = "mPdP>" + stxt + "<" + etxt + "!" + interval + "SQ" + "!" + "S" + stxt + "!1R";
  }
  
  qrcode.clear(); 
  qrcode.makeCode(cmd);
  document.getElementById("qrtext").innerHTML = cmd;
  var t = setTimeout(timeLoop, 100);
}

function myReloadFunction() {
  location.reload();
}

makeQR();
timeLoop();

</script>