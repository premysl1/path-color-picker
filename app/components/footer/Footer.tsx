import LoadExampleImage from './LoadExampleImageButton';

export default function Footer() {
  return (
    <footer id="Footer">
      <div>
        <details>
          <summary>
            <span>Do you send or have access to my images?</span>
          </summary>
          <p>No. The code of this website,
            merely reconstructs user-inputted images into a user's browser.
            After this page loads, there are no network requests made.</p>
        </details>
        <a href="https://github.com/premysl1/Path-color-picker">Source code</a>
        <details>
          <summary><span>Attributions</span></summary>
          <p id="Attribution">"<a rel="noopener noreferrer" href="https://www.flickr.com/photos/8047705@N02/5347002633">Reflections (11/365)</a>" by <a rel="noopener noreferrer" href="https://www.flickr.com/photos/8047705@N02">LifeSupercharger</a> is licensed under <a rel="noopener noreferrer" href="https://creativecommons.org/licenses/by/2.0/?ref=openverse">CC BY 2.0 <img alt="" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" style={{height: `1em`, marginRight: `0.125em`, display: `inline`}}/><img alt="" src="https://mirrors.creativecommons.org/presskit/icons/by.svg" className="license-icon"/></a>.</p>
        </details>
      </div>
      <LoadExampleImage/>
    </footer>
  );
}

