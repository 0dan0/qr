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

The current time-lapse abilities in the camera are limited to a maximum interval of 60 seconds. While this is a good interval for long day into night transitions or a good long night-lapse, the camera has a limited time-lapse length due to the battery. Maximum run times of three hours with a 60 second interval, is only 180 frames, or a slightly too short, six seconds of playback. Providing external USB power is a great solution, but now the camera isn’t waterproof, limiting the environments where you can run a long time-lapse. The Labs' firmware solution allows for longer time-lapses, on the internal battery alone, by powering off the camera between photos (sorry no video mode time-lapse.)

Example Time-lapses tested:
* 400 photos over a 24 hour time-lapse. 
* 330 photos over a 10-day time-lapse. 
* 120 photos over a 40-day time-lapse.

As the camera is off between frames, it is also possible to periodically change the battery for extremely long time-laspes without interrupting the time-lapse in progress. Simply replace the battery, power on the camera, the time-lapse will automatically continue.

## Time-lapse Calculator

Number of days <input type="range" id="days" name="days" min="0" max="60" value="0"><label for="days"></label> <b id="daystext">0</b>

Number of hours <input type="range" id="hours" name="hours" min="0" max="48" value="24"><label for="hours"></label> <b id="hourstext">24</b>

Maximum expected frames: <b id="framestext">0</b> for  <b id="playtext">0</b> seconds of playback at 30fps.


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
	var d = document.getElementById("days").value;
	var h = document.getElementById("hours").value;
	
	var f = 400 - ( ( ( (d * 24) + h) * 7) / 24);
	var p = f / 30;
	var i = ( ( (d * 24) + h) * 3600 / f) - 15; 
	
	//p = p.toFixed(1);
	//f = p.toFixed(0);
	i = i.toFixed(0);
	
	document.getElementById("daystext").innerHTML = d;
	document.getElementById("hourstext").innerHTML = h;
	document.getElementById("framestext").innerHTML = f;
	document.getElementById("playtext").innerHTML = p;	
	
	cmd = "!" + i + "SQ!1R";
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
