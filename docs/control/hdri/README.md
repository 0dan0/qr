# HDRI Merge (optimized for GoPro MAX2)

<fieldset>
  <legend>Inputs</legend>
  <div class="row">
    <input id="files" type="file" accept="image/jpeg" multiple />
    <button id="run">Merge HDR</button>
    <button id="saveHdr" disabled>Download .HDR</button>
    <button id="saveJpg" disabled>Download Preview JPG</button>
  </div>
  <div class="row">
    <label>Preview exposure: <input id="previewExp" type="number" step="0.1" value="2.0" title="Photographic exposure for preview"></label>
  </div>
</fieldset>

<fieldset>
  <legend>Progress</legend>
  <div id="stage">Idle</div>
  <progress id="overall" value="0" max="100"></progress>
  <div class="muted" style="margin-top:6px;">Per-file</div>
  <progress id="perfile" value="0" max="100"></progress>
</fieldset>

<fieldset>
  <legend>Preview (tone-mapped)</legend>
  <canvas id="preview"></canvas>
</fieldset>

<fieldset>
  <legend>Log</legend>
  <pre id="log" aria-live="polite"></pre>
</fieldset>

<script src="https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/lite.umd.js"></script>
<script>
/* ===================== Config & constants ===================== */
const KSIZE        = 9;         // Gaussian blur kernel (odd) in float
const WHITE_PCT    = 99.0;      // robust white normalization percentile
const SHORT_EXPOSURE_T = 2e-5;  // 0.00002s threshold for "very short" exposure (Python parity)
const SUN_BLUR1    = 15;
const SUN_BLUR2    = 31;
const CLIPPED_THRESH = 0.99;    // test threshold in linear (post-blur)
const CLIPPED_COUNT  = 1000;    // number of clipped pixels to consider "has clipped sun"

/* ===================== Helpers / UI ===================== */
const $ = sel => document.querySelector(sel);
const logEl = $('#log');
function logLine(msg, cls='') {
  const line = document.createElement('div');
  if (cls) line.className = cls;
  line.textContent = msg;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}
function setStage(msg) { $('#stage').textContent = msg; }
function setOverall(pct) { $('#overall').value = Math.max(0, Math.min(100, pct)); }
function setPerFile(pct) { $('#perfile').value = Math.max(0, Math.min(100, pct)); }
function nextFrame() { return new Promise(r => requestAnimationFrame(() => r())); }

/* ===================== sRGB → Linear (true EOTF) ===================== */
function srgbToLinear_u8(imgData) {
  const { data, width, height } = imgData;
  const out = new Float32Array(width * height * 3);
  for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
    const sr = data[i]   / 255;
    const sg = data[i+1] / 255;
    const sb = data[i+2] / 255;
    const r = Math.pow(sr, 2.2);
    const g = Math.pow(sg, 2.2);
    const b = Math.pow(sb, 2.2);
    out[j] = r; out[j+1] = g; out[j+2] = b;
  }
  return out;
}

function gaussianBlurFloatRGB(floatRGB, w, h, ksize=5) {
  if (!(Number.isInteger(ksize) && ksize>1 && (ksize%2)===1)) return floatRGB;
  const half = (ksize-1)/2;
  const sigma = 0.3*((ksize-1)*0.5 - 1) + 0.8;
  const kern = [];
  let sum = 0;
  for (let k=-half;k<=half;k++){ const v = Math.exp(-(k*k)/(2*sigma*sigma)); kern.push(v); sum+=v; }
  for (let i=0;i<kern.length;i++) kern[i] /= sum;

  const tmp = new Float32Array(floatRGB.length);
  const out = new Float32Array(floatRGB.length);

  // Horizontal
  for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
      let r=0,g=0,b=0;
      for (let k=-half;k<=half;k++){
        const xx = Math.max(0, Math.min(w-1, x+k));
        const p = (y*w+xx)*3;
        const wgt = kern[k+half];
        r += floatRGB[p  ]*wgt;
        g += floatRGB[p+1]*wgt;
        b += floatRGB[p+2]*wgt;
      }
      const o = (y*w+x)*3;
      tmp[o]=r; tmp[o+1]=g; tmp[o+2]=b;
    }
  }
  // Vertical
  for (let y=0; y<h; y++) {
    for (let x=0; x<w; x++) {
      let r=0,g=0,b=0;
      for (let k=-half;k<=half;k++){
        const yy = Math.max(0, Math.min(h-1, y+k));
        const p = (yy*w+x)*3;
        const wgt = kern[k+half];
        r += tmp[p  ]*wgt;
        g += tmp[p+1]*wgt;
        b += tmp[p+2]*wgt;
      }
      const o = (y*w+x)*3;
      out[o]=r; out[o+1]=g; out[o+2]=b;
    }
  }
  return out;
}


