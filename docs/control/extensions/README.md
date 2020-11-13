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

# Extensions and Other Smaller Additions

After the release of the the first Labs firmware for HERO8, heard the feedback and added features wherever possible. Some of the more major features got there own page, the rest are documented in this collection.

## Miscellaneous Metadata controls. 

All metadata is written in the form oMwxzy=value(s) or !Mwxzy=value(s) -- where the four character code (4CC) "wxzy" is under your control. !M version will permanently store, oM will store for only this power on time.  Metadata is available to flag your files for special uses, or just label the [camera owner](./owner).  Some particular 4CCs will also change camera behavior and/or enable features. Here is a list of additional metadata driven controls: 

    - **LLTZ=latt,long,timezone** for those want to use Sunset/Sunrise timelapse without waiting for GPS lock, or for when you are shooting a sunset timelapse from indoors.  The metadata is used to store you GPS Location and timezone e.g. !MLLTZ=33.126,-117.327,-8.0  I this case you must used the !M command as solar event timers will shutdown the camera.
    - **QRDR=1** - detect QR Code even while recording.  Normally is disabled to ensure the lowest computing load impact, so not enabling this is the safest. However, it is needed for some cool ideas, like changing a video burnin message in the middle of a live-stream, or changing it exposure with BIAS (see below.) This also allows you to end a capture via a QR Code (!E).
    - **BIAS=ev_value** - This is crude EV compensation for modes that don’t have Protune settings, like Live-stream. e.g. oMBIAS=2.0 
    - **HNDL=x**, where x is 1 to 31, setting the camera ID for a camera. This is for rare scenarios where multiple cameras see the same QR Code, and you only want particular cameras to respond. This combined with **hZ** command where Z is the bit mask for which cameras will follow the command.
        - e.g.   h6mP!S  ← this command will only run of cameras with IDs 2 and 3.
        - e.g.   h1mVh2mPB ← set camera 1 to mode Video and camera 2 to Photo Burst.
    - **DSPL=time**, this will control the amount of time messages are displayed. For users who want there own information display longer. The default is 1 second.  DISP=1 thru 9 is in seconds.  DISP = 10 thru 9999 is in milliseconds.  So for faster messages use !MDISP=100. Set this before setting the owner information, as metadata commands are processed in the order they are stored. 
    - **DSPC=contrast**, this is the contrast for which messages are displayed.  Contrast is from 0 - transparent text background, to 6 - opaque black background
	- **HIST=x** - Displays a histogram with contrast from 1 to 11. e.g. try oMHIST=5
    - **LAPS=1** turn on the burn-in laptime, a hackathon that combined with live-stream auto races
        - **BRNP=”xx”**  this the burnin position TL, TR, BL, BR (default) - T-Top L-Left B-Bottom R-Right
        - **LFIN=latt,long** GPS location for the Lap Line (finish line), using to compute the lap times.
        - **LSRT=”hh:mm”** - Lap times starting at time HH:MM, so you can put it the race start time.
        - **LDVR=”Driver Name”** - displays "Driver", with the name you provide
        - **LRDR=”Rider Name”** - displays "Rider", with the name you provide
        - **LRUN=”Runner Name”** - displays "Runner", with the name you provide
        
- Exposure adjustments.  While you can just see an EV value you can now use x++ to increase from the current EV and x-- to decrease.


- White Balance adjustments, w++ and w-- will increase or decrease white balance.


customization here: <input type="text" id="addcmd" value="">  e.g. **r4p24** Will set 4K at 24p as you default. You can make you own defaults video mode using the [**QR Control Customizer**](../custom), including Protune settings.

<input type="checkbox" id="arch" name="arch" checked> 
<label for="arch">Enable Archive Mode</label><br>
<center>
<div id="qrcode"></div>
<br>
</center>
QR Command: <b id="qrtext">command</b><br>

<br> 
        
## Disabling Archive Mode

Uncheck the above Archive mode checkbox, and scan the new code while the camera is recording.
		
		
## ver 1.00
[BACK](..)

<script>
var once = true;
var qrcode;
var cmd1 = "";
var cmd2 = "";
var lasttimecmd = "";
var changed = true;

function makeQR() 
{	
  if(once === true)
  {
    qrcode = new QRCode(document.getElementById("qrcode"), 
    {
      text : "!MSYNC=1",
      width : 360,
      height : 360,
      correctLevel : QRCode.CorrectLevel.M
    });
    once = false;
  }
}

function timeLoop()
{
	cmd1 = "!E";
	cmd2 = "!MARCH=0\"Archive Mode\\nDisabled\\nShutting-down\"!O";
	if(document.getElementById("arch") !== null)
	{
		if(document.getElementById("arch").checked === true)
		{
			if(document.getElementById("addcmd") !== null)
			{
				cmd1 = cmd1 + "mVdVq1" + document.getElementById("addcmd").value;
			}
			cmd2 = "!MARCH=1\"Archive Mode\\nEnabled\\nShutting-down\"!O";
		}
	}
	
	cmd1 = cmd1 + cmd2;
	
	qrcode.clear(); 
	qrcode.makeCode(cmd1);

	if(cmd1 != lasttimecmd)
	{
		changed = true;
		lasttimecmd = cmd1;
	}

	if(changed === true)
	{
		document.getElementById("qrtext").innerHTML = cmd1;
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
