
import Copy from './Copy';
import Counter from './Counter';
import Clipboard from './Clipboard';
import Download from './Download';

export default function SamplesPane() {
  return (
    <section id="Samples-pane">
      {/*<h2>Samples</h2>*/}
      <div>
        <div>
          <Counter/>
          <Copy/>
        </div>
        <Clipboard/>
      </div>
      <div>
        <p>As a <code>.txt</code> file:</p>
        <Download/>
      </div>
    </section>
  );
}

