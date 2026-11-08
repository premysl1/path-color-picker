import Top from "./components/menus/Top";
import Screen from "./components/screens/ScreensContainer";
import Bottom from "./components/menus/Bottom";
import Container from "./components/samples/Container";

export default function Page() {
  return (
    <main id="Page">
      <section>
        <Top/>
        <Screen/>
        <Bottom/>
      </section>
      <Container/>
    </main>
  );
}