/**
 * In-place separable Gaussian blur on a rectangular ROI of a Float32 RGB image.
 *
 * @param {Float32Array} floatLinearRGB - Interleaved RGB (float) buffer, length = pitch * height * 3
 * @param {number} pitch - Image width (pixels per row)
 * @param {number} x1 - ROI left (inclusive)
 * @param {number} y1 - ROI top (inclusive)
 * @param {number} x2 - ROI right (exclusive)
 * @param {number} y2 - ROI bottom (exclusive)
 * @param {number} ksize - Odd kernel size (e.g., 3,5,7,9...)
 */
function gaussianBlurROI(floatLinearRGB, pitch, x1, y1, x2, y2, ksize) {
  // ---- Validate & fast exits ----
  if (!Number.isInteger(ksize) || ksize < 3 || (ksize & 1) === 0) return;
  if (x2 <= x1 || y2 <= y1) return; // empty
  // Clamp ROI to image bounds (we don't know height, but we use indices via pitch & y)
  // Caller should ensure bounds are valid; we still defensively clamp to >=0.
  x1 = Math.max(0, x1|0); y1 = Math.max(0, y1|0);
  x2 = x2|0; y2 = y2|0;

  const rw = x2 - x1;                 // ROI width
  const rh = y2 - y1;                 // ROI height
  const chans = 3;
  const half = (ksize - 1) >> 1;

  // ---- Build 1D Gaussian kernel ----
  const sigma = 0.3 * ((ksize - 1) * 0.5 - 1) + 0.8; // common heuristic
  const kern = new Float32Array(ksize);
  let sum = 0;
  for (let i = -half, j = 0; i <= half; i++, j++) {
    const v = Math.exp(-(i * i) / (2 * sigma * sigma));
    kern[j] = v; sum += v;
  }
  for (let j = 0; j < ksize; j++) kern[j] /= sum;

  // ---- Temp buffers for ROI (horizontal pass -> tmp, vertical -> out) ----
  const tmp = new Float32Array(rw * rh * chans);
  const out = new Float32Array(rw * rh * chans);

  // ---- Horizontal pass (within ROI, clamp to ROI edges) ----
  for (let ry = 0; ry < rh; ry++) {
    const gy = y1 + ry;
    for (let rx = 0; rx < rw; rx++) {
      const gx = x1 + rx;

      let accR = 0, accG = 0, accB = 0;
      for (let k = -half, j = 0; k <= half; k++, j++) {
        let sx = rx + k;
        if (sx < 0) sx = 0;
        else if (sx >= rw) sx = rw - 1;

        const srcIdx = ((gy * pitch) + (x1 + sx)) * chans;
        accR += floatLinearRGB[srcIdx    ] * kern[j];
        accG += floatLinearRGB[srcIdx + 1] * kern[j];
        accB += floatLinearRGB[srcIdx + 2] * kern[j];
      }

      const dstIdx = (ry * rw + rx) * chans;
      tmp[dstIdx    ] = accR;
      tmp[dstIdx + 1] = accG;
      tmp[dstIdx + 2] = accB;
    }
  }

  // ---- Vertical pass (within ROI, clamp to ROI edges) ----
  for (let ry = 0; ry < rh; ry++) {
    for (let rx = 0; rx < rw; rx++) {
      let accR = 0, accG = 0, accB = 0;
      for (let k = -half, j = 0; k <= half; k++, j++) {
        let sy = ry + k;
        if (sy < 0) sy = 0;
        else if (sy >= rh) sy = rh - 1;

        const srcIdx = (sy * rw + rx) * chans;
        accR += tmp[srcIdx    ] * kern[j];
        accG += tmp[srcIdx + 1] * kern[j];
        accB += tmp[srcIdx + 2] * kern[j];
      }
      const dstIdx = (ry * rw + rx) * chans;
      out[dstIdx    ] = accR;
      out[dstIdx + 1] = accG;
      out[dstIdx + 2] = accB;
    }
  }

  // ---- Write back to original buffer (in place) ----
  for (let ry = 0; ry < rh; ry++) {
    const gy = y1 + ry;
    for (let rx = 0; rx < rw; rx++) {
      const gx = x1 + rx;
      const srcIdx = (ry * rw + rx) * chans;
      const dstIdx = ((gy * pitch) + gx) * chans;
      floatLinearRGB[dstIdx    ] = out[srcIdx    ];
      floatLinearRGB[dstIdx + 1] = out[srcIdx + 1];
      floatLinearRGB[dstIdx + 2] = out[srcIdx + 2];
    }
  }
}


