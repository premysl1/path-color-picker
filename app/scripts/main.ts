import * as colorConversion from './color-conversion.js';

// define viewports

const canvas = document.querySelector(`canvas`)!;
const scope = document.getElementById(`scope`)!;

// canvas set up

const ctx = canvas!.getContext(`2d`)!;

// state management

let isCanvasInit = false;

// canvas resizing

const canvasContainer = document.querySelector(`:has(> canvas)`);

function resizeCanvas() {
  const canvasContainerRect = canvasContainer!.getBoundingClientRect();
  canvas.width = canvasContainerRect.width;
  canvas.height = canvasContainerRect.height;

  ctx.imageSmoothingEnabled = false;
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
//let scale = 1;
//let tx = 0;
//let ty = 0;

// get image's Uint8ClampedArray

//function updateImageDataObj(img: HTMLImageElement) {
//  const offscreen = document.createElement(`canvas`);
//  offscreen.width = img.naturalWidth;
//  offscreen.height = img.naturalHeight;

//  const offCtx = offscreen.getContext(`2d`, { desynchronized: true })!;
//  offCtx.drawImage(img, 0, 0);
//  imageDataObj = offCtx.getImageData(
//    0,
//    0,
//    img.naturalWidth,
//    img.naturalHeight
//  );
//}

interface Pixel {
  r: number,
  g: number,
  b: number,
  alpha: number
}

interface everyChannelIsEmpty {
  everyChannelIsEmpty: true
}

function getPixelAt(
  imageDataObj: ImageData,
  x: number,
  y: number
): Pixel | everyChannelIsEmpty {
  const xy = (y * imageDataObj.width + x) * 4;
  const color = [
    imageDataObj.data[xy],
    imageDataObj.data[xy + 1],
    imageDataObj.data[xy + 2],
    imageDataObj.data[xy + 3]
  ];

  if (color.every(channel => channel === 0)) {
    return { everyChannelIsEmpty: true };
  }

  return {
    r: color[0],
    g: color[1],
    b: color[2],
    alpha: color[3] / 255,
  };
}

function render(img: HTMLImageElement) {
  if (!isCanvasInit) {
    inputImg = img;
    updateImageDataObj(img);
    scale = Math.min(
      canvas.width / img.naturalWidth,
      canvas.height / img.naturalHeight
    );
    tx = Math.round((canvas.width - (img.naturalWidth * scale)) / 2);
    ty = Math.round((canvas.height - (img.naturalHeight * scale)) / 2);
  }
  draw(img);
}

//function draw(img: HTMLImageElement) {
//  ctx.clearRect(0, 0, canvas.width, canvas.height);
//  ctx.drawImage(
//    img,
//    tx,
//    ty,
//    img.naturalWidth * scale,
//    img.naturalHeight * scale
//  );
//}

function getCanvasXY(e: MouseEvent) {
  return {
    x: Math.round(e.clientX - horizontalMarginOffset),
    y: Math.round(e.clientY - canvas.getBoundingClientRect().top)
  };
}

const samplingFrequencyInput = document.getElementById(`sampling-frequency`)! as HTMLInputElement;

//function getCanvasXYOnlyInImg(e: MouseEvent) {
//  let { x, y } = getCanvasXY(e);

//  const right = tx + inputImg.naturalWidth * scale;
//  const bottom = ty + inputImg.naturalHeight * scale;

//  if (x < tx || x > right || y < ty || y > bottom)
//    return { pointerIsOutsideOfImage: true };

//  return { x, y };
//}

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

  if (canvas.hasPointerCapture(e.pointerId)) {
    canvas.releasePointerCapture(e.pointerId);
  }
}

const clearCanvasBtn = document.getElementById(`clear-canvas`)!;

//function calculateImgXy(x: number, y: number) {
//  return {
//    imgX: Math.floor((x - tx) / scale),
//    imgY: Math.floor((y - ty) / scale)
//  };
//}

