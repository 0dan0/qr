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

# Chapters Size Control

<input type="checkbox" id="lchptrs" name="lchptrs" checked> 
<label for="lchptrs">Enable Large Chapters</label><br>
<center>
<div id="qrcode"></div>
<br>
</center>
Warning: Larger chapters may not work everywhere in the ecosystem, even the camera will not playback files larger than 4GB in this current firmware. Yet the file are valid, and work in FFMPEG, VLC and other industry tools. So this one of the more experiment features.  
        
## ver 1.00
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
      text : "!M64BT=1",
      width : 360,
      height : 360,
      correctLevel : QRCode.CorrectLevel.M
    });
    once = false;
  }
}

function timeLoop()
{
  cmd = "!M64BT=0";
  if(document.getElementById("lchptrs") != null)
  {
    if(document.getElementById("lchptrs").checked == true)
    {
      cmd = "!M64BT=1";
    }
  }

  qrcode.clear(); 
  qrcode.makeCode(cmd);
  var t = setTimeout(timeLoop, 50);
}

function myReloadFunction() {
  location.reload();
}

makeQR();
timeLoop();

</script>