/* ===================== Merge radiance (linear) ===================== */
function wellExposedWeight(rgb, mid=0.5, sigma=0.225) {
  const m = (rgb[0]+rgb[1]+rgb[2])/3;
  return Math.exp(-((m-mid)*(m-mid)) / (2*sigma*sigma));
}
async function mergeRadiance_linear(images, times) {
  const w = images[0].w, h = images[0].h;
  const num = new Float32Array(w*h*3);
  const den = new Float32Array(w*h);
  const total = images.length;

  for (let i=0; i<images.length; i++) {
    const {data} = images[i];
    const t = times[i];
    for (let p=0, px=0; p<data.length; p+=3, px++) {
      const r=data[p], g=data[p+1], b=data[p+2];
      const wgt = wellExposedWeight([r,g,b]);
      if (wgt>0) {
        num[p  ] += wgt * (r / t);
        num[p+1] += wgt * (g / t);
        num[p+2] += wgt * (b / t);
        den[px]  += wgt;
      }
    }
	setOverall(35+((i+1)/total)*30);
    setPerFile(((i+1)/total)*100);
	await nextFrame(); // let the browser paint the bars
  }
  for (let p=0, px=0; p<num.length; p+=3, px++) {
    const d = den[px] || 1e-8;
    num[p  ] /= d; num[p+1] /= d; num[p+2] /= d;
  }
  return { w, h, data: num };
}

/* ===================== Normalize white ~1.0 ===================== */
function luminance709(r,g,b){ return 0.2126*r + 0.7152*g + 0.0722*b; }
function normalizeWhitePercentile(hdr, pct=WHITE_PCT) {
  const {data} = hdr, N = data.length/3;
  const h = Math.trunc(Math.sqrt(N/2));
  const w = h*2;
  const scale = 1 + Math.trunc(w/1000);
  const offset = Math.trunc(scale/2);
  const lum = new Float32Array((h/scale) * (w/scale));
  let i = 0;
  for(let y=offset;y<h;y+=scale)
  {
	for(let x=offset;x<w;x+=scale)
	{
		let p = (y * w + x) * 3;
		lum[i] = luminance709(data[p],data[p+1],data[p+2]);
		i++
	}
  }
  const arr = Array.from(lum).sort((a,b)=>a-b);
  const idx = Math.min(arr.length-1, Math.max(0, Math.floor((pct/100)*arr.length)));
  const white = Math.max(1e-8, arr[idx]);
  for (let p=0; p<data.length; p++) data[p] /= white;
  return white;
}

/* ===================== Monochrome-above-threshold (optional) ===================== */
function monochromeAbove(hdr, thr=1.0) {
  const {data} = hdr;
  for (let p=0;p<data.length;p+=3) {
    const r=data[p], g=data[p+1], b=data[p+2];
    if (r>thr || g>thr || b>thr) {
      const Y = luminance709(r,g,b);
      data[p]=data[p+1]=data[p+2]=Y;
    }
  }
}

