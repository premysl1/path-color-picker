export default function Screen() {
  return (
    <div id="sampling-screen">
      <div id="viewports">
        <div>
          <canvas id="image-viewer"></canvas>
        </div>
        <div id="scope">
          {Array.from({ length: 81 }, _ => <div></div>)}
        </div>
        <div id="recent-clrs">
          {Array.from({ length: 22 }, _ => <div></div>)}
        </div>
      </div>
      <div id="input-img-screen">
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
            rx="20"
            ry="20"
            stroke-width="8"
            stroke-dasharray="0 64 0"
            pathLength="3840"
            stroke="white"
            ></rect>
          </mask>
        </svg>
        <label htmlFor="drag-n-drop">Drop an image here, or click to pick one.</label>
        <input
        id="drag-n-drop"
        type="file"
        accept="image/*"
        />
      </div>
    </div>
  );
}