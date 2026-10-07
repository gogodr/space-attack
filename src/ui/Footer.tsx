export function Footer({
  active,
  pause,
}: {
  active: boolean;
  pause: () => void;
}) {
  return (
    <footer className="app-footer">
      <span>RETRO SPIRIT. NEW FRONTIER.</span>
      <span>DESKTOP KEYBOARD PLAY</span>
      {active && (
        <button className="text-button" onClick={pause}>
          Pause [Esc]
        </button>
      )}
    </footer>
  );
}
