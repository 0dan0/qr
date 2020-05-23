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

# Add An Overlay to Video

This is more for security applications like a dash cam setup, rather than creative application, as it will modify the video image with text that can't be removed.
 
Overlay Horizontal Size <input type="range" id="hsize" name="hsize" min="20" max="400"><label for="hsize"></label>

Overlay Vertical Size <input type="range" id="vsize" name="vsize" min="20" max="400"><label for="vsize"></label>

Offset from the edge <input type="range" id="offset" name="offset" min="10" max="150"><label for="offset"></label>

Any start message here: <input type="text" id="startmsg" value=""><br>

<b>Add Time with format</b>

 * HH - Hour
 * MM - Minute
 * SS - Second
 * aa - am/pm (also switches off 24 hour time)
 * AA - AM/PM (also switches off 24 hour time)
	
<input type="text" id="addtime" value="HH:MM:SSaa">

<b>Add Date with format</b>

 * yy - year in two digit format
 * yyyy - year in four digit format
 * mm - month (1-12)
 * dd - day (1-31)
	
<input type="text" id="adddate" value="mm-dd-yyyy">
  
Any end message here: <input type="text" id="endmessage" value=""><br>
  
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
    cmd = "oMBURN=\"" + document.getElementById("startmsg").value + "\"";
  }
  else
  {
    cmd = "oMBURN=\"\"";
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