/* ===================== Filmic tone map with dithering ===================== */
async function tonemap_filmic(hdr, exposure=1.0) {
  const {w,h,data} = hdr;
  const out = new Uint8ClampedArray(w*h*4);
  const A=0.22, B=0.30, C=0.10, D=0.20, E=0.01, F=0.30;
  const W = 11.2;
  const whiteScale = ((W*(A*W+C*B)+D*E)/(W*(A*W+B)+D*F)) - (E/F);
  function rnd(i){ let x = i ^ (i>>>17); x ^= x<<13; x ^= x>>>7; x ^= x>>>17; return ((x>>>8)&0xFF)/255; }
  
	setOverall(86);
	setPerFile(0);
	await nextFrame(); // let the browser paint the bars
		
  for (let p=0,q=0,i=0; p<data.length; p+=3, q+=4, i++) {
    let r = data[p  ] * exposure;
    let g = data[p+1] * exposure;
    let b = data[p+2] * exposure;
    const fr = ((r*(A*r+C*B)+D*E)/(r*(A*r+B)+D*F)) - (E/F);
    const fg = ((g*(A*g+C*B)+D*E)/(g*(A*g+B)+D*F)) - (E/F);
    const fb = ((b*(A*b+C*B)+D*E)/(b*(A*b+B)+D*F)) - (E/F);
    let rr = Math.min(1, Math.max(0, fr/whiteScale));
    let gg = Math.min(1, Math.max(0, fg/whiteScale));
    let bb = Math.min(1, Math.max(0, fb/whiteScale));
    const d = (rnd(i)-0.5) / 255;
    rr = Math.min(1, Math.max(0, rr + d));
    gg = Math.min(1, Math.max(0, gg + d));
    bb = Math.min(1, Math.max(0, bb + d));
    out[q  ] = (rr*255)|0;
    out[q+1] = (gg*255)|0;
    out[q+2] = (bb*255)|0;
    out[q+3] = 255;

	//if(p*100/data.length != (p+1)*100/data.length)
	//{
	//	console.log(p*100/data.length);
	//	setOverall(85+(p*15/data.length));
	//	setPerFile(p*100/data.length);
	//	await nextFrame(); // let the browser paint the bars
	//}
  }
  return { w, h, data: out };
}

function drawToCanvas(ldr, canvas) {
  canvas.width = ldr.w; canvas.height = ldr.h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true }); // perf hint
  ctx.putImageData(new ImageData(ldr.data, ldr.w, ldr.h), 0, 0);
}

/* ===================== Radiance .HDR (RGBE) encoder ===================== */
function encodeRadianceHDR_RGBE(hdr) {
  const {w,h,data} = hdr;
  const header = [
    "#?RADIANCE",
    "FORMAT=32-bit_rle_rgbe",
    "",
    `-Y ${h} +X ${w}\n`
  ].join("\n");
  const headerBytes = new TextEncoder().encode(header);
  const body = new Uint8Array(w*h*4);
  for (let i=0,p=0;i<w*h;i++,p+=3) {
    const r=data[p], g=data[p+1], b=data[p+2];
    const maxc = Math.max(r,g,b);
    if (maxc < 1e-32) { body[i*4+0]=0; body[i*4+1]=0; body[i*4+2]=0; body[i*4+3]=0; }
    else {
      const e = Math.ceil(Math.log2(maxc));
      const scale = Math.pow(2, e) / 256;
      body[i*4+0] = Math.min(255, Math.round(r/scale));
      body[i*4+1] = Math.min(255, Math.round(g/scale));
      body[i*4+2] = Math.min(255, Math.round(b/scale));
      body[i*4+3] = e + 128;
    }
  }
  const out = new Uint8Array(headerBytes.length + body.length);
  out.set(headerBytes, 0); out.set(body, headerBytes.length);
  return new Blob([out], {type: 'image/vnd.radiance'});
}

