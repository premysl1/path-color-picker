'use client';

import { useState } from 'react';

import Viewports from './Viewports';
import DragAndDropContainer from './drag-and-drop/Container';

export default function ScreensContainer() {
  const [areViewportsInit, setAreViewportsInit] = useState(false);
  
  return (
    <div id="Screens-container">
      {areViewportsInit
      ? <Viewports/>
      : <DragAndDropContainer/>}
    </div>
  );
}