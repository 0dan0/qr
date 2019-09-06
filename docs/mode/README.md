<script src="../jquery.min.js"></script>
<script src="../qrcode.js"></script>
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
# Personalize via QR Code

<div id="qrcode"></div>
<br>
Owner text: <input type="text" id="addname" value=""><br>

        
## ver 0.187

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