let canvasScrollingIconTimeoutId: NodeJS.Timeout;
const canvasControls = {
  pointerdown: {
    target: canvas,
    event: `pointerdown`,
    func: (e: PointerEvent) => {
      if (e.button === 0) {
        canvas.setPointerCapture(e.pointerId);

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

        canvas.style.cursor = `crosshair`;
      } else if (e.button === 2) {
        canvas.setPointerCapture(e.pointerId);
        isUserPanning = true;

        canvas.style.cursor = `grabbing`;
      }
    }
  },
  pointerMovement: {
    target: canvas,
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
    target: canvas,
    event: `pointerup`,
    func: (e: PointerEvent) => {
      if (e.button === 0) {
        closeSamplingPath(e);

        canvas.style.cursor = `pointer`;
      } else if (e.button === 2) {
        if (isUserPanning) canvas.releasePointerCapture(e.pointerId);
        isUserPanning = false;

        canvas.style.cursor = `pointer`;
      }
    }
  },
  lostpointercapture: {
    target: canvas,
    event: `lostpointercapture`,
    func: (e: PointerEvent) => {
      isUserPanning = false;
      closeSamplingPath(e);
    }
  },
  zooming: {
    target: canvas,
    event: `wheel`,
    func: (e: WheelEvent) => {
      e.preventDefault();

      const { x, y } = getCanvasXY(e);

      const factor = Math.pow(1.05, -e.deltaY * 0.01);

      tx = x - (x - tx) * factor;
      ty = y - (y - ty) * factor;

      scale *= factor;

      draw(inputImg);

      canvas.style.cursor = `nesw-resize`;
      clearTimeout(canvasScrollingIconTimeoutId);
      canvasScrollingIconTimeoutId = setTimeout(() =>
        canvas.style.cursor = `pointer`
      , 200);
    }
  },
  //clearCanvas: {
  //  target: clearCanvasBtn,
  //  func: () => manageCanvas()
  //}
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

// color conversion entry point

const clrFormatSelect = document.getElementById(`clr-format`) as HTMLSelectElement;
function samplePx(x: number, y: number) {
  const { imgX, imgY } = calculateImageXy(x, y);
  const clr = getPixelAt(imgX, imgY);

  if (`everyChannelIsEmpty` in clr) {
    return;
  }

  let convertedClr = ``;

  switch (clrFormatSelect.value) {
    case `RGB`: convertedClr = `rgb(${clr.r} ${clr.g} ${clr.b}${clr.alpha < 1 ? ` / ${clr.alpha.toFixed(3)}` : ""})`; break;
    case `sRGB`: convertedClr = `color(srgb ${(clr.r / 255).toFixed(3)} ${(clr.g / 255).toFixed(3)} ${(clr.b / 255).toFixed(3)}${clr.alpha < 1 ? ` / ${clr.alpha.toFixed(3)}` : ""})`; break;
    case `HEX`: convertedClr = colorConversion.rgbaToHEXAText(clr); break;
    case `OKLCH`: convertedClr = colorConversion.toOkLChText(clr); break;
    case `OKLAB`: convertedClr = colorConversion.toOkLabText(clr); break;
    case `HSL`: convertedClr = colorConversion.toHSLAText(clr); break;
    case `XYZ D50`: convertedClr = colorConversion.rgbaToXYZD50Text(clr); break;
    case `XYZ D65`: convertedClr = colorConversion.rgbaToXYZD65Text(clr); break;
    case `LAB`: convertedClr = colorConversion.rgbaToLabText(clr); break;
    case `LCH`: convertedClr = colorConversion.toLCHText(clr); break;
    case `HWB`: convertedClr = colorConversion.rgbaToHWBAText(clr); break;
  }

  sampledClrs.unshift(convertedClr);
}

// add colors to DOM

//const clrsCounter = document.getElementById(`counter`)!;
const clipboard = document.getElementById(`clipboard`)!;

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
    } else {
      img.src = file;
    }
  });
}

// drag and drop

//const samplingScreen = document.getElementById(`sampling-screen`);
//const inputImgScreen = document.getElementById(`input-img-screen`);
//const dragNDropInput = document.getElementById(`drag-n-drop`);

const deleteSamplesBtn = document.getElementById(`delete-samples`)!;
const copyBtn = document.getElementById(`copy`)!;
const downloadBtn = document.getElementById(`download`)!;

//const samplingBtns = {
//  delete: {
//    target: deleteSamplesBtn,
//    func: () => manageComplementaryUI(`deinit`)
//  },
//  copy: {
//    target: copyBtn,
//    func: () => {
//      async function writeClipboardText(text: string) {
//        try {
//          await navigator.clipboard.writeText(text);
//        } catch (error) {
//          if (error instanceof Error) {
//            console.error(error.message);
//          }
//        }
//      }

//      const str = stringifySampledClrs();
//      writeClipboardText(str);

