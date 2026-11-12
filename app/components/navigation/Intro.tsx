'use client';

import React, { useRef, useEffect } from 'react';
import handleGlowEffect from '../../scripts/handleGlowEffect'
import Image from 'next/image';
import minimizeIcon from '../../../public/remove_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg';
import questionMarkIcon from '../../../public/question_mark_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';

export default function Intro() {
  const dialog = useRef<HTMLDialogElement>(null);
  const minimizeButton = useRef(null);
  const maximizeButton = useRef(null);
  let duration = 250;

  async function handleMinimize() {
    if (!maximizeButton.current) return;

    const animation = dialog.current?.animate(
      [
        {
          transform: `translate(0, 0) scale(1)`,
          opacity: 1
        },
        getMinimizedDialog(dialog.current, maximizeButton.current)
      ],
      {
        duration,
        easing: `ease-in`,
        fill: `forwards`
      }
    );

    await animation?.finished;

    animation?.cancel();
    dialog.current?.close();
  }

  function handleMaximize() {
    if (!maximizeButton.current) return;
    document.getElementById(`Page`)?.classList.add(`blur`);

    dialog.current?.showModal();

    dialog.current?.animate(
      [
        getMinimizedDialog(dialog.current, maximizeButton.current),
        {
          transform: `translate(0, 0) scale(1)`,
          opacity: 1
        }
      ],
      {
        duration,
        easing: `ease-out`
      }
    );
  }

  let isClosedBy = useRef(false).current;

  useEffect(() => {
    if (window.matchMedia(
      `(prefers-reduced-motion: reduce)`
    ).matches) {
      duration = 0;
    }

    handleMaximize();

    isClosedBy = `closedBy` in HTMLDialogElement.prototype
               && typeof HTMLDialogElement !== `undefined`;

    document.addEventListener(`keydown`, handleKeyMinize);

    function handleKeyMinize(event: KeyboardEvent) {
      if (!dialog.current?.open) {
        return;
      }

      function minize() {
        event.preventDefault(); 
        handleMinimize();
      }

      if (event.key === `Escape`) {
        minize();
      } else if (document.activeElement === minimizeButton.current
      && (event.key === `Enter` || event.key === ` `)) {
        minize();
      }
    }

    return () => document.removeEventListener(`keydown`, handleKeyMinize);
  }, []);

  // Fallback for browsers without closedby support
  // source: https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/light-dismiss-a-dialog

  function handleClosedby(event: React.MouseEvent<HTMLDialogElement>) {
    // 1. When clicking the backdrop, the event target is the dialog element itself.
    // Ignore clicks where the target is a child element inside the dialog.
    if (event.currentTarget !== dialog.current) return;

    // 2. Check if the click coordinates fall within the dialog's content box.
    // This distinguishes between a click on the backdrop vs a click on the dialog's background/padding.
    const rect = dialog.current.getBoundingClientRect();
    const isDialogContent = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    );

    if (isDialogContent) return;

    // 3. Since the click was outside the content area (on the backdrop), manually close the dialog.
    dialog.current.close();
  }

  return (
    <>
      <dialog
      ref={dialog}
      onClose={() => document.getElementById('Page')?.classList.remove('blur')}
      onClick={isClosedBy ? undefined : handleClosedby}
      closedby="any">
        <hgroup onMouseMove={handleGlowEffect} className="glowEffect">
          <h1>Path color picker</h1>
          <p><span>Extract colors by drawing any path across an image with your cursor.</span></p>
        </hgroup>
        <section onMouseMove={handleGlowEffect} className="glowEffect">
          <h2>Supports:</h2>
          <ul>
            <li><span>+</span> RGB, sRGB, HEX, OKLCH, OKLAB, HSL, XYZ D65, XYZ D50, LCH, LAB</li>
            <li><span style={{color: `cyan`}}>+</span> path sampling</li>
            <li><span style={{color: `magenta`}}>+</span> panning and zooming</li>
            <li><span style={{color: `yellow`}}>+</span> adjustable sampling frequency</li>
          </ul>
          <i><span style={{color: `black`}}>?</span> Start sampling using the left-click button (hold and move your mouse to sample a path), or right-click to pan.</i>
        </section>
        <button ref={minimizeButton} onClick={handleMinimize} id="minimizeButton">
          <Image src={minimizeIcon} alt="Minimize dialog." role="img"/>
        </button>
      </dialog>
      <button ref={maximizeButton} onClick={handleMaximize} id="maximizeButton">
        <Image src={questionMarkIcon} alt="Maximize dialog." role="img"/>
      </button>
    </>
  );
}

function getMinimizedDialog(dialog: HTMLDialogElement, maximizeButton: HTMLButtonElement) {
  const dialogRect = dialog.getBoundingClientRect();
  const buttonRect = maximizeButton.getBoundingClientRect();

  const dialogCenterX = dialogRect.left + dialogRect.width / 2;
  const dialogCenterY = dialogRect.top + dialogRect.height / 2;
  const buttonCenterX = buttonRect.left + buttonRect.width / 2;
  const buttonCenterY = buttonRect.top + buttonRect.height / 2;

  const dx = buttonCenterX - dialogCenterX;
  const dy = buttonCenterY - dialogCenterY;
  const scale = Math.min(
    buttonRect.width / dialogRect.width,
    buttonRect.height / dialogRect.height
  );

  return {
    transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
    opacity: 0
  };
}