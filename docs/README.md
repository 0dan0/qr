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
function makeQR() {	
  if(once == true)
  {
    qrcode = new QRCode(document.getElementById("qrcode"), 
    {
      text : "GP",
      width : 400,
      height : 400,
      correctLevel : QRCode.CorrectLevel.M
    });
  }
  once = false;
}

makeQR();

</script>


## ver 0.151
