export function PauseScreen({
  start,
  home,
  resume,
}: {
  start: () => void;
  home: () => void;
  resume: () => void;
}) {
  return (
    <div className="screen-overlay compact-screen">
      <span className="eyebrow">Systems on standby</span>
      <h2>
        MISSION
        <br />
        PAUSED
      </h2>
      <p>Take a breath. The stars can wait.</p>
      <button className="primary-button" onClick={resume}>
        Resume mission <span>→</span>
      </button>
      <button className="text-button" onClick={start}>
        Restart run
      </button>
      <button className="text-button" onClick={home}>
        Return to start
      </button>
    </div>
  );
}
