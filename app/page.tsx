export default function Home() {
  return (
    <main className="picker-shell">
      <iframe
        className="picker-frame"
        src="/picker/index.html"
        title="Path color picker"
      />
    </main>
  );
}