//      copyBtn.classList.add(`copied`);
//      copyBtn.textContent = `DONE`;
//      setTimeout(() => {
//        copyBtn.classList.remove(`copied`);
//        copyBtn.textContent = `COPY`;
//      }, 1000);
//    }
//  },
//  download: {
//    target: downloadBtn,
//    func: () => {
//      const blob = new Blob([stringifySampledClrs()],
//        { type: `text/plain` });
//      const a = document.createElement(`a`);
//      const url = URL.createObjectURL(blob);
//      a.href = url;
//      a.download = `sampled-colors.txt`;
//      a.click();
//      URL.revokeObjectURL(url);
//    }
//  }
//};

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

// unsupport features
// clear canvas
// load example image
// recent colours
// slide right animation

























  //const canvasContainer = useRef<HTMLDivElement>(null);
  //const lenses = useRef<HTMLDivElement[]>([]);
  //const [renderedImage, setRenderedImage] = useState<HTMLImageElement | null>(null);
  //const imageDataObj = useRef<ImageData>(null);
  //const tx = useRef(0);
  //const ty = useRef(0);
  //const scale = useRef(1);
  //const [sampledColors, setSampledColors] = useState<string[]>([]);
  //let isUserPanning = false;
  //let isUserSamplingPath = false; 
  //let lastSampledX: number | null = null;
  //let lastSampledY: number | null = null;
  //let accLength = 0;

  //const stringifySampledColors = () => sampledColors.toReversed().join(`\n`);

  //function calculateImage(x: number, y: number) {
  //  return {
  //    imageX: Math.floor((x - tx.current) / scale.current),
  //    imageY: Math.floor((y - ty.current) / scale.current)
  //  };
  //}

  //interface Pixel {
  //  r: number,
  //  g: number,
  //  b: number,
  //  alpha: number,
  //}

  //interface everyChannelIsEmpty {
  //  everyChannelIsEmpty: true
  //}

  ////function getPixelAt(
  ////  imageDataObj: ImageData,
  ////  x: number,
  ////  y: number
  ////): Pixel | everyChannelIsEmpty {
  ////  const xy = (y * imageDataObj.width + x) * 4;
  ////  const color = [
  ////    imageDataObj.data[xy],
  ////    imageDataObj.data[xy + 1],
  ////    imageDataObj.data[xy + 2],
  ////    imageDataObj.data[xy + 3]
  ////  ];

  ////  if (color.every(channel => channel === 0)) {
  ////    return { everyChannelIsEmpty: true };
  ////  }

  ////  return {
  ////    r: color[0],
  ////    g: color[1],
  ////    b: color[2],
  ////    alpha: color[3] / 255,
  ////  };
  ////}

  //function samplePixel(x: number, y: number) {
  //  if (!(imageDataObj.current && selectFormat.current)) {
  //    return;
  //  }
    
  //  const {imageX, imageY} = calculateImage(x, y);
  //  const color = getPixelAt(imageDataObj.current, imageX, imageY);

  //  if (`everyChannelIsEmpty` in color) {
  //    return;
  //  }

  //  let convertedColor = ``;

  //  switch (selectFormat.current.value) {
  //    case `OKLCH`: convertedColor = colorConversion.toOkLChText(color); break;
  //    case `HEX`: convertedColor = colorConversion.rgbaToHEXAText(color); break;
  //    case `RGB`: convertedColor = `rgb(${color.r} ${color.g} ${color.b}${color.alpha < 1 ? ` / ${color.alpha.toFixed(3)}` : ``})`; break;
  //    case `sRGB`: convertedColor = `color(srgb ${(color.r / 255).toFixed(3)} ${(color.g / 255).toFixed(3)} ${(color.b / 255).toFixed(3)}${color.alpha < 1 ? ` / ${color.alpha.toFixed(3)}` : ``})`; break;
  //    case `HSL`: convertedColor = colorConversion.toHSLAText(color); break;
  //    case `LAB`: convertedColor = colorConversion.rgbaToLabText(color); break;
  //    case `LCH`: convertedColor = colorConversion.toLCHText(color); break;
  //    case `OKLAB`: convertedColor = colorConversion.toOkLabText(color); break;
  //    case `HWB`: convertedColor = colorConversion.rgbaToHWBAText(color); break;
  //    case `XYZ D50`: convertedColor = colorConversion.rgbaToXYZD50Text(color); break;
  //    case `XYZ D65`: convertedColor = colorConversion.rgbaToXYZD65Text(color); break;
  //  }

  //  setSampledColors([...sampledColors, convertedColor]);
  //}

  //function render(image: HTMLImageElement) {
  //  if (renderedImage !== null) {
  //    renderedImage = image;

  //    const offscreen = document.createElement(`canvas`);
  //    offscreen.width = image.naturalWidth;
  //    offscreen.height = image.naturalHeight;

  //    const offscreenCtx = offscreen.getContext(`2d`, { desynchronized: true })!;
  //    offscreenCtx.drawImage(image, 0, 0);
  //    imageDataObj = offscreenCtx.getImageData(
  //      0,
  //      0,
  //      image.naturalWidth,
  //      image.naturalHeight
  //    );

  //    scale = Math.min(
  //      canvas.width / image.naturalWidth,
  //      canvas.height / image.naturalHeight
  //    );

  //    tx = Math.round((canvas.width - (image.naturalWidth * scale)) / 2);
  //    ty = Math.round((canvas.height - (image.naturalHeight * scale)) / 2);
  //  }

  //  draw(ctx, canvas, image);
  //}

  //function draw(
  //  ctx: CanvasRenderingContext2D,
  //  canvas: HTMLCanvasElement,
  //  img: HTMLImageElement
  //) {
  //  ctx.clearRect(
  //    0,
  //    0,
  //    canvas.width,
  //    canvas.height
  //  );
  //  ctx.drawImage(
  //    img,
  //    tx.current,
  //    ty.current,
  //    img.naturalWidth * scale.current,
  //    img.naturalHeight * scale.current
  //  );
  //}

  //function getCanvasXy(e: React.MouseEvent) {
  //  return {
  //    x: Math.round(e.clientX - canvas.current.getBoundingClientRect().left),
  //    y: Math.round(e.clientY - canvas.current.getBoundingClientRect().top)
  //  };
  //}

  //function getCanvasXyOnlyInImage(e: React.MouseEvent) {
  //  let {x, y} = getCanvasXY(e);

  //  const right = tx.current + renderedImage.naturalWidth * scale.current;
  //  const bottom = ty.current + renderedImage.naturalHeight * scale.current;

  //  if (x < tx.current || x > right || y < ty.current || y > bottom)
  //    return {pointerIsOutsideOfImage: true};

  //  return {x, y};
  //}

  //function handlePointerdown(e: React.PointerEvent) {
  //  if (canvas.current) {
  //    return;
  //  }
    
  //  if (e.button === 0) {
  //    canvas.current.setPointerCapture(e.pointerId);

  //    const xy = getCanvasXYOnlyInImg(e);

  //    if (`pointerIsOutsideOfImage` in xy) {
  //      return;
  //    }

  //    const {x, y} = xy;

  //    isUserSamplingPath = true;
  //    accLength = 0;
  //    samplePixel(x, y);
  //    lastSampledX = x;
  //    lastSampledY = y;

  //    canvas.current.style.cursor = `crosshair`;
  //  } else if (e.button === 2) {
  //    canvas.current.setPointerCapture(e.pointerId);
  //    isUserPanning = true;

  //    canvas.current.style.cursor = `grabbing`;
  //  }
  //}

  //function handleMovement(e: React.PointerEvent) {
  //  if (isUserPanning) {
  //    tx.current += e.movementX;
  //    ty.current += e.movementY;

  //    draw(inputImg);
  //  }

  //  // compute coordinates for paint scope and paint hover field 

  //  const { x, y } = getCanvasXy(e);
  //  const { imgX, imgY } = calculateImgXy(x, y);

  //  // paint scope

  //  let lens = 0;
  //  for (let dy = -4; dy <= 4; dy++) {
  //    for (let dx = -4; dx <= 4; dx++) {
  //      const pxX = imgX + dx;
  //      const pxY = imgY + dy;

  //      if (pxX >= 0 && pxX < imageDataObj.width &&
  //        pxY >= 0 && pxY < imageDataObj.height) {
  //        const px = getPixelAt(imgX, imgY); 
  //        if (!(`everyChannelIsEmpty` in px)) {
  //          const { r, g, b, alpha } = px;
  //          scopeLenses[lens].style.backgroundColor = `rgb(${r} ${g} ${b} / ${alpha})`;
  //        }
  //      } else {
  //        scopeLenses[lens].style.backgroundColor = `initial`;
  //      }

  //      lens++;
  //    }
  //  }

  //  // sample path

  //  if (!isUserSamplingPath) return;

  //  const pointerEvents = e.getCoalescedEvents();

  //  for (const pointerEvent of pointerEvents) {
  //    const px = getCanvasXYOnlyInImg(pointerEvent);

  //    if (`pointerIsOutsideOfImage` in px) continue;

  //    if (lastSampledX === null || lastSampledY === null) {
  //      samplePixel(x, y);
  //      lastSampledX = x;
  //      lastSampledY = y;
  //      accLength = 0;
  //      continue;
  //    }

  //    const f = Number(samplingFrequencyInput.value);
  //    if (f >= 2) {
  //      let x1 = lastSampledX;
  //      let y1 = lastSampledY;
  //      const x2 = x;
  //      const y2 = y;

  //      let lineLength = Math.hypot(x2 - x1, y2 - y1);
  //      if (lineLength === 0) continue;

  //      accLength += lineLength;

  //      while (accLength >= f) {
  //        const needed = f - (accLength - lineLength);
  //        const interpStep = Math.min(Math.max(needed / lineLength, 0), 1);

  //        const interpX = Math.round(x1 + interpStep * (x2 - x1));
  //        const interpY = Math.round(y1 + interpStep * (y2 - y1));

  //        samplePixel(x, y);

  //        accLength -= f;
  //        lineLength = lineLength - needed;
  //        x1 = interpX;
  //        y1 = interpY;

  //        if (lineLength <= 0) break;
  //      }

  //      lastSampledX = x;
  //      lastSampledY = y;
  //    } else {
  //      function getPXsFromLine(x: number, y: number, x1: number, y1: number) {
  //        const pxs = [];
  //        const dx = Math.abs(x1 - x);
  //        const dy = Math.abs(y1 - y);
  //        const sx = x < x1 ? 1 : -1;
  //        const sy = y < y1 ? 1 : -1;
  //        let err = dx - dy;

  //        while (true) {
  //          pxs.push({ x, y });

  //          if (x === x1 && y === y1) break;

  //          const e2 = 2 * err;
  //          if (e2 > -dy) {
  //            err -= dy;
  //            x += sx;
  //          }
  //          if (e2 < dx) {
  //            err += dx;
  //            y += sy;
  //          }
  //        }

  //        return pxs;
  //      }

  //      const pxs = getPXsFromLine(lastSampledX, lastSampledY, x, y);
  //      for (let i = 1; i < pxs.length; i++) {
  //        const { x, y } = pxs[i];
  //        samplePixel(x, y);
  //      }

  //      lastSampledX = x;
  //      lastSampledY = y;
  //    }
  //  }
  //}

  //let cursorTimeout: NodeJS.Timeout;
  //function handleWheel(e: React.WheelEvent) {
  //  e.preventDefault();

  //  const { x, y } = getCanvasXY(e);

  //  const factor = Math.pow(1.05, -e.deltaY * 0.01);

  //  tx.current = x - (x - tx.current) * factor;
  //  ty.current = y - (y - ty.current) * factor;

  //  scale.current *= factor;

  //  draw(renderedImage);

  //  canvas.current.style.cursor = `nesw-resize`;
  //  clearTimeout(cursorTimeout);
  //  cursorTimeout = setTimeout(() => {
  //    canvas.current.style.cursor = `pointer`
  //  },
  //  200);
  //}
  
  //function handlePointerUp(e: React.PointerEvent) {
  //  if (e.button === 0) {
  //    closeSamplingPath(e);

  //    canvas.current.style.cursor = `pointer`;
  //  } else if (e.button === 2) {
  //    isUserPanning = false;

  //    canvas.current.style.cursor = `pointer`;
  //  }
  //}

  //function handleLostPointerCapture(e: React.PointerEvent) {
  //  isUserPanning = false;
  //  closeSamplingPath(e);
  //}

  //  const str = stringifySampledColors();
  //  writeClipboardText(str);
  //}

  //  const resizeCanvas = new ResizeObserver(() => {
  //  if (!(canvas.current && canvasContainer.current && ctx.current)) {
  //    return;
  //  }

  //  const canvasContainerRect = canvasContainer.current.getBoundingClientRect();
  //  canvas.current.width = canvasContainerRect.width;
  //  canvas.current.height = canvasContainerRect.height;

  //  ctx.current.imageSmoothingEnabled = false;

  //  if (renderedImage !== null) {
  //    render(renderedImage);
  //  }
  //});

  // ref={canvasContainer}