import * as colorConversion from './color-conversion.js';

// define viewports

const imageViewer = document.querySelector(`canvas`)!;
const scope = document.getElementById(`scope`)!;
const recentClrs = document.getElementById(`recent-clrs`)!;

// block viewports contextmenus

//[imageViewer, scope, recentClrs].forEach(viewport =>
//  viewport.addEventListener(`contextmenu`, e => e.preventDefault()));

// canvas set up

const ctxIV = imageViewer!.getContext(`2d`)!;

// state management

let isCanvasInit = false;

// canvas resizing

const canvasContainer = document.querySelector(`*:has(> canvas)`);

function resizeCanvas() {
  const canvasContainerRect = canvasContainer!.getBoundingClientRect();
  imageViewer.width = canvasContainerRect.width;
  imageViewer.height = canvasContainerRect.height;

  ctxIV.imageSmoothingEnabled = false;
}

let horizontalMarginOffset: number;
const updateHorizontalMarginOffset = () =>
  horizontalMarginOffset = innerWidth * 0.1;

// responsively resize viewports

const viewports = document.getElementById(`viewports`)!;

const resizeObserver = new ResizeObserver(() => {
  resizeCanvas();
  if (isCanvasInit) render(inputImg);
  updateHorizontalMarginOffset();
});

resizeObserver.observe(viewports);

let inputImg: HTMLImageElement;
let imageDataObj: ImageData;
let scale = 1;
let tx = 0;
let ty = 0;

// get image's Uint8ClampedArray

function updateImageDataObj(img: HTMLImageElement) {
  const offscreen = document.createElement(`canvas`);
  offscreen.width = img.naturalWidth;
  offscreen.height = img.naturalHeight;

  const offCtx = offscreen.getContext(`2d`, { desynchronized: true })!;
  offCtx.drawImage(img, 0, 0);
  imageDataObj = offCtx.getImageData(
    0,
    0,
    img.naturalWidth,
    img.naturalHeight
  );
}

interface Px {
  r: number,
  g: number,
  b: number,
  alpha: number,
}

interface everyChannelIsEmpty {
  everyChannelIsEmpty: true
}

function getPxAt(x: number, y: number): Px | everyChannelIsEmpty {
  const xy = (y * imageDataObj.width + x) * 4;
  let clr = [imageDataObj.data[xy], imageDataObj.data[xy + 1], imageDataObj.data[xy + 2], imageDataObj.data[xy + 3]];
  if (clr.every(channel => channel === 0)) return { everyChannelIsEmpty: true };

  return {
    r: clr[0],
    g: clr[1],
    b: clr[2],
    alpha: clr[3] / 255,
  };
}

function updateIVscale(img: HTMLImageElement) {
  scale = Math.min(
    imageViewer.width / img.naturalWidth,
    imageViewer.height / img.naturalHeight
  );
}

function calculateFit(img: HTMLImageElement) {
  updateIVscale(img)
  tx = Math.round((imageViewer.width - (img.naturalWidth * scale)) / 2);
  ty = Math.round((imageViewer.height - (img.naturalHeight * scale)) / 2);
}

function render(img: HTMLImageElement) {
  if (!isCanvasInit) {
    inputImg = img;
    updateImageDataObj(img);
    calculateFit(img);
  }
  draw(img);
}

function draw(img: HTMLImageElement) {
  ctxIV.clearRect(0, 0, imageViewer.width, imageViewer.height);
  ctxIV.drawImage(
    img,
    tx,
    ty,
    img.naturalWidth * scale,
    img.naturalHeight * scale
  );
}

function getCanvasXY(e: MouseEvent) {
  return {
    x: Math.round(e.clientX - horizontalMarginOffset),
    y: Math.round(e.clientY - imageViewer.getBoundingClientRect().top)
  };
}

const samplingFrequencyInput = document.getElementById(`sampling-frequency`)! as HTMLInputElement;

function getCanvasXYOnlyInImg(e: MouseEvent) {
  let { x, y } = getCanvasXY(e);

  const right = tx + inputImg.naturalWidth * scale;
  const bottom = ty + inputImg.naturalHeight * scale;

  if (x < tx || x > right || y < ty || y > bottom)
    return { pointerIsOutsideOfImage: true };

  return { x, y };
}

