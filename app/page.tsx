'use client';

import {useRef, useState} from 'react';
import ImageInput from './components/navigation/ImageInput';
import Controls from './components/navigation/Controls';
import Intro from './components/navigation/Intro';
import Viewports from './components/Viewports';

export default function Page() {
  const frequencyInput = useRef<HTMLInputElement>(null);
  const selectFormat = useRef<HTMLSelectElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);

  return (
    <main id="Page" className="fade">
      <nav>
        <menu>
          <li>
            <ImageInput setUserImage={setUserImage}/>
          </li>
          <li>
            <Controls canvas={canvas}
            frequencyInput={frequencyInput}
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
      frequencyInput={frequencyInput}
      selectFormat={selectFormat}
      userImage={userImage}/>
    </main>
  );
}
