# Eclipse Timelapse Planner

<script src="../../jquery.min.js"></script>
<script src="../../qrcodeborder.js"></script>
<script src="../../html2canvas.min.js"></script>
<style>
        #qrcode{
            width: 100%;
        }
        div{
            width: 100%;
            display: inline-block;
        }
</style>


Shooting a solar eclipse is tricky. The first issue is the sheer change in dynamic range from full sun to when it's fully covered by the moon, 
the light level can vary up to 12 stops. 12 stops, the light halving in brightness 12 times, would be the difference in shooting with 1/1000 shutter to a 4 second exposure. 
This example data was from a solar eclipse measured in Australia in 2023 (thanks to Matt Parker's data from [**Stand-up Maths**](https://youtu.be/IuUMxNfDfFY?si=iytXca2frHqOakOB&t=933) - the whole video is a worth watch.)

![stops.png](stops.png)

The light levels change very slowly initially, but incredibly rapidly as the totality approaches. The first 90 minutes, the light drops only 3-4 stops, you will notice the light 
feels odd after 90 minutes, but your camera will have compensated so much to make it mostly unnoticeable. We can improve on the default camera behavior using Labs firmware.

A stock GoPro has a great night-lapse feature designed for day to night to day transitions, keeping a good exposure throughout, yet this exposure logic is not ideal for a solar 
eclipse before and after the totality (it is fine during totality.) The time-lapse modes on GoPro don’t have an exposure lock option, but with a potential 12-stop change, locking the 
shutter 1/1000 and ISO at 100 (or exposing correctly at C1) will result in a mostly black image at C2. So we still need some of the autoexposure goodness, but with some constraints 
so that the light drop is more visibly dramatic.  

Things to try with GoPro Labs. ```oMEXPS=1``` this will display ISO and shutter for your current shooting mode. Test with time-lapse or night-lapse, recording to see the exposure 
for different light levels. Practice well before the eclipse. This feature requires the latest Labs firmware on HERO12 and HERO11 to view exposure during a timelapse 
(it works only in video modes on older releases.)  

![EXPS.png](EXPS.png)

Note: The exposure settings for preview can be different than when recording, so experiment while capturing a timelapse.  

Once you see the shutter behavior with Labs extension above, we can now consider setting an upper limit to the shutter with oMEXPX=<your maximum shutter time>.  
Below are extracted frames from two simultaneous Night Lapse captures of the sunset, one with the shutter limited to 1/50th of a second.

![NightCompare.png](NightCompare.png)

Limiting the ISO to 100 is also our recommendation for shooting the eclipse, as we estimate that from full daylight to totality, the shutter will range from around 1/1600th to 2.5 seconds at 100 ISO. 
Fitting nicely within Night Lapse with a 4-second interval, with an Auto shutter.  

It is tricky to capture both the massive drop in light, and the drama of totality, in a single timelapse capture. If possible, this is best achieved with multiple cameras, 
editing and blending the results in post.

1)	Capture mostly optimized for the totality – Night Lapse ISO 100, 4s interval, Shutter Auto and starting about 15 minutes before the totality, running until 15 minutes after. 
Resulting in a ~17 second timelapse, 2 seconds in totality (if a 4-minute totality.)  

2)	Capture optimized for the drop in brightness - Timelapse ISO 100, 10s interval, starting an hour before totality. Limiting the shutter to say 1/30th of a second 
(this is your creative choice.) At 1/30, the last 5-6 stops of teh eclipse will be more dramatically show the light impact upon the landscape. Resulting in a ~25 second timelapse, ~1 second in totality.

Note: Timelapse stock (not Night Lapse) is limited to a maximum of 1/8 second exposures, combined with ISO maximum of 100, this is a good option without Labs firmware. 
This is what I used in 2017. However, the now only the last 3-4 stops will show a dramatic light change, and this is in the last minute before and after totality, 
and with a 10s interval, you will only get about six frames of the light drop in the timelapse (quarter second at playback speed.)  Using the 1/30th limit, the estimated 
length of the light drop-off will double in the final timelapse.  

3)	Super optimized for the totality, pointing at the sun - Night Lapse ISO Max 800, Auto interval, Shutter Auto, Labs shutter limited to 1s, and starting about 2 minutes 
before the totality, run until 2+ minutes after. Auto shutter with Auto interval is a special mode in Night Lapse, in this mode it will take frames as fast as possible, 
giving you more frames in the totality. When it is bright, this is ~3fps, when it is dark Labs firmware can limit the exposure time to 1fps. If you have 4 minutes of totality, 
this 8-minute timelapse will result in ~32s playback time, with 4 seconds in the totality. Optional, you could limit the exposure to half a second for up to 8 seconds in totality.

4) For those who want to experiment further, Labs firmware allows you to script the camera, so that certain modes or actions can be performed at particular moments. 
The problem is we haven’t had a prior eclipse to practice on.  An example of script would be to run type 2) capture until the totality, then switch to type 3), automatically. 

## Eclipse Time-lapse QR Code

Totality Start Time: <input type="range" style="width: 300px;" id="tlstrt" name="tlstrt" min="1" max="143" value="48"><label for="tlstrt"></label> <b id="starttext"></b>

Capture Length: <input type="range" style="width: 360px;" id="tlend" name="tlend" min="1" max="1420" value="292"><label for="tlend"></label> <b id="lentext"></b> minutes &nbsp;&nbsp; End Time: <b id="endtext"></b>

<input type="checkbox" id="upld" name="upld"> 
<label for="upld">Upload at the end of each capture</label><br>

