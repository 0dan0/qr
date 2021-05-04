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

# Add a Logo to Your Videos

Generally, altering your video images with logos is best done as part of editing, preserving the best image quality and the greatest flexibility. However, when live-streaming or using the webcam features, the aren't editing steps. This Labs enhancement is for when you video production doesn't have, or has limited time for, the editing step.     
 
Logo offset horizontally <input type="range" style="width: 200px;" id="xpos" name="xpos" min="0" max="600" value="20"><label for="xpos"></label> <b id="xpostxt">20</b><br>
Logo offset vertically <input type="range" style="width: 200px;" id="ypos" name="ypos" min="0" max="400" value="20"><label for="ypos"></label> <b id="ypostxt">20</b>

**Screen Placement** <br>
  &nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" id="sp1" name="placement" value="TL"> <label for="sp1">Top Left    </label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <input type="radio" id="sp2" name="placement" value="TC"> <label for="sp2">Top Center  </label>&nbsp;&nbsp;&nbsp;&nbsp;
  <input type="radio" id="sp3" name="placement" value="TR"> <label for="sp3">Top Right   </label><br>
  &nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" id="sp4" name="placement" value="ML"> <label for="sp4">Mid Left    </label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <input type="radio" id="sp5" name="placement" value="MR"> <label for="sp5">Mid Right   </label><br>
  &nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" id="sp6" name="placement" value="BL"> <label for="sp6">Lower Left  </label>&nbsp;
  <input type="radio" id="sp7" name="placement" value="BC"> <label for="sp7">Lower Center</label>&nbsp;
  <input type="radio" id="sp8" name="placement" value="BR" checked> <label for="sp8">Lower Right </label>&nbsp;<br>
  
**Your logo's filename.png:**  <input type="text" id="pngname" value=""><br>
Note: Logo must be in PNG format, and stored within the MISC folder of the camera's SD card. The logo or graphic can use transparency with the alpha channel. The PNG files must be less than 64kBytes with fewer than 64k pixels, e.g. Logo overlay of 400x100 works, but 400x200 will not. The smaller the better for demanding video modes like 4K60, 2.7K120 and 1080p240.

Right click on this transparent logo to download and try it out:<br>
![GoPro-LogoTiny.png](GoPro-LogoTiny.png)<br>Save to your SD card within the MISC folder.

<center>
<div id="qrcode"></div>
<br>
</center>

Make the logo permanently active: **Are you sure? (Risky)**  <input type="checkbox" id="permanent" name="permanent"> <label for="permanent">Permanent Overlay</label> <input type="checkbox" id="erase" name="erase"> <label for="erase">Erase</label><br>

QR Command: <b id="qrtext">time</b><br>

		
Compatibility: Labs enabled HERO9 only
        
## ver 1.00
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
		mtype = "!";
    }

    cmd = mtype + "MBRNX=" + document.getElementById("xpos").value   + mtype + "MBRNY=" + document.getElementById("xpos").value   + mtype + "MBRNP=\"" + pos + "\""   + mtype + "MLOGO=\"" + document.getElementById("pngname").value + "\"";
	
	if(document.getElementById("erase").checked === true)
	{
		cmd = mtype + "MLOGO=\"\"";
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