let isUserPanning = false;
let isUserSamplingPath = false;
let lastSampledX: number | null = null;
let lastSampledY: number | null = null;
let accLength = 0;

function closeSamplingPath(e: PointerEvent) {
  isUserSamplingPath = false;
  lastSampledX = null;
  lastSampledY = null;
  accLength = 0;

  if (imageViewer.hasPointerCapture(e.pointerId)) {
    imageViewer.releasePointerCapture(e.pointerId);
  }
}

const clearCanvasBtn = document.getElementById(`clear-canvas`)!;

function calculateImgXY(x: number, y: number) {
  return {
    imgX: Math.floor((x - tx) / scale),
    imgY: Math.floor((y - ty) / scale)
  };
}

let canvasScrollingIconTimeoutId: NodeJS.Timeout;
const canvasControls = {
  pointerdown: {
    target: imageViewer,
    event: `pointerdown`,
    func: (e: PointerEvent) => {
      if (e.button === 0) {
        imageViewer.setPointerCapture(e.pointerId);

        const xy = getCanvasXYOnlyInImg(e);
        if (`pointerIsOutsideOfImage` in xy) {
          return;
        }
        const {x, y} = xy;

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
    func: (e: PointerEvent) => {
      if (isUserPanning) {
        tx += e.movementX;
        ty += e.movementY;

        draw(inputImg);
      }

      // compute coordinates for paint scope and paint hover field 

      const { x, y } = getCanvasXY(e);
      const { imgX, imgY } = calculateImgXY(x, y);

      // paint hover field

      if (imgX >= 0 || imgY >= 0) {
        const px = getPxAt(imgX, imgY); 
        if (!(`everyChannelIsEmpty` in px)) {
          const { r, g, b, alpha } = px;
          recentClrsFields[0].style.backgroundColor = `rgb(${r} ${g} ${b} / ${alpha})`;
        }
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
            const px = getPxAt(imgX, imgY); 
            if (!(`everyChannelIsEmpty` in px)) {
              const { r, g, b, alpha } = px;
              scopeLenses[lens].style.backgroundColor = `rgb(${r} ${g} ${b} / ${alpha})`;
            }
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
        const px = getCanvasXYOnlyInImg(pointerEvent);

        if (`pointerIsOutsideOfImage` in px) continue;

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
          function getPXsFromLine(x: number, y: number, x1: number, y1: number) {
            const pxs = [];
            const dx = Math.abs(x1 - x);
            const dy = Math.abs(y1 - y);
            const sx = x < x1 ? 1 : -1;
            const sy = y < y1 ? 1 : -1;
            let err = dx - dy;

            while (true) {
              pxs.push({ x, y });

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
            const { x, y } = pxs[i];
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
    func: (e: PointerEvent) => {
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
    func: (e: PointerEvent) => {
      isUserPanning = false;
      closeSamplingPath(e);
    }
  },
  zooming: {
    target: imageViewer,
    event: `wheel`,
    func: (e: WheelEvent) => {
      e.preventDefault();

      const { x, y } = getCanvasXY(e);

      const factor = Math.pow(1.05, -e.deltaY * 0.01);

      tx = x - (x - tx) * factor;
      ty = y - (y - ty) * factor;

      scale *= factor;

      draw(inputImg);

      imageViewer.style.cursor = `nesw-resize`;
      clearTimeout(canvasScrollingIconTimeoutId);
      canvasScrollingIconTimeoutId = setTimeout(() =>
        imageViewer.style.cursor = `pointer`
      , 200);
    }
  },
  clearCanvas: {
    target: clearCanvasBtn,
    func: () => manageCanvas()
  }
};

// define wire listeners for canvasControls and samplingBtns

function wireListeners(listeners: object) {
  const controller = new AbortController();

  Object.values(listeners).forEach(({ target, event, func }) => {
    target.addEventListener(event !== undefined ? event : `click`,
      func,
      { signal: controller.signal });
  });

  return () => controller.abort();
}

let abortCanvasControls: () => void;
const initCanvasControls = () => abortCanvasControls = wireListeners(canvasControls);

const scopeLenses = document.querySelectorAll<HTMLElement>(`#scope *`);

// sampled colors + recent colors

const sampledClrs: string[] = [];

function stringifySampledClrs() {
  return sampledClrs.toReversed().join(`\n`);
}

const recentClrsFields = document.querySelectorAll<HTMLElement>(`#recent-clrs *`);

function paintRecentClrsFields() {
  for (let i = 0; i < recentClrsFields.length - 1; i++) {
    if (sampledClrs[i] === undefined) break;

    recentClrsFields[i + 1].style.backgroundColor = sampledClrs[i];
  }
}

// color conversion entry point

const clrFormatSelect = document.getElementById(`clr-format`) as HTMLSelectElement;
function samplePx(x: number, y: number) {
  const { imgX, imgY } = calculateImgXY(x, y);
  const clr = getPxAt(imgX, imgY);
  if (`everyChannelIsEmpty` in clr) return;
  if (!isComplementaryUIInit) manageComplementaryUI()
  let convertedClr = ``;

  switch (clrFormatSelect.value) {
    case `OKLCH`: convertedClr = colorConversion.toOkLChText(clr); break;
    case `HEX`: convertedClr = colorConversion.rgbaToHEXAText(clr); break;
    case `RGB`: convertedClr = `rgb(${clr.r} ${clr.g} ${clr.b}${clr.alpha < 1 ? ` / ${clr.alpha.toFixed(3)}` : ""})`; break;
    case `sRGB`: convertedClr = `color(srgb ${(clr.r / 255).toFixed(3)} ${(clr.g / 255).toFixed(3)} ${(clr.b / 255).toFixed(3)}${clr.alpha < 1 ? ` / ${clr.alpha.toFixed(3)}` : ""})`; break;
    case `HSL`: convertedClr = colorConversion.toHSLAText(clr); break;
    case `LAB`: convertedClr = colorConversion.rgbaToLabText(clr); break;
    case `LCH`: convertedClr = colorConversion.toLCHText(clr); break;
    case `OKLAB`: convertedClr = colorConversion.toOkLabText(clr); break;
    case `HWB`: convertedClr = colorConversion.rgbaToHWBAText(clr); break;
    case `XYZ D50`: convertedClr = colorConversion.rgbaToXYZD50Text(clr); break;
    case `XYZ D65`: convertedClr = colorConversion.rgbaToXYZD65Text(clr); break;
  }

  sampledClrs.unshift(convertedClr);
  clipboardEnter(convertedClr);
  paintRecentClrsFields();
}

// add colors to DOM

const clrsCounter = document.getElementById(`counter`)!;
const clipboard = document.getElementById(`clipboard`)!;

function clipboardEnter(clr: string) {
  const li = document.createElement(`li`);
  const code = document.createElement(`code`);
  const div = document.createElement(`div`);

  code.textContent = clr;
  div.style.backgroundColor = clr;
  li.append(code, div);
  clipboard.prepend(li);
  li.setAttribute(`tabindex`, `0`);

  clrsCounter.innerText = String(sampledClrs.length);
}

// render first file image

export async function renderFile(file: string) {
  const img = new Image();
  let objectURL: string;

  await new Promise<void>(resolve => {
    img.onload = () => {
      render(img);

      if (objectURL) {
        URL.revokeObjectURL(objectURL);
      }

      resolve();
    };

    if (typeof file !== `string`) {
      objectURL = URL.createObjectURL(file);
      img.src = objectURL;
    } else img.src = file;
  });
}

// drag and drop

const samplingScreen = document.getElementById(`sampling-screen`)!;
const inputImgScreen = document.getElementById(`input-img-screen`)!;
const dragNDropInput = document.getElementById(`drag-n-drop`)!;

// image viewer background change

const imageViewerBgClrInput = document.getElementById(`image-viewer-bg-clr`) as HTMLInputElement;
const imageViewerBgClrTwoInput = document.getElementById(`image-viewer-bg-clr-two`) as HTMLInputElement;
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

function addSlideRightAnimation(elm: HTMLElement, triggerElm: HTMLElement) {
  const controller = new AbortController();

  (triggerElm ? triggerElm : elm).addEventListener(`mouseenter`, () =>
    elm.classList.add(`slide-right`), { signal: controller.signal });

  elm.addEventListener(`animationend`, () =>
    elm.classList.remove(`slide-right`), { signal: controller.signal });

  return () => {
    controller.abort();
    elm.classList.remove(`slide-right`);
  }
}

const clearCanvasSpan = document.querySelector<HTMLSpanElement>(`#clear-canvas *`)!;
const deleteSamplesSpan = document.querySelector<HTMLSpanElement>(`#delete-samples *`)!;

let abortClearCanvasSpanAnimation: () => void;
const initClearCanvasSpanAnimation = () =>
  abortClearCanvasSpanAnimation
  = addSlideRightAnimation(clearCanvasSpan, clearCanvasBtn);

let abortDeleteSamplesSpanAnimation: () => void;
const initDeleteSamplesSpanAnimation = () =>
  abortDeleteSamplesSpanAnimation
  = addSlideRightAnimation(deleteSamplesSpan, deleteSamplesBtn);

export async function manageCanvas(file?: string) {
  if (file) {
    inputImgScreen.style.visibility = `hidden`;
    await renderFile(file);
    initCanvasControls();
    paintRecentClrsFields();
    styleImageViewerBg();
    scope.classList.add(`active`);
    viewports.classList.add(`active`);
    clearCanvasBtn.classList.add(`active`);
    initClearCanvasSpanAnimation();

    isCanvasInit = true;
  } else {
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

const deleteSamplesBtn = document.getElementById(`delete-samples`)!;
const copyBtn = document.getElementById(`copy`)!;
const downloadBtn = document.getElementById(`download`)!;

const samplingBtns = {
  delete: {
    target: deleteSamplesBtn,
    func: () => manageComplementaryUI(`deinit`)
  },
  copy: {
    target: copyBtn,
    func: () => {
      async function writeClipboardText(text: string) {
        try {
          await navigator.clipboard.writeText(text);
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message);
          }
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
        { type: `text/plain` });
      const a = document.createElement(`a`);
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = `sampled-colors.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
};

let abortSamplingBtns: () => void;
const initSamplingBtns = () => abortSamplingBtns = wireListeners(samplingBtns);

let isComplementaryUIInit = false;

const clipboardContainer = document.querySelector(`*:has(> #clipboard)`)!;
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
    clrsCounter.innerText = `0`;

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

//// image click input

//dragNDropInput.addEventListener(`change`, e => {
//  manageCanvas(e.target.files[0]);
//  dragNDropInput.value = ``;
//});

//// drag and drop
//// source: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop

//function dropHandler(ev) {
//  ev.preventDefault();
//  const files = [...ev.dataTransfer.items]
//    .map((item) => item.getAsFile())
//    .filter((file) => file);
//  if (!isCanvasInit) manageCanvas(files[0]);
//  else renderFile(files[0]);
//}

//samplingScreen.addEventListener(`drop`, dropHandler);
//window.addEventListener(`drop`, (e) => {
//  if ([...e.dataTransfer.items].some((item) => item.kind === `file`)) {
//    e.preventDefault();
//  }
//});

//samplingScreen.addEventListener(`dragover`, (e) => {
//  const fileItems = [...e.dataTransfer.items].filter(
//    (item) => item.kind === `file`,
//  );
//  if (fileItems.length > 0) {
//    e.preventDefault();
//    if (fileItems.some((item) => item.type.startsWith(`image/`))) {
//      e.dataTransfer.dropEffect = `copy`;
//    } else {
//      e.dataTransfer.dropEffect = `none`;
//    }
//  }
//});

//window.addEventListener(`dragover`, (e) => {
//  const fileItems = [...e.dataTransfer.items].filter(
//    (item) => item.kind === `file`,
//  );
//  if (fileItems.length > 0) {
//    e.preventDefault();
//    if (!samplingScreen.contains(e.target)) {
//      e.dataTransfer.dropEffect = `none`;
//    }
//  }
//});

// load example image

const loadExampleImg = document.getElementById(`load-example-img`)!;
let isExampleImgLoaded = false;
loadExampleImg.addEventListener(`click`, () => {
  if (isExampleImgLoaded) return;

  manageCanvas(`example-photo-DVD-disc.avif`);
  isExampleImgLoaded = true;
});

// unsupport features
// clear canvas
// 