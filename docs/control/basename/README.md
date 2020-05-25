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

# Altered File Naming via QR Code

You GoPro HERO8 will typically name your files something like GOPR3606.JPG and GH013607.MP4.  If you format your media, and factory reset your camera, you can change the file counter back to zero, but otherwise, you have no control over the file name, until this Labs hack. This intended for high volume multiple camera production, where simply naming the source media different will ease post productions. WARNING: The GoPro App on mobile will not support these renamed files.

Your base filename here: <input type="text" id="addname" value="">  Up to eight characters. <br>
e.g. "CAMERA06"<br> 
<center>
<div id="qrcode"></div>

<input type="checkbox" id="permanent" name="permanent"> <label for="permanent">Make this name change permanent</label><br>
Can be restored by setting the basename to nothing.

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
      text : "!MOWNR=\"\"",
      width : 360,
      height : 360,
      correctLevel : QRCode.CorrectLevel.M
    });
    once = false;
  }
}

function timeLoop()
{
  var mtype = "o";
	
  if(document.getElementById("permanent").checked == true)
	type = "!";
		
  if(document.getElementById("addname") != null)
  {
    cmd = type + "MBASE=\"" + document.getElementById("addname").value + "\"";
  }
  else
  {
    cmd = type + "MBASE=\"\"";
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
