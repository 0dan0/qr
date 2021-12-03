# Create a GoPro Event to Share Your Footage

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

GoPro edits are great, edits from multiple GoPros, from multiple angles, even more so. Combining footage from a friend's camera or group of cameras has been difficult and very manual and labor intensive. This can be much easier using the GoPro Cloud, as GoPro Subscription users footage automatically cloud syncs, so now all we need to know is what footage is shared. GoPro Events make sharing easy.

Create an unique Event. Your Event's name and the GPS proximity of your cameras, makes sure only Event participants can auto share footage. Create an Event below, and print or screen grab the code, and sure is will all your Event friend. Scanning the Event, and users accepting the Event on camera, is all that is required from GoPro Subscribers.


**Your Event's Name (minimum 8 characters):**  <input type="text" id="eventname" value=""><br>

Event Duration: <input type="range" style="width: 300px;" id="tlend" name="tlend" min="1" max="300" value="6"><label for="tlend"></label> <b id="endtext"></b><br>

<input type="checkbox" id="startnow" name="startnow"> <label for="startnow">Create an Event stating now</label><br>
&nbsp;&nbsp;&nbsp; or<br> 
Event Start Year: <input type="range" style="width: 150px;" id="yrstrt" name="yrstrt" min="21" max="99" value="21"><label for="yrstrt"></label> <b id="startyr"></b><br>
Event Start Month: <input type="range" style="width: 150px;" id="mnstrt" name="mnstrt" min="1" max="12" value="initmn"><label for="mnstrt"></label> <b id="startmn"></b><br>
Event Start Day: <input type="range" style="width: 150px;" id="dystrt" name="dystrt" min="1" max="31" value="initdy"><label for="dystrt"></label> <b id="startdy"></b><br>
Event Start Time: <input type="range" style="width: 300px;" id="tlstrt" name="tlstrt" min="1" max="143" value="48"><label for="tlstrt"></label> <b id="starttm"></b><br>


<center>
<div id="qrcode"></div>
<br>
</center>

QR Command: <b id="qrtext">time</b><br>

		
**Compatibility:** Now You See Me enabled HERO10 cameras only
        
## ver 1.00

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


function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function padTime(i) {
  if (i < 10) {i = "0" + i;}  // add zero in front of numbers < 10
  return i;
}


function makeQR() 
{	
  if(once === true)
  {
    qrcode = new QRCode(document.getElementById("qrcode"), 
    {
      text : "\"Need an Event name\"",
      width : 360,
      height : 360,
      correctLevel : QRCode.CorrectLevel.M
    });
	
	var today;
	var yy,mm,dd,h,m,s;
	today = new Date();
	yy = today.getFullYear() - 2000;
	mm = today.getMonth() + 1;
	dd = today.getDate();
	h = today.getHours();
	m = today.getMinutes();
	s = today.getSeconds();
	//yy = padTime(yy);
	//mm = padTime(mm);
	//dd = padTime(dd);
	hh = padTime(h);
	mn = padTime(m);
	ss = padTime(s);
	
	document.getElementById("startyr").innerHTML = "20" + yy;
	document.getElementById("startmn").innerHTML = mm;
	document.getElementById("startdy").innerHTML = dd;
	
	document.getElementById("yrstrt").value = yy;
	document.getElementById("msstrt").value = mm;
	document.getElementById("dystrt").value = dd;	
	
    once = false;
  }
}


function timeLoop()
{
	if(document.getElementById("eventname") !== null)
	{	
		var filename = document.getElementById("eventname").value;

		cmd = "!MEVNT=\"" + filename;
		var fhours = 0.5;

		if(document.getElementById("tlstrt") !== null)
		{
			var start = parseInt(document.getElementById("tlstrt").value);
			var startmins = start*10;
			
			var dur = parseInt(document.getElementById("tlend").value);
			var durmins = dur*15;

			var starthourstime = Math.trunc((startmins-1) / 60);
			var startminstime = (startmins-1) - starthourstime * 60;	

			var endhourstime = Math.trunc(durmins / 60);
			var endminstime = durmins - endhourstime * 60;

			var stxt = pad(starthourstime, 2) + ":" + pad(startminstime, 2);
			var etxt = pad(endhourstime, 2) + ":" + pad(endminstime, 2);

			document.getElementById("starttm").innerHTML = stxt;
			document.getElementById("endtext").innerHTML = etxt;

			var y = document.getElementById("yrstrt").value;
			var mo = document.getElementById("mnstrt").value; 
			var d = document.getElementById("dystrt").value; 
		
			document.getElementById("startyr").innerHTML = "20" + pad(y,2);
			document.getElementById("startmn").innerHTML = mo;
			document.getElementById("startdy").innerHTML = d;
	
			if(document.getElementById("startnow").checked === true)
			{
				cmd = cmd + "+" + endhourstime + "." + pad(Math.trunc(endminstime*100/60), 2) + "\"";
			}
			else
			{
			
				cmd = cmd + pad(y, 2)+ pad(mo, 2) + pad(d, 2) + pad(startminstime, 2) + "+" + endhourstime + "." + pad(Math.trunc(endminstime*100/60), 2) + "\"";
			}
		}
		
		
	}
	else
	{
		cmd = "\"Need an Event name\"";
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
