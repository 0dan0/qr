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

# Add a Logo to your Videos

Generally, altering your video images with logos is best done as part of editing, preserving the best image quality and the greatest flexibility. However, when live-streaming or using the webcam features, the aren't editing steps. The enhancement is for when you video production doesn't have or has limited time for the editing step.     
 
 
Logo offset horizontally <input type="range" style="width: 300px;" id="hsize" name="hsize" min="0" max="200" value="0"><label for="hsize"></label> <b id="hstext">0</b>
Logo offset vertically <input type="range" style="width: 300px;" id="vsize" name="vsize" min="0" max="200" value="20"><label for="vsize"></label> <b id="vstext">40</b>

**Screen Placement** <br>
  &nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" id="sp1" name="placement" value="TL"> <label for="sp1">Top Left    </label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <input type="radio" id="sp2" name="placement" value="TC"> <label for="sp2">Top Center  </label>&nbsp;&nbsp;&nbsp;&nbsp;
  <input type="radio" id="sp3" name="placement" value="TR"> <label for="sp3">Top Right   </label><br>
  &nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" id="sp4" name="placement" value="ML"> <label for="sp4">Mid Left    </label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <input type="radio" id="sp5" name="placement" value="MR"> <label for="sp5">Mid Right   </label><br>
  &nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" id="sp6" name="placement" value="BL"> <label for="sp6">Lower Left  </label>&nbsp;
  <input type="radio" id="sp7" name="placement" value="BC"> <label for="sp7">Lower Center</label>&nbsp;
  <input type="radio" id="sp8" name="placement" value="BR" checked> <label for="sp8">Lower Right </label>&nbsp;<br>
  
  
**GPS On or Off** <br>
 
  &nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" id="gps" name="gps"> <label for="gps">Using GPS</label><br>

<center>
<div id="qrcode"></div>
<br>
</center>


Make the overlay permanently active: **Are you sure? (Risky)**  <input type="checkbox" id="permanent" name="permanent"> <label for="permanent">Permanent Overlay</label> <input type="checkbox" id="erase" name="erase"> <label for="erase">Erase</label><br>

QR Command: <b id="qrtext">time</b><br>

Cool Tips:
- Metadata overlays work great with live-streaming.  This was its original intended function. 
- Overlays can be changed mid capture, it is one of the few modes that QR Code reading is defaulted to active while recording. Example use: When live streaming an endurance auto-race, you can change the driver name on the overlay during driver change pit-stops. 
- A range (not all) of GoPro metadata can be displayed in their stored units, so speed is in meters/sec, not MPH. For more technical information on [GoPro's GPMF Metadata](https://gopro.github.io/gpmf-parser/) and other metadata you can display.

Known Issues:
- The Permanent mode was **not safe on HERO8 Labs v1.70.75**, fixed in the 2021 release. Update to 2021 Labs firmware before using this feature.
- Metadata can take a second before it updates after capture start.
<!-- - Permanent overlays require the clearing of older settings. If your using either Owner or Large Chapters modifications, they will need to be added after the overlay.   -->

		
Compatibility: Labs enabled HERO8, HERO9 and MAX 
        
## ver 1.23
[Learn more](..) on QR Control

<script>
var once = true;
var qrcode;
var cmd = "";
var lasttimecmd = "";
var changed = true;

function dcmd(cmd, id) {
    var x;
    var i;
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
  if(document.getElementById("startmsg") !== null)
  {
    var mtype = "o";
	var openb = "\[";
	var closeb = "\]";
	var pos = dcmd("","sp");
	
   
	cmd = "";
	
	if(document.getElementById("permanent").checked === true)
	{
	//	cmd = "!RESET!30NQ";
		mtype = "!";
    }
	
    if(document.getElementById("gps").checked === true)
    {
		cmd = cmd + "g1" + mtype + "MLFIN=0";	
	}
	else
	{
		cmd = cmd + "g0";
	}
	
    cmd = cmd + mtype + "MBRNO=" + document.getElementById("offset").value + mtype + "MBURN=\"(" + document.getElementById("hsize").value + "," + document.getElementById("vsize").value + ")" + document.getElementById("startmsg").value + openb + pos + document.getElementById("addtime").value + document.getElementById("adddate").value;
	cmd = dcmd(cmd, "am");
	cmd = cmd + closeb + document.getElementById("endmsg").value + "\"";
	
	if(document.getElementById("erase").checked === true)
	{
		cmd = mtype + "MBURN=\"\"";
	}
  }
  else
  {
    cmd = "oMBURN=\"\"";
  }

  if(document.getElementById("hsize") !== null)
  {
	var h = document.getElementById("hsize").value;
	var v = document.getElementById("vsize").value;
 
	document.getElementById("hstext").innerHTML = h;
	document.getElementById("vstext").innerHTML = v;
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
  
  var t = setTimeout(timeLoop, 50);
}

function myReloadFunction() {
  location.reload();
}

makeQR();
timeLoop();
</script>