Daily playback length (at 30fps): <b id="length"></b> seconds
 
<div id="qrcode_txt" style="width: 360px">
  <center>
  <div id="qrcode"></div><br>
  <b><font color="#009FDF">GoProQR:</font></b> <em id="qrtext"></em><br>
  <b><font color="#005CAC">Daily Timelapse and Upload</font></b>
  </center>
</div>
<button id="copyImg">Copy Image to Clipboard</button>
<br>
<br>
Share this QR Code as a URL: <small id="urltext"></small><br>
<button id="copyBtn">Copy URL to Clipboard</button>
      
## Solutions for extra long captures

A/C powering the camera via USB is the best. With continuous power supplied, remove the internal battery (charging can reset the wake timer), and the camera should run for a very long time (only SD card storage limitations.) You might be tempted to use a Lithium Ion USB powerbank, however they typically do not work well. They are designed to quickly recharge a smartphone, and when they think power is no longer needed, they shut-off. A select few USB battery sources include an "always on feature" designed for time-lapse projects. Example:[voltaicsystems.com/v50](https://voltaicsystems.com/v50/) This one can even solar recharge the battery at the same time. The second option is add a USB keep alive device that prevents your USB power bank from shutting down. Examples: from [sotabeams.co.uk](https://www.sotabeams.co.uk/usb-battery-pack-keep-alive-load/) and from [tindie.com](https://www.tindie.com/products/overz/smart-power-bank-keep-alive/)
	
**Compatibility:** Labs enabled HERO8, HERO9, HERO10, HERO11, HERO12 and BONES 

updated: Sept 13, 2023

[More features](..) for Labs enabled cameras

<script>
var once = true;
var qrcode;
var cmd = "mPdP!60SQ!1R";
var clipcopy = "";
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


function dcmd(cmd, id) {
    var x;
	if(document.getElementById(id) !== null)
	{
		x = document.getElementById(id).checked;
		if( x === true)
			cmd = cmd + document.getElementById(id).value;
	}
	else
	{
		for (i = 1; i < 15; i++) { 
			var newid = id+i;
			if(document.getElementById(newid) !== null)
			{
				x = document.getElementById(newid).checked;
				if( x === true)
					cmd = cmd + document.getElementById(newid).value;
			}
		}
	}
	return cmd;
}


function dval(id) {
    var x;
	var val = "";
	{
		for (i = 1; i < 15; i++) { 
			var newid = id+i;
			if(document.getElementById(newid) !== null)
			{
				x = document.getElementById(newid).checked;
				if( x === true)
					val = document.getElementById(newid).value;
			}
		}
	}
	return val;
}




function timeLoop()
{
  if(document.getElementById("tlstrt") !== null)
  {
	var start = parseInt(document.getElementById("tlstrt").value);
	var startmins = start + 360;
	var caplen = parseInt(document.getElementById("tlend").value);
	caplen = Math.trunc(caplen*caplen/1420);
	if(caplen < 1) caplen = 1;
	var endmins = startmins + caplen;
	if(endmins >= 1440)
		endmins -= 1440;
		
	var starthourstime = Math.trunc(startmins / 60);
	var startminstime = startmins - starthourstime * 60;	
	
	var endhourstime = Math.trunc(endmins / 60);
	var endminstime = endmins - endhourstime * 60;
		
	var stxt = pad(starthourstime, 2) + ":" + pad(startminstime, 2);
	var etxt = pad(endhourstime, 2) + ":" + pad(endminstime, 2);
	
	document.getElementById("starttext").innerHTML = stxt;
	document.getElementById("endtext").innerHTML = etxt;
	document.getElementById("lentext").innerHTML = caplen;
	
	var spftxt = dval("fpslapse");
	var spf = spftxt.slice(2);
	var fsecs = ((caplen*60) / parseInt(spf)) / 30;	
	var secs10 =  fsecs * 10;
	var secs = Math.trunc(secs10) / 10;

	if(spf == "")
		document.getElementById("length").innerHTML = "unknown";
	else
		document.getElementById("length").innerHTML = secs;
		
	

	cmd = "";
	cmd = dcmd(cmd,"nltlv");
	cmd = dcmd(cmd,"tlvf");
	cmd = dcmd(cmd,"fpslapse");
	
	cmd = "!" + stxt + "N" + cmd + "!S!" + caplen*60 + "E";
	
	if(document.getElementById("upld") !== null)
	{
		if(document.getElementById("upld").checked === true)
		{
			cmd = cmd + "!U";
		}
	}
	cmd = cmd + "!1R";
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
	clipcopy = "https://gopro.github.io/labs/control/set/?cmd=" + cmd + "&title=Daily%20Timelapse%20and%20Upload";
	document.getElementById("urltext").innerHTML = clipcopy;
	changed = false;
  }
  
  var t = setTimeout(timeLoop, 100);
}

function myReloadFunction() {
  location.reload();
}


async function copyImageToClipboard() {
    html2canvas(document.querySelector("#qrcode_txt")).then(canvas => canvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})])));
}
async function copyTextToClipboard(text) {
	try {
		await navigator.clipboard.writeText(text);
	} catch(err) {
		alert('Error in copying text: ', err);
	}
}

function setupButtons() {	
    document.getElementById("copyBtn").onclick = function() { 
        copyTextToClipboard(clipcopy);
	};
    document.getElementById("copyImg").onclick = function() { 
        copyImageToClipboard();
	};
}

makeQR();
setupButtons();
timeLoop();

</script>