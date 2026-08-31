'use strict';

// render first file image
function renderFile(file)
{
    const img = new Image();
    const objectURL = URL.createObjectURL(file);
    img.onload = () =>
    {
        render(img);
        URL.revokeObjectURL(objectURL);
    };
    img.src = objectURL;
    return img;
}

// image gallery
const galleryList = document.querySelector(`#gallery ul`);
let bgClr = `black`; 
function appendNewGalleryPiece(name, img)
{
    const li = document.createElement(`li`);
    const a = document.createElement(`a`);
    const div = document.createElement(`div`);
    const loadedImgOrNot = !img ? document.createElement(`img`) : img;
    const pDiv = document.createElement(`div`);
    const p = document.createElement(`p`);

    li.title = name;
    li.append(a);
    div.style.background = bgClr;
    a.append(div);
    div.append(loadedImgOrNot);
    p.textContent = name;
    pDiv.append(p);
    a.append(pDiv);
    galleryList.append(li);
    a.setAttribute(`tabindex`, `0`)

    return {img: loadedImgOrNot, a: a};
}
function setupPieceRerender(link, img)
{
    link.addEventListener(`click`, () =>
    {
        sx = 0;
        sy = 0;
        render(img);
    });
}
function addFilesToGallery(files, firstImg)
{
    const {img, a} = appendNewGalleryPiece(files[0].name, firstImg);
    setupPieceRerender(a, img);

    for (let i = 1; i < files.length; i++) {
        const {img, a} = appendNewGalleryPiece(files[i].name);
        const objectURL = URL.createObjectURL(files[i]); 
        img.onload = () =>
        {
            setupPieceRerender(a, img);
            URL.revokeObjectURL(objectURL);
        };
        img.src = objectURL;
    }
}

// Drag and Drop API
const dragNDropInput = document.getElementById(`drag-n-drop`);
const dragNDropLabel = document.querySelector(`[for="drag-n-drop"]`);
const svg = document.querySelector(`#drop-zone svg`);
const marchingAntGradient = document.getElementById(`marching-ant-gradient`);
const dropZoneUI = [marchingAntGradient, svg, dragNDropLabel, dragNDropInput];
function disableCanvasInput()
{
    for (let i = 0; i < dropZoneUI.length; i++) {
        dropZoneUI[i].style.display = `none`;
    }
}
function dropHandler(e)
{
    e.preventDefault();
    return [...e.dataTransfer.items].map((item) => item.getAsFile()).
    filter((file) => file);
}
const dropZone = document.getElementById(`drop-zone`);
const addMoreFilesWrapper = document.querySelector(`div:has(> #add-files)`);
const galleryUl = document.querySelector(`#gallery ul`);
let isSamplingInit = false;
let imageViewerBg = null;
let isImageViewerBgDrawn = false;
function initSampling(options)
{
    disableCanvasInput();
    if (imageViewerBg && !isImageViewerBgDrawn) {
        imageViewer.style.background = imageViewerBg; 
        isImageViewerBgDrawn = true;
    }
    if (!options.exampleImage) {
        addFilesToGallery(options.collection, renderFile(options.firstPiece));
    }
    addMoreFilesWrapper.classList.add(`reveal`);
    galleryUl.classList.remove(`empty`);
    isSamplingInit = true;
}
dropZone.addEventListener(`drop`, e =>
{
    const files = dropHandler(e);
    initSampling({collection: files, firstPiece: files[0]});
});

window.addEventListener(`drop`, (e) =>
{
    if ([...e.dataTransfer.items].some((item) => item.kind === `file`))
    e.preventDefault();
});

dropZone.addEventListener(`dragover`, (e) =>
{
    const fileItems = [...e.dataTransfer.items].
    filter((item) => item.kind === `file`);

    if (fileItems.length > 0) {
        e.preventDefault();
        if (fileItems.some((item) => item.type.startsWith(`image/`))) {
            e.dataTransfer.dropEffect = `copy`;
        } else {
            e.dataTransfer.dropEffect = `none`;
        }
    }
});

