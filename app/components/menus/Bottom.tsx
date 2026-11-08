export default function Bottom() {
  return (
    <menu>
      <li>
        <label htmlFor="sampling-frequency">Sampling frequency:</label>
        <input id="sampling-frequency" type="number" min="1" defaultValue="50"/>
      </li>
      <li>
        <label htmlFor="color-format">Format:</label>
        <select id="color-format">
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
        <label htmlFor="image-viewer-background-color">Backgrounds:</label>
        <div>
          <input id="image-viewer-background-color" type="color" defaultValue="#0f003c"/>
          <input type="color"/>
        </div>
      </li>
    </menu>
  );
}