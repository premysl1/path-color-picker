'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import copyIcon from '../../public/icons/copy.svg';
import deleteAllIcon from '../../public/icons/delete_forever_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';
import downloadTextIcon from '../../public/icons/txt.svg';
import * as colorConversion from '../scripts/color-conversion';
import type { dragStart, panelsLengths } from '../scripts/handleSplitter';
import {
  handleXySplitterDown,
  handleXySplittersMove,
} from '../scripts/handleSplitter';
import type { Pixel, Props, Samples } from '../scripts/types';

const LENS_IDS = Array.from({ length: 81 }, (_, index) => `lens-${index}`);

export default function Viewports({
  canvas,
  frequency,
  selectFormat,
  userImage,
}: Props) {
  const Viewports = useRef<HTMLDivElement>(null);
  const canvasContainer = useRef<HTMLDivElement>(null);
  const ViewportsSplitter = useRef<HTMLDivElement>(null);
  const secondaryViewports = useRef<HTMLDivElement>(null);
  const dragStart = useRef<dragStart>(null);
  const ViewportsLengths = useRef<panelsLengths>({
    left: null,
    topRight: null,
  });
  const scope = useRef<HTMLDivElement>(null);
  const horizontalViewportsSplitter = useRef<HTMLDivElement>(null);
  const clipboard = useRef<HTMLDivElement>(null);

  const ctx = useRef<CanvasRenderingContext2D>(null);
  const tx = useRef(0);
  const ty = useRef(0);
  const scale = useRef(1);
  const imageData = useRef<ImageData>(null);
  const samplingPath = useRef(false);
  const lastSampledPoint = useRef<{ x: number; y: number } | null>(null);
  const accumulatedPathLength = useRef(0);
  const userImageRef = useRef(userImage);
  userImageRef.current = userImage;
  const lenses = useRef<(HTMLDivElement | null)[]>([]);

  function render(image: HTMLImageElement | null) {
    if (!(canvas.current && ctx.current && image)) {
      return;
    }

    const offscreen = document.createElement(`canvas`);
    offscreen.width = image.naturalWidth;
    offscreen.height = image.naturalHeight;

    const offscreenCtx = offscreen.getContext(`2d`, { desynchronized: true });
    if (!offscreenCtx) return;
    offscreenCtx.drawImage(image, 0, 0);
    imageData.current = offscreenCtx.getImageData(
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    );

    scale.current = Math.min(
      canvas.current.width / image.naturalWidth,
      canvas.current.height / image.naturalHeight,
    );
    tx.current = Math.round(
      (canvas.current.width - image.naturalWidth * scale.current) / 2,
    );
    ty.current = Math.round(
      (canvas.current.height - image.naturalHeight * scale.current) / 2,
    );

    draw(ctx.current, canvas.current, image);
  }

  function draw(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
  ) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      image,
      tx.current,
      ty.current,
      image.naturalWidth * scale.current,
      image.naturalHeight * scale.current,
    );
  }

  function getCanvasXy(
    canvas: HTMLCanvasElement,
    e: Pick<React.PointerEvent, `clientX` | `clientY`>,
  ) {
    const canvasRect = canvas.getBoundingClientRect();

    return {
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top,
    };
  }

  function calculateImage(x: number, y: number) {
    return {
      imageX: Math.floor((x - tx.current) / scale.current),
      imageY: Math.floor((y - ty.current) / scale.current),
    };
  }

  function getPixelAt(imageData: ImageData, x: number, y: number): Pixel {
    const xy = (y * imageData.width + x) * 4;
    const color = [
      imageData.data[xy],
      imageData.data[xy + 1],
      imageData.data[xy + 2],
      imageData.data[xy + 3],
    ];

    return {
      r: color[0],
      g: color[1],
      b: color[2],
      alpha: color[3] / 255,
    };
  }

  function doesPixelExist(imageData: ImageData, x: number, y: number) {
    return x >= 0 && x < imageData.width && y >= 0 && y < imageData.height;
  }

  function samplePixel(x: number, y: number) {
    if (
      !(
        imageData.current &&
        selectFormat.current &&
        doesPixelExist(imageData.current, x, y)
      )
    ) {
      return;
    }

    const rgba = getPixelAt(imageData.current, x, y);

    if (rgba.alpha === 0) {
      return;
    }

    setSamples((previous) => [
      ...previous,
      {
        rgba,
        format: selectFormat.current.value,
        id: crypto.randomUUID(),
      },
    ]);
  }

  function sampleLine(
    from: {
      x: number;
      y: number;
    },
    to: {
      x: number;
      y: number;
    },
  ) {
    let x = from.x;
    let y = from.y;
    const dx = Math.abs(to.x - x);
    const dy = Math.abs(to.y - y);
    const sx = x < to.x ? 1 : -1;
    const sy = y < to.y ? 1 : -1;
    let error = dx - dy;

    while (x !== to.x || y !== to.y) {
      const twiceError = 2 * error;

      if (twiceError > -dy) {
        error -= dy;
        x += sx;
      }

      if (twiceError < dx) {
        error += dx;
        y += sy;
      }

      samplePixel(x, y);
    }
  }

  function samplePathPoint(point: { x: number; y: number }) {
    const previous = lastSampledPoint.current;

    if (!previous) {
      return;
    }

    if (frequency === 1) {
      sampleLine(previous, point);
      lastSampledPoint.current = point;
      return;
    }

    const dx = point.x - previous.x;
    const dy = point.y - previous.y;
    const segmentLength = Math.hypot(dx, dy);

    if (segmentLength === 0) {
      return;
    }

    let distanceToSample = frequency - accumulatedPathLength.current;

    while (distanceToSample <= segmentLength) {
      const step = distanceToSample / segmentLength;
      const sampled = {
        x: Math.round(previous.x + step * dx),
        y: Math.round(previous.y + step * dy),
      };

      samplePixel(sampled.x, sampled.y);
      distanceToSample += frequency;
    }

    accumulatedPathLength.current =
      (accumulatedPathLength.current + segmentLength) % frequency;
    lastSampledPoint.current = point;
  }

  const panningId = useRef<number>(null);

  function handlePointerDown(e: React.PointerEvent) {
    if (
      !(
        canvas.current &&
        userImage &&
        imageData.current &&
        selectFormat.current
      )
    ) {
      return;
    }

    if (e.button === 0) {
      canvas.current.style.cursor = `crosshair`;

      const { x, y } = getCanvasXy(canvas.current, e);
      const { imageX, imageY } = calculateImage(x, y);

      if (!doesPixelExist(imageData.current, imageX, imageY)) {
        return;
      }

      const pixel = getPixelAt(imageData.current, imageX, imageY);

      if (pixel.alpha === 0) {
        return;
      }

      samplingPath.current = true;
      lastSampledPoint.current = { x: imageX, y: imageY };
      accumulatedPathLength.current = 0;
      canvas.current.setPointerCapture(e.pointerId);
      setSamples((previous) => [
        ...previous,
        {
          rgba: pixel,
          format: selectFormat.current.value,
          id: crypto.randomUUID(),
        },
      ]);
    } else if (e.button === 2) {
      panningId.current = e.pointerId;
      canvas.current.setPointerCapture(panningId.current);
      canvas.current.style.cursor = `grabbing`;
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!(canvas.current && ctx.current && userImage)) {
      return;
    }

    if (
      typeof panningId.current === `number` &&
      e.currentTarget.hasPointerCapture(panningId.current)
    ) {
      tx.current += e.movementX;
      ty.current += e.movementY;

      draw(ctx.current, canvas.current, userImage);
    }

    if (samplingPath.current && imageData.current) {
      for (const pointerEvent of e.nativeEvent.getCoalescedEvents()) {
        const point = getCanvasXy(canvas.current, pointerEvent);
        const imagePoint = calculateImage(point.x, point.y);

        if (
          doesPixelExist(
            imageData.current,
            imagePoint.imageX,
            imagePoint.imageY,
          )
        ) {
          samplePathPoint({ x: imagePoint.imageX, y: imagePoint.imageY });
        }
      }
    }

    const { x, y } = getCanvasXy(canvas.current, e);
    const { imageX, imageY } = calculateImage(x, y);

    function paintScope(imageX: number, imageY: number) {
      if (
        !(imageData.current && lenses.current.every((lens) => lens !== null))
      ) {
        return;
      }

      let lens = 0;

      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const pxX = imageX + dx;
          const pxY = imageY + dy;

          if (doesPixelExist(imageData.current, pxX, pxY)) {
            const { r, g, b, alpha } = getPixelAt(imageData.current, pxX, pxY);

            lenses.current[lens].style.backgroundColor =
              `rgb(${r} ${g} ${b} / ${alpha})`;
          } else {
            lenses.current[lens].style.backgroundColor = `transparent`;
          }

          lens++;
        }
      }
    }

    paintScope(imageX, imageY);
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (!canvas.current) {
      return;
    }

    canvas.current.style.cursor = `default`;

    if (e.button === 0) {
      samplingPath.current = false;
      lastSampledPoint.current = null;
      accumulatedPathLength.current = 0;
    } else if (e.button === 2) {
      panningId.current = null;
    }
  }

  const cursorTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  function handleWheel(e: React.WheelEvent) {
    if (!(canvas.current && ctx.current && userImage)) {
      return;
    }

    const { x, y } = getCanvasXy(canvas.current, e);

    const factor = 1.05 ** (-e.deltaY * 0.01);

    scale.current *= factor;

    tx.current = x - (x - tx.current) * factor;
    ty.current = y - (y - ty.current) * factor;

    draw(ctx.current, canvas.current, userImage);

    if (cursorTimeout.current === null) {
      return;
    }

    canvas.current.style.cursor = `nesw-resize`;
    if (cursorTimeout.current !== undefined) {
      clearTimeout(cursorTimeout.current);
    }
    cursorTimeout.current = setTimeout(() => {
      if (canvas.current) {
        canvas.current.style.cursor = `default`;
      }
    }, 200);
  }

  const [samples, setSamples] = useState<Samples>([]);
  const formatedTextSamples = useRef(``);

  function convert(samples: Samples) {
    const converted = [];
    const textSamples = [];

    for (const { rgba, format, id } of samples) {
      let code = ``;

      switch (format) {
        case `RGB`:
          code = `rgb(${rgba.r} ${rgba.g} ${rgba.b}${rgba.alpha < 1 ? ` / ${rgba.alpha.toFixed(3)}` : ``})`;
          break;
        case `sRGB`:
          code = `color(srgb ${(rgba.r / 255).toFixed(3)} ${(rgba.g / 255).toFixed(3)} ${(rgba.b / 255).toFixed(3)}${rgba.alpha < 1 ? ` / ${rgba.alpha.toFixed(3)}` : ``})`;
          break;
        case `HEX`:
          code = colorConversion.rgbaToHEXAText(rgba);
          break;
        case `OKLCH`:
          code = colorConversion.toOkLChText(rgba);
          break;
        case `OKLAB`:
          code = colorConversion.toOkLabText(rgba);
          break;
        case `HSL`:
          code = colorConversion.toHSLAText(rgba);
          break;
        case `XYZ D50`:
          code = colorConversion.rgbaToXYZD50Text(rgba);
          break;
        case `XYZ D65`:
          code = colorConversion.rgbaToXYZD65Text(rgba);
          break;
        case `LAB`:
          code = colorConversion.rgbaToLabText(rgba);
          break;
        case `LCH`:
          code = colorConversion.toLCHText(rgba);
          break;
        case `HWB`:
          code = colorConversion.rgbaToHWBAText(rgba);
          break;
      }

      converted.unshift({ code, id });
      textSamples.push(code);
    }

    formatedTextSamples.current = textSamples.join(`\n`);
    return converted;
  }

  const toDelete = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function handleDelete(e: React.MouseEvent, id: string) {
    const timeout = toDelete.current[id];

    if (timeout !== undefined) {
      clearTimeout(timeout);
      delete toDelete.current[id];

      e.currentTarget.classList.remove(`toDelete`);
      return;
    }

    e.currentTarget.classList.add(`toDelete`);

    toDelete.current[id] = setTimeout(() => {
      setSamples((previous) => previous.filter((sample) => sample.id !== id));
      delete toDelete.current[id];
    }, 2000);
  }

  function copy() {
    async function writeClipboardText(text: string) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }

    writeClipboardText(formatedTextSamples.current);
  }

  function download() {
    const blob = new Blob([formatedTextSamples.current], {
      type: `text/plain`,
    });
    const a = document.createElement(`a`);
    const url = URL.createObjectURL(blob);
    a.href = url;

    const usedFormats = new Set();
    samples.forEach((sample) => {
      usedFormats.add(sample.format);
    });

    a.download = `${samples.length}-sampled-colors-${[...usedFormats].join(`-`)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: This effect installs observers once; callbacks read mutable refs.
  useEffect(() => {
    const ViewportsResize = new ResizeObserver(() => {
      if (!(Viewports.current && ViewportsSplitter.current)) {
        return;
      }

      ViewportsLengths.current.left =
        Viewports.current.clientWidth - ViewportsSplitter.current.offsetWidth;
    });

    const secondaryViewportsResize = new ResizeObserver(() => {
      if (
        !(secondaryViewports.current && horizontalViewportsSplitter.current)
      ) {
        return;
      }

      ViewportsLengths.current.topRight =
        secondaryViewports.current.clientHeight -
        horizontalViewportsSplitter.current.offsetHeight;
    });

    const _2DContext = canvas.current?.getContext(`2d`);

    if (_2DContext) {
      ctx.current = _2DContext;
    }

    const canvasResize = new ResizeObserver(() => {
      if (!(canvasContainer.current && canvas.current && ctx.current)) {
        return;
      }

      const canvasContainerRect =
        canvasContainer.current.getBoundingClientRect();
      canvas.current.width = canvasContainerRect.width;
      canvas.current.height = canvasContainerRect.height;

      ctx.current.imageSmoothingEnabled = false;

      if (userImageRef.current) {
        render(userImageRef.current);
      }
    });

    if (Viewports.current) {
      ViewportsResize.observe(Viewports.current);
    }
    if (secondaryViewports.current) {
      secondaryViewportsResize.observe(secondaryViewports.current);
    }
    if (canvasContainer.current) {
      canvasResize.observe(canvasContainer.current);
    }

    return () => {
      ViewportsResize.disconnect();
      secondaryViewportsResize.disconnect();
      canvasResize.disconnect();
      Object.values(toDelete.current).forEach(clearTimeout);
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: The render helper only reads stable refs and is paired with this image update.
  useEffect(() => {
    if (userImage) {
      render(userImage);
    }
  }, [userImage]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Suppresses the browser context menu over the application viewport.
    <section
      ref={Viewports}
      onContextMenu={(e) => e.preventDefault()}
      id="Viewports"
    >
      <div ref={canvasContainer}>
        <canvas
          onPointerDown={userImage ? handlePointerDown : undefined}
          onPointerMove={userImage ? handlePointerMove : undefined}
          onMouseUp={userImage ? handleMouseUp : undefined}
          onWheel={userImage ? handleWheel : undefined}
          ref={canvas}
        ></canvas>
      </div>
      <div
        ref={ViewportsSplitter}
        onPointerDown={(e) =>
          handleXySplitterDown(
            dragStart,
            canvasContainer,
            ViewportsSplitter,
            scope,
            e,
          )
        }
        onPointerMove={(e) =>
          handleXySplittersMove(
            dragStart,
            ViewportsLengths.current,
            ViewportsSplitter,
            canvasContainer,
            secondaryViewports,
            scope,
            clipboard,
            e,
          )
        }
        className="splitter vertical"
      ></div>
      <div ref={secondaryViewports}>
        <div ref={scope} id="scope" className="glow-effect blue">
          {LENS_IDS.map((id, i) => (
            <div
              ref={(div) => {
                lenses.current[i] = div;
              }}
              key={id}
            ></div>
          ))}
        </div>
        <div
          ref={horizontalViewportsSplitter}
          onPointerDown={(e) =>
            handleXySplitterDown(
              dragStart,
              canvasContainer,
              horizontalViewportsSplitter,
              scope,
              e,
            )
          }
          onPointerMove={(e) =>
            handleXySplittersMove(
              dragStart,
              ViewportsLengths.current,
              horizontalViewportsSplitter,
              canvasContainer,
              secondaryViewports,
              scope,
              clipboard,
              e,
            )
          }
          className="splitter horizontal"
        ></div>
        <div ref={clipboard} id="clipboard">
          <div>
            <p title="No. of sampled colors.">{samples.length}</p>
            <div>
              <button onClick={samples.length ? copy : undefined}>
                <Image
                  src={copyIcon}
                  alt="Copy clipboard content."
                  title="Copy clipboard content."
                  role="img"
                />
              </button>
              <button onClick={samples.length ? download : undefined}>
                <Image
                  src={downloadTextIcon}
                  alt="Download as text file."
                  title="Download as text file."
                  role="img"
                />
              </button>
              <button onClick={() => setSamples([])}>
                <Image
                  src={deleteAllIcon}
                  alt="Delete all samples."
                  title="Delete all samples."
                  role="img"
                />
              </button>
            </div>
          </div>
          <ul id="clipboard-content">
            {convert(samples).map(({ code, id }) => (
              <li key={id} id={id}>
                <button type="button" onClick={(e) => handleDelete(e, id)}>
                  <div style={{ background: code }}></div>
                  <code>{code}</code>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
