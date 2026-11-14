
import ImageInput from './components/navigation/ImageInput';
import Controls from './components/navigation/Controls';
import Intro from './components/navigation/Intro';
import Viewports from './components/Viewports';

export default function Page() {
  return (
    <main id="Page" className="blur">
      <nav id="navigation">
        <menu>
          <li>
            <ImageInput/>
          </li>
          <li>
            <Controls/>
          </li>
          <li>
            <header>
              <Intro/>
            </header>  
          </li>
        </menu>
      </nav>
      <Viewports/>
    </main>
  );
}
