'use client';

import {useRef} from 'react';
import ImageInput from './components/navigation/ImageInput';
import Controls from './components/navigation/Controls';
import Intro from './components/navigation/Intro';
import Viewports from './components/Viewports';

export default function Page() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frequencyInput = useRef<HTMLInputElement>(null);
  const selectFormat = useRef<HTMLSelectElement>(null);

  return (
    <main id="Page" className="fade">
      <nav>
        <menu>
          <li>
            <ImageInput/>
          </li>
          <li>
            <Controls canvas={canvas} frequencyInput={frequencyInput}
            selectFormat={selectFormat}/>
          </li>
          <li>
            <header>
              <Intro/>
            </header>  
          </li>
        </menu>
      </nav>
      <Viewports canvas={canvas} frequencyInput={frequencyInput}
      selectFormat={selectFormat}/>
    </main>
  );
}
