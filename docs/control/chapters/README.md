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

<input type="checkbox" id="lc" > Enable Large Chapters 
<div id="qrcode"></div>
        
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
      text : "",
      width : 360,
      height : 360,
      correctLevel : QRCode.CorrectLevel.M
    });
    once = false;
	
    if(document.getElementById("lc") != null)
    {
      if(document.getElementById("lc").checked = true;
    }
  }
}

function timeLoop()
{
  if(document.getElementById("lc") != null)
  {
    if(document.getElementById("lc").checked == true)
    {
      cmd = "!M64BT=1";
    }
    else
    {
      cmd = "!M64BT=0";
    }
  }
  else
  {
    cmd = "!M64BT=0";
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
