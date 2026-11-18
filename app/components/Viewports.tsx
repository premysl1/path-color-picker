'use client';

import React, {useRef, useState, useEffect} from 'react';
import {handleXySplitterDown, handleXySplittersMove} from '../scripts/handleSplitter';
import type {dragStart, panelsLengths} from '../scripts/handleSplitter';
import handleGlowEffect from '../scripts/handleGlowEffect';
import Image from 'next/image';
import copyIcon from '../../public/icons/copy.svg';
import downloadTextIcon from '../../public/icons/txt.svg';
import deleteAllIcon from '../../public/icons/delete_forever_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';
import * as colorConversion from '../scripts/color-conversion'; 

type Props = {
	canvas: React.RefObject<HTMLCanvasElement | null>
  frequencyInput: React.RefObject<HTMLInputElement | null>
	selectFormat: React.RefObject<HTMLSelectElement | null>
}

type samples = {
  rgba: {
    r: number,
    g: number,
    b: number,
    alpha: number
  },
  format: string,
  id: string
}[]

const testSamplesColor = () => {
  return {
    rgba: {
      r: Math.random() * 255,
      g: Math.random() * 255,
      b: Math.random() * 255,
      alpha: Math.random()
    },
    format: `sRGB`,
    id: crypto.randomUUID()
  };
};

const testSamples = Array.from({ length: 32 }, testSamplesColor);

export default function Viewports({canvas, frequencyInput, selectFormat}: Props) {
  const Viewports = useRef<HTMLDivElement>(null);
  const canvasContainer = useRef<HTMLDivElement>(null);
  const ViewportsSplitter = useRef<HTMLDivElement>(null);
  const secondaryViewports = useRef<HTMLDivElement>(null);
  const dragStart = useRef<dragStart>(null);
  const ViewportsLengths = useRef<panelsLengths>({left: null, topRight: null});
  const scope = useRef<HTMLDivElement>(null);
  const horizontalViewportsSplitter = useRef<HTMLDivElement>(null);
  const clipboard = useRef<HTMLDivElement>(null);

  const [samples, setSamples] = useState<samples>(testSamples);
  let formatedTextSamples = useRef(``);

  function convert(samples: samples) {
    const converted = [];
    const textSamples = [];

    for (const {rgba, format, id} of samples) {
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

      converted.unshift({code, id});
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
      setSamples(prev => prev.filter(sample => sample.id !== id));
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
    const blob = new Blob([formatedTextSamples.current],
      { type: `text/plain` });
    const a = document.createElement(`a`);
    const url = URL.createObjectURL(blob);
    a.href = url;
    
    const usedFormats = new Set();
    samples.forEach(sample => usedFormats.add(sample.format));

    a.download = samples.length
               + `-sampled-colors-${[...usedFormats].join(`-`)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    const ViewportsResize = new ResizeObserver(() => {
      if (!(Viewports.current
      && ViewportsSplitter.current)) {
        return;
      }

      ViewportsLengths.current.left = Viewports.current.clientWidth
        - ViewportsSplitter.current.offsetWidth;
    });

    const secondaryViewportsResize = new ResizeObserver(() => {
      if (!(secondaryViewports.current
      && horizontalViewportsSplitter.current)) {
        return;
      }

      ViewportsLengths.current.topRight = secondaryViewports.current.clientHeight
        - horizontalViewportsSplitter.current.offsetHeight;
    });
    
    if (Viewports.current) {
      ViewportsResize.observe(Viewports.current);
    }
    if (secondaryViewports.current) {
      secondaryViewportsResize.observe(secondaryViewports.current);
    }

    return () => {
      ViewportsResize.disconnect();
      secondaryViewportsResize.disconnect();
      Object.values(toDelete.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <div ref={Viewports}
    onContextMenu={e => e.preventDefault()}
    id="Viewports">
      <div ref={canvasContainer} onMouseMove={handleGlowEffect}>
        <canvas ref={canvas}></canvas>
      </div>
      <div ref={ViewportsSplitter}
      onPointerDown={e => handleXySplitterDown(
      dragStart,
      canvasContainer,
      ViewportsSplitter,
      scope,
      e)}
      onPointerMove={e => handleXySplittersMove(
      dragStart,
      ViewportsLengths.current,
      ViewportsSplitter,
      canvasContainer,
      secondaryViewports,
      scope,
      clipboard,
      e)}
      className="splitter vertical"></div>
      <div ref={secondaryViewports}>
        <div ref={scope}
        onMouseMove={handleGlowEffect}
        id="scope"
        className="glow-effect blue">
          {Array.from({ length: 81 }, (_, i) => <div key={i}></div>)}
        </div>
        <div ref={horizontalViewportsSplitter}
        onPointerDown={e => handleXySplitterDown(
        dragStart,
        canvasContainer,
        horizontalViewportsSplitter,
        scope,
        e)}
        onPointerMove={e => handleXySplittersMove(
        dragStart,
        ViewportsLengths.current,
        horizontalViewportsSplitter,
        canvasContainer,
        secondaryViewports,
        scope,
        clipboard,
        e)}
        className="splitter horizontal"></div>
        <div ref={clipboard} id="clipboard">
          <div>
            <p title="No. of sampled colors.">{samples.length}</p>
            <div>
              <button onClick={samples.length ? copy : undefined}>
                <Image src={copyIcon} alt="Copy clipboard content." title="Copy clipboard content." role="img"/>
              </button>
              <button onClick={samples.length ? download : undefined}>
                <Image src={downloadTextIcon} alt="Download as text file." title="Download as text file." role="img"/>
              </button>
              <button onClick={() => setSamples([])}>
                <Image src={deleteAllIcon} alt="Delete all samples." title="Delete all samples." role="img"/>
              </button>
            </div>
          </div>
          <ul id="clipboard-content">
            {convert(samples).map(({code, id}) =>
              <li onClick={e => handleDelete(e, id)} key={id} id={id} tabIndex={1}>
                <div style={{background: code}}></div><code>{code}</code>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
