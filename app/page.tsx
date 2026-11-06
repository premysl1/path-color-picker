import Top from "./components/options/Top";
import Screen from "./components/Screen";
import Bottom from "./components/options/Bottom";
import Pane from "./components/samples-pane/Pane";

export default function Page() {
  return (
    <main id="Page">
      <section>
        <Top/>
        <Screen/>
        <Bottom/>
      </section>
      <Pane/>
    </main>
  );
}
