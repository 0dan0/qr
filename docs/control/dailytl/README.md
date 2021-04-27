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

# Daily Time-lapses and Upload

If you camera is configured (via the Quik App) to update to the GoPro cloud, you can use this daily timelapse to automatically sync each day.  Ideal for daily documentation for a construction or sunsize/sunsets
Remember to set your camera's [clock](../precisiontime) before using this QR Code.

<b>Type:</b>
  <input type="radio" id="nltlv1" name="nltlv" value="mT" checked> <label for="nltlv1">TimeLapse Video</label>&nbsp;&nbsp;
  <input type="radio" id="nltlv2" name="nltlv" value="mNL"> <label for="nltlv2">NightLapse</label><br><br>
  <input type="radio" id="nltlv3" name="nltlv" value=""> <label for="nltlv3">not set</label><br><br>
 </div>
 
<b>Lens:</b>
  <input type="radio" id="tlvf1" name="tlvfov" value="fW"> <label for="tlvf1">Wide </label>&nbsp;&nbsp;
  <input type="radio" id="tlvf2" name="tlvfov" value="fL"> <label for="tlvf2">Linear </label>&nbsp;&nbsp;
  <input type="radio" id="tlvf3" name="tlvfov" value="" checked> <label for="tlvf3">not set</label><br><br>
 </div>
 
<b>Interval:</b>&nbsp;&nbsp;
  <input type="radio" id="fpslapse1" name="fpslapse" value="p.2">  <label for="fpslapse1">2s  </label>&nbsp;&nbsp;
  <input type="radio" id="fpslapse2" name="fpslapse" value="p.5">  <label for="fpslapse2">5s  </label>&nbsp;&nbsp;
  <input type="radio" id="fpslapse3" name="fpslapse" value="p.10"> <label for="fpslapse3">10s </label>&nbsp;&nbsp;
  <input type="radio" id="fpslapse4" name="fpslapse" value="p.30"> <label for="fpslapse4">30s </label>&nbsp;&nbsp;
  <input type="radio" id="fpslapse5" name="fpslapse" value="p.60"> <label for="fpslapse5">60s </label>&nbsp;&nbsp;<br>
  &nbsp;&nbsp;&nbsp;&nbsp;HERO 8/9&nbsp;&nbsp; 
  <input type="radio" id="fpslapse6" name="fpslapse" value="p.120" > <label for="fpslapse6">2min </label>&nbsp;&nbsp;
  <input type="radio" id="fpslapse7" name="fpslapse" value="p.300" > <label for="fpslapse7">5min </label>&nbsp;&nbsp;
  <input type="radio" id="fpslapse8" name="fpslapse" value="p.1800"> <label for="fpslapse8">30min </label>&nbsp;&nbsp;
  <input type="radio" id="fpslapse9" name="fpslapse" value="p.3600"> <label for="fpslapse9">60min </label>&nbsp;&nbsp;
  <input type="radio" id="fpslapse10" name="fpslapse" value="" checked> <label for="fpslapse10">not set</label><br><br>
</div>
 
 
## Daytime Time-lapse Calculator

Start Time <input type="range" style="width: 300px;" id="tlstrt" name="tlstrt" min="1" max="143" value="48"><label for="tlstrt"></label> <b id="starttext"></b>

End Time <input type="range" style="width: 300px;" id="tlend" name="tlend" min="1" max="143" value="54"><label for="tlend"></label> <b id="endtext"></b>

<center>
<div id="qrcode"></div>
<br>
</center>

QR Command: <b id="qrtext">time</b><br>
        
## Extending Time-lapse Duration

Simply replacing the battery is the easiest solution for long captures. After the battery is replaced, power on the camera so that the time-lapse can continue. You might want to set and forget for a multi-week or multi-month time-lapse, for this A/C powering the camera via USB is the best. With continuous power supplied, the battery should be removed, and the camera should run for a very long time (only SD card storage limitations.) You might be tempted to use a Lithium Ion USB powerbank, however they typically do not work well (see below for solutions.) They are designed to quickly recharge a smartphone, and when they think power is no longer needed, they shut-off. For this reason they get you far shorter captures than you would expect. If you want to try a USB powerbank, you must remove the GoPro battery for good results. For long captures away from the power grid, the best solution is a small 12V 18+Ah sealed lead acid battery and attached a non-smart (doesn't shut off) USB regulator. With the right photo interval, this configuration could last a year on a single charge.   
		
## Solutions for Using External Lithium Ion USB Batteries

As stated above, most Lithium Ion USB power-banks will shut-off early, even when the camera still needs the power. A select few USB battery sources include an "always on feature" designed for time-lapse projects.  Example:[voltaicsystems.com/v50](https://voltaicsystems.com/v50/) This one can even solar recharge the battery at the same time.

The second option is a USB keep alive device that prevents your USB power bank from shutting down.  Examples: from [sotabeams.co.uk](https://www.sotabeams.co.uk/usb-battery-pack-keep-alive-load/) and from [tindie.com](https://www.tindie.com/products/overz/smart-power-bank-keep-alive/)

	
## ver 1.00

[BACK](..)

<script>
var once = true;
var qrcode;
var cmd = "mPdP!60SQ!1R";
var lasttimecmd = "";
var changed = false;

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

function checkTime(i) {
    if (i < 10) {i = "0" + i;}  // add zero in front of numbers < 10
    return i;
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
	var startmins = start*10;
	var end = parseInt(document.getElementById("tlend").value);
	var endmins = startmins + end*10;
	if(endmins>1430) endmins = 1430;
	var perday = parseInt(document.getElementById("tlday").value);
	
	var restarthourstime = Math.trunc(startmins / 60);
	var restartminstime = startmins - restarthourstime * 60;
	
	var starthourstime = Math.trunc((startmins-1) / 60);
	var startminstime = (startmins-1) - starthourstime * 60;	
	
	var endhourstime = Math.trunc(endmins / 60);
	var endminstime = endmins - endhourstime * 60;
	
	document.getElementById("perdaytext").innerHTML = perday;	
	
	var rtxt = pad(restarthourstime, 2) + ":" + pad(restartminstime, 2);
	var stxt = pad(starthourstime, 2) + ":" + pad(startminstime, 2);
	var etxt = pad(endhourstime, 2) + ":" + pad(endminstime, 2);
	
	document.getElementById("starttext").innerHTML = rtxt;
	document.getElementById("endtext").innerHTML = etxt;
	
	var d = 406 / perday;
	var dd = (406 - d * 6) / perday;
		
	dd *= 10;
	dd = Math.trunc(dd) / 10;
	
	document.getElementById("daystext").innerHTML = dd;
		
	var interval = Math.trunc(((endmins - startmins)*60 / perday) - 15);
	if(interval < 30) interval = 30;
	
	cmd = "mPdP>" + stxt + "<" + etxt + "!" + interval + "SQ~" + "!" + rtxt + "S!1R";
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