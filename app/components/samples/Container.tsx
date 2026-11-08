'use client';

import Counter from './Counter';
import Copy from './Copy';
import Clipboard from './Clipboard';
import Download from './Download';

import handleMoveGlowEffect from '../../scripts/handleMoveGlowEffect';

export default function Container() {
  return (
    <section id="samples-Container">
      <h2>Samples:</h2>
      <div onMouseMove={handleMoveGlowEffect} className="glowEffect">
        <div>
          <Counter/>
          <Copy/>
        </div>
        <Clipboard/>
      </div>
      <div>
        <p>As a <code>.txt</code> file:</p>
        <Download/>
      </div>
    </section>
  );
}

