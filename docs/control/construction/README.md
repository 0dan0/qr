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

End Time <input type="range" id="tlend" name="tlend" min="12" max="108" value="144"><label for="tlend"></label> <b id="endtext"></b>

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
	
	var starthours = Math.trunc(startmins / 60);
	startmins -= starthours * 60;
	
	var endhours = Math.trunc(endmins / 60);
	endmins -= endhours * 60;
	
	
	document.getElementById("perdaytext").innerHTML = perday;	
	
	document.getElementById("starttext").innerHTML = pad(starthours, 2) + ":" + pad(startmins, 2);
	
	document.getElementById("endtext").innerHTML = pad(endhours, 2) + ":" + pad(endmins, 2);
	
	//var frms = 406 - (6/24)*totalh;
	//var playsecs = 10 * frms / 30;
	//var interval = ( ( (tld * 24) + tlh) * 3600 / frms) - 15; 
	
	//playsecs = Math.round(playsecs); playsecs = playsecs / 10;
	//frms = Math.round(frms);
	
	cmd = "mPdP!" + "SQ!1R";
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
