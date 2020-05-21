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

# Enable Larger 12GB Chapters

Enable Large Chapters <input type="checkbox" id="largechapter" value="">
        
## ver 1.0
[BACK](..)

<script>
var once = true;
var qrcode;
var cmd = "";


if(document.getElementById("largechapter") != null)
{
	if(document.getElementById("largechapter").checked = true;
}

function makeQR() {	
  if(once == true)
  {
    qrcode = new QRCode(document.getElementById("qrcode"), 
    {
      text : "!M64BT=1",
      width : 360,
      height : 360,
      correctLevel : QRCode.CorrectLevel.M
    });
    once = false;
  }
}

function timeLoop()
{
	if(document.getElementById("largechapter") != null)
	{
		if(document.getElementById("largechapter").checked == true)
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
