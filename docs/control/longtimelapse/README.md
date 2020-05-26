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

# Very Long Time-lapses with Larger Intervals

The Labs' firmware solution allows for longer time-lapses, on the internal battery alone, by powering off the camera between photos (sorry no video mode time-lapse.)

Example Time-lapses tested:
* 400 photos over a 24 hour time-lapse. 
* 330 photos over a 10-day time-lapse. 
* 120 photos over a 40-day time-lapse.

As the camera is off between frames, it is also possible to periodically change the battery for extremely long time-laspes without interrupting the time-lapse in progress. Simply replace the battery, power on the camera, the time-lapse will automatically continue.

## Time-lapse Calculator

Number of days <input type="range" id="tldays" name="tldays" min="0" max="60" value="0"><label for="tldays"></label> <b id="daystext">0</b>

Number of hours <input type="range" id="tlhours" name="tlhours" min="0" max="48" value="24"><label for="tlhours"></label> <b id="hourstext">24</b>

Maximum estimated frames: <b id="framestext">0</b> for  <b id="playtext">0</b> seconds of playback at 30fps.


<center>
<div id="qrcode"></div>
<br>
</center>

QR Command: <b id="qrtext">time</b><br>
        
## ver 1.01
[BACK](..)

<script>
var once = true;
var qrcode;
var cmd = "!60SQ!1R";

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

function timeLoop()
{
  if(document.getElementById("days") !== null)
  {
	var tld = document.getElementById("tldays").value;
	var tlh = document.getElementById("tlhours").value;
	var totalh = tlh + (tld*24);
	var totald = totalh / 24;
	var frms = 400 - 7*totald;
	var playsecs = 10 * f / 30;
	var interval = ( ( (tld * 24) + tlh) * 3600 / frms) - 15; 
	
	playsecs = Math.round(playsecs); playsecs = playsecs / 10;
	frms = Math.round(frms);
	
	if(interval < 1) interval = 1;
	interval = Math.round(interval);
	
	document.getElementById("daystext").innerHTML = tld;
	document.getElementById("hourstext").innerHTML = tlh;
	document.getElementById("framestext").innerHTML = frms;
	document.getElementById("playtext").innerHTML = playsecs;	
	
	cmd = "!" + interval + "SQ!1R";
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
