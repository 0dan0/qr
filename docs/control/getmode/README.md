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

# Extract QR Control


<input type="file" id="inputfile"><br>
   
<pre id="output"></pre> 
      
<div id="qrcode"></div>
	  
	  
## version 0.90

<script>
       
var once = true;
var qrcode;
var cmd = "\"Firmware\"";

function makeQR() 
{	
  if(once === true)
  {
    qrcode = new QRCode(document.getElementById("qrcode"), 
    {
      text : "!oMBURN=\"\"",
      width : 360,
      height : 360,
      correctLevel : QRCode.CorrectLevel.M
    });
    once = false;
  }
}


	document.getElementById('inputfile').onchange = function() 
	{
		if (!this.files.length) 
			return;
		findGPMF(this.files[0]);
	};
	
	function decimalToHexString(number)
	{
	  if (number < 0)
	  {
		number = 0xFFFFFFFF + number + 1;
	  }

	  return number.toString(16).toUpperCase();
	}
	
	function findGPMF(file)
	{		
		var CHUNK_SIZE = 0x100000; // more than moov should have
		var offset = 0;	
		var parsertype = 0; // mp4		
		
		var fr=new FileReader(); 
		
		fr.onload=function()
		{
			var view = new Uint8Array(fr.result);
			for (var i = 0; i < view.length-12; ) 
			{
				var qtsize;
				var	fourcc;
				var gptype;
				
				
				if(parsertype == 1) // GMPF is KLV, not LKV
				{
					fourcc =  view[i]<<24; i++;
					fourcc += view[i]<<16; i++;
					fourcc += view[i]<<8; i++;
					fourcc += view[i]; i++;
					
					gptype = view[i]; i++;
					var samplesize = view[i]; i++;
					var samples = view[i]<<8; i++;
					samples += view[i]; i++;
					qtsize = ((samplesize * samples) + 3) & 0xfffffc;
					
					if(gptype != 0)
					{
						if (fourcc === 0x464D5752) //FMWR
						{
							document.getElementById('output').textContent="FMWR";				
							makeQR();
							fds;
						}
					}						
				}
				else
				{
					qtsize =  view[i]<<24; i++;
					qtsize += view[i]<<16; i++;
					qtsize += view[i]<<8; i++;
					qtsize += view[i]; i++;
						
					fourcc =  view[i]<<24; i++;
					fourcc += view[i]<<16; i++;
					fourcc += view[i]<<8; i++;
					fourcc += view[i]; i++;
						
					
					//document.getElementById('atomsize').textContent=qtsize.toString();
					//document.getElementById('atomtype').textContent=decimalToHexString(fourcc);
				
					if(qtsize >= 8)
					{
						if (fourcc === 0x66747970) //ftyp
						{
							qtsize -= 8;
							i += qtsize;
							//document.getElementById('output').textContent="ftyp";
						}
						else if (fourcc === 0x6d646174) //mdat
						{
							qtsize -= 8;
							i += qtsize;
							//document.getElementById('output').textContent="mdat";
							if(i > view.length)
							{
								offset += i;
								seek();
								return;
							}
						}
						else if (fourcc === 0x6d6f6f76) //moov - scan into moov
						{				
							//document.getElementById('output').textContent="moov";
						}
						else if (fourcc === 0x75647461) //udta - scan into udta
						{				
							//document.getElementById('output').textContent="udta";
						}					
						else if (fourcc === 0x47504D46) //GPMF
						{				
							//document.getElementById('output').textContent="GPMF";
							parsertype = 1;
						}
						else
						{
							qtsize -= 8;
							i += qtsize;
						}
					}
				}
			}
			offset += i;
			seek();
		};
		
		seek();
			
		function seek() 
		{
			if (offset >= file.size)
			{
				document.getElementById('output').textContent="done";
				return;
			}
			
			var slice = file.slice(offset, offset + CHUNK_SIZE);
			fr.readAsArrayBuffer(slice);
		}
	}
</script>

