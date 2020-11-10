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

# RTMP Live-Stream Setup (requires Labs on HERO9)

Prerequisites for Live-streaming
        Preparation (well before you need to Live-stream): 
        1. You need to have stored the WiFi credentials on the camera. 
		2. Know the RMTP URL address that you intend to stream to.

		When both of these a stored within the camera's non-volatile memory, you can Live-stream with a single QR Code at any time (while you are still in WiFi range.)
		
		
		
## Pre-store Your RTMP Address for Live 

Enter the full RTMP address here: <input type="text" id="rtmptxt" value=""><br>(e.g. rtmp://live.twitch.tv/app/live_5554355...)<br>

For Twitch users:
	1. Select your base URL From this [list of servers](https://stream.twitch.tv/ingests/).
	2. Login to you Twitch account, and get your [stream key](https://link.twitch.tv/myChannelSettings) from your channel settings.
	
	![Twitch Channel Settings](streamkey.png)


<center>
<div id="qrcode"></div>
<br>
</center>

<b>Scan the code above once for the camera to always know the target RTMP address.</b>

		

		!MRTMP=”rtmp://your.twitch.address.com/credentials" The live-stream can be to any working RTMP address.  Again this typically secure information that should not be printed. 
        The camera will save this non-volatile memory, and when not store in any accessible metadata. 
        
    When you need to Live-stream, you need to be connected to the WiFi network, such as your home WiFi, work network or mobile access point.
        1. To join the WiFi network use the command !W
        2. To start the Live-stream use the command !Gxy where x is the option resolution (S = Small 480p, M - Medium 720p or L - Large 1080p) and y is the optional capture to SD Card (C = Capture.)  e.g. !GLC
    Both on these can be in joined into one QR Code to get on the network and start a Live-stream — the whole process can take a little as 12 seconds.





Prerequisites for Live-streaming
        Preparation: 
        1. You need to have stored the WiFi credentials on the camera. using the new Metadata JOIN, in the format !MJOIN="YourSSID:YourPassword"  e.g. !MJOIN=”HomeNetwork:Pass1234”  As this QR Code is not secure, your code should not be printed, and this is done in advance.
        2. Store the RMTP URL address in the format  !MRTMP=”rtmp://your.twitch.address.com/credentials" The live-stream can be to any working RTMP address.  Again this typically secure information that should not be printed. 
        The camera will save this non-volatile memory, and when not store in any accessible metadata. 
        
    When you need to Live-stream, you need to be connected to the WiFi network, such as your home WiFi, work network or mobile access point.
        1. To join the WiFi network use the command !W
        2. To start the Live-stream use the command !Gxy where x is the option resolution (S = Small 480p, M - Medium 720p or L - Large 1080p) and y is the optional capture to SD Card (C = Capture.)  e.g. !GLC
    Both on these can be in joined into one QR Code to get on the network and start a Live-stream — the whole process can take a little as 12 seconds.




To live stream via QR Code, you will have to manually pair the GoPro with the network (once), via the GoPro App. Follow these steps.


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
      width : 360,
      height : 360,
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