window.addEventListener(`dragover`, (e) =>
{
    const fileItems = [...e.dataTransfer.items].
    filter((item) => item.kind === `file`,);

    if (fileItems.length > 0) {
        e.preventDefault();
        if (!dropZone.contains(e.target)) {
            e.dataTransfer.dropEffect = `none`;
        }
    }
});

// drop zone click input
// add more files button
const moreFilesInput = document.getElementById(`add-files`);
const canvasChangeInputGroup = [dragNDropInput, moreFilesInput];
for (let i = 0; i < canvasChangeInputGroup.length; i++) {
    canvasChangeInputGroup[i].addEventListener(`change`, e =>
    {
        initSampling({collection: e.target.files, firstPiece: e.target.files[0]});
    });
}

const moreFilesWrapper = document.querySelector(`*:has(> #add-files)`);
moreFilesWrapper.addEventListener('click', e =>
{
    moreFilesInput.click();
});

// canvas set up
const pixelRatio = devicePixelRatio;

const imageViewer = document.getElementById(`image-viewer`);
const scope = document.getElementById(`scope`);

const ctxIV = imageViewer.getContext(`2d`, {willReadFrequently: true});
const ctxS = scope.getContext(`2d`);

// canvas resizing
const viewports = document.getElementById(`viewports`);
function scaleCanvases()
{
    const viewportsRect = viewports.getBoundingClientRect();
    imageViewer.width = viewportsRect.width * 0.75;
    imageViewer.height = viewportsRect.height;

    scope.width = viewportsRect.width * 0.25;
    scope.height = viewportsRect.height * 0.50;

    ctxIV.imageSmoothingEnabled = false;
    ctxS.imageSmoothingEnabled = false;
}
scaleCanvases();

const getHorizontalMarginOffset = () => innerWidth / innerHeight >= 1.25 ?
innerWidth * 0.2 : innerWidth * 0.1;
let horizontalMarginOffset = getHorizontalMarginOffset();

// responsively resize viewports
const resizeObserver = new ResizeObserver(() =>
{
    horizontalMarginOffset = getHorizontalMarginOffset();
    scaleCanvases();
    if (currentImg !== undefined) render();
});
resizeObserver.observe(viewports);

// block viewports contextmenu
function preventContextmenu(elmnts)
{
    for (let i = 0; i < elmnts.length; i++) {
        elmnts[i].addEventListener(`contextmenu`, e => e.preventDefault());
    }
}
const recentColors = document.getElementById(`recent-colors`);
preventContextmenu([imageViewer, scope, recentColors]);

let currentImg;
let fitScale = 1;
let tx = 0;
let ty = 0;

function getfitScale(img)
{
    return Math.min(
        imageViewer.width / img.naturalWidth,
        imageViewer.height / img.naturalHeight
    );
}

function resetView(img)
{
    const s = getfitScale(img);
    fitScale = s;
    tx = (imageViewer.width - (img.naturalWidth * s)) / 2;
    ty = (imageViewer.height - (img.naturalHeight * s)) / 2;
}

function render(img = currentImg)
{
    currentImg = img;
    resetView(img);
    draw();
}

function draw()
{
    ctxIV.setTransform();
    ctxIV.clearRect(0, 0, imageViewer.width, imageViewer.height);
    ctxIV.drawImage(
        currentImg,
        0,
        0,
        currentImg.naturalWidth,
        currentImg.naturalHeight,
        Math.floor(tx),
        Math.floor(ty),
        currentImg.naturalWidth * fitScale,
        currentImg.naturalHeight * fitScale
    );
}

function getPointerCordinatesInCanvas(e)
{
    const rect = imageViewer.getBoundingClientRect();
    return {
        x: e.clientX - horizontalMarginOffset,
        y: e.clientY - rect.top
    };
}

let isPanning = false;
let sx;
let sy;

const samplingFrequencyInput = document.getElementById(`sampling-frequency`);
function getSamplingFrequency()
{
    return Number(samplingFrequencyInput.value);
}

let isSampling = false;
let lastSampledX = null;
let lastSampledY = null;
let accLength = 0;

