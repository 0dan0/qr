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

# QR Control Quick Command
      
<div id="qrcode"></div>
	  
QR Command: <b id="qrtext"></b><br>

Manual Command: <input type="text" id="addcmd" value="">
	  
## version 1.01

<script>
       
var once = true;
var qrcode;
var cmd = ""; 
var lasttimecmd = ""; 
let urlParams = new URLSearchParams(document.location.search);
cmd = urlParams.get('cmd')

document.getElementById("qrtext").innerHTML = cmd;
document.getElementById("addcmd").innerHTML = cmd;

function makeQR() 
{	
  if(once === true)
  {
    qrcode = new QRCode(document.getElementById("qrcode"), 
    {
      text : cmd,
      width : 360,
      height : 360,
      correctLevel : QRCode.CorrectLevel.M
    });
    once = false;
  }
}

function timeLoop()
{  
  qrcode.clear(); 
  qrcode.makeCode(cmd);
  
  if(document.getElementById("addcmd") !== null)
  {
	var addcmd = document.getElementById("addcmd").value;
	if(addcmd.length > 0)
		cmd = addcmd;
  }	
  
  if(cmd != lasttimecmd)
  {
	changed = true;
	lasttimecmd = cmd;
  }
	
  if(changed === true)
  {
	document.getElementById("qrtext").innerHTML = cmd;
	changed = false;
  }
	
  var t = setTimeout(timeLoop, 100);
}

function myReloadFunction() {
  location.reload();
}

makeQR();
timeLoop();

makeQR();

</script>
