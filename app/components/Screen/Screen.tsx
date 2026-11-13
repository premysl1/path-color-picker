'use client';

import { useEffect } from 'react';
import {useRef} from 'react';
import {handleSplitterDown,
  handleSplitterMove,
  handleXySplitterDown,
  handleXySplittersMove} from '../../scripts/handleSplitter';
import type {containerInfo, dragStart, panelsLengths} from '../../scripts/handleSplitter';

export default function Screen() {
  const Screen = useRef<HTMLDivElement>(null);
  const ScreenInfo = useRef<containerInfo>(null);
  const viewports = useRef<HTMLDivElement>(null);
  const ScreenSplitter = useRef<HTMLDivElement>(null);
  const clipboard = useRef<HTMLUListElement>(null);
  const imageViewport = useRef<HTMLDivElement>(null);
  const viewportsSplitter = useRef<HTMLDivElement>(null);
  const utilitiesViewports = useRef<HTMLDivElement>(null);
  const dragStart = useRef<dragStart>(null);
  const scope = useRef<HTMLDivElement>(null);
  const utilitiesViewportsSplitter = useRef<HTMLDivElement>(null);
  const recentColors = useRef<HTMLDivElement>(null);
  const viewportsLengths = useRef<panelsLengths>({left: null, topRight: null});

  useEffect(() => {
    const applyHeight = new ResizeObserver(() => {
      const navigation = document.getElementById(`navigation`);
      if (!(navigation
      && Screen.current
      && viewports.current
      && clipboard.current)) {
        return;
      }

      const ScreenMargin = Number(window
        .getComputedStyle(Screen.current)
        .margin
        .replaceAll(/[^\d.]/g, ``));

      const cappedHeight = String(
          innerHeight
        - navigation.getBoundingClientRect().height
        - ScreenMargin * 2)
        + `px`;

      viewports.current.style.height = cappedHeight;
      clipboard.current.style.height = cappedHeight;
    });

    const screenResize = new ResizeObserver(() => {
      if (!(Screen.current && ScreenSplitter.current)) {
        return;
      }

      const {left} = Screen.current.getBoundingClientRect();
      ScreenInfo.current = {
        isVertical: true,
        offset: left,
        length: Screen.current.clientWidth - ScreenSplitter.current.offsetWidth,
      };
    });

    const viewportsResize = new ResizeObserver(() => {
      if (!(viewports.current
      && viewportsSplitter.current)) {
        return;
      }

      viewportsLengths.current.left = viewports.current.clientWidth
      - viewportsSplitter.current.offsetWidth;
    });

    const utilitiesViewportsResize = new ResizeObserver(() => {
      if (!(utilitiesViewports.current
      && utilitiesViewportsSplitter.current)) {
        return;
      }

      viewportsLengths.current.topRight = utilitiesViewports.current.clientHeight
      - utilitiesViewportsSplitter.current.offsetHeight;
    });
 
    applyHeight.observe(document.body);
    if (Screen.current) {
      screenResize.observe(Screen.current);
    }
    if (viewports.current) {
      viewportsResize.observe(viewports.current);
    }
    if (utilitiesViewports.current) {
      utilitiesViewportsResize.observe(utilitiesViewports.current);
    }

    return () => {
      applyHeight.disconnect();
      screenResize.disconnect();
      viewportsResize.disconnect();
      utilitiesViewportsResize.disconnect();
    };
  }, []);

  return (
    <div ref={Screen} id="Screen">
      <div ref={viewports} id="viewports">
        <div ref={imageViewport}>
          <canvas id="image-viewer"></canvas>
        </div>
        <div ref={viewportsSplitter}
        onPointerDown={event => handleXySplitterDown(
        dragStart,
        imageViewport,
        viewportsSplitter,
        scope,
        event)}
        onPointerMove={event => handleXySplittersMove(
        dragStart,
        viewportsLengths.current,
        viewportsSplitter,
        imageViewport,
        utilitiesViewports,
        scope,
        recentColors,
        event)}
        className="splitter vertical xy"></div>
        <div ref={utilitiesViewports}>
          <div ref={scope} id="scope">
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
          viewportsLengths.current,
          utilitiesViewportsSplitter,
          imageViewport,
          utilitiesViewports,
          scope,
          recentColors,
          event)}
          className="splitter horizontal xy"></div>
          <div ref={recentColors} id="recent-colors">
            {Array.from({ length: 22 }, (_, i) => <div key={i}></div>)}
          </div>
        </div>
      </div>
      <div ref={ScreenSplitter}
      onPointerDown={event => handleSplitterDown(
      ScreenSplitter,
      event)}
      onPointerMove={event => handleSplitterMove(
      viewports,
      ScreenSplitter,
      ScreenInfo,
      clipboard,
      event)}
      className="splitter vertical x"></div>
      <ul ref={clipboard} id="clipboard"></ul>
    </div>
  );
}
