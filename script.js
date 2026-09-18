'use strict';

// rgb color conversion for every web color format
// source: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Colors/Color_format_converter

// for every final conversion:
//     input → {r: int, g: int, b: int: alpha: float}
//     output → string

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
  return Math.floor(i).toString(16).padStart(2, "0").toLowerCase();
}

function rgbToHEXText(c) {
  return `#${intToHex(c.r)}${intToHex(c.g)}${intToHex(c.b)}`;
}

function rgbaToHEXAText(color) {
  const hexText = rgbToHEXText(color);
  if (color.alpha === 1.0) {
    return hexText;
  }
  const alpha = intToHex(color.alpha * 255);
  return `${hexText}${alpha}`;
}

function rgbaToHSLA(color) {
  let { r, g, b, alpha } = color;
  // Let's have r, g, b in the range [0, 1]
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
  } else h = (r - g) / delta + 4;
  h = Math.round(h * 60);

  // We want an angle between 0 and 360°
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
  const { h, s, l, alpha } = rgbaToHSLA(color);
  return `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%${
    alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""
  })`;
}

function rgbaToHWBAText(color) {
  let { h, s, l, alpha } = rgbaToHSLA(color);
  const chroma = s * (1 - Math.abs(l / 50 - 1));
  let W = (l - chroma / 2).toFixed(0);
  let B = (100 - l - chroma / 2).toFixed(0);
  return `hwb(${h} ${W}% ${B}%${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

function rgbaToXYZD50(color) {
  let { r, g, b, alpha } = color;
  r = rgbToLinear(r / 255) * 255;
  g = rgbToLinear(g / 255) * 255;
  b = rgbToLinear(b / 255) * 255;

  const xyz = multiplyByMatrix(LRGB_XYZ_D50_MATRIX, [r, g, b]);
  return { x: xyz[0] / 255, y: xyz[1] / 255, z: xyz[2] / 255, alpha };
}

function rgbaToXYZD50Text(color) {
  let { alpha } = color;
  const xyz = rgbaToXYZD50(color);
  return `color(xyz-d50 ${xyz.x.toFixed(5)} ${xyz.y.toFixed(5)} ${xyz.z.toFixed(
    5,
  )}${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

function rgbaToXYZD65(color) {
  let { r, g, b, alpha } = color;
  r = rgbToLinear(r / 255) * 255;
  g = rgbToLinear(g / 255) * 255;
  b = rgbToLinear(b / 255) * 255;

  const xyz = multiplyByMatrix(LRGB_XYZ_D65_MATRIX, [r, g, b]);
  return { x: xyz[0] / 255, y: xyz[1] / 255, z: xyz[2] / 255, alpha };
}

function rgbaToXYZD65Text(color) {
  let { alpha } = color;
  const xyz = rgbaToXYZD65(color);
  return `color(xyz-d65 ${xyz.x.toFixed(5)} ${xyz.y.toFixed(5)} ${xyz.z.toFixed(
    5,
  )}${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

const D65 = [0.3457 / 0.3585, 1, 0.2958 / 0.3585];
function xyzToLab(color) {
  let { x, y, z, alpha } = color;
  [x, y, z] = [x, y, z].map((v, i) => {
    v /= D65[i];
    return v > 0.0088564516 ? Math.cbrt(v) : v * 903.2962962962963 + 16 / 116;
  });
  return { l: 116 * y - 16, a: 500 * (x - y), b: 200 * (y - z), alpha };
}

function rgbaToLabText(color) {
  let { alpha } = color;
  const xyz = rgbaToXYZD50(color);
  const lab = xyzToLab(xyz);
  return `lab(${lab.l.toFixed(3)} ${lab.a.toFixed(3)} ${lab.b.toFixed(3)}${
    alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""
  })`;
}

function rgbToOklab(color) {
  let { r, g, b, alpha } = color;
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
  let { alpha } = color;
  const oklab = rgbToOklab(color);
  return `oklab(${oklab.l.toFixed(5)} ${oklab.a.toFixed(5)} ${oklab.b.toFixed(
    5,
  )}${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

function labToLCH(color) {
  const { l, a, b, alpha } = color;
  const c = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * (180 / Math.PI);
  if (h < 0) {
    h += 360;
  }
  return { l, c, h, alpha };
}

function toLCHText(color) {
  let { alpha } = color;
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
  return { l: oklch.l, c: oklch.c, h: oklch.h, alpha: color.alpha };
}

function toOkLChText(color) {
  let { alpha } = color;
  const oklch = rgbaToOkLCh(color);
  return `oklch(${oklch.l.toFixed(5)} ${oklch.c.toFixed(5)} ${oklch.h.toFixed(
    5,
  )}${alpha < 1.0 ? ` / ${alpha.toFixed(3)}` : ""})`;
}

// define viewports

const imageViewer = document.querySelector(`canvas`);
const scope = document.getElementById(`scope`);
const recentClrs = document.getElementById(`recent-clrs`);

// block viewports contextmenus

[imageViewer, scope, recentClrs].forEach(viewport =>
    viewport.addEventListener(`contextmenu`, e => e.preventDefault()));

// canvas set up

const ctxIV = imageViewer.getContext(`2d`);

// canvas resizing

const canvasContainer = document.querySelector(`*:has(> canvas)`);

function resizeCanvas() {
    const canvasContainerRect = canvasContainer.getBoundingClientRect();
    imageViewer.width = canvasContainerRect.width;
    imageViewer.height = canvasContainerRect.height;

    ctxIV.imageSmoothingEnabled = false;
}

let horizontalMarginOffset;
const updateHorizontalMarginOffset = () => {
    horizontalMarginOffset = innerWidth * 0.1;
}

// responsively resize viewports

const viewports = document.getElementById(`viewports`);

const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
    if (inputImg !== undefined) render(inputImg);
    updateHorizontalMarginOffset();
});

resizeObserver.observe(viewports);

//

let inputImg;
let imageDataObj = null;
let scale = 1;
let tx = 0;
let ty = 0;

// get image's Uint8ClampedArray

function updateImageDataObj(img) {
    const offscreen = document.createElement(`canvas`);
    offscreen.width = img.naturalWidth;
    offscreen.height = img.naturalHeight;

    const offCtx = offscreen.getContext(`2d`, {desynchronized: true});
    offCtx.drawImage(img, 0, 0);
    imageDataObj = offCtx.getImageData(
        0,
        0, 
        img.naturalWidth,
        img.naturalHeight
    );
}

function getPxAt(x, y) {
	const xy = (y * imageDataObj.width + x) * 4;
    let clr = [imageDataObj.data[xy], imageDataObj.data[xy + 1], imageDataObj.data[xy + 2], imageDataObj.data[xy + 3]];
    if (clr.every(channel => channel === 0)) return {isEveryChannelEmpty: true};

	return {
        r: clr[0],
        g: clr[1],
        b: clr[2],
        alpha: clr[3] / 255,
    };
}

function updateIVscale(img) {
    scale = Math.min(
        imageViewer.width / img.naturalWidth,
        imageViewer.height / img.naturalHeight
    );
}

function calculateFit(img) {
    updateIVscale(img)
    tx = Math.round((imageViewer.width - (img.naturalWidth * scale)) / 2);
    ty = Math.round((imageViewer.height - (img.naturalHeight * scale)) / 2);
}

function render(img) {
    inputImg = img;
    updateImageDataObj(img);
    calculateFit(img);
    draw(img);
}

function draw(img) {
    ctxIV.clearRect(0, 0, imageViewer.width, imageViewer.height);
    ctxIV.drawImage(
        img,
        tx,
        ty,
        img.naturalWidth * scale,
        img.naturalHeight * scale
    );
}

function getCanvasXY(e) {
    return {
        x: Math.round(e.clientX - horizontalMarginOffset),
        y: Math.round(e.clientY - imageViewer.getBoundingClientRect().top)
    };
}

const samplingFrequencyInput = document.getElementById(`sampling-frequency`);

function getCanvasXYOnlyInImg(e) {
    let {x, y} = getCanvasXY(e);

    const right  = tx + inputImg.naturalWidth  * scale;
    const bottom = ty + inputImg.naturalHeight * scale;

    if (x < tx || x > right || y < ty || y > bottom)
        return {isPointerOutsideOfImage: true}; 

    return {x, y, isPointerOutsideOfImage: false};
}

let isUserPanning = false;
let isUserSamplingPath = false;
let lastSampledX = null;
let lastSampledY = null;
let accLength = 0;

function closeSamplingPath(e)
{
    isUserSamplingPath = false;
    lastSampledX = null;
    lastSampledY = null;
    accLength = 0;

    if (imageViewer.hasPointerCapture(e.pointerId)) {
        imageViewer.releasePointerCapture(e.pointerId);
    }
}

const clearCanvasBtn = document.getElementById(`clear-canvas`);

function calculateImgXY(x, y) {
    return {
        imgX: Math.floor((x - tx) / scale),
        imgY: Math.floor((y - ty) / scale)
    };
}

let canvasScrollingIconTimeoutId;
const canvasControls = {
    pointerdown: {
        target: imageViewer,
        event: `pointerdown`,
        func: e => {
            if (e.button === 0) {        
                imageViewer.setPointerCapture(e.pointerId);
                
                const {x, y, isPointerOutsideOfImage}
                = getCanvasXYOnlyInImg(e);
                if (isPointerOutsideOfImage) return;

                isUserSamplingPath = true;
                accLength = 0;
                samplePx(x, y);
                lastSampledX = x;
                lastSampledY = y;

                imageViewer.style.cursor = `crosshair`;
            } else if (e.button === 2) {
                imageViewer.setPointerCapture(e.pointerId);
                isUserPanning = true;

                imageViewer.style.cursor = `grabbing`;
            }
        }
    },
    pointerMovement: {
        target: imageViewer,
        event: `pointermove`,
        func: e => {
            if (isUserPanning) {
                tx += e.movementX;
                ty += e.movementY;

                draw(inputImg);
            }

            // compute coordinates for paint scope and paint hover field 

            const {x, y} = getCanvasXY(e);
            const {imgX, imgY} = calculateImgXY(x, y);

            // paint hover field

            if (imgX >= 0 || imgY >= 0) {
                const {r, g, b, alpha, isEveryChannelEmpty} = getPxAt(imgX, imgY);
                if (!isEveryChannelEmpty) recentClrsFields[0].style.backgroundColor = `rgb(${r} ${g} ${b} / ${alpha})`;
            } else {
                recentClrsFields[0].style.backgroundColor = `initial`;
            }

            // paint scope

            let lens = 0;
            for (let dy = -4; dy <= 4; dy++) {
                for (let dx = -4; dx <= 4; dx++) {
                    const pxX = imgX + dx;
                    const pxY = imgY + dy;

                    if (pxX >= 0 && pxX < imageDataObj.width &&
                        pxY >= 0 && pxY < imageDataObj.height) {
                        const {r, g, b, alpha, isEveryChannelEmpty} = getPxAt(imgX, imgY)
                        if (!isEveryChannelEmpty) scopeLenses[lens].style.backgroundColor = `rgb(${r} ${g} ${b} / ${alpha})`;
                    } else {
                        scopeLenses[lens].style.backgroundColor = `initial`;
                    }

                    lens++;
                }
            }

            // sample path

            if (!isUserSamplingPath) return;

            const pointerEvents = e.getCoalescedEvents();

            for (const pointerEvent of pointerEvents) {
                const {x, y, isPointerOutsideOfImage}
                = getCanvasXYOnlyInImg(pointerEvent);

                if (isPointerOutsideOfImage) continue;

                if (lastSampledX === null || lastSampledY === null) {
                    samplePx(x, y);
                    lastSampledX = x;
                    lastSampledY = y;
                    accLength = 0;
                    continue;
                }

                const f = Number(samplingFrequencyInput.value);
                if (f >= 2) {
                    let x1 = lastSampledX;
                    let y1 = lastSampledY;
                    const x2 = x;
                    const y2 = y;

                    let lineLength = Math.hypot(x2 - x1, y2 - y1);
                    if (lineLength === 0) continue;

                    accLength += lineLength;

                    while (accLength >= f) {
                        const needed = f - (accLength - lineLength);
                        const interpStep = Math.min(Math.max(needed / lineLength, 0), 1);

                        const interpX = Math.round(x1 + interpStep * (x2 - x1));
                        const interpY = Math.round(y1 + interpStep * (y2 - y1));

                        samplePx(x, y);

                        accLength -= f;
                        lineLength = lineLength - needed;
                        x1 = interpX;
                        y1 = interpY;

                        if (lineLength <= 0) break;
                    }

                    lastSampledX = x;
                    lastSampledY = y;
                } else {
                    function getPXsFromLine(x, y, x1, y1) {
                        const pxs = [];
                        const dx = Math.abs(x1 - x);
                        const dy = Math.abs(y1 - y);
                        const sx = x < x1 ? 1 : -1;
                        const sy = y < y1 ? 1 : -1;
                        let err = dx - dy;

                        while (true) {
                            pxs.push({x, y});

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

                        return pxs;
                    }

                    const pxs = getPXsFromLine(lastSampledX, lastSampledY, x, y);
                    for (let i = 1; i < pxs.length; i++) {
                        const {x, y} = pxs[i];
                        samplePx(x, y);
                    }

                    lastSampledX = x;
                    lastSampledY = y;
                }
            }
        }
    },
    pointerup: {
        target: imageViewer,
        event: `pointerup`,
        func: e => {
            if (e.button === 0) {
                closeSamplingPath(e);

                imageViewer.style.cursor = `pointer`;
            } else if (e.button === 2) {
                if (isUserPanning) imageViewer.releasePointerCapture(e.pointerId);
                isUserPanning = false;

                imageViewer.style.cursor = `pointer`;
            }
        }
    },
    lostpointercapture: {
        target: imageViewer,
        event: `lostpointercapture`,
        func: e => {
            isUserPanning = false;
            closeSamplingPath(e);
        }
    },
    zooming: {
        target: imageViewer,
        event: `wheel`,
        func: e => {
            e.preventDefault();

            const {x, y} = getCanvasXY(e);

            const factor = Math.pow(1.05, -e.deltaY * 0.01);

            tx = x - (x - tx) * factor;
            ty = y - (y - ty) * factor;

            scale *= factor;

            draw(inputImg);

            imageViewer.style.cursor = `nesw-resize`;
            clearTimeout(canvasScrollingIconTimeoutId);
            canvasScrollingIconTimeoutId = setTimeout(() =>
                imageViewer.style.cursor = `pointer`,
            200);
        }
    },
    clearCanvas: {
        target: clearCanvasBtn,
        func: () => manageCanvas(`deinit`)
    }
};

// define wire listeners for canvasControls and samplingBtns

function wireListeners(listeners) {
    const controller = new AbortController();

    Object.values(listeners).forEach(({target, event, func}) => {
        target.addEventListener(event !== undefined ? event : `click`,
            func,
        {signal: controller.signal});
    });

    return () => controller.abort();
}

let abortCanvasControls;
const initCanvasControls = () => abortCanvasControls = wireListeners(canvasControls);

const scopeLenses = document.querySelectorAll(`#scope *`);

// sampled colors + recent colors

const sampledClrs = [];

function stringifySampledClrs() {
    return sampledClrs.toReversed().join(`\n`);
}

const recentClrsFields = document.querySelectorAll(`#recent-clrs *`);

function paintRecentClrsFields() {
    for (let i = 0; i < recentClrsFields.length - 1; i++) {
        if (sampledClrs[i] === undefined) break;

        recentClrsFields[i + 1].style.backgroundColor = sampledClrs[i];
    }
}

// color conversion entry point

const clrFormatSelect = document.getElementById(`clr-format`);
function samplePx(x, y) {
    const {imgX, imgY} = calculateImgXY(x, y);
    const clr = getPxAt(imgX, imgY);
    const {isEveryChannelEmpty} = clr;
    if (isEveryChannelEmpty) return;
    if (!isComplementaryUIInit) manageComplementaryUI()
    let convertedClr;

    switch (clrFormatSelect.value) {
        case `OKLCH`: convertedClr = toOkLChText(clr); break;
        case `HEX`: convertedClr = rgbaToHEXAText(clr); break;
        case `RGB`: convertedClr = `rgb(${clr.r} ${clr.g} ${clr.b}${clr.alpha < 1 ? ` / ${clr.alpha.toFixed(3)}` : ""})`; break;
        case `sRGB`: convertedClr = `color(srgb ${(clr.r / 255).toFixed(3)} ${(clr.g / 255).toFixed(3)} ${(clr.b / 255).toFixed(3)}${clr.alpha < 1 ? ` / ${clr.alpha.toFixed(3)}` : ""})`; break;
        case `HSL`: convertedClr = toHSLAText(clr); break;
        case `LAB`: convertedClr = rgbaToLabText(clr); break;
        case `LCH`: convertedClr = toLCHText(clr); break;
        case `OKLAB`: convertedClr = toOkLabText(clr); break;
        case `HWB` : convertedClr = rgbaToHWBAText(clr); break;
        case `XYZ D50`: convertedClr = rgbaToXYZD50Text(clr); break;
        case `XYZ D65`: convertedClr = rgbaToXYZD65Text(clr); break;
    }

    sampledClrs.unshift(convertedClr);
    clipboardEnter(convertedClr);
    paintRecentClrsFields();
}

// add colors to DOM

const clrsCounter = document.getElementById(`counter`);
const clipboard = document.getElementById(`clipboard`);

function clipboardEnter(clr) {
    const li = document.createElement(`li`);
    const code = document.createElement(`code`);
    const div = document.createElement(`div`);

    code.textContent = clr;
    div.style.backgroundColor = clr;
    li.append(code, div);
    clipboard.prepend(li);
    li.setAttribute(`tabindex`, `0`);

    clrsCounter.innerText = sampledClrs.length;
}

// render first file image

function renderFile(file)
{
    const img = new Image();
    if (typeof file !== `string`) {
        const objectURL = URL.createObjectURL(file);
        img.onload = () =>
        {
            render(img);
            URL.revokeObjectURL(objectURL);
        };
        img.src = objectURL;
    } else {
        img.onload = () =>
        {
            render(img);
        };
        img.src = file;
    }
    return img;
}

// drag and drop

const samplingScreen = document.getElementById(`sampling-screen`);
const inputImgScreen = document.getElementById(`input-img-screen`);
const dragNDropInput = document.getElementById(`drag-n-drop`);
const dragNDropLabel = document.querySelector(`#input-img-screen label`);
const svg = document.querySelector(`#input-img-screen svg`);
const marchingAntGradient = document.getElementById(`marching-ant-gradient`);

// state management

let isCanvasInit = false;

// image viewer background change

const imageViewerBgClrInput = document.getElementById(`image-viewer-bg-clr`);
const imageViewerBgClrTwoInput = document.getElementById(`image-viewer-bg-clr-two`);
function styleImageViewerBg(clr = imageViewerBgClrInput.value, clr2 = imageViewerBgClrTwoInput.value) {
    imageViewer.style.setProperty(`--image-viewer-bg-clr`, clr);
    imageViewer.style.setProperty(`--image-viewer-bg-clr-two`, clr2);
}
imageViewerBgClrInput.addEventListener(`input`, () => {
    if (isCanvasInit) styleImageViewerBg()
});
imageViewerBgClrTwoInput.addEventListener(`input`, () => {
    if (isCanvasInit) styleImageViewerBg()
});

// slide right text animation management

function addSlideRightAnimation(elm, triggerElm) {
    const controller = new AbortController();

    (triggerElm ? triggerElm : elm).addEventListener(`mouseenter`, () =>
    elm.classList.add(`slide-right`), {signal: controller.signal});

    elm.addEventListener(`animationend`, () =>
    elm.classList.remove(`slide-right`), {signal: controller.signal});

    return () => {
        controller.abort();
        elm.classList.remove(`slide-right`);
    }
}

const clearCanvasSpan = document.querySelector(`#clear-canvas *`);
const deleteSamplesSpan = document.querySelector(`#delete-samples *`);

let abortClearCanvasSpanAnimation;
const initClearCanvasSpanAnimation = () =>
    abortClearCanvasSpanAnimation
    = addSlideRightAnimation(clearCanvasSpan, clearCanvasBtn);

let abortDeleteSamplesSpanAnimation;
const initDeleteSamplesSpanAnimation = () =>
    abortDeleteSamplesSpanAnimation
    = addSlideRightAnimation(deleteSamplesSpan, deleteSamplesBtn);

function manageCanvas(str, file) {
    if (str === `init`) {
        inputImgScreen.style.visibility = `hidden`;
        renderFile(file);
        initCanvasControls();
        paintRecentClrsFields();
        styleImageViewerBg();
        scope.classList.add(`active`);
        viewports.classList.add(`active`);
        clearCanvasBtn.classList.add(`active`);
        initClearCanvasSpanAnimation();

        isCanvasInit = true;
    } else if (str === `deinit`) {
        inputImgScreen.style.visibility = `initial`;
        abortCanvasControls();
        ctxIV.clearRect(0, 0, imageViewer.width, imageViewer.height);
        scopeLenses.forEach(lens => lens.style.backgroundColor = `initial`);
        recentClrsFields.forEach(field => field.style.backgroundColor = `initial`);
        styleImageViewerBg(`initial`, `initial`);
        scope.classList.remove(`active`);
        viewports.classList.remove(`active`);
        clearCanvasBtn.classList.remove(`active`);
        abortClearCanvasSpanAnimation();

        isCanvasInit = false;
        isExampleImgLoaded = false;
    }
}

const deleteSamplesBtn = document.getElementById(`delete-samples`);
const copyBtn = document.getElementById(`copy`);
const downloadBtn = document.getElementById(`download`);

const samplingBtns = {
    delete: {
        target: deleteSamplesBtn,
        func: () => manageComplementaryUI(`deinit`)
    },
    copy: {
        target: copyBtn,
        func: () => {
            async function writeClipboardText(text) {
                try {
                    await navigator.clipboard.writeText(text);
                } catch (err) {
                    console.error(err.message);
                }
            }
            
            const str = stringifySampledClrs();
            writeClipboardText(str);

            copyBtn.classList.add(`copied`);
            copyBtn.textContent = `DONE`;
            setTimeout(() => {
                copyBtn.classList.remove(`copied`);
                copyBtn.textContent = `COPY`;
            }, 1000);
        }
    },
    download: {
        target: downloadBtn,
        func: () => {
            const blob = new Blob([stringifySampledClrs()],
                {type: `text/plain`});
            const a = document.createElement(`a`);
            const url = URL.createObjectURL(blob);
            a.href = url;
            a.download = `sampled-colors.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }
};

let abortSamplingBtns;
const initSamplingBtns = () => abortSamplingBtns = wireListeners(samplingBtns);

let isComplementaryUIInit = false; 

const clipboardContainer = document.querySelector(`*:has(> #clipboard)`);
function manageComplementaryUI(str = `init`) {
    if (str === `init`) {
        initSamplingBtns();
        deleteSamplesBtn.classList.add(`active`);
        copyBtn.classList.add(`active`);
        downloadBtn.classList.add(`active`);
        clipboard.classList.remove(`empty`);
        clipboardContainer.classList.add(`active`);
        initDeleteSamplesSpanAnimation();

        isComplementaryUIInit = true;
    } else if (str === `deinit`) {
        sampledClrs.length = 0;
        clipboard.replaceChildren();
        clrsCounter.innerText = 0;

        recentClrsFields.forEach(field => field.style.backgroundColor = `initial`);
        abortSamplingBtns();
        deleteSamplesBtn.classList.remove(`active`);
        copyBtn.classList.remove(`active`);
        downloadBtn.classList.remove(`active`);
        clipboard.classList.add(`empty`);
        clipboardContainer.classList.remove(`active`);
        abortDeleteSamplesSpanAnimation();

        isComplementaryUIInit = false;
    }
}

// image click input

dragNDropInput.addEventListener(`change`, e => {
    manageCanvas(`init`, e.target.files[0]);
    dragNDropInput.value = ``;
});

// drag and drop
// source: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop

function dropHandler(ev) {
  ev.preventDefault();
  const files = [...ev.dataTransfer.items]
    .map((item) => item.getAsFile())
    .filter((file) => file);
  if (!isCanvasInit) manageCanvas(`init`, files[0]);
  else renderFile(files[0]);
}

samplingScreen.addEventListener(`drop`, dropHandler);
window.addEventListener(`drop`, (e) => {
  if ([...e.dataTransfer.items].some((item) => item.kind === `file`)) {
    e.preventDefault();
  }
});

samplingScreen.addEventListener(`dragover`, (e) => {
  const fileItems = [...e.dataTransfer.items].filter(
    (item) => item.kind === `file`,
  );
  if (fileItems.length > 0) {
    e.preventDefault();
    if (fileItems.some((item) => item.type.startsWith(`image/`))) {
      e.dataTransfer.dropEffect = `copy`;
    } else {
      e.dataTransfer.dropEffect = `none`;
    }
  }
});

window.addEventListener(`dragover`, (e) => {
  const fileItems = [...e.dataTransfer.items].filter(
    (item) => item.kind === `file`,
  );
  if (fileItems.length > 0) {
    e.preventDefault();
    if (!samplingScreen.contains(e.target)) {
      e.dataTransfer.dropEffect = `none`;
    }
  }
});

// load example image

const loadExampleImg = document.getElementById(`load-example-img`);
let isExampleImgLoaded = false;
loadExampleImg.addEventListener(`click`, () => {
    if (isExampleImgLoaded) return;

    manageCanvas(`init`, `example-photo-DVD-disc.avif`);
    isExampleImgLoaded = true;
});