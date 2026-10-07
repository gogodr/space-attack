import { ATLAS_URL } from '../game/rendering/sprites/atlas';

export function ShipIcon() {
  return (
    <span
      className="ship-icon"
      aria-hidden="true"
      style={{ backgroundImage: `url(${ATLAS_URL})` }}
    />
  );
}
