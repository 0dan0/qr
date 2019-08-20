<script src="jquery.min.js"></script>
<script src="qrcode.js"></script>
<style>
        #qrcode{
            height: 400px;
            width: 400px;
            margin: 40px;
        }
        div{
            height: 400px;
            width: 400px;
            margin: 40px;
            display: inline-block;
        }
</style>
# QR Time

<div id="qrcode"></div>

<p id="demo">Test.</p>

<button type="button" onclick='document.getElementById("demo").innerHTML = "Hello"'>Click Me!</button>

<script>
var qrcode = new QRCode(document.getElementById("qrcode"), 
    {
      text : "GP",
      width : 400,
      height : 400,
      correctLevel : QRCode.CorrectLevel.M
    });
</script>


## ver 0.135
