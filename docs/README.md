<script src="jquery.min.js"></script>
<script src="qrcode.js"></script>
<script>
var qrcode = new QRCode(document.getElementById("qrcode"), 
    {
      text : "GP",
      width : 400,
      height : 400,
      correctLevel : QRCode.CorrectLevel.M
    });
</script>

# QR Time

<div id="qrcode" style="margin:40px;"></div>

<p id="demo">Test.</p>

<button type="button" onclick='document.getElementById("demo").innerHTML = "Hello"'>Click Me!</button>


## ver 0.134
