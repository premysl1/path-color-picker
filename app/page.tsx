'use client';

import {useRef, useState} from 'react';
import ImageInput from './components/navigation/ImageInput';
import Controls from './components/navigation/Controls';
import Intro from './components/navigation/Intro';
import Viewports from './components/Viewports';

export default function Page() {
  const selectFormat = useRef<HTMLSelectElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [frequency, setFrequency] = useState(50);

  function handleFrequencyChange(value: string) {
    if (value === '') {
      setFrequency(50);
      return;
    }

    const number = Number(value);

    if (number >= 1) {
      setFrequency(Math.floor(number));
    }
  }

  return (
    <main id="Page" className="fade">
      <nav>
        <menu>
          <li>
            <ImageInput canvas={canvas} setUserImage={setUserImage}/>
          </li>
          <li>
            <Controls canvas={canvas}
            onFrequencyChange={handleFrequencyChange}
            selectFormat={selectFormat}/>
          </li>
          <li>
            <header>
              <Intro/>
            </header>  
          </li>
        </menu>
      </nav>
      <Viewports canvas={canvas}
      frequency={frequency}
      selectFormat={selectFormat}
      userImage={userImage}/>
    </main>
  );
}
