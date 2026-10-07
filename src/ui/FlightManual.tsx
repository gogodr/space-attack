export function FlightManual() {
  return (
    <aside className="side-panel manual">
      <span className="eyebrow">Flight manual</span>
      <h2>
        One ship.
        <br />
        Fifteen sectors.
      </h2>
      <p>
        Break the formation. Intercept enemy fire. Keep the stars on your side.
      </p>
      <div className="manual-divider" />
      <div className="control-row">
        <div>
          <kbd>A</kbd>
          <kbd>D</kbd>
        </div>
        <span>Move your ship</span>
      </div>
      <div className="control-row">
        <div>
          <kbd>←</kbd>
          <kbd>→</kbd>
        </div>
        <span>Also moves</span>
      </div>
      <div className="control-row">
        <kbd className="wide-key">SPACE</kbd>
        <span>Fire · tap or hold</span>
      </div>
      <div className="control-row">
        <kbd className="wide-key">ESC</kbd>
        <span>Pause the mission</span>
      </div>
      <p className="manual-note">
        Tap fire is a little faster.
        <br />
        Opposing lasers cancel each other.
      </p>
      <div className="scoring-guide">
        <span>
          ENEMY DESTROYED <b>+100</b>
        </span>
        <span>
          LASER INTERCEPT <b>+50</b>
        </span>
        <span>
          ENEMY ESCAPES <b>−1 LIFE</b>
        </span>
      </div>
    </aside>
  );
}
