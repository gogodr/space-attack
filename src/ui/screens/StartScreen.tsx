export function StartScreen({ start }: { start: () => void }) {
  return (
    <div className="screen-overlay start-screen">
      <div className="title-orbit" aria-hidden="true">
        ✦
      </div>
      <span className="eyebrow">An interstellar arcade mission</span>
      <h1>
        SPACE
        <br />
        <span>ATTACK</span>
      </h1>
      <p className="start-description">
        Hold the line.
        <br />
        Make every laser count.
      </p>
      <button className="primary-button" onClick={start}>
        Launch mission <span>→</span>
      </button>
      <p className="fine-print">3 lives · 15 sectors · one high score</p>
      <div className="start-controls">
        <span>
          <kbd>A</kbd> <kbd>D</kbd> MOVE
        </span>
        <span>
          <kbd>SPACE</kbd> FIRE
        </span>
      </div>
    </div>
  );
}
