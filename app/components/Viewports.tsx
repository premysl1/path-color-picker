'use client';

import { useEffect } from 'react';
import {useRef} from 'react';
import {handleXySplitterDown, handleXySplittersMove} from '../scripts/handleSplitter';
import type {dragStart, panelsLengths} from '../scripts/handleSplitter';
import handleGlowEffect from '../scripts/handleGlowEffect';
import Image from 'next/image';
import copy from '../../public/icons/copy.svg';
import downloadText from '../../public/icons/txt.svg';

export default function Viewports() {
  const Viewports = useRef<HTMLDivElement>(null);
  const imageViewport = useRef<HTMLDivElement>(null);
  const ViewportsSplitter = useRef<HTMLDivElement>(null);
  const utilitiesViewports = useRef<HTMLDivElement>(null);
  const dragStart = useRef<dragStart>(null);
  const ViewportsLengths = useRef<panelsLengths>({left: null, topRight: null});
  const scope = useRef<HTMLDivElement>(null);
  const utilitiesViewportsSplitter = useRef<HTMLDivElement>(null);
  const clipboard = useRef<HTMLDivElement>(null);

  const imageViewer = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    //const applyHeight = new ResizeObserver(() => {
    //  const navigation = document.getElementById(`navigation`);
    //  if (!(navigation
    //  && Viewports.current)) {
    //    return;
    //  }

    //  const ViewportsMargin = Number(window
    //    .getComputedStyle(Viewports.current)
    //    .margin
    //    .replace(`px`, ``));

    //  Viewports.current.style.height = String(
    //      innerHeight
    //    - navigation.offsetHeight
    //    - ViewportsMargin * 2)
    //    + `px`;
    //});

    const viewportsResize = new ResizeObserver(() => {
      if (!(Viewports.current
      && ViewportsSplitter.current)) {
        return;
      }

      ViewportsLengths.current.left = Viewports.current.clientWidth
        - ViewportsSplitter.current.offsetWidth;
    });

    const utilitiesViewportsResize = new ResizeObserver(() => {
      if (!(utilitiesViewports.current
      && utilitiesViewportsSplitter.current)) {
        return;
      }

      ViewportsLengths.current.topRight = utilitiesViewports.current.clientHeight
        - utilitiesViewportsSplitter.current.offsetHeight;
    });
 
    //applyHeight.observe(document.body);

    if (Viewports.current) {
      viewportsResize.observe(Viewports.current);
    }
    if (utilitiesViewports.current) {
      utilitiesViewportsResize.observe(utilitiesViewports.current);
    }

    return () => {
      //applyHeight.disconnect();
      viewportsResize.disconnect();
      utilitiesViewportsResize.disconnect();
    };
  }, []);

  return (
    <div ref={Viewports}
    onContextMenu={event => event.preventDefault()}
    id="Viewports">
      <div ref={imageViewport} onMouseMove={handleGlowEffect}>
        <canvas ref={imageViewer} id="image-viewer"></canvas>
      </div>
      <div ref={ViewportsSplitter}
      onPointerDown={event => handleXySplitterDown(
      dragStart,
      imageViewport,
      ViewportsSplitter,
      scope,
      event)}
      onPointerMove={event => handleXySplittersMove(
      dragStart,
      ViewportsLengths.current,
      ViewportsSplitter,
      imageViewport,
      utilitiesViewports,
      scope,
      clipboard,
      event)}
      className="splitter vertical"></div>
      <div ref={utilitiesViewports}>
        <div ref={scope}
        onMouseMove={handleGlowEffect}
        id="scope"
        className="glow-effect -blue">
          {Array.from({ length: 81 }, (_, i) => <div key={i}></div>)}
        </div>
        <div ref={utilitiesViewportsSplitter}
        onPointerDown={event => handleXySplitterDown(
        dragStart,
        imageViewport,
        utilitiesViewportsSplitter,
        scope,
        event)}
        onPointerMove={event => handleXySplittersMove(
        dragStart,
        ViewportsLengths.current,
        utilitiesViewportsSplitter,
        imageViewport,
        utilitiesViewports,
        scope,
        clipboard,
        event)}
        className="splitter horizontal"></div>
        <div ref={clipboard} id="clipboard">
          <div>
            <p title="No. of sampled colors.">0</p>
            <div title="Convert color format.">
              <label htmlFor="convert-color-format">T: </label>
              <select id="convert-color-format">
                <option value="RGB">RGB</option>
                <option value="sRGB">sRGB</option>
                <option value="HEX">HEX</option>
                <option value="OKLCH">OKLCH</option>
                <option value="OKLAB">OKLAB</option>
                <option value="HSL">HSL</option>
                <option value="XYZ D65">XYZ D65</option>
                <option value="XYZ D50">XYZ D50</option>
                <option value="HWB">HWB</option>
                <option value="LCH">LCH</option>
                <option value="LAB">LAB</option>
              </select>
            </div>
            <div>
              <button>
                <Image src={copy} alt="Copy clipboard content." title="Copy clipboard content." role="img"/>
              </button>
              <button>
                <Image src={downloadText} alt="Download as text file." title="Download as text file." role="img"/>
              </button>
            </div>
          </div>
          <ul id="clipboard-content"></ul>
        </div>
      </div>
    </div>
  );
}
