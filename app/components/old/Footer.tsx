import LoadExampleImage from './LoadExampleImageButton';

export default function Footer() {
  return (
    <footer id="Footer">
      <div>
        <details>
          <summary>
            <span>Do you send or have access to my images?</span>
          </summary>
          <p>No. This website processes uploaded images entirely in your browser. No network requests are made after the page loads.</p>
        </details>
        <a href="https://github.com/premysl1/Path-color-picker">Source code</a>
        <details>
          <summary><span>Attributions</span></summary>
          <p>"<a rel="noopener noreferrer" href="https://www.flickr.com/photos/8047705@N02/5347002633">Reflections (11/365)</a>" by <a rel="noopener noreferrer" href="https://www.flickr.com/photos/8047705@N02">LifeSupercharger</a> is licensed under <a rel="noopener noreferrer" href="https://creativecommons.org/licenses/by/2.0/?ref=openverse">CC BY 2.0 <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" style={{height: `1em`, marginRight: `0.125em`, display: `inline`}}/><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" style={{height: `1em`, marginRight: `0.125em`, display: `inline`}}/></a>.</p>
        </details>
      </div>
      <LoadExampleImage/>
    </footer>
  );
}