/* ===================== Load, EXIF, preprocess + SHORT-SUN LOGIC ===================== */
async function loadAndPreprocess(files) {
  const bitmaps = [];
  const exposures = [];
  setPerFile(0);

  // EXIF + decode
  for (let i=0;i<files.length;i++) {
    const f = files[i];
    try {
      const exif = await exifr.parse(f).catch(()=>null);
      let t = null;
      if (exif) {
        if (typeof exif.ExposureTime === 'number') t = exif.ExposureTime;
        else if (typeof exif.ShutterSpeedValue === 'number') t = Math.pow(2, -exif.ShutterSpeedValue);
      }
      if (!t) throw new Error("Missing ExposureTime/ShutterSpeedValue");
      exposures.push(t);

      const bmp = await createImageBitmap(f);
      bitmaps.push(bmp);
      logLine(`Loaded: ${f.name} (t=${t})`, 'ok');
    } catch (e) {
      logLine(`Error reading ${f.name}: ${e.message || e}`, 'err');
    }
    setPerFile(((i+1)/files.length)*100);
    await nextFrame();
  }
  if (!bitmaps.length) throw new Error("No valid images decoded.");

  // sort by exposure (shortest first)
  const idx = exposures.map((t,i)=>[t,i]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
  const sortedExpos = idx.map(i=>exposures[i]);
  const sortedBmps  = idx.map(i=>bitmaps[i]);

  // common size = first image
  const w = sortedBmps[0].width, h = sortedBmps[0].height;
  const c = document.createElement('canvas'); c.width=w; c.height=h;
  const ctx = c.getContext('2d', { willReadFrequently: true }); // perf hint

  const linearImages = [];
  const expandedTimes = [];

  for (let i=0;i<sortedBmps.length;i++) {
    ctx.clearRect(0,0,w,h);
    ctx.drawImage(sortedBmps[i], 0, 0, w, h);
    const imgData = ctx.getImageData(0,0,w,h);

    // sRGB → linear (float)
    let lin = srgbToLinear_u8(imgData);
    let t = sortedExpos[i];

    // ---------- Short-exposure logic (ported from Python) ----------
    if (t < SHORT_EXPOSURE_T) {
      // Emulate Python's exp *= 4 pre-step
      // Base push (analogous to appending img8 with exp=t_eff)
      linearImages.push({ w, h, data: lin.slice(0) });
      expandedTimes.push(t);
      logLine(`Short exposure base push: t=${t}`, 'muted');

      // Detect clipped sun on a blurred copy
      let blurForSun = gaussianBlurFloatRGB(lin, w, h, SUN_BLUR1);
      let clippedCount = 0;
      for (let p=0; p<blurForSun.length; p++) if (blurForSun[p] > CLIPPED_THRESH) clippedCount++;
	  clippedCount *= (7680*3840*3 / blurForSun.length);
      const hasClippedSun = clippedCount > CLIPPED_COUNT && clippedCount < CLIPPED_COUNT*10;
      logLine(`Sun clipped? ${hasClippedSun} (count=${clippedCount})`, hasClippedSun ? 'warn' : 'muted');

      if (hasClippedSun) 
	  {
		let minx = w;
		let maxx = 0;
		let miny = h;
		let maxy = 0;
        for (let yy=0; yy<h; yy++) {
			for (let xx=0; xx<w; xx++) {
				const p = (yy*w+xx)*3;
				const r=lin[p], g=lin[p+1], b=lin[p+2];
				if (r>CLIPPED_THRESH || g>CLIPPED_THRESH || b>CLIPPED_THRESH) {
					if(minx > xx) minx = xx;
					if(maxx < xx) maxx = xx;
					if(miny > yy) miny = yy;
					if(maxy < yy) maxy = yy;
				}
			}
		}
		
		minx -= 64;  if(minx < 0) minx=0;
		miny -= 64;  if(miny < 0) miny=0;
		maxx += 64;  if(maxx >= w) maxx=w-1;
		maxy += 64;  if(maxy >= h) maxy=h-1;
		
		gaussianBlurROI(lin, w, minx, miny, maxx, maxy, SUN_BLUR1);
		
        for (let yy=miny; yy<maxy; yy++) {
			for (let xx=minx; xx<maxx; xx++) {
				const p = (yy*w+xx)*3;
				const r=lin[p], g=lin[p+1], b=lin[p+2];
				if (r>0.99 || g>0.99 || b>0.99) {
					lin[p]=lin[p+1]=lin[p+2] = 800;
				}
			}
		}
		
		
		logLine(`Sun's location ${minx},${miny} to ${maxx},${maxy}`, 'muted');
        gaussianBlurROI(lin, w, minx, miny, maxx, maxy, SUN_BLUR1);
        linearImages.push({ w, h, data: lin.slice(0) });
        expandedTimes.push(t);

        // B: blur heavier, scale *16, then t/=16
        gaussianBlurROI(lin, w, minx, miny, maxx, maxy, SUN_BLUR1);
        // multiply by 16 (keep float linear domain)
        for (let p=0; p<lin.length; p++) lin[p] /= 16.0;
        t /= 16.0;
        linearImages.push({ w, h, data: lin.slice(0) });
        expandedTimes.push(t);
        logLine(`Synthetic B push: t=${t}`, 'muted');

        // C: blur heavier, scale *1.0, then t/=16
        gaussianBlurROI(lin, w, minx, miny, maxx, maxy, SUN_BLUR1);
        for (let p=0; p<lin.length; p++) lin[p] /= 16.0;
        t /= 16.0;
        linearImages.push({ w, h, data: lin.slice(0) });
        expandedTimes.push(t);
        logLine(`Synthetic C push: t=${t}`, 'muted');

        // D: blur heavier, scale *0.25, then t/=16
        gaussianBlurROI(lin, w, minx, miny, maxx, maxy, SUN_BLUR1);
        for (let p=0; p<lin.length; p++) lin[p] /= 16.0;
        t /= 16.0;
        linearImages.push({ w, h, data: lin.slice(0) });
        expandedTimes.push(t);
        logLine(`Synthetic D push: t=${t}`, 'muted');

      } else {
        // No clipped sun → one synthetic step: exp/=4 (Python branch)
        linearImages.push({ w, h, data: lin.slice(0) });
        expandedTimes.push(t);
      }

    } else {
      // Normal (non-short) exposure → single push
      linearImages.push({ w, h, data: lin.slice(0) });
      expandedTimes.push(t);
    }

    setPerFile(((i+1)/sortedBmps.length)*100);
    await nextFrame();
  }

  return { linearImages, sortedExpos: expandedTimes, w, h };
}

/* ===================== UI run ===================== */
$('#run').addEventListener('click', async () => {
  try {
    $('#saveHdr').disabled = true;
    $('#saveJpg').disabled = true;
    logEl.textContent = '';
    setOverall(0); setPerFile(0);

    const files = Array.from($('#files').files || []);
    if (!files.length) { logLine("Please select JPG files first.", 'warn'); return; }

    const previewExposure = parseFloat($('#previewExp').value || '2.0');

    setStage('Reading EXIF + decoding images…');
    setOverall(5);
    const { linearImages, sortedExpos, w, h } = await loadAndPreprocess(files);

    setStage('Merging to HDR (radiance)…');
    setOverall(35);
	setPerFile(0);
    const hdr = await mergeRadiance_linear(linearImages, sortedExpos);
    setPerFile(100);
    await nextFrame();

    setStage('Normalizing white to ~1.0…');
    setOverall(60);
    const white = normalizeWhitePercentile(hdr, WHITE_PCT);
    logLine(`White percentile (${WHITE_PCT}%): ${white.toFixed(6)}`, 'ok');
    await nextFrame();

    setStage('Tone-mapping…');
    setOverall(85);
    const ldr = await tonemap_filmic(hdr, previewExposure);
    drawToCanvas(ldr, $('#preview'));
    await nextFrame();

    setStage('Preparing downloads…');
    setOverall(92);
    $('#saveHdr').disabled = false;
    $('#saveHdr').onclick = () => {
      try {
        const blob = encodeRadianceHDR_RGBE(hdr);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'merged.hdr';
        a.click();
        URL.revokeObjectURL(a.href);
        logLine('HDR downloaded.', 'ok');
      } catch (e) {
        logLine(`HDR save failed: ${e.message||e}`, 'err');
      }
    };
    $('#saveJpg').disabled = false;
    $('#saveJpg').onclick = () => {
      try {
        const a = document.createElement('a');
        a.href = $('#preview').toDataURL('image/jpeg', 0.95);
        a.download = 'preview.jpg';
        a.click();
        logLine('Preview JPG downloaded.', 'ok');
      } catch (e) {
        logLine(`JPG save failed: ${e.message||e}`, 'err');
      }
    };

    setStage('Done');
    setOverall(100);
    logLine('✅ Merge complete.', 'ok');
  } catch (err) {
    setStage('Error');
    setOverall(100);
    logLine(`❌ ${err.message || err}`, 'err');
    console.error(err);
  }
});
</script>
</body>
</html>
