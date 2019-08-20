<script src="jquery.min.js"></script>
<script src="qrcode.js"></script>
<style>
        #qrcode{
            height: 360px;
            width: 360px;
            margin: 20px;
        }
        div{
            height: 360px;
            width: 360px;
            margin: 20px;
            display: inline-block;
        }
</style>
# QR Time

<div id="qrcode"></div>

<script>
var once = true;
var qrcode;
var count = 0;
var cmd = "";

function makeQR() {	
  if(once == true)
  {
    qrcode = new QRCode(document.getElementById("qrcode"), 
    {
      text : "oT0",
      width : 400,
      height : 400,
      correctLevel : QRCode.CorrectLevel.H
    });
    once = false;
  }
}

function timeLoop()
{
  count++;
  cmd = "oT"+count;
  qrcode.clear(); 
  qrcode.makeCode(cmd);
  var t = setTimeout(timeLoop, 33);
}

function myReloadFunction() {
  location.reload();
}

makeQR();
timeLoop();

</script>

## ver 0.16
