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

The Labs' firmware allows for much longer time-lapses, on the internal battery alone, by powering off the camera between photos (sorry no video mode time-lapse.) It also supports intervals beyond 60 seconds. A fully charged HERO8 can take around 400 photos, which you can spread over several hours or several days for long form time-lapse.

Example Time-lapses tested:
* 400+ photos over a 24 hour time-lapse. 
* 340+ photos over a 10-day time-lapse. 
* 150+ photos over a 40-day time-lapse.

As the camera is off between frames, it is also possible to periodically change the battery for extremely long time-laspes without interrupting the time-lapse in progress. Simply replace the battery, power on the camera, the time-lapse will automatically continue.

## Time-lapse Calculator

Number of days <input type="range" style="width: 300px;" id="tldays" name="tldays" min="0" max="50" value="0"><label for="tldays"></label> <b id="daystext"></b>

Number of hours <input type="range" style="width: 300px;" id="tlhours" name="tlhours" min="0" max="48" value="24"><label for="tlhours"></label> <b id="hourstext"></b>

Maximum estimated frames: <b id="framestext">0</b> for  <b id="playtext">0</b> seconds of playback at 30fps. Capture time estimate <b id="captext">0</b> hours with an interval of <b id="intervaltext">0</b> minutes.

<center>
<div id="qrcode"></div>
<br>
</center>

QR Command: <b id="qrtext">time</b><br>

## Extending Time-lapse Duration

Simply replacing the battery is the easiest solution for long captures. After the battery is replaced, power on the camera so that the time-lapse can continue. You might want to set and forget for a multi-week or multi-month time-lapse, for this A/C powering the camera via USB is the best. With continuous wall power the battery is optional and the camera should run for a very long time (only SD card storage limitations.) You might be tempted to use a Lithium Ion USB powerbank, however they typically do not work well (see below for solutions.) They are designed to quickly recharge a smartphone, and when they think power is no longer needed, they shut-off. For this reason they get you far shorter captures than you would expect. If you want to try a USB powerbank, remove the GoPro battery for better results. For long captures away from the power grid, the best solution is a small 12V 18+Ah sealed lead acid battery and attached a non-smart (doesn't shut off) USB regulator. With the right photo interval, this configuration could last a year on a single charge.      
		
## Solutions for Using External Lithium Ion USB Batteries

As stated above, most Lithium Ion USB power-banks will shut-off early, even when the camera still needs the power. A select few USB battery sources include an "always on feature" designed for time-lapse projects.  Example:[voltaicsystems.com/v50](https://voltaicsystems.com/v50/) This one can even solar recharge the battery at the same time.

The second option is a USB keep alive device that prevents your USB power bank from shutting down.  Examples: from [sotabeams.co.uk](https://www.sotabeams.co.uk/usb-battery-pack-keep-alive-load/) and from [tindie.com](https://www.tindie.com/products/overz/smart-power-bank-keep-alive/)

        
## ver 1.03
[BACK](..)

<script>
var once = true;
var qrcode;
var cmd = "!60SQ!1R";
var lasttimecmd = "";
var changed = true;

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
  if(document.getElementById("tldays") !== null)
  {
	var tld = parseInt(document.getElementById("tldays").value);
	var totalh = tld*24;
	var tlh = parseInt(document.getElementById("tlhours").value);
	totalh += tlh;
	var frms = 406 - (6/24)*totalh;
	var playsecs = 10 * frms / 30;
	var interval = ( ( (tld * 24) + tlh) * 3600 / frms) - 15; 
	
	playsecs = Math.round(playsecs); playsecs = playsecs / 10;
	frms = Math.round(frms);
	
	if(interval < 1) interval = 1;
	interval = Math.round(interval);
	
	document.getElementById("daystext").innerHTML = tld;
	document.getElementById("hourstext").innerHTML = tlh;
	document.getElementById("framestext").innerHTML = frms;
	document.getElementById("playtext").innerHTML = playsecs;	
	document.getElementById("captext").innerHTML = Math.round(((interval+15)*frms/360))/10;	
	document.getElementById("intervaltext").innerHTML = Math.round((interval+15)/6)/10;	
	
	cmd = "!" + interval + "NQmPN!S!1R";
  }
  
  qrcode.clear(); 
  qrcode.makeCode(cmd);
  
  if(cmd != lasttimecmd)
  {
	changed = true;
	lasttimecmd = cmd;
  }
	
  if(changed === true)
  {
	document.getElementById("qrtext").innerHTML = cmd;
	changed = false;
  }
  
  var t = setTimeout(timeLoop, 100);
}

function myReloadFunction() {
  location.reload();
}

makeQR();
timeLoop();

</script>
