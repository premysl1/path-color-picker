'use client';

import handleMoveGlowEffect from '../scripts/handleMoveGlowEffect'

export default function Header() {
  return (
    <header id="Header">
      <hgroup onMouseMove={handleMoveGlowEffect} className="glowEffect">
        <h1>Path color picker</h1>
        <p>Extract colors by drawing any path across an image with your cursor.</p>
      </hgroup>
      <section onMouseMove={handleMoveGlowEffect} className="glowEffect">
        <h2>Supports</h2>
        <ul>
          <li><span>+</span> RGB, sRGB, HEX, OKLCH, OKLAB, HSL, XYZ D65, XYZ D50, LCH, LAB</li>
          <li><span style={{color: `cyan`}}>+</span> path sampling</li>
          <li><span style={{color: `magenta`}}>+</span> panning and zooming</li>
          <li><span style={{color: `yellow`}}>+</span> adjustable sampling frequency</li>
        </ul>
        <i><span style={{color: `black`}}>?</span> Start sampling using the left-click button (hold and move your mouse to sample a path), or right-click to pan.</i>
      </section>
    </header>
  );
}


