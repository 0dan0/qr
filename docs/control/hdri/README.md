# HDRI Merge (optimized for GoPro MAX2)

Create HDRI with this two QR codes:

<fieldset>
  <legend>Inputs</legend>
  <div class="row">
    <input id="files" type="file" accept="image/jpeg" multiple />
    <button id="run">Merge HDR</button>
    <button id="runHalf">HDR (½ Res)</button>
    <button id="runQuarter">HDR (¼ Res)</button>
    <button id="saveHdr" disabled>Download .HDR</button>
  </div>
  <div class="row">
    <label>Preview exposure: <input id="previewExp" type="number" step="0.1" value="2.0" title="Photographic exposure for preview" style="width: 100px;"></label>
  </div>
</fieldset>

<fieldset>
  <legend>Progress</legend>
  <div id="stage">Idle</div>
  <progress id="overall" value="0" max="100" style="width: 800px;"></progress>
  <div class="muted" style="margin-top:6px;">Per-stage</div>
  <progress id="perfile" value="0" max="100" style="width: 800px;"></progress>
</fieldset>

<fieldset>
  <legend>Preview (tone-mapped)</legend>
  <canvas id="preview" width="800" height="400"></canvas>
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

/* ===================== sRGB 2.2 → Linear ===================== */
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

function goProFlatToLinear_u8(imgData) {
  const { data, width, height } = imgData;
  const out = new Float32Array(width * height * 3);
  for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
    const sr = data[i]   / 255;
    const sg = data[i+1] / 255;
    const sb = data[i+2] / 255;
    const r = (Math.pow(113.0,sr)-1.0)/112.0;
    const g = (Math.pow(113.0,sg)-1.0)/112.0;
    const b = (Math.pow(113.0,sb)-1.0)/112.0;
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
function wellExposedWeight(rgb, mid=0.5, sigma=0.1225) {
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
	let sigma = 0.1225 + 0.1225 * Math.sin(i*3.14159/(images.length-1));
    for (let p=0, px=0; p<data.length; p+=3, px++) {
      const r=data[p], g=data[p+1], b=data[p+2];
      const wgt = wellExposedWeight([r,g,b], 0.5, );
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
  //const A=0.22, B=0.30, C=0.10, D=0.20, E=0.01, F=0.30, W=11.2;  // too contrasty
  const A=0.2, B=0.30, C=0.10, D=0.05, E=0.0, F=0.10, W=20;  // lower contrast
  const whiteScale = ((W*(A*W+C*B)+D*E)/(W*(A*W+B)+D*F)) - (E/F);
  function rnd(i){ let x = i ^ (i>>>17); x ^= x<<13; x ^= x>>>7; x ^= x>>>17; return ((x>>>8)&0xFF)/255; }

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
  }
  return { w, h, data: out };
}

//function drawToCanvas(ldr, canvas) {
//  canvas.width = ldr.w; canvas.height = ldr.h;
//  const ctx = canvas.getContext('2d', { willReadFrequently: true }); // perf hint
//  ctx.putImageData(new ImageData(ldr.data, ldr.w, ldr.h), 0, 0);
//}
function drawToCanvas(ldr, canvas, targetW = 800, targetH = 400, mode = 'contain') {
  // 1) paint the RGBA into a temp canvas at native size
  const srcC = document.createElement('canvas');
  srcC.width = ldr.w; srcC.height = ldr.h;
  const srcCtx = srcC.getContext('2d', { willReadFrequently: true });
  srcCtx.putImageData(new ImageData(ldr.data, ldr.w, ldr.h), 0, 0);

  // 2) set preview canvas to fixed size
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;         // better downscale
  ctx.imageSmoothingQuality = 'high';       // ask for HQ filters

  if (mode === 'stretch') {
    // Fill exactly 800x400 (may distort aspect)
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.drawImage(srcC, 0, 0, targetW, targetH);
  } else {
    // 'contain' => preserve aspect ratio, letterbox
    const scale = Math.min(targetW / ldr.w, targetH / ldr.h);
    const drawW = Math.max(1, Math.floor(ldr.w * scale));
    const drawH = Math.max(1, Math.floor(ldr.h * scale));
    const offX = Math.floor((targetW - drawW) / 2);
    const offY = Math.floor((targetH - drawH) / 2);

    ctx.clearRect(0, 0, targetW, targetH);
    ctx.drawImage(srcC, 0, 0, ldr.w, ldr.h, offX, offY, drawW, drawH);
  }
}

/**
 * Async Radiance .HDR (RGBE) encoder with scanline RLE, progress + yielding.
 * @param {{w:number,h:number,data:Float32Array}} hdr  // linear RGB
 * @param {(pct:number)=>void=} onProgress            // 0..100
 * @param {{yieldMs?:number, signal?:AbortSignal}=} opts
 * @returns {Promise<Blob>}
 */
async function encodeRadianceHDR_RGBE_RLE_Async(hdr, onProgress, opts = {}) {
  const { w, h, data } = hdr;
  const yieldMs = opts.yieldMs ?? 16;
  const signal = opts.signal;

  const header = [
    "#?RADIANCE",
    "FORMAT=32-bit_rle_rgbe",
    "",
    `-Y ${h} +X ${w}\n`
  ].join("\n");
  const headerBytes = new TextEncoder().encode(header);

  // RGB -> RGBE
  function toRGBE(r,g,b) {
    const maxc = Math.max(r,g,b);
    if (maxc < 1e-32) return [0,0,0,0];
    const e = Math.ceil(Math.log2(maxc));
    const scale = Math.pow(2, e) / 256;
    return [
      Math.min(255, Math.round(r/scale)),
      Math.min(255, Math.round(g/scale)),
      Math.min(255, Math.round(b/scale)),
      e + 128
    ];
  }

  // Write one channel with Radiance RLE
  function encodeRLEChannel(line /* Uint8Array of length w */) {
    const out = [];
    let x = 0;
    while (x < w) {
      // try run
      let runLen = 1;
      const maxRun = Math.min(w - x, 127);
      const val = line[x];
      while (runLen < maxRun && line[x + runLen] === val) runLen++;
      if (runLen >= 4) {
        out.push(128 + runLen, val);
        x += runLen;
      } else {
        // literal packet, avoid swallowing a future run
        const start = x;
        let count = 0;
        const maxLit = Math.min(w - x, 128);
        while (count < maxLit) {
          if (count >= 1) {
            let lookRun = 1;
            const maxLook = Math.min(w - (x + count), 127);
            const lookVal = line[x + count];
            while (lookRun < maxLook && line[x + count + lookRun] === lookVal) lookRun++;
            if (lookRun >= 4) break;
          }
          count++;
        }
        out.push(count);
        for (let i = 0; i < count; i++) out.push(line[start + i]);
        x += count;
      }
    }
    return Uint8Array.from(out);
  }

  // Fallback to old flat RGBE when width not supported
  if (w < 8 || w > 0x7fff) {
    const flat = new Uint8Array(w*h*4);
    for (let i=0,p=0;i<w*h;i++,p+=3) {
      const [R,G,B,E] = toRGBE(data[p], data[p+1], data[p+2]);
      const q = i*4; flat[q]=R; flat[q+1]=G; flat[q+2]=B; flat[q+3]=E;
    }
    if (onProgress) onProgress(100);
    return new Blob([headerBytes, flat], { type: "image/vnd.radiance" });
  }

  // Build output in chunks to avoid one giant growable array
  const chunks = [headerBytes];
  let lastYield = performance.now();

  for (let y = 0; y < h; y++) {
    if (signal?.aborted) throw new DOMException("Encoding aborted", "AbortError");

    // Scanline header: 0x02 0x02 w_hi w_lo
    const scanHdr = new Uint8Array([0x02, 0x02, (w >> 8) & 0xff, w & 0xff]);

    // Prepare channel buffers
    const R = new Uint8Array(w);
    const G = new Uint8Array(w);
    const B = new Uint8Array(w);
    const E = new Uint8Array(w);

    let p = y * w * 3;
    for (let x = 0; x < w; x++, p += 3) {
      const [r8,g8,b8,e8] = toRGBE(data[p], data[p+1], data[p+2]);
      R[x] = r8; G[x] = g8; B[x] = b8; E[x] = e8;
    }

    // Encode four channels
    const rleR = encodeRLEChannel(R);
    const rleG = encodeRLEChannel(G);
    const rleB = encodeRLEChannel(B);
    const rleE = encodeRLEChannel(E);

    // Concatenate this scanline: hdr + R + G + B + E
    const line = new Uint8Array(scanHdr.length + rleR.length + rleG.length + rleB.length + rleE.length);
    let o = 0;
    line.set(scanHdr, o); o += scanHdr.length;
    line.set(rleR, o);    o += rleR.length;
    line.set(rleG, o);    o += rleG.length;
    line.set(rleB, o);    o += rleB.length;
    line.set(rleE, o);

    chunks.push(line);

    // Progress + cooperative yield
    if (onProgress) onProgress(((y + 1) / h) * 100);
    const now = performance.now();
    if (now - lastYield > yieldMs) {
      lastYield = now;
      await new Promise(r => requestAnimationFrame(r));
    }
  }

  return new Blob(chunks, { type: "image/vnd.radiance" });
}


</script>
