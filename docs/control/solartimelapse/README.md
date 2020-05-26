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

# Simplified Sunset and Sunrise Time-lapses

The Labs's firmware can use the GPS to get a world position, then calculate the time for pretty solar events.  To ensure the accurate of your location, it make take a couple of minutes to get a high precision GPS look (you will need to be outdoors.)

## Time-lapse Calculator

Start <input type="range" id="tlmin" name="tlmin" min="0" max="60" value="15"><label for="tlmin"></label><b id="minstext"></b> minutes before.

<input type="radio" id="sr1" name="solar" value="TL"><label for="sr1">Sunrise</label> 
<input type="radio" id="sr2" name="solar" value="TC"><label for="sr2">Sunset</label><br>
  
End after <input type="range" id="tlendmin" name="tlendmin" min="10" max="120" value="30"><label for="tlendmin"></label><b id="minsendtext"></b> minutes capture.
 
<div id="settingsNightlapse">
<b>Nightlapse Interval:</b>&nbsp;&nbsp;
  <input type="radio" id="fpsnight1" name="fpsnight" value="p"     ><label for="fpsnight1">cont. </label>&nbsp;
  <input type="radio" id="fpsnight2" name="fpsnight" value="p.10"  ><label for="fpsnight2">10s </label>&nbsp;
  <input type="radio" id="fpsnight3" name="fpsnight" value="p.15"  ><label for="fpsnight3">15s </label>&nbsp;
  <input type="radio" id="fpsnight4" name="fpsnight" value="p.30"  ><label for="fpsnight4">30s </label>&nbsp;
  <input type="radio" id="fpsnight5" name="fpsnight" value="p.60"  ><label for="fpsnight5">60s </label>&nbsp;
  <input type="radio" id="fpsnight6" name="fpsnight" value="p.120" ><label for="fpsnight6">2min </label>&nbsp;
  <input type="radio" id="fpsnight7" name="fpsnight" value="p.300" ><label for="fpsnight7">5min </label>&nbsp;
  <input type="radio" id="fpsnight8" name="fpsnight" value="p.1800"><label for="fpsnight8">30min </label>&nbsp;
  <input type="radio" id="fpsnight9" name="fpsnight" value="p.3600"><label for="fpsnight9">60min </label>&nbsp;
  <input type="radio" id="fpsnight10" name="fpsnight" value="" checked><label for="fpsnight10">not set</label><br><br>
</div>

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
var cmd = "oC30mNLeA";

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
	cmd = "oC30mNLeA";
	cmd = dcmd(cmd,"fpsnight");
			
	var mins = parseInt(document.getElementById("tlmin").value);	
	document.getElementById("minstext").innerHTML = mins;	
	
	mins *= 60;
	
	var endmins = parseInt(document.getElementById("tlendmin").value);	
	document.getElementById("minsendtext").innerHTML = endmins;	
	
	endmins *= 60;
	
	cmd = cmd + "!s-" + mins + "S!" + endmins + "E" + "!1R";
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
