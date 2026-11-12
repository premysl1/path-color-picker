'use client';

import React, { useEffect } from 'react';
import {useRef} from 'react';

export default function Screen() {
  const Screen = useRef<HTMLDivElement>(null);
  const ScreenWidth = useRef<{ x: number; width: number } | null>(null);
  const viewports = useRef<HTMLDivElement>(null);
  const splitter = useRef<HTMLDivElement>(null);
  const clipboard = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const applyHeight = new ResizeObserver(() => {
      if (!(Screen.current
      && clipboard.current)) {
        return;
      }

      const navigation = document.getElementById(`navigation`);
      if (!navigation) {
        return;
      }
      
      const ScreenMargin = Number(window
        .getComputedStyle(Screen.current)
        .margin
        .replaceAll(/[^\d.]/g, ``));

      clipboard.current.style.height = String(
          innerHeight
        - navigation.getBoundingClientRect().height
        - ScreenMargin * 2)
        + `px`;

      const {x, width} = Screen.current.getBoundingClientRect();
      ScreenWidth.current = {x, width};
    });

    applyHeight.observe(document.body)

    return () => applyHeight.unobserve(document.body);
  }, []);

  function handlePointerDown(e: React.PointerEvent) {
    if (!splitter.current) {
      return;
    }

    splitter.current.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!(viewports.current
    && ScreenWidth.current
    && splitter.current?.hasPointerCapture(e.pointerId)
    && clipboard.current)) {
      return;
    }

    const {x, width} = ScreenWidth.current;
    const viewportsGrow = (e.clientX - x) / width;
    const clipboardGrow = 1 - viewportsGrow;

    viewports.current.style.flexGrow = String(viewportsGrow);
    clipboard.current.style.flexGrow = String(clipboardGrow);
  }

  return (
    <div ref={Screen} id="Screen">
      <div ref={viewports} id="viewports">
        <div>
          <canvas id="image-viewer"></canvas>
        </div>
        <div id="scope">
          {Array.from({ length: 81 }, (_, i) => <div key={i}></div>)}
        </div>
        <div id="recent-colors">
          {Array.from({ length: 22 }, (_, i) => <div key={i}></div>)}
        </div>
      </div>
      <div onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      ref={splitter}
      className="splitter"></div>
      <ul ref={clipboard} id="clipboard"></ul>
    </div>
  );
}