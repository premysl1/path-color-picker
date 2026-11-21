'use client';

import React from 'react';

type ControlsProps = {
  canvas: React.RefObject<HTMLCanvasElement | null>;
  selectFormat: React.RefObject<HTMLSelectElement | null>;
  onFrequencyChange: (value: string) => void;
};

export default function Controls(
  {
    canvas,
    onFrequencyChange,
    selectFormat,
  }: ControlsProps
) {
  function handleInputBackground(str: string, e: React.InputEvent<HTMLInputElement>) {
    canvas.current?.style.setProperty(
      str,
      e.currentTarget.value
    );
  }

  return (
    <menu id="Controls">
      <li>
        <label htmlFor="sampling-frequency">Frequency:</label>
        <input
          onChange={e => onFrequencyChange(e.currentTarget.value)}
          id="sampling-frequency"
          type="number"
          min="1"
          step="1"
          defaultValue="50"
        />
      </li>
      <li>
        <label htmlFor="select-format">Format:</label>
        <select ref={selectFormat} id="select-format">
          <option value="RGB">RGB</option>
          <option value="sRGB">sRGB</option>
          <option value="HEX">HEX</option>
          <option value="OKLCH">OKLCH</option>
          <option value="OKLAB">OKLAB</option>
          <option value="HSL">HSL</option>
          <option value="XYZ D65">XYZ D65</option>
          <option value="XYZ D50">XYZ D50</option>
          <option value="HWB">HWB</option>
          <option value="LCH">LCH</option>
          <option value="LAB">LAB</option>
        </select>
      </li>
      <li>
        <label htmlFor="canvas-background-color">Background:</label>
        <div>
          <input onInput={e => handleInputBackground(`--background`, e)}
          id="canvas-background-color"
          type="color"
          defaultValue="#0f003c"/>
          <input onInput={e => handleInputBackground(`--background-2`, e)}
          type="color"/>
        </div>
      </li>
    </menu>
  );
}