function getPixelCoords(e)
{
    if (!currentImg) return null;
    const {x, y} = getPointerCordinatesInCanvas(e);

    const left   = tx;
    const top    = ty;
    const right  = tx + currentImg.naturalWidth  * fitScale;
    const bottom = ty + currentImg.naturalHeight * fitScale;

    const minX = Math.max(0, Math.floor(left));
    const maxX = Math.min(imageViewer.width - 1, Math.floor(right - 1));
    const minY = Math.max(0, Math.floor(top));
    const maxY = Math.min(imageViewer.height - 1, Math.floor(bottom - 1));

    if (minX > maxX || minY > maxY) return null;

    const sx = Math.floor(Math.min(Math.max(x, minX), maxX));
    const sy = Math.floor(Math.min(Math.max(y, minY), maxY));

    return {sx, sy};
}

function getPixelsFromLine(x0, y0, x1, y1)
{
    const pixels = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
        pixels.push({x, y});
        if (x === x1 && y === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
    return pixels;
}

// color format setting
const colorFormatSelect = document.getElementById(`color-format`);

// color conversion math
const LRGB_LMS_MATRIX = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];

const LMS_LAB_MATRIX = [
  [+0.2104542553, +0.793617785, -0.0040720468],
  [+1.9779984951, -2.428592205, +0.4505937099],
  [+0.0259040371, +0.7827717662, -0.808675766],
];

// srgb-linear to xyz-d50
// matrix taken from http://www.brucelindbloom.com/index.html?Eqn_RGB_to_XYZ.html
const LRGB_XYZ_D50_MATRIX = [
  [0.4360747, 0.3850649, 0.1430804],
  [0.2225045, 0.7168786, 0.0606169],
  [0.0139322, 0.0971045, 0.7141733],
];

// srgb-linear to xyz-d65
// matrix taken from http://www.brucelindbloom.com/index.html?Eqn_RGB_to_XYZ.html
const LRGB_XYZ_D65_MATRIX = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
];

const D65 = [0.3457 / 0.3585, 1, 0.2958 / 0.3585];

function multiplyByMatrix(matrix, tuple) {
  let i = [0, 0, 0];
  let j = matrix.length;
  let k = matrix[0].length;
  for (let l = 0; l < j; l++)
    for (let m = 0; m < k; m++) i[l] += matrix[l][m] * tuple[m];
  return i;
}

function rgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function intToHex(i) {
  return Math.round(Math.min(255, Math.max(0, i))).toString(16).padStart(2, "0").toLowerCase();
}

function rgbToHEXText(c) {
  return `#${intToHex(c.r)}${intToHex(c.g)}${intToHex(c.b)}`;
}

function rgbaToHEXAText(color) {
  const hexText = rgbToHEXText(color);
  if (color.alpha === undefined || color.alpha >= 1.0) {
    return hexText;
  }
  const alpha = intToHex(color.alpha * 255);
  return `${hexText}${alpha}`;
}

function rgbaToRGBText(color) {
  const alpha = color.alpha !== undefined ? color.alpha : 1.0;
  return `rgb(${Math.round(color.r)} ${Math.round(color.g)} ${Math.round(color.b)}${
    alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""
  })`;
}

function rgbaToHSLA(color) {
  let { r, g, b, alpha = 1.0 } = color;
  r /= 255;
  g /= 255;
  b /= 255;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const delta = max - min;
  let h, s, l;

  if (delta === 0) {
    h = 0;
  } else if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }
  h = Math.round(h * 60);

  if (h < 0) {
    h += 360;
  }

  l = (max + min) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = Number((s * 100).toFixed(1));
  l = Number((l * 100).toFixed(1));

  return { h, s, l, alpha };
}

function toHSLAText(color) {
  const { h, s, l, alpha = 1.0 } = rgbaToHSLA(color);
  return `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%${
    alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""
  })`;
}

