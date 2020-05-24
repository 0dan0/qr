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

# Add an Overlay to Video

This is more for security applications like a dash cam setup, rather than creative application, as it will modify the video image with text that can't be removed.

If either horizontal or vertical size is zero, the size will be computed automatically.
 
Overlay vertical size <input type="range" id="vsize" name="vsize" min="0" max="400" value="60"><label for="vsize"></label> <b id="vstext">60</b>

Overlay horizontal size <input type="range" id="hsize" name="hsize" min="0" max="400" value="0"><label for="hsize"></label> <b id="hstext">0</b>

Offset from the edge <input type="range" id="offset" name="offset" min="10" max="150" value="10"><label for="offset"></label> <b id="offtext">10</b>

Any start message here: <input type="text" id="startmsg" value=""><br>

**Add Time with format**  <input type="text" id="addtime" value="HH:MM:SSaa ">

 * HH - Hour
 * MM - Minute
 * SS - Second
 * aa - am/pm (also switches off 24 hour time)
 * AA - AM/PM (also switches off 24 hour time)

**Add Date with format**  <input type="text" id="adddate" value="mm-dd-yyyy">

 * yy - year in two digit format
 * yyyy - year in four digit format
 * mm - month (1-12)
 * dd - day (1-31)
  
Any end message here: <input type="text" id="endmsg" value=""><br>

**Screen Placement** <br>
  &nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" id="b1" name="placement" value="TL"><label for="b1">Top Left    </label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <input type="radio" id="b2" name="placement" value="TC"><label for="b2">Top Center  </label>&nbsp;&nbsp;&nbsp;&nbsp;
  <input type="radio" id="b3" name="placement" value="TR"><label for="b3">Top Right   </label><br>
  &nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" id="b4" name="placement" value="ML"><label for="b4">Mid Left    </label>&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <input type="radio" id="b5" name="placement" value="MR"><label for="b5">Mid Right   </label><br>
  &nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" id="b6" name="placement" value="BL"><label for="b6">Lower Left  </label>&nbsp;
  <input type="radio" id="b7" name="placement" value="BC"><label for="b7">Lower Center</label>&nbsp;
  <input type="radio" id="b8" name="placement" value="BR" checked><label for="b8">Lower Right </label>&nbsp;<br>
  
<center>
<div id="qrcode"></div>
<br>
</center>
QR Command: <b id="qrtext">time</b><br>
        
## ver 1.0
[BACK](..)

<script>
var once = true;
var qrcode;
var cmd = "";

function makeQR() 
{	
  if(once == true)
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
  if(document.getElementById("startmsg") != null)
  {
	var openb = "\[";
	var closeb = "\]";
    cmd = "oMBRNO=" + document.getElementById("offset").value
	+ oMBURN=\"(" 
	+ document.getElementById("hsize").value + "," 
	+ document.getElementById("vsize").value + ")" 	
	+ document.getElementById("startmsg").value + openb
	+ document.getElementById("addtime").value 
	+ document.getElementById("adddate").value + closeb
	+ document.getElementById("endmsg").value	
	+ "\"";
  }
  else
  {
    cmd = "oMBURN=\"\"";
  }

  if(document.getElementById("hsize") != null)
  {
	var h = document.getElementById("hsize").value;
	var v = document.getElementById("vsize").value;
	var o = document.getElementById("offset").value;
 
	document.getElementById("hstext").innerHTML = h;
	document.getElementById("vstext").innerHTML = v;
	document.getElementById("offtext").innerHTML = o;
  }
  
  qrcode.clear(); 
  qrcode.makeCode(cmd);
  document.getElementById("qrtext").innerHTML = cmd;
  var t = setTimeout(timeLoop, 50);
}

function myReloadFunction() {
  location.reload();
}

makeQR();
timeLoop();

</script>
