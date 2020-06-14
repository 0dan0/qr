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

# RTMP Live Stream Setup (requires Labs v1.70.76)

To live stream via QR Code, you will have to manually pair the GoPro with the network (once), via the GoPro App. Follow these steps.

## On Camera:
* enable WiFi.  **Preferences** -> **Connections** -> **Wireless Connections On**
* enable pairing.  **Preferences** -> **Connections** -> **Connect Device** -> **GoPro App**

## Within the GoPro App
* pair and connect, etc. then select **Control Your GoPro**
* Scroll the lower controls to Live / **Set Up Live** (the control is on the far right)
* Select **Live Stream or Other** for RTMP
* Select **Set Up Live**
* Connect to a network, select your select your WiFi hot spot or access point (this will be remembered by the camera)
* Entry a fake RTMP URL as rtmp://  (we don't need the full address yet)
* Press **Set Up Live Stream**, which will make the camera remember the WiFi access point. You can do this more than once if there are multiple access points.

## Pre-store Your RTMP Address for Live 

Enter the full RTMP address here: <input type="text" id="rtmptxt" value=""><br>(e.g. rtmp://live.twitch.tv/app/live_5554355...)<br>

<center>
<div id="qrcode"></div>
<br>
</center>

<b>Scan the code above once for the camera to always know the target RTMP address.</b>


## Launch Your Live Stream 

Select your Resolution:
  <input type="radio" id="rs1" name="rs" value="S"><label for="480p">480p </label>&nbsp;
  <input type="radio" id="rs2" name="rs" value="M" checked><label for="720p">720p </label>&nbsp;
  <input type="radio" id="rs3" name="rs" value="L"><label for="1080p">1080p </label>

Store a high quality copy on camera:
 <input type="checkbox" id="cp" value="t" checked><label for="cp">1080p60 Copy</label><br>

<center>
<div id="qrcode2"></div>
<br>
</center>
QR Command: <b id="qrtext">time</b><br>

<b>Scan the code above to go live in 15-20 seconds</b>

        
## ver 1.00
[BACK](..)

<script>
var once = true;
var qrcode;
var qrcode2;
var cmd = "";
var cmd2 = "";

function makeQR() 
{	
  if(once === true)
  {
    qrcode = new QRCode(document.getElementById("qrcode"), 
    {
      text : "\"Add your RTMP URL\"",
      width : 500,
      height : 500,
      correctLevel : QRCode.CorrectLevel.M
    });
	
    qrcode2 = new QRCode(document.getElementById("qrcode2"), 
    {
      text : "\"Launch your LS\"",
      width : 360,
      height : 360,
      correctLevel : QRCode.CorrectLevel.M
    });
    once = false;
  }
}

function dcmd(cmd, id) {

	if(document.getElementById(id) != null)
	{
		var x = document.getElementById(id).checked;
		if( x == true)
			cmd = cmd + document.getElementById(id).value;
	}
	else
	{
		for (i = 1; i < 15; i++) { 
			var newid = id+i;
			if(document.getElementById(newid) != null)
			{
				var x = document.getElementById(newid).checked;
				if( x == true)
					cmd = cmd + document.getElementById(newid).value;
			}
		}
	}
	return cmd;
}

function timeLoop()
{
  if(document.getElementById("rtmptxt") !== null)
  {
    cmd = "!MRTMP=\"" + document.getElementById("rtmptxt").value + "\"";
  }
  else
  {
    cmd = "\"Add your RTMP URL\"";
  }

  qrcode.clear(); 
  qrcode.makeCode(cmd);
  
  cmd2 = "oW1mVr1080p60!G";
  cmd2 = dcmd(cmd2, "rs");
  if(document.getElementById("cp") != null)
  {
    if(document.getElementById("cp").checked == true)
    {
      cmd2 = cmd2 + "C";
    }
  }
  
  qrcode2.clear(); 
  qrcode2.makeCode(cmd2);
		
  document.getElementById("qrtext").innerHTML = cmd2;
  var t = setTimeout(timeLoop, 50);
}

function myReloadFunction() {
  location.reload();
}

makeQR();
timeLoop();

</script>