function rgbaToHWBAText(color) {
  let { h, s, l, alpha = 1.0 } = rgbaToHSLA(color);
  const chroma = (s / 100) * (1 - Math.abs((2 * l) / 100 - 1));
  let W = Math.round(l - (chroma * 100) / 2);
  let B = Math.round(100 - l - (chroma * 100) / 2);
  return `hwb(${h} ${W}% ${B}%${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

function rgbaToXYZD50(color) {
  let { r, g, b, alpha = 1.0 } = color;
  r = rgbToLinear(r / 255) * 255;
  g = rgbToLinear(g / 255) * 255;
  b = rgbToLinear(b / 255) * 255;

  const xyz = multiplyByMatrix(LRGB_XYZ_D50_MATRIX, [r, g, b]);
  return { x: xyz[0] / 255, y: xyz[1] / 255, z: xyz[2] / 255, alpha };
}

function rgbaToXYZD50Text(color) {
  let { alpha = 1.0 } = color;
  const xyz = rgbaToXYZD50(color);
  return `color(xyz-d50 ${xyz.x.toFixed(5)} ${xyz.y.toFixed(5)} ${xyz.z.toFixed(
    5,
  )}${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

function rgbaToXYZD65(color) {
  let { r, g, b, alpha = 1.0 } = color;
  r = rgbToLinear(r / 255) * 255;
  g = rgbToLinear(g / 255) * 255;
  b = rgbToLinear(b / 255) * 255;

  const xyz = multiplyByMatrix(LRGB_XYZ_D65_MATRIX, [r, g, b]);
  return { x: xyz[0] / 255, y: xyz[1] / 255, z: xyz[2] / 255, alpha };
}

function rgbaToXYZD65Text(color) {
  let { alpha = 1.0 } = color;
  const xyz = rgbaToXYZD65(color);
  return `color(xyz-d65 ${xyz.x.toFixed(5)} ${xyz.y.toFixed(5)} ${xyz.z.toFixed(
    5,
  )}${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

function xyzToLab(color) {
  let { x, y, z, alpha = 1.0 } = color;
  [x, y, z] = [x, y, z].map((v, i) => {
    v /= D65[i];
    return v > 0.0088564516 ? Math.cbrt(v) : v * 903.2962962962963 + 16 / 116;
  });
  return { l: 116 * y - 16, a: 500 * (x - y), b: 200 * (y - z), alpha };
}

function rgbaToLabText(color) {
  let { alpha = 1.0 } = color;
  const xyz = rgbaToXYZD50(color);
  const lab = xyzToLab(xyz);
  return `lab(${lab.l.toFixed(3)} ${lab.a.toFixed(3)} ${lab.b.toFixed(3)}${
    alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""
  })`;
}

function rgbToOklab(color) {
  let { r, g, b, alpha = 1.0 } = color;
  r = rgbToLinear(r / 255);
  g = rgbToLinear(g / 255);
  b = rgbToLinear(b / 255);
  const lms = multiplyByMatrix(LRGB_LMS_MATRIX, [r, g, b]).map((v) =>
    Math.cbrt(v),
  );

  const oklab = multiplyByMatrix(LMS_LAB_MATRIX, lms);
  return { l: oklab[0], a: oklab[1], b: oklab[2], alpha };
}

function toOkLabText(color) {
  let { alpha = 1.0 } = color;
  const oklab = rgbToOklab(color);
  return `oklab(${oklab.l.toFixed(5)} ${oklab.a.toFixed(5)} ${oklab.b.toFixed(
    5,
  )}${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

function labToLCH(color) {
  const { l, a, b, alpha = 1.0 } = color;
  const c = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * (180 / Math.PI);
  if (h < 0) {
    h += 360;
  }
  return { l, c, h, alpha };
}

function toLCHText(color) {
  let { alpha = 1.0 } = color;
  const xyz = rgbaToXYZD50(color);
  const lab = xyzToLab(xyz);
  const lch = labToLCH(lab);
  return `lch(${lch.l.toFixed(3)} ${lch.c.toFixed(3)} ${lch.h.toFixed(3)}${
    alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""
  })`;
}

function rgbaToOkLCh(color) {
  const lab = rgbToOklab(color);
  const oklch = labToLCH(lab);
  return { l: oklch.l, c: oklch.c, h: oklch.h, alpha: color.alpha !== undefined ? color.alpha : 1.0 };
}

function toOkLChText(color) {
  let { alpha = 1.0 } = color;
  const oklch = rgbaToOkLCh(color);
  return `oklch(${oklch.l.toFixed(5)} ${oklch.c.toFixed(5)} ${oklch.h.toFixed(
    5,
  )}${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

function rgbaToColorSRGBText(color) {
  const alpha = color.alpha !== undefined ? color.alpha : 1.0;
  return `color(srgb ${(color.r / 255).toFixed(3)} ${(color.g / 255).toFixed(3)} ${(color.b / 255).toFixed(3)}${
    alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""
  })`;
}

function formatColor(color, format = `OKLCH`) {
    switch (format) {
        case `OKLCH`: return toOkLChText(color);
        case `HEX`: return rgbaToHEXAText(color);
        case `RGB`: return rgbaToRGBText(color);
        case `SRGB`:
        case `sRGB`:
        case `color(srgb)`: return rgbaToColorSRGBText(color);
        case `HSL`: return toHSLAText(color);
        case `LAB`: return rgbaToLabText(color);
        case `LCH`: return toLCHText(color);
        case `OKLAB`: return toOkLabText(color);
        case `XYZ D50`: return rgbaToXYZD50Text(color);
        case `XYZ D65`: return rgbaToXYZD65Text(color);
        default: return toOkLChText(color);
    }
}

function samplePixelAtCoords(sx, sy, updateHistory = false)
{
    const rgba = ctxIV.getImageData(sx, sy, 1, 1).data;
    const colorObj = {
        r: rgba[0],
        g: rgba[1],
        b: rgba[2],
        alpha: rgba[3] / 255
    };
    const formattedColor = formatColor(colorObj, colorFormatSelect.value);
    recentColorsFields[0].style.backgroundColor = formattedColor;
    if (updateHistory) updateRecentColorsFields(formattedColor);
}

function processSampling(e)
{
    if (!isSampling || !currentImg) return;

    const f = getSamplingFrequency();
    const pointerEvents = e.getCoalescedEvents();

    for (const pointerEvent of pointerEvents) {
        const coords = getPixelCoords(pointerEvent);
        if (!coords) continue;

        if (lastSampledX === null || lastSampledY === null) {
            samplePixelAtCoords(coords.sx, coords.sy, true);
            lastSampledX = coords.sx;
            lastSampledY = coords.sy;
            accLength = 0;
            continue;
        }

        if (f === 1) {
            const pixels = getPixelsFromLine(lastSampledX, lastSampledY, coords.sx, coords.sy);
            for (let i = 0; i < pixels.length; i++) {
                const pixel = pixels[i];

                if (pixel.x === lastSampledX && pixel.y === lastSampledY) continue;
                samplePixelAtCoords(pixel.x, pixel.y, true);
                lastSampledX = pixel.x;
                lastSampledY = pixel.y;
            }
        } else {
            let x1 = lastSampledX;
            let y1 = lastSampledY;
            const x2 = coords.sx;
            const y2 = coords.sy;

            let lineLength = Math.hypot(x2 - x1, y2 - y1);
            if (lineLength === 0) continue;

            accLength += lineLength;

            while (accLength >= f) {
                const needed = f - (accLength - lineLength);
                const t = Math.min(Math.max(needed / lineLength, 0), 1);

                const interpX = Math.round(x1 + t * (x2 - x1));
                const interpY = Math.round(y1 + t * (y2 - y1));
                samplePixelAtCoords(interpX, interpY, true);

                accLength -= f;
                lineLength = lineLength - needed;
                x1 = interpX;
                y1 = interpY;

                if (lineLength <= 0) break;
            }

            lastSampledX = coords.sx;
            lastSampledY = coords.sy;
        }
    }
}

imageViewer.addEventListener(`pointerdown`, e =>
{
    if (e.button === 2) {
        imageViewer.setPointerCapture(e.pointerId);
        isPanning = true;
        const {x, y} = getPointerCordinatesInCanvas(e);
        sx = x;
        sy = y;
        imageViewer.style.cursor = `grabbing`;
    } else if (e.button === 0) {
        imageViewer.setPointerCapture(e.pointerId);
        isSampling = true;
        accLength = 0;
        const coords = getPixelCoords(e);
        if (coords) {
            samplePixelAtCoords(coords.sx, coords.sy, true);
            lastSampledX = coords.sx;
            lastSampledY = coords.sy;
            imageViewer.style.cursor = `crosshair`;
        }
    }
});

imageViewer.addEventListener(`pointermove`, e =>
{
    renderScope(e);
    paintRecentColorsFields(e);

    if (isSampling) {
        processSampling(e);
    }

    if (!isPanning) return;

    const {x, y} = getPointerCordinatesInCanvas(e);
    const dx = x - sx;
    const dy = y - sy;
    sx = x;
    sy = y;
    tx += dx;
    ty += dy;

    draw();
});

function stopSampling(e)
{
    isSampling = false;
    lastSampledX = null;
    lastSampledY = null;
    accLength = 0;
    if (e && e.pointerId !== undefined && imageViewer.hasPointerCapture(e.pointerId)) {
        try {
            imageViewer.releasePointerCapture(e.pointerId);
        } catch (_) {}
    }
}

imageViewer.addEventListener(`pointerup`, e =>
{
    if (e.button === 0) {
        stopSampling(e);
        imageViewer.style.cursor = `pointer`;
    } else if (e.button === 2) {
        isPanning = false;
        imageViewer.style.cursor = `pointer`;
        if (imageViewer.hasPointerCapture(e.pointerId)) {
            try {
                imageViewer.releasePointerCapture(e.pointerId);
            } catch (_) {}
        }
    }
});

imageViewer.addEventListener(`pointercancel`, e =>
{
    isPanning = false;
    stopSampling(e);
});

imageViewer.addEventListener(`lostpointercapture`, e =>
{
    isPanning = false;
    stopSampling(e);
});


// zooming
const zoomFactor = 1.05; // per "tick" of wheel movement

function zoom(e)
{
    if (!currentImg) return;

    const {x, y} = getPointerCordinatesInCanvas(e);

    // Smooth exponential zoom based on wheel delta magnitude.
    const factor = Math.pow(zoomFactor, -e.deltaY / 100);
    const newScale = fitScale * factor;

    // Recompute the *actual* factor applied after clamping, so the
    // point under the cursor stays fixed even at the zoom limits.
    const actualFactor = newScale / fitScale;
    tx = x - (x - tx) * actualFactor;
    ty = y - (y - ty) * actualFactor;
    fitScale = newScale;

    draw();
}

let id;
imageViewer.addEventListener(`wheel`, e =>
{
    e.preventDefault();
    zoom(e);
    imageViewer.style.cursor = `nesw-resize`;
    clearTimeout(id);
    id = setTimeout(() => imageViewer.style.cursor = `pointer`, 200);
}, {passive: false});

// scope
const SCOPE_RADIUS = 5; // half-width of the sampled square, in *image* pixels
const SCOPE_SIZE = SCOPE_RADIUS * 2;

function renderScope(e)
{
    if (!currentImg) return;

    const {x, y} = getPointerCordinatesInCanvas(e);

    // Undo the current pan/zoom to find the cursor's position in image space.
    const imgX = (x - tx) / fitScale;
    const imgY = (y - ty) / fitScale;

    const maxX = Math.max(0, currentImg.naturalWidth - SCOPE_SIZE);
    const maxY = Math.max(0, currentImg.naturalHeight - SCOPE_SIZE);
    const sx = Math.min(Math.max(0, imgX - SCOPE_RADIUS), maxX);
    const sy = Math.min(Math.max(0, imgY - SCOPE_RADIUS), maxY);

    ctxS.clearRect(0, 0, scope.width, scope.height);
    ctxS.drawImage(
        currentImg,
        sx, sy, SCOPE_SIZE, SCOPE_SIZE,
        0, 0, scope.width, scope.height
    );
}

// sampled colors + recent colors
const sampledColors = [];
let isSampledColorsUpdated = false;
function stringifySampledColors() {
    return sampledColors.toReversed().join(`\n`);
}

const recentColorsFields = document.querySelectorAll(`#recent-colors > div`);
const recentColorsFieldsN = 60;

function paintRecentColorsFields(e, updateRecentColorsFields = false)
{
    if (!currentImg) return;
    const coords = getPixelCoords(e);
    if (!coords) return;
    samplePixelAtCoords(coords.sx, coords.sy, updateRecentColorsFields);
}

const clipboard = document.getElementById(`clipboard`);
const colorsCounter = document.querySelector(`div:has(> #clipboard)>div>p`);
const outputSection = document.getElementById(`output`);
function updateRecentColorsFields(color)
{
    sampledColors.unshift(color);
    download.classList.remove(`inactive`);
    if (sampledColors.length > 0) {
        clipboard.classList.remove(`empty`);
    }
    for (let i = 0; i < recentColorsFieldsN - 1; i++) {
        recentColorsFields[i + 1].style.backgroundColor = sampledColors[i];
    }
    const description = colorsCounter.innerText.slice(0, 15);
    colorsCounter.innerText = description + ` ` + sampledColors.length;
    addColorsToClipboard(color);
    isSampledColorsUpdated = true;
}
function addColorsToClipboard(color)
{
    const li = document.createElement(`li`);
    const code = document.createElement(`code`);
    const div = document.createElement(`div`);

    code.textContent = color;
    div.style.background = `linear-gradient(${color}) padding-box`;
    li.append(code, div);
    clipboard.prepend(li);
    li.setAttribute(`tabindex`, `0`)
}

function clearRecentColors()
{
    for (let i = 0; i < recentColorsFieldsN; i++) {
        recentColorsFields[i].style.backgroundColor = `initial`;
    }
}

// load example image on user preference
function loadAndRenderExampleImage(path)
{
    const {img, a} = appendNewGalleryPiece(path);
    img.onload = () =>
    {
        setupPieceRerender(a, img)
        render(img);
    }
    img.src = path;
}

let loadExampleImage = localStorage.getItem(`load-example-image`);
const loadExampleImageInput = document.getElementById(`load-example-image`);
if (loadExampleImage === `true`) {
    loadExampleImageInput.setAttribute(`checked`, ``);
    initSampling({exampleImage: true});
    loadAndRenderExampleImage(`example-photo-DVD-disc.avif`);
} else if (loadExampleImage === null) {
    localStorage.setItem(`load-example-image`, `true`); 
    loadExampleImageInput.setAttribute(`checked`, ``);
    initSampling({exampleImage: true});
    loadAndRenderExampleImage(`example-photo-DVD-disc.avif`);
    loadExampleImage = `true`;
}

loadExampleImageInput.addEventListener(`change`, () =>
{
    if (loadExampleImage === `true`) {
        loadExampleImageInput.removeAttribute(`checked`);
        localStorage.setItem(`load-example-image`, `false`);
        loadExampleImage = `false`;
    } else {
        loadExampleImageInput.setAttribute(`checked`, ``);
        localStorage.setItem(`load-example-image`, `true`);
        loadExampleImage = `true`;
    }
});

// image background change
const imageBgClrInput = document.getElementById(`background-color`);
imageBgClrInput.addEventListener(`change`, e =>
{
    if (isSamplingInit) imageViewer.style.backgroundColor = e.target.value;
    else imageViewerBg = e.target.value;
    
    const historyImgBg = document.querySelectorAll(`#gallery a div:first-child`);
    for (let i = 0; i < historyImgBg.length; i++) {
        historyImgBg[i].style.backgroundColor = e.target.value;
    }
    bgClr = e.target.value;
});
imageBgClrInput.dispatchEvent(new Event(`change`));

// clipboard copy
const copy = document.getElementById(`copy`);
copy.addEventListener(`click`, () =>
{
    async function writeClipboardText(text)
    {
        try {
            await navigator.clipboard.writeText(text);
            copy.classList.add(`copied`);
            copy.innerText = `DONE`;
            setTimeout(() =>
            {
                copy.classList.remove(`copied`);
                copy.innerText = `COPY`;
            }, 1000);
        } catch (err) {
            console.error(err.message);
        }
    }

    if (sampledColors.length > 0) {
        const str = stringifySampledColors();
        writeClipboardText(str);
        isSampledColorsUpdated = false;
    }
});

// download .txt file
const download = document.getElementById(`download`);
download.addEventListener(`click`, () =>
{
    if (sampledColors.length > 0) {
        const blob = new Blob([stringifySampledColors()], {type: `text/plain`});
        const a = document.createElement(`a`);
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = `sampled-colors.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
});