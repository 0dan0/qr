<script src="jquery.min.js"></script>
<script src="qrcode.js"></script>
<style>
        #qrcode{
            width: 90%;
            margin-left: auto;
            margin-right: auto;
            display: block;
        }
        div{
            width: 90%;
            margin-left: auto;
            margin-right: auto;
            display: block;
        }
</style>
# Precision Date and Time

<center><div id="qrcode"></div></center>
<br>
QR Command: <b id="qrtext"></b>
        
## ver 0.198

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
      correctLevel : QRCode.CorrectLevel.M
    });
    once = false;
  }
}
function padTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}
function timeLoop()
{
  var today;
  var yy,mm,dd,h,m,s;
  var ms;
  
  today = new Date();
  yy = today.getFullYear() - 2000;
  mm = today.getMonth() + 1;
  dd = today.getDate();
  h = today.getHours();
  m = today.getMinutes();
  s = today.getSeconds();
  ms = today.getMilliseconds();
  yy = padTime(yy);
  mm = padTime(mm);
  dd = padTime(dd);
  h = padTime(h);
  m = padTime(m);
  s = padTime(s);
  ms = Math.floor(ms / 10); // hundredths
  ms = padTime(ms);

  cmd = "oT" + yy + mm + dd + h + m + s + "." + ms;
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
