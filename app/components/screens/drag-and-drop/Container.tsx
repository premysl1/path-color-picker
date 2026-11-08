import DragAndDrop from './DragAndDrop';

import handleMoveGlowEffect from '../../../scripts/handleMoveGlowEffect';

export default function Container() {
  return (
    <div onMouseMove={handleMoveGlowEffect} id="Drag-and-drop" className="glowEffect">
      <div id="marching-ant-gradient"></div>
      <svg
      width="97.5%"
      height="97.5%"
      xmlns="http://www.w3.org/2000/svg"
      >
        <mask id="dash-mask">
          <rect
          className="marching-ants"
          x="4"
          y="4"
          width="calc(100% - 8px)"
          height="calc(100% - 8px)"
          strokeWidth="8"
          strokeDasharray="0 64 0"
          pathLength="3840"
          stroke="white"
          ></rect>
        </mask>
      </svg>
      <label htmlFor="drag-and-drop-input">Drop an image here, or click to pick one.</label>
      <DragAndDrop/>
    </div>
  );
}