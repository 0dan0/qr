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
var qrcode = new QRCode(document.getElementById("qrcode"), 
    {
      text : "GP",
      width : 360,
      height : 360,
      correctLevel : QRCode.CorrectLevel.M
    });
</script>


## ver 0.15
