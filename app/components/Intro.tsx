export default function Intro() {
  return (
    <header id="Intro">
      <hgroup>
        <h1>Path color picker</h1>
        <p>Extract colors by drawing any path across an image with your cursor.</p>
      </hgroup>
      <section>
        <h2>Supports</h2>
        <ul>
          <li><span className="bold">+</span> RGB, sRGB, HEX, OKLCH, OKLAB, HSL, XYZ D65, XYZ D50, LCH, LAB</li>
          <li><span style={{color: `cyan`}} className="bold">+</span> path sampling</li>
          <li><span style={{color: `magenta`}} className="bold">+</span> panning and zooming</li>
          <li><span style={{color: `yellow`}} className="bold">+</span> adjustable sampling frequency</li>
        </ul>
        <i><span style={{color: `black`}} className="bold">?</span> Start sampling using the left-click button (hold and move your mouse to sample a path), or right-click to pan.</i>
      </section>
    </header>
  );
}


