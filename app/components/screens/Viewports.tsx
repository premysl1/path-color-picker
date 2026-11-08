export default function Viewports() {
  return (
    <div id="Viewports">
      <div>
        <canvas id="image-viewer"></canvas>
      </div>
      <div id="scope">
        {Array.from({ length: 81 }, (_, i) => <div key={i}></div>)}
      </div>
      <div id="recent-colors">
        {Array.from({ length: 22 }, (_, i) => <div key={i}></div>)}
      </div>
    </div>
  );
}