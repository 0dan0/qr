<script src="../jquery.min.js"></script>
<script src="../qrcodeborder.js"></script>
<style>
        #qrcode{
            height: 400px;
            width: 400px;
            margin: 0px;
        }
        div{
            height: 400px;
            width: 400px;
            margin: 0px;
            display: inline-block;
        }
</style>
# Personalize via QR Code

Your name here: <input type="text" id="addname" value=""><br>
<div id="qrcode"></div>

        
## ver 0.2

<script>
var once = true;
var qrcode;
var cmd = "";

function makeQR() {	
  if(once == true)
  {
    qrcode = new QRCode(document.getElementById("qrcode"), 
    {
      text : "!MOWNR=\"\"",
      width : 400,
      height : 400,
      correctLevel : QRCode.CorrectLevel.M
    });
    once = false;
  }
}

function timeLoop()
{
  if(document.getElementById("addname") != null)
  {
    cmd = "!MOWNR=\"" + document.getElementById("addname").value + "\"";
  }
  else
  {
    cmd = "!MOWNR=\"\"";
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
